import api from './api';

export const dataSupplierService = {
  // Get all suppliers
  getAll: async (params = {}) => {
    try {
      const response = await api.get('/admin/data-supplier', { params });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get supplier by ID
  getById: async (id) => {
    try {
      const response = await api.get(`/admin/data-supplier/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Create new supplier
  create: async (supplierData) => {
    try {
      const response = await api.post('/admin/data-supplier', supplierData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Update supplier
  update: async (id, supplierData) => {
    try {
      const response = await api.put(`/admin/data-supplier/${id}`, supplierData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Delete supplier
  delete: async (id) => {
    try {
      const response = await api.delete(`/admin/data-supplier/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Search suppliers
  search: async (query) => {
    try {
      const response = await api.get('/admin/data-supplier', { 
        params: { search: query } 
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get suppliers by category
  getByCategory: async (category) => {
    try {
      const response = await api.get('/admin/data-supplier', { 
        params: { category } 
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get suppliers by division
  getByDivision: async (divisi) => {
    try {
      const response = await api.get('/admin/data-supplier', { 
        params: { divisi } 
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  }
};





