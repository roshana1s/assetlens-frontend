import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';
import './ProfilePage.css';

const ProfilePage = () => {
  const { token, logout } = useAuth(); 
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [passwordMode, setPasswordMode] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: ''
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [passwordVisible, setPasswordVisible] = useState({
    current: false,
    new: false,
    confirm: false
  });
  const [updating, setUpdating] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const [successMessage, setSuccessMessage] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        if (!token) {
          throw new Error('No authentication token found');
        }

        const response = await axios.get('http://localhost:8000/user/profile', {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        setProfile(response.data);
        setFormData({
          name: response.data.name,
          email: response.data.email
        });
      } catch (err) {
        console.error('Profile fetch error:', err);
        setError(err.response?.data?.detail || err.message || 'Failed to load profile');
        if (err.response?.status === 401) {
          logout();
        }
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [token, logout]);

  const handleUpdateProfile = async () => {
    setUpdating(true);
    try {
      await axios.put('http://localhost:8000/user/profile', formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      const response = await axios.get('http://localhost:8000/user/profile', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setProfile(response.data);
      setEditMode(false);
      setError(null);
      setSuccessMessage('Profile updated successfully!');
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to update profile');
      if (err.response?.status === 401) {
        logout();
      }
    } finally {
      setUpdating(false);
    }
  };

  const handleChangePassword = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setError("Passwords don't match");
      return;
    }

    setChangingPassword(true);
    try {
      await axios.post(
        'http://localhost:8000/user/profile/change-password',
        {
          current_password: passwordData.currentPassword,
          new_password: passwordData.newPassword,
          confirm_password: passwordData.confirmPassword
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      
      setPasswordMode(false);
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      setError(null);
      setSuccessMessage('Password changed successfully!');
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      if (err.response?.data?.detail) {
        if (Array.isArray(err.response.data.detail)) {
          setError(err.response.data.detail.map(e => e.msg).join(', '));
        } else {
          setError(err.response.data.detail);
        }
      } else {
        setError('Failed to change password');
      }
      if (err.response?.status === 401) {
        logout();
      }
    } finally {
      setChangingPassword(false);
    }
  };

  const togglePasswordVisibility = (field) => {
    setPasswordVisible({
      ...passwordVisible,
      [field]: !passwordVisible[field]
    });
  };

  if (loading) return (
    <div className="loading-container">
      <div className="loading-spinner"></div>
      <p>Loading your profile...</p>
    </div>
  );

  if (error) return (
    <div className="error">
      <h2>Error</h2>
      <p>{typeof error === 'string' ? error : JSON.stringify(error)}</p>
      <button onClick={() => setError(null)}>Try Again</button>
    </div>
  );

  return (
    <div className="profile-container">
      <h1>{profile ? `Hey, ${profile.name}!` : 'User Profile'}</h1>
      
      {successMessage && (
        <div className="success-popup">
          <div className="success-content">
            <span className="success-icon">✓</span>
            <p>{successMessage}</p>
          </div>
        </div>
      )}
      
      <div className="profile-card">
        <div className="profile-header">
          <div className="avatar-container">
            <img 
              src={profile?.image_link || '/default-avatar.png'} 
              alt="Profile" 
              className="profile-avatar"
            />
            <span className="role-badge">{profile?.role}</span>
          </div>
          
          {!editMode && !passwordMode && (
            <div className="action-buttons">
              <button onClick={() => setEditMode(true)}>Edit Profile</button>
              <button onClick={() => setPasswordMode(true)}>Change Password</button>
            </div>
          )}
        </div>

        {editMode ? (
          <div className="edit-form">
            <h2>Edit Profile</h2>
            <div className="form-group">
              <label>Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
              />
            </div>
            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
              />
            </div>
            <div className="form-actions">
              <button className="cancel" onClick={() => setEditMode(false)}>Cancel</button>
              <button 
                className="save" 
                onClick={handleUpdateProfile} 
                disabled={updating}
              >
                {updating ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        ) : passwordMode ? (
          <div className="password-form">
            <h2>Change Password</h2>
            {error && <div className="password-error">{error}</div>}
            <div className="form-group password-input-group">
              <label>Current Password</label>
              <div className="password-input-wrapper">
                <input
                  type={passwordVisible.current ? "text" : "password"}
                  value={passwordData.currentPassword}
                  onChange={(e) => setPasswordData({...passwordData, currentPassword: e.target.value})}
                />
                <span 
                  className={`password-toggle ${passwordVisible.current ? 'visible' : ''}`}
                  onClick={() => togglePasswordVisibility('current')}
                >
                  {passwordVisible.current ? '👁️' : '👁️‍🗨️'}
                </span>
              </div>
            </div>
            <div className="form-group password-input-group">
              <label>New Password</label>
              <div className="password-input-wrapper">
                <input
                  type={passwordVisible.new ? "text" : "password"}
                  value={passwordData.newPassword}
                  onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})}
                />
                <span 
                  className={`password-toggle ${passwordVisible.new ? 'visible' : ''}`}
                  onClick={() => togglePasswordVisibility('new')}
                >
                  {passwordVisible.new ? '👁️' : '👁️‍🗨️'}
                </span>
              </div>
            </div>
            <div className="form-group password-input-group">
              <label>Confirm Password</label>
              <div className="password-input-wrapper">
                <input
                  type={passwordVisible.confirm ? "text" : "password"}
                  value={passwordData.confirmPassword}
                  onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})}
                />
                <span 
                  className={`password-toggle ${passwordVisible.confirm ? 'visible' : ''}`}
                  onClick={() => togglePasswordVisibility('confirm')}
                >
                  {passwordVisible.confirm ? '👁️' : '👁️‍🗨️'}
                </span>
              </div>
              {passwordData.newPassword && passwordData.confirmPassword && (
                <div className={`password-match ${passwordData.newPassword === passwordData.confirmPassword ? 'match' : 'no-match'}`}>
                  {passwordData.newPassword === passwordData.confirmPassword ? '✓ Passwords match' : '✗ Passwords do not match'}
                </div>
              )}
            </div>
            <div className="form-actions">
              <button className="cancel" onClick={() => {
                setPasswordMode(false);
                setError(null);
              }}>Cancel</button>
              <button 
                className="save" 
                onClick={handleChangePassword}
                disabled={changingPassword || !passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword}
              >
                {changingPassword ? 'Updating...' : 'Update Password'}
              </button>
            </div>
          </div>
        ) : (
          <div className="profile-info">
            <h2>{profile?.name}</h2>
            <p><strong>Email:</strong> {profile?.email}</p>
            <p><strong>Role:</strong> {profile?.role}</p>
          </div>
        )}
      </div>
      {!profile?.is_global_admin && (
        <div className="assets-section">
          <h2>Assigned Assets</h2>
          {profile?.assigned_assets?.length > 0 ? (
            <div className="assets-grid">
              {profile.assigned_assets.map(asset => (
                <div key={asset.asset_id} className="asset-card">
                  <img 
                    src={asset.image_link || '/default-asset.png'} 
                    alt={asset.asset_name}
                    className="asset-image"
                  />
                  <div className="asset-info">
                    <h3>{asset.asset_name}</h3>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="no-assets">No assets assigned</p>
          )}
        </div>
      )}
    </div>
  );
};

export default ProfilePage;