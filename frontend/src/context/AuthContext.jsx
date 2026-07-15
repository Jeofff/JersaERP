import React, { createContext, useContext, useState } from 'react';
import client from '../api/client';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const raw = localStorage.getItem('sahod_user');
    return raw ? JSON.parse(raw) : null;
  });
  const [error, setError] = useState('');

  async function login(email, password) {
    setError('');
    try {
      const { data } = await client.post('/auth/login', { email, password });
      localStorage.setItem('sahod_token', data.token);
      localStorage.setItem('sahod_user', JSON.stringify(data.user));
      setUser(data.user);
      return data.user;
    } catch (err) {
      const msg = err.response?.data?.error || 'Something went wrong. Try again.';
      setError(msg);
      throw new Error(msg);
    }
  }

  function logout() {
    localStorage.removeItem('sahod_token');
    localStorage.removeItem('sahod_user');
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, error }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
