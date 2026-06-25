import mongoose from 'mongoose';
import ReturnRequest from '../models/ReturnRequest.js';
import Medicine from '../models/Medicine.js';
import AuditLog from '../models/AuditLog.js';
import User from '../models/User.js';
import { createNotificationsForUsers } from '../utils/notificationUtils.js';

const validReasons = ['Expired', 'Damaged', 'Wrong Supply', 'Manufacturing Defect', 'Excess Stock', 'Product Recall', 'Other'];
const validStatuses = ['Pending', 'Approved', 'Rejected', 'Completed'];

const buildImagePaths = (files, req) => {
  if (!files || !files.length) return [];
  const baseUrl = `${req.protocol}://${req.get('host')}`;
  return files.map((file) => `${baseUrl}/uploads/${file.filename}`);
};

const validatePayload = ({ medicineId, returnQuantity, reason, supplierName, status }) => {
  const missing = [];
  if (!medicineId) missing.push('medicineId');
  if (returnQuantity === undefined || returnQuantity === null) missing.push('returnQuantity');
  if (!reason) missing.push('reason');
  if (missing.length) {
    const err = new Error(`Missing required fields: ${missing.join(', ')}`);
    err.statusCode = 400;
    throw err;
  }
  if (!mongoose.Types.ObjectId.isValid(medicineId)) {
    const err = new Error('Invalid medicineId');
    err.statusCode = 400;
    throw err;
  }
  if (Number(returnQuantity) <= 0) {
    const err = new Error('Return quantity must be greater than zero');
    err.statusCode = 400;
    throw err;
  }
  if (!validReasons.includes(reason)) {
    const err = new Error('Invalid return reason');
    err.statusCode = 400;
    throw err;
  }
  if (status && !validStatuses.includes(status)) {
    const err = new Error('Invalid status');
    err.statusCode = 400;
    throw err;
  }
};

export const createReturnRequest = async (req, res, next) => {
  try {
    const { medicineId, returnQuantity, reason, supplierName, requestDate, status, remarks } = req.body;
    validatePayload({ medicineId, returnQuantity, reason, supplierName, status });

    const qty = Number(returnQuantity);
    const medicine = await Medicine.findById(medicineId);
    if (!medicine) return res.status(404).json({ message: 'Medicine not found' });
    if (qty > medicine.quantity) return res.status(400).json({ message: 'Return quantity cannot exceed available stock' });

    const request = await ReturnRequest.create({
      medicineId,
      medicineName: medicine.medicineName,
      batchNumber: medicine.batchNumber,
      returnQuantity: qty,
      reason,
      supplierName: supplierName || '',
      images: buildImagePaths(req.files, req),
      requestDate: requestDate ? new Date(requestDate) : new Date(),
      status: status || 'Pending',
      remarks: remarks || '',
      createdBy: req.user.id
    });
    const actor = await User.findById(req.user.id).select('name');
    await AuditLog.create({ action: 'CREATE', module: 'RETURN_REQUEST', userId: req.user.id, userName: actor?.name || '', description: `Return ${qty} units for ${medicine.medicineName}`, user: req.user.id, details: `Return ${qty} units for ${medicine.medicineName}` });

    const users = await User.find();
    await createNotificationsForUsers({
      users,
      type: 'RETURN_CREATED',
      title: `Return request created: ${medicine.medicineName}`,
      message: `${qty} units were requested for return (${reason}).`
    });

    res.status(201).json(request);
  } catch (error) {
    next(error);
  }
};

export const getReturnRequests = async (req, res, next) => {
  try {
    const { search, status } = req.query;
    const filters = {};
    if (search) {
      filters.$or = [
        { medicineName: new RegExp(search, 'i') },
        { batchNumber: new RegExp(search, 'i') },
        { reason: new RegExp(search, 'i') },
        { supplierName: new RegExp(search, 'i') },
        { remarks: new RegExp(search, 'i') }
      ];
    }
    if (status) filters.status = status;

    const requests = await ReturnRequest.find(filters).sort({ createdAt: -1 });
    res.json(requests);
  } catch (error) {
    next(error);
  }
};

export const getReturnRequestById = async (req, res, next) => {
  try {
    const request = await ReturnRequest.findById(req.params.id);
    if (!request) return res.status(404).json({ message: 'Return request not found' });
    res.json(request);
  } catch (error) {
    next(error);
  }
};

