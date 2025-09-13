import React, { useEffect, useMemo, useState } from 'react';
import { dataTargetService } from '../../../../services/dataTargetService';
import { Plus } from 'lucide-react';

const OwnerDataTarget = () => {
  // Views: daftar folder tahun atau konten tahun
  const [view, setView] = useState('years'); // 'years' | 'yearContent'
  const [years, setYears] = useState([]); // ex: [2023, 2024]
  const [selectedYear, setSelectedYear] = useState(null);

  // Data konten tahun
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({ currentPage: 1, totalPages: 1, totalItems: 0 });

  // Stats ringkas
  const [stats, setStats] = useState({ totalTarget: 0, totalNominal: 0 });
  const [lastUpdated, setLastUpdated] = useState(null);

  const currency = useMemo(() => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }), []);

  // Ambil sampel data owner untuk derive years & stats global (tanpa endpoint years)
  const loadYearsAndStats = async () => {
    try {
      setLoading(true);
      const res = await dataTargetService.owner.getAll({ page: 1, limit: 1000 });
      if (res?.success) {
        const its = res.data.items || [];
        const uniqYears = Array.from(new Set(its.map(it => new Date(it.created_at).getFullYear()))).filter(Boolean).sort((a,b)=>b-a);
        setYears(uniqYears);
        const totalTarget = res.data.pagination?.totalItems ?? its.length;
        const totalNominal = (res.data.statistics?.totalNominal != null)
          ? Number(res.data.statistics.totalNominal)
          : its.reduce((a,b)=> a + (Number(b.target_nominal)||0), 0);
        setStats({ totalTarget, totalNominal });
        const latest = its.reduce((max, it) => {
          const t = new Date(it.updated_at || it.created_at).getTime();
          return Math.max(max, isFinite(t) ? t : 0);
        }, 0);
        setLastUpdated(latest ? new Date(latest) : new Date());
      } else {
        setYears([]);
        setStats({ totalTarget: 0, totalNominal: 0 });
        setLastUpdated(new Date());
      }
    } catch (e) {
      console.error('Error loading years/stats:', e);
      setYears([]);
      setStats({ totalTarget: 0, totalNominal: 0 });
      setLastUpdated(new Date());
    } finally {
      setLoading(false);
    }
  };

  // Muat daftar items untuk tahun terpilih
  const loadYearItems = async (year, page = 1) => {
    try {
      setLoading(true);
      setError(null);
      const res = await dataTargetService.owner.getAll({ year, page, limit: 20 });
      if (res?.success) {
        setItems(res.data.items || []);
        setPagination(res.data.pagination || { currentPage: 1, totalPages: 1, totalItems: 0 });
      } else {
        setItems([]);
        setPagination({ currentPage: 1, totalPages: 1, totalItems: 0 });
      }
    } catch (e) {
      console.error('Error loading year items:', e);
      setError('Gagal memuat data');
      setItems([]);
      setPagination({ currentPage: 1, totalPages: 1, totalItems: 0 });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (view === 'years') {
      loadYearsAndStats();
    } else if (view === 'yearContent' && selectedYear) {
      loadYearItems(selectedYear, pagination.currentPage);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [view, selectedYear, pagination.currentPage]);

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

  const formatLastUpdated = () => {
    const d = lastUpdated ? new Date(lastUpdated) : new Date();
    const tgl = d.toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' });
    const jam = d.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
    return `${tgl} pukul ${jam}`;
  };

  const FolderIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-10 h-10 text-yellow-500">
      <path d="M10.5 4.5a1.5 1.5 0 0 1 1.06.44l1.5 1.5c.28.3.67.46 1.07.46H19.5A2.25 2.25 0 0 1 21.75 9v7.5A2.25 2.25 0 0 1 19.5 18.75h-15A2.25 2.25 0 0 1 2.25 16.5v-9A2.25 2.25 0 0 1 4.5 5.25h5.25z" />
    </svg>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header ala Laporan Keuangan */}
      <div className="bg-red-800 text-white p-4 mb-0">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">DATA TARGET</h1>
            <p className="text-sm opacity-90">Owner - Marketing</p>
          </div>
          {view === 'years' && (
            <button
              type="button"
              className="inline-flex items-center gap-2 px-3 py-2 sm:px-4 sm:py-2 bg-white text-red-700 hover:bg-red-50 transition-colors"
            >
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">Tambah</span>
            </button>
          )}
        </div>
      </div>
      <div className="bg-gray-200 px-4 py-2 text-xs text-gray-600 -mt-1 mb-4">Terakhir diupdate: {formatLastUpdated()}</div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 px-4 mb-4">
        <div className="bg-white shadow-sm border p-4">
          <div className="text-sm text-gray-500">Total Target</div>
          <div className="text-2xl font-bold text-gray-900">{stats.totalTarget || 0}</div>
        </div>
        <div className="bg-white shadow-sm border p-4">
          <div className="text-sm text-gray-500">Total Nominal</div>
          <div className="text-2xl font-bold text-gray-900">{currency.format(stats.totalNominal || 0)}</div>
        </div>
        <div className="bg-white shadow-sm border p-4">
          <div className="text-sm text-gray-500">Jumlah Tahun</div>
          <div className="text-2xl font-bold text-gray-900">{years.length}</div>
        </div>
      </div>

      {/* Years Folder Grid */}
      {view === 'years' && (
        <div className="bg-white shadow-sm border mx-4 mb-4">
          <div className="p-3 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Pilih Tahun</h2>
            {loading && <div className="text-sm text-gray-600">Memuat daftar tahun...</div>}
            {!loading && years.length === 0 && (
              <div className="text-sm text-gray-600">Belum ada data</div>
            )}
            {!loading && years.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
                {years.map((year) => (
                  <div
                    key={year}
                    className="group p-4 bg-white cursor-pointer ring-1 ring-gray-200 hover:ring-red-300 hover:shadow transition-all"
                    onClick={() => openYear(year)}
                  >
                    <div className="flex items-center space-x-2">
                      <FolderIcon />
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

      {/* Year Content Table */}
      {view === 'yearContent' && (
        <div className="bg-white shadow-sm border mx-4">
          <div className="bg-red-800 text-white px-4 py-3">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold">{selectedYear}</h2>
                <p className="text-xs opacity-90">Daftar Data Target</p>
              </div>
              <div className="flex items-center gap-2">
                <button className="bg-white border-red-600 text-red-700 hover:bg-red-50 inline-flex items-center gap-2 px-3 py-2">
                  <Plus className="h-4 w-4" /> Tambah
                </button>
                <button onClick={backToYears} className="bg-white border-red-600 text-red-700 hover:bg-red-50 inline-flex items-center gap-2 px-3 py-2">
                  Kembali
                </button>
              </div>
            </div>
          </div>

          {loading ? (
            <div className="p-6 text-sm text-gray-600">Memuat data...</div>
          ) : error ? (
            <div className="p-6 text-sm text-red-600">{error}</div>
          ) : items.length === 0 ? (
            <div className="p-6 text-center text-gray-600">Belum ada data pada tahun ini</div>
          ) : (
            <div className="table-responsive">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nama Target</th>
                    <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nominal</th>
                    <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Dibuat Oleh</th>
                    <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Dibuat</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {items.map((it) => (
                    <tr key={it.id} className="hover:bg-gray-50">
                      <td className="px-4 sm:px-6 py-2 text-sm text-gray-900">{it.nama_target}</td>
                      <td className="px-4 sm:px-6 py-2 text-sm text-gray-900">{currency.format(it.target_nominal)}</td>
                      <td className="px-4 sm:px-6 py-2 text-sm text-gray-900">{it.creator?.nama || '-'}</td>
                      <td className="px-4 sm:px-6 py-2 text-sm text-gray-500">{new Date(it.created_at).toLocaleDateString('id-ID')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {!loading && pagination.totalPages > 1 && (
            <div className="px-3 py-2 border-t border-gray-200 flex items-center justify-between">
              <div className="text-sm text-gray-700">
                Menampilkan {((pagination.currentPage - 1) * 20) + 1} - {Math.min(pagination.currentPage * 20, pagination.totalItems)} dari {pagination.totalItems}
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPagination((p) => ({ ...p, currentPage: Math.max(p.currentPage - 1, 1) }))}
                  disabled={pagination.currentPage === 1}
                  className="px-3 py-2 border border-gray-300 hover:bg-gray-50 disabled:opacity-50"
                >
                  Sebelumnya
                </button>
                <span className="text-sm">Halaman {pagination.currentPage} dari {pagination.totalPages}</span>
                <button
                  onClick={() => setPagination((p) => ({ ...p, currentPage: Math.min(p.currentPage + 1, p.totalPages) }))}
                  disabled={pagination.currentPage === pagination.totalPages}
                  className="px-3 py-2 border border-gray-300 hover:bg-gray-50 disabled:opacity-50"
                >
                  Selanjutnya
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default OwnerDataTarget;
