import express from "express";
import protect from "../middleware/authMiddleware.js";
import {
  predictEmployability,
  getSkillGap,
  searchRoles,
  getTopSkills,
  checkHealth,
} from "../utils/mlService.js";

const router = express.Router();

// GET /api/ml/health
router.get("/health", async (req, res) => {
  try {
    const health = await checkHealth();
    res.json(health);
  } catch (error) {
    res.status(503).json({
      error: "ML service unavailable",
      details: error.message,
    });
  }
});

// GET /api/ml/top-skills
router.get("/top-skills", async (req, res) => {
  try {
    const data = await getTopSkills();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/ml/roles?search=query
router.get("/roles", protect, async (req, res) => {
  try {
    const { search } = req.query;

    if (!search || search.trim().length < 2) {
      return res.json({ success: true, roles: [], total: 0 });
    }

    const result = await searchRoles(search.trim());
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/ml/predict
router.post("/predict", protect, async (req, res) => {
  try {
    const { skills, jobType } = req.body;

    if (!skills || skills.length === 0) {
      return res.status(400).json({ error: "Skills are required" });
    }

    const result = await predictEmployability(skills, jobType);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/ml/skill-gap
router.post("/skill-gap", protect, async (req, res) => {
  try {
    const { skills, targetRole, yearsOfExperience, jobType } = req.body;

    if (!skills || skills.length === 0) {
      return res.status(400).json({ error: "Skills are required" });
    }

    if (!targetRole) {
      return res.status(400).json({ error: "Target role is required" });
    }

    const result = await getSkillGap(
      skills,
      targetRole,
      yearsOfExperience || 0,
      jobType || "full-time"
    );

    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;