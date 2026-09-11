import axios from 'axios';

// Dynamically resolve API URL so it works seamlessly across:
// 1. Production deployments (Render, Vercel, Netlify)
// 2. Localhost development on desktop
// 3. Other devices on the same local network (mobile phones, tablets)
const getApiBaseUrl = () => {
  let envUrl = import.meta.env.VITE_API_URL;

  // Sanitize if accidentally prefixed with "VITE_API_URL=" or has whitespace
  if (typeof envUrl === 'string') {
    envUrl = envUrl.trim();
    if (envUrl.startsWith('VITE_API_URL=')) {
      envUrl = envUrl.replace(/^VITE_API_URL=/, '').trim();
    }
  }

  if (typeof window !== 'undefined') {
    const { hostname } = window.location;

    // 1. If an explicit cloud API URL is configured (and not localhost), use it
    if (envUrl && !envUrl.includes('localhost') && !envUrl.includes('127.0.0.1')) {
      return envUrl;
    }

    // 2. If accessed from another device on the local network (mobile/tablet via Wi-Fi)
    if (hostname !== 'localhost' && hostname !== '127.0.0.1') {
      if (import.meta.env.DEV) {
        return '/api';
      }
      return `http://${hostname}:5000/api`;
    }
  }

  // 3. Default fallback for local desktop development
  return envUrl || 'http://localhost:5000/api';
};

const API_URL = getApiBaseUrl();

// Create configured Axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// Request Interceptor: Automatically attach Bearer token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Handle global response errors (e.g. 401 Unauthorized)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // If token is invalid or expired, clear storage
      const currentPath = window.location.pathname;
      if (currentPath !== '/login' && currentPath !== '/register') {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// Auth Service
export const authService = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  logout: () => api.post('/auth/logout'),
  getCurrentUser: () => api.get('/auth/me'),
  resetPassword: (data) => api.post('/auth/reset-password', data),
};

// Dashboard Service
export const dashboardService = {
  getStats: () => api.get('/dashboard/stats'),
};

// Project Service
export const projectService = {
  getAll: (params) => api.get('/projects', { params }),
  getById: (id) => api.get(`/projects/${id}`),
  create: (data) => api.post('/projects', data),
  update: (id, data) => api.put(`/projects/${id}`, data),
  delete: (id) => api.delete(`/projects/${id}`),
};

// Task Service
export const taskService = {
  getAll: (params) => api.get('/tasks', { params }),
  getById: (id) => api.get(`/tasks/${id}`),
  create: (data) => api.post('/tasks', data),
  update: (id, data) => api.put(`/tasks/${id}`, data),
  delete: (id) => api.delete(`/tasks/${id}`),
};

export default api;
