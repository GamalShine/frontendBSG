import api from './api'

export const poskasService = {
    // Get all poskas
    async getPoskas(params = {}) {
        try {
            const response = await api.get('/keuangan-poskas', { params })
            return response.data
        } catch (error) {
            throw error.response?.data || error.message
        }
    },

    // Get poskas by ID
    async getPoskasById(id) {
        try {
            const response = await api.get(`/keuangan-poskas/${id}`)
            return response.data
        } catch (error) {
            throw error.response?.data || error.message
        }
    },

    // Create new poskas
    async createPoskas(poskasData) {
        try {
            const response = await api.post('/keuangan-poskas', poskasData)
            return response.data
        } catch (error) {
            throw error.response?.data || error.message
        }
    },

    // Update poskas
    async updatePoskas(id, poskasData) {
        try {
            const response = await api.put(`/keuangan-poskas/${id}`, poskasData)
            return response.data
        } catch (error) {
            throw error.response?.data || error.message
        }
    },

    // Delete poskas
    async deletePoskas(id) {
        try {
            const response = await api.delete(`/keuangan-poskas/${id}`)
            return response.data
        } catch (error) {
            throw error.response?.data || error.message
        }
    },

    // Get poskas by user
    async getPoskasByUser(userId, params = {}) {
        try {
            const response = await api.get(`/keuangan-poskas/user/${userId}`, { params })
            return response.data
        } catch (error) {
            throw error.response?.data || error.message
        }
    },

    // Upload poskas with images
    async uploadPoskas(poskasData, images = []) {
        try {
            const formData = new FormData()
            formData.append('data', JSON.stringify(poskasData))

            images.forEach((image, index) => {
                formData.append(`images`, image)
            })

            const response = await api.post('/keuangan-poskas/upload', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            })
            return response.data
        } catch (error) {
            throw error.response?.data || error.message
        }
    },

    // Create poskas with images (FormData)
    async createPoskasWithImages(formData) {
        try {
            const response = await api.post('/keuangan-poskas', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            })
            return response.data
        } catch (error) {
            throw error.response?.data || error.message
        }
    }
}

export const ownerPoskasService = {
    // Get all poskas for owner
    async getOwnerPoskas(params = {}) {
        try {
            const response = await api.get('/owner/keuangan-poskas', { params })
            return response.data
        } catch (error) {
            throw error.response?.data || error.message
        }
    },

    // Get poskas statistics for owner
    async getOwnerPoskasStats(params = {}) {
        try {
            const response = await api.get('/owner/keuangan-poskas/stats', { params })
            return response.data
        } catch (error) {
            throw error.response?.data || error.message
        }
    },

    // Get poskas by date range
    async getOwnerPoskasByDateRange(startDate, endDate, params = {}) {
        try {
            const response = await api.get('/owner/keuangan-poskas/date-range', {
                params: { startDate, endDate, ...params }
            })
            return response.data
        } catch (error) {
            throw error.response?.data || error.message
        }
    }
} 