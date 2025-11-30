// server/controllers/productController.js - UPDATED WITH SINGLE PRODUCT

import Product from "../models/Product.js";
import Category from "../models/Category.js";
import Cart from "../models/Cart.js";

// ----------------------------
// Utility: format product
// ----------------------------
export const formatProduct = (p) => {
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
    baseUnit: p.baseUnit,
    stockQty: p.stockQty,
    isAvailable: p.isAvailable,
    category: p.categoryId?.name_en || "Uncategorized",
    categoryId: p.categoryId ? {
      _id: p.categoryId._id,
      name_en: p.categoryId.name_en,
      name_ta: p.categoryId.name_ta
    }:null,
    image: imageData
      ? {
          data: imageData,
          contentType: p.image.contentType,
        }
      : null,
  };
};
//get product by ID
export const getProductById = async (req, res) => {
  const productId = req.params.id;
  
  console.log("🔍 Fetching product with ID:", productId);
  
  try {
    const product = await Product.findById(productId)
      .populate("categoryId", "name_en name_ta");
    
    console.log("📦 Product found:", product ? "YES" : "NO");
    
    if (!product) {
      console.log("❌ Product not found in database");
      return res.status(404).json({ error: "Product not found" });
    }

    console.log("✅ Sending product response:", product.name_en);
    res.json(formatProduct(product));
  } catch (err) {
    console.error("❌ Error fetching product:", err.message);
    res.status(500).json({ error: "Failed to fetch product", details: err.message });
  }
};

// ----------------------------
// 🆕 GET single product by ID
// ----------------------------
export const getSingleProduct = async (req, res) => {
  try {
    const productId = req.params.id;
    const product = await Product.findById(productId).populate("categoryId", "name_en");

    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }

    res.json(formatProduct(product));
  } catch (err) {
    console.error("Error fetching single product:", err);
    res.status(500).json({ error: "Failed to fetch product" });
  }
};

// ----------------------------
// GET products by category (ONLY AVAILABLE)
// ----------------------------
export const getProductsByCategory = async (req, res) => {
  try {
    const categoryId = req.params.id;
    const category = await Category.findById(categoryId);
    if (!category) {
      return res.status(404).json({ error: "Category not found" });
    }

    const subcategories = await Category.find({ parentCategory: categoryId });
    const allCategoryIds = [categoryId, ...subcategories.map((sub) => sub._id)];

    // 🔥 FILTER: Only show available products
    const products = await Product.find({
      categoryId: { $in: allCategoryIds },
      isAvailable: true,
    }).populate("categoryId", "name_en parentCategory");

    res.json(products.map(formatProduct));
  } catch (err) {
    console.error("Error fetching products by category:", err);
    res.status(500).json({ error: "Failed to fetch products by category" });
  }
};

// ----------------------------
// GET all products (ONLY AVAILABLE)
// ----------------------------
export const getAllProducts = async (req, res) => {
  try {
    // 🔥 FILTER: Only show available products
    const products = await Product.find({ isAvailable: true }).populate(
      "categoryId",
      "name_en name_ta"
    );
    res.json(products.map(formatProduct));
  } catch (err) {
    console.error("Error fetching all products:", err);
    res.status(500).json({ error: "Failed to fetch all products" });
  }
};

