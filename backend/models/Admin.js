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
  
}, {
  timestamps: true // ✅ keeps createdAt and updatedAt
});

export default mongoose.model('Admin', adminSchema);
