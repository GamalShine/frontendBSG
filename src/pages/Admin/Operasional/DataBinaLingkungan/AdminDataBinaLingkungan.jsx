import React, { useEffect, useMemo, useState } from 'react';
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
  // Preview lampiran
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewItem, setPreviewItem] = useState(null); // { url, name, isImage }

  const params = useMemo(() => ({ page: pagination.currentPage, limit: pagination.itemsPerPage, search, lokasi: lokasiFilter }), [pagination.currentPage, pagination.itemsPerPage, search, lokasiFilter]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError('');
      const { data } = await service.getAll(params);
      if (data?.success) {
        setItems(data.data.items || []);
        setPagination(prev => ({ ...prev, ...(data.data.pagination || {}) }));
      } else {
        setError('Gagal memuat data');
      }
    } catch (err) {
      setError(err?.response?.data?.message || 'Gagal memuat data');
    } finally {
      setLoading(false);
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

  const groupedByLokasi = useMemo(() => {
    const groups = items.reduce((acc, item) => {
      const key = item.lokasi || 'Tanpa Lokasi';
      if (!acc[key]) acc[key] = [];
      acc[key].push(item);
      return acc;
    }, {});
    const orderedKeys = Object.keys(groups).sort((a, b) => groups[b].length - groups[a].length);
    return { groups, orderedKeys };
  }, [items]);

  const stats = useMemo(() => {
    const total = items.length;
    const totalNominal = items.reduce((sum, i) => sum + (Number(i.nominal) || 0), 0);
    const lokasiCount = new Set(items.map(i => i.lokasi || 'Tanpa Lokasi')).size;
    const topLokasi = groupedByLokasi.orderedKeys[0] || '-';
    const topCount = topLokasi !== '-' ? groupedByLokasi.groups[topLokasi]?.length || 0 : 0;
    return { total, totalNominal, lokasiCount, topLokasi, topCount };
  }, [items, groupedByLokasi]);

  const [activeSection, setActiveSection] = useState('');

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
    setShowForm(true);
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
          <div className="flex items-center gap-4">
            <span className="text-sm font-semibold bg-white/10 rounded px-2 py-1">{MENU_CODES.operasional.binaLingkungan}</span>
            <div>
              <h1 className="text-xl md:text-2xl font-extrabold tracking-tight">DATA BINA LINGKUNGAN</h1>
              <p className="text-sm text-red-100">Kelola dan monitor data bina lingkungan </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={resetFilter} className="px-4 py-2 rounded-full border border-white/60 text-white hover:bg-white/10">RESET FILTER</button>
            <button onClick={openCreate} className="inline-flex items-center gap-2 px-4 py-2 bg-white text-red-700 rounded-lg hover:bg-red-50 transition-colors shadow-sm">
              <Plus className="h-4 w-4" />
              <span className="font-semibold">Tambah</span>
            </button>
          </div>
        </div>
      </div>


      {/* Info Bar */}
      <div className="bg-gray-200 px-6 py-2 text-xs text-gray-600">Terakhir diupdate: {lastUpdatedText}</div>

      <div className="px-0 py-4">
        {/* Statistics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 mb-3 px-0">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <User className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-xs font-medium text-gray-500">Total Penerima</p>
                <p className="text-lg font-bold text-gray-900">{stats.total}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <Briefcase className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-xs font-medium text-gray-500">Total Nominal</p>
                <p className="text-lg font-bold text-gray-900">{formatRupiah(stats.totalNominal)}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <MapPin className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-xs font-medium text-gray-500">Jumlah Lokasi</p>
                <p className="text-lg font-bold text-gray-900">{stats.lokasiCount}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-orange-100 rounded-lg">
                <span className="text-orange-600 font-bold text-sm">TOP</span>
              </div>
              <div>
                <p className="text-xs font-medium text-gray-500">Lokasi Teratas</p>
                <p className="text-base font-semibold text-gray-900">{stats.topLokasi} ({stats.topCount})</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters - gaya Data Sewa */}
        <div className="bg-white rounded-none md:rounded-xl shadow-sm border border-gray-100 mb-4">
          <div className="px-6 py-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Cari</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input type="text" placeholder="Masukkan nama / jabatan / lokasi..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-red-500 focus:border-red-500" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Lokasi</label>
                <select value={lokasiFilter} onChange={(e) => setLokasiFilter(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-red-500 focus:border-red-500">
                  <option value="">Semua Lokasi</option>
                  {locations.map((loc, idx) => {
                    const value = typeof loc === 'string' ? loc : (loc?.lokasi ?? '');
                    const label = value || '-';
                    return <option key={`${label}-${idx}`} value={value}>{label}</option>;
                  })}
                </select>
              </div>
              <div className="flex items-end gap-2">
                <div className="flex-1">
                  <label className="block text-xs font-medium text-gray-700 mb-1">Item per Halaman</label>
                  <select value={pagination.itemsPerPage} onChange={(e) => setPagination(p => ({ ...p, itemsPerPage: Number(e.target.value), currentPage: 1 }))} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-red-500 focus:border-red-500">
                    {[10, 20, 50, 100].map(n => <option key={n} value={n}>{n}/hal</option>)}
                  </select>
                </div>
                <button onClick={resetFilter} className="h-9 mt-5 inline-flex items-center gap-2 px-5 py-2 rounded-full border border-red-600 text-red-700 hover:bg-red-50 transition-colors">Reset</button>
              </div>
            </div>
          </div>
        </div>

        {/* Sections by Lokasi */}
        <div className="space-y-3 px-0">
          {groupedByLokasi.orderedKeys.map((locKey) => (
            <div key={locKey} className="bg-white rounded-none md:rounded-xl shadow-sm border border-gray-100 overflow-hidden mt-2">
              <button onClick={() => {
                const next = activeSection === locKey ? '' : locKey;
                setActiveSection(next);
                if (next === locKey) {
                  // lazy fetch lampiran untuk semua item pada section ini
                  const itemsInSection = groupedByLokasi.groups[locKey] || [];
                  const idsToFetch = itemsInSection.map(it => it.id).filter(id => !(id in lampiranMap));
                  if (idsToFetch.length) {
                    Promise.all(idsToFetch.map(async (id) => {
                      try {
                        const { data } = await service.getLampiran(id);
                        return { id, files: (data?.data || []) };
                      } catch {
                        return { id, files: [] };
                      }
                    })).then(results => {
                      setLampiranMap(prev => {
                        const nextMap = { ...prev };
                        results.forEach(r => { nextMap[r.id] = r.files; });
                        return nextMap;
                      });
                    });
                  }
                }
              }} className="w-full px-6 py-3 bg-red-800 text-white flex items-center justify-between hover:bg-red-900 transition-colors">
                <div className="flex items-center space-x-3">
                  <MapPin className="w-6 h-6" />
                  <span className="text-lg font-semibold">{locKey}</span>
                  <span className="bg-red-700 px-2 py-1 rounded-full text-sm">{groupedByLokasi.groups[locKey].length}</span>
                </div>
                {activeSection === locKey ? (
                  <ChevronDown className="w-5 h-5" />
                ) : (
                  <ChevronRight className="w-5 h-5" />
                )}
              </button>

              {activeSection === locKey && (
                <div className="p-0">
                  {groupedByLokasi.groups[locKey].length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-3 gap-y-2">
                      {groupedByLokasi.groups[locKey].map((item) => (
                        <div key={item.id} className="bg-white rounded-lg shadow-sm border border-gray-100 p-3 hover:shadow-md transition-shadow text-xs">
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <h4 className="text-sm font-medium text-gray-900">{item.nama}</h4>
                              <p className="text-[10px] text-gray-500">Lokasi: {item.lokasi || '-'}</p>
                            </div>
                            <span className="inline-flex px-2 py-1 text-[10px] font-semibold rounded-full border bg-blue-50 text-blue-700 border-blue-200">
                              {item.jabatan || '—'}
                            </span>
                          </div>

                          <div className="mt-2 pt-2 border-t border-gray-100 space-y-1 text-xs leading-relaxed text-gray-700">
                            <div className="flex items-center space-x-2">
                              <User className="w-4 h-4 text-gray-400" />
                              <span>{item.nama || '-'}</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Phone className="w-4 h-4 text-gray-400" />
                              <span>{item.no_hp || '-'}</span>
                            </div>
                            <div className="flex items-start space-x-2">
                              <MapPin className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                              <span className="line-clamp-2">{item.alamat || '-'}</span>
                            </div>

                            <div className="flex items-center space-x-2 pt-1">
                              <Wallet className="w-4 h-4 text-gray-400" />
                              <span>Nominal: {formatRupiah(item.nominal)}</span>
                            </div>

                            {(() => {
                              const arr = lampiranMap[item.id] || [];
                              if (!arr.length) return null;
                              return (
                                <div className="mt-2">
                                  <div className="text-[10px] font-semibold text-gray-700 mb-1">Lampiran:</div>
                                  <div className="flex flex-wrap gap-2">
                                    {arr.map((f, idx) => {
                                      const fileUrl = `${API_CONFIG.BASE_HOST}/uploads/data-bina-lingkungan/${f.storedName || f.filename || f.stored_name || ''}`;
                                      const name = f.originalName || f.filename || f.storedName || f.stored_name || `file-${idx}`;
                                      const isImage = (f.mimeType || '').startsWith('image/');
                                      return (
                                        <button
                                          key={`${name}-${idx}`}
                                          type="button"
                                          onClick={() => { setPreviewItem({ url: fileUrl, name, isImage }); setPreviewOpen(true); }}
                                          className="text-xs px-2 py-1 border rounded bg-white hover:bg-gray-50"
                                          title={name}
                                        >
                                          {isImage ? '🖼️' : '📎'} {name}
                                        </button>
                                      );
                                    })}
                                  </div>
                                </div>
                              );
                            })()}
                          </div>

                          <div className="flex space-x-2 pt-3">
                            <button onClick={() => openEdit(item)} className="p-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200" title="Edit">
                              <EditIcon className="w-4 h-4" />
                            </button>
                            <button onClick={() => openLampiran(item)} className="p-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200" title="Kelola Lampiran">
                              <Paperclip className="w-4 h-4" />
                            </button>
                            <button onClick={() => onDelete(item.id)} className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200" title="Hapus">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">Tidak ada data</div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between mt-6">
          <button className="px-3 py-2 border rounded disabled:opacity-50" onClick={() => setPagination(p => ({ ...p, currentPage: Math.max(1, p.currentPage - 1) }))} disabled={pagination.currentPage <= 1}>Prev</button>
          <div>Hal {pagination.currentPage} / {pagination.totalPages}</div>
          <button className="px-3 py-2 border rounded disabled:opacity-50" onClick={() => setPagination(p => ({ ...p, currentPage: Math.min(p.totalPages, p.currentPage + 1) }))} disabled={pagination.currentPage >= pagination.totalPages}>Next</button>
        </div>
      </div>

      {/* Modal Form (Dialog) */}
      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingId ? 'Edit Data Bina Lingkungan' : 'Tambah Data Bina Lingkungan'}</DialogTitle>
          </DialogHeader>
          <form id="binaLingkunganModalForm" onSubmit={onSubmit}>
            <DialogBody>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Lokasi</label>
                  <input name="lokasi" value={form.lokasi} onChange={onChangeForm} className="w-full border rounded px-3 py-2" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Jabatan</label>
                  <input name="jabatan" value={form.jabatan} onChange={onChangeForm} className="w-full border rounded px-3 py-2" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nama</label>
                  <input name="nama" value={form.nama} onChange={onChangeForm} className="w-full border rounded px-3 py-2" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">No HP</label>
                  <input name="no_hp" value={form.no_hp} onChange={onChangeForm} className="w-full border rounded px-3 py-2" required />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Alamat</label>
                  <textarea name="alamat" value={form.alamat} onChange={onChangeForm} className="w-full border rounded px-3 py-2" required />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nominal</label>
                  <input name="nominal" value={form.nominal} onChange={onChangeForm} className="w-full border rounded px-3 py-2" required />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Lampiran (opsional)</label>
                  <input type="file" multiple accept="image/*,application/pdf" onChange={onSelectFormFiles} className="w-full" />
                  {formFiles.length > 0 && (
                    <div className="text-xs text-gray-600 mt-1">{formFiles.length} file siap diunggah (maks 10 file, 10MB/file).</div>
                  )}
                </div>
              </div>
            </DialogBody>
            <DialogFooter>
              <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 border rounded">Batal</button>
              <button type="submit" form="binaLingkunganModalForm" disabled={loading} className="px-4 py-2 bg-red-700 text-white rounded disabled:opacity-50">
                {loading ? 'Menyimpan...' : 'Simpan'}
              </button>
            </DialogFooter>
          </form>
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
                            <button type="button" onClick={() => { setPreviewItem({ url: fileUrl, name, isImage }); setPreviewOpen(true); }} className="text-xs text-blue-600 hover:underline break-all">Lihat</button>
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

      {/* Preview Lampiran */}
      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent className="max-w-5xl">
          <DialogHeader>
            <DialogTitle>Pratinjau Lampiran</DialogTitle>
          </DialogHeader>
          <DialogBody>
            {previewItem && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="text-sm font-medium text-gray-800 truncate" title={previewItem.name}>{previewItem.name}</div>
                  <div className="flex items-center gap-2">
                    <a href={previewItem.url} download target="_blank" rel="noreferrer" className="px-3 py-2 bg-gray-100 text-gray-800 rounded hover:bg-gray-200 text-sm">Download</a>
                    <a href={previewItem.url} target="_blank" rel="noreferrer" className="px-3 py-2 bg-white border rounded hover:bg-gray-50 text-sm">Buka Tab Baru</a>
                  </div>
                </div>
                <div className="border rounded-md bg-gray-50 p-2 max-h-[70vh] overflow-auto flex items-center justify-center">
                  {previewItem.isImage ? (
                    <img src={previewItem.url} alt={previewItem.name} className="max-h-[65vh] object-contain" />
                  ) : (
                    <iframe src={previewItem.url} title={previewItem.name} className="w-full h-[70vh] bg-white" />
                  )}
                </div>
              </div>
            )}
          </DialogBody>
          <DialogFooter>
            <button type="button" onClick={() => setPreviewOpen(false)} className="px-4 py-2 border rounded">Tutup</button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminDataBinaLingkungan;
