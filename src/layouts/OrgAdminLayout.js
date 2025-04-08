import React from "react";
import { Outlet } from "react-router-dom";

const OrgAdminLayout = () => {
    return (
        <div style={{ height: "100vh", display: "flex", flexDirection: "column", overflow: "hidden" }}>
            <nav style={{ height: "10vh", flexShrink: 0 }}>
                <ul style={{ margin: 0, padding: 0, listStyle: "none", display: "flex", justifyContent: "space-around" }}>
                    <li><a href="/dashboard">Dashboard</a></li>
                    <li><a href="/users">Users</a></li>
                    <li><a href="/settings">Settings</a></li>
                    <li><a href="/logout">Logout</a></li>
                </ul>
            </nav>
            <div style={{ flexGrow: 1, overflow: "hidden" }}>
                <Outlet />
            </div>
        </div>
    );
};

export default OrgAdminLayout;
