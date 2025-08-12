import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Eye, EyeOff, Lock, User, ArrowRight } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import LoadingSpinner from '../components/UI/LoadingSpinner'
import toast from 'react-hot-toast'
import Card, { CardBody } from '../components/UI/Card'
import Button from '../components/UI/Button'
import Input from '../components/UI/Input'

const Login = () => {
  console.log('🔍 Login component rendered - CLEAN VERSION')
  const navigate = useNavigate()
  const { login, isAuthenticated, loading: authLoading } = useAuth()
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  })
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    console.log('🔐 Clean login attempt started')

    // Validation
    if (!formData.username || !formData.password) {
      toast.error('Username dan password harus diisi!')
      return
    }

    setLoading(true)

    try {
      console.log('📤 Sending login request to API...')
      
      // Use real AuthContext login
      const user = await login({
        username: formData.username,
        password: formData.password
      })

      console.log('✅ Login successful:', user)
      
      // Check if user object exists and has required properties
      if (user && (user.nama || user.username)) {
        const displayName = user.nama || user.username || 'User'
        toast.success(`Selamat datang, ${displayName}!`)
      } else {
        toast.success('Login berhasil!')
      }
      
      // Navigate to dashboard
      console.log('🏠 Redirecting to dashboard...')
      navigate('/dashboard', { replace: true })

    } catch (error) {
      console.error('❌ Login error:', error)
      
      // Handle different types of errors
      if (error.response?.status === 401) {
        toast.error('Username atau password salah!')
      } else if (error.response?.status === 500) {
        toast.error('Server error. Silakan coba lagi.')
      } else if (error.code === 'NETWORK_ERROR' || !error.response) {
        toast.error('Tidak dapat terhubung ke server. Periksa koneksi internet Anda.')
      } else {
        toast.error(error.message || 'Terjadi kesalahan saat login')
      }
    } finally {
      setLoading(false)
    }
  }

  // Show loading if auth is still initializing
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <LoadingSpinner size="large" />
      </div>
    )
  }

  // Redirect if already authenticated
  if (isAuthenticated && !authLoading) {
    return <Navigate to="/dashboard" replace />
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-red-100 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Logo and Title */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
            <span className="text-white text-2xl font-bold">B</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Bosgil Group</h1>
          <p className="text-gray-600">Management System</p>
          <div className="flex items-center justify-center mt-3 space-x-2">
            <Shield className="w-4 h-4 text-green-600" />
            <span className="text-green-600 text-sm font-medium">Secure Login</span>
          </div>
        </div>

        {/* Login Card */}
        <Card className="shadow-xl border-0">
          <CardBody className="p-8">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-3">Masuk ke Akun</h2>
              <p className="text-gray-600 text-base">Masukkan kredensial Anda untuk melanjutkan</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Username Field */}
              <div className="space-y-2">
                <label htmlFor="username" className="block text-sm font-semibold text-gray-700">
                  Username
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="username"
                    name="username"
                    type="text"
                    value={formData.username}
                    onChange={handleChange}
                    placeholder="Masukkan username"
                    className="pl-10 pr-4 py-3 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all duration-200 text-gray-900 placeholder-gray-500"
                    required
                  />
                </div>
              </div>

              {/* Password Field */}
              <div className="space-y-2">
                <label htmlFor="password" className="block text-sm font-semibold text-gray-700">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Masukkan password"
                    className="pl-10 pr-12 py-3 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all duration-200 text-gray-900 placeholder-gray-500"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                    ) : (
                      <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                    )}
                  </button>
                </div>
              </div>

              {/* Login Button */}
              <Button
                type="submit"
                className="w-full py-3 text-lg font-semibold"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Memproses...
                  </>
                ) : (
                  <>
                    Masuk
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </>
                )}
              </Button>
            </form>

            {/* Demo Credentials */}
            <div className="mt-6 p-4 bg-red-50 rounded-lg">
              <h3 className="text-sm font-semibold text-red-900 mb-2">Demo Credentials:</h3>
              <div className="text-xs text-red-800 space-y-1">
                <p><strong>Admin:</strong> admin / password123</p>
                <p><strong>Owner:</strong> owner / password123</p>
                <p><strong>User:</strong> user / password123</p>
              </div>
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  )
}

export default Login 