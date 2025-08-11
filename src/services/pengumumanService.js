import api from './api'

export const pengumumanService = {
    // Get all pengumuman
    async getPengumuman(params = {}) {
        try {
            const response = await api.get('/pengumuman', { params })
            return response.data
        } catch (error) {
            throw error.response?.data || error.message
        }
    },

    // Get pengumuman by ID
    async getPengumumanById(id) {
        try {
            const response = await api.get(`/pengumuman/${id}`)
            return response.data
        } catch (error) {
            throw error.response?.data || error.message
        }
    },

    // Create new pengumuman
    async createPengumuman(pengumumanData) {
        try {
            const response = await api.post('/pengumuman', pengumumanData)
            return response.data
        } catch (error) {
            throw error.response?.data || error.message
        }
    },

    // Update pengumuman
    async updatePengumuman(id, pengumumanData) {
        try {
            const response = await api.put(`/pengumuman/${id}`, pengumumanData)
            return response.data
        } catch (error) {
            throw error.response?.data || error.message
        }
    },

    // Delete pengumuman
    async deletePengumuman(id) {
        try {
            const response = await api.delete(`/pengumuman/${id}`)
            return response.data
        } catch (error) {
            throw error.response?.data || error.message
        }
    },

    // Get active pengumuman
    async getActivePengumuman(params = {}) {
        try {
            const response = await api.get('/pengumuman/active', { params })
            return response.data
        } catch (error) {
            throw error.response?.data || error.message
        }
    },

    // Get pengumuman by priority
    async getPengumumanByPriority(priority, params = {}) {
        try {
            const response = await api.get(`/pengumuman/priority/${priority}`, { params })
            return response.data
        } catch (error) {
            throw error.response?.data || error.message
        }
    }
}

export const adminPengumumanService = {
    // Get all pengumuman for admin
    async getAdminPengumuman(params = {}) {
        try {
            const response = await api.get('/admin/pengumuman', { params })
            return response.data
        } catch (error) {
            throw error.response?.data || error.message
        }
    },

    // Create pengumuman as admin
    async createAdminPengumuman(pengumumanData) {
        try {
            const response = await api.post('/admin/pengumuman', pengumumanData)
            return response.data
        } catch (error) {
            throw error.response?.data || error.message
        }
    },

    // Update pengumuman as admin
    async updateAdminPengumuman(id, pengumumanData) {
        try {
            const response = await api.put(`/admin/pengumuman/${id}`, pengumumanData)
            return response.data
        } catch (error) {
            throw error.response?.data || error.message
        }
    },

    // Delete pengumuman as admin
    async deleteAdminPengumuman(id) {
        try {
            const response = await api.delete(`/admin/pengumuman/${id}`)
            return response.data
        } catch (error) {
            throw error.response?.data || error.message
        }
    },

    // Get pengumuman statistics
    async getPengumumanStats(params = {}) {
        try {
            const response = await api.get('/admin/pengumuman/stats', { params })
            return response.data
        } catch (error) {
            throw error.response?.data || error.message
        }
    }
} 