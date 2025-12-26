import React, { useState } from "react";
import Logout from "../accounts/Logout";

import { createUserWithEmailAndPassword, signOut } from "firebase/auth";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";

import { auth, db } from "../../config/firebase";
import { sendPatientCredentials } from "../../utils/emailService";
import { useAuth } from "../../contexts/AuthContext";

const PhysioDashboard = () => {
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  // Patient form state
  const [patientName, setPatientName] = useState("");
  const [patientEmail, setPatientEmail] = useState("");
  const [patientPhone, setPatientPhone] = useState("");
  const [loading, setLoading] = useState(false);

  const { currentUser } = useAuth(); // logged-in physiotherapist

  // Generate temporary password
  const generateTempPassword = () => {
    return Math.random().toString(36).slice(-8);
  };

  // Handle patient creation
  const handleAddPatient = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const tempPassword = generateTempPassword();

      // 1️⃣ Create patient AUTH account
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        patientEmail,
        tempPassword
      );

      const patientUid = userCredential.user.uid;

      // 2️⃣ Create Firestore patient document
      await setDoc(doc(db, "Users", patientUid), {
        createdAt: serverTimestamp(),
        physiotherapist_assigned: currentUser.uid,
        email: patientEmail,
        name: patientName,
        phoneNum: patientPhone || "",
        role: "patient",
        passwordChanged: false,
        selected_avatar_id: "",
      });

      // 3️⃣ Send credentials via EmailJS
      await sendPatientCredentials({
        patientName,
        patientEmail,
        tempPassword,
      });

      alert("Patient account created and credentials sent via email.");

      // 4️⃣ IMPORTANT: Firebase logs you in as the new patient → sign out
      await signOut(auth);

      // Reset form
      setPatientName("");
      setPatientEmail("");
      setPatientPhone("");
    } catch (error) {
      console.error("Error creating patient:", error);
      alert(error.message || "Failed to create patient");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">Physio Dashboard</h1>

      {/* Patient Onboarding Section */}
      <div className="bg-white shadow-md rounded-lg p-6 mb-10">
        <h2 className="text-xl font-semibold mb-4">Add New Patient</h2>

        <form onSubmit={handleAddPatient} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Patient Name
            </label>
            <input
              type="text"
              required
              value={patientName}
              onChange={(e) => setPatientName(e.target.value)}
              className="mt-1 w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-sky-500"
              placeholder="Enter patient name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Patient Email
            </label>
            <input
              type="email"
              required
              value={patientEmail}
              onChange={(e) => setPatientEmail(e.target.value)}
              className="mt-1 w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-sky-500"
              placeholder="Enter patient email"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Phone Number (optional)
            </label>
            <input
              type="tel"
              value={patientPhone}
              onChange={(e) => setPatientPhone(e.target.value)}
              className="mt-1 w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-sky-500"
              placeholder="Enter phone number"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full px-6 py-3 bg-sky-700 text-white rounded-md hover:bg-sky-800 transition disabled:opacity-60"
          >
            {loading ? "Creating Patient..." : "Create Patient Account"}
          </button>
        </form>
      </div>

      {/* Logout Button */}
      <button
        onClick={() => setShowLogoutModal(true)}
        className="px-6 py-3 bg-red-600 text-white rounded-md hover:bg-red-700 transition"
      >
        Logout
      </button>

      {/* Logout Modal */}
      <Logout modal={showLogoutModal} setModal={setShowLogoutModal} />
    </div>
  );
};

export default PhysioDashboard;
