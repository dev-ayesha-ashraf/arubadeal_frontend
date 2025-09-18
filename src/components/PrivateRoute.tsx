import { Navigate, Outlet } from "react-router-dom";

const PrivateRoute = () => {
  const accessToken = localStorage.getItem("access_token");
  const userStr = localStorage.getItem("user");
  const user = userStr ? JSON.parse(userStr) : null;

  if (!accessToken) {
    return <Navigate to="/" replace />;
  }
if (window.location.pathname.startsWith("/admin")) {
  if (!user || user.role !== "admin") {
    return <Navigate to="/" replace />;
  }
}

  return <Outlet />;
};

export default PrivateRoute;
