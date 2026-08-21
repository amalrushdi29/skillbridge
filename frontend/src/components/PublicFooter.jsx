import { Link } from "react-router-dom";

const PublicFooter = () => {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {/* Brand */}
          <div>
            <br></br>
            <span className="text-lg font-bold text-indigo-500">
              Skill<span className="text-gray-800 dark:text-white">Bridge</span>
            </span>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
              AI-powered career intelligence for IT professionals to understand your
              market value, close your skill gaps.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <br></br>
            <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
              Quick Links
            </h4>
            <ul className="flex flex-col gap-2">
              <li>
                <Link to="/" className="text-sm text-gray-600 dark:text-gray-400 hover:text-indigo-500">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/trending-skills" className="text-sm text-gray-600 dark:text-gray-400 hover:text-indigo-500">
                  Trending Skills
                </Link>
              </li>
              <li>
                <Link to="/job-listings" className="text-sm text-gray-600 dark:text-gray-400 hover:text-indigo-500">
                  Job Listings
                </Link>
              </li>
            </ul>
          </div>

          {/* Account */}
          <div>
            <br></br>
            <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
              Account
            </h4>
            <ul className="flex flex-col gap-2">
              <li>
                <Link to="/login" className="text-sm text-gray-600 dark:text-gray-400 hover:text-indigo-500">
                  Login
                </Link>
              </li>
              <li>
                <Link to="/register" className="text-sm text-gray-600 dark:text-gray-400 hover:text-indigo-500">
                  Sign Up
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-200 dark:border-gray-800 mt-6 pt-4">
          <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
            © {year} SkillBridge. Final Year Project - Cardiff Metropolitan University (ICBT). All rights reserved.
          </p>
        </div>
      </div>
      <br></br>
    </footer>
  );
};

export default PublicFooter;