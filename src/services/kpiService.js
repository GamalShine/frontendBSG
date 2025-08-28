import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';

// Simplified KPI Service
export const kpiService = {
  // Get all KPIs
  getAllKPIs: async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/kpi`);
      return response.data;
    } catch (error) {
      console.error('Error fetching KPIs:', error);
      throw error;
    }
  },

  // Get KPIs by category
  getKPIsByCategory: async (category) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/kpi/category/${category}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching KPI ${category}:`, error);
      throw error;
    }
  },

  // Get KPI by ID
  getKPIById: async (id) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/kpi/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching KPI by ID:', error);
      throw error;
    }
  },

  // Create new KPI
  createKPI: async (data) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/kpi`, data);
      return response.data;
    } catch (error) {
      console.error('Error creating KPI:', error);
      throw error;
    }
  },

  // Update KPI
  updateKPI: async (id, data) => {
    try {
      const response = await axios.put(`${API_BASE_URL}/kpi/${id}`, data);
      return response.data;
    } catch (error) {
      console.error('Error updating KPI:', error);
      throw error;
    }
  },

  // Delete KPI
  deleteKPI: async (id) => {
    try {
      const response = await axios.delete(`${API_BASE_URL}/kpi/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting KPI:', error);
      throw error;
    }
  },

  // Upload KPI image (requires auth token)
  // Optional onProgress callback receives percentage (0-100)
  uploadKPIImage: async (file, onProgress) => {
    try {
      const token = localStorage.getItem('token');
      const formData = new FormData();
      formData.append('image', file);

      const response = await axios.post(`${API_BASE_URL}/upload/kpi`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        onUploadProgress: (event) => {
          if (!event || !event.total) return;
          const percent = Math.round((event.loaded * 100) / event.total);
          if (typeof onProgress === 'function') onProgress(percent);
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error uploading KPI image:', error);
      throw error;
    }
  }
};

// Utility functions
export const formatCurrency = (amount) => {
  if (!amount || amount === undefined || amount === null) {
    return '0';
  }
  if (amount >= 1000000000) {
    return `${(amount / 1000000000).toFixed(1)}B`;
  }
  if (amount >= 1000000) {
    return `${(amount / 1000000).toFixed(1)}M`;
  }
  return amount.toLocaleString();
};

export const getPerformanceGrade = (percentage) => {
  if (percentage >= 100) {
    return { grade: 'A', label: 'Sangat Baik', color: 'bg-green-500' };
  } else if (percentage >= 90) {
    return { grade: 'B', label: 'Baik', color: 'bg-blue-500' };
  } else if (percentage >= 75) {
    return { grade: 'C', label: 'Cukup', color: 'bg-yellow-500' };
  } else {
    return { grade: 'D', label: 'Kurang', color: 'bg-red-500' };
  }
};

export const getGradeColor = (grade) => {
  switch (grade) {
    case 'A':
      return 'bg-green-500';
    case 'B':
      return 'bg-blue-500';
    case 'C':
      return 'bg-yellow-500';
    case 'D':
      return 'bg-red-500';
    default:
      return 'bg-gray-500';
  }
};

export const getScoreRange = (grade) => {
  switch (grade) {
    case 'A':
      return '3.5 - 4.0';
    case 'B':
      return '2.5 - 3.4';
    case 'C':
      return '1.5 - 2.4';
    case 'D':
      return '0.0 - 1.4';
    default:
      return 'N/A';
  }
};
