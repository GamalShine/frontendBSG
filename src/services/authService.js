import api from './api'
import { API_ENDPOINTS } from '../config/constants'

export const authService = {
    // Check if user is authenticated
    isAuthenticated() {
        const token = localStorage.getItem('token')
        return !!token
    },

    async getCurrentUser() {
        try {
            const response = await api.get(API_ENDPOINTS.USERS.PROFILE)
            return response.data
        } catch (error) {
            console.error('Error getting current user:', error)
            throw error
        }
    },

    // Login
    async login(credentials) {
        try {
            const response = await api.post(API_ENDPOINTS.AUTH.LOGIN, credentials)
            console.log('🔐 Raw login response:', response)

            // Store token and user data
            if (response.data && response.data.data && response.data.data.token) {
                localStorage.setItem('token', response.data.data.token)
                console.log('✅ Token stored successfully')
            } else if (response.data && response.data.token) {
                localStorage.setItem('token', response.data.token)
                console.log('✅ Token stored successfully (alternative path)')
            } else {
                console.warn('⚠️ No token found in response')
            }

            if (response.data && response.data.data && response.data.data.user) {
                localStorage.setItem('user', JSON.stringify(response.data.data.user))
                console.log('✅ User data stored successfully')
            } else if (response.data && response.data.user) {
                localStorage.setItem('user', JSON.stringify(response.data.user))
                console.log('✅ User data stored successfully (alternative path)')
            } else {
                console.warn('⚠️ No user data found in response')
            }

            return response.data
        } catch (error) {
            console.error('❌ Login error:', error)
            throw error.response?.data || error.message
        }
    },

    // Logout
    async logout() {
        try {
            await api.post(API_ENDPOINTS.AUTH.LOGOUT)
        } catch (error) {
            console.error('Logout error:', error)
        } finally {
            localStorage.removeItem('token')
            localStorage.removeItem('user')
        }
    },

    // Register
    async register(userData) {
        try {
            const response = await api.post(API_ENDPOINTS.AUTH.REGISTER, userData)
            return response.data
        } catch (error) {
            console.error('Register error:', error)
            throw error.response?.data || error.message
        }
    },

    // Refresh token
    async refreshToken() {
        try {
            const response = await api.post(API_ENDPOINTS.AUTH.REFRESH_TOKEN)
            if (response.data && response.data.token) {
                localStorage.setItem('token', response.data.token)
            }
            return response.data
        } catch (error) {
            console.error('Token refresh error:', error)
            throw error
        }
    },

    // Verify token
    async verifyToken() {
        try {
            const response = await api.get('/auth/verify')
            return response.data
        } catch (error) {
            throw error.response?.data || error.message
        }
    },

    // Change password
    async changePassword(passwordData) {
        try {
            const response = await api.put('/auth/change-password', passwordData)
            return response.data
        } catch (error) {
            throw error.response?.data || error.message
        }
    },

    // Forgot password
    async forgotPassword(email) {
        try {
            const response = await api.post('/auth/forgot-password', { email })
            return response.data
        } catch (error) {
            throw error.response?.data || error.message
        }
    },

    // Reset password
    async resetPassword(token, password) {
        try {
            const response = await api.post('/auth/reset-password', { token, password })
            return response.data
        } catch (error) {
            throw error.response?.data || error.message
        }
    }
} 