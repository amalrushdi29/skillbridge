import express from "express";
import {
  register,
  login,
  forgotPassword,
  resetPassword,
  changePassword,
  changeEmail,
  deleteAccount,
} from "../controllers/authController.js";
import protect from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.post("/forgot-password", forgotPassword);
router.put("/reset-password/:token", resetPassword);
router.put("/change-password", protect, changePassword);
router.put("/change-email", protect, changeEmail);
router.delete("/delete-account", protect, deleteAccount);

export default router;