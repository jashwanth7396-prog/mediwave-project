import api from './api.js';

export const fetchReturnRequests = (params = {}) => api.get('/returns', { params });
export const fetchReturnRequestById = (id) => api.get(`/returns/${id}`);
export const createReturnRequest = (payload) => api.post('/returns', payload);
export const updateReturnRequest = (id, payload) => api.put(`/returns/${id}`, payload);
export const patchReturnRequestStatus = (id, payload) => api.patch(`/returns/${id}/status`, payload);
export const deleteReturnRequest = (id) => api.delete(`/returns/${id}`);
export const fetchReturnSummary = () => api.get('/returns/summary');
