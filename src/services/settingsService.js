import api from './api'
import { API_ENDPOINTS } from '../config/constants'

export const settingsService = {
    // Get all settings
    async getSettings() {
        try {
            const response = await api.get(API_ENDPOINTS.SETTINGS.LIST)
            return {
                success: true,
                data: response.data
            }
        } catch (error) {
            console.error('Error getting settings:', error)
            return {
                success: false,
                message: error.response?.data?.message || 'Gagal memuat pengaturan'
            }
        }
    },

    // Update settings
    async updateSettings(settings) {
        try {
            const response = await api.put(API_ENDPOINTS.SETTINGS.LIST, settings)
            return {
                success: true,
                data: response.data,
                message: 'Pengaturan berhasil diperbarui'
            }
        } catch (error) {
            console.error('Error updating settings:', error)
            return {
                success: false,
                message: error.response?.data?.message || 'Gagal memperbarui pengaturan'
            }
        }
    },

    // Reset settings to default
    async resetSettings() {
        try {
            const response = await api.post('/settings/reset')
            return {
                success: true,
                data: response.data,
                message: 'Pengaturan berhasil direset'
            }
        } catch (error) {
            console.error('Error resetting settings:', error)
            return {
                success: false,
                message: error.response?.data?.message || 'Gagal mereset pengaturan'
            }
        }
    },

    // Get specific setting
    async getSetting(key) {
        try {
            const response = await api.get(API_ENDPOINTS.SETTINGS.BY_ID(key))
            return {
                success: true,
                data: response.data
            }
        } catch (error) {
            console.error('Error getting setting:', error)
            return {
                success: false,
                message: error.response?.data?.message || 'Gagal memuat pengaturan'
            }
        }
    },

    // Update specific setting
    async updateSetting(key, value) {
        try {
            const response = await api.put(API_ENDPOINTS.SETTINGS.BY_ID(key), { value })
            return {
                success: true,
                data: response.data,
                message: 'Pengaturan berhasil diperbarui'
            }
        } catch (error) {
            console.error('Error updating setting:', error)
            return {
                success: false,
                message: error.response?.data?.message || 'Gagal memperbarui pengaturan'
            }
        }
    },

    // Export settings
    async exportSettings() {
        try {
            const response = await api.get('/settings/export', {
                responseType: 'blob'
            })
            return {
                success: true,
                data: response.data
            }
        } catch (error) {
            console.error('Error exporting settings:', error)
            return {
                success: false,
                message: error.response?.data?.message || 'Gagal mengekspor pengaturan'
            }
        }
    },

    // Import settings
    async importSettings(file) {
        try {
            const formData = new FormData()
            formData.append('settings', file)

            const response = await api.post('/settings/import', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            })
            return {
                success: true,
                data: response.data,
                message: 'Pengaturan berhasil diimpor'
            }
        } catch (error) {
            console.error('Error importing settings:', error)
            return {
                success: false,
                message: error.response?.data?.message || 'Gagal mengimpor pengaturan'
            }
        }
    },

    // Get system info
    async getSystemInfo() {
        try {
            const response = await api.get('/settings/system-info')
            return {
                success: true,
                data: response.data
            }
        } catch (error) {
            console.error('Error getting system info:', error)
            return {
                success: false,
                message: error.response?.data?.message || 'Gagal memuat informasi sistem'
            }
        }
    },

    // Test email configuration
    async testEmailConfig(emailConfig) {
        try {
            const response = await api.post('/settings/test-email', emailConfig)
            return {
                success: true,
                data: response.data,
                message: 'Konfigurasi email berhasil diuji'
            }
        } catch (error) {
            console.error('Error testing email config:', error)
            return {
                success: false,
                message: error.response?.data?.message || 'Gagal menguji konfigurasi email'
            }
        }
    },

    // Get backup status
    async getBackupStatus() {
        try {
            const response = await api.get('/settings/backup-status')
            return {
                success: true,
                data: response.data
            }
        } catch (error) {
            console.error('Error getting backup status:', error)
            return {
                success: false,
                message: error.response?.data?.message || 'Gagal memuat status backup'
            }
        }
    },

    // Create manual backup
    async createBackup() {
        try {
            const response = await api.post('/settings/backup')
            return {
                success: true,
                data: response.data,
                message: 'Backup berhasil dibuat'
            }
        } catch (error) {
            console.error('Error creating backup:', error)
            return {
                success: false,
                message: error.response?.data?.message || 'Gagal membuat backup'
            }
        }
    },

    // Restore from backup
    async restoreBackup(backupId) {
        try {
            const response = await api.post(`/settings/restore/${backupId}`)
            return {
                success: true,
                data: response.data,
                message: 'Backup berhasil dipulihkan'
            }
        } catch (error) {
            console.error('Error restoring backup:', error)
            return {
                success: false,
                message: error.response?.data?.message || 'Gagal memulihkan backup'
            }
        }
    }
} 