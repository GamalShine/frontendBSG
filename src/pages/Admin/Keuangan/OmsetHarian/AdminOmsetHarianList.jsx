import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../../../contexts/AuthContext';
import { omsetHarianService } from '../../../../services/omsetHarianService';
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
  DollarSign,
  MoreVertical,
  Copy as CopyIcon,
  Share2,
  Download
} from 'lucide-react';
import LoadingSpinner from '../../../../components/UI/LoadingSpinner';
import { MENU_CODES } from '@/config/menuCodes';

const AdminOmsetHarianList = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [omsetHarian, setOmsetHarian] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [selectedItems, setSelectedItems] = useState([]); // State untuk selected items
  const [stats, setStats] = useState({
    total_records: 0,
    total_this_month: 0,
    total_this_year: 0
  });
  const [showFilters, setShowFilters] = useState(false);
  const [showBulkMenu, setShowBulkMenu] = useState(false);

  useEffect(() => {
    if (user) {
      loadOmsetHarian();
      loadStats();
    }
  }, [user, currentPage, searchTerm, dateFilter]);

  const loadOmsetHarian = async () => {
    try {
      setLoading(true);
      const response = await omsetHarianService.getAllOmsetHarian(
        currentPage,
        10,
        searchTerm,
        dateFilter
      );
      
      if (response.success) {
        setOmsetHarian(response.data);
        setTotalPages(response.pagination.totalPages);
        setTotalItems(response.pagination.totalItems);
      } else {
        toast.error('Gagal memuat data omset harian');
      }
    } catch (error) {
      console.error('Error loading omset harian:', error);
      toast.error('Gagal memuat data omset harian');
    } finally {
      setLoading(false);
    }
  };

  // Bulk helpers (seragam Poskas)
  const getSelectedEntries = () => {
    if (!Array.isArray(selectedItems) || selectedItems.length === 0) return []
    const byId = new Map(omsetHarian.map(p => [p.id, p]))
    return selectedItems.map(id => byId.get(id)).filter(Boolean)
  }

  const handleBulkCopy = async () => {
    const entries = getSelectedEntries()
    if (entries.length === 0) return toast.error('Pilih minimal satu omset terlebih dahulu')
    const combined = entries.map(e => `${formatDate(e.tanggal_omset)}\n${(e.isi_omset || '').replace(/<[^>]*>/g, '')}`).join('\n\n---\n\n')
    await navigator.clipboard.writeText(combined)
    toast.success(`Menyalin ${entries.length} omset`)
    setShowBulkMenu(false)
  }

  const handleBulkDownload = () => {
    const entries = getSelectedEntries()
    if (entries.length === 0) return toast.error('Pilih minimal satu omset terlebih dahulu')
    const combined = entries.map(e => `${formatDate(e.tanggal_omset)}\n${(e.isi_omset || '').replace(/<[^>]*>/g, '')}`).join('\n\n---\n\n')
    const blob = new Blob([combined], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `admin_omset_selected_${entries.length}.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    setShowBulkMenu(false)
  }

  const handleBulkShare = async () => {
    const entries = getSelectedEntries()
    if (entries.length === 0) return toast.error('Pilih minimal satu omset terlebih dahulu')
    const combined = entries.map(e => `${formatDate(e.tanggal_omset)}\n${(e.isi_omset || '').replace(/<[^>]*>/g, '')}`).join('\n\n---\n\n')
    if (navigator.share) {
      try { await navigator.share({ title: `Omset Harian (${entries.length})`, text: combined }) } catch {}
    } else {
      await navigator.clipboard.writeText(combined)
      toast.success('Teks disalin untuk dibagikan')
    }
    setShowBulkMenu(false)
  }

  const handleBulkOpenAll = () => {
    const entries = getSelectedEntries()
    if (entries.length === 0) return toast.error('Pilih minimal satu omset terlebih dahulu')
    entries.forEach(e => window.open(`/admin/keuangan/omset-harian/${e.id}`,'_blank'))
    setShowBulkMenu(false)
  }

  const loadStats = async () => {
    try {
      const response = await omsetHarianService.getStats();
      if (response.success) {
        setStats(response.data);
      }
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Apakah Anda yakin ingin menghapus data omset harian ini?')) {
      return;
    }

    try {
      await omsetHarianService.deleteOmsetHarian(id);
      toast.success('Data omset harian berhasil dihapus');
      loadOmsetHarian();
      loadStats();
    } catch (error) {
      console.error('Error deleting omset harian:', error);
      toast.error('Gagal menghapus data omset harian');
    }
  };

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
    if (selectedItems.length === omsetHarian.length) {
      setSelectedItems([])
    } else {
      setSelectedItems(omsetHarian.map(item => item.id))
    }
  }

  // Handle bulk delete
  const handleBulkDelete = async () => {
    if (selectedItems.length === 0) {
      toast.error('Pilih item yang akan dihapus')
      return
    }

    if (window.confirm(`Apakah Anda yakin ingin menghapus ${selectedItems.length} data omset harian yang dipilih?`)) {
      try {
        const deletePromises = selectedItems.map(id => omsetHarianService.deleteOmsetHarian(id))
        await Promise.all(deletePromises)
        
        toast.success(`${selectedItems.length} data omset harian berhasil dihapus`)
        setSelectedItems([])
        loadOmsetHarian()
        loadStats()
      } catch (error) {
        console.error('❌ Error bulk deleting omset harian:', error)
        toast.error('Gagal menghapus beberapa data omset harian')
      }
    }
  }

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

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

  // Mengambil waktu update terakhir dari item terbaru (diasumsikan data sudah sorted desc)
  const lastUpdatedText = useMemo(() => {
    if (!omsetHarian || omsetHarian.length === 0) return '-'
    const latest = omsetHarian[0]
    const dt = latest?.created_at || latest?.tanggal_omset
    return formatDateTime(dt)
  }, [omsetHarian])

  const isToday = (dateString) => {
    if (!dateString) return false;
    const d = new Date(dateString);
    const now = new Date();
    return (
      d.getFullYear() === now.getFullYear() &&
      d.getMonth() === now.getMonth() &&
      d.getDate() === now.getDate()
    );
  };

  const truncateText = (text, maxLength = 100) => {
    if (!text) return '-';
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  return (
    <div className="p-0 bg-gray-50 min-h-screen">
      {/* Header - match POSKAS style */}
      <div className="bg-red-800 text-white px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span className="text-sm font-semibold bg-white/10 rounded px-2 py-1">{MENU_CODES.keuangan.omsetHarian}</span>
            <div>
              <h1 className="text-xl md:text-2xl font-extrabold tracking-tight">OMSET HARIAN</h1>
              <p className="text-sm text-red-100">Kelola data omset harian outlet</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowFilters(v => !v)}
              className="px-4 py-2 rounded-full border border-white/60 text-white hover:bg-white/10"
            >
              PENCARIAN
            </button>
            <Link
              to="/admin/keuangan/omset-harian/new"
              className="inline-flex items-center gap-2 px-4 py-2 bg-white text-red-700 rounded-lg hover:bg-red-50 transition-colors shadow-sm"
            >
              <Plus className="h-4 w-4" />
              <span className="font-semibold">Tambah</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Info bar */}
      <div className="bg-gray-200 px-6 py-2 text-xs text-gray-600">Terakhir diupdate: {lastUpdatedText}</div>

      {/* Stats Cards (seragam Poskas) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 my-4">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Calendar className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-xs font-medium text-gray-500">Total Omset</p>
              <p className="text-xl font-bold text-gray-900">{stats.total_records || 0}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <TrendingUp className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-xs font-medium text-gray-500">Bulan Ini</p>
              <p className="text-xl font-bold text-gray-900">{stats.total_this_month || 0}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Calendar className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <p className="text-xs font-medium text-gray-500">Tahun Ini</p>
              <p className="text-xl font-bold text-gray-900">{stats.total_this_year || 0}</p>
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
                    placeholder="Cari omset harian..."
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
                  onClick={() => {
                    setSearchTerm('');
                    setDateFilter('');
                  }}
                  className="inline-flex items-center gap-2 px-5 py-2 rounded-full border border-red-600 text-red-700 hover:bg-red-50 transition-colors"
                >
                  <RefreshCw className="h-4 w-4" />
                  <span className="font-semibold">Reset</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Data Table (seragam Poskas) */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 mt-4">
        <div className="px-6 py-3 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-base font-semibold text-gray-900">Daftar Omset Harian</h2>
          <div className="flex items-center gap-3">
            {selectedItems.length > 0 && (
              <>
                <span className="text-sm text-gray-600 hidden sm:inline">{selectedItems.length} item dipilih</span>
                <button
                  onClick={handleBulkDelete}
                  className="inline-flex items-center gap-2 px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                >
                  <Trash2 className="h-4 w-4" />
                  <span>Hapus ({selectedItems.length})</span>
                </button>
              </>
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

        {loading ? (
          <LoadingSpinner />
        ) : omsetHarian.length === 0 ? (
          <div className="p-8 text-center">
            <DollarSign className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Tidak ada data</h3>
            <p className="text-gray-500 mb-4">Belum ada data omset harian yang tersedia</p>
            <Link
              to="/admin/keuangan/omset-harian/new"
              className="inline-flex items-center space-x-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
            >
              <Plus className="h-4 w-4" />
              <span>Tambah Omset Pertama</span>
            </Link>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="sticky top-0 bg-red-700 z-10">
                  <tr>
                    <th className="pl-6 pr-0 py-3 text-left text-xs font-extrabold text-white uppercase tracking-wider">
                      <input
                        type="checkbox"
                        checked={selectedItems.length === omsetHarian.length && omsetHarian.length > 0}
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
                  {omsetHarian.map((omset, idx) => {
                    const displayIndex = (currentPage - 1) * 10 + (idx + 1);
                    return (
                      <tr
                        key={omset.id}
                        className="hover:bg-gray-50/80 cursor-pointer"
                        onClick={() => navigate(`/admin/keuangan/omset-harian/${omset.id}`)}
                      >
                        <td className="pl-6 pr-0 py-4 whitespace-nowrap text-sm text-gray-900">
                          <input
                            type="checkbox"
                            checked={selectedItems.includes(omset.id)}
                            onClick={(e) => e.stopPropagation()}
                            onChange={() => handleCheckboxChange(omset.id)}
                            className="rounded border-gray-300 text-red-600 focus:ring-red-500"
                            aria-label={`Pilih baris ${displayIndex}`}
                          />
                        </td>
                        <td className="pl-0 pr-12 py-4 whitespace-nowrap text-sm text-gray-900">{displayIndex}</td>
                        <td className="px-12 py-4 whitespace-nowrap text-sm text-gray-900">
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{formatDate(omset.tanggal_omset).toUpperCase()}</span>
                            {isToday(omset.tanggal_omset) && (
                              <span className="inline-flex items-center rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-semibold text-blue-700 ring-1 ring-inset ring-blue-600/10">NEW</span>
                            )}
                          </div>
                        </td>
                        <td className="px-12 py-4 text-sm text-gray-900">
                          <div className="md:truncate max-w-[14rem] md:max-w-md">
                            {truncateText(omset.isi_omset, 150)}
                          </div>
                        </td>
                        <td className="px-12 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          <div className="flex items-center gap-3">
                            <Link
                              to={`/admin/keuangan/omset-harian/${omset.id}`}
                              onClick={(e) => e.stopPropagation()}
                              className="text-blue-600 hover:text-blue-900"
                            >
                              <Eye className="h-4 w-4" />
                            </Link>
                            <Link
                              to={`/admin/keuangan/omset-harian/${omset.id}/edit`}
                              onClick={(e) => e.stopPropagation()}
                              className="text-green-600 hover:text-blue-900"
                            >
                              <Edit className="h-4 w-4" />
                            </Link>
                            <button
                              onClick={(e) => { e.stopPropagation(); handleDelete(omset.id) }}
                              className="text-red-600 hover:text-red-900"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                            {/* Optional single-item copy */}
                            <button onClick={(e)=>{e.stopPropagation(); navigator.clipboard.writeText((omset.isi_omset||'').replace(/<[^>]*>/g,'')); toast.success('Disalin')}} title="Copy" className="text-gray-700 hover:text-gray-900"><CopyIcon className="h-4 w-4"/></button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
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
};

export default AdminOmsetHarianList; 