import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { userService } from '../../services/userService'
import { 
  Lock, 
  Eye, 
  EyeOff, 
  ArrowLeft,
  Save
} from 'lucide-react'
import toast from 'react-hot-toast'

const ProfilePassword = () => {
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  })
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const togglePasswordVisibility = (field) => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field]
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    // Validation
    if (formData.newPassword !== formData.confirmPassword) {
      toast.error('Password baru dan konfirmasi password tidak cocok')
      return
    }

    if (formData.newPassword.length < 6) {
      toast.error('Password baru minimal 6 karakter')
      return
    }

    try {
      setLoading(true)
      const response = await userService.changePassword(user.id, {
        current_password: formData.currentPassword,
        new_password: formData.newPassword,
        confirm_password: formData.confirmPassword
      })
      
      if (response.success) {
        toast.success('Password berhasil diubah')
        setFormData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        })
      }
    } catch (error) {
      toast.error('Gagal mengubah password')
      console.error('Error changing password:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-6">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center space-x-4">
            <Link
              to="/profile"
              className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
            >
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Ubah Password</h1>
              <p className="text-gray-600">Perbarui password akun Anda</p>
            </div>
          </div>
        </div>

        {/* Password Form */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center mb-6">
            <div className="p-3 bg-blue-100 rounded-lg">
              <Lock className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <h2 className="text-lg font-semibold text-gray-900">Keamanan Password</h2>
              <p className="text-sm text-gray-600">Pastikan password Anda kuat dan aman</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Current Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password Saat Ini
              </label>
              <div className="relative">
                <input
                  type={showPasswords.current ? 'text' : 'password'}
                  name="currentPassword"
                  value={formData.currentPassword}
                  onChange={handleInputChange}
                  className="w-full pl-4 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Masukkan password saat ini"
                  required
                />
                <button
                  type="button"
                  onClick={() => togglePasswordVisibility('current')}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPasswords.current ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>

            {/* New Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password Baru
              </label>
              <div className="relative">
                <input
                  type={showPasswords.new ? 'text' : 'password'}
                  name="newPassword"
                  value={formData.newPassword}
                  onChange={handleInputChange}
                  className="w-full pl-4 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Masukkan password baru"
                  required
                />
                <button
                  type="button"
                  onClick={() => togglePasswordVisibility('new')}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPasswords.new ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
              <p className="mt-1 text-sm text-gray-500">
                Password minimal 6 karakter
              </p>
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Konfirmasi Password Baru
              </label>
              <div className="relative">
                <input
                  type={showPasswords.confirm ? 'text' : 'password'}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  className="w-full pl-4 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Konfirmasi password baru"
                  required
                />
                <button
                  type="button"
                  onClick={() => togglePasswordVisibility('confirm')}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPasswords.confirm ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
              {formData.newPassword && formData.confirmPassword && (
                <p className={`mt-1 text-sm ${
                  formData.newPassword === formData.confirmPassword 
                    ? 'text-green-600' 
                    : 'text-red-600'
                }`}>
                  {formData.newPassword === formData.confirmPassword 
                    ? '✓ Password cocok' 
                    : '✗ Password tidak cocok'
                  }
                </p>
              )}
            </div>

            {/* Password Requirements */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="text-sm font-medium text-gray-900 mb-2">Persyaratan Password:</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li className="flex items-center">
                  <span className={`w-2 h-2 rounded-full mr-2 ${
                    formData.newPassword.length >= 6 ? 'bg-green-500' : 'bg-gray-300'
                  }`}></span>
                  Minimal 6 karakter
                </li>
                <li className="flex items-center">
                  <span className={`w-2 h-2 rounded-full mr-2 ${
                    formData.newPassword !== formData.currentPassword ? 'bg-green-500' : 'bg-gray-300'
                  }`}></span>
                  Berbeda dengan password saat ini
                </li>
                <li className="flex items-center">
                  <span className={`w-2 h-2 rounded-full mr-2 ${
                    formData.newPassword === formData.confirmPassword && formData.confirmPassword ? 'bg-green-500' : 'bg-gray-300'
                  }`}></span>
                  Konfirmasi password cocok
                </li>
              </ul>
            </div>

            {/* Submit Button */}
            <div className="flex items-center justify-end space-x-3 pt-4">
              <Link
                to="/profile"
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Batal
              </Link>
              <button
                type="submit"
                disabled={loading || !formData.currentPassword || !formData.newPassword || !formData.confirmPassword}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center"
              >
                <Save className="h-4 w-4 mr-2" />
                {loading ? 'Mengubah Password...' : 'Ubah Password'}
              </button>
            </div>
          </form>
        </div>

        {/* Security Tips */}
        <div className="mt-6 bg-blue-50 rounded-lg p-4">
          <h3 className="text-sm font-medium text-blue-900 mb-2">Tips Keamanan:</h3>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Gunakan kombinasi huruf besar, huruf kecil, angka, dan simbol</li>
            <li>• Hindari menggunakan informasi pribadi dalam password</li>
            <li>• Jangan bagikan password Anda dengan siapapun</li>
            <li>• Ganti password secara berkala untuk keamanan</li>
          </ul>
        </div>
      </div>
    </div>
  )
}

export default ProfilePassword 