import React, { useState, useEffect } from 'react';
import Select, { 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/UI/Select';
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

      {/* Content Card */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 m-0 md:m-6">
        {/* Error banner */}
        {error && (
          <div className="px-6 pt-4">
            <div className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-md px-3 py-2">
              {error}
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="px-6 py-4 grid grid-cols-1 md:grid-cols-4 gap-4">
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
          <Select
            value={filters.limit}
            onValueChange={(value) => handleFilterChange('limit', parseInt(value))}
          >
            <SelectTrigger>
              <SelectValue placeholder="10 per halaman" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={10}>10 per halaman</SelectItem>
              <SelectItem value={25}>25 per halaman</SelectItem>
              <SelectItem value={50}>50 per halaman</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <Table className="min-w-full">
            <TableHeader className="sticky top-0 bg-red-50 z-10">
              <TableRow>
                <TableHead className="w-auto md:w-6/12 md:whitespace-nowrap px-3 md:px-6 py-3">Nama Target</TableHead>
                <TableHead className="w-auto md:w-3/12 md:whitespace-nowrap text-right px-3 md:px-6 py-3">Target Nominal</TableHead>
                <TableHead className="w-auto md:w-3/12 md:whitespace-nowrap text-right px-3 md:px-6 py-3">Dibuat Pada</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {dataTarget.map((target) => (
                <TableRow key={target.id} className="hover:bg-gray-50">
                  <TableCell className="w-auto md:w-6/12 px-3 md:px-6 py-4 md:whitespace-nowrap">
                    <div className="font-medium truncate md:truncate" title={target.nama_target}>
                      {target.nama_target}
                    </div>
                  </TableCell>
                  <TableCell className="w-auto md:w-3/12 px-3 md:px-6 py-4 font-semibold text-green-600 text-right tabular-nums md:whitespace-nowrap">
                    {formatCurrency(target.target_nominal)}
                  </TableCell>
                  <TableCell className="w-auto md:w-3/12 px-3 md:px-6 py-4 text-right md:whitespace-nowrap">
                    {target.created_at ? new Date(target.created_at).toLocaleDateString('id-ID') : '-'}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
};

export default OwnerDataTarget;

