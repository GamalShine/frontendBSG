import api from './api'

export const authService = {
    async login(credentials) {
        const response = await api.post('/auth/login', credentials)
        const { data } = response.data

        if (data && data.token && data.user) {
            localStorage.setItem('token', data.token)
            localStorage.setItem('user', JSON.stringify(data.user))
            return { token: data.token, user: data.user }
        } else {
            throw new Error('Invalid response format from server')
        }
    },

    async logout() {
        try {
            await api.post('/auth/logout')
        } catch (error) {
            console.error('Logout error:', error)
        } finally {
            localStorage.removeItem('token')
            localStorage.removeItem('user')
        }
    },

    async getCurrentUser() {
        const response = await api.get('/auth/me')
        return response.data
    },

    async changePassword(passwords) {
        const response = await api.post('/auth/change-password', passwords)
        return response.data
    },

    isAuthenticated() {
        return !!localStorage.getItem('token')
    },

    getStoredUser() {
        const user = localStorage.getItem('user')
        return user ? JSON.parse(user) : null
    },
} 