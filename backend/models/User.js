// server/models/User.js

import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
  {
    mobile: { 
      type: String, 
      required: true, 
      unique: true,
      match: /^[6-9]\d{9}$/
    },
    name: { 
      type: String, 
      default: "" 
    },
    email: { 
      type: String, 
      default: "" 
    },
    gender: { 
      type: String, 
      enum: ["male", "female", "other", ""], 
      default: "" 
    },
    isProfileComplete: { 
      type: Boolean, 
      default: false 
    },
    otp: {
      code: { type: String },
      expiresAt: { type: Date }
    }
  },
  { timestamps: true }
);

export default mongoose.model("User", UserSchema);