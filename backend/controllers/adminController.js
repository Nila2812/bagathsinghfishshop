// controllers/adminController.js
import Admin from "../models/Admin.js";
import bcrypt from "bcrypt";

// ✅ GET all admins
export const getAdmins = async (req, res) => {
  try {
    const admins = await Admin.find().sort({ createdAt: -1 });
    res.json(admins);
  } catch (err) {
    console.error("Admin fetch error:", err);
    res.status(500).json({ error: "Failed to fetch admins" });
  }
};

// ✅ CREATE admin
export const createAdmin = async (req, res) => {
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
};

// ✅ DELETE admin
export const deleteAdmin = async (req, res) => {
  try {
    await Admin.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Admin deleted" });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete admin" });
 }
};

export const loginAdmin = async (req, res) => {
  const { username, password } = req.body;

  try {
    const admin = await Admin.findOne({ username });
    if (!admin) return res.status(401).json({ error: "Invalid credentials" });

    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) return res.status(401).json({ error: "Invalid credentials" });

    res.status(200).json({ message: "Login successful", adminId: admin._id });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ error: "Server error" });
  }
};
