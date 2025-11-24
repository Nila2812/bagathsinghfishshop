import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  // Store order reference from Razorpay
  razorpayOrderId: {
    type: String,
    unique: true,
    sparse: true
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
  
  // Price Breakdown
  totalWeight: Number,
  totalAmount: Number,        // Subtotal
  deliveryCharge: Number,     // Delivery Fee
  grandTotal: Number,         // Total Amount to Pay (totalAmount + deliveryCharge)
  
  // Payment Information
  paymentMode: {
    type: String,
    enum: ['COD', 'Razorpay'],
    required: true
  },
  paymentStatus: {
    type: String,
    enum: ['Pending', 'Paid', 'Failed'],
    default: 'Pending'
  },
  
  // Order Status
  orderStatus: {
    type: String,
    enum: ['Pending', 'Confirmed', 'Processing', 'Shipped', 'Delivered', 'Cancelled'],
    default: 'Pending'
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

export default mongoose.model('Order', orderSchema);