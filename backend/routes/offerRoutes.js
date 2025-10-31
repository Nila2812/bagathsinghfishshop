import express from "express";
import Offer from "../models/Offer.js";
import Product from "../models/Product.js";

const router = express.Router();

// Fetch product list with price
router.get("/products", async (req, res) => {
  try {
    const products = await Product.find({}, "_id name_en price weightValue weightUnit ");

    const formatted = products.map(p => ({
      value: p._id,
      label: p.name_en,
      price: p.price,
      weightValue: p.weightValue,
      weightUnit: p.weightUnit

    }));
    res.json(formatted);
  } catch (err) {
    console.error("Error fetching products:", err);
    res.status(500).json({ error: "Failed to fetch products" });
  }
});



// Add new offer
router.post("/add", async (req, res) => {
  try {
    const newOffer = new Offer(req.body);
    await newOffer.save();
    res.status(201).json({ message: "Offer created", offer: newOffer });
  } catch (err) {
    console.error("Error creating offer:", err);
    res.status(500).json({ error: "Failed to create offer" });
  }
});

// GET all offers with product name
router.get("/", async (req, res) => {
  try {
    const offers = await Offer.find().populate("productIds", "name_en");

  const enriched = offers.map((offer, index) => ({
     id: index + 1,
    _id: offer._id,
  title_en: offer.title_en,
  title_ta: offer.title_ta,
  description_en: offer.description_en,
  description_ta: offer.description_ta,
  discountPercent: offer.discountPercent,
  costPrice: offer.costPrice,
  sellingPrice: offer.sellingPrice,
  isActive: offer.isActive,
  startDate: offer.startDate,
  endDate: offer.endDate,
  productName: offer.productIds?.name_en || "Unknown",
}));


    res.json(enriched);
  } catch (err) {
    console.error("Error fetching offers:", err);
    res.status(500).json({ error: "Failed to fetch offers" });
  }
});


router.put("/:id", async (req, res) => {
  try {
    const updated = await Offer.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json({ offer: updated });
  } catch (err) {
    console.error("Error updating offer:", err);
    res.status(500).json({ error: "Failed to update offer" });
  }
});


router.delete("/:id", async (req, res) => {
  try {
    await Offer.findByIdAndDelete(req.params.id);
    res.json({ message: "Offer deleted" });
  } catch (err) {
    console.error("Error deleting offer:", err);
    res.status(500).json({ error: "Failed to delete offer" });
  }
});




export default router;