export const updateReturnRequest = async (req, res, next) => {
  try {
    const request = await ReturnRequest.findById(req.params.id);
    if (!request) return res.status(404).json({ message: 'Return request not found' });

    const { medicineId, returnQuantity, reason, supplierName, requestDate, status, remarks } = req.body;
    validatePayload({ medicineId: medicineId || request.medicineId, returnQuantity: returnQuantity ?? request.returnQuantity, reason, supplierName, status });

    // If status changes to Approved, deduct inventory (only once)
    const originalStatus = request.status;
    const originalQty = request.returnQuantity;

    // Adjust original medicine if previous status was Approved and changing to non-approved
    if (originalStatus === 'Approved' && status !== 'Approved') {
      const origMed = await Medicine.findById(request.medicineId);
      if (origMed) {
        origMed.quantity += originalQty;
        await origMed.save();
      }
    }

    // If approving now, ensure stock and deduct
    if (status === 'Approved' && originalStatus !== 'Approved') {
      const med = await Medicine.findById(medicineId || request.medicineId);
      if (!med) return res.status(404).json({ message: 'Medicine not found' });
      const qty = Number(returnQuantity ?? request.returnQuantity);
      if (qty > med.quantity) return res.status(400).json({ message: 'Return quantity cannot exceed available stock' });
      med.quantity -= qty;
      await med.save();
    }

    if (status === 'Approved' && originalStatus !== 'Approved') {
      const users = await User.find();
      await createNotificationsForUsers({
        users,
        type: 'RETURN_APPROVED',
        title: `Return approved: ${request.medicineName}`,
        message: `Return request ${request._id} has been approved.`
      });
    }

    if (status === 'Rejected' && originalStatus !== 'Rejected') {
      const users = await User.find();
      await createNotificationsForUsers({
        users,
        type: 'RETURN_REJECTED',
        title: `Return rejected: ${request.medicineName}`,
        message: `Return request ${request._id} has been rejected.`
      });
    }

    // Update fields
    request.medicineId = medicineId || request.medicineId;
    if (medicineId) {
      const med = await Medicine.findById(medicineId);
      request.medicineName = med ? med.medicineName : request.medicineName;
      request.batchNumber = med ? med.batchNumber : request.batchNumber;
    }
    request.returnQuantity = Number(returnQuantity ?? request.returnQuantity);
    request.reason = reason || request.reason;
    request.supplierName = supplierName || request.supplierName;
    request.requestDate = requestDate ? new Date(requestDate) : request.requestDate;
    request.status = status || request.status;
    request.remarks = remarks || request.remarks;
    if (req.files && req.files.length) {
      request.images = [...request.images, ...buildImagePaths(req.files, req)];
    }

    await request.save();
    const actor2 = await User.findById(req.user.id).select('name');
    await AuditLog.create({ action: 'UPDATE', module: 'RETURN_REQUEST', userId: req.user.id, userName: actor2?.name || '', description: `Return request ${request._id} updated`, user: req.user.id, details: `Return request ${request._id} updated` });

    res.json(request);
  } catch (error) {
    next(error);
  }
};

export const patchReturnRequestStatus = async (req, res, next) => {
  try {
    const request = await ReturnRequest.findById(req.params.id);
    if (!request) return res.status(404).json({ message: 'Return request not found' });

    const { status } = req.body;
    if (!validStatuses.includes(status)) return res.status(400).json({ message: 'Invalid status' });

    const prevStatus = request.status;
    // From non-approved to approved => deduct
    if (prevStatus !== 'Approved' && status === 'Approved') {
      const med = await Medicine.findById(request.medicineId);
      if (!med) return res.status(404).json({ message: 'Medicine not found' });
      if (request.returnQuantity > med.quantity) return res.status(400).json({ message: 'Return quantity cannot exceed available stock' });
      med.quantity -= request.returnQuantity;
      await med.save();
    }

    // From approved to non-approved => restore
    if (prevStatus === 'Approved' && status !== 'Approved') {
      const med = await Medicine.findById(request.medicineId);
      if (med) {
        med.quantity += request.returnQuantity;
        await med.save();
      }
    }

    request.status = status;
    await request.save();

    const users = await User.find();
    if (status === 'Approved' && prevStatus !== 'Approved') {
      await createNotificationsForUsers({
        users,
        type: 'RETURN_APPROVED',
        title: `Return approved: ${request.medicineName}`,
        message: `Return request ${request._id} has been approved.`
      });
    }

    if (status === 'Rejected' && prevStatus !== 'Rejected') {
      await createNotificationsForUsers({
        users,
        type: 'RETURN_REJECTED',
        title: `Return rejected: ${request.medicineName}`,
        message: `Return request ${request._id} has been rejected.`
      });
    }

    const actor3 = await User.findById(req.user.id).select('name');
    // create specific action for status transitions
    let actionType = 'UPDATE';
    if (status === 'Approved') actionType = 'APPROVE';
    if (status === 'Rejected') actionType = 'REJECT';
    if (status === 'Completed') actionType = 'COMPLETE';
    await AuditLog.create({ action: actionType, module: 'RETURN_REQUEST', userId: req.user.id, userName: actor3?.name || '', description: `Return request ${request._id} status -> ${status}`, user: req.user.id, details: `Return request ${request._id} status -> ${status}` });

    res.json(request);
  } catch (error) {
    next(error);
  }
};

export const deleteReturnRequest = async (req, res, next) => {
  try {
    const request = await ReturnRequest.findById(req.params.id);
    if (!request) return res.status(404).json({ message: 'Return request not found' });

    // If approved, restore inventory
    if (request.status === 'Approved') {
      const med = await Medicine.findById(request.medicineId);
      if (med) {
        med.quantity += request.returnQuantity;
        await med.save();
      }
    }

    await request.deleteOne();
    const actor4 = await User.findById(req.user.id).select('name');
    await AuditLog.create({ action: 'DELETE', module: 'RETURN_REQUEST', userId: req.user.id, userName: actor4?.name || '', description: `Return request ${request._id} removed`, user: req.user.id, details: `Return request ${request._id} removed` });

    res.json({ message: 'Return request deleted' });
  } catch (error) {
    next(error);
  }
};

export const getReturnSummary = async (req, res, next) => {
  try {
    const totalRequests = await ReturnRequest.countDocuments();
    const perStatus = await ReturnRequest.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);
    const stats = perStatus.reduce((acc, cur) => ({ ...acc, [cur._id]: cur.count }), {});
    res.json({ totalRequests, stats });
  } catch (error) {
    next(error);
  }
};
