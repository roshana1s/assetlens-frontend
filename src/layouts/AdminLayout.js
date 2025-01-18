import React from "react";
import { Outlet } from "react-router-dom";

const AdminLayout = () => {
  return (
    <div>
      <div style={{ padding: "20px" }}>
        <Outlet />
      </div>
    </div>
  );
};

export default AdminLayout;
