import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import AssetLensAdminLayout from "./layouts/AssetLensAdminLayout";
import LandingPageLayout from "./layouts/LandingPageLayout";
import OrgAdminLayout from "./layouts/OrgAdminLayout";
import LandingPage from "./pages/LandingPage/LandingPage";
import MapConfigureToolPage from "./pages/ConfigurationTool/MapConfigureToolPage";

const AppRouter = () => {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<LandingPageLayout />}>
                    <Route index element={<LandingPage />} />
                    
                </Route>

                <Route path="/assetlens-admin" element={<AssetLensAdminLayout />}>
                    
                </Route>

                <Route path="/admin" element={<OrgAdminLayout />}>
                    <Route path="configure" element={<MapConfigureToolPage />}/>
                </Route>

                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </BrowserRouter>
    );
};

export default AppRouter;
