import React from 'react';
import { Routes, Route } from 'react-router-dom';
import UserList from './pages/userConfigurationPage/UserList';
import Organization from './pages/mangeOrganizationPage/organization';
import AlertPage from './pages/alertPage/alertPage';

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/users" element={<UserList />} />
      <Route path="/organization" element={<Organization />} />
      <Route path="/alerts" element={<AlertPage />} />
    </Routes>
  );
};

export default AppRoutes;
