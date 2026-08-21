import { useNavigate } from "react-router-dom";
import {
  TrendingUp,
  Target,
  Sparkles,
  BarChart3,
  Briefcase,
  GraduationCap,
  Users,
  ArrowRight,
} from "lucide-react";
import PublicNavbar from "../components/PublicNavbar.jsx";
import PublicFooter from "../components/PublicFooter.jsx";

const Landing = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: Target,
      title: "Skill Gap Analysis",
      description:
        "See exactly which skills you're missing for your target role, ranked by importance in the current job market.",
    },
    {
      icon: BarChart3,
      title: "Employability Score",
      description:
        "Get an AI-generated score showing where you stand, powered by a Random Forest model trained on real job data.",
    },
    {
      icon: Sparkles,
      title: "AI Learning Roadmap",
      description:
        "Receive a personalized, prioritized roadmap with free resources for every missing skill you need to learn.",
    },
    {
      icon: TrendingUp,
      title: "Market Trends Dashboard",
      description:
        "Explore live charts on in-demand skills, job types, salary ranges and more — all from real job listings.",
    },
  ];

  const audiences = [
    {
      icon: GraduationCap,
      title: "Students",
      description: "Preparing for the job market and want to know what to learn first.",
    },
    {
      icon: Briefcase,
      title: "Fresh Graduates",
      description: "Looking to land their first IT role with a competitive skill set.",
    },
    {
      icon: Users,
      title: "Working Professionals",
      description: "Aiming to upskill and advance their careers with data-backed guidance.",
    },
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 flex flex-col">
      <PublicNavbar />

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24 text-center">
        <span className="inline-block text-xs font-medium text-indigo-500 bg-indigo-50 dark:bg-indigo-500/10 px-3 py-1 rounded-full mb-4">
          AI-Powered Career Intelligence
        </span>
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 dark:text-white leading-tight">
          Know your skill gaps.
          <br className="hidden sm:block" />
          <span className="text-indigo-500"> Close them with confidence.</span>
        </h1>
        <p className="mt-6 text-base md:text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
          SkillBridge analyzes real IT job market data to give you a
          personalized employability score, a clear skill gap breakdown, and
          an actionable learning roadmap — so you always know what to learn
          next.
        </p>
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
          <button
            onClick={() => navigate("/register")}
            className="w-full sm:w-auto flex items-center justify-center gap-2 text-sm font-medium text-white bg-indigo-500 hover:bg-indigo-600 px-6 py-3 rounded-lg transition-colors"
          >
            Get Started Free
            <ArrowRight size={16} />
          </button>
          <button
            onClick={() => navigate("/login")}
            className="w-full sm:w-auto text-sm font-medium text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-700 hover:border-indigo-500 dark:hover:border-indigo-400 px-6 py-3 rounded-lg transition-colors"
          >
            Login
          </button>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-gray-50 dark:bg-gray-900 py-16 md:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
              Everything you need to plan your next career move
            </h2>
            <p className="mt-3 text-sm md:text-base text-gray-500 dark:text-gray-400">
              Built on real job market data, not guesswork.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature) => {
              const Icon = feature.icon;
              return (
                <div
                  key={feature.title}
                  className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6 hover:shadow-md transition-shadow"
                >
                  <div className="w-11 h-11 rounded-lg bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center mb-4">
                    <Icon size={22} className="text-indigo-500" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {feature.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Target Audience Section */}
      <section className="py-16 md:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
              Built for every stage of your IT career
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {audiences.map((audience) => {
              const Icon = audience.icon;
              return (
                <div
                  key={audience.title}
                  className="text-center border border-gray-200 dark:border-gray-700 rounded-xl p-8"
                >
                  <div className="w-14 h-14 rounded-full bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center mx-auto mb-4">
                    <Icon size={26} className="text-indigo-500" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    {audience.title}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {audience.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-indigo-500 py-14 md:py-16">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-white">
            Ready to see where you stand?
          </h2>
          <p className="mt-3 text-sm md:text-base text-indigo-100">
            Create your free profile and get your personalized skill gap
            analysis in minutes.
          </p>
          <button
            onClick={() => navigate("/register")}
            className="mt-6 inline-flex items-center gap-2 text-sm font-medium text-indigo-600 bg-white hover:bg-indigo-50 px-6 py-3 rounded-lg transition-colors"
          >
            Sign Up Now
            <ArrowRight size={16} />
          </button>
        </div>
      </section>

      <PublicFooter />
    </div>
  );
};

export default Landing;