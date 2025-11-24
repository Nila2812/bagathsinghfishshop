// server/routes/authRoutes.js - WITH PROPER EXPORT

import express from "express";
import { 
  sendOTP, 
  verifyOTP, 
  completeProfile, 
  getUserDetails,
  verifySession,
  logout
} from "../controllers/authController.js";

const router = express.Router();

// Step 1: Send OTP
router.post("/send-otp", sendOTP);

// Step 2: Verify OTP
router.post("/verify-otp", verifyOTP);

// Step 3: Complete Profile (for new users)
router.post("/complete-profile", completeProfile);

// Verify session token is still valid
router.post("/verify-session", verifySession);

// Get User Details
router.get("/user/:mobile", getUserDetails);

// Logout
router.post("/logout", logout);

// 🔥 PROPER DEFAULT EXPORT
export default router;