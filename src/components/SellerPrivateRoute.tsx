import { Navigate, Outlet } from "react-router-dom";

const SellerPrivateRoute = () => {
  const token = localStorage.getItem("access_token");
  const userStr = localStorage.getItem("user");
  const user = userStr ? JSON.parse(userStr) : null;

  if (!token) {
    return <Navigate to="/login" replace />;
  }
  if (!user || user.role !== "seller") {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};

export default SellerPrivateRoute;
