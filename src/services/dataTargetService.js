import api from './api';

export const dataTargetService = {
  // Get all data target
  getAll: async (params = {}) => {
    try {
      const response = await api.get('/admin/medsos/anggaran', { params });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get data target by ID
  getById: async (id) => {
    try {
      const response = await api.get(`/admin/medsos/anggaran/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Create new data target
  create: async (dataTargetData) => {
    try {
      const response = await api.post('/admin/medsos/anggaran', dataTargetData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Update data target
  update: async (id, dataTargetData) => {
    try {
      const response = await api.put(`/admin/medsos/anggaran/${id}`, dataTargetData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Delete data target
  delete: async (id) => {
    try {
      const response = await api.delete(`/admin/medsos/anggaran/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Search data target
  search: async (query) => {
    try {
      const response = await api.get('/admin/medsos/anggaran', { 
        params: { search: query } 
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  }
};
