import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const ProtectedRoute = ({ requiredRole, orgAccess = false, children }) => {
    const { isAuthenticated, user } = useAuth();

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    if (requiredRole) {
        if (user.org_id === 0) {
            if (requiredRole !== "admin") {
                return <Navigate to="/unauthorized" replace />;
            }
        } else {
            if (!requiredRole.includes(user.role)) {
                return <Navigate to="/unauthorized" replace />;
            }
        }
    }

    return children ? children : <Outlet />;
};

export default ProtectedRoute;
