import React, { useEffect, useMemo, useRef, useState } from 'react';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { adminDataBinaLingkunganService as service } from '../../../../services/dataBinaLingkunganService';
import { MENU_CODES } from '@/config/menuCodes';
import { API_CONFIG } from '@/config/constants';
import {
  Search,
  Plus,
  Phone,
  MapPin,
  User,
  Briefcase,
  Wallet,
  ChevronDown,
  ChevronRight,
  Edit as EditIcon,
  Trash2,
  Paperclip,
  ZoomIn,
  ZoomOut,
  Download as DownloadIcon,
  X as CloseIcon
} from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogBody, DialogFooter } from '@/components/UI/Dialog';

const defaultForm = {
  lokasi: '',
  jabatan: '',
  nama: '',
  no_hp: '',
  alamat: '',
  nominal: ''
};

const AdminDataBinaLingkungan = () => {
  const [items, setItems] = useState([]);
  const [pagination, setPagination] = useState({ currentPage: 1, totalPages: 1, itemsPerPage: 50, totalItems: 0 });
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [filterLoading, setFilterLoading] = useState(false);
  const [lokasiFilter, setLokasiFilter] = useState('');
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(defaultForm);
  const [formFiles, setFormFiles] = useState([]); // lampiran untuk modal tambah/edit
  // Lampiran state
  const [lampiranOpen, setLampiranOpen] = useState(false);
  const [lampiranTarget, setLampiranTarget] = useState(null); // { id, nama }
  const [lampiranItems, setLampiranItems] = useState([]);
  const [uploadingLampiran, setUploadingLampiran] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [lampiranMap, setLampiranMap] = useState({}); // id -> array lampiran
  // Preview lampiran (overlay ala Aset/Sewa)
  const [preview, setPreview] = useState({ open: false, url: '', name: '', type: 'other' });
  const [previewText, setPreviewText] = useState('');
  const [previewLoading, setPreviewLoading] = useState(false);
  const [zoom, setZoom] = useState({ scale: 1, x: 0, y: 0 });
  const [fitScale, setFitScale] = useState(1);
  const isDraggingRef = useRef(false);
  const lastPosRef = useRef({ x: 0, y: 0 });
  // Lampiran untuk modal edit (existing attachments)
  const [editLampiran, setEditLampiran] = useState([]);
  // Detail modal
  const [showDetail, setShowDetail] = useState(false);
  const [detailItem, setDetailItem] = useState(null);

  const params = useMemo(() => ({ page: pagination.currentPage, limit: pagination.itemsPerPage, search: debouncedSearch, lokasi: lokasiFilter }), [pagination.currentPage, pagination.itemsPerPage, debouncedSearch, lokasiFilter]);

  // Tampilkan semua data di satu halaman: set limit besar dan page = 1
  useEffect(() => {
    setPagination(p => ({ ...p, currentPage: 1, itemsPerPage: 100000 }));
  }, []);

  // Debounce pencarian 300ms
  useEffect(() => {
    setFilterLoading(true);
    const t = setTimeout(() => {
      setDebouncedSearch(search);
      // reset ke halaman 1 saat ganti kata kunci
      setPagination(p => ({ ...p, currentPage: 1 }));
      setFilterLoading(false);
    }, 300);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  // Preview helpers
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

  useEffect(() => {
    const onKeyDown = (e) => { if (e.key === 'Escape') closePreview(); };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  // Hitung skala awal agar gambar terlihat penuh (fit to screen)
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

  const handleWheel = (e) => {
    if (preview.type !== 'image') return;
    e.preventDefault();
    const delta = -Math.sign(e.deltaY) * 0.1;
    setZoom((z) => {
      const minScale = Math.max(0.1, fitScale * 0.5);
      let nextScale = Math.min(5, Math.max(minScale, z.scale + delta));
      if (Math.abs(nextScale - 1) < 0.001) return { scale: 1, x: 0, y: 0 };
      return { ...z, scale: nextScale };
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
    setZoom((z) => (z.scale === 1 ? { scale: 2, x: 0, y: 0 } : { scale: 1, x: 0, y: 0 }));
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      setFilterLoading(true);
      setError('');
      const { data } = await service.getAll(params);
      if (data?.success) {
        const nextItems = data.data.items || [];
        setItems(nextItems);
        setPagination(prev => ({ ...prev, ...(data.data.pagination || {}) }));
        // Prefetch lampiran utk item halaman ini (agar tampil di card list)
        try {
          const idsToFetch = nextItems.map(it => it.id).filter(id => !(id in lampiranMap));
          if (idsToFetch.length) {
            const results = await Promise.all(idsToFetch.map(async (id) => {
              try {
                const { data } = await service.getLampiran(id);
                return { id, files: (data?.data || []) };
              } catch {
                return { id, files: [] };
              }
            }));
            setLampiranMap(prev => {
              const nextMap = { ...prev };
              results.forEach(r => { nextMap[r.id] = r.files; });
              return nextMap;
            });
          }
        } catch {
          // ignore prefetch error
        }
      } else {
        setError('Gagal memuat data');
      }
    } catch (err) {
      setError(err?.response?.data?.message || 'Gagal memuat data');
    } finally {
      setLoading(false);
      setFilterLoading(false);
    }
  };

  const fetchLocations = async () => {
    try {
      const { data } = await service.getLocations();
      if (data?.success) setLocations(data.data || []);
    } catch (e) {
      // ignore
    }
  };

  useEffect(() => {
    fetchLocations();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params]);

  // Helpers UI & data
  const formatRupiah = (val) => {
    const num = Number(val || 0);
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(num);
  };

  const formatUpdatedAt = (val) => {
    if (!val) return '-';
    try {
      return format(new Date(val), 'd MMM yyyy, HH.mm', { locale: id });
    } catch {
      return '-';
    }
  };

  // Highlight helper untuk menyorot keyword pencarian
  const highlightText = (value) => {
    const text = String(value ?? '');
    const q = String(debouncedSearch || '').trim();
    if (!q) return text;
    try {
      const esc = q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const re = new RegExp(esc, 'ig');
      const parts = text.split(re);
      const matches = text.match(re);
      if (!matches) return text;
      const nodes = [];
      for (let i = 0; i < parts.length; i++) {
        if (parts[i]) nodes.push(<span key={`p-${i}`}>{parts[i]}</span>);
        if (i < matches.length) nodes.push(
          <mark key={`m-${i}`} className="bg-yellow-200 px-0.5 rounded">{matches[i]}</mark>
        );
      }
      return <>{nodes}</>;
    } catch (e) {
      return text;
    }
  };

  const groupedByLokasi = useMemo(() => {
    const normalize = (s) => {
      // 1) to string + NFC, 2) trim, 3) ganti non-alnum jadi spasi, 4) collapse spaces
      const base = String(s || '')
        .normalize('NFC')
        .trim()
        .replace(/[^0-9A-Za-z\p{L}\s]+/gu, ' ')
        .replace(/\s+/g, ' ');
      return base;
    };
    const titleCase = (s) => normalize(s)
      .toLowerCase()
      .split(' ')
      .map(w => w ? w[0].toUpperCase() + w.slice(1) : '')
      .join(' ');

    const groups = {};
    const labels = {};
    for (const item of items) {
      const raw = normalize(item.lokasi);
      const key = (raw ? raw.toUpperCase() : 'TANPA LOKASI');
      if (!groups[key]) groups[key] = [];
      groups[key].push(item);
      // simpan label tampilan (title case), fallback 'Tanpa Lokasi'
      if (!labels[key]) labels[key] = raw ? titleCase(raw) : 'Tanpa Lokasi';
    }
    const orderedKeys = Object.keys(groups).sort((a, b) => groups[b].length - groups[a].length);
    return { groups, orderedKeys, labels };
  }, [items]);

  const stats = useMemo(() => {
    const total = items.length;
    const totalNominal = items.reduce((sum, i) => sum + (Number(i.nominal) || 0), 0);
    const lokasiCount = groupedByLokasi.orderedKeys.length;
    const topLokasi = groupedByLokasi.orderedKeys[0] || '-';
    const topCount = topLokasi !== '-' ? groupedByLokasi.groups[topLokasi]?.length || 0 : 0;
    return { total, totalNominal, lokasiCount, topLokasi, topCount };
  }, [items, groupedByLokasi]);

  const [expandedLokasi, setExpandedLokasi] = useState({});

  // Auto-expand groups saat mencari: hanya grup yang punya item cocok keyword yang dibuka
  useEffect(() => {
    const keyword = (debouncedSearch || '').trim().toLowerCase();
    const keys = groupedByLokasi?.orderedKeys || [];
    if (keyword) {
      const map = {};
      keys.forEach(k => {
        const arr = groupedByLokasi.groups[k] || [];
        const match = arr.some(it => {
          const nama = String(it.nama || '').toLowerCase();
          const jabatan = String(it.jabatan || '').toLowerCase();
          const lokasi = String(it.lokasi || '').toLowerCase();
          return nama.includes(keyword) || jabatan.includes(keyword) || lokasi.includes(keyword);
        });
        if (match) map[k] = true;
      });
      setExpandedLokasi(map);
    } else {
      // reset collapsed jika keyword kosong
      setExpandedLokasi({});
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch, groupedByLokasi.orderedKeys?.join('|'), items.length]);

  // Last updated text mengikuti pola Indonesia panjang, fallback '-'
  const lastUpdatedText = useMemo(() => {
    if (!Array.isArray(items) || items.length === 0) return '-';
    const timestamps = items
      .map(d => d.updated_at || d.created_at)
      .filter(Boolean)
      .map(d => new Date(d).getTime());
    if (!timestamps.length) return '-';
    const max = Math.max(...timestamps);
    if (!isFinite(max)) return '-';
    const dt = new Date(max);
    try { return format(dt, "d MMMM yyyy 'pukul' HH.mm", { locale: id }); } catch { return '-'; }
  }, [items]);

  const resetFilter = () => {
    setSearch('');
    setLokasiFilter('');
    setPagination(p => ({ ...p, itemsPerPage: 50, currentPage: 1 }));
  };

  const onChangeForm = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const openCreate = () => {
    setEditingId(null);
    setForm(defaultForm);
    setFormFiles([]);
    setShowForm(true);
  };

  const openEdit = (item) => {
    setEditingId(item.id);
    setForm({ lokasi: item.lokasi || '', jabatan: item.jabatan || '', nama: item.nama || '', no_hp: item.no_hp || '', alamat: item.alamat || '', nominal: item.nominal || '' });
    setFormFiles([]);
    setEditLampiran([]);
    setShowForm(true);
    // muat lampiran tersimpan untuk modal edit
    service.getLampiran(item.id)
      .then(({ data }) => {
        setEditLampiran(Array.isArray(data?.data) ? data.data : []);
      })
      .catch(() => setEditLampiran([]));
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError('');
      let targetId = editingId;
      if (editingId) {
        await service.update(editingId, form);
      } else {
        const { data } = await service.create(form);
        targetId = data?.data?.id || data?.data?.insertId || data?.data?.ID || data?.data?.Id || data?.data?.id_bina_lingkungan;
      }

      // Upload lampiran jika ada file terpilih di modal
      if (targetId && formFiles.length > 0) {
        const fd = new FormData();
        formFiles.forEach((f) => fd.append('files', f));
        await service.uploadLampiran(targetId, fd);
      }
      setShowForm(false);
      await fetchData();
    } catch (err) {
      setError(err?.response?.data?.message || 'Gagal menyimpan data');
    } finally {
      setLoading(false);
    }
  };

  const onSelectFormFiles = (e) => {
    const selected = Array.from(e.target.files || []);
    const valid = [];
    for (const f of selected) {
      const isAllowed = f.type.startsWith('image/') || f.type === 'application/pdf';
      const withinSize = f.size <= 10 * 1024 * 1024;
      if (isAllowed && withinSize) valid.push(f);
    }
    setFormFiles(valid.slice(0, 10));
  };

  const onDelete = async (id) => {
    if (!confirm('Hapus data ini?')) return;
    try {
      setLoading(true);
      setError('');
      await service.remove(id);
      await fetchData();
    } catch (err) {
      setError(err?.response?.data?.message || 'Gagal menghapus data');
    } finally {
      setLoading(false);
    }
  };

  // Lampiran handlers
  const openLampiran = async (item) => {
    try {
      setLampiranTarget({ id: item.id, nama: item.nama });
      setLampiranOpen(true);
      const { data } = await service.getLampiran(item.id);
      if (data?.success) setLampiranItems(data.data || []);
      else setLampiranItems([]);
    } catch {
      setLampiranItems([]);
    }
  };

  const onSelectFiles = (e) => {
    setSelectedFiles(Array.from(e.target.files || []));
  };

  const onUploadLampiran = async () => {
    if (!lampiranTarget?.id || selectedFiles.length === 0) return;
    const formData = new FormData();
    selectedFiles.forEach((f) => formData.append('files', f));
    try {
      setUploadingLampiran(true);
      await service.uploadLampiran(lampiranTarget.id, formData);
      // refresh list
      const { data } = await service.getLampiran(lampiranTarget.id);
      setLampiranItems(data?.data || []);
      setSelectedFiles([]);
    } catch (err) {
      alert(err?.response?.data?.message || 'Gagal mengupload lampiran');
    } finally {
      setUploadingLampiran(false);
    }
  };

  const onDeleteLampiran = async (stored_name) => {
    if (!lampiranTarget?.id) return;
    if (!confirm('Hapus lampiran ini?')) return;
    try {
      await service.deleteLampiran(lampiranTarget.id, stored_name);
      const { data } = await service.getLampiran(lampiranTarget.id);
      setLampiranItems(data?.data || []);
    } catch (err) {
      alert(err?.response?.data?.message || 'Gagal menghapus lampiran');
    }
  };

  return (
    <div className="p-0 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="bg-red-800 text-white px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-semibold bg-white/10 rounded px-2 py-0.5">{MENU_CODES.operasional.binaLingkungan}</span>
            <div>
              <h1 className="text-base md:text-2xl font-extrabold tracking-tight whitespace-nowrap">DATA BINA LINGKUNGAN</h1>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={openCreate} className="hidden md:inline-flex items-center gap-2 px-4 py-2 bg-white text-red-700 rounded-lg hover:bg-red-50 transition-colors shadow-sm">
              <Plus className="h-4 w-4" />
              <span className="font-semibold">Tambah</span>
            </button>
          </div>
        </div>
      </div>

      {/* Info Bar */}
      <div className="bg-gray-200 px-6 py-2 text-sm text-gray-900">Terakhir diupdate: {lastUpdatedText}</div>

      <div className="px-0 py-4">
        {/* Statistics Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-3 px-0">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-3 md:p-4">
            <div className="flex items-center space-x-2 md:space-x-3">
              <div className="p-1.5 md:p-2 bg-blue-100 rounded-lg">
                <User className="h-4 w-4 md:h-5 md:w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-xs font-medium text-gray-500">Total Penerima</p>
                <p className="text-base md:text-lg font-bold text-gray-900">{stats.total}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-3 md:p-4">
            <div className="flex items-center space-x-2 md:space-x-3">
              <div className="p-1.5 md:p-2 bg-purple-100 rounded-lg">
                <MapPin className="h-4 w-4 md:h-5 md:w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-xs font-medium text-gray-500">Jumlah Lokasi</p>
                <p className="text-base md:text-lg font-bold text-gray-900">{stats.lokasiCount}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filter: hanya cari */}
        <div className="bg-white rounded-none md:rounded-xl shadow-sm border border-gray-200 mb-4">
          <div className="px-6 py-4">
            <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
              <div>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input type="text" placeholder="Masukkan nama / jabatan / lokasi..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-red-500 focus:border-red-500" />
                </div>
                {filterLoading && (
                  <div className="mt-1 text-[11px] text-gray-500 flex items-center gap-2">
                    <span className="inline-block w-3 h-3 border-2 border-gray-300 border-t-red-600 rounded-full animate-spin" />
                    Memuat hasil pencarian...
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Card List dikelompokkan per lokasi (full-bleed di mobile) */}
        <div className="mt-2">
          <div className="px-0 py-0">
            {groupedByLokasi.orderedKeys.length > 0 ? (
              groupedByLokasi.orderedKeys.map((lok) => {
                const arr = groupedByLokasi.groups[lok] || [];
                const open = !!expandedLokasi[lok];
                const totalNominal = arr.reduce((s, it) => s + (Number(it.nominal) || 0), 0);
                return (
                  <div key={lok} className="mb-4 overflow-hidden rounded-none">
                    <button
                      onClick={() => setExpandedLokasi(prev => ({ ...prev, [lok]: !prev[lok] }))}
                      className="w-full flex items-center justify-between px-4 md:px-6 py-3 bg-red-700 text-white rounded-none"
                    >
                      <div className="flex items-center gap-2">
                        <span className="font-semibold">{groupedByLokasi.labels[lok] || lok}</span>
                        <span className="hidden md:inline-flex ml-2 text-xs bg-white/15 px-2 py-0.5 rounded-full">{arr.length} item</span>
                        <span className="hidden md:inline-flex ml-1 text-xs bg-white/15 px-2 py-0.5 rounded-full">{formatRupiah(totalNominal)}</span>
                      </div>
                      {open ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                    </button>
                    {open && (
                      <div className="pt-3">
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-y-4 gap-x-2 md:gap-x-4 md:gap-y-5 p-0">
                          {arr.map((item) => (
                            <div
                              key={item.id}
                              className="bg-white shadow-sm border border-gray-200 p-3 hover:shadow-md transition-shadow text-xs cursor-pointer rounded-md overflow-hidden"
                              onClick={() => { setDetailItem(item); setShowDetail(true); }}
                            >
                              {/* Header strip ala Data Sewa */}
                              <div className="flex items-start justify-between px-3 py-3 bg-red-800 -mx-3 -mt-3 mb-0 border-b border-red-700">
                                <h4 className="text-sm md:text-base font-semibold text-white leading-snug break-words pr-2">{item.nama || '-'}</h4>
                              </div>

                              {/* Meta info - mobile style label uppercase dengan ':' */}
                              <div className="mt-2 pt-2 space-y-2 text-sm text-gray-800">
                                <div className="grid grid-cols-[110px,12px,1fr] items-start leading-6 gap-x-2">
                                  <span className="font-semibold text-[12px] tracking-wide text-gray-700 uppercase">Jabatan</span>
                                  <span>:</span>
                                  <span className="break-words">{highlightText(item.jabatan || '—')}</span>
                                </div>
                                <div className="grid grid-cols-[110px,12px,1fr] items-start leading-6 gap-x-2">
                                  <span className="font-semibold text-[12px] tracking-wide text-gray-700 uppercase">Nama</span>
                                  <span>:</span>
                                  <span className="break-words">{highlightText(item.nama || '—')}</span>
                                </div>
                                <div className="grid grid-cols-[110px,12px,1fr] items-start leading-6 gap-x-2">
                                  <span className="font-semibold text-[12px] tracking-wide text-gray-700 uppercase">No. HP</span>
                                  <span>:</span>
                                  <span className="break-words">{highlightText(item.no_hp || '-')}</span>
                                </div>
                                <div className="grid grid-cols-[110px,12px,1fr] items-start leading-6 gap-x-2">
                                  <span className="font-semibold text-[12px] tracking-wide text-gray-700 uppercase">Alamat</span>
                                  <span>:</span>
                                  <span className="break-words line-clamp-2 leading-snug">{highlightText(item.alamat || '-')}</span>
                                </div>
                                <div className="grid grid-cols-[110px,12px,1fr] items-start leading-6 gap-x-2">
                                  <span className="font-semibold text-[12px] tracking-wide text-gray-700 uppercase">Nominal</span>
                                  <span>:</span>
                                  <span className="break-words">{highlightText(formatRupiah(item.nominal))}</span>
                                </div>
                              </div>

                              {/* Lampiran */}
                              {(() => {
                                const larr = lampiranMap[item.id] || [];
                                if (!larr.length) return null;
                                return (
                                  <div className="pt-2">
                                    <div className="text-[11px] font-semibold text-gray-700 mb-1">Lampiran</div>
                                    <div className="grid grid-cols-3 gap-2">
                                      {larr.map((f, idx) => {
                                        const fileUrl = `${API_CONFIG.BASE_HOST}/uploads/data-bina-lingkungan/${f.storedName || f.filename || f.stored_name || ''}`;
                                        const name = f.originalName || f.filename || f.storedName || f.stored_name || `file-${idx}`;
                                        const isImage = (f.mimeType || '').startsWith('image/');
                                        return (
                                          <div key={`${name}-${idx}`} className="border rounded-md p-1 flex flex-col gap-1">
                                            {isImage ? (
                                              <button type="button" onClick={() => { openPreview(fileUrl, name); }} className="block text-left" title={name}>
                                                <img src={fileUrl} alt={name} className="w-full h-16 object-cover rounded" />
                                              </button>
                                            ) : (
                                              <button type="button" onClick={() => { openPreview(fileUrl, name); }} className="text:[10px] text-blue-600 truncate text-left hover:underline" title={name}>
                                                {name}
                                              </button>
                                            )}
                                            <div className="mt-1 truncate" title={name}>{name}</div>
                                          </div>
                                        );
                                      })}
                                    </div>
                                  </div>
                                );
                              })()}

                              {/* Update & Actions (mobile style) */}
                              <div className="flex items-center justify-between pt-3">
                                <div className="text-[11px] text-gray-600">Update: {formatUpdatedAt(item.updated_at || item.created_at)}</div>
                                <div className="flex items-center gap-1">
                                  <button
                                    onClick={(e) => { e.stopPropagation(); openEdit(item); }}
                                    className="w-6 h-6 md:w-8 md:h-8 grid place-items-center p-0 leading-none border border-blue-300 text-blue-600 rounded-sm hover:bg-blue-50 shrink-0"
                                    title="Edit"
                                  >
                                    <EditIcon className="w-4 h-4" />
                                  </button>
                                  <button
                                    onClick={(e) => { e.stopPropagation(); onDelete(item.id); }}
                                    className="w-6 h-6 md:w-8 md:h-8 grid place-items-center p-0 leading-none border border-red-300 text-red-600 rounded-sm hover:bg-red-50 shrink-0"
                                    title="Hapus"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })
            ) : (
              <div className="text-center py-8 text-gray-500">Tidak ada data</div>
            )}
          </div>
        </div>

        {/* Pagination dihilangkan: semua data ditampilkan dalam satu halaman */}
      </div>

      {/* Modal Form (Dialog) */}
      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="p-0 max-w-2xl overflow-hidden scrollbar-hide">
          <div className="bg-white rounded-t-2xl md:rounded-2xl w-full max-h-[85vh] overflow-hidden border border-gray-200 flex flex-col">
            {/* Header: putih di mobile, merah di desktop */}
            <div className="px-4 md:px-6 py-3 md:py-4 border-b sticky top-0 z-10 bg-white md:bg-red-800 md:text-white md:border-red-700 flex items-center justify-between">
              <div className="flex items-center">
                <div>
                  <h2 className="text-xl font-bold leading-tight">{editingId ? 'Edit Data' : 'Tambah Data'}</h2>
                </div>
              </div>
              <button type="button" onClick={() => setShowForm(false)} className="p-2 rounded-lg transition-colors text-gray-600 hover:text-gray-900 hover:bg-gray-100 md:text-white md:hover:text-white md:hover:bg-white/10" aria-label="Tutup">✕</button>
            </div>

            {/* Body scrollable */}
            <form id="binaLingkunganModalForm" onSubmit={onSubmit} className="flex flex-col flex-1 min-h-0">
              <div className="flex-1 min-h-0 overflow-y-auto px-6 py-5 scrollbar-hide">
                {/* Heading tanpa box/card */}
                <div className="mb-2 text-sm font-semibold text-gray-700">Informasi Penerima</div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">Lokasi</label>
                      <input name="lokasi" value={form.lokasi} onChange={onChangeForm} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent" required />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">Jabatan</label>
                      <input name="jabatan" value={form.jabatan} onChange={onChangeForm} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent" required />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">Nama</label>
                      <input name="nama" value={form.nama} onChange={onChangeForm} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent" required />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">No HP</label>
                      <input name="no_hp" value={form.no_hp} onChange={onChangeForm} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent" required />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-semibold text-gray-700 mb-1">Alamat</label>
                      <textarea name="alamat" value={form.alamat} onChange={onChangeForm} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent" required />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-semibold text-gray-700 mb-1">Nominal</label>
                      <input name="nominal" value={form.nominal} onChange={onChangeForm} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent" required />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-semibold text-gray-700 mb-1">Lampiran (opsional)</label>
                      <input type="file" multiple accept="image/*,application/pdf" onChange={onSelectFormFiles} className="w-full" />
                      {formFiles.length > 0 && (
                        <>
                          <div className="text-xs text-gray-600 mt-1">{formFiles.length} file siap diunggah (maks 10 file, 10MB/file).</div>
                          <div className="mt-2 grid grid-cols-4 gap-2">
                            {formFiles.map((f, idx) => {
                              const isImage = (f.type || '').startsWith('image/')
                              const ext = (f.name.split('.').pop() || '').toUpperCase()
                              const url = URL.createObjectURL(f)
                              return (
                                <div key={`new-${idx}`} className="relative border rounded p-1 text-xs text-gray-700 bg-white group">
                                  {/* remove */}
                                  <button
                                    type="button"
                                    onClick={() => {
                                      const next = [...formFiles];
                                      next.splice(idx, 1);
                                      setFormFiles(next);
                                    }}
                                    className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full w-6 h-6 text-[11px] leading-6 text-center shadow hidden group-hover:block"
                                    title="Hapus file ini"
                                  >
                                    ×
                                  </button>
                                  {isImage ? (
                                    <img src={url} alt={f.name} className="w-full h-20 object-cover rounded" />
                                  ) : (
                                    <div className="w-full h-20 flex items-center justify-center bg-gray-50 rounded border">
                                      <span className="font-semibold">{ext || 'FILE'}</span>
                                    </div>
                                  )}
                                  <div className="mt-1 truncate" title={f.name}>{f.name}</div>
                                </div>
                              )
                            })}
                          </div>
                        </>
                      )}
                      {/* Lampiran tersimpan (edit mode) */}
                      {editingId && Array.isArray(editLampiran) && editLampiran.length > 0 && (
                        <div className="mt-3">
                          <div className="text-xs font-semibold text-gray-700 mb-2">Lampiran Tersimpan</div>
                          <div className="grid grid-cols-4 gap-2">
                            {editLampiran.map((f, idx) => {
                              const fileUrl = `${API_CONFIG.BASE_HOST}/uploads/data-bina-lingkungan/${f.storedName || f.filename || f.stored_name || ''}`;
                              const name = f.originalName || f.filename || f.storedName || f.stored_name || `file-${idx}`;
                              const isImage = (f.mimeType || '').startsWith('image/');
                              return (
                                <div key={`saved-${idx}`} className="relative border rounded p-1 text-xs text-gray-700 bg-white group">
                                  {isImage ? (
                                    <button type="button" onClick={() => { openPreview(fileUrl, name); }} className="block w-full">
                                      <img src={fileUrl} alt={name} className="w-full h-20 object-cover rounded" />
                                    </button>
                                  ) : (
                                    <button type="button" onClick={() => { openPreview(fileUrl, name); }} className="w-full h-20 flex items-center justify-center bg-gray-50 rounded border">
                                      <span className="font-semibold truncate px-1" title={name}>{(name.split('.').pop() || 'FILE').toUpperCase()}</span>
                                    </button>
                                  )}
                                  <div className="mt-1 truncate" title={name}>{name}</div>
                                  <button
                                    type="button"
                                    onClick={async () => {
                                      try {
                                        await service.deleteLampiran(editingId, f.storedName || f.stored_name);
                                        // refresh list
                                        const { data } = await service.getLampiran(editingId);
                                        setEditLampiran(Array.isArray(data?.data) ? data.data : []);
                                      } catch (err) {
                                        alert('Gagal menghapus lampiran');
                                      }
                                    }}
                                    className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full w-6 h-6 text-[11px] leading-6 text-center shadow hidden group-hover:block"
                                    title="Hapus lampiran"
                                  >
                                    ×
                                  </button>
                                </div>
                              )
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
              </div>
              {/* Footer */}
              <div className="p-4 border-t bg-white">
                <div className="flex items-center justify-end gap-2">
                  <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50">Batal</button>
                  <button type="submit" form="binaLingkunganModalForm" disabled={loading} className="px-4 py-2 rounded-lg bg-red-700 text-white hover:bg-red-800 disabled:opacity-50 disabled:cursor-not-allowed">{loading ? 'Menyimpan...' : 'Simpan'}</button>
                </div>
              </div>
            </form>
          </div>
        </DialogContent>
      </Dialog>

      {/* FAB Tambah (mobile only) */}
      <button
        type="button"
        onClick={openCreate}
        className="md:hidden fixed bottom-6 right-4 z-40 w-14 h-14 rounded-full bg-red-600 text-white shadow-lg flex items-center justify-center active:scale-95"
        aria-label="Tambah Lingkungan"
      >
        <Plus className="w-6 h-6" />
      </button>

      {/* Modal Detail (desain konsisten: header merah sticky, body scrollable) */}
      <Dialog open={showDetail} onOpenChange={setShowDetail}>
        <DialogContent className="p-0 max-w-3xl overflow-hidden scrollbar-hide">
          <div className="bg-white rounded-2xl w-full max-h-[92vh] overflow-hidden border border-gray-200 flex flex-col scrollbar-hide">
            {/* Body dengan header sticky di dalam area scroll */}
            <div className="flex-1 min-h-0 overflow-y-auto overscroll-none px-0 pt-0 scrollbar-hide">
              {/* Header merah sticky */}
              <div className="flex items-center justify-between px-4 md:px-6 py-2 border-b border-red-700 bg-red-800 text-white sticky top-0 z-10">
                <div>
                  <h2 className="text-lg md:text-xl font-bold leading-tight">Detail Bina Lingkungan</h2>
                </div>
                <button
                  type="button"
                  onClick={() => setShowDetail(false)}
                  className="p-1.5 md:p-2 text-white/90 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                  aria-label="Tutup"
                >
                  <CloseIcon className="w-5 h-5" />
                </button>
              </div>

              {/* Konten detail */}
              <div className="px-6 py-5 space-y-4">
                {detailItem && (
                  <div className="space-y-4">
                    {/* Info penerima */}
                    <div className="rounded-xl border bg-white p-3">
                      <div className="grid grid-cols-1 gap-2 text-sm">
                        <div className="grid grid-cols-[140px,1fr] items-center gap-2">
                          <span className="text-gray-600">Nama</span>
                          <span className="text-gray-900">{detailItem.nama || '-'}</span>
                        </div>
                        <div className="grid grid-cols-[140px,1fr] items-center gap-2">
                          <span className="text-gray-600">Jabatan</span>
                          <span className="text-gray-900">{detailItem.jabatan || '-'}</span>
                        </div>
                        <div className="grid grid-cols-[140px,1fr] items-center gap-2">
                          <span className="text-gray-600">No HP</span>
                          <span className="text-gray-900">{detailItem.no_hp || '-'}</span>
                        </div>
                        <div className="grid grid-cols-[140px,1fr] items-start gap-2">
                          <span className="text-gray-600">Alamat</span>
                          <span className="text-gray-900 leading-snug">{detailItem.alamat || '-'}</span>
                        </div>
                        <div className="grid grid-cols-[140px,1fr] items-center gap-2">
                          <span className="text-gray-600">Lokasi</span>
                          <span className="text-gray-900">{detailItem.lokasi || '-'}</span>
                        </div>
                        <div className="grid grid-cols-[140px,1fr] items-center gap-2">
                          <span className="text-gray-600">Nominal</span>
                          <span className="text-gray-900">{formatRupiah(detailItem.nominal)}</span>
                        </div>
                      </div>
                    </div>

                    {/* Lampiran */}
                    {(() => {
                      const arr = lampiranMap[detailItem?.id] || [];
                      if (!arr.length) return null;
                      return (
                        <div className="rounded-xl border bg-white p-3">
                          <div className="text-sm font-semibold text-gray-700 mb-2">Lampiran</div>
                          <div className="grid grid-cols-3 gap-2">
                            {arr.map((f, idx) => {
                              const fileUrl = `${API_CONFIG.BASE_HOST}/uploads/data-bina-lingkungan/${f.storedName || f.filename || f.stored_name || ''}`;
                              const name = f.originalName || f.filename || f.storedName || f.stored_name || `file-${idx}`;
                              const isImage = (f.mimeType || '').startsWith('image/');
                              return (
                                <div key={`${name}-${idx}`} className="border rounded-md p-1 flex flex-col gap-1">
                                  {isImage ? (
                                    <button type="button" onClick={() => { openPreview(fileUrl, name); }} className="block text-left" title={name}>
                                      <img src={fileUrl} alt={name} className="w-full h-20 object-cover rounded" />
                                    </button>
                                  ) : (
                                    <button type="button" onClick={() => { openPreview(fileUrl, name); }} className="text-[11px] text-blue-600 truncate text-left hover:underline" title={name}>
                                      {name}
                                    </button>
                                  )}
                                  <div className="mt-1 truncate text-[11px]" title={name}>{name}</div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                )}
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog Lampiran */}
      <Dialog open={lampiranOpen} onOpenChange={setLampiranOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Lampiran - {lampiranTarget?.nama || ''}</DialogTitle>
          </DialogHeader>
          <DialogBody>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Upload Lampiran (gambar/PDF, maks 10 file, 10MB per file)</label>
                <input type="file" multiple accept="image/*,application/pdf" onChange={onSelectFiles} className="w-full" />
                <div className="mt-2 flex items-center gap-2">
                  <button type="button" onClick={onUploadLampiran} disabled={uploadingLampiran || selectedFiles.length === 0} className="px-3 py-2 bg-red-700 text-white rounded disabled:opacity-50">
                    {uploadingLampiran ? 'Mengupload...' : `Upload (${selectedFiles.length})`}
                  </button>
                  {selectedFiles.length > 0 && (
                    <span className="text-xs text-gray-500">{selectedFiles.length} file terpilih</span>
                  )}
                </div>
              </div>

              <div>
                <h4 className="text-sm font-semibold text-gray-700 mb-2">Daftar Lampiran</h4>
                {lampiranItems.length === 0 ? (
                  <div className="text-gray-500 text-sm">Belum ada lampiran</div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {lampiranItems.map((f, idx) => {
                      const fileUrl = `${API_CONFIG.BASE_HOST}/uploads/data-bina-lingkungan/${f.storedName || f.filename || f.stored_name || ''}`;
                      const name = f.originalName || f.filename || f.storedName || f.stored_name || `file-${idx}`;
                      const isImage = (f.mimeType || '').startsWith('image/');
                      return (
                        <div key={idx} className="border rounded p-3 flex items-start gap-3 bg-gray-50">
                          <div className="w-16 h-16 bg-white border rounded flex items-center justify-center overflow-hidden">
                            {isImage ? (
                              <img src={fileUrl} alt={name} className="max-w-full max-h-full object-cover" />
                            ) : (
                              <Paperclip className="w-6 h-6 text-gray-500" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-medium text-gray-800 truncate" title={name}>{name}</div>
                            <button type="button" onClick={() => { openPreview(fileUrl, name); }} className="text-xs text-blue-600 hover:underline break-all">Lihat</button>
                          </div>
                          <div className="flex flex-col gap-2 items-end">
                            <a href={fileUrl} download target="_blank" rel="noreferrer" className="px-2 py-1 text-gray-700 border border-gray-200 rounded hover:bg-gray-50 text-xs">Download</a>
                            <button type="button" onClick={() => onDeleteLampiran(f.storedName || f.stored_name)} className="px-2 py-1 text-red-600 border border-red-200 rounded hover:bg-red-50 text-xs">Hapus</button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </DialogBody>
          <DialogFooter>
            <button type="button" onClick={() => setLampiranOpen(false)} className="px-4 py-2 border rounded">Tutup</button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Preview Lampiran Overlay ala Aset/Sewa */}
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
                onClick={() => setZoom(z => ({ ...z, scale: Math.max(0.5, z.scale - 0.25), x: (z.scale - 0.25) <= 1 ? 0 : z.x, y: (z.scale - 0.25) <= 1 ? 0 : z.y }))}
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

export default AdminDataBinaLingkungan;
