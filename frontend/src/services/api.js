import axios from 'axios';
import useAuthStore from '../store/authStore';

// In dev the Vite proxy forwards /api to the backend. In production set
// VITE_API_URL to the deployed backend origin (e.g. https://hackmatch-api.onrender.com).
// Automatically appends /api if omitted so API routes resolve correctly.
const getBaseUrl = () => {
  const envUrl = import.meta.env.VITE_API_URL;
  if (!envUrl) return '/api';
  const clean = envUrl.trim().replace(/\/+$/, '');
  return clean.endsWith('/api') ? clean : `${clean}/api`;
};

const api = axios.create({
  baseURL: getBaseUrl(),
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Expired/invalid session: clear auth state and let the router redirect
      // via ProtectedRoute. No forced page reload.
      localStorage.removeItem('token');
      try {
        useAuthStore.getState().logout();
      } catch { /* store not ready */ }
      if (!window.location.pathname.startsWith('/login')) {
        window.history.pushState({}, '', '/login');
        window.dispatchEvent(new PopStateEvent('popstate'));
      }
    }
    return Promise.reject(error);
  }
);

export default api;
