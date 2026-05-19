import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: 6,
    },
    role: {
      type: String,
      enum: ["student", "graduate", "professional"],
      default: "student",
    },

    // --- Profile Fields ---
    avatar: {
      type: String,
      default: "",
    },
    cvUrl: {
      type: String,
      default: "",
    },
    bio: {
      type: String,
      default: "",
      maxlength: 300,
    },
    location: {
      type: String,
      default: "",
      trim: true,
    },
    yearsOfExperience: {
      type: Number,
      default: 0,
      min: 0,
    },
    targetJobRole: {
      type: String,
      default: "",
      trim: true,
    },
    careerObjectives: {
      type: String,
      default: "",
      maxlength: 500,
    },
    linkedinUrl: {
      type: String,
      default: "",
      trim: true,
    },
    githubUrl: {
      type: String,
      default: "",
      trim: true,
    },

    // --- Auth Fields ---
    resetPasswordToken: {
      type: String,
      default: null,
    },
    resetPasswordExpire: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

// Hash password before saving
userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  this.password = await bcrypt.hash(this.password, 10);
});

// Method to compare passwords on login
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model("User", userSchema);
export default User;