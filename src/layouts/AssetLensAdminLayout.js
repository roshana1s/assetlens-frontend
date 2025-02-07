import React from "react";
import { Outlet } from "react-router-dom";

const AssetLensAdminLayout = () => {
    return (
        <div>
            <div>
                <Outlet />
            </div>
        </div>
    );
};

export default AssetLensAdminLayout;
