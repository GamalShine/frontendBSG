import api from './api'
import { API_ENDPOINTS } from '../config/constants'

export const userService = {
    // Get all users
    async getUsers(params = {}) {
        try {
            const response = await api.get(API_ENDPOINTS.USERS.LIST, { params })
            return response.data
        } catch (error) {
            throw error.response?.data || error.message
        }
    },

    // Get user by ID
    async getUserById(id) {
        try {
            const response = await api.get(`${API_ENDPOINTS.USERS.LIST}/${id}`)
            return response.data
        } catch (error) {
            throw error.response?.data || error.message
        }
    },

    // Get current user profile
    async getCurrentUser() {
        try {
            const response = await api.get(API_ENDPOINTS.USERS.PROFILE)
            return response.data
        } catch (error) {
            throw error.response?.data || error.message
        }
    },

    // Update user profile
    async updateProfile(userData) {
        try {
            const response = await api.put(API_ENDPOINTS.USERS.UPDATE, userData)
            return response.data
        } catch (error) {
            throw error.response?.data || error.message
        }
    },

    // Create new user
    async createUser(userData) {
        try {
            const response = await api.post(API_ENDPOINTS.USERS.LIST, userData)
            return response.data
        } catch (error) {
            throw error.response?.data || error.message
        }
    },

    // Update user
    async updateUser(id, userData) {
        try {
            const response = await api.put(`${API_ENDPOINTS.USERS.LIST}/${id}`, userData)
            return response.data
        } catch (error) {
            throw error.response?.data || error.message
        }
    },

    // Delete user
    async deleteUser(id) {
        try {
            const response = await api.delete(`${API_ENDPOINTS.USERS.LIST}/${id}`)
            return response.data
        } catch (error) {
            throw error.response?.data || error.message
        }
    },

    // Get users by role
    async getUsersByRole(role, params = {}) {
        try {
            const response = await api.get(`${API_ENDPOINTS.USERS.LIST}/role/${role}`, { params })
            return response.data
        } catch (error) {
            throw error.response?.data || error.message
        }
    },

    // Get users by status
    async getUsersByStatus(status, params = {}) {
        try {
            const response = await api.get(`${API_ENDPOINTS.USERS.LIST}/status/${status}`, { params })
            return response.data
        } catch (error) {
            throw error.response?.data || error.message
        }
    },

    // Change user password
    async changePassword(passwordData) {
        try {
            const response = await api.put('/users/change-password', passwordData)
            return response.data
        } catch (error) {
            throw error.response?.data || error.message
        }
    },

    // Get user statistics
    async getUserStats(params = {}) {
        try {
            const response = await api.get('/users/stats', { params })
            return response.data
        } catch (error) {
            throw error.response?.data || error.message
        }
    },

    // Admin specific endpoints
    async getAdminProfile() {
        try {
            const response = await api.get('/admin/profile')
            return response.data
        } catch (error) {
            throw error.response?.data || error.message
        }
    },

    async updateAdminProfile(adminData) {
        try {
            const response = await api.put('/admin/profile', adminData)
            return response.data
        } catch (error) {
            throw error.response?.data || error.message
        }
    },

    async changeAdminPassword(passwordData) {
        try {
            const response = await api.post('/admin/profile/change-password', passwordData)
            return response.data
        } catch (error) {
            throw error.response?.data || error.message
        }
    }
} 