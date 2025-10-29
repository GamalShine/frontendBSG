import api from './api'
import { API_ENDPOINTS } from '../config/constants'

export const komplainService = {
    // Get all complaints
    async getKomplain(params = {}) {
        try {
            const response = await api.get(API_ENDPOINTS.COMPLAINTS.LIST, { params })
            return response.data
        } catch (error) {
            throw error.response?.data || error.message
        }
    },

    // Get complaint by ID
    async getKomplainById(id) {
        try {
            const response = await api.get(API_ENDPOINTS.COMPLAINTS.BY_ID(id))
            return response.data
        } catch (error) {
            throw error.response?.data || error.message
        }
    },

    // Create new complaint
    async createKomplain(komplainData) {
        try {
            const response = await api.post(API_ENDPOINTS.COMPLAINTS.LIST, komplainData)
            return response.data
        } catch (error) {
            throw error.response?.data || error.message
        }
    },

    // Update complaint
    async updateKomplain(id, komplainData) {
        try {
            const response = await api.put(API_ENDPOINTS.COMPLAINTS.BY_ID(id), komplainData)
            return response.data
        } catch (error) {
            throw error.response?.data || error.message
        }
    },

    // Delete complaint
    async deleteKomplain(id) {
        try {
            const response = await api.delete(API_ENDPOINTS.COMPLAINTS.BY_ID(id))
            return response.data
        } catch (error) {
            throw error.response?.data || error.message
        }
    },

    // Get komplain by status
    async getKomplainByStatus(status, params = {}) {
        try {
            const response = await api.get(`/daftar-komplain/status/${status}`, { params })
            return response.data
        } catch (error) {
            throw error.response?.data || error.message
        }
    },

    // Get komplain by user
    async getKomplainByUser(userId, params = {}) {
        try {
            const response = await api.get(`/daftar-komplain/user/${userId}`, { params })
            return response.data
        } catch (error) {
            throw error.response?.data || error.message
        }
    }
}

export const adminKomplainService = {
    // Get all komplain for admin
    async getAdminKomplain(params = {}) {
        try {
            const response = await api.get('/admin/komplain', { params })
            return response.data
        } catch (error) {
            throw error.response?.data || error.message
        }
    },

    // Get all komplain for admin (alias)
    async getAdminKomplains(params = {}) {
        try {
            const response = await api.get('/admin/komplain', { params })
            return response.data
        } catch (error) {
            throw error.response?.data || error.message
        }
    },

    // Get komplain by ID for admin
    async getAdminKomplainById(id) {
        try {
            const response = await api.get(`/admin/komplain/${id}`)
            return response.data
        } catch (error) {
            throw error.response?.data || error.message
        }
    },

    // Get komplain statistics
    async getKomplainStats(params = {}) {
        try {
            const response = await api.get('/admin/komplain/stats', { params })
            return response.data
        } catch (error) {
            throw error.response?.data || error.message
        }
    },

    // Update komplain status
    async updateKomplainStatus(komplainId, status) {
        try {
            const response = await api.put(`/admin/komplain/${komplainId}/status`, { status })
            return response.data
        } catch (error) {
            throw error.response?.data || error.message
        }
    },

    // Assign komplain to admin
    async assignKomplain(komplainId, adminId) {
        try {
            const response = await api.put(`/admin/komplain/${komplainId}/assign`, { admin_id: adminId })
            return response.data
        } catch (error) {
            throw error.response?.data || error.message
        }
    },

    // Delete komplain
    async deleteKomplain(komplainId) {
        try {
            const response = await api.delete(`/admin/komplain/${komplainId}`)
            return response.data
        } catch (error) {
            throw error.response?.data || error.message
        }
    },

    // Upload lampiran komplain (hanya untuk admin/penerima)
    // Backend route: POST /admin/komplain/:id/upload (multer field: 'lampiran') dan membutuhkan catatan_admin
    async uploadLampiran(komplainId, files = [], catatan_admin = '') {
        try {
            const fd = new FormData()
            for (const f of files) fd.append('lampiran', f)
            if (typeof catatan_admin === 'string') fd.append('catatan_admin', catatan_admin)
            const response = await api.post(`/admin/komplain/${komplainId}/upload`, fd, {
                headers: { 'Content-Type': 'multipart/form-data' }
            })
            return response.data
        } catch (error) {
            throw error.response?.data || error.message
        }
    },

    // Hapus lampiran berdasarkan index
    async deleteLampiran(komplainId, index) {
        // PERINGATAN: Endpoint hapus lampiran spesifik belum tersedia di backend adminKomplain.js
        // Fungsi ini akan menghasilkan 404 jika dipanggil.
        // Pertimbangkan untuk membuat endpoint backend terlebih dahulu sebelum menggunakan fungsi ini.
        throw new Error('Endpoint hapus lampiran belum tersedia di backend')
    },

    // Update catatan admin tanpa upload
    async updateCatatan(komplainId, catatan_admin) {
        try {
            const response = await api.put(`/admin/komplain/${komplainId}/catatan`, { catatan_admin })
            return response.data
        } catch (error) {
            throw error.response?.data || error.message
        }
    }
}