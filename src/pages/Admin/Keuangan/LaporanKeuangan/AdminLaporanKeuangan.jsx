import React, { useState, useEffect } from 'react';

import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { laporanKeuanganService } from '../../services/laporanKeuanganService';
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
import LoadingSpinner from '../../components/UI/LoadingSpinner';
import { MENU_CODES } from '@/config/menuCodes';

const LaporanKeuangan = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [laporanKeuangan, setLaporanKeuangan] = useState([]);
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
  const [showBulkMenu, setShowBulkMenu] = useState(false);

  useEffect(() => {
    if (user) {
      loadLaporanKeuangan();
      loadStats();
    }
  }, [user, currentPage, searchTerm, dateFilter]);

  const loadLaporanKeuangan = async () => {
    try {
      setLoading(true);
      const response = await laporanKeuanganService.getAllLaporanKeuangan(
        currentPage,
        10,
        searchTerm,
        dateFilter
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

  // ===== Bulk actions (selectedItems) =====
  const getSelectedEntries = () => {
    if (!Array.isArray(selectedItems) || selectedItems.length === 0) return [];
    const byId = new Map(laporanKeuangan.map(p => [p.id, p]));
    return selectedItems.map(id => byId.get(id)).filter(Boolean);
  };

  const handleBulkCopy = async () => {
    const entries = getSelectedEntries();
    if (entries.length === 0) return toast.error('Pilih minimal satu laporan terlebih dahulu');
    const combined = entries.map(e => `${formatDate(e.tanggal_laporan)}\n${(e.isi_laporan || '').replace(/<[^>]*>/g, '')}`).join('\n\n---\n\n');
    await navigator.clipboard.writeText(combined);
    toast.success(`Menyalin ${entries.length} laporan`);
    setShowBulkMenu(false);
  };

  const handleBulkDownload = () => {
    const entries = getSelectedEntries();
    if (entries.length === 0) return toast.error('Pilih minimal satu laporan terlebih dahulu');
    const combined = entries.map(e => `${formatDate(e.tanggal_laporan)}\n${(e.isi_laporan || '').replace(/<[^>]*>/g, '')}`).join('\n\n---\n\n');
    const blob = new Blob([combined], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `admin_laporan_selected_${entries.length}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    setShowBulkMenu(false);
  };

  const handleBulkShare = async () => {
    const entries = getSelectedEntries();
    if (entries.length === 0) return toast.error('Pilih minimal satu laporan terlebih dahulu');
    const combined = entries.map(e => `${formatDate(e.tanggal_laporan)}\n${(e.isi_laporan || '').replace(/<[^>]*>/g, '')}`).join('\n\n---\n\n');
    if (navigator.share) {
      try { await navigator.share({ title: `Laporan Keuangan (${entries.length})`, text: combined }); } catch {}
    } else {
      await navigator.clipboard.writeText(combined);
      toast.success('Teks disalin untuk dibagikan');
    }
    setShowBulkMenu(false);
  };

  const handleBulkOpenAll = () => {
    const entries = getSelectedEntries();
    if (entries.length === 0) return toast.error('Pilih minimal satu laporan terlebih dahulu');
    entries.forEach(e => window.open(`/keuangan/laporan/${e.id}`, '_blank'));
    setShowBulkMenu(false);
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
        return prev.filter(item => item !== id);
      } else {
        return [...prev, id];
      }
    });
  };

  // Handle select all
  const handleSelectAll = () => {
    if (selectedItems.length === laporanKeuangan.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(laporanKeuangan.map(item => item.id));
    }
  };

  // Handle bulk delete
  const handleBulkDelete = async () => {
    if (selectedItems.length === 0) {
      toast.error('Pilih data yang akan dihapus');
      return;
    }

    if (!window.confirm(`Apakah Anda yakin ingin menghapus ${selectedItems.length} data laporan keuangan?`)) {
      return;
    }

    try {
      for (const id of selectedItems) {
        await laporanKeuanganService.deleteLaporanKeuangan(id);
      }
      toast.success(`${selectedItems.length} data laporan keuangan berhasil dihapus`);
      setSelectedItems([]);
      loadLaporanKeuangan();
      loadStats();
    } catch (error) {
      console.error('Error bulk deleting:', error);
      toast.error('Gagal menghapus beberapa data laporan keuangan');
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Helper function to extract title from content
  const extractTitle = (content) => {
    if (!content) return 'Laporan Keuangan';
    const lines = content.split('\n');
    for (const line of lines) {
      if (line.startsWith('#')) {
        return line.substring(1).trim();
      }
    }
    return lines[0]?.substring(0, 50) + '...' || 'Laporan Keuangan';
  };

  // Helper function to truncate content
  const truncateContent = (content, maxLength = 100) => {
    if (!content) return '';
    const text = content.replace(/\[IMG:\d+\]/g, '').replace(/#/g, '');
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="p-0 bg-gray-50 min-h-screen">
      {/* Header Merah + Badge */}
      <div className="bg-red-800 text-white px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span className="text-sm font-semibold bg-white/10 rounded px-2 py-1">{MENU_CODES.keuangan.laporanKeuangan}</span>
            <div>
              <h1 className="text-xl md:text-2xl font-extrabold tracking-tight">LAPORAN KEUANGAN</h1>
              <p className="text-sm text-red-100">Kelola data laporan keuangan outlet</p>
            </div>
          </div>
          <button
            onClick={() => navigate('/keuangan/laporan/add')}
            className="inline-flex items-center space-x-2 px-4 py-2 bg-white text-red-700 rounded-lg hover:bg-red-50 transition-colors shadow-sm"
          >
            <Plus className="h-4 w-4" />
            <span>Tambah</span>
          </button>
        </div>
      </div>
      <div className="p-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 my-4">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-lg bg-blue-50 flex items-center justify-center">
                <DollarSign className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-xs font-medium text-gray-500">Total Laporan</p>
                <p className="text-xl font-bold text-gray-900">{stats.total_records}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-lg bg-green-50 flex items-center justify-center">
                <Calendar className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-xs font-medium text-gray-500">Bulan Ini</p>
                <p className="text-xl font-bold text-gray-900">{stats.total_this_month}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-lg bg-purple-50 flex items-center justify-center">
                <TrendingUp className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-xs font-medium text-gray-500">Tahun Ini</p>
                <p className="text-xl font-bold text-gray-900">{stats.total_this_year}</p>
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
                  Pencarian
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Cari laporan keuangan..."
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  />
                  <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                </div>
              </div>
                
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tanggal
              </label>
              <div className="relative">
                <input
                  type="date"
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                />
                <Calendar className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
              </div>
            </div>
            
            <div className="flex items-end space-x-2">
              <button
                onClick={() => { setSearchTerm(''); setDateFilter(''); setCurrentPage(1); }}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Reset
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    {/* Data Table (seragam Poskas) */}
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 mt-4">
      <div className="px-6 py-3 border-b border-gray-100 flex items-center justify-between">
        <h2 className="text-base font-semibold text-gray-900">Data Laporan Keuangan ({totalItems} item)</h2>
        <div className="flex items-center gap-3">
          {selectedItems.length > 0 && (
            <button
              onClick={handleBulkDelete}
              className="inline-flex items-center gap-2 px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
            >
              <Trash2 className="h-4 w-4" />
              <span>Hapus ({selectedItems.length})</span>
            </button>
          )}
            <button
              onClick={() => { loadLaporanKeuangan(); loadStats(); }}
              className="inline-flex items-center gap-2 px-3 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
            >
              <RefreshCw className="h-4 w-4" />
              <span>Refresh</span>
            </button>
            <div className="relative">
              <button
                onClick={() => setShowBulkMenu(v => !v)}
                aria-label="Aksi massal"
                className="inline-flex items-center justify-center w-9 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50"
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
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="sticky top-0 bg-red-700 z-10">
              <tr>
                <th className="pl-6 pr-0 py-3 text-left text-xs font-extrabold text-white uppercase tracking-wider">
                  <input
                    type="checkbox"
                    checked={selectedItems.length === laporanKeuangan.length && laporanKeuangan.length > 0}
                    onChange={handleSelectAll}
                    className="rounded border-white text-white focus:ring-white"
                  />
                </th>
                <th className="pl-0 pr-12 py-3 text-left text-sm md:text-base font-extrabold text-white uppercase tracking-wider">Tanggal</th>
                <th className="px-12 py-3 text-left text-sm md:text-base font-extrabold text-white uppercase tracking-wider">Judul</th>
                <th className="px-12 py-3 text-left text-sm md:text-base font-extrabold text-white uppercase tracking-wider">User</th>
                <th className="px-12 py-3 text-left text-sm md:text-base font-extrabold text-white uppercase tracking-wider">Dibuat</th>
                <th className="px-12 py-3 text-left text-sm md:text-base font-extrabold text-white uppercase tracking-wider">Aksi</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              {laporanKeuangan.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center text-gray-500">
                    <div className="flex flex-col items-center">
                      <DollarSign className="h-12 w-12 text-gray-300 mb-4" />
                      <p className="text-lg font-medium text-gray-900 mb-2">Tidak ada data</p>
                      <p className="text-gray-500">Belum ada laporan keuangan yang dibuat</p>
                    </div>
                  </td>
                </tr>
              ) : (
                laporanKeuangan.map((item) => (
                  <tr
                    key={item.id}
                    className="hover:bg-gray-50/80 cursor-pointer"
                    onClick={() => navigate(`/keuangan/laporan/${item.id}`)}
                  >
                    <td className="pl-6 pr-0 py-4 whitespace-nowrap">
                      <input
                        type="checkbox"
                        checked={selectedItems.includes(item.id)}
                        onClick={(e) => e.stopPropagation()}
                        onChange={() => handleCheckboxChange(item.id)}
                        className="rounded border-gray-300 text-red-600 focus:ring-red-500"
                      />
                    </td>
                    <td className="pl-0 pr-12 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatDate(item.tanggal_laporan)}
                    </td>
                    <td className="px-12 py-4">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {extractTitle(item.isi_laporan)}
                        </div>
                        <div className="text-sm text-gray-500">
                          {truncateContent(item.isi_laporan)}
                        </div>
                      </div>
                    </td>
                    <td className="px-12 py-4 whitespace-nowrap text-sm text-gray-900">
                      {item.user_nama || 'Unknown'}
                    </td>
                    <td className="px-12 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDateTime(item.created_at)}
                    </td>
                    <td className="px-12 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center gap-3">
                        <Link
                          to={`/keuangan/laporan/${item.id}`}
                          onClick={(e) => e.stopPropagation()}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          <Eye className="h-4 w-4" />
                        </Link>
                        <Link
                          to={`/keuangan/laporan/${item.id}/edit`}
                          onClick={(e) => e.stopPropagation()}
                          className="text-green-600 hover:text-green-900"
                        >
                          <Edit className="h-4 w-4" />
                        </Link>
                        <button
                          onClick={(e) => { e.stopPropagation(); handleDelete(item.id); }}
                          className="text-red-600 hover:text-red-900"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-6 py-4 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-700">
                Menampilkan {((currentPage - 1) * 10) + 1} sampai {Math.min(currentPage * 10, totalItems)} dari {totalItems} item
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Sebelumnya
                </button>
                <span className="px-3 py-2 text-sm text-gray-700">
                  Halaman {currentPage} dari {totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
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
};

export default LaporanKeuangan;