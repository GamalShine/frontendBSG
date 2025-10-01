import api from './api';
import { API_ENDPOINTS } from '../config/constants';

export const anekaGrafikService = {
    // Get all aneka grafik with pagination and filters (Admin)
    async getAllAnekaGrafik(page = 1, limit = 10, search = '', date = '') {
        try {
            const params = new URLSearchParams({
                page: page.toString(),
                limit: limit.toString()
            });

            if (search) params.append('search', search);
            if (date) params.append('date', date);

            const response = await api.get(`${API_ENDPOINTS.ANEKA_GRAFIK.ADMIN.LIST}?${params}`);
            return response.data;
        } catch (error) {
            console.error('Error fetching aneka grafik:', error);
            throw error;
        }
    },

    // Get aneka grafik by ID (Admin)
    async getAnekaGrafikById(id) {
        try {
            const response = await api.get(`${API_ENDPOINTS.ANEKA_GRAFIK.ADMIN.DETAIL}/${id}`);
            return response.data;
        } catch (error) {
            console.error('Error fetching aneka grafik by ID:', error);
            throw error;
        }
    },

    // Create new aneka grafik (Admin)
    async createAnekaGrafik(data) {
        try {
            const response = await api.post(API_ENDPOINTS.ANEKA_GRAFIK.ADMIN.LIST, data);
            return response.data;
        } catch (error) {
            console.error('Error creating aneka grafik:', error);
            throw error;
        }
    },

    // Update aneka grafik (Admin)
    async updateAnekaGrafik(id, data) {
        try {
            const response = await api.put(`${API_ENDPOINTS.ANEKA_GRAFIK.ADMIN.DETAIL}/${id}`, data);
            return response.data;
        } catch (error) {
            console.error('Error updating aneka grafik:', error);
            throw error;
        }
    },

    // Delete aneka grafik (Admin)
    async deleteAnekaGrafik(id) {
        try {
            const response = await api.delete(`${API_ENDPOINTS.ANEKA_GRAFIK.ADMIN.DETAIL}/${id}`);
            return response.data;
        } catch (error) {
            console.error('Error deleting aneka grafik:', error);
            throw error;
        }
    },

    // Get statistics
    async getStats() {
        try {
            const response = await api.get(API_ENDPOINTS.ANEKA_GRAFIK.ADMIN.STATS);
            return response.data;
        } catch (error) {
            console.error('Error fetching aneka grafik stats:', error);
            throw error;
        }
    },

    // Upload image files (Admin)
    async uploadImages(files) {
        try {
            console.log('🔄 Starting upload for files:', files.length);
            const formData = new FormData();
            files.forEach(file => {
                formData.append('images', file);
                console.log('📁 Appending file:', file.name, 'size:', file.size, 'type:', file.type);
            });

            console.log('📤 Uploading to:', `${API_ENDPOINTS.ANEKA_GRAFIK.ADMIN.LIST}/upload`);
            const response = await api.post(`${API_ENDPOINTS.ANEKA_GRAFIK.ADMIN.LIST}/upload`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                },
                timeout: 60000 // 60 seconds timeout for upload
            });
            
            console.log('📥 Upload response:', response.data);
            
            if (response.data.success) {
                return response.data;
            } else {
                throw new Error(response.data.error || 'Upload gagal');
            }
        } catch (error) {
            console.error('❌ Error uploading images:', error);
            
            // Handle different types of errors
            if (error.response) {
                // Server responded with error status
                const errorMessage = error.response.data?.error || error.response.data?.message || 'Upload gagal';
                throw new Error(errorMessage);
            } else if (error.request) {
                // Request was made but no response received
                throw new Error('Tidak ada response dari server. Cek koneksi internet Anda.');
            } else {
                // Something else happened
                throw new Error(error.message || 'Upload gagal');
            }
        }
    }
};

// Owner Aneka Grafik Service (Read-only)
export const ownerAnekaGrafikService = {
    // Get all aneka grafik (Owner - Read-only)
    async getAllAnekaGrafik(page = 1, limit = 10, search = '', date = '') {
        try {
            const params = new URLSearchParams({
                page: page.toString(),
                limit: limit.toString()
            });

            if (search) params.append('search', search);
            if (date) params.append('date', date);

            const response = await api.get(`${API_ENDPOINTS.ANEKA_GRAFIK.OWNER.LIST}?${params}`);
            return response.data;
        } catch (error) {
            console.error('Error fetching aneka grafik:', error);
            throw error;
        }
    },

    // Get aneka grafik by ID (Owner - Read-only)
    async getAnekaGrafikById(id) {
        try {
            const response = await api.get(`${API_ENDPOINTS.ANEKA_GRAFIK.OWNER.DETAIL}/${id}`);
            return response.data;
        } catch (error) {
            console.error('Error fetching aneka grafik by ID:', error);
            throw error;
        }
    },

    // Get aneka grafik by category (Owner - Read-only)
    async getAnekaGrafikByCategory(category) {
        try {
            const response = await api.get(`${API_ENDPOINTS.ANEKA_GRAFIK.OWNER.LIST}/category/${category}`);
            return response.data;
        } catch (error) {
            console.error('Error fetching aneka grafik by category:', error);
            throw error;
        }
    },

    // Get statistics (Owner - Read-only)
    async getStats() {
        try {
            const response = await api.get(API_ENDPOINTS.ANEKA_GRAFIK.OWNER.STATS);
            return response.data;
        } catch (error) {
            console.error('Error fetching aneka grafik stats:', error);
            throw error;
        }
    }
}; 