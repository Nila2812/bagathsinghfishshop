// server/routes/authRoutes.js - COMPLETE WITH ALL ROUTES

import express from "express";
import { 
  sendOTP, 
  verifyOTP, 
  completeProfile, 
  getUserDetails,
  verifySession,
  logout,
  checkDeviceBlock,
  updateProfile,
  getAllUsers,    // 🆕 NEW
  deleteUser      // 🆕 NEW
} from "../controllers/authController.js";

const router = express.Router();

// ==========================================
// AUTHENTICATION ROUTES
// ==========================================

// Step 1: Send OTP
router.post("/send-otp", sendOTP);

// Step 2: Verify OTP
router.post("/verify-otp", verifyOTP);

// Step 3: Complete Profile (for new users)
router.post("/complete-profile", completeProfile);

// UPDATE PROFILE (for existing users)
router.put("/update-profile/:userId", updateProfile);

// Check if device is blocked
router.post("/check-device-block", checkDeviceBlock);

// Verify session token is still valid
router.post("/verify-session", verifySession);

// Get User Details
router.get("/user/:mobile", getUserDetails);

// Logout
router.post("/logout", logout);

// ==========================================
// ADMIN ROUTES (NEW)
// ==========================================

// Get all users (Admin)
router.get("/users/all", getAllUsers);

// Delete user (Admin)
router.delete("/users/:userId", deleteUser);

export default router;