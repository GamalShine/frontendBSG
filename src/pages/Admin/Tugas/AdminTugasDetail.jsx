import React, { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { 
  ArrowLeft, 
  Edit, 
  Trash2, 
  CheckSquare,
  Clock,
  AlertTriangle,
  CheckCircle,
  XCircle,
  User, 
  Calendar, 
  ChevronRight,
  FileText,
  MessageSquare
} from 'lucide-react'
import { tugasService, adminTugasService } from '../../../services/tugasService'
import { uploadService } from '../../../services/uploadService'
import { userService } from '../../../services/userService'
import toast from 'react-hot-toast'
import { MENU_CODES } from '@/config/menuCodes'

const AdminTugasDetail = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [tugas, setTugas] = useState(null)
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    loadTugas()
      loadUsers()
  }, [id])

  const loadTugas = async () => {
    try {
      setLoading(true)
      // Gunakan endpoint admin agar include relasi user dan field dibersihkan sesuai backend
      const response = await adminTugasService.getAdminTugasById(id)
      if (response.success) {
        setTugas(response.data)
      } else {
        toast.error('Gagal memuat detail tugas')
        navigate('/admin/tugas')
      }
    } catch (error) {
      toast.error('Gagal memuat detail tugas')
      console.error('Error loading task:', error)
      navigate('/admin/tugas')
    } finally {
      setLoading(false)
    }
  }

  // Upload lampiran (fitur Tindak)
  const handleUploadLampiran = async (event) => {
    const files = Array.from(event?.target?.files || [])
    if (files.length === 0) return
    try {
      setUploading(true)
      const res = await uploadService.uploadMultipleFiles(files, 'document')

      // Ekstrak nama file yang terupload dari berbagai bentuk response
      let uploadedNames = []
      const candidate = res?.files || res?.data || res
      if (Array.isArray(candidate)) {
        uploadedNames = candidate
          .map((it) => typeof it === 'string' ? it : (it?.filename || it?.name || it?.path || ''))
          .filter(Boolean)
      } else if (candidate && typeof candidate === 'object') {
        const arr = candidate.files || candidate.data || []
        if (Array.isArray(arr)) {
          uploadedNames = arr
            .map((it) => typeof it === 'string' ? it : (it?.filename || it?.name || it?.path || ''))
            .filter(Boolean)
        }
      }

      const existing = Array.isArray(tugas?.lampiran) ? tugas.lampiran : []
      const merged = [...existing, ...uploadedNames]

      const upd = await adminTugasService.updateTugasByAdmin(id, { lampiran: merged })
      if (upd?.success || upd?.data) {
        toast.success('Lampiran berhasil diupload')
        await loadTugas()
      } else {
        toast.error('Gagal menyimpan lampiran tugas')
      }
    } catch (e) {
      console.error('Upload lampiran error:', e)
      toast.error(e?.message || 'Gagal upload lampiran')
    } finally {
      setUploading(false)
      if (event?.target) event.target.value = ''
    }
  }

  const loadUsers = async () => {
    try {
      const response = await userService.getUsers()
      if (response.success) {
        setUsers(response.data)
      }
    } catch (error) {
      console.error('Error loading users:', error)
    }
  }

  const handleDelete = async () => {
    if (!window.confirm('Apakah Anda yakin ingin menghapus tugas ini?')) {
      return
    }

    try {
      setDeleting(true)
      // Hapus via admin endpoint agar konsisten
      await adminTugasService.deleteTugasByAdmin(id)
          toast.success('Tugas berhasil dihapus')
          navigate('/admin/tugas')
      } catch (error) {
        toast.error('Gagal menghapus tugas')
      console.error('Error deleting task:', error)
    } finally {
      setDeleting(false)
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'belum':
        return <Clock className="h-5 w-5 text-yellow-500" />
      case 'proses':
        return <AlertTriangle className="h-5 w-5 text-blue-500" />
      case 'selesai':
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case 'revisi':
        return <XCircle className="h-5 w-5 text-red-500" />
      default:
        return <Clock className="h-5 w-5 text-gray-500" />
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'belum':
        return 'bg-yellow-100 text-yellow-800'
      case 'proses':
        return 'bg-blue-100 text-blue-800'
      case 'selesai':
        return 'bg-green-100 text-green-800'
      case 'revisi':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'mendesak':
        return 'bg-red-100 text-red-800'
      case 'penting':
        return 'bg-yellow-100 text-yellow-800'
      case 'berproses':
        return 'bg-green-100 text-green-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const formatDate = (dateString) => {
    if (!dateString) return '-'
    const date = new Date(dateString)
    return date.toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getUserName = (userId) => {
    const user = users.find(u => u.id === userId)
    return user ? user.nama : 'Unknown User'
  }

  const getUserRole = (userId) => {
    const user = users.find(u => u.id === userId)
    return user ? user.role : 'Unknown Role'
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Memuat detail tugas...</p>
        </div>
      </div>
    )
  }

  if (!tugas) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Tugas tidak ditemukan</p>
          <Link to="/admin/tugas" className="text-red-600 hover:text-red-700 mt-2 inline-block">
            Kembali ke daftar tugas
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header - Dark Red (WhatsApp-like) */}
      <div className="bg-red-800 text-white">
        <div className="px-6 py-4">
        <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <button 
                onClick={() => navigate('/admin/tugas')}
                className="p-2 text-white hover:bg-red-700 rounded-full transition-colors"
              >
                <ChevronRight className="h-5 w-5 rotate-180" />
              </button>
            <div>
                <div className="text-xs font-medium text-red-200">{MENU_CODES.sdm.daftarTugas}</div>
                <div className="text-lg font-bold">Detail Tugas</div>
              </div>
            </div>
            <button className="p-2 text-white hover:bg-red-700 rounded-full transition-colors">
              <div className="w-1 h-1 bg-white rounded-full mb-1"></div>
              <div className="w-1 h-1 bg-white rounded-full mb-1"></div>
              <div className="w-1 h-1 bg-white rounded-full"></div>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-6">
        <div className="max-w-4xl mx-auto">
          {/* Page Header */}
          <div className="mb-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{tugas.judul_tugas}</h1>
                <p className="text-gray-600">Detail informasi tugas</p>
              </div>
              <div className="flex space-x-3 items-center">
                <Link
                  to={`/admin/tugas/${id}/edit`}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center"
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </Link>
                <button
                  onClick={handleDelete}
                  disabled={deleting}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center"
                >
                  {deleting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Menghapus...
                    </>
                  ) : (
                    <>
                      <Trash2 className="h-4 w-4 mr-2" />
                      Hapus
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Task Information */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
              {/* Basic Information */}
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <CheckSquare className="h-5 w-5 mr-2 text-blue-600" />
                  Informasi Tugas
                </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Judul Tugas</label>
                <p className="text-gray-900 font-medium">{tugas.judul_tugas}</p>
              </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Keterangan</label>
                    <p className="text-gray-900 whitespace-pre-wrap">{tugas.keterangan_tugas}</p>
                  </div>
              <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Catatan</label>
                    <p className="text-gray-900">
                      {tugas.catatan ? tugas.catatan : 'Tidak ada catatan'}
                    </p>
                  </div>
                </div>
              </div>
              
              {/* Assignment Information */}
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <User className="h-5 w-5 mr-2 text-green-600" />
                  Informasi Penugasan
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Pemberi Tugas</label>
                    <p className="text-gray-900 font-medium">{getUserName(tugas.pemberi_tugas)}</p>
                    <p className="text-sm text-gray-500">{getUserRole(tugas.pemberi_tugas)}</p>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Penerima Tugas</label>
                    <p className="text-gray-900 font-medium">{getUserName(tugas.penerima_tugas)}</p>
                    <p className="text-sm text-gray-500">{getUserRole(tugas.penerima_tugas)}</p>
                  </div>
                </div>
                {tugas.pihak_terkait && Array.isArray(tugas.pihak_terkait) && tugas.pihak_terkait.length > 0 && (
                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Pihak Terkait</label>
                    <div className="flex flex-wrap gap-2">
                      {tugas.pihak_terkait.map((userId, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                        >
                          {getUserName(userId)}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              
              {/* Attachments */}
              {tugas.lampiran && Array.isArray(tugas.lampiran) && tugas.lampiran.length > 0 && (
                <div className="bg-white rounded-lg shadow-sm border p-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <FileText className="h-5 w-5 mr-2 text-purple-600" />
                    Lampiran
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {tugas.lampiran.map((attachment, index) => (
                      <div key={index} className="p-3 border border-gray-200 rounded-lg">
                        <p className="text-sm text-gray-600 truncate">{attachment}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Status & Priority */}
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <MessageSquare className="h-5 w-5 mr-2 text-indigo-600" />
                  Status & Prioritas
                </h2>
            <div className="space-y-4">
              <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(tugas.status)}`}>
                      {getStatusIcon(tugas.status)}
                      <span className="ml-2">{tugas.status}</span>
                    </span>
              </div>
              <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Prioritas</label>
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getPriorityColor(tugas.skala_prioritas)}`}>
                      {tugas.skala_prioritas}
              </span>
            </div>
                  {tugas.rating && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Rating</label>
                      <div className="flex items-center">
                        {[...Array(5)].map((_, index) => (
                          <span
                            key={index}
                            className={`text-lg ${
                              index < tugas.rating ? 'text-yellow-400' : 'text-gray-300'
                            }`}
                          >
                            ★
                          </span>
                        ))}
                        <span className="ml-2 text-sm text-gray-600">({tugas.rating}/5)</span>
              </div>
            </div>
                  )}
                </div>
              </div>

              {/* Timeline */}
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <Calendar className="h-5 w-5 mr-2 text-orange-600" />
                  Timeline
                </h2>
            <div className="space-y-4">
              <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Dibuat</label>
                    <p className="text-sm text-gray-600">{formatDate(tugas.created_at)}</p>
              </div>
              <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Target Selesai</label>
                    <p className="text-sm text-gray-600">{formatDate(tugas.target_selesai)}</p>
              </div>
                  {tugas.completed_at && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Selesai</label>
                      <p className="text-sm text-gray-600">{formatDate(tugas.completed_at)}</p>
            </div>
                  )}
              <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Terakhir Update</label>
                    <p className="text-sm text-gray-600">{formatDate(tugas.updated_at)}</p>
              </div>
              </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdminTugasDetail 