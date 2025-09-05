
import React, {useState} from 'react';
import api from '../services/api';

export default function ResumableUpload({ parentId, onUploaded }){
  const [progress, setProgress] = useState(0);

  async function startUpload(e){
    const f = e.target.files[0];
    if(!f) return;
    // Initiate on server
    const init = await api.raw.post('/multipart/initiate', { filename: f.name, mimeType: f.type, parentId });
    const { uploadId, key, fileId } = init.data;
    const partSize = 5 * 1024 * 1024; // 5MB parts
    const parts = [];
    let partNumber = 1;
    for(let start=0; start < f.size; start += partSize){
      const blob = f.slice(start, Math.min(start + partSize, f.size));
      // get presigned URL for this part
      const presign = await api.raw.get('/multipart/presign', { params: { key, uploadId, partNumber }});
      const uploadUrl = presign.data.url;
      // upload part via PUT
      const resp = await fetch(uploadUrl, { method: 'PUT', body: blob });
      const etag = resp.headers.get('etag');
      parts.push({ etag, partNumber });
      setProgress(Math.min(100, Math.round((start + blob.size)/f.size*100)));
      partNumber++;
    }
    // Complete
    await api.raw.post('/multipart/complete', { key, uploadId, parts, fileId, size: f.size });
    setProgress(100);
    onUploaded && onUploaded();
  }

  return (
    <div>
      <input type="file" onChange={startUpload} />
      {progress>0 && <div className="w-full bg-gray-200 mt-2"><div style={{width: progress + '%'}} className="bg-green-500 p-1 text-xs text-white">{progress}%</div></div>}
    </div>
  );
}
