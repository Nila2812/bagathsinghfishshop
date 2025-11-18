import express from "express";
import multer from "multer";
import Product from "../models/Product.js";
import Category from "../models/Category.js";
import { getProductsByCategory } from "../controllers/productController.js";

const router = express.Router();
const storage = multer.memoryStorage();
const upload = multer({ storage });

// Add a product
router.post("/add", upload.single("image"), async (req, res) => {
  try {
    const {
      categoryId,
      name_en,
      name_ta,
      price,
      weightValue,
      weightUnit,
      minOrderValue,
      minOrderUnit,
      baseUnit,
      stockQty,
      isAvailable,
    } = req.body;

    const product = new Product({
      categoryId,
      name_en,
      name_ta,
      price: Number(price),
      weightValue: Number(weightValue),
      weightUnit,
      minOrderValue: Number(minOrderValue),
      minOrderUnit,
      baseUnit,
      stockQty: Number(stockQty),
      isAvailable: isAvailable === "true",
      image: req.file
        ? {
            data: req.file.buffer,
            contentType: req.file.mimetype,
          }
        : undefined,
    });

    await product.save();
    res.status(201).json({ message: "Product added successfully", product });
  } catch (err) {
    console.error("Error adding product:", err);
    res.status(500).json({ error: "Failed to add product" });
  }
});

// Get all products
router.get("/", async (req, res) => {
  try {
    const categories = await Category.find({}, "_id name_en parentCategory");
    const products = await Product.find().populate("categoryId", "name_en parentCategory");

    const parentCategories = {};
    categories.forEach(cat => {
      if (!cat.parentCategory) {
        parentCategories[cat._id.toString()] = cat.name_en;
      }
    });

    const subToParentMap = {};
    categories.forEach(cat => {
      if (cat.parentCategory) {
        const parentId = cat.parentCategory.toString();
        subToParentMap[cat._id.toString()] = parentCategories[parentId] || "Uncategorized";
      }
    });

    const formatted = products.map(p => {
      const catId = p.categoryId?._id?.toString();
      const subcategoryName = p.categoryId?.name_en || "None";
      const parentName = subToParentMap[catId] || parentCategories[catId] || "Uncategorized";

      const imageData = p.image?.data
        ? Buffer.from(p.image.data).toString("base64")
        : null;

      return {
        _id: p._id,
        name_en: p.name_en,
        name_ta: p.name_ta,
        price: p.price,
        weightValue: p.weightValue,
        weightUnit: p.weightUnit,
        minOrderValue: p.minOrderValue,
        minOrderUnit: p.minOrderUnit,
        baseUnit: p.baseUnit,
        stockQty: p.stockQty,
        isAvailable: p.isAvailable,
        category: parentName,
        subcategory: subcategoryName === parentName ? "None" : subcategoryName,
        image: imageData
          ? {
              data: imageData,
              contentType: p.image.contentType,
            }
          : null,
      };
    });

    res.json(formatted);
  } catch (err) {
    console.error("Error fetching products:", err);
    res.status(500).json({ error: "Failed to fetch products" });
  }
});

// Delete a product
router.delete("/:id", async (req, res) => {
  try {
    await Product.findByIdAndDelete(req.params.id);
    res.json({ message: "Product deleted successfully" });
  } catch (err) {
    console.error("Error deleting product:", err);
    res.status(500).json({ error: "Failed to delete product" });
  }
});

// Update a product
router.put("/:id", upload.single("image"), async (req, res) => {
  try {
    const {
      categoryId,
      name_en,
      name_ta,
      price,
      weightValue,
      weightUnit,
      minOrderValue,
      minOrderUnit,
      baseUnit,
      stockQty,
      isAvailable,
    } = req.body;

    const updateData = {
      categoryId,
      name_en,
      name_ta,
      price: Number(price),
      weightValue: Number(weightValue),
      weightUnit,
      minOrderValue: Number(minOrderValue),
      minOrderUnit,
      baseUnit,
      stockQty: Number(stockQty),
      isAvailable: isAvailable === "true",
    };

    if (req.file) {
      updateData.image = {
        data: req.file.buffer,
        contentType: req.file.mimetype,
      };
    }

    const updated = await Product.findByIdAndUpdate(req.params.id, updateData, { new: true }).populate("categoryId", "name_en parentCategory");

    const categories = await Category.find({}, "_id name_en parentCategory");
    const parentCategories = {};
    categories.forEach(cat => {
      if (!cat.parentCategory) {
        parentCategories[cat._id.toString()] = cat.name_en;
      }
    });
    const subToParentMap = {};
    categories.forEach(cat => {
      if (cat.parentCategory) {
        const parentId = cat.parentCategory.toString();
        subToParentMap[cat._id.toString()] = parentCategories[parentId] || "Uncategorized";
      }
    });

    const catId = updated.categoryId?._id?.toString();
    const subcategoryName = updated.categoryId?.name_en || "None";
    const parentName = subToParentMap[catId] || parentCategories[catId] || "Uncategorized";

    const imageData = updated.image?.data
      ? Buffer.from(updated.image.data).toString("base64")
      : null;

    const formatted = {
      _id: updated._id,
      name_en: updated.name_en,
      name_ta: updated.name_ta,
      price: updated.price,
      weightValue: updated.weightValue,
      weightUnit: updated.weightUnit,
      minOrderValue: updated.minOrderValue,
      minOrderUnit: updated.minOrderUnit,
      baseUnit: updated.baseUnit,
      stockQty: updated.stockQty,
      isAvailable: updated.isAvailable,
      category: parentName,
      subcategory: subcategoryName === parentName ? "None" : subcategoryName,
      image: imageData
        ? {
            data: imageData,
            contentType: updated.image.contentType,
          }
        : null,
    };

    res.json({ message: "Product updated successfully", product: formatted });
  } catch (err) {
    console.error("Error updating product:", err);
    res.status(500).json({ error: "Failed to update product" });
  }
});

// Get products by category
router.get("/by-category/:id", getProductsByCategory);

export default router;
