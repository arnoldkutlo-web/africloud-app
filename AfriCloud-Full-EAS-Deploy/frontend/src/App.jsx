
import React, {useState, useEffect} from 'react';
import axios from './services/api';
import Login from './components/Login';
import Dashboard from './components/Dashboard';

export default function App(){
  const [token, setToken] = useState(localStorage.getItem('africloud_token'));
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('africloud_user')));

  useEffect(()=> {
    axios.setToken(token);
  }, [token]);

  if(!token) return <Login onAuth={(t,u)=>{ setToken(t); setUser(u); localStorage.setItem('africloud_token', t); localStorage.setItem('africloud_user', JSON.stringify(u)); }} />;
  return <Dashboard onSignOut={()=>{ setToken(null); setUser(null); localStorage.removeItem('africloud_token'); localStorage.removeItem('africloud_user'); }} />;
}
