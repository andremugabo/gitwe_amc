import api from '../api/axios';

const trainerService = {
  getCourses: () => api.get('/trainer/courses'),
  getTrainees: (courseId) => api.get(`/trainer/courses/${courseId}/trainees`),
  markAttendance: (data) => api.post('/trainer/attendance', data),
  createTest: (data) => api.post('/trainer/tests', data),
  getTestResults: () => api.get('/trainer/results'),
  gradeTestResult: (resultId, data) => api.post(`/trainer/results/${resultId}/grade`, data),
  getEvaluations: () => api.get('/trainer/evaluations')
};

export default trainerService;
