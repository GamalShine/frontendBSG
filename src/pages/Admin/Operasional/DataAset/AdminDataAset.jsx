import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  Building2, 
  Car, 
  Monitor, 
  Search, 
  Filter, 
  Eye, 
  Edit, 
  Trash2, 
  Plus,
  ChevronDown,
  ChevronRight,
  MapPin,
  User,
  Calendar,
  FileText,
  Shield,
  Wrench,
  Car as CarIcon,
  AlertCircle,
  X,
  Download,
  ZoomIn,
  ZoomOut
} from 'lucide-react';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { dataAsetService } from '@/services/dataAsetService';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogBody, DialogFooter } from '@/components/UI/Dialog';
import { API_CONFIG } from '@/config/constants';
import { toast } from 'react-hot-toast';
import AdminDataAsetForm from './AdminDataAsetForm';

const AdminDataAset = () => {
  const [activeSection, setActiveSection] = useState('properti');
  const [dataAset, setDataAset] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [kategoriFilter, setKategoriFilter] = useState('all');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editData, setEditData] = useState(null);
  const [showDetail, setShowDetail] = useState(false);
  const [detailItem, setDetailItem] = useState(null);
  // Preview lampiran (in-page)
  const [preview, setPreview] = useState({ open: false, url: '', name: '', type: 'other' });
  const [previewText, setPreviewText] = useState('');
  const [previewLoading, setPreviewLoading] = useState(false);
  // Zoom & Pan state untuk preview image
  const [zoom, setZoom] = useState({ scale: 1, x: 0, y: 0 });
  const isDraggingRef = useRef(false);
  const lastPosRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    console.log('[AdminDataAset] mounted - versi UI: poskas-style v1');
    fetchDataAset();
  }, []);

  const fetchDataAset = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await dataAsetService.getAllDataAset();
      setDataAset(response.data.items || []);
    } catch (error) {
      console.error('Error fetching data aset:', error);
      setError('Gagal memuat data aset');
      toast.error('Gagal memuat data aset');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Apakah Anda yakin ingin menghapus data aset ini?')) {
      return;
    }
    
    try {
      const response = await dataAsetService.deleteDataAset(id);
      if (response.success) {
        toast.success('Data aset berhasil dihapus');
        fetchDataAset();
      } else {
        toast.error('Gagal menghapus data aset');
      }
    } catch (error) {
      console.error('Error deleting data aset:', error);
      toast.error('Gagal menghapus data aset');
    }
  };

  const getKategoriIcon = (kategori) => {
    switch (kategori) {
      case 'PROPERTI':
        return <Building2 className="w-5 h-5 text-blue-600" />;
      case 'KENDARAAN_PRIBADI':
      case 'KENDARAAN_OPERASIONAL':
      case 'KENDARAAN_DISTRIBUSI':
        return <CarIcon className="w-5 h-5 text-green-600" />;
      case 'ELEKTRONIK':
        return <Monitor className="w-5 h-5 text-purple-600" />;
      default:
        return <FileText className="w-5 h-5 text-gray-600" />;
    }
  };

  const getKategoriColor = (kategori) => {
    switch (kategori) {
      case 'PROPERTI':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'KENDARAAN_PRIBADI':
      case 'KENDARAAN_OPERASIONAL':
      case 'KENDARAAN_DISTRIBUSI':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'ELEKTRONIK':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getKategoriLabel = (kategori) => {
    switch (kategori) {
      case 'PROPERTI':
        return 'Properti';
      case 'KENDARAAN_PRIBADI':
        return 'Kendaraan Pribadi';
      case 'KENDARAAN_OPERASIONAL':
        return 'Kendaraan Operasional';
      case 'KENDARAAN_DISTRIBUSI':
        return 'Kendaraan Distribusi';
      case 'ELEKTRONIK':
        return 'Elektronik';
      default:
        return kategori;
    }
  };

  const toFileUrl = (p) => {
    if (!p) return '#'
    const raw = String(p)
    if (/^https?:\/\//i.test(raw)) return raw
    const clean = raw.replace(/^\/+/, '')
    const url = `${API_CONFIG.BASE_HOST}/${clean}`
    return encodeURI(url)
  }

  // Helpers preview
  const detectFileType = (extOrMime) => {
    const s = String(extOrMime || '').toLowerCase();
    const isImage = s.startsWith('image/') || ['jpg','jpeg','png','gif','webp','bmp'].includes(s);
    const isVideo = s.startsWith('video/') || ['mp4','webm','ogg','mov'].includes(s) || s.endsWith('.mp4') || s.endsWith('.webm') || s.endsWith('.ogg') || s.endsWith('.mov');
    const isPdf = s === 'application/pdf' || s.endsWith('.pdf');
    const officeExts = ['doc','docx','xls','xlsx','ppt','pptx'];
    const officeMimes = [
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-powerpoint',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation'
    ];
    const isOffice = officeExts.some(x => s.endsWith(`.${x}`)) || officeMimes.some(m => s.includes(m));
    const isText = s.startsWith('text/') || ['txt','csv','md','log','json'].some(x => s.endsWith(`.${x}`));
    if (isImage) return 'image';
    if (isVideo) return 'video';
    if (isPdf) return 'pdf';
    if (isOffice) return 'office';
    if (isText) return 'text';
    return 'other';
  };
  const openPreview = (url, name, hint) => {
    const type = detectFileType(hint || name || url);
    setPreview({ open: true, url, name: name || url, type });
    setPreviewText('');
    setPreviewLoading(false);
  };
  const closePreview = () => setPreview({ open: false, url: '', name: '', type: 'other' });

  // ESC close
  useEffect(() => {
    const onKeyDown = (e) => { if (e.key === 'Escape') closePreview(); };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  // Reset zoom saat buka/ubah file
  useEffect(() => {
    if (preview.open) {
      setZoom({ scale: 1, x: 0, y: 0 });
      isDraggingRef.current = false;
      lastPosRef.current = { x: 0, y: 0 };
    }
  }, [preview.open, preview.url]);

  // Load text content (frontend-only)
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

  // Zoom & Pan handlers
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

  const renderAsetCard = (aset) => (
    <div
      key={aset.id}
      onClick={() => { setDetailItem(aset); setShowDetail(true); }}
      className="bg-white rounded-xl shadow-sm border border-gray-100 p-3 hover:shadow-md transition-shadow cursor-pointer text-sm"
    >
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center">
          <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getKategoriColor(aset.kategori)}`}>
            {getKategoriLabel(aset.kategori)}
          </span>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={(e) => { e.stopPropagation(); setEditData(aset); setShowForm(true); }}
            className="p-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200"
            title="Edit"
          >
            <Edit className="w-4 h-4" />
          </button>
          <button 
            onClick={(e) => { e.stopPropagation(); handleDelete(aset.id); }}
            className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200" 
            title="Hapus"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="space-y-1 text-sm">
        {/* Nama Aset */}
        {aset.nama_aset && (
          <div className="grid grid-cols-[120px,1fr] items-center gap-2 leading-5">
            <span className="text-gray-700">Nama Aset</span>
            <span className="text-gray-900">{aset.nama_aset}</span>
          </div>
        )}

        {/* Merk Kendaraan */}
        {aset.merk_kendaraan && (
          <div className="grid grid-cols-[120px,1fr] items-center gap-2 leading-5">
            <span className="text-gray-700">Merk</span>
            <span className="text-gray-900">{aset.merk_kendaraan}</span>
          </div>
        )}

        {/* Nama Barang Elektronik */}
        {aset.nama_barang && (
          <div className="grid grid-cols-[120px,1fr] items-center gap-2 leading-5">
            <span className="text-gray-700">Nama Barang</span>
            <span className="text-gray-900">{aset.nama_barang}</span>
          </div>
        )}

        {/* Lokasi */}
        {aset.lokasi && (
          <div className="grid grid-cols-[120px,1fr] items-center gap-2 leading-5">
            <span className="text-gray-700">Lokasi</span>
            <span className="text-gray-900">{aset.lokasi}</span>
          </div>
        )}

        {/* Atas Nama */}
        {aset.atas_nama && (
          <div className="grid grid-cols-[120px,1fr] items-center gap-2 leading-5">
            <span className="text-gray-700">Atas Nama</span>
            <span className="text-gray-900">{aset.atas_nama}</span>
          </div>
        )}

        {/* Status */}
        {aset.status && (
          <div className="grid grid-cols-[120px,1fr] items-center gap-2 leading-5">
            <span className="text-gray-700">Status</span>
            <span className="text-gray-900">{aset.status}</span>
          </div>
        )}

        {/* Data Pembelian */}
        {aset.data_pembelian && (
          <div className="grid grid-cols-[120px,1fr] items-center gap-2 leading-5">
            <span className="text-gray-700">Pembelian</span>
            <span className="text-gray-900">{aset.data_pembelian}</span>
          </div>
        )}

        {/* Penanggung Jawab */}
        {aset.penanggung_jawab && (
          <div className="grid grid-cols-[120px,1fr] items-center gap-2 leading-5">
            <span className="text-gray-700">Penanggung Jawab</span>
            <span className="text-gray-900">{aset.penanggung_jawab}</span>
          </div>
        )}

        {/* Kendaraan Specific Fields */}
        {['KENDARAAN_PRIBADI', 'KENDARAAN_OPERASIONAL', 'KENDARAAN_DISTRIBUSI'].includes(aset.kategori) && (
          <>
            {aset.plat_nomor && (
              <div className="grid grid-cols-[120px,1fr] items-center gap-2 leading-5">
                <span className="text-gray-700">Plat</span>
                <span className="text-gray-900">{aset.plat_nomor}</span>
              </div>
            )}
            {aset.pajak_berlaku && (
              <div className="grid grid-cols-[120px,1fr] items-center gap-2 leading-5">
                <span className="text-gray-700">Pajak</span>
                <span className="text-gray-900">{aset.pajak_berlaku}</span>
              </div>
            )}
            {aset.stnk_berlaku && (
              <div className="grid grid-cols-[120px,1fr] items-center gap-2 leading-5">
                <span className="text-gray-700">STNK</span>
                <span className="text-gray-900">{aset.stnk_berlaku}</span>
              </div>
            )}
          </>
        )}

        {/* Elektronik Specific Fields */}
        {aset.kategori === 'ELEKTRONIK' && (
          <>
            {aset.merk && (
              <div className="grid grid-cols-[120px,1fr] items-center gap-2 leading-5">
                <span className="text-gray-700">Merk</span>
                <span className="text-gray-900">{aset.merk}</span>
              </div>
            )}
            {aset.model && (
              <div className="grid grid-cols-[120px,1fr] items-center gap-2 leading-5">
                <span className="text-gray-700">Model</span>
                <span className="text-gray-900">{aset.model}</span>
              </div>
            )}
            {aset.serial_number && (
              <div className="grid grid-cols-[120px,1fr] items-center gap-2 leading-5">
                <span className="text-gray-700">SN</span>
                <span className="text-gray-900">{aset.serial_number}</span>
              </div>
            )}
          </>
        )}

        {/* Properti Specific Fields */}
        {aset.kategori === 'PROPERTI' && (
          <>
            {aset.no_sertifikat && (
              <div className="grid grid-cols-[120px,1fr] items-center gap-2 leading-5">
                <span className="text-gray-700">Sertifikat</span>
                <span className="text-gray-900">{aset.no_sertifikat}</span>
              </div>
            )}
            {aset.data_pbb && (
              <div className="grid grid-cols-[120px,1fr] items-center gap-2 leading-5">
                <span className="text-gray-700">PBB</span>
                <span className="text-gray-900">{aset.data_pbb}</span>
              </div>
            )}
          </>
        )}
      </div>

      <div className="mt-2 pt-2 border-t border-gray-100">
        <div className="flex items-center justify-between text-xs text-gray-500">
          <span>Created by: {aset.creator?.nama || 'Unknown'}</span>
          <span>{format(new Date(aset.created_at), 'dd MMM yyyy', { locale: id })}</span>
        </div>
      </div>

      {/* Lampiran section */}
      <div className="mt-3">
        <div className="flex items-center mb-1">
          <span className="text-[11px] font-semibold text-gray-700">Lampiran</span>
        </div>
        <div className="space-y-1">
          {(Array.isArray(aset.lampiran) ? aset.lampiran : []).length === 0 ? (
            <p className="text-[11px] text-gray-500">Belum ada lampiran</p>
          ) : (
            <div className="grid grid-cols-3 gap-2">
              {(aset.lampiran || []).map((file, idx) => {
                const url = toFileUrl(file.path)
                const isImage = String(file.mimetype || '').startsWith('image/')
                return (
                  <div key={idx} className="border rounded-md p-1 flex flex-col gap-1">
                    {isImage ? (
                      <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); openPreview(url, file.originalname || file.filename, file.mimetype || file.path) }}
                        className="block text-left"
                        title={file.originalname}
                      >
                        <img src={url} alt={file.originalname} className="w-full h-16 object-cover rounded" />
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); openPreview(url, file.originalname || file.filename, file.mimetype || file.path) }}
                        className="text-[10px] text-blue-600 truncate text-left hover:underline"
                        title={file.originalname}
                      >
                        {file.originalname || file.filename}
                      </button>
                    )}
                    <button
                      onClick={async (e) => {
                        e.stopPropagation();
                        if (!window.confirm('Hapus lampiran ini?')) return
                        try {
                          await dataAsetService.deleteLampiran(aset.id, idx)
                          toast.success('Lampiran dihapus')
                          await fetchDataAset()
                        } catch (err) {
                          toast.error('Gagal menghapus lampiran')
                        }
                      }}
                      className="text-[10px] text-red-600 hover:underline text-left"
                    >
                      Hapus
                    </button>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );

  // Filter hanya berdasarkan nama (sesuai permintaan): gunakan nama_aset atau fallback ke merk/nama_barang
  const filteredData = dataAset.filter(aset => {
    const q = (searchTerm || '').toLowerCase().trim();
    if (!q) return true;
    const name = (aset.nama_aset || aset.merk_kendaraan || aset.nama_barang || '').toLowerCase();
    return name.includes(q);
  });

  const groupedData = {
    properti: filteredData.filter(aset => aset.kategori === 'PROPERTI'),
    kendaraan: filteredData.filter(aset => ['KENDARAAN_PRIBADI', 'KENDARAAN_OPERASIONAL', 'KENDARAAN_DISTRIBUSI'].includes(aset.kategori)),
    elektronik: filteredData.filter(aset => aset.kategori === 'ELEKTRONIK')
  };

  // Counts per specific categories for stats cards
  const countProperti = groupedData.properti.length;
  const countKendaraanPribadi = filteredData.filter(aset => aset.kategori === 'KENDARAAN_PRIBADI').length;
  const countKendaraanOperasional = filteredData.filter(aset => aset.kategori === 'KENDARAAN_OPERASIONAL').length;
  const countKendaraanDistribusi = filteredData.filter(aset => aset.kategori === 'KENDARAAN_DISTRIBUSI').length;
  const countElektronik = groupedData.elektronik.length;

  // Hitung teks "Terakhir diupdate" dari created_at terbaru
  const lastUpdatedText = useMemo(() => {
    if (!Array.isArray(dataAset) || dataAset.length === 0) return '-';
    // Ambil item dengan created_at paling baru
    const latest = [...dataAset]
      .filter(i => !!i?.created_at)
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))[0];
    const dt = latest?.created_at;
    if (!dt) return '-';
    try {
      return format(new Date(dt), "d MMMM yyyy 'pukul' HH.mm", { locale: id });
    } catch (e) {
      return '-';
    }
  }, [dataAset]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Memuat data aset...</p>
        </div>
      </div>
    );
  }

  if (error) {
  return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <p className="text-red-600 text-lg mb-4">{error}</p>
          <button 
            onClick={fetchDataAset}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Coba Lagi
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-0 bg-gray-50 min-h-screen">
      {/* Header - match OMSET HARIAN style */}
      <div className="bg-red-800 text-white px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span className="text-sm font-semibold bg-white/10 rounded px-2 py-1">A01-O1</span>
            <div>
              <h1 className="text-xl md:text-2xl font-extrabold tracking-tight">DATA ASET</h1>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setShowForm(true)}
              className="hidden md:inline-flex items-center gap-2 px-4 py-2 bg-white text-red-700 rounded-lg hover:bg-red-50 transition-colors shadow-sm"
            >
              <Plus className="h-4 w-4" />
              <span className="font-semibold">Tambah</span>
            </button>
          </div>
        </div>
      </div>

      {/* Info bar */}
      <div className="bg-gray-200 px-6 py-2 text-sm text-gray-900">Terakhir diupdate: {lastUpdatedText}</div>

      {/* Pencarian Nama Saja */}
      <div className="bg-white rounded-none md:rounded-xl shadow-sm border border-gray-100 mt-4 mb-2">
        <div className="px-6 py-4">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Cari berdasarkan nama</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e)=>setSearchTerm(e.target.value)}
                placeholder="Ketik nama aset (atau merk/nama barang)"
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-red-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Daftar Aset (flat list) */}
      <div className="bg-white rounded-none md:rounded-xl shadow-sm border border-gray-100 overflow-hidden mt-2">
        <div className="p-4">
          {filteredData.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-3 gap-y-2">
              {filteredData.map(renderAsetCard)}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">Tidak ada data</div>
          )}
        </div>
      </div>


      {/* FAB Tambah (mobile only) */}
      <button
        type="button"
        onClick={() => setShowForm(true)}
        className="md:hidden fixed bottom-6 right-4 z-40 w-14 h-14 rounded-full bg-red-600 text-white shadow-lg flex items-center justify-center active:scale-95"
        aria-label="Tambah Data Aset"
      >
        <Plus className="w-6 h-6" />
      </button>

      {/* Form Modal */}
      <AdminDataAsetForm
        isOpen={showForm}
        onClose={() => { setShowForm(false); setEditData(null); }}
        onSuccess={fetchDataAset}
        editData={editData}
      />

      {/* Detail Modal (styled like form modal) */}
      <Dialog open={showDetail} onOpenChange={setShowDetail}>
        <DialogContent className="p-0 max-w-3xl overflow-hidden scrollbar-hide">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-h-[92vh] overflow-hidden border border-gray-200 flex flex-col scrollbar-hide">
            {/* Body (with sticky header inside the scroll area) */}
            <div className="flex-1 min-h-0 overflow-y-auto overscroll-none px-0 pt-0 scrollbar-hide">
              {/* Header inside scroll container to ensure it stays fixed relative to scroll */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-red-700 bg-red-800 text-white sticky top-0 z-10">
                <div className="flex items-center gap-3">
                  <div>
                    <h2 className="text-xl font-bold leading-tight">Detail Aset</h2>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowDetail(false)}
                  className="p-2 text-white/90 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                  aria-label="Tutup"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Content */}
              <div className="px-6 py-5 space-y-4">
                {detailItem && (
                <div className="space-y-4">
                  {/* Jenis Aset (tanpa ikon) */}
                  <div className="rounded-xl border bg-white p-3">
                    <div>
                      <div className="text-xs text-gray-700">Jenis Aset</div>
                      <div className="text-base font-semibold text-gray-900">{getKategoriLabel(detailItem.kategori)}</div>
                    </div>
                  </div>

                  {/* Detail Properti */}
                  <div className="rounded-xl border bg-white">
                    <div className="px-4 py-3 border-b bg-gray-50 rounded-t-xl">
                      <div className="text-sm font-semibold text-gray-700">Detail Properti</div>
                    </div>
                    <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <div className="text-xs font-semibold text-gray-700 mb-1">Nama Aset</div>
                        <div className="text-gray-800">{detailItem.nama_aset || detailItem.merk_kendaraan || detailItem.nama_barang || '-'}</div>
                      </div>
                      <div>
                        <div className="text-xs font-semibold text-gray-700 mb-1">No. Sertifikat</div>
                        <div className="text-gray-800">{detailItem.no_sertifikat || '-'}</div>
                      </div>
                      <div className="md:col-span-2">
                        <div className="text-xs font-semibold text-gray-700 mb-1">Data PBB</div>
                        <div className="text-gray-800">{detailItem.data_pbb || '-'}</div>
                      </div>
                    </div>
                  </div>

                  {/* Informasi Umum */}
                  <div className="rounded-xl border bg-white">
                    <div className="px-4 py-3 border-b bg-gray-50 rounded-t-xl">
                      <div className="text-sm font-semibold text-gray-700">Informasi Umum</div>
                    </div>
                    <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <div className="text-xs font-bold text-gray-700 mb-1">Status</div>
                        <div className="text-gray-800">
                          {(() => {
                            const val = detailItem.status || detailItem.status_aset || detailItem.kondisi;
                            return val && String(val).trim() !== '' ? val : '-';
                          })()}
                        </div>
                      </div>
                      <div className="md:col-span-2">
                        <div className="text-xs font-bold text-gray-700 mb-1">Nama/Barang</div>
                        <div className="text-gray-800">{detailItem.nama_aset || detailItem.merk_kendaraan || detailItem.nama_barang || '-'}</div>
                      </div>
                      <div className="md:col-span-2">
                        <div className="text-xs font-bold text-gray-700 mb-1">Lokasi</div>
                        <div className="text-gray-800">{detailItem.lokasi || '-'}</div>
                      </div>
                      <div>
                        <div className="text-xs font-semibold text-gray-700 mb-1">Atas Nama</div>
                        <div className="text-gray-800">{detailItem.atas_nama || '-'}</div>
                      </div>
                      <div>
                        <div className="text-xs font-semibold text-gray-700 mb-1">Data Pembelian</div>
                        <div className="text-gray-800">{detailItem.data_pembelian || '-'}</div>
                      </div>
                      <div>
                        <div className="text-xs font-semibold text-gray-700 mb-1">Penanggung Jawab</div>
                        <div className="text-gray-800">{detailItem.penanggung_jawab || '-'}</div>
                      </div>
                      {/* Lampiran dipindahkan ke Informasi Umum */}
                      <div className="md:col-span-2">
                        <div className="text-xs font-semibold text-gray-700 mb-1">Lampiran</div>
                        {Array.isArray(detailItem.lampiran) && detailItem.lampiran.length > 0 ? (
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                            {detailItem.lampiran.map((file, idx) => {
                              const isImage = String(file.mimetype || '').startsWith('image/');
                              const url = toFileUrl(file.path);
                              const name = file.originalname || file.filename || `file-${idx}`;
                              return (
                                <div key={idx} className="border rounded p-2 text-xs bg-white">
                                  {isImage ? (
                                    <button type="button" onClick={() => openPreview(url, name, file.mimetype || file.path)} className="block w-full text-left">
                                      <img src={url} alt={name} className="w-full h-24 object-cover rounded" />
                                    </button>
                                  ) : (
                                    <button type="button" onClick={() => openPreview(url, name, file.mimetype || file.path)} className="block w-full h-24 bg-gray-50 rounded border flex items-center justify-center">
                                      <span className="font-semibold text-gray-700" title={name}>{(name.split('.').pop() || 'FILE').toUpperCase()}</span>
                                    </button>
                                  )}
                                  <div className="mt-2 truncate" title={name}>{name}</div>
                                </div>
                              );
                            })}
                          </div>
                        ) : (
                          <div className="text-xs text-gray-500">Tidak ada lampiran.</div>
                        )}
                      </div>
                    </div>
                  </div>
                  {/* Tombol aksi berada di paling bawah konten, tidak sticky */}
                  <div className="mt-2 border-t bg-white">
                    <div className="grid grid-cols-2 gap-2 px-2 py-2">
                      <button
                        type="button"
                        onClick={() => { setShowDetail(false); setEditData(detailItem); setShowForm(true); }}
                        className="w-full py-2 bg-red-700 text-white font-semibold hover:bg-red-800 transition-colors rounded-lg"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowDetail(false)}
                        className="w-full py-2 bg-red-700 text-white font-semibold hover:bg-red-800 transition-colors rounded-lg"
                      >
                        Tutup
                      </button>
                    </div>
                  </div>
                </div>
                )}
              </div>
            </div>

            
          </div>
        </DialogContent>
      </Dialog>
      {/* Preview Lampiran Modal (clean, Drive-like) */}
      {preview.open && (
        <div className="fixed inset-0 bg-black/90 flex items-center justify-center p-0 z-[60]" onClick={closePreview}>
          <div className="relative max-w-[92vw] max-h-[92vh] w-auto h-auto" onClick={(e)=>e.stopPropagation()}>
            {/* Actions (Download & Close) - pojok kanan atas (fixed ke layar) */}
            <div className="fixed top-4 right-4 z-[61] flex items-center gap-2" onClick={(e)=>e.stopPropagation()}>
              <a
                href={preview.url}
                download
                target="_blank"
                rel="noreferrer"
                className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white shadow focus:outline-none"
                aria-label="Download"
                title="Download"
                onClick={(e)=>e.stopPropagation()}
              >
                <Download className="w-5 h-5" />
              </a>
              <button
                type="button"
                onClick={closePreview}
                className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white shadow focus:outline-none"
                aria-label="Tutup"
                title="Tutup (Esc)"
              >
                ✕
              </button>
            </div>
            {/* Zoom controls - vertikal di bawah tombol X/Download (fixed ke layar) */}
            <div className="fixed top-16 right-4 z-[61] flex flex-col items-center gap-2" onClick={(e)=>e.stopPropagation()}>
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); setZoom(z => ({ ...z, scale: Math.min(5, z.scale + 0.25) })) }}
                disabled={preview.type !== 'image'}
                className={`p-2 rounded-full shadow ${preview.type !== 'image' ? 'bg-white/10 text-white/50 cursor-not-allowed' : 'bg-white/10 hover:bg-white/20 text-white'}`}
                aria-label="Zoom In"
                title="Perbesar"
              >
                <ZoomIn className="w-5 h-5" />
              </button>
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); setZoom(z => ({ ...z, scale: Math.max(0.5, z.scale - 0.25), x: (z.scale - 0.25) <= 1 ? 0 : z.x, y: (z.scale - 0.25) <= 1 ? 0 : z.y })) }}
                disabled={preview.type !== 'image'}
                className={`p-2 rounded-full shadow ${preview.type !== 'image' ? 'bg-white/10 text-white/50 cursor-not-allowed' : 'bg-white/10 hover:bg-white/20 text-white'}`}
                aria-label="Zoom Out"
                title="Perkecil"
              >
                <ZoomOut className="w-5 h-5" />
              </button>
            </div>
            {/* Filename badge - pojok kiri atas (fixed ke layar) */}
            <div className="fixed top-4 left-4 z-[61] text-white/90 text-xs max-w-[60vw] truncate" title={preview.name}>
              {preview.name}
            </div>
            {/* Content */}
            {preview.type === 'image' && (
              <div
                className="max-h-[92vh] max-w-[92vw] overflow-hidden cursor-grab active:cursor-grabbing select-none"
                onWheel={handleWheel}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
                onDoubleClick={handleDoubleClick}
              >
                <img
                  src={preview.url}
                  alt={preview.name}
                  draggable={false}
                  style={{ transform: `translate(${zoom.x}px, ${zoom.y}px) scale(${zoom.scale})`, transformOrigin: 'center center' }}
                  className="max-h-[92vh] max-w-[92vw] w-auto h-auto object-contain"
                />
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
    </div>
  );
};

export default AdminDataAset;

