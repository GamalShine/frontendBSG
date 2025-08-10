import api from './api'

export const menuService = {
    // Get menu permissions for current user
    async getMenuPermissions() {
        try {
            const response = await api.get('/menu/permissions')
            return response.data
        } catch (error) {
            console.error('Error fetching menu permissions:', error)
            return {
                success: false,
                data: []
            }
        }
    },

    // Get all available menus
    async getAllMenus() {
        try {
            const response = await api.get('/menu')
            return response.data
        } catch (error) {
            console.error('Error fetching menus:', error)
            return {
                success: false,
                data: []
            }
        }
    },

    // Get menus by role
    async getMenusByRole(role) {
        try {
            const response = await api.get(`/menu/role/${role}`)
            return response.data
        } catch (error) {
            console.error('Error fetching menus by role:', error)
            return {
                success: false,
                data: []
            }
        }
    }
}

// Default menu structure based on roles
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
            name: 'Komplain',
            path: '/komplain',
            icon: 'AlertTriangle',
            order: 2,
            permissions: ['read', 'create', 'update', 'delete'],
            children: [
                { id: 21, name: 'Daftar Komplain', path: '/komplain', permissions: ['read'] },
                { id: 22, name: 'Tambah Komplain', path: '/komplain/new', permissions: ['create'] }
            ]
        },
        {
            id: 3,
            name: 'Tugas',
            path: '/tugas',
            icon: 'CheckSquare',
            order: 3,
            permissions: ['read', 'create', 'update', 'delete'],
            children: [
                { id: 31, name: 'Daftar Tugas', path: '/tugas', permissions: ['read'] },
                { id: 32, name: 'Buat Tugas', path: '/tugas/new', permissions: ['create'] }
            ]
        },
        {
            id: 4,
            name: 'Pos Kas',
            path: '/poskas',
            icon: 'DollarSign',
            order: 4,
            permissions: ['read', 'create', 'update', 'delete'],
            children: [
                { id: 41, name: 'Daftar Pos Kas', path: '/poskas', permissions: ['read'] },
                { id: 42, name: 'Tambah Pos Kas', path: '/poskas/new', permissions: ['create'] }
            ]
        },
        {
            id: 5,
            name: 'Users',
            path: '/users',
            icon: 'Users',
            order: 5,
            permissions: ['read', 'create', 'update', 'delete'],
            children: [
                { id: 51, name: 'Daftar Users', path: '/users', permissions: ['read'] },
                { id: 52, name: 'Tambah User', path: '/users/new', permissions: ['create'] }
            ]
        },
        {
            id: 6,
            name: 'Laporan',
            path: '/laporan',
            icon: 'BarChart3',
            order: 6,
            permissions: ['read'],
            children: [
                { id: 61, name: 'Laporan Komplain', path: '/laporan/komplain', permissions: ['read'] },
                { id: 62, name: 'Laporan Tugas', path: '/laporan/tugas', permissions: ['read'] },
                { id: 63, name: 'Laporan Keuangan', path: '/laporan/keuangan', permissions: ['read'] }
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
                { id: 71, name: 'Pengaturan Sistem', path: '/settings/system', permissions: ['read', 'update'] },
                { id: 72, name: 'Manajemen Role', path: '/settings/roles', permissions: ['read', 'create', 'update', 'delete'] }
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
            name: 'Komplain',
            path: '/komplain',
            icon: 'AlertTriangle',
            order: 2,
            permissions: ['read', 'create', 'update', 'delete'],
            children: [
                { id: 21, name: 'Daftar Komplain', path: '/komplain', permissions: ['read'] },
                { id: 22, name: 'Tambah Komplain', path: '/komplain/new', permissions: ['create'] }
            ]
        },
        {
            id: 3,
            name: 'Tugas',
            path: '/tugas',
            icon: 'CheckSquare',
            order: 3,
            permissions: ['read', 'create', 'update', 'delete'],
            children: [
                { id: 31, name: 'Daftar Tugas', path: '/tugas', permissions: ['read'] },
                { id: 32, name: 'Buat Tugas', path: '/tugas/new', permissions: ['create'] }
            ]
        },
        {
            id: 4,
            name: 'Pos Kas',
            path: '/poskas',
            icon: 'DollarSign',
            order: 4,
            permissions: ['read', 'create', 'update', 'delete'],
            children: [
                { id: 41, name: 'Daftar Pos Kas', path: '/poskas', permissions: ['read'] },
                { id: 42, name: 'Tambah Pos Kas', path: '/poskas/new', permissions: ['create'] }
            ]
        },
        {
            id: 5,
            name: 'Users',
            path: '/users',
            icon: 'Users',
            order: 5,
            permissions: ['read', 'create', 'update'],
            children: [
                { id: 51, name: 'Daftar Users', path: '/users', permissions: ['read'] },
                { id: 52, name: 'Tambah User', path: '/users/new', permissions: ['create'] }
            ]
        },
        {
            id: 6,
            name: 'Laporan',
            path: '/laporan',
            icon: 'BarChart3',
            order: 6,
            permissions: ['read'],
            children: [
                { id: 61, name: 'Laporan Komplain', path: '/laporan/komplain', permissions: ['read'] },
                { id: 62, name: 'Laporan Tugas', path: '/laporan/tugas', permissions: ['read'] },
                { id: 63, name: 'Laporan Keuangan', path: '/laporan/keuangan', permissions: ['read'] }
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
            name: 'Komplain',
            path: '/komplain',
            icon: 'AlertTriangle',
            order: 2,
            permissions: ['read', 'create', 'update'],
            children: [
                { id: 21, name: 'Daftar Komplain', path: '/komplain', permissions: ['read'] },
                { id: 22, name: 'Tambah Komplain', path: '/komplain/new', permissions: ['create'] }
            ]
        },
        {
            id: 3,
            name: 'Tugas',
            path: '/tugas',
            icon: 'CheckSquare',
            order: 3,
            permissions: ['read', 'create', 'update'],
            children: [
                { id: 31, name: 'Daftar Tugas', path: '/tugas', permissions: ['read'] },
                { id: 32, name: 'Buat Tugas', path: '/tugas/new', permissions: ['create'] }
            ]
        },
        {
            id: 4,
            name: 'Pos Kas',
            path: '/poskas',
            icon: 'DollarSign',
            order: 4,
            permissions: ['read', 'create'],
            children: [
                { id: 41, name: 'Daftar Pos Kas', path: '/poskas', permissions: ['read'] },
                { id: 42, name: 'Tambah Pos Kas', path: '/poskas/new', permissions: ['create'] }
            ]
        },
        {
            id: 5,
            name: 'Tim',
            path: '/tim',
            icon: 'Users',
            order: 5,
            permissions: ['read'],
            children: [
                { id: 51, name: 'Anggota Tim', path: '/tim/members', permissions: ['read'] },
                { id: 52, name: 'Performa Tim', path: '/tim/performance', permissions: ['read'] }
            ]
        },
        {
            id: 6,
            name: 'Laporan',
            path: '/laporan',
            icon: 'BarChart3',
            order: 6,
            permissions: ['read'],
            children: [
                { id: 61, name: 'Laporan Tim', path: '/laporan/tim', permissions: ['read'] },
                { id: 62, name: 'Laporan Keuangan Tim', path: '/laporan/keuangan-tim', permissions: ['read'] }
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
            name: 'Komplain',
            path: '/komplain',
            icon: 'AlertTriangle',
            order: 2,
            permissions: ['read', 'create'],
            children: [
                { id: 21, name: 'Komplain Saya', path: '/komplain', permissions: ['read'] },
                { id: 22, name: 'Buat Komplain', path: '/komplain/new', permissions: ['create'] }
            ]
        },
        {
            id: 3,
            name: 'Tugas',
            path: '/tugas',
            icon: 'CheckSquare',
            order: 3,
            permissions: ['read', 'update'],
            children: [
                { id: 31, name: 'Tugas Saya', path: '/tugas', permissions: ['read'] },
                { id: 32, name: 'Update Status', path: '/tugas/update', permissions: ['update'] }
            ]
        },
        {
            id: 4,
            name: 'Pos Kas',
            path: '/poskas',
            icon: 'DollarSign',
            order: 4,
            permissions: ['read', 'create'],
            children: [
                { id: 41, name: 'Pos Kas Saya', path: '/poskas', permissions: ['read'] },
                { id: 42, name: 'Tambah Pos Kas', path: '/poskas/new', permissions: ['create'] }
            ]
        },
        {
            id: 5,
            name: 'Profile',
            path: '/profile',
            icon: 'User',
            order: 5,
            permissions: ['read', 'update'],
            children: [
                { id: 51, name: 'Data Pribadi', path: '/profile', permissions: ['read', 'update'] },
                { id: 52, name: 'Ubah Password', path: '/profile/password', permissions: ['update'] }
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