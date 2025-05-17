import React from "react";
import LogoutButton from "../../components/Logout/LogoutButton";
import NavBarOrgAdmin from "../../components/NavBarOrgAdmin/NavBarOrgAdmin";

const OrgAdminDashboard = () => {
  return (
    <div>
      <NavBarOrgAdmin />
      <br></br>
      <h1>Organization Admin Dashboard</h1>
      <p>Manage your organization's assets here.</p>
      <LogoutButton/>
    </div>
  );
};

export default OrgAdminDashboard;

