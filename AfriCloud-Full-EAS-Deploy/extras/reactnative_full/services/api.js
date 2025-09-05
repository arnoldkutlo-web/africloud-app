
import axios from 'axios';
let token = null;
const instance = axios.create({ baseURL: process.env.API_URL || 'http://localhost:4000/api' });
export default {
  setToken(t){ token = t; instance.defaults.headers.common['Authorization'] = t ? `Bearer ${t}` : undefined; },
  async signup(data){ return (await instance.post('/auth/signup', data)).data; },
  async login(data){ return (await instance.post('/auth/login', data)).data; },
  async initiateMultipart(filename, mimeType){ return (await instance.post('/multipart/initiate', { filename, mimeType })).data; },
  async getPartPresign(key, uploadId, partNumber){ return (await instance.get('/multipart/presign', { params: { key, uploadId, partNumber } })).data; },
  async completeMultipart(payload){ return (await instance.post('/multipart/complete', payload)).data; }
};
