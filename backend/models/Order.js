import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  products: [{
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product'
    },
    name_en: String,
    name_ta: String,
    quantity: Number,
    weightValue: Number,
    weightUnit: String,
    price: Number,
    subtotal: Number
  }],
  totalWeight: Number,
  totalAmount: Number,
  deliveryCharge: Number,
  grandTotal: Number,
  paymentMode: {
    type: String,
    enum: ['COD', 'Razorpay'],
    required: true
  },
  paymentStatus: {
    type: String,
    enum: ['Paid', 'Pending'],
    default: 'Pending'
  },
  deliveryAddress: String,
  coordinates: {
    lat: Number,
    lng: Number
  },
  mapLink: String,
  orderStatus: {
    type: String,
    enum: ['Pending', 'Confirmed', 'Delivered'],
    default: 'Pending'
  },
  adminNotified: {
    type: Boolean,
    default: false
  }
}, { timestamps: true });

export default mongoose.model('Order', orderSchema);