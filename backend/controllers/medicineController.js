import Medicine from '../models/Medicine.js';
import AuditLog from '../models/AuditLog.js';
import User from '../models/User.js';
import { createNotificationsForUsers } from '../utils/notificationUtils.js';

const validateMedicine = (payload) => {
  const requiredFields = ['medicineName', 'batchNumber', 'manufacturer', 'quantity', 'price', 'expiryDate', 'category'];
  const missing = requiredFields.filter((field) => !payload[field] && payload[field] !== 0);
  if (missing.length) {
    const error = new Error(`Missing required fields: ${missing.join(', ')}`);
    error.statusCode = 400;
    throw error;
  }
  if (payload.quantity < 0 || payload.price < 0) {
    const error = new Error('Quantity and price must be non-negative');
    error.statusCode = 400;
    throw error;
  }
};

export const createMedicine = async (req, res, next) => {
  try {
    validateMedicine(req.body);
    const medicine = await Medicine.create(req.body);
    const actor = await User.findById(req.user.id).select('name');
    await AuditLog.create({ action: 'CREATE', module: 'MEDICINE', userId: req.user.id, userName: actor?.name || '', description: `${medicine.medicineName} added`, user: req.user.id, details: `${medicine.medicineName} added` });

    const users = await User.find();
    const referenceId = medicine._id.toString();
    const expiryDate = new Date(medicine.expiryDate);
    const now = new Date();
    const daysUntilExpiry = Math.ceil((expiryDate - now) / (1000 * 60 * 60 * 24));

    if (medicine.quantity <= 10) {
      await createNotificationsForUsers({
        users,
        type: 'LOW_STOCK',
        title: 'Low Stock Alert',
        message: `${medicine.medicineName} stock is running low. Current quantity: ${medicine.quantity}`,
        referenceId
      });
    }

    if (expiryDate <= now) {
      await createNotificationsForUsers({
        users,
        type: 'EXPIRED_MEDICINE',
        title: 'Expired Medicine',
        message: `${medicine.medicineName} has expired and should be removed from inventory.`,
        referenceId
      });
    } else if (daysUntilExpiry <= 30) {
      await createNotificationsForUsers({
        users,
        type: 'EXPIRY_WARNING',
        title: 'Expiry Warning',
        message: `${medicine.medicineName} will expire in ${daysUntilExpiry} days.`,
        referenceId
      });
    }

    res.status(201).json(medicine);
  } catch (error) {
    next(error);
  }
};

export const getMedicines = async (req, res, next) => {
  try {
    const { search, status, category } = req.query;
    const filters = {};

    if (search) {
      filters.$or = [
        { medicineName: new RegExp(search, 'i') },
        { batchNumber: new RegExp(search, 'i') },
        { manufacturer: new RegExp(search, 'i') },
        { category: new RegExp(search, 'i') }
      ];
    }
    if (status) filters.status = status;
    if (category) filters.category = category;

    const medicines = await Medicine.find(filters).sort({ createdAt: -1 });
    res.json(medicines);
  } catch (error) {
    next(error);
  }
};

export const getMedicineById = async (req, res, next) => {
  try {
    const medicine = await Medicine.findById(req.params.id);
    if (!medicine) return res.status(404).json({ message: 'Medicine not found' });
    res.json(medicine);
  } catch (error) {
    next(error);
  }
};

export const updateMedicine = async (req, res, next) => {
  try {
    validateMedicine(req.body);
    const medicine = await Medicine.findById(req.params.id);
    if (!medicine) return res.status(404).json({ message: 'Medicine not found' });

    const original = medicine.toObject();
    const updated = await Medicine.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    const actor2 = await User.findById(req.user.id).select('name');
    await AuditLog.create({ action: 'UPDATE', module: 'MEDICINE', userId: req.user.id, userName: actor2?.name || '', description: `${updated.medicineName} updated`, user: req.user.id, details: `${updated.medicineName} updated` });

    const users = await User.find();
    const referenceId = updated._id.toString();
    const titlePrefix = updated.medicineName;

    if (updated.quantity <= 10 && updated.quantity !== original.quantity) {
      await createNotificationsForUsers({
        users,
        type: 'LOW_STOCK',
        title: 'Low Stock Alert',
        message: `${titlePrefix} stock is running low. Current quantity: ${updated.quantity}`,
        referenceId
      });
    }

    const expiryDate = new Date(updated.expiryDate);
    const now = new Date();
    const daysUntilExpiry = Math.ceil((expiryDate - now) / (1000 * 60 * 60 * 24));

    if (expiryDate <= now && original.expiryDate !== updated.expiryDate) {
      await createNotificationsForUsers({
        users,
        type: 'EXPIRED_MEDICINE',
        title: 'Expired Medicine',
        message: `${titlePrefix} has expired and should be removed from inventory.`,
        referenceId
      });
    } else if (daysUntilExpiry <= 30 && original.expiryDate !== updated.expiryDate) {
      await createNotificationsForUsers({
        users,
        type: 'EXPIRY_WARNING',
        title: 'Expiry Warning',
        message: `${titlePrefix} will expire in ${daysUntilExpiry} days.`,
        referenceId
      });
    }

    res.json(updated);
  } catch (error) {
    next(error);
  }
};

export const deleteMedicine = async (req, res, next) => {
  try {
    const medicine = await Medicine.findById(req.params.id);
    if (!medicine) return res.status(404).json({ message: 'Medicine not found' });

    await medicine.deleteOne();
    const actor3 = await User.findById(req.user.id).select('name');
    await AuditLog.create({ action: 'DELETE', module: 'MEDICINE', userId: req.user.id, userName: actor3?.name || '', description: `${medicine.medicineName} removed`, user: req.user.id, details: `${medicine.medicineName} removed` });
    res.json({ message: 'Medicine deleted' });
  } catch (error) {
    next(error);
  }
};

export const getSummary = async (req, res, next) => {
  try {
    const totalMedicines = await Medicine.countDocuments();
    const lowStock = await Medicine.countDocuments({ stockStatus: 'Low Stock' });
    const expired = await Medicine.countDocuments({ status: 'Expired' });
    const criticalExpiry = await Medicine.countDocuments({ status: 'Critical Expiry' });
    const expiringSoon = await Medicine.countDocuments({ status: 'Expiring Soon' });

    res.json({ totalMedicines, lowStock, expired, criticalExpiry, expiringSoon });
  } catch (error) {
    next(error);
  }
};
