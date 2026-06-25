import api from './api.js';

export const fetchMedicines = (params) => api.get('/medicines', { params });
export const fetchMedicineById = (id) => api.get(`/medicines/${id}`);
export const createMedicine = (payload) => api.post('/medicines', payload);
export const updateMedicine = (id, payload) => api.put(`/medicines/${id}`, payload);
export const deleteMedicine = (id) => api.delete(`/medicines/${id}`);
export const fetchSummary = () => api.get('/medicines/summary');
