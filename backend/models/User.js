import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  phone: { 
    type: String, 
    required: true,
    unique: true 
  },
  name: { 
    type: String, 
    default: "User" 
  },
  address: String,
  mapLink: String,
  coordinates: {
    lat: Number,
    lng: Number
  },
  firebaseUid: {
    type: String,
    required: true,
    unique: true
  }
}, { timestamps: true });

export default mongoose.model('User', userSchema);