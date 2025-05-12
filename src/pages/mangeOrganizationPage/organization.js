import React, { useState, useEffect } from 'react';
import { OrganizationAPI } from './api';
import './organization.css';

const ManageOrganizationPage = () => {
  const [organizations, setOrganizations] = useState([]);
  const [filteredOrganizations, setFilteredOrganizations] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
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

  useEffect(() => {
    const results = organizations.filter(org =>
      org.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      org.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
      org.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (org.description && org.description.toLowerCase().includes(searchTerm.toLowerCase()))
    );
    setFilteredOrganizations(results);
  }, [searchTerm, organizations]);

  const fetchOrganizations = async () => {
    try {
      setLoading(true);
      const data = await OrganizationAPI.getAllOrganizations();
      setOrganizations(data);
      setFilteredOrganizations(data);
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
      
      const orgData = {
        name: formData.name,
        location: formData.location,
        email: formData.email,
        phone: formData.phone || "string",
        description: formData.description || "string"
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
    <div className="org-management-container">
      <div className="org-header">
        <h1>Organization Management</h1>
        <div className="header-actions">
          <div className="search-container">
            <input
              type="text"
              placeholder="Search organizations..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
            <span className="search-icon">🔍</span>
          </div>
          <button 
            className="btn-primary"
            onClick={() => setShowModal(true)}
          >
            Add Organization
          </button>
        </div>
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
        <div className="loading-message">
          <div className="spinner"></div>
          Loading organizations...
        </div>
      ) : (
        <div className="org-table-wrapper">
          <table className="org-data-table">
            <thead>
              <tr>
                <th className="table-header">ID</th>
                <th className="table-header">Organization</th>
                <th className="table-header">Location</th>
                <th className="table-header">Contact Email</th>
                <th className="table-header actions-header">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrganizations.length > 0 ? (
                filteredOrganizations.map(org => (
                  <tr key={org.org_id} className="org-row">
                    <td className="org-id">{org.org_id}</td>
                    <td className="org-name">
                      <div className="org-name-wrapper">
                        <span className="org-name-text">{org.name}</span>
                        {org.description && org.description !== "string" && (
                          <span className="org-description">{org.description}</span>
                        )}
                      </div>
                    </td>
                    <td className="org-location">
                      {org.location === "string" ? "Not specified" : org.location}
                    </td>
                    <td className="org-email">
                      <a href={`mailto:${org.email}`} className="email-link">
                        {org.email}
                      </a>
                    </td>
                    <td className="org-actions">
                      <button 
                        onClick={() => handleEdit(org)}
                        className="action-btn edit-btn"
                        title="Edit organization"
                      >
                        Edit
                      </button>
                      <button 
                        onClick={() => handleDelete(org.org_id)}
                        className="action-btn delete-btn"
                        title="Delete organization"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr className="no-results-row">
                  <td colSpan="5">
                    <div className="no-results-message">
                      {searchTerm ? (
                        <>
                          <i className="fas fa-search"></i>
                          <span>No organizations match your search</span>
                        </>
                      ) : (
                        <>
                          <i className="fas fa-info-circle"></i>
                          <span>No organizations available</span>
                        </>
                      )}
                    </div>
                  </td>
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