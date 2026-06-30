import api from '../api/axios';

const documentService = {
  getDocuments: (params) => api.get('/documents', { params }),
  
  uploadDocument: (formData) => api.post('/documents', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  }),
  
  deleteDocument: (id) => api.delete(`/documents/${id}`)
};

export default documentService;
