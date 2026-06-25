import mongoose from 'mongoose';

const medicineSchema = new mongoose.Schema(
  {
    medicineName: { type: String, required: true, trim: true },
    batchNumber: { type: String, required: true, trim: true },
    manufacturer: { type: String, required: true, trim: true },
    quantity: { type: Number, required: true, min: 0 },
    price: { type: Number, required: true, min: 0 },
    expiryDate: { type: Date, required: true },
    category: { type: String, required: true, trim: true },
    description: { type: String, trim: true, default: '' },
    status: {
      type: String,
      enum: ['Expired', 'Critical Expiry', 'Expiring Soon', 'Active'],
      default: 'Active'
    },
    stockStatus: {
      type: String,
      enum: ['In Stock', 'Low Stock', 'Out of Stock'],
      default: 'In Stock'
    }
  },
  { timestamps: true }
);

const computeStatus = function () {
  const now = new Date();
  const expiry = new Date(this.expiryDate);
  const diffDays = Math.ceil((expiry - now) / (1000 * 60 * 60 * 24));

  if (expiry <= now) {
    this.status = 'Expired';
  } else if (diffDays <= 7) {
    this.status = 'Critical Expiry';
  } else if (diffDays <= 30) {
    this.status = 'Expiring Soon';
  } else {
    this.status = 'Active';
  }

  if (this.quantity <= 0) {
    this.stockStatus = 'Out of Stock';
  } else if (this.quantity <= 10) {
    this.stockStatus = 'Low Stock';
  } else {
    this.stockStatus = 'In Stock';
  }
};

medicineSchema.pre('save', function (next) {
  computeStatus.call(this);
  next();
});

medicineSchema.pre('findOneAndUpdate', function (next) {
  const update = this.getUpdate();
  if (update) {
    const now = new Date();
    if (update.expiryDate) {
      const expiry = new Date(update.expiryDate);
      const diffDays = Math.ceil((expiry - now) / (1000 * 60 * 60 * 24));
      if (expiry <= now) update.status = 'Expired';
      else if (diffDays <= 7) update.status = 'Critical Expiry';
      else if (diffDays <= 30) update.status = 'Expiring Soon';
      else update.status = 'Active';
    }
    if (typeof update.quantity !== 'undefined') {
      if (update.quantity <= 0) update.stockStatus = 'Out of Stock';
      else if (update.quantity <= 10) update.stockStatus = 'Low Stock';
      else update.stockStatus = 'In Stock';
    }
  }
  next();
});

export default mongoose.model('Medicine', medicineSchema);
