import api from './api'
import { API_ENDPOINTS } from '../config/constants'

export const menuService = {
    // Get all menu items
    async getMenuItems(params = {}) {
        try {
            const response = await api.get(API_ENDPOINTS.MENU.LIST, { params })
            return response.data
        } catch (error) {
            throw error.response?.data || error.message
        }
    },

    // Get menu item by ID
    async getMenuItemById(id) {
        try {
            const response = await api.get(API_ENDPOINTS.MENU.BY_ID(id))
            return response.data
        } catch (error) {
            throw error.response?.data || error.message
        }
    },

    // Create new menu item
    async createMenuItem(menuData) {
        try {
            const response = await api.post(API_ENDPOINTS.MENU.LIST, menuData)
            return response.data
        } catch (error) {
            throw error.response?.data || error.message
        }
    },

    // Update menu item
    async updateMenuItem(id, menuData) {
        try {
            const response = await api.put(API_ENDPOINTS.MENU.BY_ID(id), menuData)
            return response.data
        } catch (error) {
            throw error.response?.data || error.message
        }
    },

    // Delete menu item
    async deleteMenuItem(id) {
        try {
            const response = await api.delete(API_ENDPOINTS.MENU.BY_ID(id))
            return response.data
        } catch (error) {
            throw error.response?.data || error.message
        }
    },

    // Get menu items by user
    async getMenuItemsByUser(userId, params = {}) {
        try {
            const response = await api.get(`/pic-menu/user/${userId}`, { params })
            return response.data
        } catch (error) {
            throw error.response?.data || error.message
        }
    },

    // Get menu items by role
    async getMenuItemsByRole(role, params = {}) {
        try {
            const response = await api.get(`/pic-menu/role/${role}`, { params })
            return response.data
        } catch (error) {
            throw error.response?.data || error.message
        }
    },

    // Get active menu items
    async getActiveMenuItems(params = {}) {
        try {
            const response = await api.get('/pic-menu/active', { params })
            return response.data
        } catch (error) {
            throw error.response?.data || error.message
        }
    },

    // Toggle menu item status
    async toggleMenuItemStatus(id) {
        try {
            const response = await api.put(`/pic-menu/${id}/toggle`)
            return response.data
        } catch (error) {
            throw error.response?.data || error.message
        }
    },

    // Get menu statistics
    async getMenuStats(params = {}) {
        try {
            const response = await api.get('/pic-menu/stats', { params })
            return response.data
        } catch (error) {
            throw error.response?.data || error.message
        }
    }
}

