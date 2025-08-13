import api from './api';

export const laporanKeuanganService = {
    // Get all laporan keuangan with pagination and filters
    async getAllLaporanKeuangan(page = 1, limit = 10, search = '', date = '') {
        try {
            const params = new URLSearchParams({
                page: page.toString(),
                limit: limit.toString()
            });

            if (search) params.append('search', search);
            if (date) params.append('date', date);

            const response = await api.get(`/laporan-keuangan?${params}`);
            return response.data;
        } catch (error) {
            console.error('Error fetching laporan keuangan:', error);
            throw error;
        }
    },

    // Get laporan keuangan by ID
    async getLaporanKeuanganById(id) {
        try {
            const response = await api.get(`/laporan-keuangan/${id}`);
            return response.data;
        } catch (error) {
            console.error('Error fetching laporan keuangan by ID:', error);
            throw error;
        }
    },

    // Create new laporan keuangan
    async createLaporanKeuangan(data) {
        try {
            const response = await api.post('/laporan-keuangan', data);
            return response.data;
        } catch (error) {
            console.error('Error creating laporan keuangan:', error);
            throw error;
        }
    },

    // Update laporan keuangan
    async updateLaporanKeuangan(id, data) {
        try {
            const response = await api.put(`/laporan-keuangan/${id}`, data);
            return response.data;
        } catch (error) {
            console.error('Error updating laporan keuangan:', error);
            throw error;
        }
    },

    // Delete laporan keuangan
    async deleteLaporanKeuangan(id) {
        try {
            const response = await api.delete(`/laporan-keuangan/${id}`);
            return response.data;
        } catch (error) {
            console.error('Error deleting laporan keuangan:', error);
            throw error;
        }
    },

    // Get statistics
    async getStats() {
        try {
            const response = await api.get('/laporan-keuangan/stats/overview');
            return response.data;
        } catch (error) {
            console.error('Error fetching stats:', error);
            throw error;
        }
    }
}; 