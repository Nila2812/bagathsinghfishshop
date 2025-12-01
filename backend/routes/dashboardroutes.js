// server/routes/dashboardRoutes.js - UPDATED WITH ALL DASHBOARD REQUIREMENTS

import express from "express";
import Product from "../models/Product.js";
import Offer from "../models/Offer.js";
import Category from "../models/Category.js";
import Order from "../models/Order.js";
import User from "../models/User.js";

const router = express.Router();

// 🔥 #7: GET DASHBOARD STATS (NOW INCLUDES CUSTOMERS COUNT)
router.get("/stats", async (req, res) => {
  try {
    const [products, offers, categories, orders, customers] = await Promise.all([
      Product.countDocuments(),
      Offer.countDocuments(),
      Category.countDocuments(),
      Order.countDocuments(),
      User.countDocuments(), // 🔥 #7: Added customers count
    ]);

    res.json({ 
      products, 
      offers, 
      categories, 
      orders, 
      customers // 🔥 #7: Return customers count
    });
  } catch (err) {
    console.error("Dashboard stats error:", err);
    res.status(500).json({ error: "Failed to fetch dashboard stats" });
  }
});

router.get("/low-stock", async (req, res) => {
  try {
    const lowStockProducts = await Product.find({ stockQty: { $lt: 10 } })
      .select("name_en stockQty")
      .sort({ stockQty: 1 });

    res.json(lowStockProducts);
  } catch (err) {
    console.error("Low stock fetch error:", err);
    res.status(500).json({ error: "Failed to fetch low stock products" });
  }
});

// 🔥 #8: UPDATED ORDER SUMMARY - PENDING ORDERS, PENDING REFUNDS, DELIVERED, CANCELLED
router.get("/order-summary", async (req, res) => {
  try {
    // 🔥 PENDING ORDERS: All except Delivered and Cancelled
    const pendingOrders = await Order.countDocuments({
      orderStatus: { $nin: ['Delivered', 'Cancelled'] },
      paymentStatus: { $ne: 'Refunded' }
    });

    // 🔥 PENDING REFUNDS: Cancelled + Paid
    const pendingRefunds = await Order.countDocuments({
      orderStatus: 'Cancelled',
      paymentStatus: 'Paid'
    });

    // ✅ DELIVERED
    const delivered = await Order.countDocuments({ 
      orderStatus: 'Delivered' 
    });

    // 🔥 #8: CANCELLED (orders cancelled but NOT pending refund)
    const cancelled = await Order.countDocuments({
      orderStatus: 'Cancelled',
      paymentStatus: { $ne: 'Paid' }
    });

    res.json({ 
      pendingOrders, 
      pendingRefunds, 
      delivered,
      cancelled // 🔥 #8: Added cancelled count
    });
  } catch (err) {
    console.error("Order summary error:", err);
    res.status(500).json({ error: "Failed to fetch order summary" });
  }
});

// 🔥 #9: TOP 5 CUSTOMERS BY ORDER COUNT
router.get("/top-customers", async (req, res) => {
  try {
    const topCustomers = await Order.aggregate([
      {
        $group: {
          _id: "$userId",
          orderCount: { $sum: 1 },
          totalSpent: { $sum: "$grandTotal" }
        }
      },
      { $sort: { orderCount: -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "userDetails"
        }
      },
      { $unwind: "$userDetails" }
    ]);

    const formatted = topCustomers.map(customer => ({
      userId: customer._id,
      name: customer.userDetails.name || "Unknown",
      phone: customer.userDetails.mobile,
      orderCount: customer.orderCount,
      totalSpent: customer.totalSpent.toFixed(2)
    }));

    res.json(formatted);
  } catch (err) {
    console.error("Top customers fetch error:", err);
    res.status(500).json({ error: "Failed to fetch top customers" });
  }
});

export default router;