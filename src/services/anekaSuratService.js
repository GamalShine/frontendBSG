import api from './api';

export const anekaSuratService = {
  // Get all aneka surat
  getAllAnekaSurat: async () => {
    try {
      const response = await api.get('/admin/aneka-surat');
      return response.data;
    } catch (error) {
      console.error('Error fetching aneka surat:', error);
      throw error;
    }
  },

  // Get aneka surat by ID
  getAnekaSuratById: async (id) => {
    try {
      const response = await api.get(`/admin/aneka-surat/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching aneka surat by ID:', error);
      throw error;
    }
  },

  // Get aneka surat by type
  getAnekaSuratByType: async (type) => {
    try {
      const response = await api.get(`/admin/aneka-surat/type/${type}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching aneka surat by type:', error);
      throw error;
    }
  },

  // Get document types
  getDocumentTypes: async () => {
    try {
      const response = await api.get('/admin/aneka-surat/document-types');
      return response.data;
    } catch (error) {
      console.error('Error fetching document types:', error);
      throw error;
    }
  },

  // Create new aneka surat
  createAnekaSurat: async (formData) => {
    try {
      const response = await api.post('/admin/aneka-surat', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      console.error('Error creating aneka surat:', error);
      throw error;
    }
  },

  // Update aneka surat
  updateAnekaSurat: async (id, formData) => {
    try {
      const response = await api.put(`/admin/aneka-surat/${id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      console.error('Error updating aneka surat:', error);
      throw error;
    }
  },

  // Delete aneka surat
  deleteAnekaSurat: async (id) => {
    try {
      const response = await api.delete(`/admin/aneka-surat/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting aneka surat:', error);
      throw error;
    }
  },

  // Download attachment
  downloadAttachment: async (filename) => {
    try {
      const response = await api.get(`/admin/aneka-surat/download/${filename}`, {
        responseType: 'blob',
      });
      return response.data;
    } catch (error) {
      console.error('Error downloading attachment:', error);
      throw error;
    }
  },

  // Get aneka surat for specific user
  getUserAnekaSurat: async (userId) => {
    try {
      const response = await api.get(`/admin/aneka-surat/user/${userId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching user aneka surat:', error);
      throw error;
    }
  }
};
