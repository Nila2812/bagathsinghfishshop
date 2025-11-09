// controllers/offerController.js
import Offer from '../models/Offer.js';
import Product from '../models/Product.js';

// @desc    Fetch product list with price
// @route   GET /api/offers/products
export const getProductsForOffer = async (req, res) => {
  try {
    const products = await Product.find({}, "_id name_en price weightValue weightUnit");

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
};

// @desc    Add new offer
// @route   POST /api/offers/add
export const addOffer = async (req, res) => {
  try {
    const newOffer = new Offer(req.body);
    await newOffer.save();
    res.status(201).json({ message: "Offer created", offer: newOffer });
  } catch (err) {
    console.error("Error creating offer:", err);
    res.status(500).json({ error: "Failed to create offer" });
  }
};

// @desc    Get all offers with product name
// @route   GET /api/offers
export const getAllOffers = async (req, res) => {
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
};

// @desc    Update offer
// @route   PUT /api/offers/:id
export const updateOffer = async (req, res) => {
  try {
    const updated = await Offer.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json({ offer: updated });
  } catch (err) {
    console.error("Error updating offer:", err);
    res.status(500).json({ error: "Failed to update offer" });
  }
};

// @desc    Delete offer
// @route   DELETE /api/offers/:id
export const deleteOffer = async (req, res) => {
  try {
    await Offer.findByIdAndDelete(req.params.id);
    res.json({ message: "Offer deleted" });
  } catch (err) {
    console.error("Error deleting offer:", err);
    res.status(500).json({ error: "Failed to delete offer" });
  }
};

// ✅ EXTRA CODE FOR OFFERCAROUSEL
// @desc    Get all active offers with full product data (for frontend carousel)
// @route   GET /api/offers/active
export const getActiveOffers = async (req, res) => {
  try {
    const currentDate = new Date();
    
    // Build query: isActive must be true
    const query = { 
      isActive: true,
      // If endDate exists, it must be greater than or equal to today
      $or: [
        { endDate: { $exists: false } }, // No endDate (永久优惠)
        { endDate: null }, // endDate is null
        { endDate: { $gte: currentDate } } // endDate is in the future
      ]
    };

    const offers = await Offer.find(query)
      .populate('productIds') // Populate full product details including image
      .sort({ createdAt: -1 });

    console.log(`Found ${offers.length} valid active offers`); // Debug log

    const enriched = offers.map(offer => {
      const offerObj = offer.toObject();
      
      // Convert product image buffer to base64
      if (offerObj.productIds?.image?.data) {
        offerObj.productIds.image = {
          data: offerObj.productIds.image.data.toString('base64'),
          contentType: offerObj.productIds.image.contentType
        };
      }
      
      return offerObj;
    });

    res.json(enriched);
  } catch (err) {
    console.error('Error fetching active offers:', err);
    res.status(500).json({ error: 'Failed to fetch offers' });
  }
};

// @desc    Get offer by product ID
// @route   GET /api/offers/by-product/:productId
export const getOfferByProductId = async (req, res) => {
  try {
    const offer = await Offer.findOne({ productIds: req.params.productId });
    if (offer) {
      res.json(offer);
    } else {
      res.json({});
    }
  } catch (err) {
    console.error("Error fetching offer by product ID:", err);
    res.status(500).json({ error: "Failed to fetch offer" });
  }
};
