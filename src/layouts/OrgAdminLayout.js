import React from "react";
import { Outlet } from "react-router-dom";
import NavBarOrgAdmin from "../components/NavBarOrgAdmin/NavBarOrgAdmin";
import ChatBot from "../components/ChatBot/ChatBot"

const OrgAdminLayout = () => {
    return (
        <div>
            <NavBarOrgAdmin />
            <ChatBot />
            <Outlet />
        </div>
    );
};

export default OrgAdminLayout;
