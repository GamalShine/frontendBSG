import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Button from '@/components/UI/Button';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/UI/Table';
import { 
  Search, 
  Plus, 
  Eye, 
  Edit, 
  Trash2,
  DollarSign,
  Users
} from 'lucide-react';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { dataTargetService } from '@/services/dataTargetService';
import LoadingSpinner from '@/components/UI/LoadingSpinner';

const AdminDataTarget = () => {
  const [dataTarget, setDataTarget] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [stats, setStats] = useState({});
  const [showFilters, setShowFilters] = useState(false);

  // Debounce search text to reduce refetch churn
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(searchTerm), 300);
    return () => clearTimeout(t);
  }, [searchTerm]);

  useEffect(() => {
    fetchDataTarget();
  }, [debouncedSearch]);

  const fetchDataTarget = async () => {
    try {
      setLoading(true);
      const response = await dataTargetService.getAll(
        debouncedSearch ? { search: debouncedSearch } : {}
      );
      // response shape: { success, data: { items, pagination, statistics } }
      setDataTarget(response?.data?.items || []);
      setStats(response?.data?.statistics || {});
    } catch (err) {
      setError('Gagal memuat data target');
      console.error('Error fetching data target:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Apakah Anda yakin ingin menghapus data target ini?')) {
      try {
        await dataTargetService.delete(id);
        fetchDataTarget(); // Refresh data
      } catch (err) {
        alert('Gagal menghapus data target');
        console.error('Error deleting data target:', err);
      }
    }
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
      {/* Header - mirror Owner style */}
      <div className="bg-red-800 text-white px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span className="text-sm font-semibold bg-white/10 rounded px-2 py-1">MK-TRG</span>
            <div>
              <h1 className="text-xl md:text-2xl font-extrabold tracking-tight">DATA TARGET</h1>
              <p className="text-sm text-red-100">Kelola data target keuangan per lokasi/akun</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowFilters(v => !v)}
              className="px-4 py-2 rounded-full border border-white/60 text-white hover:bg-white/10"
            >
              PENCARIAN
            </button>
            <Link to="/admin/marketing/target/form" className="inline-flex items-center gap-2 px-4 py-2 bg-white text-red-700 rounded-lg hover:bg-red-50 transition-colors shadow-sm">
              <Plus className="h-4 w-4" />
              <span className="font-semibold">Tambah</span>
            </Link>
          </div>
        </div>
      </div>
      
      {/* Info bar */}
      <div className="bg-gray-200 px-6 py-2 text-xs text-gray-600 flex items-center justify-between">
        <span>Data target diurutkan berdasarkan waktu dibuat</span>
        {loading && (
          <span className="text-gray-500 flex items-center gap-2">
            <LoadingSpinner small /> Memuat…
          </span>
        )}
      </div>

      {/* Filters panel (toggle) */}
      {showFilters && (
        <div className="bg-white rounded-none md:rounded-xl shadow-sm border border-gray-100 my-4">
          <div className="px-6 py-4">
            <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="search"
                  placeholder="Cari nama target..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  enterKeyHint="search"
                  autoComplete="off"
                  autoCorrect="off"
                  autoCapitalize="none"
                  spellCheck={false}
                  className="pl-10 pr-3 py-2 w-full border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-red-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Statistics Cards - Omset style */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-4 mb-6">
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Users className="h-5 w-5 text-blue-600" />
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
              <DollarSign className="h-5 w-5 text-green-600" />
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
              <DollarSign className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Rata-rata Nominal</p>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(((stats.totalNominal || 0) / (stats.totalTarget || 1)))}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Content Card */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 m-0">
        {/* Error banner */}
        {error && (
          <div className="px-6 pt-4">
            <div className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-md px-3 py-2 flex items-center justify-between">
              <span>{error}</span>
              <Button onClick={fetchDataTarget} variant="outline" size="sm">Coba Lagi</Button>
            </div>
          </div>
        )}

        {/* Table */}
        <div className="overflow-x-auto">
          <Table className="min-w-full table-fixed">
            <TableHeader className="sticky top-0 bg-red-50 z-10">
              <TableRow>
                <TableHead className="w-auto md:w-3/12 md:whitespace-nowrap pl-4 md:pl-6 pr-0 md:pr-1 py-3 text-left">Nama Target</TableHead>
                <TableHead className="w-auto md:w-3/12 md:whitespace-nowrap pl-0 md:pl-1 pr-4 md:pr-6 py-3 text-center">Target Nominal</TableHead>
                <TableHead className="w-auto md:w-3/12 md:whitespace-nowrap px-4 md:px-6 py-3 text-center">Dibuat Pada</TableHead>
                <TableHead className="w-auto md:w-3/12 md:whitespace-nowrap px-4 md:px-6 py-3 text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {dataTarget.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-8">
                    <div className="text-center py-6">
                      <Users className="h-10 w-10 text-gray-300 mx-auto mb-3" />
                      <p className="text-gray-600">Tidak ada data target</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                dataTarget.map((target) => (
                  <TableRow key={target.id} className="hover:bg-gray-50">
                    <TableCell className="w-auto md:w-3/12 pl-4 md:pl-6 pr-0 md:pr-1 py-4 md:whitespace-nowrap text-left">
                      <div className="font-medium truncate" title={target.nama_target}>{target.nama_target}</div>
                    </TableCell>
                    <TableCell className="w-auto md:w-3/12 pl-0 md:pl-1 pr-4 md:pr-6 py-4 font-semibold text-green-600 text-center tabular-nums md:whitespace-nowrap">
                      {formatCurrency(target.target_nominal)}
                    </TableCell>
                    <TableCell className="w-auto md:w-3/12 px-4 md:px-6 py-4 text-center md:whitespace-nowrap">
                      {target.created_at ? format(new Date(target.created_at), 'dd MMM yyyy', { locale: id }) : '-'}
                    </TableCell>
                    <TableCell className="w-auto md:w-3/12 px-4 md:px-6 py-4 text-right">
                      <div className="inline-flex items-center gap-2 justify-end">
                        <Link to={`/admin/marketing/target/detail/${target.id}`}>
                          <Button size="sm" variant="outline">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </Link>
                        <Link to={`/admin/marketing/target/edit/${target.id}`}>
                          <Button size="sm" variant="outline">
                            <Edit className="h-4 w-4" />
                          </Button>
                        </Link>
                        <Button size="sm" variant="outline" onClick={() => handleDelete(target.id)} className="text-red-600 hover:text-red-700">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
};

export default AdminDataTarget;
