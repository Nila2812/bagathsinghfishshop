// server/models/Address.js

import mongoose from "mongoose";

const AddressSchema = new mongoose.Schema(
  {
    // Either userId (logged in) OR clientId (guest)
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      index: true,
      sparse: true
    },
    clientId: {
      type: String,
      index: true,
      sparse: true
    },
    doorNo: { type: String, default: "" },
    street: { type: String, default: "" },
    locality: { type: String, default: "" },
    landmark: { type: String, default: "" },
    pincode: { type: String, default: "" },
    district: { type: String, default: "" },
    state: { type: String, default: "" },
    city: { type: String, default: "" },
    name: { type: String, default: "" },
    phone: { type: String, default: "" },
    saveAs: { type: String, enum: ["home", "work", "other"], default: "home" },
    fullAddress: { type: String, default: "" },
    lat: { type: Number, required: true },
    lon: { type: Number, required: true },
    isDefault: { type: Boolean, default: false }
  },
  { timestamps: true }
);

// 🔥 Separate indices for userId and clientId
AddressSchema.index({ userId: 1, isDefault: 1 }, { sparse: true });
AddressSchema.index({ clientId: 1, isDefault: 1 }, { sparse: true });

export default mongoose.model("Address", AddressSchema);