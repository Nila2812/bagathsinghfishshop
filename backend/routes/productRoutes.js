import express from "express";
import multer from "multer";

import {
  getAllProducts,
  getProductsByCategory,
  searchProducts,
  addProduct,
  updateProduct,
  deleteProduct,
  viewAllProducts,
} from "../controllers/productController.js";

const router = express.Router();

// Multer storage
const storage = multer.memoryStorage();
const upload = multer({ storage });

// GET routes
router.get("/search", searchProducts);
router.get("/by-category/:id", getProductsByCategory);
router.get("/", getAllProducts);

// POST - Add product
router.post("/add", upload.single("image"), addProduct);

// PUT - Update product
router.put("/:id", upload.single("image"), updateProduct);

// DELETE - Delete product
router.delete("/:id", deleteProduct);

// VIEW ALL PRODUCTS (with parent & subcategory)
router.get("/view-products", viewAllProducts);

export default router;
