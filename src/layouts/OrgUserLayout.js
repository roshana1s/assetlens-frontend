import React from "react";
import { Outlet } from "react-router-dom";
import NavBarOrgUser from "../components/NavBarOrgUser/NavBarOrgUser";
import Chatbot from "../components/ChatBot/ChatBot";

const OrgUserLayout = () => {
    return (
        <div>
            <div>
                <NavBarOrgUser />
                <Chatbot />
                <Outlet />
            </div>
        </div>
    );
};

export default OrgUserLayout;

