import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { timService } from '../../services/timService';
import { 
  Search, 
  Plus, 
  Edit, 
  Trash2,
  AlertTriangle,
  Award,
  User,
  Building,
  Users,
  TrendingUp,
  TrendingDown
} from 'lucide-react';
import { toast } from 'react-hot-toast';

const TimMerahBiru = () => {
  const [timMerah, setTimMerah] = useState([]);
  const [timBiru, setTimBiru] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [divisiFilter, setDivisiFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [activeTab, setActiveTab] = useState('merah'); // 'merah' or 'biru'
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  useEffect(() => {
    loadData();
  }, [currentPage, divisiFilter, statusFilter, activeTab]);

  const loadData = async () => {
    try {
      setLoading(true);
      const params = {
        page: currentPage,
        limit: 10,
        search: searchTerm,
        divisi: divisiFilter !== 'all' ? divisiFilter : undefined,
        status: statusFilter !== 'all' ? statusFilter : undefined
      };

      if (activeTab === 'merah') {
        const response = await timService.getTimMerah(params);
        if (response.success) {
          setTimMerah(response.data);
          setTotalPages(response.pagination?.totalPages || 1);
          setTotalItems(response.pagination?.totalItems || 0);
        }
      } else {
        const response = await timService.getTimBiru(params);
        if (response.success) {
          setTimBiru(response.data);
          setTotalPages(response.pagination?.totalPages || 1);
          setTotalItems(response.pagination?.totalItems || 0);
        }
      }
    } catch (error) {
      toast.error(`Gagal memuat daftar tim ${activeTab === 'merah' ? 'merah' : 'biru'}`);
      console.error(`Error loading tim ${activeTab}:`, error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    setCurrentPage(1);
    loadData();
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Apakah Anda yakin ingin menghapus data ini?')) {
      return;
    }

    try {
      const response = activeTab === 'merah' 
        ? await timService.deleteTimMerah(id)
        : await timService.deleteTimBiru(id);
      
      if (response.success) {
        toast.success('Data berhasil dihapus');
        loadData();
      }
    } catch (error) {
      toast.error('Gagal menghapus data');
      console.error(`Error deleting tim ${activeTab}:`, error);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'SP1':
        return 'bg-yellow-100 text-yellow-800';
      case 'SP2':
        return 'bg-orange-100 text-orange-800';
      case 'SP3':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'SP1':
        return 'Surat Peringatan 1';
      case 'SP2':
        return 'Surat Peringatan 2';
      case 'SP3':
        return 'Surat Peringatan 3';
      default:
        return status;
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const divisiOptions = [
    { value: 'all', label: 'Semua Divisi' },
    { value: 'BSG PUSAT', label: 'BSG PUSAT' },
    { value: 'BSG BSD', label: 'BSG BSD' },
    { value: 'SOGIL', label: 'SOGIL' },
    { value: 'BSG SIDOARJO', label: 'BSG SIDOARJO' },
    { value: 'BSG BUAH BATU', label: 'BSG BUAH BATU' },
    { value: 'BSG KARAWACI', label: 'BSG KARAWACI' }
  ];

  const statusOptions = [
    { value: 'all', label: 'Semua Status' },
    { value: 'SP1', label: 'SP1' },
    { value: 'SP2', label: 'SP2' },
    { value: 'SP3', label: 'SP3' }
  ];

  const currentData = activeTab === 'merah' ? timMerah : timBiru;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">
              TIM MERAH/BIRU
            </h1>
            <p className="text-gray-600 mt-1">
              Manajemen Tim Merah (Peringatan) dan Tim Biru (Prestasi)
            </p>
          </div>
          <div className="flex space-x-2">
            <Link
              to={activeTab === 'merah' ? '/tim/merah/new' : '/tim/biru/new'}
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors flex items-center"
            >
              <Plus className="h-4 w-4 mr-2" />
              Tambah {activeTab === 'merah' ? 'Tim Merah' : 'Tim Biru'}
            </Link>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
          <div className="flex">
            <button
              onClick={() => setActiveTab('merah')}
              className={`flex-1 px-6 py-3 text-sm font-medium rounded-l-lg transition-colors ${
                activeTab === 'merah'
                  ? 'bg-red-500 text-white'
                  : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
              }`}
            >
              <div className="flex items-center justify-center">
                <AlertTriangle className="h-4 w-4 mr-2" />
                Tim Merah ({timMerah.length})
              </div>
            </button>
            <button
              onClick={() => setActiveTab('biru')}
              className={`flex-1 px-6 py-3 text-sm font-medium rounded-r-lg transition-colors ${
                activeTab === 'biru'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
              }`}
            >
              <div className="flex items-center justify-center">
                <Award className="h-4 w-4 mr-2" />
                Tim Biru ({timBiru.length})
              </div>
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Cari
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Cari nama, divisi, posisi..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Divisi
              </label>
              <select
                value={divisiFilter}
                onChange={(e) => setDivisiFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {divisiOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {activeTab === 'merah' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {statusOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div className="flex items-end">
              <button
                onClick={handleSearch}
                className="w-full px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
              >
                Cari
              </button>
            </div>
          </div>
        </div>

        {/* Data Table */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Nama
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Divisi
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Posisi
                      </th>
                      {activeTab === 'merah' ? (
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                      ) : (
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Prestasi
                        </th>
                      )}
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Tanggal Input
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Aksi
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {currentData.length === 0 ? (
                      <tr>
                        <td colSpan="6" className="px-6 py-4 text-center text-gray-500">
                          Tidak ada data {activeTab === 'merah' ? 'tim merah' : 'tim biru'}
                        </td>
                      </tr>
                    ) : (
                      currentData.map((item) => (
                        <tr key={item.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <User className="h-5 w-5 text-gray-400 mr-2" />
                              <div>
                                <div className="text-sm font-medium text-gray-900">
                                  {item.nama}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <Building className="h-4 w-4 text-gray-400 mr-2" />
                              <span className="text-sm text-gray-900">{item.divisi}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {item.posisi}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {activeTab === 'merah' ? (
                              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(item.status)}`}>
                                {getStatusText(item.status)}
                              </span>
                            ) : (
                              <div className="text-sm text-gray-900 max-w-xs truncate" title={item.prestasi}>
                                {item.prestasi}
                              </div>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {formatDate(item.created_at)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex space-x-2">
                              <Link
                                to={`/tim/${activeTab}/${item.id}/edit`}
                                className="text-blue-600 hover:text-blue-900"
                              >
                                <Edit className="h-4 w-4" />
                              </Link>
                              <button
                                onClick={() => handleDelete(item.id)}
                                className="text-red-600 hover:text-red-900"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="bg-white px-4 py-3 border-t border-gray-200 sm:px-6">
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-700">
                      Menampilkan {((currentPage - 1) * 10) + 1} sampai {Math.min(currentPage * 10, totalItems)} dari {totalItems} data
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                        disabled={currentPage === 1}
                        className="px-3 py-1 border border-gray-300 rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                      >
                        Sebelumnya
                      </button>
                      <span className="px-3 py-1 text-sm text-gray-700">
                        Halaman {currentPage} dari {totalPages}
                      </span>
                      <button
                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                        disabled={currentPage === totalPages}
                        className="px-3 py-1 border border-gray-300 rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                      >
                        Selanjutnya
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default TimMerahBiru; 