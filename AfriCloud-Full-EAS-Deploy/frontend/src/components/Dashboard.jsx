
import React, {useEffect, useState} from 'react';
import api from '../services/api';

export default function Dashboard({ onSignOut }){
  const [files, setFiles] = useState([]);
  const [selected, setSelected] = useState(null);

  useEffect(()=> { load(); }, []);

  async function load(){ const data = await api.listFiles(); setFiles(data); }

  async function handleUpload(e){
    const f = e.target.files[0];
    if(!f) return;
    const fd = new FormData(); fd.append('file', f);
    const res = await api.uploadFile(fd);
    load();
  }

  async function download(id){
    const res = await api.downloadUrl(id);
    window.open(res.url, '_blank');
  }

  async function share(id){
    const res = await api.share(id, {});
    alert('Share link: ' + res.link);
  }

  return (
    <div className="min-h-screen p-6 bg-gray-50">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl">My files</h1>
        <div>
          <input type="file" onChange={handleUpload} />
          <button onClick={onSignOut} className="ml-2 px-3 py-1 border rounded">Sign out</button>
        </div>
      </div>
      <div className="grid grid-cols-3 gap-4">
        {files.map(f=>(
          <div key={f.id} className="bg-white p-3 rounded shadow">
            <div className="font-medium">{f.name}</div>
            <div className="text-xs text-gray-500">{f.size ? Math.round(f.size/1024) + ' KB' : 'Folder'}</div>
            <div className="mt-2 flex gap-2">
              <button onClick={()=>download(f.id)} className="px-2 py-1 border rounded text-sm">Download</button>
              <button onClick={()=>share(f.id)} className="px-2 py-1 border rounded text-sm">Share</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
