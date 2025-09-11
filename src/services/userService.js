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

    // Owner endpoints: accounts management
    async getAccounts(params = {}) {
        try {
            // Coba endpoint owner terlebih dahulu
            const response = await api.get('/users/accounts', { params })
            return response.data
        } catch (error) {
            const status = error?.response?.status
            // Fallback: gunakan endpoint umum /users jika endpoint owner tidak tersedia atau error
            if (status === 404 || status === 500) {
                try {
                    const fallbackParams = {}
                    if (params?.role) fallbackParams.role = params.role
                    // Ambil banyak data sekaligus (tanpa pagination ketat)
                    fallbackParams.page = 1
                    fallbackParams.limit = 100
                    const alt = await api.get('/users', { params: fallbackParams })
                    // Normalisasi hasil supaya konsisten { success, data }
                    const rows = alt?.data?.data || alt?.data?.rows || []
                    return { success: true, data: rows }
                } catch (e2) {
                    throw e2.response?.data || e2.message
                }
            }
            throw error.response?.data || error.message
        }
    },

    async updateAccountStatus(id, status) {
        try {
            const response = await api.patch(`/users/accounts/${id}/status`, { status })
            return response.data
        } catch (error) {
            const statusCode = error?.response?.status
            const isCorsOrNetwork = !error?.response // axios 'Network Error' / CORS preflight blocked
            const shouldFallback = isCorsOrNetwork || statusCode === 404 || statusCode === 405 || statusCode === 500

            if (shouldFallback) {
                // Fallback: gunakan endpoint umum PUT /users/:id untuk update status
                try {
                    const putRes = await api.put(`/users/${id}`, { status })
                    // Normalisasi agar konsisten { success, data }
                    return putRes?.data || { success: true, data: { id, status } }
                } catch (e2) {
                    throw e2.response?.data || e2.message
                }
            }

            throw error.response?.data || error.message
        }
    },

    async deleteAccountOwner(id) {
        try {
            const response = await api.delete(`/users/accounts/${id}`)
            return response.data
        } catch (error) {
            const statusCode = error?.response?.status
            const isCorsOrNetwork = !error?.response
            const shouldFallback = isCorsOrNetwork || statusCode === 404 || statusCode === 405 || statusCode === 500
            if (shouldFallback) {
                try {
                    const delRes = await api.delete(`/users/${id}`)
                    return delRes?.data || { success: true }
                } catch (e2) {
                    throw e2.response?.data || e2.message
                }
            }
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