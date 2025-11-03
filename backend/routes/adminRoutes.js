import express from "express";
import Admin from "../models/Admin.js";
import bcrypt from "bcrypt";
import { loginAdmin } from "../controllers/adminController.js";

const router = express.Router();

// ✅ GET all admins
router.get("/", async (req, res) => {
  try {
    const admins = await Admin.find().sort({ createdAt: -1 });
    res.json(admins);
  } catch (err) {
    console.error("Admin fetch error:", err);
    res.status(500).json({ error: "Failed to fetch admins" });
  }
});


router.post("/", async (req, res) => {
  try {
    const hashedPassword = await bcrypt.hash(req.body.password, 10);
    const newAdmin = new Admin({
      ...req.body,
      password: hashedPassword,
    });
    await newAdmin.save();
    res.status(201).json({ message: "Admin created" });
  } catch (err) {
    res.status(500).json({ error: "Failed to create admin" });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    await Admin.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Admin deleted" });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete admin" });
  }
});

router.post("/login", loginAdmin);

export default router;