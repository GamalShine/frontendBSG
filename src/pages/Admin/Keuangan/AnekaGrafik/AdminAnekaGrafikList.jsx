import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../../contexts/AuthContext';
import { anekaGrafikService } from '../../../../services/anekaGrafikService';
import { toast } from 'react-hot-toast';
import { API_CONFIG } from '../../../../config/constants';
import { MENU_CODES } from '@/config/menuCodes';
import { 
  Plus, 
  Search, 
  Calendar, 
  Filter,
  Eye,
  Edit,
  Trash2,
  RefreshCw,
  BarChart3,
  TrendingUp,
  FileText,
  User,
  Clock,
  X,
  ChevronRight,
  Award,
  Share2,
  Copy,
  Download,
  MoreHorizontal,
  ChevronDown,
  ChevronUp,
  Maximize2,
  Target
} from 'lucide-react';
import AdminAnekaGrafikForm from './AdminAnekaGrafikForm';

const AdminAnekaGrafikList = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [anekaGrafik, setAnekaGrafik] = useState([]);
  const [rawAnekaGrafik, setRawAnekaGrafik] = useState([]); // data mentah (flattened) untuk mobile accordion
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [stats, setStats] = useState({});
  const [selectedItems, setSelectedItems] = useState([]);
  const [mobileExpanded, setMobileExpanded] = useState({}); // {kategori: true}
  const [mobileOpenItems, setMobileOpenItems] = useState({}); // {id: true}
  const [previewUrl, setPreviewUrl] = useState('');
  const [selectedItem, setSelectedItem] = useState(null);
  const [activeTab, setActiveTab] = useState('omzet');
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  useEffect(() => {
    if (user) {
      loadAnekaGrafik();
      loadStats();
    }
  }, [user, currentPage, searchTerm, dateFilter, activeTab]); // Tambahkan activeTab ke dependency

  const loadAnekaGrafik = async () => {
    try {
      setLoading(true);
      const response = await anekaGrafikService.getAllAnekaGrafik(
        currentPage,
        10,
        searchTerm,
        dateFilter
      );
      
      if (response.success) {
        // Flatten hierarchical data terlebih dahulu
        let flattenedData = [];
        if (response.data && Array.isArray(response.data)) {
          response.data.forEach(parent => {
            flattenedData.push(parent);
            if (parent.children && parent.children.length > 0) {
              flattenedData.push(...parent.children);
            }
          });
        }

        // Client-side text filter (seperti AnekaSurat): cocokkan judul/nama atau kategori
        const q = (searchTerm || '').trim().toLowerCase();
        const textMatches = (item) => {
          if (!q) return true;
          const name = String(item.name || '').toLowerCase();
          const cat = String(item.category || '').toLowerCase();
          const isi = String(item.isi_grafik || '').toLowerCase();
          const userNama = String(item.user_nama || '').toLowerCase();
          const tanggalStr = item.tanggal_grafik
            ? new Date(item.tanggal_grafik).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' }).toLowerCase()
            : '';
          const createdStr = item.created_at
            ? new Date(item.created_at).toLocaleString('id-ID', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' }).toLowerCase()
            : '';
          return (
            name.includes(q) ||
            cat.includes(q) ||
            isi.includes(q) ||
            userNama.includes(q) ||
            tanggalStr.includes(q) ||
            createdStr.includes(q)
          );
        };
        const flattenedFiltered = flattenedData.filter(textMatches);

        // Simpan untuk mobile accordion (pakai data yang sudah difilter)
        setRawAnekaGrafik(flattenedFiltered);

        // Filter data berdasarkan activeTab untuk tampilan desktop (list kiri)
        let filteredData = [];
        if (activeTab && activeTab !== 'all') {
          filteredData = flattenedFiltered.filter(item => {
            if (!item.category) return false;
            const itemCategory = item.category.toLowerCase().replace(/[_\s]/g, '');
            const activeCategory = activeTab.toLowerCase().replace(/[_\s]/g, '');
            return itemCategory === activeCategory;
          });
        } else {
          filteredData = flattenedFiltered;
        }

        setAnekaGrafik(filteredData);
        setTotalPages(response.pagination?.totalPages || 1);
        setTotalItems(filteredData.length);
      } else {
        toast.error(response.message || 'Gagal memuat data aneka grafik');
      }
    } catch (error) {
      console.error('Error loading aneka grafik:', error);
      if (error.response?.status === 404) {
        toast.error('Endpoint tidak ditemukan. Pastikan backend berjalan.');
      } else if (error.response?.status === 500) {
        toast.error('Error server. Cek backend logs.');
      } else {
        toast.error('Gagal memuat data aneka grafik');
      }
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const response = await anekaGrafikService.getStats();
      if (response.success) {
        setStats(response.data || {});
      }
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const getCurrentData = () => {
    if (loading) return [];
    return anekaGrafik || [];
  };

  const getPhotoUrl = (item) => {
    if (!item) return '';
    // Resolve base host: prefer absolute BASE_URL, else fallback to window.location.origin
    const baseHost = (() => {
      const base = API_CONFIG.BASE_URL || '';
      if (typeof base === 'string' && /^https?:\/\//i.test(base)) {
        // strip trailing /api if present
        return base.replace(/\/?api\/?$/, '');
      }
      // use provided BASE_HOST if valid, else window origin
      const host = (API_CONFIG.BASE_HOST || '').trim();
      return host || window.location.origin;
    })();

    if (item.photo_url) {
      if (item.photo_url.startsWith('http')) {
        return item.photo_url;
      } else if (item.photo_url.startsWith('/')) {
        // Absolute path on backend host (e.g. "/uploads/..." from DB)
        return new URL(item.photo_url, baseHost).toString();
      } else {
        return new URL(`/uploads/${item.photo_url}`, baseHost).toString();
      }
    }
    
    // Fallback image
    return 'https://placehold.co/400x300?text=Aneka+Grafik';
  };

  // Helper untuk format tanggal-waktu lokal ID
  const formatDateTime = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Terakhir diupdate diambil dari entri terbaru (diasumsikan urutan data desc)
  const lastUpdatedText = useMemo(() => {
    if (!anekaGrafik || anekaGrafik.length === 0) return '-';
    const latest = anekaGrafik[0];
    const dt = latest?.created_at || latest?.tanggal_grafik;
    return formatDateTime(dt);
  }, [anekaGrafik]);

  // Group data by category for mobile accordion
  const groupedByCategory = useMemo(() => {
    const out = {};
    (rawAnekaGrafik || []).forEach(item => {
      const cat = (item.category || 'LAINNYA').toUpperCase().replace(/[_\s]+/g, ' ');
      if (!out[cat]) out[cat] = [];
      out[cat].push(item);
    });
    return out;
  }, [rawAnekaGrafik]);

  const toggleMobileCat = (cat) => {
    setMobileExpanded(prev => ({ ...prev, [cat]: !prev[cat] }));
  };

  const normalizeCat = (c) => (c || 'LAINNYA').toUpperCase().replace(/[_\s]+/g, ' ');

  const handleAdd = () => {
    setEditingItem(null);
    setShowForm(true);
  };

  const handleEdit = (item) => {
    setEditingItem(item);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Apakah Anda yakin ingin menghapus aneka grafik ini?')) {
      return;
    }

    try {
      const response = await anekaGrafikService.deleteAnekaGrafik(id);
      if (response.success) {
        toast.success('Aneka grafik berhasil dihapus');
        loadAnekaGrafik();
        if (selectedItem && selectedItem.id === id) {
          setSelectedItem(null);
        }
      } else {
        toast.error(response.message || 'Gagal menghapus aneka grafik');
      }
    } catch (error) {
      console.error('Error deleting aneka grafik:', error);
      toast.error('Gagal menghapus aneka grafik');
    }
  };

  const handleFormClose = () => {
    setShowForm(false);
    setEditingItem(null);
  };

  const handleFormSuccess = () => {
    setShowForm(false);
    setEditingItem(null);
    loadAnekaGrafik();
    toast.success('Aneka grafik berhasil disimpan');
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const handleDateFilter = (e) => {
    setDateFilter(e.target.value);
    setCurrentPage(1);
  };

  const handleRefresh = () => {
    loadAnekaGrafik();
    loadStats();
  };

  // Reset filters to defaults to match unified header actions
  const resetFilters = () => {
    setSearchTerm('');
    setDateFilter('');
    setActiveTab('all');
    setCurrentPage(1);
  };

  const handleBulkDelete = async () => {
    if (selectedItems.length === 0) {
      toast.error('Pilih item yang akan dihapus');
      return;
    }

    if (!window.confirm(`Hapus ${selectedItems.length} item yang dipilih?`)) {
      return;
    }

    try {
      const deletePromises = selectedItems.map(id => anekaGrafikService.deleteAnekaGrafik(id));
      await Promise.all(deletePromises);
      toast.success(`${selectedItems.length} item berhasil dihapus`);
      setSelectedItems([]);
      loadAnekaGrafik();
    } catch (error) {
      console.error('Error bulk deleting:', error);
      toast.error('Gagal menghapus beberapa item');
    }
  };

  const handleSelectAll = () => {
    if (selectedItems.length === getCurrentData().length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(getCurrentData().map(item => item.id));
    }
  };

  const handleSelectItem = (id) => {
    setSelectedItems(prev => 
      prev.includes(id) 
        ? prev.filter(itemId => itemId !== id)
        : [...prev, id]
    );
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header - unified style */}
      <div className="bg-red-800 text-white px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span className="text-sm font-semibold bg-white/10 rounded px-2 py-1">{MENU_CODES.keuangan.anekaGrafik}</span>
            <div>
              <h1 className="text-xl md:text-2xl font-extrabold tracking-tight">ANEKA GRAFIK</h1>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {/* Tombol Tambah: disembunyikan di mobile, tetap ada di desktop */}
            <button
              onClick={handleAdd}
              className="hidden md:inline-flex items-center gap-2 px-4 py-2 bg-white text-red-700 rounded-lg hover:bg-red-50 transition-colors shadow-sm"
            >
              <Plus className="h-4 w-4" />
              <span className="font-semibold">Tambah</span>
            </button>
            {/* Target tersembunyi untuk FAB (mobile) */}
            {!showForm && (
              <button
                type="button"
                data-add
                onClick={handleAdd}
                className="block md:hidden absolute w-px h-px -left-[9999px] opacity-0"
                aria-hidden="true"
                tabIndex={-1}
              >Tambah</button>
            )}
          </div>
        </div>
      </div>

      {/* Last Update Info */}
      <div className="bg-gray-200 px-6 py-2 mb-2 lg:mb-0">
        <p className="text-sm text-gray-900">
          Terakhir diupdate: {lastUpdatedText}
        </p>
      </div>

      {/* Pencarian - gaya seperti Aneka Surat */}
      <div className="bg-white rounded-none md:rounded-xl shadow-sm border border-gray-100 mt-4 mb-4 mx-4 md:mx-6">
        <div className="px-6 py-4">
          <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Cari Aneka Grafik</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Cari judul atau kategori grafik..."
                  value={searchTerm}
                  onChange={handleSearch}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-red-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters - desktop only */}
      <div className="hidden bg-white rounded-none md:rounded-xl shadow-sm border border-gray-100 my-4">
        <div className="px-6 py-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Cari</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Cari aneka grafik..."
                  value={searchTerm}
                  onChange={handleSearch}
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
                  onChange={handleDateFilter}
                  className="pl-10 pr-3 py-2 w-full border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-red-500 focus:border-transparent"
                />
              </div>
            </div>
            <div className="flex items-end">
              <button
                onClick={resetFilters}
                className="inline-flex items-center gap-2 px-5 py-2 rounded-full border border-red-600 text-red-700 hover:bg-red-50 transition-colors"
              >
                <RefreshCw className="h-4 w-4" />
                <span className="font-semibold">Reset</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs - desktop only */}
      <div className="hidden lg:block bg-white px-6 py-3 border-b border-gray-200">
        <div className="flex space-x-2">
          {['all', 'omzet', 'bahan_baku', 'gaji_bonus_ops', 'gaji', 'bonus', 'operasional'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === tab
                  ? 'bg-red-600 text-white shadow-md'
                  : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
              }`}
            >
              {tab === 'all' ? 'SEMUA' :
               tab === 'omzet' ? 'OMZET' : 
               tab === 'bahan_baku' ? 'BAHAN BAKU' : 
               tab === 'gaji_bonus_ops' ? 'GAJI BONUS OPS' : 
               tab === 'gaji' ? 'GAJI' :
               tab === 'bonus' ? 'BONUS' : 'OPERASIONAL'}
            </button>
          ))}
        </div>
      </div>

      {/* Mobile Accordion (only) */}
      <div className="lg:hidden px-0 py-2 space-y-2">
        {Object.keys(groupedByCategory).map((cat) => (
          <div key={cat} className="border-y border-gray-200 rounded-none overflow-visible bg-white">
            {/* Header merah */}
            <button
              type="button"
              onClick={() => toggleMobileCat(cat)}
              className="w-full flex items-center justify-between px-4 py-3 bg-red-700 text-white rounded-none"
            >
              <span className="font-extrabold tracking-wide">{cat} - {groupedByCategory[cat]?.length || 0} item</span>
              <span className="opacity-90">{mobileExpanded[cat] ? '▴' : '▾'}</span>
            </button>
            {/* Body */}
            {mobileExpanded[cat] && (
              <div className="px-0 py-0 space-y-0 bg-gray-100">
                {/* Daftar judul item dalam kategori */}
                <div className="divide-y divide-gray-200 rounded-none border-y border-gray-200 overflow-hidden bg-gray-100">
                  {groupedByCategory[cat].map((item) => (
                    <div key={item.id} className="bg-gray-100">
                      <button
                        type="button"
                        className="w-full text-left px-3 py-2 flex items-center justify-between bg-gray-100"
                        onClick={() => setMobileOpenItems(prev => ({ ...prev, [item.id]: !prev[item.id] }))}
                      >
                        <span className="truncate pr-3 font-medium text-gray-900">{item.name || 'Aneka Grafik'}</span>
                        <ChevronRight className="w-4 h-4 text-gray-400" />
                      </button>
                      {mobileOpenItems[item.id] && (
                        <div className="border-t border-gray-200">
                          <div className="border-y border-gray-200 rounded-none overflow-hidden">
                            <img
                              src={getPhotoUrl(item)}
                              alt={item.name || 'Aneka Grafik'}
                              className="w-full h-52 object-cover cursor-zoom-in"
                              onClick={() => setPreviewUrl(getPhotoUrl(item))}
                              onError={(e) => { e.target.onerror = null; e.target.src = 'https://placehold.co/400x300?text=No+Image'; }}
                            />
                            <div className="pl-3 pr-0 py-0.5 flex items-center justify-between text-xs text-gray-600 bg-white">
                              <span>{formatDateTime(item.created_at || item.tanggal_grafik)}</span>
                              <div className="flex items-center gap-0 pr-0">
                                <button
                                  className="text-green-600 hover:text-green-700 mr-0 pr-0"
                                  title="Edit"
                                  type="button"
                                  onClick={() => handleEdit(item)}
                                >
                                  <Edit className="w-4 h-4" />
                                </button>
                                <button
                                  className="text-red-600 hover:text-red-700 ml-0 pl-0 mr-0 pr-0"
                                  title="Hapus"
                                  type="button"
                                  onClick={() => handleDelete(item.id)}
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Main Content - Responsive (desktop only) */}
      <div className="hidden lg:flex lg:gap-6 lg:p-6 lg:h-[calc(100vh-280px)] space-y-4 lg:space-y-0">
        {/* Aneka Grafik List - Left Side */}
        <div className="w-full lg:w-1/2 bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
          <div className="p-4 border-b border-gray-200 bg-gray-50">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-gray-900 flex items-center">
                <BarChart3 className="w-5 h-5 mr-2 text-red-600" />
                Daftar Aneka Grafik
              </h3>
              {/* Tombol "+ Tambah Grafik" dihilangkan (mobile & desktop) sesuai permintaan */}
            </div>
          </div>
          
          <div className="p-4 overflow-y-auto max-h-96 lg:max-h-[calc(100vh-400px)]">
            <div className="space-y-3">
              {loading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600 mx-auto"></div>
                  <p className="text-gray-500 mt-2">Memuat data...</p>
                </div>
              ) : getCurrentData().length === 0 ? (
                <div className="text-center py-8">
                  <BarChart3 className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                  <p className="text-gray-500">Tidak ada data aneka grafik</p>
                </div>
              ) : (
                getCurrentData().map((item, index) => (
                  <div
                    key={index}
                    onClick={() => setSelectedItem(item)}
                    className={`p-4 rounded-lg cursor-pointer transition-all duration-200 border ${
                      selectedItem === item
                        ? 'bg-red-600 text-white border-red-600 shadow-lg'
                        : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-sm">{item.name}</span>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={(e) => { e.stopPropagation(); handleEdit(item); }}
                          className={`p-1.5 rounded border transition-colors ${
                            selectedItem === item 
                              ? 'border-white text-white hover:bg-red-500' 
                              : 'border-gray-300 text-gray-700 hover:bg-gray-100'
                          }`}
                          title="Edit"
                        >
                          <Edit className="w-3 h-3" />
                        </button>
                        <button
                          onClick={(e) => handleDelete(item.id)}
                          className={`p-1.5 rounded border transition-colors ${
                            selectedItem === item 
                              ? 'border-white text-white hover:bg-red-500' 
                              : 'border-red-300 text-red-600 hover:bg-red-50'
                          }`}
                          title="Hapus"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                        <div className={`transition-transform ${selectedItem === item ? 'rotate-90' : ''}`}>
                          {selectedItem === item ? (
                            <ChevronDown className="w-4 h-4" />
                          ) : (
                            <ChevronRight className="w-4 h-4" />
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Photo Display - Right Side */}
        <div className="w-full lg:w-1/2 bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
          <div className="p-4 border-b border-gray-200 bg-gray-50">
            <h3 className="text-lg font-bold text-gray-900 flex items-center">
              <Target className="w-5 h-5 mr-2 text-red-600" />
              Detail Grafik
            </h3>
          </div>
          
          <div className="p-4 h-full">
            {selectedItem ? (
              <div className="h-full flex flex-col">
                
                <div className="flex-1 bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg overflow-hidden border border-gray-200">
                  <img
                    src={getPhotoUrl(selectedItem)}
                    alt={selectedItem.name || 'Aneka Grafik Photo'}
                    className="w-full h-full object-cover cursor-zoom-in"
                    onClick={() => setPreviewUrl(getPhotoUrl(selectedItem))}
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = 'https://placehold.co/400x300?text=No+Image';
                    }}
                  />
                </div>
              </div>
            ) : (
              <div className="h-full flex items-center justify-center">
                <div className="text-center">
                  <div className="w-24 h-24 mx-auto mb-4 bg-gradient-to-br from-red-100 to-red-200 rounded-full flex items-center justify-center">
                    <Award className="w-12 h-12 text-red-600" />
                  </div>
                  <h4 className="text-xl font-bold text-gray-800 mb-2">Pilih Grafik</h4>
                  <p className="text-gray-500 text-sm">Klik item di sebelah kiri untuk melihat detail foto</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Form Modal */}
      {showForm && (
        <AdminAnekaGrafikForm
          isEdit={!!editingItem}
          anekaGrafikData={editingItem}
          onClose={handleFormClose}
          onSuccess={handleFormSuccess}
        />
      )}

      {/* Preview Modal */}
      {previewUrl && (
        <div className="fixed inset-0 z-[2000] flex items-center justify-center">
          <button
            className="absolute inset-0 bg-black/70"
            aria-label="Tutup preview"
            onClick={() => setPreviewUrl('')}
          />
          <div className="relative z-[2001] max-w-[95vw] max-h-[90vh]">
            <img
              src={previewUrl}
              alt="Preview"
              className="w-auto h-auto max-w-[95vw] max-h-[90vh] object-contain rounded-lg shadow-2xl"
              onError={(e) => { e.target.onerror = null; e.target.src = 'https://placehold.co/800x600?text=No+Image'; }}
            />
            <button
              onClick={() => setPreviewUrl('')}
              className="absolute -top-3 -right-3 bg-white text-gray-700 rounded-full w-8 h-8 flex items-center justify-center shadow-md"
              aria-label="Tutup"
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminAnekaGrafikList;
