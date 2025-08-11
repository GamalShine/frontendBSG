// API Configuration
import { getEnvironmentConfig, isDevelopment, isProduction } from './environment.js';

const envConfig = getEnvironmentConfig();

const API_CONFIG = {
    // Base URLs from environment
    BASE_URL: envConfig.BASE_URL,
    API_BASE_URL: envConfig.API_BASE_URL,
    FRONTEND_URL: envConfig.FRONTEND_URL,

    // API Endpoints
    ENDPOINTS: {
        // Authentication
        LOGIN: '/auth/login',
        LOGOUT: '/auth/logout',
        REGISTER: '/auth/register',
        REFRESH_TOKEN: '/auth/refresh',

        // Users
        USERS: '/users',
        USERS_PROFILE: '/users/profile',
        USERS_UPDATE: '/users/update',

        // Poskas
        POSKAS: '/keuangan-poskas',
        POSKAS_UPLOAD: '/keuangan-poskas/upload',
        POSKAS_BY_ID: (id) => `/keuangan-poskas/${id}`,
        POSKAS_UPDATE: (id) => `/keuangan-poskas/${id}`,
        POSKAS_UPDATE_UPLOAD: (id) => `/keuangan-poskas/${id}/upload`,
        POSKAS_DELETE: (id) => `/keuangan-poskas/${id}`,

        // Tasks
        TASKS: '/daftar-tugas',
        TASKS_BY_ID: (id) => `/daftar-tugas/${id}`,

        // Complaints
        COMPLAINTS: '/daftar-komplain',
        COMPLAINTS_BY_ID: (id) => `/daftar-komplain/${id}`,

        // Announcements
        ANNOUNCEMENTS: '/pengumuman',
        ANNOUNCEMENTS_BY_ID: (id) => `/pengumuman/${id}`,

        // Chat
        CHAT_ROOMS: '/chat/rooms',
        CHAT_MESSAGES: '/chat/messages',
        CHAT_ROOM_MESSAGES: (roomId) => `/chat/rooms/${roomId}/messages`,

        // Health Check
        HEALTH: '/health',

        // File Upload
        UPLOAD_IMAGES: '/upload/images',
        UPLOAD_DOCUMENTS: '/upload/documents',
    },

    // File Upload URLs from environment
    UPLOAD_URLS: envConfig.UPLOAD_URLS,

    // Timeout settings
    TIMEOUT: {
        REQUEST: 10000, // 10 seconds
        UPLOAD: 30000,  // 30 seconds
    },

    // Pagination
    PAGINATION: {
        DEFAULT_PAGE: 1,
        DEFAULT_LIMIT: 10,
        MAX_LIMIT: 100,
    },
};

// Helper functions
export const getApiUrl = (endpoint) => {
    return `${API_CONFIG.API_BASE_URL}${endpoint}`;
};

export const getUploadUrl = (type, filename) => {
    const baseUrl = API_CONFIG.UPLOAD_URLS[type];
    return filename ? `${baseUrl}/${filename}` : baseUrl;
};

export const getPoskasImageUrl = (imagePath) => {
    if (!imagePath) return null;
    return `${API_CONFIG.BASE_URL}${imagePath}`;
};

// Environment detection
export const isDevelopmentEnv = () => isDevelopment();
export const isProductionEnv = () => isProduction();

// Dynamic configuration based on environment
export const getConfig = () => {
    if (isDevelopment()) {
        return {
            ...API_CONFIG,
            // Override for development if needed
        };
    }

    return API_CONFIG;
};

export default API_CONFIG; 