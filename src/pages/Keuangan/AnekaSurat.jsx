import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { anekaSuratService } from '../../services/anekaSuratService';
import { API_CONFIG } from '../../config/constants';
import { toast } from 'react-hot-toast';
import { 
  Plus, 
  Search, 
  Filter,
  Eye,
  Edit,
  Trash2,
  ChevronUp,
  ChevronDown,
  FileText,
  Image,
  Download,
  Paperclip,
  Calendar,
  User,
  X,
  Upload,
  File,
  RefreshCw,
  TrendingUp
} from 'lucide-react';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { MENU_CODES } from '@/config/menuCodes';

const AnekaSurat = () => {
  const { user } = useAuth();
  const [anekaSurat, setAnekaSurat] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [jenisFilter, setJenisFilter] = useState('all');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [expandedCategories, setExpandedCategories] = useState(new Set());
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedSurat, setSelectedSurat] = useState(null);
  const [formData, setFormData] = useState({
    jenis_dokumen: '',
    judul_dokumen: '',
    files: []
  });
  const [uploading, setUploading] = useState(false);

  const documentTypes = [
    'PERJANJIAN KERJA',
    'SEWA MENYEWA',
    'PIHAK KE-3',
    'INVESTOR',
    'NIB',
    'PBG/IMB',
    'SERTIFIKAT MERK',
    'SERTIFIKAT HALAL',
    'DOKUMEN LAIN'
  ];

  useEffect(() => {
    if (user) {
      loadAnekaSurat();
    }
  }, [user]);

  const loadAnekaSurat = async () => {
    try {
      setLoading(true);
      const response = await anekaSuratService.getAllAnekaSurat();
      
      if (response.success) {
        setAnekaSurat(response.data || []);
        // Auto-expand categories that have documents
        const categoriesWithDocs = new Set(response.data.map(item => item.jenis_dokumen));
        setExpandedCategories(categoriesWithDocs);
      } else {
        toast.error('Gagal memuat data aneka surat');
      }
    } catch (error) {
      console.error('Error loading aneka surat:', error);
      toast.error('Gagal memuat data aneka surat');
    } finally {
      setLoading(false);
    }
  };

  // Helper: paksa download file menggunakan anchor[download]
  const downloadFile = (url, suggestedName) => {
    if (!url || url === '#') {
      toast.error('URL lampiran tidak valid');
      return;
    }
    const a = document.createElement('a');
    a.href = url;
    if (suggestedName) a.download = suggestedName;
    a.style.display = 'none';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  // Helper: bangun URL lampiran dengan BASE_HOST backend
  const getAttachmentUrl = (rawPathOrUrl) => {
    if (!rawPathOrUrl) return '#';
    if (/^https?:\/\//i.test(rawPathOrUrl)) return rawPathOrUrl;
    const normalized = String(rawPathOrUrl).replace(/^\/+/, '');
    return `${API_CONFIG.BASE_HOST}/${normalized}`;
  };

  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files);
    setFormData(prev => ({
      ...prev,
      files: [...prev.files, ...files]
    }));
  };

  const removeFile = (index) => {
    setFormData(prev => ({
      ...prev,
      files: prev.files.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.jenis_dokumen || !formData.judul_dokumen || formData.files.length === 0) {
      toast.error('Semua field harus diisi');
      return;
    }

    try {
      setUploading(true);
      const formDataToSend = new FormData();
      formDataToSend.append('jenis_dokumen', formData.jenis_dokumen);
      formDataToSend.append('judul_dokumen', formData.judul_dokumen);
      
      formData.files.forEach(file => {
        formDataToSend.append('files', file);
      });

      const response = await anekaSuratService.createAnekaSurat(formDataToSend);
      
      if (response.success) {
        toast.success('Aneka surat berhasil ditambahkan');
        setShowAddModal(false);
        resetForm();
        loadAnekaSurat();
      } else {
        toast.error('Gagal menambahkan aneka surat');
      }
    } catch (error) {
      console.error('Error creating aneka surat:', error);
      toast.error('Gagal menambahkan aneka surat');
    } finally {
      setUploading(false);
    }
  };

  const handleEdit = async (e) => {
    e.preventDefault();
    
    if (!formData.jenis_dokumen || !formData.judul_dokumen) {
      toast.error('Jenis dokumen dan judul dokumen harus diisi');
      return;
    }

    try {
      setUploading(true);
      const formDataToSend = new FormData();
      formDataToSend.append('jenis_dokumen', formData.jenis_dokumen);
      formDataToSend.append('judul_dokumen', formData.judul_dokumen);
      
      if (formData.files.length > 0) {
        formData.files.forEach(file => {
          formDataToSend.append('files', file);
        });
      }

      const response = await anekaSuratService.updateAnekaSurat(selectedSurat.id, formDataToSend);
      
      if (response.success) {
        toast.success('Aneka surat berhasil diperbarui');
        setShowEditModal(false);
        resetForm();
        loadAnekaSurat();
      } else {
        toast.error('Gagal memperbarui aneka surat');
      }
    } catch (error) {
      console.error('Error updating aneka surat:', error);
      toast.error('Gagal memperbarui aneka surat');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async () => {
    try {
      const response = await anekaSuratService.deleteAnekaSurat(selectedSurat.id);
      
      if (response.success) {
        toast.success('Aneka surat berhasil dihapus');
        setShowDeleteModal(false);
        loadAnekaSurat();
      } else {
        toast.error('Gagal menghapus aneka surat');
      }
    } catch (error) {
      console.error('Error deleting aneka surat:', error);
      toast.error('Gagal menghapus aneka surat');
    }
  };

  const handleExport = () => {
    toast.success('Data berhasil diekspor');
  };

  const resetForm = () => {
    setFormData({
      jenis_dokumen: '',
      judul_dokumen: '',
      files: []
    });
    setSelectedSurat(null);
  };

  const openEditModal = (surat) => {
    setSelectedSurat(surat);
    setFormData({
      jenis_dokumen: surat.jenis_dokumen,
      judul_dokumen: surat.judul_dokumen,
      files: []
    });
    setShowEditModal(true);
  };

  const openDeleteModal = (surat) => {
    setSelectedSurat(surat);
    setShowDeleteModal(true);
  };

  const toggleCategory = (category) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(category)) {
      newExpanded.delete(category);
    } else {
      newExpanded.add(category);
    }
    setExpandedCategories(newExpanded);
  };

  // Reset all filters to defaults (match AdminDataSupplier UX)
  const resetFilters = () => {
    setSearchTerm('');
    setJenisFilter('all');
    setSelectedDate(new Date().toISOString().split('T')[0]);
  };

  const getFileIcon = (fileName) => {
    const ext = fileName.split('.').pop()?.toLowerCase();
    if (['jpg', 'jpeg', 'png', 'gif'].includes(ext)) {
      return <Image className="w-6 h-6 text-blue-600" />;
    } else if (ext === 'pdf') {
      return <FileText className="w-6 h-6 text-red-600" />;
    } else {
      return <File className="w-6 h-6 text-gray-600" />;
    }
  };

  const getFileType = (fileName) => {
    const ext = fileName.split('.').pop()?.toLowerCase();
    if (['jpg', 'jpeg', 'png', 'gif'].includes(ext)) {
      return 'Gambar';
    } else if (ext === 'pdf') {
      return 'Dokumen';
    } else {
      return 'File';
    }
  };

  const filteredData = anekaSurat.filter(item => {
    const matchesSearch = !searchTerm || 
      item.judul_dokumen.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.jenis_dokumen.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesJenis = jenisFilter === 'all' || item.jenis_dokumen === jenisFilter;
    
    return matchesSearch && matchesJenis;
  });

  const groupedData = {};
  filteredData.forEach(item => {
    if (!groupedData[item.jenis_dokumen]) {
      groupedData[item.jenis_dokumen] = [];
    }
    groupedData[item.jenis_dokumen].push(item);
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Memuat data aneka surat...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Header - match AdminDataSupplier style */}
      <div className="bg-red-800 text-white px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span className="text-sm font-semibold bg-white/10 rounded px-2 py-1">{MENU_CODES.keuangan.anekaSurat}</span>
            <div>
              <h1 className="text-xl md:text-2xl font-extrabold tracking-tight">ANEKA SURAT</h1>
              <p className="text-sm text-red-100">Kelola dan monitor semua dokumen hukum & perjanjian</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={resetFilters}
              className="px-4 py-2 rounded-full border border-white/60 text-white hover:bg-white/10"
            >
              RESET FILTER
            </button>
            <button
              onClick={loadAnekaSurat}
              disabled={loading}
              className="inline-flex items-center gap-2 px-4 py-2 bg-white text-red-700 rounded-lg hover:bg-red-50 transition-colors shadow-sm disabled:opacity-60"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              <span className="font-semibold">Refresh</span>
            </button>
            <button
              onClick={() => setShowAddModal(true)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-white text-red-700 rounded-lg hover:bg-red-50 transition-colors shadow-sm"
            >
              <Plus className="h-4 w-4" />
              <span className="font-semibold">Tambah</span>
            </button>
          </div>
        </div>
      </div>

      {/* Info Bar Abu-abu */}
      <div className="bg-gray-100 px-4 py-2">
        <p className="text-gray-700 text-sm">Daftar aneka surat terbaru berada di paling atas</p>
      </div>

      <div className="p-6">
      {/* Stats Cards and Controls removed per request */}

      {/* Content */}
      <div className="bg-white rounded-lg shadow-sm border">
        {Object.keys(groupedData).length === 0 ? (
          <div className="text-center py-12">
            <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">Tidak ada dokumen ditemukan</p>
          </div>
        ) : (
          <div className="space-y-4">
            {Object.entries(groupedData).map(([jenis, documents]) => (
              <div key={jenis} className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                <button
                  onClick={() => toggleCategory(jenis)}
                  className="w-full px-6 py-4 bg-red-800 text-white flex items-center justify-between hover:bg-red-900 transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    <FileText className="w-6 h-6" />
                    <span className="text-lg font-semibold">{jenis}</span>
                    <span className="bg-red-700 px-2 py-1 rounded-full text-sm">
                      {documents.length}
                    </span>
                  </div>
                  {expandedCategories.has(jenis) ? (
                    <ChevronUp className="w-5 h-5" />
                  ) : (
                    <ChevronDown className="w-5 h-5" />
                  )}
                </button>
                
                {expandedCategories.has(jenis) && (
                  <div className="p-4 space-y-4">
                    {documents.map((doc) => (
                      <div key={doc.id} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <h3 className="font-bold text-gray-900 mb-1">{doc.judul_dokumen}</h3>
                            <div className="flex items-center text-sm text-gray-500 mb-2">
                              <Calendar className="w-4 h-4 mr-1" />
                              {format(new Date(doc.created_at), 'dd MMMM yyyy', { locale: id })}
                            </div>
                            <div className="flex items-center text-sm text-gray-500 mb-2">
                              <User className="w-4 h-4 mr-1" />
                              {doc.user_nama || 'Admin'}
                            </div>
                          </div>
                          <div className="flex space-x-2">
                            <button
                              onClick={() => openEditModal(doc)}
                              className="p-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => openDeleteModal(doc)}
                              className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
        </div>

                        {/* Attachments */}
                        {doc.lampiran && (
                          <div>
                            <div className="flex items-center text-sm text-gray-600 mb-2">
                              <Paperclip className="w-4 h-4 mr-1" />
                              {Array.isArray(doc.lampiran) ? doc.lampiran.length : 1} Lampiran
                            </div>
                            <div className="space-y-2">
                              {Array.isArray(doc.lampiran) ? doc.lampiran.map((file, index) => (
                                <div key={index} className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
                                  <div className="flex items-center space-x-3">
                                    {getFileIcon(file.file_name || file.name)}
                                    <div>
                                      <div className="text-sm font-medium text-gray-900">
                                        {file.file_name || file.name}
                                      </div>
                                      <div className="text-xs text-gray-500">
                                        {getFileType(file.file_name || file.name)}
                                      </div>
                                    </div>
                                  </div>
                                  <button
                                    onClick={() => {
                                      const url = getAttachmentUrl(file.file_path || file.url);
                                      const name = file.file_name || file.name || (url.split('/').pop() || 'file');
                                      downloadFile(url, name);
                                    }}
                                    className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg"
                                  >
                                    <Download className="w-4 h-4" />
                                  </button>
                                </div>
                              )) : (
                                <div className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
                                  <div className="flex items-center space-x-3">
                                    <FileText className="w-6 h-6 text-gray-600" />
                                    <div>
                                      <div className="text-sm font-medium text-gray-900">Dokumen</div>
                                      <div className="text-xs text-gray-500">File</div>
                                    </div>
                                  </div>
                                  <button className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg">
                                    <Download className="w-4 h-4" />
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4 bg-red-800 text-white rounded-lg px-4 py-3">
                <h2 className="text-lg font-semibold">Tambah Aneka Surat</h2>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="p-2 hover:bg-white/10 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Jenis Dokumen *
                  </label>
                  <div className="space-y-2">
                    {documentTypes.map((type) => (
                      <label key={type} className="flex items-center space-x-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                        <input
                          type="radio"
                          name="jenis_dokumen"
                          value={type}
                          checked={formData.jenis_dokumen === type}
                          onChange={(e) => setFormData(prev => ({ ...prev, jenis_dokumen: e.target.value }))}
                          className="text-red-600 focus:ring-red-500"
                        />
                        <span className="text-sm font-medium">{type}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Judul Dokumen *
                  </label>
                  <input
                    type="text"
                    placeholder="Masukkan judul dokumen"
                    value={formData.judul_dokumen}
                    onChange={(e) => setFormData(prev => ({ ...prev, judul_dokumen: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Upload Lampiran *
                  </label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
                    <input
                      type="file"
                      multiple
                      onChange={handleFileUpload}
                      className="hidden"
                      id="file-upload"
                      accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.gif,.txt"
                    />
                    <label htmlFor="file-upload" className="cursor-pointer">
                      <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                      <div className="text-sm text-gray-600">Pilih file dokumen</div>
                      <div className="text-xs text-gray-500">(Bisa pilih lebih dari 1 file)</div>
                    </label>
                  </div>
                  
                  {formData.files.length > 0 && (
                    <div className="mt-3 space-y-2">
                      {formData.files.map((file, index) => (
                        <div key={index} className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
                          <div className="flex items-center space-x-2">
                            <FileText className="w-4 h-4 text-gray-600" />
                            <span className="text-sm text-gray-900">{file.name}</span>
                          </div>
                          <button
                  type="button"
                            onClick={() => removeFile(index)}
                            className="p-1 text-red-600 hover:bg-red-100 rounded"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={uploading}
                  className="w-full bg-red-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {uploading ? 'Menyimpan...' : 'Simpan Aneka Surat'}
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4 bg-red-800 text-white rounded-lg px-4 py-3">
                <h2 className="text-lg font-semibold">Edit Aneka Surat</h2>
                <button
                  onClick={() => setShowEditModal(false)}
                  className="p-2 hover:bg-white/10 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <form onSubmit={handleEdit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Jenis Dokumen *
                  </label>
                  <div className="space-y-2">
                    {documentTypes.map((type) => (
                      <label key={type} className="flex items-center space-x-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                        <input
                          type="radio"
                          name="jenis_dokumen"
                          value={type}
                          checked={formData.jenis_dokumen === type}
                          onChange={(e) => setFormData(prev => ({ ...prev, jenis_dokumen: e.target.value }))}
                          className="text-red-600 focus:ring-red-500"
                        />
                        <span className="text-sm font-medium">{type}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Judul Dokumen *
                  </label>
                  <input
                    type="text"
                    placeholder="Masukkan judul dokumen"
                    value={formData.judul_dokumen}
                    onChange={(e) => setFormData(prev => ({ ...prev, judul_dokumen: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Upload Lampiran Baru (Opsional)
                  </label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
                    <input
                      type="file"
                      multiple
                      onChange={handleFileUpload}
                      className="hidden"
                      id="file-upload-edit"
                      accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.gif,.txt"
                    />
                    <label htmlFor="file-upload-edit" className="cursor-pointer">
                      <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                      <div className="text-sm text-gray-600">Pilih file dokumen</div>
                      <div className="text-xs text-gray-500">(Bisa pilih lebih dari 1 file)</div>
                    </label>
                  </div>
                  
                  {formData.files.length > 0 && (
                    <div className="mt-3 space-y-2">
                      {formData.files.map((file, index) => (
                        <div key={index} className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
                          <div className="flex items-center space-x-2">
                            <FileText className="w-4 h-4 text-gray-600" />
                            <span className="text-sm text-gray-900">{file.name}</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => removeFile(index)}
                            className="p-1 text-red-600 hover:bg-red-100 rounded"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={uploading}
                  className="w-full bg-red-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {uploading ? 'Menyimpan...' : 'Update Aneka Surat'}
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg w-full max-w-md p-6">
            <div className="text-center">
              <Trash2 className="w-16 h-16 text-red-600 mx-auto mb-4" />
              <h2 className="text-xl font-bold text-gray-900 mb-2">Hapus Aneka Surat</h2>
              <p className="text-gray-600 mb-6">
                Apakah Anda yakin ingin menghapus "{selectedSurat?.judul_dokumen}"? 
                Tindakan ini tidak dapat dibatalkan.
              </p>
              
              <div className="flex space-x-3">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Batal
                </button>
                <button
                  onClick={handleDelete}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                >
                  Hapus
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      </div>
    </div>
  );
};

export default AnekaSurat;