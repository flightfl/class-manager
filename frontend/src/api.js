import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

// Create axios instance with base configuration
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ============ STUDENTS API ============
export const studentsAPI = {
  getAll: () => api.get('/students'),
  create: (data) => api.post('/students', data),
  update: (id, data) => api.put(`/students/${id}`, data),
  delete: (id) => api.delete(`/students/${id}`),
};

// ============ SUBJECTS API ============
export const subjectsAPI = {
  getAll: () => api.get('/subjects'),
  create: (data) => api.post('/subjects', data),
  update: (id, data) => api.put(`/subjects/${id}`, data),
  delete: (id) => api.delete(`/subjects/${id}`),
};

// ============ SEMESTERS API ============
export const semestersAPI = {
  getAll: () => api.get('/semesters'),
  create: (data) => api.post('/semesters', data),
  update: (id, data) => api.put(`/semesters/${id}`, data),
  delete: (id) => api.delete(`/semesters/${id}`),
};

// ============ EXAM TYPES API ============
export const examTypesAPI = {
  getAll: () => api.get('/exam-types'),
  create: (data) => api.post('/exam-types', data),
  update: (id, data) => api.put(`/exam-types/${id}`, data),
  delete: (id) => api.delete(`/exam-types/${id}`),
};

// ============ STUDENT-SUBJECT RELATIONS API ============
export const studentSubjectsAPI = {
  getAll: () => api.get('/student-subjects'),
  create: (data) => api.post('/student-subjects', data),
  delete: (id) => api.delete(`/student-subjects/${id}`),
  deleteByIds: (studentId, subjectId) => 
    api.delete(`/student-subjects/by-ids/${studentId}/${subjectId}`),
};

// ============ GRADES API ============
export const gradesAPI = {
  getAll: () => api.get('/grades'),
  create: (data) => api.post('/grades', data),
  update: (id, data) => api.put(`/grades/${id}`, data),
  upsert: (data) => api.post('/grades/upsert', data),
  delete: (id) => api.delete(`/grades/${id}`),
};

// ============ HEALTH CHECK ============
export const healthCheck = () => api.get('/health');

// Export the axios instance for custom requests if needed
export default api;