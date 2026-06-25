import Medicine from '../models/Medicine.js';
import Notification from '../models/Notification.js';
import User from '../models/User.js';
import { createNotificationsForUsers } from './notificationUtils.js';

const buildLowStockMessage = (medicine) => `${medicine.medicineName} stock is running low. Current quantity: ${medicine.quantity}`;
const buildExpiryWarningMessage = (medicine, daysRemaining) => `${medicine.medicineName} will expire in ${daysRemaining} days.`;
const buildExpiredMessage = (medicine) => `${medicine.medicineName} has expired and should be removed from inventory.`;

export const generateMedicineAlerts = async () => {
  const users = await User.find();
  if (!users.length) return;

  const medicines = await Medicine.find().lean();
  const now = new Date();

  await Promise.all(medicines.map(async (medicine) => {
    const referenceId = medicine._id.toString();
    const expiryDate = new Date(medicine.expiryDate);
    const daysRemaining = Math.ceil((expiryDate - now) / (1000 * 60 * 60 * 24));

    if (medicine.quantity > 10) {
      await Notification.updateMany({ type: 'LOW_STOCK', referenceId, read: false }, { read: true });
    }

    if (medicine.quantity <= 10) {
      await createNotificationsForUsers({
        users,
        type: 'LOW_STOCK',
        title: 'Low Stock Alert',
        message: buildLowStockMessage(medicine),
        referenceId
      });
    }

    if (expiryDate <= now) {
      await createNotificationsForUsers({
        users,
        type: 'EXPIRED_MEDICINE',
        title: 'Expired Medicine',
        message: buildExpiredMessage(medicine),
        referenceId
      });
    } else if (daysRemaining <= 30) {
      await createNotificationsForUsers({
        users,
        type: 'EXPIRY_WARNING',
        title: 'Expiry Warning',
        message: buildExpiryWarningMessage(medicine, daysRemaining),
        referenceId
      });
    }
  }));
};
