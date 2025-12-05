// server/test-telegram.js - TEST FILE

import TelegramBot from 'node-telegram-bot-api';
import dotenv from 'dotenv';

dotenv.config();

const bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN, { polling: false });
const chatId = process.env.TELEGRAM_CHAT_ID;

console.log('Bot Token:', process.env.TELEGRAM_BOT_TOKEN ? '✅ Found' : '❌ Missing');
console.log('Chat ID:', process.env.TELEGRAM_CHAT_ID ? '✅ Found' : '❌ Missing');

async function testTelegram() {
  try {
    const message = `
🧪 *TEST MESSAGE*

This is a test from your server!
If you see this, Telegram integration is working! ✅

Time: ${new Date().toLocaleString('en-IN')}
    `;

    await bot.sendMessage(chatId, message, { parse_mode: 'Markdown' });
    console.log('✅ Test message sent successfully!');
  } catch (error) {
    console.error('❌ Error sending test message:', error.message);
    console.error('Full error:', error);
  }
}

testTelegram();