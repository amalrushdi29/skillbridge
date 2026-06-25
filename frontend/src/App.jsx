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

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />

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
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;