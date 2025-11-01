import express from "express";
import Product from "../models/Product.js";
import Offer from "../models/Offer.js";
import Category from "../models/Category.js";
//import Customer from "../models/customer.js";
import Order from "../models/Order.js";

const router = express.Router();

router.get("/stats", async (req, res) => {
  try {
    const [products, offers, categories, customers, orders] = await Promise.all([
      Product.countDocuments(),
      Offer.countDocuments(),
      Category.countDocuments(),
      //Customer.countDocuments(),
      Order.countDocuments(),
    ]);

    res.json({ products, offers, categories, customers, orders });
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




router.get("/order-summary", async (req, res) => {
  try {
    const [pending, delivered, cancelled] = await Promise.all([
      Order.countDocuments({ status: "Pending" }),
      Order.countDocuments({ status: "Delivered" }),
      Order.countDocuments({ status: "Cancelled" }),
    ]);

    res.json({ pending, delivered, cancelled });
  } catch (err) {
    console.error("Order summary error:", err);
    res.status(500).json({ error: "Failed to fetch order summary" });
  }
});



export default router;