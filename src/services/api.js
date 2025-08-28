import axios from 'axios';
import { BASE_API_URL } from '../constants/api-urls';

// Use proxy in development, direct URL in production
const isDevelopment = import.meta.env.DEV;
const BASE_URL = isDevelopment 
  ? '/api'  // Use Vite proxy in development
  : (import.meta.env.VITE_API_URL || BASE_API_URL);
const TIMEOUT_MS = Number(import.meta.env.VITE_API_TIMEOUT) || 10000;

// Debug log
console.log('🔗 Environment:', isDevelopment ? 'Development' : 'Production');
console.log('🔗 API Base URL:', BASE_URL);
console.log('🔗 Original BASE_API_URL:', BASE_API_URL);

const api = axios.create({
  baseURL: BASE_URL,
  timeout: TIMEOUT_MS,
  headers: { 
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization'
  },
});

// Thêm interceptor request (nếu cần token)
api.interceptors.request.use(config => {
  const token = localStorage.getItem('accessToken');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Thêm interceptor response (bắt lỗi chung)
api.interceptors.response.use(
  res => res,
  err => {
    // Ví dụ: tự động redirect khi 401
    if (err.response?.status === 401) {
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

export default api;
