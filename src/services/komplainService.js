import api from './api'
import { API_ENDPOINTS } from '../config/constants'

export const komplainService = {
    // Get all complaints
    async getKomplain(params = {}) {
        try {
            const response = await api.get(API_ENDPOINTS.COMPLAINTS.LIST, { params })
            return response.data
        } catch (error) {
            throw error.response?.data || error.message
        }
    },

    // Get complaint by ID
    async getKomplainById(id) {
        try {
            const response = await api.get(API_ENDPOINTS.COMPLAINTS.BY_ID(id))
            return response.data
        } catch (error) {
            throw error.response?.data || error.message
        }
    },

    // Create new complaint
    async createKomplain(komplainData) {
        try {
            const response = await api.post(API_ENDPOINTS.COMPLAINTS.LIST, komplainData)
            return response.data
        } catch (error) {
            throw error.response?.data || error.message
        }
    },

    // Update complaint
    async updateKomplain(id, komplainData) {
        try {
            const response = await api.put(API_ENDPOINTS.COMPLAINTS.BY_ID(id), komplainData)
            return response.data
        } catch (error) {
            throw error.response?.data || error.message
        }
    },

    // Delete complaint
    async deleteKomplain(id) {
        try {
            const response = await api.delete(API_ENDPOINTS.COMPLAINTS.BY_ID(id))
            return response.data
        } catch (error) {
            throw error.response?.data || error.message
        }
    },

    // Get komplain by status
    async getKomplainByStatus(status, params = {}) {
        try {
            const response = await api.get(`/daftar-komplain/status/${status}`, { params })
            return response.data
        } catch (error) {
            throw error.response?.data || error.message
        }
    },

    // Get komplain by user
    async getKomplainByUser(userId, params = {}) {
        try {
            const response = await api.get(`/daftar-komplain/user/${userId}`, { params })
            return response.data
        } catch (error) {
            throw error.response?.data || error.message
        }
    }
}

export const adminKomplainService = {
    // Get all komplain for admin
    async getAdminKomplain(params = {}) {
        try {
            const response = await api.get('/admin/komplain', { params })
            return response.data
        } catch (error) {
            throw error.response?.data || error.message
        }
    },

    // Get all komplain for admin (alias)
    async getAdminKomplains(params = {}) {
        try {
            const response = await api.get('/admin/komplain', { params })
            return response.data
        } catch (error) {
            throw error.response?.data || error.message
        }
    },

    // Get komplain by ID for admin
    async getAdminKomplainById(id) {
        try {
            const response = await api.get(`/admin/komplain/${id}`)
            return response.data
        } catch (error) {
            throw error.response?.data || error.message
        }
    },

    // Get komplain statistics
    async getKomplainStats(params = {}) {
        try {
            const response = await api.get('/admin/komplain/stats', { params })
            return response.data
        } catch (error) {
            throw error.response?.data || error.message
        }
    },

    // Update komplain status
    async updateKomplainStatus(komplainId, status) {
        try {
            const response = await api.put(`/admin/komplain/${komplainId}/status`, { status })
            return response.data
        } catch (error) {
            throw error.response?.data || error.message
        }
    },

    // Assign komplain to admin
    async assignKomplain(komplainId, adminId) {
        try {
            const response = await api.put(`/admin/komplain/${komplainId}/assign`, { admin_id: adminId })
            return response.data
        } catch (error) {
            throw error.response?.data || error.message
        }
    },

    // Delete komplain
    async deleteKomplain(komplainId) {
        try {
            const response = await api.delete(`/admin/komplain/${komplainId}`)
            return response.data
        } catch (error) {
            throw error.response?.data || error.message
        }
    }
} 