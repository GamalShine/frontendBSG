import api from './api'
import { API_ENDPOINTS } from '../config/constants'

export const timService = {
    // Get all tim merah
    async getTimMerah(params = {}) {
        try {
            const response = await api.get(API_ENDPOINTS.TIM.MERAH, { params })
            return response.data
        } catch (error) {
            throw error.response?.data || error.message
        }
    },

    // Get tim merah by ID
    async getTimMerahById(id) {
        try {
            const response = await api.get(API_ENDPOINTS.TIM.MERAH_BY_ID(id))
            return response.data
        } catch (error) {
            throw error.response?.data || error.message
        }
    },

    // Create new tim merah
    async createTimMerah(timData) {
        try {
            const response = await api.post(API_ENDPOINTS.TIM.MERAH, timData)
            return response.data
        } catch (error) {
            throw error.response?.data || error.message
        }
    },

    // Update tim merah
    async updateTimMerah(id, timData) {
        try {
            const response = await api.put(API_ENDPOINTS.TIM.MERAH_BY_ID(id), timData)
            return response.data
        } catch (error) {
            throw error.response?.data || error.message
        }
    },

    // Delete tim merah
    async deleteTimMerah(id) {
        try {
            const response = await api.delete(API_ENDPOINTS.TIM.MERAH_BY_ID(id))
            return response.data
        } catch (error) {
            throw error.response?.data || error.message
        }
    },

    // Get all tim biru
    async getTimBiru(params = {}) {
        try {
            const response = await api.get(API_ENDPOINTS.TIM.BIRU, { params })
            return response.data
        } catch (error) {
            throw error.response?.data || error.message
        }
    },

    // Get tim biru by ID
    async getTimBiruById(id) {
        try {
            const response = await api.get(API_ENDPOINTS.TIM.BIRU_BY_ID(id))
            return response.data
        } catch (error) {
            throw error.response?.data || error.message
        }
    },

    // Get tim biru detail (alias for getTimBiruById)
    async getTimBiruDetail(id) {
        try {
            const response = await api.get(API_ENDPOINTS.TIM.BIRU_BY_ID(id))
            return response.data
        } catch (error) {
            throw error.response?.data || error.message
        }
    },

    // Create new tim biru
    async createTimBiru(timData) {
        try {
            const response = await api.post(API_ENDPOINTS.TIM.BIRU, timData)
            return response.data
        } catch (error) {
            throw error.response?.data || error.message
        }
    },

    // Update tim biru
    async updateTimBiru(id, timData) {
        try {
            const response = await api.put(API_ENDPOINTS.TIM.BIRU_BY_ID(id), timData)
            return response.data
        } catch (error) {
            throw error.response?.data || error.message
        }
    },

    // Delete tim biru
    async deleteTimBiru(id) {
        try {
            const response = await api.delete(API_ENDPOINTS.TIM.BIRU_BY_ID(id))
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