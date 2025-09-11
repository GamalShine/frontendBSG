import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../../../contexts/AuthContext';
import { ownerAnekaGrafikService } from '../../../../services/anekaGrafikService';
import { toast } from 'react-hot-toast';
import { API_CONFIG } from '../../../../config/constants';
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
  Target
} from 'lucide-react';

const OwnerAnekaGrafikList = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [anekaGrafik, setAnekaGrafik] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [stats, setStats] = useState({});
  const [selectedItems, setSelectedItems] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [activeTab, setActiveTab] = useState('omzet');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    if (user) {
      loadAnekaGrafik();
      loadStats();
    }
  }, [user, currentPage, searchTerm, dateFilter, activeTab]); // Tambahkan activeTab ke dependency

  const loadAnekaGrafik = async () => {
    try {
      setLoading(true);
      const response = await ownerAnekaGrafikService.getAllAnekaGrafik(
        currentPage,
        10,
        searchTerm,
        dateFilter
      );
      
      if (response.success) {
        // Filter data berdasarkan activeTab
        let filteredData = [];
        if (response.data && Array.isArray(response.data)) {
          // Flatten hierarchical data first
          const flattenedData = [];
          response.data.forEach(parent => {
            flattenedData.push(parent); // Add parent
            if (parent.children && parent.children.length > 0) {
              flattenedData.push(...parent.children); // Add children
            }
          });
          
          console.log('📊 Total data after flattening:', flattenedData.length);
          console.log('🏷️ Active tab:', activeTab);
          console.log('📋 Sample categories:', flattenedData.slice(0, 5).map(item => item.category));
          
          // Filter berdasarkan kategori yang dipilih
          if (activeTab && activeTab !== 'all') {
            filteredData = flattenedData.filter(item => {
              if (!item.category) return false;
              
              // Normalize category names for comparison
              const itemCategory = item.category.toLowerCase().replace(/[_\s]/g, '');
              const activeCategory = activeTab.toLowerCase().replace(/[_\s]/g, '');
              
              return itemCategory === activeCategory;
            });
            
            console.log('🔍 Filtered data count:', filteredData.length);
            console.log('🔍 Filter criteria:', { activeTab, activeCategory: activeTab.toLowerCase().replace(/[_\s]/g, '') });
          } else {
            filteredData = flattenedData;
            console.log('📋 Showing all data (no filter)');
          }
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
      const response = await ownerAnekaGrafikService.getStats();
      if (response.success) {
        setStats(response.data);
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
    
    if (item.photo_url) {
      if (item.photo_url.startsWith('http')) {
        return item.photo_url;
      } else if (item.photo_url.startsWith('/')) {
        return new URL(item.photo_url, API_CONFIG.BASE_URL).toString();
      } else {
        return new URL(`/uploads/${item.photo_url}`, API_CONFIG.BASE_URL).toString();
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

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header - match Omset Harian style */}
      <div className="bg-red-800 text-white px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span className="text-sm font-semibold bg-white/10 rounded px-2 py-1">H01-S4</span>
            <div>
              <h1 className="text-xl md:text-2xl font-extrabold tracking-tight">ANEKA GRAFIK</h1>
              <p className="text-sm text-red-100">Kelola daftar grafik keuangan</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowFilters(v => !v)}
              className="px-4 py-2 rounded-full border border-white/60 text-white hover:bg-white/10"
              aria-pressed={showFilters}
            >
              PENCARIAN
            </button>
            <Link
              to="/owner/keuangan/aneka-grafik/new"
              className="inline-flex items-center gap-2 px-4 py-2 bg-white text-red-700 rounded-lg hover:bg-red-50 transition-colors shadow-sm"
            >
              <Plus className="h-4 w-4" />
              <span className="font-semibold">Tambah</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Info bar */}
      <div className="bg-gray-200 px-6 py-2">
        <p className="text-sm text-gray-600">Terakhir diupdate: {lastUpdatedText}</p>
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
                  onClick={() => { setSearchTerm(''); setDateFilter(''); }}
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

      {/* Navigation Tabs */}
      <div className="bg-white px-6 py-3 border-b border-gray-200">
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

      {/* Main Content - Side by Side */}
      <div className="flex gap-6 p-6 h-[calc(100vh-280px)]">
        {/* Aneka Grafik List - Left Side */}
        <div className="w-1/2 bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
          <div className="p-4 border-b border-gray-200 bg-gray-50">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-gray-900 flex items-center">
                <BarChart3 className="w-5 h-5 mr-2 text-red-600" />
                Daftar Aneka Grafik
              </h3>
              <button
                onClick={handleRefresh}
                className="px-4 py-2 text-sm rounded-lg bg-red-600 text-white hover:bg-red-700 transition-colors flex items-center"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh
              </button>
            </div>
          </div>
          
          <div className="p-4 overflow-y-auto max-h-[calc(100vh-400px)]">
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
        <div className="w-1/2 bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
          <div className="p-4 border-b border-gray-200 bg-gray-50">
            <h3 className="text-lg font-bold text-gray-900 flex items-center">
              <Target className="w-5 h-5 mr-2 text-red-600" />
              Detail Grafik
            </h3>
          </div>
          
          <div className="p-4 h-full">
            {selectedItem ? (
              <div className="h-full flex flex-col">
                <div className="mb-4">
                  <h4 className="text-xl font-bold text-gray-900 mb-2">
                    {selectedItem.name}
                  </h4>
                  <p className="text-sm text-gray-600">
                    Kategori: {selectedItem.category || activeTab}
                  </p>
                </div>
                
                <div className="flex-1 bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg overflow-hidden border border-gray-200">
                  <img
                    src={getPhotoUrl(selectedItem)}
                    alt={selectedItem.name || 'Aneka Grafik Photo'}
                    className="w-full h-full object-cover"
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
    </div>
  );
};

export default OwnerAnekaGrafikList; 
