import React, { useState, useEffect } from 'react';
import { fetchAllRoles, createRole, deleteRole } from './api';
import './RoleManager.css';

const RoleManager = ({ orgId = 1 }) => {
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newRoleName, setNewRoleName] = useState('');
  const [notification, setNotification] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState('');

  useEffect(() => {
    const loadRoles = async () => {
      setLoading(true);
      try {
        const rolesData = await fetchAllRoles(orgId);
        setRoles(rolesData);
      } catch (error) {
        setNotification({
          type: 'error',
          message: 'Failed to load roles: ' + error.message
        });
      } finally {
        setLoading(false);
      }
    };
    loadRoles();
  }, [orgId]);

  // const handleAddRole = async () => {
  //   if (!newRoleName.trim()) {
  //     setNotification({
  //       type: 'error',
  //       message: 'Role name cannot be empty'
  //     });
  //     return;
  //   }
    
  //   try {
  //     const response = await createRole(orgId, { role_name: newRoleName.trim() });
  //     if (response.message) {
  //       // If the response has a message, it means the role was created successfully
  //       const updatedRoles = await fetchAllRoles(orgId);
  //       setRoles(updatedRoles);
  //       setNewRoleName('');
  //       setShowAddForm(false);
  //       setNotification({
  //         type: 'success',
  //         message: response.message
  //       });
  //     } else {
  //       // Handle case where response doesn't contain expected data
  //       throw new Error('Unexpected response from server');
  //     }
  //   } catch (error) {
  //     setNotification({
  //       type: 'error',
  //       message: error.message || 'Failed to add role'
  //     });
  //   }
  // };

  const handleDeleteRole = async (roleId, roleName) => {
    if (deleteConfirm !== roleName) {
      setNotification({
        type: 'error',
        message: `Please type "${roleName}" to confirm deletion`
      });
      return;
    }

    try {
      const response = await deleteRole(orgId, roleId);
      if (response.message) {
        const updatedRoles = await fetchAllRoles(orgId);
        setRoles(updatedRoles);
        setDeleteConfirm('');
        setNotification({
          type: 'success',
          message: response.message
        });
      } else {
        throw new Error('Unexpected response from server');
      }
    } catch (error) {
      setNotification({
        type: 'error',
        message: error.message || 'Failed to delete role'
      });
    }
  };

  if (loading) return <div className="role-loading">Loading roles...</div>;

  return (
    <div className="role-manager-simple">
      {/* Notification */}
      {notification && (
        <div className={`role-notification ${notification.type}`}>
          {notification.message}
          <button 
            className="close-notification" 
            onClick={() => setNotification(null)}
          >
            ×
          </button>
        </div>
      )}

      <h2 className="role-title">Roles</h2>
      
      <ul className="role-list-simple">
        {roles.map(role => (
          <li key={role.role_id} className="role-item-simple">
            <span>{role.role_name}</span>
            <div className="role-actions">
              <input
                type="text"
                placeholder={`Type "${role.role_name}" to delete`}
                value={deleteConfirm}
                onChange={(e) => setDeleteConfirm(e.target.value)}
                className="delete-confirm-input"
              />
              <button 
                className="delete-role-btn"
                onClick={() => handleDeleteRole(role.role_id, role.role_name)}
                disabled={deleteConfirm !== role.role_name}
              >
                Delete
              </button>
            </div>
          </li>
        ))}
        
        {showAddForm ? (
          <li className="role-add-form">
            <input
              type="text"
              value={newRoleName}
              onChange={(e) => setNewRoleName(e.target.value)}
              placeholder="Enter role name"
              autoFocus
            />
            <div className="form-actions">
              <button onClick={handleAddRole}>Add</button>
              <button onClick={() => {
                setShowAddForm(false);
                setNewRoleName('');
              }}>Cancel</button>
            </div>
          </li>
        ) : (
          <li 
            className="add-role-option"
            onClick={() => {
              setShowAddForm(true);
              setNotification(null);
            }}
          >
            + Add Role
          </li>
        )}
      </ul>
    </div>
  );
};

export default RoleManager;