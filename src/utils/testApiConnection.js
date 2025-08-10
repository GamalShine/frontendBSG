import api from '../services/api'

export const testApiConnection = async () => {
    try {
        console.log('🧪 Testing API Connection...')

        // Test basic connection
        const response = await api.get('/keuangan-poskas')
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

    console.log('🔐 Auth Status:')
    console.log('   Token:', token ? 'Present' : 'Missing')
    console.log('   User:', user ? 'Present' : 'Missing')

    return {
        hasToken: !!token,
        hasUser: !!user,
        token: token,
        user: user ? JSON.parse(user) : null
    }
} 