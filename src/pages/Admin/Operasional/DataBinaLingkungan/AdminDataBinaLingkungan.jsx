import React, { useEffect, useMemo, useState } from 'react';
import { adminDataBinaLingkunganService as service } from '../../../../services/dataBinaLingkunganService';
import {
  Search,
  Plus,
  Phone,
  MapPin,
  User,
  Briefcase,
  ChevronDown,
  ChevronRight,
  Edit as EditIcon,
  Trash2,
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
    setShowForm(true);
  };

  const openEdit = (item) => {
    setEditingId(item.id);
    setForm({ lokasi: item.lokasi || '', jabatan: item.jabatan || '', nama: item.nama || '', no_hp: item.no_hp || '', alamat: item.alamat || '', nominal: item.nominal || '' });
    setShowForm(true);
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError('');
      if (editingId) {
        await service.update(editingId, form);
      } else {
        await service.create(form);
      }
      setShowForm(false);
      await fetchData();
    } catch (err) {
      setError(err?.response?.data?.message || 'Gagal menyimpan data');
    } finally {
      setLoading(false);
    }
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

  return (
    <div className="p-0 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="bg-red-800 text-white px-6 py-4 sticky top-0 z-30">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span className="text-sm font-semibold bg-white/10 rounded px-2 py-1">A01-Ops</span>
            <div>
              <h1 className="text-xl md:text-2xl font-extrabold tracking-tight">DATA BINA LINGKUNGAN</h1>
              <p className="text-sm text-red-100">Kelola dan monitor data bina lingkungan (Admin)</p>
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
      <div className="bg-gray-200 px-6 py-2 text-xs text-gray-600">Data terbaru berada di paling atas</div>

      <div className="px-6 py-6">
        {/* Statistics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <User className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Total Penerima</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <Briefcase className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Total Nominal</p>
                <p className="text-2xl font-bold text-gray-900">{formatRupiah(stats.totalNominal)}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <MapPin className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Jumlah Lokasi</p>
                <p className="text-2xl font-bold text-gray-900">{stats.lokasiCount}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-orange-100 rounded-lg">
                <span className="text-orange-600 font-bold text-sm">TOP</span>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Lokasi Teratas</p>
                <p className="text-base font-semibold text-gray-900">{stats.topLokasi} ({stats.topCount})</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Cari</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input type="text" placeholder="Masukkan nama / jabatan / lokasi..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Lokasi</label>
              <select value={lokasiFilter} onChange={(e) => setLokasiFilter(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500">
                <option value="">Semua Lokasi</option>
                {locations.map((loc, idx) => {
                  const value = typeof loc === 'string' ? loc : (loc?.lokasi ?? '');
                  const label = value || '-';
                  return <option key={`${label}-${idx}`} value={value}>{label}</option>;
                })}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Item per Halaman</label>
              <select value={pagination.itemsPerPage} onChange={(e) => setPagination(p => ({ ...p, itemsPerPage: Number(e.target.value), currentPage: 1 }))} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500">
                {[10, 20, 50, 100].map(n => <option key={n} value={n}>{n}/hal</option>)}
              </select>
            </div>
          </div>
        </div>

        {/* Sections by Lokasi */}
        <div className="space-y-6">
          {groupedByLokasi.orderedKeys.map((locKey) => (
            <div key={locKey} className="bg-white rounded-lg shadow-md overflow-hidden">
              <button onClick={() => setActiveSection(activeSection === locKey ? '' : locKey)} className="w-full px-6 py-4 bg-red-800 text-white flex items-center justify-between hover:bg-red-900 transition-colors">
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
                <div className="p-6">
                  {groupedByLokasi.groups[locKey].length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {groupedByLokasi.groups[locKey].map((item) => (
                        <div key={item.id} className="bg-gray-50 rounded-lg p-4 border hover:shadow-md transition-shadow">
                          <div className="flex justify-between items-start mb-3">
                            <div className="flex-1">
                              <h4 className="font-semibold text-gray-900">{item.nama}</h4>
                              <div className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800 mt-1">{item.jabatan || '—'}</div>
                            </div>
                            <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">{item.lokasi || 'Tanpa Lokasi'}</span>
                          </div>

                          <div className="space-y-2 mb-4">
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <Phone className="h-4 w-4" />
                              <span>{item.no_hp || '-'}</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <MapPin className="h-4 w-4" />
                              <span className="line-clamp-2">{item.alamat || '-'}</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-gray-700 font-semibold">
                              <span>Nominal:</span>
                              <span>{formatRupiah(item.nominal)}</span>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <button onClick={() => openEdit(item)} className="p-1.5 text-gray-400 hover:text-gray-600 border border-gray-300 rounded hover:bg-gray-50" title="Edit">
                              <EditIcon className="h-4 w-4" />
                            </button>
                            <button onClick={() => onDelete(item.id)} className="p-1.5 text-red-400 hover:text-red-600 border border-gray-300 rounded hover:bg-red-50" title="Hapus">
                              <Trash2 className="h-4 w-4" />
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
          <form onSubmit={onSubmit}>
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
              </div>
            </DialogBody>
            <DialogFooter>
              <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 border rounded">Batal</button>
              <button type="submit" className="px-4 py-2 bg-red-700 text-white rounded">Simpan</button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminDataBinaLingkungan;
