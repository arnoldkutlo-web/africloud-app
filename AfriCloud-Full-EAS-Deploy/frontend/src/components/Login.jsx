
import React, {useState} from 'react';
import api from '../services/api';

export default function Login({ onAuth }){
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignup, setIsSignup] = useState(false);
  async function submit(e){
    e.preventDefault();
    try{
      const res = isSignup ? await api.signup({email, password, name: email.split('@')[0]}) : await api.login({email, password});
      onAuth(res.token, res.user);
    }catch(err){
      alert('Auth failed');
    }
  }
  return (
    <div className="min-h-screen flex items-center justify-center">
      <form onSubmit={submit} className="bg-white p-6 rounded shadow w-full max-w-md">
        <h2 className="text-xl mb-4">AfriCloud</h2>
        <input value={email} onChange={e=>setEmail(e.target.value)} placeholder="Email" className="w-full p-2 border mb-2" />
        <input value={password} onChange={e=>setPassword(e.target.value)} placeholder="Password" type="password" className="w-full p-2 border mb-4" />
        <div className="flex gap-2">
          <button className="bg-blue-600 text-white px-4 py-2 rounded">{isSignup ? 'Sign up' : 'Log in'}</button>
          <button type="button" onClick={()=>setIsSignup(s=>!s)} className="px-4 py-2 border rounded">Toggle</button>
        </div>
      </form>
    </div>
  );
}
