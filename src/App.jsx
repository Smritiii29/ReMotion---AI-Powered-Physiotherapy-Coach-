import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";

import LandingPage from "./components/LandingPage";
import Register from "./components/accounts/Register";
import Login from "./components/accounts/Login";
import Profile from "./components/Profile";
import WithPrivateRoute from "./utils/WithPrivateRoute"; // ✅ ADD THIS

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />

          {/* 🔒 PROTECTED PROFILE ROUTE */}
          <Route
            path="/profile"
            element={
              <WithPrivateRoute>
                <Profile />
              </WithPrivateRoute>
            }
          />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
