import React, { useState, useEffect, useMemo } from 'react'

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
  AlertTriangle,
  Check
} from 'lucide-react'
import Card, { CardHeader, CardBody } from '@/components/UI/Card'
import Button from '@/components/UI/Button'
import Badge from '@/components/UI/Badge'
import toast from 'react-hot-toast'
import { MENU_CODES } from '@/config/menuCodes'
import { Dialog, DialogContent, DialogHeader as DialogHeaderUI, DialogTitle as DialogTitleUI, DialogBody as DialogBodyUI, DialogFooter as DialogFooterUI } from '@/components/UI/Dialog'
import AdminTrainingForm from './AdminTrainingForm'

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
  const [createOpen, setCreateOpen] = useState(false)
  const [editOpen, setEditOpen] = useState(false)
  const [editLoading, setEditLoading] = useState(false)
  const [editInitial, setEditInitial] = useState(null)
  const [isEditing, setIsEditing] = useState(false)
  const [saveLoading, setSaveLoading] = useState(false)
  const [formTraining, setFormTraining] = useState({
    training_dasar: false,
    training_leadership: false,
    training_skill: false,
    training_lanjutan: false,
  })

  // Helper: format tanggal + waktu
  const formatDateTime = (dateString) => {
    if (!dateString) return '-'
    const date = new Date(dateString)
    return date.toLocaleString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  // Ambil waktu update terakhir dari item terbaru
  const lastUpdatedText = useMemo(() => {
    if (!Array.isArray(trainings) || trainings.length === 0) return '-'
    // Cari tanggal terbaru dari updated_at atau created_at
    let latestTs = 0
    trainings.forEach((t) => {
      const ts = new Date(t.updated_at || t.created_at || 0).getTime()
      if (!Number.isNaN(ts) && ts > latestTs) latestTs = ts
    })
    if (!latestTs) return '-'
    return formatDateTime(latestTs)
  }, [trainings])

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

  const openCreate = () => {
    setCreateOpen(true)
  }

  const openEditModal = async (userRow) => {
    // userRow adalah baris user dari tabel dengan field training
    try {
      setEditLoading(true)
      setEditInitial({
        user_id: userRow.id,
        training_dasar: !!userRow.training_dasar,
        training_leadership: !!userRow.training_leadership,
        training_skill: !!userRow.training_skill,
        training_lanjutan: !!userRow.training_lanjutan,
        catatan: userRow.catatan || ''
      })
      setSelectedUser(userRow)
      setEditOpen(true)
    } finally {
      setEditLoading(false)
    }
  }

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
        page: 1,
        limit: 10000,
        search: searchTerm,
        status: statusFilter,
      }
      
      const response = await trainingService.getAdminTrainings(params)
      console.log('🔍 Admin Training response:', response)
      
      if (response.success) {
        // Backend returns user data with training fields
        setTrainings(response.data || [])
        setTotalPages(1)
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
      <div className="bg-red-800 text-white px-4 sm:px-6 py-2 md:py-4 flex items-center min-h-[52px] md:min-h-0">
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center gap-4">
            <span className="text-sm font-semibold bg-white/10 rounded px-2 py-1">{MENU_CODES.sdm.dataTraining}</span>
            <div>
              <h1 className="text-xl md:text-2xl font-extrabold tracking-tight">DATA TRAINING</h1>
            </div>
          </div>
          <div className="flex items-center gap-2">{/* Tombol Tambah disembunyikan */}</div>
        </div>
      </div>

      {/* Info bar dihapus sesuai permintaan */}

      {/* Filters - dipindah ke atas stats cards */}
      <Card className="rounded-none md:rounded-xl shadow-sm border border-gray-100 my-4">
        <CardBody className="px-6 py-4">
          <div className="grid grid-cols-1 gap-4">
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
          </div>
        </CardBody>
      </Card>

      {/* Stats Cards (match Poskas style) */}
      <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4 my-4">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-3 md:p-4">
          <div className="space-y-0.5">
            <p className="text-xs font-medium text-gray-500">Training Dasar</p>
            <p className="text-sm md:text-base font-bold text-gray-900">{stats.trainingDasarPercentage || 0}% selesai</p>
            <p className="text-[11px] text-gray-500">{stats.trainingDasarCompleted || 0} orang</p>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-3 md:p-4">
          <div className="space-y-0.5">
            <p className="text-xs font-medium text-gray-500">Training Leadership</p>
            <p className="text-sm md:text-base font-bold text-gray-900">{stats.trainingLeadershipPercentage || 0}% selesai</p>
            <p className="text-[11px] text-gray-500">{stats.trainingLeadershipCompleted || 0} orang</p>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-3 md:p-4">
          <div className="space-y-0.5">
            <p className="text-xs font-medium text-gray-500">Training Skill</p>
            <p className="text-sm md:text-base font-bold text-gray-900">{stats.trainingSkillPercentage || 0}% selesai</p>
            <p className="text-[11px] text-gray-500">{stats.trainingSkillCompleted || 0} orang</p>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-3 md:p-4">
          <div className="space-y-0.5">
            <p className="text-xs font-medium text-gray-500">Training Lanjutan</p>
            <p className="text-sm md:text-base font-bold text-gray-900">{stats.trainingLanjutanPercentage || 0}% selesai</p>
            <p className="text-[11px] text-gray-500">{stats.trainingLanjutanCompleted || 0} orang</p>
          </div>
        </div>
      </div>

      

      {/* Tabel utama tanpa header box */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 mt-4">
        <div className="px-0 pt-0 pb-4">
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
            <div className="overflow-x-hidden">
              <table className="w-full table-fixed divide-y divide-gray-200">
                <colgroup>
                  {/* Kolom No: fixed kecil agar konsisten di mobile */}
                  <col style={{ width: '44px' }} />
                  {/* Kolom Nama dan Status: auto */}
                  <col />
                  <col />
                  {/* Kolom Edit: fixed agar tombol tidak terpotong */}
                  <col style={{ width: '56px' }} />
                </colgroup>
                <thead className="bg-red-700">
                  <tr>
                    <th className="px-3 md:px-4 py-3 text-left text-sm font-semibold text-white tracking-wider">No</th>
                    <th className="px-3 md:px-4 py-3 text-left text-sm font-semibold text-white tracking-wider">Nama</th>
                    <th className="px-3 md:px-4 py-3 text-left text-sm font-semibold text-white tracking-wider">Training Status</th>
                    <th className="px-3 md:px-4 py-3 text-left text-sm font-semibold text-white tracking-wider">Edit</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {trainings.map((userTraining, idx) => (
                    <tr
                      key={userTraining.id}
                      className="hover:bg-gray-50"
                      onClick={() => { /* modal detail disembunyikan */ }}
                    >
                      <td className="px-3 md:px-4 py-3 md:py-4 text-sm text-gray-900">{idx + 1}</td>
                      <td className="px-3 md:px-4 py-3 md:py-4">
                        {/* Mobile: dua baris */}
                        <div className="block md:hidden text-sm font-medium text-gray-900 leading-tight">
                          {(() => {
                            const parts = (userTraining.nama || '').trim().split(/\s+/)
                            const first = parts[0] || ''
                            const rest = parts.slice(1).join(' ')
                            return (
                              <>
                                <div>{first}</div>
                                {rest && <div>{rest}</div>}
                              </>
                            )
                          })()}
                        </div>
                        {/* Desktop: satu baris */}
                        <div className="hidden md:block text-sm font-medium text-gray-900 truncate max-w-xs lg:max-w-sm xl:max-w-md">
                          {userTraining.nama}
                        </div>
                      </td>
                      <td className="px-3 md:px-4 py-3 md:py-4">
                        <div className="flex items-center gap-1.5 md:gap-3">
                          {[userTraining.training_dasar, userTraining.training_leadership, userTraining.training_skill, userTraining.training_lanjutan].map((done, i) => (
                            <span key={i} className={`inline-flex items-center justify-center h-4 w-4 md:h-5 md:w-5 rounded-full ${done ? 'bg-red-600' : 'bg-gray-300'}`}>
                              {done && <Check className="h-3 w-3 md:h-3.5 md:w-3.5 text-white" />}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="px-3 md:px-4 py-3 md:py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          type="button"
                          className="inline-flex items-center justify-center h-7 w-7 md:h-8 md:w-8 bg-red-600 text-white rounded-lg hover:bg-red-700"
                          onClick={(e) => { e.stopPropagation(); openEditModal(userTraining) }}
                          title="Edit"
                        >
                          <Edit className="h-3.5 w-3.5 md:h-4 md:w-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-between items-center mt-6 px-6">
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
        </div>
      </div>

      {/* Detail Modal dinonaktifkan sesuai permintaan */}
      {false && (
        <Dialog open={false} onOpenChange={setDetailOpen}>
          <DialogContent>
            <DialogHeaderUI>
              <DialogTitleUI>Detail Training Karyawan</DialogTitleUI>
            </DialogHeaderUI>
            <DialogBodyUI />
            <DialogFooterUI />
          </DialogContent>
        </Dialog>
      )}

      {/* Modal Tambah Training - disembunyikan */}
      {false && (
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="max-w-3xl w-full p-0 overflow-hidden rounded-2xl border border-gray-200">
          <div className="flex items-center justify-between px-6 py-3 border-b border-red-700 bg-red-800 text-white sticky top-0 z-10">
            <div>
              <h3 className="text-xl font-bold leading-tight">Tambah Status Training Karyawan</h3>
            </div>
            <button onClick={() => setCreateOpen(false)} className="p-2 text-white/90 hover:text-white hover:bg-white/10 rounded-lg transition-colors" aria-label="Tutup">✕</button>
          </div>
          <div className="flex-1 min-h-0 overflow-y-auto px-6 py-5 scrollbar-hide">
            <AdminTrainingForm
              inModal
              formId="adminTrainingCreateForm"
              onSuccess={() => { setCreateOpen(false); loadTrainings(); loadStats(); }}
              onCancel={() => setCreateOpen(false)}
            />
          </div>
          <div className="p-0 border-t bg-white">
            <div className="grid grid-cols-2 gap-2 px-2 py-2">
              <button type="button" onClick={() => setCreateOpen(false)} className="w-full py-2 bg-red-700 text-white font-semibold hover:bg-red-800 transition-colors rounded-lg">Batal</button>
              <button type="submit" form="adminTrainingCreateForm" className="w-full py-2 bg-red-700 text-white font-semibold hover:bg-red-800 transition-colors rounded-lg">Simpan</button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      )}

      {/* Modal Edit Training */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="max-w-3xl w-full p-0 overflow-hidden rounded-2xl border border-gray-200">
          <div className="flex items-center justify-between px-6 py-3 border-b border-red-700 bg-red-800 text-white sticky top-0 z-10">
            <div>
              <h3 className="text-xl font-bold leading-tight">Edit Status Training Karyawan</h3>
            </div>
            <button onClick={() => setEditOpen(false)} className="p-2 text-white/90 hover:text-white hover:bg-white/10 rounded-lg transition-colors" aria-label="Tutup">✕</button>
          </div>
          <div className="flex-1 min-h-0 overflow-y-auto px-6 py-5 scrollbar-hide">
            {editLoading ? (
              <div className="text-gray-600">Memuat data...</div>
            ) : (
              <AdminTrainingForm
                inModal
                formId="adminTrainingEditForm"
                editingIdOverride={selectedUser?.id}
                initialData={editInitial}
                onSuccess={() => { setEditOpen(false); loadTrainings(); loadStats(); }}
                onCancel={() => setEditOpen(false)}
              />
            )}
          </div>
          <div className="p-0 border-t bg-white">
            <div className="grid grid-cols-2 gap-2 px-2 py-2">
              <button type="button" onClick={() => setEditOpen(false)} className="w-full py-2 bg-red-700 text-white font-semibold hover:bg-red-800 transition-colors rounded-lg">Batal</button>
              <button type="submit" form="adminTrainingEditForm" className="w-full py-2 bg-red-700 text-white font-semibold hover:bg-red-800 transition-colors rounded-lg">Simpan</button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default AdminTrainingList