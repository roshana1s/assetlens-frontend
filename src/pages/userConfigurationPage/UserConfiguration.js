import React from "react";
import UserList from "./UserList";
import "./UserConfiguration.css";
import { useAuth } from "../../context/AuthContext";

const UserConfiguration = () => {
    const { user } = useAuth();
    if (!user || !user.org_id) {
        return <div>Please log in to view user configuration.</div>;
    }
    return <UserList orgId={user.org_id} />;
};

export default UserConfiguration;