
import axios from 'axios';
const API_URL = process.env.API_URL || 'http://localhost:4000/api';
export async function signup(data){ return (await axios.post(API_URL + '/auth/signup', data)).data; }
export async function login(data){ return (await axios.post(API_URL + '/auth/login', data)).data; }
export async function initiateMultipart(filename, mimeType){ return (await axios.post(API_URL + '/multipart/initiate', { filename, mimeType })).data; }
export async function getPartPresign(key, uploadId, partNumber){ return (await axios.get(API_URL + '/multipart/presign', { params: { key, uploadId, partNumber } })).data; }
export async function completeMultipart(payload){ return (await axios.post(API_URL + '/multipart/complete', payload)).data; }
