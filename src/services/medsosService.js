import api from './api';

export const medsosService = {
  // Get all medsos platform costs
  getAll: async (params = {}) => {
    try {
      const response = await api.get('/admin/medsos/platform-costs', { params });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get medsos platform costs by ID
  getById: async (id) => {
    try {
      const response = await api.get(`/admin/medsos/platform-costs/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Create new medsos platform costs
  create: async (medsosData) => {
    try {
      const response = await api.post('/admin/medsos/platform-costs', medsosData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Update medsos platform costs
  update: async (id, medsosData) => {
    try {
      const response = await api.put(`/admin/medsos/platform-costs/${id}`, medsosData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Delete medsos platform costs
  delete: async (id) => {
    try {
      const response = await api.delete(`/admin/medsos/platform-costs/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Search medsos platform costs
  search: async (query) => {
    try {
      const response = await api.get('/admin/medsos/platform-costs', { 
        params: { search: query } 
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get medsos platform costs by platform
  getByPlatform: async (platform) => {
    try {
      const response = await api.get('/admin/medsos/platform-costs', { 
        params: { platform } 
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  }
};





