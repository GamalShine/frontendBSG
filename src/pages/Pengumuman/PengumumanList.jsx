import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { pengumumanService } from '../../services/pengumumanService'
import { 
  Search, 
  Filter, 
  Calendar,
  AlertTriangle,
  Info,
  CheckCircle
} from 'lucide-react'
import toast from 'react-hot-toast'

const PengumumanList = () => {
  const [pengumuman, setPengumuman] = useState([])
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [prioritasFilter, setPrioritasFilter] = useState('all')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalItems, setTotalItems] = useState(0)

  useEffect(() => {
    loadPengumuman()
  }, [currentPage, statusFilter, prioritasFilter])

  const loadPengumuman = async () => {
    try {
      setLoading(true)
      const params = {
        page: currentPage,
        limit: 10,
        search: searchTerm,
        status: statusFilter !== 'all' ? statusFilter : undefined,
        prioritas: prioritasFilter !== 'all' ? prioritasFilter : undefined
      }

      const response = await pengumumanService.getPengumuman(params)
      if (response.success || response.data) {
        const data = response.data || response
        setPengumuman(data.rows || data || [])
        setTotalPages(data.totalPages || Math.ceil((data.count || 0) / 10))
        setTotalItems(data.count || data.length || 0)
      }
    } catch (error) {
      toast.error('Gagal memuat daftar pengumuman')
      console.error('Error loading pengumuman:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = () => {
    setCurrentPage(1)
    loadPengumuman()
  }

  const getPrioritasIcon = (prioritas) => {
    switch (prioritas) {
      case 'tinggi':
        return <AlertTriangle className="h-4 w-4 text-red-500" />
      case 'sedang':
        return <Info className="h-4 w-4 text-yellow-500" />
      case 'rendah':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      default:
        return <Info className="h-4 w-4 text-gray-500" />
    }
  }

  const getPrioritasColor = (prioritas) => {
    switch (prioritas) {
      case 'tinggi':
        return 'bg-red-100 text-red-800'
      case 'sedang':
        return 'bg-yellow-100 text-yellow-800'
      case 'rendah':
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
      day: 'numeric'
    })
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Pengumuman</h1>
        <p className="text-gray-600">Daftar pengumuman dan informasi penting</p>
      </div>

      {/* Search and Filter */}
      <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input
              type="text"
              placeholder="Cari pengumuman..."
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
            <option value="all">Semua Status</option>
            <option value="aktif">Aktif</option>
            <option value="non_aktif">Non Aktif</option>
          </select>
          
          <select
            value={prioritasFilter}
            onChange={(e) => setPrioritasFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">Semua Prioritas</option>
            <option value="tinggi">Tinggi</option>
            <option value="sedang">Sedang</option>
            <option value="rendah">Rendah</option>
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

      {/* Pengumuman List */}
      <div className="bg-white rounded-lg shadow-sm border">
        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">Memuat data...</p>
          </div>
        ) : pengumuman.length === 0 ? (
          <div className="p-8 text-center">
            <Info className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">Tidak ada pengumuman ditemukan</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Pengumuman
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Prioritas
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tanggal Berlaku
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {pengumuman.map((pengumumanItem) => (
                  <tr key={pengumumanItem.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {pengumumanItem.judul}
                        </div>
                        <div className="text-sm text-gray-500 max-w-md truncate">
                          {pengumumanItem.konten?.substring(0, 200)}...
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPrioritasColor(pengumumanItem.prioritas)}`}>
                        {getPrioritasIcon(pengumumanItem.prioritas)}
                        <span className="ml-1">{pengumumanItem.prioritas}</span>
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        pengumumanItem.status === 'aktif' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {pengumumanItem.status === 'aktif' ? 'Aktif' : 'Non Aktif'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(pengumumanItem.tanggal_berlaku_dari)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <Link
                        to={`/pengumuman/${pengumumanItem.id}`}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        Lihat Detail
                      </Link>
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
            Menampilkan {((currentPage - 1) * 10) + 1} - {Math.min(currentPage * 10, totalItems)} dari {totalItems} pengumuman
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

export default PengumumanList 