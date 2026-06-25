import { createContext, useContext, useEffect, useState } from 'react';
import api from '../services/api.js';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('mediwave_token'));

  useEffect(() => {
    if (token) {
      const savedUser = localStorage.getItem('mediwave_user');
      setUser(savedUser ? JSON.parse(savedUser) : null);
    }
  }, [token]);

  const login = (authToken, userData) => {
    localStorage.setItem('mediwave_token', authToken);
    localStorage.setItem('mediwave_user', JSON.stringify(userData));
    setToken(authToken);
    setUser(userData);
  };

  const logout = () => {
    // notify backend for audit logging (best-effort)
    (async () => {
      try {
        await api.post('/auth/logout');
      } catch (e) {
        // ignore errors - still proceed with client-side logout
      }
    })();

    localStorage.removeItem('mediwave_token');
    localStorage.removeItem('mediwave_user');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, isAuthenticated: Boolean(token) }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
