import api from './api'

export const menuService = {
    // Get all menu items
    async getMenuItems(params = {}) {
        try {
            const response = await api.get('/pic-menu', { params })
            return response.data
        } catch (error) {
            throw error.response?.data || error.message
        }
    },

    // Get menu item by ID
    async getMenuItemById(id) {
        try {
            const response = await api.get(`/pic-menu/${id}`)
            return response.data
        } catch (error) {
            throw error.response?.data || error.message
        }
    },

    // Create new menu item
    async createMenuItem(menuData) {
        try {
            const response = await api.post('/pic-menu', menuData)
            return response.data
        } catch (error) {
            throw error.response?.data || error.message
        }
    },

    // Update menu item
    async updateMenuItem(id, menuData) {
        try {
            const response = await api.put(`/pic-menu/${id}`, menuData)
            return response.data
        } catch (error) {
            throw error.response?.data || error.message
        }
    },

    // Delete menu item
    async deleteMenuItem(id) {
        try {
            const response = await api.delete(`/pic-menu/${id}`)
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
    },

    // Get user permissions
    async getUserPermissions(userId) {
        try {
            const response = await api.get(`/pic-menu/permissions/${userId}`)
            return response.data
        } catch (error) {
            throw error.response?.data || error.message
        }
    },

    // Update user permissions
    async updateUserPermissions(userId, permissions) {
        try {
            const response = await api.put(`/pic-menu/permissions/${userId}`, { permissions })
            return response.data
        } catch (error) {
            throw error.response?.data || error.message
        }
    },

    // Get role permissions
    async getRolePermissions(role) {
        try {
            const response = await api.get(`/pic-menu/role-permissions/${role}`)
            return response.data
        } catch (error) {
            throw error.response?.data || error.message
        }
    },

    // Update role permissions
    async updateRolePermissions(role, permissions) {
        try {
            const response = await api.put(`/pic-menu/role-permissions/${role}`, { permissions })
            return response.data
        } catch (error) {
            throw error.response?.data || error.message
        }
    },

    // Get menu tree
    async getMenuTree(params = {}) {
        try {
            const response = await api.get('/pic-menu/tree', { params })
            return response.data
        } catch (error) {
            throw error.response?.data || error.message
        }
    },

    // Get menu breadcrumb
    async getMenuBreadcrumb(path) {
        try {
            const response = await api.get(`/pic-menu/breadcrumb`, { params: { path } })
            return response.data
        } catch (error) {
            throw error.response?.data || error.message
        }
    },

    // Search menu items
    async searchMenuItems(query, params = {}) {
        try {
            const response = await api.get('/pic-menu/search', {
                params: { q: query, ...params }
            })
            return response.data
        } catch (error) {
            throw error.response?.data || error.message
        }
    },

    // Get menu suggestions
    async getMenuSuggestions(query, params = {}) {
        try {
            const response = await api.get('/pic-menu/suggestions', {
                params: { q: query, ...params }
            })
            return response.data
        } catch (error) {
            throw error.response?.data || error.message
        }
    },

    // Export menu data
    async exportMenuData(params = {}) {
        try {
            const response = await api.get('/pic-menu/export', {
                params,
                responseType: 'blob'
            })
            return response.data
        } catch (error) {
            throw error.response?.data || error.message
        }
    },

    // Import menu data
    async importMenuData(file) {
        try {
            const formData = new FormData()
            formData.append('menu', file)

            const response = await api.post('/pic-menu/import', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            })
            return response.data
        } catch (error) {
            throw error.response?.data || error.message
        }
    },

    // Reset menu to default
    async resetMenuToDefault() {
        try {
            const response = await api.post('/pic-menu/reset')
            return response.data
        } catch (error) {
            throw error.response?.data || error.message
        }
    }
}

