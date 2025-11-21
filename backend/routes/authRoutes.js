import express from "express";
import { 
  sendOTP, 
  verifyOTP, 
  completeProfile, 
  getUserDetails 
} from "../controllers/authController.js";

const router = express.Router();

// Send OTP
router.post("/send-otp", sendOTP);

// Verify OTP
router.post("/verify-otp", verifyOTP);

// Complete Profile (for new users)
router.post("/complete-profile", completeProfile);

// Get User Details
router.get("/user/:mobile", getUserDetails);

export default router;