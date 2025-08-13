// Test file untuk memverifikasi konfigurasi base URL terpusat
import { API_CONFIG, API_ENDPOINTS, getApiUrl, getWsUrl, getFrontendUrl, isDevelopment, isProduction } from '../config/constants'

export const testConfiguration = () => {
    console.log('🧪 Testing Centralized Configuration...')

    // Test 1: API Configuration
    console.log('📡 API Configuration:')
    console.log('   BASE_URL:', API_CONFIG.BASE_URL)
    console.log('   WS_URL:', API_CONFIG.WS_URL)
    console.log('   FRONTEND_URL:', API_CONFIG.FRONTEND_URL)
    console.log('   REQUEST_TIMEOUT:', API_CONFIG.TIMEOUT.REQUEST)
    console.log('   UPLOAD_TIMEOUT:', API_CONFIG.TIMEOUT.UPLOAD)

    // Test 2: Helper Functions
    console.log('🔧 Helper Functions:')
    console.log('   getApiUrl("/auth/login"):', getApiUrl('/auth/login'))
    console.log('   getWsUrl():', getWsUrl())
    console.log('   getFrontendUrl():', getFrontendUrl())

    // Test 3: API Endpoints
    console.log('🎯 API Endpoints:')
    console.log('   AUTH.LOGIN:', API_ENDPOINTS.AUTH.LOGIN)
    console.log('   POSKAS.LIST:', API_ENDPOINTS.POSKAS.LIST)
    console.log('   POSKAS.BY_ID(123):', API_ENDPOINTS.POSKAS.BY_ID(123))
    console.log('   CHAT.ROOM_MESSAGES("room123"):', API_ENDPOINTS.CHAT.ROOM_MESSAGES('room123'))

    // Test 4: Environment Detection
    console.log('🌍 Environment Detection:')
    console.log('   isDevelopment():', isDevelopment())
    console.log('   isProduction():', isProduction())

    // Test 5: Validation
    const validation = {
        hasBaseUrl: !!API_CONFIG.BASE_URL,
        hasWsUrl: !!API_CONFIG.WS_URL,
        hasFrontendUrl: !!API_CONFIG.FRONTEND_URL,
        hasAuthEndpoints: !!API_ENDPOINTS.AUTH,
        hasPoskasEndpoints: !!API_ENDPOINTS.POSKAS,
        hasChatEndpoints: !!API_ENDPOINTS.CHAT,
        helperFunctionsWork: typeof getApiUrl === 'function',
    }

    console.log('✅ Configuration Validation:', validation)

    // Test 6: URL Construction
    const testUrls = {
        login: getApiUrl(API_ENDPOINTS.AUTH.LOGIN),
        poskas: getApiUrl(API_ENDPOINTS.POSKAS.LIST),
        poskasById: getApiUrl(API_ENDPOINTS.POSKAS.BY_ID(123)),
        chatRooms: getApiUrl(API_ENDPOINTS.CHAT.ROOMS),
    }

    console.log('🔗 Constructed URLs:', testUrls)

    return {
        success: true,
        config: API_CONFIG,
        endpoints: API_ENDPOINTS,
        validation,
        testUrls,
        environment: {
            isDevelopment: isDevelopment(),
            isProduction: isProduction(),
        }
    }
}

// Auto-run test jika file diimport langsung
if (typeof window !== 'undefined') {
    // Browser environment
    window.testConfiguration = testConfiguration
    console.log('🚀 Configuration test ready. Run: window.testConfiguration()')
} else {
    // Node.js environment
    console.log('🚀 Configuration test ready. Run: testConfiguration()')
}

export default testConfiguration 