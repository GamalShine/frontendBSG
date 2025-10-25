import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  Users, 
  Building2, 
  User, 
  Plus, 
  Search, 
  Filter, 
  Edit, 
  Trash2, 
  ChevronDown,
  ChevronRight,
  Phone,
  PhoneCall,
  AlertTriangle,
  MapPin,
  Calendar,
  Wallet,
  Heart,
  Baby,
  Percent,
  ZoomIn,
  ZoomOut,
  Download as DownloadIcon,
  X as CloseIcon,
} from 'lucide-react';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { dataInvestorService } from '@/services/dataInvestorService';
import { API_CONFIG } from '@/config/constants';
import { toast } from 'react-hot-toast';
import AdminDataInvestorForm from './AdminDataInvestorForm';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogBody, DialogFooter } from '@/components/UI/Dialog';
import { MENU_CODES } from '@/config/menuCodes';

const AdminDataInvestor = () => {
  const [activeSection, setActiveSection] = useState('outlet');
  const [dataInvestor, setDataInvestor] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [outletFilter, setOutletFilter] = useState('all');
  
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [outlets, setOutlets] = useState([]);
  const [showFilters, setShowFilters] = useState(false);
  const [expandedOutlets, setExpandedOutlets] = useState({});
  const [editData, setEditData] = useState(null);
  const [initialOpenAttachmentModal, setInitialOpenAttachmentModal] = useState(false);
  // Preview lampiran (gaya halaman Aset/Sewa)
  const [preview, setPreview] = useState({ open: false, url: '', name: '', type: 'other' });
  const [previewText, setPreviewText] = useState('');
  const [previewLoading, setPreviewLoading] = useState(false);
  const [zoom, setZoom] = useState({ scale: 1, x: 0, y: 0 });
  const [fitScale, setFitScale] = useState(1);
  const isDraggingRef = useRef(false);
  const lastPosRef = useRef({ x: 0, y: 0 });
  // Detail modal state
  const [showDetail, setShowDetail] = useState(false);
  const [detailData, setDetailData] = useState(null);

  useEffect(() => {
    fetchDataInvestor();
    fetchOutlets();
  }, []);

  useEffect(() => {
    const initial = {};
    outlets.forEach((o) => { initial[o] = true; });
    setExpandedOutlets(initial);
  }, [outlets]);

  const fetchDataInvestor = async () => {
    try {
      setLoading(true);
      const response = await dataInvestorService.getAllDataInvestor();
      if (response.success) {
        setDataInvestor(response.data);
      }
    } catch (error) {
      console.error('Error fetching data investor:', error);
      setError('Gagal mengambil data investor');
      toast.error('Gagal mengambil data investor');
    } finally {
      setLoading(false);
    }
  };

  // Preview helpers (detect type, open/close)
  const detectFileType = (nameOrUrl) => {
    const s = String(nameOrUrl || '').toLowerCase();
    const imageExts = ['jpg','jpeg','png','gif','webp','bmp'];
    const videoExts = ['mp4','webm','ogg','mov'];
    const officeExts = ['doc','docx','xls','xlsx','ppt','pptx'];
    const textExts = ['txt','csv','md','log','json'];
    if (imageExts.some(x => s.endsWith(`.${x}`))) return 'image';
    if (videoExts.some(x => s.endsWith(`.${x}`))) return 'video';
    if (s.endsWith('.pdf')) return 'pdf';
    if (officeExts.some(x => s.endsWith(`.${x}`))) return 'office';
    if (textExts.some(x => s.endsWith(`.${x}`))) return 'text';
    return 'other';
  };
  const openPreview = (url, name) => {
    setPreview({ open: true, url, name: name || url, type: detectFileType(name || url) });
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

  // Hitung skala awal supaya gambar fit to screen (full terlihat)
  useEffect(() => {
    if (!preview.open || preview.type !== 'image' || !preview.url) return;
    const img = new Image();
    img.onload = () => {
      const vw = Math.max(320, window.innerWidth * 0.92);
      const vh = Math.max(320, window.innerHeight * 0.92);
      const s = Math.min(1, Math.min(vw / img.naturalWidth, vh / img.naturalHeight));
      const initial = Number.isFinite(s) && s > 0 ? s : 1;
      setFitScale(initial);
      setZoom({ scale: initial, x: 0, y: 0 });
      isDraggingRef.current = false;
      lastPosRef.current = { x: 0, y: 0 };
    };
    img.src = preview.url;
  }, [preview.open, preview.type, preview.url]);

  // Reset zoom untuk tipe non-image
  useEffect(() => {
    if (!preview.open || preview.type === 'image') return;
    setZoom({ scale: 1, x: 0, y: 0 });
    isDraggingRef.current = false;
    lastPosRef.current = { x: 0, y: 0 };
  }, [preview.open, preview.type, preview.url]);

  // Load text content for text preview
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

  // Zoom & Pan handlers (image only)
  const handleWheel = (e) => {
    if (preview.type !== 'image') return;
    e.preventDefault();
    const delta = -Math.sign(e.deltaY) * 0.1;
    setZoom((z) => {
      const minScale = Math.max(0.1, fitScale * 0.5);
      const next = Math.min(5, Math.max(minScale, z.scale + delta));
      return next <= fitScale
        ? { scale: next, x: 0, y: 0 }
        : { ...z, scale: next };
    });
  };
  const handleMouseDown = (e) => {
    if (preview.type !== 'image' || zoom.scale <= 1) return;
    isDraggingRef.current = true;
    lastPosRef.current = { x: e.clientX, y: e.clientY };
  };
  const handleMouseMove = (e) => {
    if (preview.type !== 'image' || !isDraggingRef.current) return;
    const dx = e.clientX - lastPosRef.current.x;
    const dy = e.clientY - lastPosRef.current.y;
    lastPosRef.current = { x: e.clientX, y: e.clientY };
    setZoom((z) => ({ ...z, x: z.x + dx, y: z.y + dy }));
  };
  const handleMouseUp = () => { isDraggingRef.current = false; };
  const handleDoubleClick = () => {
    if (preview.type !== 'image') return;
    setZoom((z) => (Math.abs(z.scale - fitScale) < 0.001 ? { scale: Math.min(5, fitScale * 2), x: 0, y: 0 } : { scale: fitScale, x: 0, y: 0 }));
  };

  const fetchOutlets = async () => {
    try {
      const response = await dataInvestorService.getUniqueOutlets();
      if (response.success) {
        setOutlets(response.data);
      }
    } catch (error) {
      console.error('Error fetching outlets:', error);
    }
  };

  const handleDelete = async (id) => {
    try {
      const response = await dataInvestorService.deleteDataInvestor(id);
      if (response.success) {
        toast.success('Data investor berhasil dihapus');
        fetchDataInvestor();
        setShowDeleteConfirm(null);
      }
    } catch (error) {
      console.error('Error deleting data investor:', error);
      toast.error('Gagal menghapus data investor');
    }
  };

  const filteredData = dataInvestor.filter(item => {
    const matchesSearch = 
      item.nama_investor?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.outlet?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.no_hp?.includes(searchTerm) ||
      item.alamat?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesOutlet = outletFilter === 'all' || item.outlet === outletFilter;
    
    return matchesSearch && matchesOutlet;
  });

  // Last updated text mengikuti pola Indonesia panjang
  const lastUpdatedText = useMemo(() => {
    if (!Array.isArray(dataInvestor) || dataInvestor.length === 0) return '-';
    const timestamps = dataInvestor
      .map(d => d.updated_at || d.created_at || d.tanggal_join)
      .filter(Boolean)
      .map(d => new Date(d).getTime());
    if (!timestamps.length) return '-';
    const max = Math.max(...timestamps);
    if (!isFinite(max)) return '-';
    const dt = new Date(max);
    try {
      return format(dt, "d MMMM yyyy 'pukul' HH.mm", { locale: id });
    } catch {
      return '-';
    }
  }, [dataInvestor]);

  const getTipeColor = (tipe) => {
    switch (tipe) {
      case 'outlet': return 'bg-blue-100 text-blue-800';
      case 'biodata': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTipeIcon = (tipe) => {
    switch (tipe) {
      case 'outlet': return <Building2 className="w-4 h-4" />;
      case 'biodata': return <User className="w-4 h-4" />;
      default: return <Users className="w-4 h-4" />;
    }
  };

  // Util: parse persentase string menjadi number 0-100
  // Mendukung format '30%' atau '70%-30%'. Jika ada dua angka, anggap angka terakhir adalah porsi investor.
  const parsePercent = (val) => {
    if (val == null) return 0;
    try {
      const s = val.toString();
      const matches = [...s.matchAll(/(\d+(?:\.\d+)?)%?/g)].map(m => Number(m[1]));
      if (matches.length === 0 || matches.some(n => Number.isNaN(n))) return 0;
      const picked = matches.length >= 2 ? matches[matches.length - 1] : matches[0];
      return Math.max(0, Math.min(100, picked));
    } catch { return 0; }
  };

  // Parse lampiran dari kolom TEXT: bisa string JSON atau array object meta
  const parseLampiran = (raw) => {
    try {
      const val = typeof raw === 'string' ? JSON.parse(raw) : raw;
      if (!Array.isArray(val)) return [];
      return val
        .map((it) => {
          if (typeof it === 'string') {
            const url = it;
            const name = (() => {
              try { const u = new URL(url, window.location.origin); return decodeURIComponent(u.pathname.split('/').pop() || 'file'); } catch { return url.split('/').pop() || 'file'; }
            })();
            return { url, name, mime: '', size: undefined };
          }
          return {
            url: it.url || '#',
            name: it.name || it.originalName || it.filename || it.stored_name || 'file',
            mime: it.mime || it.mimetype || '',
            size: it.size,
          };
        })
        .filter(Boolean);
    } catch {
      return [];
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-red-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="text-red-600 text-xl mb-4">{error}</div>
          <button 
            onClick={fetchDataInvestor}
            className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
          >
            Coba Lagi
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header - konsisten dengan pola merah */}
      <div className="bg-red-800 text-white px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span className="text-sm font-semibold bg-white/10 rounded px-2 py-1">{MENU_CODES.operasional.dataInvestor}</span>
            <div>
              <h1 className="text-xl md:text-2xl font-extrabold tracking-tight">DATA INVESTOR</h1>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={() => { setEditData(null); setInitialOpenAttachmentModal(false); setShowForm(true); }}
              className="inline-flex items-center gap-2 px-4 py-2 bg-white text-red-700 rounded-lg hover:bg-red-50 transition-colors shadow-sm"
            >
              <Plus className="w-4 h-4" />
              <span className="font-semibold">Tambah</span>
            </button>
          </div>
        </div>
      </div>

      {/* Info Update Bar - Abu-abu Muda */}
      <div className="bg-gray-200 px-6 py-2 text-sm text-gray-900">
        Terakhir diupdate: {lastUpdatedText}
      </div>

      {/* Search and Filters - gaya Data Sewa */}
      <div className="bg-white rounded-none md:rounded-xl shadow-sm border border-gray-100 mt-4 mb-4">
        <div className="px-6 py-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Cari Investor</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Cari nama, outlet, hp, alamat..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-red-500 focus:border-transparent"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Outlet</label>
              <select
                value={outletFilter}
                onChange={(e) => setOutletFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-red-500 focus:border-transparent"
              >
                <option value="all">Semua Outlet</option>
                {outlets.map((outlet, index) => (
                  <option key={index} value={outlet}>{outlet}</option>
                ))}
              </select>
            </div>
            <div className="flex items-end">
              <button
                onClick={() => { setSearchTerm(''); setOutletFilter('all'); }}
                className="inline-flex items-center gap-2 px-5 py-2 rounded-full border border-red-600 text-red-700 hover:bg-red-50 transition-colors"
              >
                Reset
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Daftar per Outlet */}
      <div className="px-0 pb-0 space-y-3">
        {outlets.map((outlet) => {
          const outletInvestors = filteredData.filter(item => item.outlet === outlet);
          if (outletInvestors.length === 0) return null;

          return (
            <div key={outlet} className="bg-white rounded-none md:rounded-lg shadow-sm border border-gray-100 overflow-hidden mt-2">
              <button
                type="button"
                onClick={() => setExpandedOutlets(prev => ({ ...prev, [outlet]: !prev[outlet] }))}
                className="w-full bg-red-800 text-white px-6 py-3 flex items-center justify-between hover:bg-red-900 transition-colors"
              >
                <span className="font-semibold text-left">{outlet}</span>
                {expandedOutlets[outlet] ? (
                  <ChevronDown className="w-5 h-5" />
                ) : (
                  <ChevronRight className="w-5 h-5" />
                )}
              </button>

              {expandedOutlets[outlet] && (
              <div className="p-4 bg-white">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-3 gap-y-2">
                {outletInvestors.map((investor) => (
                  <div
                    key={investor.id}
                    className="bg-white rounded-lg shadow-sm border border-gray-100 p-3 hover:shadow-md transition-shadow text-xs cursor-pointer"
                    onClick={() => { setDetailData(investor); setShowDetail(true); }}
                  >
                    {/* Header strip ala Data Sewa */}
                    <div className="flex items-start justify-between px-3 py-2 bg-gray-50 -mx-3 -mt-3 mb-0 border-b border-gray-100">
                      <h4 className="text-sm md:text-base font-semibold text-gray-900 leading-snug break-words pr-2">{investor.nama_investor || '-'}</h4>
                      {(() => {
                        const inv = parsePercent(investor.persentase_bagi_hasil);
                        const bos = Math.max(0, 100 - inv);
                        return (
                          <span className="inline-flex items-center gap-1 px-2 py-1 text-[10px] font-semibold rounded-full border bg-green-50 text-green-700 border-green-200">
                            <Percent className="w-3 h-3" /> {`${bos}% Bosgil — ${inv}% Investor`}
                          </span>
                        );
                      })()}
                    </div>

                    {/* Meta info grid ala Data Sewa (label 130px) */}
                    <div className="mt-2 pt-2 space-y-1.5 text-sm text-gray-700">
                      <div className="grid grid-cols-[130px,1fr] items-center gap-2 leading-5">
                        <span className="text-gray-600">Outlet</span>
                        <span className="text-gray-800">{investor.outlet || '-'}</span>
                      </div>
                      <div className="grid grid-cols-[130px,1fr] items-center gap-2 leading-5">
                        <span className="text-gray-600">Tanggal Join</span>
                        <span className="text-gray-800">{investor.tanggal_join ? format(new Date(investor.tanggal_join), 'dd MMM yyyy', { locale: id }) : '-'}</span>
                      </div>
                      <div className="grid grid-cols-[130px,1fr] items-center gap-2 leading-5">
                        <span className="text-gray-600">No HP</span>
                        <span className="text-gray-800">{investor.no_hp || '-'}</span>
                      </div>
                      <div className="grid grid-cols-[130px,1fr] items-start gap-2 leading-5">
                        <span className="text-gray-600">Alamat</span>
                        <span className="text-gray-800 line-clamp-2 leading-snug">{investor.alamat || '-'}</span>
                      </div>
                      <div className="grid grid-cols-[130px,1fr] items-center gap-2 leading-5">
                        <span className="text-gray-600">Kontak Darurat</span>
                        <span className="text-gray-800">{investor.kontak_darurat || '-'}</span>
                      </div>
                      <div className="grid grid-cols-[130px,1fr] items-center gap-2 leading-5">
                        <span className="text-gray-600">Pasangan</span>
                        <span className="text-gray-800">{investor.nama_pasangan || '-'}</span>
                      </div>
                      <div className="grid grid-cols-[130px,1fr] items-center gap-2 leading-5">
                        <span className="text-gray-600">Anak</span>
                        <span className="text-gray-800">{investor.nama_anak || '-'}</span>
                      </div>
                      <div className="grid grid-cols-[130px,1fr] items-center gap-2 leading-5">
                        <span className="text-gray-600">Ahli Waris</span>
                        <span className="text-gray-800">{investor.ahli_waris || '-'}</span>
                      </div>
                      <div className="grid grid-cols-[130px,1fr] items-center gap-2 leading-5">
                        <span className="text-gray-600">Investasi</span>
                        <span className="text-gray-900">{investor.investasi_di_outlet ? `Rp ${parseFloat(investor.investasi_di_outlet).toLocaleString('id-ID')}` : '-'}</span>
                      </div>
                    </div>

                    {/* Lampiran ala Data Sewa: grid 3 kolom */}
                    {(() => {
                      const files = parseLampiran(investor.lampiran);
                      if (!files.length) return null;
                      return (
                        <div className="pt-2">
                          <div className="text-[11px] font-semibold text-gray-700 mb-1">Lampiran</div>
                          <div className="grid grid-cols-3 gap-2">
                            {files.map((f, idx) => {
                              const rawUrl = f.url || '#';
                              const url = /^https?:\/\//i.test(rawUrl) ? rawUrl : `${API_CONFIG.BASE_HOST}${rawUrl.startsWith('/') ? '' : '/'}${rawUrl}`;
                              const name = f.name || `file-${idx}`;
                              const isImage = (f.mime || '').startsWith('image/') || /\.(jpg|jpeg|png|gif|webp|bmp)$/i.test(name);
                              return (
                                <div key={`${name}-${idx}`} className="border rounded-md p-1 flex flex-col gap-1">
                                  {isImage ? (
                                    <button type="button" onClick={() => { openPreview(url, name); }} className="block text-left" title={name}>
                                      <img src={url} alt={name} className="w-full h-16 object-cover rounded" />
                                    </button>
                                  ) : (
                                    <button type="button" onClick={() => { openPreview(url, name); }} className="text-[10px] text-blue-600 truncate text-left hover:underline" title={name}>
                                      {name}
                                    </button>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })()}

                    {/* Actions */}
                    <div className="flex items-center justify-end gap-2 pt-3">
                      <button
                        className="p-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200"
                        title="Edit Biodata"
                        onClick={(e) => { e.stopPropagation(); setEditData(investor); setInitialOpenAttachmentModal(false); setShowForm(true); }}
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={(e) => { e.stopPropagation(); setShowDeleteConfirm(investor.id); }}
                        className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
                </div>
              </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Konfirmasi Hapus</h3>
            <p className="text-sm text-gray-500 mb-6">
              Apakah Anda yakin ingin menghapus data investor ini? Tindakan ini tidak dapat dibatalkan.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowDeleteConfirm(null)}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
              >
                Batal
              </button>
              <button
                onClick={() => handleDelete(showDeleteConfirm)}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Hapus
              </button>
        </div>
      </div>
        </div>
      )}

      {/* Form Modal */}
      <AdminDataInvestorForm
        isOpen={showForm}
        onClose={() => setShowForm(false)}
        onSuccess={fetchDataInvestor}
        editData={editData}
        initialOpenAttachmentModal={initialOpenAttachmentModal}
      />

      {/* Modal Detail - gaya Jadwal Pembayaran */}
      {showDetail && detailData && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-[1px] flex items-center justify-center z-50 p-4">
          {/* Backdrop click to close */}
          <button
            type="button"
            aria-hidden="true"
            onClick={() => { setShowDetail(false); setDetailData(null); }}
            className="absolute inset-0"
            tabIndex={-1}
          />

          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[92vh] overflow-hidden border border-gray-200 flex flex-col relative">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-red-700 bg-red-800 text-white sticky top-0 z-10">
              <div>
                <h3 className="text-xl font-bold leading-tight">Detail Investor</h3>
              </div>
              <button onClick={() => { setShowDetail(false); setDetailData(null); }} className="p-2 text-white/90 hover:text-white hover:bg-white/10 rounded-lg transition-colors" aria-label="Tutup">
                ✕
              </button>
            </div>

            {/* Body */}
            <div className="flex-1 min-h-0 overflow-y-auto px-6 py-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-gray-800">
                <div>
                  <div className="text-sm text-gray-500 mb-1">Nama Investor</div>
                  <div className="text-base font-medium">{detailData.nama_investor || '-'}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-500 mb-1">Outlet</div>
                  <div className="text-base font-medium">{detailData.outlet || '-'}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-500 mb-1">Tanggal Join</div>
                  <div className="text-base font-medium">{detailData.tanggal_join ? format(new Date(detailData.tanggal_join), 'dd MMM yyyy', { locale: id }) : '-'}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-500 mb-1">No HP</div>
                  <div className="text-base font-medium">{detailData.no_hp || '-'}</div>
                </div>
                <div className="md:col-span-2">
                  <div className="text-sm text-gray-500 mb-1">Alamat</div>
                  <div className="text-base font-medium whitespace-pre-line">{detailData.alamat || '-'}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-500 mb-1">Kontak Darurat</div>
                  <div className="text-base font-medium">{detailData.kontak_darurat || '-'}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-500 mb-1">Pasangan</div>
                  <div className="text-base font-medium">{detailData.nama_pasangan || '-'}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-500 mb-1">Anak</div>
                  <div className="text-base font-medium">{detailData.nama_anak || '-'}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-500 mb-1">Ahli Waris</div>
                  <div className="text-base font-medium">{detailData.ahli_waris || '-'}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-500 mb-1">Investasi</div>
                  <div className="text-base font-medium">{detailData.investasi_di_outlet ? `Rp ${parseFloat(detailData.investasi_di_outlet).toLocaleString('id-ID')}` : '-'}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-500 mb-1">Bagi Hasil</div>
                  <div className="text-base font-medium">
                    {(() => {
                      const inv = parsePercent(detailData.persentase_bagi_hasil);
                      const bos = Math.max(0, 100 - inv);
                      return `${bos}% Bosgil — ${inv}% Investor`;
                    })()}
                  </div>
                </div>
              </div>

              {/* Lampiran */}
              {(() => {
                const files = parseLampiran(detailData.lampiran);
                if (!files.length) return null;
                return (
                  <div className="pt-4">
                    <div className="text-sm font-semibold text-gray-700 mb-2">Lampiran</div>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                      {files.map((f, idx) => {
                        const rawUrl = f.url || '#';
                        const url = /^https?:\/\//i.test(rawUrl) ? rawUrl : `${API_CONFIG.BASE_HOST}${rawUrl.startsWith('/') ? '' : '/'}${rawUrl}`;
                        const name = f.name || `file-${idx}`;
                        const isImage = (f.mime || '').startsWith('image/') || /\.(jpg|jpeg|png|gif|webp|bmp)$/i.test(name);
                        return (
                          <div key={`${name}-${idx}`} className="border rounded-md p-1 flex flex-col gap-1">
                            {isImage ? (
                              <button type="button" onClick={() => { openPreview(url, name); }} className="block text-left" title={name}>
                                <img src={url} alt={name} className="w-full h-28 object-cover rounded" />
                              </button>
                            ) : (
                              <button type="button" onClick={() => { openPreview(url, name); }} className="text-[11px] text-blue-600 truncate text-left hover:underline" title={name}>
                                {name}
                              </button>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })()}
            </div>

            {/* Footer */}
            <div className="p-0 border-t bg-white">
              <div className="px-4 py-3 flex justify-end">
                <button
                  type="button"
                  onClick={() => { setShowDetail(false); setDetailData(null); }}
                  className="px-4 py-2 bg-red-700 text-white font-semibold rounded-lg hover:bg-red-800"
                >
                  Tutup
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Preview Lampiran - gaya halaman Aset/Sewa (overlay full-screen) */}
      {preview.open && (
        <div className="fixed inset-0 bg-black/90 flex items-start justify-center p-0 z-[60]" onClick={closePreview}>
          <div className="relative max-w-[92vw] w-auto h-auto self-start" onClick={(e)=>e.stopPropagation()}>
            {/* Actions kanan atas */}
            <div className="fixed top-4 right-4 z-[61] flex items-center gap-2" onClick={(e)=>e.stopPropagation()}>
              <a
                href={preview.url}
                download
                target="_blank"
                rel="noreferrer"
                className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white shadow focus:outline-none"
                aria-label="Download"
                title="Download"
              >
                <DownloadIcon className="w-5 h-5" />
              </a>
              <button
                type="button"
                onClick={closePreview}
                className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white shadow focus:outline-none"
                aria-label="Tutup"
                title="Tutup (Esc)"
              >
                <CloseIcon className="w-5 h-5" />
              </button>
            </div>
            {/* Zoom controls */}
            <div className="fixed top-16 right-4 z-[61] flex flex-col items-center gap-2" onClick={(e)=>e.stopPropagation()}>
              <button
                type="button"
                onClick={() => setZoom(z => ({ ...z, scale: Math.min(5, z.scale + 0.25) }))}
                disabled={preview.type !== 'image'}
                className={`p-2 rounded-full shadow ${preview.type !== 'image' ? 'bg-white/10 text-white/40 cursor-not-allowed' : 'bg-white/10 hover:bg-white/20 text-white'}`}
                aria-label="Perbesar"
                title="Perbesar"
              >
                <ZoomIn className="w-5 h-5" />
              </button>
              <button
                type="button"
                onClick={() => setZoom(z => {
                  const minScale = Math.max(0.1, fitScale * 0.5);
                  const nextScale = Math.max(minScale, z.scale - 0.25);
                  return { ...z, scale: nextScale, x: nextScale <= fitScale ? 0 : z.x, y: nextScale <= fitScale ? 0 : z.y };
                })}
                disabled={preview.type !== 'image'}
                className={`p-2 rounded-full shadow ${preview.type !== 'image' ? 'bg-white/10 text-white/40 cursor-not-allowed' : 'bg-white/10 hover:bg-white/20 text-white'}`}
                aria-label="Perkecil"
                title="Perkecil"
              >
                <ZoomOut className="w-5 h-5" />
              </button>
            </div>
            {/* Nama file kiri atas */}
            <div className="fixed top-4 left-4 z-[61] text-white/90 text-xs max-w-[60vw] truncate" title={preview.name}>
              {preview.name}
            </div>
            {/* Konten */}
            {preview.type === 'image' && (
              <div
                className="max-w-[92vw] overflow-hidden cursor-grab active:cursor-grabbing select-none mt-0"
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
                  style={{ transform: `translate(${zoom.x}px, ${zoom.y}px) scale(${zoom.scale})`, transformOrigin: 'top center' }}
                  className="block max-w-[92vw] w-auto h-auto object-contain"
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
              <div className="text-center text-sm text-white/90 max-w-[80vw]">
                <a href={preview.url} target="_blank" rel="noreferrer" className="inline-block px-3 py-1.5 rounded bg-white/10 hover:bg-white/20 text-white">Buka di tab baru</a>
              </div>
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

export default AdminDataInvestor;
