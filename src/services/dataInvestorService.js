import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';

// Admin Data Investor Service (CRUD)
export const dataInvestorService = {
  getAllDataInvestor: async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_BASE_URL}/admin/data-investor`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching data investor:', error);
      throw error;
    }
  },

  getDataInvestorById: async (id) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_BASE_URL}/admin/data-investor/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching data investor by ID:', error);
      throw error;
    }
  },

  createDataInvestor: async (data) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(`${API_BASE_URL}/admin/data-investor`, data, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    } catch (error) {
      console.error('Error creating data investor:', error);
      throw error;
    }
  },

  updateDataInvestor: async (id, data) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.put(`${API_BASE_URL}/admin/data-investor/${id}`, data, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    } catch (error) {
      console.error('Error updating data investor:', error);
      throw error;
    }
  },

  deleteDataInvestor: async (id) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.delete(`${API_BASE_URL}/admin/data-investor/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    } catch (error) {
      console.error('Error deleting data investor:', error);
      throw error;
    }
  },

  getDataInvestorByTipe: async (tipe) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_BASE_URL}/admin/data-investor/tipe/${tipe}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching data investor by tipe:', error);
      throw error;
    }
  },

  getDataInvestorByOutlet: async (outlet) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_BASE_URL}/admin/data-investor/outlet/${outlet}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching data investor by outlet:', error);
      throw error;
    }
  },

  getUniqueOutlets: async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_BASE_URL}/admin/data-investor/outlets`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching unique outlets:', error);
      throw error;
    }
  },

  searchDataInvestor: async (searchTerm) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_BASE_URL}/admin/data-investor/search?q=${searchTerm}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    } catch (error) {
      console.error('Error searching data investor:', error);
      throw error;
    }
  }
};

// Owner Data Investor Service (Read-only)
export const ownerDataInvestorService = {
  getAllDataInvestor: async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_BASE_URL}/owner/data-investor`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching data investor:', error);
      throw error;
    }
  },

  getDataInvestorById: async (id) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_BASE_URL}/owner/data-investor/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching data investor by ID:', error);
      throw error;
    }
  },

  getDataInvestorByTipe: async (tipe) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_BASE_URL}/owner/data-investor/tipe/${tipe}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching data investor by tipe:', error);
      throw error;
    }
  },

  getDataInvestorByOutlet: async (outlet) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_BASE_URL}/owner/data-investor/outlet/${outlet}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching data investor by outlet:', error);
      throw error;
    }
  },

  getUniqueOutlets: async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_BASE_URL}/owner/data-investor/outlets`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching unique outlets:', error);
      throw error;
    }
  },

  searchDataInvestor: async (searchTerm) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_BASE_URL}/owner/data-investor/search?q=${searchTerm}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    } catch (error) {
      console.error('Error searching data investor:', error);
      throw error;
    }
  }
};
