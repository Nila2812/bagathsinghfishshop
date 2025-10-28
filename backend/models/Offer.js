import mongoose from 'mongoose';

const offerSchema = new mongoose.Schema({
  title_en: {
    type: String,
    required: true
  },
  title_ta: {
    type: String,
    required: true
  },
  description_en: String,
  description_ta: String,
  discountPercent: {
    type: Number,
    required: true
  },
  productIds: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product'
  }],
  startDate: Date,
  endDate: Date,
  isActive: {
    type: Boolean,
    default: true
  }
}, { timestamps: true });

export default mongoose.model('Offer', offerSchema);