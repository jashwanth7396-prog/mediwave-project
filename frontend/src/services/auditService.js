import api from './api.js';

export const fetchAuditLogs = ({ page = 1, limit = 25, module, action, q, sort = 'desc' } = {}) => {
	const params = { page, limit, sort };
	if (module) params.module = module;
	if (action) params.action = action;
	if (q) params.q = q;
	return api.get('/audit', { params });
};
