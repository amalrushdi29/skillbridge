import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Lock, Trash2, Mail, AlertTriangle, Settings as SettingsIcon } from "lucide-react";
import Card from "../components/Card.jsx";
import PageHeader from "../components/PageHeader.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { TYPOGRAPHY } from "../styles/typography.js";
import config from "../config.js";

const Settings = () => {
  const { user, logout, updateUser } = useAuth();
  const navigate = useNavigate();

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordMsg, setPasswordMsg] = useState({ type: "", text: "" });
  const [passwordLoading, setPasswordLoading] = useState(false);

  const [newEmail, setNewEmail] = useState("");
  const [emailPassword, setEmailPassword] = useState("");
  const [emailMsg, setEmailMsg] = useState({ type: "", text: "" });
  const [emailLoading, setEmailLoading] = useState(false);

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  const showMessage = (type, text) => {
    setPasswordMsg({ type, text });
    setTimeout(() => setPasswordMsg({ type: "", text: "" }), 4000);
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      showMessage("error", "New passwords do not match");
      return;
    }

    if (newPassword.length < 6) {
      showMessage("error", "New password must be at least 6 characters");
      return;
    }

    setPasswordLoading(true);
    try {
      const res = await fetch(`${config.apiUrl}/auth/change-password`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user?.token}`,
        },
        body: JSON.stringify({ currentPassword, newPassword }),
      });

      const data = await res.json();

      if (!res.ok) {
        showMessage("error", data.message || "Failed to update password");
      } else {
        showMessage("success", "Password updated successfully");
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      }
    } catch (err) {
      showMessage("error", "Could not connect to the server");
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleChangeEmail = async (e) => {
    e.preventDefault();
    setEmailLoading(true);
    setEmailMsg({ type: "", text: "" });

    try {
      const res = await fetch(`${config.apiUrl}/auth/change-email`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user?.token}`,
        },
        body: JSON.stringify({ newEmail, currentPassword: emailPassword }),
      });

      const data = await res.json();

      if (!res.ok) {
        setEmailMsg({ type: "error", text: data.message || "Failed to update email" });
      } else {
        updateUser({ email: data.email });
        setEmailMsg({ type: "success", text: "Email updated successfully" });
        setNewEmail("");
        setEmailPassword("");
      }
    } catch (err) {
      setEmailMsg({ type: "error", text: "Could not connect to the server" });
    } finally {
      setEmailLoading(false);
      setTimeout(() => setEmailMsg({ type: "", text: "" }), 4000);
    }
  };

  const handleDeleteAccount = async () => {
    setDeleteLoading(true);
    setDeleteError("");
    try {
      const res = await fetch(`${config.apiUrl}/auth/delete-account`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${user?.token}`,
        },
      });

      const data = await res.json();

      if (!res.ok) {
        setDeleteError(data.message || "Failed to delete account");
        setDeleteLoading(false);
        return;
      }

      logout();
      navigate("/");
    } catch (err) {
      setDeleteError("Could not connect to the server");
      setDeleteLoading(false);
    }
  };

  return (
    <div className="p-4 sm:p-6 max-w-4xl mx-auto">
      <PageHeader
        icon={SettingsIcon}
        title="Settings"
        description="Manage your account and security preferences"
        />

      <div className="flex flex-col gap-6 mt-6">
        {/* Change Email */}
        <Card maxWidth="max-w-4xl">
          <div className="flex items-center gap-2 mb-4">
            <Mail size={18} className="text-indigo-500" />
            <h2 className={TYPOGRAPHY.cardHeading}>Change Email</h2>
          </div>

          <form onSubmit={handleChangeEmail} className="flex flex-col gap-4">
            <div>
              <label className={TYPOGRAPHY.formLabel}>Current Email</label>
              <input
                type="email"
                value={user?.email || ""}
                disabled
                className="w-full mt-1 px-3 py-2.5 text-sm rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-100 dark:bg-gray-900 text-gray-500 dark:text-gray-400 cursor-not-allowed"
              />
            </div>

            <div>
              <label className={TYPOGRAPHY.formLabel}>New Email</label>
              <input
                type="email"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                required
                className="w-full mt-1 px-3 py-2.5 text-sm rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className={TYPOGRAPHY.formLabel}>Current Password</label>
              <input
                type="password"
                value={emailPassword}
                onChange={(e) => setEmailPassword(e.target.value)}
                required
                className="w-full mt-1 px-3 py-2.5 text-sm rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            {emailMsg.text && (
              <p
                className={`text-sm ${
                  emailMsg.type === "success" ? "text-green-500" : "text-red-500"
                }`}
              >
                {emailMsg.text}
              </p>
            )}

            <button
              type="submit"
              disabled={emailLoading}
              className="self-start text-sm font-medium text-white bg-indigo-500 hover:bg-indigo-600 disabled:opacity-60 px-5 py-2.5 rounded-lg transition-colors"
            >
              {emailLoading ? "Updating..." : "Update Email"}
            </button>
          </form>
        </Card>

        {/* Change Password */}
        <Card maxWidth="max-w-4xl">
          <div className="flex items-center gap-2 mb-4">
            <Lock size={18} className="text-indigo-500" />
            <h2 className={TYPOGRAPHY.cardHeading}>Change Password</h2>
          </div>

          <form onSubmit={handleChangePassword} className="flex flex-col gap-4">
            <div>
              <label className={TYPOGRAPHY.formLabel}>Current Password</label>
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                required
                className="w-full mt-1 px-3 py-2.5 text-sm rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className={TYPOGRAPHY.formLabel}>New Password</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                minLength={6}
                className="w-full mt-1 px-3 py-2.5 text-sm rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className={TYPOGRAPHY.formLabel}>Confirm New Password</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                minLength={6}
                className="w-full mt-1 px-3 py-2.5 text-sm rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            {passwordMsg.text && (
              <p
                className={`text-sm ${
                  passwordMsg.type === "success" ? "text-green-500" : "text-red-500"
                }`}
              >
                {passwordMsg.text}
              </p>
            )}

            <button
              type="submit"
              disabled={passwordLoading}
              className="self-start text-sm font-medium text-white bg-indigo-500 hover:bg-indigo-600 disabled:opacity-60 px-5 py-2.5 rounded-lg transition-colors"
            >
              {passwordLoading ? "Updating..." : "Update Password"}
            </button>
          </form>
        </Card>

        {/* Danger Zone */}
        <Card maxWidth="max-w-4xl">
          <div className="border border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-950/20 rounded-xl p-5">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle size={18} className="text-red-500" />
              <h2 className="text-lg font-semibold text-red-600 dark:text-red-400">
                Danger Zone
              </h2>
            </div>
            <p className={`${TYPOGRAPHY.textSm} mb-4`}>
              Deleting your account is permanent and will remove your
              profile, skills, and bookmarks. This cannot be undone.
            </p>
            <button
              onClick={() => setShowDeleteModal(true)}
              className="inline-flex items-center gap-2 text-sm font-medium text-white bg-red-500 hover:bg-red-600 px-5 py-2.5 rounded-lg transition-colors"
            >
              <Trash2 size={16} />
              Delete Account
            </button>
          </div>
        </Card>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 max-w-sm w-full">
            <div className="flex items-center gap-2 mb-3">
              <AlertTriangle size={20} className="text-red-500" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Are you sure?
              </h3>
            </div>
            <p className={`${TYPOGRAPHY.textSm} mb-5`}>
              This will permanently delete your account, skills, and
              bookmarks. This action cannot be undone.
            </p>

            {deleteError && (
              <p className="text-sm text-red-500 mb-4">{deleteError}</p>
            )}

            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                disabled={deleteLoading}
                className="flex-1 text-sm font-medium text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-700 px-4 py-2.5 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteAccount}
                disabled={deleteLoading}
                className="flex-1 text-sm font-medium text-white bg-red-500 hover:bg-red-600 disabled:opacity-60 px-4 py-2.5 rounded-lg transition-colors"
              >
                {deleteLoading ? "Deleting..." : "Yes, Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Settings;