import api from './api'

export const userService = {
    // Get all users
    async getUsers(params = {}) {
        try {
            const response = await api.get('/users', { params })
            return response.data
        } catch (error) {
            throw error.response?.data || error.message
        }
    },

    // Get user by ID
    async getUserById(id) {
        try {
            const response = await api.get(`/users/${id}`)
            return response.data
        } catch (error) {
            throw error.response?.data || error.message
        }
    },

    // Get current user profile
    async getCurrentUser() {
        try {
            const response = await api.get('/users/profile')
            return response.data
        } catch (error) {
            throw error.response?.data || error.message
        }
    },

    // Update current user profile
    async updateCurrentUser(userData) {
        try {
            const response = await api.put('/users/update', userData)
            return response.data
        } catch (error) {
            throw error.response?.data || error.message
        }
    },

    // Create new user
    async createUser(userData) {
        try {
            const response = await api.post('/users', userData)
            return response.data
        } catch (error) {
            throw error.response?.data || error.message
        }
    },

    // Update user
    async updateUser(id, userData) {
        try {
            const response = await api.put(`/users/${id}`, userData)
            return response.data
        } catch (error) {
            throw error.response?.data || error.message
        }
    },

    // Delete user
    async deleteUser(id) {
        try {
            const response = await api.delete(`/users/${id}`)
            return response.data
        } catch (error) {
            throw error.response?.data || error.message
        }
    },

    // Get users by role
    async getUsersByRole(role, params = {}) {
        try {
            const response = await api.get(`/users/role/${role}`, { params })
            return response.data
        } catch (error) {
            throw error.response?.data || error.message
        }
    },

    // Get users by status
    async getUsersByStatus(status, params = {}) {
        try {
            const response = await api.get(`/users/status/${status}`, { params })
            return response.data
        } catch (error) {
            throw error.response?.data || error.message
        }
    },

    // Update user status
    async updateUserStatus(id, status) {
        try {
            const response = await api.put(`/users/${id}/status`, { status })
            return response.data
        } catch (error) {
            throw error.response?.data || error.message
        }
    },

    // Update user role
    async updateUserRole(id, role) {
        try {
            const response = await api.put(`/users/${id}/role`, { role })
            return response.data
        } catch (error) {
            throw error.response?.data || error.message
        }
    }
}

export const adminProfileService = {
    // Get admin profile
    async getAdminProfile() {
        try {
            const response = await api.get('/admin/profile')
            return response.data
        } catch (error) {
            throw error.response?.data || error.message
        }
    },

    // Update admin profile
    async updateAdminProfile(profileData) {
        try {
            const response = await api.put('/admin/profile', profileData)
            return response.data
        } catch (error) {
            throw error.response?.data || error.message
        }
    },

    // Change admin password
    async changeAdminPassword(passwordData) {
        try {
            const response = await api.post('/admin/profile/change-password', passwordData)
            return response.data
        } catch (error) {
            throw error.response?.data || error.message
        }
    }
} 