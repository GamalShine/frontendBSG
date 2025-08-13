import api from './api'
import { API_ENDPOINTS, API_CONFIG } from '../config/constants'

export const uploadService = {
    // Upload single file
    async uploadFile(file, type = 'general') {
        try {
            const formData = new FormData()
            formData.append('file', file)
            formData.append('type', type)

            const response = await api.post(API_ENDPOINTS.UPLOAD.GENERAL, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
                timeout: API_CONFIG.TIMEOUT.UPLOAD,
            })
            return response.data
        } catch (error) {
            throw error.response?.data || error.message
        }
    },

    // Upload multiple files
    async uploadMultipleFiles(files, type = 'general') {
        try {
            const formData = new FormData()
            files.forEach((file, index) => {
                formData.append(`files[${index}]`, file)
            })
            formData.append('type', type)

            const response = await api.post(API_ENDPOINTS.UPLOAD.GENERAL, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
                timeout: API_CONFIG.TIMEOUT.UPLOAD,
            })
            return response.data
        } catch (error) {
            throw error.response?.data || error.message
        }
    },

    // Upload image specifically
    async uploadImage(file) {
        return this.uploadFile(file, 'image')
    },

    // Upload document specifically
    async uploadDocument(file) {
        return this.uploadFile(file, 'document')
    },

    // Get file URL
    getFileUrl(filename, type = 'general') {
        const baseUrl = API_CONFIG.BASE_URL.replace('/api', '')
        return `${baseUrl}/uploads/${type}/${filename}`
    },

    // Delete file
    async deleteFile(filename, type = 'general') {
        try {
            const response = await api.delete(`${API_ENDPOINTS.UPLOAD.GENERAL}/${filename}`, {
                data: { type }
            })
            return response.data
        } catch (error) {
            throw error.response?.data || error.message
        }
    }
} 