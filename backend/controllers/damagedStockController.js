import mongoose from 'mongoose';
import DamagedStock from '../models/DamagedStock.js';
import Medicine from '../models/Medicine.js';
import AuditLog from '../models/AuditLog.js';
import User from '../models/User.js';
import { createNotificationsForUsers } from '../utils/notificationUtils.js';

const validReasons = ['Packaging Damage', 'Expired', 'Leakage', 'Broken Bottle', 'Manufacturing Defect', 'Other'];
const validStatuses = ['Pending', 'Approved', 'Rejected'];

const validateDamagedStockPayload = ({ medicineId, damagedQuantity, reason, reportedBy, status }) => {
  const missingFields = [];
  if (!medicineId) missingFields.push('medicineId');
  if (damagedQuantity === undefined || damagedQuantity === null) missingFields.push('damagedQuantity');
  if (!reason) missingFields.push('reason');
  if (!reportedBy) missingFields.push('reportedBy');

  if (missingFields.length) {
    const error = new Error(`Missing required fields: ${missingFields.join(', ')}`);
    error.statusCode = 400;
    throw error;
  }

  if (!mongoose.Types.ObjectId.isValid(medicineId)) {
    const error = new Error('Invalid medicineId');
    error.statusCode = 400;
    throw error;
  }

  if (Number(damagedQuantity) <= 0) {
    const error = new Error('Damaged quantity must be greater than zero');
    error.statusCode = 400;
    throw error;
  }

  if (!validReasons.includes(reason)) {
    const error = new Error('Invalid damaged reason');
    error.statusCode = 400;
    throw error;
  }

  if (status && !validStatuses.includes(status)) {
    const error = new Error('Invalid status value');
    error.statusCode = 400;
    throw error;
  }
};

export const createDamagedStock = async (req, res, next) => {
  try {
    const { medicineId, damagedQuantity, reason, reportedBy, reportedDate, status } = req.body;
    validateDamagedStockPayload({ medicineId, damagedQuantity, reason, reportedBy, status });

    const quantityNumber = Number(damagedQuantity);
    const medicine = await Medicine.findById(medicineId);
    if (!medicine) return res.status(404).json({ message: 'Medicine not found' });
    if (quantityNumber > medicine.quantity) {
      return res.status(400).json({ message: 'Damaged quantity cannot exceed available stock' });
    }

    medicine.quantity -= quantityNumber;
    await medicine.save();

    const damagedStock = await DamagedStock.create({
      medicineId,
      medicineName: medicine.medicineName,
      batchNumber: medicine.batchNumber,
      damagedQuantity: quantityNumber,
      reason,
      reportedBy,
      reportedDate: reportedDate ? new Date(reportedDate) : new Date(),
      status: status || 'Pending'
    });
    const actor = await User.findById(req.user.id).select('name');
    await AuditLog.create({ action: 'CREATE', module: 'DAMAGED_STOCK', userId: req.user.id, userName: actor?.name || '', description: `${quantityNumber} damaged units reported for ${medicine.medicineName}`, user: req.user.id, details: `${quantityNumber} damaged units reported for ${medicine.medicineName}` });

    const users = await User.find();
    await createNotificationsForUsers({
      users,
      type: 'DAMAGED_STOCK',
      title: `Damaged stock: ${medicine.medicineName}`,
      message: `${quantityNumber} units of ${medicine.medicineName} were logged as damaged.`
    });

    if (medicine.quantity <= 10) {
      await createNotificationsForUsers({
        users,
        type: 'LOW_STOCK',
        title: `Low stock: ${medicine.medicineName}`,
        message: `${medicine.medicineName} has dropped to ${medicine.quantity} units after damaged stock.`
      });
    }

    res.status(201).json(damagedStock);
  } catch (error) {
    next(error);
  }
};

export const getDamagedStocks = async (req, res, next) => {
  try {
    const { search, status } = req.query;
    const filters = {};

    if (search) {
      filters.$or = [
        { medicineName: new RegExp(search, 'i') },
        { batchNumber: new RegExp(search, 'i') },
        { reason: new RegExp(search, 'i') },
        { reportedBy: new RegExp(search, 'i') },
        { status: new RegExp(search, 'i') }
      ];
    }

    if (status) filters.status = status;

    const damagedStocks = await DamagedStock.find(filters).sort({ createdAt: -1 });
    res.json(damagedStocks);
  } catch (error) {
    next(error);
  }
};

