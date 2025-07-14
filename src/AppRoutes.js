import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Routes, Route, Navigate } from 'react-router-dom';
import { BrowserRouter } from 'react-router-dom';
import AssetLensAdminLayout from "./layouts/AssetLensAdminLayout";
import LandingPageLayout from "./layouts/LandingPageLayout";
import OrgAdminLayout from "./layouts/OrgAdminLayout";
import OrgUserLayout from "./layouts/OrgUserLayout";
import LandingPage from "./pages/LandingPage/LandingPage";
import MapConfiguration from "./pages/MapConfiguration/MapConfiguration";
import AddFloor from "./pages/MapConfiguration/AddFloorPage/AddFloor";
import EditFloor from "./pages/MapConfiguration/EditFloorPage/EditFloor";
import PastTracking from "./pages/PastTracking/PastTracking";
import AssetConfigPage from "./pages/AssetConfig/AssetConfigPage";
import UserList from './pages/userConfigurationPage/UserList';
import Organization from './pages/mangeOrganizationPage/organization';
import OnlineTracking from "./pages/OnlineTracking/OnlineTracking";
import CameraConfiguration from "./pages/CameraConfiguration/CameraConfiguration"
import AssetDetails from "./pages/AssetDetails/AssetDetails";
import AssetLogsPage from './pages/AssetLogs/LogsPage';
import AlertPage from './pages/alertPage/alertPage';
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


const AppRouter = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Landing Page Routes */}
        <Route path="/" element={<LandingPageLayout />}>
          <Route index element={<LandingPage />} />
        </Route>
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
        <Route path="/assetlens-admin" element={<AssetLensAdminLayout />}>
          <Route path="config/organization" element={<Organization />} />
          <Route path="config/user" element={<UserList />} />
          <Route path="alerts" element={<AlertPage />} />
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

                <Route path="/admin" element={<OrgAdminLayout />}>
                    <Route path="config/map" element={<MapConfiguration />} />
                    <Route path="config/map/addfloor" element={<AddFloor />} />
                    <Route path="config/map/editfloor/:floor_id" element={<EditFloor />} />
                    <Route path="past-tracking" element={<PastTracking />} />
                    <Route path="online-tracking" element={<OnlineTracking />} />
                    <Route path="config/asset" element={<AssetConfigPage />} />
                    <Route path="config/user" element={<UserList />} />
                    <Route path="logs" element={<AssetLogsPage />} />
                    <Route path="config/camera" element={<CameraConfiguration />} />
                    <Route path="asset/:asset_id" element={<AssetDetails />} />
                </Route>
        {/* Organization Admin Routes */}
        <Route path="/admin" element={<OrgAdminLayout />}>
          <Route path="config/map" element={<MapConfiguration />} />
          <Route path="config/map/addfloor" element={<AddFloor />} />
          <Route path="config/map/editfloor/:floor_id" element={<EditFloor />} />
          <Route path="past-tracking" element={<PastTracking />} />
          <Route path="config/asset" element={<AssetConfigPage />} />
          <Route path="config/user" element={<UserList />} />
          <Route path="alerts" element={<AlertPage />} />
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
        </Route>

        {/* Catch-all route */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
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
