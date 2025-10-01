import React, { useState, useEffect } from 'react';
import Table, { 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/UI/Table';
import LoadingSpinner from '@/components/UI/LoadingSpinner';
import { dataTargetService } from '@/services/dataTargetService';

const OwnerDataTarget = () => {
  const [dataTarget, setDataTarget] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    search: '',
    page: 1,
    limit: 10
  });
  const [stats, setStats] = useState({});
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [pagination, setPagination] = useState({ currentPage: 1, totalPages: 1, totalItems: 0, itemsPerPage: 10 });

  // Debounce search text to reduce refetch churn
  useEffect(() => {
    const t = setTimeout(() => {
      setDebouncedSearch(filters.search);
    }, 300);
    return () => clearTimeout(t);
  }, [filters.search]);

  useEffect(() => {
    fetchDataTarget({
      search: debouncedSearch,
      page: filters.page,
      limit: filters.limit
    });
  }, [debouncedSearch, filters.page, filters.limit]);

  const fetchDataTarget = async ({ search, page, limit }) => {
    try {
      setLoading(true);
      const response = await dataTargetService.owner.getAll({
        search,
        page,
        limit
      });
      // shape: { success, data: { items, pagination, statistics } }
      setDataTarget(response?.data?.items || []);
      setStats(response?.data?.statistics || {});
      setPagination(response?.data?.pagination || { currentPage: page, totalPages: 1, totalItems: 0, itemsPerPage: limit });
    } catch (err) {
      setError('Gagal mengambil data target');
      console.error('Error fetching data target:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
      page: 1
    }));
  };

  const handleExport = () => {
    // Open PDF export in new tab
    window.open('/api/owner/data-target/export/pdf', '_blank');
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount || 0);
  };

  return (
    <div className="p-0 bg-gray-50 min-h-screen">
      {/* Header - mirror Omset Harian style */}
      <div className="bg-red-800 text-white px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span className="text-sm font-semibold bg-white/10 rounded px-2 py-1">MK-TRG</span>
            <div>
              <h1 className="text-xl md:text-2xl font-extrabold tracking-tight">DATA TARGET</h1>
              <p className="text-sm text-red-100">Daftar target marketing</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowFilters(v => !v)}
              className="px-4 py-2 rounded-full border border-white/60 text-white hover:bg-white/10"
            >
              PENCARIAN
            </button>
            <button
              onClick={handleExport}
              className="inline-flex items-center gap-2 px-4 py-2 bg-white text-red-700 rounded-lg hover:bg-red-50 transition-colors shadow-sm"
            >
              Export Data
            </button>
          </div>
        </div>
      </div>

      {/* Info / status bar */}
      <div className="bg-gray-200 px-6 py-2 text-xs text-gray-600 flex items-center justify-between">
        <span>Data target diurutkan berdasarkan waktu dibuat</span>
        {loading && <span className="text-gray-500">Memuat…</span>}
      </div>

      {/* Statistics Cards - Omset style */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-4 mb-6">
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              {/* icon placeholder visually consistent */}
              <span className="block h-5 w-5 bg-blue-600 rounded-sm" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Total Target</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalTarget || 0}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <span className="block h-5 w-5 bg-green-600 rounded-sm" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Total Nominal</p>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(stats.totalNominal || 0)}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <span className="block h-5 w-5 bg-purple-600 rounded-sm" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Rata-rata Nominal</p>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(((stats.totalNominal || 0) / (stats.totalTarget || 1)))}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters panel (toggle) */}
      {showFilters && (
        <div className="bg-white rounded-none md:rounded-xl shadow-sm border border-gray-100 my-4">
          <div className="px-6 py-4">
            <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
              <input
                placeholder="Cari target..."
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                type="search"
                enterKeyHint="search"
                autoComplete="off"
                autoCorrect="off"
                autoCapitalize="none"
                spellCheck={false}
                className="pl-3 pr-3 py-2 w-full border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-red-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>
      )}

      {/* Content Card */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 m-0">
        {/* Error banner */}
        {error && (
          <div className="px-6 pt-4">
            <div className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-md px-3 py-2">
              {error}
            </div>
          </div>
        )}

        {/* Table */}
        <div className="overflow-x-auto">
          <Table className="min-w-full table-auto">
            <TableHeader className="sticky top-0 bg-red-50 z-10">
              <TableRow>
                <TableHead className="whitespace-nowrap px-4 md:px-6 py-3 text-left">Nama Target</TableHead>
                <TableHead className="whitespace-nowrap px-4 md:px-6 py-3 text-left">Target Nominal</TableHead>
                <TableHead className="whitespace-nowrap px-4 md:px-6 py-3 text-left">Dibuat Pada</TableHead>
                <TableHead className="whitespace-nowrap px-4 md:px-6 py-3 text-left">Dibuat Oleh</TableHead>
                <TableHead className="whitespace-nowrap px-4 md:px-6 py-3 text-left">Diubah Pada</TableHead>
                <TableHead className="whitespace-nowrap px-4 md:px-6 py-3 text-left">Diubah Oleh</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {dataTarget.map((target) => (
                <TableRow key={target.id} className="hover:bg-gray-50">
                  <TableCell className="px-4 md:px-6 py-4 whitespace-nowrap text-left">
                    <div className="font-medium truncate" title={target.nama_target}>
                      {target.nama_target}
                    </div>
                  </TableCell>
                  <TableCell className="px-4 md:px-6 py-4 whitespace-nowrap text-left font-semibold text-gray-900 tabular-nums">
                    {formatCurrency(target.target_nominal)}
                  </TableCell>
                  <TableCell className="px-4 md:px-6 py-4 whitespace-nowrap text-left">
                    {target.created_at ? new Date(target.created_at).toLocaleDateString('id-ID') : '-'}
                  </TableCell>
                  <TableCell className="px-4 md:px-6 py-4 whitespace-nowrap text-left">
                    {target.creator?.nama || '-'}
                  </TableCell>
                  <TableCell className="px-4 md:px-6 py-4 whitespace-nowrap text-left">
                    {target.updated_at ? new Date(target.updated_at).toLocaleDateString('id-ID') : '-'}
                  </TableCell>
                  <TableCell className="px-4 md:px-6 py-4 whitespace-nowrap text-left">
                    {target.updater?.nama || '-'}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-3 px-6 py-4">
          <div className="text-sm text-gray-600">
            Menampilkan {dataTarget.length > 0 ? ((pagination.currentPage - 1) * pagination.itemsPerPage + 1) : 0}
            {' - '}
            {(pagination.currentPage - 1) * pagination.itemsPerPage + dataTarget.length}
            {' dari '}
            {pagination.totalItems} data
          </div>
          <div className="flex items-center gap-2">
            <button
              className="px-3 py-1 border rounded disabled:opacity-50"
              disabled={pagination.currentPage <= 1 || loading}
              onClick={() => setFilters(prev => ({ ...prev, page: Math.max(1, prev.page - 1) }))}
            >
              Prev
            </button>
            <span className="text-sm text-gray-600">Hal {pagination.currentPage} / {pagination.totalPages}</span>
            <button
              className="px-3 py-1 border rounded disabled:opacity-50"
              disabled={pagination.currentPage >= pagination.totalPages || loading}
              onClick={() => setFilters(prev => ({ ...prev, page: Math.min(pagination.totalPages, prev.page + 1) }))}
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

