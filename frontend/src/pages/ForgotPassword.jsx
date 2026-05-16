import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import config from "../config";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => setSuccess(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [success]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const res = await fetch(`${config.apiUrl}/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message);
        return;
      }

      setSuccess("Password reset email sent! Check your Mailtrap inbox.");
    } catch (err) {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-[#0F172A] flex items-center justify-center px-4">
      <div className="bg-white dark:bg-[#1E293B] p-8 rounded-xl shadow-md w-full max-w-md">
        <h2 className="text-2xl font-bold text-center text-[#6366F1] mb-2">
          Forgot Password
        </h2>
        <p className="text-center text-gray-500 dark:text-gray-400 text-sm mb-6">
          Enter your email and we'll send you a reset link
        </p>

        {error && (
          <div className="bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800 p-3 rounded-lg mb-4 text-sm">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-400 border border-green-200 dark:border-green-800 p-3 rounded-lg mb-4 text-sm">
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 bg-white dark:bg-[#0F172A] text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-[#6366F1]"
              placeholder="amal@example.com"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#6366F1] text-white py-2 rounded-lg font-semibold hover:bg-indigo-700 transition disabled:opacity-50"
          >
            {loading ? "Sending..." : "Send Reset Link"}
          </button>
        </form>

        <p className="text-center text-sm text-gray-600 dark:text-gray-400 mt-4">
          Remember your password?{" "}
          <Link to="/login" className="text-[#6366F1] font-medium hover:underline">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
};

export default ForgotPassword;