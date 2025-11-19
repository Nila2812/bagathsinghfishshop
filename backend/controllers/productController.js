import Product from "../models/Product.js";
import Category from "../models/Category.js";

// Utility function to format product with image
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
    image: imageData
      ? {
          data: imageData,
          contentType: p.image.contentType,
        }
      : null,
  };
};

// GET products by category (includes subcategories)
export const getProductsByCategory = async (req, res) => {
  try {
    const categoryId = req.params.id;

    // Find the clicked category
    const category = await Category.findById(categoryId);

    if (!category) {
      return res.status(404).json({ error: "Category not found" });
    }

    // Find subcategories of this category (if any)
    const subcategories = await Category.find({ parentCategory: categoryId });
    const allCategoryIds = [categoryId, ...subcategories.map((sub) => sub._id)];

    // Fetch all products whose categoryId is in [category + its subcategories]
    const products = await Product.find({
      categoryId: { $in: allCategoryIds },
    }).populate("categoryId", "name_en parentCategory");

    res.json(products.map(formatProduct));
  } catch (err) {
    console.error("Error fetching products by category:", err);
    res.status(500).json({ error: "Failed to fetch products by category" });
  }
};

// GET all products (clean format for frontend)
export const getAllProducts = async (req, res) => {
  try {
    const products = await Product.find().populate("categoryId", "name_en name_ta");
    res.json(products.map(formatProduct));
  } catch (err) {
    console.error("Error fetching all products:", err);
    res.status(500).json({ error: "Failed to fetch all products" });
  }
};

// Search products by name (English or Tamil)
export const searchProducts = async (req, res) => {
  try {
    const { query } = req.query;

    if (!query) {
      return res.status(400).json({ message: "Query is required" });
    }

    const products = await Product.find({
      $or: [
        { name_en: { $regex: query, $options: "i" } },
        { name_ta: { $regex: query, $options: "i" } }
      ]
    }).populate("categoryId", "name_en");

    res.json(products.map(formatProduct));
  } catch (error) {
    console.error("Search API Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};