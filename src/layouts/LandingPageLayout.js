import React from "react";
import { Outlet } from "react-router-dom";

const LandingPageLayout = () => {
    return (
        <div>
            <div>
                <Outlet />
            </div>
        </div>
    );
};

export default LandingPageLayout;
