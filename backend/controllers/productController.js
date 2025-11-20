import Product from "../models/Product.js";
import Category from "../models/Category.js";

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
    image: imageData
      ? {
          data: imageData,
          contentType: p.image.contentType,
        }
      : null,
  };
};

// ----------------------------
// GET products by category
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

    const products = await Product.find({
      categoryId: { $in: allCategoryIds },
    }).populate("categoryId", "name_en parentCategory");

    res.json(products.map(formatProduct));
  } catch (err) {
    console.error("Error fetching products by category:", err);
    res.status(500).json({ error: "Failed to fetch products by category" });
  }
};

// ----------------------------
// GET all products
// ----------------------------
export const getAllProducts = async (req, res) => {
  try {
    const products = await Product.find().populate("categoryId", "name_en name_ta");
    res.json(products.map(formatProduct));
  } catch (err) {
    console.error("Error fetching all products:", err);
    res.status(500).json({ error: "Failed to fetch all products" });
  }
};

// ----------------------------
// Search products
// ----------------------------
export const searchProducts = async (req, res) => {
  try {
    const { query } = req.query;

    if (!query) {
      return res.status(400).json({ message: "Query is required" });
    }

    const products = await Product.find({
      $or: [
        { name_en: { $regex: query, $options: "i" } },
        { name_ta: { $regex: query, $options: "i" } },
      ],
    }).populate("categoryId", "name_en");

    res.json(products.map(formatProduct));
  } catch (error) {
    console.error("Search API Error:", error);
    res.status(500).json({ message: "Server error" });
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

// ----------------------------
// UPDATE product
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
      isAvailable: isAvailable === "true",
    };

    if (req.file) {
      updateData.image = {
        data: req.file.buffer,
        contentType: req.file.mimetype,
      };
    }

    const updated = await Product.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    ).populate("categoryId", "name_en parentCategory");

    res.json({ message: "Product updated successfully", product: formatProduct(updated) });
  } catch (err) {
    console.error("Error updating product:", err);
    res.status(500).json({ error: "Failed to update product" });
  }
};

// ----------------------------
// DELETE product
// ----------------------------
export const deleteProduct = async (req, res) => {
  try {
    await Product.findByIdAndDelete(req.params.id);
    res.json({ message: "Product deleted successfully" });
  } catch (err) {
    console.error("Error deleting product:", err);
    res.status(500).json({ error: "Failed to delete product" });
  }
};

// --------------------------------------
// VIEW ALL PRODUCTS WITH CATEGORY TREE
// --------------------------------------
export const viewAllProducts = async (req, res) => {
  try {
    const categories = await Category.find({}, "_id name_en parentCategory");
    const products = await Product.find()
      .populate("categoryId", "name_en parentCategory");

    // Get parent categories
    const parentCategories = {};
    categories.forEach(cat => {
      if (!cat.parentCategory) {
        parentCategories[cat._id.toString()] = cat.name_en;
      }
    });

    // Map subcategories → their parent
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
      const parentName =
        subToParentMap[catId] ||
        parentCategories[catId] ||
        "Uncategorized";

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
};
