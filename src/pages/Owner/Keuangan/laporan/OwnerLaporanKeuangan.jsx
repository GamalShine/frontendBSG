import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../../../contexts/AuthContext';
import { laporanKeuanganService } from '../../../../services/laporanKeuanganService';
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
  MoreVertical
} from 'lucide-react';
import LoadingSpinner from '../../../../components/UI/LoadingSpinner';
import { MENU_CODES } from '@/config/menuCodes';

const OwnerLaporanKeuangan = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [laporanKeuangan, setLaporanKeuangan] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [monthFilter, setMonthFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [selectedItems, setSelectedItems] = useState([]); // State untuk selected items
  const [stats, setStats] = useState({
    total_records: 0,
    total_this_month: 0,
    total_this_year: 0
  });
  const [monthsView, setMonthsView] = useState('months'); // 'months' | 'monthContent'
  const [availableMonths, setAvailableMonths] = useState([]); // [{year, month}]
  const [showBulkMenu, setShowBulkMenu] = useState(false);
  const [derivedCounts, setDerivedCounts] = useState({ thisMonth: 0, thisYear: 0 });

  useEffect(() => {
    if (user) {
      if (monthsView === 'months') {
        loadAvailableMonths();
      } else {
        loadLaporanKeuangan();
      }
      loadStats();
    }
  }, [user, monthsView, currentPage, monthFilter]);

  // Hitung jumlah bulan ini dan tahun ini secara client-side agar akurat
  useEffect(() => {
    const calcDerived = async () => {
      try {
        const now = new Date();
        const y = now.getFullYear();
        const m = String(now.getMonth() + 1).padStart(2, '0');
        const monthKey = `${y}-${m}`;

        // Count for this month
        let thisMonth = 0;
        try {
          const resM = await laporanKeuanganService.getAllLaporanKeuangan(1, 1, '', '', monthKey);
          thisMonth = resM?.pagination?.totalItems || 0;
        } catch (_) {}

        // Count for this year (sum each available month of this year)
        let thisYear = 0;
        const monthsOfYear = (availableMonths || []).filter(mm => Number(mm.year) === y);
        if (monthsOfYear.length > 0) {
          for (const mm of monthsOfYear) {
            const key = `${mm.year}-${String(mm.month).padStart(2, '0')}`;
            try {
              const res = await laporanKeuanganService.getAllLaporanKeuangan(1, 1, '', '', key);
              thisYear += res?.pagination?.totalItems || 0;
            } catch (_) {}
          }
        } else {
          // Fallback: try each month 1..12 quickly (safe but more calls)
          for (let i = 1; i <= 12; i++) {
            const key = `${y}-${String(i).padStart(2, '0')}`;
            try {
              const res = await laporanKeuanganService.getAllLaporanKeuangan(1, 1, '', '', key);
              thisYear += res?.pagination?.totalItems || 0;
            } catch (_) {}
          }
        }

        setDerivedCounts({ thisMonth, thisYear });
      } catch (_) {
        setDerivedCounts({ thisMonth: 0, thisYear: 0 });
      }
    };
    calcDerived();
  }, [availableMonths]);

  // ===== Bulk actions (selectedItems) - scope komponen =====
  const getSelectedEntries = () => {
    if (!Array.isArray(selectedItems) || selectedItems.length === 0) return []
    const byId = new Map(laporanKeuangan.map(p => [p.id, p]))
    return selectedItems.map(id => byId.get(id)).filter(Boolean)
  }

  const handleBulkCopy = async () => {
    const entries = getSelectedEntries()
    if (entries.length === 0) return toast.error('Pilih minimal satu laporan terlebih dahulu')
    const combined = entries.map(e => `${formatDate(e.tanggal_laporan)}\n${(e.isi_laporan || '').replace(/<[^>]*>/g, '')}`).join('\n\n---\n\n')
    await navigator.clipboard.writeText(combined)
    toast.success(`Menyalin ${entries.length} laporan`)
    setShowBulkMenu(false)
  }

  const handleBulkDownload = () => {
    const entries = getSelectedEntries()
    if (entries.length === 0) return toast.error('Pilih minimal satu laporan terlebih dahulu')
    const combined = entries.map(e => `${formatDate(e.tanggal_laporan)}\n${(e.isi_laporan || '').replace(/<[^>]*>/g, '')}`).join('\n\n---\n\n')
    const blob = new Blob([combined], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `owner_laporan_selected_${entries.length}.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    setShowBulkMenu(false)
  }

  const handleBulkShare = async () => {
    const entries = getSelectedEntries()
    if (entries.length === 0) return toast.error('Pilih minimal satu laporan terlebih dahulu')
    const combined = entries.map(e => `${formatDate(e.tanggal_laporan)}\n${(e.isi_laporan || '').replace(/<[^>]*>/g, '')}`).join('\n\n---\n\n')
    if (navigator.share) {
      try { await navigator.share({ title: `Laporan Keuangan (${entries.length})`, text: combined }) } catch {}
    } else {
      await navigator.clipboard.writeText(combined)
      toast.success('Teks disalin untuk dibagikan')
    }
    setShowBulkMenu(false)
  }

  const handleBulkOpenAll = () => {
    const entries = getSelectedEntries()
    if (entries.length === 0) return toast.error('Pilih minimal satu laporan terlebih dahulu')
    entries.forEach(e => window.open(`/owner/keuangan/laporan/${e.id}`, '_blank'))
    setShowBulkMenu(false)
  }

  const loadLaporanKeuangan = async () => {
    try {
      setLoading(true);
      const response = await laporanKeuanganService.getAllLaporanKeuangan(
        currentPage,
        10,
        '',
        '',
        monthFilter
      );
      
      if (response.success) {
        setLaporanKeuangan(response.data);
        setTotalPages(response.pagination.totalPages);
        setTotalItems(response.pagination.totalItems);
      } else {
        toast.error('Gagal memuat data laporan keuangan');
      }
    } catch (error) {
      console.error('Error loading laporan keuangan:', error);
      toast.error('Gagal memuat data laporan keuangan');
    } finally {
      setLoading(false);
    }
  };

  const loadAvailableMonths = async () => {
    try {
      setLoading(true);
      const res = await laporanKeuanganService.getAvailableMonths();
      if (res?.success) {
        setAvailableMonths(res.data || []);
      } else {
        setAvailableMonths([]);
      }
    } catch (e) {
      console.error('Error loading available months:', e);
      setAvailableMonths([]);
    } finally {
      setLoading(false);
    }
  };

  // Grouping helpers
  const getMonthKey = (dateStr) => {
    if (!dateStr) return 'Unknown';
    const d = new Date(dateStr);
    const y = d.getFullYear();
    const m = (d.getMonth() + 1).toString().padStart(2, '0');
    return `${y}-${m}`;
  };

  const formatMonthHeader = (monthKey) => {
    if (!monthKey || monthKey === 'Unknown') return 'Tidak diketahui';
    const [y, m] = monthKey.split('-').map(Number);
    const date = new Date(y, m - 1, 1);
    return date.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' });
  };

  const groupByMonth = (items) => {
    const groups = {};
    items.forEach((it) => {
      const key = getMonthKey(it.tanggal_laporan);
      if (!groups[key]) groups[key] = [];
      groups[key].push(it);
    });
    return groups;
  };

  // Folder icon (mirroring Medsos style)
  const FolderIcon = ({ open = false }) => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="currentColor"
      className={`w-10 h-10 ${open ? 'text-yellow-600' : 'text-yellow-500'}`}
    >
      <path d="M10.5 4.5a1.5 1.5 0 0 1 1.06.44l1.5 1.5c.28.3.67.46 1.07.46H19.5A2.25 2.25 0 0 1 21.75 9v7.5A2.25 2.25 0 0 1 19.5 18.75h-15A2.25 2.25 0 0 1 2.25 16.5v-9A2.25 2.25 0 0 1 4.5 5.25h5.25z" />
    </svg>
  );

  const monthFilterLabel = () => {
    if (!monthFilter) return '';
    const [y, m] = monthFilter.split('-').map(Number);
    const d = new Date(y, (m || 1) - 1, 1);
    return d.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' });
  };

  const loadStats = async () => {
    try {
      const response = await laporanKeuanganService.getStats();
      if (response.success) {
        setStats(response.data);
      }
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const openMonthFolder = (year, month) => {
    const monthKey = `${year}-${String(month).padStart(2, '0')}`;
    setMonthFilter(monthKey);
    setCurrentPage(1);
    setMonthsView('monthContent');
    try {
      sessionStorage.setItem('owner.lapkeu.lastMonth', monthKey);
    } catch (_) {}
  };

  const backToMonths = () => {
    setMonthsView('months');
    setMonthFilter('');
    setLaporanKeuangan([]);
    setCurrentPage(1);
  };

  // Restore folder terakhir hanya saat kembali dari detail/edit/tambah
  useEffect(() => {
    try {
      const returning = sessionStorage.getItem('owner.lapkeu.returning');
      const lastMonth = sessionStorage.getItem('owner.lapkeu.lastMonth');
      if (returning === '1' && lastMonth) {
        setMonthFilter(lastMonth);
        setCurrentPage(1);
        setMonthsView('monthContent');
      }
      // reset flag apapun kondisinya agar tidak auto-restore saat refresh/akses baru
      sessionStorage.setItem('owner.lapkeu.returning', '0');
    } catch (_) {}
    // hanya jalan saat mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Apakah Anda yakin ingin menghapus data laporan keuangan ini?')) {
      return;
    }

    try {
      await laporanKeuanganService.deleteLaporanKeuangan(id);
      toast.success('Data laporan keuangan berhasil dihapus');
      loadLaporanKeuangan();
      loadStats();
    } catch (error) {
      console.error('Error deleting laporan keuangan:', error);
      toast.error('Gagal menghapus data laporan keuangan');
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
    if (selectedItems.length === laporanKeuangan.length) {
      setSelectedItems([])
    } else {
      setSelectedItems(laporanKeuangan.map(item => item.id))
    }
  }

  // Handle bulk delete (satu definisi saja)
  const handleBulkDelete = async () => {
    if (selectedItems.length === 0) {
      toast.error('Pilih item yang akan dihapus')
      return
    }
    if (window.confirm(`Apakah Anda yakin ingin menghapus ${selectedItems.length} data laporan keuangan yang dipilih?`)) {
      try {
        const deletePromises = selectedItems.map(id => laporanKeuanganService.deleteLaporanKeuangan(id))
        await Promise.all(deletePromises)
        toast.success(`${selectedItems.length} data laporan keuangan berhasil dihapus`)
        setSelectedItems([])
        loadLaporanKeuangan()
        loadStats()
      } catch (error) {
        console.error('❌ Error bulk deleting laporan keuangan:', error)
        toast.error('Gagal menghapus beberapa data laporan keuangan')
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

  const truncateText = (text, maxLength = 100) => {
    if (!text) return '-';
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };
  
  return (
    <div className="px-0 py-2 bg-gray-50 min-h-screen">
      {/* Header + Badge Code */}
      <div className="bg-red-800 text-white p-4 mb-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span className="text-sm font-semibold bg-white/10 rounded px-2 py-1">{MENU_CODES.keuangan.laporanKeuangan}</span>
            <div>
              <h1 className="text-2xl font-bold">LAPORAN KEUANGAN</h1>
              <p className="text-sm opacity-90">Owner - Keuangan</p>
            </div>
          </div>
          {monthsView === 'months' && (
            <Link
              to="/owner/keuangan/laporan/new"
              aria-label="Tambah Laporan Keuangan"
              className="inline-flex items-center gap-2 px-3 py-2 sm:px-4 sm:py-2 bg-white text-red-700 hover:bg-red-50 transition-colors"
            >
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">Tambah</span>
            </Link>
          )}
        </div>
      </div>
    <div className="bg-gray-200 px-4 py-2 text-xs text-gray-600 -mt-1 mb-4">Terakhir diupdate: {new Date().toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric'})} pukul {new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit'})}</div>

    {/* Stats Cards */}
    {monthsView === 'monthContent' ? (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <div className="bg-white rounded-lg shadow-sm border p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Calendar className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Total Bulan {monthFilterLabel()}</p>
              <p className="text-2xl font-bold text-gray-900">{(totalItems || 0).toLocaleString('id-ID')}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <TrendingUp className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Ditampilkan (Halaman ini)</p>
              <p className="text-2xl font-bold text-gray-900">{(laporanKeuangan?.length || 0).toLocaleString('id-ID')}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Calendar className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Total Semua Waktu</p>
              <p className="text-2xl font-bold text-gray-900">{(stats.total_records || 0).toLocaleString('id-ID')}</p>
            </div>
          </div>
        </div>
      </div>
    ) : (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <div className="bg-white rounded-lg shadow-sm border p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Calendar className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Total Laporan</p>
              <p className="text-2xl font-bold text-gray-900">{(stats.total_records || 0).toLocaleString('id-ID')}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <TrendingUp className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Bulan Ini</p>
              <p className="text-2xl font-bold text-gray-900">{(derivedCounts.thisMonth || 0).toLocaleString('id-ID')}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Calendar className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Tahun Ini</p>
              <p className="text-2xl font-bold text-gray-900">{(derivedCounts.thisYear || 0).toLocaleString('id-ID')}</p>
            </div>
          </div>
        </div>
      </div>
    )}

      {/* Months Folder Grid */}
      {monthsView === 'months' && (
        <div className="bg-white shadow-sm border rounded-lg overflow-hidden mb-4">
          <div className="px-4 py-3 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Pilih Bulan</h2>
            {loading && <div className="text-sm text-gray-600">Memuat daftar bulan...</div>}
            {!loading && availableMonths.length === 0 && (
              <div className="text-sm text-gray-600">Belum ada data bulan tersedia</div>
            )}
            {!loading && availableMonths.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 p-1">
                {availableMonths.map(({ year, month }) => {
                  const label = new Date(year, month - 1, 1).toLocaleDateString('id-ID', { month: 'long', year: 'numeric' });
                  return (
                    <div
                      key={`${year}-${month}`}
                      className="group p-4 bg-white cursor-pointer border border-gray-200 rounded-xl hover:border-red-300 hover:shadow-md transition-all"
                      onClick={() => openMonthFolder(year, month)}
                    >
                      <div className="flex items-center gap-3">
                        <div className="shrink-0 p-2 rounded-lg bg-yellow-50 group-hover:bg-yellow-100 transition-colors">
                          <FolderIcon />
                        </div>
                        <div>
                          <div className="font-semibold text-gray-800 group-hover:text-red-700">{label}</div>
                          <div className="text-xs text-gray-500">Folder Bulan</div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Month Content Table */}
      {monthsView === 'monthContent' && (
        <div className="bg-white shadow-sm border rounded-lg overflow-hidden">
          <div className="bg-red-800 text-white px-4 py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <button
                  onClick={backToMonths}
                  aria-label="Kembali"
                  className="inline-flex items-center justify-center h-8 w-8 rounded border border-white/60 text-white hover:bg-white/10"
                >
                  &lt;
                </button>
                <div>
                  <h2 className="text-lg font-semibold">{monthFilterLabel()}</h2>
                  <p className="text-xs opacity-90">Daftar Laporan Keuangan</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Link
                  to="/owner/keuangan/laporan/new"
                  className="bg-white border border-red-600 text-red-700 hover:bg-red-50 inline-flex items-center gap-2 px-3 py-2 rounded-lg"
                >
                  <Plus className="h-4 w-4" /> Tambah
                </Link>
                {/* Titik tiga dipindah ke sebelah kanan tombol Kembali */}
                <div className="relative">
                  <button
                    onClick={() => setShowBulkMenu(v => !v)}
                    aria-label="Aksi massal"
                    className="inline-flex items-center justify-center h-9 w-9 rounded-lg border border-white/60 text-white hover:bg-white/10"
                  >
                    <MoreVertical className="h-4 w-4" />
                  </button>
                  {showBulkMenu && (
                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-100 z-20 text-gray-900">
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
          </div>
          {/* Summary inside folder */}
          <div className="px-4 py-2 bg-gray-100 text-xs text-gray-700 flex items-center justify-between">
            <div>
              Total {monthFilterLabel()}: <span className="font-semibold">{(totalItems || 0).toLocaleString('id-ID')}</span>
            </div>
            <div>
              Ditampilkan: <span className="font-semibold">{(laporanKeuangan?.length || 0).toLocaleString('id-ID')}</span>
            </div>
          </div>

          {loading ? (
            <LoadingSpinner />
          ) : laporanKeuangan.length === 0 ? (
            <div className="p-5 text-center">
              <DollarSign className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Tidak ada data</h3>
              <p className="text-gray-500 mb-4">Belum ada data laporan keuangan yang tersedia</p>
              <Link
                to="/owner/keuangan/laporan/new"
                className="inline-flex items-center space-x-2 px-4 py-2 bg-green-600 text-white hover:bg-green-700 transition-colors rounded-lg"
              >
                <Plus className="h-4 w-4" />
                <span>Tambah Laporan Pertama</span>
              </Link>
            </div>
          ) : (
            <>
              <div className="table-responsive mt-2 overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="sticky top-0 bg-red-700 z-10 shadow">
                    <tr>
                      <th className="pl-4 sm:pl-6 pr-0 py-3 text-left text-xs font-extrabold text-white uppercase tracking-wider">
                        <input
                          type="checkbox"
                          checked={selectedItems.length === laporanKeuangan.length && laporanKeuangan.length > 0}
                          onChange={handleSelectAll}
                          className="rounded border-white text-white focus:ring-white"
                          aria-label="Pilih semua"
                        />
                      </th>
                      <th className="px-4 md:px-6 py-3 text-left text-sm md:text-base font-extrabold text-white uppercase tracking-wider">Tanggal</th>
                      <th className="px-4 md:px-6 py-3 text-left text-sm md:text-base font-extrabold text-white uppercase tracking-wider">Judul</th>
                      <th className="px-4 md:px-6 py-3 text-left text-sm md:text-base font-extrabold text-white uppercase tracking-wider">Dibuat Oleh</th>
                      <th className="px-4 md:px-6 py-3 text-left text-sm md:text-base font-extrabold text-white uppercase tracking-wider">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-100">
                    {(() => {
                      const groups = groupByMonth(laporanKeuangan);
                      const entries = Object.entries(groups).sort((a, b) => b[0].localeCompare(a[0]));
                      if (entries.length === 0) return (
                        <tr>
                          <td colSpan={5} className="px-6 py-12 text-center text-gray-500">Tidak ada data</td>
                        </tr>
                      );
                      return entries.map(([monthKey, items]) => (
                        <React.Fragment key={monthKey}>
                          {items.map((laporan) => (
                            <tr
                              key={laporan.id}
                              className="hover:bg-gray-50 cursor-pointer"
                              onClick={() => navigate(`/owner/keuangan/laporan/${laporan.id}`)}
                            >
                              <td className="pl-4 sm:pl-6 pr-0 py-3 whitespace-nowrap text-sm text-gray-900">
                                <input
                                  type="checkbox"
                                  checked={selectedItems.includes(laporan.id)}
                                  onClick={(e) => e.stopPropagation()}
                                  onChange={() => handleCheckboxChange(laporan.id)}
                                  className="rounded border-gray-300 text-red-600 focus:ring-red-500"
                                  aria-label={`Pilih baris ${laporan.id}`}
                                />
                              </td>
                              <td className="px-4 md:px-6 py-3 whitespace-normal md:whitespace-nowrap text-sm text-gray-900">
                                {formatDate(laporan.tanggal_laporan)}
                              </td>
                              <td className="px-4 md:px-6 py-3 text-sm text-gray-900">
                                <div className="max-w-[14rem] md:max-w-md break-anywhere md:truncate">
                                  {truncateText(laporan.judul_laporan, 150)}
                                </div>
                              </td>
                              <td className="px-4 md:px-6 py-3 whitespace-normal md:whitespace-nowrap text-sm text-gray-900">
                                {laporan.user_nama || 'Admin'}
                              </td>
                              <td className="px-4 md:px-6 py-3 whitespace-nowrap text-sm font-medium">
                                <div className="flex items-center gap-2">
                                  <Link
                                    to={`/owner/keuangan/laporan/${laporan.id}`}
                                    onClick={(e) => e.stopPropagation()}
                                    className="inline-flex items-center justify-center h-8 w-8 rounded-md text-blue-600 hover:bg-blue-50"
                                  >
                                    <Eye className="h-4 w-4" />
                                  </Link>
                                  <Link
                                    to={`/owner/keuangan/laporan/${laporan.id}/edit`}
                                    onClick={(e) => e.stopPropagation()}
                                    className="inline-flex items-center justify-center h-8 w-8 rounded-md text-green-600 hover:bg-green-50"
                                  >
                                    <Edit className="h-4 w-4" />
                                  </Link>
                                  <button
                                    onClick={(e) => { e.stopPropagation(); handleDelete(laporan.id) }}
                                    className="inline-flex items-center justify-center h-8 w-8 rounded-md text-red-600 hover:bg-red-50"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </React.Fragment>
                      ));
                    })()}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="px-3 py-2 border-t border-gray-200 bg-white">
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-700">
                      Menampilkan {((currentPage - 1) * 10) + 1} sampai {Math.min(currentPage * 10, totalItems)} dari {totalItems} data
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                        disabled={currentPage === 1}
                        className="px-3 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Sebelumnya
                      </button>
                      <span className="px-3 py-2 text-sm text-gray-700">
                        Halaman {currentPage} dari {totalPages}
                      </span>
                      <button
                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                        disabled={currentPage === totalPages}
                        className="px-3 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
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
      )}
    </div>
  );
};

export default OwnerLaporanKeuangan;
