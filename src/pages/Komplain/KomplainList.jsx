import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { komplainService } from '../../services/komplainService'
import { 
  Search, 
  Plus, 
  Eye, 
  Edit, 
  AlertTriangle,
  CheckCircle,
  Clock,
  XCircle,
  Filter
} from 'lucide-react'
import toast from 'react-hot-toast'

const KomplainList = () => {
  const { user } = useAuth()
  const [komplains, setKomplains] = useState([])
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [prioritasFilter, setPrioritasFilter] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalItems, setTotalItems] = useState(0)

  useEffect(() => {
    loadKomplains()
  }, [currentPage, statusFilter, prioritasFilter])

  const loadKomplains = async () => {
    try {
      setLoading(true)
      const params = {
        page: currentPage,
        limit: 10,
        search: searchTerm,
        status: statusFilter,
        prioritas: prioritasFilter
      }
      
      // If user is not admin/owner, filter by current user
      if (user.role !== 'admin' && user.role !== 'owner') {
        params.pelapor_id = user.id
      }
      
      const response = await komplainService.getKomplain(params)
      if (response.success || response.data) {
        const data = response.data || response
        setKomplains(data.rows || data || [])
        setTotalPages(data.totalPages || Math.ceil((data.count || 0) / 10))
        setTotalItems(data.count || data.length || 0)
      }
    } catch (error) {
      toast.error('Gagal memuat daftar komplain')
      console.error('Error loading komplains:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = () => {
    setCurrentPage(1)
    loadKomplains()
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'menunggu':
        return <Clock className="h-4 w-4 text-yellow-500" />
      case 'diproses':
        return <AlertTriangle className="h-4 w-4 text-blue-500" />
      case 'selesai':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'ditolak':
        return <XCircle className="h-4 w-4 text-red-500" />
      default:
        return <Clock className="h-4 w-4 text-gray-500" />
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'menunggu':
        return 'bg-yellow-100 text-yellow-800'
      case 'diproses':
        return 'bg-blue-100 text-blue-800'
      case 'selesai':
        return 'bg-green-100 text-green-800'
      case 'ditolak':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getPrioritasColor = (prioritas) => {
    switch (prioritas) {
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

  const handleDelete = async (id) => {
    if (window.confirm('Apakah Anda yakin ingin menghapus komplain ini?')) {
      try {
        await komplainService.deleteKomplain(id)
        toast.success('Komplain berhasil dihapus')
        loadKomplains()
      } catch (error) {
        toast.error('Gagal menghapus komplain')
        console.error('Error deleting komplain:', error)
      }
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Daftar Komplain</h1>
        <Link
          to="/komplain/new"
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
        >
          <Plus className="h-4 w-4" />
          <span>Tambah Komplain</span>
        </Link>
      </div>

      {/* Search and Filter */}
      <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input
              type="text"
              placeholder="Cari komplain..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Semua Status</option>
            <option value="menunggu">Menunggu</option>
            <option value="diproses">Diproses</option>
            <option value="selesai">Selesai</option>
            <option value="ditolak">Ditolak</option>
          </select>
          
          <select
            value={prioritasFilter}
            onChange={(e) => setPrioritasFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Semua Prioritas</option>
            <option value="mendesak">Mendesak</option>
            <option value="penting">Penting</option>
            <option value="berproses">Berproses</option>
          </select>
          
          <button
            onClick={handleSearch}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center justify-center space-x-2 transition-colors"
          >
            <Search className="h-4 w-4" />
            <span>Cari</span>
          </button>
        </div>
      </div>

      {/* Komplain List */}
      <div className="bg-white rounded-lg shadow-sm border">
        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">Memuat data...</p>
          </div>
        ) : komplains.length === 0 ? (
          <div className="p-8 text-center">
            <AlertTriangle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">Tidak ada komplain ditemukan</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Komplain
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Prioritas
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tanggal
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {komplains.map((komplain) => (
                  <tr key={komplain.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {komplain.judul_komplain}
                        </div>
                        <div className="text-sm text-gray-500">
                          {komplain.deskripsi_komplain?.substring(0, 100)}...
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(komplain.status)}`}>
                        {getStatusIcon(komplain.status)}
                        <span className="ml-1">{komplain.status}</span>
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPrioritasColor(komplain.prioritas)}`}>
                        {komplain.prioritas}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(komplain.tanggal_pelaporan)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <Link
                          to={`/komplain/${komplain.id}`}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          <Eye className="h-4 w-4" />
                        </Link>
                        <Link
                          to={`/komplain/${komplain.id}/edit`}
                          className="text-green-600 hover:text-green-900"
                        >
                          <Edit className="h-4 w-4" />
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-6 flex justify-between items-center">
          <div className="text-sm text-gray-700">
            Menampilkan {((currentPage - 1) * 10) + 1} - {Math.min(currentPage * 10, totalItems)} dari {totalItems} komplain
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => setCurrentPage(currentPage - 1)}
              disabled={currentPage === 1}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Sebelumnya
            </button>
            <button
              onClick={() => setCurrentPage(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Selanjutnya
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default KomplainList 