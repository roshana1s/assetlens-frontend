import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import AssetLensAdminLayout from "./layouts/AssetLensAdminLayout";
import LandingPageLayout from "./layouts/LandingPageLayout";
import OrgAdminLayout from "./layouts/OrgAdminLayout";
import OrgUserLayout from "./layouts/OrgUserLayout";
import LandingPage from "./pages/LandingPage/LandingPage";
import LoginPage from "./pages/LoginPage/LoginPage";
import PlaceOrderPage from "./pages/PlaceOrderPage/PlaceOrderPage";
import AssetLensAdminDashboard from "./pages/Dashboard/AssetLensAdminDashboard";
import OrgAdminDashboard from "./pages/Dashboard/OrgAdminDashboard";
import OrgUserDashboard from "./pages/Dashboard/OrgUserDashboard";
import ProtectedRoute from "./components/ProtectedRoutes/ProtectedRoute";
import ForgotPassword from "./pages/LoginPage/ForgotPassword";
import ResetPassword from "./pages/LoginPage/ResetPassword";
import UnauthorizedPage from "./pages/UnauthorizedPage/UnauthorizedPage";
import HeatmapPage from "./pages/Dashboard/Heatmap/HeatmapPage";
import ProfilePage from "./pages/ProfilePage/ProfilePage"; 
import NotificationPage from "./pages/Notification/NotificationPage";
import AlertPage from "./pages/Alert/AlertPage";
import OnlineTrackingPage from "./pages/OnlineTracking/OnlineTracking";
import PastTrackingPage from "./pages/PastTracking/PastTracking";      
import LogsPage from "./pages/AssetLogs/LogsPage"; 
import UserConfigPage from "./pages/userConfigurationPage/UserConfiguration";
import AssetConfigPage from "./pages/AssetConfig/AssetConfigPage";
import MapConfigPage from "./pages/MapConfiguration/MapConfiguration";
import CameraConfigPage from "./pages/CameraConfiguration/CameraConfiguration";


const AppRouter = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<LandingPageLayout />}>
          <Route index element={<LandingPage />} />
          <Route path="login" element={<LoginPage />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="place-order" element={<PlaceOrderPage />} />
        </Route>

        {/* AssetLens Admin Routes */}
        <Route
          path="/dashboard/assetlens"
          element={
            <ProtectedRoute requiredRole="admin">
              <AssetLensAdminLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<AssetLensAdminDashboard />} />
          <Route path="profile" element={<ProfilePage />} /> 
        </Route>

        {/* Organization Admin Routes */}
        <Route
          path="/dashboard/org/:orgId/admin"
          element={
            <ProtectedRoute 
              requiredRole={["Super Admin", "Admin"]} 
              orgAccess={true}
            >
              <OrgAdminLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<OrgAdminDashboard />} />
          <Route path="heatmap" element={<HeatmapPage />} />
          <Route path="profile" element={<ProfilePage />} /> 
          <Route path="notifications" element={<NotificationPage />} />
          <Route path="alerts" element={<AlertPage />} />
          <Route path="online-tracking" element={<OnlineTrackingPage />} />
          <Route path="past-tracking" element={<PastTrackingPage />} />
          <Route path="logs" element={<LogsPage />} />
          <Route path="config-user" element={<UserConfigPage />} />
          <Route path="config-asset" element={<AssetConfigPage />} />
          <Route path="config-map" element={<MapConfigPage />} />
          <Route path="config-camera" element={<CameraConfigPage />} />
        </Route>

        {/* Organization User Routes */}
        <Route
          path="/dashboard/org/:orgId/user"
          element={
            <ProtectedRoute 
              requiredRole={["user"]}
              orgAccess={true}
            >
              <OrgUserLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<OrgUserDashboard />} />
          <Route path="profile" element={<ProfilePage />} /> 
        </Route>

        {/* Error Pages */}
        <Route path="/unauthorized" element={<UnauthorizedPage />} />
      </Routes>
    </BrowserRouter>
  );
};

export default AppRouter;