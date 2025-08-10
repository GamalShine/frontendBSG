import React, { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { Save, User, Mail, Shield, Eye, EyeOff } from 'lucide-react'
import Card, { CardHeader, CardBody } from '../components/UI/Card'
import Button from '../components/UI/Button'
import Input from '../components/UI/Input'
import Badge from '../components/UI/Badge'
import { ROLES_LABELS } from '../utils/constants'
import toast from 'react-hot-toast'

const Profile = () => {
  const { user, updateUser } = useAuth()
  const [isEditing, setIsEditing] = useState(false)
  const [loading, setLoading] = useState(false)
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  
  const [formData, setFormData] = useState({
    nama: user?.nama || '',
    email: user?.email || '',
    username: user?.username || '',
  })
  
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })
  
  const [errors, setErrors] = useState({})
  const [passwordErrors, setPasswordErrors] = useState({})

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }))
    }
  }

  const handlePasswordChange = (e) => {
    const { name, value } = e.target
    setPasswordData(prev => ({
      ...prev,
      [name]: value
    }))
    if (passwordErrors[name]) {
      setPasswordErrors(prev => ({
        ...prev,
        [name]: ''
      }))
    }
  }

  const validateForm = () => {
    const newErrors = {}
    
    if (!formData.nama.trim()) {
      newErrors.nama = 'Nama wajib diisi'
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email wajib diisi'
    } else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(formData.email)) {
      newErrors.email = 'Email tidak valid'
    }
    
    if (!formData.username.trim()) {
      newErrors.username = 'Username wajib diisi'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const validatePasswordForm = () => {
    const newErrors = {}
    
    if (!passwordData.currentPassword) {
      newErrors.currentPassword = 'Password saat ini wajib diisi'
    }
    
    if (!passwordData.newPassword) {
      newErrors.newPassword = 'Password baru wajib diisi'
    } else if (passwordData.newPassword.length < 6) {
      newErrors.newPassword = 'Password minimal 6 karakter'
    }
    
    if (!passwordData.confirmPassword) {
      newErrors.confirmPassword = 'Konfirmasi password wajib diisi'
    } else if (passwordData.newPassword !== passwordData.confirmPassword) {
      newErrors.confirmPassword = 'Password konfirmasi tidak cocok'
    }

    setPasswordErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    setLoading(true)
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // Update user data
      const updatedUser = { ...user, ...formData }
      updateUser(updatedUser)
      
      toast.success('Profile berhasil diperbarui!')
      setIsEditing(false)
    } catch (error) {
      console.error('Update profile error:', error)
      toast.error('Gagal memperbarui profile')
    } finally {
      setLoading(false)
    }
  }

  const handlePasswordSubmit = async (e) => {
    e.preventDefault()
    
    if (!validatePasswordForm()) {
      return
    }

    setLoading(true)
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      toast.success('Password berhasil diubah!')
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      })
    } catch (error) {
      console.error('Change password error:', error)
      toast.error('Gagal mengubah password')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="mb-4">
        <h1 className="text-2xl font-bold text-gray-900">Profile</h1>
        <p className="text-gray-600 mt-1">
          Kelola informasi profile dan keamanan akun Anda
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Profile Information */}
        <Card>
          <CardHeader>
            <h3 className="text-lg font-medium text-gray-900">Informasi Profile</h3>
          </CardHeader>
          <CardBody>
            {!isEditing ? (
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-primary-600 rounded-full flex items-center justify-center">
                    <User className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h4 className="text-lg font-medium text-gray-900">{user?.nama}</h4>
                    <p className="text-sm text-gray-500">{user?.email}</p>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-medium text-gray-700">Username</label>
                    <p className="text-sm text-gray-900">{user?.username}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Role</label>
                    <div className="mt-1">
                      <Badge variant="primary">
                        {ROLES_LABELS[user?.role]}
                      </Badge>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Status</label>
                    <div className="mt-1">
                      <Badge variant={user?.status === 'active' ? 'success' : 'danger'}>
                        {user?.status === 'active' ? 'Aktif' : 'Tidak Aktif'}
                      </Badge>
                    </div>
                  </div>
                </div>

                <Button onClick={() => setIsEditing(true)}>
                  <Save className="h-4 w-4 mr-2" />
                  Edit Profile
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <Input
                  label="Nama Lengkap"
                  name="nama"
                  value={formData.nama}
                  onChange={handleChange}
                  placeholder="Masukkan nama lengkap"
                  error={errors.nama}
                  required
                />
                <Input
                  label="Email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Masukkan email"
                  error={errors.email}
                  required
                />
                <Input
                  label="Username"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  placeholder="Masukkan username"
                  error={errors.username}
                  required
                />
                
                <div className="flex space-x-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsEditing(false)}
                    disabled={loading}
                  >
                    Batal
                  </Button>
                  <Button
                    type="submit"
                    loading={loading}
                    disabled={loading}
                  >
                    <Save className="h-4 w-4 mr-2" />
                    Simpan
                  </Button>
                </div>
              </form>
            )}
          </CardBody>
        </Card>

        {/* Change Password */}
        <Card>
          <CardHeader>
            <h3 className="text-lg font-medium text-gray-900">Ubah Password</h3>
          </CardHeader>
          <CardBody>
            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <div className="relative">
                <Input
                  label="Password Saat Ini"
                  name="currentPassword"
                  type={showCurrentPassword ? 'text' : 'password'}
                  value={passwordData.currentPassword}
                  onChange={handlePasswordChange}
                  placeholder="Masukkan password saat ini"
                  error={passwordErrors.currentPassword}
                  required
                />
                <button
                  type="button"
                  className="absolute right-3 top-8 text-gray-400 hover:text-gray-600"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                >
                  {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              
              <div className="relative">
                <Input
                  label="Password Baru"
                  name="newPassword"
                  type={showNewPassword ? 'text' : 'password'}
                  value={passwordData.newPassword}
                  onChange={handlePasswordChange}
                  placeholder="Masukkan password baru"
                  error={passwordErrors.newPassword}
                  required
                />
                <button
                  type="button"
                  className="absolute right-3 top-8 text-gray-400 hover:text-gray-600"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                >
                  {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              
              <div className="relative">
                <Input
                  label="Konfirmasi Password Baru"
                  name="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={passwordData.confirmPassword}
                  onChange={handlePasswordChange}
                  placeholder="Konfirmasi password baru"
                  error={passwordErrors.confirmPassword}
                  required
                />
                <button
                  type="button"
                  className="absolute right-3 top-8 text-gray-400 hover:text-gray-600"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              
              <Button
                type="submit"
                loading={loading}
                disabled={loading}
              >
                <Shield className="h-4 w-4 mr-2" />
                Ubah Password
              </Button>
            </form>
          </CardBody>
        </Card>
      </div>
    </div>
  )
}

export default Profile 