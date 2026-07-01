import axios from 'axios';
import { toast } from '../utils/toast';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5001/api',
});

// Add a request interceptor to include the JWT token
api.interceptors.request.use(
  (config) => {
    const userInfo = JSON.parse(localStorage.getItem('userInfo'));
    if (userInfo && userInfo.token) {
      config.headers.Authorization = `Bearer ${userInfo.token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add a response interceptor to handle token expiry / unauthorized requests
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      const { status, data } = error.response;
      if (status === 401) {
        localStorage.removeItem('userInfo');
        toast.error('Session expired. Please log in again.');
        if (!window.location.pathname.includes('/login')) {
          setTimeout(() => {
            window.location.href = '/login';
          }, 1000);
        }
      } else if (status === 403) {
        toast.error(data?.message || 'Access denied. Unauthorized action.');
      } else {
        toast.error(data?.message || 'An error occurred on the server.');
      }
    } else {
      toast.error('Network error. Failed to connect to server.');
    }
    return Promise.reject(error);
  }
);

export default api;
