import axios from 'axios';
import useAuthStore from '../store/authStore';

// In dev the Vite proxy forwards /api to the backend. In production set
// VITE_API_URL to the deployed backend origin (e.g. https://api.example.com).
// Socket.IO is served from the same origin, so the proxy is reused there too.
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
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
