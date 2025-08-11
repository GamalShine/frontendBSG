import api from './api'

export const tugasService = {
    // Get all tugas
    async getTugas(params = {}) {
        try {
            const response = await api.get('/daftar-tugas', { params })
            return response.data
        } catch (error) {
            throw error.response?.data || error.message
        }
    },

    // Get tugas by ID
    async getTugasById(id) {
        try {
            const response = await api.get(`/daftar-tugas/${id}`)
            return response.data
        } catch (error) {
            throw error.response?.data || error.message
        }
    },

    // Create new tugas
    async createTugas(tugasData) {
        try {
            const response = await api.post('/daftar-tugas', tugasData)
            return response.data
        } catch (error) {
            throw error.response?.data || error.message
        }
    },

    // Update tugas
    async updateTugas(id, tugasData) {
        try {
            const response = await api.put(`/daftar-tugas/${id}`, tugasData)
            return response.data
        } catch (error) {
            throw error.response?.data || error.message
        }
    },

    // Delete tugas
    async deleteTugas(id) {
        try {
            const response = await api.delete(`/daftar-tugas/${id}`)
            return response.data
        } catch (error) {
            throw error.response?.data || error.message
        }
    },

    // Get tugas by status
    async getTugasByStatus(status, params = {}) {
        try {
            const response = await api.get(`/daftar-tugas/status/${status}`, { params })
            return response.data
        } catch (error) {
            throw error.response?.data || error.message
        }
    },

    // Get tugas by user
    async getTugasByUser(userId, params = {}) {
        try {
            const response = await api.get(`/daftar-tugas/user/${userId}`, { params })
            return response.data
        } catch (error) {
            throw error.response?.data || error.message
        }
    }
}

export const adminTugasService = {
    // Get all tugas for admin
    async getAdminTugas(params = {}) {
        try {
            const response = await api.get('/admin-tugas', { params })
            return response.data
        } catch (error) {
            throw error.response?.data || error.message
        }
    },

    // Get tugas by ID for admin
    async getAdminTugasById(id) {
        try {
            const response = await api.get(`/admin-tugas/${id}`)
            return response.data
        } catch (error) {
            throw error.response?.data || error.message
        }
    },

    // Get tugas statistics
    async getTugasStats(params = {}) {
        try {
            const response = await api.get('/admin-tugas/stats', { params })
            return response.data
        } catch (error) {
            throw error.response?.data || error.message
        }
    },

    // Update tugas status
    async updateTugasStatus(tugasId, status) {
        try {
            const response = await api.put(`/admin-tugas/${tugasId}/status`, { status })
            return response.data
        } catch (error) {
            throw error.response?.data || error.message
        }
    },

    // Update tugas by admin
    async updateTugasByAdmin(tugasId, tugasData) {
        try {
            const response = await api.put(`/admin-tugas/${tugasId}`, tugasData)
            return response.data
        } catch (error) {
            throw error.response?.data || error.message
        }
    },

    // Assign tugas to user
    async assignTugas(tugasId, userId) {
        try {
            const response = await api.put(`/admin-tugas/${tugasId}/assign`, { user_id: userId })
            return response.data
        } catch (error) {
            throw error.response?.data || error.message
        }
    },

    // Delete tugas
    async deleteTugas(tugasId) {
        try {
            const response = await api.delete(`/admin-tugas/${tugasId}`)
            return response.data
        } catch (error) {
            throw error.response?.data || error.message
        }
    }
} 