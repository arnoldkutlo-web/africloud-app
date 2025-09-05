
import React, {useState} from 'react';
import { View, Text, Button, SafeAreaView, TextInput, Alert } from 'react-native';
import DocumentPicker from 'react-native-document-picker';
import RNFetchBlob from 'react-native-blob-util';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from './services/api';

const PART_SIZE = 8 * 1024 * 1024; // 8MB
const CONCURRENCY = 3;

export default function App(){
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [token, setToken] = useState(null);

  async function login(){
    try {
      const res = await api.login({ email, password });
      await AsyncStorage.setItem('africloud_token', res.token);
      api.setToken(res.token);
      setToken(res.token);
      Alert.alert('Logged in');
    } catch(e){
      Alert.alert('Login failed', e.message || JSON.stringify(e));
    }
  }

  async function pickAndUpload(){
    try {
      const res = await DocumentPicker.pickSingle({ type: [DocumentPicker.types.allFiles] });
      const uri = res.uri;
      const name = res.name;
      const stat = await RNFetchBlob.fs.stat(uri);
      const size = Number(stat.size);
      // Initiate multipart
      const init = await api.initiateMultipart(name, 'application/octet-stream');
      const { uploadId, key, fileId } = init;
      const totalParts = Math.ceil(size / PART_SIZE);
      const parts = [];
      // Upload parts sequentially with concurrency control (simple)
      for(let i=0;i<totalParts;i++){
        const partNumber = i+1;
        const start = i*PART_SIZE;
        const end = Math.min(start + PART_SIZE, size);
        const presign = await api.getPartPresign(key, uploadId, partNumber);
        const uploadUrl = presign.url;
        // read slice as base64 and upload using PUT
        const chunkPath = uri.replace('file://',''); // Android file path
        const stream = RNFetchBlob.fs.readStream(chunkPath, 'base64', end - start, start);
        // RNFetchBlob readStream usage: but simpler to use RNFetchBlob.fetch with fs.readFile? We'll read base64 then upload
        const base64 = await RNFetchBlob.fs.readFile(chunkPath, 'base64', start, end - start);
        // upload via PUT using RNFetchBlob.fetch
        const resp = await RNFetchBlob.fetch('PUT', uploadUrl, {
          'Content-Type': 'application/octet-stream',
          'Content-Length': (end - start).toString()
        }, RNFetchBlob.base64.decode(base64));
        const etag = resp.info().headers['etag'] || resp.info().headers['ETag'] || resp.info().respType;
        parts.push({ etag: etag || 'etag-'+partNumber, partNumber });
      }
      // Complete multipart
      await api.completeMultipart({ key, uploadId, parts, fileId, size });
      Alert.alert('Upload complete');
    } catch(err){
      if(DocumentPicker.isCancel && DocumentPicker.isCancel(err)) { return; }
      Alert.alert('Upload error', err.message || JSON.stringify(err));
    }
  }

  if(!token){
    return (
      <SafeAreaView style={{flex:1, padding:20}}>
        <Text style={{fontSize:20, fontWeight:'bold'}}>AfriCloud Mobile</Text>
        <TextInput placeholder="Email" value={email} onChangeText={setEmail} style={{borderWidth:1, marginTop:10, padding:8}} />
        <TextInput placeholder="Password" value={password} onChangeText={setPassword} secureTextEntry style={{borderWidth:1, marginTop:10, padding:8}} />
        <Button title="Login" onPress={login} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{flex:1, padding:20}}>
      <Text style={{fontSize:18}}>Welcome to AfriCloud Mobile</Text>
      <Button title="Pick & Upload File" onPress={pickAndUpload} />
    </SafeAreaView>
  );
}
