import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../../../contexts/AuthContext';
import { poskasService } from '../../../../services/poskasService';
import { toast } from 'react-hot-toast';
import { 
  Plus, 
  Search, 
  Calendar, 
  Filter, 
  Share2,
  Download,
  Copy as CopyIcon,
  TrendingUp,
  RefreshCw,
  DollarSign,
  MoreVertical
} from 'lucide-react';
import LoadingSpinner from '../../../../components/UI/LoadingSpinner';
import { API_ENDPOINTS, API_CONFIG } from '../../../../config/constants';
import { MENU_CODES } from '@/config/menuCodes';

const OwnerPoskasList = () => {
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
  const [showFilters, setShowFilters] = useState(false)

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

  // Share/Download/Copy actions
  const handleShare = async (item) => {
    const text = `${formatDate(item.tanggal_poskas)}\n\n${item.isi_poskas || ''}`
    if (navigator.share) {
      try {
        await navigator.share({ title: 'Pos Kas', text })
      } catch (e) {
        console.warn('Share canceled or failed:', e)
      }
    } else {
      await navigator.clipboard.writeText(text)
      toast.success('Teks pos kas disalin untuk dibagikan')
    }
  }

  const handleDownload = (item) => {
    const content = `${formatDate(item.tanggal_poskas)}\n\n${item.isi_poskas || ''}`
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `poskas_${item.id || 'item'}.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const handleCopy = async (item) => {
    await navigator.clipboard.writeText(item.isi_poskas || '')
    toast.success('Isi pos kas disalin')
  }

  // ===== Bulk actions (selectedItems) =====
  const [showBulkMenu, setShowBulkMenu] = useState(false)

  const getSelectedEntries = () => {
    if (!Array.isArray(selectedItems) || selectedItems.length === 0) return []
    const byId = new Map(poskas.map(p => [p.id, p]))
    return selectedItems.map(id => byId.get(id)).filter(Boolean)
  }

  const handleBulkCopy = async () => {
    const entries = getSelectedEntries()
    if (entries.length === 0) {
      toast.error('Pilih minimal satu pos kas terlebih dahulu')
      return
    }
    const combined = entries.map(e => `${formatDate(e.tanggal_poskas)}\n${(e.isi_poskas || '').replace(/<[^>]*>/g, '')}`).join('\n\n---\n\n')
    await navigator.clipboard.writeText(combined)
    toast.success(`Menyalin ${entries.length} pos kas`)
    setShowBulkMenu(false)
  }

  const handleBulkDownload = () => {
    const entries = getSelectedEntries()
    if (entries.length === 0) {
      toast.error('Pilih minimal satu pos kas terlebih dahulu')
      return
    }
    const combined = entries.map(e => `${formatDate(e.tanggal_poskas)}\n${(e.isi_poskas || '').replace(/<[^>]*>/g, '')}`).join('\n\n---\n\n')
    const blob = new Blob([combined], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `poskas_selected_${entries.length}.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    setShowBulkMenu(false)
  }

  const handleBulkShare = async () => {
    const entries = getSelectedEntries()
    if (entries.length === 0) {
      toast.error('Pilih minimal satu pos kas terlebih dahulu')
      return
    }
    const combined = entries.map(e => `${formatDate(e.tanggal_poskas)}\n${(e.isi_poskas || '').replace(/<[^>]*>/g, '')}`).join('\n\n---\n\n')
    if (navigator.share) {
      try {
        await navigator.share({ title: `Pos Kas (${entries.length} entri)`, text: combined })
      } catch (e) {
        console.warn('Share dibatalkan/gagal:', e)
      }
    } else {
      await navigator.clipboard.writeText(combined)
      toast.success('Teks disalin untuk dibagikan')
    }
    setShowBulkMenu(false)
  }

  const handleBulkOpenAll = () => {
    const entries = getSelectedEntries()
    if (entries.length === 0) {
      toast.error('Pilih minimal satu pos kas terlebih dahulu')
      return
    }
    entries.forEach(e => {
      const url = `/owner/keuangan/poskas/${e.id}`
      window.open(url, '_blank')
    })
    setShowBulkMenu(false)
  }

  // Call test on component mount
  useEffect(() => {
    testApiConnection()
  }, [])

  // Ensure month change triggers reload (useEffect already depends on dateFilter)
  const handleMonthChange = (e) => {
    setDateFilter(e.target.value)
    setCurrentPage(1)
  }

  const loadPoskas = async () => {
    try {
      setLoading(true)
      console.log('👤 User role:', user.role, 'User ID:', user.id)

      // Decide which endpoint to call based on filters
      let poskasData = []

      // 1) Filter per bulan via endpoint /keuangan-poskas/month/:year/:month
      if (dateFilter) {
        // Expecting dateFilter in format 'YYYY-MM'
        const [yearStr, monthStr] = dateFilter.split('-')
        const year = parseInt(yearStr, 10)
        const month = parseInt(monthStr, 10) // 1..12
        console.log('📅 Using month filter:', { year, month })
        try {
          const resp = await poskasService.getPoskasByMonth(year, month)
          const monthData = resp?.data || resp || []
          poskasData = Array.isArray(monthData) ? monthData : (monthData.items || monthData.rows || [])
        } catch (e) {
          console.warn('⚠️ Month endpoint failed, fallback to all:', e)
        }
      }

      // 2) Search via endpoint /keuangan-poskas/search/:term
      if (searchTerm && searchTerm.trim().length > 0) {
        console.log('🔎 Using search term:', searchTerm)
        if (poskasData.length > 0) {
          // If we already have month-filtered data, filter locally
          const term = searchTerm.toLowerCase()
          poskasData = poskasData.filter(item => {
            const text = (item.isi_poskas || '').toLowerCase()
            return text.includes(term)
          })
        } else {
          try {
            const resp = await poskasService.searchPoskas(searchTerm)
            const searchData = resp?.data || resp || []
            poskasData = Array.isArray(searchData) ? searchData : (searchData.items || searchData.rows || [])
          } catch (e) {
            console.warn('⚠️ Search endpoint failed, fallback to all:', e)
          }
        }
      }

      // 3) When NO filters are provided at all, get all
      const hasAnyFilter = (dateFilter && dateFilter.length > 0) || (searchTerm && searchTerm.trim().length > 0)
      if (!hasAnyFilter) {
        const params = { page: currentPage, limit: 10 }
        console.log('📦 Fetching all with params:', params)
        const response = await poskasService.getPoskas(params)
        let data = response
        if (response && typeof response === 'object' && 'data' in response) {
          data = response.data
        }
        poskasData = data?.poskas || data?.items || data?.data || data || []
      }

      // Basic pagination meta (client-side for now)
      const totalItems = Array.isArray(poskasData) ? poskasData.length : 0
      const totalPages = Math.max(1, Math.ceil(totalItems / 10))

      // Sort newest first: created_at desc -> tanggal_poskas desc -> id desc
      const sortedPoskas = [...(Array.isArray(poskasData) ? poskasData : [])].sort((a, b) => {
        const aCreated = a?.created_at ? new Date(a.created_at).getTime() : 0
        const bCreated = b?.created_at ? new Date(b.created_at).getTime() : 0
        if (bCreated !== aCreated) return bCreated - aCreated

        const aTanggal = a?.tanggal_poskas ? new Date(a.tanggal_poskas).getTime() : 0
        const bTanggal = b?.tanggal_poskas ? new Date(b.tanggal_poskas).getTime() : 0
        if (bTanggal !== aTanggal) return bTanggal - aTanggal

        const aId = typeof a?.id === 'number' ? a.id : parseInt(a?.id || 0)
        const bId = typeof b?.id === 'number' ? b.id : parseInt(b?.id || 0)
        return (bId || 0) - (aId || 0)
      })

      setPoskas(sortedPoskas)
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

  const handleSearch = () => {
    setCurrentPage(1)
    loadPoskas()
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

  // tampilkan tanggal + jam untuk banner "Terakhir diupdate"
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

  // kalkulasi teks terakhir diupdate dari poskas terbaru
  const lastUpdatedText = useMemo(() => {
    if (!poskas || poskas.length === 0) return '-'
    const latest = poskas[0]
    const dt = latest?.created_at || latest?.tanggal_poskas
    return formatDateTime(dt)
  }, [poskas])

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
  };

  return (
    <div className="p-0 bg-gray-50 min-h-screen">
      {/* Header - Investor-style */}
      <div className="bg-red-800 text-white px-4 sm:px-6 py-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div className="flex items-center gap-4 min-w-0">
            <span className="text-sm font-semibold bg-white/10 rounded px-2 py-1">{MENU_CODES.keuangan.poskas}</span>
            <div>
              <h1 className="text-xl md:text-2xl font-extrabold tracking-tight">POSKAS</h1>
              <p className="text-sm text-red-100">Kelola data posisi kas outlet</p>
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
            {/* Tombol Tambah disembunyikan sesuai permintaan */}
          </div>
        </div>
      </div>
      <div className="bg-gray-200 px-4 sm:px-6 py-2 text-xs text-gray-600">Terakhir diupdate: {lastUpdatedText}</div>

      {/* Stats Cards (match Admin) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 my-4">
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

      {/* Filters (match Admin) */}
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
              <label className="block text-xs font-medium text-gray-600 mb-1">Bulan</label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="month"
                  value={dateFilter}
                  onChange={handleMonthChange}
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
          {/* Tombol Tambah (empty state) disembunyikan sesuai permintaan */}
        </div>
      ) : (
        <>
          {/* Toolbar: title + bulk actions */}
          <div className="px-6 py-3 border-b border-gray-100 flex items-center justify-between">
            <h2 className="text-base font-semibold text-gray-900">Daftar Pos Kas</h2>
            <div className="flex items-center gap-3">
              {selectedItems.length > 0 && (
                <span className="text-sm text-gray-600 hidden sm:inline">{selectedItems.length} item dipilih</span>
              )}
              <div className="relative">
                <button
                  onClick={() => setShowBulkMenu(v => !v)}
                  aria-label="Aksi massal"
                  className="inline-flex items-center justify-center h-9 w-9 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50"
                >
                  <MoreVertical className="h-4 w-4" />
                </button>
                {showBulkMenu && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-100 z-20">
                    <div className="py-1">
                      <button onClick={handleBulkCopy} className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50">Copy (ceklist)</button>
                      <button onClick={handleBulkDownload} className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50">Download (ceklist)</button>
                      <button onClick={handleBulkShare} className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50">Share (ceklist)</button>
                      <button onClick={handleBulkOpenAll} className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50">Open All (ceklist)</button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="relative table-responsive overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="sticky top-0 bg-red-700 z-10">
                <tr>
                  <th className="pl-6 pr-0 py-3 text-left text-xs font-extrabold text-white uppercase tracking-wider">
                    <input
                      type="checkbox"
                      checked={selectedItems.length === poskas.length && poskas.length > 0}
                      onChange={handleSelectAll}
                      className="rounded border-white text-white focus:ring-white"
                      aria-label="Pilih semua"
                    />
                  </th>
                  <th className="pl-0 pr-12 py-3 text-left text-sm md:text-base font-extrabold text-white uppercase tracking-wider">No</th>
                  <th className="px-12 py-3 text-left text-sm md:text-base font-extrabold text-white uppercase tracking-wider">Tanggal</th>
                  <th className="px-12 py-3 text-left text-sm md:text-base font-extrabold text-white uppercase tracking-wider">Keterangan</th>
                  <th className="px-12 py-3 text-left text-sm md:text-base font-extrabold text-white uppercase tracking-wider">Aksi</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {poskas.map((poskasItem, idx) => (
                  <tr
                    key={poskasItem.id}
                    className="hover:bg-gray-50/80 cursor-pointer"
                    onClick={() => navigate(`/owner/keuangan/poskas/${poskasItem.id}`)}
                  >
                    <td className="pl-6 pr-0 py-4 whitespace-nowrap text-sm text-gray-900">
                      <input
                        type="checkbox"
                        checked={selectedItems.includes(poskasItem.id)}
                        onClick={(e) => e.stopPropagation()}
                        onChange={() => handleCheckboxChange(poskasItem.id)}
                        className="rounded border-gray-300 text-red-600 focus:ring-red-500"
                        aria-label={`Pilih baris ${idx + 1}`}
                      />
                    </td>
                    <td className="pl-0 pr-12 py-4 whitespace-nowrap text-sm text-gray-900">{idx + 1}</td>
                    <td className="px-12 py-4 whitespace-normal md:whitespace-nowrap text-sm text-gray-900">
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
                    <td className="px-12 py-4 text-sm text-gray-900">
                      <div
                        className="md:truncate break-anywhere max-w-[14rem] md:max-w-md"
                        dangerouslySetInnerHTML={{
                          __html: poskasItem.isi_poskas.length > 150
                            ? poskasItem.isi_poskas.substring(0, 150) + '...'
                            : poskasItem.isi_poskas
                        }}
                      />
                    </td>
                    <td className="px-12 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div className="flex items-center gap-3">
                        <button
                          onClick={(e) => { e.stopPropagation(); handleShare(poskasItem); }}
                          className="text-blue-600 hover:text-blue-900"
                          title="Bagikan"
                        >
                          <Share2 className="h-4 w-4" />
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); handleDownload(poskasItem); }}
                          className="text-green-600 hover:text-green-900"
                          title="Download"
                        >
                          <Download className="h-4 w-4" />
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); handleCopy(poskasItem); }}
                          className="text-gray-700 hover:text-gray-900"
                          title="Copy"
                        >
                          <CopyIcon className="h-4 w-4" />
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
  );
}

export default OwnerPoskasList