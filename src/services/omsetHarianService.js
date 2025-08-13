import api from './api';
import { API_ENDPOINTS } from '../config/constants';

export const omsetHarianService = {
    // Get all omset harian with pagination and filters
    async getAllOmsetHarian(page = 1, limit = 10, search = '', date = '') {
        try {
            const params = new URLSearchParams({
                page: page.toString(),
                limit: limit.toString()
            });

            if (search) params.append('search', search);
            if (date) params.append('date', date);

            const response = await api.get(`${API_ENDPOINTS.OMSET_HARIAN.LIST}?${params}`);
            return response.data;
        } catch (error) {
            console.error('Error fetching omset harian:', error);
            throw error;
        }
    },

    // Get omset harian by ID
    async getOmsetHarianById(id) {
        try {
            const response = await api.get(API_ENDPOINTS.OMSET_HARIAN.BY_ID(id));
            return response.data;
        } catch (error) {
            console.error('Error fetching omset harian by ID:', error);
            throw error;
        }
    },

    // Create new omset harian
    async createOmsetHarian(data) {
        try {
            const response = await api.post(API_ENDPOINTS.OMSET_HARIAN.LIST, data);
            return response.data;
        } catch (error) {
            console.error('Error creating omset harian:', error);
            throw error;
        }
    },

    // Update omset harian
    async updateOmsetHarian(id, data) {
        try {
            const response = await api.put(API_ENDPOINTS.OMSET_HARIAN.BY_ID(id), data);
            return response.data;
        } catch (error) {
            console.error('Error updating omset harian:', error);
            throw error;
        }
    },

    // Delete omset harian
    async deleteOmsetHarian(id) {
        try {
            const response = await api.delete(API_ENDPOINTS.OMSET_HARIAN.BY_ID(id));
            return response.data;
        } catch (error) {
            console.error('Error deleting omset harian:', error);
            throw error;
        }
    },

    // Get statistics
    async getStats() {
        try {
            const response = await api.get('/omset-harian/stats/overview');
            return response.data;
        } catch (error) {
            console.error('Error fetching stats:', error);
            throw error;
        }
    }
}; 