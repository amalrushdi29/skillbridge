import express from "express";
import protect from "../middleware/authMiddleware.js";
import { getSkills, addSkill, updateSkill, deleteSkill } from "../controllers/skillController.js";

const router = express.Router();
router.get("/", protect, getSkills);
router.post("/", protect, addSkill);
router.put("/:id", protect, updateSkill);
router.delete("/:id", protect, deleteSkill);

export default router;