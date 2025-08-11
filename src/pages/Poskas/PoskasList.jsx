import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { poskasService } from '../../services/poskasService'
import { 
  Search, 
  Plus, 
  Eye, 
  Edit, 
  DollarSign,
  TrendingUp,
  TrendingDown,
  Calendar,
  Filter
} from 'lucide-react'
import toast from 'react-hot-toast'

const PoskasList = () => {
  const { user } = useAuth()
  const [poskas, setPoskas] = useState([])
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [dateFilter, setDateFilter] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalItems, setTotalItems] = useState(0)
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
      const response = await fetch('http://localhost:3000/api/keuangan-poskas', {
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
      
      // Load poskas based on user role
      let response
      if (user.role === 'admin' || user.role === 'owner') {
        console.log('🔑 Admin/Owner - loading all poskas')
        response = await poskasService.getPoskas(params)
      } else {
        console.log('👤 Regular user - loading user-specific poskas')
        response = await poskasService.getPoskasByUser(user.id, params)
      }
      
      console.log('📦 Poskas response:', response)
      
      if (response.success || response.data) {
        const data = response.data || response
        console.log('📋 Poskas data:', data)
        
        // Handle different response structures
        const poskasData = Array.isArray(data) ? data : (data.rows || data || [])
        console.log('📊 Final poskas data:', poskasData)
        
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
        console.warn('⚠️ Poskas response not successful:', response)
        setPoskas([])
        setTotalPages(1)
        setTotalItems(0)
      }
    } catch (error) {
      console.error('❌ Error loading poskas:', error)
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

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Daftar Pos Kas</h1>
        <Link
          to="/poskas/new"
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
        >
          <Plus className="h-4 w-4" />
          <span>Tambah Pos Kas</span>
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <DollarSign className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Pos Kas</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalPoskas}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <TrendingUp className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Bulan Ini</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalThisMonth}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Calendar className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Tahun Ini</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalThisYear}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input
              type="text"
              placeholder="Cari pos kas..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          <input
            type="date"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          
          <button
            onClick={handleSearch}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center justify-center space-x-2 transition-colors"
          >
            <Search className="h-4 w-4" />
            <span>Cari</span>
          </button>
        </div>
      </div>

      {/* Poskas List */}
      <div className="bg-white rounded-lg shadow-sm border">
        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">Memuat data...</p>
          </div>
        ) : poskas.length === 0 ? (
          <div className="p-8 text-center">
            <DollarSign className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">Tidak ada laporan pos kas ditemukan</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tanggal
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Isi Pos Kas
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {poskas.map((poskasItem) => (
                  <tr key={poskasItem.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(poskasItem.tanggal_poskas)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900 max-w-md truncate">
                        {poskasItem.isi_poskas ? 
                          (poskasItem.isi_poskas.length > 200 ? 
                            `${poskasItem.isi_poskas.substring(0, 200)}...` : 
                            poskasItem.isi_poskas
                          ) : 
                          'Tidak ada isi'
                        }
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {poskasItem.user_nama || `User ID: ${poskasItem.id_user}`}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <Link
                          to={`/poskas/${poskasItem.id}`}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          <Eye className="h-4 w-4" />
                        </Link>
                        <Link
                          to={`/poskas/${poskasItem.id}/edit`}
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
            Menampilkan {((currentPage - 1) * 10) + 1} - {Math.min(currentPage * 10, totalItems)} dari {totalItems} laporan pos kas
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

export default PoskasList 