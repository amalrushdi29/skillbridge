import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../components/Layout.jsx";
import Card from "../components/Card.jsx";
import PageHeader from "../components/PageHeader.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import config from "../config.js";
import jsPDF from "jspdf";
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
  RefreshCw,
  Download,
  Filter,
} from "lucide-react";

const Recommendations = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const printRef = useRef(null);

  const [recommendations, setRecommendations] = useState([]);
  const [targetRole, setTargetRole] = useState("");
  const [totalMissing, setTotalMissing] = useState(0);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [error, setError] = useState("");
  const [expandedCards, setExpandedCards] = useState({});
  const [activeFilter, setActiveFilter] = useState("All");

  const filterOptions = ["All", "YouTube", "Documentation", "Free Course"];

  // Auto dismiss error
  useEffect(() => {
    if (error) {
      const t = setTimeout(() => setError(""), 4000);
      return () => clearTimeout(t);
    }
  }, [error]);

  // Fetch recommendations
  const fetchRecommendations = async (isRefresh = false) => {
    try {
      isRefresh ? setRefreshing(true) : setLoading(true);
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
      setExpandedCards({});
      setActiveFilter("All");
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Initial load
  useEffect(() => {
    fetchRecommendations();
  }, [user.token]);

  // Toggle expand/collapse
  const toggleCard = (index) => {
    setExpandedCards((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  // Calculate total estimated time from all skills
  const calculateTotalTime = () => {
    let minTotal = 0;
    let maxTotal = 0;
    recommendations.forEach((rec) => {
      const numbers = rec.estimatedTime.match(/\d+/g);
      if (numbers && numbers.length >= 2) {
        minTotal += parseInt(numbers[0]);
        maxTotal += parseInt(numbers[1]);
      } else if (numbers && numbers.length === 1) {
        minTotal += parseInt(numbers[0]);
        maxTotal += parseInt(numbers[0]);
      }
    });
    return `${minTotal}–${maxTotal} weeks`;
  };

  // Export as PDF
  const handleExportPDF = async () => {
  try {
    setExporting(true);
    const pdf = new jsPDF("p", "mm", "a4");
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const margin = 14;
    const contentWidth = pageWidth - margin * 2;
    let y = 0;

    // Helper — add new page if content overflows
    const checkPageBreak = (neededHeight) => {
      if (y + neededHeight > pageHeight - 20) {
        pdf.addPage();
        y = 20;
      }
    };

    // ── Cover header bar ──
    pdf.setFillColor(99, 102, 241);
    pdf.rect(0, 0, pageWidth, 42, "F");
    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(22);
    pdf.setFont("helvetica", "bold");
    pdf.text("SkillBridge", margin, 18);
    pdf.setFontSize(11);
    pdf.setFont("helvetica", "normal");
    pdf.text("AI-Powered Learning Roadmap", margin, 28);
    pdf.setFontSize(9);
    pdf.text(`Generated on ${new Date().toLocaleDateString()}`, margin, 37);

    y = 54;

    // ── Target role ──
    pdf.setTextColor(30, 41, 59);
    pdf.setFontSize(15);
    pdf.setFont("helvetica", "bold");
    pdf.text(`Target Role: ${targetRole}`, margin, y);
    y += 8;

    // ── Summary line ──
    pdf.setFontSize(10);
    pdf.setFont("helvetica", "normal");
    pdf.setTextColor(100, 116, 139);
    pdf.text(
      `${recommendations.length} skills identified   •   Estimated total: ${calculateTotalTime()}`,
      margin,
      y
    );
    y += 6;

    // ── Divider ──
    pdf.setDrawColor(226, 232, 240);
    pdf.line(margin, y, pageWidth - margin, y);
    y += 10;

    // ── Skill cards ──
    recommendations.forEach((rec, index) => {
      checkPageBreak(40);

      // Rank + skill name bar
      pdf.setFillColor(238, 242, 255);
      pdf.roundedRect(margin, y, contentWidth, 10, 2, 2, "F");
      pdf.setTextColor(99, 102, 241);
      pdf.setFontSize(10);
      pdf.setFont("helvetica", "bold");
      pdf.text(`${index + 1}.  ${rec.skill.toUpperCase()}`, margin + 4, y + 7);
      y += 14;

      // Estimated time badge
      pdf.setFillColor(254, 249, 195);
      pdf.roundedRect(margin, y, 50, 7, 2, 2, "F");
      pdf.setTextColor(133, 79, 11);
      pdf.setFontSize(8);
      pdf.setFont("helvetica", "normal");
      pdf.text(`Time: ${rec.estimatedTime}`, margin + 2, y + 5);
      y += 11;

      // Importance text — wrapped
      pdf.setTextColor(71, 85, 105);
      pdf.setFontSize(9);
      pdf.setFont("helvetica", "normal");
      const importanceLines = pdf.splitTextToSize(rec.importance, contentWidth);
      checkPageBreak(importanceLines.length * 5 + 6);
      pdf.text(importanceLines, margin, y);
      y += importanceLines.length * 5 + 4;

      // Resources
      pdf.setFontSize(8);
      pdf.setFont("helvetica", "bold");
      pdf.setTextColor(100, 116, 139);
      pdf.text("FREE LEARNING RESOURCES", margin, y);
      y += 5;

      rec.resources.forEach((resource) => {
        checkPageBreak(10);

        // Type badge color
        if (resource.type === "YouTube") {
          pdf.setFillColor(254, 226, 226);
          pdf.setTextColor(185, 28, 28);
        } else if (resource.type === "Documentation") {
          pdf.setFillColor(219, 234, 254);
          pdf.setTextColor(29, 78, 216);
        } else {
          pdf.setFillColor(220, 252, 231);
          pdf.setTextColor(21, 128, 61);
        }

        pdf.roundedRect(margin, y, 28, 6, 1, 1, "F");
        pdf.setFontSize(7);
        pdf.setFont("helvetica", "bold");
        pdf.text(resource.type, margin + 2, y + 4.5);

        // Resource title
        pdf.setTextColor(30, 41, 59);
        pdf.setFontSize(8);
        pdf.setFont("helvetica", "normal");
        const titleLines = pdf.splitTextToSize(resource.title, contentWidth - 34);
        pdf.text(titleLines, margin + 32, y + 4.5);
        y += titleLines.length * 5 + 2;
      });

      // Divider between skills
      y += 2;
      pdf.setDrawColor(241, 245, 249);
      pdf.line(margin, y, pageWidth - margin, y);
      y += 8;
    });

    // ── Footer ──
    pdf.setFontSize(8);
    pdf.setTextColor(148, 163, 184);
    pdf.text(
      "Generated by SkillBridge — AI-Powered IT Career Intelligence",
      margin,
      pageHeight - 8
    );

    pdf.save(`SkillBridge_Roadmap_${targetRole.replace(/\s+/g, "_")}.pdf`);
  } catch (err) {
    setError("Failed to export PDF. Please try again.");
    console.error(err);
  } finally {
    setExporting(false);
  }
};

  // Resource type icon and color
  const getResourceStyle = (type) => {
    switch (type) {
      case "YouTube":
        return {
          icon: <Play size={14} />,
          classes:
            "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300",
        };
      case "Documentation":
        return {
          icon: <FileText size={14} />,
          classes:
            "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300",
        };
      case "Free Course":
        return {
          icon: <GraduationCap size={14} />,
          classes:
            "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300",
        };
      default:
        return {
          icon: <BookOpen size={14} />,
          classes:
            "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300",
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

  // Filter resources inside each card
  const getFilteredResources = (resources) => {
    if (activeFilter === "All") return resources;
    return resources.filter((r) => r.type === activeFilter);
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
            <div className="bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-800 rounded-2xl p-5">
              <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-[#6366F1] text-white shrink-0">
                  <Sparkles size={22} />
                </div>
                <div className="flex-1">
                  <p className="text-gray-800 dark:text-gray-100 font-semibold">
                    Your roadmap for{" "}
                    <span className="text-[#6366F1]">{targetRole}</span>
                  </p>
                  <div className="flex flex-wrap gap-3 mt-1">
                    <span className="text-gray-500 dark:text-gray-400 text-sm">
                      {recommendations.length} skills to learn
                    </span>
                    <span className="text-gray-300 dark:text-gray-600">•</span>
                    <span className="flex items-center gap-1 text-sm text-indigo-600 dark:text-indigo-400 font-medium">
                      <Clock size={13} />
                      Estimated total: {calculateTotalTime()}
                    </span>
                  </div>
                </div>

                {/* Action buttons */}
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => fetchRecommendations(true)}
                    disabled={refreshing}
                    className="flex items-center gap-1.5 px-3 py-2 text-sm text-gray-600 dark:text-gray-300 bg-white dark:bg-[#1E293B] border border-gray-200 dark:border-gray-700 rounded-xl hover:border-indigo-300 transition-colors disabled:opacity-50"
                  >
                    <RefreshCw
                      size={14}
                      className={refreshing ? "animate-spin" : ""}
                    />
                    {refreshing ? "Refreshing..." : "Refresh"}
                  </button>
                  <button
                    onClick={handleExportPDF}
                    disabled={exporting}
                    className="flex items-center gap-1.5 px-3 py-2 text-sm text-white bg-[#6366F1] rounded-xl hover:bg-indigo-600 transition-colors disabled:opacity-50"
                  >
                    <Download size={14} />
                    {exporting ? "Exporting..." : "Export PDF"}
                  </button>
                </div>
              </div>
            </div>

            {/* Filter bar */}
            <div className="flex items-center gap-2 flex-wrap">
              <Filter size={15} className="text-gray-400 shrink-0" />
              {filterOptions.map((option) => (
                <button
                  key={option}
                  onClick={() => setActiveFilter(option)}
                  className={`text-xs font-medium px-3 py-1.5 rounded-full transition-colors ${
                    activeFilter === option
                      ? "bg-[#6366F1] text-white"
                      : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-indigo-50 dark:hover:bg-indigo-900/20"
                  }`}
                >
                  {option}
                </button>
              ))}
            </div>

            {/* Skill cards — wrapped in printRef for PDF export */}
            <div ref={printRef} className="space-y-4">
              {recommendations.map((rec, index) => {
                const isExpanded = expandedCards[index];
                const filteredResources = getFilteredResources(rec.resources);
                return (
                  <Card key={index}>
                    {/* Card header */}
                    <div
                      className="flex items-start justify-between gap-4 cursor-pointer"
                      onClick={() => toggleCard(index)}
                    >
                      <div className="flex items-start gap-4">
                        <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-indigo-50 dark:bg-indigo-900/30 text-[#6366F1] font-bold text-sm shrink-0">
                          {index + 1}
                        </div>
                        <div>
                          <h3 className="text-base font-semibold text-gray-800 dark:text-gray-100 capitalize">
                            {rec.skill}
                          </h3>
                          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1 leading-relaxed">
                            {rec.importance}
                          </p>
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
                      <div className="shrink-0 text-gray-400 dark:text-gray-500 mt-1">
                        {isExpanded ? (
                          <ChevronUp size={18} />
                        ) : (
                          <ChevronDown size={18} />
                        )}
                      </div>
                    </div>

                    {/* Resources */}
                    {isExpanded && (
                      <div className="mt-5 pt-5 border-t border-gray-100 dark:border-gray-700">
                        <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3">
                          Free Learning Resources
                        </p>
                        {filteredResources.length === 0 ? (
                          <p className="text-sm text-gray-400 dark:text-gray-500 text-center py-3">
                            No {activeFilter} resources for this skill.
                          </p>
                        ) : (
                          <div className="space-y-2">
                            {filteredResources.map((resource, rIndex) => {
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
                                    <span
                                      className={`flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full shrink-0 ${style.classes}`}
                                    >
                                      {style.icon}
                                      {resource.type}
                                    </span>
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
                        )}
                      </div>
                    )}
                  </Card>
                );
              })}
            </div>

            {/* View skill gap link */}
            <div className="text-center">
              <button
                onClick={() => navigate("/skill-gap")}
                className="text-sm text-[#6366F1] hover:underline"
              >
                ← Back to skill gap analysis
              </button>
            </div>
          </>
        )}

        {/* Empty state */}
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