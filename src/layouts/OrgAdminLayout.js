import React from "react";
import { Outlet } from "react-router-dom";

const OrgAdminLayout = () => {
    return (
        <div>
            <div>
                <Outlet />
            </div>
        </div>
    );
};

export default OrgAdminLayout;
