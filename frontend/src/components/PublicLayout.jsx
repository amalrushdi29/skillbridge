import PublicNavbar from "./PublicNavbar.jsx";
import PublicFooter from "./PublicFooter.jsx";

const PublicLayout = ({ children }) => {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 flex flex-col">
      <PublicNavbar />
      <div className="flex-1 flex flex-col">{children}</div>
      <PublicFooter />
    </div>
  );
};

export default PublicLayout;