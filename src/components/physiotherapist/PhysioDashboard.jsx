import React, { useState } from 'react';
import Logout from '../accounts/Logout';

const PhysioDashboard = () => {
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-8">Physio Dashboard</h1>

      {/* Button to open the logout modal */}
      <button
        onClick={() => setShowLogoutModal(true)}
        className="px-6 py-3 bg-red-600 text-white rounded-md hover:bg-red-700 transition"
      >
        Logout
      </button>

      {/* Render the existing Logout modal */}
      <Logout modal={showLogoutModal} setModal={setShowLogoutModal} />
    </div>
  );
};

export default PhysioDashboard;