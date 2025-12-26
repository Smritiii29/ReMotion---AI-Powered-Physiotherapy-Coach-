import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";

import LandingPage from "./components/LandingPage";
import Login from "./components/accounts/Login";
import Register from "./components/accounts/Register";

import PatientDashboard from "./components/user/PatientDashboard";
import PhysioDashboard from "./components/physiotherapist/PhysioDashboard";

import WithPrivateRoute from "./utils/WithPrivateRoute";
import ChangePassword from "./components/accounts/ChangePassword";
function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          
          {/* Patient Dashboard */}
          <Route
            path="/patient/dashboard"
            element={
              <WithPrivateRoute requiredRole="patient">
                <PatientDashboard />
              </WithPrivateRoute>
            }
          />
          <Route
            path="/change-password"
            element={
              <WithPrivateRoute requiredRole="patient">
                <ChangePassword />
              </WithPrivateRoute>
            }
          />

          {/* Physiotherapist Dashboard */}
          <Route
            path="/physio/dashboard"
            element={
              <WithPrivateRoute requiredRole="physiotherapist">
                <PhysioDashboard />
              </WithPrivateRoute>
            }
          />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;