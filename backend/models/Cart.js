// server/models/Cart.js - AMAZON/FLIPKART STYLE

import mongoose from 'mongoose';

const cartSchema = new mongoose.Schema({
  // ONE of these must exist, NEVER both
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  clientId: {
    type: String,
    default: null
  },
  
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  
  totalWeight: {
    type: Number,
    required: true,
    min: 0
  },
  
  unit: {
    type: String,
    enum: ['g', 'kg', 'piece'],
    required: true
  },
  
  productSnapshot: {
    name_en: String,
    name_ta: String,
    price: Number,
    weightValue: Number,
    weightUnit: String,
    baseUnit: String,
    stockQty: Number,
    image: {
      data: String,
      contentType: String
    }
  },
  
  lastModified: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

// 🔥 AMAZON/FLIPKART STYLE INDEXES
// These are sparse so NULL values don't conflict

// For USERS: userId + productId must be unique
cartSchema.index(
  { userId: 1, productId: 1 },
  { 
    unique: true,
    sparse: true,
    partialFilterExpression: { userId: { $ne: null } }
  }
);

// For GUESTS: clientId + productId must be unique
cartSchema.index(
  { clientId: 1, productId: 1 },
  { 
    unique: true,
    sparse: true,
    partialFilterExpression: { clientId: { $ne: null } }
  }
);

// Lookup indexes (fast queries)
cartSchema.index({ userId: 1 }, { sparse: true });
cartSchema.index({ clientId: 1 }, { sparse: true });

export default mongoose.model('Cart', cartSchema);