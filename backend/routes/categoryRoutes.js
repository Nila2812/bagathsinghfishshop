// routes/categoryRoutes.js
import express from "express";
import multer from "multer";
import {
  addCategory,
  getAllCategories,
  deleteCategory,
  updateCategory,
  getCategoryById,
} from "../controllers/categoryController.js";

const router = express.Router();

// Multer setup
const storage = multer.memoryStorage();
const upload = multer({ storage });

// Routes
router.post("/add", upload.single("image"), addCategory);
router.get("/", getAllCategories);

// ✅ GET single category
router.get("/:id", getCategoryById);
router.delete("/:id", deleteCategory);
router.put("/:id", upload.single("image"), updateCategory);

export default router;
