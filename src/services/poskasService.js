import api from './api'
import { API_ENDPOINTS } from '../config/constants'

export const poskasService = {
    // Get all poskas
    async getPoskas(params = {}) {
        try {
            const response = await api.get(API_ENDPOINTS.POSKAS.LIST, { params })
            return response.data
        } catch (error) {
            throw error.response?.data || error.message
        }
    },

    // Get poskas by ID
    async getPoskasById(id) {
        try {
            const response = await api.get(API_ENDPOINTS.POSKAS.BY_ID(id))
            return response.data
        } catch (error) {
            throw error.response?.data || error.message
        }
    },

    // Create new poskas
    async createPoskas(poskasData) {
        try {
            const response = await api.post(API_ENDPOINTS.POSKAS.LIST, poskasData)
            return response.data
        } catch (error) {
            throw error.response?.data || error.message
        }
    },

    // Update poskas
    async updatePoskas(id, poskasData) {
        try {
            const response = await api.put(API_ENDPOINTS.POSKAS.UPDATE(id), poskasData)
            return response.data
        } catch (error) {
            throw error.response?.data || error.message
        }
    },

    // Delete poskas
    async deletePoskas(id) {
        try {
            const response = await api.delete(API_ENDPOINTS.POSKAS.DELETE(id))
            return response.data
        } catch (error) {
            throw error.response?.data || error.message
        }
    },

    // Get poskas by user
    async getPoskasByUser(userId, params = {}) {
        try {
            const response = await api.get(`${API_ENDPOINTS.POSKAS.LIST}/user/${userId}`, { params })
            return response.data
        } catch (error) {
            throw error.response?.data || error.message
        }
    },

    // Upload poskas with images
    async uploadPoskasWithImages(formData) {
        try {
            const response = await api.post(API_ENDPOINTS.POSKAS.UPLOAD, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            })
            return response.data
        } catch (error) {
            throw error.response?.data || error.message
        }
    },

    // Create poskas with file upload
    async createPoskasWithUpload(formData) {
        try {
            const response = await api.post(API_ENDPOINTS.POSKAS.LIST, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            })
            return response.data
        } catch (error) {
            throw error.response?.data || error.message
        }
    },

    // Owner specific endpoints
    async getOwnerPoskas(params = {}) {
        try {
            const response = await api.get('/owner/keuangan-poskas', { params })
            return response.data
        } catch (error) {
            throw error.response?.data || error.message
        }
    },

    async getOwnerPoskasStats(params = {}) {
        try {
            const response = await api.get('/owner/keuangan-poskas/stats', { params })
            return response.data
        } catch (error) {
            throw error.response?.data || error.message
        }
    },

    async getOwnerPoskasByDateRange(startDate, endDate, params = {}) {
        try {
            const response = await api.get('/owner/keuangan-poskas/date-range', {
                params: {
                    startDate,
                    endDate,
                    ...params
                }
            })
            return response.data
        } catch (error) {
            throw error.response?.data || error.message
        }
    },

    async getOwnerPoskasById(id) {
        try {
            const response = await api.get(`/owner/keuangan-poskas/${id}`)
            return response.data
        } catch (error) {
            throw error.response?.data || error.message
        }
    }
} 