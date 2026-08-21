import { useEffect, useState } from "react";
import {
  TrendingUp,
  ArrowRight,
  Flame,
  Layers,
  BarChart3,
  Code2,
  Database,
  Cloud,
  GitBranch,
  Boxes,
  Cpu,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import PublicNavbar from "../components/PublicNavbar.jsx";
import PublicFooter from "../components/PublicFooter.jsx";
import config from "../config.js";

// Maps a skill name to an icon + a themed color
const skillVisuals = {
  python: { icon: Code2, color: "#3776AB" },
  java: { icon: Code2, color: "#E76F00" },
  javascript: { icon: Code2, color: "#F0DB4F" },
  aws: { icon: Cloud, color: "#FF9900" },
  sql: { icon: Database, color: "#4479A1" },
  agile: { icon: Layers, color: "#00A86B" },
  git: { icon: GitBranch, color: "#F05032" },
  "c#": { icon: Code2, color: "#9B4F96" },
  "software engineering": { icon: Cpu, color: "#6366F1" },
  "c++": { icon: Code2, color: "#00599C" },
};

const defaultVisual = { icon: Boxes, color: "#6366F1" };

const TrendingSkills = () => {
  const navigate = useNavigate();
  const [skills, setSkills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [animate, setAnimate] = useState(false);

  useEffect(() => {
    const fetchSkills = async () => {
      try {
        const res = await fetch(`${config.apiUrl}/ml/public/trending-skills`);
        const data = await res.json();

        if (data.success) {
          setSkills(data.topSkills);
        } else {
          setError("Could not load trending skills.");
        }
      } catch (err) {
        setError("Could not connect to the server.");
      } finally {
        setLoading(false);
      }
    };

    fetchSkills();
  }, []);

  // Trigger bar animation shortly after data renders
  useEffect(() => {
    if (!loading && skills.length > 0) {
      const timer = setTimeout(() => setAnimate(true), 100);
      return () => clearTimeout(timer);
    }
  }, [loading, skills]);

  const maxCount = skills.length > 0 ? skills[0].count : 1;
  const totalMentions = skills.reduce((sum, s) => sum + s.count, 0);

  const topThree = skills.slice(0, 3);
  const rest = skills.slice(3);

  const getVisual = (skillName) => skillVisuals[skillName] || defaultVisual;

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 flex flex-col">
      <PublicNavbar />

      {/* Header */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-14 pb-8 text-center">
        <span className="inline-flex items-center gap-2 text-xs font-medium text-indigo-500 bg-indigo-50 dark:bg-indigo-500/10 px-3 py-1 rounded-full mb-4">
          <TrendingUp size={14} />
          Live Market Data
        </span>
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white">
          Top 10 Most In-Demand IT Skills
        </h1>
        <p className="mt-4 text-sm md:text-base text-gray-600 dark:text-gray-400 max-w-xl mx-auto">
          Based on real IT job listings in our dataset. See what employers
          are actually looking for right now.
        </p>
      </section>

      {/* Stat highlights row */}
      {!loading && !error && (
        <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-10 w-full">
          <div className="grid grid-cols-3 gap-3 sm:gap-4">
            <div className="text-center bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl py-4 px-2">
              <p className="text-xl sm:text-2xl font-bold text-indigo-500">
                {skills.length}
              </p>
              <p className="text-[11px] sm:text-xs text-gray-500 dark:text-gray-400 mt-1">
                Skills Tracked
              </p>
            </div>
            <div className="text-center bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl py-4 px-2">
              <p className="text-xl sm:text-2xl font-bold text-indigo-500">
                {totalMentions.toLocaleString()}
              </p>
              <p className="text-[11px] sm:text-xs text-gray-500 dark:text-gray-400 mt-1">
                Skill Mentions
              </p>
            </div>
            <div className="text-center bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl py-4 px-2">
              <p className="text-xl sm:text-2xl font-bold text-indigo-500">
                9,380+
              </p>
              <p className="text-[11px] sm:text-xs text-gray-500 dark:text-gray-400 mt-1">
                Jobs Analyzed
              </p>
            </div>
          </div>
        </section>
      )}

      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-16 w-full flex-1">
        {loading && (
          <p className="text-center text-sm text-gray-500 dark:text-gray-400">
            Loading trending skills...
          </p>
        )}

        {error && <p className="text-center text-sm text-red-500">{error}</p>}

        {!loading && !error && (
          <>
            {/* Podium — Top 3 */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
              {topThree.map((item, index) => {
                const visual = getVisual(item.skill);
                const Icon = visual.icon;
                const podiumOrder = ["order-2 sm:order-1", "order-1 sm:order-2", "order-3"];
                const podiumScale = index === 1 ? "sm:scale-105 sm:-translate-y-2" : "";

                return (
                  <div
                    key={item.skill}
                    className={`relative bg-white dark:bg-gray-800 border-2 rounded-2xl p-5 text-center ${podiumOrder[index]} ${podiumScale}`}
                    style={{ borderColor: visual.color }}
                  >
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 flex items-center gap-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 px-2.5 py-0.5 rounded-full">
                      {index === 0 && <Flame size={12} className="text-orange-500" />}
                      <span className="text-xs font-bold text-gray-700 dark:text-gray-200">
                        #{index + 1}
                      </span>
                    </div>

                    <div
                      className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mt-3 mb-3"
                      style={{ backgroundColor: `${visual.color}1A` }}
                    >
                      <Icon size={26} style={{ color: visual.color }} />
                    </div>

                    <h3 className="text-base font-bold text-gray-900 dark:text-white capitalize">
                      {item.skill}
                    </h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {item.count.toLocaleString()} listings
                    </p>
                  </div>
                );
              })}
            </div>

            {/* Ranks 4-10 */}
            <div className="flex flex-col gap-3">
              {rest.map((item, i) => {
                const index = i + 3;
                const visual = getVisual(item.skill);
                const Icon = visual.icon;

                return (
                  <div
                    key={item.skill}
                    className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-4 sm:p-5"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <span className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300">
                          {index + 1}
                        </span>
                        <div
                          className="w-7 h-7 rounded-md flex items-center justify-center"
                          style={{ backgroundColor: `${visual.color}1A` }}
                        >
                          <Icon size={14} style={{ color: visual.color }} />
                        </div>
                        <span className="text-sm sm:text-base font-semibold text-gray-900 dark:text-white capitalize">
                          {item.skill}
                        </span>
                      </div>
                      <span className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                        {item.count.toLocaleString()} listings
                      </span>
                    </div>

                    <div className="w-full h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-1000 ease-out"
                        style={{
                          width: animate ? `${(item.count / maxCount) * 100}%` : "0%",
                          backgroundColor: visual.color,
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}

        {/* CTA */}
        {!loading && !error && (
          <div className="mt-10 text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Want to see how your skills compare?
            </p>
            <button
              onClick={() => navigate("/register")}
              className="inline-flex items-center gap-2 text-sm font-medium text-white bg-indigo-500 hover:bg-indigo-600 px-6 py-3 rounded-lg transition-colors"
            >
              Check My Skill Gap
              <ArrowRight size={16} />
            </button>
          </div>
        )}
      </section>

      <PublicFooter />
    </div>
  );
};

export default TrendingSkills;