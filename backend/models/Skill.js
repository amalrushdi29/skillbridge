import mongoose from "mongoose";

const skillSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    category: {
      type: String,
      enum: [
        "Programming Language",
        "Frontend",
        "Backend",
        "Database",
        "Cloud",
        "DevOps",
        "Data Science",
        "Cybersecurity",
        "Mobile",
        "Tool",
        "Soft Skill",
        "Other",
      ],
      default: "Other",
    },
    level: {
      type: String,
      enum: ["Beginner", "Intermediate", "Advanced"],
      default: "Beginner",
    },
  },
  { timestamps: true }
);

export default mongoose.model("Skill", skillSchema);