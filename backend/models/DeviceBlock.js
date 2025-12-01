// server/models/DeviceBlock.js - NEW MODEL FOR IP BLOCKING

import mongoose from 'mongoose';

const deviceBlockSchema = new mongoose.Schema({
  ipAddress: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  resendCount: {
    type: Number,
    default: 0
  },
  blockedUntil: {
    type: Date,
    default: null
  },
  lastAttempt: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

// Auto-cleanup expired blocks using MongoDB TTL index
deviceBlockSchema.index({ blockedUntil: 1 }, { 
  expireAfterSeconds: 0,
  partialFilterExpression: { blockedUntil: { $exists: true } }
});

export default mongoose.model('DeviceBlock', deviceBlockSchema);