// controllers/categoryController.js
import Category from "../models/Category.js";


// @route   GET /api/categories/:id
export const getCategoryById = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category)
      return res.status(404).json({ error: "Category not found" });

    res.json(category);
  } catch (err) {
    console.error("Error fetching category:", err);
    res.status(500).json({ error: "Failed to fetch category" });
  }
};
// 🟩 Add category
export const addCategory = async (req, res) => {
  try {
    const {
      name_en,
      name_ta,
      description_en,
      description_ta,
      parentCategory
    } = req.body;

    const category = new Category({
      name_en,
      name_ta,
      description_en,
      description_ta,
      parentCategory: parentCategory || null,
      image: req.file
        ? {
            data: req.file.buffer,
            contentType: req.file.mimetype,
          }
        : undefined,
    });

    await category.save();
    res.status(201).json({ message: "Category added", category });
  } catch (err) {
    console.error("Error adding category:", err);
    res.status(500).json({ error: "Failed to add category" });
  }
};

// 🟨 View all categories
export const getAllCategories = async (req, res) => {
  try {
    const categories = await Category.find().populate("parentCategory");

    const enriched = await Promise.all(
      categories.map(async (cat) => {
        const childCount = await Category.countDocuments({
          parentCategory: cat._id,
        });

        let imageData = null;
        if (cat.image?.data) {
          imageData = {
            data: cat.image.data.toString("base64"),
            contentType: cat.image.contentType,
          };
        }

        return {
          ...cat.toObject(),
          image: imageData,
          hasChildren: childCount > 0,
          isSubCategory: !!cat.parentCategory,
        };
      })
    );

    res.json(enriched);
  } catch (err) {
    console.error("Error fetching categories:", err);
    res.status(500).json({ error: "Failed to fetch categories" });
  }
};

// 🟥 Delete category
export const deleteCategory = async (req, res) => {
  try {
    await Category.findByIdAndDelete(req.params.id);
    res.json({ message: "Category deleted" });
  } catch (err) {
    console.error("Delete failed:", err);
    res.status(500).json({ error: "Delete failed" });
  }
};

// 🟦 Update category
export const updateCategory = async (req, res) => {
  try {
    const updateData = { ...req.body };

    if (updateData.parentCategory === "") {
      updateData.parentCategory = null;
    }

    if (req.file) {
      updateData.image = {
        data: req.file.buffer,
        contentType: req.file.mimetype,
      };
    }

    const updated = await Category.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
    });

    res.json({ category: updated });
  } catch (err) {
    console.error("Update failed:", err);
    res.status(500).json({ error: "Update failed" });
  }
};
