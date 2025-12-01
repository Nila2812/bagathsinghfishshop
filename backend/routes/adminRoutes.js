import express from "express";
import {
  getAdmins,
  getAdminById,
  createAdmin,
  updateAdmin,
  deleteAdmin,
  loginAdmin,
  verifyPassword,
  updatePassword
} from "../controllers/adminController.js";

const router = express.Router();

router.get("/", getAdmins);
router.get("/:id", getAdminById);
router.post("/", createAdmin);
router.put("/:id", updateAdmin);
router.delete("/:id", deleteAdmin);
router.post("/login", loginAdmin);
router.post("/verify-password", verifyPassword);
router.put("/:id/update-password", updatePassword);

export default router;