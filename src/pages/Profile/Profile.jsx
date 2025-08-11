import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { userService } from '../../services/userService'
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar, 
  Shield,
  Edit,
  Save,
  X,
  Camera
} from 'lucide-react'
import toast from 'react-hot-toast'

const Profile = () => {
  const { user, updateUser } = useAuth()
  const [isEditing, setIsEditing] = useState(false)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    nama: '',
    username: '',
    email: '',
    phone: '',
    alamat: '',
    divisi: '',
    jabatan: ''
  })

  useEffect(() => {
    if (user) {
      setFormData({
        nama: user.nama || '',
        username: user.username || '',
        email: user.email || '',
        phone: user.phone || '',
        alamat: user.alamat || '',
        divisi: user.divisi || '',
        jabatan: user.jabatan || ''
      })
    }
  }, [user])

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      setLoading(true)
      const response = await userService.updateUser(user.id, formData)
      if (response.success) {
        toast.success('Profile berhasil diperbarui')
        updateUser(response.data)
        setIsEditing(false)
      }
    } catch (error) {
      toast.error('Gagal memperbarui profile')
      console.error('Error updating profile:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = () => {
    setFormData({
      nama: user.nama || '',
      username: user.username || '',
      email: user.email || '',
      phone: user.phone || '',
      alamat: user.alamat || '',
      divisi: user.divisi || '',
      jabatan: user.jabatan || ''
    })
    setIsEditing(false)
  }

  const getRoleText = (role) => {
    switch (role) {
      case 'owner':
        return 'Owner'
      case 'admin':
        return 'Admin'
      case 'leader':
        return 'Leader'
      case 'divisi':
        return 'Divisi'
      default:
        return 'Unknown'
    }
  }

  const getRoleColor = (role) => {
    switch (role) {
      case 'owner':
        return 'bg-purple-100 text-purple-800'
      case 'admin':
        return 'bg-red-100 text-red-800'
      case 'leader':
        return 'bg-blue-100 text-blue-800'
      case 'divisi':
        return 'bg-green-100 text-green-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  if (!user) {
    return (
      <div className="p-6">
        <div className="text-center">
          <p className="text-gray-600">Loading profile...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Profile</h1>
              <p className="text-gray-600">Kelola informasi profile Anda</p>
            </div>
            <div className="flex items-center space-x-2">
              <Link
                to="/profile/password"
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                Ubah Password
              </Link>
              {!isEditing ? (
                <button
                  onClick={() => setIsEditing(true)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center"
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Profile
                </button>
              ) : (
                <div className="flex items-center space-x-2">
                  <button
                    onClick={handleCancel}
                    className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors flex items-center"
                  >
                    <X className="h-4 w-4 mr-2" />
                    Batal
                  </button>
                  <button
                    onClick={handleSubmit}
                    disabled={loading}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors flex items-center"
                  >
                    <Save className="h-4 w-4 mr-2" />
                    {loading ? 'Menyimpan...' : 'Simpan'}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Profile Picture & Basic Info */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="text-center">
                <div className="relative inline-block">
                  <div className="w-32 h-32 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <User className="h-16 w-16 text-blue-600" />
                  </div>
                  {isEditing && (
                    <button className="absolute bottom-4 right-4 p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700">
                      <Camera className="h-4 w-4" />
                    </button>
                  )}
                </div>
                
                <h2 className="text-xl font-semibold text-gray-900 mb-2">{user.nama}</h2>
                <span className={`px-3 py-1 text-sm font-medium rounded-full ${getRoleColor(user.role)}`}>
                  {getRoleText(user.role)}
                </span>
                
                <div className="mt-4 space-y-2 text-sm text-gray-600">
                  <div className="flex items-center justify-center">
                    <Mail className="h-4 w-4 mr-2" />
                    <span>{user.email}</span>
                  </div>
                  <div className="flex items-center justify-center">
                    <Shield className="h-4 w-4 mr-2" />
                    <span>Bergabung sejak {formatDate(user.created_at)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Profile Details */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Informasi Pribadi</h3>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nama Lengkap
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        name="nama"
                        value={formData.nama}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required
                      />
                    ) : (
                      <p className="text-gray-900">{user.nama}</p>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Username
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        name="username"
                        value={formData.username}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required
                      />
                    ) : (
                      <p className="text-gray-900">{user.username}</p>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email
                    </label>
                    {isEditing ? (
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required
                      />
                    ) : (
                      <p className="text-gray-900">{user.email}</p>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nomor Telepon
                    </label>
                    {isEditing ? (
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    ) : (
                      <p className="text-gray-900">{user.phone || '-'}</p>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Divisi
                    </label>
                    {isEditing ? (
                      <select
                        name="divisi"
                        value={formData.divisi}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="">Pilih Divisi</option>
                        <option value="IT">IT</option>
                        <option value="HR">HR</option>
                        <option value="Finance">Finance</option>
                        <option value="Marketing">Marketing</option>
                        <option value="Operations">Operations</option>
                      </select>
                    ) : (
                      <p className="text-gray-900">{user.divisi || '-'}</p>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Jabatan
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        name="jabatan"
                        value={formData.jabatan}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    ) : (
                      <p className="text-gray-900">{user.jabatan || '-'}</p>
                    )}
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Alamat
                  </label>
                  {isEditing ? (
                    <textarea
                      name="alamat"
                      value={formData.alamat}
                      onChange={handleInputChange}
                      rows="3"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  ) : (
                    <p className="text-gray-900">{user.alamat || '-'}</p>
                  )}
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Profile 