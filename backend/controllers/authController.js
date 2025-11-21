// server/controllers/authController.js

import User from "../models/User.js";

// Generate 4-digit OTP
const generateOTP = () => {
  return Math.floor(1000 + Math.random() * 9000).toString();
};

// Send OTP (Step 1)
export const sendOTP = async (req, res) => {
  try {
    const { mobile } = req.body;

    // Validate mobile number
    const isValid = /^[6-9]\d{9}$/.test(mobile);
    if (!isValid) {
      return res.status(400).json({ 
        success: false, 
        message: "Invalid mobile number. Must start with 6-9 and be 10 digits." 
      });
    }

    // Generate OTP
    const otp = generateOTP();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

    // Check if user exists
    let user = await User.findOne({ mobile });

    if (user) {
      // Existing user - update OTP
      user.otp = { code: otp, expiresAt };
      await user.save();
    } else {
      // New user - create with OTP
      user = new User({
        mobile,
        otp: { code: otp, expiresAt }
      });
      await user.save();
    }

    // Log OTP to console/terminal
    console.log("\n========================================");
    console.log(`📱 OTP for ${mobile}: ${otp}`);
    console.log(`⏰ Expires at: ${expiresAt.toLocaleTimeString()}`);
    console.log("========================================\n");

    res.json({ 
      success: true, 
      message: "OTP sent successfully",
      isNewUser: !user.isProfileComplete
    });

  } catch (error) {
    console.error("Send OTP Error:", error);
    res.status(500).json({ 
      success: false, 
      message: "Failed to send OTP" 
    });
  }
};

// Verify OTP (Step 2)
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

    // Check if OTP is expired
    if (new Date() > user.otp.expiresAt) {
      return res.status(400).json({ 
        success: false, 
        message: "OTP expired. Please request a new one." 
      });
    }

    // Verify OTP
    if (user.otp.code !== otp) {
      return res.status(400).json({ 
        success: false, 
        message: "Invalid OTP" 
      });
    }

    // Clear OTP after successful verification
    user.otp = { code: null, expiresAt: null };
    await user.save();

    res.json({ 
      success: true, 
      message: "OTP verified successfully",
      isNewUser: !user.isProfileComplete,
      user: {
        id: user._id,
        mobile: user.mobile,
        name: user.name,
        email: user.email,
        gender: user.gender,
        isProfileComplete: user.isProfileComplete
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

// Complete Profile (Step 3 - Only for new users)
export const completeProfile = async (req, res) => {
  try {
    const { mobile, name, email, gender } = req.body;

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

    // Update profile
    user.name = name;
    user.email = email;
    user.gender = gender;
    user.isProfileComplete = true;
    await user.save();

    res.json({ 
      success: true, 
      message: "Profile completed successfully",
      user: {
        id: user._id,
        mobile: user.mobile,
        name: user.name,
        email: user.email,
        gender: user.gender,
        isProfileComplete: user.isProfileComplete
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

// Get User Details
export const getUserDetails = async (req, res) => {
  try {
    const { mobile } = req.params;

    const user = await User.findOne({ mobile }).select('-otp');

    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: "User not found" 
      });
    }

    res.json({ 
      success: true, 
      user: {
        id: user._id,
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