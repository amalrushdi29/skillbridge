import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext.jsx";
import Card from "../components/Card.jsx";
import config from "../config.js";
import { Zap, Plus, Pencil, Trash2, X, Check } from "lucide-react";

const categories = [
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
];

const levels = ["Beginner", "Intermediate", "Advanced"];

const levelColors = {
  Beginner: "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300",
  Intermediate: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300",
  Advanced: "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300",
};

const categoryColors = {
  "Programming Language": "bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300",
  Frontend: "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300",
  Backend: "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300",
  Database: "bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300",
  Cloud: "bg-sky-100 text-sky-700 dark:bg-sky-900 dark:text-sky-300",
  DevOps: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300",
  "Data Science": "bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-300",
  Cybersecurity: "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300",
  Mobile: "bg-pink-100 text-pink-700 dark:bg-pink-900 dark:text-pink-300",
  Tool: "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300",
  "Soft Skill": "bg-pink-100 text-pink-700 dark:bg-pink-900 dark:text-pink-300",
  Other: "bg-teal-100 text-teal-700 dark:bg-teal-900 dark:text-teal-300",
};

const Skills = () => {
  const { user } = useAuth();
  const [skills, setSkills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState({ type: "", text: "" });

  // Add form state
  const [showForm, setShowForm] = useState(false);
  const [newSkill, setNewSkill] = useState({
    name: "",
    category: "Other",
    level: "Beginner",
  });

  // Edit state
  const [editingId, setEditingId] = useState(null);
  const [editData, setEditData] = useState({});

  // Search, filter, sort state
  const [search, setSearch] = useState("");
  const [filterCategory, setFilterCategory] = useState("All");
  const [filterLevel, setFilterLevel] = useState("All");
  const [sortOrder, setSortOrder] = useState("newest");

  const [deleteConfirmId, setDeleteConfirmId] = useState(null);

  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: "", text: "" }), 4000);
  };

  const fetchSkills = async () => {
    try {
      const res = await fetch(`${config.apiUrl}/skills`, {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      const data = await res.json();
      setSkills(data);
    } catch (error) {
      showMessage("error", "Failed to load skills");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSkills();
  }, []);

  const handleAdd = async () => {
    if (!newSkill.name.trim()) {
      showMessage("error", "Skill name is required");
      return;
    }
    try {
      const res = await fetch(`${config.apiUrl}/skills`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user.token}`,
        },
        body: JSON.stringify(newSkill),
      });
      const data = await res.json();
      if (!res.ok) {
        showMessage("error", data.message);
        return;
      }
      setSkills([data, ...skills]);
      setNewSkill({ name: "", category: "Other", level: "Beginner" });
      setShowForm(false);
      showMessage("success", "Skill added successfully!");
    } catch (error) {
      showMessage("error", "Failed to add skill");
    }
  };

  const handleEdit = (skill) => {
    setEditingId(skill._id);
    setEditData({ name: skill.name, category: skill.category, level: skill.level });
  };

  const handleUpdate = async (id) => {
    try {
      const res = await fetch(`${config.apiUrl}/skills/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user.token}`,
        },
        body: JSON.stringify(editData),
      });
      const data = await res.json();
      if (!res.ok) {
        showMessage("error", data.message);
        return;
      }
      setSkills(skills.map((s) => (s._id === id ? data : s)));
      setEditingId(null);
      showMessage("success", "Skill updated successfully!");
    } catch (error) {
      showMessage("error", "Failed to update skill");
    }
  };

  const handleDelete = async (id) => {
    if (deleteConfirmId !== id) {
      setDeleteConfirmId(id);
      return;
    }
    try {
      const res = await fetch(`${config.apiUrl}/skills/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${user.token}` },
      });
      if (!res.ok) {
        showMessage("error", "Failed to delete skill");
        return;
      }
      setSkills(skills.filter((s) => s._id !== id));
      setDeleteConfirmId(null);
      showMessage("success", "Skill deleted successfully!");
    } catch (error) {
      showMessage("error", "Failed to delete skill");
    }
  };

    // Filter, search and sort logic
  const filteredSkills = skills
    .filter((s) => s.name.toLowerCase().includes(search.toLowerCase()))
    .filter((s) => filterCategory === "All" || s.category === filterCategory)
    .filter((s) => filterLevel === "All" || s.level === filterLevel)
    .sort((a, b) => {
      if (sortOrder === "newest") return new Date(b.createdAt) - new Date(a.createdAt);
      if (sortOrder === "oldest") return new Date(a.createdAt) - new Date(b.createdAt);
      if (sortOrder === "alphabetical") return a.name.localeCompare(b.name);
    });

  // Skill count grouped by category
  const categoryCount = skills.reduce((acc, skill) => {
    acc[skill.category] = (acc[skill.category] || 0) + 1;
    return acc;
  }, {});

  return (
    <Card>
      <div className="space-y-6">
        
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Zap size={22} className="text-[#6366F1]" />
            <h2 className="text-xl font-bold text-gray-800 dark:text-white">
              My Skills
            </h2>
            <span className="ml-2 text-sm bg-[#6366F1] text-white px-2 py-0.5 rounded-full">
              {skills.length}
            </span>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-2 bg-[#6366F1] hover:bg-[#4F46E5] text-white text-sm font-medium px-4 py-2 rounded-lg transition"
          >
            <Plus size={16} />
            Add Skill
          </button>
        </div>

        {/* Message */}
        {message.text && (
          <div
            className={`text-sm px-4 py-2 rounded-lg ${
              message.type === "success"
                ? "bg-green-100 text-green-700"
                : "bg-red-100 text-red-700"
            }`}
          >
            {message.text}
          </div>
        )}  

        {/* Search, Filter and Sort */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
          <input
            type="text"
            placeholder="Search skills..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-[#0F172A] text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#6366F1]"
          />
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-[#0F172A] text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#6366F1]"
          >
            <option value="All">All Categories</option>
            {categories.map((c) => <option key={c}>{c}</option>)}
          </select>
          <select
            value={filterLevel}
            onChange={(e) => setFilterLevel(e.target.value)}
            className="border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-[#0F172A] text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#6366F1]"
          >
            <option value="All">All Levels</option>
            {levels.map((l) => <option key={l}>{l}</option>)}
          </select>
          <select
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value)}
            className="border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-[#0F172A] text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#6366F1]"
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="alphabetical">Alphabetical</option>
          </select>
        </div>

        {/* Add Skill Form */}
            {showForm && (
              <div className="bg-white dark:bg-[#1E293B] border border-gray-200 dark:border-gray-700 rounded-xl p-5 space-y-4">
                <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Add New Skill
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <input
                    type="text"
                    placeholder="Skill name e.g. React.js"
                    value={newSkill.name}
                    onChange={(e) => setNewSkill({ ...newSkill, name: e.target.value })}
                    className="border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-[#0F172A] text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#6366F1]"
                  />
                  <select
                    value={newSkill.category}
                    onChange={(e) => setNewSkill({ ...newSkill, category: e.target.value })}
                    className="border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-[#0F172A] text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#6366F1]"
                  >
                    {categories.map((c) => <option key={c}>{c}</option>)}
                  </select>
                  <select
                    value={newSkill.level}
                    onChange={(e) => setNewSkill({ ...newSkill, level: e.target.value })}
                    className="border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-[#0F172A] text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#6366F1]"
                  >
                    {levels.map((l) => <option key={l}>{l}</option>)}
                  </select>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={handleAdd}
                    className="flex items-center gap-2 bg-[#6366F1] hover:bg-[#4F46E5] text-white text-sm font-medium px-4 py-2 rounded-lg transition"
                  >
                    <Check size={15} /> Save Skill
                  </button>
                  <button
                    onClick={() => setShowForm(false)}
                    className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 transition"
                  >
                    <X size={15} /> Cancel
                  </button>
                </div>
              </div>
            )} 

            {/* Category Count */}
    {skills.length > 0 && (
      <div className="flex flex-wrap gap-2">
        {Object.entries(categoryCount).map(([category, count]) => (
          <span
            key={category}
            className={`text-xs px-3 py-1 rounded-full font-medium cursor-pointer transition
              ${filterCategory === category
                ? "bg-[#6366F1] text-white"
                : `${categoryColors[category]}`
              }`}
            onClick={() =>
              setFilterCategory(filterCategory === category ? "All" : category)
            }
          >
            {category} ({count})
          </span>
        ))}
      </div>
    )}

        {/* Skills List */}
        {loading ? (
          <p className="text-sm text-gray-400">Loading skills...</p>
        ) : filteredSkills.length === 0 ? (
          <div className="text-center py-20 text-gray-400 dark:text-gray-500">
            <Zap size={40} className="mx-auto mb-3 opacity-30" />
           <p className="text-sm">
            {skills.length === 0
              ? `No skills added yet. Click "Add Skill" to get started!`
              : "No skills match your search or filters."}
          </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {filteredSkills.map((skill) => (
              <div
                key={skill._id}
                className="bg-white dark:bg-[#1E293B] border border-gray-200 dark:border-gray-700 rounded-xl p-4 space-y-3"
              >
                {editingId === skill._id ? (
                  // Edit Mode
                  <div className="space-y-3">
                    <input
                      type="text"
                      value={editData.name}
                      onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                      className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-[#0F172A] text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#6366F1]"
                    />
                    <div className="grid grid-cols-2 gap-2">
                      <select
                        value={editData.category}
                        onChange={(e) => setEditData({ ...editData, category: e.target.value })}
                        className="border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-[#0F172A] text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#6366F1]"
                      >
                        {categories.map((c) => <option key={c}>{c}</option>)}
                      </select>
                      <select
                        value={editData.level}
                        onChange={(e) => setEditData({ ...editData, level: e.target.value })}
                        className="border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-[#0F172A] text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#6366F1]"
                      >
                        {levels.map((l) => <option key={l}>{l}</option>)}
                      </select>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleUpdate(skill._id)}
                        className="flex items-center gap-1 bg-[#6366F1] hover:bg-[#4F46E5] text-white text-xs font-medium px-3 py-1.5 rounded-lg transition"
                      >
                        <Check size={13} /> Save
                      </button>
                      <button
                        onClick={() => setEditingId(null)}
                        className="flex items-center gap-1 text-xs text-gray-500 px-3 py-1.5 rounded-lg border border-gray-300 dark:border-gray-600 transition"
                      >
                        <X size={13} /> Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  // View Mode
                  <>
                    <div className="flex items-start justify-between">
                      <p className="text-sm font-semibold text-gray-800 dark:text-white">
                        {skill.name}
                      </p>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEdit(skill)}
                          className="text-gray-400 hover:text-[#6366F1] transition"
                        >
                          <Pencil size={15} />
                        </button>
                        {deleteConfirmId === skill._id ? (
                          <div className="flex gap-2 items-center">
                            <span className="text-xs text-gray-600 dark:text-gray-400">Sure?</span>
                            <button
                              onClick={() => handleDelete(skill._id)}
                              className="text-xs text-red-500 hover:text-red-700 font-medium transition"
                            >
                              Yes
                            </button>
                            <button
                              onClick={() => setDeleteConfirmId(null)}
                              className="text-xs text-gray-400 hover:text-gray-600 transition"
                            >
                              No
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => handleDelete(skill._id)}
                            className="text-gray-400 hover:text-red-500 transition"
                          >
                            <Trash2 size={15} />
                          </button>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2 flex-wrap">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${categoryColors[skill.category]}`}>
                        {skill.category}
                      </span>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${levelColors[skill.level]}`}>
                        {skill.level}
                      </span>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </Card>
  );
};

export default Skills;