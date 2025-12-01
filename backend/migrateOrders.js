// server/scripts/migrateOrders.js
// Run this ONCE to fix existing orders in database

import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const migrateOrders = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    const db = mongoose.connection.db;
    const ordersCollection = db.collection('orders');

    // 1. Drop the unique index on razorpayOrderId
    try {
      await ordersCollection.dropIndex('razorpayOrderId_1');
      console.log('✅ Dropped unique index on razorpayOrderId');
    } catch (err) {
      console.log('ℹ️  Index does not exist or already dropped');
    }

    // 2. Create sparse index (allows multiple nulls)
    await ordersCollection.createIndex(
      { razorpayOrderId: 1 },
      { sparse: true }
    );
    console.log('✅ Created sparse index on razorpayOrderId');

    // 3. Update all existing orders with old status names
    const statusMapping = {
      'Pending': 'Placed',
      'Confirmed': 'Placed',
      'Processing': 'Packed',
    };

    for (const [oldStatus, newStatus] of Object.entries(statusMapping)) {
      const result = await ordersCollection.updateMany(
        { orderStatus: oldStatus },
        { $set: { orderStatus: newStatus } }
      );
      console.log(`✅ Updated ${result.modifiedCount} orders from "${oldStatus}" to "${newStatus}"`);
    }

    // 4. Remove totalWeight field from all orders
    const removeResult = await ordersCollection.updateMany(
      {},
      { $unset: { totalWeight: "" } }
    );
    console.log(`✅ Removed totalWeight field from ${removeResult.modifiedCount} orders`);

    console.log('\n🎉 Migration completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
};

migrateOrders();