// Default menu configuration
export const defaultMenus = {
    admin: [
        {
            id: 1,
            name: 'Dashboard',
            path: '/dashboard',
            icon: 'Home',
            order: 1,
            permissions: ['read']
        },
        {
            id: 2,
            name: 'Users',
            path: '/users',
            icon: 'Users',
            order: 2,
            permissions: ['read', 'create', 'update', 'delete'],
            children: [
                { id: 21, name: 'Daftar Users', path: '/users', permissions: ['read'] },
                { id: 22, name: 'Tambah User', path: '/users/new', permissions: ['create'] }
            ]
        },
        {
            id: 3,
            name: 'Tugas',
            path: '/admin/tugas',
            icon: 'CheckSquare',
            order: 3,
            permissions: ['read', 'create', 'update', 'delete'],
            children: [
                { id: 31, name: 'Daftar Tugas', path: '/admin/tugas', permissions: ['read'] },
                { id: 32, name: 'Tambah Tugas', path: '/admin/tugas/new', permissions: ['create'] }
            ]
        },
        {
            id: 4,
            name: 'Komplain',
            path: '/admin/operasional/komplain',
            icon: 'AlertTriangle',
            order: 4,
            permissions: ['read', 'update'],
            children: [
                { id: 41, name: 'Daftar Komplain', path: '/admin/operasional/komplain', permissions: ['read'] }
            ]
        },
        {
            id: 5,
            name: 'Pengumuman',
            path: '/admin/pengumuman',
            icon: 'Megaphone',
            order: 5,
            permissions: ['read', 'create', 'update', 'delete'],
            children: [
                { id: 51, name: 'Daftar Pengumuman', path: '/admin/pengumuman', permissions: ['read'] },
                { id: 52, name: 'Tambah Pengumuman', path: '/admin/pengumuman/new', permissions: ['create'] }
            ]
        },
        {
            id: 6,
            name: 'Training',
            path: '/admin/training',
            icon: 'BookOpen',
            order: 6,
            permissions: ['read', 'create', 'update', 'delete'],
            children: [
                { id: 61, name: 'Daftar Training', path: '/admin/training', permissions: ['read'] },
                { id: 62, name: 'Tambah Training', path: '/admin/training/new', permissions: ['create'] }
            ]
        },
        {
            id: 7,
            name: 'Settings',
            path: '/settings',
            icon: 'Settings',
            order: 7,
            permissions: ['read', 'update'],
            children: [
                { id: 71, name: 'Pengaturan Sistem', path: '/settings', permissions: ['read', 'update'] }
            ]
        },
        {
            id: 8,
            name: 'Profile',
            path: '/admin/profile',
            icon: 'User',
            order: 8,
            permissions: ['read', 'update'],
            children: [
                { id: 81, name: 'Data Pribadi', path: '/admin/profile', permissions: ['read', 'update'] }
            ]
        }
    ],
    owner: [
        {
            id: 1,
            name: 'Dashboard',
            path: '/dashboard',
            icon: 'Home',
            order: 1,
            permissions: ['read']
        },
        {
            id: 2,
            name: 'Poskas',
            path: '/owner/poskas',
            icon: 'DollarSign',
            order: 2,
            permissions: ['read'],
            children: [
                { id: 21, name: 'Daftar Poskas', path: '/owner/poskas', permissions: ['read'] }
            ]
        },
        {
            id: 3,
            name: 'Tim',
            path: '/owner/tim',
            icon: 'Users',
            order: 3,
            permissions: ['read'],
            children: [
                { id: 31, name: 'Tim Merah', path: '/owner/tim/merah', permissions: ['read'] },
                { id: 32, name: 'Tim Biru', path: '/owner/tim/biru', permissions: ['read'] }
            ]
        },
        {
            id: 4,
            name: 'Training',
            path: '/owner/training',
            icon: 'BookOpen',
            order: 4,
            permissions: ['read'],
            children: [
                { id: 41, name: 'Daftar Training', path: '/owner/training', permissions: ['read'] }
            ]
        },
        {
            id: 5,
            name: 'Keuangan',
            path: '/keuangan',
            icon: 'DollarSign',
            order: 5,
            permissions: ['read', 'create'],
            children: [
                { id: 51, name: 'Omset Harian', path: '/omset-harian', permissions: ['read', 'create'] },
                { id: 52, name: 'Laporan Keuangan', path: '/laporan-keuangan', permissions: ['read', 'create'] }
            ]
        },
        {
            id: 6,
            name: 'Profile',
            path: '/profile',
            icon: 'User',
            order: 6,
            permissions: ['read', 'update'],
            children: [
                { id: 61, name: 'Data Pribadi', path: '/profile', permissions: ['read', 'update'] },
                { id: 62, name: 'Ubah Password', path: '/profile/password', permissions: ['update'] }
            ]
        }
    ],
    leader: [
        {
            id: 1,
            name: 'Dashboard',
            path: '/dashboard',
            icon: 'Home',
            order: 1,
            permissions: ['read']
        },
        {
            id: 2,
            name: 'Chat',
            path: '/chat',
            icon: 'MessageCircle',
            order: 2,
            permissions: ['read', 'create'],
            children: [
                { id: 21, name: 'Private Chat', path: '/chat/private', permissions: ['read', 'create'] },
                { id: 22, name: 'Group Chat', path: '/chat/groups', permissions: ['read'] }
            ]
        },
        {
            id: 3,
            name: 'Komplain',
            path: '/komplain',
            icon: 'AlertTriangle',
            order: 3,
            permissions: ['read', 'create'],
            children: [
                { id: 31, name: 'Komplain Saya', path: '/komplain', permissions: ['read'] },
                { id: 32, name: 'Buat Komplain', path: '/komplain/new', permissions: ['create'] }
            ]
        },
        {
            id: 4,
            name: 'Tugas',
            path: '/tugas',
            icon: 'CheckSquare',
            order: 4,
            permissions: ['read', 'update'],
            children: [
                { id: 41, name: 'Tugas Saya', path: '/tugas', permissions: ['read'] },
                { id: 42, name: 'Update Status', path: '/tugas/update', permissions: ['update'] }
            ]
        },
        {
            id: 5,
            name: 'Keuangan',
            path: '/keuangan',
            icon: 'DollarSign',
            order: 5,
            permissions: ['read', 'create'],
            children: [
                { id: 51, name: 'Pos Kas Saya', path: '/poskas', permissions: ['read', 'create'] }
            ]
        },
        {
            id: 6,
            name: 'Pengumuman',
            path: '/pengumuman',
            icon: 'Megaphone',
            order: 6,
            permissions: ['read'],
            children: [
                { id: 61, name: 'Daftar Pengumuman', path: '/pengumuman', permissions: ['read'] }
            ]
        },
        {
            id: 7,
            name: 'Profile',
            path: '/profile',
            icon: 'User',
            order: 7,
            permissions: ['read', 'update'],
            children: [
                { id: 71, name: 'Data Pribadi', path: '/profile', permissions: ['read', 'update'] },
                { id: 72, name: 'Ubah Password', path: '/profile/password', permissions: ['update'] }
            ]
        }
    ],
    divisi: [
        {
            id: 1,
            name: 'Dashboard',
            path: '/dashboard',
            icon: 'Home',
            order: 1,
            permissions: ['read']
        },
        {
            id: 2,
            name: 'Chat',
            path: '/chat',
            icon: 'MessageCircle',
            order: 2,
            permissions: ['read', 'create'],
            children: [
                { id: 21, name: 'Private Chat', path: '/chat/private', permissions: ['read', 'create'] },
                { id: 22, name: 'Group Chat', path: '/chat/groups', permissions: ['read'] }
            ]
        },
        {
            id: 3,
            name: 'Komplain',
            path: '/komplain',
            icon: 'AlertTriangle',
            order: 3,
            permissions: ['read', 'create'],
            children: [
                { id: 31, name: 'Komplain Saya', path: '/komplain', permissions: ['read'] },
                { id: 32, name: 'Buat Komplain', path: '/komplain/new', permissions: ['create'] }
            ]
        },
        {
            id: 4,
            name: 'Tugas',
            path: '/tugas',
            icon: 'CheckSquare',
            order: 4,
            permissions: ['read', 'update'],
            children: [
                { id: 41, name: 'Tugas Saya', path: '/tugas', permissions: ['read'] },
                { id: 42, name: 'Update Status', path: '/tugas/update', permissions: ['update'] }
            ]
        },
        {
            id: 5,
            name: 'Keuangan',
            path: '/keuangan',
            icon: 'DollarSign',
            order: 5,
            permissions: ['read', 'create'],
            children: [
                { id: 51, name: 'Pos Kas Saya', path: '/poskas', permissions: ['read', 'create'] }
            ]
        },
        {
            id: 6,
            name: 'Pengumuman',
            path: '/pengumuman',
            icon: 'Megaphone',
            order: 6,
            permissions: ['read'],
            children: [
                { id: 61, name: 'Daftar Pengumuman', path: '/pengumuman', permissions: ['read'] }
            ]
        },
        {
            id: 7,
            name: 'Profile',
            path: '/profile',
            icon: 'User',
            order: 7,
            permissions: ['read', 'update'],
            children: [
                { id: 71, name: 'Data Pribadi', path: '/profile', permissions: ['read', 'update'] },
                { id: 72, name: 'Ubah Password', path: '/profile/password', permissions: ['update'] }
            ]
        }
    ]
}

// Helper function to get menus by role
export const getMenusByRole = (role) => {
    return defaultMenus[role] || defaultMenus.divisi
}

// Helper function to check permission
export const hasPermission = (userRole, requiredPermissions, userPermissions = []) => {
    if (!userRole || !requiredPermissions) return false

    const roleMenus = getMenusByRole(userRole)
    const menu = roleMenus.find(m => m.permissions)

    if (!menu) return false

    return requiredPermissions.every(permission =>
        menu.permissions.includes(permission) || userPermissions.includes(permission)
    )
} 