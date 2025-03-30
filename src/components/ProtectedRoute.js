import React from "react";
import { Navigate, Outlet, useParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const ProtectedRoute = ({ requiredRole, orgAccess = false }) => {
  const { isAuthenticated, user } = useAuth();
  const { orgId } = useParams();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (orgAccess && user.org_id !== parseInt(orgId)) {
    return <Navigate to="/unauthorized" replace />;
  }

  if (requiredRole) {
    if (user.org_id === 0) {
      if (requiredRole !== 'admin') {
        return <Navigate to="/unauthorized" replace />;
      }
    } else {
      if (!requiredRole.includes(user.role)) {
        return <Navigate to="/unauthorized" replace />;
      }
    }
  }

  return <Outlet />;
};

export default ProtectedRoute;

