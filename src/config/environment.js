// Environment Configuration
const ENV_CONFIG = {
    // Development Environment
    development: {
        BASE_URL: 'http://localhost:3000',
        API_BASE_URL: 'http://localhost:3000/api',
        FRONTEND_URL: 'http://localhost:5173',
        UPLOAD_URLS: {
            POSKAS_IMAGES: 'http://localhost:3000/uploads/images/poskas',
            GENERAL_IMAGES: 'http://localhost:3000/uploads/images',
            DOCUMENTS: 'http://localhost:3000/uploads/documents',
        },
    },

    // Production Environment
    production: {
        BASE_URL: 'https://your-production-domain.com',
        API_BASE_URL: 'https://your-production-domain.com/api',
        FRONTEND_URL: 'https://your-production-domain.com',
        UPLOAD_URLS: {
            POSKAS_IMAGES: 'https://your-production-domain.com/uploads/images/poskas',
            GENERAL_IMAGES: 'https://your-production-domain.com/uploads/images',
            DOCUMENTS: 'https://your-production-domain.com/uploads/documents',
        },
    },

    // Staging Environment
    staging: {
        BASE_URL: 'https://your-staging-domain.com',
        API_BASE_URL: 'https://your-staging-domain.com/api',
        FRONTEND_URL: 'https://your-staging-domain.com',
        UPLOAD_URLS: {
            POSKAS_IMAGES: 'https://your-staging-domain.com/uploads/images/poskas',
            GENERAL_IMAGES: 'https://your-staging-domain.com/uploads/images',
            DOCUMENTS: 'https://your-staging-domain.com/uploads/documents',
        },
    },
};

// Get current environment
const getCurrentEnvironment = () => {
    if (import.meta.env.DEV) return 'development';
    if (import.meta.env.PROD) return 'production';
    return 'development'; // Default fallback
};

// Get configuration for current environment
export const getEnvironmentConfig = () => {
    const env = getCurrentEnvironment();
    return ENV_CONFIG[env] || ENV_CONFIG.development;
};

// Helper functions
export const isDevelopment = () => getCurrentEnvironment() === 'development';
export const isProduction = () => getCurrentEnvironment() === 'production';
export const isStaging = () => getCurrentEnvironment() === 'staging';

export default getEnvironmentConfig; 