import api from '../api/axios';

const hierarchyService = {
  getHierarchy: () => api.get('/hierarchy')
};

export default hierarchyService;
