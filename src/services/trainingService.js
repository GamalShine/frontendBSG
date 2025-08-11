import api from './api'

export const trainingService = {
    // Get all training
    async getTraining(params = {}) {
        try {
            const response = await api.get('/admin/training', { params })
            return response.data
        } catch (error) {
            throw error.response?.data || error.message
        }
    },

    // Get training by ID
    async getTrainingById(id) {
        try {
            const response = await api.get(`/admin/training/${id}`)
            return response.data
        } catch (error) {
            throw error.response?.data || error.message
        }
    },

    // Create new training
    async createTraining(trainingData) {
        try {
            const response = await api.post('/admin/training', trainingData)
            return response.data
        } catch (error) {
            throw error.response?.data || error.message
        }
    },

    // Update training
    async updateTraining(id, trainingData) {
        try {
            const response = await api.put(`/admin/training/${id}`, trainingData)
            return response.data
        } catch (error) {
            throw error.response?.data || error.message
        }
    },

    // Delete training
    async deleteTraining(id) {
        try {
            const response = await api.delete(`/admin/training/${id}`)
            return response.data
        } catch (error) {
            throw error.response?.data || error.message
        }
    },

    // Get training by type
    async getTrainingByType(type, params = {}) {
        try {
            const response = await api.get(`/admin/training/type/${type}`, { params })
            return response.data
        } catch (error) {
            throw error.response?.data || error.message
        }
    },

    // Get training statistics
    async getTrainingStats(params = {}) {
        try {
            const response = await api.get('/admin/training/stats', { params })
            return response.data
        } catch (error) {
            throw error.response?.data || error.message
        }
    }
}

export const ownerTrainingService = {
    // Get all training for owner
    async getOwnerTraining(params = {}) {
        try {
            const response = await api.get('/owner/training', { params })
            return response.data
        } catch (error) {
            throw error.response?.data || error.message
        }
    },

    // Get training statistics for owner
    async getOwnerTrainingStats(params = {}) {
        try {
            const response = await api.get('/owner/training/stats', { params })
            return response.data
        } catch (error) {
            throw error.response?.data || error.message
        }
    },

    // Get training by status
    async getOwnerTrainingByStatus(status, params = {}) {
        try {
            const response = await api.get(`/owner/training/status/${status}`, { params })
            return response.data
        } catch (error) {
            throw error.response?.data || error.message
        }
    },

    // Get training by date range
    async getOwnerTrainingByDateRange(startDate, endDate, params = {}) {
        try {
            const response = await api.get('/owner/training/date-range', {
                params: { startDate, endDate, ...params }
            })
            return response.data
        } catch (error) {
            throw error.response?.data || error.message
        }
    }
} 