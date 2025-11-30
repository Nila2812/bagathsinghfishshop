import express from "express";
import multer from "multer";

import {
  getAllProducts,
  getProductsByCategory,
  searchProducts,
  addProduct,
  getProductById, 
  updateProduct,
  deleteProduct,
  viewAllProducts,
} from "../controllers/productController.js";

const router = express.Router();

const storage = multer.memoryStorage();
const upload = multer({ storage });

// ⚠️ CRITICAL: Order matters! Specific routes BEFORE dynamic routes

// 1. Search and view routes (most specific)
router.get("/search", searchProducts);
router.get("/view-products", viewAllProducts);
router.get("/by-category/:id", getProductsByCategory);

// 2. Root route (before /:id to avoid conflict)
router.get("/", getAllProducts);

// 3. POST route
router.post("/add", upload.single("image"), addProduct);
router.put("/:id", upload.single("image"), updateProduct);
// 4. Dynamic :id routes (MUST come after all specific routes)
router.get("/:id", getProductById);

router.delete("/:id", deleteProduct);

export default router;