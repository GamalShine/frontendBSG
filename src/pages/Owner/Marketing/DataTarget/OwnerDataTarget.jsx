import React from 'react';

import { useEffect, useMemo, useState } from 'react';
import { dataTargetService } from '../../../../services/dataTargetService';

const OwnerDataTarget = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [search, setSearch] = useState('');
  const [pagination, setPagination] = useState({ currentPage: 1, totalPages: 1, totalItems: 0, itemsPerPage: 10 });
  const [statistics, setStatistics] = useState({ totalTarget: 0, totalNominal: 0 });

  const currency = useMemo(() => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }), []);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await dataTargetService.owner.getAll({ page, limit, search: search || undefined });
      if (res?.success) {
        setItems(res.data.items || []);
        setPagination(res.data.pagination || { currentPage: 1, totalPages: 1, totalItems: 0, itemsPerPage: limit });
        setStatistics(res.data.statistics || { totalTarget: 0, totalNominal: 0 });
      } else {
        throw new Error(res?.message || 'Gagal memuat data');
      }
    } catch (err) {
      setError(err?.response?.data?.message || err.message || 'Terjadi kesalahan');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, limit]);

  const onSearch = (e) => {
    e.preventDefault();
    setPage(1);
    fetchData();
  };

  const resetSearch = () => {
    setSearch('');
    setPage(1);
    fetchData();
  };

  return (
    <div className="container mx-auto p-6">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">Data Target - Owner</h1>

        {/* Toolbar */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-4">
          <form onSubmit={onSearch} className="flex items-center gap-2 w-full md:w-auto">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari nama_target..."
              className="w-full md:w-64 border rounded px-3 py-2 focus:outline-none focus:ring"
            />
            <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">Cari</button>
            <button type="button" onClick={resetSearch} className="px-3 py-2 border rounded hover:bg-gray-50">Reset</button>
          </form>

          <div className="flex items-center gap-2">
            <label className="text-sm text-gray-600">Tampil</label>
            <select value={limit} onChange={(e) => { setLimit(parseInt(e.target.value, 10)); setPage(1);} } className="border rounded px-2 py-1">
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
            </select>
            <span className="text-sm text-gray-500">per halaman</span>
          </div>
        </div>

        {/* Statistik */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
          <div className="p-4 border rounded-lg">
            <div className="text-sm text-gray-500">Total Target</div>
            <div className="text-xl font-semibold">{statistics.totalTarget?.toLocaleString('id-ID')}</div>
          </div>
          <div className="p-4 border rounded-lg">
            <div className="text-sm text-gray-500">Total Nominal</div>
            <div className="text-xl font-semibold">{currency.format(statistics.totalNominal || 0)}</div>
          </div>
        </div>

        {/* Tabel data_target */}
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">No</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">nama_target</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">target_nominal</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">created_at</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">updated_at</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">creator.nama</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">updater.nama</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading && (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-gray-500">Memuat data...</td>
                </tr>
              )}
              {error && !loading && (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-red-600">{error}</td>
                </tr>
              )}
              {!loading && !error && items.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-gray-500">Tidak ada data</td>
                </tr>
              )}
              {!loading && !error && items.map((it, idx) => (
                <tr key={it.id} className="hover:bg-gray-50">
                  <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-700">{(pagination.currentPage - 1) * pagination.itemsPerPage + idx + 1}</td>
                  <td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-gray-900">{it.nama_target}</td>
                  <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">{currency.format(parseFloat(it.target_nominal || 0))}</td>
                  <td className="px-4 py-2 whitespace-nowrap text-xs text-gray-500">{new Date(it.created_at).toLocaleString('id-ID')}</td>
                  <td className="px-4 py-2 whitespace-nowrap text-xs text-gray-500">{new Date(it.updated_at).toLocaleString('id-ID')}</td>
                  <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-700">{it.creator?.nama || '-'}</td>
                  <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-700">{it.updater?.nama || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mt-4">
          <div className="text-sm text-gray-600">
            Menampilkan {(items.length > 0) ? ((pagination.currentPage - 1) * pagination.itemsPerPage + 1) : 0}
            {' - '}
            {(pagination.currentPage - 1) * pagination.itemsPerPage + items.length}
            {' dari '}
            {pagination.totalItems} data
          </div>
          <div className="flex items-center gap-2">
            <button
              className="px-3 py-1 border rounded disabled:opacity-50"
              disabled={pagination.currentPage <= 1 || loading}
              onClick={() => setPage(p => Math.max(1, p - 1))}
            >
              Prev
            </button>
            <span className="text-sm text-gray-600">Hal {pagination.currentPage} / {pagination.totalPages}</span>
            <button
              className="px-3 py-1 border rounded disabled:opacity-50"
              disabled={pagination.currentPage >= pagination.totalPages || loading}
              onClick={() => setPage(p => Math.min(pagination.totalPages, p + 1))}
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OwnerDataTarget;
