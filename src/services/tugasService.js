import api from './api'

export const tugasService = {
    async getTugas() {
        const response = await api.get('/daftar-tugas')
        return response.data
    },

    async getTugasById(id) {
        const response = await api.get(`/daftar-tugas/${id}`)
        return response.data
    },

    async createTugas(tugasData) {
        const response = await api.post('/daftar-tugas', tugasData)
        return response.data
    },

    async updateTugas(id, tugasData) {
        const response = await api.put(`/daftar-tugas/${id}`, tugasData)
        return response.data
    },

    async deleteTugas(id) {
        const response = await api.delete(`/daftar-tugas/${id}`)
        return response.data
    },

    async updateStatus(id, status) {
        const response = await api.patch(`/daftar-tugas/${id}/status`, { status })
        return response.data
    },

    async getTugasByUser(userId) {
        const response = await api.get(`/daftar-tugas/user/${userId}`)
        return response.data
    },

    async getTugasAssignedToMe() {
        const response = await api.get('/daftar-tugas/assigned-to-me')
        return response.data
    },

    async getTugasCreatedByMe() {
        const response = await api.get('/daftar-tugas/created-by-me')
        return response.data
    },
} 