// Single source of truth untuk semua URL dan konfigurasi
export const API_CONFIG = {
    // Base URLs dari environment variables
    BASE_URL: import.meta.env.VITE_API_BASE_URL || 'http://192.168.38.223:3000/api',
    WS_URL: import.meta.env.VITE_WS_URL || 'ws://192.168.38.223:3000',
    FRONTEND_URL: import.meta.env.VITE_FRONTEND_URL || 'http://192.168.38.223:5173',

    // Helper functions
    getUrl: (endpoint) => `${API_CONFIG.BASE_URL}${endpoint}`,
    getWsUrl: () => API_CONFIG.WS_URL,
    getFrontendUrl: () => API_CONFIG.FRONTEND_URL,

    // Timeout settings
    TIMEOUT: {
        REQUEST: 10000, // 10 seconds
        UPLOAD: 30000,  // 30 seconds
    },

    // Pagination defaults
    PAGINATION: {
        DEFAULT_PAGE: 1,
        DEFAULT_LIMIT: 10,
        MAX_LIMIT: 100,
    },
}

// API Endpoints - centralized
export const API_ENDPOINTS = {
    // Authentication
    AUTH: {
        LOGIN: '/auth/login',
        LOGOUT: '/auth/logout',
        REGISTER: '/auth/register',
        REFRESH_TOKEN: '/auth/refresh',
    },

    // Users
    USERS: {
        LIST: '/users',
        PROFILE: '/users/profile',
        UPDATE: '/users/update',
    },

    // Poskas
    POSKAS: {
        LIST: '/keuangan-poskas',
        UPLOAD: '/keuangan-poskas/upload',
        BY_ID: (id) => `/keuangan-poskas/${id}`,
        UPDATE: (id) => `/keuangan-poskas/${id}`,
        UPDATE_UPLOAD: (id) => `/keuangan-poskas/${id}/upload`,
        DELETE: (id) => `/keuangan-poskas/${id}`,
    },

    // Tasks
    TASKS: {
        LIST: '/daftar-tugas',
        BY_ID: (id) => `/daftar-tugas/${id}`,
    },

    // Complaints
    COMPLAINTS: {
        LIST: '/daftar-komplain',
        BY_ID: (id) => `/daftar-komplain/${id}`,
    },

    // Announcements
    ANNOUNCEMENTS: {
        LIST: '/pengumuman',
        BY_ID: (id) => `/pengumuman/${id}`,
    },

    // Training
    TRAINING: {
        LIST: '/admin/training',
        BY_ID: (id) => `/admin/training/${id}`,
        BY_TYPE: (type) => `/admin/training/type/${type}`,
        STATS: '/admin/training/stats',
        OWNER: '/owner/training',
        OWNER_STATS: '/owner/training/stats',
        OWNER_BY_STATUS: (status) => `/owner/training/status/${status}`,
    },

    // Tim
    TIM: {
        MERAH: '/tim-merah-biru/merah',
        BIRU: '/tim-merah-biru/biru',
        MERAH_BY_ID: (id) => `/tim-merah-biru/merah/${id}`,
        BIRU_BY_ID: (id) => `/tim-merah-biru/biru/${id}`,
        OWNER_MERAH: '/owner/tim-merah-biru/merah',
        OWNER_BIRU: '/owner/tim-merah-biru/biru',
    },

    // Settings
    SETTINGS: {
        LIST: '/settings',
        BY_ID: (id) => `/settings/${id}`,
    },

    // Omset Harian
    OMSET_HARIAN: {
        LIST: '/omset-harian',
        BY_ID: (id) => `/omset-harian/${id}`,
    },

    // Laporan Keuangan
    LAPORAN_KEUANGAN: {
        LIST: '/laporan-keuangan',
        BY_ID: (id) => `/laporan-keuangan/${id}`,
    },

    // Menu
    MENU: {
        LIST: '/pic-menu',
        BY_ID: (id) => `/pic-menu/${id}`,
    },

    // Chat
    CHAT: {
        ROOMS: '/chat/rooms',
        MESSAGES: '/chat/messages',
        ROOM_MESSAGES: (roomId) => `/chat/rooms/${roomId}/messages`,
        CONTACTS: '/chat/contacts',
        ROOM: '/chat/room',
        MESSAGE: '/chat/message',
        DELETE_ROOM: (roomId) => `/chat/room/${roomId}/delete`,
    },

    // Chat Group
    CHAT_GROUP: {
        LIST: '/chat-group',
        MESSAGES: (groupId) => `/chat-group/${groupId}/messages`,
    },

    // Upload
    UPLOAD: {
        IMAGES: '/upload/images',
        DOCUMENTS: '/upload/documents',
        GENERAL: '/upload',
    },

    // Health Check
    HEALTH: '/health',
}

// Helper function untuk mendapatkan full URL dengan endpoint
export const getApiUrl = (endpoint) => `${API_CONFIG.BASE_URL}${endpoint}`

// Helper function untuk mendapatkan WebSocket URL
export const getWsUrl = () => API_CONFIG.WS_URL

// Helper function untuk mendapatkan Frontend URL
export const getFrontendUrl = () => API_CONFIG.FRONTEND_URL

// Environment detection
export const isDevelopment = () => import.meta.env.DEV
export const isProduction = () => import.meta.env.PROD
export const isStaging = () => import.meta.env.MODE === 'staging'

// Default export
export default API_CONFIG 