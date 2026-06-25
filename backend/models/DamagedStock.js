import mongoose from 'mongoose';

const damagedStockSchema = new mongoose.Schema(
  {
    medicineId: { type: mongoose.Schema.Types.ObjectId, ref: 'Medicine', required: true },
    medicineName: { type: String, required: true, trim: true },
    batchNumber: { type: String, required: true, trim: true },
    damagedQuantity: { type: Number, required: true, min: 1 },
    reason: {
      type: String,
      enum: ['Packaging Damage', 'Expired', 'Leakage', 'Broken Bottle', 'Manufacturing Defect', 'Other'],
      required: true,
      trim: true
    },
    reportedBy: { type: String, required: true, trim: true },
    reportedDate: { type: Date, required: true, default: Date.now },
    status: { type: String, enum: ['Pending', 'Approved', 'Rejected'], default: 'Pending' }
  },
  { timestamps: true }
);

export default mongoose.model('DamagedStock', damagedStockSchema);
