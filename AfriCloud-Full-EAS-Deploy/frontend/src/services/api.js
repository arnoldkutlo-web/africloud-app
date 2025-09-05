
import axios from 'axios';
const instance = axios.create({ baseURL: process.env.VITE_API_URL || 'http://localhost:4000/api' });
let token = null;
export default {
  setToken(t){ token = t; instance.defaults.headers.common['Authorization'] = t ? `Bearer ${t}` : undefined; },
  async signup(data){ return (await instance.post('/auth/signup', data)).data; },
  async login(data){ return (await instance.post('/auth/login', data)).data; },
  async listFiles(){ return (await instance.get('/files')).data; },
  async uploadFile(fd){ return (await instance.post('/files/upload', fd, { headers: {'Content-Type':'multipart/form-data'} })).data; },
  async downloadUrl(id){ return (await instance.get(`/files/download/${id}`)).data; },
  async share(id, payload){ return (await instance.post(`/files/share/${id}`, payload)).data; }
};


// raw axios access for advanced endpoints (multipart, versions)
export const rawInstance = instance;
export defaultInstance = module.exports || {};
