import { useEffect, useState } from "react";
import { Search, Briefcase, ExternalLink, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import PublicNavbar from "../components/PublicNavbar.jsx";
import PublicFooter from "../components/PublicFooter.jsx";
import config from "../config.js";

const JobListings = () => {
  const navigate = useNavigate();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");
  const [jobLevel, setJobLevel] = useState("");
  const [jobType, setJobType] = useState("");

  const fetchJobs = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${config.apiUrl}/ml/public/jobs`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ page, search, jobLevel, jobType }),
      });
      const data = await res.json();

      if (data.success) {
        setJobs(data.jobs);
        setTotalPages(data.totalPages);
      } else {
        setError("Could not load job listings.");
      }
    } catch (err) {
      setError("Could not connect to the server.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    fetchJobs();
  };

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 flex flex-col">
      <PublicNavbar />

      {/* Header */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-14 pb-8 text-center">
        <span className="inline-flex items-center gap-2 text-xs font-medium text-indigo-500 bg-indigo-50 dark:bg-indigo-500/10 px-3 py-1 rounded-full mb-4">
          <Briefcase size={14} />
          Live Job Data
        </span>
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white">
          Explore IT Job Listings
        </h1>
        <p className="mt-4 text-sm md:text-base text-gray-600 dark:text-gray-400 max-w-xl mx-auto">
          Browse real IT job listings from our dataset. Sign up to see your
          personalized match percentage for every job.
        </p>
      </section>

      {/* Filters */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <form
          onSubmit={handleSearch}
          className="flex flex-col sm:flex-row gap-3 mb-8"
        >
          <div className="relative flex-1">
            <Search
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search job title..."
              className="w-full pl-9 pr-3 py-2.5 text-sm rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <select
            value={jobLevel}
            onChange={(e) => setJobLevel(e.target.value)}
            className="px-3 py-2.5 text-sm rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">All Levels</option>
            <option value="associate">Associate</option>
            <option value="mid senior">Mid Senior</option>
          </select>

          <select
            value={jobType}
            onChange={(e) => setJobType(e.target.value)}
            className="px-3 py-2.5 text-sm rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">All Types</option>
            <option value="remote">Remote</option>
            <option value="hybrid">Hybrid</option>
            <option value="onsite">Onsite</option>
          </select>

          <button
            type="submit"
            className="px-5 py-2.5 text-sm font-medium text-white bg-indigo-500 hover:bg-indigo-600 rounded-lg transition-colors"
          >
            Search
          </button>
        </form>
      </section>

      {/* Job List */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pb-16 w-full flex-1">
        {loading && (
          <p className="text-center text-sm text-gray-500 dark:text-gray-400">
            Loading job listings...
          </p>
        )}

        {error && <p className="text-center text-sm text-red-500">{error}</p>}

        {!loading && !error && jobs.length === 0 && (
          <p className="text-center text-sm text-gray-500 dark:text-gray-400">
            No jobs found. Try a different search or filter.
          </p>
        )}

        {!loading && !error && jobs.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {jobs.map((job) => (
              <div
                key={job.id}
                className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-5 flex flex-col"
              >
                <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-1">
                  {job.jobTitle}
                </h3>
                {job.company && (
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
                    {job.company}
                  </p>
                )}

                <div className="flex flex-wrap gap-2 mb-4">
                  <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
                    {job.jobLevel}
                  </span>
                  <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300">
                    {job.jobType}
                  </span>
                </div>

                <div className="flex flex-wrap gap-1.5 mb-4">
                  {job.jobSkills.slice(0, 6).map((skill) => (
                    <span
                      key={skill}
                      className="text-xs px-2 py-1 rounded-md bg-gray-50 dark:bg-gray-900 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-700"
                    >
                      {skill}
                    </span>
                  ))}
                </div>

                <div className="mt-auto flex items-center justify-between pt-3 border-t border-gray-100 dark:border-gray-700">
                  <span className="text-xs text-gray-400 dark:text-gray-500">
                    {job.datePosted}
                  </span>
                  {job.jobLink && (
                    <a
                      href={job.jobLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-xs font-medium text-indigo-500 hover:text-indigo-600"
                    >
                      View Job
                      <ExternalLink size={12} />
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {!loading && !error && jobs.length > 0 && (
          <div className="flex items-center justify-center gap-4 mt-8">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="text-sm font-medium text-gray-600 dark:text-gray-400 disabled:opacity-40 disabled:cursor-not-allowed hover:text-indigo-500"
            >
              Previous
            </button>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              Page {page} of {totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="text-sm font-medium text-gray-600 dark:text-gray-400 disabled:opacity-40 disabled:cursor-not-allowed hover:text-indigo-500"
            >
              Next
            </button>
          </div>
        )}

        {/* CTA */}
        {!loading && !error && (
          <div className="mt-12 text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Want to see your match percentage for these jobs?
            </p>
            <button
              onClick={() => navigate("/register")}
              className="inline-flex items-center gap-2 text-sm font-medium text-white bg-indigo-500 hover:bg-indigo-600 px-6 py-3 rounded-lg transition-colors"
            >
              Sign Up to See Matches
              <ArrowRight size={16} />
            </button>
          </div>
        )}
      </section>

      <PublicFooter />
    </div>
  );
};

export default JobListings;