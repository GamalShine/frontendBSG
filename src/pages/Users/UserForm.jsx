import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Save, Users, User, Mail, Lock } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import Card, { CardHeader, CardBody, CardFooter } from '../../components/UI/Card'
import Button from '../../components/UI/Button'
import Input from '../../components/UI/Input'
import Select from '../../components/UI/Select'
import { userService } from '../../services/userService'
import toast from 'react-hot-toast'

const UserForm = () => {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    nama: '',
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'divisi',
    status: 'active'
  })
  const [errors, setErrors] = useState({})

  const roleOptions = [
    { value: 'owner', label: 'Owner' },
    { value: 'admin', label: 'Admin' },
    { value: 'leader', label: 'Leader' },
    { value: 'divisi', label: 'Divisi' }
  ]

  const statusOptions = [
    { value: 'active', label: 'Active' },
    { value: 'inactive', label: 'Inactive' },
    { value: 'suspended', label: 'Suspended' }
  ]

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }))
    }
  }

  const validateForm = () => {
    const newErrors = {}
    
    if (!formData.nama.trim()) {
      newErrors.nama = 'Nama harus diisi'
    }
    
    if (!formData.username.trim()) {
      newErrors.username = 'Username harus diisi'
    } else if (formData.username.length < 3) {
      newErrors.username = 'Username minimal 3 karakter'
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email harus diisi'
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email tidak valid'
    }
    
    if (!formData.password) {
      newErrors.password = 'Password harus diisi'
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password minimal 6 karakter'
    }
    
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Password tidak cocok'
    }
    
    if (!formData.role) {
      newErrors.role = 'Role harus dipilih'
    }
    
    if (!formData.status) {
      newErrors.status = 'Status harus dipilih'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    setLoading(true)
    
    try {
      // Check if user is authenticated
      const token = localStorage.getItem('token')
      if (!token) {
        toast.error('Anda harus login terlebih dahulu')
        navigate('/login')
        return
      }

      console.log('🔑 Token available:', !!token)
      console.log('👤 Current user:', user)

      // Prepare data for API
      const userData = {
        nama: formData.nama,
        username: formData.username,
        email: formData.email,
        password: formData.password,
        role: formData.role,
        status: formData.status
      }

      console.log('📤 Sending user data:', userData)

      const response = await userService.createUser(userData)
      
      console.log('📥 Response from API:', response)
      
      if (response.success) {
        toast.success('User berhasil ditambahkan!')
        navigate('/users')
      } else {
        toast.error(response.message || 'Gagal menambahkan user')
      }
    } catch (error) {
      console.error('❌ Error adding user:', error)
      console.error('❌ Error details:', error.response?.data)
      toast.error('Gagal menambahkan user. Silakan coba lagi.')
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = () => {
    navigate('/users')
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleCancel}
            className="flex items-center"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Kembali
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Tambah User Baru</h1>
            <p className="text-gray-600 mt-1">Buat user baru untuk sistem</p>
          </div>
        </div>
      </div>

      {/* Form Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg mr-3">
              <Users className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h3 className="text-lg font-medium text-gray-900">Informasi User</h3>
              <p className="text-sm text-gray-600">Isi informasi lengkap user baru</p>
            </div>
          </div>
        </CardHeader>

        <form onSubmit={handleSubmit}>
          <CardBody>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Nama */}
              <Input
                label="Nama Lengkap"
                name="nama"
                value={formData.nama}
                onChange={handleChange}
                placeholder="Masukkan nama lengkap"
                error={errors.nama}
                required
              />

              {/* Username */}
              <Input
                label="Username"
                name="username"
                value={formData.username}
                onChange={handleChange}
                placeholder="Masukkan username"
                error={errors.username}
                required
              />

              {/* Email */}
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

              {/* Role */}
              <Select
                label="Role"
                name="role"
                value={formData.role}
                onChange={handleChange}
                options={roleOptions}
                placeholder="Pilih role"
                error={errors.role}
                required
              />

              {/* Password */}
              <Input
                label="Password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Masukkan password"
                error={errors.password}
                required
              />

              {/* Confirm Password */}
              <Input
                label="Konfirmasi Password"
                name="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Konfirmasi password"
                error={errors.confirmPassword}
                required
              />

              {/* Status */}
              <Select
                label="Status"
                name="status"
                value={formData.status}
                onChange={handleChange}
                options={statusOptions}
                placeholder="Pilih status"
                error={errors.status}
                required
              />
            </div>
          </CardBody>

          <CardFooter>
            <div className="flex items-center justify-end space-x-3">
              <Button
                type="button"
                variant="outline"
                onClick={handleCancel}
                disabled={loading}
              >
                Batal
              </Button>
              <Button
                type="submit"
                disabled={loading}
                className="flex items-center"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Menyimpan...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Simpan User
                  </>
                )}
              </Button>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}

export default UserForm 