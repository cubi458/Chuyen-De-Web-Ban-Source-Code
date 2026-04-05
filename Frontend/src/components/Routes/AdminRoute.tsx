import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "context/AuthContext";

type AdminRouteProps = {
  children: React.ReactElement;
};

const AdminRoute: React.FC<AdminRouteProps> = ({ children }) => {
  const { user, loading, isAdmin } = useAuth();

  if (loading) {
    return <div className="text-center mt-5">Đang kiểm tra quyền truy cập...</div>;
  }

  if (!user || !user.emailVerified) {
    return <Navigate to="/store/auth" replace />;
  }

  if (!isAdmin) {
    return <Navigate to="/store" replace state={{ blocked: true }} />;
  }

  return children;
};

export default AdminRoute;
