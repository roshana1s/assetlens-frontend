import React from "react";
import { Outlet } from "react-router-dom";


const LandingPageLayout = () => {
    return (
        <div className="layout-container">
            <div className="image-placeholder"></div> 
            <main>
                <Outlet /> 
            </main>
            <footer>
                <p>© 2025 AssetLens. All rights reserved.</p>
            </footer>
        </div>
    );
};

export default LandingPageLayout;
