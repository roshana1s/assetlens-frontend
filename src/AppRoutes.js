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

const AppRouter = () => {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<LandingPageLayout />}>
                    <Route index element={<LandingPage />} />
                </Route>

                <Route
                    path="/assetlens-admin"
                    element={<AssetLensAdminLayout />}
                ></Route>

                <Route path="/admin" element={<OrgAdminLayout />}>
                    <Route path="config/map" element={<MapConfiguration />} />
                    <Route path="config/map/addfloor" element={<AddFloor />} />
                    <Route path="config/map/editfloor/:floor_id" element={<EditFloor />} />
                    <Route path="past-tracking" element={<PastTracking />} />
                    <Route path="config/assets" element={<AssetConfigPage />} />
                </Route>

                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </BrowserRouter>
    );
};

export default AppRouter;