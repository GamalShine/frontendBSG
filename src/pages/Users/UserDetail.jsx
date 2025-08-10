import React, { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { 
  User, 
  Mail, 
  Phone, 
  Shield, 
  Calendar, 
  Edit, 
  ArrowLeft,
  MapPin,
  Clock,
  Activity
} from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { formatDate } from '../../utils/helpers'
import Card, { CardHeader, CardBody } from '../../components/UI/Card'
import Button from '../../components/UI/Button'
import Badge from '../../components/UI/Badge'
import { userService } from '../../services/userService'
import toast from 'react-hot-toast'

const UserDetail = () => {
  const { id } = useParams()
  const { user: currentUser } = useAuth()
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadUser = async () => {
      try {
        setLoading(true)
        const response = await userService.getUserById(id)
        
        let userData = null
        if (response.success && response.data) {
          userData = response.data
        } else if (response.data) {
          userData = response.data
        } else {
          userData = response
        }
        
        setUser(userData)
      } catch (error) {
        console.error('Error loading user:', error)
        toast.error('Gagal memuat data pengguna')
      } finally {
        setLoading(false)
      }
    }

    if (id) {
      loadUser()
    }
  }, [id])

  const getRoleBadge = (role) => {
    const variants = {
      owner: 'danger',
      admin: 'warning',
      leader: 'info',
      divisi: 'success'
    }
    return <Badge variant={variants[role] || 'default'}>{role}</Badge>
  }

  const getStatusBadge = (status) => {
    const variants = {
      aktif: 'success',
      nonaktif: 'danger',
      pending: 'warning'
    }
    return <Badge variant={variants[status] || 'default'}>{status}</Badge>
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Memuat data pengguna...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="text-center py-12">
        <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Pengguna tidak ditemukan</h3>
        <p className="text-gray-500">Pengguna dengan ID tersebut tidak ditemukan.</p>
        <Link to="/users" className="mt-4 inline-flex items-center text-blue-600 hover:text-blue-700">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Kembali ke Daftar Pengguna
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link to="/users">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Kembali
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Detail Pengguna</h1>
            <p className="text-gray-600 mt-1">Informasi lengkap pengguna</p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          {getRoleBadge(user.role)}
          {getStatusBadge(user.status)}
          <Link to={`/users/${user.id}/edit`}>
            <Button size="sm">
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* User Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <h3 className="text-lg font-medium text-gray-900">Informasi Dasar</h3>
            </CardHeader>
            <CardBody>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex items-center space-x-3">
                  <User className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-500">Nama Lengkap</p>
                    <p className="text-sm text-gray-900">{user.nama || '-'}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Shield className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-500">Username</p>
                    <p className="text-sm text-gray-900">{user.username || '-'}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Mail className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-500">Email</p>
                    <p className="text-sm text-gray-900">{user.email || '-'}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Phone className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-500">Nomor Telepon</p>
                    <p className="text-sm text-gray-900">{user.phone || '-'}</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <MapPin className="h-5 w-5 text-gray-400 mt-1" />
                  <div>
                    <p className="text-sm font-medium text-gray-500">Alamat</p>
                    <p className="text-sm text-gray-900">{user.alamat || '-'}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Calendar className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-500">Tanggal Lahir</p>
                    <p className="text-sm text-gray-900">
                      {user.tanggal_lahir ? formatDate(user.tanggal_lahir) : '-'}
                    </p>
                  </div>
                </div>
              </div>
            </CardBody>
          </Card>

          {/* Account Information */}
          <Card>
            <CardHeader>
              <h3 className="text-lg font-medium text-gray-900">Informasi Akun</h3>
            </CardHeader>
            <CardBody>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-500">Status Akun</span>
                  {getStatusBadge(user.status)}
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-500">Role</span>
                  {getRoleBadge(user.role)}
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-500">Bergabung Sejak</span>
                  <span className="text-sm text-gray-900">
                    {user.created_at ? formatDate(user.created_at) : '-'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-500">Terakhir Login</span>
                  <span className="text-sm text-gray-900">
                    {user.last_login ? formatDate(user.last_login) : '-'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-500">Terakhir Update</span>
                  <span className="text-sm text-gray-900">
                    {user.updated_at ? formatDate(user.updated_at) : '-'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-500">Email Verified</span>
                  <Badge variant={user.email_verified ? 'success' : 'warning'}>
                    {user.email_verified ? 'Ya' : 'Tidak'}
                  </Badge>
                </div>
              </div>
            </CardBody>
          </Card>

          {/* Activity Summary */}
          <Card>
            <CardHeader>
              <h3 className="text-lg font-medium text-gray-900">Ringkasan Aktivitas</h3>
            </CardHeader>
            <CardBody>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Activity className="h-6 w-6 text-blue-600" />
                  </div>
                  <p className="text-2xl font-bold text-gray-900">0</p>
                  <p className="text-sm text-gray-500">Total Login</p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Clock className="h-6 w-6 text-green-600" />
                  </div>
                  <p className="text-2xl font-bold text-gray-900">0</p>
                  <p className="text-sm text-gray-500">Jam Online</p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Calendar className="h-6 w-6 text-purple-600" />
                  </div>
                  <p className="text-2xl font-bold text-gray-900">0</p>
                  <p className="text-sm text-gray-500">Aktivitas</p>
                </div>
              </div>
            </CardBody>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* User Avatar */}
          <Card>
            <CardBody className="text-center">
              <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <User className="h-12 w-12 text-blue-600" />
              </div>
              <h3 className="text-lg font-medium text-gray-900">{user.nama || user.username}</h3>
              <p className="text-sm text-gray-500 capitalize">{user.role || 'User'}</p>
              <div className="mt-3">
                {getStatusBadge(user.status)}
              </div>
            </CardBody>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <h3 className="text-lg font-medium text-gray-900">Aksi Cepat</h3>
            </CardHeader>
            <CardBody>
              <div className="space-y-2">
                <Button variant="outline" className="w-full justify-start">
                  <Mail className="h-4 w-4 mr-2" />
                  Kirim Email
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Shield className="h-4 w-4 mr-2" />
                  Reset Password
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Activity className="h-4 w-4 mr-2" />
                  Lihat Aktivitas
                </Button>
                {user.status === 'aktif' ? (
                  <Button variant="outline" className="w-full justify-start text-red-600 hover:text-red-700">
                    <Shield className="h-4 w-4 mr-2" />
                    Nonaktifkan
                  </Button>
                ) : (
                  <Button variant="outline" className="w-full justify-start text-green-600 hover:text-green-700">
                    <Shield className="h-4 w-4 mr-2" />
                    Aktifkan
                  </Button>
                )}
              </div>
            </CardBody>
          </Card>

          {/* System Info */}
          <Card>
            <CardHeader>
              <h3 className="text-lg font-medium text-gray-900">Informasi Sistem</h3>
            </CardHeader>
            <CardBody>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">User ID</span>
                  <span className="text-sm font-medium text-gray-900">#{user.id}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">Created By</span>
                  <span className="text-sm text-gray-900">-</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">IP Address</span>
                  <span className="text-sm text-gray-900">-</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">User Agent</span>
                  <span className="text-sm text-gray-900">-</span>
                </div>
              </div>
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default UserDetail 