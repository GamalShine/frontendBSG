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
import { komplainService } from '../services/komplainService'
import { tugasService } from '../services/tugasService'
import { poskasService } from '../services/poskasService'
import { userService } from '../services/userService'
import toast from 'react-hot-toast'

const Dashboard = () => {
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    totalKomplain: 0,
    totalTugas: 0,
    totalPoskas: 0,
    totalUsers: 0,
    unreadMessages: 0
  })
  const [recentKomplains, setRecentKomplains] = useState([])
  const [recentTugas, setRecentTugas] = useState([])
  const [myKomplains, setMyKomplains] = useState([])
  const [myTugas, setMyTugas] = useState([])

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setLoading(true)
        
        // Load data based on user role
        if (user?.role === 'admin' || user?.role === 'owner') {
          // Admin sees all data
          const [komplainsRes, tugasRes, poskasRes, usersRes] = await Promise.allSettled([
            komplainService.getKomplains(),
            tugasService.getTugas(),
            poskasService.getPoskas(),
            userService.getUsers()
          ])

          // Process komplains
          let komplains = []
          if (komplainsRes.status === 'fulfilled') {
            const response = komplainsRes.value
            if (response.success && response.data) {
              komplains = response.data
            } else if (Array.isArray(response)) {
              komplains = response
            } else if (response.data && Array.isArray(response.data)) {
              komplains = response.data
            }
          }

          // Process tugas
          let tugas = []
          if (tugasRes.status === 'fulfilled') {
            const response = tugasRes.value
            if (response.success && response.data) {
              tugas = response.data
            } else if (Array.isArray(response)) {
              tugas = response
            } else if (response.data && Array.isArray(response.data)) {
              tugas = response.data
            }
          }

          // Process poskas
          let poskas = []
          if (poskasRes.status === 'fulfilled') {
            const response = poskasRes.value
            if (response.success && response.data) {
              poskas = response.data
            } else if (Array.isArray(response)) {
              poskas = response
            } else if (response.data && Array.isArray(response.data)) {
              poskas = response.data
            }
          }

          // Process users
          let users = []
          if (usersRes.status === 'fulfilled') {
            const response = usersRes.value
            if (response.success && response.data) {
              users = response.data
            } else if (Array.isArray(response)) {
              users = response
            } else if (response.data && Array.isArray(response.data)) {
              users = response.data
            }
          }

          setStats({
            totalKomplain: komplains.length,
            totalTugas: tugas.length,
            totalPoskas: poskas.length,
            totalUsers: users.length,
            unreadMessages: 0
          })

          setRecentKomplains(komplains.slice(0, 5))
          setRecentTugas(tugas.slice(0, 5))

        } else if (user?.role === 'leader') {
          // Leader sees team data and their own data
          const [komplainsRes, tugasRes, poskasRes] = await Promise.allSettled([
            komplainService.getKomplains(),
            tugasService.getTugas(),
            poskasService.getPoskas()
          ])

          let komplains = []
          let tugas = []
          let poskas = []

          if (komplainsRes.status === 'fulfilled') {
            const response = komplainsRes.value
            if (response.success && response.data) {
              komplains = response.data
            } else if (Array.isArray(response)) {
              komplains = response
            } else if (response.data && Array.isArray(response.data)) {
              komplains = response.data
            }
          }

          if (tugasRes.status === 'fulfilled') {
            const response = tugasRes.value
            if (response.success && response.data) {
              tugas = response.data
            } else if (Array.isArray(response)) {
              tugas = response
            } else if (response.data && Array.isArray(response.data)) {
              tugas = response.data
            }
          }

          if (poskasRes.status === 'fulfilled') {
            const response = poskasRes.value
            if (response.success && response.data) {
              poskas = response.data
            } else if (Array.isArray(response)) {
              poskas = response
            } else if (response.data && Array.isArray(response.data)) {
              poskas = response.data
            }
          }

          setStats({
            totalKomplain: komplains.length,
            totalTugas: tugas.length,
            totalPoskas: poskas.length,
            totalUsers: 0,
            unreadMessages: 0
          })

          setRecentKomplains(komplains.slice(0, 5))
          setRecentTugas(tugas.slice(0, 5))

        } else {
          // Divisi sees only their own data
          const [myKomplainsRes, myTugasRes, poskasRes] = await Promise.allSettled([
            komplainService.getKomplains(),
            tugasService.getTugas(),
            poskasService.getPoskas()
          ])

          let allKomplains = []
          let allTugas = []
          let poskas = []

          if (myKomplainsRes.status === 'fulfilled') {
            const response = myKomplainsRes.value
            if (response.success && response.data) {
              allKomplains = response.data
            } else if (Array.isArray(response)) {
              allKomplains = response
            } else if (response.data && Array.isArray(response.data)) {
              allKomplains = response.data
            }
          }

          if (myTugasRes.status === 'fulfilled') {
            const response = myTugasRes.value
            if (response.success && response.data) {
              allTugas = response.data
            } else if (Array.isArray(response)) {
              allTugas = response
            } else if (response.data && Array.isArray(response.data)) {
              allTugas = response.data
            }
          }

          if (poskasRes.status === 'fulfilled') {
            const response = poskasRes.value
            if (response.success && response.data) {
              poskas = response.data
            } else if (Array.isArray(response)) {
              poskas = response
            } else if (response.data && Array.isArray(response.data)) {
              poskas = response.data
            }
          }

          // Filter for user's own data
          const myKomplains = allKomplains.filter(k => k.pelapor_id === user?.id || k.penerima_komplain_id === user?.id)
          const myTugas = allTugas.filter(t => t.pemberi_tugas_id === user?.id || t.penerima_tugas_id === user?.id)
          const myPoskas = poskas.filter(p => p.id_user === user?.id)

          setStats({
            totalKomplain: myKomplains.length,
            totalTugas: myTugas.length,
            totalPoskas: myPoskas.length,
            totalUsers: 0,
            unreadMessages: 0
          })

          setMyKomplains(myKomplains.slice(0, 5))
          setMyTugas(myTugas.slice(0, 5))
        }

      } catch (error) {
        console.error('Error loading dashboard data:', error)
        toast.error('Gagal memuat data dashboard')
      } finally {
        setLoading(false)
      }
    }

    loadDashboardData()
  }, [user])

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
                  <p className="text-2xl font-bold text-gray-900">{stats.totalKomplain}</p>
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
                  <p className="text-2xl font-bold text-gray-900">{stats.totalTugas}</p>
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
                  <p className="text-2xl font-bold text-gray-900">{stats.totalPoskas}</p>
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
                  <p className="text-2xl font-bold text-gray-900">{stats.totalUsers}</p>
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
              {recentKomplains.length > 0 ? (
                <div className="space-y-4">
                  {recentKomplains.map((komplain) => (
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
              ) : (
                <div className="text-center py-8">
                  <AlertTriangle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">Tidak ada komplain terbaru</p>
                </div>
              )}
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
              {recentTugas.length > 0 ? (
                <div className="space-y-4">
                  {recentTugas.map((tugas) => (
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
              ) : (
                <div className="text-center py-8">
                  <CheckSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">Tidak ada tugas terbaru</p>
                </div>
              )}
            </CardBody>
          </Card>
        </div>
      </div>
    )
  }

  // Leader Dashboard
  if (user?.role === 'leader') {
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
                  <p className="text-2xl font-bold text-gray-900">{stats.totalKomplain}</p>
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
                  <p className="text-2xl font-bold text-gray-900">{stats.totalTugas}</p>
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
                  <p className="text-2xl font-bold text-gray-900">{stats.totalPoskas}</p>
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
                  <p className="text-2xl font-bold text-gray-900">-</p>
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
              {recentKomplains.length > 0 ? (
                <div className="space-y-4">
                  {recentKomplains.map((komplain) => (
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
              ) : (
                <div className="text-center py-8">
                  <AlertTriangle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">Tidak ada komplain tim</p>
                </div>
              )}
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
              {recentTugas.length > 0 ? (
                <div className="space-y-4">
                  {recentTugas.map((tugas) => (
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
              ) : (
                <div className="text-center py-8">
                  <CheckSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">Tidak ada tugas tim</p>
                </div>
              )}
            </CardBody>
          </Card>
        </div>
      </div>
    )
  }

  // Divisi Dashboard (Default)
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
                <p className="text-2xl font-bold text-gray-900">{stats.totalKomplain}</p>
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
                <p className="text-2xl font-bold text-gray-900">{stats.totalTugas}</p>
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
                <p className="text-2xl font-bold text-gray-900">{stats.totalPoskas}</p>
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
                <p className="text-2xl font-bold text-gray-900">{stats.unreadMessages}</p>
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
            {myKomplains.length > 0 ? (
              <div className="space-y-4">
                {myKomplains.map((komplain) => (
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
            ) : (
              <div className="text-center py-8">
                <AlertTriangle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">Tidak ada komplain</p>
              </div>
            )}
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
            {myTugas.length > 0 ? (
              <div className="space-y-4">
                {myTugas.map((tugas) => (
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
            ) : (
              <div className="text-center py-8">
                <CheckSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">Tidak ada tugas</p>
              </div>
            )}
          </CardBody>
        </Card>
      </div>
    </div>
  )
}

export default Dashboard 