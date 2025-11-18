import mongoose from 'mongoose';

const cartSchema = new mongoose.Schema({
  sessionId: {
    type: String,
    required: true,
    index: true
  },
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  // Store actual weight/pieces added (not simple quantity)
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
  // Store product snapshot for faster access
  productSnapshot: {
    name_en: String,
    name_ta: String,
    price: Number,
    weightValue: Number,
    weightUnit: String,
    minOrderValue: Number,
    minOrderUnit: String,
    baseUnit: String,
    image: {
      data: String, // base64
      contentType: String
    }
  }
}, { timestamps: true });

// Compound index to prevent duplicate products for same session
cartSchema.index({ sessionId: 1, productId: 1 }, { unique: true });

export default mongoose.model('Cart', cartSchema);