// ----------------------------
// Search products (ONLY AVAILABLE)
// ----------------------------
export const searchProducts = async (req, res) => {
  try {
    const { query } = req.query;

    if (!query) {
      return res.status(400).json({ message: "Query is required" });
    }

    // 🔥 FILTER: Only show available products
    const products = await Product.find({
      $or: [
        { name_en: { $regex: query, $options: "i" } },
        { name_ta: { $regex: query, $options: "i" } },
      ],
      isAvailable: true,
    }).populate("categoryId", "name_en");

    res.json(products.map(formatProduct));
  } catch (error) {
    console.error("Search API Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// ----------------------------
// UPDATE product - 🔥 WITH CART CLEANUP & AVAILABILITY CHECK
// ----------------------------
export const updateProduct = async (req, res) => {
  try {
    const {
      categoryId,
      name_en,
      name_ta,
      price,
      weightValue,
      weightUnit,
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
      baseUnit,
      stockQty: Number(stockQty),
    };

    if (req.file) {
      updateData.image = {
        data: req.file.buffer,
        contentType: req.file.mimetype,
      };
    }

    // 🔥 AUTO-CALCULATE isAvailable based on stock
    let available = false;
    const stock = Number(stockQty);
    const minValue = Number(weightValue);

    if (["g", "kg"].includes(weightUnit)) {
      const minInKg = weightUnit === "g" ? minValue / 1000 : minValue;
      available = stock >= minInKg;
    } else if (weightUnit === "piece") {
      available = stock >= minValue;
    }

    updateData.isAvailable = available;

    const updated = await Product.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    ).populate("categoryId", "name_en parentCategory");

    // 🔥 IMPORTANT: If product becomes unavailable, remove from ALL carts
    if (updateData.isAvailable === false) {
      await Cart.deleteMany({ productId: req.params.id });
      console.log(`🗑️ Removed product ${req.params.id} from all carts (unavailable)`);
    }

    res.json({
      message: "Product updated successfully",
      product: formatProduct(updated),
      removedFromCarts: updateData.isAvailable === false,
    });
  } catch (err) {
    console.error("Error updating product:", err);
    res.status(500).json({ error: "Failed to update product" });
  }
};

// ----------------------------
// DELETE product - 🔥 WITH CART CLEANUP
// ----------------------------
export const deleteProduct = async (req, res) => {
  try {
    // 🔥 Remove from all carts before deleting
    await Cart.deleteMany({ productId: req.params.id });
    console.log(`🗑️ Removed product ${req.params.id} from all carts`);

    await Product.findByIdAndDelete(req.params.id);
    res.json({ message: "Product deleted successfully" });
  } catch (err) {
    console.error("Error deleting product:", err);
    res.status(500).json({ error: "Failed to delete product" });
  }
};

// ----------------------------
// ADD product
// ----------------------------
export const addProduct = async (req, res) => {
  try {
    const {
      categoryId,
      name_en,
      name_ta,
      price,
      weightValue,
      weightUnit,
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
};

// --------------------------------------
// VIEW ALL PRODUCTS WITH CATEGORY TREE (ADMIN ONLY)
// --------------------------------------
export const viewAllProducts = async (req, res) => {
  try {
    const categories = await Category.find({}, "_id name_en parentCategory");
    // 🔥 ADMIN VIEW: Show ALL products (including unavailable)
    const products = await Product.find().populate(
      "categoryId",
      "name_en parentCategory"
    );

    const parentCategories = {};
    categories.forEach((cat) => {
      if (!cat.parentCategory) {
        parentCategories[cat._id.toString()] = cat.name_en;
      }
    });

    const subToParentMap = {};
    categories.forEach((cat) => {
      if (cat.parentCategory) {
        const parentId = cat.parentCategory.toString();
        subToParentMap[cat._id.toString()] =
          parentCategories[parentId] || "Uncategorized";
      }
    });

    const formatted = products.map((p, index) => {
      const catId = p.categoryId?._id?.toString();
      const subcategoryName = p.categoryId?.name_en || "None";
      const parentName =
        subToParentMap[catId] ||
        parentCategories[catId] ||
        "Uncategorized";

      const imageData = p.image?.data
        ? Buffer.from(p.image.data).toString("base64")
        : null;

      return {
        ...formatProduct(p),
        id: index + 1,
        category: parentName,
        subcategory:
          subcategoryName === parentName ? "None" : subcategoryName,
      };
    });

    res.json(formatted);
  } catch (err) {
    console.error("Error fetching products:", err);
    res.status(500).json({ error: "Failed to fetch products" });
  }
};