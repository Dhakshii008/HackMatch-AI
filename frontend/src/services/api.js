import axios from 'axios';
import useAuthStore from '../store/authStore';
import { handleDemoRequest } from './demoAdapter';

// In dev the Vite proxy forwards /api to the backend. In production set
// VITE_API_URL to the deployed backend origin (e.g. https://hackmatch-api.onrender.com).
// Automatically appends /api if omitted so API routes resolve correctly.
const getBaseUrl = () => {
  const envUrl = import.meta.env.VITE_API_URL;
  if (!envUrl) return '/api';
  const clean = envUrl.trim().replace(/\/+$/, '');
  return clean.endsWith('/api') ? clean : `${clean}/api`;
};

// Check if running on static hosting without an active external backend
const isStaticHost =
  typeof window !== 'undefined' &&
  (!import.meta.env.VITE_API_URL ||
    window.location.hostname.includes('github.io') ||
    window.location.protocol === 'file:');

// Direct adapter for in-browser demo engine on static hosts
const demoAxiosAdapter = async (config) => {
  try {
    const res = await handleDemoRequest(config);
    return {
      data: res.data,
      status: 200,
      statusText: 'OK',
      headers: { 'content-type': 'application/json' },
      config,
      request: {}
    };
  } catch (err) {
    if (err.response) return Promise.reject(err);
    const error = new Error(err.message || 'Demo Request Failed');
    error.config = config;
    error.response = {
      data: { success: false, message: err.message || 'Request failed' },
      status: 400,
      statusText: 'Bad Request'
    };
    return Promise.reject(error);
  }
};

const api = axios.create({
  baseURL: getBaseUrl(),
  headers: { 'Content-Type': 'application/json' },
  adapter: isStaticHost ? demoAxiosAdapter : undefined
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
  async (error) => {
    // If backend is not available (404, 405 Method Not Allowed on static hosts, 502/503, or Network Error),
    // automatically fall back to the In-Browser Demo Engine.
    const isOfflineOrNotFound =
      !error.response ||
      error.response.status === 404 ||
      error.response.status === 405 ||
      error.response.status === 502 ||
      error.response.status === 503 ||
      error.code === 'ERR_NETWORK';

    if (isOfflineOrNotFound && error.config) {
      try {
        const demoResponse = await handleDemoRequest(error.config);
        return {
          data: demoResponse.data,
          status: 200,
          statusText: 'OK',
          headers: {},
          config: error.config,
          request: {}
        };
      } catch (demoErr) {
        return Promise.reject(demoErr);
      }
    }

    if (error.response?.status === 401) {
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
