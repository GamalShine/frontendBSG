import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { adminTugasService } from '../../../services/tugasService'
import { userService } from '../../../services/userService'
import { 
  Search, 
  Plus, 
  Eye, 
  Edit, 
  Trash2, 
  CheckSquare,
  Clock,
  AlertTriangle,
  CheckCircle,
  XCircle,
  User,
  Calendar
} from 'lucide-react'
import toast from 'react-hot-toast'

const AdminTugasList = () => {
  const [tugas, setTugas] = useState([])
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [priorityFilter, setPriorityFilter] = useState('')
  const [assigneeFilter, setAssigneeFilter] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  useEffect(() => {
    loadTugas()
    loadUsers()
  }, [currentPage, statusFilter, priorityFilter, assigneeFilter])

  const loadTugas = async () => {
    try {
      setLoading(true)
      const params = {
        page: currentPage,
        limit: 10,
        search: searchTerm,
        status: statusFilter,
        priority: priorityFilter,
        assignee: assigneeFilter
      }
      
      const response = await adminTugasService.getAdminTugas(params)
      console.log('🔍 Admin Tugas response:', response)
      
      if (response.success) {
        // Backend returns data directly
        setTugas(response.data || [])
        setTotalPages(response.pagination?.totalPages || 1)
      } else {
        console.error('❌ Admin Tugas response not successful:', response)
        setTugas([])
        setTotalPages(1)
      }
    } catch (error) {
      toast.error('Gagal memuat daftar tugas')
      console.error('Error loading tugas:', error)
      setTugas([])
      setTotalPages(1)
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

  const handleSearch = () => {
    setCurrentPage(1)
    loadTugas()
  }

  const handleStatusUpdate = async (id, newStatus) => {
    try {
      const response = await adminTugasService.updateTugasByAdmin(id, { status: newStatus })
      if (response.success) {
        toast.success('Status tugas berhasil diperbarui')
        loadTugas()
      }
    } catch (error) {
      toast.error('Gagal memperbarui status tugas')
      console.error('Error updating status:', error)
    }
  }

  const handleDelete = async (id) => {
    if (window.confirm('Apakah Anda yakin ingin menghapus tugas ini?')) {
      try {
        const response = await adminTugasService.deleteTugas(id)
        if (response.success) {
          toast.success('Tugas berhasil dihapus')
          loadTugas()
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
        return <Clock className="h-4 w-4 text-yellow-500" />
      case 'in_progress':
        return <AlertTriangle className="h-4 w-4 text-blue-500" />
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'cancelled':
        return <XCircle className="h-4 w-4 text-red-500" />
      default:
        return <Clock className="h-4 w-4 text-gray-500" />
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
      month: 'short',
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

  return (
    <div className="p-6">
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Manajemen Tugas</h1>
            <p className="text-gray-600">Kelola semua tugas dalam sistem</p>
          </div>
          <Link
            to="/admin/tugas/new"
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center"
          >
            <Plus className="h-4 w-4 mr-2" />
            Tambah Tugas
          </Link>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Cari</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                placeholder="Cari tugas..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Semua Status</option>
              <option value="pending">Pending</option>
              <option value="in_progress">Dalam Proses</option>
              <option value="completed">Selesai</option>
              <option value="cancelled">Dibatalkan</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Prioritas</label>
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Semua Prioritas</option>
              <option value="high">Tinggi</option>
              <option value="medium">Sedang</option>
              <option value="low">Rendah</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Assignee</label>
            <select
              value={assigneeFilter}
              onChange={(e) => setAssigneeFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Semua Assignee</option>
              {users.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.nama} - {user.divisi}
                </option>
              ))}
            </select>
          </div>
          
          <div className="flex items-end">
            <button
              onClick={handleSearch}
              className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Search className="h-4 w-4 inline mr-2" />
              Cari
            </button>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tugas
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Assignee
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Deadline
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Prioritas
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan="6" className="px-6 py-4 text-center text-gray-500">
                    Memuat data...
                  </td>
                </tr>
              ) : tugas.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-4 text-center text-gray-500">
                    Tidak ada tugas ditemukan
                  </td>
                </tr>
              ) : (
                tugas.map((tugas) => (
                  <tr key={tugas.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {tugas.judul_tugas}
                        </div>
                        <div className="text-sm text-gray-500 truncate max-w-xs">
                          {tugas.deskripsi_tugas}
                        </div>
                        <div className="text-xs text-gray-400 mt-1">
                          Kategori: {tugas.kategori_tugas}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                          <User className="h-4 w-4 text-blue-600" />
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {tugas.penerima_tugas?.nama || 'Belum ditugaskan'}
                          </div>
                          <div className="text-sm text-gray-500">
                            {tugas.penerima_tugas?.divisi || '-'}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <div className="text-sm text-gray-900">{formatDate(tugas.deadline)}</div>
                        <div className="text-xs text-gray-500">{getDaysRemaining(tugas.deadline)}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        {getStatusIcon(tugas.status)}
                        <span className={`ml-2 px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(tugas.status)}`}>
                          {tugas.status === 'pending' && 'Pending'}
                          {tugas.status === 'in_progress' && 'Dalam Proses'}
                          {tugas.status === 'completed' && 'Selesai'}
                          {tugas.status === 'cancelled' && 'Dibatalkan'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(tugas.prioritas)}`}>
                        {tugas.prioritas === 'high' && 'Tinggi'}
                        {tugas.prioritas === 'medium' && 'Sedang'}
                        {tugas.prioritas === 'low' && 'Rendah'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        <Link
                          to={`/admin/tugas/${tugas.id}`}
                          className="p-1 text-blue-600 hover:text-blue-800"
                          title="Lihat Detail"
                        >
                          <Eye className="h-4 w-4" />
                        </Link>
                        <Link
                          to={`/admin/tugas/${tugas.id}/edit`}
                          className="p-1 text-green-600 hover:text-green-800"
                          title="Edit"
                        >
                          <Edit className="h-4 w-4" />
                        </Link>
                        <button
                          onClick={() => handleDelete(tugas.id)}
                          className="p-1 text-red-600 hover:text-red-800"
                          title="Hapus"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="bg-white px-4 py-3 border-t border-gray-200 sm:px-6">
            <div className="flex items-center justify-between">
              <div className="flex-1 flex justify-between sm:hidden">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                >
                  Sebelumnya
                </button>
                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                >
                  Selanjutnya
                </button>
              </div>
              <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-gray-700">
                    Halaman <span className="font-medium">{currentPage}</span> dari{' '}
                    <span className="font-medium">{totalPages}</span>
                  </p>
                </div>
                <div>
                  <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                    <button
                      onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                      disabled={currentPage === 1}
                      className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                    >
                      Sebelumnya
                    </button>
                    <button
                      onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                      disabled={currentPage === totalPages}
                      className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                    >
                      Selanjutnya
                    </button>
                  </nav>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default AdminTugasList 