import { useState } from "react";
import Logout from "../components/accounts/Logout";

export default function Profile() {
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  console.log("Logout component:", Logout);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 dark:bg-gray-900">
      
      {/* Profile content */}
      <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6 w-full max-w-md text-center">
        <h1 className="text-2xl font-semibold text-gray-800 dark:text-gray-200">
          Profile
        </h1>

        <p className="mt-2 text-gray-500 dark:text-gray-400">
          This is your profile page.
        </p>

        {/* Logout button */}
        <button
          onClick={() => setShowLogoutModal(true)}
          className="mt-6 px-4 py-2 rounded-md bg-red-600 text-white hover:bg-red-700 focus:outline-none"
        >
          Logout
        </button>
      </div>

      {/* Logout Modal */}
      <Logout
        modal={showLogoutModal}
        setModal={setShowLogoutModal}
      />
    </div>
  );
}
