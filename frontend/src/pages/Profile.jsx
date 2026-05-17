import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { Pencil, Trash2, Camera } from "lucide-react";
import Card from "../components/Card.jsx";
import config from "../config.js";

const Profile = () => {
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    role: "",
    bio: "",
    location: "",
    yearsOfExperience: 0,
    targetJobRole: "",
    careerObjectives: "",
    linkedinUrl: "",
    githubUrl: "",
  });

  const [avatar, setAvatar] = useState("");
  const [avatarFile, setAvatarFile] = useState(null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  const fileInputRef = useRef(null);
  const dropdownRef = useRef(null);

  // Auto dismiss message after 4 seconds
  useEffect(() => {
    if (message.text) {
      const timer = setTimeout(() => {
        setMessage({ type: "", text: "" });
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Fetch profile on page load
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await fetch(`${config.apiUrl}/profile`, {
          headers: {
            Authorization: `Bearer ${user.token}`,
          },
        });
        const data = await res.json();
        setFormData({
          name: data.name || "",
          role: data.role || "",
          bio: data.bio || "",
          location: data.location || "",
          yearsOfExperience: data.yearsOfExperience || 0,
          targetJobRole: data.targetJobRole || "",
          careerObjectives: data.careerObjectives || "",
          linkedinUrl: data.linkedinUrl || "",
          githubUrl: data.githubUrl || "",
        });
        setAvatar(data.avatar || "");
      } catch (error) {
        setMessage({ type: "error", text: "Failed to load profile" });
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  // Handle avatar file selection
  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setAvatarFile(file);
    setShowDropdown(false);
    await handleAvatarUpload(file);
  };

  // Handle avatar upload
  const handleAvatarUpload = async (file) => {
    setUploadingAvatar(true);
    setMessage({ type: "", text: "" });

    try {
      const formDataObj = new FormData();
      formDataObj.append("avatar", file);

      const res = await fetch(`${config.apiUrl}/upload/avatar`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
        body: formDataObj,
      });

      const data = await res.json();

      if (!res.ok) {
        setMessage({ type: "error", text: data.message });
        return;
      }

      setAvatar(data.avatar);
      setAvatarFile(null);
      updateUser({ avatar: data.avatar });
      setMessage({ type: "success", text: "Avatar uploaded successfully!" });
    } catch (error) {
      setMessage({ type: "error", text: "Failed to upload avatar" });
    } finally {
      setUploadingAvatar(false);
    }
  };

  // Handle avatar remove
  const handleAvatarRemove = async () => {
    setShowDropdown(false);
    try {
      const res = await fetch(`${config.apiUrl}/profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user.token}`,
        },
        body: JSON.stringify({ avatar: "" }),
      });

      if (!res.ok) {
        setMessage({ type: "error", text: "Failed to remove avatar" });
        return;
      }

      setAvatar("");
      updateUser({ avatar: "" });
      setMessage({ type: "success", text: "Avatar removed successfully!" });
    } catch (error) {
      setMessage({ type: "error", text: "Failed to remove avatar" });
    }
  };

  // Handle input changes
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Handle form submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage({ type: "", text: "" });

    try {
      const res = await fetch(`${config.apiUrl}/profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user.token}`,
        },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        setMessage({ type: "error", text: data.message });
        return;
      }

      updateUser({ name: formData.name });
      setMessage({ type: "success", text: "Profile updated successfully!" });
    } catch (error) {
      setMessage({ type: "error", text: "Something went wrong" });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500 dark:text-gray-400 text-lg">
          Loading profile...
        </p>
      </div>
    );
  }

  return (
    <Card maxWidth="max-w-2xl">
      {/* View Photo Modal */}
      {showModal && avatar && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70"
          onClick={() => setShowModal(false)}
        >
          <div className="w-72 h-72 rounded-full overflow-hidden border-4 border-white shadow-2xl">
            <img
              src={avatar}
              alt="Profile"
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      )}

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">
          My Profile
        </h1>
        <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
          Keep your profile updated to get accurate skill gap results
        </p>
      </div>

        {/* Success / Error Message */}
        {message.text && (
          <div
            className={`mb-6 px-4 py-3 rounded-lg text-sm font-medium ${
              message.type === "success"
                ? "bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-800"
                : "bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800"
            }`}
          >
            {message.text}
          </div>
        )}

        {/* Avatar Section */}
        <div className="flex flex-col items-center mb-8">
          <div className="relative" ref={dropdownRef}>

            {/* Avatar Image — click to view */}
            <div
              onClick={() => avatar && setShowModal(true)}
              className={`w-24 h-24 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-700 
                ${avatar ? "cursor-pointer" : ""}`}
            >
              {uploadingAvatar ? (
                <div className="w-full h-full flex items-center justify-center">
                  <p className="text-xs text-gray-400">Uploading...</p>
                </div>
              ) : avatar ? (
                <img
                  src={avatar}
                  alt="Avatar"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400 dark:text-gray-500 text-3xl">
                  👤
                </div>
              )}
            </div>

            {/* Edit Icon */}
            <button
              onClick={() => setShowDropdown(!showDropdown)}
              className="absolute bottom-0 right-0 w-7 h-7 bg-[#6366F1] rounded-full flex items-center justify-center shadow-md hover:bg-indigo-700 transition"
            >
              <Pencil size={12} className="text-white" />
            </button>

            {/* Dropdown Menu */}
            {showDropdown && (
              <div className="absolute top-full mt-2 left-1/2 -translate-x-1/2 w-44 bg-white dark:bg-[#0F172A] rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 z-10 overflow-hidden">

                {/* Change Photo */}
                <button
                  onClick={() => fileInputRef.current.click()}
                  className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 transition"
                >
                  <Camera size={15} />
                  Change Photo
                </button>

                {/* Remove Photo */}
                {avatar && (
                  <button
                    onClick={handleAvatarRemove}
                    className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition"
                  >
                    <Trash2 size={15} />
                    Remove Photo
                  </button>
                )}

              </div>
            )}

          </div>

          {/* Hidden File Input */}
          <input
            type="file"
            accept="image/*"
            onChange={handleAvatarChange}
            className="hidden"
            ref={fileInputRef}
          />

        </div>

        <form onSubmit={handleSubmit} className="space-y-5">

          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Full Name
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2.5 text-sm bg-white dark:bg-[#0F172A] text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-[#6366F1]"
              placeholder="Your full name"
            />
          </div>

          {/* Role */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Role
            </label>
            <select
              name="role"
              value={formData.role}
              onChange={handleChange}
              className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2.5 text-sm bg-white dark:bg-[#0F172A] text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-[#6366F1]"
            >
              <option value="student">Student</option>
              <option value="graduate">Graduate</option>
              <option value="professional">Professional</option>
            </select>
          </div>

          {/* Bio */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Bio
            </label>
            <textarea
              name="bio"
              value={formData.bio}
              onChange={handleChange}
              rows={3}
              maxLength={300}
              className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2.5 text-sm bg-white dark:bg-[#0F172A] text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-[#6366F1] resize-none"
              placeholder="Tell us a little about yourself (max 300 characters)"
            />
          </div>

          {/* Location */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Location
            </label>
            <input
              type="text"
              name="location"
              value={formData.location}
              onChange={handleChange}
              className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2.5 text-sm bg-white dark:bg-[#0F172A] text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-[#6366F1]"
              placeholder="e.g. Kurunegala, Sri Lanka"
            />
          </div>

          {/* Years of Experience */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Years of Experience
            </label>
            <input
              type="number"
              name="yearsOfExperience"
              value={formData.yearsOfExperience}
              onChange={handleChange}
              min={0}
              className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2.5 text-sm bg-white dark:bg-[#0F172A] text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-[#6366F1]"
              placeholder="e.g. 2"
            />
          </div>

          {/* Target Job Role */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Target Job Role
            </label>
            <input
              type="text"
              name="targetJobRole"
              value={formData.targetJobRole}
              onChange={handleChange}
              className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2.5 text-sm bg-white dark:bg-[#0F172A] text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-[#6366F1]"
              placeholder="e.g. Full Stack Developer"
            />
          </div>

          {/* Career Objectives */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Career Objectives
            </label>
            <textarea
              name="careerObjectives"
              value={formData.careerObjectives}
              onChange={handleChange}
              rows={4}
              maxLength={500}
              className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2.5 text-sm bg-white dark:bg-[#0F172A] text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-[#6366F1] resize-none"
              placeholder="Describe your career goals (max 500 characters)"
            />
          </div>

          {/* LinkedIn */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              LinkedIn URL
            </label>
            <input
              type="text"
              name="linkedinUrl"
              value={formData.linkedinUrl}
              onChange={handleChange}
              className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2.5 text-sm bg-white dark:bg-[#0F172A] text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-[#6366F1]"
              placeholder="linkedin.com/in/yourname"
            />
          </div>

          {/* GitHub */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              GitHub URL
            </label>
            <input
              type="text"
              name="githubUrl"
              value={formData.githubUrl}
              onChange={handleChange}
              className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2.5 text-sm bg-white dark:bg-[#0F172A] text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-[#6366F1]"
              placeholder="github.com/yourusername"
            />
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              disabled={saving}
              className="flex-1 bg-[#6366F1] text-white py-2.5 rounded-lg text-sm font-medium hover:bg-indigo-700 transition disabled:opacity-50"
            >
              {saving ? "Saving..." : "Save Changes"}
            </button>
            <button
              type="button"
              onClick={() => navigate("/dashboard")}
              className="flex-1 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 py-2.5 rounded-lg text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition"
            >
              Back to Dashboard
            </button>
          </div>

        </form>
    </Card>
  );
};

export default Profile;