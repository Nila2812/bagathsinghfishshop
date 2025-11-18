// server/routes/address.js
import express from "express";
import Address from "../models/Address.js";
import fetch from "node-fetch";

const router = express.Router();

// Utility: validate phone number
function isValidPhone(phone) {
  return /^[6-9][0-9]{9}$/.test(phone);
}

// Utility: check PIN code existence
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

// GET all addresses for a client
router.get("/:clientId", async (req, res) => {
  const { clientId } = req.params;
  const items = await Address.find({ clientId }).sort({ isDefault: -1, updatedAt: -1 });
  res.json(items);
});

// POST new address
router.post("/", async (req, res) => {
  const { 
    clientId, doorNo, street, locality, landmark, pincode, 
    district, state, city, name, phone, saveAs, fullAddress, lat, lon 
  } = req.body;

  // Validate pincode format
  if (!/^[1-9][0-9]{5}$/.test(pincode)) {
    return res.status(400).json({ message: "Invalid PIN code format" });
  }

  // Validate phone number
  if (!isValidPhone(phone)) {
    return res.status(400).json({ message: "Invalid phone number. Must be 10 digits starting with 6-9" });
  }

  // Verify pincode exists
  const exists = await verifyPincode(pincode);
  if (!exists) {
    return res.status(400).json({ message: "PIN code does not exist in India Post records" });
  }

  const address = new Address({
    clientId, doorNo, street, locality, landmark, pincode,
    district, state, city, name, phone, saveAs, fullAddress, lat, lon
  });

  // If this is the first address for client, set as default
  const count = await Address.countDocuments({ clientId });
  address.isDefault = count === 0;

  const saved = await address.save();
  res.json(saved);
});

// PATCH set address as default
router.patch("/:id/default", async (req, res) => {
  const { id } = req.params;
  const item = await Address.findById(id);
  if (!item) return res.status(404).json({ message: "Not found" });

  await Address.updateMany({ clientId: item.clientId }, { $set: { isDefault: false } });
  item.isDefault = true;
  await item.save();
  res.json(item);
});

// PUT update address
router.put("/:id", async (req, res) => {
  const { id } = req.params;
  const updates = req.body;

  // Validate pincode if being updated
  if (updates.pincode) {
    if (!/^[1-9][0-9]{5}$/.test(updates.pincode)) {
      return res.status(400).json({ message: "Invalid PIN code format" });
    }
    const exists = await verifyPincode(updates.pincode);
    if (!exists) {
      return res.status(400).json({ message: "PIN code does not exist in India Post records" });
    }
  }

  // Validate phone if being updated
  if (updates.phone && !isValidPhone(updates.phone)) {
    return res.status(400).json({ message: "Invalid phone number" });
  }

  const updated = await Address.findByIdAndUpdate(id, updates, { new: true });
  res.json(updated);
});

// DELETE an address
router.delete("/:id", async (req, res) => {
  const { id } = req.params;
  const addr = await Address.findById(id);
  
  // Prevent deleting default address if there are other addresses
  if (addr?.isDefault) {
    const count = await Address.countDocuments({ clientId: addr.clientId });
    if (count > 1) {
      return res.status(400).json({ message: "Cannot delete default address. Set another address as default first." });
    }
  }
  
  await Address.findByIdAndDelete(id);
  res.json({ ok: true });
});

export default router;