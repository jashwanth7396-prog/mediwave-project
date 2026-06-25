import Notification from '../models/Notification.js';
import AuditLog from '../models/AuditLog.js';

export const getNotifications = async (req, res, next) => {
  try {
    const { type, q } = req.query;
    const filters = { user: req.user.id };

    if (type) filters.type = type;
    if (q) {
      filters.$or = [
        { title: new RegExp(q, 'i') },
        { message: new RegExp(q, 'i') }
      ];
    }

    const notifications = await Notification.find(filters).sort({ createdAt: -1 });
    res.json(notifications);
  } catch (error) {
    next(error);
  }
};

export const getNotificationSummary = async (req, res, next) => {
  try {
    const totalNotifications = await Notification.countDocuments({ user: req.user.id });
    const unreadNotifications = await Notification.countDocuments({ user: req.user.id, read: false });
    res.json({ totalNotifications, unreadNotifications });
  } catch (error) {
    next(error);
  }
};

export const markNotificationRead = async (req, res, next) => {
  try {
    const notification = await Notification.findById(req.params.id);
    if (!notification) return res.status(404).json({ message: 'Notification not found' });
    if (notification.user.toString() !== req.user.id) return res.status(403).json({ message: 'Unauthorized' });

    notification.read = true;
    await notification.save();
    const actor = req.user.id;
    await AuditLog.create({ action: 'UPDATE', module: 'NOTIFICATION', userId: req.user.id, userName: '', description: `${notification.title}`, user: req.user.id, details: `${notification.title}` });

    res.json(notification);
  } catch (error) {
    next(error);
  }
};

export const markAllNotificationsRead = async (req, res, next) => {
  try {
    await Notification.updateMany({ user: req.user.id, read: false }, { read: true });
    await AuditLog.create({ action: 'UPDATE', module: 'NOTIFICATION', userId: req.user.id, userName: '', description: 'All notifications marked as read', user: req.user.id, details: 'All notifications marked as read' });
    res.json({ message: 'All notifications marked as read' });
  } catch (error) {
    next(error);
  }
};

export const deleteNotification = async (req, res, next) => {
  try {
    const notification = await Notification.findById(req.params.id);
    if (!notification) return res.status(404).json({ message: 'Notification not found' });
    if (notification.user.toString() !== req.user.id) return res.status(403).json({ message: 'Unauthorized' });

    await notification.deleteOne();
    await AuditLog.create({ action: 'DELETE', module: 'NOTIFICATION', userId: req.user.id, userName: '', description: `${notification.title}`, user: req.user.id, details: `${notification.title}` });

    res.json({ message: 'Notification deleted' });
  } catch (error) {
    next(error);
  }
};
