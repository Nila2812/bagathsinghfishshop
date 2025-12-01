// server/models/Order.js - FIXED

import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  // 🔥 FIX: Remove unique constraint, allow sparse index
  razorpayOrderId: {
    type: String,
    sparse: true  // Allows multiple null values
  },
  razorpayPaymentId: String,
  razorpaySignature: String,
  
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
  
  // Delivery Address Details
  deliveryAddress: {
    name: String,
    phone: String,
    doorNo: String,
    street: String,
    locality: String,
    district: String,
    state: String,
    pincode: String,
    isDefault: Boolean,
    saveAs: String
  },
  
  coordinates: {
    lat: Number,
    lng: Number
  },
  mapLink: String,
  
  // 🔥 FIX: Remove totalWeight (not needed, just sum products)
  
  // Price Breakdown
  totalAmount: Number,        // Subtotal
  deliveryCharge: Number,     // Delivery Fee
  grandTotal: Number,         // Total Amount to Pay
  
  // Payment Information
  paymentMode: {
    type: String,
    enum: ['COD', 'Razorpay'],
    required: true
  },
  paymentStatus: {
    type: String,
    enum: ['Pending', 'Paid', 'Refunded'],  // 🔥 CHANGED: Only 3 statuses
    default: 'Pending'
  },
  
  // Order Status
  orderStatus: {
    type: String,
    enum: ['Placed', 'Packed', 'Shipped', 'Delivered', 'Cancelled'],  // 🔥 CHANGED: Simplified
    default: 'Placed'
  },
  
  // Admin Notification
  adminNotified: {
    type: Boolean,
    default: false
  },
  
  // Timestamps
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

// 🔥 Create sparse index to allow multiple null values
orderSchema.index({ razorpayOrderId: 1 }, { sparse: true });

export default mongoose.model('Order', orderSchema);