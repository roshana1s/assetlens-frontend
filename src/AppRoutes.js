import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LandingPage from "./pages/LandingPage/LandingPage";
import AssetConfigPage from "./pages/AssetConfig/AssetConfigPage";

const AppRoutes = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/assets" element={<AssetConfigPage />} /> {/* new route */}
      </Routes>
    </Router>
  );
};

export default AppRoutes;
