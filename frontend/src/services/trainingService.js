import api from '../api/axios';

const trainingService = {
  getCourses: () => api.get('/training'),
  
  getCourseById: (id) => api.get(`/training/${id}`),
  
  createCourse: (data) => api.post('/training', data),
  
  addCourseMaterial: (id, data) => api.post(`/training/${id}/material`, data),
  
  registerElder: (data) => api.post('/training/register', data),
  
  recommendElder: (data) => api.post('/training/recommend', data),
  
  getRecommendations: () => api.get('/training/recommend/list'),
  
  createSession: (id, data) => api.post(`/training/${id}/session`, data),
  
  markAttendance: (sessionId, data) => api.post(`/training/session/${sessionId}/attendance`, data),
  
  issueCertificate: (data) => api.post('/training/certificate', data),
  
  getNotifications: () => api.get('/training/notifications'),

  getMaterials: () => api.get('/training/materials')
};

export default trainingService;
