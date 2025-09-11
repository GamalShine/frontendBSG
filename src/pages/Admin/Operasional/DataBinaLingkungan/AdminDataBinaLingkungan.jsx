import React, { useEffect, useMemo, useState } from 'react';
import { adminDataBinaLingkunganService as service } from '../../../../services/dataBinaLingkunganService';

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
    <div className="container mx-auto p-6">
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold text-gray-800">Data Bina Lingkungan - Admin</h1>
          <button onClick={openCreate} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">Tambah</button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
          <input
            type="search"
            placeholder="Cari nama/jabatan/lokasi..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            enterKeyHint="search"
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="none"
            spellCheck={false}
            className="border rounded px-3 py-2"
          />
          <select value={lokasiFilter} onChange={(e) => setLokasiFilter(e.target.value)} className="border rounded px-3 py-2">
            <option value="">Semua Lokasi</option>
            {locations.map((loc, idx) => {
              const label = typeof loc === 'string' ? loc : (loc?.lokasi ?? '');
              return (
                <option key={label || idx} value={label}>{label}</option>
              );
            })}
          </select>
          <select
            value={pagination.itemsPerPage}
            onChange={(e) => setPagination(p => ({ ...p, itemsPerPage: Number(e.target.value), currentPage: 1 }))}
            className="border rounded px-3 py-2"
          >
            {[10, 20, 50, 100].map(n => <option key={n} value={n}>{n}/hal</option>)}
          </select>
        </div>

        {error && <div className="mb-3 text-red-600">{error}</div>}
        {loading && <div className="mb-3">Memuat...</div>}

        <div className="overflow-x-auto">
          <table className="min-w-full border">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-2 border">Lokasi</th>
                <th className="p-2 border">Jabatan</th>
                <th className="p-2 border">Nama</th>
                <th className="p-2 border">No HP</th>
                <th className="p-2 border">Alamat</th>
                <th className="p-2 border">Nominal</th>
                <th className="p-2 border">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {items.map(item => (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="p-2 border">{item.lokasi}</td>
                  <td className="p-2 border">{item.jabatan}</td>
                  <td className="p-2 border">{item.nama}</td>
                  <td className="p-2 border">{item.no_hp}</td>
                  <td className="p-2 border">{item.alamat}</td>
                  <td className="p-2 border">{item.nominal}</td>
                  <td className="p-2 border space-x-2">
                    <button onClick={() => openEdit(item)} className="px-3 py-1 text-sm bg-yellow-500 text-white rounded">Edit</button>
                    <button onClick={() => onDelete(item.id)} className="px-3 py-1 text-sm bg-red-600 text-white rounded">Hapus</button>
                  </td>
                </tr>
              ))}
              {items.length === 0 && !loading && (
                <tr>
                  <td className="p-4 text-center" colSpan={7}>Tidak ada data</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between mt-4">
          <button
            className="px-3 py-2 border rounded disabled:opacity-50"
            onClick={() => setPagination(p => ({ ...p, currentPage: Math.max(1, p.currentPage - 1) }))}
            disabled={pagination.currentPage <= 1}
          >Prev</button>
          <div>Hal {pagination.currentPage} / {pagination.totalPages}</div>
          <button
            className="px-3 py-2 border rounded disabled:opacity-50"
            onClick={() => setPagination(p => ({ ...p, currentPage: Math.min(p.totalPages, p.currentPage + 1) }))}
            disabled={pagination.currentPage >= pagination.totalPages}
          >Next</button>
        </div>

        {showForm && (
          <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center p-4">
            <div className="bg-white rounded shadow-lg w-full max-w-2xl p-4">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-xl font-semibold">{editingId ? 'Edit' : 'Tambah'} Data</h2>
                <button onClick={() => setShowForm(false)} className="text-gray-600">Tutup</button>
              </div>
              <form onSubmit={onSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm mb-1">Lokasi</label>
                  <input name="lokasi" value={form.lokasi} onChange={onChangeForm} className="w-full border rounded px-3 py-2" required />
                </div>
                <div>
                  <label className="block text-sm mb-1">Jabatan</label>
                  <input name="jabatan" value={form.jabatan} onChange={onChangeForm} className="w-full border rounded px-3 py-2" required />
                </div>
                <div>
                  <label className="block text-sm mb-1">Nama</label>
                  <input name="nama" value={form.nama} onChange={onChangeForm} className="w-full border rounded px-3 py-2" required />
                </div>
                <div>
                  <label className="block text-sm mb-1">No HP</label>
                  <input name="no_hp" value={form.no_hp} onChange={onChangeForm} className="w-full border rounded px-3 py-2" required />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm mb-1">Alamat</label>
                  <textarea name="alamat" value={form.alamat} onChange={onChangeForm} className="w-full border rounded px-3 py-2" required />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm mb-1">Nominal</label>
                  <input name="nominal" value={form.nominal} onChange={onChangeForm} className="w-full border rounded px-3 py-2" required />
                </div>
                <div className="md:col-span-2 flex justify-end gap-2 mt-2">
                  <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 border rounded">Batal</button>
                  <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded">Simpan</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDataBinaLingkungan;
