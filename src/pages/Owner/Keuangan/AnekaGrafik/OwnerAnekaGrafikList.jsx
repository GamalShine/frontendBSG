import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
      {/* Header - Dark Red (WhatsApp-like) */}
      <div className="bg-red-800 text-white">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <button className="p-2 text-white hover:bg-red-700 rounded-full transition-colors">
                <ChevronRight className="h-5 w-5 rotate-180" />
              </button>
              <div>
                <div className="text-xs font-medium text-red-200">H01-S4</div>
                <div className="text-lg font-bold">Aneka Grafik</div>
              </div>
            </div>
            <button className="p-2 text-white hover:bg-red-700 rounded-full transition-colors">
              <div className="w-1 h-1 bg-white rounded-full mb-1"></div>
              <div className="w-1 h-1 bg-white rounded-full mb-1"></div>
              <div className="w-1 h-1 bg-white rounded-full"></div>
            </button>
          </div>
        </div>
      </div>

      {/* Last Update Info */}
      <div className="bg-gray-200 px-6 py-2">
        <p className="text-sm text-gray-600">
          Data terakhir diupdate: {new Date().toLocaleDateString('id-ID', { 
            day: 'numeric', 
            month: 'long', 
            year: 'numeric' 
          })} pukul {new Date().toLocaleTimeString('id-ID', { 
            hour: '2-digit', 
            minute: '2-digit' 
          })}
        </p>
      </div>

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
                        <button
                          onClick={(e) => { e.stopPropagation(); navigate(`/owner/keuangan/aneka-grafik/${item.id}`); }}
                          className={`p-1.5 rounded border transition-colors ${
                            selectedItem === item 
                              ? 'border-white text-white hover:bg-red-500' 
                              : 'border-gray-300 text-gray-700 hover:bg-gray-100'
                          }`}
                          title="View"
                        >
                          <Eye className="w-3 h-3" />
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
