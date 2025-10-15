import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { targetHarianService } from '@/services/targetHarianService';
import LoadingSpinner from '@/components/UI/LoadingSpinner';
import { Plus, Eye, Edit, Trash2 } from 'lucide-react';

const AdminDataTarget = () => {
  const navigate = useNavigate();
  const [view, setView] = useState('years'); // 'years' | 'yearContent'
  const [years, setYears] = useState([]); // [{year: 2024}, ...]
  const [selectedYear, setSelectedYear] = useState(null);
  const [items, setItems] = useState([]);
  const [pagination, setPagination] = useState({ currentPage: 1, totalPages: 1, totalItems: 0 });
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({ totalRecords: 0, totalNominal: 0 });
  const [lastUpdated, setLastUpdated] = useState(null);

  useEffect(() => {
    if (view === 'years') {
      loadYears();
      loadStatsAndLastUpdated();
    } else if (view === 'yearContent' && selectedYear) {
      loadItems(selectedYear, pagination.currentPage);
    }
  }, [view, selectedYear, pagination.currentPage]);

  const loadYears = async () => {
    try {
      setLoading(true);
      const res = await targetHarianService.getYears();
      if (res?.success) setYears(res.data || []);
      else setYears([]);
    } catch (e) {
      console.error('Error loading years:', e);
      setYears([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Apakah Anda yakin ingin menghapus data taget ini?')) return;
    try {
      const res = await targetHarianService.remove(id);
      if (res?.success !== false) {
        // Reload current page data
        await loadItems(selectedYear, pagination.currentPage);
      } else {
        alert(res?.error || 'Gagal menghapus data');
      }
    } catch (e) {
      console.error('Gagal menghapus taget:', e);
      alert('Gagal menghapus data');
    }
  };

  const loadStatsAndLastUpdated = async () => {
    try {
      const res = await targetHarianService.getAll({ page: 1, limit: 1000 });
      if (res?.success) {
        const its = Array.isArray(res.data) ? res.data : [];
        const totalRecords = res.pagination?.totalItems ?? its.length;
        // Tidak ada nominal di tabel 'taget'; set 0
        const totalNominal = 0;
        setStats({ totalRecords, totalNominal });
        const latest = its.reduce((max, it) => {
          const t = new Date(it.updated_at || it.created_at || it.tanggal_target).getTime();
          return Math.max(max, isFinite(t) ? t : 0);
        }, 0);
        setLastUpdated(latest ? new Date(latest) : new Date());
      } else {
        setStats({ totalRecords: 0, totalNominal: 0 });
        setLastUpdated(new Date());
      }
    } catch (e) {
      console.error('Error loading stats/lastUpdated:', e);
      setStats({ totalRecords: 0, totalNominal: 0 });
      setLastUpdated(new Date());
    }
  };

  const loadItems = async (year, page = 1) => {
    try {
      setLoading(true);
      const res = await targetHarianService.getAll({ year, page, limit: 20 });
      if (res?.success) {
        setItems(Array.isArray(res.data) ? res.data : []);
        setPagination(res.pagination || { currentPage: 1, totalPages: 1, totalItems: 0 });
      } else {
        setItems([]);
        setPagination({ currentPage: 1, totalPages: 1, totalItems: 0 });
      }
    } catch (e) {
      console.error('Error loading data target:', e);
      setItems([]);
      setPagination({ currentPage: 1, totalPages: 1, totalItems: 0 });
    } finally {
      setLoading(false);
    }
  };

  const openYear = (year) => {
    setSelectedYear(year);
    setPagination((p) => ({ ...p, currentPage: 1 }));
    setView('yearContent');
  };

  const backToYears = () => {
    setView('years');
    setSelectedYear(null);
    setItems([]);
    setPagination({ currentPage: 1, totalPages: 1, totalItems: 0 });
  };

  const formatCurrency = (num) => {
    if (num == null) return '-';
    try { return `Rp ${Number(num).toLocaleString('id-ID')}`; } catch { return `${num}`; }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header ala Medsos */}
      <div className="bg-red-800 text-white p-4 mb-0">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">DATA TARGET</h1>
            <p className="text-sm opacity-90">Admin - Marketing</p>
          </div>
          <Link
            to="/admin/marketing/data-target/new"
            className="inline-flex items-center gap-2 px-3 py-2 sm:px-4 sm:py-2 bg-white text-red-700 hover:bg-red-50 transition-colors"
          >
            <Plus className="h-4 w-4" />
            <span>Tambah</span>
          </Link>
        </div>
      </div>
      <div className="bg-gray-200 px-4 py-2 text-xs text-gray-600 -mt-1">Terakhir diupdate: {(lastUpdated ? new Date(lastUpdated) : new Date()).toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric'})} pukul {(lastUpdated ? new Date(lastUpdated) : new Date()).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit'})}</div>

      <div className="py-4">
        {/* Stats Cards (halaman utama sebelum folder) */}
        {view === 'years' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div className="bg-white shadow-sm border p-4">
              <div className="text-sm text-gray-500">Total Target</div>
              <div className="text-2xl font-bold text-gray-900">{stats.totalRecords || 0}</div>
            </div>
            <div className="bg-white shadow-sm border p-4">
              <div className="text-sm text-gray-500">Total Nominal</div>
              <div className="text-2xl font-bold text-gray-900">{`Rp ${(stats.totalNominal||0).toLocaleString('id-ID')}`}</div>
            </div>
            <div className="bg-white shadow-sm border p-4">
              <div className="text-sm text-gray-500">Jumlah Tahun</div>
              <div className="text-2xl font-bold text-gray-900">{years.length}</div>
            </div>
          </div>
        )}
        {/* Grid Years dibungkus card putih ala Owner */}
        {view === 'years' && (
          <div className="bg-white shadow-sm border rounded-lg overflow-hidden mb-4">
            <div className="px-4 py-3 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Pilih Tahun</h2>
            </div>
            <div className="p-3">
              {loading && (
                <div className="text-sm text-gray-600">Memuat daftar tahun...</div>
              )}
              {!loading && years.length === 0 && (
                <div className="text-sm text-gray-600">Belum ada data</div>
              )}
              {!loading && years.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                  {years.map(({ year }) => (
                    <div
                      key={year}
                      className="group p-4 bg-white cursor-pointer border border-gray-200 rounded-xl hover:border-red-300 hover:shadow-md transition-all"
                      onClick={() => openYear(year)}
                    >
                      <div className="flex items-center gap-3">
                        <div className="shrink-0 p-2 rounded-lg bg-yellow-50 group-hover:bg-yellow-100 transition-colors">
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-10 h-10 text-yellow-500">
                            <path d="M10.5 4.5a1.5 1.5 0 0 1 1.06.44l1.5 1.5c.28.3.67.46 1.07.46H19.5A2.25 2.25 0 0 1 21.75 9v7.5A2.25 2.25 0 0 1 19.5 18.75h-15A2.25 2.25 0 0 1 2.25 16.5v-9A2.25 2.25 0 0 1 4.5 5.25h5.25z" />
                          </svg>
                        </div>
                        <div>
                          <div className="font-semibold text-gray-800 group-hover:text-red-700">{year}</div>
                          <div className="text-xs text-gray-500">Folder Tahun</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Year Content */}
        {view === 'yearContent' && (
          <div className="bg-white shadow-sm border rounded-lg overflow-hidden">
            <div className="bg-red-800 text-white px-4 py-3">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold">{selectedYear}</h2>
                  <p className="text-xs opacity-90">Daftar Taget Harian</p>
                </div>
                <div className="flex items-center gap-2">
                  <Link to="/admin/marketing/data-target/new" className="bg-white text-red-700 hover:bg-red-50 inline-flex items-center gap-2 px-3 py-2 rounded-lg">
                    <Plus className="h-4 w-4" /> Tambah
                  </Link>
                  <button onClick={backToYears} className="bg-white text-red-700 hover:bg-red-50 inline-flex items-center gap-2 px-3 py-2 rounded-lg">Kembali</button>
                </div>
              </div>
            </div>

            {/* Summary bar */}
            <div className="px-4 py-2 bg-gray-100 text-xs text-gray-700 flex items-center justify-between">
              <div>
                Total Tahun {selectedYear}: <span className="font-semibold">{(pagination.totalItems || 0).toLocaleString('id-ID')}</span>
              </div>
              <div>
                Ditampilkan: <span className="font-semibold">{(items?.length || 0).toLocaleString('id-ID')}</span>
              </div>
            </div>

            {loading ? (
              <LoadingSpinner />
            ) : items.length === 0 ? (
              <div className="p-8 text-center text-gray-600">Belum ada data pada tahun ini</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="sticky top-0 bg-red-700 z-10 shadow">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-extrabold text-white uppercase tracking-wider">Tanggal</th>
                      <th className="px-6 py-3 text-left text-xs font-extrabold text-white uppercase tracking-wider">Isi</th>
                      <th className="px-6 py-3 text-left text-xs font-extrabold text-white uppercase tracking-wider">Dibuat Oleh</th>
                      <th className="px-6 py-3 text-left text-xs font-extrabold text-white uppercase tracking-wider">Dibuat</th>
                      <th className="px-6 py-3 text-left text-xs font-extrabold text-white uppercase tracking-wider">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {items.map((it) => (
                      <tr key={it.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 text-sm text-gray-900">{new Date(it.tanggal_target).toLocaleDateString('id-ID')}</td>
                        <td className="px-6 py-4 text-sm text-gray-900">
                          {(() => {
                            const plain = String(it.isi_target || '').replace(/<[^>]*>/g, '');
                            return plain.length > 100 ? `${plain.slice(0, 100)}...` : plain;
                          })()}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900">{it.user_nama || '-'}</td>
                        <td className="px-6 py-4 text-sm text-gray-500">{new Date(it.created_at).toLocaleDateString('id-ID')}</td>
                        <td className="px-6 py-4 text-sm text-gray-900">
                          <div className="flex items-center gap-3">
                            <button
                              onClick={() => navigate(`/admin/marketing/data-target/${it.id}`)}
                              className="text-blue-600 hover:text-blue-900"
                              title="Lihat"
                            >
                              <Eye className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => navigate(`/admin/marketing/data-target/${it.id}/edit`)}
                              className="text-green-600 hover:text-green-900"
                              title="Edit"
                            >
                              <Edit className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(it.id)}
                              className="text-red-600 hover:text-red-900"
                              title="Hapus"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Pagination */}
            {!loading && pagination.totalPages > 1 && (
              <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
                <div className="text-sm text-gray-700">
                  Menampilkan {((pagination.currentPage - 1) * 20) + 1} - {Math.min(pagination.currentPage * 20, pagination.totalItems)} dari {pagination.totalItems}
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setPagination((p) => ({ ...p, currentPage: Math.max(p.currentPage - 1, 1) }))}
                    disabled={pagination.currentPage === 1}
                    className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
                  >
                    Sebelumnya
                  </button>
                  <span className="text-sm">Halaman {pagination.currentPage} dari {pagination.totalPages}</span>
                  <button
                    onClick={() => setPagination((p) => ({ ...p, currentPage: Math.min(p.currentPage + 1, p.totalPages) }))}
                    disabled={pagination.currentPage === pagination.totalPages}
                    className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
                  >
                    Selanjutnya
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDataTarget;
