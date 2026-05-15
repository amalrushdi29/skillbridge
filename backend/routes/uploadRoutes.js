import express from "express";
import multer from "multer";
import cloudinary from "../utils/cloudinary.js";
import User from "../models/User.js";
import protect from "../middleware/authMiddleware.js";

const router = express.Router();

// Multer setup — store file in memory temporarily
const storage = multer.memoryStorage();
const upload = multer({ 
  storage,
  limits: { fileSize: 2 * 1024 * 1024 }, // 2MB max
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Only image files are allowed"), false);
    }
  }
});

// @desc    Upload avatar
// @route   POST /api/upload/avatar
// @access  Private
router.post("/avatar", protect, upload.single("avatar"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    // Convert file buffer to base64
    const fileStr = `data:${req.file.mimetype};base64,${req.file.buffer.toString("base64")}`;

    // Upload to Cloudinary
    const uploadResponse = await cloudinary.uploader.upload(fileStr, {
      folder: "skillbridge/avatars",
      transformation: [{ width: 300, height: 300, crop: "fill" }],
    });

    // Save URL to user in MongoDB
    const user = await User.findById(req.user.id);
    user.avatar = uploadResponse.secure_url;
    await user.save();

    res.status(200).json({ 
      message: "Avatar uploaded successfully",
      avatar: uploadResponse.secure_url 
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;