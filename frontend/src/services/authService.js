import api from '../api/axios';

const authService = {
  login: (email, password) => api.post('/auth/login', { email, password }),

  register: (formData) => api.post('/auth/register', formData),

  verifyEmail: (email, code) => api.post('/auth/verify', { email, code }),

  forgotPassword: (email) => api.post('/auth/forgot-password', { email }),

  resetPassword: (email, code, newPassword) =>
    api.post('/auth/reset-password', { email, code, newPassword }),

  getProfile: () => api.get('/auth/profile'),

  getUsers: (params) => api.get('/auth/users', { params }),

  updateUser: (id, data) => api.put(`/auth/users/${id}`, data)
};

export default authService;
