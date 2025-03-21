import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const ProtectedRoute = () => {
  const { isAuthenticated } = useAuth();


  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;


// import React from "react";
// import { Navigate, Outlet } from "react-router-dom";
// import { useAuth } from "../context/AuthContext";

// const ProtectedRoute = ({ requiredRole }) => {
//   const { isAuthenticated, role, loading } = useAuth();

//   if (loading) {
//     return <div>Loading...</div>; // Prevents redirect before token is checked
//   }

//   if (!isAuthenticated) {
//     return <Navigate to="/login" replace />;
//   }

//   if (requiredRole && role !== requiredRole) {
//     return <Navigate to="/unauthorized" replace />; // Redirect to unauthorized page
//   }

//   return <Outlet />;
// };

// export default ProtectedRoute;

