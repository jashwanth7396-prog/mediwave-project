import api from './api.js';

export const fetchNotifications = (params = {}) => api.get('/notifications', { params });
export const fetchNotificationSummary = () => api.get('/notifications/summary');
export const markNotificationRead = (id) => api.patch(`/notifications/${id}/read`);
export const markAllNotificationsRead = () => api.patch('/notifications/read-all');
export const deleteNotification = (id) => api.delete(`/notifications/${id}`);
