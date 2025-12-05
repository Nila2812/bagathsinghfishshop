// server/routes/whatsappRoutes.js - SHORT LINK HANDLER

import express from 'express';
import Order from '../models/Order.js';

const router = express.Router();

// 🔥 GENERATE SHORT WHATSAPP LINK
router.get('/wa/:orderId', async (req, res) => {
  try {
    const order = await Order.findById(req.params.orderId);
    
    if (!order) {
      return res.status(404).send('Order not found');
    }

    // 🔥 BUILD WHATSAPP MESSAGE
    let productsText = '';
    order.products.forEach((product, index) => {
      productsText += `\n${index + 1}. ${product.name_en}\n`;
      productsText += `   Qty: ${product.quantity} ${product.weightUnit}\n`;
      productsText += `   Price: ₹${product.subtotal.toFixed(2)}\n`;
    });

    const fullAddress = `${order.deliveryAddress.doorNo}, ${order.deliveryAddress.street}, ${order.deliveryAddress.locality}, ${order.deliveryAddress.district}, ${order.deliveryAddress.state} - ${order.deliveryAddress.pincode}`;

    const trackUrl = `http://localhost:5173/order-success?orderId=${order._id}`;

    const whatsappMessage = `
Hi ${order.deliveryAddress.name},

Your order #${order._id.toString().slice(-6)} has been placed successfully! ✅

📦 *Order Details:*
${productsText}

💰 *Order Summary:*
Products Total: ₹${order.totalAmount.toFixed(2)}
Delivery Charge: ₹${order.deliveryCharge.toFixed(2)}
*Grand Total: ₹${order.grandTotal.toFixed(2)}*

💳 Payment: ${order.paymentMode}

📍 *Delivery Address:*
${fullAddress}

📱 Track your order: ${trackUrl}

Thank you for shopping with us! 😊
    `.trim();

    const encodedText = encodeURIComponent(whatsappMessage);
    const whatsappUrl = `https://api.whatsapp.com/send?phone=${order.deliveryAddress.phone}&text=${encodedText}`;

    // 🔥 REDIRECT TO WHATSAPP
    res.redirect(whatsappUrl);

  } catch (error) {
    console.error('WhatsApp link error:', error);
    res.status(500).send('Error generating WhatsApp link');
  }
});

export default router;