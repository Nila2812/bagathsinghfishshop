// server/routes/orderRoutes.js - COMPLETE WITH BULK UPDATE FEATURE

import express from 'express';
import Razorpay from 'razorpay';
import crypto from 'crypto';
import Order from '../models/Order.js';
import Cart from '../models/Cart.js';
import Product from '../models/Product.js';

const router = express.Router();

// ==========================================
// CREATE ORDER WITH DETAILED STOCK VALIDATION
// ==========================================
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

    // 🔥 DETAILED STOCK VALIDATION WITH PRODUCT NAMES
    const stockErrors = [];
    const productsToUpdate = [];

    for (const item of cartItems) {
      const product = await Product.findById(item.productId || item.productSnapshot?._id);
      
      if (!product) {
        stockErrors.push({
          productName: item.productSnapshot?.name_en || 'Unknown Product',
          error: 'OUT_OF_STOCK',
          message: 'Product not found or has been removed'
        });
        continue;
      }

      if (!product.isAvailable) {
        stockErrors.push({
          productName: product.name_en,
          error: 'OUT_OF_STOCK',
          message: 'Product is currently out of stock'
        });
        continue;
      }

      let requiredStock;
      if (item.unit === 'piece') {
        requiredStock = item.totalWeight;
      } else if (item.unit === 'kg') {
        requiredStock = item.totalWeight;
      } else if (item.unit === 'g') {
        requiredStock = item.totalWeight / 1000;
      }

      if (product.stockQty < requiredStock) {
        stockErrors.push({
          productName: product.name_en,
          error: 'INSUFFICIENT_STOCK',
          message: `Ordered quantity exceeds available stock`,
          orderedQty: `${item.totalWeight}${item.unit}`,
          availableStock: `${product.stockQty}${product.weightUnit === 'piece' ? 'pc' : product.weightUnit}`
        });
        continue;
      }

      productsToUpdate.push({
        productId: product._id,
        reductionAmount: requiredStock
      });
    }

    if (stockErrors.length > 0) {
      return res.status(400).json({ 
        error: 'STOCK_VALIDATION_FAILED', 
        message: 'Some products in your cart have stock issues',
        stockErrors: stockErrors
      });
    }

    const products = cartItems.map((item) => ({
      productId: item.productId || item.productSnapshot?._id,
      name_en: item.productSnapshot?.name_en || 'Product',
      name_ta: item.productSnapshot?.name_ta || 'பொருள்',
      quantity: item.totalWeight || 1,
      weightValue: item.productSnapshot?.weightValue || item.totalWeight,
      weightUnit: item.productSnapshot?.weightUnit || item.unit,
      price: item.productSnapshot?.price || 0,
      subtotal: Number((item.productSnapshot?.price * (item.totalWeight / item.productSnapshot?.weightValue || 1)).toFixed(2)),
    }));

    const mapLink = selectedAddress.lat && selectedAddress.lon 
      ? `https://maps.google.com/?q=${selectedAddress.lat},${selectedAddress.lon}`
      : '';

    let razorpayOrderId = null;
    if (paymentMethod !== 'COD') {
      razorpayOrderId = `mock_order_${Date.now()}`;
    }

    const newOrder = new Order({
      userId: userId,
      razorpayOrderId: razorpayOrderId,
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
      coordinates: {
        lat: selectedAddress.lat,
        lng: selectedAddress.lon
      },
      mapLink: mapLink,
      totalAmount: totalAmount || amount / 100,
      deliveryCharge: deliveryCharge || 0,
      grandTotal: grandTotal || amount / 100,
      paymentMode: paymentMethod === 'COD' ? 'COD' : 'Razorpay',
      paymentStatus: paymentMethod === 'COD' ? 'Pending' : 'Pending',
      orderStatus: 'Placed',
      adminNotified: false,
    });

    await newOrder.save();
    console.log('✅ Order created:', newOrder._id);

    // 🔥 REDUCE STOCK & AUTO-CHECK AVAILABILITY
    for (const update of productsToUpdate) {
      const product = await Product.findById(update.productId);
      const newStock = product.stockQty - update.reductionAmount;
      
      let minRequired;
      if (product.weightUnit === 'piece') {
        minRequired = product.weightValue;
      } else if (product.weightUnit === 'g') {
        minRequired = product.weightValue / 1000;
      } else {
        minRequired = product.weightValue;
      }

      const isStillAvailable = newStock >= minRequired;

      await Product.findByIdAndUpdate(
        update.productId,
        { 
          $inc: { stockQty: -update.reductionAmount },
          isAvailable: isStillAvailable
        }
      );
      
      console.log(`📦 Stock reduced for ${update.productId}: -${update.reductionAmount} (Available: ${isStillAvailable})`);
      
      if (!isStillAvailable) {
        await Cart.deleteMany({ productId: update.productId });
        console.log(`🗑️ Removed unavailable product ${update.productId} from all carts`);
      }
    }

    await Cart.deleteMany({ userId: userId });
    console.log('🗑️ User cart cleared');

    res.json({
      success: true,
      razorpayOrderId: razorpayOrderId,
      orderId: newOrder._id,
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

// ==========================================
// 🔥 NEW: VALIDATE CART STOCK BEFORE CHECKOUT
// ==========================================
router.post('/validate-cart-stock', async (req, res) => {
  try {
    const { cartItems } = req.body;

    if (!cartItems || cartItems.length === 0) {
      return res.json({ 
        valid: true,
        stockErrors: []
      });
    }

    const stockErrors = [];

    for (const item of cartItems) {
      const product = await Product.findById(item.productId?._id || item.productId);
      
      if (!product) {
        stockErrors.push({
          cartItemId: item._id,
          productName: item.productSnapshot?.name_en || 'Unknown Product',
          error: 'OUT_OF_STOCK',
          message: 'Product not found. Remove from cart to proceed.'
        });
        continue;
      }

      if (!product.isAvailable) {
        stockErrors.push({
          cartItemId: item._id,
          productName: product.name_en,
          error: 'OUT_OF_STOCK',
          message: 'Product is out of stock. Remove from cart to proceed.'
        });
        continue;
      }

      let requiredStock;
      if (item.unit === 'piece') {
        requiredStock = item.totalWeight;
      } else if (item.unit === 'kg') {
        requiredStock = item.totalWeight;
      } else if (item.unit === 'g') {
        requiredStock = item.totalWeight / 1000;
      }

      if (product.stockQty < requiredStock) {
        stockErrors.push({
          cartItemId: item._id,
          productName: product.name_en,
          error: 'INSUFFICIENT_STOCK',
          message: ` "refresh your site and try again" Only ${product.stockQty}${product.weightUnit === 'piece' ? 'pc' : product.weightUnit} available in stock`,
          orderedQty: `${item.totalWeight}${item.unit}`,
          availableStock: `${product.stockQty}${product.weightUnit === 'piece' ? 'pc' : product.weightUnit}`
        });
      }
    }

    res.json({
      valid: stockErrors.length === 0,
      stockErrors: stockErrors
    });

  } catch (error) {
    console.error('Cart validation error:', error);
    res.status(500).json({
      error: 'Failed to validate cart',
      message: error.message
    });
  }
});

// ==========================================
// GET ORDER BY ID
// ==========================================
router.get('/:orderId', async (req, res) => {
  try {
    const order = await Order.findById(req.params.orderId).populate('userId', 'name mobile email');
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }
    res.json(order);
  } catch (error) {
    console.error('Error fetching order:', error);
    res.status(500).json({ error: 'Failed to fetch order' });
  }
});

// ==========================================
// GET USER ORDERS
// ==========================================
router.get('/user/:userId', async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.params.userId })
      .sort({ createdAt: -1 })
      .limit(50);
    res.json(orders);
  } catch (error) {
    console.error('Error fetching user orders:', error);
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
});

