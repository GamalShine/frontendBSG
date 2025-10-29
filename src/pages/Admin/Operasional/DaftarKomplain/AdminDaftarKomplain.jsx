import React from 'react';

import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { adminKomplainService, komplainService } from '@/services/komplainService';
import { toast } from 'react-hot-toast';
import { useAuth } from '@/contexts/AuthContext';
import { API_CONFIG } from '@/config/constants';
import LoadingSpinner from '@/components/UI/LoadingSpinner';
import {
  Plus,
  Search,
  RefreshCw,
  Edit,
  Trash2,
  MessageSquare,
  AlertCircle,
  Clock,
  CheckCircle,
  X
} from 'lucide-react';

const AdminDaftarKomplain = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;
  const [selectedItems, setSelectedItems] = useState([]);
  const [showBulkMenu, setShowBulkMenu] = useState(false);
  // Modal states
  const [showForm, setShowForm] = useState(false);
  const [editData, setEditData] = useState(null);
  const [showDetail, setShowDetail] = useState(false);
  const [detailItem, setDetailItem] = useState(null);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [catatanAdmin, setCatatanAdmin] = useState('');

  // File URL helper (mirip Data Aset)
  const toFileUrl = (p) => {
    try {
      if (!p) return '#';
      const raw = String(p);
      if (/^https?:\/\//i.test(raw)) return raw;
      const clean = raw.replace(/^\/+/, '');
      const base = API_CONFIG?.BASE_HOST || '';
      return encodeURI(`${base}/${clean}`);
    } catch {
      return '#';
    }
  };


  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      // Gunakan backend scope baru: assigned_or_related
      let res = await adminKomplainService.getAdminKomplain({ scope: 'assigned_or_related' });
      let data = Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : [];

      // Sort newest first by created_at or tanggal_pelaporan
      const sorted = [...data].sort((a, b) => {
        const ad = a?.created_at || a?.tanggal_pelaporan || a?.createdAt;
        const bd = b?.created_at || b?.tanggal_pelaporan || b?.createdAt;
        const at = ad ? new Date(ad).getTime() : 0;
        const bt = bd ? new Date(bd).getTime() : 0;
        if (bt !== at) return bt - at;
        return (b?.id || 0) - (a?.id || 0);
      });

      setItems(sorted);
    } catch (err) {
      console.error('❌ Gagal memuat komplain:', err);
      toast.error('Gagal memuat daftar komplain');
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredItems = useMemo(() => {
    return items.filter((it) => {
      const pelapor = it?.Pelapor || it?.pelapor || {};
      const penerima = it?.PenerimaKomplain || it?.penerima || it?.penerima_komplain || {};
      const q = (searchTerm || '').toLowerCase();
      const matchesSearch = q
        ? (
            (it?.judul_komplain || '').toLowerCase().includes(q) ||
            (it?.deskripsi_komplain || '').toLowerCase().includes(q) ||
            (pelapor?.nama || '').toLowerCase().includes(q) ||
            (penerima?.nama || '').toLowerCase().includes(q)
          )
        : true;
      const matchesStatus = statusFilter ? (it?.status || '').toLowerCase() === statusFilter : true;
      return matchesSearch && matchesStatus;
    });
  }, [items, searchTerm, statusFilter]);

  const totalItems = filteredItems.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const paginatedItems = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredItems.slice(start, start + pageSize);
  }, [filteredItems, currentPage]);

  const stats = useMemo(() => {
    const total = filteredItems.length;
    const menunggu = filteredItems.filter((i) => (i?.status || '').toLowerCase() === 'menunggu').length;
    const diproses = filteredItems.filter((i) => (i?.status || '').toLowerCase() === 'diproses').length;
    const selesai = filteredItems.filter((i) => (i?.status || '').toLowerCase() === 'selesai').length;
    return { total, menunggu, diproses, selesai };
  }, [filteredItems]);

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const d = new Date(dateString);
    return d.toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  const truncateText = (text, maxLength = 150) => {
    if (!text) return '-';
    const s = String(text);
    if (s.length <= maxLength) return s;
    return s.substring(0, maxLength) + '...';
  };

  const getLastUpdated = () => {
    if (!Array.isArray(items) || items.length === 0) return null;
    const latest = items.reduce((acc, it) => {
      const d = it?.created_at || it?.tanggal_pelaporan || it?.createdAt;
      const t = d ? new Date(d).getTime() : 0;
      return t > acc ? t : acc;
    }, 0);
    if (!latest) return null;
    try {
      return new Date(latest).toLocaleString('id-ID', {
        year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
      });
    } catch {
      return null;
    }
  };

  // Selection handlers (paritas Omset)
  const handleCheckboxChange = (id) => {
    setSelectedItems(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])
  }

  const handleSelectAll = () => {
    if (!paginatedItems?.length) return
    if (selectedItems.length === paginatedItems.length) {
      setSelectedItems([])
    } else {
      setSelectedItems(paginatedItems.map(it => it.id))
    }
  }

  const getSelectedEntries = () => {
    if (!Array.isArray(selectedItems) || selectedItems.length === 0) return []
    const byId = new Map((paginatedItems || []).map(it => [it.id, it]))
    return selectedItems.map(id => byId.get(id)).filter(Boolean)
  }

  const handleBulkCopy = async () => {
    const entries = getSelectedEntries()
    if (entries.length === 0) return toast.error('Pilih minimal satu komplain terlebih dahulu')
    const combined = entries.map(e => {
      const tgl = formatDate(e?.created_at || e?.tanggal_pelaporan)
      const pelapor = (e?.Pelapor || e?.pelapor)?.nama || '-'
      const judul = e?.judul_komplain || '-'
      const desk = e?.deskripsi_komplain || ''
      return `${tgl}\n${pelapor} — ${judul}${desk ? `, ${desk}` : ''}`
    }).join('\n\n---\n\n')
    await navigator.clipboard.writeText(combined)
    toast.success(`Menyalin ${entries.length} komplain`)
    setShowBulkMenu(false)
  }

  const handleBulkDownload = () => {
    const entries = getSelectedEntries()
    if (entries.length === 0) return toast.error('Pilih minimal satu komplain terlebih dahulu')
    const combined = entries.map(e => {
      const tgl = formatDate(e?.created_at || e?.tanggal_pelaporan)
      const pelapor = (e?.Pelapor || e?.pelapor)?.nama || '-'
      const judul = e?.judul_komplain || '-'
      const desk = e?.deskripsi_komplain || ''
      return `${tgl}\n${pelapor} — ${judul}${desk ? `, ${desk}` : ''}`
    }).join('\n\n---\n\n')
    const blob = new Blob([combined], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `admin_komplain_selected_${entries.length}.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    setShowBulkMenu(false)
  }

  const handleBulkShare = async () => {
    const entries = getSelectedEntries()
    if (entries.length === 0) return toast.error('Pilih minimal satu komplain terlebih dahulu')
    const combined = entries.map(e => {
      const tgl = formatDate(e?.created_at || e?.tanggal_pelaporan)
      const pelapor = (e?.Pelapor || e?.pelapor)?.nama || '-'
      const judul = e?.judul_komplain || '-'
      const desk = e?.deskripsi_komplain || ''
      return `${tgl}\n${pelapor} — ${judul}${desk ? `, ${desk}` : ''}`
    }).join('\n\n---\n\n')
    if (navigator.share) {
      try { await navigator.share({ title: `Komplain (${entries.length})`, text: combined }) } catch {}
    } else {
      await navigator.clipboard.writeText(combined)
      toast.success('Teks disalin untuk dibagikan')
    }
    setShowBulkMenu(false)
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Hapus komplain ini?')) return;
    try {
      await adminKomplainService.deleteKomplain(id);
      toast.success('Komplain dihapus');
      loadData();
    } catch (err) {
      console.error('❌ Gagal hapus:', err);
      toast.error('Gagal menghapus komplain');
    }
  };

  return (
    <div className="p-0 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="bg-red-800 text-white px-6 py-5 md:py-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span className="text-sm font-semibold bg-white/10 rounded px-2 py-1">O01-C1</span>
            <div>
              <h1 className="text-xl md:text-2xl font-extrabold tracking-tight">DAFTAR KOMPLAIN</h1>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {false && (
              <button
                type="button"
                onClick={() => { setEditData(null); setShowForm(true); }}
                className="inline-flex items-center gap-2 px-4 py-2 bg-white text-red-700 rounded-lg hover:bg-red-50 transition-colors shadow-sm"
              >
                <Plus className="h-4 w-4" />
                <span className="font-semibold">Tambah</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Info bar */}
      <div className="bg-gray-200 px-6 py-2 text-sm text-gray-900">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
          <div>
            {(() => {
              const lu = getLastUpdated();
              return lu ? `Terakhir diupdate: ${lu}` : 'Terakhir diupdate: -';
            })()}
          </div>
        </div>
      </div>

      {/* Stats Cards - match Data Sewa style */}
      <div className="px-0 py-2 mt-2">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-0">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-red-100 rounded-lg">
                <AlertCircle className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <p className="text-xs font-medium text-gray-500">Total Komplain</p>
                <p className="text-lg font-bold text-gray-900">{stats.total}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Clock className="h-5 w-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-xs font-medium text-gray-500">Komplain Menunggu</p>
                <p className="text-lg font-bold text-gray-900">{stats.menunggu}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-xs font-medium text-gray-500">Komplain Selesai</p>
                <p className="text-lg font-bold text-gray-900">{stats.selesai}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Form Pencarian - gaya Data Sewa */}
      <div className="bg-white rounded-none md:rounded-xl shadow-sm border border-gray-100 mt-2 mb-3">
        <div className="px-6 py-4 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Cari</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Cari komplain..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-3 py-2 w-full border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-red-500 focus:border-transparent"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Status</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 w-full border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-red-500 focus:border-transparent"
            >
              <option value="">Semua</option>
              <option value="menunggu">Menunggu</option>
              <option value="diproses">Diproses</option>
              <option value="selesai">Selesai</option>
              <option value="ditolak">Ditolak</option>
            </select>
          </div>
          <div className="flex items-end">
            <button
              onClick={() => { setSearchTerm(''); setStatusFilter(''); }}
              className="inline-flex items-center gap-2 px-5 py-2 rounded-full border border-red-600 text-red-700 hover:bg-red-50 transition-colors"
            >
              <RefreshCw className="h-4 w-4" />
              <span className="font-semibold">Reset</span>
            </button>
          </div>
        </div>
      </div>

      {/* Daftar Komplain - Tabel */}
      <div className="bg-white rounded-none md:rounded-xl shadow-sm border border-gray-100 mt-3">
        <div className="px-6 py-3 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-base font-semibold text-gray-900">Daftar Komplain</h2>
        </div>

        {loading ? (
          <LoadingSpinner />
        ) : filteredItems.length === 0 ? (
          <div className="p-8 text-center">
            <MessageSquare className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Tidak ada data</h3>
            <p className="text-gray-500 mb-4">Belum ada komplain yang tersedia</p>
            {false && (
              <Link
                to="/admin/operasional/komplain/new"
                className="inline-flex items-center space-x-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
              >
                <Plus className="h-4 w-4" />
                <span>Tambah Komplain</span>
              </Link>
            )}
          </div>
        ) : (
          <>
            <div className="relative overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="sticky top-0 bg-red-700 z-10">
                  <tr>
                    <th className="w-10 sm:w-12 pl-4 sm:pl-6 pr-0 py-3 text-left text-sm font-extrabold text-white uppercase tracking-wider">
                      <input
                        type="checkbox"
                        checked={selectedItems.length === paginatedItems.length && paginatedItems.length > 0}
                        onChange={handleSelectAll}
                        className="rounded border-white text-white focus:ring-white"
                        aria-label="Pilih semua"
                      />
                    </th>
                    <th className="w-12 sm:w-16 pl-2 pr-4 sm:pr-8 py-3 text-left text-sm font-extrabold text-white uppercase tracking-wider">No</th>
                    <th className="px-4 py-3 text-left text-sm font-extrabold text-white uppercase tracking-wider">Tanggal</th>
                    <th className="px-4 py-3 text-left text-sm font-extrabold text-white uppercase tracking-wider">Judul</th>
                    <th className="px-4 py-3 text-left text-sm font-extrabold text-white uppercase tracking-wider">Pelapor</th>
                    <th className="px-4 py-3 text-left text-sm font-extrabold text-white uppercase tracking-wider">Status</th>
                    <th className="px-4 py-3 text-left text-sm font-extrabold text-white uppercase tracking-wider">Aksi</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-100">
                  {paginatedItems.map((row, idx) => {
                    const pelapor = row?.Pelapor || row?.pelapor || {};
                    return (
                      <tr
                        key={row.id}
                        className="hover:bg-gray-50/80 cursor-pointer"
                        onClick={() => { setDetailItem(row); setShowDetail(true); }}
                      >
                        <td className="w-10 sm:w-12 pl-4 sm:pl-6 pr-0 py-3 align-middle" onClick={(e) => e.stopPropagation()}>
                          <input
                            type="checkbox"
                            checked={selectedItems.includes(row.id)}
                            onChange={() => handleCheckboxChange(row.id)}
                            className="rounded border-gray-300 text-red-600 focus:ring-red-500"
                            aria-label={`Pilih baris ${((currentPage - 1) * pageSize) + (idx + 1)}`}
                          />
                        </td>
                        <td className="w-12 sm:w-16 pl-2 pr-4 sm:pr-8 py-3 text-sm text-gray-900">{(currentPage - 1) * pageSize + (idx + 1)}</td>
                        <td className="px-4 py-3 text-sm text-gray-900 font-semibold">{formatDate(row?.created_at || row?.tanggal_pelaporan).toUpperCase()}</td>
                        <td className="px-4 py-3 text-sm text-gray-900 truncate max-w-[22rem]" title={row?.judul_komplain || '-'}>{row?.judul_komplain || '-'}</td>
                        <td className="px-4 py-3 text-sm text-gray-700">
                          <div className="truncate max-w-[16rem]" title={`${pelapor?.username || pelapor?.nama || '-'}`}>
                            {pelapor?.username || pelapor?.nama || '-'}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-700 capitalize">{row?.status || '-'}</td>
                        <td className="px-4 py-3 text-sm" onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center gap-2">
                            <button title="Edit" onClick={() => { setEditData(row); setShowForm(true); }} className="p-2 rounded hover:bg-gray-100 text-amber-600"><Edit className="h-4 w-4"/></button>
                            <button title="Hapus" onClick={() => handleDelete(row.id)} className="p-2 rounded hover:bg-gray-100 text-red-600"><Trash2 className="h-4 w-4"/></button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="px-6 py-3 border-t border-gray-100">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-700">
                    Menampilkan {((currentPage - 1) * pageSize) + 1} sampai {Math.min(currentPage * pageSize, totalItems)} dari {totalItems} data
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => setCurrentPage(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="px-3 py-1 text-sm border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                    >
                      Sebelumnya
                    </button>
                    <span className="px-3 py-1 text-sm text-gray-700">
                      Halaman {currentPage} dari {totalPages}
                    </span>
                    <button
                      onClick={() => setCurrentPage(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className="px-3 py-1 text-sm border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                    >
                      Selanjutnya
                    </button>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
      {/* Form Modal (Tambah/Edit) */}
      {showForm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-[1px] flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[92vh] overflow-hidden border border-gray-200 flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-red-700 bg-red-800 text-white sticky top-0 z-10">
              <div className="flex items-center">
                <div>
                  <h2 className="text-xl font-bold leading-tight">{editData ? 'Edit Komplain' : 'Tambah Komplain'}</h2>
                </div>
              </div>
              <button type="button" onClick={() => { setShowForm(false); setEditData(null); }} className="p-2 text-white/90 hover:text-white hover:bg-white/10 rounded-lg transition-colors" aria-label="Tutup">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={async (e) => {
              e.preventDefault();
              const fd = new FormData(e.currentTarget);
              // Saat edit, kita tidak mengubah judul/deskripsi sesuai permintaan (field disembunyikan)
              // Saat tambah (editData null), kita tetap ambil dari form
              const isEdit = !!editData?.id;
              const payload = !isEdit ? {
                judul_komplain: (fd.get('judul_komplain') || '').toString().trim(),
                deskripsi_komplain: (fd.get('deskripsi_komplain') || '').toString().trim(),
              } : {};
              if (!isEdit) {
                if (!payload.judul_komplain || !payload.deskripsi_komplain) return toast.error('Judul dan deskripsi wajib diisi');
              }
              try {
                if (isEdit) {
                  // Tidak update judul/deskripsi di mode edit
                  // Jika penerima dan memilih file, upload lampiran
                  if (selectedFiles.length > 0) {
                    try {
                      const loadingT = toast.loading('Mengunggah lampiran...');
                      await adminKomplainService.uploadLampiran(editData.id, selectedFiles, catatanAdmin || '');
                      toast.dismiss(loadingT);
                      toast.success('Lampiran diunggah');
                    } catch (upErr) {
                      toast.error('Gagal mengunggah lampiran');
                    }
                  } else if ((catatanAdmin || '').trim().length > 0) {
                    // Simpan catatan tanpa upload jika ada
                    try {
                      await adminKomplainService.updateCatatan(editData.id, catatanAdmin.trim());
                      toast.success('Catatan admin disimpan');
                    } catch (catErr) {
                      toast.error('Gagal menyimpan catatan admin');
                    }
                  }
                  toast.success('Komplain diperbarui');
                } else {
                  await komplainService.createKomplain(payload);
                  toast.success('Komplain ditambahkan');
                }
                setShowForm(false); setEditData(null); setSelectedFiles([]); setCatatanAdmin(''); await loadData();
              } catch (err) {
                toast.error(typeof err === 'string' ? err : err?.message || 'Gagal menyimpan komplain');
              }
            }} className="flex flex-col flex-1 min-h-0">
              <div className="flex-1 min-h-0 overflow-y-auto px-6 py-5 scrollbar-hide">
                <div className="rounded-xl border bg-white">
                  <div className="px-4 py-3 border-b bg-gray-50 rounded-t-xl">
                    <div className="text-sm font-semibold text-gray-700">Data Komplain</div>
                  </div>
                  <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                    {!editData && (
                      <>
                        <div className="md:col-span-2">
                          <label className="block text-xs font-medium text-gray-600 mb-1">Judul Komplain<span className="text-red-500">*</span></label>
                          <input name="judul_komplain" defaultValue={''} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent" placeholder="Masukkan judul" />
                        </div>
                        <div className="md:col-span-2">
                          <label className="block text-xs font-medium text-gray-600 mb-1">Deskripsi Komplain<span className="text-red-500">*</span></label>
                          <textarea name="deskripsi_komplain" defaultValue={''} rows={5} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent" placeholder="Jelaskan komplain" />
                        </div>
                      </>
                    )}

                    {/* Upload Lampiran - hanya untuk penerima komplain */}
                    {(() => {
                      const penerimaId = (editData?.PenerimaKomplain?.id) || (editData?.penerima?.id) || editData?.penerima_id || editData?.penerima_komplain_id;
                      const isRecipient = user?.id && penerimaId && String(user.id) === String(penerimaId);
                      const isAdmin = (user?.role || '').toLowerCase() === 'admin';
                      // Backend mengharuskan role admin untuk endpoint upload
                      if (!(isRecipient && isAdmin)) return null;
                      return (
                        <div className="md:col-span-2">
                          <label className="block text-xs font-medium text-gray-600 mb-1">Upload Lampiran (foto/dokumen) - bisa lebih dari 1</label>
                          <div className="flex items-center gap-3">
                            <label className="inline-flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-lg text-sm cursor-pointer hover:bg-gray-50">
                              <input
                                type="file"
                                accept="image/*,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-powerpoint,application/vnd.openxmlformats-officedocument.presentationml.presentation,text/plain"
                                multiple
                                className="hidden"
                                onChange={(e) => {
                                  const picked = Array.from(e.target.files || [])
                                  const key = (f) => `${f.name}|${f.size}|${f.lastModified}`
                                  const existingMap = new Map(selectedFiles.map(f => [key(f), f]))
                                  for (const f of picked) {
                                    const k = key(f)
                                    if (!existingMap.has(k)) existingMap.set(k, f)
                                  }
                                  setSelectedFiles(Array.from(existingMap.values()))
                                }}
                              />
                              <span>Pilih File</span>
                            </label>
                            {selectedFiles.length > 0 && (
                              <span className="text-xs text-gray-600">{selectedFiles.length} file dipilih</span>
                            )}
                          </div>
                          {selectedFiles.length > 0 && (
                            <div className="mt-2 grid grid-cols-4 gap-2">
                              {selectedFiles.map((f, idx) => {
                                const isImage = (f.type || '').startsWith('image/')
                                const ext = (f.name.split('.').pop() || '').toUpperCase()
                                return (
                                  <div key={idx} className="relative border rounded p-1 text-xs text-gray-700 bg-white group">
                                    <button type="button" onClick={() => setSelectedFiles(prev => prev.filter((_, i) => i !== idx))} className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full w-6 h-6 text-[11px] leading-6 text-center shadow hidden group-hover:block" title="Hapus file ini">×</button>
                                    {isImage ? (
                                      <img src={URL.createObjectURL(f)} alt={f.name} className="w-full h-20 object-cover rounded" />
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
                          )}
                          {/* Catatan Admin (wajib oleh backend saat upload) */}
                          <div className="mt-3">
                            <label className="block text-xs font-medium text-gray-600 mb-1">Catatan Admin (wajib saat upload)</label>
                            <textarea
                              value={catatanAdmin}
                              onChange={(e) => setCatatanAdmin(e.target.value)}
                              rows={3}
                              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                              placeholder="Tuliskan catatan admin terkait penyelesaian komplain"
                            />
                          </div>

                          {/* Lampiran tersimpan */}
                          {editData && Array.isArray(editData.lampiran) && (
                            <div className="mt-3">
                              <div className="text-xs font-semibold text-gray-700 mb-2">Lampiran Tersimpan</div>
                              {editData.lampiran.length === 0 ? (
                                <div className="text-xs text-gray-500">Belum ada lampiran.</div>
                              ) : (
                                <div className="grid grid-cols-4 gap-2">
                                  {editData.lampiran.map((file, idx) => {
                                    const isImage = String(file.mimetype || '').startsWith('image/');
                                    const url = toFileUrl(file.path);
                                    const name = file.originalname || file.filename || `file-${idx}`;
                                    return (
                                      <div key={idx} className="relative border rounded p-1 text-xs text-gray-700 bg-white group">
                                        {isImage ? (
                                          <a href={url} target="_blank" rel="noreferrer"><img src={url} alt={name} className="w-full h-20 object-cover rounded" /></a>
                                        ) : (
                                          <a href={url} target="_blank" rel="noreferrer" className="w-full h-20 flex items-center justify-center bg-gray-50 rounded border"><span className="font-semibold truncate px-1" title={name}>{(name.split('.').pop() || 'FILE').toUpperCase()}</span></a>
                                        )}
                                        <div className="mt-1 truncate" title={name}>{name}</div>
                                        {false && (
                                          <button type="button" className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full w-6 h-6 text-[11px] leading-6 text-center shadow hidden group-hover:block" title="Hapus lampiran">×</button>
                                        )}
                                      </div>
                                    )
                                  })}
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })()}
                  </div>
                </div>
              </div>
              {/* Footer */}
              <div className="p-0 border-t bg-white">
                <div className="grid grid-cols-2 gap-2 px-2 py-2">
                  <button type="button" onClick={() => { setShowForm(false); setEditData(null); }} className="w-full py-2 bg-red-700 text-white font-semibold hover:bg-red-800 transition-colors rounded-lg">Batal</button>
                  <button type="submit" className="w-full py-2 bg-red-700 text-white font-semibold hover:bg-red-800 transition-colors rounded-lg">{editData ? 'Update' : 'Simpan'}</button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {showDetail && detailItem && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-[1px] flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[92vh] overflow-hidden border border-gray-200 flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-red-700 bg-red-800 text-white sticky top-0 z-10">
              <div className="flex items-center">
                <div>
                  <h2 className="text-xl font-bold leading-tight">Detail Komplain</h2>
                </div>
              </div>
              <button type="button" onClick={() => setShowDetail(false)} className="p-2 text-white/90 hover:text-white hover:bg-white/10 rounded-lg transition-colors" aria-label="Tutup">
                <X className="w-5 h-5" />
              </button>
            </div>
            {/* Body */}
            <div className="flex-1 min-h-0 overflow-y-auto px-6 py-5 scrollbar-hide">
              <div className="rounded-xl border bg-white">
                <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4 text-gray-800">
                  <div className="md:col-span-2">
                    <div className="text-sm font-semibold text-gray-700 mb-1">Judul Komplain</div>
                    <div className="px-3 py-2 border rounded-lg bg-gray-50">{detailItem?.judul_komplain || '-'}</div>
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-gray-700 mb-1">Tanggal</div>
                    <div className="px-3 py-2 border rounded-lg bg-gray-50">{formatDate(detailItem?.created_at || detailItem?.tanggal_pelaporan)}</div>
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-gray-700 mb-1">Status</div>
                    <div className="px-3 py-2 border rounded-lg bg-gray-50 capitalize">{detailItem?.status || '-'}</div>
                  </div>
                  <div className="md:col-span-2">
                    <div className="text-sm font-semibold text-gray-700 mb-1">Deskripsi</div>
                    <div className="px-3 py-2 border rounded-lg bg-gray-50 whitespace-pre-wrap">{detailItem?.deskripsi_komplain || '-'}</div>
                  </div>
                </div>
              </div>
            </div>
            {/* Footer */}
            <div className="p-0 border-t bg-white">
              <div className="grid grid-cols-2 gap-2 px-2 py-2">
                <button type="button" onClick={() => { setShowDetail(false); setEditData(detailItem); setShowForm(true); }} className="w-full py-2 bg-red-700 text-white font-semibold hover:bg-red-800 transition-colors rounded-lg">Edit</button>
                <button type="button" onClick={() => { setShowDetail(false); handleDelete(detailItem.id); }} className="w-full py-2 bg-red-700 text-white font-semibold hover:bg-red-800 transition-colors rounded-lg">Hapus</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDaftarKomplain;
