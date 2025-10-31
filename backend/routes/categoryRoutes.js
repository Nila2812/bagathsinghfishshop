import express from "express";
import multer from "multer";
import Category from "../models/Category.js";

const router = express.Router();

// Multer setup for image upload
const storage = multer.memoryStorage();
const upload = multer({ storage });



// Add category
router.post("/add", upload.single("image"), async (req, res) => {
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
            contentType: req.file.mimetype
          }
        : undefined
    });

    await category.save();
    res.status(201).json({ message: "Category added", category });
  } catch (err) {
    console.error("Error adding category:", err);
    res.status(500).json({ error: "Failed to add category" });
  }
});

// View all categories
router.get("/", async (req, res) => {
  try {
    const categories = await Category.find().populate("parentCategory");

    const enriched = categories.map((cat) => {
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
      };
    });

    res.json(enriched);
  } catch (err) {
    console.error("Error fetching categories:", err);
    res.status(500).json({ error: "Failed to fetch categories" });
  }
});

// DELETE category
router.delete("/:id", async (req, res) => {
  try {
    await Category.findByIdAndDelete(req.params.id);
    res.json({ message: "Category deleted" });
  } catch (err) {
    res.status(500).json({ error: "Delete failed" });
  }
});

// PUT category
router.put("/:id", upload.single("image"), async (req, res) => {
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
    res.status(500).json({ error: "Update failed" });
  }
});

export default router;
