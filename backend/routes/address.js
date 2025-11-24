// server/routes/address.js - FIXED MIGRATION

import express from "express";
import Address from "../models/Address.js";
import fetch from "node-fetch";

const router = express.Router();

function isValidPhone(phone) {
  return /^[6-9][0-9]{9}$/.test(phone);
}

async function verifyPincode(pin) {
  try {
    const res = await fetch(`https://api.postalpincode.in/pincode/${pin}`);
    const data = await res.json();
    return data[0]?.Status === "Success";
  } catch (err) {
    console.error("PIN verification error:", err);
    return false;
  }
}

// GET addresses for user or client
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

    const items = await Address.find(query).sort({ isDefault: -1, updatedAt: -1 });
    res.json(items);
  } catch (err) {
    console.error("Error fetching addresses:", err);
    res.status(500).json({ message: "Failed to fetch addresses" });
  }
});

// POST new address
router.post("/", async (req, res) => {
  try {
    const { 
      userId, clientId, doorNo, street, locality, landmark, pincode, 
      district, state, city, name, phone, saveAs, fullAddress, lat, lon 
    } = req.body;

    if (!userId && !clientId) {
      return res.status(400).json({ message: "userId or clientId required" });
    }

    if (!/^[1-9][0-9]{5}$/.test(pincode)) {
      return res.status(400).json({ message: "Invalid PIN code format" });
    }

    if (!isValidPhone(phone)) {
      return res.status(400).json({ message: "Invalid phone number" });
    }

    const exists = await verifyPincode(pincode);
    if (!exists) {
      return res.status(400).json({ message: "PIN code does not exist" });
    }

    const address = new Address({
      ...(userId && { userId }),
      ...(clientId && { clientId }),
      doorNo, street, locality, landmark, pincode,
      district, state, city, name, phone, saveAs, fullAddress, lat, lon
    });

    // Set first address as default
    const count = await Address.countDocuments(
      userId ? { userId } : { clientId }
    );
    address.isDefault = count === 0;

    const saved = await address.save();
    res.json(saved);
  } catch (err) {
    console.error("Error creating address:", err);
    res.status(500).json({ message: "Failed to create address" });
  }
});

// SET default address
router.patch("/:id/default", async (req, res) => {
  try {
    const { id } = req.params;
    const item = await Address.findById(id);
    
    if (!item) {
      return res.status(404).json({ message: "Address not found" });
    }

    const query = item.userId ? { userId: item.userId } : { clientId: item.clientId };
    await Address.updateMany(query, { $set: { isDefault: false } });
    
    item.isDefault = true;
    await item.save();
    
    res.json(item);
  } catch (err) {
    console.error("Error setting default address:", err);
    res.status(500).json({ message: "Failed to set default address" });
  }
});

// UPDATE address
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    if (updates.pincode) {
      if (!/^[1-9][0-9]{5}$/.test(updates.pincode)) {
        return res.status(400).json({ message: "Invalid PIN code format" });
      }
      const exists = await verifyPincode(updates.pincode);
      if (!exists) {
        return res.status(400).json({ message: "PIN code does not exist" });
      }
    }

    if (updates.phone && !isValidPhone(updates.phone)) {
      return res.status(400).json({ message: "Invalid phone number" });
    }

    delete updates.userId;
    delete updates.clientId;

    const updated = await Address.findByIdAndUpdate(id, updates, { new: true });
    
    if (!updated) {
      return res.status(404).json({ message: "Address not found" });
    }

    res.json(updated);
  } catch (err) {
    console.error("Error updating address:", err);
    res.status(500).json({ message: "Failed to update address" });
  }
});

// DELETE address
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const addr = await Address.findById(id);
    
    if (!addr) {
      return res.status(404).json({ message: "Address not found" });
    }
    
    if (addr.isDefault) {
      const query = addr.userId ? { userId: addr.userId } : { clientId: addr.clientId };
      const count = await Address.countDocuments(query);
      if (count > 1) {
        return res.status(400).json({ message: "Cannot delete default address" });
      }
    }
    
    await Address.findByIdAndDelete(id);
    res.json({ ok: true });
  } catch (err) {
    console.error("Error deleting address:", err);
    res.status(500).json({ message: "Failed to delete address" });
  }
});

// 🔥 FIXED: Migrate guest addresses to user on login
router.post("/migrate", async (req, res) => {
  try {
    const { userId, clientId } = req.body;

    if (!userId || !clientId) {
      return res.status(400).json({ message: "userId and clientId required" });
    }

    // Find all guest addresses
    const guestAddresses = await Address.find({ clientId });

    if (guestAddresses.length === 0) {
      return res.json({ 
        message: "No guest addresses to migrate", 
        migratedCount: 0,
        userHadExistingAddresses: false 
      });
    }

    // 🔥 Check if user already has addresses
    const existingUserAddresses = await Address.find({ userId });
    const userHadExistingAddresses = existingUserAddresses.length > 0;

    let migratedCount = 0;

    // Migrate each address
    for (const guestAddr of guestAddresses) {
      const newAddr = new Address({
        userId,
        doorNo: guestAddr.doorNo,
        street: guestAddr.street,
        locality: guestAddr.locality,
        landmark: guestAddr.landmark,
        pincode: guestAddr.pincode,
        district: guestAddr.district,
        state: guestAddr.state,
        city: guestAddr.city,
        name: guestAddr.name,
        phone: guestAddr.phone,
        saveAs: guestAddr.saveAs,
        fullAddress: guestAddr.fullAddress,
        lat: guestAddr.lat,
        lon: guestAddr.lon,
        // 🔥 FIX: Only set as default if user has NO existing addresses
        isDefault: userHadExistingAddresses ? false : guestAddr.isDefault
      });
      await newAddr.save();
      migratedCount++;
    }

    // Delete guest addresses
    await Address.deleteMany({ clientId });

    console.log(`✅ Address Migration: ${migratedCount} addresses migrated`);
    if (userHadExistingAddresses) {
      console.log(`   User had existing addresses - guest addresses NOT set as default`);
    }

    res.json({ 
      message: "Addresses migrated successfully", 
      migratedCount,
      userHadExistingAddresses
    });
  } catch (err) {
    console.error("Error migrating addresses:", err);
    res.status(500).json({ message: "Failed to migrate addresses" });
  }
});

export default router;