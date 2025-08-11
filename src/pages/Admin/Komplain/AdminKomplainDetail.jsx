import React, { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { adminKomplainService } from '../../../services/komplainService'
import { userService } from '../../../services/userService'
import { 
  ArrowLeft, 
  Edit, 
  Trash2, 
  User, 
  Calendar, 
  AlertTriangle,
  CheckCircle,
  Clock,
  XCircle,
  MessageSquare,
  FileText
} from 'lucide-react'
import toast from 'react-hot-toast'

const AdminKomplainDetail = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [komplain, setKomplain] = useState(null)
  const [loading, setLoading] = useState(false)
  const [users, setUsers] = useState([])
  const [selectedStatus, setSelectedStatus] = useState('')
  const [selectedResponsible, setSelectedResponsible] = useState('')
  const [adminNote, setAdminNote] = useState('')

  useEffect(() => {
    if (id) {
      loadKomplainDetail()
      loadUsers()
    }
  }, [id])

  const loadKomplainDetail = async () => {
    try {
      setLoading(true)
      const response = await adminKomplainService.getAdminKomplainById(id)
      if (response.success) {
        setKomplain(response.data)
        setSelectedStatus(response.data.status)
        setSelectedResponsible(response.data.penerima_komplain_id || '')
        setAdminNote(response.data.catatan_admin || '')
      }
    } catch (error) {
      toast.error('Gagal memuat detail komplain')
      console.error('Error loading komplain detail:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadUsers = async () => {
    try {
      const response = await userService.getUsers({ role: 'admin,leader' })
      if (response.success) {
        setUsers(response.data)
      }
    } catch (error) {
      console.error('Error loading users:', error)
    }
  }

  const handleStatusUpdate = async () => {
    try {
      const response = await adminKomplainService.updateKomplainStatus(id, {
        status: selectedStatus,
        catatan_admin: adminNote
      })
      if (response.success) {
        toast.success('Status komplain berhasil diperbarui')
        loadKomplainDetail()
      }
    } catch (error) {
      toast.error('Gagal memperbarui status komplain')
      console.error('Error updating status:', error)
    }
  }

  const handleAssign = async () => {
    try {
      const response = await adminKomplainService.assignKomplain(id, selectedResponsible)
      if (response.success) {
        toast.success('Komplain berhasil ditugaskan')
        loadKomplainDetail()
      }
    } catch (error) {
      toast.error('Gagal menugaskan komplain')
      console.error('Error assigning komplain:', error)
    }
  }

  const handleDelete = async () => {
    if (window.confirm('Apakah Anda yakin ingin menghapus komplain ini?')) {
      try {
        const response = await adminKomplainService.deleteKomplain(id)
        if (response.success) {
          toast.success('Komplain berhasil dihapus')
          navigate('/admin/komplain')
        }
      } catch (error) {
        toast.error('Gagal menghapus komplain')
        console.error('Error deleting komplain:', error)
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
      case 'rejected':
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
      case 'rejected':
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

  if (loading) {
    return (
      <div className="p-6">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Memuat detail komplain...</p>
        </div>
      </div>
    )
  }

  if (!komplain) {
    return (
      <div className="p-6">
        <div className="text-center">
          <p className="text-gray-600">Komplain tidak ditemukan</p>
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
              to="/admin/komplain"
              className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
            >
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Detail Komplain</h1>
              <p className="text-gray-600">ID: #{komplain.id}</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Link
              to={`/admin/komplain/${id}/edit`}
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
          {/* Komplain Details */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Informasi Komplain</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Judul Komplain</label>
                <p className="text-gray-900 font-medium">{komplain.judul_komplain}</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Deskripsi</label>
                <p className="text-gray-900 whitespace-pre-wrap">{komplain.deskripsi_komplain}</p>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Kategori</label>
                  <p className="text-gray-900">{komplain.kategori_komplain}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Prioritas</label>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(komplain.prioritas)}`}>
                    {komplain.prioritas === 'high' && 'Tinggi'}
                    {komplain.prioritas === 'medium' && 'Sedang'}
                    {komplain.prioritas === 'low' && 'Rendah'}
                  </span>
                </div>
              </div>
              
              {komplain.lampiran && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Lampiran</label>
                  <div className="flex items-center space-x-2">
                    <FileText className="h-4 w-4 text-gray-400" />
                    <a
                      href={komplain.lampiran}
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
                  <option value="rejected">Ditolak</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Catatan Admin</label>
                <textarea
                  value={adminNote}
                  onChange={(e) => setAdminNote(e.target.value)}
                  rows="3"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Tambahkan catatan untuk komplain ini..."
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
              {getStatusIcon(komplain.status)}
              <span className={`px-3 py-1 text-sm font-medium rounded-full ${getStatusColor(komplain.status)}`}>
                {komplain.status === 'pending' && 'Pending'}
                {komplain.status === 'in_progress' && 'Dalam Proses'}
                {komplain.status === 'completed' && 'Selesai'}
                {komplain.status === 'rejected' && 'Ditolak'}
              </span>
            </div>
            
            <div className="space-y-3 text-sm">
              <div className="flex items-center space-x-2">
                <Calendar className="h-4 w-4 text-gray-400" />
                <span className="text-gray-600">Dibuat: {formatDate(komplain.created_at)}</span>
              </div>
              {komplain.updated_at && (
                <div className="flex items-center space-x-2">
                  <Calendar className="h-4 w-4 text-gray-400" />
                  <span className="text-gray-600">Diupdate: {formatDate(komplain.updated_at)}</span>
                </div>
              )}
            </div>
          </div>

          {/* Pelapor Info */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Informasi Pelapor</h3>
            
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <User className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="font-medium text-gray-900">{komplain.pelapor?.nama}</p>
                <p className="text-sm text-gray-500">{komplain.pelapor?.username}</p>
              </div>
            </div>
            
            <div className="space-y-2 text-sm">
              <div>
                <span className="text-gray-600">Divisi:</span>
                <span className="ml-2 text-gray-900">{komplain.pelapor?.divisi}</span>
              </div>
              <div>
                <span className="text-gray-600">Jabatan:</span>
                <span className="ml-2 text-gray-900">{komplain.pelapor?.jabatan}</span>
              </div>
              <div>
                <span className="text-gray-600">Email:</span>
                <span className="ml-2 text-gray-900">{komplain.pelapor?.email}</span>
              </div>
            </div>
          </div>

          {/* Assignment */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Penugasan</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Pilih Penanggung Jawab</label>
                <select
                  value={selectedResponsible}
                  onChange={(e) => setSelectedResponsible(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Pilih penanggung jawab...</option>
                  {users.map((user) => (
                    <option key={user.id} value={user.id}>
                      {user.nama} - {user.divisi}
                    </option>
                  ))}
                </select>
              </div>
              
              {komplain.penerima_komplain && (
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-600 mb-1">Penanggung Jawab Saat Ini:</p>
                  <p className="font-medium text-gray-900">{komplain.penerima_komplain.nama}</p>
                  <p className="text-sm text-gray-500">{komplain.penerima_komplain.divisi}</p>
                </div>
              )}
              
              <button
                onClick={handleAssign}
                disabled={!selectedResponsible}
                className="w-full bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Tugaskan
              </button>
            </div>
          </div>

          {/* Rating */}
          {komplain.rating_kepuasan && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Rating Kepuasan</h3>
              
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-600">Rating:</span>
                  <div className="flex space-x-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <span
                        key={star}
                        className={`text-lg ${
                          star <= komplain.rating_kepuasan
                            ? 'text-yellow-400'
                            : 'text-gray-300'
                        }`}
                      >
                        ★
                      </span>
                    ))}
                  </div>
                  <span className="text-sm text-gray-900">({komplain.rating_kepuasan}/5)</span>
                </div>
                
                {komplain.komentar_kepuasan && (
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Komentar:</p>
                    <p className="text-sm text-gray-900">{komplain.komentar_kepuasan}</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default AdminKomplainDetail 