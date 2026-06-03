import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../components/Layout.jsx";
import Card from "../components/Card.jsx";
import PageHeader from "../components/PageHeader.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import config from "../config.js";
import {
  BookOpen,
  Clock,
  ExternalLink,
  Loader,
  Play,
  FileText,
  GraduationCap,
  Sparkles,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  Lightbulb,
} from "lucide-react";

const Recommendations = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [recommendations, setRecommendations] = useState([]);
  const [targetRole, setTargetRole] = useState("");
  const [totalMissing, setTotalMissing] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [expandedCards, setExpandedCards] = useState({});

  // Auto dismiss error
  useEffect(() => {
    if (error) {
      const t = setTimeout(() => setError(""), 4000);
      return () => clearTimeout(t);
    }
  }, [error]);

  // Fetch recommendations on page load
  useEffect(() => {
    const fetchRecommendations = async () => {
      try {
        setLoading(true);
        const res = await fetch(`${config.apiUrl}/recommendations`, {
          headers: {
            Authorization: `Bearer ${user.token}`,
          },
        });
        const data = await res.json();
        if (!res.ok) {
          setError(data.message || "Failed to load recommendations.");
          return;
        }
        setRecommendations(data.recommendations || []);
        setTargetRole(data.targetRole || "");
        setTotalMissing(data.totalMissing || 0);
      } catch {
        setError("Something went wrong. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchRecommendations();
  }, [user.token]);

  // Toggle expand/collapse for each skill card
  const toggleCard = (index) => {
    setExpandedCards((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  // Resource type icon and color
  const getResourceStyle = (type) => {
    switch (type) {
      case "YouTube":
        return {
          icon: <Play size={14} />,
          classes: "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300",
        };
      case "Documentation":
        return {
          icon: <FileText size={14} />,
          classes: "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300",
        };
      case "Free Course":
        return {
          icon: <GraduationCap size={14} />,
          classes: "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300",
        };
      default:
        return {
          icon: <BookOpen size={14} />,
          classes: "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300",
        };
    }
  };

  // Estimated time badge color
  const getTimeBadgeColor = (time) => {
    if (time.includes("1") || time.includes("2")) {
      return "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300";
    } else if (time.includes("3") || time.includes("4")) {
      return "bg-yellow-100 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-300";
    } else {
      return "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300";
    }
  };

  return (
    <Layout pageTitle="Recommendations">
      <div className="max-w-4xl mx-auto space-y-6">

        {/* Header */}
        <PageHeader 
          icon={Lightbulb} 
          title="AI Recommendations" 
          description="Personalized learning roadmap based on your skill gap analysis" 
        />

        {/* Error message */}
        {error && (
          <div className="flex items-center gap-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 px-4 py-3 rounded-xl text-sm">
            <AlertCircle size={16} />
            {error}
          </div>
        )}

        {/* Loading state */}
        {loading && (
          <Card>
            <div className="flex flex-col items-center justify-center py-16 gap-4">
              <Loader size={32} className="animate-spin text-indigo-500" />
              <p className="text-gray-500 dark:text-gray-400 text-sm">
                Generating your personalized roadmap...
              </p>
            </div>
          </Card>
        )}

        {/* Results */}
        {!loading && recommendations.length > 0 && (
          <>
            {/* Summary banner */}
            <div className="bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-800 rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center gap-4">
              <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-[#6366F1] text-white shrink-0">
                <Sparkles size={22} />
              </div>
              <div>
                <p className="text-gray-800 dark:text-gray-100 font-semibold">
                  Your roadmap for{" "}
                  <span className="text-[#6366F1]">{targetRole}</span>
                </p>
                <p className="text-gray-500 dark:text-gray-400 text-sm mt-0.5">
                  {recommendations.length} skills to learn •{" "}
                  {totalMissing > recommendations.length
                    ? `${totalMissing - recommendations.length} more identified beyond this list`
                    : "covering your most critical gaps"}
                </p>
              </div>
              <button
                onClick={() => navigate("/skill-gap")}
                className="sm:ml-auto text-sm text-[#6366F1] hover:underline shrink-0"
              >
                View skill gap →
              </button>
            </div>

            {/* Skill cards */}
            <div className="space-y-4">
              {recommendations.map((rec, index) => {
                const isExpanded = expandedCards[index];
                return (
                  <Card key={index}>
                    {/* Card header — always visible */}
                    <div
                      className="flex items-start justify-between gap-4 cursor-pointer"
                      onClick={() => toggleCard(index)}
                    >
                      <div className="flex items-start gap-4">
                        {/* Rank number */}
                        <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-indigo-50 dark:bg-indigo-900/30 text-[#6366F1] font-bold text-sm shrink-0">
                          {index + 1}
                        </div>

                        <div>
                          {/* Skill name */}
                          <h3 className="text-base font-semibold text-gray-800 dark:text-gray-100 capitalize">
                            {rec.skill}
                          </h3>
                          {/* Importance */}
                          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1 leading-relaxed">
                            {rec.importance}
                          </p>
                          {/* Time badge */}
                          <div className="flex items-center gap-1.5 mt-2">
                            <Clock size={13} className="text-gray-400" />
                            <span
                              className={`text-xs font-medium px-2.5 py-1 rounded-full ${getTimeBadgeColor(rec.estimatedTime)}`}
                            >
                              {rec.estimatedTime}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Expand toggle */}
                      <div className="shrink-0 text-gray-400 dark:text-gray-500 mt-1">
                        {isExpanded ? (
                          <ChevronUp size={18} />
                        ) : (
                          <ChevronDown size={18} />
                        )}
                      </div>
                    </div>

                    {/* Resources — visible only when expanded */}
                    {isExpanded && (
                      <div className="mt-5 pt-5 border-t border-gray-100 dark:border-gray-700">
                        <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3">
                          Free Learning Resources
                        </p>
                        <div className="space-y-2">
                          {rec.resources.map((resource, rIndex) => {
                            const style = getResourceStyle(resource.type);
                            return (
                              <a
                                key={rIndex}
                                href={resource.url}
                                target="_blank"
                                rel="noreferrer"
                                className="flex items-center justify-between gap-3 p-3 rounded-xl bg-gray-50 dark:bg-[#0F172A] hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-colors group"
                              >
                                <div className="flex items-center gap-3 min-w-0">
                                  {/* Type badge */}
                                  <span
                                    className={`flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full shrink-0 ${style.classes}`}
                                  >
                                    {style.icon}
                                    {resource.type}
                                  </span>
                                  {/* Resource title */}
                                  <span className="text-sm text-gray-700 dark:text-gray-300 truncate group-hover:text-[#6366F1] transition-colors">
                                    {resource.title}
                                  </span>
                                </div>
                                <ExternalLink
                                  size={14}
                                  className="text-gray-400 shrink-0"
                                />
                              </a>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </Card>
                );
              })}
            </div>
          </>
        )}

        {/* Empty state — all skills covered */}
        {!loading && recommendations.length === 0 && !error && (
          <Card>
            <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
              <div className="w-14 h-14 rounded-2xl bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                <Sparkles size={26} className="text-green-600 dark:text-green-400" />
              </div>
              <p className="text-gray-800 dark:text-gray-100 font-semibold text-lg">
                You're all caught up!
              </p>
              <p className="text-gray-500 dark:text-gray-400 text-sm max-w-sm">
                You already have all the key skills for your target role. Keep
                learning to stay ahead of the market.
              </p>
              <button
                onClick={() => navigate("/skill-gap")}
                className="mt-2 text-sm text-[#6366F1] hover:underline"
              >
                Review your skill gap →
              </button>
            </div>
          </Card>
        )}

      </div>
    </Layout>
  );
};

export default Recommendations;