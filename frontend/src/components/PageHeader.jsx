import { TYPOGRAPHY, COLORS } from "../styles/typography.js";

/**
 * Reusable Page Header Component
 * Used consistently across all pages for uniform styling
 * 
 * @param {React.Component} icon - Icon component from lucide-react
 * @param {string} title - Page title
 * @param {string} description - Page subtitle/description
 */
export const PageHeader = ({ icon: Icon, title, description }) => (
  <div className="flex items-center gap-3">
    <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-indigo-100 dark:bg-indigo-900/30 shrink-0">
      <Icon size={22} style={{ color: COLORS.primary }} />
    </div>
    <div>
      <h1 className={TYPOGRAPHY.pageHeading}>{title}</h1>
      <p className={TYPOGRAPHY.pageSubheading}>{description}</p>
    </div>
  </div>
);

export default PageHeader;
