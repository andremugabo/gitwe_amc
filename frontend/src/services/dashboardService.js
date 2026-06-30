import api from '../api/axios';

const dashboardService = {
  getStats: () => api.get('/dashboard/stats')
};

export default dashboardService;
