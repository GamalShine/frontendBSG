import api from './api'

export const komplainService = {
    async getKomplains() {
        const response = await api.get('/daftar-komplain')
        return response.data
    },

    async getKomplainById(id) {
        const response = await api.get(`/daftar-komplain/${id}`)
        return response.data
    },

    async createKomplain(komplainData) {
        const response = await api.post('/daftar-komplain', komplainData)
        return response.data
    },

    async updateKomplain(id, komplainData) {
        const response = await api.put(`/daftar-komplain/${id}`, komplainData)
        return response.data
    },

    async deleteKomplain(id) {
        const response = await api.delete(`/daftar-komplain/${id}`)
        return response.data
    },

    async updateStatus(id, status) {
        const response = await api.patch(`/daftar-komplain/${id}/status`, { status })
        return response.data
    },

    async assignKomplain(id, penerimaId) {
        const response = await api.patch(`/daftar-komplain/${id}/assign`, { penerima_komplain_id: penerimaId })
        return response.data
    },
} 