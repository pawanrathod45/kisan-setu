import { Navigate } from "react-router-dom";

const RoleProtectedRoute = ({ children, role }) => {
  const user = JSON.parse(localStorage.getItem("user"));

  if (!user || user.role !== role) {
    return <Navigate to="/login" />;
  }

  return children;
};

export default RoleProtectedRoute;