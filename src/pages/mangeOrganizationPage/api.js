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
    const response = await fetch(`${API_BASE_URL}/organizations/organizations/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(organization),
    });
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || 'Failed to add organization');
    }
    return await response.json();
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