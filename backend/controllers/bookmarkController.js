import Bookmark from "../models/Bookmark.js";

// ── Add a bookmark ──
export const addBookmark = async (req, res) => {
  try {
    const { jobId, jobTitle, company, location, jobLevel, jobType, jobSkills, jobLink, datePosted, matchPercentage } = req.body;

    const existing = await Bookmark.findOne({ user: req.user.id, jobId });
    if (existing) {
      return res.status(400).json({ message: "Job already bookmarked" });
    }

    const bookmark = await Bookmark.create({
      user: req.user.id,
      jobId,
      jobTitle,
      company,
      location,
      jobLevel,
      jobType,
      jobSkills,
      jobLink,
      datePosted,
      matchPercentage,
    });

    res.status(201).json(bookmark);
  } catch (err) {
    res.status(500).json({ message: "Failed to add bookmark", error: err.message });
  }
};

// ── Remove a bookmark ──
export const removeBookmark = async (req, res) => {
  try {
    const { jobId } = req.params;

    await Bookmark.findOneAndDelete({ user: req.user.id, jobId });

    res.json({ message: "Bookmark removed" });
  } catch (err) {
    res.status(500).json({ message: "Failed to remove bookmark", error: err.message });
  }
};

// ── Get all bookmarks for logged in user ──
export const getBookmarks = async (req, res) => {
  try {
    const bookmarks = await Bookmark.find({ user: req.user.id }).sort({ createdAt: -1 });
    res.json(bookmarks);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch bookmarks", error: err.message });
  }
};

// ── Get just the bookmarked job IDs ──
export const getBookmarkedIds = async (req, res) => {
  try {
    const bookmarks = await Bookmark.find({ user: req.user.id }).select("jobId");
    const ids = bookmarks.map((b) => b.jobId);
    res.json(ids);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch bookmark IDs", error: err.message });
  }
};