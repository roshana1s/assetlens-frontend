const API_BASE_URL = 'http://localhost:8000';

export const OrganizationAPI = {
  getAllOrganizations: async () => {
    const response = await fetch(`${API_BASE_URL}/organizations/organizations/`);
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || 'Failed to fetch organizations');
    }
    return await response.json();
  },

  addOrganization: async (organization) => {
    try {
      // Prepare data in exact backend format
      const requestData = {
        name: organization.name,
        location: organization.location,
        email: organization.email,
        phone: organization.phone || "string", // Default if empty
        description: organization.description || "string", // Default if empty
        is_deleted: false
      };
  
      const response = await fetch(`${API_BASE_URL}/organizations/organizations/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        // Show detailed validation errors if available
        if (errorData.detail) {
          const errorMessages = errorData.detail.map(err => `${err.loc[1]}: ${err.msg}`).join(', ');
          throw new Error(`Validation failed: ${errorMessages}`);
        }
        throw new Error(errorData.message || 'Failed to add organization');
      }
  
      return await response.json();
    } catch (err) {
      console.error('Add organization error:', err);
      throw new Error(typeof err.message === 'string' ? err.message : 'Unknown error occurred');
    }
  },

  updateOrganization: async (orgId, organization) => {
    const response = await fetch(`${API_BASE_URL}/organizations/organizations/${orgId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(organization),
    });
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || 'Failed to update organization');
    }
    return await response.json();
  },

  deleteOrganization: async (orgId) => {
    const response = await fetch(`${API_BASE_URL}/organizations/organizations/${orgId}`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || 'Failed to delete organization');
    }
    return await response.json();
  },
};