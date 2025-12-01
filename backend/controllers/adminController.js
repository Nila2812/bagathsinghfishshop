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

// ✅ LOGIN admin
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

// ✅ GET single admin by ID (excluding password)
export const getAdminById = async (req, res) => {
  try {
    const admin = await Admin.findById(req.params.id).select('-password');
    if (!admin) return res.status(404).json({ error: "Admin not found" });
    res.json(admin);
  } catch (err) {
    console.error("Admin fetch error:", err);
    res.status(500).json({ error: "Failed to fetch admin" });
  }
};

// ✅ UPDATE admin (excluding password)
export const updateAdmin = async (req, res) => {
  try {
    const { username, shopName, address, phone, whatsappNumber } = req.body;
    
    // Check if username is taken by another admin
    const existingAdmin = await Admin.findOne({ 
      username, 
      _id: { $ne: req.params.id } 
    });
    
    if (existingAdmin) {
      return res.status(409).json({ 
        errors: { username: "Username already exists" } 
      });
    }

    const updatedAdmin = await Admin.findByIdAndUpdate(
      req.params.id,
      { username, shopName, address, phone, whatsappNumber },
      { new: true, runValidators: true }
    );

    if (!updatedAdmin) return res.status(404).json({ error: "Admin not found" });
    res.json({ message: "Admin updated successfully", admin: updatedAdmin });
  } catch (err) {
    console.error("Update error:", err);
    res.status(500).json({ error: "Failed to update admin" });
  }
};

// ✅ VERIFY password
export const verifyPassword = async (req, res) => {
  try {
    const { adminId, password } = req.body;
    const admin = await Admin.findById(adminId);
    
    if (!admin) return res.status(404).json({ error: "Admin not found" });

    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) return res.status(401).json({ verified: false });

    res.json({ verified: true });
  } catch (err) {
    console.error("Verify password error:", err);
    res.status(500).json({ error: "Server error" });
  }
};

export const updatePassword = async (req, res) => {
  try {
    const { newPassword } = req.body;
    const admin = await Admin.findById(req.params.id);
    
    if (!admin) return res.status(404).json({ error: "Admin not found" });

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    admin.password = hashedPassword;
    await admin.save();

    res.json({ message: "Password updated successfully" });
  } catch (err) {
    console.error("Update password error:", err);
    res.status(500).json({ error: "Failed to update password" });
  }
};