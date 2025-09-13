import api from './api'
import { API_ENDPOINTS } from '../config/constants'

export const trainingService = {
    // Get all training
    async getTraining(params = {}) {
        try {
            const response = await api.get(API_ENDPOINTS.TRAINING.LIST, { params })
            return response.data
        } catch (error) {
            throw error.response?.data || error.message
        }
    },

    // Get training by ID
    async getTrainingById(id) {
        try {
            const response = await api.get(API_ENDPOINTS.TRAINING.BY_ID(id))
            return response.data
        } catch (error) {
            throw error.response?.data || error.message
        }
    },

    // Create new training
    async createTraining(trainingData) {
        try {
            const response = await api.post(API_ENDPOINTS.TRAINING.LIST, trainingData)
            return response.data
        } catch (error) {
            throw error.response?.data || error.message
        }
    },

    // Update training
    async updateTraining(id, trainingData) {
        try {
            const response = await api.put(API_ENDPOINTS.TRAINING.BY_ID(id), trainingData)
            return response.data
        } catch (error) {
            throw error.response?.data || error.message
        }
    },

    // Delete training
    async deleteTraining(id) {
        try {
            const response = await api.delete(API_ENDPOINTS.TRAINING.BY_ID(id))
            return response.data
        } catch (error) {
            throw error.response?.data || error.message
        }
    },

    // Get training by type
    async getTrainingByType(type, params = {}) {
        try {
            const response = await api.get(API_ENDPOINTS.TRAINING.BY_TYPE(type), { params })
            return response.data
        } catch (error) {
            throw error.response?.data || error.message
        }
    },

    // Get training statistics
    async getTrainingStats(params = {}) {
        try {
            const response = await api.get(API_ENDPOINTS.TRAINING.STATS, { params })
            return response.data
        } catch (error) {
            throw error.response?.data || error.message
        }
    },

    // Admin: list trainings for admin (alias for AdminTrainingList.jsx)
    async getAdminTrainings(params = {}) {
        try {
            // Backend expects /admin/training/users for list
            const response = await api.get('/admin/training/users', { params })
            return response.data
        } catch (error) {
            throw error.response?.data || error.message
        }
    },

    // Admin: stats for admin (alias for AdminTrainingList.jsx)
    async getAdminStats(params = {}) {
        try {
            const response = await api.get(API_ENDPOINTS.TRAINING.STATS, { params })
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
            const response = await api.get(API_ENDPOINTS.TRAINING.OWNER, { params })
            return response.data
        } catch (error) {
            throw error.response?.data || error.message
        }
    },

    // Get all trainings for owner (alias for compatibility)
    async getOwnerTrainings(params = {}) {
        try {
            const response = await api.get('/owner/training/users', { params })
            return response.data
        } catch (error) {
            throw error.response?.data || error.message
        }
    },

    // Get training statistics for owner
    async getOwnerTrainingStats(params = {}) {
        try {
            const response = await api.get(API_ENDPOINTS.TRAINING.OWNER_STATS, { params })
            return response.data
        } catch (error) {
            throw error.response?.data || error.message
        }
    },

    // Get owner stats (alias for compatibility)
    async getOwnerStats(params = {}) {
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
            const response = await api.get(API_ENDPOINTS.TRAINING.OWNER_BY_STATUS(status), { params })
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