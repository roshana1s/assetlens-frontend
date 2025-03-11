import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import AssetLensAdminLayout from "./layouts/AssetLensAdminLayout";
import LandingPageLayout from "./layouts/LandingPageLayout";
import OrgAdminLayout from "./layouts/OrgAdminLayout";
import LandingPage from "./pages/LandingPage/LandingPage";
import LoginPage from "./pages/LoginPage/LoginPage";
import PlaceOrderPage from "./pages/PlaceOrderPage/PlaceOrderPage";
import AssetLensAdminDashboard from "./pages/Dashboard/AssetLensAdminDashboard";
import OrgAdminDashboard from "./pages/Dashboard/OrgAdminDashboard";
import OrgUserDashboard from "./pages/Dashboard/OrgUserDashboard";
import ProtectedRoute from "./components/ProtectedRoute";
import ForgotPassword from "./pages/LoginPage/ForgotPassword";
import ResetPassword from "./pages/LoginPage/ResetPassword";


const AppRouter = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Landing Page Layout with sub-pages */}
        <Route path="/" element={<LandingPageLayout />}>
          <Route index element={<LandingPage />} />
          <Route path="login" element={<LoginPage />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} /> 
          <Route path="place-order" element={<PlaceOrderPage />} />
        </Route>

        {/* Protected Dashboard Routes */}
        <Route path="/dashboard/assetlens" element={<ProtectedRoute />}>
          <Route element={<AssetLensAdminLayout />}>
            <Route index element={<AssetLensAdminDashboard />} />
          </Route>
        </Route>

        <Route path="/dashboard/org/:orgId/admin" element={<ProtectedRoute />}>
          <Route element={<OrgAdminLayout />}>
            <Route index element={<OrgAdminDashboard />} />
          </Route>
        </Route>

        <Route path="/dashboard/org/:orgId/user" element={<ProtectedRoute />}>
          <Route element={<OrgAdminLayout />}>
            <Route index element={<OrgUserDashboard />} />
          </Route>
        </Route>

        {/* Redirect unknown routes to home */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default AppRouter;


