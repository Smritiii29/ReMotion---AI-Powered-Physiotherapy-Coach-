// import { useState, useEffect } from "react";
// import { Link, useNavigate } from "react-router-dom";
// import { useAuth } from "../../contexts/AuthContext";
// import ErrorMessage from "../layouts/ErrorMessage";

// export default function Register() {
//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");
//   const [confirmPassword, setConfirmPassword] = useState("");
//   const [error, setError] = useState("");
//   const [loading, setLoading] = useState(false);

//   const { currentUser, register } = useAuth(); // register will now handle role
//   const navigate = useNavigate();

//   // useEffect(() => {
//   //   if (currentUser) {
//   //     navigate("/physio/dashboard"); // or wherever physio goes after login
//   //   }
//   // }, [currentUser, navigate]);

//   async function handleFormSubmit(e) {
//     e.preventDefault();

//     if (password !== confirmPassword) {
//       return setError("Passwords do not match");
//     }

//     if (password.length < 6) {
//       return setError("Password must be at least 6 characters");
//     }

//     try {
//       setError("");
//       setLoading(true);
//       // We pass "physiotherapist" as role — you'll update register() in AuthContext
//       await register(email, password, "physiotherapist");
//       navigate("/physio/dashboard");
//       // Success → redirect handled by AuthContext or here
//     } catch (err) {
//       setError("Failed to create account. Email might already be in use.");
//     }
//     setLoading(false);
//   }

//   return (
//     <div className="min-h-full flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
//       <div className="max-w-md w-full space-y-8">
//         <div>
//           <h2 className="mt-6 text-center text-3xl font-light text-gray-900">
//             Physiotherapist Registration
//           </h2>
//           <p className="mt-2 text-center text-sm text-gray-600">
//             Create your professional account to manage patients
//           </p>
//         </div>

//         {error && <ErrorMessage message={error} />}

//         <form className="mt-8 space-y-6" onSubmit={handleFormSubmit}>
//           <div className="rounded-md shadow-sm -space-y-px">
//             <input
//               type="email"
//               placeholder="Professional Email Address"
//               value={email}
//               onChange={(e) => setEmail(e.target.value)}
//               required
//               className="appearance-none rounded-t-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-sky-500 focus:border-sky-500 sm:text-sm"
//             />
//             <input
//               type="password"
//               placeholder="Password"
//               value={password}
//               onChange={(e) => setPassword(e.target.value)}
//               required
//               className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-sky-500 focus:border-sky-500 sm:text-sm"
//             />
//             <input
//               type="password"
//               placeholder="Confirm Password"
//               value={confirmPassword}
//               onChange={(e) => setConfirmPassword(e.target.value)}
//               required
//               className="appearance-none rounded-b-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-sky-500 focus:border-sky-500 sm:text-sm"
//             />
//           </div>

//           <button
//             type="submit"
//             disabled={loading}
//             className="w-full py-2 px-4 bg-sky-800 text-white rounded-md hover:bg-sky-900 disabled:opacity-50"
//           >
//             {loading ? "Creating Account..." : "Register as Physiotherapist"}
//           </button>

//           <div className="text-center text-sm">
//             <Link to="/login" className="text-sky-600 hover:underline">
//               Already have an account? Sign in
//             </Link>
//           </div>
//         </form>
//       </div>
//     </div>
//   );
// }

// src/components/accounts/Register.jsx
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import ErrorMessage from "../layouts/ErrorMessage";

export default function Register() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [name, setName] = useState("");
  const [licenseNumber, setLicenseNumber] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [specialization, setSpecialization] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const { register } = useAuth(); // register should accept additional params
  const navigate = useNavigate();

  async function handleFormSubmit(e) {
    e.preventDefault();
    setError("");

    // Basic validation
    if (!name.trim()) return setError("Full name is required");
    if (!licenseNumber.trim()) return setError("License number is required");
    if (password !== confirmPassword) return setError("Passwords do not match");
    if (password.length < 6) return setError("Password must be at least 6 characters");

    try {
      setLoading(true);
      // Pass role and all profile details to register function
      await register(email, password, "physiotherapist", {
        name,
        licenseNumber,
        phoneNumber,
        specialization,
      });

      // Redirect to dashboard on success
      navigate("/physio/dashboard");
    } catch (err) {
      console.error("Registration error:", err);
      setError(
        err.code === "auth/email-already-in-use"
          ? "Email is already in use"
          : "Failed to create account. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gray-50">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-xl shadow-lg">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900">Physiotherapist Registration</h2>
          <p className="mt-2 text-sm text-gray-600">
            Create your professional account to manage patients and programs
          </p>
        </div>

        {error && <ErrorMessage message={error} />}

        <form className="mt-8 space-y-6" onSubmit={handleFormSubmit}>
          {/* Full Name */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700">
              Full Name
            </label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-sky-500 focus:border-sky-500 sm:text-sm"
            />
          </div>

          {/* Email */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Professional Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-sky-500 focus:border-sky-500 sm:text-sm"
            />
          </div>

          {/* License Number */}
          <div>
            <label htmlFor="license" className="block text-sm font-medium text-gray-700">
              License / Registration Number
            </label>
            <input
              id="license"
              type="text"
              value={licenseNumber}
              onChange={(e) => setLicenseNumber(e.target.value)}
              required
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-sky-500 focus:border-sky-500 sm:text-sm"
            />
          </div>

          {/* Phone Number */}
          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
              Phone Number (optional)
            </label>
            <input
              id="phone"
              type="tel"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-sky-500 focus:border-sky-500 sm:text-sm"
            />
          </div>

          {/* Specialization */}
          <div>
            <label htmlFor="specialization" className="block text-sm font-medium text-gray-700">
              Specialization (e.g., Orthopedics, Sports Rehab)
            </label>
            <input
              id="specialization"
              type="text"
              value={specialization}
              onChange={(e) => setSpecialization(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-sky-500 focus:border-sky-500 sm:text-sm"
            />
          </div>

          {/* Password */}
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-sky-500 focus:border-sky-500 sm:text-sm"
            />
          </div>

          {/* Confirm Password */}
          <div>
            <label htmlFor="confirm-password" className="block text-sm font-medium text-gray-700">
              Confirm Password
            </label>
            <input
              id="confirm-password"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-sky-500 focus:border-sky-500 sm:text-sm"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 bg-sky-800 text-white rounded-md hover:bg-sky-900 disabled:opacity-50 font-medium transition"
          >
            {loading ? "Creating Account..." : "Register as Physiotherapist"}
          </button>

          <div className="text-center text-sm">
            <Link to="/login" className="text-sky-600 hover:underline font-medium">
              Already have an account? Sign in
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}