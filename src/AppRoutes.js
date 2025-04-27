import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import UserList from './pages/userConfigurationPage/UserList';
import RoleManager from './pages/userConfigurationPage/RoleManager';
import Organization from './pages/mangeOrganizationPage/organization';

const AppRoutes = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<UserList />} />
        <Route path="/users" element={<UserList />} />
        <Route path="/user_roles" element={<RoleManager />} />
        <Route path="/organization" element={<Organization />} />
      </Routes>
    </Router>
  );
};

export default AppRoutes;