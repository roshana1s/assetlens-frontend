import React, { useState, useEffect } from 'react';
import { fetchAllUsers } from './api';
import UserList from './UserList';
import './UserConfiguration.css';

const UserConfiguration = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const orgId = 1; // From your backend

  useEffect(() => {
    const loadData = async () => {
      try {
        const usersData = await fetchAllUsers(orgId);
        setUsers(usersData);
      } catch (error) {
        console.error('Error loading users:', error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [orgId]);

  if (loading) return <div className="loading">Loading users...</div>;

  return (
    <div className="user-config-container">
      <div className="config-header">
        <div className="header-left">
          <h2 className="page-title">
            <span className="icon-user">👤</span>
            User Configuration
          </h2>
        </div>
      </div>
      
      <UserList users={users} />
    </div>
  );
};

export default UserConfiguration;