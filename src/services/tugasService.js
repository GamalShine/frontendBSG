import api from './api'
import { API_ENDPOINTS } from '../config/constants'

export const tugasService = {
    // Get all tasks
    async getTugas(params = {}) {
        try {
            const response = await api.get(API_ENDPOINTS.TASKS.LIST, { params })
            return response.data
        } catch (error) {
            throw error.response?.data || error.message
        }
    },

    // Get task by ID
    async getTugasById(id) {
        try {
            const response = await api.get(API_ENDPOINTS.TASKS.BY_ID(id))
            return response.data
        } catch (error) {
            throw error.response?.data || error.message
        }
    },

    // Create new task
    async createTugas(tugasData) {
        try {
            const response = await api.post(API_ENDPOINTS.TASKS.LIST, tugasData)
            return response.data
        } catch (error) {
            throw error.response?.data || error.message
        }
    },

    // Update task
    async updateTugas(id, tugasData) {
        try {
            const response = await api.put(API_ENDPOINTS.TASKS.BY_ID(id), tugasData)
            return response.data
        } catch (error) {
            throw error.response?.data || error.message
        }
    },

    // Delete task
    async deleteTugas(id) {
        try {
            const response = await api.delete(API_ENDPOINTS.TASKS.BY_ID(id))
            return response.data
        } catch (error) {
            throw error.response?.data || error.message
        }
    },

    // Get tasks by status
    async getTugasByStatus(status, params = {}) {
        try {
            const response = await api.get(`${API_ENDPOINTS.TASKS.LIST}/status/${status}`, { params })
            return response.data
        } catch (error) {
            throw error.response?.data || error.message
        }
    },

    // Get tasks by user
    async getTugasByUser(userId, params = {}) {
        try {
            const response = await api.get(`${API_ENDPOINTS.TASKS.LIST}/user/${userId}`, { params })
            return response.data
        } catch (error) {
            throw error.response?.data || error.message
        }
    },

    // Admin specific endpoints
    async getAdminTugas(params = {}) {
        try {
            const response = await api.get('/admin-tugas', { params })
            return response.data
        } catch (error) {
            throw error.response?.data || error.message
        }
    },

    async getAdminTugasById(id) {
        try {
            const response = await api.get(`/admin-tugas/${id}`)
            return response.data
        } catch (error) {
            throw error.response?.data || error.message
        }
    },

    async getAdminTugasStats(params = {}) {
        try {
            const response = await api.get('/admin-tugas/stats', { params })
            return response.data
        } catch (error) {
            throw error.response?.data || error.message
        }
    }
}

// Admin Tugas Service for backward compatibility
export const adminTugasService = {
    // Get all admin tugas
    async getAdminTugas(params = {}) {
        try {
            const response = await api.get('/admin-tugas', { params })
            return response.data
        } catch (error) {
            throw error.response?.data || error.message
        }
    },

    // Get admin tugas by ID
    async getAdminTugasById(id) {
        try {
            const response = await api.get(`/admin-tugas/${id}`)
            return response.data
        } catch (error) {
            throw error.response?.data || error.message
        }
    },

    // Get admin tugas stats
    async getAdminTugasStats(params = {}) {
        try {
            const response = await api.get('/admin-tugas/stats', { params })
            return response.data
        } catch (error) {
            throw error.response?.data || error.message
        }
    },

    // Update tugas by admin
    async updateTugasByAdmin(id, tugasData) {
        try {
            const response = await api.put(`/admin-tugas/${id}`, tugasData)
            return response.data
        } catch (error) {
            throw error.response?.data || error.message
        }
    },

    // Delete tugas by admin
    async deleteTugasByAdmin(id) {
        try {
            const response = await api.delete(`/admin-tugas/${id}`)
            return response.data
        } catch (error) {
            throw error.response?.data || error.message
        }
    },

    // Create tugas by admin
    async createTugasByAdmin(tugasData) {
        try {
            const response = await api.post('/admin-tugas', tugasData)
            return response.data
        } catch (error) {
            throw error.response?.data || error.message
        }
    }
} 