export const getDamagedStockById = async (req, res, next) => {
  try {
    const damagedStock = await DamagedStock.findById(req.params.id);
    if (!damagedStock) return res.status(404).json({ message: 'Damaged stock record not found' });
    res.json(damagedStock);
  } catch (error) {
    next(error);
  }
};

export const updateDamagedStock = async (req, res, next) => {
  try {
    const damagedStock = await DamagedStock.findById(req.params.id);
    if (!damagedStock) return res.status(404).json({ message: 'Damaged stock record not found' });

    const { medicineId, damagedQuantity, reason, reportedBy, reportedDate, status } = req.body;
    validateDamagedStockPayload({ medicineId, damagedQuantity, reason, reportedBy, status });
    const quantityNumber = Number(damagedQuantity);

    const originalMedicine = await Medicine.findById(damagedStock.medicineId);
    if (originalMedicine) {
      originalMedicine.quantity += damagedStock.damagedQuantity;
      await originalMedicine.save();
    }

    const updatedMedicine = await Medicine.findById(medicineId);
    if (!updatedMedicine) {
      if (originalMedicine) {
        originalMedicine.quantity -= damagedStock.damagedQuantity;
        await originalMedicine.save();
      }
      return res.status(404).json({ message: 'Medicine not found' });
    }

    if (quantityNumber > updatedMedicine.quantity) {
      if (originalMedicine && String(originalMedicine._id) === String(updatedMedicine._id)) {
        originalMedicine.quantity -= damagedStock.damagedQuantity;
        await originalMedicine.save();
      }
      return res.status(400).json({ message: 'Damaged quantity cannot exceed available stock' });
    }

    updatedMedicine.quantity -= quantityNumber;
    await updatedMedicine.save();

    damagedStock.medicineId = medicineId;
    damagedStock.medicineName = updatedMedicine.medicineName;
    damagedStock.batchNumber = updatedMedicine.batchNumber;
    damagedStock.damagedQuantity = quantityNumber;
    damagedStock.reason = reason;
    damagedStock.reportedBy = reportedBy;
    damagedStock.reportedDate = reportedDate ? new Date(reportedDate) : damagedStock.reportedDate;
    damagedStock.status = status;

    await damagedStock.save();
    const actor2 = await User.findById(req.user.id).select('name');
    await AuditLog.create({ action: 'UPDATE', module: 'DAMAGED_STOCK', userId: req.user.id, userName: actor2?.name || '', description: `Damaged stock record updated for ${updatedMedicine.medicineName}`, user: req.user.id, details: `Damaged stock record updated for ${updatedMedicine.medicineName}` });

    res.json(damagedStock);
  } catch (error) {
    next(error);
  }
};

export const deleteDamagedStock = async (req, res, next) => {
  try {
    const damagedStock = await DamagedStock.findById(req.params.id);
    if (!damagedStock) return res.status(404).json({ message: 'Damaged stock record not found' });

    const medicine = await Medicine.findById(damagedStock.medicineId);
    if (medicine) {
      medicine.quantity += damagedStock.damagedQuantity;
      await medicine.save();
    }

    await damagedStock.deleteOne();
    const actor3 = await User.findById(req.user.id).select('name');
    await AuditLog.create({ action: 'DELETE', module: 'DAMAGED_STOCK', userId: req.user.id, userName: actor3?.name || '', description: `Damaged stock record deleted for ${damagedStock.medicineName}`, user: req.user.id, details: `Damaged stock record deleted for ${damagedStock.medicineName}` });

    res.json({ message: 'Damaged stock record deleted' });
  } catch (error) {
    next(error);
  }
};

export const getDamagedStockSummary = async (req, res, next) => {
  try {
    const totalDamagedStock = await DamagedStock.countDocuments();
    const summaryResult = await DamagedStock.aggregate([
      {
        $group: {
          _id: null,
          totalDamagedQuantity: { $sum: '$damagedQuantity' }
        }
      }
    ]);

    res.json({
      totalDamagedStock,
      totalDamagedQuantity: summaryResult[0]?.totalDamagedQuantity || 0
    });
  } catch (error) {
    next(error);
  }
};
