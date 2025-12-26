// src/components/user/PatientDashboard.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { updatePassword } from 'firebase/auth';

import Logout from '../accounts/Logout';
import Avatar3DViewer from './Avatar3DViewer';
import { localAvatars } from '../../data/avatars';

const PatientDashboard = () => {
  const { currentUser, logout } = useAuth(); // assuming logout is provided by context

  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showAvatarModal, setShowAvatarModal] = useState(false);
  const [selectedAvatarId, setSelectedAvatarId] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState(null);

  // Fetch user data on mount
  useEffect(() => {
    const fetchUserData = async () => {
      if (!currentUser) return;

      try {
        const userDocRef = doc(db, 'Users', currentUser.uid);
        const userDoc = await getDoc(userDocRef);

        if (userDoc.exists()) {
          const data = userDoc.data();
          setUserData(data);

          // Show password modal if not changed
          if (!data.passwordChanged) {
            setShowPasswordModal(true);
          }
          // Show avatar modal if not selected (after password)
          else if (!data.selected_avatar_id) {
            setShowAvatarModal(true);
          }
        }
      } catch (err) {
        console.error('Error fetching user data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [currentUser]);

  // Handle password update
  const handlePasswordChange = async () => {
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    try {
      await updatePassword(currentUser, newPassword);
      await updateDoc(doc(db, 'Users', currentUser.uid), { passwordChanged: true });
      setShowPasswordModal(false);
      setShowAvatarModal(true); // show avatar selection next
      setError('');
    } catch (err) {
      setError('Failed to update password. Try logging in again.');
    }
  };

  // Handle avatar selection
  const handleAvatarSelect = async () => {
    if (!selectedAvatarId) {
      setError('Please select an avatar');
      return;
    }

    try {
      await updateDoc(doc(db, 'Users', currentUser.uid), {
        selected_avatar_id: selectedAvatarId,
      });
      setShowAvatarModal(false);
      setError('');
      window.location.reload(); // refresh to show selected avatar
    } catch (err) {
      setError('Failed to save avatar selection');
    }
  };

  // Find selected avatar
  const selectedAvatar = localAvatars.find(
    (avatar) => avatar.id === userData?.selected_avatar_id
  );

  if (loading) {
    return <div className="text-center py-20">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6 md:p-8">
      <div className="max-w-5xl mx-auto">
        {/* Header with 3D Avatar */}
        <div className="flex flex-col sm:flex-row items-center gap-6 mb-10">
          <div className="w-48 h-64 sm:w-64 sm:h-80 bg-white rounded-2xl overflow-hidden shadow-xl border-4 border-sky-700">
            {selectedAvatar?.model_path ? (
              <Avatar3DViewer
                modelUrl={selectedAvatar.model_path}
                className="w-full h-full"
                scale={1.4} // adjust if model looks too small/large
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gray-100 text-gray-500 text-sm font-medium">
                No avatar selected
              </div>
            )}
          </div>

          <div>
            <h1 className="text-3xl font-bold text-gray-800">Patient Dashboard</h1>
            <p className="text-lg text-gray-600 mt-1">
              Welcome, {currentUser?.email || 'Patient'}
            </p>
            {selectedAvatar && (
              <p className="mt-2 text-base font-medium text-sky-700">
                {selectedAvatar.name}
              </p>
            )}
          </div>
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

        {/* Password Change Modal */}
        {showPasswordModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-8 rounded-lg max-w-md w-full">
              <h2 className="text-2xl font-bold mb-4">Set Your Password</h2>
              <p className="mb-6 text-gray-600">For security, please set a new password.</p>
              <input
                type="password"
                placeholder="New Password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full p-3 border rounded mb-4"
              />
              <input
                type="password"
                placeholder="Confirm Password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full p-3 border rounded mb-4"
              />
              {error && <p className="text-red-600 mb-4">{error}</p>}
              <button
                onClick={handlePasswordChange}
                className="w-full py-3 bg-sky-800 text-white rounded"
              >
                Update Password
              </button>
            </div>
          </div>
        )}

        {/* Avatar Selection Modal */}
        {showAvatarModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-8 rounded-lg max-w-2xl w-full max-h-screen overflow-y-auto">
              <h2 className="text-2xl font-bold mb-6">Choose Your Avatar</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                {localAvatars.map((avatar) => (
                  <div
                    key={avatar.id}
                    onClick={() => setSelectedAvatarId(avatar.id)}
                    className={`cursor-pointer border-4 rounded-lg p-4 transition ${
                      selectedAvatarId === avatar.id ? 'border-sky-800 bg-sky-50' : 'border-gray-300'
                    }`}
                  >
                    <div className="w-full h-48 bg-gray-100 rounded overflow-hidden">
                      <Avatar3DViewer
                        modelUrl={avatar.model_path}
                        scale={1.0}
                        className="w-full h-full"
                      />
                    </div>
                    <p className="text-center mt-4 font-medium">{avatar.name}</p>
                  </div>
                ))}
              </div>
              {error && <p className="text-red-600 mt-4 text-center">{error}</p>}
              <button
                onClick={handleAvatarSelect}
                className="w-full mt-8 py-3 bg-sky-800 text-white rounded font-medium"
              >
                Confirm Selection
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PatientDashboard;