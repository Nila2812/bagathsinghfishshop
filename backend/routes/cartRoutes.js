import express from "express";
import Cart from "../models/Cart.js";
import Product from "../models/Product.js";

const router = express.Router();

// Helper: Convert to grams for consistent calculation
const toGrams = (value, unit) => {
  if (unit === "kg") return value * 1000;
  if (unit === "g") return value;
  return value; // piece
};

// Helper: Parse baseUnit value properly
const parseBaseUnit = (baseUnit) => {
  if (baseUnit === 'piece') {
    return { value: 1, unit: 'piece' };
  }
  
  const match = baseUnit.match(/^(\d+(?:\.\d+)?)(g|kg)$/);
  if (!match) {
    console.error('Invalid baseUnit format:', baseUnit);
    return { value: 0, unit: 'g' };
  }
  
  const [, numStr, unit] = match;
  const value = parseFloat(numStr);
  
  if (unit === 'kg') {
    return { value: value * 1000, unit: 'g' };
  }
  return { value, unit: 'g' };
};

// Helper: Check stock availability
const checkStock = (totalWeight, unit, product) => {
  const stockQty = product.stockQty;
  const stockUnit = product.weightUnit === 'piece' ? 'piece' : 'kg';
  
  if (unit === 'piece') {
    return totalWeight <= stockQty;
  }
  
  const requestedInKg = unit === 'kg' ? totalWeight : totalWeight / 1000;
  return requestedInKg <= stockQty;
};

// Add product to cart
router.post("/add", async (req, res) => {
  try {
    const { sessionId, productId } = req.body;

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }

    let cartItem = await Cart.findOne({ sessionId, productId });

    if (cartItem) {
      const baseUnitParsed = parseBaseUnit(cartItem.productSnapshot.baseUnit);
      
      let newWeight = cartItem.totalWeight;
      
      if (baseUnitParsed.unit === 'piece') {
        newWeight += baseUnitParsed.value;
        cartItem.unit = 'piece';
      } else {
        const currentInGrams = toGrams(cartItem.totalWeight, cartItem.unit);
        const newInGrams = currentInGrams + baseUnitParsed.value;
        newWeight = newInGrams / 1000;
        cartItem.unit = 'kg';
      }
      
      if (!checkStock(newWeight, cartItem.unit, product)) {
        return res.status(400).json({ error: "OUT_OF_STOCK", message: "Stock limit reached" });
      }
      
      cartItem.totalWeight = newWeight;
      await cartItem.save();
      return res.status(200).json({ message: "Added to cart", cartItem, isNew: false });
    }

    // Initial add: use weightValue and weightUnit from product
    const imageData = product.image?.data
      ? Buffer.from(product.image.data).toString("base64")
      : null;

    cartItem = new Cart({
      sessionId,
      productId,
      totalWeight: product.weightValue,
      unit: product.weightUnit,
      productSnapshot: {
        name_en: product.name_en,
        name_ta: product.name_ta,
        price: product.price,
        weightValue: product.weightValue,
        weightUnit: product.weightUnit,
        baseUnit: product.baseUnit,
        stockQty: product.stockQty,
        image: imageData
          ? {
              data: imageData,
              contentType: product.image.contentType,
            }
          : null,
      },
    });
    await cartItem.save();

    res.status(200).json({ message: "Added to cart", cartItem, isNew: true });
  } catch (err) {
    console.error("Error adding to cart:", err);
    res.status(500).json({ error: "Failed to add to cart" });
  }
});

// Get all cart items for a session
router.get("/:sessionId", async (req, res) => {
  try {
    const { sessionId } = req.params;
    const cartItems = await Cart.find({ sessionId }).populate("productId");
    res.json(cartItems);
  } catch (err) {
    console.error("Error fetching cart:", err);
    res.status(500).json({ error: "Failed to fetch cart" });
  }
});

