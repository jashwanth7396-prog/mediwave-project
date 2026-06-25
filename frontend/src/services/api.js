import axios from 'axios';

const localApiBaseUrl = 'http://localhost:5000/api';
const productionApiBaseUrl = 'https://mediwave-project.onrender.com/api';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || (import.meta.env.DEV ? localApiBaseUrl : productionApiBaseUrl)
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('mediwave_token');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
