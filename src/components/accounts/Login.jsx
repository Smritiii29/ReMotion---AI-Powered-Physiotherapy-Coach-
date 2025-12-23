import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import ErrorMessage from "../layouts/ErrorMessage";

export default function Login() {
  // 🔹 Form state
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // 🔹 Auth & navigation
  const { login, currentUser } = useAuth();
  const navigate = useNavigate();

  // 🔹 Redirect if already logged in
  useEffect(() => {
    if (currentUser) {
      navigate("/profile");
    }
  }, [currentUser, navigate]);

  // 🔹 Form submit handler
  async function handleFormSubmit(e) {
    e.preventDefault();

    try {
      setError(""); // clear old errors
      setLoading(true);
      await login(email, password);
      navigate("/profile");
    } catch (error) {
      setError("Failed to log in");
    }

    setLoading(false);
  }

  return (
    <div className="min-h-full flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <h2 className="mt-4 text-3xl text-center tracking-tight font-light">
          Login to your account
        </h2>

        {/* 🔴 Error message */}
        {error && <ErrorMessage message={error} />}

        <form className="mt-8 space-y-6" onSubmit={handleFormSubmit}>
          <div className="rounded-md shadow-sm -space-y-px">
            <input
              type="email"
              placeholder="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="block w-full px-3 py-2 border rounded-t-md"
            />

            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="block w-full px-3 py-2 border rounded-b-md"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 px-4 bg-sky-800 text-white rounded-md hover:bg-sky-900 disabled:opacity-50"
          >
            Login
          </button>

          <div className="text-sm text-center">
            <Link to="/register" className="text-blue-600 hover:underline">
              Don&apos;t have an account? Register
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
