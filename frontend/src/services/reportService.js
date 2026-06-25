import api from './api.js';

export const fetchReportSummary = (range) => api.get(`/reports/summary?range=${range}`);
export const downloadMedicineCsv = () => api.get('/reports/medicines/csv', { responseType: 'blob' });
export const downloadMedicineExcel = () => api.get('/reports/medicines/excel', { responseType: 'blob' });
