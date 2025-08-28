import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';

// Get auth token helper
const getAuthToken = () => {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

// KPI Service with photo upload support
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

  // Create new KPI with optional photo upload
  createKPI: async (data, photoFile = null) => {
    try {
      let photoUrl = '';
      
      // First upload photo if provided
      if (photoFile) {
        console.log('📸 Uploading KPI photo...');
        const uploadResponse = await kpiService.uploadKPIImage(photoFile);
        if (uploadResponse.success) {
          photoUrl = uploadResponse.data.url;
          console.log('✅ Photo uploaded successfully:', photoUrl);
        } else {
          throw new Error('Failed to upload photo');
        }
      }
      
      // Create KPI with photo URL
      const kpiData = {
        ...data,
        photo_url: photoUrl
      };
      
      console.log('📝 Creating KPI with data:', kpiData);
      const response = await axios.post(`${API_BASE_URL}/kpi`, kpiData);
      return response.data;
    } catch (error) {
      console.error('Error creating KPI:', error);
      throw error;
    }
  },

  // Update KPI with optional photo upload
  updateKPI: async (id, data, photoFile = null) => {
    try {
      let photoUrl = data.photo_url || '';
      
      // Upload new photo if provided
      if (photoFile) {
        console.log('📸 Uploading new KPI photo...');
        const uploadResponse = await kpiService.uploadKPIImage(photoFile);
        if (uploadResponse.success) {
          photoUrl = uploadResponse.data.url;
          console.log('✅ New photo uploaded successfully:', photoUrl);
        } else {
          throw new Error('Failed to upload new photo');
        }
      }
      
      // Update KPI with photo URL
      const kpiData = {
        ...data,
        photo_url: photoUrl
      };
      
      console.log('📝 Updating KPI with data:', kpiData);
      const response = await axios.put(`${API_BASE_URL}/kpi/${id}`, kpiData);
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
      console.log('📤 Starting KPI image upload...', {
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type
      });
      
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Authentication token not found');
      }
      
      const formData = new FormData();
      formData.append('image', file);

      const response = await axios.post(`${API_BASE_URL}/upload/kpi`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}`
        },
        onUploadProgress: (event) => {
          if (!event || !event.total) return;
          const percent = Math.round((event.loaded * 100) / event.total);
          console.log(`📊 Upload progress: ${percent}%`);
          if (typeof onProgress === 'function') onProgress(percent);
        }
      });
      
      console.log('✅ KPI image upload response:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Error uploading KPI image:', error.response?.data || error.message);
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
