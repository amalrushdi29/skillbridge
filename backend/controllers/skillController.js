import Skill from "../models/Skill.js";

// Get all skills for logged in user
const getSkills = async (req, res) => {
  try {
    const skills = await Skill.find({ user: req.user.id }).sort({
      createdAt: -1,
    });
    res.json(skills);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// Add a new skill
const addSkill = async (req, res) => {
  try {
    const { name, category, level } = req.body;

    if (!name) {
      return res.status(400).json({ message: "Skill name is required" });
    }

    // Check if skill already exists for this user
    const existing = await Skill.findOne({
      user: req.user.id,
      name: { $regex: new RegExp(`^${name}$`, "i") },
    });

    if (existing) {
      return res.status(400).json({ message: "You already have this skill" });
    }

    const skill = await Skill.create({
      user: req.user.id,
      name,
      category,
      level,
    });

    res.status(201).json(skill);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// Update a skill
const updateSkill = async (req, res) => {
  try {
    const { name, category, level } = req.body;

    const skill = await Skill.findOne({
      _id: req.params.id,
      user: req.user.id,
    });

    if (!skill) {
      return res.status(404).json({ message: "Skill not found" });
    }

    skill.name = name || skill.name;
    skill.category = category || skill.category;
    skill.level = level || skill.level;

    await skill.save();
    res.json(skill);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// Delete a skill
const deleteSkill = async (req, res) => {
  try {
    const skill = await Skill.findOne({
      _id: req.params.id,
      user: req.user.id,
    });

    if (!skill) {
      return res.status(404).json({ message: "Skill not found" });
    }

    await skill.deleteOne();
    res.json({ message: "Skill deleted" });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

export { getSkills, addSkill, updateSkill, deleteSkill };