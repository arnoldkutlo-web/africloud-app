
import React, {useState, useRef} from 'react';
import axios from '../services/api';

const DEFAULT_PART_SIZE = 5 * 1024 * 1024; // 5MB
const MAX_CONCURRENCY = 3;
const MAX_RETRIES = 3;

function sleep(ms){ return new Promise(r=>setTimeout(r, ms)); }

export default function ResumableHardened({ parentId, onUploaded }){
  const [progress, setProgress] = useState(0);
  const uploadingRef = useRef(false);

  async function startUpload(e){
    const f = e.target.files[0];
    if(!f || uploadingRef.current) return;
    uploadingRef.current = true;
    try{
      // try to load resume state
      const resumeKey = `resume_${f.name}_${f.size}`;
      let state = JSON.parse(localStorage.getItem(resumeKey) || 'null');
      if(!state){
        const init = await axios.raw.post('/multipart/initiate', { filename: f.name, mimeType: f.type, parentId });
        state = { uploadId: init.data.uploadId, key: init.data.key, fileId: init.data.fileId, parts: [], size: f.size };
        localStorage.setItem(resumeKey, JSON.stringify(state));
      }
      const partSize = DEFAULT_PART_SIZE;
      const totalParts = Math.ceil(f.size / partSize);
      let uploadedParts = state.parts || [];
      // build queue of parts to upload
      const toUpload = [];
      for(let i=0;i<totalParts;i++){
        const partNumber = i+1;
        if(!uploadedParts.find(p=>p.partNumber===partNumber)){
          const start = i*partSize;
          const end = Math.min(start+partSize, f.size);
          toUpload.push({ partNumber, start, end });
        }
      }
      // concurrency worker
      let active = 0;
      let idx = 0;
      const partsResult = [...uploadedParts];

      async function uploadPartTask(task){
        let attempts = 0;
        while(attempts < MAX_RETRIES){
          attempts++;
          try{
            const blob = f.slice(task.start, task.end);
            const presign = await axios.raw.get('/multipart/presign', { params: { key: state.key, uploadId: state.uploadId, partNumber: task.partNumber }});
            const uploadUrl = presign.data.url;
            const resp = await fetch(uploadUrl, { method: 'PUT', body: blob });
            const etag = resp.headers.get('etag') || resp.headers.get('ETag');
            if(!etag) throw new Error('No ETag');
            partsResult.push({ etag, partNumber: task.partNumber });
            localStorage.setItem(resumeKey, JSON.stringify({ ...state, parts: partsResult }));
            setProgress(Math.round((partsResult.length/totalParts)*100));
            return;
          }catch(err){
            await sleep(500 * attempts);
            if(attempts>=MAX_RETRIES) throw err;
          }
        }
      }

      // run with concurrency
      const promises = [];
      for(const task of toUpload){
        const p = (async ()=>{
          // throttle concurrency
          while(active >= MAX_CONCURRENCY) await sleep(200);
          active++;
          try{ await uploadPartTask(task); } finally { active--; }
        })();
        promises.push(p);
      }
      await Promise.all(promises);
      // complete multipart
      await axios.raw.post('/multipart/complete', { key: state.key, uploadId: state.uploadId, parts: partsResult, fileId: state.fileId, size: f.size });
      localStorage.removeItem(resumeKey);
      setProgress(100);
      onUploaded && onUploaded();
    }catch(err){
      console.error('Upload failed', err);
      alert('Upload failed: ' + (err.message||err));
    }finally{
      uploadingRef.current = false;
    }
  }

  return (
    <div>
      <input type="file" onChange={startUpload} />
      {progress>0 && <div className="w-full bg-gray-200 mt-2"><div style={{width: progress + '%'}} className="bg-green-500 p-1 text-xs text-white">{progress}%</div></div>}
    </div>
  );
}
