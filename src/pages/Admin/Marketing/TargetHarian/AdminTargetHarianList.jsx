import React, { useEffect, useMemo, useState } from 'react';
import { targetHarianService } from '../../../../services/targetHarianService';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, Edit, Trash2, Plus } from 'lucide-react';

const AdminTargetHarianList = () => {
  const navigate = useNavigate();
  const [view, setView] = useState('years'); // years | yearContent
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [search, setSearch] = useState('');
  const [date, setDate] = useState('');
  const [year, setYear] = useState('');
  const [years, setYears] = useState([]);
  const [pagination, setPagination] = useState({ currentPage: 1, totalPages: 1, totalItems: 0, itemsPerPage: 10 });
  const [stats, setStats] = useState({ total_records: 0, total_this_month: 0, total_this_year: 0 });
  const [showFilters, setShowFilters] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  // Helpers & memo
  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const d = new Date(dateString);
    return d.toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' });
  };
  const formatDateTime = (dateString) => {
    if (!dateString) return '-';
    const d = new Date(dateString);
    return d.toLocaleString('id-ID', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  };
  const isToday = (dateString) => {
    if (!dateString) return false;
    const d = new Date(dateString);
    const now = new Date();
    return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth() && d.getDate() === now.getDate();
  };
  const truncateText = (text, maxLength = 150) => {
    if (!text) return '-';
    return text.length <= maxLength ? text : text.substring(0, maxLength) + '...';
  };
  const lastUpdatedText = useMemo(() => {
    if (!items || items.length === 0) return '-';
    const latest = items[0];
    const dt = latest?.created_at || latest?.tanggal_target;
    return formatDateTime(dt);
  }, [items]);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await targetHarianService.getAll({ page, limit, search: search || undefined, date: date || undefined, year: year || undefined });
      if (res?.success) {
        setItems(res.data || res.data?.items || []);
        setPagination(res.pagination || res.data?.pagination || { currentPage: page, totalPages: 1, totalItems: 0, itemsPerPage: limit });
      } else {
        throw new Error(res?.error || 'Gagal memuat data');
      }
    } catch (err) {
      setError(err?.response?.data?.error || err.message || 'Terjadi kesalahan');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (view === 'years') {
      setLoading(true);
      (async () => {
        try {
          const y = await targetHarianService.getYears();
          if (y?.success) setYears(y.data || []);
          else setYears([]);
        } catch (_) {
          setYears([]);
          setError('Gagal memuat daftar tahun');
        } finally {
          setLoading(false);
        }
      })();
    } else {
      fetchData();
      // load stats for cards
      (async () => {
        try {
          const s = await targetHarianService.stats();
          if (s?.success) setStats(s.data || {});
        } catch (_) {}
      })();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, limit, view]);

  // Restore folder/tahun terakhir dibuka (Admin) hanya jika kembali dari detail/edit/tambah
  useEffect(() => {
    try {
      const last = sessionStorage.getItem('admin.dataTarget.lastYear');
      const returning = sessionStorage.getItem('admin.dataTarget.returning');
      if (last && returning === '1' && view === 'years') {
        setYear(last);
        setView('yearContent');
        sessionStorage.setItem('admin.dataTarget.returning', '0');
      }
    } catch (_) {}
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onSearch = (e) => {
    e.preventDefault();
    setPage(1);
    fetchData();
  };

  const resetFilters = () => {
    setSearch('');
    setDate('');
    setYear('');
    setPage(1);
    fetchData();
  };

  const openYear = (y) => {
    setYear(y);
    setPage(1);
    setView('yearContent');
    try { sessionStorage.setItem('admin.dataTarget.lastYear', String(y)); } catch (_) {}
    fetchData();
  };

  const backToYears = () => {
    setView('years');
    setItems([]);
    setPagination({ currentPage: 1, totalPages: 1, totalItems: 0, itemsPerPage: limit });
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Hapus data target ini?')) return;
    try {
      setDeletingId(id);
      const res = await targetHarianService.remove(id);
      if (!res?.success) throw new Error(res?.error || 'Gagal menghapus');
      await fetchData();
    } catch (e) {
      alert(e.message || 'Gagal menghapus');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="px-0 py-2 bg-gray-50 min-h-screen">
      {/* Header ala Owner Laporan Keuangan */}
      <div className="bg-red-800 text-white p-4 mb-0">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">DATA TARGET</h1>
            <p className="text-sm opacity-90">Admin - Marketing</p>
          </div>
          {view === 'yearContent' ? (
            <button onClick={backToYears} className="inline-flex items-center gap-2 px-3 py-2 bg-white text-red-700 hover:bg-red-50 transition-colors">Kembali</button>
          ) : (
            <button onClick={() => setShowFilters(v => !v)} className="inline-flex items-center gap-2 px-3 py-2 bg-white text-red-700 hover:bg-red-50 transition-colors">Pencarian</button>
          )}
        </div>
      </div>

      {/* Years Grid / Toolbar */}
      {view === 'years' ? (
        <div className="px-4 py-4">
          {error && (
            <div className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-md px-3 py-2 mb-3">{error}</div>
          )}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
            {loading && (
              <div className="col-span-full text-sm text-gray-600">Memuat daftar tahun...</div>
            )}
            {!loading && years.length === 0 && (
              <div className="col-span-full text-sm text-gray-600">Belum ada data</div>
            )}
            {!loading && years.map(({ year: y }) => (
              <div key={y} className="group p-4 bg-white cursor-pointer ring-1 ring-gray-200 hover:ring-red-300 hover:shadow transition-all" onClick={() => openYear(y)}>
                <div className="flex items-center space-x-2">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-10 h-10 text-red-500"><path d="M10.5 4.5a1.5 1.5 0 0 1 1.06.44l1.5 1.5c.28.3.67.46 1.07.46H19.5A2.25 2.25 0 0 1 21.75 9v7.5A2.25 2.25 0 0 1 19.5 18.75h-15A2.25 2.25 0 0 1 2.25 16.5v-9A2.25 2.25 0 0 1 4.5 5.25h5.25z" /></svg>
                  <div>
                    <div className="font-semibold text-gray-800 group-hover:text-red-700">{y}</div>
                    <div className="text-xs text-gray-500">Folder Tahun</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <>
          {/* Info bar */}
          <div className="bg-gray-200 px-4 py-2 text-xs text-gray-600">Terakhir diupdate: {lastUpdatedText}</div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4 mb-4 px-4">
            <div className="bg-white shadow-sm border p-4">
              <p className="text-sm font-medium text-gray-500">Total Target</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total_records || 0}</p>
            </div>
            <div className="bg-white shadow-sm border p-4">
              <p className="text-sm font-medium text-gray-500">Bulan Ini</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total_this_month || 0}</p>
            </div>
            <div className="bg-white shadow-sm border p-4">
              <p className="text-sm font-medium text-gray-500">Tahun Ini</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total_this_year || 0}</p>
            </div>
          </div>

          {/* Filter Panel Toggle */}
          <div className="px-4 mb-2">
            <div className="flex items-center gap-2">
              <button onClick={() => setShowFilters(v => !v)} className="px-4 py-2 border border-gray-400 text-gray-700 hover:bg-gray-50">PENCARIAN</button>
              <Link to="/admin/marketing/data-target/new" className="inline-flex items-center gap-2 px-4 py-2 border border-gray-400 text-gray-700 hover:bg-gray-50">
                <Plus className="h-4 w-4" />
                Tambah
              </Link>
              <button onClick={backToYears} className="px-4 py-2 border border-gray-400 text-gray-700 hover:bg-gray-50">Kembali ke Tahun</button>
            </div>
          </div>

          {showFilters && (
            <div className="bg-white shadow-sm border border-gray-200 mx-4 mb-4">
              <div className="px-4 py-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Tahun</label>
                    <span className="px-2 py-2 bg-gray-100 rounded text-sm inline-block">{year}</span>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Tanggal</label>
                    <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="w-full border rounded px-3 py-2" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Cari</label>
                    <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Cari isi_target..." className="w-full border rounded px-3 py-2" />
                  </div>
                </div>
                <div className="mt-3 flex items-center gap-2">
                  <button onClick={onSearch} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">Terapkan</button>
                  <button type="button" onClick={resetFilters} className="px-4 py-2 border rounded hover:bg-gray-50">Reset</button>
                </div>
              </div>
            </div>
          )}

          {/* Panel Tahun + Tabel */}
          <div className="bg-white shadow-sm border mx-4 overflow-x-auto">
            <div className="bg-red-800 text-white px-4 py-3">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold">Tahun {year}</h2>
                  <p className="text-xs opacity-90">Daftar Data Target</p>
                </div>
                <div className="flex items-center gap-2">
                  <Link to="/admin/marketing/data-target/new" className="bg-white border-red-600 text-red-700 hover:bg-red-50 inline-flex items-center gap-2 px-3 py-2">Tambah</Link>
                  <button onClick={backToYears} className="bg-white border-red-600 text-red-700 hover:bg-red-50 inline-flex items-center gap-2 px-3 py-2">Kembali</button>
                </div>
              </div>
            </div>
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 uppercase">No</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 uppercase">Tanggal</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 uppercase">Keterangan</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 uppercase">Aksi</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {loading && (
                  <tr><td colSpan={4} className="px-4 py-8 text-center text-gray-500">Memuat data...</td></tr>
                )}
                {error && !loading && (
                  <tr><td colSpan={4} className="px-4 py-8 text-center text-red-600">{error}</td></tr>
                )}
                {!loading && !error && items.length === 0 && (
                  <tr><td colSpan={4} className="px-4 py-8 text-center text-gray-500">Tidak ada data</td></tr>
                )}
                {!loading && !error && items.map((it, idx) => (
                  <tr key={it.id} className="hover:bg-gray-50 align-top">
                    <td className="px-4 py-2 text-sm text-gray-700">{(pagination.currentPage - 1) * pagination.itemsPerPage + idx + 1}</td>
                    <td className="px-4 py-2 text-sm text-gray-900 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{formatDate(it.tanggal_target).toUpperCase()}</span>
                        {isToday(it.tanggal_target) && (
                          <span className="inline-flex items-center rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-semibold text-blue-700 ring-1 ring-inset ring-blue-600/10">NEW</span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-2 text-sm text-gray-700 whitespace-pre-line max-w-xl">{truncateText(it.isi_target, 150)}</td>
                    <td className="px-4 py-2 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-3">
                        <Link to={`/admin/marketing/data-target/${it.id}`} className="text-blue-600 hover:text-blue-900" title="Lihat"><Eye className="h-4 w-4" /></Link>
                        <Link to={`/admin/marketing/data-target/${it.id}/edit`} className="text-green-600 hover:text-green-900" title="Edit"><Edit className="h-4 w-4" /></Link>
                        <button onClick={() => handleDelete(it.id)} disabled={deletingId === it.id} className="text-red-600 hover:text-red-900 disabled:opacity-50" title="Hapus">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Pagination */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-4">
              <div className="text-sm text-gray-600">
                Menampilkan {(items.length > 0) ? ((pagination.currentPage - 1) * pagination.itemsPerPage + 1) : 0}
                {' - '}
                {(pagination.currentPage - 1) * pagination.itemsPerPage + items.length}
                {' dari '}
                {pagination.totalItems} data
              </div>
              <div className="flex items-center gap-2">
                <button className="px-3 py-1 border rounded disabled:opacity-50" disabled={pagination.currentPage <= 1 || loading} onClick={() => setPage(p => Math.max(1, p - 1))}>Prev</button>
                <span className="text-sm text-gray-600">Hal {pagination.currentPage} / {pagination.totalPages}</span>
                <button className="px-3 py-1 border rounded disabled:opacity-50" disabled={pagination.currentPage >= pagination.totalPages || loading} onClick={() => setPage(p => Math.min(pagination.totalPages, p + 1))}>Next</button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default AdminTargetHarianList;
