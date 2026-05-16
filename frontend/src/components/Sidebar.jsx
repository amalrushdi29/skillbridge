import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useTheme } from "../context/ThemeContext.jsx";
import {
  LayoutDashboard,
  User,
  Zap,
  FileText,
  BarChart2,
  Lightbulb,
  Briefcase,
  Bookmark,
  Settings,
  ChevronLeft,
  ChevronRight,
  Sun,
  Moon,
} from "lucide-react";

const menuItems = [
  { label: "Dashboard", icon: LayoutDashboard, path: "/dashboard" },
  { label: "Profile", icon: User, path: "/profile" },
  { label: "Skills", icon: Zap, path: "/skills" },
  { label: "CV Upload", icon: FileText, path: "/cv-upload" },
  { label: "Skill Gap", icon: BarChart2, path: "/skill-gap" },
  { label: "Recommendations", icon: Lightbulb, path: "/recommendations" },
  { label: "Jobs", icon: Briefcase, path: "/jobs" },
  { label: "Bookmarks", icon: Bookmark, path: "/bookmarks" },
];

const Sidebar = ({ isCollapsed, setIsCollapsed }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isDark, toggleTheme } = useTheme();

  const isActive = (path) => location.pathname === path;

  return (
    <div
      className={`
        fixed top-0 left-0 h-full z-50 flex flex-col
        transition-all duration-300 ease-in-out
        ${isCollapsed ? "w-16" : "w-60"}
        bg-white dark:bg-[#1E293B]
        border-r border-gray-200 dark:border-gray-700
      `}
    >
      {/* Logo */}
      <div className="flex items-center justify-between px-4 py-5 border-b border-gray-200 dark:border-gray-700">
        {!isCollapsed && (
          <span className="text-[#6366F1] font-bold text-lg tracking-tight">
            SkillBridge
          </span>
        )}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400 transition"
        >
          {isCollapsed ? (
            <ChevronRight size={18} />
          ) : (
            <ChevronLeft size={18} />
          )}
        </button>
      </div>

      {/* Menu Items */}
      <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.path);
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`
                w-full flex items-center gap-3 px-3 py-2.5 rounded-lg
                transition text-sm font-medium
                ${isCollapsed ? "justify-center" : "justify-start"}
                ${
                  active
                    ? "bg-[#6366F1] text-white"
                    : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                }
              `}
              title={isCollapsed ? item.label : ""}
            >
              <Icon size={18} />
              {!isCollapsed && <span>{item.label}</span>}
            </button>
          );
        })}
      </nav>

      {/* Bottom Section */}
      <div className="px-2 py-4 border-t border-gray-200 dark:border-gray-700 space-y-1">

        {/* Settings */}
        <button
          onClick={() => navigate("/settings")}
          className={`
            w-full flex items-center gap-3 px-3 py-2.5 rounded-lg
            transition text-sm font-medium
            ${isCollapsed ? "justify-center" : "justify-start"}
            ${
              isActive("/settings")
                ? "bg-[#6366F1] text-white"
                : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
            }
          `}
          title={isCollapsed ? "Settings" : ""}
        >
          <Settings size={18} />
          {!isCollapsed && <span>Settings</span>}
        </button>

        {/* Dark Mode Toggle */}
        <button
          onClick={toggleTheme}
          className={`
            w-full flex items-center gap-3 px-3 py-2.5 rounded-lg
            transition text-sm font-medium
            ${isCollapsed ? "justify-center" : "justify-start"}
            text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700
          `}
          title={isCollapsed ? (isDark ? "Light Mode" : "Dark Mode") : ""}
        >
          {isDark ? <Sun size={18} /> : <Moon size={18} />}
          {!isCollapsed && (
            <span>{isDark ? "Light Mode" : "Dark Mode"}</span>
          )}
        </button>

      </div>
    </div>
  );
};

export default Sidebar;