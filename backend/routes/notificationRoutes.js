import express from 'express';
import { getNotifications, getNotificationSummary, markNotificationRead, markAllNotificationsRead, deleteNotification } from '../controllers/notificationController.js';

const router = express.Router();

router.get('/', getNotifications);
router.get('/summary', getNotificationSummary);
router.patch('/:id/read', markNotificationRead);
router.patch('/read-all', markAllNotificationsRead);
router.delete('/:id', deleteNotification);

export default router;
