import React from "react";
import UserList from "./UserList";
import "./UserConfiguration.css";

const UserConfiguration = () => {
    const orgId = 1; // From your backend

    return <UserList orgId={orgId} />;
};

export default UserConfiguration;