// ==========================================
// GET ORDER COUNTS
// ==========================================
router.get("/admin/counts", async (req, res) => {
  try {
    const pendingOrders = await Order.countDocuments({
      orderStatus: { $nin: ['Delivered', 'Cancelled'] },
      paymentStatus: { $ne: 'Refunded' }
    });

    const pendingRefunds = await Order.countDocuments({
      orderStatus: 'Cancelled',
      paymentStatus: 'Paid'
    });

    const deliveredCount = await Order.countDocuments({ orderStatus: 'Delivered' });

    const cancelledCount = await Order.countDocuments({
      orderStatus: 'Cancelled',
      paymentStatus: { $ne: 'Paid' }
    });

    res.json({ 
      pendingOrders,
      pendingRefunds, 
      delivered: deliveredCount,
      cancelled: cancelledCount,
      pending: pendingOrders
    });
  } catch (error) {
    console.error("Error fetching order counts:", error);
    res.status(500).json({ error: "Failed to fetch order counts" });
  }
});

// ==========================================
// GET ALL ORDERS
// ==========================================
router.get("/admin/all", async (req, res) => {
  try {
    const { status } = req.query;
    
    let query = {};
    
    if (status === 'pending') {
      query = {
        orderStatus: { $nin: ['Delivered', 'Cancelled'] },
        paymentStatus: { $ne: 'Refunded' }
      };
    } else if (status && status !== 'all') {
      query.orderStatus = status;
    }

    const orders = await Order.find(query)
      .populate('userId', 'name mobile email')
      .sort({ createdAt: -1 })
      .limit(100);

    res.json(orders);
  } catch (error) {
    console.error("Error fetching all orders:", error);
    res.status(500).json({ error: "Failed to fetch orders" });
  }
});

