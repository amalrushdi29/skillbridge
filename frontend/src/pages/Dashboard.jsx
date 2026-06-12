import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Tooltip,
  Legend,
} from "chart.js";
import { Bar, Pie } from "react-chartjs-2";
import Layout from "../components/Layout.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import config from "../config.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Tooltip,
  Legend
);

// ─────────────────────────────────────────
// CONSTANTS
// ─────────────────────────────────────────
const EXCHANGE_RATES = {
  USD: 1,
  LKR: 320,
  AED: 3.67,
  GBP: 0.79,
  EUR: 0.92,
};

const CURRENCY_SYMBOLS = {
  USD: "$",
  LKR: "Rs.",
  AED: "AED",
  GBP: "£",
  EUR: "€",
};

const SALARY_DATA = [
  { level: "Entry Level", min: 40000,  max: 60000  },
  { level: "Associate",   min: 60000,  max: 85000  },
  { level: "Mid Level",   min: 85000,  max: 110000 },
  { level: "Senior",      min: 110000, max: 145000 },
  { level: "Lead",        min: 145000, max: 180000 },
  { level: "Principal",   min: 180000, max: 220000 },
];

const CHART_COLORS = {
  indigo:  "rgba(99,  102, 241, 0.85)",
  green:   "rgba(34,  197, 94,  0.85)",
  blue:    "rgba(59,  130, 246, 0.85)",
  orange:  "rgba(249, 115, 22,  0.85)",
  purple:  "rgba(168, 85,  247, 0.85)",
  pink:    "rgba(236, 72,  153, 0.85)",
  teal:    "rgba(20,  184, 166, 0.85)",
  yellow:  "rgba(234, 179, 8,   0.85)",
};

const LEVEL_COLORS = {
  "entry level": "bg-gray-100 text-gray-700",
  "associate":   "bg-blue-100 text-blue-700",
  "mid level":   "bg-indigo-100 text-indigo-700",
  "senior":      "bg-purple-100 text-purple-700",
  "lead":        "bg-orange-100 text-orange-700",
  "principal":   "bg-pink-100 text-pink-700",
};

// ─────────────────────────────────────────
// CIRCULAR PROGRESS COMPONENT
// ─────────────────────────────────────────
const CircularProgress = ({ value, color, label, subtitle }) => {
  const radius        = 54;
  const stroke        = 8;
  const normalised    = Math.min(Math.max(value, 0), 100);
  const circumference = 2 * Math.PI * radius;
  const offset        = circumference - (normalised / 100) * circumference;

  return (
    <div className="flex flex-col items-center gap-2">
      <svg width="130" height="130" className="-rotate-90">
        <circle cx="65" cy="65" r={radius} fill="none"
          stroke="currentColor" strokeWidth={stroke}
          className="text-gray-200 dark:text-gray-700" />
        <circle cx="65" cy="65" r={radius} fill="none"
          stroke={color} strokeWidth={stroke}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ transition: "stroke-dashoffset 1s ease" }} />
      </svg>
      <div className="flex flex-col items-center -mt-1">
        <span className="text-3xl font-bold text-gray-800 dark:text-white"
          style={{ marginTop: "-90px" }}>
          {value}%
        </span>
      </div>
      <p className="text-sm font-semibold text-gray-700 dark:text-gray-200 mt-14">{label}</p>
      {subtitle && (
        <p className="text-xs text-gray-400 dark:text-gray-500">{subtitle}</p>
      )}
    </div>
  );
};

// ─────────────────────────────────────────
// STAT CARD COMPONENT
// ─────────────────────────────────────────
const StatCard = ({ label, value, icon, color }) => (
  <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-gray-700 flex items-center gap-4">
    <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl ${color}`}>
      {icon}
    </div>
    <div>
      <p className="text-xs text-gray-400 dark:text-gray-500 uppercase tracking-wide">{label}</p>
      <p className="text-lg font-bold text-gray-800 dark:text-white">{value}</p>
    </div>
  </div>
);

// ─────────────────────────────────────────
// QUICK ACTION CARD COMPONENT
// ─────────────────────────────────────────
const QuickAction = ({ icon, label, description, color, onClick }) => (
  <button onClick={onClick}
    className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md hover:-translate-y-1 transition-all duration-200 text-left w-full">
    <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl mb-3 ${color}`}>
      {icon}
    </div>
    <p className="font-semibold text-gray-800 dark:text-white">{label}</p>
    <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">{description}</p>
  </button>
);

