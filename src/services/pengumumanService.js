import api from './api'
import { API_ENDPOINTS } from '../config/constants'

export const pengumumanService = {
    // Get all announcements
    async getPengumuman(params = {}) {
        try {
            const response = await api.get(API_ENDPOINTS.ANNOUNCEMENTS.LIST, { params })
            return response.data
        } catch (error) {
            throw error.response?.data || error.message
        }
    },

    // Get announcement by ID
    async getPengumumanById(id) {
        try {
            const response = await api.get(API_ENDPOINTS.ANNOUNCEMENTS.BY_ID(id))
            return response.data
        } catch (error) {
            throw error.response?.data || error.message
        }
    },

    // Create new announcement
    async createPengumuman(pengumumanData) {
        try {
            const response = await api.post(API_ENDPOINTS.ANNOUNCEMENTS.LIST, pengumumanData)
            return response.data
        } catch (error) {
            throw error.response?.data || error.message
        }
    },

    // Update announcement
    async updatePengumuman(id, pengumumanData) {
        try {
            const response = await api.put(API_ENDPOINTS.ANNOUNCEMENTS.BY_ID(id), pengumumanData)
            return response.data
        } catch (error) {
            throw error.response?.data || error.message
        }
    },

    // Delete announcement
    async deletePengumuman(id) {
        try {
            const response = await api.delete(API_ENDPOINTS.ANNOUNCEMENTS.BY_ID(id))
            return response.data
        } catch (error) {
            throw error.response?.data || error.message
        }
    },

    // Get active announcements
    async getActivePengumuman(params = {}) {
        try {
            const response = await api.get(`${API_ENDPOINTS.ANNOUNCEMENTS.LIST}/active`, { params })
            return response.data
        } catch (error) {
            throw error.response?.data || error.message
        }
    },

    // Get announcements by priority
    async getPengumumanByPriority(priority, params = {}) {
        try {
            const response = await api.get(`${API_ENDPOINTS.ANNOUNCEMENTS.LIST}/priority/${priority}`, { params })
            return response.data
        } catch (error) {
            throw error.response?.data || error.message
        }
    },

    // Admin specific endpoints
    async getAdminPengumuman(params = {}) {
        try {
            const response = await api.get('/admin/pengumuman', { params })
            return response.data
        } catch (error) {
            throw error.response?.data || error.message
        }
    },

    async createAdminPengumuman(pengumumanData) {
        try {
            const response = await api.post('/admin/pengumuman', pengumumanData)
            return response.data
        } catch (error) {
            throw error.response?.data || error.message
        }
    },

    async updateAdminPengumuman(id, pengumumanData) {
        try {
            const response = await api.put(`/admin/pengumuman/${id}`, pengumumanData)
            return response.data
        } catch (error) {
            throw error.response?.data || error.message
        }
    },

    async deleteAdminPengumuman(id) {
        try {
            const response = await api.delete(`/admin/pengumuman/${id}`)
            return response.data
        } catch (error) {
            throw error.response?.data || error.message
        }
    },

    async getAdminPengumumanStats(params = {}) {
        try {
            const response = await api.get('/admin/pengumuman/stats', { params })
            return response.data
        } catch (error) {
            throw error.response?.data || error.message
        }
    }
} 