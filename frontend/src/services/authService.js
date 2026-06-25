import api from './api.js';

export const loginUser = (payload) => api.post('/auth/login', payload);
export const registerUser = (payload) => api.post('/auth/register', payload);
export const getProfile = () => api.get('/auth/profile');
