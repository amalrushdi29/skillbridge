import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Register from "./pages/Register.jsx";
import Login from "./pages/Login.jsx";
import ForgotPassword from "./pages/ForgotPassword.jsx";
import ResetPassword from "./pages/ResetPassword.jsx";
import Profile from "./pages/Profile.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import Layout from "./components/Layout.jsx";
import Skills from "./pages/Skills.jsx";
import CVUpload from "./pages/CVUpload.jsx";
import SkillGap from "./pages/SkillGap.jsx";
import Recommendations from "./pages/Recommendations.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import Jobs from "./pages/Jobs.jsx";
import Bookmarks from "./pages/Bookmarks.jsx";
import PublicNavbar from "./components/PublicNavbar.jsx";
import Landing from "./pages/Landing.jsx";
import TrendingSkills from "./pages/TrendingSkills.jsx";
import JobListings from "./pages/JobListings.jsx";
import PublicLayout from "./components/PublicLayout.jsx";
import Settings from "./pages/Settings.jsx";


const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/job-listings" element={<JobListings />} />
        <Route path="/trending-skills" element={<TrendingSkills />} />
        <Route path="/" element={<Landing />} />
        <Route
          path="/register"
          element={
            <PublicLayout>
              <Register />
            </PublicLayout>
          }
        />
        <Route
          path="/login"
          element={
            <PublicLayout>
              <Login />
            </PublicLayout>
          }
        />
        <Route
          path="/forgot-password"
          element={
            <PublicLayout>
              <ForgotPassword />
            </PublicLayout>
          }
        />
        <Route
          path="/reset-password/:token"
          element={
            <PublicLayout>
              <ResetPassword />
            </PublicLayout>
          }
        />
        

        {/* Protected Routes */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Layout pageTitle="Profile">
                <Profile />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/skills"
          element={
            <ProtectedRoute>
              <Layout pageTitle="Skills">
                <Skills />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/cv-upload"
          element={
            <ProtectedRoute>
              <CVUpload />
            </ProtectedRoute>
          }
        />
        <Route
          path="/skill-gap"
          element={
            <ProtectedRoute>
              <Layout pageTitle="Skill Gap">
                <SkillGap />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/recommendations"
          element={
            <ProtectedRoute>
              <Recommendations />
            </ProtectedRoute>
          }
        />
        <Route
          path="/jobs"
          element={
            <ProtectedRoute>
              <Jobs />
            </ProtectedRoute>
          }
        />
        <Route
          path="/bookmarks"
          element={
            <ProtectedRoute>
              <Bookmarks />
            </ProtectedRoute>
          }
        />
        <Route
          path="/settings"
          element={
            <ProtectedRoute>
              <Layout pageTitle="Settings">
                <Settings />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;