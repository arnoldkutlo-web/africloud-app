
const chokidar = require('chokidar');
const axios = require('axios');
const fs = require('fs');
const path = require('path');

// Config: set API_URL and TOKEN via env when running electron app
const API_URL = process.env.API_URL || 'http://localhost:4000/api';
const TOKEN = process.env.API_TOKEN || null;
const PART_SIZE = 8 * 1024 * 1024; // 8 MB
const CONCURRENCY = 3;
const MAX_RETRIES = 3;
const resumeStoreFile = path.join(__dirname, 'electron_resume_state.json');

function loadResumeStore(){ try{ return JSON.parse(fs.readFileSync(resumeStoreFile)); }catch(e){ return {}; } }
function saveResumeStore(store){ fs.writeFileSync(resumeStoreFile, JSON.stringify(store, null, 2)); }

async function uploadFileMultipart(filePath){
  const fileName = path.basename(filePath);
  const stat = fs.statSync(filePath);
  const size = stat.size;
  const store = loadResumeStore();
  const key = `${filePath}_${size}`;
  let state = store[key];

  const axiosInstance = axios.create({ baseURL: API_URL, headers: TOKEN ? { Authorization: `Bearer ${TOKEN}` } : {} });

  if(!state){
    // initiate upload on server
    const init = await axiosInstance.post('/multipart/initiate', { filename: fileName, mimeType: 'application/octet-stream' });
    state = { uploadId: init.data.uploadId, key: init.data.key, fileId: init.data.fileId, parts: [], size };
    store[key] = state;
    saveResumeStore(store);
  }

  const totalParts = Math.ceil(size / PART_SIZE);
  const uploadedParts = state.parts || [];
  const partsResult = [...uploadedParts];

  // build tasks
  const tasks = [];
  for(let i=0;i<totalParts;i++){
    const partNumber = i+1;
    if(!uploadedParts.find(p=>p.partNumber===partNumber)){
      const start = i*PART_SIZE;
      const end = Math.min(start+PART_SIZE, size);
      tasks.push({ partNumber, start, end });
    }
  }

  async function uploadTask(task){
    let attempt = 0;
    while(attempt < MAX_RETRIES){
      attempt++;
      try{
        const presignResp = await axiosInstance.get('/multipart/presign', { params: { key: state.key, uploadId: state.uploadId, partNumber: task.partNumber } });
        const uploadUrl = presignResp.data.url;
        const stream = fs.createReadStream(filePath, { start: task.start, end: task.end - 1 });
        const resp = await axios.put(uploadUrl, stream, { headers: { 'Content-Length': task.end - task.start } , maxBodyLength: Infinity});
        const etag = resp.headers.etag || resp.headers.ETag;
        if(!etag) throw new Error('No ETag returned');
        partsResult.push({ etag, partNumber: task.partNumber });
        state.parts = partsResult;
        store[key] = state;
        saveResumeStore(store);
        return;
      }catch(err){
        if(attempt >= MAX_RETRIES) throw err;
        await new Promise(r=>setTimeout(r, 500 * attempt));
      }
    }
  }

  // concurrency runner
  const runners = [];
  while(tasks.length){
    while(runners.length < CONCURRENCY && tasks.length){
      const t = tasks.shift();
      const p = uploadTask(t).finally(()=> { runners.splice(runners.indexOf(p),1); });
      runners.push(p);
    }
    await Promise.race(runners);
  }
  await Promise.all(runners);

  // complete multipart
  await axiosInstance.post('/multipart/complete', { key: state.key, uploadId: state.uploadId, parts: partsResult, fileId: state.fileId, size });
  // remove resume state
  delete store[key];
  saveResumeStore(store);
  return true;
}

async function startSync(config){
  const c = JSON.parse(config);
  const dir = c.dir;
  const watcher = chokidar.watch(dir, { ignored: /(^|[\\/\\\\])\\../, persistent: true });
  watcher.on('add', async filePath => {
    try{
      console.log('New file', filePath);
      await uploadFileMultipart(filePath);
      console.log('Uploaded via multipart:', filePath);
    }catch(err){
      console.error('Sync upload error', err);
    }
  });
  return 'watching ' + dir;
}

module.exports = { startSync, uploadFileMultipart };
