import { Navigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

const WithPrivateRoute = ({ children }) => {
  const { currentUser } = useAuth();

  // If user is logged in, allow access
  if (currentUser) {
    return children;
  }

  // Otherwise redirect to login
  return <Navigate to="/login" replace />;
};

export default WithPrivateRoute;
