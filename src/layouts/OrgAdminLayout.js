import React from "react";
import { Outlet } from "react-router-dom";
import NavBar from "../components/NavBar/NavBar";
import ChatBot from "../components/ChatBot/ChatBot"

const OrgAdminLayout = () => {
    return (
        <div>
            <NavBar />
            <ChatBot />
            <Outlet />
        </div>
    );
};

export default OrgAdminLayout;
