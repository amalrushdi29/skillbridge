import { useState, useEffect, useRef } from "react";
import { useAuth } from "../context/AuthContext.jsx";
import { Search, CheckCircle, XCircle, Info, Loader, Plus, Share2 } from "lucide-react";
import config from "../config.js";

// ── Extended IT roles list ──
const COMMON_IT_ROLES = [
  "Software Engineer",
  "Senior Software Engineer",
  "Frontend Developer",
  "Backend Developer",
  "Full Stack Developer",
  "Data Scientist",
  "Data Analyst",
  "Data Engineer",
  "Machine Learning Engineer",
  "DevOps Engineer",
  "Cloud Engineer",
  "Cybersecurity Analyst",
  "Mobile Developer",
  "Android Engineer",
  "iOS Developer",
  "UI/UX Designer",
  "Product Manager",
  "QA Engineer",
  "Site Reliability Engineer",
  "Database Administrator",
  "Flutter Developer",
  "Blockchain Developer",
  "Game Developer",
  "Embedded Systems Engineer",
  "AR/VR Developer",
  "Prompt Engineer",
  "IT Support Specialist",
  "Business Intelligence Analyst",
  "Scrum Master",
  "Network Engineer",
  "Systems Architect",
  "Cloud Architect",
  "Data Science Manager",
  "Engineering Manager",
  "Technical Lead",
  "Platform Engineer",
  "Infrastructure Engineer",
  "Security Engineer",
  "AI Engineer",
  "NLP Engineer",
];

// ── IT keywords for non-IT detection ──
const IT_KEYWORDS = [
  "engineer", "developer", "software", "data", "cloud",
  "devops", "analyst", "designer", "architect", "security",
  "network", "database", "machine learning", "ai", "mobile",
  "frontend", "backend", "fullstack", "full stack", "cyber",
  "platform", "infrastructure", "qa", "testing", "web",
  "programmer", "tech", "scrum", "flutter", "ios", "android",
  "blockchain", "game", "embedded", "prompt", "support",
];

const isITRole = (role) =>
  IT_KEYWORDS.some((kw) => role.toLowerCase().includes(kw));

// ── Skill categories matching exact Skill model enum ──
const SKILL_CATEGORIES = {
  "Programming Language": [
    "python", "java", "c++", "c#", "golang", "rust", "scala",
    "kotlin", "swift", "ruby", "php", "perl", "r ", "matlab",
    "typescript", "javascript", "bash", "shell", "powershell",
  ],
  "Frontend": [
    "react", "angular", "vue", "html", "css", "sass", "scss",
    "webpack", "tailwind", "bootstrap", "jquery", "redux",
    "nextjs", "next.js", "gatsby", "svelte", "frontend",
    "ui ", "ux ", "interface",
  ],
  "Backend": [
    "node", "nodejs", "django", "flask", "spring", "express",
    "fastapi", "laravel", "rails", "asp.net", "backend",
    "rest api", "graphql", "microservices", "server",
  ],
  "Database": [
    "sql", "mysql", "postgresql", "mongodb", "redis", "oracle",
    "sqlite", "cassandra", "dynamodb", "elasticsearch",
    "firebase", "supabase", "nosql", "database",
  ],
  "Cloud": [
    "aws", "azure", "gcp", "google cloud", "cloudformation",
    "serverless", "lambda", "s3", "ec2", "cloud",
  ],
  "DevOps": [
    "docker", "kubernetes", "jenkins", "terraform", "ansible",
    "ci/cd", "linux", "devops", "gitlab", "github actions",
    "monitoring", "prometheus", "grafana", "nginx",
  ],
  "Data Science": [
    "machine learning", "deep learning", "tensorflow", "pytorch",
    "pandas", "numpy", "spark", "hadoop", "tableau", "powerbi",
    "excel", "nlp", "data science", "data analysis",
    "data visualization", "statistics", "scikit", "keras",
  ],
  "Cybersecurity": [
    "security", "cybersecurity", "penetration", "ethical hacking",
    "siem", "firewall", "encryption", "vulnerability",
    "owasp", "soc", "threat", "compliance",
  ],
  "Mobile": [
    "flutter", "react native", "android", "ios", "swift",
    "kotlin", "mobile", "xcode", "app development",
  ],
  "Tool": [
    "git", "jira", "figma", "postman", "vs code", "linux",
    "agile", "scrum", "trello", "confluence", "slack",
    "photoshop", "sketch", "notion",
  ],
  "Soft Skill": [
    "communication", "teamwork", "leadership", "problem solving",
    "collaboration", "management", "mentoring", "presentation",
    "critical thinking", "time management", "adaptability",
  ],
};

