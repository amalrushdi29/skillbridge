import { useEffect, useState } from "react";
import Sidebar from "./Sidebar.jsx";
import TopBar from "./TopBar.jsx";

const STORAGE_KEY = "skillbridge-sidebar-collapsed";

const Layout = ({ children, pageTitle }) => {
  const [isCollapsed, setIsCollapsed] = useState(() => {
    if (typeof window === "undefined") return false;

    const savedValue = window.localStorage.getItem(STORAGE_KEY);
    return savedValue === "true";
  });

  useEffect(() => {
    if (typeof window !== "undefined") {
      window.localStorage.setItem(STORAGE_KEY, String(isCollapsed));
    }
  }, [isCollapsed]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0F172A]">

      {/* Sidebar */}
      <Sidebar
        isCollapsed={isCollapsed}
        setIsCollapsed={setIsCollapsed}
      />

      {/* TopBar */}
      <TopBar
        isCollapsed={isCollapsed}
        pageTitle={pageTitle}
      />

      {/* Main Content */}
      <main
        className={`
          transition-all duration-300 ease-in-out
          pt-16
          ${isCollapsed ? "ml-16" : "ml-60"}
        `}
      >
        <div className="p-6">
          {children}
        </div>
      </main>

    </div>
  );
};

export default Layout;