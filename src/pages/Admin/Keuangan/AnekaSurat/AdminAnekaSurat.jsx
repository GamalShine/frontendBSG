import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../../../contexts/AuthContext';
import { anekaSuratService } from '../../../../services/anekaSuratService';
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
  FileType,
  Image,
  Download,
  Paperclip,
  Calendar,
  User,
  X,
  Upload,
  File,
  BarChart3,
  TrendingUp,
  FileClock,
  FileCheck,
  RefreshCw,
  MoreVertical,
  ZoomIn,
  ZoomOut
} from 'lucide-react';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { MENU_CODES } from '@/config/menuCodes';
import LoadingSpinner from '@/components/UI/LoadingSpinner';
import { API_CONFIG } from '../../../../config/constants';

const AdminAnekaSurat = () => {
  const { user } = useAuth();
  const [anekaSurat, setAnekaSurat] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [jenisFilter, setJenisFilter] = useState('all');
  const [expandedCategories, setExpandedCategories] = useState(new Set());
  const [showFilters, setShowFilters] = useState(false);
  const [selectedItems, setSelectedItems] = useState([]);
  const [dateFilter, setDateFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedSurat, setSelectedSurat] = useState(null);
  const [formData, setFormData] = useState({
    jenis_dokumen: '',
    judul_dokumen: '',
    files: []
  });
  const [existingAttachments, setExistingAttachments] = useState([]); // untuk modal edit
  const [removedAttachments, setRemovedAttachments] = useState([]);   // daftar file_path yang dihapus saat edit
  const [uploading, setUploading] = useState(false);
  const [stats, setStats] = useState({});
  const [showBulkMenu, setShowBulkMenu] = useState(false);
  // Preview modal state
  const [preview, setPreview] = useState({ open: false, url: '', name: '', type: 'other' });
  const [zoom, setZoom] = useState({ scale: 1, x: 0, y: 0 });
  const isDraggingRef = React.useRef(false);
  const lastPosRef = React.useRef({ x: 0, y: 0 });
  const [previewText, setPreviewText] = useState('');
  const [previewLoading, setPreviewLoading] = useState(false);

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
      loadStats();
    }
  }, [user]);

  const loadAnekaSurat = async () => {
    try {
      setLoading(true);
      const response = await anekaSuratService.getAllAnekaSurat();
      
      if (response.success) {
        // Normalisasi lampiran supaya selalu array (selaras dengan Owner)
        const normalized = (response.data || []).map((item) => {
          let lampiran = item.lampiran;
          if (typeof lampiran === 'string') {
            try { lampiran = JSON.parse(lampiran); } catch { lampiran = []; }
          }
          if (!Array.isArray(lampiran)) lampiran = [];
          return { ...item, lampiran };
        });
        setAnekaSurat(normalized);
        // Auto-expand categories yang memiliki dokumen
        const categoriesWithDocs = new Set(normalized.map(item => item.jenis_dokumen));
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

  // ===== Bulk Actions helpers =====
  const getSelectedEntries = () => {
    if (!Array.isArray(selectedItems) || selectedItems.length === 0) return []
    const byId = new Map(anekaSurat.map(d => [d.id, d]))
    return selectedItems.map(id => byId.get(id)).filter(Boolean)
  }

  const buildCopyText = (doc) => {
    const tanggal = doc?.created_at ? format(new Date(doc.created_at), 'dd MMMM yyyy', { locale: id }) : '-'
    const title = doc?.judul_dokumen || '(Tanpa judul)'
    const lampiran = Array.isArray(doc?.lampiran) ? doc.lampiran.map(f => (f.file_name || f.name)).filter(Boolean) : []
    const lampiranText = lampiran.length ? `Lampiran: \n- ${lampiran.join('\n- ')}` : 'Lampiran: -'
    return `${title}\nTanggal: ${tanggal}\n${lampiranText}`
  }

  const handleBulkCopy = async () => {
    const entries = getSelectedEntries()
    if (entries.length === 0) return toast.error('Pilih minimal satu dokumen terlebih dahulu')
    const combined = entries.map(buildCopyText).join('\n\n---\n\n')
    await navigator.clipboard.writeText(combined)
    toast.success(`Menyalin ${entries.length} dokumen`)
    setShowBulkMenu(false)
  }

  const handleBulkDownload = () => {
    const entries = getSelectedEntries()
    if (entries.length === 0) return toast.error('Pilih minimal satu dokumen terlebih dahulu')
    const combined = entries.map(buildCopyText).join('\n\n---\n\n')
    const blob = new Blob([combined], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `admin_anekasurat_selected_${entries.length}.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    setShowBulkMenu(false)
  }

  const handleBulkShare = async () => {
    const entries = getSelectedEntries()
    if (entries.length === 0) return toast.error('Pilih minimal satu dokumen terlebih dahulu')
    const combined = entries.map(buildCopyText).join('\n\n---\n\n')
    if (navigator.share) {
      try { await navigator.share({ title: `Aneka Surat (${entries.length})`, text: combined }) } catch {}
    } else {
      await navigator.clipboard.writeText(combined)
      toast.success('Teks disalin untuk dibagikan')
    }
    setShowBulkMenu(false)
  }

  const handleBulkOpenAll = () => {
    const entries = getSelectedEntries()
    if (entries.length === 0) return toast.error('Pilih minimal satu dokumen terlebih dahulu')
    entries.forEach(doc => {
      const raw = Array.isArray(doc?.lampiran) ? doc.lampiran[0] : null
      const firstUrl = raw ? getAttachmentUrl(raw.file_path || raw.url) : null
      if (firstUrl) window.open(firstUrl, '_blank')
    })
    setShowBulkMenu(false)
  }

  // Info Bar: Terakhir diupdate (format Indonesia panjang)
  const lastUpdatedText = React.useMemo(() => {
    if (!Array.isArray(anekaSurat) || anekaSurat.length === 0) return '-';
    const timestamps = anekaSurat
      .map(d => d.updated_at || d.created_at)
      .filter(Boolean)
      .map(d => new Date(d).getTime());
    if (!timestamps.length) return '-';
    const max = Math.max(...timestamps);
    if (!isFinite(max)) return '-';
    try {
      return format(new Date(max), "d MMMM yyyy 'pukul' HH.mm", { locale: id });
    } catch { return '-'; }
  }, [anekaSurat]);

  // Helpers lampiran
  const getAttachmentUrl = (rawPathOrUrl) => {
    if (!rawPathOrUrl) return '#';
    if (/^https?:\/\//i.test(rawPathOrUrl)) return rawPathOrUrl;
    const normalized = String(rawPathOrUrl)
      .replace(/\\/g, '/')
      .replace(/^\/+/, '');
    return `${API_CONFIG.BASE_HOST}/${normalized}`;
  };

  // Simple file type detection
  const detectFileType = (extOrUrl) => {
    const s = String(extOrUrl || '').toLowerCase();
    if (s.includes('image/') || ['jpg','jpeg','png','gif','webp','bmp'].some(x => s.endsWith(`.${x}`))) return 'image';
    if (s.includes('video/') || ['mp4','webm','ogg','mov'].some(x => s.endsWith(`.${x}`))) return 'video';
    if (s.includes('application/pdf') || s.endsWith('.pdf')) return 'pdf';
    const officeExts = ['doc','docx','xls','xlsx','ppt','pptx'];
    const officeMimes = [
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-powerpoint',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation'
    ];
    if (officeExts.some(x => s.endsWith(`.${x}`)) || officeMimes.some(m => s.includes(m))) return 'office';
    if (s.includes('text/') || ['txt','csv','md','log','json'].some(x => s.endsWith(`.${x}`))) return 'text';
    return 'other';
  };

  const openPreview = (url, name, hint) => {
    const type = detectFileType(hint || name || url);
    setPreview({ open: true, url, name: name || url, type });
    setZoom({ scale: 1, x: 0, y: 0 });
  };
  const closePreview = () => setPreview({ open: false, url: '', name: '', type: 'other' });

  // ESC to close preview
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') closePreview(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  // Load text content when previewing text files
  useEffect(() => {
    const loadText = async () => {
      if (!preview.open || preview.type !== 'text' || !preview.url) return;
      try {
        setPreviewLoading(true);
        const res = await fetch(preview.url);
        const txt = await res.text();
        setPreviewText(txt);
      } catch (e) {
        setPreviewText('Gagal memuat konten teks.');
      } finally {
        setPreviewLoading(false);
      }
    };
    loadText();
  }, [preview.open, preview.type, preview.url]);

  // Zoom & Pan handlers (match Aset behavior)
  const handleWheel = (e) => {
    if (preview.type !== 'image') return;
    e.preventDefault();
    const delta = -Math.sign(e.deltaY) * 0.1;
    setZoom((z) => {
      const next = Math.min(5, Math.max(0.5, z.scale + delta));
      if (next === 1) return { scale: 1, x: 0, y: 0 };
      return { ...z, scale: next };
    });
  };
  const handleMouseDown = (e) => {
    if (preview.type !== 'image') return;
    if (zoom.scale <= 1) return;
    isDraggingRef.current = true;
    lastPosRef.current = { x: e.clientX, y: e.clientY };
  };
  const handleMouseMove = (e) => {
    if (preview.type !== 'image') return;
    if (!isDraggingRef.current) return;
    const dx = e.clientX - lastPosRef.current.x;
    const dy = e.clientY - lastPosRef.current.y;
    lastPosRef.current = { x: e.clientX, y: e.clientY };
    setZoom((z) => ({ ...z, x: z.x + dx, y: z.y + dy }));
  };
  const handleMouseUp = () => { isDraggingRef.current = false; };
  const handleDoubleClick = () => {
    if (preview.type !== 'image') return;
    setZoom((z) => (z.scale === 1 ? { scale: 2, x: 0, y: 0 } : { scale: 1, x: 0, y: 0 }));
  };

  const downloadFile = (url, suggestedName) => {
    if (!url || url === '#') return;
    const a = document.createElement('a');
    a.href = url;
    if (suggestedName) a.download = suggestedName;
    a.style.display = 'none';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  // Filtered + grouped data seperti Owner
  const filteredData = anekaSurat.filter(item => {
    const matchesSearch = !searchTerm || 
      (item.judul_dokumen || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.jenis_dokumen || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesJenis = jenisFilter === 'all' || item.jenis_dokumen === jenisFilter;
    return matchesSearch && matchesJenis;
  });

  const groupedData = {};
  filteredData.forEach(item => {
    const key = item.jenis_dokumen || 'LAINNYA';
    if (!groupedData[key]) groupedData[key] = [];
    groupedData[key].push(item);
  });

  const resetFilters = () => {
    setSearchTerm('');
    setJenisFilter('all');
    setDateFilter('');
    setStatusFilter('');
  };

  const loadStats = async () => {
    try {
      const response = await anekaSuratService.getDocumentTypes();
      if (response.success) {
        const statsData = {};
        response.data.forEach(item => {
          statsData[item.jenis_dokumen] = item.total;
        });
        setStats(statsData);
      }
    } catch (error) {
      console.error('Error loading stats:', error);
    }
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
      // Sertakan daftar file yang ingin dihapus (berdasarkan file_path)
      if (removedAttachments.length > 0) {
        formDataToSend.append('remove_files', JSON.stringify(removedAttachments));
      }
      
      formData.files.forEach(file => {
        formDataToSend.append('files', file);
      });

      const response = await anekaSuratService.createAnekaSurat(formDataToSend);
      
      if (response.success) {
        toast.success('Aneka surat berhasil ditambahkan');
        setShowAddModal(false);
        resetForm();
        loadAnekaSurat();
        loadStats();
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
        setExistingAttachments([]);
        setRemovedAttachments([]);
        loadAnekaSurat();
        loadStats();
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
        loadStats();
      } else {
        toast.error('Gagal menghapus aneka surat');
      }
    } catch (error) {
      console.error('Error deleting aneka surat:', error);
      toast.error('Gagal menghapus aneka surat');
    }
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
    // Normalisasi lampiran existing
    let lampiran = surat.lampiran;
    if (typeof lampiran === 'string') {
      try { lampiran = JSON.parse(lampiran); } catch { lampiran = []; }
    }
    if (!Array.isArray(lampiran)) lampiran = [];
    setExistingAttachments(lampiran);
    setRemovedAttachments([]);
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


  const handleSelectAll = () => {
    if (selectedItems.length === anekaSurat.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(anekaSurat.map(item => item.id));
    }
  };

  const handleBulkAction = async (action) => {
    if (selectedItems.length === 0) {
      toast.error('Pilih dokumen terlebih dahulu');
      return;
    }

    try {
      if (action === 'delete') {
        if (!window.confirm(`Apakah Anda yakin ingin menghapus ${selectedItems.length} dokumen?`)) {
          return;
        }
        const deletePromises = selectedItems.map(id => anekaSuratService.deleteAnekaSurat(id));
        await Promise.all(deletePromises);
        toast.success(`${selectedItems.length} dokumen berhasil dihapus`);
      } else if (action === 'approve') {
        const approvePromises = selectedItems.map(id => anekaSuratService.approveAnekaSurat(id));
        await Promise.all(approvePromises);
        toast.success(`${selectedItems.length} dokumen berhasil disetujui`);
      } else if (action === 'reject') {
        if (!window.confirm(`Apakah Anda yakin ingin menolak ${selectedItems.length} dokumen?`)) {
          return;
        }
        const rejectPromises = selectedItems.map(id => anekaSuratService.rejectAnekaSurat(id));
        await Promise.all(rejectPromises);
        toast.success(`${selectedItems.length} dokumen berhasil ditolak`);
      }
      
      setSelectedItems([]);
      loadAnekaSurat();
      loadStats();
    } catch (error) {
      console.error(`Error performing bulk ${action}:`, error);
      toast.error(`Gagal melakukan aksi ${action} pada beberapa dokumen`);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'PENDING':
        return <span className="px-2 py-1 text-xs font-medium bg-yellow-100 text-yellow-800 rounded-full">Menunggu</span>;
      case 'APPROVED':
        return <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">Disetujui</span>;
      case 'REJECTED':
        return <span className="px-2 py-1 text-xs font-medium bg-red-100 text-red-800 rounded-full">Ditolak</span>;
      default:
        return <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded-full">{status}</span>;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header - samakan dengan Owner */}
      <div className="bg-red-800 text-white px-4 sm:px-6 py-4 sm:py-4">
        <div className="flex items-center justify-between gap-2 md:gap-3">
          <div className="flex items-center gap-4 min-w-0">
            <span className="text-sm font-semibold bg-white/10 rounded px-2 py-1">{MENU_CODES.keuangan.anekaSurat}</span>
            <div>
              <h1 className="text-xl md:text-2xl font-extrabold tracking-tight">ANEKA SURAT</h1>
            </div>
          </div>
          {/* Sembunyikan container aksi di mobile agar tidak menambah tinggi header */}
          <div className="hidden md:flex items-center gap-2 mt-0 flex-wrap w-full md:w-auto justify-end">
            <button
              onClick={() => { resetForm(); setShowAddModal(true); }}
              aria-label="Tambah Aneka Surat"
              className="hidden md:inline-flex items-center gap-2 px-3 py-2 sm:px-4 sm:py-2 bg-white text-red-700 rounded-lg hover:bg-red-50 transition-colors shadow-sm"
            >
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline font-semibold">Tambah</span>
            </button>
          </div>
        </div>
      </div>

      {/* FAB Tambah (mobile only) - sembunyikan saat modal terbuka */}
      {!(showAddModal || showEditModal || showDeleteModal) && (
        <button
          onClick={() => { resetForm(); setShowAddModal(true); }}
          aria-label="Tambah Aneka Surat"
          className="md:hidden fixed bottom-6 right-4 z-40 w-14 h-14 rounded-full bg-red-600 text-white shadow-lg flex items-center justify-center active:scale-95"
        >
          <Plus className="w-6 h-6" />
        </button>
      )}

      {/* Info Bar Abu-abu */}
      <div className="bg-gray-200 px-4 sm:px-6 py-2">
        <p className="text-sm text-gray-900">Terakhir diupdate: {lastUpdatedText}</p>
      </div>

      {/* Pencarian & Filter - gaya Data Sewa */}
      <div className="bg-white rounded-none md:rounded-xl shadow-sm border border-gray-100 mt-4 mb-2">
        <div className="px-6 py-4">
          <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Cari Dokumen</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Cari judul atau jenis dokumen..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-red-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="px-0 pt-2 pb-4">
        <div className="bg-white rounded-none md:rounded-xl shadow-sm border border-gray-100">
          {Object.keys(groupedData).length === 0 ? (
            <div className="text-center py-12">
              <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">Tidak ada dokumen ditemukan</p>
            </div>
          ) : (
            <div className="space-y-4">
              {Object.entries(groupedData).map(([jenis, documents]) => (
                <div key={jenis} className="bg-white rounded-none md:rounded-lg shadow-sm border border-gray-100 overflow-hidden">
                  <button
                    onClick={() => toggleCategory(jenis)}
                    className="w-full px-6 py-3 bg-red-800 text-white flex items-center justify-between hover:bg-red-900 transition-colors"
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
                    <div className="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-3 gap-y-2">
                      {documents.map((doc) => (
                        <div key={doc.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-3 hover:shadow-md transition-shadow h-full flex flex-col text-sm overflow-hidden">
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex-1 space-y-1 text-sm">
                              <div className="grid grid-cols-[120px,1fr] items-center gap-2 leading-5">
                                <span className="text-gray-700">Judul</span>
                                <span className="text-gray-900 font-semibold truncate">{doc.judul_dokumen}</span>
                              </div>
                              <div className="grid grid-cols-[120px,1fr] items-center gap-2 leading-5">
                                <span className="text-gray-700">Tanggal</span>
                                <span className="text-gray-900">{format(new Date(doc.created_at), 'dd MMMM yyyy', { locale: id })}</span>
                              </div>
                              <div className="grid grid-cols-[120px,1fr] items-center gap-2 leading-5">
                                <span className="text-gray-700">Dibuat Oleh</span>
                                <span className="text-gray-900">{doc.user_nama || 'Admin'}</span>
                              </div>
                            </div>
                            <div className="flex space-x-2 flex-shrink-0">
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

                          {doc.lampiran && (
                            <div className="mt-3">
                              <div className="flex items-center mb-1">
                                <span className="text-[11px] font-semibold text-gray-700">Lampiran</span>
                              </div>
                              {(Array.isArray(doc.lampiran) ? doc.lampiran : []).length === 0 ? (
                                <p className="text-[11px] text-gray-500">Belum ada lampiran</p>
                              ) : (
                                <div className="grid grid-cols-3 gap-2">
                                  {doc.lampiran.map((file, index) => (
                                    <div key={index} className="border rounded-md p-2 flex items-center justify-between gap-2">
                                      <button
                                        type="button"
                                        onClick={() => {
                                          const url = getAttachmentUrl(file.file_path || file.url);
                                          openPreview(url, file.file_name || file.name || url, file.mimetype || file.file_name || file.name || url);
                                        }}
                                        className="flex items-center gap-2 min-w-0 text-left flex-1 hover:bg-gray-50 rounded px-1 py-0.5"
                                        title="Lihat"
                                      >
                                        <FileText className="w-4 h-4 text-gray-600 flex-shrink-0" />
                                        <div className="text-[11px] text-gray-900 truncate">{file.file_name || file.name}</div>
                                      </button>
                                      <button
                                        onClick={() => {
                                          const url = getAttachmentUrl(file.file_path || file.url);
                                          const name = file.file_name || file.name || (url.split('/').pop() || 'file');
                                          downloadFile(url, name);
                                        }}
                                        className="inline-flex items-center justify-center h-7 w-7 p-0 text-blue-600 hover:bg-blue-100 rounded-md flex-shrink-0"
                                        title="Download"
                                      >
                                        <Download className="w-4 h-4" />
                                      </button>
                                    </div>
                                  ))}
                                </div>
                              )}
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
      </div>

      {/* Preview Modal */}
      {preview.open && (
        <div className="fixed inset-0 bg-black/90 flex items-center justify-center p-0 z-[60]" onClick={closePreview}>
          <div className="relative max-w-[92vw] max-h=[92vh] w-auto h-auto" onClick={(e)=>e.stopPropagation()}>
            {/* Actions: Download & Close */}
            <div className="fixed top-4 right-4 z-[61] flex items-center gap-2">
              <a href={preview.url} download target="_blank" rel="noreferrer" className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white shadow" title="Download" onClick={(e)=>e.stopPropagation()}>
                <Download className="w-5 h-5" />
              </a>
              <button onClick={closePreview} className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white shadow" title="Tutup (Esc)">✕</button>
            </div>
            {/* Zoom controls (image only) */}
            <div className="fixed top-16 right-4 z-[61] flex flex-col items-center gap-2">
              <button onClick={(e)=>{ e.stopPropagation(); setZoom(z=>({ ...z, scale: Math.min(5, z.scale + 0.25) })) }} disabled={preview.type !== 'image'} className={`p-2 rounded-full shadow ${preview.type !== 'image' ? 'bg-white/10 text-white/50 cursor-not-allowed' : 'bg-white/10 hover:bg-white/20 text-white'}`} title="Zoom In">
                <ZoomIn className="w-5 h-5" />
              </button>
              <button onClick={(e)=>{ e.stopPropagation(); setZoom(z=>({ ...z, scale: Math.max(0.5, z.scale - 0.25), x: (z.scale - 0.25) <= 1 ? 0 : z.x, y: (z.scale - 0.25) <= 1 ? 0 : z.y })) }} disabled={preview.type !== 'image'} className={`p-2 rounded-full shadow ${preview.type !== 'image' ? 'bg-white/10 text-white/50 cursor-not-allowed' : 'bg-white/10 hover:bg-white/20 text-white'}`} title="Zoom Out">
                <ZoomOut className="w-5 h-5" />
              </button>
            </div>
            {/* Filename badge */}
            <div className="fixed top-4 left-4 z-[61] text-white/90 text-xs max-w-[60vw] truncate" title={preview.name}>{preview.name}</div>
            {/* Content */}
            {preview.type === 'image' && (
              <div className="max-h-[92vh] max-w-[92vw] overflow-hidden cursor-grab active:cursor-grabbing select-none"
                   onWheel={handleWheel}
                   onMouseDown={handleMouseDown}
                   onMouseMove={handleMouseMove}
                   onMouseUp={handleMouseUp}
                   onMouseLeave={handleMouseUp}
                   onDoubleClick={handleDoubleClick}>
                <img src={preview.url} alt={preview.name} draggable={false}
                     style={{ transform: `translate(${zoom.x}px, ${zoom.y}px) scale(${zoom.scale})`, transformOrigin: 'center center' }}
                     className="max-h-[92vh] max-w-[92vw] w-auto h-auto object-contain" />
              </div>
            )}
            {preview.type === 'video' && (
              <video src={preview.url} controls className="max-h-[92vh] max-w-[92vw] w-auto h-auto bg-black rounded select-none" />
            )}
            {preview.type === 'pdf' && (
              <iframe src={preview.url} title={preview.name} className="w-[92vw] h-[92vh] bg-white rounded" />
            )}
            {preview.type === 'office' && (
              (() => {
                const host = (API_CONFIG.BASE_HOST || '').toLowerCase();
                const isLocal = host.includes('localhost') || host.includes('127.0.0.1');
                if (isLocal) {
                  return (
                    <div className="text-center text-sm text-white/90 max-w-[80vw]">
                      <p className="mb-3">Preview dokumen Office tidak tersedia di lingkungan localhost.</p>
                      <div className="flex items-center justify-center gap-2">
                        <a href={preview.url} target="_blank" rel="noreferrer" className="inline-block px-3 py-1.5 rounded bg-white/10 hover:bg-white/20 text-white">Buka di tab baru</a>
                        <a href={preview.url} download target="_blank" rel="noreferrer" className="inline-block px-3 py-1.5 rounded bg-white/10 hover:bg-white/20 text-white">Download</a>
                      </div>
                    </div>
                  )
                }
                const officeView = `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(preview.url)}`
                return (
                  <iframe src={officeView} title={preview.name} className="w-[92vw] h-[92vh] bg-white rounded" />
                )
              })()
            )}
            {preview.type === 'text' && (
              <div className="w-[92vw] h-[92vh] bg-white/95 rounded p-3 overflow-auto">
                {previewLoading ? (
                  <div className="text-sm text-gray-700">Memuat konten...</div>
                ) : (
                  <pre className="text-xs text-gray-900 whitespace-pre-wrap break-words">{previewText}</pre>
                )}
              </div>
            )}
            {preview.type === 'other' && (
              <div className="text-center text-sm text-white/90">
                <p className="mb-3">Preview tidak tersedia untuk tipe file ini.</p>
                <a href={preview.url} target="_blank" rel="noreferrer" className="inline-block px-3 py-1.5 rounded bg-white/10 hover:bg-white/20 text-white">Buka di tab baru</a>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-[9999] bg-black/40 flex items-end md:items-center justify-center p-0 md:p-4">
          <div className="w-full md:max-w-lg bg-white rounded-t-2xl md:rounded-2xl overflow-hidden shadow-lg">
            {/* Header */}
            <div className="px-4 py-3 border-b flex items-center justify-between">
              <h3 className="text-base md:text-lg font-semibold text-gray-900">Tambah Aneka Surat</h3>
              <button onClick={() => setShowAddModal(false)} className="text-gray-500 hover:text-gray-700" aria-label="Tutup">✕</button>
            </div>
            {/* Body */}
            <div className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Jenis Dokumen</label>
                <select
                  value={formData.jenis_dokumen}
                  onChange={(e) => setFormData(prev => ({ ...prev, jenis_dokumen: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Pilih jenis dokumen</option>
                  {documentTypes.map((type) => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Judul Dokumen</label>
                <input
                  type="text"
                  value={formData.judul_dokumen}
                  onChange={(e) => setFormData(prev => ({ ...prev, judul_dokumen: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Masukkan judul dokumen"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Upload Lampiran</label>
                <input
                  type="file"
                  multiple
                  onChange={handleFileUpload}
                  className="block w-full text-sm"
                  accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.gif,.txt"
                />
                {formData.files.length > 0 && (
                  <div className="mt-2 text-xs text-gray-600">{formData.files.length} file dipilih</div>
                )}
              </div>
            </div>
            {/* Footer */}
            <div className="p-4 border-t flex items-center justify-end gap-2">
              <button onClick={() => setShowAddModal(false)} className="px-4 py-2 rounded-lg border border-gray-300">Batal</button>
              <button
                disabled={uploading}
                onClick={handleSubmit}
                className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 lg:bg-blue-600 lg:hover:bg-blue-700 text-white disabled:opacity-50"
              >
                {uploading ? 'Menyimpan...' : 'Simpan'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg w-full max-w-xl max-h-[90vh] overflow-y-auto shadow-xl ring-1 ring-black/5">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold">Edit Aneka Surat</h2>
                <button
                  onClick={() => { setShowEditModal(false); resetForm(); }}
                  className="p-2 hover:bg-gray-100 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <form onSubmit={handleEdit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Jenis Dokumen *
                  </label>
                  <select
                    value={formData.jenis_dokumen}
                    onChange={(e) => setFormData(prev => ({ ...prev, jenis_dokumen: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  >
                    <option value="">Pilih jenis dokumen</option>
                    {documentTypes.map((type) => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
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

                {/* Daftar Lampiran Saat Ini */}
                {existingAttachments && existingAttachments.length > 0 && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Lampiran Saat Ini</label>
                    <div className="space-y-2">
                      {existingAttachments.map((file, idx) => {
                        const url = getAttachmentUrl(file.file_path || file.url);
                        const name = file.file_name || file.name || (url.split('/').pop() || `file-${idx}`);
                        const removed = removedAttachments.includes(file.file_path || file.url);
                        return (
                          <div key={idx} className={`flex items-center justify-between p-3 rounded-lg ${removed ? 'bg-red-50 border border-red-200' : 'bg-gray-50'}`}>
                            <div className="flex items-center space-x-3">
                              <FileText className={`w-5 h-5 ${removed ? 'text-red-500' : 'text-gray-600'}`} />
                              <div>
                                <div className="text-sm font-medium text-gray-900 break-all">{name}</div>
                                <div className="text-xs text-gray-500">{removed ? 'Akan dihapus saat disimpan' : 'Tersimpan'}</div>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              {!removed && (
                                <a href={url} target="_blank" rel="noreferrer" className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg">Lihat</a>
                              )}
                              <button
                                type="button"
                                onClick={() => {
                                  const key = file.file_path || file.url;
                                  setRemovedAttachments(prev => prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]);
                                }}
                                className={`p-2 rounded-lg ${removed ? 'text-gray-700 bg-gray-100 hover:bg-gray-200' : 'text-red-600 hover:bg-red-100'}`}
                              >
                                {removed ? 'Urungkan' : 'Hapus'}
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={uploading}
                  className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
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
  );
};

export default AdminAnekaSurat;
