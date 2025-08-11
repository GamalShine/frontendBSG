import React, { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { adminTugasService } from '../../../services/tugasService'
import { userService } from '../../../services/userService'
import { 
  ArrowLeft, 
  Edit, 
  Trash2, 
  User, 
  Calendar, 
  CheckSquare,
  Clock,
  AlertTriangle,
  CheckCircle,
  XCircle,
  FileText,
  MessageSquare
} from 'lucide-react'
import toast from 'react-hot-toast'

const AdminTugasDetail = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [tugas, setTugas] = useState(null)
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(false)
  const [selectedStatus, setSelectedStatus] = useState('')
  const [selectedAssignee, setSelectedAssignee] = useState('')
  const [adminNote, setAdminNote] = useState('')

  useEffect(() => {
    if (id) {
      loadTugasDetail()
      loadUsers()
    }
  }, [id])

  const loadTugasDetail = async () => {
    try {
      setLoading(true)
      const response = await adminTugasService.getAdminTugasById(id)
      if (response.success) {
        setTugas(response.data)
        setSelectedStatus(response.data.status)
        setSelectedAssignee(response.data.penerima_tugas_id || '')
        setAdminNote(response.data.catatan_admin || '')
      }
    } catch (error) {
      toast.error('Gagal memuat detail tugas')
      console.error('Error loading tugas detail:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadUsers = async () => {
    try {
      const response = await userService.getUsers({ role: 'divisi,leader' })
      if (response.success) {
        setUsers(response.data.users || [])
      }
    } catch (error) {
      console.error('Error loading users:', error)
    }
  }

  const handleStatusUpdate = async () => {
    try {
      const response = await adminTugasService.updateTugasByAdmin(id, {
        status: selectedStatus,
        catatan_admin: adminNote
      })
      if (response.success) {
        toast.success('Status tugas berhasil diperbarui')
        loadTugasDetail()
      }
    } catch (error) {
      toast.error('Gagal memperbarui status tugas')
      console.error('Error updating status:', error)
    }
  }

  const handleAssign = async () => {
    try {
      const response = await adminTugasService.assignTugas(id, selectedAssignee)
      if (response.success) {
        toast.success('Tugas berhasil ditugaskan')
        loadTugasDetail()
      }
    } catch (error) {
      toast.error('Gagal menugaskan tugas')
      console.error('Error assigning tugas:', error)
    }
  }

  const handleDelete = async () => {
    if (window.confirm('Apakah Anda yakin ingin menghapus tugas ini?')) {
      try {
        const response = await adminTugasService.deleteTugas(id)
        if (response.success) {
          toast.success('Tugas berhasil dihapus')
          navigate('/admin/tugas')
        }
      } catch (error) {
        toast.error('Gagal menghapus tugas')
        console.error('Error deleting tugas:', error)
      }
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-5 w-5 text-yellow-500" />
      case 'in_progress':
        return <AlertTriangle className="h-5 w-5 text-blue-500" />
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case 'cancelled':
        return <XCircle className="h-5 w-5 text-red-500" />
      default:
        return <Clock className="h-5 w-5 text-gray-500" />
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'in_progress':
        return 'bg-blue-100 text-blue-800'
      case 'completed':
        return 'bg-green-100 text-green-800'
      case 'cancelled':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800'
      case 'medium':
        return 'bg-yellow-100 text-yellow-800'
      case 'low':
        return 'bg-green-100 text-green-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getDaysRemaining = (deadline) => {
    const today = new Date()
    const target = new Date(deadline)
    const diffTime = target - today
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    
    if (diffDays < 0) {
      return <span className="text-red-600 font-medium">Terlambat {Math.abs(diffDays)} hari</span>
    } else if (diffDays === 0) {
      return <span className="text-orange-600 font-medium">Hari ini</span>
    } else {
      return <span className="text-gray-600">{diffDays} hari lagi</span>
    }
  }

  if (loading) {
    return (
      <div className="p-6">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Memuat detail tugas...</p>
        </div>
      </div>
    )
  }

  if (!tugas) {
    return (
      <div className="p-6">
        <div className="text-center">
          <p className="text-gray-600">Tugas tidak ditemukan</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link
              to="/admin/tugas"
              className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
            >
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Detail Tugas</h1>
              <p className="text-gray-600">ID: #{tugas.id}</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Link
              to={`/admin/tugas/${id}/edit`}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Edit className="h-4 w-4 inline mr-2" />
              Edit
            </Link>
            <button
              onClick={handleDelete}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              <Trash2 className="h-4 w-4 inline mr-2" />
              Hapus
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Task Details */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Informasi Tugas</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Judul Tugas</label>
                <p className="text-gray-900 font-medium">{tugas.judul_tugas}</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Deskripsi</label>
                <p className="text-gray-900 whitespace-pre-wrap">{tugas.deskripsi_tugas}</p>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Kategori</label>
                  <p className="text-gray-900">{tugas.kategori_tugas}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Prioritas</label>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(tugas.prioritas)}`}>
                    {tugas.prioritas === 'high' && 'Tinggi'}
                    {tugas.prioritas === 'medium' && 'Sedang'}
                    {tugas.prioritas === 'low' && 'Rendah'}
                  </span>
                </div>
              </div>
              
              {tugas.lampiran && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Lampiran</label>
                  <div className="flex items-center space-x-2">
                    <FileText className="h-4 w-4 text-gray-400" />
                    <a
                      href={tugas.lampiran}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800"
                    >
                      Lihat Lampiran
                    </a>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Status Updates */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Update Status</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Status Baru</label>
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="pending">Pending</option>
                  <option value="in_progress">Dalam Proses</option>
                  <option value="completed">Selesai</option>
                  <option value="cancelled">Dibatalkan</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Catatan Admin</label>
                <textarea
                  value={adminNote}
                  onChange={(e) => setAdminNote(e.target.value)}
                  rows="3"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Tambahkan catatan untuk tugas ini..."
                />
              </div>
              
              <button
                onClick={handleStatusUpdate}
                className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Update Status
              </button>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Current Status */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Status Saat Ini</h3>
            
            <div className="flex items-center space-x-3 mb-4">
              {getStatusIcon(tugas.status)}
              <span className={`px-3 py-1 text-sm font-medium rounded-full ${getStatusColor(tugas.status)}`}>
                {tugas.status === 'pending' && 'Pending'}
                {tugas.status === 'in_progress' && 'Dalam Proses'}
                {tugas.status === 'completed' && 'Selesai'}
                {tugas.status === 'cancelled' && 'Dibatalkan'}
              </span>
            </div>
            
            <div className="space-y-3 text-sm">
              <div className="flex items-center space-x-2">
                <Calendar className="h-4 w-4 text-gray-400" />
                <span className="text-gray-600">Dibuat: {formatDate(tugas.created_at)}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Calendar className="h-4 w-4 text-gray-400" />
                <span className="text-gray-600">Deadline: {formatDate(tugas.deadline)}</span>
              </div>
              <div className="text-sm text-gray-600">
                {getDaysRemaining(tugas.deadline)}
              </div>
            </div>
          </div>

          {/* Assignee Info */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Assignee</h3>
            
            {tugas.penerima_tugas ? (
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <User className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">{tugas.penerima_tugas.nama}</p>
                  <p className="text-sm text-gray-500">{tugas.penerima_tugas.username}</p>
                </div>
              </div>
            ) : (
              <p className="text-gray-500 mb-4">Belum ditugaskan</p>
            )}
            
            <div className="space-y-2 text-sm">
              <div>
                <span className="text-gray-600">Divisi:</span>
                <span className="ml-2 text-gray-900">{tugas.penerima_tugas?.divisi || '-'}</span>
              </div>
              <div>
                <span className="text-gray-600">Jabatan:</span>
                <span className="ml-2 text-gray-900">{tugas.penerima_tugas?.jabatan || '-'}</span>
              </div>
              <div>
                <span className="text-gray-600">Email:</span>
                <span className="ml-2 text-gray-900">{tugas.penerima_tugas?.email || '-'}</span>
              </div>
            </div>
          </div>

          {/* Assignment */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Penugasan</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Pilih Assignee</label>
                <select
                  value={selectedAssignee}
                  onChange={(e) => setSelectedAssignee(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Pilih assignee...</option>
                  {users.map((user) => (
                    <option key={user.id} value={user.id}>
                      {user.nama} - {user.divisi}
                    </option>
                  ))}
                </select>
              </div>
              
              <button
                onClick={handleAssign}
                disabled={!selectedAssignee}
                className="w-full bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Tugaskan
              </button>
            </div>
          </div>

          {/* Creator Info */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Pembuat Tugas</h3>
            
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                <User className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="font-medium text-gray-900">{tugas.pemberi_tugas?.nama}</p>
                <p className="text-sm text-gray-500">{tugas.pemberi_tugas?.username}</p>
              </div>
            </div>
            
            <div className="space-y-2 text-sm">
              <div>
                <span className="text-gray-600">Divisi:</span>
                <span className="ml-2 text-gray-900">{tugas.pemberi_tugas?.divisi}</span>
              </div>
              <div>
                <span className="text-gray-600">Jabatan:</span>
                <span className="ml-2 text-gray-900">{tugas.pemberi_tugas?.jabatan}</span>
              </div>
              <div>
                <span className="text-gray-600">Email:</span>
                <span className="ml-2 text-gray-900">{tugas.pemberi_tugas?.email}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdminTugasDetail 