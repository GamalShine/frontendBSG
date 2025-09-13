import React, { useState, useEffect, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { timService } from '../../../../services/timService'
import { 
  Search, 
  Plus, 
  Edit, 
  Trash2,
  AlertTriangle,
  User,
  Building2,
  Award,
  RefreshCw
} from 'lucide-react'
import { toast } from 'react-hot-toast'
import { MENU_CODES } from '@/config/menuCodes'

const OwnerTimMerahBiru = () => {
  const [timMerah, setTimMerah] = useState([])
  const [timBiru, setTimBiru] = useState([])
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState('merah')
  const [searchTerm, setSearchTerm] = useState('')
  const [divisiFilter, setDivisiFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalItems, setTotalItems] = useState(0)
  const [showFilters, setShowFilters] = useState(false)

  useEffect(() => {
    if (activeTab === 'merah') {
      loadTimMerah()
    } else {
      loadTimBiru()
    }
  }, [activeTab, currentPage, divisiFilter, statusFilter])

  const loadTimMerah = async () => {
    try {
      setLoading(true)
      const params = {
        page: currentPage,
        limit: 10,
        search: searchTerm,
        divisi: divisiFilter !== 'all' ? divisiFilter : undefined,
        status: statusFilter !== 'all' ? statusFilter : undefined
      }

      const response = await timService.getTimMerahForOwner(params)
      if (response.success) {
        setTimMerah(response.data)
        setTotalPages(response.pagination?.totalPages || 1)
        setTotalItems(response.pagination?.totalItems || 0)
      }
    } catch (error) {
      toast.error('Gagal memuat daftar tim merah')
      console.error('Error loading tim merah:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadTimBiru = async () => {
    try {
      setLoading(true)
      const params = {
        page: currentPage,
        limit: 10,
        search: searchTerm,
        divisi: divisiFilter !== 'all' ? divisiFilter : undefined
      }

      const response = await timService.getTimBiruForOwner(params)
      if (response.success) {
        setTimBiru(response.data)
        setTotalPages(response.pagination?.totalPages || 1)
        setTotalItems(response.pagination?.totalItems || 0)
      }
    } catch (error) {
      toast.error('Gagal memuat daftar tim biru')
      console.error('Error loading tim biru:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = () => {
    setCurrentPage(1)
    if (activeTab === 'merah') {
      loadTimMerah()
    } else {
      loadTimBiru()
    }
  }

  const handleDeleteMerah = async (id) => {
    if (!window.confirm('Apakah Anda yakin ingin menghapus data ini?')) {
      return
    }

    try {
      const response = await timService.deleteTimMerahForOwner(id)
      if (response.success) {
        toast.success('Data berhasil dihapus')
        loadTimMerah()
      }
    } catch (error) {
      toast.error('Gagal menghapus data')
      console.error('Error deleting tim merah:', error)
    }
  }

  const handleDeleteBiru = async (id) => {
    if (!window.confirm('Apakah Anda yakin ingin menghapus data ini?')) {
      return
    }

    try {
      const response = await timService.deleteTimBiruForOwner(id)
      if (response.success) {
        toast.success('Data berhasil dihapus')
        loadTimBiru()
      }
    } catch (error) {
      toast.error('Gagal menghapus data')
      console.error('Error deleting tim biru:', error)
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'SP1':
        return 'bg-yellow-100 text-yellow-800'
      case 'SP2':
        return 'bg-orange-100 text-orange-800'
      case 'SP3':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusText = (status) => {
    switch (status) {
      case 'SP1':
        return 'Surat Peringatan 1'
      case 'SP2':
        return 'Surat Peringatan 2'
      case 'SP3':
        return 'Surat Peringatan 3'
      default:
        return status
    }
  }

  const currentData = activeTab === 'merah' ? timMerah : timBiru

  const resetFilters = () => {
    setSearchTerm('')
    setDivisiFilter('all')
    setStatusFilter('all')
    setActiveTab('merah')
    setCurrentPage(1)
  }

  const handleRefresh = () => {
    if (activeTab === 'merah') {
      loadTimMerah()
    } else {
      loadTimBiru()
    }
  }

  // Tanggal + jam untuk banner "Terakhir diupdate"
  const formatDateTime = (dateString) => {
    if (!dateString) return '-'
    const date = new Date(dateString)
    return date.toLocaleString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  // Ambil waktu update terakhir dari item terbaru pada tab aktif
  const lastUpdatedText = useMemo(() => {
    const data = activeTab === 'merah' ? timMerah : timBiru
    if (!data || data.length === 0) return '-'
    const latest = data[0]
    const dt = latest?.updated_at || latest?.created_at
    return formatDateTime(dt)
  }, [activeTab, timMerah, timBiru])

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header - mengikuti gaya Omset Harian */}
      <div className="bg-red-800 text-white px-4 sm:px-6 py-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div className="flex items-center gap-4 min-w-0">
            <span className="text-sm font-semibold bg-white/10 rounded px-2 py-1">{MENU_CODES.sdm.timMerahBiru}</span>
            <div>
              <h1 className="text-xl md:text-2xl font-extrabold tracking-tight">TIM MERAH BIRU</h1>
              <p className="text-sm text-red-100">Kelola data tim merah dan biru</p>
            </div>
          </div>
          <div className="flex items-center gap-2 mt-2 md:mt-0 flex-wrap w-full md:w-auto justify-start md:justify-end">
            <button
              onClick={() => setShowFilters(v => !v)}
              aria-label="Buka Pencarian dan Filter"
              className="inline-flex items-center gap-2 px-3 py-2 sm:px-4 sm:py-2 rounded-full border border-white/60 text-white hover:bg-white/10"
            >
              <Search className="h-4 w-4" />
              <span className="hidden sm:inline font-semibold">PENCARIAN</span>
            </button>
            <Link
              to={`/owner/sdm/tim/${activeTab}/form`}
              aria-label="Tambah Data Tim"
              className="inline-flex items-center gap-2 px-3 py-2 sm:px-4 sm:py-2 bg-white text-red-700 rounded-lg hover:bg-red-50 transition-colors shadow-sm"
            >
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline font-semibold">Tambah</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Info bar */}
      <div className="bg-gray-200 px-4 sm:px-6 py-2 text-xs text-gray-600">Terakhir diupdate: {lastUpdatedText}</div>

      <div className="p-4 sm:p-6">

      {/* Tabs */}
      <div className="mb-4">
        <div className="border-b border-gray-200 bg-white rounded-t-lg">
          <nav className="-mb-px flex space-x-6 px-4 pt-3 overflow-x-auto whitespace-nowrap scrollbar-hide">
            <button
              onClick={() => setActiveTab('merah')}
              className={`py-3 px-3 border-b-2 font-semibold text-sm transition-colors ${
                activeTab === 'merah'
                  ? 'border-red-600 text-red-700'
                  : 'border-transparent text-gray-600 hover:text-gray-800 hover:border-gray-300'
              }`}
            >
              Tim Merah
            </button>
            <button
              onClick={() => setActiveTab('biru')}
              className={`py-3 px-3 border-b-2 font-semibold text-sm transition-colors ${
                activeTab === 'biru'
                  ? 'border-blue-600 text-blue-700'
                  : 'border-transparent text-gray-600 hover:text-gray-800 hover:border-gray-300'
              }`}
            >
              Tim Biru
            </button>
          </nav>
        </div>
      </div>

      {/* Filters */}
      {showFilters && (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 my-4">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-gray-800">Pencarian & Filter</h3>
          <button
            onClick={() => {
              setSearchTerm('')
              setDivisiFilter('all')
              setStatusFilter('all')
              setActiveTab('merah')
              setCurrentPage(1)
              loadTimMerah()
            }}
            aria-label="Reset Filter"
            className="inline-flex items-center gap-2 px-3 py-2 sm:px-4 sm:py-1.5 rounded-full border border-red-600 text-red-700 hover:bg-red-50 transition-colors"
          >
            <RefreshCw className="h-4 w-4" />
            <span className="hidden sm:inline font-semibold">Reset</span>
          </button>
        </div>
        <div className="px-6 py-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                placeholder="Cari nama karyawan..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Divisi Filter */}
          <div className="lg:w-48">
            <select
              value={divisiFilter}
              onChange={(e) => setDivisiFilter(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
            >
              <option value="all">Semua Divisi</option>
              <option value="BSG PUSAT">BSG PUSAT</option>
              <option value="BSG BSD">BSG BSD</option>
              <option value="SOGIL">SOGIL</option>
              <option value="BSG SIDOARJO">BSG SIDOARJO</option>
              <option value="BSG BUAH BATU">BSG BUAH BATU</option>
              <option value="BSG KARAWACI">BSG KARAWACI</option>
            </select>
          </div>

          {/* Status Filter - Only for Tim Merah */}
          {activeTab === 'merah' && (
            <div className="lg:w-48">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              >
                <option value="all">Semua Status</option>
                <option value="SP1">SP1</option>
                <option value="SP2">SP2</option>
                <option value="SP3">SP3</option>
              </select>
            </div>
          )}

          {/* Search Button */}
          <div className="flex lg:justify-end">
            <button
              onClick={handleSearch}
              aria-label="Cari"
              className="inline-flex items-center gap-2 px-3 py-2 sm:px-6 sm:py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
            >
              <Search className="h-4 w-4" />
              <span className="hidden sm:inline">Cari</span>
            </button>
          </div>
        </div>
      </div>
      </div>
      )}

      {/* Actions */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-6 bg-white rounded-lg border p-4 shadow-sm">
        <div className="text-sm text-gray-600">
          Total: {totalItems} data
        </div>
        <Link
          to={`/owner/sdm/tim/${activeTab}/form`}
          aria-label="Tambah Data Tim"
          className={`text-white px-3 py-2 sm:px-4 sm:py-2 rounded-lg hover:opacity-90 flex items-center gap-2 ${
            activeTab === 'merah' ? 'bg-red-600 hover:bg-red-700' : 'bg-blue-600 hover:bg-blue-700'
          }`}
        >
          <Plus className="h-4 w-4" />
          <span className="hidden sm:inline">Tambah Tim {activeTab === 'merah' ? 'Merah' : 'Biru'}</span>
        </Link>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow table-responsive">
        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Memuat data...</p>
          </div>
        ) : currentData.length === 0 ? (
          <div className="p-8 text-center">
            <AlertTriangle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Tidak ada data</h3>
            <p className="text-gray-500">Belum ada data tim {activeTab} yang tersedia</p>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="sticky top-0 bg-red-50 z-10">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Karyawan
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Divisi
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Posisi
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {activeTab === 'merah' ? 'Status' : 'Prestasi'}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Keterangan
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {currentData.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="px-4 sm:px-6 py-4 whitespace-normal md:whitespace-nowrap">
                      <div className="flex items-center">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          activeTab === 'merah' ? 'bg-red-100' : 'bg-blue-100'
                        }`}>
                          <User className={`h-5 w-5 ${
                            activeTab === 'merah' ? 'text-red-600' : 'text-blue-600'
                          }`} />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{item.nama}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Building2 className="h-4 w-4 text-gray-400 mr-2" />
                        <span className="text-sm text-gray-900">{item.divisi}</span>
                      </div>
                    </td>
                    <td className="px-4 sm:px-6 py-4 whitespace-normal md:whitespace-nowrap text-sm text-gray-900 break-anywhere">
                      {item.posisi}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {activeTab === 'merah' ? (
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(item.status)}`}>
                          {getStatusText(item.status)}
                        </span>
                      ) : (
                        <div className="flex items-center">
                          <Award className="h-4 w-4 text-yellow-500 mr-2" />
                          <span className="text-sm text-gray-900">{item.prestasi}</span>
                        </div>
                      )}
                    </td>
                    <td className="px-4 sm:px-6 py-4">
                      <div className="text-sm text-gray-900 max-w-[12rem] md:max-w-xs break-anywhere md:truncate">
                        {item.keterangan || '-'}
                      </div>
                    </td>
                    <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        <Link
                          to={`/owner/sdm/tim/${activeTab}/edit/${item.id}`}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          <Edit className="h-4 w-4" />
                        </Link>
                        <button
                          onClick={() => activeTab === 'merah' ? handleDeleteMerah(item.id) : handleDeleteBiru(item.id)}
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
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-6 py-4 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-700">
                Menampilkan {((currentPage - 1) * 10) + 1} - {Math.min(currentPage * 10, totalItems)} dari {totalItems} data
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1 border border-gray-300 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  Sebelumnya
                </button>
                <span className="px-3 py-1 text-sm text-gray-700">
                  Halaman {currentPage} dari {totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1 border border-gray-300 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  Selanjutnya
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default OwnerTimMerahBiru;
