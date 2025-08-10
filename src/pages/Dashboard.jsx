import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { 
  AlertTriangle, 
  CheckSquare, 
  DollarSign, 
  MessageCircle, 
  TrendingUp, 
  TrendingDown,
  Clock,
  User,
  Users,
  Shield,
  BarChart3,
  FileText,
  Settings,
  Bell
} from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { formatDate } from '../utils/helpers'
import Card, { CardHeader, CardBody } from '../components/UI/Card'
import Badge from '../components/UI/Badge'
import Button from '../components/UI/Button'
import toast from 'react-hot-toast'

const Dashboard = () => {
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)

  // Debug logging
  console.log('🔍 Dashboard rendered')
  console.log('👤 User data:', user)
  console.log('🎭 User role:', user?.role)

  // Mock data for testing
  const mockStats = {
    totalKomplain: 12,
    totalTugas: 8,
    totalPoskas: 25,
    totalUsers: 15,
    unreadMessages: 3
  }

  const mockRecentKomplains = [
    { id: 1, judul_komplain: 'Masalah Printer', tanggal_pelaporan: new Date(), status: 'menunggu' },
    { id: 2, judul_komplain: 'Koneksi Internet Lambat', tanggal_pelaporan: new Date(), status: 'diproses' },
    { id: 3, judul_komplain: 'Software Error', tanggal_pelaporan: new Date(), status: 'selesai' }
  ]

  const mockRecentTugas = [
    { id: 1, judul_tugas: 'Update Database', target_selesai: new Date(), status: 'proses' },
    { id: 2, judul_tugas: 'Backup Server', target_selesai: new Date(), status: 'belum' },
    { id: 3, judul_tugas: 'Maintenance PC', target_selesai: new Date(), status: 'selesai' }
  ]

  const getStatusBadge = (status) => {
    const variants = {
      menunggu: 'warning',
      diproses: 'info',
      selesai: 'success',
      belum: 'danger',
      proses: 'warning'
    }
    return <Badge variant={variants[status] || 'default'}>{status}</Badge>
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

  // Show loading if no user data
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Memuat data pengguna...</p>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Memuat dashboard...</p>
        </div>
      </div>
    )
  }

  // Admin Dashboard
  if (user?.role === 'admin' || user?.role === 'owner') {
    console.log('🎯 Rendering Admin Dashboard')
    return (
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
            <p className="text-gray-600 mt-2">
              Selamat datang, {user?.nama || user?.username}! Kelola seluruh sistem
            </p>
          </div>
          <div className="flex items-center space-x-3">
            {getRoleBadge(user?.role)}
            <Badge variant="success">Administrator</Badge>
          </div>
        </div>
        
        {/* Admin Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          <Card className="hover:shadow-lg transition-shadow">
            <CardBody className="p-6">
              <div className="flex items-center">
                <div className="p-3 bg-red-100 rounded-lg">
                  <AlertTriangle className="h-6 w-6 text-red-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Komplain</p>
                  <p className="text-2xl font-bold text-gray-900">{mockStats.totalKomplain}</p>
                </div>
              </div>
            </CardBody>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardBody className="p-6">
              <div className="flex items-center">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <CheckSquare className="h-6 w-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Tugas</p>
                  <p className="text-2xl font-bold text-gray-900">{mockStats.totalTugas}</p>
                </div>
              </div>
            </CardBody>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardBody className="p-6">
              <div className="flex items-center">
                <div className="p-3 bg-green-100 rounded-lg">
                  <DollarSign className="h-6 w-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Pos Kas</p>
                  <p className="text-2xl font-bold text-gray-900">{mockStats.totalPoskas}</p>
                </div>
              </div>
            </CardBody>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardBody className="p-6">
              <div className="flex items-center">
                <div className="p-3 bg-purple-100 rounded-lg">
                  <Users className="h-6 w-6 text-purple-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Users</p>
                  <p className="text-2xl font-bold text-gray-900">{mockStats.totalUsers}</p>
                </div>
              </div>
            </CardBody>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardBody className="p-6">
              <div className="flex items-center">
                <div className="p-3 bg-orange-100 rounded-lg">
                  <BarChart3 className="h-6 w-6 text-orange-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Sistem Status</p>
                  <p className="text-2xl font-bold text-green-600">Online</p>
                </div>
              </div>
            </CardBody>
          </Card>
        </div>

        {/* Admin Quick Actions */}
        <Card>
          <CardHeader>
            <h3 className="text-xl font-semibold text-gray-900">Aksi Cepat</h3>
          </CardHeader>
          <CardBody>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Link to="/komplain/new">
                <div className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer">
                  <AlertTriangle className="h-6 w-6 text-red-500 mr-3" />
                  <span className="text-sm font-medium text-gray-900">Tambah Komplain</span>
                </div>
              </Link>
              <Link to="/tugas/new">
                <div className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer">
                  <CheckSquare className="h-6 w-6 text-blue-500 mr-3" />
                  <span className="text-sm font-medium text-gray-900">Buat Tugas</span>
                </div>
              </Link>
              <Link to="/poskas/new">
                <div className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer">
                  <DollarSign className="h-6 w-6 text-green-500 mr-3" />
                  <span className="text-sm font-medium text-gray-900">Tambah Pos Kas</span>
                </div>
              </Link>
              <Link to="/users/new">
                <div className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer">
                  <User className="h-6 w-6 text-purple-500 mr-3" />
                  <span className="text-sm font-medium text-gray-900">Tambah User</span>
                </div>
              </Link>
            </div>
          </CardBody>
        </Card>

        {/* Recent Activities */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Komplain Terbaru</h3>
                <Link to="/komplain">
                  <Button variant="ghost" size="sm">Lihat Semua</Button>
                </Link>
              </div>
            </CardHeader>
            <CardBody>
              <div className="space-y-4">
                {mockRecentKomplains.map((komplain) => (
                  <div key={komplain.id} className="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                        <AlertTriangle className="h-4 w-4 text-red-600" />
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {komplain.judul_komplain}
                      </p>
                      <p className="text-sm text-gray-500">
                        {formatDate(komplain.tanggal_pelaporan)}
                      </p>
                    </div>
                    <div className="flex-shrink-0">
                      {getStatusBadge(komplain.status)}
                    </div>
                  </div>
                ))}
              </div>
            </CardBody>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Tugas Terbaru</h3>
                <Link to="/tugas">
                  <Button variant="ghost" size="sm">Lihat Semua</Button>
                </Link>
              </div>
            </CardHeader>
            <CardBody>
              <div className="space-y-4">
                {mockRecentTugas.map((tugas) => (
                  <div key={tugas.id} className="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <CheckSquare className="h-4 w-4 text-blue-600" />
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {tugas.judul_tugas}
                      </p>
                      <p className="text-sm text-gray-500">
                        Target: {formatDate(tugas.target_selesai)}
                      </p>
                    </div>
                    <div className="flex-shrink-0">
                      {getStatusBadge(tugas.status)}
                    </div>
                  </div>
                ))}
              </div>
            </CardBody>
          </Card>
        </div>
      </div>
    )
  }

  // Leader Dashboard
  if (user?.role === 'leader') {
    console.log('🎯 Rendering Leader Dashboard')
    return (
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Leader Dashboard</h1>
            <p className="text-gray-600 mt-2">
              Selamat datang, {user?.nama || user?.username}! Kelola tim Anda
            </p>
          </div>
          <div className="flex items-center space-x-3">
            {getRoleBadge(user?.role)}
            <Badge variant="info">Team Leader</Badge>
          </div>
        </div>
        
        {/* Leader Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="hover:shadow-lg transition-shadow">
            <CardBody className="p-6">
              <div className="flex items-center">
                <div className="p-3 bg-orange-100 rounded-lg">
                  <AlertTriangle className="h-6 w-6 text-orange-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Komplain Tim</p>
                  <p className="text-2xl font-bold text-gray-900">{mockStats.totalKomplain}</p>
                </div>
              </div>
            </CardBody>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardBody className="p-6">
              <div className="flex items-center">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <CheckSquare className="h-6 w-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Tugas Tim</p>
                  <p className="text-2xl font-bold text-gray-900">{mockStats.totalTugas}</p>
                </div>
              </div>
            </CardBody>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardBody className="p-6">
              <div className="flex items-center">
                <div className="p-3 bg-green-100 rounded-lg">
                  <DollarSign className="h-6 w-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Pos Kas</p>
                  <p className="text-2xl font-bold text-gray-900">{mockStats.totalPoskas}</p>
                </div>
              </div>
            </CardBody>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardBody className="p-6">
              <div className="flex items-center">
                <div className="p-3 bg-purple-100 rounded-lg">
                  <Users className="h-6 w-6 text-purple-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Anggota Tim</p>
                  <p className="text-2xl font-bold text-gray-900">8</p>
                </div>
              </div>
            </CardBody>
          </Card>
        </div>

        {/* Leader Quick Actions */}
        <Card>
          <CardHeader>
            <h3 className="text-xl font-semibold text-gray-900">Aksi Tim</h3>
          </CardHeader>
          <CardBody>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Link to="/komplain/new">
                <div className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer">
                  <AlertTriangle className="h-6 w-6 text-orange-500 mr-3" />
                  <span className="text-sm font-medium text-gray-900">Buat Komplain</span>
                </div>
              </Link>
              <Link to="/tugas/new">
                <div className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer">
                  <CheckSquare className="h-6 w-6 text-blue-500 mr-3" />
                  <span className="text-sm font-medium text-gray-900">Assign Tugas</span>
                </div>
              </Link>
              <Link to="/poskas/new">
                <div className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer">
                  <DollarSign className="h-6 w-6 text-green-500 mr-3" />
                  <span className="text-sm font-medium text-gray-900">Laporan Keuangan</span>
                </div>
              </Link>
            </div>
          </CardBody>
        </Card>

        {/* Recent Activities */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Komplain Tim</h3>
                <Link to="/komplain">
                  <Button variant="ghost" size="sm">Lihat Semua</Button>
                </Link>
              </div>
            </CardHeader>
            <CardBody>
              <div className="space-y-4">
                {mockRecentKomplains.map((komplain) => (
                  <div key={komplain.id} className="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                        <AlertTriangle className="h-4 w-4 text-orange-600" />
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {komplain.judul_komplain}
                      </p>
                      <p className="text-sm text-gray-500">
                        {formatDate(komplain.tanggal_pelaporan)}
                      </p>
                    </div>
                    <div className="flex-shrink-0">
                      {getStatusBadge(komplain.status)}
                    </div>
                  </div>
                ))}
              </div>
            </CardBody>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Tugas Tim</h3>
                <Link to="/tugas">
                  <Button variant="ghost" size="sm">Lihat Semua</Button>
                </Link>
              </div>
            </CardHeader>
            <CardBody>
              <div className="space-y-4">
                {mockRecentTugas.map((tugas) => (
                  <div key={tugas.id} className="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <CheckSquare className="h-4 w-4 text-blue-600" />
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {tugas.judul_tugas}
                      </p>
                      <p className="text-sm text-gray-500">
                        Target: {formatDate(tugas.target_selesai)}
                      </p>
                    </div>
                    <div className="flex-shrink-0">
                      {getStatusBadge(tugas.status)}
                    </div>
                  </div>
                ))}
              </div>
            </CardBody>
          </Card>
        </div>
      </div>
    )
  }

  // Divisi Dashboard (Default)
  console.log('🎯 Rendering Divisi Dashboard')
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Dashboard</h1>
          <p className="text-gray-600 mt-2">
            Selamat datang, {user?.nama || user?.username}! Kelola aktivitas Anda
          </p>
        </div>
        <div className="flex items-center space-x-3">
          {getRoleBadge(user?.role)}
          <Badge variant="success">Staff</Badge>
        </div>
      </div>
      
      {/* Divisi Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="hover:shadow-lg transition-shadow">
          <CardBody className="p-6">
            <div className="flex items-center">
              <div className="p-3 bg-orange-100 rounded-lg">
                <AlertTriangle className="h-6 w-6 text-orange-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Komplain Saya</p>
                <p className="text-2xl font-bold text-gray-900">3</p>
              </div>
            </div>
          </CardBody>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardBody className="p-6">
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 rounded-lg">
                <CheckSquare className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Tugas Saya</p>
                <p className="text-2xl font-bold text-gray-900">5</p>
              </div>
            </div>
          </CardBody>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardBody className="p-6">
            <div className="flex items-center">
              <div className="p-3 bg-green-100 rounded-lg">
                <DollarSign className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Pos Kas Saya</p>
                <p className="text-2xl font-bold text-gray-900">12</p>
              </div>
            </div>
          </CardBody>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardBody className="p-6">
            <div className="flex items-center">
              <div className="p-3 bg-purple-100 rounded-lg">
                <Bell className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Notifikasi</p>
                <p className="text-2xl font-bold text-gray-900">{mockStats.unreadMessages}</p>
              </div>
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Divisi Quick Actions */}
      <Card>
        <CardHeader>
          <h3 className="text-xl font-semibold text-gray-900">Aksi Cepat</h3>
        </CardHeader>
        <CardBody>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link to="/komplain/new">
              <div className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer">
                <AlertTriangle className="h-6 w-6 text-orange-500 mr-3" />
                <span className="text-sm font-medium text-gray-900">Buat Komplain</span>
              </div>
            </Link>
            <Link to="/poskas/new">
              <div className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer">
                <DollarSign className="h-6 w-6 text-green-500 mr-3" />
                <span className="text-sm font-medium text-gray-900">Laporan Keuangan</span>
              </div>
            </Link>
            <Link to="/profile">
              <div className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer">
                <User className="h-6 w-6 text-purple-500 mr-3" />
                <span className="text-sm font-medium text-gray-900">Update Profile</span>
              </div>
            </Link>
          </div>
        </CardBody>
      </Card>

      {/* My Activities */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Komplain Saya</h3>
              <Link to="/komplain">
                <Button variant="ghost" size="sm">Lihat Semua</Button>
              </Link>
            </div>
          </CardHeader>
          <CardBody>
            <div className="space-y-4">
              {mockRecentKomplains.slice(0, 3).map((komplain) => (
                <div key={komplain.id} className="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                      <AlertTriangle className="h-4 w-4 text-orange-600" />
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {komplain.judul_komplain}
                    </p>
                    <p className="text-sm text-gray-500">
                      {formatDate(komplain.tanggal_pelaporan)}
                    </p>
                  </div>
                  <div className="flex-shrink-0">
                    {getStatusBadge(komplain.status)}
                  </div>
                </div>
              ))}
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Tugas Saya</h3>
              <Link to="/tugas">
                <Button variant="ghost" size="sm">Lihat Semua</Button>
              </Link>
            </div>
          </CardHeader>
          <CardBody>
            <div className="space-y-4">
              {mockRecentTugas.slice(0, 3).map((tugas) => (
                <div key={tugas.id} className="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <CheckSquare className="h-4 w-4 text-blue-600" />
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {tugas.judul_tugas}
                    </p>
                    <p className="text-sm text-gray-500">
                      Target: {formatDate(tugas.target_selesai)}
                    </p>
                  </div>
                  <div className="flex-shrink-0">
                    {getStatusBadge(tugas.status)}
                  </div>
                </div>
              ))}
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  )
}

export default Dashboard 