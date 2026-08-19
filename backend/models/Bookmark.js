import mongoose from "mongoose";

const bookmarkSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },  
    jobId: {
      type: String,
      required: true,
    },
    jobTitle: { type: String, default: "" },
    company:  { type: String, default: "" },
    location: { type: String, default: "" },
    jobLevel: { type: String, default: "" },
    jobType:  { type: String, default: "" },
    jobSkills:  { type: [String], default: [] },
    jobLink:  { type: String, default: "" },
    datePosted: { type: String, default: "" },
    matchPercentage: { type: Number, default: 0 },
  },
  { timestamps: true }
);

// One user can't bookmark the same job twice
bookmarkSchema.index({ user: 1, jobId: 1 }, { unique: true });

export default mongoose.model("Bookmark", bookmarkSchema);