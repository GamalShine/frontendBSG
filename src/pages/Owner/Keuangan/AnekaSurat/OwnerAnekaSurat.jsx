import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { anekaSuratService } from '@/services/anekaSuratService';
import { toast } from 'react-hot-toast';
import { 
  Plus, 
  Search, 
  Calendar, 
  Filter,
  Eye,
  Edit,
  Trash2,
  FileText,
  FileType,
  CheckCircle,
  Users,
  RefreshCw
} from 'lucide-react';
import LoadingSpinner from '@/components/UI/LoadingSpinner';
import { MENU_CODES } from '@/config/menuCodes';

const OwnerAnekaSurat = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [anekaSurat, setAnekaSurat] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [selectedItems, setSelectedItems] = useState([]);
  const [showFilters, setShowFilters] = useState(false);
  const [stats, setStats] = useState({
    total_documents: 0,
    document_types: 0,
    active_documents: 0,
    total_users: 0
  });

  useEffect(() => {
    if (user) {
      loadAnekaSurat();
      loadStats();
    }
  }, [user, currentPage, searchTerm, dateFilter]);

  const loadAnekaSurat = async () => {
    try {
      setLoading(true);
      const response = await anekaSuratService.getAllAnekaSurat(
        currentPage,
        10,
        searchTerm,
        dateFilter
      );
      
      if (response.success) {
        setAnekaSurat(response.data);
        setTotalPages(response.pagination?.totalPages || 1);
        setTotalItems(response.pagination?.totalItems || 0);
      } else {
        toast.error('Gagal memuat data aneka surat');
      }
    } catch (error) {
      console.error('Error loading aneka surat:', error);
      toast.error('Gagal memuat data aneka surat');
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const response = await anekaSuratService.getStats();
      if (response.success) {
        setStats(response.data);
      }
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Apakah Anda yakin ingin menghapus dokumen ini?')) {
      return;
    }

    try {
      await anekaSuratService.deleteAnekaSurat(id);
      toast.success('Dokumen berhasil dihapus');
      loadAnekaSurat();
      loadStats();
    } catch (error) {
      console.error('Error deleting document:', error);
      toast.error('Gagal menghapus dokumen');
    }
  };

  const handleCheckboxChange = (id) => {
    setSelectedItems(prev => 
      prev.includes(id) 
        ? prev.filter(itemId => itemId !== id)
        : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedItems.length === anekaSurat.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(anekaSurat.map(item => item.id));
    }
  };

  const handleBulkDelete = async () => {
    if (selectedItems.length === 0) {
      toast.error('Pilih dokumen yang akan dihapus');
      return;
    }

    if (window.confirm(`Apakah Anda yakin ingin menghapus ${selectedItems.length} dokumen yang dipilih?`)) {
      try {
        const deletePromises = selectedItems.map(id => anekaSuratService.deleteAnekaSurat(id));
        await Promise.all(deletePromises);
        
        toast.success(`${selectedItems.length} dokumen berhasil dihapus`);
        setSelectedItems([]);
        loadAnekaSurat();
        loadStats();
      } catch (error) {
        console.error('Error bulk deleting documents:', error);
        toast.error('Gagal menghapus beberapa dokumen');
      }
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="p-0 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="bg-red-800 text-white px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span className="text-sm font-semibold bg-white/10 rounded px-2 py-1">{MENU_CODES.keuangan.anekaSurat}</span>
            <div>
              <h1 className="text-xl md:text-2xl font-extrabold tracking-tight">ANEKA SURAT</h1>
              <p className="text-sm text-red-100">Kelola dokumen aneka surat perusahaan</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowFilters(v => !v)}
              className="px-4 py-2 rounded-full border border-white/60 text-white hover:bg-white/10"
            >
              PENCARIAN
            </button>
            <Link
              to="/owner/keuangan/aneka-surat/new"
              className="inline-flex items-center gap-2 px-4 py-2 bg-white text-red-700 rounded-lg hover:bg-red-50 transition-colors shadow-sm"
            >
              <Plus className="h-4 w-4" />
              <span className="font-semibold">Tambah</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Info bar */}
      <div className="bg-gray-200 px-6 py-2 text-xs text-gray-600">Daftar dokumen terbaru berada di paling atas</div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-6">
        <div className="bg-white p-4 rounded-lg shadow border">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <FileText className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Dokumen</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total_documents}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow border">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <FileType className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Jenis Dokumen</p>
              <p className="text-2xl font-bold text-gray-900">{stats.document_types}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow border">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <CheckCircle className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Dokumen Aktif</p>
              <p className="text-2xl font-bold text-gray-900">{stats.active_documents}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow border">
          <div className="flex items-center">
            <div className="p-2 bg-orange-100 rounded-lg">
              <Users className="h-6 w-6 text-orange-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Pengguna</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total_users}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      {showFilters && (
        <div className="bg-white p-4 border-b">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Cari dokumen..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="date"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>
      )}

      {/* Content */}
      <div className="bg-white mx-6 rounded-lg shadow border overflow-hidden">
        {/* Toolbar actions (bulk) */}
        <div className="p-4 flex items-center justify-between border-b">
          <div className="text-sm text-gray-600">Terpilih: {selectedItems.length}</div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleBulkDelete}
              disabled={selectedItems.length === 0}
              className="px-3 py-2 text-sm rounded-lg bg-red-600 text-white disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Hapus Terpilih
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3">
                  <input
                    type="checkbox"
                    checked={selectedItems.length === anekaSurat.length && anekaSurat.length > 0}
                    onChange={handleSelectAll}
                  />
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Jenis Dokumen</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Judul</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tanggal</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Aksi</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {anekaSurat.map((doc) => (
                <tr key={doc.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <input
                      type="checkbox"
                      checked={selectedItems.includes(doc.id)}
                      onChange={() => handleCheckboxChange(doc.id)}
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <FileType className="h-5 w-5 text-gray-500" />
                      <span className="text-sm font-medium text-gray-900">{doc.jenis_dokumen || '-'}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900">{doc.judul_dokumen || '-'}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">{formatDate(doc.created_at || doc.createdAt)}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end gap-2">
                      <Link
                        to={`/owner/keuangan/aneka-surat/${doc.id}`}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                        title="Lihat"
                      >
                        <Eye className="h-4 w-4" />
                      </Link>
                      <Link
                        to={`/owner/keuangan/aneka-surat/${doc.id}/edit`}
                        className="p-2 text-yellow-600 hover:bg-yellow-50 rounded-lg"
                        title="Edit"
                      >
                        <Edit className="h-4 w-4" />
                      </Link>
                      <button
                        onClick={() => handleDelete(doc.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                        title="Hapus"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {!loading && anekaSurat.length === 0 && (
                <tr>
                  <td colSpan="5" className="px-6 py-10 text-center text-gray-500">
                    Tidak ada dokumen
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-6 py-3 flex items-center justify-between border-t">
            <div className="text-sm text-gray-700">
              Menampilkan <span className="font-medium">{(currentPage - 1) * 10 + 1}</span> -{' '}
              <span className="font-medium">{Math.min(currentPage * 10, totalItems)}</span> dari{' '}
              <span className="font-medium">{totalItems}</span> dokumen
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setCurrentPage(1)}
                disabled={currentPage === 1}
                className="px-3 py-2 border rounded-l disabled:opacity-50"
              >
                «
              </button>
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="px-3 py-2 border disabled:opacity-50"
              >
                Sebelumnya
              </button>
              <button
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="px-3 py-2 border disabled:opacity-50"
              >
                Selanjutnya
              </button>
              <button
                onClick={() => setCurrentPage(totalPages)}
                disabled={currentPage === totalPages}
                className="px-3 py-2 border rounded-r disabled:opacity-50"
              >
                »
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default OwnerAnekaSurat;
