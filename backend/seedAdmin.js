import mongoose from "mongoose";
import bcrypt from "bcrypt";
import Admin from "./models/Admin.js"; // adjust path if needed

const seedAdmin = async () => {
  try {
    await mongoose.connect("mongodb://localhost:27017/bagathsinghfishshop", {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    const hashedPassword = await bcrypt.hash("admin1234", 10);

    const newAdmin = new Admin({
      username: "admin1",
      password: hashedPassword,
      shopName: "Ocean Fresh",
      address: "123 Sea Street, Madurai",
      phone: "9876543210",
      whatsappNumber: "9876543210",
      coordinates: {
        lat: 9.9252,
        lng: 78.1198,
      },
    });

    await newAdmin.save();
    console.log("✅ Admin seeded successfully");
  } catch (err) {
    console.error("❌ Seeding failed:", err);
  } finally {
    mongoose.connection.close();
  }
};

seedAdmin();