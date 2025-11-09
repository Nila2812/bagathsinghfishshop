// routes/offerRoutes.js
import express from "express";
import {
  getProductsForOffer,
  addOffer,
  getAllOffers,
  updateOffer,
  deleteOffer,
  getActiveOffers,
  getOfferByProductId, 
} from "../controllers/offerController.js";

const router = express.Router();

// Fetch product list with price
router.get("/products", getProductsForOffer);

// ✅ EXTRA ROUTE FOR OFFERCAROUSEL (put before "/:id" routes)
router.get("/active", getActiveOffers);

//to delete automatically while adding offer
router.get("/by-product/:productId", getOfferByProductId);
// Add new offer
router.post("/add", addOffer);

// GET all offers with product name
router.get("/", getAllOffers);

// Update offer
router.put("/:id", updateOffer);

// Delete offer
router.delete("/:id", deleteOffer);

export default router;