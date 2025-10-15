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
import Badge from '@/components/UI/Badge'
import toast from 'react-hot-toast'
import { MENU_CODES } from '@/config/menuCodes'
import { Dialog, DialogContent, DialogHeader as DialogHeaderUI, DialogTitle as DialogTitleUI, DialogBody as DialogBodyUI, DialogFooter as DialogFooterUI } from '@/components/UI/Dialog'

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
  const [detailOpen, setDetailOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState(null)
  const [isEditing, setIsEditing] = useState(false)
  const [saveLoading, setSaveLoading] = useState(false)
  const [formTraining, setFormTraining] = useState({
    training_dasar: false,
    training_leadership: false,
    training_skill: false,
    training_lanjutan: false,
  })

  useEffect(() => {
    if (detailOpen && selectedUser) {
      setIsEditing(false)
      setFormTraining({
        training_dasar: !!selectedUser.training_dasar,
        training_leadership: !!selectedUser.training_leadership,
        training_skill: !!selectedUser.training_skill,
        training_lanjutan: !!selectedUser.training_lanjutan,
      })
    }
  }, [detailOpen, selectedUser])

  const handleSaveEdit = async () => {
    if (!selectedUser) return
    try {
      setSaveLoading(true)
      const payload = { ...formTraining, user_id: selectedUser.id }
      const resp = await trainingService.updateUserTrainingStatus(selectedUser.id, payload)
      if (resp && (resp.success === undefined || resp.success === true)) {
        toast.success('Status training berhasil disimpan')
        // Update state list
        setTrainings(prev => prev.map(u => u.id === selectedUser.id ? { ...u, ...formTraining } : u))
        // Update selected
        setSelectedUser(prev => prev ? { ...prev, ...formTraining } : prev)
        setIsEditing(false)
      } else {
        toast.error(resp?.message || 'Gagal menyimpan status training')
      }
    } catch (e) {
      console.error('Save training error:', e)
      toast.error('Terjadi kesalahan saat menyimpan')
    } finally {
      setSaveLoading(false)
    }
  }

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
    <div className="p-0 bg-gray-50 min-h-screen">

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
            <Link
              to="/admin/training/new"
              className="inline-flex items-center gap-2 px-4 py-2 bg-white text-red-700 rounded-lg hover:bg-red-50 transition-colors shadow-sm"
            >
              <Plus className="h-4 w-4" />
              <span className="font-semibold">Tambah</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Spacing below header */}
      <div className="my-0"></div>

      {/* Stats Cards (match Poskas style) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 my-4">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-lg bg-green-50 flex items-center justify-center">
              <CheckCircle className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-xs font-medium text-gray-500">Training Dasar</p>
              <p className="text-xl font-bold text-gray-900">{stats.trainingDasarCompleted || 0}</p>
              <p className="text-[11px] text-gray-500">{stats.trainingDasarPercentage || 0}% selesai</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-lg bg-yellow-50 flex items-center justify-center">
              <BookOpen className="h-5 w-5 text-yellow-600" />
            </div>
            <div>
              <p className="text-xs font-medium text-gray-500">Training Leadership</p>
              <p className="text-xl font-bold text-gray-900">{stats.trainingLeadershipCompleted || 0}</p>
              <p className="text-[11px] text-gray-500">{stats.trainingLeadershipPercentage || 0}% selesai</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-lg bg-purple-50 flex items-center justify-center">
              <BarChart3 className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <p className="text-xs font-medium text-gray-500">Training Skill</p>
              <p className="text-xl font-bold text-gray-900">{stats.trainingSkillCompleted || 0}</p>
              <p className="text-[11px] text-gray-500">{stats.trainingSkillPercentage || 0}% selesai</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-lg bg-blue-50 flex items-center justify-center">
              <Users className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-xs font-medium text-gray-500">Training Lanjutan</p>
              <p className="text-xl font-bold text-gray-900">{stats.trainingLanjutanCompleted || 0}</p>
              <p className="text-[11px] text-gray-500">{stats.trainingLanjutanPercentage || 0}% selesai</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters - always visible, styled like Poskas (tanpa header) */}
      <Card className="rounded-none md:rounded-xl shadow-sm border border-gray-100 my-4">
        <CardBody className="px-6 py-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Cari</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Cari nama atau email karyawan..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  className="pl-10 pr-3 py-2 w-full border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-red-500 focus:border-transparent"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Role</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 w-full border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-red-500 focus:border-transparent"
              >
                <option value="">Semua Role</option>
                <option value="admin">Admin</option>
                <option value="leader">Leader</option>
                <option value="divisi">Divisi</option>
              </select>
            </div>
            <div className="flex items-end">
              <button
                onClick={handleSearch}
                className="inline-flex items-center gap-2 px-5 py-2 rounded-full border border-red-600 text-red-700 hover:bg-red-50 transition-colors"
              >
                <Search className="h-4 w-4" />
                <span className="font-semibold">Pencarian</span>
              </button>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Training List */}
      <Card className="bg-white rounded-xl shadow-sm border border-gray-100 mt-4">
        <CardHeader className="px-6 py-3 bg-red-700 text-white">
          <div className="flex justify-between items-center">
            <h3 className="text-lg md:text-base font-extrabold uppercase tracking-wider text-white">Daftar Data Training Karyawan</h3>
            <span className="text-sm md:text-base font-semibold text-white">Total Data Karyawan : {stats.totalUsers || 0}</span>
          </div>
        </CardHeader>
        <CardBody className="px-6 py-4">
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
                    <tr
                      key={userTraining.id}
                      className="hover:bg-gray-50 cursor-pointer"
                      onClick={() => { setSelectedUser(userTraining); setDetailOpen(true) }}
                    >
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
                            onClick={(e) => e.stopPropagation()}
                          >
                            <Edit className="h-4 w-4" />
                          </Link>
                          <button
                            onClick={(e) => { e.stopPropagation(); handleDelete(userTraining.id) }}
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

      {/* Detail Modal */}
      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent>
          <DialogHeaderUI>
            <DialogTitleUI>Detail Training Karyawan</DialogTitleUI>
          </DialogHeaderUI>
          <DialogBodyUI>
            {selectedUser ? (
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <Users className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-base font-semibold text-gray-900">{selectedUser.nama}</p>
                    <p className="text-sm text-gray-600">{selectedUser.email}</p>
                  </div>
                </div>

                {/* Role dipisahkan di atas - tampil sederhana: Role : Keterangan */}
                <div className="px-0 py-2 border-b border-gray-200">
                  <p className="text-sm text-gray-700">
                    Role : <span className="font-medium text-gray-900 uppercase">{selectedUser.role}</span>
                  </p>
                </div>

                {/* Training status */}
                {!isEditing ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <span className="text-sm text-gray-600">Training Dasar</span>
                      <Badge variant={selectedUser.training_dasar ? 'success' : 'secondary'}>
                        {selectedUser.training_dasar ? 'Selesai' : 'Belum'}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <span className="text-sm text-gray-600">Training Leadership</span>
                      <Badge variant={selectedUser.training_leadership ? 'success' : 'secondary'}>
                        {selectedUser.training_leadership ? 'Selesai' : 'Belum'}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <span className="text-sm text-gray-600">Training Skill</span>
                      <Badge variant={selectedUser.training_skill ? 'success' : 'secondary'}>
                        {selectedUser.training_skill ? 'Selesai' : 'Belum'}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <span className="text-sm text-gray-600">Training Lanjutan</span>
                      <Badge variant={selectedUser.training_lanjutan ? 'success' : 'secondary'}>
                        {selectedUser.training_lanjutan ? 'Selesai' : 'Belum'}
                      </Badge>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <label className="flex items-center justify-between p-3 border rounded-lg cursor-pointer">
                      <span className="text-sm text-gray-700">Training Dasar</span>
                      <input
                        type="checkbox"
                        checked={formTraining.training_dasar}
                        onChange={(e) => setFormTraining(v => ({ ...v, training_dasar: e.target.checked }))}
                        className="h-4 w-4"
                      />
                    </label>
                    <label className="flex items-center justify-between p-3 border rounded-lg cursor-pointer">
                      <span className="text-sm text-gray-700">Training Leadership</span>
                      <input
                        type="checkbox"
                        checked={formTraining.training_leadership}
                        onChange={(e) => setFormTraining(v => ({ ...v, training_leadership: e.target.checked }))}
                        className="h-4 w-4"
                      />
                    </label>
                    <label className="flex items-center justify-between p-3 border rounded-lg cursor-pointer">
                      <span className="text-sm text-gray-700">Training Skill</span>
                      <input
                        type="checkbox"
                        checked={formTraining.training_skill}
                        onChange={(e) => setFormTraining(v => ({ ...v, training_skill: e.target.checked }))}
                        className="h-4 w-4"
                      />
                    </label>
                    <label className="flex items-center justify-between p-3 border rounded-lg cursor-pointer">
                      <span className="text-sm text-gray-700">Training Lanjutan</span>
                      <input
                        type="checkbox"
                        checked={formTraining.training_lanjutan}
                        onChange={(e) => setFormTraining(v => ({ ...v, training_lanjutan: e.target.checked }))}
                        className="h-4 w-4"
                      />
                    </label>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-sm text-gray-600">Tidak ada data.</p>
            )}
          </DialogBodyUI>
          <DialogFooterUI>
            {!isEditing ? (
              <>
                <Button onClick={() => setDetailOpen(false)} variant="outline">Tutup</Button>
                {selectedUser && (
                  <Button onClick={() => setIsEditing(true)}>
                    <Edit className="h-4 w-4 mr-2" />
                    Edit
                  </Button>
                )}
              </>
            ) : (
              <>
                <Button onClick={() => setIsEditing(false)} variant="outline">Batal</Button>
                <Button onClick={handleSaveEdit} disabled={saveLoading} loading={saveLoading}>
                  Simpan
                </Button>
              </>
            )}
          </DialogFooterUI>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default AdminTrainingList