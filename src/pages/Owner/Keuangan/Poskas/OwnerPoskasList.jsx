import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../../../contexts/AuthContext';
import { poskasService } from '../../../../services/poskasService';
import { toast } from 'react-hot-toast';
import { 
  Plus, 
  Search, 
  Calendar, 
  Filter,
  Eye,
  Edit,
  Trash2,
  TrendingUp,
  RefreshCw,
  DollarSign
} from 'lucide-react';
import LoadingSpinner from '../../../../components/UI/LoadingSpinner';
import { API_ENDPOINTS, API_CONFIG } from '../../../../config/constants';

const OwnerPoskasList = () => {
  const { user } = useAuth()
  const [poskas, setPoskas] = useState([])
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [dateFilter, setDateFilter] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalItems, setTotalItems] = useState(0)
  const [selectedItems, setSelectedItems] = useState([]) // State untuk selected items
  const [stats, setStats] = useState({
    totalPoskas: 0,
    totalThisMonth: 0,
    totalThisYear: 0
  })

  useEffect(() => {
    loadPoskas()
    loadStats()
  }, [currentPage, dateFilter])

  // Test API connection
  const testApiConnection = async () => {
    try {
      console.log('🧪 Testing Owner API connection...')
      const response = await fetch(API_CONFIG.getUrl(API_ENDPOINTS.POSKAS.OWNER.LIST), {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      })
      
      const data = await response.json()
      console.log('🧪 Owner API Test Response:', data)
      
      if (response.ok) {
        console.log('✅ Owner API connection successful')
      } else {
        console.error('❌ Owner API connection failed:', data)
      }
    } catch (error) {
      console.error('❌ Owner API test error:', error)
    }
  }

  // Call test on component mount
  useEffect(() => {
    testApiConnection()
  }, [])

  const loadPoskas = async () => {
    try {
      setLoading(true)
      const params = {
        page: currentPage,
        limit: 10,
        search: searchTerm,
        date: dateFilter
      }
      
      console.log('🔄 Loading owner poskas with params:', params)
      console.log('👤 User role:', user.role, 'User ID:', user.id)
      
      // Owner should use owner-specific endpoint
      console.log('🔑 Owner - using owner endpoint')
      const response = await poskasService.getOwnerPoskas(params)
      
      console.log('📦 Owner poskas response:', response)
      
      if (response.success || response.data) {
        const data = response.data || response
        console.log('📋 Owner poskas data:', data)
        
        // Handle different response structures
        const poskasData = Array.isArray(data) ? data : (data.rows || data || [])
        console.log('📊 Final owner poskas data:', poskasData)
        
        setPoskas(poskasData)
        
        // Handle pagination
        if (data.totalPages) {
          setTotalPages(data.totalPages)
        } else if (data.count) {
          setTotalPages(Math.ceil(data.count / 10))
        } else {
          setTotalPages(1)
        }
        
        setTotalItems(data.count || data.length || poskasData.length || 0)
      } else {
        console.warn('⚠️ Owner poskas response not successful:', response)
        setPoskas([])
        setTotalPages(1)
        setTotalItems(0)
      }
    } catch (error) {
      console.error('❌ Error loading owner poskas:', error)
      toast.error('Gagal memuat daftar pos kas')
      setPoskas([])
      setTotalPages(1)
      setTotalItems(0)
    } finally {
      setLoading(false)
    }
  }

  const loadStats = async () => {
    try {
      console.log('📊 Loading owner stats for user:', user.id)
      const response = await poskasService.getOwnerPoskasStats({ limit: 1000 })
      console.log('📈 Owner stats response:', response)
      
      if (response.success || response.data) {
        const data = response.data || response
        const poskasData = Array.isArray(data) ? data : (data.rows || data || [])
        console.log('📊 Owner stats data:', poskasData)
        
        const now = new Date()
        const thisMonth = now.getMonth()
        const thisYear = now.getFullYear()
        
        const thisMonthPoskas = poskasData.filter(item => {
          const itemDate = new Date(item.tanggal_poskas)
          return itemDate.getMonth() === thisMonth && itemDate.getFullYear() === thisYear
        })
        
        const thisYearPoskas = poskasData.filter(item => {
          const itemDate = new Date(item.tanggal_poskas)
          return itemDate.getFullYear() === thisYear
        })
        
        const statsData = {
          totalPoskas: poskasData.length,
          totalThisMonth: thisMonthPoskas.length,
          totalThisYear: thisYearPoskas.length
        }
        
        console.log('📊 Calculated owner stats:', statsData)
        setStats(statsData)
      } else {
        console.warn('⚠️ Owner stats response not successful:', response)
        setStats({
          totalPoskas: 0,
          totalThisMonth: 0,
          totalThisYear: 0
        })
      }
    } catch (error) {
      console.error('❌ Error loading owner stats:', error)
      setStats({
        totalPoskas: 0,
        totalThisMonth: 0,
        totalThisYear: 0
      })
    }
  }

  const handleSearch = () => {
    setCurrentPage(1)
    loadPoskas()
  }

  const formatDate = (dateString) => {
    if (!dateString) return '-'
    const date = new Date(dateString)
    return date.toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const handleDelete = async (id) => {
    if (window.confirm('Apakah Anda yakin ingin menghapus laporan pos kas ini?')) {
      try {
        console.log('🗑️ Deleting owner poskas with ID:', id)
        const response = await poskasService.deleteOwnerPoskas(id)
        console.log('✅ Owner delete response:', response)
        
        if (response.success) {
          toast.success('Laporan pos kas berhasil dihapus')
          loadPoskas()
          loadStats()
        } else {
          toast.error(response.message || 'Gagal menghapus laporan pos kas')
        }
      } catch (error) {
        console.error('❌ Error deleting owner poskas:', error)
        toast.error('Gagal menghapus laporan pos kas')
      }
    }
  }

  // Handle checkbox selection
  const handleCheckboxChange = (id) => {
    setSelectedItems(prev => {
      if (prev.includes(id)) {
        return prev.filter(itemId => itemId !== id)
      } else {
        return [...prev, id]
      }
    })
  }

  // Handle select all checkbox
  const handleSelectAll = () => {
    if (selectedItems.length === poskas.length) {
      setSelectedItems([])
    } else {
      setSelectedItems(poskas.map(item => item.id))
    }
  }

  // Handle bulk delete
  const handleBulkDelete = async () => {
    if (selectedItems.length === 0) {
      toast.error('Pilih item yang akan dihapus')
      return
    }

    if (window.confirm(`Apakah Anda yakin ingin menghapus ${selectedItems.length} laporan pos kas yang dipilih?`)) {
      try {
        const deletePromises = selectedItems.map(id => poskasService.deleteOwnerPoskas(id))
        await Promise.all(deletePromises)
        
        toast.success(`${selectedItems.length} laporan pos kas berhasil dihapus`)
        setSelectedItems([])
        loadPoskas()
        loadStats()
      } catch (error) {
        console.error('❌ Error bulk deleting owner poskas:', error)
        toast.error('Gagal menghapus beberapa laporan pos kas')
      }
    }
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border mb-6">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Pos Kas</h1>
              <p className="text-gray-600">Kelola data posisi kas outlet</p>
            </div>
            <Link
              to="/owner/keuangan/poskas/new"
              className="inline-flex items-center space-x-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
            >
              <Plus className="h-4 w-4" />
              <span>Tambah Pos Kas</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <DollarSign className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Total Pos Kas</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalPoskas}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <TrendingUp className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Bulan Ini</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalThisMonth}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Calendar className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Tahun Ini</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalThisYear}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border mb-6">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Filter & Pencarian</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Cari
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Cari pos kas..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tanggal
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="date"
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value)}
                  className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="flex items-end">
              <button
                onClick={handleSearch}
                className="flex items-center space-x-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
              >
                <Search className="h-4 w-4" />
                <span>Cari</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">Daftar Pos Kas</h2>
            {selectedItems.length > 0 && (
              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-600">
                  {selectedItems.length} item dipilih
                </span>
                <button
                  onClick={handleBulkDelete}
                  className="flex items-center space-x-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                >
                  <Trash2 className="h-4 w-4" />
                  <span>Hapus ({selectedItems.length})</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {loading ? (
          <div className="p-8 text-center">
            <LoadingSpinner />
            <p className="text-gray-600">Memuat data...</p>
          </div>
        ) : poskas.length === 0 ? (
          <div className="p-8 text-center">
            <DollarSign className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Tidak ada data</h3>
            <p className="text-gray-500 mb-4">Belum ada data pos kas yang tersedia</p>
            <Link
              to="/owner/keuangan/poskas/new"
              className="inline-flex items-center space-x-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
            >
              <Plus className="h-4 w-4" />
              <span>Tambah Pos Kas Pertama</span>
            </Link>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <input
                        type="checkbox"
                        checked={selectedItems.length === poskas.length && poskas.length > 0}
                        onChange={handleSelectAll}
                        className="rounded border-gray-300 text-red-600 focus:ring-red-500"
                      />
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tanggal
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Isi Pos Kas
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Dibuat Oleh
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Aksi
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {poskas.map((poskasItem) => (
                    <tr key={poskasItem.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <input
                          type="checkbox"
                          checked={selectedItems.includes(poskasItem.id)}
                          onChange={() => handleCheckboxChange(poskasItem.id)}
                          className="rounded border-gray-300 text-red-600 focus:ring-red-500"
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatDate(poskasItem.tanggal_poskas)}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        <div className="max-w-xs">
                          {poskasItem.isi_poskas ? (
                            <div 
                              className="truncate"
                              dangerouslySetInnerHTML={{ 
                                __html: poskasItem.isi_poskas.length > 150 
                                  ? poskasItem.isi_poskas.substring(0, 150) + '...' 
                                  : poskasItem.isi_poskas 
                              }}
                            />
                          ) : '-'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {poskasItem.user_nama || poskasItem.admin_nama || poskasItem.created_by || 'Admin'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center space-x-2">
                          <Link
                            to={`/owner/keuangan/poskas/${poskasItem.id}`}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            <Eye className="h-4 w-4" />
                          </Link>
                          <Link
                            to={`/owner/keuangan/poskas/${poskasItem.id}/edit`}
                            className="text-green-600 hover:text-green-900"
                          >
                            <Edit className="h-4 w-4" />
                          </Link>
                          <button
                            onClick={() => handleDelete(poskasItem.id)}
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

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="px-6 py-4 border-t border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-700">
                    Menampilkan {((currentPage - 1) * 10) + 1} sampai {Math.min(currentPage * 10, totalItems)} dari {totalItems} data
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => setCurrentPage(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="px-3 py-1 text-sm border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                    >
                      Sebelumnya
                    </button>
                    <span className="px-3 py-1 text-sm text-gray-700">
                      Halaman {currentPage} dari {totalPages}
                    </span>
                    <button
                      onClick={() => setCurrentPage(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className="px-3 py-1 text-sm border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                    >
                      Selanjutnya
                    </button>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default OwnerPoskasList 