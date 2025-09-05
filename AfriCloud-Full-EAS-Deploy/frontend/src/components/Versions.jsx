
import React, {useEffect, useState} from 'react';
import api from '../services/api';

export default function Versions({ fileId }){
  const [versions, setVersions] = useState([]);
  useEffect(()=> { load(); }, [fileId]);
  async function load(){ const res = await api.raw.get('/versions/' + fileId); setVersions(res.data); }
  async function restore(id){ await api.raw.post('/versions/restore/' + id); alert('Restored'); load(); }
  return (
    <div>
      <h3 className="text-lg mb-2">Versions</h3>
      <ul>
        {versions.map(v=> <li key={v.id} className="mb-2 border p-2">
          <div>{new Date(v.createdAt).toLocaleString()} — {v.size ? Math.round(v.size/1024)+' KB' : ''}</div>
          <div className="mt-1"><button onClick={()=>restore(v.id)} className="px-2 py-1 border rounded">Restore</button></div>
        </li>)}
      </ul>
    </div>
  );
}
