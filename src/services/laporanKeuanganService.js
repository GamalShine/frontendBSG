import api from './api';
import { API_ENDPOINTS } from '../config/constants';

export const laporanKeuanganService = {
    // Get all laporan keuangan with pagination and filters
    async getAllLaporanKeuangan(page = 1, limit = 10, search = '', date = '', month = '') {
        try {
            const params = new URLSearchParams({
                page: page.toString(),
                limit: limit.toString()
            });

            if (search) params.append('search', search);
            if (date) params.append('date', date);
            if (month) params.append('month', month);

            const url = `${API_ENDPOINTS.LAPORAN_KEUANGAN.LIST}?${params}`;
            const response = await api.get(url);
            return response.data;
        } catch (error) {
            // Fallback frontend-only: jika backend mengembalikan 500 saat filter bulan,
            // kembalikan response kosong agar UI tetap jalan tanpa crash/toast berulang.
            const status = error?.response?.status;
            const requestedUrl = error?.config?.url || '';
            const isMonthQuery = requestedUrl.includes('month=') || !!month;
            if (status === 500 && isMonthQuery) {
                console.warn('Fallback: 500 pada /laporan-keuangan dengan month filter. Mengembalikan data kosong dari frontend. URL:', requestedUrl);
                const safePage = Number.isFinite(Number(page)) && Number(page) > 0 ? parseInt(page, 10) : 1;
                const safeLimit = Number.isFinite(Number(limit)) && Number(limit) > 0 ? parseInt(limit, 10) : 10;
                return {
                    success: true,
                    data: [],
                    pagination: {
                        currentPage: safePage,
                        totalPages: 0,
                        totalItems: 0,
                        itemsPerPage: safeLimit
                    }
                };
            }
            console.error('Error fetching laporan keuangan:', error);
            throw error;
        }
    },

    // Get available months (folder view)
    async getAvailableMonths() {
        try {
            const response = await api.get(`${API_ENDPOINTS.LAPORAN_KEUANGAN.LIST}/months`);
            return response.data;
        } catch (error) {
            console.error('Error fetching available months:', error);
            throw error;
        }
    },

    // Get laporan keuangan by ID
    async getLaporanKeuanganById(id) {
        try {
            const response = await api.get(API_ENDPOINTS.LAPORAN_KEUANGAN.BY_ID(id));
            return response.data;
        } catch (error) {
            console.error('Error fetching laporan keuangan by ID:', error);
            throw error;
        }
    },

    // Create new laporan keuangan
    async createLaporanKeuangan(data) {
        try {
            const response = await api.post(API_ENDPOINTS.LAPORAN_KEUANGAN.LIST, data);
            return response.data;
        } catch (error) {
            console.error('Error creating laporan keuangan:', error);
            throw error;
        }
    },

    // Update laporan keuangan
    async updateLaporanKeuangan(id, data) {
        try {
            const response = await api.put(API_ENDPOINTS.LAPORAN_KEUANGAN.BY_ID(id), data);
            return response.data;
        } catch (error) {
            console.error('Error updating laporan keuangan:', error);
            throw error;
        }
    },

    // Delete laporan keuangan
    async deleteLaporanKeuangan(id) {
        try {
            const response = await api.delete(API_ENDPOINTS.LAPORAN_KEUANGAN.BY_ID(id));
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
 