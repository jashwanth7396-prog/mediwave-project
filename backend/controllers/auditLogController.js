import AuditLog from '../models/AuditLog.js';

export const getAuditLogs = async (req, res, next) => {
  try {
    const { module, action, q, page = 1, limit = 25, sort = 'desc' } = req.query;
    const filters = {};

    if (module) filters.module = module;
    if (action) filters.action = action;
    if (q) {
      filters.$or = [
        { description: new RegExp(q, 'i') },
        { details: new RegExp(q, 'i') },
        { userName: new RegExp(q, 'i') }
      ];
    }

    const skip = (Math.max(1, Number(page)) - 1) * Number(limit);
    const sortOption = sort === 'asc' ? { createdAt: 1 } : { createdAt: -1 };

    const [items, total] = await Promise.all([
      AuditLog.find(filters).populate('userId', 'name email').sort(sortOption).skip(skip).limit(Number(limit)),
      AuditLog.countDocuments(filters)
    ]);

    res.json({ data: items, meta: { total, page: Number(page), limit: Number(limit) } });
  } catch (error) {
    next(error);
  }
};
