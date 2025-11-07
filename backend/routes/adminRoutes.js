// routes/adminRoutes.js
import express from "express";
import {
  getAdmins,
  createAdmin,
  deleteAdmin,
  loginAdmin,
} from "../controllers/adminController.js";

const router = express.Router();

router.get("/", getAdmins);
router.post("/", createAdmin);
router.delete("/:id", deleteAdmin);
router.post("/login",loginAdmin);

export default router;
