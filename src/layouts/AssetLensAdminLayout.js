import React from "react";
import { Outlet } from "react-router-dom";
import NavBarAssetLensAdmin from "../components/NavBarAssetLensAdmin/NavBarAssetLensAdmin";

const AssetLensAdminLayout = () => {
    return (
        <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
            <NavBarAssetLensAdmin />
            <div style={{ flex: 1 }}>
                <Outlet />
            </div>
        </div>
    );
};

export default AssetLensAdminLayout;
