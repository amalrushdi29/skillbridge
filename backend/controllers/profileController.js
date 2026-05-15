import User from "../models/User.js";

// @desc    Get logged in user's profile
// @route   GET /api/profile
// @access  Private
export const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update logged in user's profile
// @route   PUT /api/profile
// @access  Private
export const updateProfile = async (req, res) => {
  try {
    const {
      name,
      role,
      bio,
      location,
      yearsOfExperience,
      targetJobRole,
      careerObjectives,
      linkedinUrl,
      githubUrl,
    } = req.body;

    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Update only the fields that were sent
    if (name) user.name = name;
    if (role) user.role = role;
    if (bio) user.bio = bio;
    if (location) user.location = location;
    if (yearsOfExperience !== undefined) user.yearsOfExperience = yearsOfExperience;
    if (targetJobRole) user.targetJobRole = targetJobRole;
    if (careerObjectives) user.careerObjectives = careerObjectives;
    if (linkedinUrl) user.linkedinUrl = linkedinUrl;
    if (githubUrl) user.githubUrl = githubUrl;

    const updatedUser = await user.save();

    res.status(200).json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      role: updatedUser.role,
      avatar: updatedUser.avatar,
      bio: updatedUser.bio,
      location: updatedUser.location,
      yearsOfExperience: updatedUser.yearsOfExperience,
      targetJobRole: updatedUser.targetJobRole,
      careerObjectives: updatedUser.careerObjectives,
      linkedinUrl: updatedUser.linkedinUrl,
      githubUrl: updatedUser.githubUrl,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};