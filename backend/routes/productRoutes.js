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
  getSingleProduct,
} from "../controllers/productController.js";

const router = express.Router();

const storage = multer.memoryStorage();
const upload = multer({ storage });

// ⚠️ CRITICAL: Order matters! Specific routes BEFORE dynamic routes

// 1. GET routes with specific paths (most specific first)
router.get("/search", searchProducts);
router.get("/view-products", viewAllProducts);
router.get("/by-category/:id", getProductsByCategory);
router.get("/single/:id", getSingleProduct);
router.get("/", getAllProducts);

// 2. POST route
router.post("/add", upload.single("image"), addProduct);

// 3. PUT route (MUST come before GET /:id)
router.put("/:id", upload.single("image"), updateProduct);

// 4. DELETE route (MUST come before GET /:id)
router.delete("/:id", deleteProduct);

// 5. Dynamic GET /:id route (MUST be LAST)
router.get("/:id", getProductById);

export default router;