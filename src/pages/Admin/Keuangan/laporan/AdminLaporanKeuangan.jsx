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
  DollarSign
} from 'lucide-react';
import LoadingSpinner from '../../../../components/UI/LoadingSpinner';
import { MENU_CODES } from '@/config/menuCodes';

const AdminLaporanKeuangan = () => {
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

  // Format preview HTML: remove unsafe tags and image placeholders, keep strong/em/u/br
  const formatPreviewHtml = (content) => {
    if (!content) return '';
    let html = String(content);
    // Remove image placeholders
    html = html.replace(/\[IMG:\d+\]/g, '');
    // Normalize <b>/<i> tags
    html = html.replace(/<\s*b\s*>/gi, '<strong>')
               .replace(/<\s*\/\s*b\s*>/gi, '</strong>')
               .replace(/<\s*i\s*>/gi, '<em>')
               .replace(/<\s*\/\s*i\s*>/gi, '</em>');
    // Temporarily protect allowed tags
    const p = {
      so: '%%STRONG_O%%', sc: '%%STRONG_C%%',
      eo: '%%EM_O%%', ec: '%%EM_C%%',
      uo: '%%U_O%%', uc: '%%U_C%%',
      br: '%%BR%%'
    };
    html = html.replace(/<strong>/gi, p.so)
               .replace(/<\/strong>/gi, p.sc)
               .replace(/<em>/gi, p.eo)
               .replace(/<\/em>/gi, p.ec)
               .replace(/<u>/gi, p.uo)
               .replace(/<\/u>/gi, p.uc)
               .replace(/<br\s*\/?\s*>/gi, p.br);
    // Strip other tags
    html = html.replace(/<[^>]*>/g, '');
    // Restore allowed
    html = html.replace(new RegExp(p.so, 'g'), '<strong>')
               .replace(new RegExp(p.sc, 'g'), '</strong>')
               .replace(new RegExp(p.eo, 'g'), '<em>')
               .replace(new RegExp(p.ec, 'g'), '</em>')
               .replace(new RegExp(p.uo, 'g'), '<u>')
               .replace(new RegExp(p.uc, 'g'), '</u>')
               .replace(new RegExp(p.br, 'g'), '<br>');
    // Sanitize basic
    html = html.replace(/<script.*?>[\s\S]*?<\/script>/gi, '');
    return html;
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

  const openMonthFolder = (year, month) => {
    const key = `${year}-${String(month).padStart(2, '0')}`;
    setMonthFilter(key);
    setCurrentPage(1);
    setMonthsView('monthContent');
  };

  const backToMonths = () => {
    setMonthsView('months');
    setMonthFilter('');
    setLaporanKeuangan([]);
    setCurrentPage(1);
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="px-0 py-2 bg-gray-50 min-h-screen">
      {/* Header + Badge Code */}
      <div className="bg-red-800 text-white p-4 mb-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span className="text-sm font-semibold bg-white/10 rounded px-2 py-1">{MENU_CODES.keuangan.laporanKeuangan}</span>
            <div>
              <h1 className="text-2xl font-bold">LAPORAN KEUANGAN</h1>
              <p className="text-sm opacity-90">Admin - Keuangan</p>
            </div>
          </div>
          <button
            onClick={() => navigate('/admin/keuangan/laporan/new')}
            className="inline-flex items-center gap-2 px-3 py-2 sm:px-4 sm:py-2 bg-white text-red-700 hover:bg-red-50 transition-colors"
          >
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">Tambah</span>
          </button>
        </div>
      </div>
      <div className="bg-gray-200 px-4 py-2 text-xs text-gray-600 -mt-1 mb-4">
        Terakhir diupdate: {new Date().toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric'})}
        {' '}pukul {new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit'})}
      </div>

      {/* Months Folder Grid */}
      {monthsView === 'months' && (
        <div className="bg-white shadow-sm border mb-4">
          <div className="p-3 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Pilih Bulan</h2>
            {loading && <div className="text-sm text-gray-600">Memuat daftar bulan...</div>}
            {!loading && availableMonths.length === 0 && (
              <div className="text-sm text-gray-600">Belum ada data bulan tersedia</div>
            )}
            {!loading && availableMonths.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
                {availableMonths.map(({ year, month }) => {
                  const label = new Date(year, month - 1, 1).toLocaleDateString('id-ID', { month: 'long', year: 'numeric' });
                  return (
                    <div
                      key={`${year}-${month}`}
                      className="group p-4 bg-white cursor-pointer ring-1 ring-gray-200 hover:ring-red-300 hover:shadow transition-all"
                      onClick={() => openMonthFolder(year, month)}
                    >
                      <div className="flex items-center space-x-2">
                        <div className="w-10 h-10 bg-yellow-100 flex items-center justify-center text-yellow-700 font-bold">{month}</div>
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
      <div className="bg-white shadow-sm border">
        <div className="bg-red-800 text-white px-4 py-3">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold">{formatMonthHeader(monthFilter)}</h2>
              <p className="text-xs opacity-90">Data Laporan Keuangan ({totalItems} item)</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => navigate('/admin/keuangan/laporan/new')}
                className="bg-white border-red-600 text-red-700 hover:bg-red-50 inline-flex items-center gap-2 px-3 py-2"
              >
                <Plus className="h-4 w-4" /> Tambah
              </button>
              <button
                onClick={backToMonths}
                className="bg-white border-red-600 text-red-700 hover:bg-red-50 inline-flex items-center gap-2 px-3 py-2"
              >
                Kembali
              </button>
            </div>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <input
                    type="checkbox"
                    checked={selectedItems.length === laporanKeuangan.length && laporanKeuangan.length > 0}
                    onChange={handleSelectAll}
                    className="rounded border-gray-300 text-red-600 focus:ring-red-500"
                  />
                </th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">
                  Tanggal
                </th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">
                  Judul
                </th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">
                  Dibuat
                </th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
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
                Object.entries(groupByMonth(laporanKeuangan))
                  .sort((a, b) => b[0].localeCompare(a[0]))
                  .map(([monthKey, items]) => (
                    <React.Fragment key={monthKey}>
                      <tr>
                        <td colSpan="6" className="bg-gray-50 px-6 py-3 text-sm font-semibold text-gray-700">
                          {formatMonthHeader(monthKey)}
                        </td>
                      </tr>
                      {items.map((item) => (
                        <tr key={item.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <input
                              type="checkbox"
                              checked={selectedItems.includes(item.id)}
                              onChange={() => handleCheckboxChange(item.id)}
                              className="rounded border-gray-300 text-red-600 focus:ring-red-500"
                            />
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {formatDate(item.tanggal_laporan)}
                          </td>
                          <td className="px-6 py-4">
                            <div>
                              <div className="text-sm font-medium text-gray-900">
                                {item.judul_laporan && item.judul_laporan.trim() !== ''
                                  ? item.judul_laporan
                                  : extractTitle(item.isi_laporan)}
                              </div>
                              <div
                                className="text-sm text-gray-500 md:truncate max-w-[40ch]"
                                dangerouslySetInnerHTML={{ __html: formatPreviewHtml(item.isi_laporan) }}
                              />
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {item.user_nama || 'Unknown'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {formatDateTime(item.created_at)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex items-center space-x-2">
                              <Link
                                to={`/admin/keuangan/laporan/${item.id}`}
                                className="text-blue-600 hover:text-blue-900"
                              >
                                <Eye className="h-4 w-4" />
                              </Link>
                              <Link
                                to={`/admin/keuangan/laporan/${item.id}/edit`}
                                className="text-green-600 hover:text-green-900"
                              >
                                <Edit className="h-4 w-4" />
                              </Link>
                              <button
                                onClick={() => handleDelete(item.id)}
                                className="text-red-600 hover:text-red-900"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </React.Fragment>
                  ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-3 py-2 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-700">
                Menampilkan {((currentPage - 1) * 10) + 1} sampai {Math.min(currentPage * 10, totalItems)} dari {totalItems} item
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-2 border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Sebelumnya
                </button>
                <span className="px-3 py-2 text-sm text-gray-700">
                  Halaman {currentPage} dari {totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-2 border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Selanjutnya
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
      )}
    </div>
  );
};

export default AdminLaporanKeuangan;