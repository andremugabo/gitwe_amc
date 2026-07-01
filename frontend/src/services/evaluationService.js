import api from '../api/axios';

const evaluationService = {
  submitEvaluation: (data) => api.post('/evaluations', data),
  getEvaluations: () => api.get('/evaluations')
};

export default evaluationService;
