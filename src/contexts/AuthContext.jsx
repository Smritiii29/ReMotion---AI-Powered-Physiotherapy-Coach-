// import { createContext, useContext, useState, useEffect } from "react";
// import {
//   createUserWithEmailAndPassword,
//   signInWithEmailAndPassword,
//   onAuthStateChanged,
//   signOut,
// } from "firebase/auth";

// import auth from "../config/firebase";

// // Create context
// const AuthContext = createContext();

// // Custom hook
// export function useAuth() {
//   return useContext(AuthContext);
// }

// // Provider
// export function AuthProvider({ children }) {
//   const [currentUser, setCurrentUser] = useState(null);
//   const [loading, setLoading] = useState(true);

//   // Register
//   function register(email, password) {
//     return createUserWithEmailAndPassword(auth, email, password);
//   }

//   // Login
//   function login(email, password) {
//     return signInWithEmailAndPassword(auth, email, password);
//   }

//   // Logout
//   function logout() {
//     return signOut(auth);
//   }

//   // Observe auth state
//   useEffect(() => {
//     const unsubscribe = onAuthStateChanged(auth, (user) => {
//       setCurrentUser(user);
//       setLoading(false);
//     });

//     return unsubscribe;
//   }, []);

//   const value = {
//     currentUser,
//     register,
//     login,
//     logout,
//   };

//   return (
//     <AuthContext.Provider value={value}>
//       {!loading && children}
//     </AuthContext.Provider>
//   );
// }


// src/contexts/AuthContext.jsx
import { createContext, useContext, useState, useEffect } from "react";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  onAuthStateChanged,
  signOut,
} from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";

import { auth, db } from "../config/firebase"; // Make sure db is exported from firebase.jsx

// Create context
const AuthContext = createContext();

// Custom hook
export function useAuth() {
  return useContext(AuthContext);
}

// Provider
export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [userRole, setUserRole] = useState(null); // "patient" or "physiotherapist"
  const [loading, setLoading] = useState(true); // Overall loading (auth + role fetch)

  // Helper: Determine and set role after auth state changes
  async function loadUserRole(uid) {
    try {
      // First check if user is a physiotherapist
      const physioDoc = await getDoc(doc(db, "Physiotherapists", uid));
      if (physioDoc.exists()) {
        setUserRole("physiotherapist");
        return;
      }

      // Then check if user is a patient
      const patientDoc = await getDoc(doc(db, "Users", uid));
      if (patientDoc.exists()) {
        setUserRole("patient");
        return;
      }

      // If no profile found (shouldn't happen normally)
      setUserRole(null);
    } catch (error) {
      console.error("Error fetching user role:", error);
      setUserRole(null);
    }
  }

  // Register — now only for physiotherapists
  async function register(email, password, role = "physiotherapist") {
    if (role !== "physiotherapist") {
      throw new Error("Patients cannot register themselves");
    }

    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Save physiotherapist profile in Firestore
    await setDoc(doc(db, "Physiotherapists", user.uid), {
      email: user.email,
      role: "physiotherapist",
      createdAt: new Date(),
      // You can add more fields later: name, license_number, etc.
    });

    return userCredential;
  }

  // Login (shared)
  function login(email, password) {
    return signInWithEmailAndPassword(auth, email, password);
  }

  // Logout
  function logout() {
    setUserRole(null);
    return signOut(auth);
  }

  // Observe auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      setLoading(true); // Start loading role

      if (user) {
        await loadUserRole(user.uid);
      } else {
        setUserRole(null);
      }

      setLoading(false); // Done loading
    });

    return unsubscribe;
  }, []);

  const value = {
    currentUser,
    userRole,      // ← NEW: "patient" or "physiotherapist"
    loading,       // ← true while checking auth + role
    register,
    login,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {/* Only render children when fully loaded */}
      {!loading && children}
    </AuthContext.Provider>
  );
}