// ─────────────────────────────────────────
// MAIN DASHBOARD COMPONENT
// ─────────────────────────────────────────
const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [profile,       setProfile]       = useState(null);
  const [mlData,        setMlData]        = useState(null);
  const [chartData,     setChartData]     = useState(null);
  const [rolesData,     setRolesData]     = useState(null);
  const [skillCount,    setSkillCount]    = useState(0);
  const [loading,       setLoading]       = useState(true);
  const [currency,      setCurrency]      = useState("USD");

  const token = user?.token;

  // ── Fetch all data on mount ──
  useEffect(() => {
    const fetchAll = async () => {
      try {
        const headers = { Authorization: `Bearer ${token}` };

        // 1. Profile
        const profileRes = await axios.get(`${config.apiUrl}/profile`, { headers });
        const prof = profileRes.data;
        setProfile(prof);

        // 2. Skills
        const skillsRes  = await axios.get(`${config.apiUrl}/skills`, { headers });
        const skillNames = skillsRes.data.map((s) => s.name);
        setSkillCount(skillNames.length);

        // 3. ML skill gap (for personal summary)
        if (skillNames.length > 0 && prof.targetJobRole) {
          const mlRes = await axios.post(
            `${config.apiUrl}/ml/skill-gap`,
            {
              skills:            skillNames,
              targetRole:        prof.targetJobRole,
              yearsOfExperience: prof.yearsOfExperience || 0,
              jobType:           "full-time",
            },
            { headers }
          );
          setMlData(mlRes.data);
        }

        // 4. Dashboard chart stats
        const statsRes = await axios.post(
          `${config.apiUrl}/ml/dashboard-stats`,
          { targetRole: prof.targetJobRole || '' },
          { headers }
        );
        setChartData(statsRes.data);


      } catch (err) {
        console.error("Dashboard fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchAll();
  }, [token]);

  // ── Salary conversion ──
  const symbol = CURRENCY_SYMBOLS[currency];

  // ── Chart: Top 10 Skills ──
  const topSkillsChart = chartData ? {
    labels: chartData.topSkills.map((s) => s.skill.charAt(0).toUpperCase() + s.skill.slice(1)),
    datasets: [{
      label:           "Job Postings",
      data:            chartData.topSkills.map((s) => s.count),
      backgroundColor: Object.values(CHART_COLORS),
      borderRadius:    6,
    }],
  } : null;

  // ── Chart: Job Type Pie ──
  const jobTypeChart = chartData ? {
    labels:   Object.keys(chartData.jobTypeDistrib).map(
      (k) => k.charAt(0).toUpperCase() + k.slice(1)
    ),
    datasets: [{
      data:            Object.values(chartData.jobTypeDistrib),
      backgroundColor: [CHART_COLORS.indigo, CHART_COLORS.green, CHART_COLORS.blue],
      borderWidth:     2,
      borderColor:     "#fff",
    }],
  } : null;

  // ── Chart: Job Level Pie ──
  const jobLevelChart = chartData ? {
    labels:   Object.keys(chartData.jobLevelDistrib).map(
      (k) => k.split(" ").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ")
    ),
    datasets: [{
      data:            Object.values(chartData.jobLevelDistrib),
      backgroundColor: [CHART_COLORS.purple, CHART_COLORS.orange],
      borderWidth:     2,
      borderColor:     "#fff",
    }],
  } : null;

  // ── Chart: Salary by Level ──
  const salaryChart = {
    labels: SALARY_DATA.map((s) => s.level),
    datasets: [
      {
        label:           `Min Salary (${symbol})`,
        data:            SALARY_DATA.map((s) => s.min * EXCHANGE_RATES[currency]),
        backgroundColor: CHART_COLORS.indigo,
        borderRadius:    6,
      },
      {
        label:           `Max Salary (${symbol})`,
        data:            SALARY_DATA.map((s) => s.max * EXCHANGE_RATES[currency]),
        backgroundColor: CHART_COLORS.green,
        borderRadius:    6,
      },
    ],
  };

  // ── Chart: Role Specific Skills ──
    const roleSpecificChart = chartData?.roleSpecificSkills?.length > 0 ? {
      labels: chartData.roleSpecificSkills.map(
        (s) => s.skill.charAt(0).toUpperCase() + s.skill.slice(1)
      ),
      datasets: [{
        label:           "Skill Rank",
        data:            chartData.roleSpecificSkills.map((s) => 11 - s.count),
        backgroundColor: Object.values(CHART_COLORS),
        borderRadius:    6,
      }],
    } : null;

  const pieOptions = {
    responsive: true,
    plugins: {
      legend: { position: "bottom", labels: { padding: 16, font: { size: 12 } } },
    },
  };

  const barOptions = {
    responsive: true,
    indexAxis: "y",
    plugins: { legend: { display: false } },
    scales: {
      x: { grid: { color: "rgba(0,0,0,0.05)" } },
      y: { grid: { display: false } },
    },
  };

  const salaryOptions = {
    responsive: true,
    plugins: {
      legend: { position: "top" },
      tooltip: {
        callbacks: {
          label: (ctx) => ` ${symbol}${ctx.parsed.y.toLocaleString()}`,
        },
      },
    },
    scales: {
      x: { grid: { display: false } },
      y: {
        grid: { color: "rgba(0,0,0,0.05)" },
        ticks: { callback: (v) => `${symbol}${Number(v).toLocaleString()}` },
      },
    },
  };

  if (loading) {
    return (
      <Layout pageTitle="Dashboard">
        <div className="flex items-center justify-center h-96">
          <div className="flex flex-col items-center gap-3">
            <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-gray-400 text-sm">Loading your dashboard...</p>
          </div>
        </div>
      </Layout>
    );
  }

  const firstName  = profile?.name?.split(" ")[0] || "there";
  const targetRole = profile?.targetJobRole || "Not set";
  const empScore   = mlData?.employabilityScore ?? 0;
  const matchPct   = mlData?.matchPercentage ?? 0;
  const predLevel  = mlData?.predictedLevel?.toLowerCase() || "entry level";
  const levelColor = LEVEL_COLORS[predLevel] || "bg-gray-100 text-gray-700";
  const top3Missing = mlData?.missingSkills?.slice(0, 3) || [];
  const lastUpdated = profile?.updatedAt
    ? new Date(profile.updatedAt).toLocaleDateString("en-GB", {
        day: "numeric", month: "short", year: "numeric",
      })
    : "N/A";

  return (
    <Layout pageTitle="Dashboard">
      <div className="space-y-8 pb-10">

        {/* ── Welcome Banner ── */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-6 text-white shadow-md flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Welcome back, {firstName}! 👋</h1>
            <p className="text-indigo-100 text-sm mt-1">
              Here's your career intelligence overview for today.
            </p>
          </div>
          {/* Last Updated */}
          <div className="text-right hidden sm:block">
            <p className="text-indigo-200 text-xs uppercase tracking-wide">Last Updated</p>
            <p className="text-white font-semibold text-sm">{lastUpdated}</p>
          </div>
        </div>

        {/* ── Personal Summary ── */}
        <div>
          <h2 className="text-lg font-semibold text-gray-700 dark:text-gray-200 mb-4">
            Personal Summary
          </h2>

          {/* Circular scores */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 mb-4">
            {mlData ? (
              <div className="flex flex-wrap justify-around gap-6">
                <CircularProgress
                  value={empScore}
                  color="#6366F1"
                  label="Employability Score"
                  subtitle="Based on your skills" />
                <CircularProgress
                  value={matchPct}
                  color="#22C55E"
                  label="Role Match"
                  subtitle={targetRole} />
              </div>
            ) : (
              <p className="text-center text-gray-400 text-sm py-6">
                Add skills and set a target role in your profile to see your scores.
              </p>
            )}
          </div>

          {/* Stat cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-4">
              <StatCard label="Target Role" value={targetRole} icon="🎯"
                color="bg-indigo-50 dark:bg-indigo-900/30" />
              <StatCard label="Predicted Level" value={
                <span className={`px-2 py-0.5 rounded-full text-sm font-medium ${levelColor}`}>
                  {mlData?.predictedLevel || "N/A"}
                </span>
              } icon="📊" color="bg-purple-50 dark:bg-purple-900/30" />
              <StatCard label="Employability" value={`${empScore}%`} icon="⚡"
                color="bg-green-50 dark:bg-green-900/30" />
              <StatCard label="Role Match" value={`${matchPct}%`} icon="🎯"
                color="bg-blue-50 dark:bg-blue-900/30" />
              <StatCard label="Total Skills" value={
                <span className="flex items-center gap-2">
                  {skillCount}
                  <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300">
                    skills added
                  </span>
                </span>
              } icon="🧠" color="bg-teal-50 dark:bg-teal-900/30" />
            </div>

          {/* Top 3 Missing Skills */}
          {top3Missing.length > 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-gray-700">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-gray-700 dark:text-gray-200">
                  🚨 Top Skills You're Missing
                </h3>
                <button
                  onClick={() => navigate("/recommendations")}
                  className="text-xs text-indigo-500 hover:text-indigo-600 font-medium">
                  View Full Roadmap →
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {top3Missing.map((skill, i) => (
                  <span key={i}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-full text-sm font-medium bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400 border border-red-100 dark:border-red-800">
                    <span className="text-xs font-bold">#{i + 1}</span>
                    {skill.charAt(0).toUpperCase() + skill.slice(1)}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* ── Market Trends ── */}
        <div>
          <h2 className="text-lg font-semibold text-gray-700 dark:text-gray-200 mb-4">
            Market Trends
          </h2>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

            {/* Top 10 Skills */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
              <h3 className="font-semibold text-gray-700 dark:text-gray-200 mb-4">
                🔥 Most In-Demand IT Skills
              </h3>
              {topSkillsChart ? (
                <Bar data={topSkillsChart} options={barOptions} />
              ) : (
                <p className="text-gray-400 text-sm">Loading...</p>
              )}
            </div>

           {/* Role Specific Skills */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
              <h3 className="font-semibold text-gray-700 dark:text-gray-200 mb-4">
                🎯 Top Skills for {targetRole}
              </h3>
              {roleSpecificChart ? (
                <Bar data={roleSpecificChart} options={barOptions} />
              ) : (
                <p className="text-gray-400 text-sm">
                  {targetRole === "Not set"
                    ? "Set a target role in your profile to see role-specific skills."
                    : "Loading..."}
                </p>
              )}
            </div>
            {/* Job Type Distribution */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
              <h3 className="font-semibold text-gray-700 dark:text-gray-200 mb-4">
                💼 Job Type Distribution
              </h3>
              {jobTypeChart ? (
                <div className="flex justify-center">
                  <div style={{ maxWidth: "320px", width: "100%" }}>
                    <Pie data={jobTypeChart} options={pieOptions} />
                  </div>
                </div>
              ) : (
                <p className="text-gray-400 text-sm">Loading...</p>
              )}
            </div>

            {/* Job Level Distribution */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
              <h3 className="font-semibold text-gray-700 dark:text-gray-200 mb-4">
                📈 Job Level Distribution
              </h3>
              {jobLevelChart ? (
                <div className="flex justify-center">
                  <div style={{ maxWidth: "320px", width: "100%" }}>
                    <Pie data={jobLevelChart} options={pieOptions} />
                  </div>
                </div>
              ) : (
                <p className="text-gray-400 text-sm">Loading...</p>
              )}
            </div>

            {/* Salary by Level — full width */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 lg:col-span-2">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-700 dark:text-gray-200">
                  💰 Estimated Salary by Level
                </h3>
                <select
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  className="text-sm border border-gray-200 dark:border-gray-600 rounded-lg px-2 py-1 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-400">
                  {Object.keys(EXCHANGE_RATES).map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
              <Bar data={salaryChart} options={salaryOptions} />
              <p className="text-xs text-gray-400 mt-3 text-center">
                * Annual salary estimates based on industry benchmarks. Exchange rates are approximate.
              </p>
            </div>

          </div>
        </div>

        {/* ── Quick Actions ── */}
        <div>
          <h2 className="text-lg font-semibold text-gray-700 dark:text-gray-200 mb-4">
            Quick Actions
          </h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <QuickAction
              icon="🔍" label="Skill Gap Analysis"
              description="See what skills you're missing"
              color="bg-indigo-50 dark:bg-indigo-900/30"
              onClick={() => navigate("/skill-gap")} />
            <QuickAction
              icon="🗺️" label="Recommendations"
              description="Get your learning roadmap"
              color="bg-purple-50 dark:bg-purple-900/30"
              onClick={() => navigate("/recommendations")} />
            <QuickAction
              icon="💼" label="Browse Jobs"
              description="Find matching job listings"
              color="bg-blue-50 dark:bg-blue-900/30"
              onClick={() => navigate("/jobs")} />
            <QuickAction
              icon="⚡" label="Manage Skills"
              description="Add or update your skills"
              color="bg-green-50 dark:bg-green-900/30"
              onClick={() => navigate("/skills")} />
          </div>
        </div>

      </div>
    </Layout>
  );
};

export default Dashboard;