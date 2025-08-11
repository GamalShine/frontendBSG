import React, { useState, useEffect } from 'react'
import { useAuth } from '../../../contexts/AuthContext'
import { userService } from '../../../services/userService'
import { 
  User,
  Mail,
  Phone,
  MapPin,
  Edit,
  Save,
  X
} from 'lucide-react'
import Card, { CardHeader, CardBody } from '../../../components/UI/Card'
import Button from '../../../components/UI/Button'
import Input from '../../../components/UI/Input'
import Select from '../../../components/UI/Select'
import Badge from '../../../components/UI/Badge'
import toast from 'react-hot-toast'

const AdminProfile = () => {
  const { user, updateUser } = useAuth()
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [editing, setEditing] = useState(false)
  const [formData, setFormData] = useState({
    nama: '',
    username: '',
    email: '',
    phone: '',
    alamat: '',
    gender: ''
  })
  const [errors, setErrors] = useState({})

  useEffect(() => {
    loadProfile()
  }, [])

  const loadProfile = async () => {
    try {
      setLoading(true)
      const response = await userService.getProfile()
      
      if (response.success) {
        const data = response.data
        setFormData({
          nama: data.nama || '',
          username: data.username || '',
          email: data.email || '',
          phone: data.phone || '',
          alamat: data.alamat || '',
          gender: data.gender || ''
        })
      }
    } catch (error) {
      toast.error('Gagal memuat profil')
      console.error('Error loading profile:', error)
    } finally {
      setLoading(false)
    }
  }

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

  const validateForm = () => {
    const newErrors = {}

    if (!formData.nama.trim()) {
      newErrors.nama = 'Nama wajib diisi'
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email wajib diisi'
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email tidak valid'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!validateForm()) {
      toast.error('Mohon perbaiki kesalahan pada form')
      return
    }

    try {
      setSaving(true)
      
      const response = await userService.updateProfile(formData)

      if (response.success) {
        toast.success('Profil berhasil diperbarui')
        setEditing(false)
        updateUser(response.data)
      } else {
        toast.error(response.message || 'Gagal memperbarui profil')
      }
    } catch (error) {
      toast.error('Gagal memperbarui profil')
      console.error('Error updating profile:', error)
    } finally {
      setSaving(false)
    }
  }

  const getRoleBadge = (role) => {
    const variants = {
      owner: 'danger',
      admin: 'warning',
      leader: 'info',
      divisi: 'success'
    }
    return <Badge variant={variants[role] || 'default'}>{role}</Badge>
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Memuat profil...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Admin Profile</h1>
          <p className="text-gray-600">Kelola informasi profil Anda</p>
        </div>
        <div className="flex gap-2">
          {editing ? (
            <>
              <Button onClick={handleSubmit} disabled={saving}>
                <Save className="h-4 w-4 mr-2" />
                {saving ? 'Menyimpan...' : 'Simpan'}
              </Button>
              <Button variant="outline" onClick={() => setEditing(false)}>
                <X className="h-4 w-4 mr-2" />
                Batal
              </Button>
            </>
          ) : (
            <Button onClick={() => setEditing(true)}>
              <Edit className="h-4 w-4 mr-2" />
              Edit Profile
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Information */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold text-gray-900">Informasi Dasar</h3>
            </CardHeader>
            <CardBody>
              <form onSubmit={handleSubmit}>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Nama Lengkap *
                      </label>
                      <Input
                        name="nama"
                        value={formData.nama}
                        onChange={handleChange}
                        placeholder="Masukkan nama lengkap..."
                        error={errors.nama}
                        disabled={!editing}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Username
                      </label>
                      <Input
                        name="username"
                        value={formData.username}
                        onChange={handleChange}
                        placeholder="Username"
                        disabled={true}
                        className="bg-gray-50"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email *
                      </label>
                      <Input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="Masukkan email..."
                        error={errors.email}
                        disabled={!editing}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Nomor Telepon
                      </label>
                      <Input
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        placeholder="Masukkan nomor telepon..."
                        disabled={!editing}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Alamat
                    </label>
                    <Input
                      name="alamat"
                      value={formData.alamat}
                      onChange={handleChange}
                      placeholder="Masukkan alamat..."
                      disabled={!editing}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Jenis Kelamin
                    </label>
                    <Select
                      name="gender"
                      value={formData.gender}
                      onChange={handleChange}
                      disabled={!editing}
                    >
                      <option value="">Pilih jenis kelamin</option>
                      <option value="male">Laki-laki</option>
                      <option value="female">Perempuan</option>
                    </Select>
                  </div>
                </div>
              </form>
            </CardBody>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Profile Summary */}
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold text-gray-900">Ringkasan Profil</h3>
            </CardHeader>
            <CardBody>
              <div className="text-center space-y-4">
                <div className="h-24 w-24 rounded-full bg-blue-100 flex items-center justify-center mx-auto">
                  <User className="h-12 w-12 text-blue-600" />
                </div>

                <div>
                  <h4 className="text-lg font-semibold text-gray-900">{formData.nama || 'Nama'}</h4>
                  <p className="text-sm text-gray-600">{formData.username || 'username'}</p>
                  <div className="mt-2">
                    {getRoleBadge(user?.role || 'admin')}
                  </div>
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2 text-gray-600">
                    <Mail className="h-4 w-4" />
                    <span>{formData.email || 'email@example.com'}</span>
                  </div>
                  {formData.phone && (
                    <div className="flex items-center gap-2 text-gray-600">
                      <Phone className="h-4 w-4" />
                      <span>{formData.phone}</span>
                    </div>
                  )}
                  {formData.alamat && (
                    <div className="flex items-center gap-2 text-gray-600">
                      <MapPin className="h-4 w-4" />
                      <span>{formData.alamat}</span>
                    </div>
                  )}
                </div>
              </div>
            </CardBody>
          </Card>

          {/* Account Information */}
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold text-gray-900">Informasi Akun</h3>
            </CardHeader>
            <CardBody>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Role</span>
                  <span className="text-sm font-medium">{user?.role || 'admin'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Status</span>
                  <Badge variant="success">Active</Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Bergabung</span>
                  <span className="text-sm font-medium">
                    {user?.created_at ? new Date(user.created_at).toLocaleDateString('id-ID') : '-'}
                  </span>
                </div>
              </div>
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default AdminProfile 