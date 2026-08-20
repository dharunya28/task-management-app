import React, { createContext, useState, useEffect, useContext } from 'react';
import API from '../api/axios';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token') || null);
  const [loading, setLoading] = useState(true);

  // Load user profile on startup if token exists
  useEffect(() => {
    const fetchUser = async () => {
      if (token) {
        try {
          const response = await API.get('/auth/me');
          setUser(response.data);
        } catch (error) {
          console.error('Session expired or invalid token:', error);
          logout();
        }
      }
      setLoading(false);
    };

    fetchUser();
  }, [token]);

  const login = async (email, password) => {
    const response = await API.post('/auth/login', { email, password });
    const { token: receivedToken, ...userData } = response.data;
    localStorage.setItem('token', receivedToken);
    setToken(receivedToken);
    setUser(userData);
    return response.data;
  };

  const register = async (name, email, password) => {
    const response = await API.post('/auth/register', { name, email, password });
    const { token: receivedToken, ...userData } = response.data;
    localStorage.setItem('token', receivedToken);
    setToken(receivedToken);
    setUser(userData);
    return response.data;
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
