// src/AppRouter.js
import { Routes, Route, Navigate } from 'react-router-dom';
import { BrowserRouter } from 'react-router-dom';
import AssetLensAdminLayout from "./layouts/AssetLensAdminLayout";
import LandingPageLayout from "./layouts/LandingPageLayout";
import OrgAdminLayout from "./layouts/OrgAdminLayout";
import LandingPage from "./pages/LandingPage/LandingPage";
import MapConfiguration from "./pages/MapConfiguration/MapConfiguration";
import AddFloor from "./pages/MapConfiguration/AddFloorPage/AddFloor";
import EditFloor from "./pages/MapConfiguration/EditFloorPage/EditFloor";
import PastTracking from "./pages/PastTracking/PastTracking";
import AssetConfigPage from "./pages/AssetConfig/AssetConfigPage";
import UserList from './pages/userConfigurationPage/UserList';
import Organization from './pages/mangeOrganizationPage/organization';
import AlertPage from './pages/alertPage/alertPage';

const AppRouter = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Landing Page Routes */}
        <Route path="/" element={<LandingPageLayout />}>
          <Route index element={<LandingPage />} />
        </Route>

        {/* AssetLens Admin Routes */}
        <Route path="/assetlens-admin" element={<AssetLensAdminLayout />}>
          <Route path="config/organization" element={<Organization />} />
          <Route path="config/user" element={<UserList />} />
          <Route path="alerts" element={<AlertPage />} />
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

        {/* Catch-all route */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default AppRouter;