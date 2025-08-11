import api from './api'

export const uploadService = {
    // Upload single file
    async uploadFile(file, type = 'general') {
        try {
            const formData = new FormData()
            formData.append('file', file)
            formData.append('type', type)

            const response = await api.post('/upload', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
                timeout: 30000, // 30 seconds for upload
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

            const response = await api.post('/upload/multiple', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
                timeout: 60000, // 60 seconds for multiple uploads
            })
            return response.data
        } catch (error) {
            throw error.response?.data || error.message
        }
    },

    // Upload image for specific module
    async uploadImage(file, module, moduleId = null) {
        try {
            const formData = new FormData()
            formData.append('file', file)
            formData.append('module', module)
            if (moduleId) {
                formData.append('module_id', moduleId)
            }

            const response = await api.post('/upload/image', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
                timeout: 30000,
            })
            return response.data
        } catch (error) {
            throw error.response?.data || error.message
        }
    },

    // Upload document
    async uploadDocument(file, module, moduleId = null) {
        try {
            const formData = new FormData()
            formData.append('file', file)
            formData.append('module', module)
            if (moduleId) {
                formData.append('module_id', moduleId)
            }

            const response = await api.post('/upload/document', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
                timeout: 30000,
            })
            return response.data
        } catch (error) {
            throw error.response?.data || error.message
        }
    },

    // Delete uploaded file
    async deleteFile(fileId) {
        try {
            const response = await api.delete(`/upload/${fileId}`)
            return response.data
        } catch (error) {
            throw error.response?.data || error.message
        }
    },

    // Get file info
    async getFileInfo(fileId) {
        try {
            const response = await api.get(`/upload/${fileId}`)
            return response.data
        } catch (error) {
            throw error.response?.data || error.message
        }
    },

    // Get files by module
    async getFilesByModule(module, moduleId = null) {
        try {
            const params = { module }
            if (moduleId) {
                params.module_id = moduleId
            }
            const response = await api.get('/upload/module', { params })
            return response.data
        } catch (error) {
            throw error.response?.data || error.message
        }
    }
} 