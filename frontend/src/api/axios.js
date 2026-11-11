import axios from 'axios';

// Render backend URL (used when running on GitHub Pages)
const RENDER_BACKEND_URL = 'https://task-management-app.onrender.com';

const getBaseURL = () => {
  if (import.meta.env.VITE_API_URL) {
    return `${import.meta.env.VITE_API_URL}/api`;
  }
  if (typeof window !== 'undefined' && window.location.origin.includes('github.io')) {
    return `${RENDER_BACKEND_URL}/api`;
  }
  return '/api';
};

const API = axios.create({
  baseURL: getBaseURL(),
});

// Automatically attach JWT token from localStorage to every request
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default API;
