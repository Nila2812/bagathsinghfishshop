import mongoose from 'mongoose';

const deliverySettingSchema = new mongoose.Schema({
  maxDistanceKm: {
    type: Number,
    required: true,
    default: 3
  },
  charges: [{
    minAmount: Number,
    maxAmount: Number,
    charge: Number
  }]
}, { timestamps: true });

export default mongoose.model('DeliverySetting', deliverySettingSchema);