import api from './api'
import { API_ENDPOINTS } from '../config/constants'

export const authService = {
    // Check if user is authenticated
    isAuthenticated() {
        const token = localStorage.getItem('token')
        return !!token
    },

    // Get stored user data
    getStoredUser() {
        try {
            const userData = localStorage.getItem('user')
            return userData ? JSON.parse(userData) : null
        } catch (error) {
            console.error('Error parsing stored user data:', error)
            return null
        }
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
            const response = await api.get(API_ENDPOINTS.AUTH.VERIFY_TOKEN)
            return response.data
        } catch (error) {
            throw error.response?.data || error.message
        }
    },

    // Check if token is valid
    async isTokenValid() {
        try {
            const token = localStorage.getItem('token')
            if (!token) return false
            
            // Try to verify with backend first
            try {
                const response = await api.get(API_ENDPOINTS.AUTH.VERIFY_TOKEN)
                return response.status === 200
            } catch (error) {
                console.warn('Token verification endpoint not available, using fallback validation')
                // Fallback: check if token exists and has valid format
                // Most JWT tokens are in format: header.payload.signature
                return token.split('.').length === 3
            }
        } catch (error) {
            console.error('Token validation error:', error)
            return false
        }
    },

    // Change password (auto-route by role)
    async changePassword(passwordData) {
        try {
            // Tentukan endpoint berdasarkan role user
            let role
            try {
                const stored = this.getStoredUser?.()
                role = stored?.role
            } catch {}

            let endpoint = '/profile/change-password' // default (generic)
            if (role === 'admin') endpoint = '/admin/change-password'
            else if (role === 'leader') endpoint = '/leader/change-password'
            // owner/divisi akan coba generic '/profile/change-password'

            try {
                const response = await api.put(endpoint, passwordData)
                return response.data
            } catch (err) {
                // Jika generic gagal (mis. 404), coba fallback lain bila masuk akal
                if (endpoint === '/profile/change-password' && err?.response?.status === 404) {
                    // Coba admin/leader sebagai fallback konservatif bila role terdeteksi
                    if (role === 'admin') {
                        const response = await api.put('/admin/change-password', passwordData)
                        return response.data
                    }
                    if (role === 'leader') {
                        const response = await api.put('/leader/change-password', passwordData)
                        return response.data
                    }
                }
                throw err
            }
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