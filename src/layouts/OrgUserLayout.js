import React from "react";
import { Outlet } from "react-router-dom";

const OrgUserLayout = () => {
    return (
        <div>
            <div>
                <Outlet />
            </div>
        </div>
    );
};

export default OrgUserLayout;

