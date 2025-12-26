import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { signInWithEmailAndPassword } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";

import { auth, db } from "../../config/firebase";
import ErrorMessage from "../layouts/ErrorMessage";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [roleHint, setRoleHint] = useState("patient");

  const navigate = useNavigate();

async function handleFormSubmit(e) {
  e.preventDefault();
  setError("");
  setLoading(true);

  try {
    // 1️⃣ Firebase Auth login
    const userCredential = await signInWithEmailAndPassword(
      auth,
      email,
      password
    );

    const user = userCredential.user;

    // 2️⃣ Check Physiotherapists collection FIRST
    const physioSnap = await getDoc(doc(db, "Physiotherapists", user.uid));

    if (physioSnap.exists()) {
      // Physiotherapist login
      navigate("/physio/dashboard");
      return;
    }

    // 3️⃣ Else check Patients (Users collection)
    const userSnap = await getDoc(doc(db, "Users", user.uid));

    if (!userSnap.exists()) {
      throw new Error("User profile not found.");
    }

    const userData = userSnap.data();

    // 4️⃣ Patient onboarding flow
    if (!userData.passwordChanged) {
      navigate("/change-password");
    } else if (!userData.selected_avatar_id) {
      navigate("/patient/dashboard");
    } else {
      navigate("/patient/dashboard");
    }
  } catch (error) {
    console.error("Login failed:", error);
    setError("Failed to sign in. Please check your credentials.");
  } finally {
    setLoading(false);
  }
}


  return (
    <div className="min-h-full flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-light text-gray-900">
            Sign In
          </h2>

          {/* Role Switcher (UI hint only) */}
          <div className="mt-6 flex justify-center">
            <div className="bg-gray-200 rounded-lg p-1 flex">
              <button
                type="button"
                onClick={() => setRoleHint("patient")}
                className={`px-6 py-2 rounded-md text-sm font-medium transition ${
                  roleHint === "patient"
                    ? "bg-white text-sky-800 shadow"
                    : "text-gray-600"
                }`}
              >
                I'm a Patient
              </button>
              <button
                type="button"
                onClick={() => setRoleHint("physiotherapist")}
                className={`px-6 py-2 rounded-md text-sm font-medium transition ${
                  roleHint === "physiotherapist"
                    ? "bg-white text-sky-800 shadow"
                    : "text-gray-600"
                }`}
              >
                I'm a Physiotherapist
              </button>
            </div>
          </div>

          <p className="mt-4 text-center text-sm text-gray-600">
            {roleHint === "patient" ? (
              <>Your physiotherapist sent you login details via email.</>
            ) : (
              <>Use your registered professional account.</>
            )}
          </p>
        </div>

        {error && <ErrorMessage message={error} />}

        <form className="mt-8 space-y-6" onSubmit={handleFormSubmit}>
          <div className="rounded-md shadow-sm -space-y-px">
            <input
              type="email"
              placeholder="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="appearance-none rounded-t-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-sky-500 focus:border-sky-500 sm:text-sm"
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="appearance-none rounded-b-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-sky-500 focus:border-sky-500 sm:text-sm"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 bg-sky-800 text-white rounded-md hover:bg-sky-900 disabled:opacity-50 font-medium"
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>

          <div className="text-center text-sm">
            {roleHint === "physiotherapist" && (
              <p className="mt-4">
                Don't have an account?{" "}
                <Link
                  to="/register"
                  className="text-sky-600 hover:underline font-medium"
                >
                  Register as Physiotherapist
                </Link>
              </p>
            )}
            {roleHint === "patient" && (
              <p className="mt-4 text-gray-500">
                Contact your physiotherapist if you haven't received login details.
              </p>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
