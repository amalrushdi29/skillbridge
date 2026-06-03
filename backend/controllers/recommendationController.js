import axios from "axios";
import Skill from "../models/Skill.js";
import User from "../models/User.js";
import { GoogleGenerativeAI } from "@google/generative-ai";
import config from "../config.js";
const { geminiApiKey: GEMINI_API_KEY, flaskUrl: FLASK_URL } = config;

const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

export const getRecommendations = async (req, res) => {
  try {
    // 1. Fetch user's skills and profile from MongoDB
    const skills = await Skill.find({ user: req.user.id });
    const user = await User.findById(req.user.id);

    const userSkills = skills.map((s) => s.name.toLowerCase());
    const targetRole = user.targetJobRole || "Software Engineer";
    const experience = user.yearsOfExperience || 0;

    if (userSkills.length === 0) {
      return res.status(400).json({
        message: "Please add your skills first before getting recommendations.",
      });
    }

    // 2. Call Flask skill-gap API to get missing skills
    const flaskResponse = await axios.post(`${FLASK_URL}/skill-gap`, {
    skills: userSkills,
    targetRole: targetRole,
    yearsOfExperience: experience,
    });

    const missingSkills = flaskResponse.data.missingSkills || [];

    if (missingSkills.length === 0) {
      return res.json({
        targetRole,
        recommendations: [],
        message: "Great news! You already have all the key skills for this role.",
      });
    }

    // 3. Take top 8 missing skills to keep Gemini prompt short and fast
    const topMissingSkills = missingSkills.slice(0, 8);

    // 4. Build the Gemini prompt
    const prompt = `
You are a career advisor for IT professionals.

The user wants to become a "${targetRole}" and has ${experience} years of experience.
They are missing these skills (ranked by job market demand, most important first):
${topMissingSkills.map((s, i) => `${i + 1}. ${s}`).join("\n")}

For each skill, provide a JSON array. Each object must have EXACTLY these fields:
- skill: skill name (string)
- importance: one sentence explaining why employers demand this skill (string)
- estimatedTime: realistic time to learn e.g. "2-3 weeks" (string)
- resources: array of exactly 3 objects, each with:
  - title: resource name (string)
  - type: one of "YouTube", "Documentation", "Free Course" (string)
  - url: real working URL (string)

Return ONLY a valid JSON array. No explanation, no markdown, no backticks.
`;

    // 5. Call Gemini
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    const result = await model.generateContent(prompt);
    const rawText = result.response.text().trim();

    // 6. Parse Gemini response safely
    let recommendations = [];
    try {
      recommendations = JSON.parse(rawText);
    } catch {
      // Sometimes Gemini wraps response in backticks despite instructions
      const cleaned = rawText.replace(/```json|```/g, "").trim();
      recommendations = JSON.parse(cleaned);
    }

    res.json({
      targetRole,
      matchPercentage: flaskResponse.data.match_percentage,
      totalMissing: missingSkills.length,
      recommendations,
    });
  } catch (error) {
    console.error("Recommendations error:", error.response?.data || error.message);
    res.status(500).json({ message: "Failed to generate recommendations." });
  }
};