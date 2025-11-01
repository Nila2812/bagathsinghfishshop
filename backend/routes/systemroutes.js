import express from "express";
import mongoose from "mongoose";

const router = express.Router();

router.get("/health", async (req, res) => {
  try {
    const dbState = mongoose.connection.readyState; // 1 = connected
    res.json({
      api: "online",
      database: dbState === 1 ? "connected" : "disconnected",
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    res.status(500).json({
      api: "offline",
      database: "error",
      timestamp: new Date().toISOString(),
    });
  }
});

export default router;