// server/controllers/authController.js - IMMEDIATE FORCE LOGOUT

import User from "../models/User.js";
import crypto from "crypto";

const generateOTP = () => {
  return Math.floor(1000 + Math.random() * 9000).toString();
};

const generateSessionToken = () => {
  return crypto.randomBytes(32).toString("hex");
};

// Send OTP (Step 1)
export const sendOTP = async (req, res) => {
  try {
    const { mobile } = req.body;

    const isValid = /^[6-9]\d{9}$/.test(mobile);
    if (!isValid) {
      return res.status(400).json({ 
        success: false, 
        message: "Invalid mobile number. Must start with 6-9 and be 10 digits." 
      });
    }

    const otp = generateOTP();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

    let user = await User.findOne({ mobile });
    let isNewUser = false;

    if (user) {
      user.otp = { code: otp, expiresAt };
      await user.save();
      isNewUser = !user.isProfileComplete;
    } else {
      user = new User({
        mobile,
        otp: { code: otp, expiresAt }
      });
      await user.save();
      isNewUser = true;
    }

    console.log("\n========================================");
    console.log(`📱 OTP for ${mobile}: ${otp}`);
    console.log(`⏰ Expires at: ${expiresAt.toLocaleTimeString()}`);
    console.log(`${isNewUser ? "🆕 NEW USER" : "👤 EXISTING USER"}`);
    console.log("========================================\n");

    res.json({ 
      success: true, 
      message: "OTP sent successfully",
      isNewUser
    });

  } catch (error) {
    console.error("Send OTP Error:", error);
    res.status(500).json({ 
      success: false, 
      message: "Failed to send OTP" 
    });
  }
};

// 🔥 FIXED: Verify OTP with IMMEDIATE force logout signal
export const verifyOTP = async (req, res) => {
  try {
    const { mobile, otp } = req.body;

    const user = await User.findOne({ mobile });

    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: "User not found" 
      });
    }

    if (new Date() > user.otp.expiresAt) {
      return res.status(400).json({ 
        success: false, 
        message: "OTP expired. Please request a new one." 
      });
    }

    if (user.otp.code !== otp) {
      return res.status(400).json({ 
        success: false, 
        message: "Invalid OTP" 
      });
    }

    // 🔥 Store OLD session token before generating new one
    const oldSessionToken = user.sessionToken;

    // 🔥 Generate NEW session token (invalidates all other sessions)
    const newSessionToken = generateSessionToken();
    console.log(`🔐 New session token generated for ${mobile}`);
    
    if (oldSessionToken) {
      console.log(`❌ Old session token invalidated - OTHER DEVICES MUST LOGOUT NOW`);
    }
    
    user.sessionToken = newSessionToken;
    user.otp = { code: null, expiresAt: null };
    await user.save();

    const isNewUser = !user.isProfileComplete;

    res.json({ 
      success: true, 
      message: "OTP verified successfully",
      isNewUser,
      // 🔥 Signal to OTHER devices that they must logout
      invalidateOtherSessions: !!oldSessionToken,
      user: {
        id: user._id.toString(),
        mobile: user.mobile,
        name: user.name || "",
        email: user.email || "",
        gender: user.gender || "",
        isProfileComplete: user.isProfileComplete,
        sessionToken: newSessionToken
      }
    });

  } catch (error) {
    console.error("Verify OTP Error:", error);
    res.status(500).json({ 
      success: false, 
      message: "Failed to verify OTP" 
    });
  }
};

// Complete Profile (Step 3)
export const completeProfile = async (req, res) => {
  try {
    const { mobile, name, email, gender, sessionToken } = req.body;

    if (!name || !email || !gender) {
      return res.status(400).json({ 
        success: false, 
        message: "Name, email and gender are required" 
      });
    }

    const user = await User.findOne({ mobile });

    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: "User not found" 
      });
    }

    if (sessionToken && user.sessionToken !== sessionToken) {
      return res.status(401).json({ 
        success: false, 
        message: "Session expired. Please login again.",
        forceLogout: true
      });
    }

    user.name = name;
    user.email = email;
    user.gender = gender;
    user.isProfileComplete = true;
    await user.save();

    console.log(`✅ Profile completed for ${mobile}`);

    res.json({ 
      success: true, 
      message: "Profile completed successfully",
      user: {
        id: user._id.toString(),
        mobile: user.mobile,
        name: user.name,
        email: user.email,
        gender: user.gender,
        isProfileComplete: user.isProfileComplete,
        sessionToken: user.sessionToken
      }
    });

  } catch (error) {
    console.error("Complete Profile Error:", error);
    res.status(500).json({ 
      success: false, 
      message: "Failed to complete profile" 
    });
  }
};

// 🔥 ONLY USED ONCE - Check if current session is still valid
export const verifySession = async (req, res) => {
  try {
    const { userId, sessionToken } = req.body;

    if (!userId || !sessionToken) {
      return res.status(400).json({ 
        success: false, 
        message: "userId and sessionToken required",
        forceLogout: true
      });
    }

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: "User not found",
        forceLogout: true
      });
    }

    if (user.sessionToken !== sessionToken) {
      console.log(`❌ Invalid session token for ${user.mobile} - Session expired`);
      return res.status(401).json({ 
        success: false, 
        message: "Session expired. Logged in from another device.",
        forceLogout: true
      });
    }

    res.json({ 
      success: true, 
      message: "Session is valid",
      user: {
        id: user._id.toString(),
        mobile: user.mobile,
        name: user.name,
        email: user.email,
        gender: user.gender,
        isProfileComplete: user.isProfileComplete
      }
    });

  } catch (error) {
    console.error("Verify Session Error:", error);
    res.status(500).json({ 
      success: false, 
      message: "Failed to verify session",
      forceLogout: true
    });
  }
};

// Get User Details
export const getUserDetails = async (req, res) => {
  try {
    const { mobile } = req.params;
    const { sessionToken } = req.query;

    const user = await User.findOne({ mobile }).select('-otp');

    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: "User not found" 
      });
    }

    if (sessionToken && user.sessionToken !== sessionToken) {
      return res.status(401).json({ 
        success: false, 
        message: "Session expired",
        forceLogout: true
      });
    }

    res.json({ 
      success: true, 
      user: {
        id: user._id.toString(),
        mobile: user.mobile,
        name: user.name,
        email: user.email,
        gender: user.gender,
        isProfileComplete: user.isProfileComplete
      }
    });

  } catch (error) {
    console.error("Get User Details Error:", error);
    res.status(500).json({ 
      success: false, 
      message: "Failed to get user details" 
    });
  }
};

// Logout Endpoint
export const logout = async (req, res) => {
  try {
    const { userId } = req.body;

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: "User not found" 
      });
    }

    console.log(`🔓 User logged out: ${user.mobile}`);

    res.json({ 
      success: true, 
      message: "Logged out successfully" 
    });

  } catch (error) {
    console.error("Logout Error:", error);
    res.status(500).json({ 
      success: false, 
      message: "Failed to logout" 
    });
  }
};