import mongoose from 'mongoose';

const auditLogSchema = new mongoose.Schema(
  {
    // canonical fields
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    userName: { type: String, trim: true, default: '' },
    action: { type: String, required: true, trim: true },
    module: { type: String, trim: true, index: true },
    description: { type: String, trim: true, default: '' },

    // backward-compatible fields used in existing code
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    details: { type: String, trim: true }
  },
  { timestamps: true }
);

// keep legacy virtuals for convenience
auditLogSchema.virtual('displayDescription').get(function () {
  return this.description || this.details || '';
});

export default mongoose.model('AuditLog', auditLogSchema);
