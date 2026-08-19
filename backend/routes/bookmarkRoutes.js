import express from "express";
import {
  addBookmark,
  removeBookmark,
  getBookmarks,
  getBookmarkedIds,
} from "../controllers/bookmarkController.js";
import protect from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/",        protect, getBookmarks);
router.get("/ids",     protect, getBookmarkedIds);
router.post("/",       protect, addBookmark);
router.delete("/:jobId", protect, removeBookmark);

export default router;