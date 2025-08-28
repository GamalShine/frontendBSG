import api from './api';

export const ownerMedsosService = {
  // ===== MEDSOS PLATFORM DATA =====
  // Get all medsos platform data
  getAllPlatforms: async (params = {}) => {
    try {
      const response = await api.get('/owner/medsos/platform', { params });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get medsos platform data by ID
  getPlatformById: async (id) => {
    try {
      const response = await api.get(`/owner/medsos/platforms/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Create new medsos platform data
  createPlatform: async (platformData) => {
    try {
      const response = await api.post('/owner/medsos/platforms', platformData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Update medsos platform data
  updatePlatform: async (id, platformData) => {
    try {
      const response = await api.put(`/owner/medsos/platforms/${id}`, platformData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Delete medsos platform data
  deletePlatform: async (id) => {
    try {
      const response = await api.delete(`/owner/medsos/platforms/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // ===== MEDSOS KOL DATA =====
  // Get all KOL data
  getAllKOL: async (params = {}) => {
    try {
      const response = await api.get('/owner/medsos/kol', { params });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get KOL data by ID
  getKOLById: async (id) => {
    try {
      const response = await api.get(`/owner/medsos/kol/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Create new KOL data
  createKOL: async (kolData) => {
    try {
      const response = await api.post('/owner/medsos/kol', kolData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Update KOL data
  updateKOL: async (id, kolData) => {
    try {
      const response = await api.put(`/owner/medsos/kol/${id}`, kolData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Delete KOL data
  deleteKOL: async (id) => {
    try {
      const response = await api.delete(`/owner/medsos/kol/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // ===== MEDSOS ANGGARAN DATA =====
  // Get all anggaran data
  getAllAnggaran: async (params = {}) => {
    try {
      const response = await api.get('/owner/medsos/anggaran', { params });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get anggaran data by ID
  getAnggaranById: async (id) => {
    try {
      const response = await api.get(`/owner/medsos/anggaran/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Create new anggaran data
  createAnggaran: async (anggaranData) => {
    try {
      const response = await api.post('/owner/medsos/anggaran', anggaranData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Update anggaran data
  updateAnggaran: async (id, anggaranData) => {
    try {
      const response = await api.put(`/owner/medsos/anggaran/${id}`, anggaranData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Delete anggaran data
  deleteAnggaran: async (id) => {
    try {
      const response = await api.delete(`/owner/medsos/anggaran/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // ===== MEDSOS PLATFORM COSTS =====
  // Get all medsos platform costs
  getAllPlatformCosts: async (params = {}) => {
    try {
      const response = await api.get('/owner/medsos/platform-costs', { params });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get medsos platform costs by ID
  getPlatformCostsById: async (id) => {
    try {
      const response = await api.get(`/owner/medsos/platform-costs/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Create new medsos platform costs
  createPlatformCosts: async (costsData) => {
    try {
      const response = await api.post('/owner/medsos/platform-costs', costsData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Update medsos platform costs
  updatePlatformCosts: async (id, costsData) => {
    try {
      const response = await api.put(`/owner/medsos/platform-costs/${id}`, costsData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Delete medsos platform costs
  deletePlatformCosts: async (id) => {
    try {
      const response = await api.delete(`/owner/medsos/platform-costs/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // ===== SEARCH & FILTER FUNCTIONS =====
  // Search across all medsos data
  searchAll: async (query) => {
    try {
      const response = await api.get('/owner/medsos/search', { 
        params: { search: query } 
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get medsos data by platform
  getByPlatform: async (platform) => {
    try {
      const response = await api.get('/owner/medsos/platforms', { 
        params: { platform } 
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get medsos data by month
  getByMonth: async (month) => {
    try {
      const response = await api.get('/owner/medsos/by-month', { 
        params: { month } 
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // ===== STATISTICS & ANALYTICS =====
  // Get medsos statistics
  getStats: async () => {
    try {
      const response = await api.get('/owner/medsos/stats');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get follower growth data
  getFollowerGrowth: async (platform, months = 6) => {
    try {
      const response = await api.get('/owner/medsos/follower-growth', { 
        params: { platform, months } 
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  }
};
