import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
  categoryId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: true
  },
  name_en: {
    type: String,
    required: true
  },
  name_ta: {
    type: String,
    required: true
  },
  image: {
    data: Buffer,
    contentType: String
  },
  price: {
    type: Number,
    required: true
  },
  weightValue: {
    type: Number,
    required: true
  },
  weightUnit: {
    type: String,
    enum: ['g', 'kg', 'piece'],
    required: true
  },

  // ✅ New fields
  minOrderValue: {
    type: Number,
    required: true
  },
  minOrderUnit: {
    type: String,
    enum: ['g', 'kg', 'piece'],
    required: true
  },
  baseUnit: {
  type: String,
  enum: ['250g', '500g', '1kg', 'piece'],
  required: true
},
  stockQty: {
    type: Number,
    required: true
  },
  isAvailable: {
    type: Boolean,
    default: true
  }
}, { timestamps: true });

export default mongoose.model('Product', productSchema);
