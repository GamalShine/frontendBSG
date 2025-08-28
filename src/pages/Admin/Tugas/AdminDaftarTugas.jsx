import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { tugasService } from '../../../services/tugasService'
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
  Calendar,
  Filter,
  ChevronRight,
  MoreVertical
} from 'lucide-react'
import toast from 'react-hot-toast'

const AdminDaftarTugas = () => {
  const [tugas, setTugas] = useState([])
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [priorityFilter, setPriorityFilter] = useState('')
  const [assigneeFilter, setAssigneeFilter] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalItems, setTotalItems] = useState(0)

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
      
      const response = await tugasService.getTugas(params)
      console.log('🔍 Admin Tugas response:', response)
      
      if (response.success) {
        setTugas(response.data || [])
        setTotalPages(response.pagination?.totalPages || 1)
        setTotalItems(response.pagination?.totalItems || 0)
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
      const response = await userService.getUsers()
      if (response.success) {
        setUsers(response.data)
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
      const response = await tugasService.updateTugas(id, { status: newStatus })
      if (response.success || response.data) {
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
        await tugasService.deleteTugas(id)
        toast.success('Tugas berhasil dihapus')
        loadTugas()
      } catch (error) {
        toast.error('Gagal menghapus tugas')
        console.error('Error deleting tugas:', error)
      }
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'belum':
        return <Clock className="h-4 w-4 text-yellow-500" />
      case 'proses':
        return <AlertTriangle className="h-4 w-4 text-blue-500" />
      case 'selesai':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'revisi':
        return <XCircle className="h-4 w-4 text-red-500" />
      default:
        return <Clock className="h-4 w-4 text-gray-500" />
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
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getUserName = (userId) => {
    const user = users.find(u => u.id === userId)
    return user ? user.nama : 'Unknown User'
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header - Dark Red (WhatsApp-like) */}
      <div className="bg-red-800 text-white">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <button className="p-2 text-white hover:bg-red-700 rounded-full transition-colors">
                <ChevronRight className="h-5 w-5 rotate-180" />
              </button>
              <div>
                <div className="text-xs font-medium text-red-200">H01-S4</div>
                <div className="text-lg font-bold">Daftar Tugas</div>
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

      {/* Last Update Info */}
      <div className="bg-gray-200 px-6 py-2">
        <p className="text-sm text-gray-600">
          Data terakhir diupdate: {new Date().toLocaleDateString('id-ID', { 
            day: 'numeric', 
            month: 'long', 
            year: 'numeric' 
          })} pukul {new Date().toLocaleTimeString('id-ID', { 
            hour: '2-digit', 
            minute: '2-digit' 
          })}
        </p>
      </div>

      {/* Main Content */}
      <div className="p-6">
        {/* Page Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Manajemen Tugas</h1>
              <p className="text-gray-600">Kelola semua tugas dalam sistem</p>
            </div>
            <Link
              to="/admin/tugas/new"
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center"
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
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              >
                <option value="">Semua Status</option>
                <option value="belum">Belum</option>
                <option value="proses">Proses</option>
                <option value="selesai">Selesai</option>
                <option value="revisi">Revisi</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Prioritas</label>
              <select
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              >
                <option value="">Semua Prioritas</option>
                <option value="mendesak">Mendesak</option>
                <option value="penting">Penting</option>
                <option value="berproses">Berproses</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Penerima</label>
              <select
                value={assigneeFilter}
                onChange={(e) => setAssigneFilter(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              >
                <option value="">Semua Penerima</option>
                {users.map(user => (
                  <option key={user.id} value={user.id}>
                    {user.nama}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="flex items-end">
              <button
                onClick={handleSearch}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center"
              >
                <Search className="h-4 w-4 mr-2" />
                Cari
              </button>
            </div>
          </div>
        </div>

        {/* Tugas List */}
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tugas
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Pemberi
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Penerima
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Prioritas
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Target Selesai
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {loading ? (
                  <tr>
                    <td colSpan="7" className="px-6 py-4 text-center text-gray-500">
                      Memuat data...
                    </td>
                  </tr>
                ) : tugas.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="px-6 py-4 text-center text-gray-500">
                      Tidak ada tugas ditemukan
                    </td>
                  </tr>
                ) : (
                  tugas.map((tugasItem) => (
                    <tr key={tugasItem.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {tugasItem.judul_tugas}
                          </div>
                          <div className="text-sm text-gray-500 truncate max-w-xs">
                            {tugasItem.keterangan_tugas?.substring(0, 100)}...
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {getUserName(tugasItem.pemberi_tugas)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {getUserName(tugasItem.penerima_tugas)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(tugasItem.status)}`}>
                          {getStatusIcon(tugasItem.status)}
                          <span className="ml-1">{tugasItem.status}</span>
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(tugasItem.skala_prioritas)}`}>
                          {tugasItem.skala_prioritas}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(tugasItem.target_selesai)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <Link
                            to={`/admin/tugas/${tugasItem.id}`}
                            className="text-blue-600 hover:text-blue-900 p-1"
                          >
                            <Eye className="h-4 w-4" />
                          </Link>
                          <Link
                            to={`/admin/tugas/${tugasItem.id}/edit`}
                            className="text-indigo-600 hover:text-indigo-900 p-1"
                          >
                            <Edit className="h-4 w-4" />
                          </Link>
                          <button
                            onClick={() => handleDelete(tugasItem.id)}
                            className="text-red-600 hover:text-red-900 p-1"
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
            <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
              <div className="flex-1 flex justify-between sm:hidden">
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                >
                  Sebelumnya
                </button>
                <button
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                >
                  Selanjutnya
                </button>
              </div>
              <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-gray-700">
                    Menampilkan <span className="font-medium">{(currentPage - 1) * 10 + 1}</span> sampai{' '}
                    <span className="font-medium">
                      {Math.min(currentPage * 10, totalItems)}
                    </span>{' '}
                    dari <span className="font-medium">{totalItems}</span> hasil
                  </p>
                </div>
                <div>
                  <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                    <button
                      onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                      disabled={currentPage === 1}
                      className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                    >
                      Sebelumnya
                    </button>
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                          page === currentPage
                            ? 'z-10 bg-red-50 border-red-500 text-red-600'
                            : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                        }`}
                      >
                        {page}
                      </button>
                    ))}
                    <button
                      onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                      disabled={currentPage === totalPages}
                      className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                    >
                      Selanjutnya
                    </button>
                  </nav>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default AdminDaftarTugas
