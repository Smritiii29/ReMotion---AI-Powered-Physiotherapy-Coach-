// import { createContext, useContext, useState, useEffect } from "react";
// import {
//   createUserWithEmailAndPassword,
//   signInWithEmailAndPassword,
//   onAuthStateChanged,
//   signOut,
// } from "firebase/auth";
// import { doc, getDoc, setDoc } from "firebase/firestore";

// import { auth, db } from "../config/firebase";

// // Create context
// const AuthContext = createContext();

// // Custom hook
// export function useAuth() {
//   return useContext(AuthContext);
// }

// // Provider
// export function AuthProvider({ children }) {
//   const [currentUser, setCurrentUser] = useState(null);
//   const [userRole, setUserRole] = useState(null); // "patient" or "physiotherapist"
//   const [loading, setLoading] = useState(true);

//   // Improved role loading — handles offline error gracefully
//   const loadUserRole = async (uid) => {
//     try {
//       // Try physiotherapist first
//       const physioSnap = await getDoc(doc(db, "Physiotherapists", uid));
//       if (physioSnap.exists()) {
//         setUserRole("physiotherapist");
//         return;
//       }

//       // Try patient
//       const patientSnap = await getDoc(doc(db, "Users", uid));
//       if (patientSnap.exists()) {
//         setUserRole("patient");
//         return;
//       }

//       console.warn("No profile found for user:", uid);
//       setUserRole(null);
//     } catch (error) {
//       console.warn("Role fetch failed (temporary/offline - continuing anyway):", error.message);
//       setUserRole(null); // Don't break the app
//     }
//   };

//   // Register (only physiotherapists)
//   const register = async (email, password, role = "physiotherapist") => {
//     if (role !== "physiotherapist") {
//       throw new Error("Patients cannot register themselves");
//     }

//     const userCredential = await createUserWithEmailAndPassword(auth, email, password);
//     const user = userCredential.user;

//     await setDoc(doc(db, "Physiotherapists", user.uid), {
//       email: user.email,
//       role: "physiotherapist",
//       createdAt: new Date(),
//     });

//     return userCredential;
//   };

//   // Login
//   const login = (email, password) => {
//     return signInWithEmailAndPassword(auth, email, password);
//   };

//   // Logout
//   const logout = () => {
//     setUserRole(null);
//     return signOut(auth);
//   };

//   // Auth observer
//   useEffect(() => {
//     const unsubscribe = onAuthStateChanged(auth, async (user) => {
//       setCurrentUser(user);
//       setLoading(true);

//       if (user) {
//         await loadUserRole(user.uid);
//       } else {
//         setUserRole(null);
//       }

//       setLoading(false); // Always stop loading
//     });

//     return unsubscribe;
//   }, []);

//   const value = {
//     currentUser,
//     userRole,
//     loading,
//     register,
//     login,
//     logout,
//   };

//   return (
//     <AuthContext.Provider value={value}>
//       {loading ? (
//         <div className="min-h-screen flex items-center justify-center bg-gray-100">
//           <div className="text-center">
//             <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-sky-800 mx-auto mb-8"></div>
//             <p className="text-2xl font-medium text-gray-700">Loading your dashboard...</p>
//             <p className="text-gray-500 mt-4">Please wait a moment</p>
//           </div>
//         </div>
//       ) : (
//         children
//       )}
//     </AuthContext.Provider>
//   );
// }


import { createContext, useContext, useState, useEffect } from "react";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  onAuthStateChanged,
  signOut,
} from "firebase/auth";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";

import { auth, db } from "../config/firebase";

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
  const [userProfile, setUserProfile] = useState(null); // Optional: store name, etc.
  const [loading, setLoading] = useState(true);

  // Load role and basic profile data
  const loadUserProfile = async (uid) => {
    try {
      // Check physiotherapist first
      const physioSnap = await getDoc(doc(db, "Physiotherapists", uid));
      if (physioSnap.exists()) {
        setUserRole("physiotherapist");
        setUserProfile(physioSnap.data());
        return;
      }

      // Check patient
      const patientSnap = await getDoc(doc(db, "Users", uid));
      if (patientSnap.exists()) {
        setUserRole("patient");
        setUserProfile(patientSnap.data());
        return;
      }

      console.warn("No profile found for user:", uid);
      setUserRole(null);
      setUserProfile(null);
    } catch (error) {
      console.warn("Profile fetch failed (temporary/offline):", error.message);
      setUserRole(null);
      setUserProfile(null);
    }
  };

  // Register (only physiotherapists for now)
  const register = async (email, password, role = "physiotherapist", profileData = {}) => {
    if (role !== "physiotherapist") {
      throw new Error("Patients cannot register themselves at this time.");
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Save physio profile
      await setDoc(doc(db, "Physiotherapists", user.uid), {
        email: user.email,
        role: "physiotherapist",
        name: profileData.name || "",
        licenseNumber: profileData.licenseNumber || "",
        phoneNumber: profileData.phoneNumber || "",
        specialization: profileData.specialization || "",
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      // Load profile immediately
      await loadUserProfile(user.uid);

      return userCredential;
    } catch (err) {
      throw err;
    }
  };

  // Login
  const login = async (email, password) => {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    await loadUserProfile(userCredential.user.uid);
    return userCredential;
  };

  // Logout
  const logout = async () => {
    setUserRole(null);
    setUserProfile(null);
    return signOut(auth);
  };

  // Auth observer
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      setLoading(true);

      if (user) {
        await loadUserProfile(user.uid);
      } else {
        setUserRole(null);
        setUserProfile(null);
      }

      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const value = {
    currentUser,
    userRole,
    userProfile, // Now available: name, licenseNumber, etc.
    loading,
    register,
    login,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {loading ? (
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-sky-800 mx-auto mb-8"></div>
            <p className="text-2xl font-medium text-gray-700">Loading your dashboard...</p>
            <p className="text-gray-500 mt-4">Please wait a moment</p>
          </div>
        </div>
      ) : (
        children
      )}
    </AuthContext.Provider>
  );
}