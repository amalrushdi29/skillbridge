import { useEffect, useState, useCallback } from "react";
import axios from "axios";
import {
  Search, MapPin, Building2, Briefcase, ExternalLink,
  Bookmark, ChevronLeft, ChevronRight, Filter, X,
} from "lucide-react";
import Layout from "../components/Layout.jsx";
import PageHeader from "../components/PageHeader.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import config from "../config.js";

const JOB_LEVELS = ["Associate", "Mid senior"];
const JOB_TYPES  = ["Remote", "Hybrid", "Onsite"];

const MATCH_COLORS = {
  high:   { bg: "bg-green-100 dark:bg-green-900/30",   text: "text-green-700 dark:text-green-400",   label: "Great Match" },
  medium: { bg: "bg-yellow-100 dark:bg-yellow-900/30", text: "text-yellow-700 dark:text-yellow-400", label: "Good Match"  },
  low:    { bg: "bg-red-100 dark:bg-red-900/30",       text: "text-red-700 dark:text-red-400",       label: "Low Match"   },
};

const getMatchColor = (pct) => {
  if (pct >= 50) return MATCH_COLORS.high;
  if (pct >= 25) return MATCH_COLORS.medium;
  return MATCH_COLORS.low;
};

// ─────────────────────────────────────────
// JOB CARD
// ─────────────────────────────────────────
const JobCard = ({ job, bookmarkedIds, onToggleBookmark }) => {
  const match        = getMatchColor(job.matchPercentage);
  const isBookmarked = bookmarkedIds.includes(job.id);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 hover:shadow-md transition-shadow duration-200">

      {/* Top Row */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-gray-900 dark:text-white text-base leading-snug line-clamp-2">
            {job.jobTitle}
          </h3>
          <div className="flex items-center gap-1 mt-1 text-sm text-gray-500 dark:text-gray-400">
            <Building2 size={13} />
            <span className="truncate">{job.company || "Unknown Company"}</span>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <span className={`text-xs font-semibold px-2 py-1 rounded-full ${match.bg} ${match.text}`}>
            {job.matchPercentage}% {match.label}
          </span>

          {/* Bookmark Button */}
          <button
            onClick={() => onToggleBookmark(job)}
            className={`p-1.5 rounded-lg transition-colors ${
              isBookmarked
                ? "text-indigo-600 bg-indigo-50 dark:bg-indigo-900/30"
                : "text-gray-400 hover:text-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-900/30"
            }`}
          >
            <Bookmark size={16} fill={isBookmarked ? "currentColor" : "none"} />
          </button>
        </div>
      </div>

      {/* Meta Row */}
      <div className="flex flex-wrap gap-2 mb-3">
        {job.location && (
          <span className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
            <MapPin size={11} /> {job.location}
          </span>
        )}
        <span className="flex items-center gap-1 text-xs bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 px-2 py-0.5 rounded-full">
          <Briefcase size={11} /> {job.jobLevel}
        </span>
        <span className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-2 py-0.5 rounded-full">
          {job.jobType}
        </span>
      </div>

      {/* Skills */}
      <div className="flex flex-wrap gap-1.5 mb-4">
        {job.jobSkills.slice(0, 6).map((skill, i) => (
          <span key={i} className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-2 py-0.5 rounded-md">
            {skill}
          </span>
        ))}
        {job.jobSkills.length > 6 && (
          <span className="text-xs text-gray-400 dark:text-gray-500 px-1 py-0.5">
            +{job.jobSkills.length - 6} more
          </span>
        )}
      </div>

      {/* Bottom Row */}
      <div className="flex items-center justify-between">
        <span className="text-xs text-gray-400 dark:text-gray-500">
          {job.datePosted || "Date unknown"}
        </span>
        {job.jobLink && (
          <a
            href={job.jobLink}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:underline"
          >
            View Job <ExternalLink size={11} />
          </a>
        )}
      </div>
    </div>
  );
};