const categorizeSkill = (skill) => {
  const lower = skill.toLowerCase();
  for (const [category, keywords] of Object.entries(SKILL_CATEGORIES)) {
    if (keywords.some((kw) => lower.includes(kw))) return category;
  }
  return "Other";
};

// ── Level config ──
const LEVEL_CONFIG = {
  "Entry Level": { min: 0,   max: 20,  next: "Associate", color: "#94A3B8" },
  "Associate":   { min: 21,  max: 40,  next: "Mid Level",  color: "#3B82F6" },
  "Mid Level":   { min: 41,  max: 60,  next: "Senior",     color: "#EAB308" },
  "Senior":      { min: 61,  max: 80,  next: "Lead",       color: "#F97316" },
  "Lead":        { min: 81,  max: 99,  next: "Principal",  color: "#A855F7" },
  "Principal":   { min: 100, max: 100, next: null,         color: "#10B981" },
};

const LEVEL_COLORS = {
  "Entry Level": "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300",
  "Associate":   "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300",
  "Mid Level":   "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300",
  "Senior":      "bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300",
  "Lead":        "bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300",
  "Principal":   "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300",
};

// ── Circular progress ──
const CircularProgress = ({ percentage, size = 120, strokeWidth = 10, color = "#6366F1" }) => {
  const radius       = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset       = circumference - (percentage / 100) * circumference;
  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size/2} cy={size/2} r={radius} fill="none" stroke="currentColor"
          strokeWidth={strokeWidth} className="text-gray-200 dark:text-gray-700" />
        <circle cx={size/2} cy={size/2} r={radius} fill="none" stroke={color}
          strokeWidth={strokeWidth} strokeDasharray={circumference}
          strokeDashoffset={offset} strokeLinecap="round"
          style={{ transition: "stroke-dashoffset 1s ease-in-out" }} />
      </svg>
      <div className="absolute">
        <span className="text-2xl font-bold text-gray-800 dark:text-gray-100">{percentage}%</span>
      </div>
    </div>
  );
};

