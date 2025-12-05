// server/utils/telegramNotification.js - UPDATED WITH WHATSAPP LINK

import TelegramBot from 'node-telegram-bot-api';
import User from '../models/User.js';

const bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN, { polling: false });

export const sendOrderNotification = async (order) => {
  try {
    const chatId = process.env.TELEGRAM_CHAT_ID;

    console.log('🔍 Fetching user details...');
    
    const user = await User.findById(order.userId);
    if (!user) {
      console.error('❌ User not found for order:', order._id);
      return false;
    }

    console.log('✅ User found:', user.name || 'N/A', user.mobile);

    // 🔥 Format products list
    let productsText = '';
    order.products.forEach((product, index) => {
      productsText += `\nProduct ${index + 1}:\n`;
      productsText += `Product Name: ${product.name_en}\n`;
      productsText += `Product Quantity: ${product.quantity} ${product.weightUnit}\n`;
      productsText += `Price: Rs ${product.subtotal.toFixed(2)}\n`;
    });

    const paymentStatusText = order.paymentStatus === 'Paid' ? 'Paid' : 'Not Paid';

    const fullAddress = `${order.deliveryAddress.doorNo}, ${order.deliveryAddress.street}, ${order.deliveryAddress.locality}, ${order.deliveryAddress.district}, ${order.deliveryAddress.state}, Pincode: ${order.deliveryAddress.pincode}`;

    const trackUrl = `http://localhost:5173/order-success?orderId=${order._id}`;

  // 🔥 BUILD WHATSAPP MESSAGE TEXT
let whatsappMessage = `
Hi ${order.deliveryAddress.name},

Your order #${order._id} has been placed successfully! ✅

📦 Order Details:
${productsText}

Order Summary:
Total Price for Products: ${order.totalAmount.toFixed(2)} Rs
Delivery: ${order.deliveryCharge.toFixed(2)} Rs
Total: ${order.grandTotal.toFixed(2)} Rs

Payment: ${order.paymentMode}

📍 Address:
${fullAddress}

Your order will be delivered soon!

Track your order:
${trackUrl}

Thank you!😇
`.trim();

// 🔥 URL ENCODE
const encodedWhatsappText = encodeURIComponent(whatsappMessage);

// 🔥 FIXED WHATSAPP LINK
const whatsappLink = `https://api.whatsapp.com/send?phone=${order.deliveryAddress.phone}&text=${encodedWhatsappText}`;

    // 🔥 Telegram message (original — untouched)
    const message = `
🆕 *New Order Received Dude !*

*Order ID:* \`${order._id}\`

*User Name and Number:* ${user.name || 'N/A'}, ${user.mobile}

*Customer Name:* ${order.deliveryAddress.name}
*Customer Number:* ${order.deliveryAddress.phone}

*Payment Mode:* ${order.paymentMode}
*Amount:* ${order.grandTotal.toFixed(2)} Rs.
*Status:* ${paymentStatusText}

*Address:*
${fullAddress}

*Map Link:* ${order.mapLink || 'Not Available'}

━━━━━━ *PRODUCTS* ━━━━━━
${productsText}

*Order Summary:*
Total Price for Products: ${order.totalAmount.toFixed(2)} Rs
Delivery: ${order.deliveryCharge.toFixed(2)} Rs
*Total: ${order.grandTotal.toFixed(2)} Rs*

━━━━━━ *WHATSAPP LINK* ━━━━━━
${whatsappLink}
    `.trim();

    await bot.sendMessage(chatId, message, { parse_mode: 'Markdown' });

    console.log('✅ Telegram notification sent successfully with WhatsApp link for order:', order._id);
    return true;

  } catch (error) {
    console.error('❌ Telegram notification failed:', error.message);
    console.error('Full error:', error);
    return false;
  }
};
