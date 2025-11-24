import express from 'express';
import Razorpay from 'razorpay';
import crypto from 'crypto';
import Order from '../models/Order.js';
import Cart from '../models/Cart.js';

const router = express.Router();

// Initialize Razorpay
// const razorpay = new Razorpay({
//   key_id: process.env.RAZORPAY_KEY_ID,
//   key_secret: process.env.RAZORPAY_KEY_SECRET,
// });

// CREATE ORDER
router.post('/create', async (req, res) => {
  try {
    const {
      userId,
      amount,
      currency,
      cartItems,
      selectedAddress,
      paymentMethod,
      totalAmount,
      deliveryCharge,
      grandTotal,
    } = req.body;

    // Validation
    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }

    if (!amount || amount <= 0) {
      return res.status(400).json({ error: 'Invalid amount' });
    }

    if (!selectedAddress || !selectedAddress.phone) {
      return res.status(400).json({ error: 'Delivery address is required' });
    }

    if (!cartItems || cartItems.length === 0) {
      return res.status(400).json({ error: 'Cart is empty' });
    }

    // Create Razorpay order
    const razorpayOrder = await razorpay.orders.create({
      amount: amount, // Amount in paise (already converted from frontend)
      currency: currency || 'INR',
      receipt: `receipt_${Date.now()}`,
      payment_capture: 1,
    });

    console.log('Razorpay order created:', razorpayOrder.id);

    // Transform cart items to match order schema
    const products = cartItems.map((item) => ({
      productId: item.productId || item.productSnapshot?._id,
      name_en: item.productSnapshot?.name_en || 'Product',
      name_ta: item.productSnapshot?.name_ta || 'பொருள்',
      quantity: item.quantity || 1,
      weightValue: item.productSnapshot?.weightValue || item.totalWeight,
      weightUnit: item.productSnapshot?.weightUnit || item.unit,
      price: item.productSnapshot?.price || 0,
      subtotal: Number((item.productSnapshot?.price * (item.quantity || 1)).toFixed(2)),
    }));

    // Create order document
    const newOrder = new Order({
      userId: userId,
      razorpayOrderId: razorpayOrder.id,
      products: products,
      deliveryAddress: {
        name: selectedAddress.name,
        phone: selectedAddress.phone,
        doorNo: selectedAddress.doorNo,
        street: selectedAddress.street,
        locality: selectedAddress.locality,
        district: selectedAddress.district,
        state: selectedAddress.state,
        pincode: selectedAddress.pincode,
        isDefault: selectedAddress.isDefault || false,
        saveAs: selectedAddress.saveAs,
      },
      totalWeight: cartItems.reduce((sum, item) => sum + (item.totalWeight || 0), 0),
      totalAmount: totalAmount || amount / 100, // Subtotal
      deliveryCharge: deliveryCharge || 0,
      grandTotal: grandTotal || amount / 100,
      paymentMode: paymentMethod === 'COD' ? 'COD' : 'Razorpay',
      paymentStatus: 'Pending',
      orderStatus: 'Pending',
      adminNotified: false,
    });

    // Save order to database
    await newOrder.save();
    console.log('Order saved to database:', newOrder._id);

    res.json({
      success: true,
      razorpayOrderId: razorpayOrder.id,
      _id: newOrder._id,
      message: 'Order created successfully',
    });
  } catch (error) {
    console.error('Order creation error:', error);
    res.status(500).json({
      error: 'Failed to create order',
      message: error.message,
    });
  }
});

// VERIFY PAYMENT
router.post('/verify', async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, orderId } = req.body;

    // Validation
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({
        success: false,
        message: 'Missing payment verification data',
      });
    }

    // Verify signature
    const body = razorpay_order_id + '|' + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest('hex');

    if (expectedSignature !== razorpay_signature) {
      console.log('Signature mismatch');
      return res.status(400).json({
        success: false,
        message: 'Payment signature verification failed',
      });
    }

    console.log('Signature verified successfully');

    // Update order in database
    const updatedOrder = await Order.findByIdAndUpdate(
      orderId,
      {
        razorpayPaymentId: razorpay_payment_id,
        razorpaySignature: razorpay_signature,
        paymentStatus: 'Paid',
        orderStatus: 'Confirmed',
        updatedAt: new Date(),
      },
      { new: true }
    );

    if (!updatedOrder) {
      return res.status(404).json({
        success: false,
        message: 'Order not found',
      });
    }

    console.log('Order updated:', updatedOrder._id);

    // Optional: Clear user's cart after successful payment
    try {
      await Cart.deleteOne({ userId: updatedOrder.userId });
      console.log('Cart cleared for user:', updatedOrder.userId);
    } catch (cartError) {
      console.log('Could not clear cart:', cartError.message);
    }

    // Populate user details for response
    await updatedOrder.populate('userId');

    res.json({
      success: true,
      message: 'Payment verified and order confirmed',
      orderId: updatedOrder._id,
      razorpayOrderId: razorpay_order_id,
    });
  } catch (error) {
    console.error('Payment verification error:', error);
    res.status(500).json({
      success: false,
      error: 'Payment verification failed',
      message: error.message,
    });
  }
});

// GET ORDER BY ID
router.get('/:orderId', async (req, res) => {
  try {
    const order = await Order.findById(req.params.orderId).populate('userId');

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    res.json(order);
  } catch (error) {
    console.error('Error fetching order:', error);
    res.status(500).json({ error: 'Failed to fetch order' });
  }
});

// GET USER ORDERS
router.get('/user/:userId', async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.params.userId })
      .sort({ createdAt: -1 })
      .limit(20);

    res.json(orders);
  } catch (error) {
    console.error('Error fetching user orders:', error);
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
});

// GET ALL ORDERS (Admin)
router.get('/admin/all', async (req, res) => {
  try {
    const orders = await Order.find()
      .populate('userId', 'name email phone')
      .sort({ createdAt: -1 })
      .limit(50);

    res.json(orders);
  } catch (error) {
    console.error('Error fetching all orders:', error);
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
});

// UPDATE ORDER STATUS (Admin)
router.put('/:orderId/status', async (req, res) => {
  try {
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({ error: 'Status is required' });
    }

    const validStatuses = ['Pending', 'Confirmed', 'Processing', 'Shipped', 'Delivered', 'Cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const updatedOrder = await Order.findByIdAndUpdate(
      req.params.orderId,
      { orderStatus: status, updatedAt: new Date() },
      { new: true }
    );

    if (!updatedOrder) {
      return res.status(404).json({ error: 'Order not found' });
    }

    res.json({
      success: true,
      message: 'Order status updated',
      order: updatedOrder,
    });
  } catch (error) {
    console.error('Error updating order status:', error);
    res.status(500).json({ error: 'Failed to update order status' });
  }
});

export default router;