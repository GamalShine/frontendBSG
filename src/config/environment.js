// Environment Configuration - Updated to use centralized config
import { API_CONFIG, isDevelopment, isProduction } from './constants.js';

// Get current environment
const getCurrentEnvironment = () => {
    if (isDevelopment()) return 'development';
    if (isProduction()) return 'production';
    return 'development'; // Default fallback
};

// Get configuration for current environment
export const getEnvironmentConfig = () => {
    const env = getCurrentEnvironment();

    // Use centralized config from constants.js
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
export { isDevelopment, isProduction };

// Environment detection helpers
export const isDevelopmentEnv = () => isDevelopment();
export const isProductionEnv = () => isProduction();
export const isStagingEnv = () => import.meta.env.MODE === 'staging';

// Get current environment name
export const getCurrentEnv = () => getCurrentEnvironment();

export default getEnvironmentConfig; 