import React, { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-hot-toast';
import { useAuth } from '../../../../contexts/AuthContext';
import { kpiService } from '../../../../services/kpiService';
import { API_CONFIG } from '../../../../config/constants';
import {
  Award,
  BarChart3,
  Users,
  Target,
  X,
  ChevronRight,
  ChevronDown,
  Edit3,
  Trash2
} from 'lucide-react';
import { MENU_CODES } from '@/config/menuCodes';

const AdminKPI = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('divisi');
  const [selectedMonth, setSelectedMonth] = useState('April 2025');
  const [selectedItem, setSelectedItem] = useState(null);
  const [kpiData, setKpiData] = useState({
    divisi: [],
    leader: [],
    individu: []
  });
  const [loading, setLoading] = useState(false);
  // CRUD modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('create'); // 'create' | 'edit'
  const [formData, setFormData] = useState({ id: null, name: '', category: 'divisi', photo_url: '' });
  const [deletingId, setDeletingId] = useState(null);
  const [photoFile, setPhotoFile] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isSaving, setIsSaving] = useState(false);
  const [previewUrl, setPreviewUrl] = useState('');

  // Fetch KPI data from API (reusable)
  const fetchKPIData = useCallback(async () => {
    setLoading(true);
    console.log('🔄 Starting to fetch KPI data...');
    try {
      const [divisiResponse, leaderResponse, individuResponse] = await Promise.all([
        kpiService.getKPIsByCategory('divisi'),
        kpiService.getKPIsByCategory('leader'),
        kpiService.getKPIsByCategory('individu')
      ]);
      console.log('📊 API Responses:', {
        divisi: divisiResponse,
        leader: leaderResponse,
        individu: individuResponse
      });
      // kpiService returns response.data already; each variable is expected to be an array
      const newKpiData = {
        divisi: Array.isArray(divisiResponse) ? divisiResponse : (divisiResponse?.data || []),
        leader: Array.isArray(leaderResponse) ? leaderResponse : (leaderResponse?.data || []),
        individu: Array.isArray(individuResponse) ? individuResponse : (individuResponse?.data || [])
      };
      console.log('📋 Processed KPI Data:', newKpiData);
      setKpiData(newKpiData);
    } catch (error) {
      console.error('❌ Error fetching KPI data:', error);
      setKpiData({ divisi: [], leader: [], individu: [] });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchKPIData();
  }, [fetchKPIData]);

  // Debug: Log ketika komponen mount
  useEffect(() => {
    console.log('🚀 Admin KPI Component Mounted');
    console.log('👤 Current User:', user);
  }, [user]);

  // Handle preview URL lifecycle
  useEffect(() => {
    if (photoFile) {
      const url = URL.createObjectURL(photoFile);
      setPreviewUrl(url);
      return () => URL.revokeObjectURL(url);
    } else {
      setPreviewUrl('');
    }
  }, [photoFile]);

  const handleItemClick = (itemName) => {
    // Set selected item untuk menampilkan foto
    setSelectedItem(itemName);
  };

  const clearSelection = () => {
    setSelectedItem(null);
  };

  // Fungsi untuk mendapatkan data berdasarkan tab aktif
  const getCurrentData = () => {
    if (loading) return [];
    return kpiData[activeTab] || [];
  };

  // Fungsi untuk mendapatkan URL foto (aman terhadap BASE_URL tidak valid)
  const getPhotoUrl = (item) => {
    if (!item) return '';

    // Jika value sudah absolute URL
    if (typeof item === 'string') {
      return 'https://placehold.co/400x300?text=KPI+Photo';
    }

    const raw = item.photo_url;
    if (!raw) {
      return 'https://placehold.co/400x300?text=No+Image';
    }

    if (raw.startsWith('http')) {
      return raw;
    }

    // Tentukan base yang valid: BASE_HOST -> BASE_URL -> window.location.origin
    const base = (API_CONFIG && API_CONFIG.BASE_HOST && API_CONFIG.BASE_HOST.startsWith('http'))
      ? API_CONFIG.BASE_HOST
      : ((API_CONFIG && API_CONFIG.BASE_URL && API_CONFIG.BASE_URL.startsWith('http'))
          ? API_CONFIG.BASE_URL
          : (typeof window !== 'undefined' ? window.location.origin : 'http://localhost'));

    const path = raw.startsWith('/') ? raw : `/uploads/${raw}`;

    try {
      return new URL(path, base).toString();
    } catch {
      // Jika tetap gagal, fallback ke gabungan sederhana
      return `${base.replace(/\/$/, '')}${path}`;
    }
  };

  // Modal functions
  const openCreateModal = () => {
    setModalMode('create');
    setFormData({ id: null, name: '', category: activeTab, photo_url: '' });
    setPhotoFile(null);
    setPreviewUrl('');
    setIsModalOpen(true);
  };

  const openEditModal = (item) => {
    setModalMode('edit');
    setFormData({
      id: item.id,
      name: item.name || item,
      category: item.category || activeTab,
      photo_url: item.photo_url || ''
    });
    setPhotoFile(null);
    setPreviewUrl(item.photo_url ? getPhotoUrl(item) : '');
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setFormData({ id: null, name: '', category: 'divisi', photo_url: '' });
    setPhotoFile(null);
    setPreviewUrl('');
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    
    try {
      let response;
      
      if (modalMode === 'create') {
        response = await kpiService.createKPI(formData, photoFile);
        if (response.success) {
          toast.success('KPI berhasil dibuat!');
          fetchKPIData(); // Refresh data
          closeModal();
        } else {
          toast.error(response.message || 'Gagal membuat KPI');
        }
      } else {
        response = await kpiService.updateKPI(formData.id, formData, photoFile);
        if (response.success) {
          toast.success('KPI berhasil diupdate!');
          fetchKPIData(); // Refresh data
          closeModal();
        } else {
          toast.error(response.message || 'Gagal mengupdate KPI');
        }
      }
    } catch (error) {
      console.error('Error saving KPI:', error);
      toast.error('Terjadi kesalahan saat menyimpan KPI');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (item, e) => {
    e.stopPropagation();
    
    if (!window.confirm('Apakah Anda yakin ingin menghapus KPI ini?')) {
      return;
    }
    
    setDeletingId(item.id);
    
    try {
      const response = await kpiService.deleteKPI(item.id);
      if (response.success) {
        toast.success('KPI berhasil dihapus!');
        fetchKPIData(); // Refresh data
        if (selectedItem === item) {
          setSelectedItem(null);
        }
      } else {
        toast.error(response.message || 'Gagal menghapus KPI');
      }
    } catch (error) {
      console.error('Error deleting KPI:', error);
      toast.error('Terjadi kesalahan saat menghapus KPI');
    } finally {
      setDeletingId(null);
    }
  };
  
  // Format time function
  const formatTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    
    if (date.toDateString() === now.toDateString()) {
      return `Hari ini ${date.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}`;
    } else if (date.toDateString() === yesterday.toDateString()) {
      return `Kemarin ${date.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}`;
    } else {
      return `${date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })} ${date.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}`;
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header - unified style with badge */}
      <div className="bg-red-800 text-white px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span className="text-sm font-semibold bg-white/10 rounded px-2 py-1">{MENU_CODES.sdm.kpi}</span>
            <div>
              <h1 className="text-xl md:text-2xl font-extrabold tracking-tight">KPI SDM</h1>
              <p className="text-sm text-red-100">Kelola indikator kinerja SDM</p>
            </div>
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
            {['divisi', 'leader', 'individu'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
              className={`px-6 py-2 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === tab
                  ? 'bg-red-600 text-white shadow-md'
                  : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                }`}
              >
              {tab.charAt(0).toUpperCase() + tab.slice(1).toUpperCase()}
              </button>
            ))}
          </div>
        </div>

        {/* Main Content - Side by Side */}
      <div className="flex gap-6 p-6 h-[calc(100vh-280px)]">
          {/* KPI List - Left Side */}
        <div className="w-1/2 bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
          <div className="p-4 border-b border-gray-200 bg-gray-50">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-gray-900 flex items-center">
              <BarChart3 className="w-5 h-5 mr-2 text-red-600" />
              Daftar KPI
            </h3>
              <button
                onClick={openCreateModal}
                className="px-4 py-2 text-sm rounded-lg bg-red-600 text-white hover:bg-red-700 transition-colors flex items-center"
              >
                <span className="mr-1">+</span> Tambah KPI
              </button>
            </div>
          </div>
          
          <div className="p-4 overflow-y-auto max-h-[calc(100vh-400px)]">
            <div className="space-y-3">
              {getCurrentData().map((item, index) => (
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
                    <span className="font-semibold text-sm">
                      {typeof item === 'string' ? item : item?.name}
                    </span>
                    <div className="flex items-center space-x-2">
                      {typeof item === 'object' && (
                        <>
                          <button
                            onClick={(e) => { e.stopPropagation(); openEditModal(item); }}
                            className={`p-1.5 rounded border transition-colors ${
                              selectedItem === item 
                                ? 'border-white text-white hover:bg-red-500' 
                                : 'border-gray-300 text-gray-700 hover:bg-gray-100'
                            }`}
                            title="Edit"
                          >
                            <Edit3 className="w-3 h-3" />
                          </button>
                          <button
                            onClick={(e) => handleDelete(item, e)}
                            className={`p-1.5 rounded border transition-colors ${
                              selectedItem === item 
                                ? 'border-white text-white hover:bg-red-500' 
                                : 'border-red-300 text-red-600 hover:bg-red-50'
                            }`}
                            title="Hapus"
                            disabled={deletingId === item.id}
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </>
                      )}
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
              ))}
            </div>
            </div>
          </div>

          {/* Photo Display - Right Side */}
        <div className="w-1/2 bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
          <div className="p-4 border-b border-gray-200 bg-gray-50">
            <h3 className="text-lg font-bold text-gray-900 flex items-center">
              <Target className="w-5 h-5 mr-2 text-red-600" />
              Detail KPI
            </h3>
          </div>
          
          <div className="p-4 h-full">
            {selectedItem ? (
              <div className="h-full flex flex-col">
                <div className="mb-4">
                  <h4 className="text-xl font-bold text-gray-900 mb-2">
                    {typeof selectedItem === 'string' ? selectedItem : selectedItem?.name}
                  </h4>
                  <p className="text-sm text-gray-600">
                    Kategori: {typeof selectedItem === 'object' ? selectedItem.category : activeTab}
                  </p>
                </div>
                
                <div className="flex-1 bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg overflow-hidden border border-gray-200">
                  <img
                    src={getPhotoUrl(selectedItem)}
                    alt={typeof selectedItem === 'string' ? selectedItem : selectedItem?.name || 'KPI Photo'}
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
                  <h4 className="text-xl font-bold text-gray-800 mb-2">Pilih KPI</h4>
                  <p className="text-gray-500 text-sm">Klik item di sebelah kiri untuk melihat detail foto</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white w-full max-w-md rounded-xl shadow-xl border border-gray-100">
            <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
              <h4 className="font-semibold">{modalMode === 'create' ? 'Tambah KPI' : 'Edit KPI'}</h4>
              <button onClick={closeModal} className="p-1 rounded hover:bg-gray-100">
                <X className="h-4 w-4" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-4 space-y-3">
              <div>
                <label className="block text-sm mb-1 text-gray-700">Nama KPI</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleFormChange}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm mb-1 text-gray-700">Kategori</label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleFormChange}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  required
                >
                  <option value="divisi">Divisi</option>
                  <option value="leader">Leader</option>
                  <option value="individu">Individu</option>
                </select>
              </div>
              <div>
                <label className="block text-sm mb-1 text-gray-700">Upload Foto KPI</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setPhotoFile(e.target.files?.[0] || null)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-red-500 focus:border-transparent"
                />
                {previewUrl && (
                  <div className="mt-2">
                    <img src={previewUrl} alt="Preview" className="w-full h-40 object-cover rounded border" />
                  </div>
                )}
                {modalMode === 'edit' && formData.photo_url && !photoFile && (
                  <p className="mt-1 text-xs text-gray-500">Foto saat ini akan dipertahankan jika tidak memilih file baru.</p>
                )}
                {uploadProgress > 0 && uploadProgress < 100 && (
                  <div className="mt-2">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-red-600 h-2 rounded-full transition-all"
                        style={{ width: `${uploadProgress}%` }}
                      />
                    </div>
                    <p className="text-xs text-gray-500 mt-1">Mengunggah: {uploadProgress}%</p>
                  </div>
                )}
              </div>
              <div className="pt-2 flex justify-end gap-2">
                <button type="button" onClick={closeModal} className="px-3 py-2 text-sm rounded border border-gray-300 hover:bg-gray-50" disabled={isSaving}>
                  Batal
                </button>
                <button type="submit" className="px-3 py-2 text-sm rounded bg-red-600 text-white hover:bg-red-700 disabled:opacity-60" disabled={isSaving}>
                  {isSaving ? 'Menyimpan...' : modalMode === 'create' ? 'Simpan' : 'Update'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminKPI;
