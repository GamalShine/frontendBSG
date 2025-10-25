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
  Plus,
  DollarSign
} from 'lucide-react';
import { dataTargetService } from '@/services/dataTargetService';
import LoadingSpinner from '@/components/UI/LoadingSpinner';

const AdminDataTarget = () => {
  const [view, setView] = useState('years'); // 'years' | 'yearContent'
  const [years, setYears] = useState([]); // [{year: 2024}, ...]
  const [selectedYear, setSelectedYear] = useState(null);
  const [items, setItems] = useState([]);
  const [pagination, setPagination] = useState({ currentPage: 1, totalPages: 1, totalItems: 0 });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({});

  useEffect(() => {
    if (view === 'years') {
      loadYears();
      loadStats();
    } else if (view === 'yearContent' && selectedYear) {
      loadItems(selectedYear, pagination.currentPage);
    }
  }, [view, selectedYear, pagination.currentPage]);

  const loadYears = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await dataTargetService.getYears();
      if (res?.success) setYears(res.data || []);
      else setYears([]);
    } catch (e) {
      setError('Gagal memuat daftar tahun');
      console.error('Error loading years:', e);
      setYears([]);
    } finally {
      setLoading(false);
    }
  };

  const loadItems = async (year, page = 1) => {
    try {
      setLoading(true);
      setError(null);
      const res = await dataTargetService.getAll({ year, page, limit: 20 });
      if (res?.success) {
        setItems(res.data.items || []);
        setPagination(res.data.pagination || { currentPage: 1, totalPages: 1, totalItems: 0 });
        setStats(res.data.statistics || {});
      } else {
        setItems([]);
        setPagination({ currentPage: 1, totalPages: 1, totalItems: 0 });
      }
    } catch (e) {
      setError('Gagal memuat data target');
      console.error('Error loading data target:', e);
      setItems([]);
      setPagination({ currentPage: 1, totalPages: 1, totalItems: 0 });
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      // Reuse list endpoint statistics without filters
      const res = await dataTargetService.getAll({ page: 1, limit: 1 });
      if (res?.success) setStats(res.data.statistics || {});
    } catch (e) {
      // ignore
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
      {/* Header ala Medsos */}
      <div className="bg-red-800 text-white px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span className="text-sm font-semibold bg-white/10 rounded px-2 py-1">MK-TRG</span>
            <div>
              <h1 className="text-xl md:text-2xl font-extrabold tracking-tight">DATA TARGET</h1>
              <p className="text-sm text-red-100">Admin - Marketing</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Link to="/admin/marketing/target/new" className="inline-flex items-center gap-2 px-4 py-2 bg-white text-red-700 rounded-lg hover:bg-red-50 transition-colors shadow-sm">
              <Plus className="h-4 w-4" />
              <span className="font-semibold">Tambah</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Subheader timestamp */}
      <div className="bg-gray-200 px-6 py-2 text-sm text-gray-900">Terakhir diupdate: {new Date().toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric'})} pukul {new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit'})}</div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-4 mb-6">
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <DollarSign className="h-5 w-5 text-blue-600" />
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
              <p className="text-2xl font-bold text-gray-900">{Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(stats.totalNominal || 0)}</p>
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
              <p className="text-2xl font-bold text-gray-900">{Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(((stats.totalNominal || 0) / (stats.totalTarget || 1)))}</p>
            </div>
          </div>
        </div>
      </div>
      {/* Years Grid */}
      {view === 'years' && (
        <div className="px-6 py-4">
          {error && (
            <div className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-md px-3 py-2 mb-3">{error}</div>
          )}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {loading && (
              <div className="col-span-full text-sm text-gray-600">Memuat daftar tahun...</div>
            )}
            {!loading && years.length === 0 && (
              <div className="col-span-full text-sm text-gray-600">Belum ada data</div>
            )}
            {!loading && years.map(({ year }) => (
              <div
                key={year}
                className="group rounded-2xl p-5 bg-white cursor-pointer ring-1 ring-gray-200 hover:ring-red-300 hover:shadow-lg transition-all"
                onClick={() => openYear(year)}
              >
                <div className="flex items-center space-x-3">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-10 h-10 text-yellow-500">
                    <path d="M10.5 4.5a1.5 1.5 0 0 1 1.06.44l1.5 1.5c.28.3.67.46 1.07.46H19.5A2.25 2.25 0 0 1 21.75 9v7.5A2.25 2.25 0 0 1 19.5 18.75h-15A2.25 2.25 0 0 1 2.25 16.5v-9A2.25 2.25 0 0 1 4.5 5.25h5.25z" />
                  </svg>
                  <div>
                    <div className="font-semibold text-gray-800 group-hover:text-red-700">{year}</div>
                    <div className="text-xs text-gray-500">Folder Tahun</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Year Content */}
      {view === 'yearContent' && (
        <div className="bg-white rounded-lg shadow-lg border mx-6 mb-6">
          <div className="bg-red-800 text-white px-6 py-4 rounded-t-lg">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold">{selectedYear}</h2>
                <p className="text-xs opacity-90">Daftar Data Target</p>
              </div>
              <div className="flex items-center gap-2">
                <Link to="/admin/marketing/target/new" className="bg-white text-red-700 hover:bg-red-50 inline-flex items-center gap-2 px-3 py-2 rounded">
                  <Plus className="h-4 w-4" /> Tambah
                </Link>
                <button onClick={backToYears} className="bg-white text-red-700 hover:bg-red-50 inline-flex items-center gap-2 px-3 py-2 rounded">Kembali</button>
              </div>
            </div>
          </div>

          {loading ? (
            <LoadingSpinner />
          ) : items.length === 0 ? (
            <div className="p-8 text-center text-gray-600">Belum ada data pada tahun ini</div>
          ) : (
            <div className="overflow-x-auto">
              <Table className="min-w-full table-fixed">
                <TableHeader className="sticky top-0 bg-red-50 z-10">
                  <TableRow>
                    <TableHead className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nama Target</TableHead>
                    <TableHead className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nominal</TableHead>
                    <TableHead className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Dibuat Oleh</TableHead>
                    <TableHead className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Dibuat</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {items.map((it) => (
                    <TableRow key={it.id} className="hover:bg-gray-50">
                      <TableCell className="px-6 py-4 text-sm text-gray-900">{it.nama_target}</TableCell>
                      <TableCell className="px-6 py-4 text-sm text-gray-900">{Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(it.target_nominal)}</TableCell>
                      <TableCell className="px-6 py-4 text-sm text-gray-900">{it.creator?.nama || '-'}</TableCell>
                      <TableCell className="px-6 py-4 text-sm text-gray-500">{new Date(it.created_at).toLocaleDateString('id-ID')}</TableCell>
                    </TableRow>) )}
                </TableBody>
              </Table>
            </div>
          )}

          {/* Pagination */}
          {!loading && pagination.totalPages > 1 && (
            <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
              <div className="text-sm text-gray-700">
                Menampilkan {((pagination.currentPage - 1) * 20) + 1} - {Math.min(pagination.currentPage * 20, pagination.totalItems)} dari {pagination.totalItems}
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => setPagination((p) => ({ ...p, currentPage: Math.max(p.currentPage - 1, 1) }))} disabled={pagination.currentPage === 1} className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50">Sebelumnya</button>
                <span className="text-sm">Halaman {pagination.currentPage} dari {pagination.totalPages}</span>
                <button onClick={() => setPagination((p) => ({ ...p, currentPage: Math.min(p.currentPage + 1, p.totalPages) }))} disabled={pagination.currentPage === pagination.totalPages} className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50">Selanjutnya</button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AdminDataTarget;