// ==========================================
// UPDATE PAYMENT STATUS
// ==========================================
router.put('/:orderId/payment-status', async (req, res) => {
  try {
    const { paymentStatus } = req.body;

    if (!paymentStatus) {
      return res.status(400).json({ error: 'Payment status is required' });
    }

    const validPaymentStatuses = ['Pending', 'Paid', 'Refunded'];
    if (!validPaymentStatuses.includes(paymentStatus)) {
      return res.status(400).json({ error: 'Invalid payment status' });
    }

    const updatedOrder = await Order.findByIdAndUpdate(
      req.params.orderId,
      { paymentStatus: paymentStatus, updatedAt: new Date() },
      { new: true }
    );

    if (!updatedOrder) {
      return res.status(404).json({ error: 'Order not found' });
    }

    console.log(`✅ Payment status updated: ${req.params.orderId} → ${paymentStatus}`);

    res.json({
      success: true,
      message: 'Payment status updated',
      order: updatedOrder,
    });
  } catch (error) {
    console.error('Error updating payment status:', error);
    res.status(500).json({ error: 'Failed to update payment status' });
  }
});

// ==========================================
// UPDATE ORDER STATUS
// ==========================================
router.put('/:orderId/status', async (req, res) => {
  try {
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({ error: 'Status is required' });
    }

    const validStatuses = ['Placed', 'Packed', 'Shipped', 'Delivered', 'Cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const order = await Order.findById(req.params.orderId);
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    const updateData = { 
      orderStatus: status, 
      updatedAt: new Date() 
    };

    if (status === 'Delivered' && order.paymentMode === 'COD' && order.paymentStatus === 'Pending') {
      updateData.paymentStatus = 'Paid';
      console.log(`💰 Auto-updated payment to Paid for COD order: ${req.params.orderId}`);
    }

    const updatedOrder = await Order.findByIdAndUpdate(
      req.params.orderId,
      updateData,
      { new: true }
    );

    console.log(`✅ Order status updated: ${req.params.orderId} → ${status}`);

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

// ==========================================
// 🔥 NEW: BULK UPDATE ORDERS
// ==========================================
router.post('/admin/bulk-update', async (req, res) => {
  try {
    const { orderIds, action } = req.body;

    if (!orderIds || !Array.isArray(orderIds) || orderIds.length === 0) {
      return res.status(400).json({ error: 'Order IDs are required' });
    }

    if (!action || !['deliver', 'refund'].includes(action)) {
      return res.status(400).json({ error: 'Invalid action' });
    }

    let updateResult;

    if (action === 'deliver') {
      // Mark all as Delivered + auto-set Paid for COD orders
      const orders = await Order.find({ _id: { $in: orderIds } });
      
      for (const order of orders) {
        const updateData = { 
          orderStatus: 'Delivered',
          updatedAt: new Date()
        };
        
        // Auto-set payment to Paid for COD orders
        if (order.paymentMode === 'COD' && order.paymentStatus === 'Pending') {
          updateData.paymentStatus = 'Paid';
        }
        
        await Order.findByIdAndUpdate(order._id, updateData);
      }
      
      updateResult = { modifiedCount: orders.length };
      console.log(`✅ Bulk delivered ${orders.length} orders`);
      
    } else if (action === 'refund') {
      // Mark all as Refunded
      updateResult = await Order.updateMany(
        { _id: { $in: orderIds } },
        { 
          paymentStatus: 'Refunded',
          updatedAt: new Date()
        }
      );
      console.log(`💰 Bulk refunded ${updateResult.modifiedCount} orders`);
    }

    res.json({
      success: true,
      message: `Successfully updated ${updateResult.modifiedCount} orders`,
      modifiedCount: updateResult.modifiedCount
    });

  } catch (error) {
    console.error('Bulk update error:', error);
    res.status(500).json({ error: 'Failed to bulk update orders' });
  }
});

// ==========================================
// VERIFY PAYMENT
// ==========================================
router.post('/verify', async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, orderId } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({
        success: false,
        message: 'Missing payment verification data',
      });
    }

    const body = razorpay_order_id + '|' + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest('hex');

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({
        success: false,
        message: 'Payment signature verification failed',
      });
    }

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

export default router;