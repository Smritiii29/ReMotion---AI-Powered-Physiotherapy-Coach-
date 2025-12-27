// src/components/accounts/ChangePassword.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { updatePassword } from "firebase/auth";
import { doc, updateDoc } from "firebase/firestore";

import { auth, db } from "../../config/firebase";

export default function ChangePassword() {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const navigate = useNavigate();

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setError("");

    if (newPassword.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      const user = auth.currentUser;

      if (!user) {
        throw new Error("User not authenticated.");
      }

      // 1️⃣ Update Firebase Auth password
      await updatePassword(user, newPassword);

      // 2️⃣ Update Firestore flag
      await updateDoc(doc(db, "Users", user.uid), {
        passwordChanged: true,
      });

      // 3️⃣ Redirect to avatar selection
      navigate("/patient/dashboard");
    } catch (err) {
      console.error("Password update failed:", err);
      setError(
        "Failed to update password. Please log in again and try."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-8">
        <h2 className="text-2xl font-semibold text-center mb-6">
          Set a New Password
        </h2>

        <p className="text-sm text-gray-600 text-center mb-6">
          For security reasons, please set a new password before continuing.
        </p>

        {error && (
          <div className="mb-4 text-sm text-red-600 text-center">
            {error}
          </div>
        )}

        <form onSubmit={handlePasswordChange} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              New Password
            </label>
            <input
              type="password"
              required
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="mt-1 w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-sky-500"
              placeholder="Enter new password"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Confirm Password
            </label>
            <input
              type="password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="mt-1 w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-sky-500"
              placeholder="Confirm new password"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-sky-700 text-white rounded-md hover:bg-sky-800 transition disabled:opacity-60"
          >
            {loading ? "Updating..." : "Update Password"}
          </button>
        </form>
      </div>
    </div>
  );
}
