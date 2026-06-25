import mongoose from 'mongoose';

const returnRequestSchema = new mongoose.Schema(
  {
    medicineId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Medicine',
      required: true,
    },
    medicineName: {
      type: String,
      required: true,
      trim: true,
    },
    batchNumber: {
      type: String,
      required: true,
      trim: true,
    },
    returnQuantity: {
      type: Number,
      required: true,
      min: 1,
    },
    reason: {
      type: String,
      enum: [
        'Expired',
        'Damaged',
        'Wrong Supply',
        'Manufacturing Defect',
        'Excess Stock',
        'Product Recall',
        'Other',
      ],
      required: true,
    },
    supplierName: {
      type: String,
      trim: true,
      default: '',
    },
    images: {
      type: [String],
      default: [],
    },
    requestDate: {
      type: Date,
      default: Date.now,
    },
    status: {
      type: String,
      enum: ['Pending', 'Approved', 'Rejected', 'Completed'],
      default: 'Pending',
    },
    remarks: {
      type: String,
      trim: true,
      default: '',
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const ReturnRequest = mongoose.model(
  'ReturnRequest',
  returnRequestSchema
);

export default ReturnRequest;