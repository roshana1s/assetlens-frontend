// import React from "react";
// import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
// import AssetLensAdminLayout from "./layouts/AssetLensAdminLayout";
// import LandingPageLayout from "./layouts/LandingPageLayout";
// import OrgAdminLayout from "./layouts/OrgAdminLayout";
// import LandingPage from "./pages/LandingPage/LandingPage";
// import LoginPage from "./pages/LoginPage/LoginPage";
// import PlaceOrderPage from "./pages/PlaceOrderPage/PlaceOrderPage";
// import AssetLensAdminDashboard from "./pages/Dashboard/AssetLensAdminDashboard";


// const AppRouter = () => {
//     return (
//         <BrowserRouter>
//             <Routes>
//                 {/* Landing Page Layout with sub-pages */}
//                 <Route path="/" element={<LandingPageLayout />}>
//                     <Route index element={<LandingPage />} />
//                     <Route path="login" element={<LoginPage />} />  
//                     <Route path="place-order" element={<PlaceOrderPage />} /> 
//                 </Route>

//                 <Route path="/assetlens-admin" element={<AssetLensAdminLayout />}>
//                     <Route index element={<AssetLensAdminDashboard />} />
//                 </Route>

//                 <Route path="/admin" element={<OrgAdminLayout />} />

//                 {/* Redirect unknown routes to home */}
//                 <Route path="*" element={<Navigate to="/" replace />} />
//             </Routes>
//         </BrowserRouter>
//     );
// };

// export default AppRouter;


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

        {/* Protected Routes */}
        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard/assetlens" element={<AssetLensAdminLayout />}>
            <Route index element={<AssetLensAdminDashboard />} />
          </Route>

          <Route path="/dashboard/org/:orgId/admin" element={<OrgAdminLayout />}>
            <Route index element={<OrgAdminDashboard />} />
          </Route>

          <Route path="/dashboard/org/:orgId/user" element={<OrgAdminLayout />}>
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