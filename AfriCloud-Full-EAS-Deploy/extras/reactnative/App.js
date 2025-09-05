
import React from 'react';
import { View, Text, Button, Platform } from 'react-native';
import * as DocumentPicker from 'expo-document-picker';

export default function App(){
  async function pickAndUpload(){
    const res = await DocumentPicker.getDocumentAsync({});
    if(res.type === 'success'){
      const uri = res.uri;
      const name = res.name;
      const response = await fetch(uri);
      const blob = await response.blob();
      const form = new FormData();
      form.append('file', { uri, name, type: blob.type });
      // send to backend using fetch or axios
      alert('Picked ' + name + '. Implement upload with your backend.');
    }
  }
  return (
    <View style={{flex:1,alignItems:'center',justifyContent:'center'}}>
      <Text>AfriCloud Mobile (Expo)</Text>
      <Button title="Pick & Upload" onPress={pickAndUpload} />
    </View>
  );
}
