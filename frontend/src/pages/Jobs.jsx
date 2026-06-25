import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  Search,
  MapPin,
  Building2,
  Briefcase,
  ExternalLink,
  Bookmark,
  ChevronLeft,
  ChevronRight,
  Filter,
  X,
} from "lucide-react";
import Layout from "../components/Layout.jsx";
import PageHeader from "../components/PageHeader.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import config from "../config.js";

// ─────────────────────────────────────────
// CONSTANTS
// ─────────────────────────────────────────
const JOB_LEVELS = [
  "Associate",
  "Mid senior",
];

const JOB_TYPES = ["Remote", "Hybrid", "Onsite"];

const MATCH_COLORS = {
  high:   { bg: "bg-green-100 dark:bg-green-900/30",   text: "text-green-700 dark:text-green-400",   label: "Great Match"  },
  medium: { bg: "bg-yellow-100 dark:bg-yellow-900/30", text: "text-yellow-700 dark:text-yellow-400", label: "Good Match"   },
  low:    { bg: "bg-red-100 dark:bg-red-900/30",       text: "text-red-700 dark:text-red-400",       label: "Low Match"    },
};

const getMatchColor = (pct) => {
  if (pct >= 50) return MATCH_COLORS.high;
  if (pct >= 25) return MATCH_COLORS.medium;
  return MATCH_COLORS.low;
};

// ─────────────────────────────────────────
// JOB CARD COMPONENT
// ─────────────────────────────────────────
const JobCard = ({ job }) => {
  const match = getMatchColor(job.matchPercentage);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 hover:shadow-md transition-shadow duration-200">

      {/* Top Row — Title + Bookmark + Match */}
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
          {/* Match Badge */}
          <span className={`text-xs font-semibold px-2 py-1 rounded-full ${match.bg} ${match.text}`}>
            {job.matchPercentage}% {match.label}
          </span>

          {/* Bookmark Icon — functionality in Chat 11 */}
          <button className="p-1.5 rounded-lg text-gray-400 hover:text-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 transition-colors">
            <Bookmark size={16} />
          </button>
        </div>
      </div>

      {/* Meta Row — Location, Level, Type */}
      <div className="flex flex-wrap gap-2 mb-3">
        {job.location && (
          <span className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
            <MapPin size={11} />
            {job.location}
          </span>
        )}
        <span className="flex items-center gap-1 text-xs bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 px-2 py-0.5 rounded-full">
          <Briefcase size={11} />
          {job.jobLevel}
        </span>
        <span className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-2 py-0.5 rounded-full">
          {job.jobType}
        </span>
      </div>

      {/* Skills */}
      <div className="flex flex-wrap gap-1.5 mb-4">
        {job.jobSkills.slice(0, 6).map((skill, i) => (
          <span
            key={i}
            className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-2 py-0.5 rounded-md"
          >
            {skill}
          </span>
        ))}
        {job.jobSkills.length > 6 && (
          <span className="text-xs text-gray-400 dark:text-gray-500 px-1 py-0.5">
            +{job.jobSkills.length - 6} more
          </span>
        )}
      </div>

      {/* Bottom Row — Date + View Link */}
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
  const navigate  = useNavigate();

  // ── State ──
  const [jobs,        setJobs]        = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [error,       setError]       = useState("");
  const [userSkills,  setUserSkills]  = useState([]);
  const [page,        setPage]        = useState(1);
  const [totalPages,  setTotalPages]  = useState(1);
  const [total,       setTotal]       = useState(0);
  const [search,      setSearch]      = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [jobLevel,    setJobLevel]    = useState("");
  const [jobType,     setJobType]     = useState("");

  // ── Fetch user skills first ──
  useEffect(() => {
    const fetchSkills = async () => {
      try {
        const token = user?.token;
        const res = await axios.get(`${config.apiUrl}/skills`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const skillNames = res.data.map((s) => s.name);
        setUserSkills(skillNames);
      } catch (err) {
        console.error("Failed to fetch skills:", err);
        setUserSkills([]);
      }
    };

    if (user?.token) fetchSkills();
  }, [user]);

  // ── Fetch jobs whenever filters/page change ──
  const fetchJobs = useCallback(async () => {
    if (!user?.token) return;
    setLoading(true);
    setError("");
    try {
      const token = user?.token;
     const res = await axios.post(
        `${config.apiUrl}/ml/jobs`,
        { skills: userSkills, page, search, jobLevel, jobType },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setJobs(res.data.jobs || []);
      setTotalPages(res.data.totalPages || 1);
      setTotal(res.data.total || 0);
    } catch (err) {
      setError("Failed to load jobs. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [user, userSkills, page, search, jobLevel, jobType]);

  useEffect(() => {
    if (userSkills.length >= 0) fetchJobs();
  }, [fetchJobs]);

  // ── Handlers ──
  const handleSearch = () => {
    setSearch(searchInput.trim());
    setPage(1);
  };

  const handleClearFilters = () => {
    setSearchInput("");
    setSearch("");
    setJobLevel("");
    setJobType("");
    setPage(1);
  };

  const hasActiveFilters = search || jobLevel || jobType;

  // ─────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────
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
          {/* Search Bar */}
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

          {/* Filter Row */}
          <div className="flex flex-wrap items-center gap-2">
            <Filter size={14} className="text-gray-400" />
            <select
              value={jobLevel}
              onChange={(e) => { setJobLevel(e.target.value); setPage(1); }}
              className="text-sm border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-1.5 bg-gray-50 dark:bg-gray-700 text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">All Levels</option>
              {JOB_LEVELS.map((l) => (
                <option key={l} value={l.toLowerCase()}>{l}</option>
              ))}
            </select>

            <select
              value={jobType}
              onChange={(e) => { setJobType(e.target.value); setPage(1); }}
              className="text-sm border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-1.5 bg-gray-50 dark:bg-gray-700 text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">All Types</option>
              {JOB_TYPES.map((t) => (
                <option key={t} value={t.toLowerCase()}>{t}</option>
              ))}
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
        <p className="text-xs text-gray-400 dark:text-gray-500 flex items-center gap-1">
          ⚠️ Job links are sourced from a 2024 LinkedIn dataset and may no longer be active.
        </p>

        {/* Loading */}
        {loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 animate-pulse">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-3" />
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-4" />
                <div className="flex gap-2">
                  <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded-full w-16" />
                  <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded-full w-16" />
                  <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded-full w-16" />
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
                  <JobCard key={job.id} job={job} />
                ))}
              </div>
            )}

            {/* Pagination */}
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