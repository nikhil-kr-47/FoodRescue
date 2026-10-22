import React, { createContext, useContext, useState, useEffect } from 'react';
import { apiRequest, setToken, removeToken, getToken } from '../api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('foodrescue_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = getToken();
    if (token) {
      apiRequest('/auth/me')
        .then((res) => {
          setUser(res.user);
          localStorage.setItem('foodrescue_user', JSON.stringify(res.user));
        })
        .catch(() => {
          logout();
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (email, password) => {
    const data = await apiRequest('/auth/login', 'POST', { email, password });
    setToken(data.token);
    setUser(data.user);
    localStorage.setItem('foodrescue_user', JSON.stringify(data.user));
    return data.user;
  };

  const register = async (userData) => {
    const data = await apiRequest('/auth/register', 'POST', userData);
    setToken(data.token);
    setUser(data.user);
    localStorage.setItem('foodrescue_user', JSON.stringify(data.user));
    return data.user;
  };

  const logout = () => {
    removeToken();
    localStorage.removeItem('foodrescue_user');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading, setUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