// Default menu structure based on roles - Updated to match backend features
export const defaultMenus = {
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
            name: 'Chat',
            path: '/chat',
            icon: 'MessageCircle',
            order: 2,
            permissions: ['read', 'create'],
            children: [
                { id: 21, name: 'Private Chat', path: '/chat/private', permissions: ['read', 'create'] },
                { id: 22, name: 'Group Chat', path: '/chat/groups', permissions: ['read', 'create'] },
                { id: 23, name: 'Buat Group', path: '/chat/groups/create', permissions: ['create'] }
            ]
        },
        {
            id: 3,
            name: 'Komplain',
            path: '/komplain',
            icon: 'AlertTriangle',
            order: 3,
            permissions: ['read', 'create', 'update', 'delete'],
            children: [
                { id: 31, name: 'Daftar Komplain', path: '/komplain', permissions: ['read'] },
                { id: 32, name: 'Buat Komplain', path: '/komplain/new', permissions: ['create'] },
                { id: 33, name: 'Admin Komplain', path: '/admin/komplain', permissions: ['read', 'update', 'delete'] }
            ]
        },
        {
            id: 4,
            name: 'Tugas',
            path: '/tugas',
            icon: 'CheckSquare',
            order: 4,
            permissions: ['read', 'create', 'update', 'delete'],
            children: [
                { id: 41, name: 'Daftar Tugas', path: '/tugas', permissions: ['read'] },
                { id: 42, name: 'Buat Tugas', path: '/tugas/new', permissions: ['create'] },
                { id: 43, name: 'Admin Tugas', path: '/admin/tugas', permissions: ['read', 'update', 'delete'] }
            ]
        },
        {
            id: 5,
            name: 'Keuangan',
            path: '/keuangan',
            icon: 'DollarSign',
            order: 5,
            permissions: ['read', 'create', 'update', 'delete'],
            children: [
                { id: 51, name: 'Pos Kas', path: '/poskas', permissions: ['read', 'create'] },
                { id: 52, name: 'Owner Pos Kas', path: '/owner/poskas', permissions: ['read', 'update', 'delete'] }
            ]
        },
        {
            id: 6,
            name: 'Pengumuman',
            path: '/pengumuman',
            icon: 'Megaphone',
            order: 6,
            permissions: ['read', 'create', 'update', 'delete'],
            children: [
                { id: 61, name: 'Daftar Pengumuman', path: '/pengumuman', permissions: ['read'] },
                { id: 62, name: 'Admin Pengumuman', path: '/admin/pengumuman', permissions: ['read', 'create', 'update', 'delete'] }
            ]
        },
        {
            id: 7,
            name: 'Tim Management',
            path: '/tim',
            icon: 'Users',
            order: 7,
            permissions: ['read', 'create', 'update', 'delete'],
            children: [
                { id: 71, name: 'Tim Merah', path: '/tim/merah', permissions: ['read', 'create', 'update', 'delete'] },
                { id: 72, name: 'Tim Biru', path: '/tim/biru', permissions: ['read', 'create', 'update', 'delete'] },
                { id: 73, name: 'Owner Tim', path: '/owner/tim', permissions: ['read', 'create', 'update', 'delete'] }
            ]
        },
        {
            id: 8,
            name: 'Training',
            path: '/training',
            icon: 'GraduationCap',
            order: 8,
            permissions: ['read', 'create', 'update', 'delete'],
            children: [
                { id: 81, name: 'Data Training', path: '/training', permissions: ['read'] },
                { id: 82, name: 'Admin Training', path: '/admin/training', permissions: ['read', 'create', 'update', 'delete'] },
                { id: 83, name: 'Owner Training', path: '/owner/training', permissions: ['read', 'create', 'update', 'delete'] }
            ]
        },
        {
            id: 9,
            name: 'Users',
            path: '/users',
            icon: 'UserCheck',
            order: 9,
            permissions: ['read', 'create', 'update', 'delete'],
            children: [
                { id: 91, name: 'Daftar Users', path: '/users', permissions: ['read'] },
                { id: 92, name: 'Tambah User', path: '/users/new', permissions: ['create'] },
                { id: 93, name: 'Admin Profile', path: '/admin/profile', permissions: ['read', 'update'] }
            ]
        },
        {
            id: 10,
            name: 'Settings',
            path: '/settings',
            icon: 'Settings',
            order: 10,
            permissions: ['read', 'update'],
            children: [
                { id: 101, name: 'Pengaturan Sistem', path: '/settings/system', permissions: ['read', 'update'] },
                { id: 102, name: 'Manajemen Role', path: '/settings/roles', permissions: ['read', 'create', 'update', 'delete'] }
            ]
        }
    ],

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
            name: 'Chat',
            path: '/chat',
            icon: 'MessageCircle',
            order: 2,
            permissions: ['read', 'create'],
            children: [
                { id: 21, name: 'Private Chat', path: '/chat/private', permissions: ['read', 'create'] },
                { id: 22, name: 'Group Chat', path: '/chat/groups', permissions: ['read', 'create'] },
                { id: 23, name: 'Buat Group', path: '/chat/groups/create', permissions: ['create'] }
            ]
        },
        {
            id: 3,
            name: 'Komplain',
            path: '/komplain',
            icon: 'AlertTriangle',
            order: 3,
            permissions: ['read', 'create', 'update', 'delete'],
            children: [
                { id: 31, name: 'Daftar Komplain', path: '/komplain', permissions: ['read'] },
                { id: 32, name: 'Buat Komplain', path: '/komplain/new', permissions: ['create'] },
                { id: 33, name: 'Admin Komplain', path: '/admin/komplain', permissions: ['read', 'update', 'delete'] }
            ]
        },
        {
            id: 4,
            name: 'Tugas',
            path: '/tugas',
            icon: 'CheckSquare',
            order: 4,
            permissions: ['read', 'create', 'update', 'delete'],
            children: [
                { id: 41, name: 'Daftar Tugas', path: '/tugas', permissions: ['read'] },
                { id: 42, name: 'Buat Tugas', path: '/tugas/new', permissions: ['create'] },
                { id: 43, name: 'Admin Tugas', path: '/admin/tugas', permissions: ['read', 'update', 'delete'] }
            ]
        },
        {
            id: 5,
            name: 'Keuangan',
            path: '/keuangan',
            icon: 'DollarSign',
            order: 5,
            permissions: ['read', 'create', 'update'],
            children: [
                { id: 51, name: 'Pos Kas', path: '/poskas', permissions: ['read', 'create'] }
            ]
        },
        {
            id: 6,
            name: 'Pengumuman',
            path: '/pengumuman',
            icon: 'Megaphone',
            order: 6,
            permissions: ['read', 'create', 'update', 'delete'],
            children: [
                { id: 61, name: 'Daftar Pengumuman', path: '/pengumuman', permissions: ['read'] },
                { id: 62, name: 'Admin Pengumuman', path: '/admin/pengumuman', permissions: ['read', 'create', 'update', 'delete'] }
            ]
        },
        {
            id: 7,
            name: 'Tim Management',
            path: '/tim',
            icon: 'Users',
            order: 7,
            permissions: ['read', 'create', 'update', 'delete'],
            children: [
                { id: 71, name: 'Tim Merah', path: '/tim/merah', permissions: ['read', 'create', 'update', 'delete'] },
                { id: 72, name: 'Tim Biru', path: '/tim/biru', permissions: ['read', 'create', 'update', 'delete'] }
            ]
        },
        {
            id: 8,
            name: 'Training',
            path: '/training',
            icon: 'GraduationCap',
            order: 8,
            permissions: ['read', 'create', 'update'],
            children: [
                { id: 81, name: 'Data Training', path: '/training', permissions: ['read'] },
                { id: 82, name: 'Admin Training', path: '/admin/training', permissions: ['read', 'create', 'update'] }
            ]
        },
        {
            id: 9,
            name: 'Users',
            path: '/users',
            icon: 'UserCheck',
            order: 9,
            permissions: ['read', 'create', 'update'],
            children: [
                { id: 91, name: 'Daftar Users', path: '/users', permissions: ['read'] },
                { id: 92, name: 'Tambah User', path: '/users/new', permissions: ['create'] },
                { id: 93, name: 'Admin Profile', path: '/admin/profile', permissions: ['read', 'update'] }
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
                { id: 22, name: 'Group Chat', path: '/chat/groups', permissions: ['read', 'create'] }
            ]
        },
        {
            id: 3,
            name: 'Komplain',
            path: '/komplain',
            icon: 'AlertTriangle',
            order: 3,
            permissions: ['read', 'create', 'update'],
            children: [
                { id: 31, name: 'Daftar Komplain', path: '/komplain', permissions: ['read'] },
                { id: 32, name: 'Buat Komplain', path: '/komplain/new', permissions: ['create'] }
            ]
        },
        {
            id: 4,
            name: 'Tugas',
            path: '/tugas',
            icon: 'CheckSquare',
            order: 4,
            permissions: ['read', 'create', 'update'],
            children: [
                { id: 41, name: 'Daftar Tugas', path: '/tugas', permissions: ['read'] },
                { id: 42, name: 'Buat Tugas', path: '/tugas/new', permissions: ['create'] }
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
                { id: 51, name: 'Pos Kas', path: '/poskas', permissions: ['read', 'create'] }
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
            name: 'Tim',
            path: '/tim',
            icon: 'Users',
            order: 7,
            permissions: ['read'],
            children: [
                { id: 71, name: 'Tim Merah', path: '/tim/merah', permissions: ['read'] },
                { id: 72, name: 'Tim Biru', path: '/tim/biru', permissions: ['read'] }
            ]
        },
        {
            id: 8,
            name: 'Profile',
            path: '/profile',
            icon: 'User',
            order: 8,
            permissions: ['read', 'update'],
            children: [
                { id: 81, name: 'Data Pribadi', path: '/profile', permissions: ['read', 'update'] },
                { id: 82, name: 'Ubah Password', path: '/profile/password', permissions: ['update'] }
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