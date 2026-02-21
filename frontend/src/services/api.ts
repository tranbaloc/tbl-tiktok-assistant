import axios from 'axios';
import { API_BASE_URL } from '../utils/constants';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor để thêm JWT token
api.interceptors.request.use(
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

// Response interceptor để xử lý lỗi
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired hoặc không hợp lệ
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// API functions
export const apiService = {
  // Authentication
  loginWithGoogle: async (idToken: string) => {
    const response = await api.post('/auth/google', { idToken });
    return response.data;
  },

  login: async (email: string, password: string) => {
    const response = await api.post('/auth/login', { email, password });
    return response.data;
  },

  // Sessions
  getSessions: async () => {
    const response = await api.get('/tiktok/sessions');
    return response.data;
  },

  getSessionChats: async (sessionId: string) => {
    const response = await api.get(`/tiktok/sessions/${sessionId}/chats`);
    return response.data;
  },

  // Channels
  getChannels: async () => {
    const response = await api.get('/tiktok/channels');
    return response.data;
  },

  // Connections
  getConnections: async () => {
    const response = await api.get('/tiktok/connections');
    return response.data;
  },

  getStatus: async () => {
    const response = await api.get('/tiktok/status');
    return response.data;
  },

  connect: async (username?: string) => {
    const response = await api.post('/tiktok/connections', { username });
    return response.data;
  },

  disconnect: async (username: string) => {
    const response = await api.delete(`/tiktok/connections/${username}`);
    return response.data;
  },
};

export default api;
