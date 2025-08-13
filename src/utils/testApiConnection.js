import api from '../services/api'
import { API_ENDPOINTS } from '../config/constants'

export const testApiConnection = async () => {
    try {
        console.log('🧪 Testing API Connection...')

        // Test basic connection
        const response = await api.get(API_ENDPOINTS.POSKAS.LIST)
        console.log('✅ API connection successful')
        console.log('📊 Response:', response.data)

        return {
            success: true,
            data: response.data
        }
    } catch (error) {
        console.error('❌ API connection failed:', error)
        return {
            success: false,
            error: error.message
        }
    }
}

export const testAuthStatus = () => {
    const token = localStorage.getItem('token')
    const user = localStorage.getItem('user')

    return {
        hasToken: !!token,
        hasUser: !!user,
        token: token ? '***' + token.slice(-10) : null,
        user: user ? JSON.parse(user) : null
    }
}

export const testLoginFlow = async (credentials) => {
    try {
        console.log('🧪 Testing Login Flow...')

        // Test login
        const loginResponse = await api.post(API_ENDPOINTS.AUTH.LOGIN, credentials)

        if (loginResponse.data.success) {
            console.log('✅ Login successful')

            // Test getting user profile
            const profileResponse = await api.get(API_ENDPOINTS.USERS.PROFILE)
            console.log('✅ Profile fetch successful')

            return {
                success: true,
                login: loginResponse.data,
                profile: profileResponse.data
            }
        } else {
            return {
                success: false,
                error: 'Login failed'
            }
        }
    } catch (error) {
        console.error('❌ Login flow test failed:', error)
        return {
            success: false,
            error: error.message
        }
    }
} 