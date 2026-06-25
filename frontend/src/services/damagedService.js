import api from './api.js';

export const fetchDamagedItems = (params = {}) => api.get('/damaged-stock', { params });
export const fetchDamagedStockById = (id) => api.get(`/damaged-stock/${id}`);
export const createDamagedItem = (payload) => api.post('/damaged-stock', payload);
export const updateDamagedItem = (id, payload) => api.put(`/damaged-stock/${id}`, payload);
export const deleteDamagedItem = (id) => api.delete(`/damaged-stock/${id}`);
export const fetchDamagedStockSummary = () => api.get('/damaged-stock/summary');
