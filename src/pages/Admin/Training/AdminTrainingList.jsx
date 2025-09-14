import React, { useState, useEffect } from 'react'

import { Link } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { trainingService } from '@/services/trainingService'
import { 
  Search, 
  Plus, 
  Eye, 
  Edit, 
  Trash2,
  BookOpen,
  Users,
  Calendar,
  Clock,
  Filter,
  Download,
  BarChart3,
  RefreshCw,
  CheckCircle,
  XCircle,
  AlertTriangle
} from 'lucide-react'
import Card, { CardHeader, CardBody } from '@/components/UI/Card'
import Button from '@/components/UI/Button'
import Input from '@/components/UI/Input'
import Select from '@/components/UI/Select'
import Badge from '@/components/UI/Badge'
import toast from 'react-hot-toast'
import { MENU_CODES } from '@/config/menuCodes'

const AdminTrainingList = () => {
  const { user } = useAuth()
  const [trainings, setTrainings] = useState([])
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [stats, setStats] = useState({
    totalTrainings: 0,
    activeTrainings: 0,
    completedTrainings: 0,
    totalParticipants: 0
  })

  // Hanya jalankan pemanggilan API admin jika role benar-benar admin
  useEffect(() => {
    if (user?.role === 'admin') {
      loadTrainings()
      loadStats()
    }
  }, [currentPage, statusFilter, user?.role])

  const loadTrainings = async () => {
    try {
      setLoading(true)
      const params = {
        page: currentPage,
        limit: 15,
        search: searchTerm,
        status: statusFilter,
      }
      
      const response = await trainingService.getAdminTrainings(params)
      console.log('🔍 Admin Training response:', response)
      
      if (response.success) {
        // Backend returns user data with training fields
        setTrainings(response.data || [])
        setTotalPages(response.pagination?.totalPages || 1)
      } else {
        console.error('❌ Admin Training response not successful:', response)
        setTrainings([])
        setTotalPages(1)
      }
    } catch (error) {
      toast.error('Gagal memuat daftar training')
      console.error('Error loading trainings:', error)
      setTrainings([])
      setTotalPages(1)
    } finally {
      setLoading(false)
    }
  }

  const loadStats = async () => {
    try {
      const response = await trainingService.getAdminStats()
      if (response.success) {
        setStats(response.data)
      }
    } catch (error) {
      console.error('Error loading stats:', error)
    }
  }

  const handleSearch = () => {
    setCurrentPage(1)
    loadTrainings()
  }

  const handleReset = () => {
    setSearchTerm('')
    setStatusFilter('')
    setCurrentPage(1)
    loadTrainings()
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Apakah Anda yakin ingin menghapus training ini?')) {
      return
    }

    try {
      const response = await trainingService.deleteTraining(id)
      
      if (response.success) {
        toast.success('Training berhasil dihapus')
        loadTrainings()
        loadStats()
      } else {
        toast.error('Gagal menghapus training')
      }
    } catch (error) {
      toast.error('Gagal menghapus training')
      console.error('Error deleting training:', error)
    }
  }

  const getStatusBadge = (status) => {
    const variants = {
      upcoming: 'info',
      ongoing: 'warning',
      completed: 'success',
      cancelled: 'danger'
    }
    return <Badge variant={variants[status] || 'default'}>{status}</Badge>
  }

  const getTypeBadge = (type) => {
    const variants = {
      technical: 'info',
      soft_skill: 'success',
      management: 'warning',
      safety: 'danger'
    }
    return <Badge variant={variants[type] || 'default'}>{type}</Badge>
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-green-600" />
      case 'cancelled':
        return <XCircle className="h-5 w-5 text-red-600" />
      case 'ongoing':
        return <Clock className="h-5 w-5 text-yellow-600" />
      case 'upcoming':
        return <AlertTriangle className="h-5 w-5 text-blue-600" />
      default:
        return <AlertTriangle className="h-5 w-5 text-gray-600" />
    }
  }

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('id-ID', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const formatTime = (time) => {
    return new Date(`2000-01-01T${time}`).toLocaleTimeString('id-ID', {
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const exportData = async () => {
    try {
      const response = await trainingService.exportAdminTrainings({
        status: statusFilter,
      })
      
      if (response.success) {
        // Create download link
        const blob = new Blob([response.data], { type: 'text/csv' })
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `training-admin-${new Date().toISOString().split('T')[0]}.csv`
        a.click()
        window.URL.revokeObjectURL(url)
        toast.success('Data berhasil diekspor')
      }
    } catch (error) {
      toast.error('Gagal mengekspor data')
      console.error('Error exporting data:', error)
    }
  }

  // Jika bukan admin, tampilkan pesan akses dan hentikan render tabel
  if (user?.role !== 'admin') {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Data Training Karyawan</h1>
        <p className="text-gray-600">Halaman ini khusus untuk Admin. Silakan login sebagai Admin untuk melihat data.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">

      {/* Header Merah + Badge (unified style) */}
      <div className="bg-red-800 text-white px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span className="text-sm font-semibold bg-white/10 rounded px-2 py-1">{MENU_CODES.sdm.dataTraining}</span>
            <div>
              <h1 className="text-xl md:text-2xl font-extrabold tracking-tight">DATA TRAINING</h1>
              <p className="text-sm text-red-100">Kelola data training dan sertifikasi karyawan</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-white/60 text-white bg-transparent"
              onClick={exportData}
            >
              <Download className="h-4 w-4" />
              <span className="font-semibold">Export</span>
            </Button>
            <Link to="/admin/training/new">
              <Button className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-white/60 text-white bg-transparent">
                <Plus className="h-4 w-4" />
                <span className="font-semibold">Tambah</span>
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Spacing below header */}
      <div className="mb-2"></div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <Card>
          <CardBody>
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Karyawan</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalUsers || 0}</p>
              </div>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardBody>
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Training Dasar</p>
                <p className="text-2xl font-bold text-gray-900">{stats.trainingDasarCompleted || 0}</p>
                <p className="text-xs text-gray-500">{stats.trainingDasarPercentage || 0}% selesai</p>
              </div>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardBody>
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <BookOpen className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Training Leadership</p>
                <p className="text-2xl font-bold text-gray-900">{stats.trainingLeadershipCompleted || 0}</p>
                <p className="text-xs text-gray-500">{stats.trainingLeadershipPercentage || 0}% selesai</p>
              </div>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardBody>
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <BarChart3 className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Training Skill</p>
                <p className="text-2xl font-bold text-gray-900">{stats.trainingSkillCompleted || 0}</p>
                <p className="text-xs text-gray-500">{stats.trainingSkillPercentage || 0}% selesai</p>
              </div>
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">Filter Data Training</h3>
            <Button variant="outline" size="sm" onClick={handleReset}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Reset
            </Button>
          </div>
        </CardHeader>
        <CardBody>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Cari Karyawan</label>
              <Input
                placeholder="Cari nama atau email karyawan..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Role</label>
              <Select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="">Semua Role</option>
                <option value="admin">Admin</option>
                <option value="leader">Leader</option>
                <option value="divisi">Divisi</option>
              </Select>
            </div>
          </div>
          
          <div className="flex gap-2 mt-4">
            <Button onClick={handleSearch}>
              <Search className="h-4 w-4 mr-2" />
              Cari
            </Button>
          </div>
        </CardBody>
      </Card>

      {/* Training List */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold text-gray-900">Daftar Data Training Karyawan</h3>
            <Link to="/admin/training/new">
              <Button size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Tambah Data Training
              </Button>
            </Link>
          </div>
        </CardHeader>
        <CardBody>
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2 text-gray-600">Memuat data...</p>
            </div>
          ) : trainings.length === 0 ? (
            <div className="text-center py-8">
              <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">Tidak ada data training karyawan ditemukan</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Nama Karyawan
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Email
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Role
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Training Dasar
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Training Leadership
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Training Skill
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Training Lanjutan
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Aksi
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {trainings.map((userTraining) => (
                    <tr key={userTraining.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                            <Users className="h-5 w-5 text-blue-600" />
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{userTraining.nama}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {userTraining.email}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Badge variant="outline">{userTraining.role}</Badge>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Badge variant={userTraining.training_dasar ? "success" : "secondary"}>
                          {userTraining.training_dasar ? "Selesai" : "Belum"}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Badge variant={userTraining.training_leadership ? "success" : "secondary"}>
                          {userTraining.training_leadership ? "Selesai" : "Belum"}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Badge variant={userTraining.training_skill ? "success" : "secondary"}>
                          {userTraining.training_skill ? "Selesai" : "Belum"}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Badge variant={userTraining.training_lanjutan ? "success" : "secondary"}>
                          {userTraining.training_lanjutan ? "Selesai" : "Belum"}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center space-x-2">
                          <Link
                            to={`/admin/training/${userTraining.id}/edit`}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            <Edit className="h-4 w-4" />
                          </Link>
                          <button
                            onClick={() => handleDelete(userTraining.id)}
                            className="text-red-600 hover:text-red-900"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-between items-center mt-6">
              <p className="text-sm text-gray-700">
                Halaman {currentPage} dari {totalPages}
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(currentPage - 1)}
                >
                  Sebelumnya
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage(currentPage + 1)}
                >
                  Selanjutnya
                </Button>
              </div>
            </div>
          )}
        </CardBody>
      </Card>
    </div>
  )
}

export default AdminTrainingList 