import React from "react";
import { Outlet } from "react-router-dom";

const OrgAdminLayout = () => {
    return (
        <div>
            <nav>
                <a href="/admin/configure">Configure</a>
            </nav>
            <Outlet />
        </div>
    );
};

export default OrgAdminLayout;
