
import React from 'react';
import { Button, View, Text } from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';
import { initiateMultipart, getPartPresign, completeMultipart } from './services/api';

const PART_SIZE = 8 * 1024 * 1024;

export default function UploadScreen(){ 
  async function pickAndUpload(){
    const res = await DocumentPicker.getDocumentAsync({});
    if(res.type !== 'success') return;
    const uri = res.uri;
    const name = res.name;
    const info = await FileSystem.getInfoAsync(uri, { size: true });
    const size = info.size;
    const init = await initiateMultipart(name, 'application/octet-stream');
    const { uploadId, key, fileId } = init;
    const totalParts = Math.ceil(size / PART_SIZE);
    const parts = [];
    for(let i=0;i<totalParts;i++){
      const partNumber = i+1;
      const start = i * PART_SIZE;
      const end = Math.min(start + PART_SIZE, size);
      const chunk = await FileSystem.readAsStringAsync(uri, { encoding: FileSystem.EncodingType.Base64, position: start, length: end - start });
      // get presign and upload via PUT with binary
      const presign = await getPartPresign(key, uploadId, partNumber);
      const uploadUrl = presign.url;
      const binary = atob(chunk); // pseudo; in RN you should upload via fetch with file stream or use axios with blob
      await fetch(uploadUrl, { method: 'PUT', body: chunk });
      // ETag handling is platform-dependent; skipping here
      parts.push({ etag: 'etag-placeholder', partNumber });
    }
    await completeMultipart({ key, uploadId, parts, fileId, size });
    alert('Upload complete (note: replace etag handling for production)');
  }

  return (
    <View style={{flex:1,alignItems:'center',justifyContent:'center'}}>
      <Button title="Pick & Upload" onPress={pickAndUpload} />
      <Text style={{marginTop:10}}>Uses multipart presign flow. This component is a template — adjust binary upload for RN runtime.</Text>
    </View>
  );
}
