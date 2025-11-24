// server/cleanup/nuclearCleanup.js
// This COMPLETELY resets the cart collection

import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const cleanup = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/bagathsinghfishshop');
    
    console.log('\n🔥🔥🔥 NUCLEAR CLEANUP STARTING 🔥🔥🔥\n');
    
    const db = mongoose.connection;
    const collections = await db.db.listCollections().toArray();
    const cartExists = collections.some(c => c.name === 'carts');
    
    if (cartExists) {
      console.log('🗑️  Dropping entire "carts" collection...');
      await db.collection('carts').drop();
      console.log('✅ Collection "carts" completely deleted\n');
    } else {
      console.log('ℹ️  Collection "carts" does not exist\n');
    }
    
    console.log('✅ Nuclear cleanup complete!');
    console.log('📝 Fresh cart collection will be created on first insert.\n');
    
    await mongoose.connection.close();
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
};

cleanup();