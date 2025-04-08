import React from "react";
import { Outlet } from "react-router-dom";

const OrgAdminLayout = () => {
    return (
        <div>
            <Outlet />
        </div>
    );
};

export default OrgAdminLayout;
