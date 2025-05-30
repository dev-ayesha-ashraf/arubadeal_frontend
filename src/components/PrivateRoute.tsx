import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

interface PrivateRouteProps {
  children: React.ReactNode;
  requiredRole?: number;
}

const PrivateRoute = ({ children, requiredRole }: PrivateRouteProps) => {
  const { user } = useAuth();
  const location = useLocation();

  // If no user is logged in and trying to access a protected route
  if (!user && requiredRole) {
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  // If user is logged in but doesn't have the required role
  if (user && requiredRole && user.role !== requiredRole) {
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

export default PrivateRoute; 