// Update cart item (increment/decrement by baseUnit OR add/remove specific amounts)
router.put("/update/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { action, value, unit, stockQty } = req.body;

    const cartItem = await Cart.findById(id);
    if (!cartItem) {
      return res.status(404).json({ error: "Cart item not found" });
    }

    const product = await Product.findById(cartItem.productId);
    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }

    let finalWeight = cartItem.totalWeight;
    let finalUnit = cartItem.unit;
    let capped = false;

    // Minimum threshold is weightValue and weightUnit
    const minThresholdInGrams = toGrams(
      cartItem.productSnapshot.weightValue,
      cartItem.productSnapshot.weightUnit
    );

    if (action === 'add_specific' || action === 'remove_specific') {
      // Add or remove specific amount
      if (unit === 'piece') {
        if (action === 'add_specific') {
          finalWeight += value;
        } else {
          finalWeight -= value;
        }
        finalUnit = 'piece';
      } else {
        // Convert to grams for calculation
        const currentInGrams = toGrams(cartItem.totalWeight, cartItem.unit);
        if (action === 'add_specific') {
          finalWeight = (currentInGrams + value) / 1000;
        } else {
          finalWeight = (currentInGrams - value) / 1000;
        }
        finalUnit = 'kg';
      }

      // Check if exceeds stock
      const productStockQty = stockQty || product.stockQty;
      if (action === 'add_specific' && !checkStock(finalWeight, finalUnit, product)) {
        // Cap at stock limit
        finalWeight = productStockQty;
        finalUnit = finalUnit === 'piece' ? 'piece' : 'kg';
        capped = true;
      }

      // Check minimum threshold
      if (finalUnit === 'piece') {
        if (finalWeight < cartItem.productSnapshot.weightValue) {
          await Cart.findByIdAndDelete(id);
          return res.json({ message: "Item removed (below minimum)", removed: true });
        }
      } else {
        const newWeightInGrams = toGrams(finalWeight, finalUnit);
        if (newWeightInGrams < minThresholdInGrams) {
          await Cart.findByIdAndDelete(id);
          return res.json({ message: "Item removed (below minimum)", removed: true });
        }
      }
    } else if (action === 'increment' || action === 'decrement') {
      // Original increment/decrement by baseUnit
      const baseUnitParsed = parseBaseUnit(cartItem.productSnapshot.baseUnit);

      if (baseUnitParsed.unit === 'piece') {
        if (action === 'increment') {
          finalWeight += baseUnitParsed.value;
        } else {
          finalWeight -= baseUnitParsed.value;
        }
        finalUnit = 'piece';
        
        if (finalWeight < cartItem.productSnapshot.weightValue) {
          await Cart.findByIdAndDelete(id);
          return res.json({ message: "Item removed (below minimum)", removed: true });
        }
      } else {
        const currentInGrams = toGrams(cartItem.totalWeight, cartItem.unit);
        
        if (action === 'increment') {
          finalWeight = (currentInGrams + baseUnitParsed.value) / 1000;
        } else {
          finalWeight = (currentInGrams - baseUnitParsed.value) / 1000;
        }
        finalUnit = 'kg';
        
        const newWeightInGrams = toGrams(finalWeight, finalUnit);
        if (newWeightInGrams < minThresholdInGrams) {
          await Cart.findByIdAndDelete(id);
          return res.json({ message: "Item removed (below minimum)", removed: true });
        }
      }

      if (!checkStock(finalWeight, finalUnit, product)) {
        return res.status(400).json({ error: "OUT_OF_STOCK", message: "Stock limit reached" });
      }
    }

    cartItem.totalWeight = finalWeight;
    cartItem.unit = finalUnit;
    await cartItem.save();

    res.json({ message: "Cart updated", cartItem, capped });
  } catch (err) {
    console.error("Error updating cart:", err);
    res.status(500).json({ error: "Failed to update cart" });
  }
});

// Remove item from cart
router.delete("/remove/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await Cart.findByIdAndDelete(id);
    res.json({ message: "Item removed from cart" });
  } catch (err) {
    console.error("Error removing from cart:", err);
    res.status(500).json({ error: "Failed to remove from cart" });
  }
});

// Clear entire cart for a session
router.delete("/clear/:sessionId", async (req, res) => {
  try {
    const { sessionId } = req.params;
    await Cart.deleteMany({ sessionId });
    res.json({ message: "Cart cleared" });
  } catch (err) {
    console.error("Error clearing cart:", err);
    res.status(500).json({ error: "Failed to clear cart" });
  }
});

// Get cart count (number of unique products)
router.get("/count/:sessionId", async (req, res) => {
  try {
    const { sessionId } = req.params;
    const count = await Cart.countDocuments({ sessionId });
    res.json({ count });
  } catch (err) {
    console.error("Error getting cart count:", err);
    res.status(500).json({ error: "Failed to get cart count" });
  }
});

export default router;