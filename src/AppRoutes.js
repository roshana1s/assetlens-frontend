import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import AssetLensAdminLayout from "./layouts/AssetLensAdminLayout";
import LandingPageLayout from "./layouts/LandingPageLayout";
import OrgAdminLayout from "./layouts/OrgAdminLayout";
import LandingPage from "./pages/LandingPage/LandingPage";
import MapConfiguration from "./pages/MapConfiguration/MapConfiguration";
import AddFloor from "./pages/MapConfiguration/AddFloorPage/AddFloor"
import EditFloor from "./pages/MapConfiguration/EditFloorPage/EditFloor";
import PastTracking from "./pages/PastTracking/PastTracking";
import AssetConfigPage from "./pages/AssetConfig/AssetConfigPage";
import UserList from './pages/userConfigurationPage/UserList';
import Organization from './pages/mangeOrganizationPage/organization';
import OnlineTracking from "./pages/OnlineTracking/OnlineTracking";
import CameraConfiguration from "./pages/CameraConfiguration/CameraConfiguration"
import AssetDetails from "./pages/AssetDetails/AssetDetails";
import AssetLogsPage from './pages/AssetLogs/LogsPage';
import CameraFeed from "./pages/CameraFeed/CameraFeed";

const AppRouter = () => {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<LandingPageLayout />}>
                    <Route index element={<LandingPage />} />
                </Route>

                <Route path="/assetlens-admin" element={<AssetLensAdminLayout />}>
                    <Route path="config/organization" element={<Organization />} />
                </Route>

                <Route path="/admin" element={<OrgAdminLayout />}>
                    <Route path="config/map" element={<MapConfiguration />} />
                    <Route path="config/map/addfloor" element={<AddFloor />} />
                    <Route path="config/map/editfloor/:floor_id" element={<EditFloor />} />
                    <Route path="past-tracking" element={<PastTracking />} />
                    <Route path="online-tracking" element={<OnlineTracking />} />
                    <Route path="config/asset" element={<AssetConfigPage />} />
                    <Route path="config/user" element={<UserList />} />
                    <Route path="config/camera" element={<CameraConfiguration />} />
                    <Route path="asset/:asset_id" element={<AssetDetails />} />
                    <Route path="logs" element={<AssetLogsPage />} />
                    <Route path="camera/:camera_id" element={<CameraFeed />} />
                </Route>

                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </BrowserRouter>
    );
};

export default AppRouter;