import api from './api.js';

export const fetchDashboardStats = () => api.get('/dashboard/stats');
