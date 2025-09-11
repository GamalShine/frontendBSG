import axios from 'axios';
import { API_CONFIG } from '../config/constants.js';

const API_BASE_URL = API_CONFIG.BASE_URL;

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

  createWithAttachments: async (data, files) => {
    try {
      const token = localStorage.getItem('token');
      const form = new FormData();
      // append text fields
      Object.entries(data || {}).forEach(([k, v]) => {
        if (v !== undefined && v !== null) form.append(k, v);
      });
      // append files
      [...(files || [])].forEach(f => form.append('files', f));
      const response = await axios.post(`${API_BASE_URL}/admin/data-investor`, form, {
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' }
      });
      return response.data;
    } catch (error) {
      console.error('Error creating data investor with attachments:', error);
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
  },

  // Lampiran (Admin only)
  listLampiran: async (id) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_BASE_URL}/admin/data-investor/${id}/lampiran`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    } catch (error) {
      console.error('Error listing lampiran:', error);
      throw error;
    }
  },

  uploadLampiran: async (id, files) => {
    try {
      const token = localStorage.getItem('token');
      const form = new FormData();
      [...files].forEach(f => form.append('files', f));
      const response = await axios.post(`${API_BASE_URL}/admin/data-investor/${id}/lampiran`, form, {
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' }
      });
      return response.data;
    } catch (error) {
      console.error('Error uploading lampiran:', error);
      throw error;
    }
  },

  deleteLampiran: async (id, stored_name) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.delete(`${API_BASE_URL}/admin/data-investor/${id}/lampiran`, {
        headers: { Authorization: `Bearer ${token}` },
        data: { stored_name }
      });
      return response.data;
    } catch (error) {
      console.error('Error deleting lampiran:', error);
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
