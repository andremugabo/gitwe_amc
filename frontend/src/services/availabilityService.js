import api from '../api/axios';

const availabilityService = {
  getAvailability: () => api.get('/availability'),
  setAvailability: (data) => api.post('/availability', data)
};

export default availabilityService;
