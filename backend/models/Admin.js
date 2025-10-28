import mongoose from 'mongoose';

const adminSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  shopName: String,
  address: String,
  phone: String,
  whatsappNumber: String,
  coordinates: {
    lat: Number,
    lng: Number
  },
  razorpayKey: String,
  razorpaySecret: String,
  whatsappAccessToken: String,
  googleApiKey: String
}, { timestamps: true });

export default mongoose.model('Admin', adminSchema);