import api from './api';

export const dataAsetService = {
  // ===== ADMIN DATA ASET =====
  // Get all data aset with pagination
  getAllDataAset: async (params = {}) => {
    try {
      const response = await api.get('/admin/data-aset', { params });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get data aset by ID
  getDataAsetById: async (id) => {
    try {
      const response = await api.get(`/admin/data-aset/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Create new data aset
  createDataAset: async (dataAsetData) => {
    try {
      const response = await api.post('/admin/data-aset', dataAsetData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Update data aset
  updateDataAset: async (id, dataAsetData) => {
    try {
      const response = await api.put(`/admin/data-aset/${id}`, dataAsetData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Delete data aset (soft delete)
  deleteDataAset: async (id) => {
    try {
      const response = await api.delete(`/admin/data-aset/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get data aset by category
  getDataAsetByCategory: async (category, params = {}) => {
    try {
      const response = await api.get(`/admin/data-aset/category/${category}`, { params });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get data aset statistics
  getDataAsetStatistics: async () => {
    try {
      const response = await api.get('/admin/data-aset/statistics/overview');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Search data aset
  searchDataAset: async (query, params = {}) => {
    try {
      const response = await api.get('/admin/data-aset', { 
        params: { ...params, search: query } 
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  }
};

export const ownerDataAsetService = {
  // ===== OWNER DATA ASET (READ-ONLY) =====
  // Get all data aset with pagination
  getAllDataAset: async (params = {}) => {
    try {
      const response = await api.get('/owner/data-aset', { params });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get data aset by ID
  getDataAsetById: async (id) => {
    try {
      const response = await api.get(`/owner/data-aset/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get data aset by category
  getDataAsetByCategory: async (category, params = {}) => {
    try {
      const response = await api.get(`/owner/data-aset/category/${category}`, { params });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get data aset statistics
  getDataAsetStatistics: async () => {
    try {
      const response = await api.get('/owner/data-aset/statistics/overview');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Search data aset
  searchDataAset: async (query, params = {}) => {
    try {
      const response = await api.get('/owner/data-aset', { 
        params: { ...params, search: query } 
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  }
};
