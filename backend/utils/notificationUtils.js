import Notification from '../models/Notification.js';
import AuditLog from '../models/AuditLog.js';

const buildNotificationQuery = ({ userId, type, referenceId }) => {
  const query = {
    user: userId,
    type
  };

  if (referenceId) {
    query.referenceId = referenceId;
  }

  return query;
};

export const createNotification = async ({ userId, type, title, message, referenceId, userName = '' }) => {
  if (!userId) return null;

  const existing = await Notification.findOne(buildNotificationQuery({ userId, type, referenceId }));
  if (existing) {
    return existing;
  }

  const notification = await Notification.create({ user: userId, type, title, message, referenceId });
  await AuditLog.create({
    action: 'CREATE',
    module: 'NOTIFICATION',
    userId,
    userName,
    description: `${title} - ${message}`,
    user: userId,
    details: `${title} - ${message}`
  });

  return notification;
};

export const createNotificationsForUsers = async ({ users, type, title, message, referenceId }) => {
  return Promise.all(
    users.map((user) => createNotification({
      userId: user._id,
      userName: user.name || '',
      type,
      title,
      message,
      referenceId
    }))
  );
};
