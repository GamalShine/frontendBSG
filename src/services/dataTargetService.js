import api from './api';

export const dataTargetService = {
  // Get all data target
  getAll: async (params = {}) => {
    try {
      // Backend returns: { success, data: { items, pagination, statistics } }
      const response = await api.get('/admin/data-target', { params });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get available years
  getYears: async () => {
    try {
      const response = await api.get('/admin/data-target/years');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get data target by ID
  getById: async (id) => {
    try {
      const response = await api.get(`/admin/data-target/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Create new data target
  create: async (dataTargetData) => {
    try {
      const response = await api.post('/admin/data-target', dataTargetData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Update data target
  update: async (id, dataTargetData) => {
    try {
      const response = await api.put(`/admin/data-target/${id}`, dataTargetData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Delete data target
  delete: async (id) => {
    try {
      const response = await api.delete(`/admin/data-target/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Search data target
  search: async (query) => {
    try {
      const response = await api.get('/admin/data-target', {
        params: { search: query }
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Owner endpoints (read-only)
  owner: {
    getAll: async (params = {}) => {
      const response = await api.get('/owner/data-target', { params });
      return response.data;
    },
    getById: async (id) => {
      const response = await api.get(`/owner/data-target/${id}`);
      return response.data;
    }
  }
};
