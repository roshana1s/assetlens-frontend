import axios from 'axios';
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

// User-related API functions
export const fetchAllUsers = async (orgId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/users/org/${orgId}`);
    
    if (!response.ok) {
      console.error('Server error:', response.status);
      return [];
    }
    
    const users = await response.json();
    console.log('API Users Response:', users);
    
    return users.map(user => ({
      user_id: user.user_id,
      id: user.user_id,
      name: user.name,
      role: user.role?.role_name || 'No Role Assigned',
      role_id: user.role?.role_id,
      image: user.image || user.image_link,
      assets: user.assigned_assets || []
    }));
    
  } catch (error) {
    console.error('Fetch error:', error);
    return [];
  }
};

export const fetchUsersByRole = async (orgId, roleIds) => {
  try {
    const allUsers = await fetchAllUsers(orgId);
    
    if (roleIds && roleIds.length > 0) {
      return allUsers.filter(user => roleIds.includes(user.role_id));
    }
    
    return allUsers;
  } catch (error) {
    console.error('Error fetching users by role:', error);
    return [];
  }
};

export const createUser = async (orgId, userData) => {
  try {
    const payload = {
      max_id: `user-${Date.now()}`,  // Auto-generated
      username: userData.name.toLowerCase().replace(/\s+/g, '_'),
      email: userData.email || 'default@example.com',  // Changed from 'main' to 'email'
      password: userData.password || 'defaultPassword123!',
      name: userData.name,
      role_id: userData.role_id,  // Changed from 'void_id' to 'role_id'
      image_link: userData.image_link || '',  // Changed from 'image_list' to 'image_link'
      assigned_assets: userData.assets||userData.selectedAssets || []
    };

    console.log('Final Payload:', payload);
    
    const response = await axios.post(
      `${API_BASE_URL}/users/org/${orgId}`,
      payload,
      {
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );
    return response.data;
  } catch (error) {
    console.error('Create User Error:', error);
    let errorMessage = 'Failed to create user';
    
    if (error.response?.data?.detail) {
      errorMessage = error.response.data.detail;
    } else if (error.response?.data?.errors) {
      errorMessage = Object.entries(error.response.data.errors)
        .map(([field, errors]) => `${field}: ${errors.join(', ')}`)
        .join('; ');
    }
    
    throw new Error(errorMessage);
  }
};

export const updateUser = async (orgId, userId, userData) => {
  try {
    // Ensure assets are properly formatted as an array of IDs
    const assetIds = (userData.assets || []).map(asset =>
      typeof asset === 'object' ? asset.asset_id : asset
    );

    // Prepare update payload
    const payload = {
      name: userData.name,
      image_link: userData.image_link || userData.tempImage,
      role_id: userData.role_id,
      assigned_assets: assetIds
    };

    console.log('Update User API Payload:', payload); // Debug log

    // Use axios for consistency with other API calls
    const response = await axios.put(
      `${API_BASE_URL}/users/org/${orgId}/${userId}`,
      payload,
      {
        headers: {
          'Content-Type': 'application/json',
          ...(localStorage.getItem('token') && {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          })
        }
      }
    );
    
    return response.data;
  } catch (error) {
    let errorMessage = 'Failed to update user';
    
    if (error.response?.data?.detail) {
      errorMessage = error.response.data.detail;
    }
    
    console.error('Error updating user:', errorMessage);
    throw new Error(errorMessage);
  }
};

export const deleteUser = async (orgId, userId) => {
  try {
    const response = await axios.delete(
      `${API_BASE_URL}/users/org/${orgId}/${userId}`,
      {
        headers: {
          ...(localStorage.getItem('token') && {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          })
        }
      }
    );
    
    return response.data;
  } catch (error) {
    let errorMessage = 'Failed to delete user';
    
    if (error.response?.status === 404) {
      errorMessage = 'User not found or already deleted';
    } else if (error.response?.data?.detail) {
      errorMessage = error.response.data.detail;
    }
    
    console.error('Error deleting user:', errorMessage);
    
    // Return error object for handling in component
    return { 
      error: true, 
      detail: errorMessage 
    };
  }
};

// Role-related API functions
export const fetchAllRoles = async (orgId) => {
  try {
    const response = await axios.get(
      `${API_BASE_URL}/user_roles/roles/org/${orgId}`,
      {
        headers: {
          ...(localStorage.getItem('token') && {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          })
        }
      }
    );
    
    // Filter out deleted roles
    return response.data.filter(role => !role.is_deleted);
  } catch (error) {
    console.error('Error fetching roles:', error);
    return [];
  }
};

export const createRole = async (orgId, roleName) => {
  try {
    const payload = {
      role_id: `role-${Date.now()}`,  // Generate a temporary ID
      role_name: roleName.trim(),     // Must be 3+ characters
      is_admin: false,                // Default to false
      is_deleted: false               // Must be included
    };

    console.log('Create Role API Payload:', payload); // Debug log

    const response = await axios.post(
      `${API_BASE_URL}/user_roles/roles/org/${orgId}`,
      payload,
      {
        headers: {
          'Content-Type': 'application/json',
          ...(localStorage.getItem('token') && {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          })
        }
      }
    );
    
    return response.data;
  } catch (error) {
    let errorMessage = 'Failed to create role';
    
    if (error.response?.status === 422) {
      errorMessage = 'Invalid role data format';
    } 
    
    if (error.response?.data?.detail) {
      errorMessage = error.response.data.detail;
    } else if (error.response?.data?.error?.message) {
      errorMessage = error.response.data.error.message;
    } else if (error.response?.data?.message) {
      errorMessage = error.response.data.message;
    }
    
    console.error('Error creating role:', errorMessage);
    throw new Error(errorMessage);
  }
};

export const deleteRole = async (orgId, roleId) => {
  try {
    const response = await axios.delete(
      `${API_BASE_URL}/user_roles/roles/org/${orgId}/${roleId}`,
      {
        headers: {
          ...(localStorage.getItem('token') && {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          })
        }
      }
    );
    
    return response.data;
  } catch (error) {
    let errorMessage = 'Failed to delete role';
    
    if (error.response?.status === 404) {
      errorMessage = 'Role not found or already deleted';
    } else if (error.response?.data?.detail) {
      errorMessage = error.response.data.detail;
    }
    
    console.error('Error deleting role:', errorMessage);
    throw new Error(errorMessage);
  }
};

export const fetchUserById = async (userId) => {
  try {
    const response = await axios.get(
      `${API_BASE_URL}/users/${userId}`,
      {
        headers: {
          ...(localStorage.getItem('token') && {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          })
        }
      }
    );
    
    return response.data;
  } catch (error) {
    console.error('Error fetching user by ID:', error);
    return null;
  }
};

export const fetchRoleById = async (orgId, roleId) => {
  try {
    const response = await axios.get(
      `${API_BASE_URL}/user_roles/roles/org/${orgId}/${roleId}`,
      {
        headers: {
          ...(localStorage.getItem('token') && {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          })
        }
      }
    );
    
    return response.data;
  } catch (error) {
    console.error('Error fetching role by ID:', error);
    return null;
  }
};