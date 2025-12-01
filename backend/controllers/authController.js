// server/controllers/authController.js - WITH UPDATE PROFILE + ADMIN FUNCTIONS

import User from "../models/User.js";
import Address from "../models/Address.js";
import Order from "../models/Order.js";
import crypto from "crypto";
import DeviceBlock from "../models/DeviceBlock.js";

const generateOTP = () => {
  return Math.floor(1000 + Math.random() * 9000).toString();
};

const generateSessionToken = () => {
  return crypto.randomBytes(32).toString("hex");
};

const getClientIp = (req) => {
  return req.headers['x-forwarded-for']?.split(',')[0].trim() 
    || req.headers['x-real-ip'] 
    || req.connection.remoteAddress 
    || req.socket.remoteAddress 
    || req.ip;
};

const checkDeviceStatus = async (ipAddress) => {
  const deviceBlock = await DeviceBlock.findOne({ ipAddress });
  
  if (!deviceBlock) {
    return { isBlocked: false, resendCount: 0 };
  }

  const now = Date.now();
  
  if (deviceBlock.blockedUntil && now >= deviceBlock.blockedUntil.getTime()) {
    await DeviceBlock.updateOne(
      { ipAddress },
      { 
        $set: { resendCount: 0, blockedUntil: null },
        $currentDate: { lastAttempt: true }
      }
    );
    return { isBlocked: false, resendCount: 0 };
  }

  if (deviceBlock.blockedUntil && now < deviceBlock.blockedUntil.getTime()) {
    return { 
      isBlocked: true, 
      blockUntil: deviceBlock.blockedUntil.getTime(),
      resendCount: deviceBlock.resendCount 
    };
  }

  return { 
    isBlocked: false, 
    resendCount: deviceBlock.resendCount 
  };
};

export const checkDeviceBlock = async (req, res) => {
  try {
    const ipAddress = getClientIp(req);
    const status = await checkDeviceStatus(ipAddress);
    
    res.json(status);
  } catch (error) {
    console.error("Error checking device block:", error);
    res.json({ isBlocked: false, resendCount: 0 });
  }
};

export const sendOTP = async (req, res) => {
  try {
    const { mobile } = req.body;
    const ipAddress = getClientIp(req);

    const isValid = /^[6-9]\d{9}$/.test(mobile);
    if (!isValid) {
      return res.status(400).json({ 
        success: false, 
        message: "Invalid mobile number. Must start with 6-9 and be 10 digits." 
      });
    }

    const deviceStatus = await checkDeviceStatus(ipAddress);
    
    if (deviceStatus.isBlocked) {
      return res.json({
        success: false,
        blocked: true,
        blockUntil: deviceStatus.blockUntil,
        message: "Device temporarily blocked due to too many attempts"
      });
    }

    const otp = generateOTP();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

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

    const newResendCount = deviceStatus.resendCount + 1;
    
    await DeviceBlock.findOneAndUpdate(
      { ipAddress },
      { 
        $set: { resendCount: newResendCount },
        $currentDate: { lastAttempt: true }
      },
      { upsert: true, new: true }
    );

    if (newResendCount >= 3) {
      const blockDuration = 3.5 * 60 * 60 * 1000;
      const blockUntil = new Date(Date.now() + blockDuration);
      
      await DeviceBlock.updateOne(
        { ipAddress },
        { $set: { blockedUntil: blockUntil } }
      );

      return res.json({
        success: false,
        blocked: true,
        blockUntil: blockUntil.getTime(),
        message: "Device blocked due to too many attempts"
      });
    }

    console.log("\n========================================");
    console.log(`📱 OTP for ${mobile}: ${otp}`);
    console.log(`⏰ Expires at: ${expiresAt.toLocaleTimeString()}`);
    console.log(`${isNewUser ? "🆕 NEW USER" : "👤 EXISTING USER"}`);
    console.log(`🔢 Resend Count: ${newResendCount}/3`);
    console.log(`🌐 IP Address: ${ipAddress}`);
    console.log("========================================\n");

    res.json({ 
      success: true, 
      message: "OTP sent successfully",
      isNewUser,
      resendCount: newResendCount
    });

  } catch (error) {
    console.error("Send OTP Error:", error);
    res.status(500).json({ 
      success: false, 
      message: "Failed to send OTP" 
    });
  }
};

export const verifyOTP = async (req, res) => {
  try {
    const { mobile, otp } = req.body;
    const ipAddress = getClientIp(req);

    const deviceStatus = await checkDeviceStatus(ipAddress);
    
    if (deviceStatus.isBlocked) {
      return res.json({
        success: false,
        blocked: true,
        blockUntil: deviceStatus.blockUntil,
        message: "Device temporarily blocked"
      });
    }

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

    const oldSessionToken = user.sessionToken;
    const newSessionToken = generateSessionToken();
    
    console.log(`🔐 New session token generated for ${mobile}`);
    
    if (oldSessionToken) {
      console.log(`❌ Old session token invalidated - OTHER DEVICES MUST LOGOUT NOW`);
    }
    
    user.sessionToken = newSessionToken;
    user.otp = { code: null, expiresAt: null };
    await user.save();

    await DeviceBlock.deleteOne({ ipAddress });
    console.log(`✅ Device block cleared for IP: ${ipAddress}`);

    const isNewUser = !user.isProfileComplete;

    res.json({ 
      success: true, 
      message: "OTP verified successfully",
      isNewUser,
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

export const updateProfile = async (req, res) => {
  try {
    const { userId } = req.params;
    const { name, email, gender, sessionToken } = req.body;

    if (!name || !email || !gender) {
      return res.status(400).json({ 
        success: false, 
        message: "Name, email and gender are required" 
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ 
        success: false, 
        message: "Invalid email format" 
      });
    }

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: "User not found" 
      });
    }

    // Verify session
    if (sessionToken && user.sessionToken !== sessionToken) {
      return res.status(401).json({ 
        success: false, 
        message: "Session expired. Please login again.",
        forceLogout: true
      });
    }

    // Update profile
    user.name = name;
    user.email = email;
    user.gender = gender;
    await user.save();

    console.log(`✅ Profile updated for ${user.mobile}`);

    res.json({ 
      success: true, 
      message: "Profile updated successfully",
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
    console.error("Update Profile Error:", error);
    res.status(500).json({ 
      success: false, 
      message: "Failed to update profile" 
    });
  }
};

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

// ==========================================
// ADMIN FUNCTIONS (NEW)
// ==========================================

export const getAllUsers = async (req, res) => {
  try {
    console.log("📊 Fetching all users...");
    
    const users = await User.find()
      .select('-otp -sessionToken')
      .sort({ createdAt: -1 });
    
    console.log(`✅ Found ${users.length} users`);
    
    res.json(users);
  } catch (error) {
    console.error("❌ Get all users error:", error);
    res.status(500).json({ 
      success: false, 
      message: "Failed to fetch users" 
    });
  }
};

export const deleteUser = async (req, res) => {
  try {
    const { userId } = req.params;
    
    console.log(`🗑️ Attempting to delete user: ${userId}`);
    
    const user = await User.findByIdAndDelete(userId);
    
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: "User not found" 
      });
    }

    // Cascade delete addresses and orders
    const addressDeleteResult = await Address.deleteMany({ userId });
    const orderDeleteResult = await Order.deleteMany({ userId });
    
    console.log(`✅ User deleted: ${user.mobile}`);
    console.log(`   - ${addressDeleteResult.deletedCount} addresses deleted`);
    console.log(`   - ${orderDeleteResult.deletedCount} orders deleted`);

    res.json({ 
      success: true, 
      message: "User and all associated data deleted successfully",
      deletedData: {
        addresses: addressDeleteResult.deletedCount,
        orders: orderDeleteResult.deletedCount
      }
    });

  } catch (error) {
    console.error("❌ Delete user error:", error);
    res.status(500).json({ 
      success: false, 
      message: "Failed to delete user" 
    });
  }
};