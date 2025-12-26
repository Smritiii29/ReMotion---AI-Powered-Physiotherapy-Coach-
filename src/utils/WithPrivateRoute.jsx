import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

export default function WithPrivateRoute({ children, requiredRole }) {
  const { currentUser, userRole, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <div className="text-center py-10">Loading...</div>;
  }

  if (!currentUser) {
    // Redirect to login, remember where they were
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (requiredRole && userRole !== requiredRole) {
    // Wrong role — send to their correct dashboard or home
    return <Navigate to="/" replace />;
  }

  return children;
}