const SkillGap = () => {
  const { user } = useAuth();

  const [profileSkills,     setProfileSkills]     = useState([]);
  const [yearsOfExperience, setYearsOfExperience] = useState(0);
  const [profileTargetRole, setProfileTargetRole] = useState("");

  const [searchQuery,   setSearchQuery]   = useState("");
  const [selectedRole,  setSelectedRole]  = useState("");
  const [suggestions,   setSuggestions]   = useState([]);
  const [showDropdown,  setShowDropdown]  = useState(false);
  const [saveToProfile, setSaveToProfile] = useState(false);
  const [nonITWarning,  setNonITWarning]  = useState(false);

  const [results,     setResults]     = useState(null);
  const [loading,     setLoading]     = useState(false);
  const [fetching,    setFetching]    = useState(true);
  const [message,     setMessage]     = useState({ type: "", text: "" });
  const [addedSkills, setAddedSkills] = useState({});
  const [addingSkill, setAddingSkill] = useState("");
  const [copied,      setCopied]      = useState(false);

  const dropdownRef = useRef(null);

  // ── Auto dismiss message ──
  useEffect(() => {
    if (message.text) {
      const t = setTimeout(() => setMessage({ type: "", text: "" }), 4000);
      return () => clearTimeout(t);
    }
  }, [message]);

  // ── Close dropdown outside click ──
  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target))
        setShowDropdown(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // ── Fetch profile on load ──
  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        const profileRes  = await fetch(`${config.apiUrl}/profile`, {
          headers: { Authorization: `Bearer ${user.token}` },
        });
        const profileData = await profileRes.json();
        setYearsOfExperience(profileData.yearsOfExperience || 0);
        setProfileTargetRole(profileData.targetJobRole     || "");
        setSelectedRole(profileData.targetJobRole          || "");
        setSearchQuery(profileData.targetJobRole           || "");

        const skillsRes  = await fetch(`${config.apiUrl}/skills`, {
          headers: { Authorization: `Bearer ${user.token}` },
        });
        const skillsData = await skillsRes.json();
        setProfileSkills(skillsData.map((s) => s.name));
      } catch {
        setMessage({ type: "error", text: "Failed to load profile data" });
      } finally {
        setFetching(false);
      }
    };
    fetchProfileData();
  }, []);

  // ── Filter suggestions locally ──
  useEffect(() => {
    const query = searchQuery.trim().toLowerCase();
    if (query.length < 1) {
      setSuggestions([]);
      setShowDropdown(false);
      return;
    }
    const filtered = COMMON_IT_ROLES.filter((r) =>
      r.toLowerCase().includes(query)
    );
    setSuggestions(filtered);
    setShowDropdown(true);
  }, [searchQuery]);

  // ── Select role from dropdown ──
  const handleSelectRole = (role) => {
    setSelectedRole(role);
    setSearchQuery(role);
    setShowDropdown(false);
    setSuggestions([]);
    setNonITWarning(!isITRole(role));
  };

  // ── Search input change ──
  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchQuery(value);
    setSelectedRole(value);
    setNonITWarning(false);
  };

  // ── Analyse ──
  const handleAnalyse = async () => {
    const activeRole = selectedRole.trim();
    if (!activeRole) {
      setMessage({ type: "error", text: "Please select or enter a target role" });
      return;
    }
    if (profileSkills.length === 0) {
      setMessage({ type: "error", text: "Please add skills to your profile first" });
      return;
    }
    if (!isITRole(activeRole)) setNonITWarning(true);

    setLoading(true);
    setResults(null);
    setAddedSkills({});
    setMessage({ type: "", text: "" });

    try {
      const res  = await fetch(`${config.apiUrl}/ml/skill-gap`, {
        method:  "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization:  `Bearer ${user.token}`,
        },
        body: JSON.stringify({
          skills:            profileSkills,
          targetRole:        activeRole,
          yearsOfExperience: yearsOfExperience,
          jobType:           "full-time",
        }),
      });
      const data = await res.json();

      if (!res.ok) {
        setMessage({ type: "error", text: data.error || "Analysis failed" });
        return;
      }

      setResults(data);

      if (saveToProfile && activeRole !== profileTargetRole) {
        await fetch(`${config.apiUrl}/profile`, {
          method:  "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization:  `Bearer ${user.token}`,
          },
          body: JSON.stringify({ targetJobRole: activeRole }),
        });
        setProfileTargetRole(activeRole);
        setMessage({ type: "success", text: "Analysis complete! Target role saved to profile." });
      } else {
        setMessage({ type: "success", text: "Analysis complete!" });
      }
    } catch {
      setMessage({ type: "error", text: "Something went wrong. Please try again." });
    } finally {
      setLoading(false);
    }
  };

  // ── Quick add missing skill ──
  const handleAddSkill = async (skillName) => {
    setAddingSkill(skillName);
    try {
      const res = await fetch(`${config.apiUrl}/skills`, {
        method:  "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization:  `Bearer ${user.token}`,
        },
        body: JSON.stringify({
          name:     skillName,
          category: categorizeSkill(skillName),
          level:    "Beginner",
        }),
      });

      if (res.ok) {
        setAddedSkills((prev) => ({ ...prev, [skillName]: true }));
        setProfileSkills((prev) => [...prev, skillName]);
      } else {
        setMessage({ type: "error", text: `Failed to add ${skillName}` });
      }
    } catch {
      setMessage({ type: "error", text: `Failed to add ${skillName}` });
    } finally {
      setAddingSkill("");
    }
  };

  // ── Share results ──
  const handleShare = () => {
    if (!results) return;
    const text = [
      `🎯 My SkillBridge Analysis`,
      `Role: ${results.targetRole}`,
      `Employability Score: ${results.employabilityScore}%`,
      `Role Match: ${results.matchPercentage}%`,
      `Level: ${results.predictedLevel}`,
      ``,
      `✅ Skills I have (${results.matchedSkills.length}):`,
      results.matchedSkills.join(", "),
      ``,
      `❌ Skills I need:`,
      results.missingSkills.map((s, i) => `${i + 1}. ${s}`).join(", "),
      ``,
      `Generated by SkillBridge 🚀`,
    ].join("\n");

    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    });
  };

  // ── Level progress calculation ──
  const getLevelProgress = (score, level) => {
    const config = LEVEL_CONFIG[level];
    if (!config) return { percentage: 100, gap: 0, nextLevel: null };
    if (!config.next) return { percentage: 100, gap: 0, nextLevel: null };
    const range      = config.max - config.min + 1;
    const progress   = score - config.min;
    const percentage = Math.round((progress / range) * 100);
    const gap        = config.max - score + 1;
    return { percentage, gap, nextLevel: config.next, color: config.color };
  };

  // ── Categorize skills ──
  const getCategoryBreakdown = (skills) => {
    const breakdown = {};
    skills.forEach((skill) => {
      const cat = categorizeSkill(skill);
      breakdown[cat] = (breakdown[cat] || 0) + 1;
    });
    return breakdown;
  };

  if (fetching) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500 dark:text-gray-400">Loading your profile...</p>
      </div>
    );
  }

  const levelProgress = results
    ? getLevelProgress(results.employabilityScore, results.predictedLevel)
    : null;

  const matchedCategories = results
    ? getCategoryBreakdown(results.matchedSkills)
    : {};

  const missingCategories = results
    ? getCategoryBreakdown(results.missingSkills)
    : {};

  const allCategories = results
    ? [...new Set([...Object.keys(matchedCategories), ...Object.keys(missingCategories)])]
    : [];

  return (
    <div className="max-w-3xl mx-auto space-y-6">

      {/* ── Header ── */}
      <div>
        <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">
          Skill Gap Analysis
        </h1>
        <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
          Compare your current skills against real job market requirements
        </p>
      </div>

      {/* ── Message ── */}
      {message.text && (
        <div className={`px-4 py-3 rounded-lg text-sm font-medium ${
          message.type === "success"
            ? "bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-800"
            : "bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800"
        }`}>
          {message.text}
        </div>
      )}

      {/* ── Analysis Setup Card ── */}
      <div className="bg-white dark:bg-[#1E293B] rounded-2xl shadow p-6 space-y-5">
        <h2 className="text-base font-semibold text-gray-800 dark:text-gray-100">
          Analysis Setup
        </h2>

        {/* Skills Summary */}
        <div className="bg-gray-50 dark:bg-[#0F172A] rounded-xl p-4">
          <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2 uppercase tracking-wide">
            Your Skills ({profileSkills.length})
          </p>
          {profileSkills.length === 0 ? (
            <p className="text-sm text-red-500">No skills found. Please add skills to your profile first.</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {profileSkills.slice(0, 8).map((skill, i) => (
                <span key={i} className="px-2.5 py-1 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 rounded-full text-xs font-medium">
                  {skill}
                </span>
              ))}
              {profileSkills.length > 8 && (
                <span className="px-2.5 py-1 bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded-full text-xs font-medium">
                  +{profileSkills.length - 8} more
                </span>
              )}
            </div>
          )}
        </div>

        {/* Experience */}
        <div className="flex items-center gap-3 text-sm">
          <span className="font-medium text-gray-700 dark:text-gray-300">Experience:</span>
          <span className="px-3 py-1 bg-gray-100 dark:bg-gray-700 rounded-full text-xs font-medium text-gray-600 dark:text-gray-400">
            {yearsOfExperience} {yearsOfExperience === 1 ? "year" : "years"}
          </span>
        </div>

        {/* Role Search */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Target Role
          </label>
          <div className="relative" ref={dropdownRef}>
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={handleSearchChange}
                onFocus={() => searchQuery.trim().length >= 1 && setShowDropdown(true)}
                placeholder="Search or type a role e.g. Software Engineer..."
                className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2.5 pr-10 text-sm bg-white dark:bg-[#0F172A] text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-[#6366F1]"
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                <Search size={15} />
              </div>
            </div>

            {/* Dropdown */}
            {showDropdown && (suggestions.length > 0 || searchQuery.trim().length >= 2) && (
              <div className="absolute z-20 w-full mt-1 bg-white dark:bg-[#1E293B] border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg max-h-56 overflow-y-auto">
                {suggestions.map((role, i) => (
                  <button
                    key={i}
                    onClick={() => handleSelectRole(role)}
                    className={`w-full text-left px-4 py-2.5 text-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition ${
                      selectedRole === role
                        ? "text-indigo-600 dark:text-indigo-400 font-medium bg-indigo-50 dark:bg-indigo-900/20"
                        : "text-gray-700 dark:text-gray-300"
                    }`}
                  >
                    {role}
                  </button>
                ))}

                {/* Use typed role option */}
                {searchQuery.trim().length >= 2 &&
                  !COMMON_IT_ROLES.map((r) => r.toLowerCase()).includes(searchQuery.trim().toLowerCase()) && (
                  <button
                    onClick={() => handleSelectRole(searchQuery.trim())}
                    className="w-full text-left px-4 py-2.5 text-sm text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition border-t border-gray-100 dark:border-gray-700 font-medium"
                  >
                    Use "{searchQuery.trim()}" →
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Non-IT warning */}
          {nonITWarning && (
            <div className="mt-2 flex items-start gap-2 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg px-3 py-2">
              <Info size={14} className="text-yellow-500 mt-0.5 shrink-0" />
              <p className="text-xs text-yellow-700 dark:text-yellow-300">
                This doesn't appear to be an IT role. Results may not be relevant to your IT career.
              </p>
            </div>
          )}
        </div>

        {/* Save checkbox */}
        <label className="flex items-center gap-2.5 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={saveToProfile}
            onChange={(e) => setSaveToProfile(e.target.checked)}
            className="w-4 h-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
          />
          <span className="text-sm text-gray-600 dark:text-gray-400">
            Set this as my target role in profile
          </span>
        </label>

        {/* Analyse Button */}
        <button
          onClick={handleAnalyse}
          disabled={loading || profileSkills.length === 0 || !selectedRole.trim()}
          className="w-full bg-[#6366F1] text-white py-2.5 rounded-lg text-sm font-medium hover:bg-indigo-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {loading ? (
            <><Loader size={16} className="animate-spin" /> Analysing...</>
          ) : (
            <><Search size={16} /> Analyse Skill Gap</>
          )}
        </button>
      </div>

      {/* ── Results ── */}
      {results && (
        <div className="space-y-5">

          {/* Share button */}
          <div className="flex justify-end">
            <button
              onClick={handleShare}
              className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-[#1E293B] border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-600 dark:text-gray-300 hover:border-indigo-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition shadow-sm"
            >
              <Share2 size={14} />
              {copied ? "Copied! ✓" : "Share Results"}
            </button>
          </div>

          {/* Scores Row */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">

            {/* Employability Score */}
            <div className="bg-white dark:bg-[#1E293B] rounded-2xl shadow p-5 flex flex-col items-center gap-3">
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                Employability Score
              </p>
              <CircularProgress percentage={results.employabilityScore} color="#6366F1" />
              <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
                Based on global top IT skills
              </p>
            </div>

            {/* Role Match */}
            <div className="bg-white dark:bg-[#1E293B] rounded-2xl shadow p-5 flex flex-col items-center gap-3">
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                Role Match
              </p>
              <CircularProgress percentage={results.matchPercentage} color="#10B981" />
              <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
                Match for {results.targetRole}
              </p>
            </div>

            {/* Predicted Level */}
            <div className="bg-white dark:bg-[#1E293B] rounded-2xl shadow p-5 flex flex-col items-center justify-center gap-3">
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                Predicted Level
              </p>
              <span className={`px-4 py-2 rounded-full text-sm font-semibold ${LEVEL_COLORS[results.predictedLevel] || LEVEL_COLORS["Mid Level"]}`}>
                {results.predictedLevel}
              </span>
              <div className="flex items-start gap-1.5 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg px-3 py-2">
                <Info size={13} className="text-indigo-400 mt-0.5 shrink-0" />
                <p className="text-xs text-indigo-600 dark:text-indigo-300 leading-relaxed">
                  Based on your current skills. Add more skills to improve your level.
                </p>
              </div>
            </div>

          </div>

          {/* ── Progress to Next Level ── */}
          {levelProgress && levelProgress.nextLevel && (
            <div className="bg-white dark:bg-[#1E293B] rounded-2xl shadow p-5">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-100">
                  Progress to Next Level
                </h3>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {levelProgress.gap} more skill{levelProgress.gap !== 1 ? "s" : ""} to reach{" "}
                  <span className="font-semibold text-indigo-500">{levelProgress.nextLevel}</span>
                </span>
              </div>
              <div className="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-3 overflow-hidden">
                <div
                  className="h-3 rounded-full transition-all duration-1000"
                  style={{
                    width:      `${levelProgress.percentage}%`,
                    backgroundColor: LEVEL_CONFIG[results.predictedLevel]?.color || "#6366F1",
                  }}
                />
              </div>
              <div className="flex justify-between mt-1.5">
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {results.predictedLevel}
                </span>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {levelProgress.nextLevel}
                </span>
              </div>
            </div>
          )}

          {/* ── Skill Categories Breakdown ── */}
          {allCategories.length > 0 && (
            <div className="bg-white dark:bg-[#1E293B] rounded-2xl shadow p-5">
              <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-100 mb-4">
                Skill Categories Breakdown
              </h3>
              <div className="space-y-3">
                {allCategories.map((cat) => {
                  const have    = matchedCategories[cat] || 0;
                  const missing = missingCategories[cat] || 0;
                  const total   = have + missing;
                  const pct     = Math.round((have / total) * 100);
                  return (
                    <div key={cat}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                          {cat}
                        </span>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {have}/{total}
                        </span>
                      </div>
                      <div className="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
                        <div
                          className="h-2 rounded-full transition-all duration-700"
                          style={{
                            width: `${pct}%`,
                            backgroundColor: pct >= 70 ? "#10B981" : pct >= 40 ? "#EAB308" : "#EF4444",
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ── Skills Analysis Row ── */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

            {/* Matched Skills */}
            <div className="bg-white dark:bg-[#1E293B] rounded-2xl shadow p-5">
              <div className="flex items-center gap-2 mb-4">
                <CheckCircle size={16} className="text-green-500" />
                <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-100">
                  Matched Skills ({results.matchedSkills.length})
                </h3>
              </div>
              {results.matchedSkills.length === 0 ? (
                <p className="text-sm text-gray-400">No matching skills found for this role yet.</p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {results.matchedSkills.map((skill, i) => (
                    <span key={i} className="px-2.5 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-full text-xs font-medium">
                      ✓ {skill}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Missing Skills */}
            <div className="bg-white dark:bg-[#1E293B] rounded-2xl shadow p-5">
              <div className="flex items-center gap-2 mb-2">
                <XCircle size={16} className="text-red-400" />
                <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-100">
                  Missing Skills
                </h3>
              </div>
              <div className="flex items-start gap-1.5 bg-gray-50 dark:bg-gray-700/40 rounded-lg px-3 py-2 mb-3">
                <Info size={12} className="text-gray-400 mt-0.5 shrink-0" />
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Showing top 15 most important missing skills. As you add skills, higher priority ones appear.
                </p>
              </div>
              {results.missingSkills.length === 0 ? (
                <p className="text-sm text-green-600 dark:text-green-400 font-medium">
                  🎉 You have all required skills for this role!
                </p>
              ) : (
                <div className="space-y-2">
                  {results.missingSkills.map((skill, i) => (
                    <div key={i} className="flex items-center justify-between gap-2">
                      <span className="px-2.5 py-1 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-300 rounded-full text-xs font-medium flex items-center gap-1 flex-1">
                        <span className="text-red-400 font-bold">{i + 1}.</span>
                        {skill}
                      </span>
                      {addedSkills[skill] ? (
                        <span className="text-xs text-green-600 dark:text-green-400 font-medium whitespace-nowrap">
                          ✓ Added
                        </span>
                      ) : (
                        <button
                          onClick={() => handleAddSkill(skill)}
                          disabled={addingSkill === skill}
                          className="flex items-center gap-1 px-2.5 py-1 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-300 rounded-full text-xs font-medium hover:bg-indigo-200 dark:hover:bg-indigo-900/50 transition disabled:opacity-50 whitespace-nowrap"
                        >
                          {addingSkill === skill
                            ? <Loader size={10} className="animate-spin" />
                            : <Plus size={10} />
                          }
                          Add
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>

          {/* Info bar */}
          <div className="bg-indigo-50 dark:bg-indigo-900/20 rounded-xl px-4 py-3 flex items-center gap-2">
            <Info size={14} className="text-indigo-400 shrink-0" />
            <p className="text-xs text-indigo-600 dark:text-indigo-300">
              Analysis based on <strong>{results.totalRoleSkills}</strong> real skills from{" "}
              <strong>{results.targetRole}</strong> job listings on LinkedIn.
              Role match calculated against top 30 most demanded skills.
            </p>
          </div>

        </div>
      )}

    </div>
  );
};

export default SkillGap;