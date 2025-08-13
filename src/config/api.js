// API Configuration - Updated to use centralized config
import { API_CONFIG, API_ENDPOINTS, getApiUrl, getWsUrl, getFrontendUrl, isDevelopment, isProduction } from './constants.js';

// Export the centralized configuration
export const getEnvironmentConfig = () => {
    if (isDevelopment()) {
        return {
            BASE_URL: API_CONFIG.BASE_URL,
            API_BASE_URL: API_CONFIG.BASE_URL,
            FRONTEND_URL: API_CONFIG.FRONTEND_URL,
            UPLOAD_URLS: {
                POSKAS_IMAGES: `${API_CONFIG.BASE_URL.replace('/api', '')}/uploads/images/poskas`,
                GENERAL_IMAGES: `${API_CONFIG.BASE_URL.replace('/api', '')}/uploads/images`,
                DOCUMENTS: `${API_CONFIG.BASE_URL.replace('/api', '')}/uploads/documents`,
            },
        };
    }

    return {
        BASE_URL: API_CONFIG.BASE_URL,
        API_BASE_URL: API_CONFIG.BASE_URL,
        FRONTEND_URL: API_CONFIG.FRONTEND_URL,
        UPLOAD_URLS: {
            POSKAS_IMAGES: `${API_CONFIG.BASE_URL.replace('/api', '')}/uploads/images/poskas`,
            GENERAL_IMAGES: `${API_CONFIG.BASE_URL.replace('/api', '')}/uploads/images`,
            DOCUMENTS: `${API_CONFIG.BASE_URL.replace('/api', '')}/uploads/documents`,
        },
    };
};

// Re-export from constants for backward compatibility
export { API_CONFIG, API_ENDPOINTS, getApiUrl, getWsUrl, getFrontendUrl, isDevelopment, isProduction };

// Helper functions
export const getUploadUrl = (type, filename) => {
    const baseUrl = API_CONFIG.BASE_URL.replace('/api', '');
    return `${baseUrl}/uploads/${type}/${filename}`;
};

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