import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api'

const api = axios.create({
    baseURL: API_BASE_URL,
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
    },
})

// Request interceptor to add auth token
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token')
        if (token) {
            config.headers.Authorization = `Bearer ${token}`
            console.log('🔑 Token added to request:', config.url)
        } else {
            console.log('⚠️ No token found for request:', config.url)
        }
        return config
    },
    (error) => {
        return Promise.reject(error)
    }
)

// Response interceptor to handle errors
api.interceptors.response.use(
    (response) => {
        return response
    },
    (error) => {
        console.log('🚨 API Error:', error.config?.url, error.response?.status, error.response?.data)

        // Only handle 401 errors for non-auth endpoints to avoid logout loops
        if (error.response?.status === 401) {
            const url = error.config?.url || ''
            if (!url.includes('/auth/login') && !url.includes('/auth/register')) {
                console.warn('Unauthorized request detected:', url)
                // Don't automatically clear storage or redirect
                // Let the component handle the error
            }
        }
        return Promise.reject(error)
    }
)

export default api 