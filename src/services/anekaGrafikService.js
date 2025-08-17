import api from './api';
import { API_ENDPOINTS } from '../config/constants';

export const anekaGrafikService = {
    // Get all aneka grafik with pagination and filters
    async getAllAnekaGrafik(page = 1, limit = 10, search = '', date = '') {
        try {
            const params = new URLSearchParams({
                page: page.toString(),
                limit: limit.toString()
            });

            if (search) params.append('search', search);
            if (date) params.append('date', date);

            const response = await api.get(`${API_ENDPOINTS.ANEKA_GRAFIK.LIST}?${params}`);
            return response.data;
        } catch (error) {
            console.error('Error fetching aneka grafik:', error);
            throw error;
        }
    },

    // Get aneka grafik by ID
    async getAnekaGrafikById(id) {
        try {
            const response = await api.get(`${API_ENDPOINTS.ANEKA_GRAFIK.DETAIL}/${id}`);
            return response.data;
        } catch (error) {
            console.error('Error fetching aneka grafik by ID:', error);
            throw error;
        }
    },

    // Create new aneka grafik
    async createAnekaGrafik(data) {
        try {
            const response = await api.post(API_ENDPOINTS.ANEKA_GRAFIK.LIST, data);
            return response.data;
        } catch (error) {
            console.error('Error creating aneka grafik:', error);
            throw error;
        }
    },

    // Update aneka grafik
    async updateAnekaGrafik(id, data) {
        try {
            const response = await api.put(`${API_ENDPOINTS.ANEKA_GRAFIK.DETAIL}/${id}`, data);
            return response.data;
        } catch (error) {
            console.error('Error updating aneka grafik:', error);
            throw error;
        }
    },

    // Delete aneka grafik
    async deleteAnekaGrafik(id) {
        try {
            const response = await api.delete(`${API_ENDPOINTS.ANEKA_GRAFIK.DETAIL}/${id}`);
            return response.data;
        } catch (error) {
            console.error('Error deleting aneka grafik:', error);
            throw error;
        }
    },

    // Get statistics
    async getStats() {
        try {
            const response = await api.get(API_ENDPOINTS.ANEKA_GRAFIK.STATS);
            return response.data;
        } catch (error) {
            console.error('Error fetching aneka grafik stats:', error);
            throw error;
        }
    },

    // Upload image files
    async uploadImages(files) {
        try {
            const formData = new FormData();
            files.forEach(file => {
                formData.append('images', file);
            });

            const response = await api.post(`${API_ENDPOINTS.ANEKA_GRAFIK.LIST}/upload`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
            return response.data;
        } catch (error) {
            console.error('Error uploading images:', error);
            throw error;
        }
    }
}; 