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

const AdminPoskasList = () => {
  const { user } = useAuth()
  const navigate = useNavigate()
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
      console.log('🧪 Testing API connection...')
      const response = await fetch(API_CONFIG.getUrl(API_ENDPOINTS.POSKAS.LIST), {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      })
      
      const data = await response.json()
      console.log('🧪 API Test Response:', data)
      
      if (response.ok) {
        console.log('✅ API connection successful')
      } else {
        console.error('❌ API connection failed:', data)
      }
    } catch (error) {
      console.error('❌ API test error:', error)
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
      
      console.log('🔄 Loading poskas with params:', params)
      console.log('👤 User role:', user.role, 'User ID:', user.id)
      
      // Admin can see all poskas - using same method as working example
      const response = await poskasService.getPoskas(params)
      
      console.log('📦 Poskas response:', response)
      
      // Handle different response structures
      let data = response
      
      // Check if response has data property
      if (response && typeof response === 'object' && 'data' in response) {
        data = response.data
      }
      
      console.log('📋 Processed poskas data:', data)
      console.log('📊 Data type:', typeof data)
      console.log('📋 Data keys:', Object.keys(data || {}))
      
      // Try to extract poskas from different possible structures
      const poskasData = data?.poskas || data?.items || data?.data || data || []
      const totalPages = data?.totalPages || data?.last_page || data?.total_pages || 1
      const totalItems = data?.total || data?.total_items || data?.count || 0
      
      setPoskas(poskasData)
      setTotalPages(totalPages)
      setTotalItems(totalItems)
      
      console.log('✅ Poskas set:', poskasData)
      console.log('📄 Total pages:', totalPages)
      console.log('🔢 Total items:', totalItems)
      
      // Show success message if data loaded
      if (poskasData.length > 0) {
        console.log('✅ Successfully loaded', poskasData.length, 'poskas')
      } else {
        console.log('ℹ️ No poskas data found')
      }
    } catch (error) {
      console.error('❌ Error loading poskas:', error)
      console.error('❌ Error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        config: error.config
      })
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
      console.log('📊 Loading stats for user:', user.id)
      const response = await poskasService.getPoskasByUser(user.id, { limit: 1000 })
      console.log('📈 Stats response:', response)
      
      if (response.success || response.data) {
        const data = response.data || response
        const poskasData = Array.isArray(data) ? data : (data.rows || data || [])
        console.log('📊 Stats data:', poskasData)
        
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
        
        console.log('📊 Calculated stats:', statsData)
        setStats(statsData)
      } else {
        console.warn('⚠️ Stats response not successful:', response)
        setStats({
          totalPoskas: 0,
          totalThisMonth: 0,
          totalThisYear: 0
        })
      }
    } catch (error) {
      console.error('❌ Error loading stats:', error)
      setStats({
        totalPoskas: 0,
        totalThisMonth: 0,
        totalThisYear: 0
      })
    }
  }

  const [showFilters, setShowFilters] = useState(false)

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
        console.log('🗑️ Deleting poskas with ID:', id)
        const response = await poskasService.deletePoskas(id)
        console.log('✅ Delete response:', response)
        
        if (response.success) {
          toast.success('Laporan pos kas berhasil dihapus')
          loadPoskas()
          loadStats()
        } else {
          toast.error(response.message || 'Gagal menghapus laporan pos kas')
        }
      } catch (error) {
        console.error('❌ Error deleting poskas:', error)
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
        const deletePromises = selectedItems.map(id => poskasService.deletePoskas(id))
        await Promise.all(deletePromises)
        
        toast.success(`${selectedItems.length} laporan pos kas berhasil dihapus`)
        setSelectedItems([])
        loadPoskas()
        loadStats()
      } catch (error) {
        console.error('❌ Error bulk deleting poskas:', error)
        toast.error('Gagal menghapus beberapa laporan pos kas')
      }
    }
  }

    return (
    <div className="p-0 bg-gray-50 min-h-screen">
      {/* Header - match Investor style */}
      <div className="bg-red-800 text-white px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span className="text-sm font-semibold bg-white/10 rounded px-2 py-1">H01-K1</span>
            <div>
              <h1 className="text-xl md:text-2xl font-extrabold tracking-tight">POSKAS</h1>
              <p className="text-sm text-red-100">Kelola data posisi kas outlet</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowFilters(v => !v)}
              className="px-4 py-2 rounded-full border border-white/60 text-white hover:bg-white/10"
            >
              PENCARIAN
            </button>
            <div className="relative group">
              <button className="p-2 hover:bg-red-700 rounded-lg">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.75a1.5 1.5 0 110-3 1.5 1.5 0 010 3zM12 13.5a1.5 1.5 0 110-3 1.5 1.5 0 010 3zM12 20.25a1.5 1.5 0 110-3 1.5 1.5 0 010 3z" /></svg>
              </button>
              <div className="hidden group-hover:block absolute right-0 mt-2 w-40 bg-white text-gray-700 rounded-lg shadow-lg overflow-hidden z-20">
                <button className="w-full text-left px-4 py-2 hover:bg-gray-50">Bagikan</button>
                <button className="w-full text-left px-4 py-2 hover:bg-gray-50">Copy</button>
                <button className="w-full text-left px-4 py-2 hover:bg-gray-50">Download PDF</button>
              </div>
            </div>
            <Link
              to="/admin/keuangan/poskas/new"
              className="inline-flex items-center gap-2 px-4 py-2 bg-white text-red-700 rounded-lg hover:bg-red-50 transition-colors shadow-sm"
            >
              <Plus className="h-4 w-4" />
              <span className="font-semibold">Tambah</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Info bar */}
      <div className="bg-gray-200 px-6 py-2 text-xs text-gray-600">Daftar pos kas terbaru berada di paling atas</div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-lg bg-blue-50 flex items-center justify-center">
              <DollarSign className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-xs font-medium text-gray-500">Total Pos Kas</p>
              <p className="text-xl font-bold text-gray-900">{stats.totalPoskas}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-lg bg-green-50 flex items-center justify-center">
              <TrendingUp className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-xs font-medium text-gray-500">Bulan Ini</p>
              <p className="text-xl font-bold text-gray-900">{stats.totalThisMonth}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-lg bg-purple-50 flex items-center justify-center">
              <Calendar className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <p className="text-xs font-medium text-gray-500">Tahun Ini</p>
              <p className="text-xl font-bold text-gray-900">{stats.totalThisYear}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      {showFilters && (
      <div className="bg-white rounded-none md:rounded-xl shadow-sm border border-gray-100 my-4">
        <div className="px-6 py-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Cari</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Cari pos kas..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-3 py-2 w-full border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-red-500 focus:border-transparent"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Tanggal</label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="date"
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value)}
                  className="pl-10 pr-3 py-2 w-full border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-red-500 focus:border-transparent"
                />
              </div>
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
        </div>
      </div>
      )}

      {/* Data Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="px-6 py-4 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold text-gray-900">Daftar Pos Kas</h2>
            {selectedItems.length > 0 && (
              <div className="flex items-center gap-3">
                <span className="text-sm text-gray-600">{selectedItems.length} item dipilih</span>
                <button
                  onClick={handleBulkDelete}
                  className="inline-flex items-center gap-2 px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
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
            <h3 className="text-lg font-medium text-gray-900 mb-1">Tidak ada data</h3>
            <p className="text-gray-500 mb-4">Belum ada data pos kas yang tersedia</p>
            <Link
              to="/admin/keuangan/poskas/new"
              className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
            >
              <Plus className="h-4 w-4" />
              <span>Tambah Pos Kas Pertama</span>
            </Link>
          </div>
        ) : (
          <>
            <div className="relative overflow-x-auto max-h-[60vh] overflow-y-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="sticky top-0 bg-red-50 z-10">
                  <tr>
                    <th className="px-6 py-3 text-left text-[11px] font-extrabold text-red-700 uppercase tracking-wider">No</th>
                    <th className="px-6 py-3 text-left text-[11px] font-extrabold text-red-700 uppercase tracking-wider">Tanggal</th>
                    <th className="px-6 py-3 text-left text-[11px] font-extrabold text-red-700 uppercase tracking-wider">Keterangan</th>
                    <th className="px-6 py-3 text-left text-[11px] font-extrabold text-red-700 uppercase tracking-wider">Aksi</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-100">
                  {poskas.map((poskasItem, idx) => (
                    <tr key={poskasItem.id} className="hover:bg-gray-50/80">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{idx + 1}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold">{formatDate(poskasItem.tanggal_poskas).toUpperCase()}</span>
                          {(() => {
                            const d = new Date(poskasItem.tanggal_poskas);
                            const now = new Date();
                            const isRecent = d && d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth() && d.getDate() === now.getDate();
                            return isRecent ? (
                              <span className="text-[10px] font-bold text-blue-700">NEW</span>
                            ) : null;
                          })()}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {poskasItem.isi_poskas ? (
                          <div
                            className="truncate max-w-md"
                            dangerouslySetInnerHTML={{
                              __html: poskasItem.isi_poskas.length > 150
                                ? poskasItem.isi_poskas.substring(0, 150) + '...'
                                : poskasItem.isi_poskas
                            }}
                          />
                        ) : '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <input
                          type="checkbox"
                          checked={selectedItems.includes(poskasItem.id)}
                          onChange={() => handleCheckboxChange(poskasItem.id)}
                          className="rounded border-gray-300 text-red-600 focus:ring-red-500"
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="px-6 py-3 border-t border-gray-100">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-700">
                    Menampilkan {((currentPage - 1) * 10) + 1} sampai {Math.min(currentPage * 10, totalItems)} dari {totalItems} data
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setCurrentPage(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="px-3 py-1.5 text-sm border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                    >
                      Sebelumnya
                    </button>
                    <span className="px-3 py-1 text-sm text-gray-700">Halaman {currentPage} dari {totalPages}</span>
                    <button
                      onClick={() => setCurrentPage(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className="px-3 py-1.5 text-sm border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
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

export default AdminPoskasList