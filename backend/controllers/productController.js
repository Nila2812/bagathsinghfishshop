import Product from "../models/Product.js";
import Category from "../models/Category.js";

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

    const formatted = products.map((p) => {
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
        stockQty: p.stockQty,
        isAvailable: p.isAvailable,
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
    console.error("Error fetching products by category:", err);
    res.status(500).json({ error: "Failed to fetch products by category" });
  }
};
