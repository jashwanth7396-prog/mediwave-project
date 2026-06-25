import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ['LOW_STOCK', 'EXPIRY_WARNING', 'EXPIRED_MEDICINE', 'DAMAGED_STOCK', 'RETURN_CREATED', 'RETURN_APPROVED', 'RETURN_REJECTED'],
      required: true
    },
    title: { type: String, required: true, trim: true },
    message: { type: String, required: true, trim: true },
    referenceId: { type: String, trim: true, index: true },
    read: { type: Boolean, default: false },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
  },
  { timestamps: true }
);

export default mongoose.model('Notification', notificationSchema);
