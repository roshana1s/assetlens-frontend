import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import AssetLensAdminLayout from "./layouts/AssetLensAdminLayout";
import LandingPageLayout from "./layouts/LandingPageLayout";
import OrgAdminLayout from "./layouts/OrgAdminLayout";
import LandingPage from "./pages/LandingPage/LandingPage";
import LoginPage from "./pages/LoginPage/LoginPage";
import PlaceOrderPage from "./pages/PlaceOrderPage/PlaceOrderPage";
import AssetLensAdminDashboard from "./pages/Dashboard/AssetLensAdminDashboard";


const AppRouter = () => {
    return (
        <BrowserRouter>
            <Routes>
                {/* Landing Page Layout with sub-pages */}
                <Route path="/" element={<LandingPageLayout />}>
                    <Route index element={<LandingPage />} />
                    <Route path="login" element={<LoginPage />} />  
                    <Route path="place-order" element={<PlaceOrderPage />} /> 
                </Route>

                <Route path="/assetlens-admin" element={<AssetLensAdminLayout />}>
                    <Route index element={<AssetLensAdminDashboard />} />
                </Route>

                <Route path="/admin" element={<OrgAdminLayout />} />

                {/* Redirect unknown routes to home */}
                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </BrowserRouter>
    );
};

export default AppRouter;
