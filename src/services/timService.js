import api from './api'

export const timService = {
    // Get all tim merah
    async getTimMerah(params = {}) {
        try {
            const response = await api.get('/tim-merah-biru/merah', { params })
            return response.data
        } catch (error) {
            throw error.response?.data || error.message
        }
    },

    // Get tim merah by ID
    async getTimMerahById(id) {
        try {
            const response = await api.get(`/tim-merah-biru/merah/${id}`)
            return response.data
        } catch (error) {
            throw error.response?.data || error.message
        }
    },

    // Create new tim merah
    async createTimMerah(timData) {
        try {
            const response = await api.post('/tim-merah-biru/merah', timData)
            return response.data
        } catch (error) {
            throw error.response?.data || error.message
        }
    },

    // Update tim merah
    async updateTimMerah(id, timData) {
        try {
            const response = await api.put(`/tim-merah-biru/merah/${id}`, timData)
            return response.data
        } catch (error) {
            throw error.response?.data || error.message
        }
    },

    // Delete tim merah
    async deleteTimMerah(id) {
        try {
            const response = await api.delete(`/tim-merah-biru/merah/${id}`)
            return response.data
        } catch (error) {
            throw error.response?.data || error.message
        }
    },

    // Get all tim biru
    async getTimBiru(params = {}) {
        try {
            const response = await api.get('/tim-merah-biru/biru', { params })
            return response.data
        } catch (error) {
            throw error.response?.data || error.message
        }
    },

    // Get tim biru by ID
    async getTimBiruById(id) {
        try {
            const response = await api.get(`/tim-merah-biru/biru/${id}`)
            return response.data
        } catch (error) {
            throw error.response?.data || error.message
        }
    },

    // Get tim biru detail (alias for getTimBiruById)
    async getTimBiruDetail(id) {
        try {
            const response = await api.get(`/tim-merah-biru/biru/${id}`)
            return response.data
        } catch (error) {
            throw error.response?.data || error.message
        }
    },

    // Create new tim biru
    async createTimBiru(timData) {
        try {
            const response = await api.post('/tim-merah-biru/biru', timData)
            return response.data
        } catch (error) {
            throw error.response?.data || error.message
        }
    },

    // Update tim biru
    async updateTimBiru(id, timData) {
        try {
            const response = await api.put(`/tim-merah-biru/biru/${id}`, timData)
            return response.data
        } catch (error) {
            throw error.response?.data || error.message
        }
    },

    // Delete tim biru
    async deleteTimBiru(id) {
        try {
            const response = await api.delete(`/tim-merah-biru/biru/${id}`)
            return response.data
        } catch (error) {
            throw error.response?.data || error.message
        }
    },

    // Get tim merah detail (alias for getTimMerahById)
    async getTimMerahDetail(id) {
        try {
            const response = await api.get(`/tim-merah-biru/merah/${id}`)
            return response.data
        } catch (error) {
            throw error.response?.data || error.message
        }
    }
}

export const ownerTimService = {
    // Get all tim for owner
    async getOwnerTim(params = {}) {
        try {
            const response = await api.get('/owner/tim-merah-biru', { params })
            return response.data
        } catch (error) {
            throw error.response?.data || error.message
        }
    },

    // Get tim statistics for owner
    async getOwnerTimStats(params = {}) {
        try {
            const response = await api.get('/owner/tim-merah-biru/stats', { params })
            return response.data
        } catch (error) {
            throw error.response?.data || error.message
        }
    },

    // Get tim by division
    async getOwnerTimByDivision(division, params = {}) {
        try {
            const response = await api.get(`/owner/tim-merah-biru/division/${division}`, { params })
            return response.data
        } catch (error) {
            throw error.response?.data || error.message
        }
    },

    // Get tim by status
    async getOwnerTimByStatus(status, params = {}) {
        try {
            const response = await api.get(`/owner/tim-merah-biru/status/${status}`, { params })
            return response.data
        } catch (error) {
            throw error.response?.data || error.message
        }
    }
} 