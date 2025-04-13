import React, { useState, useEffect, useRef } from 'react';
import { fetchAllUsers, deleteUser, updateUser, createUser, fetchAllRoles, createRole, deleteRole } from './api';
import './UserConfiguration.css';

const UserList = ({ orgId = 1 }) => {
  // State management
  const [allUsers, setAllUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [selectedRoles, setSelectedRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [notification, setNotification] = useState(null);
  const [allAssets, setAllAssets] = useState([]);
  
  // Modal states
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showRoleManagementModal, setShowRoleManagementModal] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [confirmationName, setConfirmationName] = useState('');
  const [newRoleName, setNewRoleName] = useState('');
  const [roleToDelete, setRoleToDelete] = useState(null);
  
  // Form states
  const [editForm, setEditForm] = useState({
    name: '',
    role_id: '',
    image_link: '',
    tempImage: null,
    selectedAssets: []
  });
  
  const [addForm, setAddForm] = useState({
    name: '',          // Maps to startmsg
    email: '',         // Maps to result1
    password: '',      // Will use default if empty
    role_id: '',       // Required
    image_link: '',    // Maps to longo_link
    selectedAssets: [] // For your asset assignment
  });
  
  const fileInputRef = useRef();

  // Load data
  useEffect(() => {
    const loadData = async () => {
      try {
        const [usersData, rolesData] = await Promise.all([
          fetchAllUsers(orgId),
          fetchAllRoles(orgId)
        ]);
        
        // Extract all unique assets from users
        const assetsSet = new Set();
        usersData.forEach(user => {
          if (user.assets && user.assets.length > 0) {
            user.assets.forEach(asset => {
              const assetId = typeof asset === 'object' ? asset.asset_id : asset;
              const assetName = typeof asset === 'object' ? asset.name || asset.asset_name : asset;
              assetsSet.add(JSON.stringify({ id: assetId, name: assetName }));
            });
          }
        });
        
        const uniqueAssets = Array.from(assetsSet).map(item => JSON.parse(item));
        
        setAllUsers(usersData);
        setFilteredUsers(usersData);
        setRoles(rolesData);
        setAllAssets(uniqueAssets);
      } catch (error) {
        console.error('Error loading data:', error);
        setNotification({
          type: 'error',
          message: 'Failed to load data'
        });
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [orgId]);

  // Filter users based on search term and selected roles
  useEffect(() => {
    let result = allUsers;
    
    // Apply role filter if any roles are selected
    if (selectedRoles.length > 0) {
      result = result.filter(user => selectedRoles.includes(user.role_id));
    }
    
    // Apply search filter
    if (searchTerm) {
      result = result.filter(user =>
        user.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    setFilteredUsers(result);
  }, [searchTerm, selectedRoles, allUsers]);

  // Role filter handler
  const handleRoleToggle = (roleId) => {
    setSelectedRoles(prev => 
      prev.includes(roleId) 
        ? prev.filter(id => id !== roleId) 
        : [...prev, roleId]
    );
  };

  // Add new role handler
  const handleAddRole = async () => {
  const roleName = newRoleName.trim();

  // Client-side validation
  if (!roleName) {
    setNotification({ type: 'error', message: 'Role name cannot be empty' });
    return;
  }

  if (roleName.length < 3) {
    setNotification({ type: 'error', message: 'Minimum 3 characters required' });
    return;
  }

  try {
    const result = await createRole(orgId, roleName);
    
    // Update UI
    setRoles(prev => [...prev, {
      role_id: result.role_id || `new-${Date.now()}`,
      role_name: roleName,
      is_admin: false,
      is_deleted: false
    }]);
    
    setNotification({ type: 'success', message: `Created role: ${roleName}` });
    setNewRoleName('');
    setShowAddForm(false);
    
  } catch (error) {
    setNotification({
      type: 'error',
      message: error.message.includes('format') 
        ? 'Backend rejected the role data format'
        : error.message
    });
  }
};

  // Delete role handler
  const handleDeleteRole = async (roleId) => {
    try {
      const response = await deleteRole(orgId, roleId);
      const updatedRoles = await fetchAllRoles(orgId);
      setRoles(updatedRoles);
      setRoleToDelete(null);
      setNotification({
        type: 'success',
        message: response.message || 'Role deleted successfully'
      });
      
      // Remove from selected roles if it was selected
      setSelectedRoles(prev => prev.filter(id => id !== roleId));
    } catch (error) {
      console.error('Error deleting role:', error);
      setNotification({
        type: 'error',
        message: error.message || 'Failed to delete role'
      });
    }
  };

  // Edit user handler
  const handleEditClick = (user) => {
    const userAssetIds = (user.assets || []).map(asset => 
      typeof asset === 'object' ? asset.asset_id : asset
    );
    
    setCurrentUser(user);
    setEditForm({
      name: user.name,
      role_id: user.role_id,
      image_link: user.image,
      tempImage: null,
      selectedAssets: userAssetIds
    });
    setShowEditModal(true);
  };

  const handleEditConfirm = async () => {
    try {
      await updateUser(orgId, currentUser.user_id, {
        name: editForm.name,
        role_id: editForm.role_id,
        image_link: editForm.tempImage || editForm.image_link,
        assets: editForm.selectedAssets
      });
      
      const data = await fetchAllUsers(orgId);
      setAllUsers(data);
      setFilteredUsers(data);
      setShowEditModal(false);
      setNotification({
        type: 'success',
        message: 'User updated successfully'
      });
    } catch (error) {
      console.error('Error updating user:', error);
      setNotification({
        type: 'error',
        message: error.message || 'Failed to update user'
      });
    }
  };

  // Delete user handler
  const handleDeleteClick = (user) => {
    setCurrentUser(user);
    setConfirmationName('');
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    if (confirmationName !== currentUser?.name) return;

    try {
      setDeleteLoading(true);
      
      const userId = currentUser.user_id;
      const response = await deleteUser(orgId, userId);
      
      if (response && (response.message === "User deleted successfully" || !response.detail)) {
        const updatedUsers = allUsers.filter(user => user.user_id !== userId);
        setAllUsers(updatedUsers);
        setFilteredUsers(updatedUsers);
        
        setShowDeleteModal(false);
        setConfirmationName('');
        setNotification({
          type: 'success',
          message: 'User deleted successfully'
        });
        return;
      }

      if (response && response.detail) {
        if (response.detail === "User has assigned assets and cannot be deleted") {
          throw new Error("Cannot delete user with assigned assets");
        }
        
        if (response.detail === "User not found or already deleted") {
          const data = await fetchAllUsers(orgId);
          setAllUsers(data);
          setFilteredUsers(data);
          throw new Error("User was already deleted");
        }

        throw new Error(response.detail);
      }

      throw new Error("Failed to delete user");

    } catch (error) {
      console.error('Delete error:', error);
      setNotification({
        type: 'error',
        message: error.message || 'Failed to delete user'
      });
      
      if (error.message === "User was already deleted") {
        setShowDeleteModal(false);
        setConfirmationName('');
      }
    } finally {
      setDeleteLoading(false);
    }
  };

  // Asset selection handlers
  const handleAddAssetChange = (assetId) => {
    setAddForm(prev => {
      const newSelectedAssets = [...prev.selectedAssets];
      
      if (newSelectedAssets.includes(assetId)) {
        return {
          ...prev,
          selectedAssets: newSelectedAssets.filter(id => id !== assetId)
        };
      } else {
        return {
          ...prev,
          selectedAssets: [...newSelectedAssets, assetId]
        };
      }
    });
  };

  const handleEditAssetChange = (assetId) => {
    setEditForm(prev => {
      const newSelectedAssets = [...prev.selectedAssets];
      
      if (newSelectedAssets.includes(assetId)) {
        return {
          ...prev,
          selectedAssets: newSelectedAssets.filter(id => id !== assetId)
        };
      } else {
        return {
          ...prev,
          selectedAssets: [...newSelectedAssets, assetId]
        };
      }
    });
  };

  // Add user handler
  const handleAddClick = () => {
    setAddForm({
      name: '',
      email: '',
      password: '',
      role_id: '',
      image_link: '',
      selectedAssets: []
    });
    setShowAddModal(true);
  };

  const handleAddConfirm = async () => {
    // Client-side validation
    if (!addForm.name.trim()) {
      setNotification({ type: 'error', message: 'Full name is required' });
      return;
    }

    if (!addForm.role_id) {
      setNotification({ type: 'error', message: 'Role is required' });
      return;
    }

    try {
      const response = await createUser(orgId, {
        name: addForm.name,
        email: addForm.email,
        password: addForm.password,
        role_id: addForm.role_id,
        image_link: addForm.image_link,
        assets: addForm.selectedAssets
      });

      // Success handling
      const data = await fetchAllUsers(orgId);
      setAllUsers(data);
      setFilteredUsers(data);
      setShowAddModal(false);
      setNotification({
        type: 'success',
        message: `User ${addForm.name} created successfully`
      });

      // Reset form
      setAddForm({
        name: '',
        email: '',
        password: '',
        role_id: '',
        image_link: '',
        selectedAssets: []
      });
    } catch (error) {
      console.error('Create User Error:', error);
      setNotification({
        type: 'error',
        message: error.message.includes(';') 
          ? `Validation errors: ${error.message}`
          : error.message || 'Failed to create user'
      });
    }
  };

  // Image upload handler
  const handleImageUpload = (e, formType) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (formType === 'edit') {
          setEditForm(prev => ({
            ...prev,
            tempImage: reader.result
          }));
        } else {
          setAddForm(prev => ({
            ...prev,
            image_link: reader.result
          }));
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDeleteImage = () => {
    setEditForm(prev => ({
      ...prev,
      tempImage: null,
      image_link: ''
    }));
  };

  if (loading) return <div className="loading">Loading users...</div>;

  return (
    <div className="user-configuration-container">
      {/* Notification */}
      {notification && (
        <div className={`notification ${notification.type}`}>
          {notification.message}
          <button 
            className="close-notification" 
            onClick={() => setNotification(null)}
          >
            ×
          </button>
        </div>
      )}

      {/* Sidebar with Role Filter */}
      <div className="sidebar">
        <div className="role-filter-container">
          <div className="filter-header">
            <h2 className="filter-title">Filter</h2>
          </div>
          
          <div className="role-header">
            <h3 className="role-title">User role</h3>
            <button 
              className="edit-role-btn"
              onClick={() => setShowRoleManagementModal(true)}
            >
              <svg className="edit-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path>
              </svg>
            </button>
          </div>

          <div className="role-checkbox-list">
            {roles.map(role => (
              <div key={role.role_id} className="role-checkbox-item">
                <input
                  type="checkbox"
                  id={`role-${role.role_id}`}
                  checked={selectedRoles.includes(role.role_id)}
                  onChange={() => handleRoleToggle(role.role_id)}
                  className="role-checkbox"
                />
                <label htmlFor={`role-${role.role_id}`} className="role-checkbox-label">
                  <span className={`checkbox-custom ${selectedRoles.includes(role.role_id) ? 'checked' : ''}`}>
                    {selectedRoles.includes(role.role_id) && (
                      <svg className="checkmark" fill="none" stroke="white" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path>
                      </svg>
                    )}
                  </span>
                  {role.role_name}
                </label>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="main-content">
        {/* Header */}
        <div className="header-with-button">
          <h1 className="configuration-title">User Configuration</h1>
          <button className="add-user-btn" onClick={handleAddClick}>
            + Add User
          </button>
        </div>
        
        {/* Search */}
        <div className="search-container">
          <input
            type="text"
            placeholder="Search Users Here"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>

        {/* User List */}
        {filteredUsers.length === 0 ? (
          <p className="no-users">
            {searchTerm || selectedRoles.length > 0 
              ? 'No matching users found' 
              : 'No users found'}
          </p>
        ) : (
          <div className="compact-user-list">
            {filteredUsers.map(user => (
              <div key={user.user_id} className="compact-user-item">
                <div className="compact-user-info">
                  {user.image ? (
                    <img src={user.image} alt={user.name} className="compact-user-avatar" />
                  ) : (
                    <div className="compact-avatar-fallback">
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div className="compact-user-details">
                    <div className="compact-user-name">{user.name}</div>
                    <div className="compact-user-role">{user.role}</div>
                  </div>
                </div>
                <div className="compact-user-actions">
                  <button 
                    className="action-btn edit-btn"
                    onClick={() => handleEditClick(user)}
                  >
                    Edit
                  </button>
                  <button 
                    className="action-btn delete-btn"
                    onClick={() => handleDeleteClick(user)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Updated Role Management Modal - similar to Image 2 */}
        {showRoleManagementModal && (
          <div className="modal-overlay">
            <div className="modern-role-modal">
              <div className="modern-role-header">
                <h2>Roles</h2>
                <button 
                  className="close-modal-btn"
                  onClick={() => {
                    setShowRoleManagementModal(false);
                    setNewRoleName('');
                    setRoleToDelete(null);
                  }}
                >
                  ×
                </button>
              </div>
              
              <div className="modern-roles-list">
                {roles.map(role => (
                  <div key={role.role_id} className="modern-role-item">
                    <div className="modern-role-name">{role.role_name}</div>
                    <button
                      className="modern-role-delete-btn"
                      onClick={() => handleDeleteRole(role.role_id)}
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
              
              <div className="modern-add-role">
                <button className="modern-add-role-btn" onClick={handleAddRole}>
                  <span className="add-icon">+</span> Add Role
                </button>
                <input
                  type="text"
                  placeholder="Enter new role name"
                  value={newRoleName}
                  onChange={(e) => setNewRoleName(e.target.value)}
                  className="modern-role-input"
                />
              </div>
            </div>
          </div>
        )}

        {/* Delete User Modal */}
        {showDeleteModal && (
          <div className="modal-overlay">
            <div className="delete-modal">
              <h3>Type "{currentUser?.name}" below to confirm deletion</h3>
              <input
                type="text"
                placeholder="Enter User Name Here"
                value={confirmationName}
                onChange={(e) => setConfirmationName(e.target.value)}
                className="modal-input"
                disabled={deleteLoading}
              />
              <div className="modal-actions">
                <button 
                  className="modal-btn confirm-btn"
                  onClick={handleDeleteConfirm}
                  disabled={confirmationName !== currentUser?.name || deleteLoading}
                >
                  {deleteLoading ? 'Deleting...' : 'Confirm deletion'}
                </button>
                <button 
                  className="modal-btn cancel-btn"
                  onClick={() => {
                    setShowDeleteModal(false);
                    setConfirmationName('');
                  }}
                  disabled={deleteLoading}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Edit User Modal */}
        {showEditModal && (
          <div className="modal-overlay">
            <div className="edit-modal-figma">
              <div className="edit-modal-header">
                <h2>{editForm.name}</h2>
                <p className="user-role-text">
                  {roles.find(r => r.role_id === editForm.role_id)?.role_name || 'No role selected'}
                </p>
              </div>

              <div className="user-info-section">
                <h3 className="section-title">User Name</h3>
                <div className="user-details">
                  <div className="detail-row">
                    <span className="detail-label">Name</span>
                    <input
                      type="text"
                      value={editForm.name}
                      onChange={(e) => setEditForm({...editForm, name: e.target.value})}
                      className="detail-input"
                    />
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Role</span>
                    <select
                      value={editForm.role_id}
                      onChange={(e) => setEditForm({...editForm, role_id: e.target.value})}
                      className="detail-input"
                    >
                      <option value="">Select a role</option>
                      {roles.map(role => (
                        <option key={role.role_id} value={role.role_id}>
                          {role.role_name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              <div className="profile-image-section">
                <h3 className="section-title">Profile Image</h3>
                <div className="profile-image-container">
                  <div className="profile-image-wrapper">
                    {editForm.tempImage ? (
                      <img src={editForm.tempImage} alt="User" className="profile-image" />
                    ) : editForm.image_link ? (
                      <img src={editForm.image_link} alt="User" className="profile-image" />
                    ) : (
                      <div className="profile-image-placeholder">
                        {editForm.name.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>
                  <div className="profile-image-actions">
                    <button 
                      className="image-action-btn change-image-btn"
                      onClick={() => fileInputRef.current.click()}
                    >
                      Change User Image
                    </button>
                    {(editForm.tempImage || editForm.image_link) && (
                      <button 
                        className="image-action-btn remove-image-btn"
                        onClick={handleDeleteImage}
                      >
                        Remove Image
                      </button>
                    )}
                  </div>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={(e) => handleImageUpload(e, 'edit')}
                    accept="image/*"
                    style={{ display: 'none' }}
                  />
                </div>
              </div>

              <div className="assets-section">
                <h3 className="section-title">Assigned Assets</h3>
                <div className="assets-checkbox-container">
                  {allAssets.length > 0 ? (
                    <div className="asset-checkboxes">
                      {allAssets.map(asset => {
                        const assetId = asset.id;
                        const isChecked = editForm.selectedAssets.includes(assetId);
                        return (
                          <div key={assetId} className="asset-checkbox-item">
                            <input
                              type="checkbox"
                              id={`edit-asset-${assetId}`}
                              checked={isChecked}
                              onChange={() => handleEditAssetChange(assetId)}
                              className="asset-checkbox"
                            />
                            <label htmlFor={`edit-asset-${assetId}`} className="asset-checkbox-label">
                              {asset.name}
                            </label>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <p className="no-assets-message">No assets available to assign</p>
                  )}
                </div>
              </div>

              <div className="edit-modal-actions">
                <button 
                  className="cancel-btn"
                  onClick={() => setShowEditModal(false)}
                >
                  Cancel
                </button>
                <button 
                  className="save-btn"
                  onClick={handleEditConfirm}
                  disabled={!editForm.name || !editForm.role_id}
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Add User Modal with Assets Section */}
        {showAddModal && (
          <div className="modal-overlay">
            <div className="add-modal">
              <h2>Add New User</h2>
              
              <div className="form-group">
                <label>Name</label>
                <input
                  type="text"
                  value={addForm.name}
                  onChange={(e) => setAddForm({...addForm, name: e.target.value})}
                  className="modal-input"
                  placeholder="Enter full name"
                />
              </div>
              <div className="form-group">
              <label>Email (main)</label>
              <input
                type="email"
                value={addForm.email}
                onChange={(e) => setAddForm({...addForm, email: e.target.value})}
                className="modal-input"
                placeholder="user@example.com"
              />
            </div>
              <div className="form-group">
              <label>Role (void_id)</label>
              <select
                value={addForm.role_id}
                onChange={(e) => setAddForm({...addForm, role_id: e.target.value})}
                className="modal-input"
                required
              >
                <option value="">Select a role</option>
                {roles.map(role => (
                  <option key={role.role_id} value={role.role_id}>
                    {role.role_name}
                  </option>
                ))}
              </select>
            </div>

              {/* New Assets Section in Add User Form */}
              <div className="assets-section">
              <h3 className="section-title">Assign Assets</h3>
              <div className="assets-checkbox-container">
                {allAssets.length > 0 ? (
                  <div className="asset-checkboxes">
                    {allAssets.map(asset => (
                      <div key={asset.id} className="asset-checkbox-item">
                        <input
                          type="checkbox"
                          id={`asset-${asset.id}`}
                          checked={addForm.selectedAssets.includes(asset.id)}
                          onChange={() => handleAddAssetChange(asset.id)}
                          className="asset-checkbox"
                        />
                        <label htmlFor={`asset-${asset.id}`}>{asset.name}</label>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="no-assets-message">No assets available</p>
                )}
              </div>
            </div>
            <div className="image-upload-section">
              <label>Profile Image (image_list)</label>
              <div 
                className="image-drop-zone"
                onClick={() => fileInputRef.current.click()}
              >
                {addForm.image_link ? (
                  <img src={addForm.image_link} alt="Preview" className="preview-image" />
                ) : (
                  <>
                    <div className="drop-icon">+</div>
                    <p>Drop image here</p>
                    <p>PNG/JPEG, Max 20MB</p>
                  </>
                )}
              </div>
              <input
                type="file"
                ref={fileInputRef}
                onChange={(e) => handleImageUpload(e, 'add')}
                accept="image/*"
                style={{ display: 'none' }}
              />
            </div>


              <div className="add-modal-actions">
                <button 
                  className="modal-btn secondary-btn"
                  onClick={() => {
                    setShowAddModal(false);
                    setAddForm({
                      name: '',
                      email: '',
                      password: '',
                      role_id: '',
                      image_link: '',
                      selectedAssets: []
                    });
                    setShowAddModal(true);
                  }}
                >
                  Add another
                </button>
                <div className="primary-actions">
                  <button 
                    className="modal-btn cancel-btn"
                    onClick={() => setShowAddModal(false)}
                  >
                    Cancel
                  </button>
                  <button 
                    className="modal-btn create-btn"
                    onClick={handleAddConfirm}
                    disabled={!addForm.name || !addForm.role_id}
                  >
                    Add User
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserList;