import React, { useEffect, useMemo, useState } from 'react'
import api from '../../../services/api'
import { User, Award, RefreshCw, Search } from 'lucide-react'

const PAGE_SIZE = 10

const LeaderTimMerahBiru = () => {
  const [activeTab, setActiveTab] = useState('merah')
  const [merah, setMerah] = useState([])
  const [biru, setBiru] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // UI agar mirip Owner
  const [showFilters, setShowFilters] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [currentPage, setCurrentPage] = useState(1)

  const loadData = async () => {
    try {
      setLoading(true)
      setError('')
      const [resMerah, resBiru] = await Promise.all([
        api.get('/tim-merah-biru/merah'),
        api.get('/tim-merah-biru/biru')
      ])
      const jsonMerah = resMerah.data
      const jsonBiru = resBiru.data
      if (jsonMerah?.success === false) throw new Error(jsonMerah.message || 'Gagal memuat Tim Merah')
      if (jsonBiru?.success === false) throw new Error(jsonBiru.message || 'Gagal memuat Tim Biru')
      setMerah(Array.isArray(jsonMerah.data) ? jsonMerah.data : (jsonMerah || []))
      setBiru(Array.isArray(jsonBiru.data) ? jsonBiru.data : (jsonBiru || []))
    } catch (e) {
      setError(e.message || 'Gagal memuat data tim merah/biru')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const filteredData = useMemo(() => {
    const src = activeTab === 'merah' ? merah : biru
    let items = [...src]
    if (searchTerm) {
      const q = searchTerm.toLowerCase()
      items = items.filter(it => {
        const empName = it.employee?.nama || it.employee?.name || it.nama || ''
        return empName.toLowerCase().includes(q)
      })
    }
    if (activeTab === 'merah' && statusFilter !== 'all') {
      items = items.filter(it => (it.status || '') === statusFilter)
    }
    return items
  }, [activeTab, merah, biru, searchTerm, statusFilter])

  const totalItems = filteredData.length
  const totalPages = Math.max(1, Math.ceil(totalItems / PAGE_SIZE))
  const pageItems = filteredData.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE)

  useEffect(() => { setCurrentPage(1) }, [activeTab, searchTerm, statusFilter])

  const getStatusColor = (status) => {
    switch (status) {
      case 'SP1': return 'bg-yellow-100 text-yellow-800'
      case 'SP2': return 'bg-orange-100 text-orange-800'
      case 'SP3': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }
  const getStatusText = (status) => {
    switch (status) {
      case 'SP1': return 'Surat Peringatan 1'
      case 'SP2': return 'Surat Peringatan 2'
      case 'SP3': return 'Surat Peringatan 3'
      default: return status
    }
  }

  // Helper format tanggal dan teks "Terakhir diupdate" (mengikuti pola Owner)
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

  const lastUpdatedText = useMemo(() => {
    const currentData = activeTab === 'merah' ? merah : biru
    if (!currentData || currentData.length === 0) return '-'
    const latest = currentData[0]
    const dt = latest?.updated_at || latest?.created_at
    return formatDateTime(dt)
  }, [activeTab, merah, biru])

  if (loading) return (
    <div className="p-8 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto"></div>
        <p className="mt-3 text-gray-600">Memuat Tim Merah/Biru...</p>
      </div>
    </div>
  )

  if (error) return (
    <div className="p-6">
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">{error}</div>
      <div className="text-sm text-gray-600 mt-2">Pastikan akun LEADER memiliki akses. Beberapa endpoint Tim Merah/Biru bisa jadi dibatasi role di backend.</div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-red-800 text-white px-4 sm:px-6 py-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div className="flex items-center gap-4 min-w-0">
            <span className="text-sm font-semibold bg-white/10 rounded px-2 py-1">SDM</span>
            <div>
              <h1 className="text-xl md:text-2xl font-extrabold tracking-tight">TIM MERAH BIRU</h1>
              <p className="text-sm text-red-100">Lihat data tim merah dan biru</p>
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
            <button
              onClick={loadData}
              aria-label="Refresh"
              className="inline-flex items-center gap-2 px-3 py-2 sm:px-4 sm:py-2 bg-white text-red-700 rounded-lg hover:bg-red-50 transition-colors shadow-sm"
            >
              <RefreshCw className="h-4 w-4" />
              <span className="hidden sm:inline font-semibold">Refresh</span>
            </button>
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
                  activeTab === 'merah' ? 'border-red-600 text-red-700' : 'border-transparent text-gray-600 hover:text-gray-800 hover:border-gray-300'
                }`}
              >
                Tim Merah
              </button>
              <button
                onClick={() => setActiveTab('biru')}
                className={`py-3 px-3 border-b-2 font-semibold text-sm transition-colors ${
                  activeTab === 'biru' ? 'border-blue-600 text-blue-700' : 'border-transparent text-gray-600 hover:text-gray-800 hover:border-gray-300'
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
                onClick={() => { setSearchTerm(''); setDivisiFilter('all'); setStatusFilter('all'); setActiveTab('merah'); setCurrentPage(1) }}
                aria-label="Reset Filter"
                className="inline-flex items-center gap-2 px-3 py-2 sm:px-4 sm:py-1.5 rounded-full border border-red-600 text-red-700 hover:bg-red-50 transition-colors"
              >
                Reset
              </button>
            </div>
            <div className="px-6 py-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* Search */}
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <input
                      type="text"
                      placeholder="Cari nama/posisi..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    />
                  </div>
                </div>
                {/* Status Filter - only for merah */}
                {activeTab === 'merah' && (
                  <div className="lg:w-48">
                    <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent">
                      <option value="all">Semua Status</option>
                      <option value="SP1">SP1</option>
                      <option value="SP2">SP2</option>
                      <option value="SP3">SP3</option>
                    </select>
                  </div>
                )}
                {/* Cari */}
                <div className="flex lg:justify-end">
                  <button onClick={() => setCurrentPage(1)} className="inline-flex items-center gap-2 px-3 py-2 sm:px-6 sm:py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">
                    <Search className="h-4 w-4" />
                    <span className="hidden sm:inline">Cari</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Table */}
        <div className="bg-white rounded-lg shadow table-responsive">
          {pageItems.length === 0 ? (
            <div className="p-8 text-center">
              <div className="h-12 w-12 text-gray-400 mx-auto mb-4">👥</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Tidak ada data</h3>
              <p className="text-gray-500">Belum ada data tim {activeTab} yang tersedia</p>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="sticky top-0 bg-red-50 z-10">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Karyawan</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{activeTab === 'merah' ? 'Status' : 'Prestasi'}</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Keterangan</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {pageItems.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50">
                      <td className="px-4 sm:px-6 py-4 whitespace-normal md:whitespace-nowrap">
                        <div className="flex items-center">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${activeTab === 'merah' ? 'bg-red-100' : 'bg-blue-100'}`}>
                            <User className={`h-5 w-5 ${activeTab === 'merah' ? 'text-red-600' : 'text-blue-600'}`} />
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{item.employee?.nama || item.employee?.name || '-'}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {activeTab === 'merah' ? (
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(item.status)}`}>{getStatusText(item.status)}</span>
                        ) : (
                          <div className="text-sm text-gray-900">{item.prestasi}</div>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900 max-w-xs truncate">{item.keterangan || '-'}</div>
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
                  Menampilkan {((currentPage - 1) * PAGE_SIZE) + 1} - {Math.min(currentPage * PAGE_SIZE, totalItems)} dari {totalItems} data
                </div>
                <div className="flex space-x-2">
                  <button onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} disabled={currentPage === 1} className="px-3 py-1 border border-gray-300 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50">Sebelumnya</button>
                  <span className="px-3 py-1 text-sm text-gray-700">Halaman {currentPage} dari {totalPages}</span>
                  <button onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))} disabled={currentPage === totalPages} className="px-3 py-1 border border-gray-300 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50">Selanjutnya</button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default LeaderTimMerahBiru
