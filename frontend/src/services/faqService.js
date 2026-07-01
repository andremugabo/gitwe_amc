import api from '../api/axios';

const faqService = {
  getFaqs: () => api.get('/faqs'),
  createFaq: (data) => api.post('/faqs', data),
  deleteFaq: (id) => api.delete(`/faqs/${id}`)
};

export default faqService;
