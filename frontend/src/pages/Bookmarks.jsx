import { useEffect, useState } from "react";
import axios from "axios";
import {
  Bookmark, MapPin, Building2, Briefcase,
  ExternalLink, Trash2, X,
} from "lucide-react";
import Layout from "../components/Layout.jsx";
import PageHeader from "../components/PageHeader.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import config from "../config.js";

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

const Bookmarks = () => {
  const { user } = useAuth();
  const [bookmarks, setBookmarks] = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [error,     setError]     = useState("");
  const [removing,  setRemoving]  = useState(null); // jobId being removed

  const token = user?.token;

  // ── Fetch all bookmarks ──
  useEffect(() => {
    const fetchBookmarks = async () => {
      try {
        const res = await axios.get(`${config.apiUrl}/bookmarks`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setBookmarks(res.data);
      } catch {
        setError("Failed to load bookmarks. Please try again.");
      } finally {
        setLoading(false);
      }
    };
    if (token) fetchBookmarks();
  }, [token]);

  // ── Remove a bookmark ──
  const handleRemove = async (jobId) => {
    setRemoving(jobId);
    try {
      await axios.delete(`${config.apiUrl}/bookmarks/${jobId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setBookmarks((prev) => prev.filter((b) => b.jobId !== jobId));
    } catch {
      setError("Failed to remove bookmark.");
    } finally {
      setRemoving(null);
    }
  };

  return (
    <Layout pageTitle="Bookmarks">
      <div className="max-w-6xl mx-auto px-4 py-6 space-y-6">

        {/* Header */}
        <div className="flex items-center justify-between">
          <PageHeader
            icon={Bookmark}
            title="Saved Jobs"
            description="Jobs you've bookmarked for later"
          />
          {bookmarks.length > 0 && (
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {bookmarks.length} saved {bookmarks.length === 1 ? "job" : "jobs"}
            </span>
          )}
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4 text-red-600 dark:text-red-400 text-sm flex items-center justify-between">
            {error}
            <button onClick={() => setError("")}><X size={14} /></button>
          </div>
        )}

        {/* Loading Skeleton */}
        {loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 animate-pulse">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-3" />
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-4" />
                <div className="flex gap-2">
                  {[...Array(3)].map((_, j) => (
                    <div key={j} className="h-5 bg-gray-200 dark:bg-gray-700 rounded-full w-16" />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && bookmarks.length === 0 && !error && (
          <div className="text-center py-20 text-gray-400 dark:text-gray-500">
            <Bookmark size={44} className="mx-auto mb-4 opacity-30" />
            <p className="font-medium text-gray-600 dark:text-gray-400">No saved jobs yet</p>
            <p className="text-sm mt-1">Click the bookmark icon on any job to save it here</p>
          </div>
        )}

        {/* Bookmarks Grid */}
        {!loading && bookmarks.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {bookmarks.map((b) => {
              const match = getMatchColor(b.matchPercentage);
              return (
                <div
                  key={b._id}
                  className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 hover:shadow-md transition-shadow duration-200"
                >
                  {/* Top Row */}
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 dark:text-white text-base leading-snug line-clamp-2">
                        {b.jobTitle}
                      </h3>
                      <div className="flex items-center gap-1 mt-1 text-sm text-gray-500 dark:text-gray-400">
                        <Building2 size={13} />
                        <span className="truncate">{b.company || "Unknown Company"}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span className={`text-xs font-semibold px-2 py-1 rounded-full ${match.bg} ${match.text}`}>
                        {b.matchPercentage}% {match.label}
                      </span>
                      {/* Remove Button */}
                      <button
                        onClick={() => handleRemove(b.jobId)}
                        disabled={removing === b.jobId}
                        className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors disabled:opacity-40"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>

                  {/* Meta Row */}
                  <div className="flex flex-wrap gap-2 mb-3">
                    {b.location && (
                      <span className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                        <MapPin size={11} /> {b.location}
                      </span>
                    )}
                    <span className="flex items-center gap-1 text-xs bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 px-2 py-0.5 rounded-full">
                      <Briefcase size={11} /> {b.jobLevel}
                    </span>
                    <span className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-2 py-0.5 rounded-full">
                      {b.jobType}
                    </span>
                  </div>

                  {/* Skills */}
                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {b.jobSkills.slice(0, 6).map((skill, i) => (
                      <span key={i} className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-2 py-0.5 rounded-md">
                        {skill}
                      </span>
                    ))}
                    {b.jobSkills.length > 6 && (
                      <span className="text-xs text-gray-400 dark:text-gray-500 px-1 py-0.5">
                        +{b.jobSkills.length - 6} more
                      </span>
                    )}
                  </div>

                  {/* Bottom Row */}
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-400 dark:text-gray-500">
                      {b.datePosted || "Date unknown"}
                    </span>
                    {b.jobLink && (
                     <a 
                        href={b.jobLink}
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
            })}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Bookmarks;