import api from '../api/axios';

const memberService = {
  getMembers: (params) => api.get('/members', { params }),

  getMemberById: (id) => api.get(`/members/${id}`),

  createMember: (data) => api.post('/members', data),

  updateMember: (id, data) => api.put(`/members/${id}`, data),

  deleteMember: (id) => api.delete(`/members/${id}`)
};

export default memberService;
