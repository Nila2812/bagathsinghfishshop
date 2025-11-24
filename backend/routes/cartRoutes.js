// server/routes/cart.js - COMPLETE FILE WITH CAPPING FIX

import express from "express";
import Cart from "../models/Cart.js";
import Product from "../models/Product.js";

const router = express.Router();

const toGrams = (value, unit) => {
  if (unit === "kg") return value * 1000;
  if (unit === "g") return value;
  return value;
};

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

const checkStock = (totalWeight, unit, product) => {
  const stockQty = product.stockQty;
  
  if (unit === 'piece') {
    return totalWeight <= stockQty;
  }
  
  const requestedInKg = unit === 'kg' ? totalWeight : totalWeight / 1000;
  return requestedInKg <= stockQty;
};

// ADD PRODUCT TO CART
router.post("/add", async (req, res) => {
  try {
    const { userId, clientId, productId } = req.body;

    if (!userId && !clientId) {
      return res.status(400).json({ error: "userId or clientId required" });
    }

    if (userId && clientId) {
      return res.status(400).json({ error: "Provide either userId OR clientId, not both" });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }

    let query;
    if (userId) {
      query = { userId: userId, productId: productId };
    } else {
      query = { clientId: clientId, productId: productId };
    }

    let cartItem = await Cart.findOne(query);

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
      cartItem.lastModified = new Date();
      await cartItem.save();
      
      return res.status(200).json({ message: "Added to cart", cartItem, isNew: false });
    }

    const imageData = product.image?.data
      ? Buffer.from(product.image.data).toString("base64")
      : null;

    const newCartItem = {
      productId,
      totalWeight: product.weightValue,
      unit: product.weightUnit,
      lastModified: new Date(),
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
    };

    if (userId) {
      newCartItem.userId = userId;
    } else {
      newCartItem.clientId = clientId;
    }

    cartItem = new Cart(newCartItem);
    await cartItem.save();

    res.status(200).json({ message: "Added to cart", cartItem, isNew: true });

  } catch (err) {
    console.error("Error adding to cart:", err);
    res.status(500).json({ error: "Failed to add to cart", details: err.message });
  }
});

// GET CART ITEMS
router.get("/:identifier", async (req, res) => {
  try {
    const { identifier } = req.params;
    const { type } = req.query;

    let query = {};
    
    if (type === 'user') {
      query = { userId: identifier };
    } else if (type === 'client') {
      query = { clientId: identifier };
    } else {
      query = { $or: [{ userId: identifier }, { clientId: identifier }] };
    }

    const cartItems = await Cart.find(query).populate("productId");
    res.json(cartItems);
  } catch (err) {
    console.error("Error fetching cart:", err);
    res.status(500).json({ error: "Failed to fetch cart" });
  }
});

// 🔥 UPDATE CART ITEM - WITH STOCK CAPPING
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

    const minThresholdInGrams = toGrams(
      cartItem.productSnapshot.weightValue,
      cartItem.productSnapshot.weightUnit
    );

    if (action === 'add_specific' || action === 'remove_specific') {
      if (unit === 'piece') {
        if (action === 'add_specific') {
          finalWeight += value;
        } else {
          finalWeight -= value;
        }
        finalUnit = 'piece';
      } else {
        const currentInGrams = toGrams(cartItem.totalWeight, cartItem.unit);
        if (action === 'add_specific') {
          finalWeight = (currentInGrams + value) / 1000;
        } else {
          finalWeight = (currentInGrams - value) / 1000;
        }
        finalUnit = 'kg';
      }

      const productStockQty = stockQty || product.stockQty;
      
      // 🔥 CHECK STOCK AND CAP
      if (action === 'add_specific' && !checkStock(finalWeight, finalUnit, product)) {
        finalWeight = productStockQty;
        finalUnit = finalUnit === 'piece' ? 'piece' : 'kg';
        capped = true;
      }

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

      // 🔥 CHECK STOCK ON INCREMENT - CAP IF EXCEEDS
      if (action === 'increment' && !checkStock(finalWeight, finalUnit, product)) {
        finalWeight = product.stockQty;
        finalUnit = finalUnit === 'piece' ? 'piece' : 'kg';
        capped = true;
        console.log(`⚠️  Cart capped at max stock: ${finalWeight} ${finalUnit}`);
      }
    }

    cartItem.totalWeight = finalWeight;
    cartItem.unit = finalUnit;
    cartItem.lastModified = new Date();
    await cartItem.save();

    // 🔥 RETURN capped status
    res.json({ message: "Cart updated", cartItem, capped });
  } catch (err) {
    console.error("Error updating cart:", err);
    res.status(500).json({ error: "Failed to update cart" });
  }
});

// REMOVE FROM CART
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

// CLEAR ENTIRE CART
router.delete("/clear/:identifier", async (req, res) => {
  try {
    const { identifier } = req.params;
    const { type } = req.query;

    let query = {};
    
    if (type === 'user') {
      query = { userId: identifier };
    } else if (type === 'client') {
      query = { clientId: identifier };
    } else {
      query = { $or: [{ userId: identifier }, { clientId: identifier }] };
    }

    const result = await Cart.deleteMany(query);
    res.json({ message: "Cart cleared", deletedCount: result.deletedCount });
  } catch (err) {
    console.error("Error clearing cart:", err);
    res.status(500).json({ error: "Failed to clear cart" });
  }
});

// GET CART COUNT
router.get("/count/:identifier", async (req, res) => {
  try {
    const { identifier } = req.params;
    const { type } = req.query;

    let query = {};
    
    if (type === 'user') {
      query = { userId: identifier };
    } else if (type === 'client') {
      query = { clientId: identifier };
    } else {
      query = { $or: [{ userId: identifier }, { clientId: identifier }] };
    }

    const count = await Cart.countDocuments(query);
    res.json({ count });
  } catch (err) {
    console.error("Error getting cart count:", err);
    res.status(500).json({ error: "Failed to get cart count" });
  }
});

// MIGRATE GUEST CART TO USER CART
router.post("/migrate", async (req, res) => {
  try {
    const { userId, clientId } = req.body;

    if (!userId || !clientId) {
      return res.status(400).json({ error: "userId and clientId required" });
    }

    const guestItems = await Cart.find({ clientId: clientId });

    if (guestItems.length === 0) {
      return res.json({ 
        message: "No guest cart to migrate", 
        migratedCount: 0,
        deletedCount: 0 
      });
    }

    const deleteResult = await Cart.deleteMany({ userId: userId });

    let migratedCount = 0;
    for (const guestItem of guestItems) {
      await Cart.findByIdAndUpdate(
        guestItem._id,
        { 
          userId: userId,
          clientId: null,
          lastModified: new Date()
        }
      );
      migratedCount++;
    }

    await Cart.deleteMany({ clientId: clientId });

    res.json({ 
      message: "Cart migrated successfully", 
      migratedCount: migratedCount,
      deletedCount: deleteResult.deletedCount
    });

  } catch (err) {
    console.error("Error migrating cart:", err);
    res.status(500).json({ error: "Failed to migrate cart", details: err.message });
  }
});

export default router;