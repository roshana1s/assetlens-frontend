import React, { useState, useEffect } from 'react';
import { OrganizationAPI } from './api';
import './organization.css';

const ManageOrganizationPage = () => {
  const [organizations, setOrganizations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [currentOrg, setCurrentOrg] = useState(null);
  const [formData, setFormData] = useState({
    org_id: '',
    name: '',
    location: '',
    email: '',
    phone: '',
    description: ''
  });

  useEffect(() => {
    fetchOrganizations();
  }, []);

  const fetchOrganizations = async () => {
    try {
      setLoading(true);
      const data = await OrganizationAPI.getAllOrganizations();
      setOrganizations(data);
      setLoading(false);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setError(null);
      
      // Prepare the organization data
      const orgData = {
        name: formData.name,
        location: formData.location,
        email: formData.email,
        phone: formData.phone || "string", // Match your DB structure
        description: formData.description || "string" // Match your DB structure
      };
  
      if (currentOrg) {
        await OrganizationAPI.updateOrganization(currentOrg.org_id, orgData);
      } else {
        await OrganizationAPI.addOrganization(orgData);
      }
      
      setShowModal(false);
      resetForm();
      await fetchOrganizations();
    } catch (err) {
      // Display user-friendly error message
      setError(err.toString().replace('Error: ', ''));
      console.error('Submission error:', err);
    }
  };

  const handleEdit = (org) => {
    setCurrentOrg(org);
    setFormData({
      org_id: org.org_id,
      name: org.name,
      location: org.location,
      email: org.email,
      phone: org.phone || '',
      description: org.description || ''
    });
    setShowModal(true);
  };

  const handleDelete = async (orgId) => {
    if (window.confirm('Are you sure you want to delete this organization?')) {
      try {
        await OrganizationAPI.deleteOrganization(orgId);
        await fetchOrganizations();
      } catch (err) {
        setError(err.message);
      }
    }
  };

  const resetForm = () => {
    setCurrentOrg(null);
    setFormData({
      org_id: '',
      name: '',
      location: '',
      email: '',
      phone: '',
      description: ''
    });
  };

  return (
    <div className="org-container">
      <div className="org-header">
        <h1>Organization Management</h1>
        <button 
          className="btn-primary"
          onClick={() => setShowModal(true)}
        >
          Add Organization
        </button>
      </div>

      {error && <div className="error-alert">{error}</div>}

      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>{currentOrg ? 'Edit Organization' : 'Add Organization'}</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Name*</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Location*</label>
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Email*</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Phone</label>
                <input
                  type="text"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                />
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                />
              </div>
              <div className="form-actions">
                <button type="submit" className="btn-submit">
                  {currentOrg ? 'Update' : 'Save'}
                </button>
                <button 
                  type="button" 
                  onClick={() => {
                    setShowModal(false);
                    resetForm();
                  }} 
                  className="btn-cancel"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {loading ? (
        <div className="loading">Loading organizations...</div>
      ) : (
        <div className="org-table-container">
          <table className="org-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Location</th>
                <th>Email</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {organizations.length > 0 ? (
                organizations.map(org => (
                  <tr key={org.org_id}>
                    <td>{org.org_id}</td>
                    <td>{org.name}</td>
                    <td>{org.location}</td>
                    <td>{org.email}</td>
                    <td className="action-buttons">
                      <button 
                        onClick={() => handleEdit(org)}
                        className="btn-edit"
                      >
                        Edit
                      </button>
                      <button 
                        onClick={() => handleDelete(org.org_id)}
                        className="btn-delete"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="no-data">No organizations found</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default ManageOrganizationPage;