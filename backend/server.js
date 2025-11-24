import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./config/db.js";
import productRoutes from './routes/productRoutes.js';
import categoryRoutes from './routes/categoryRoutes.js';
import offerRoutes from './routes/offerRoutes.js';
import dashboardRoutes from "./routes/dashboardroutes.js";
import systemRoutes from "./routes/systemroutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import cartRoutes from "./routes/cartRoutes.js";
import addressRoutes from "./routes/address.js";
import authRoutes from "./routes/authRoutes.js";
import orderRoutes from './routes/orderRoutes.js';

// Load environment variables
dotenv.config();

// Initialize express
const app = express();

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Static file serving
app.use('/uploads', express.static('uploads'));

// MongoDB connection
connectDB();
app.use('/api/orders', orderRoutes);
app.use('/api/products', productRoutes);
app.use('/api/category', categoryRoutes);
app.use('/api/offers', offerRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/admins", adminRoutes);
app.use("/api/system", systemRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/address", addressRoutes);
app.use("/api/auth", authRoutes);

// Basic test route
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to Bagath Singh Fish Shop API' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

// Route not found handler
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📚 API docs available at http://localhost:${PORT}`);
});