// ─────────────────────────────────────────
// MAIN PAGE
// ─────────────────────────────────────────
const Jobs = () => {
  const { user } = useAuth();

  const [jobs,          setJobs]          = useState([]);
  const [loading,       setLoading]       = useState(true);
  const [error,         setError]         = useState("");
  const [userSkills,    setUserSkills]    = useState([]);
  const [bookmarkedIds, setBookmarkedIds] = useState([]);
  const [page,          setPage]          = useState(1);
  const [totalPages,    setTotalPages]    = useState(1);
  const [total,         setTotal]         = useState(0);
  const [search,        setSearch]        = useState("");
  const [searchInput,   setSearchInput]   = useState("");
  const [jobLevel,      setJobLevel]      = useState("");
  const [jobType,       setJobType]       = useState("");

  const token = user?.token;

  // ── Fetch user skills ──
  useEffect(() => {
    const fetchSkills = async () => {
      try {
        const res = await axios.get(`${config.apiUrl}/skills`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUserSkills(res.data.map((s) => s.name));
      } catch {
        setUserSkills([]);
      }
    };
    if (token) fetchSkills();
  }, [token]);

  // ── Fetch bookmarked IDs ──
  useEffect(() => {
    const fetchIds = async () => {
      try {
        const res = await axios.get(`${config.apiUrl}/bookmarks/ids`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setBookmarkedIds(res.data);
      } catch {
        setBookmarkedIds([]);
      }
    };
    if (token) fetchIds();
  }, [token]);

  // ── Fetch jobs ──
  const fetchJobs = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    setError("");
    try {
      const res = await axios.post(
        `${config.apiUrl}/ml/jobs`,
        { skills: userSkills, page, search, jobLevel, jobType },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setJobs(res.data.jobs || []);
      setTotalPages(res.data.totalPages || 1);
      setTotal(res.data.total || 0);
    } catch {
      setError("Failed to load jobs. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [token, userSkills, page, search, jobLevel, jobType]);

  useEffect(() => {
    if (userSkills.length >= 0) fetchJobs();
  }, [fetchJobs]);

  // ── Toggle bookmark ──
  const handleToggleBookmark = async (job) => {
    const isBookmarked = bookmarkedIds.includes(job.id);
    try {
      if (isBookmarked) {
        await axios.delete(`${config.apiUrl}/bookmarks/${job.id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setBookmarkedIds((prev) => prev.filter((id) => id !== job.id));
      } else {
        await axios.post(
          `${config.apiUrl}/bookmarks`,
          {
            jobId:           job.id,
            jobTitle:        job.jobTitle,
            company:         job.company,
            location:        job.location,
            jobLevel:        job.jobLevel,
            jobType:         job.jobType,
            jobSkills:       job.jobSkills,
            jobLink:         job.jobLink,
            datePosted:      job.datePosted,
            matchPercentage: job.matchPercentage,
          },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setBookmarkedIds((prev) => [...prev, job.id]);
      }
    } catch (err) {
      console.error("Bookmark toggle failed:", err);
    }
  };

  const handleSearch = () => { setSearch(searchInput.trim()); setPage(1); };

  const handleClearFilters = () => {
    setSearchInput(""); setSearch(""); setJobLevel(""); setJobType(""); setPage(1);
  };

  const hasActiveFilters = search || jobLevel || jobType;

  return (
    <Layout pageTitle="Job Listings">
      <div className="max-w-6xl mx-auto px-4 py-6 space-y-6">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <PageHeader
            icon={Briefcase}
            title="Job Listings"
            description="Matched to your skill profile • Dataset: 2024 LinkedIn listings"
          />
          {total > 0 && (
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {total.toLocaleString()} jobs found
            </span>
          )}
        </div>

        {/* Search + Filters */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 space-y-3">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search job titles..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <button
              onClick={handleSearch}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg transition-colors"
            >
              Search
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Filter size={14} className="text-gray-400" />
            <select
              value={jobLevel}
              onChange={(e) => { setJobLevel(e.target.value); setPage(1); }}
              className="text-sm border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-1.5 bg-gray-50 dark:bg-gray-700 text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">All Levels</option>
              {JOB_LEVELS.map((l) => <option key={l} value={l.toLowerCase()}>{l}</option>)}
            </select>

            <select
              value={jobType}
              onChange={(e) => { setJobType(e.target.value); setPage(1); }}
              className="text-sm border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-1.5 bg-gray-50 dark:bg-gray-700 text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">All Types</option>
              {JOB_TYPES.map((t) => <option key={t} value={t.toLowerCase()}>{t}</option>)}
            </select>

            {hasActiveFilters && (
              <button
                onClick={handleClearFilters}
                className="flex items-center gap-1 text-xs text-red-500 hover:text-red-600 px-2 py-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
              >
                <X size={12} /> Clear Filters
              </button>
            )}
          </div>
        </div>

        {/* Dataset Notice */}
        <p className="text-xs text-gray-400 dark:text-gray-500">
          ⚠️ Job links are sourced from a 2024 LinkedIn dataset and may no longer be active.
        </p>

        {/* Loading Skeleton */}
        {loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 animate-pulse">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-3" />
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-4" />
                <div className="flex gap-2">
                  {[...Array(3)].map((_, j) => <div key={j} className="h-5 bg-gray-200 dark:bg-gray-700 rounded-full w-16" />)}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Error */}
        {error && !loading && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4 text-red-600 dark:text-red-400 text-sm">
            {error}
          </div>
        )}

        {/* Job Grid */}
        {!loading && !error && (
          <>
            {jobs.length === 0 ? (
              <div className="text-center py-16 text-gray-400 dark:text-gray-500">
                <Briefcase size={40} className="mx-auto mb-3 opacity-40" />
                <p className="font-medium">No jobs found</p>
                <p className="text-sm mt-1">Try adjusting your filters or search term</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {jobs.map((job) => (
                  <JobCard
                    key={job.id}
                    job={job}
                    bookmarkedIds={bookmarkedIds}
                    onToggleBookmark={handleToggleBookmark}
                  />
                ))}
              </div>
            )}

            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-3 pt-4">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="flex items-center gap-1 px-3 py-2 text-sm rounded-lg border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronLeft size={14} /> Prev
                </button>
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  Page {page} of {totalPages.toLocaleString()}
                </span>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="flex items-center gap-1 px-3 py-2 text-sm rounded-lg border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  Next <ChevronRight size={14} />
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </Layout>
  );
};

export default Jobs;