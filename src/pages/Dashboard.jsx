import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { 
  TrendingUp, 
  TrendingDown, 
  Users, 
  Calendar,
  DollarSign,
  AlertTriangle,
  CheckCircle,
  Clock,
  ArrowRight,
  Award,
  AlertCircle,
  BarChart3,
  CheckSquare,
  User,
  Bell,
  Shield
} from 'lucide-react';
import LoadingSpinner from '../components/UI/LoadingSpinner';
import { formatDate } from '../utils/helpers'
import Card, { CardHeader, CardBody } from '../components/UI/Card'
import Badge from '../components/UI/Badge'
import Button from '../components/UI/Button'
import toast from 'react-hot-toast'
import { komplainService } from '../services/komplainService'
import { tugasService } from '../services/tugasService'
import { poskasService } from '../services/poskasService'
import { userService } from '../services/userService'
 
import { timService } from '../services/timService'
import { videoManageService } from '../services/videoManageService'

const Dashboard = () => {
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    totalKomplain: 0,
    totalTugas: 0,
    totalPoskas: 0,
    totalUsers: 0,
    totalTimBiru: 0,
    totalTimMerah: 0
  })
  const [recentKomplains, setRecentKomplains] = useState([])
  const [recentTugas, setRecentTugas] = useState([])
  // Video section state (per role)
  const [videoUrl, setVideoUrl] = useState('')
  const [videoInput, setVideoInput] = useState('')
  const [selectedVideoFile, setSelectedVideoFile] = useState(null)
  const [videoSaving, setVideoSaving] = useState(false)

  // Debug logging
  console.log('🔍 Dashboard rendered')
  console.log('👤 User data:', user)
  console.log('🎭 User role:', user?.role)

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true)
        console.log('🔄 Fetching dashboard data for user:', user?.role)
        
        // Fetch data based on user role
        if (user?.role === 'owner' || user?.role === 'admin') {
          // Fetch all data for admin/owner
          await Promise.all([
            fetchKomplainData(),
            fetchTugasData(),
            fetchPoskasData(),
            fetchUsersData(),
            fetchTimData()
          ])
        } else if (user?.role === 'leader') {
          // Fetch leader-specific data
          await Promise.all([
            fetchKomplainData(),
            fetchTugasData(),
            fetchPoskasData(),
            fetchTimData()
          ])
        } else {
          // Fetch user-specific data
          await Promise.all([
            fetchUserKomplainData(),
            fetchUserTugasData(),
            fetchUserPoskasData()
          ])
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error)
        toast.error('Gagal memuat data dashboard')
      } finally {
        setLoading(false)
      }
    }

    if (user) {
      fetchDashboardData()
    }
  }, [user])

  // Helper: convert common video URLs to embeddable URL
  const toEmbedUrl = (url) => {
    try {
      if (!url) return ''
      const u = new URL(url)
      // YouTube patterns
      if (u.hostname.includes('youtube.com')) {
        const v = u.searchParams.get('v')
        if (v) return `https://www.youtube.com/embed/${v}`
        // If already /embed/
        if (u.pathname.includes('/embed/')) return url
      }
      if (u.hostname.includes('youtu.be')) {
        const id = u.pathname.split('/')[1]
        if (id) return `https://www.youtube.com/embed/${id}`
      }
      // Vimeo
      if (u.hostname.includes('vimeo.com')) {
        const id = u.pathname.split('/').filter(Boolean)[0]
        if (id) return `https://player.vimeo.com/video/${id}`
      }
      // Default return original (assume already embeddable)
      return url
    } catch (e) {
      return url
    }
  }

  // Load video dari backend
  // - Admin: pakai video Admin
  // - Leader: tampilkan video yang sama dengan Admin (bukan per-role terpisah)
  // - Role lain: fallback localStorage seperti sebelumnya
  useEffect(() => {
    const load = async () => {
      if (!user?.role) return
      if (user.role === 'admin' || user.role === 'leader') {
        try {
          // Untuk Leader kita ambil video Admin agar tampil sama seperti di Admin
          const sourceRole = user.role === 'leader' ? 'admin' : 'admin'
          const res = await videoManageService.getCurrent(sourceRole)
          setVideoUrl(res?.data?.url || '')
        } catch (e) {
          console.error('Gagal memuat video dashboard:', e)
          setVideoUrl('')
        }
      } else {
        const key = `dashboard_video_${user.role}`
        const saved = localStorage.getItem(key)
        if (saved) {
          setVideoUrl(saved)
          setVideoInput(saved)
        } else {
          setVideoUrl('')
          setVideoInput('')
        }
      }
    }
    load()
  }, [user?.role])

  const handleUploadVideo = async () => {
    if (!selectedVideoFile) return toast.error('Pilih file video terlebih dahulu')
    if (!(user?.role === 'admin' || user?.role === 'leader')) return
    try {
      setVideoSaving(true)
      const res = await videoManageService.upload(user.role, selectedVideoFile)
      setVideoUrl(res?.data?.url || '')
      setSelectedVideoFile(null)
      toast.success('Video berhasil diunggah')
    } catch (e) {
      console.error(e)
      toast.error(e?.message || 'Gagal mengunggah video')
    } finally {
      setVideoSaving(false)
    }
  }

  const handleSaveVideo = () => {
    const key = user?.role ? `dashboard_video_${user.role}` : null
    if (!key) return
    const embed = toEmbedUrl(videoInput.trim())
    setVideoUrl(embed)
    localStorage.setItem(key, embed)
    toast.success('Video disimpan untuk dashboard ini')
  }

  // Fetch functions for admin/owner
  const fetchKomplainData = async () => {
    try {
      const komplains = await komplainService.getKomplain({ limit: 5 })
      console.log('✅ Komplains fetched:', komplains)
      setRecentKomplains(komplains.data || komplains || [])
      setStats(prev => ({ ...prev, totalKomplain: komplains.total || komplains.length || 0 }))
    } catch (error) {
      console.error('Error fetching komplains:', error)
    }
  }

  const fetchTugasData = async () => {
    try {
      const tugas = await tugasService.getTugas({ limit: 5 })
      console.log('✅ Tugas fetched:', tugas)
      setRecentTugas(tugas.data || tugas || [])
      setStats(prev => ({ ...prev, totalTugas: tugas.total || tugas.length || 0 }))
    } catch (error) {
      console.error('Error fetching tugas:', error)
    }
  }

  const fetchPoskasData = async () => {
    try {
      const poskas = await poskasService.getPoskas({ limit: 1 })
      console.log('✅ Poskas fetched:', poskas)
      setStats(prev => ({ ...prev, totalPoskas: poskas.total || poskas.length || 0 }))
    } catch (error) {
      console.error('Error fetching poskas:', error)
    }
  }

  const fetchUsersData = async () => {
    try {
      const users = await userService.getUsers({ limit: 1 })
      console.log('✅ Users fetched:', users)
      setStats(prev => ({ ...prev, totalUsers: users.total || users.length || 0 }))
    } catch (error) {
      console.error('Error fetching users:', error)
    }
  }

  const fetchTimData = async () => {
    try {
      const [timBiru, timMerah] = await Promise.all([
        timService.getTimBiru({ limit: 1 }),
        timService.getTimMerah({ limit: 1 })
      ])
      console.log('✅ Tim data fetched:', { timBiru, timMerah })
      setStats(prev => ({ 
        ...prev, 
        totalTimBiru: timBiru.total || timBiru.length || 0,
        totalTimMerah: timMerah.total || timMerah.length || 0
      }))
    } catch (error) {
      console.error('Error fetching tim data:', error)
    }
  }

  // Fetch functions for user-specific data
  const fetchUserKomplainData = async () => {
    try {
      const userKomplains = await komplainService.getKomplainByUser(user.id, { limit: 5 })
      console.log('✅ User komplains fetched:', userKomplains)
      setRecentKomplains(userKomplains.data || userKomplains || [])
      setStats(prev => ({ ...prev, totalKomplain: userKomplains.total || userKomplains.length || 0 }))
    } catch (error) {
      console.error('Error fetching user komplains:', error)
    }
  }

  const fetchUserTugasData = async () => {
    try {
      const userTugas = await tugasService.getTugasByUser(user.id, { limit: 5 })
      console.log('✅ User tugas fetched:', userTugas)
      setRecentTugas(userTugas.data || userTugas || [])
      setStats(prev => ({ ...prev, totalTugas: userTugas.total || userTugas.length || 0 }))
    } catch (error) {
      console.error('Error fetching user tugas:', error)
    }
  }

  const fetchUserPoskasData = async () => {
    try {
      const userPoskas = await poskasService.getPoskasByUser(user.id, { limit: 1 })
      console.log('✅ User poskas fetched:', userPoskas)
      setStats(prev => ({ ...prev, totalPoskas: userPoskas.total || userPoskas.length || 0 }))
    } catch (error) {
      console.error('Error fetching user poskas:', error)
    }
  }

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
        <LoadingSpinner size="large" />
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="large" />
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

        {user?.role === 'admin' && (
          <>
            {/* Video Section (Admin only) */}
            <Card>
              <CardHeader>
                <h3 className="text-lg font-semibold text-gray-900">Video Pembuka</h3>
              </CardHeader>
              <CardBody>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                  <div className="lg:col-span-2">
                    {videoUrl ? (
                      <div className="aspect-video w-full bg-black/5 rounded-lg overflow-hidden">
                        <video className="w-full h-full" src={videoUrl} controls />
                      </div>
                    ) : (
                      <div className="aspect-video w-full bg-gray-100 rounded-lg flex items-center justify-center text-gray-500">
                        Tidak ada video. Unggah file video.
                      </div>
                    )}
                  </div>
                  <div className="space-y-3">
                    <label className="block text-sm font-medium text-gray-700">Unggah Video (mp4, webm, dll.)</label>
                    <input
                      type="file"
                      accept="video/*"
                      onChange={(e) => setSelectedVideoFile(e.target.files?.[0] || null)}
                      className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <div className="flex gap-2">
                      <Button onClick={handleUploadVideo} disabled={videoSaving}>{videoSaving ? 'Menyimpan...' : 'Simpan'}</Button>
                      <Button variant="ghost" onClick={() => setSelectedVideoFile(null)}>Reset</Button>
                    </div>
                    <p className="text-xs text-gray-500">File akan disimpan ke backend dan ditampilkan otomatis.</p>
                  </div>
                </div>
              </CardBody>
            </Card>
          </>
        )}
        
        {/* Pengumuman Section */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Pengumuman Terbaru</h3>
              <div className="flex items-center space-x-2">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                  <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
                  <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
                </div>
                <Link to="/pengumuman">
                  <Button variant="ghost" size="sm">Lihat Semua</Button>
                </Link>
              </div>
            </div>
          </CardHeader>
          <CardBody>
            <div className="relative">
              <div className="space-y-4">
                <div className="flex items-start space-x-3 p-4 bg-blue-50 rounded-lg">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <Bell className="h-4 w-4 text-blue-600" />
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900">
                      Selamat Datang di Sistem Bosgil Group
                    </p>
                    <p className="text-sm text-gray-600 mt-1">
                      Sistem manajemen terintegrasi untuk mengelola komplain, tugas, keuangan, dan komunikasi tim.
                    </p>
                    <p className="text-xs text-gray-500 mt-2">
                      {formatDate(new Date())}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </CardBody>
        </Card>
        
        {/* Admin Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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
                <div className="p-3 bg-purple-100 rounded-lg">
                  <DollarSign className="h-6 w-6 text-purple-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Omset Harian</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalPoskas}</p>
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
                  <p className="text-sm font-medium text-gray-600">Settings</p>
                  <p className="text-2xl font-bold text-gray-900">-</p>
                </div>
              </div>
            </CardBody>
          </Card>
        </div>

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
                {recentKomplains && recentKomplains.length > 0 ? (
                  recentKomplains.map((komplain) => (
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
                  ))
                ) : (
                  <div className="text-center py-8">
                    <AlertTriangle className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">Belum ada komplain</p>
                  </div>
                )}
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
                {recentTugas && recentTugas.length > 0 ? (
                  recentTugas.map((tugas) => (
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
                  ))
                ) : (
                  <div className="text-center py-8">
                    <CheckSquare className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">Belum ada tugas</p>
                  </div>
                )}
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

        {/* Video Section (Leader) */}
        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold text-gray-900">Video Pembuka</h3>
          </CardHeader>
          <CardBody>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <div className="lg:col-span-2">
                {videoUrl ? (
                  <div className="aspect-video w-full bg-black/5 rounded-lg overflow-hidden">
                    <video className="w-full h-full" src={videoUrl} controls />
                  </div>
                ) : (
                  <div className="aspect-video w-full bg-gray-100 rounded-lg flex items-center justify-center text-gray-500">
                    Tidak ada video. Unggah file video.
                  </div>
                )}
              </div>
              {(user?.role === 'admin' || user?.role === 'owner') && (
                <div className="space-y-3">
                  <label className="block text-sm font-medium text-gray-700">Unggah Video (mp4, webm, dll.)</label>
                  <input
                    type="file"
                    accept="video/*"
                    onChange={(e) => setSelectedVideoFile(e.target.files?.[0] || null)}
                    className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <div className="flex gap-2">
                    <Button onClick={handleUploadVideo} disabled={videoSaving}>{videoSaving ? 'Menyimpan...' : 'Simpan'}</Button>
                    <Button variant="ghost" onClick={() => setSelectedVideoFile(null)}>Reset</Button>
                  </div>
                  <p className="text-xs text-gray-500">File akan disimpan ke backend dan ditampilkan otomatis.</p>
                </div>
              )}
            </div>
          </CardBody>
        </Card>

        {/* Pengumuman Section */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Pengumuman Terbaru</h3>
              <div className="flex items-center space-x-2">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                  <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
                  <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
                </div>
                <Link to="/pengumuman">
                  <Button variant="ghost" size="sm">Lihat Semua</Button>
                </Link>
              </div>
            </div>
          </CardHeader>
          <CardBody>
            <div className="relative">
              <div className="space-y-4">
                <div className="flex items-start space-x-3 p-4 bg-blue-50 rounded-lg">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <Bell className="h-4 w-4 text-blue-600" />
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900">
                      Selamat Datang di Sistem Bosgil Group
                    </p>
                    <p className="text-sm text-gray-600 mt-1">
                      Sistem manajemen terintegrasi untuk mengelola komplain, tugas, keuangan, dan komunikasi tim.
                    </p>
                    <p className="text-xs text-gray-500 mt-2">
                      {formatDate(new Date())}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </CardBody>
        </Card>

        {/* Leader Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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
                <div className="p-3 bg-purple-100 rounded-lg">
                  <DollarSign className="h-6 w-6 text-purple-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Omset Harian</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalPoskas}</p>
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
                  <p className="text-sm font-medium text-gray-600">Settings</p>
                  <p className="text-2xl font-bold text-gray-900">-</p>
                </div>
              </div>
            </CardBody>
          </Card>
        </div>

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
                {recentKomplains && recentKomplains.length > 0 ? (
                  recentKomplains.map((komplain) => (
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
                  ))
                ) : (
                  <div className="text-center py-8">
                    <AlertTriangle className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">Belum ada komplain tim</p>
                  </div>
                )}
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
                {recentTugas && recentTugas.length > 0 ? (
                  recentTugas.map((tugas) => (
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
                  ))
                ) : (
                  <div className="text-center py-8">
                    <CheckSquare className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">Belum ada tugas tim</p>
                  </div>
                )}
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
      
      {/* Pengumuman Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">Pengumuman Terbaru</h3>
            <div className="flex items-center space-x-2">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
                <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
              </div>
              <Link to="/pengumuman">
                <Button variant="ghost" size="sm">Lihat Semua</Button>
              </Link>
            </div>
          </div>
        </CardHeader>
        <CardBody>
          <div className="relative">
            <div className="space-y-4">
              <div className="flex items-start space-x-3 p-4 bg-blue-50 rounded-lg">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <Bell className="h-4 w-4 text-blue-600" />
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900">
                    Selamat Datang di Sistem Bosgil Group
                  </p>
                  <p className="text-sm text-gray-600 mt-1">
                    Sistem manajemen terintegrasi untuk mengelola komplain, tugas, keuangan, dan komunikasi tim.
                  </p>
                  <p className="text-xs text-gray-500 mt-2">
                    {formatDate(new Date())}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Divisi Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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
                <MessageCircle className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Chat</p>
                <p className="text-2xl font-bold text-gray-900">{stats.unreadMessages}</p>
              </div>
            </div>
          </CardBody>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardBody className="p-6">
            <div className="flex items-center">
              <div className="p-3 bg-purple-100 rounded-lg">
                <DollarSign className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Omset Harian</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalPoskas}</p>
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
                <p className="text-sm font-medium text-gray-600">Settings</p>
                <p className="text-2xl font-bold text-gray-900">-</p>
              </div>
            </div>
          </CardBody>
        </Card>
      </div>

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
              {recentKomplains && recentKomplains.length > 0 ? (
                recentKomplains.slice(0, 3).map((komplain) => (
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
                ))
              ) : (
                <div className="text-center py-8">
                  <AlertTriangle className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">Belum ada komplain</p>
                </div>
              )}
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
              {recentTugas && recentTugas.length > 0 ? (
                recentTugas.slice(0, 3).map((tugas) => (
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
                ))
              ) : (
                <div className="text-center py-8">
                  <CheckSquare className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">Belum ada tugas</p>
                </div>
              )}
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  )
}

export default Dashboard 