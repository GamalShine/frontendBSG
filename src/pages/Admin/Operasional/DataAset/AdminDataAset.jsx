import React, { useState, useEffect, useMemo } from 'react';
import { 
  Building2, 
  Car, 
  Monitor, 
  Search, 
  Filter, 
  Eye, 
  Edit, 
  Trash2, 
  Plus,
  ChevronDown,
  ChevronRight,
  MapPin,
  User,
  Calendar,
  FileText,
  Shield,
  Wrench,
  Car as CarIcon,
  AlertCircle
} from 'lucide-react';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { dataAsetService } from '@/services/dataAsetService';
import { toast } from 'react-hot-toast';
import AdminDataAsetForm from './AdminDataAsetForm';

const AdminDataAset = () => {
  const [activeSection, setActiveSection] = useState('properti');
  const [dataAset, setDataAset] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [kategoriFilter, setKategoriFilter] = useState('all');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    console.log('[AdminDataAset] mounted - versi UI: poskas-style v1');
    fetchDataAset();
  }, []);

  const fetchDataAset = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await dataAsetService.getAllDataAset();
      setDataAset(response.data.items || []);
    } catch (error) {
      console.error('Error fetching data aset:', error);
      setError('Gagal memuat data aset');
      toast.error('Gagal memuat data aset');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Apakah Anda yakin ingin menghapus data aset ini?')) {
      return;
    }
    
    try {
      const response = await dataAsetService.deleteDataAset(id);
      if (response.success) {
        toast.success('Data aset berhasil dihapus');
        fetchDataAset();
      } else {
        toast.error('Gagal menghapus data aset');
      }
    } catch (error) {
      console.error('Error deleting data aset:', error);
      toast.error('Gagal menghapus data aset');
    }
  };

  const getKategoriIcon = (kategori) => {
    switch (kategori) {
      case 'PROPERTI':
        return <Building2 className="w-5 h-5 text-blue-600" />;
      case 'KENDARAAN_PRIBADI':
      case 'KENDARAAN_OPERASIONAL':
      case 'KENDARAAN_DISTRIBUSI':
        return <CarIcon className="w-5 h-5 text-green-600" />;
      case 'ELEKTRONIK':
        return <Monitor className="w-5 h-5 text-purple-600" />;
      default:
        return <FileText className="w-5 h-5 text-gray-600" />;
    }
  };

  const getKategoriColor = (kategori) => {
    switch (kategori) {
      case 'PROPERTI':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'KENDARAAN_PRIBADI':
      case 'KENDARAAN_OPERASIONAL':
      case 'KENDARAAN_DISTRIBUSI':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'ELEKTRONIK':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getKategoriLabel = (kategori) => {
    switch (kategori) {
      case 'PROPERTI':
        return 'Properti';
      case 'KENDARAAN_PRIBADI':
        return 'Kendaraan Pribadi';
      case 'KENDARAAN_OPERASIONAL':
        return 'Kendaraan Operasional';
      case 'KENDARAAN_DISTRIBUSI':
        return 'Kendaraan Distribusi';
      case 'ELEKTRONIK':
        return 'Elektronik';
      default:
        return kategori;
    }
  };

  const renderAsetCard = (aset) => (
    <div key={aset.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-3 hover:shadow-md transition-shadow text-xs">
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center space-x-2">
          {getKategoriIcon(aset.kategori)}
          <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getKategoriColor(aset.kategori)}`}>
            {getKategoriLabel(aset.kategori)}
          </span>
        </div>
        <div className="flex space-x-2">
          <button className="p-1 text-blue-600 hover:bg-blue-50 rounded" title="Lihat Detail">
            <Eye className="w-4 h-4" />
          </button>
          <button className="p-1 text-green-600 hover:bg-green-50 rounded" title="Edit">
            <Edit className="w-4 h-4" />
          </button>
          <button 
            className="p-1 text-red-600 hover:bg-red-50 rounded" 
            title="Hapus"
            onClick={() => handleDelete(aset.id)}
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="space-y-1">
        {/* Nama Aset */}
        {aset.nama_aset && (
          <div className="flex items-center space-x-2">
            <Building2 className="w-4 h-4 text-gray-400" />
            <span className="text-sm font-medium text-gray-900">{aset.nama_aset}</span>
          </div>
        )}

        {/* Merk Kendaraan */}
        {aset.merk_kendaraan && (
          <div className="flex items-center space-x-2">
            <CarIcon className="w-4 h-4 text-gray-400" />
            <span className="text-xs text-gray-700">{aset.merk_kendaraan}</span>
          </div>
        )}

        {/* Nama Barang Elektronik */}
        {aset.nama_barang && (
          <div className="flex items-center space-x-2">
            <Monitor className="w-4 h-4 text-gray-400" />
            <span className="text-xs text-gray-700">{aset.nama_barang}</span>
          </div>
        )}

        {/* Lokasi */}
        {aset.lokasi && (
          <div className="flex items-center space-x-2">
            <MapPin className="w-4 h-4 text-gray-400" />
            <span className="text-gray-600 text-xs">{aset.lokasi}</span>
          </div>
        )}

        {/* Atas Nama */}
        {aset.atas_nama && (
          <div className="flex items-center space-x-2">
            <User className="w-4 h-4 text-gray-400" />
            <span className="text-gray-600 text-xs">Atas Nama: {aset.atas_nama}</span>
          </div>
        )}

        {/* Status */}
        {aset.status && (
          <div className="flex items-center space-x-2">
            <Shield className="w-4 h-4 text-gray-400" />
            <span className="text-gray-600 text-xs">Status: {aset.status}</span>
          </div>
        )}

        {/* Data Pembelian */}
        {aset.data_pembelian && (
          <div className="flex items-center space-x-2">
            <Calendar className="w-4 h-4 text-gray-400" />
            <span className="text-gray-600 text-xs">Pembelian: {aset.data_pembelian}</span>
          </div>
        )}

        {/* Penanggung Jawab */}
        {aset.penanggung_jawab && (
          <div className="flex items-center space-x-2">
            <User className="w-4 h-4 text-gray-400" />
            <span className="text-gray-600 text-xs">PJ: {aset.penanggung_jawab}</span>
          </div>
        )}

        {/* Kendaraan Specific Fields */}
        {['KENDARAAN_PRIBADI', 'KENDARAAN_OPERASIONAL', 'KENDARAAN_DISTRIBUSI'].includes(aset.kategori) && (
          <>
            {aset.plat_nomor && (
              <div className="flex items-center space-x-2">
                <CarIcon className="w-4 h-4 text-gray-400" />
                <span className="text-gray-600 text-xs">Plat: {aset.plat_nomor}</span>
              </div>
            )}
            {aset.pajak_berlaku && (
              <div className="flex items-center space-x-2">
                <FileText className="w-4 h-4 text-gray-400" />
                <span className="text-gray-600 text-xs">Pajak: {aset.pajak_berlaku}</span>
              </div>
            )}
            {aset.stnk_berlaku && (
              <div className="flex items-center space-x-2">
                <FileText className="w-4 h-4 text-gray-400" />
                <span className="text-gray-600 text-xs">STNK: {aset.stnk_berlaku}</span>
              </div>
            )}
          </>
        )}

        {/* Elektronik Specific Fields */}
        {aset.kategori === 'ELEKTRONIK' && (
          <>
            {aset.merk && (
              <div className="flex items-center space-x-2">
                <Monitor className="w-4 h-4 text-gray-400" />
                <span className="text-gray-600 text-xs">Merk: {aset.merk}</span>
              </div>
            )}
            {aset.model && (
              <div className="flex items-center space-x-2">
                <Monitor className="w-4 h-4 text-gray-400" />
                <span className="text-gray-600 text-xs">Model: {aset.model}</span>
              </div>
            )}
            {aset.serial_number && (
              <div className="flex items-center space-x-2">
                <FileText className="w-4 h-4 text-gray-400" />
                <span className="text-gray-600 text-xs">SN: {aset.serial_number}</span>
              </div>
            )}
          </>
        )}

        {/* Properti Specific Fields */}
        {aset.kategori === 'PROPERTI' && (
          <>
            {aset.no_sertifikat && (
              <div className="flex items-center space-x-2">
                <FileText className="w-4 h-4 text-gray-400" />
                <span className="text-gray-600 text-xs">Sertifikat: {aset.no_sertifikat}</span>
              </div>
            )}
            {aset.data_pbb && (
              <div className="flex items-center space-x-2">
                <FileText className="w-4 h-4 text-gray-400" />
                <span className="text-gray-600 text-xs">PBB: {aset.data_pbb}</span>
              </div>
            )}
          </>
        )}
      </div>

      <div className="mt-2 pt-2 border-t border-gray-100">
        <div className="flex items-center justify-between text-xs text-gray-500">
          <span>Created by: {aset.creator?.nama || 'Unknown'}</span>
          <span>{format(new Date(aset.created_at), 'dd MMM yyyy', { locale: id })}</span>
        </div>
      </div>
    </div>
  );

  const filteredData = dataAset.filter(aset => {
    const matchesSearch = !searchTerm || 
      aset.nama_aset?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      aset.merk_kendaraan?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      aset.nama_barang?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      aset.lokasi?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      aset.atas_nama?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesKategori = kategoriFilter === 'all' || 
      (kategoriFilter === 'kendaraan' && ['KENDARAAN_PRIBADI', 'KENDARAAN_OPERASIONAL', 'KENDARAAN_DISTRIBUSI'].includes(aset.kategori)) ||
      aset.kategori === kategoriFilter.toUpperCase();

    return matchesSearch && matchesKategori;
  });

  const groupedData = {
    properti: filteredData.filter(aset => aset.kategori === 'PROPERTI'),
    kendaraan: filteredData.filter(aset => ['KENDARAAN_PRIBADI', 'KENDARAAN_OPERASIONAL', 'KENDARAAN_DISTRIBUSI'].includes(aset.kategori)),
    elektronik: filteredData.filter(aset => aset.kategori === 'ELEKTRONIK')
  };

  // Hitung teks "Terakhir diupdate" dari created_at terbaru
  const lastUpdatedText = useMemo(() => {
    if (!Array.isArray(dataAset) || dataAset.length === 0) return '-';
    // Ambil item dengan created_at paling baru
    const latest = [...dataAset]
      .filter(i => !!i?.created_at)
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))[0];
    const dt = latest?.created_at;
    if (!dt) return '-';
    try {
      return format(new Date(dt), "d MMMM yyyy 'pukul' HH.mm", { locale: id });
    } catch (e) {
      return '-';
    }
  }, [dataAset]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Memuat data aset...</p>
        </div>
      </div>
    );
  }

  if (error) {
  return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <p className="text-red-600 text-lg mb-4">{error}</p>
          <button 
            onClick={fetchDataAset}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Coba Lagi
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-0 bg-gray-50 min-h-screen">
      {/* Header - match OMSET HARIAN style */}
      <div className="bg-red-800 text-white px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span className="text-sm font-semibold bg-white/10 rounded px-2 py-1">A01-O1</span>
            <div>
              <h1 className="text-xl md:text-2xl font-extrabold tracking-tight">DATA ASET</h1>
              <p className="text-sm text-red-100">Kelola dan monitor semua aset perusahaan</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setSearchTerm('');
                setKategoriFilter('all');
              }}
              className="px-4 py-2 rounded-full border border-white/60 text-white hover:bg-white/10"
            >
              RESET FILTER
            </button>
            <button 
              onClick={() => setShowForm(true)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-white text-red-700 rounded-lg hover:bg-red-50 transition-colors shadow-sm"
            >
              <Plus className="h-4 w-4" />
              <span className="font-semibold">Tambah</span>
            </button>
          </div>
        </div>
      </div>

      {/* Info bar */}
      <div className="bg-gray-200 px-6 py-2 text-xs text-gray-600">Terakhir diupdate: {lastUpdatedText}</div>

      {/* Stats Cards */}
      <div className="px-0 py-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Building2 className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-xs font-medium text-gray-500">Total Aset</p>
                <p className="text-lg font-bold text-gray-900">{dataAset.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <CarIcon className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-xs font-medium text-gray-500">Kendaraan</p>
                <p className="text-lg font-bold text-gray-900">{groupedData.kendaraan.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Monitor className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-xs font-medium text-gray-500">Elektronik</p>
                <p className="text-lg font-bold text-gray-900">{groupedData.elektronik.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-orange-100 rounded-lg">
                <Building2 className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <p className="text-xs font-medium text-gray-500">Properti</p>
                <p className="text-lg font-bold text-gray-900">{groupedData.properti.length}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-none md:rounded-xl shadow-sm border border-gray-100 mb-6">
          <div className="px-6 py-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Cari Aset</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Cari aset..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-3 py-2 w-full border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Kategori</label>
                <div className="relative">
                  <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <select
                    value={kategoriFilter}
                    onChange={(e) => setKategoriFilter(e.target.value)}
                    className="pl-10 pr-3 py-2 w-full border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-red-500 focus:border-transparent appearance-none bg-white"
                  >
                    <option value="all">Semua Kategori</option>
                    <option value="properti">Properti</option>
                    <option value="kendaraan">Kendaraan</option>
                    <option value="elektronik">Elektronik</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Data Sections */}
        <div className="space-y-3">
        {/* Properti Section */}
        <div className="bg-white rounded-none md:rounded-xl shadow-sm border border-gray-100 overflow-hidden mt-2">
          <button
            onClick={() => setActiveSection(activeSection === 'properti' ? '' : 'properti')}
            className="w-full px-6 py-3 bg-red-800 text-white flex items-center justify-between hover:bg-red-900 transition-colors"
          >
            <div className="flex items-center space-x-3">
              <Building2 className="w-6 h-6" />
              <span className="text-lg font-semibold">Properti</span>
              <span className="bg-red-700 px-2 py-1 rounded-full text-sm">
                {groupedData.properti.length}
              </span>
            </div>
            {activeSection === 'properti' ? (
              <ChevronDown className="w-5 h-5" />
            ) : (
              <ChevronRight className="w-5 h-5" />
            )}
          </button>
          
          {activeSection === 'properti' && (
            <div className="p-4">
              {groupedData.properti.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-3 gap-y-2">
                  {groupedData.properti.map(renderAsetCard)}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  Tidak ada data properti
                </div>
              )}
            </div>
          )}
        </div>

        {/* Kendaraan Section */}
        <div className="bg-white rounded-none md:rounded-xl shadow-sm border border-gray-100 overflow-hidden mt-2">
          <button
            onClick={() => setActiveSection(activeSection === 'kendaraan' ? '' : 'kendaraan')}
            className="w-full px-6 py-3 bg-red-800 text-white flex items-center justify-between hover:bg-red-900 transition-colors"
          >
            <div className="flex items-center space-x-3">
              <CarIcon className="w-6 h-6" />
              <span className="text-lg font-semibold">Kendaraan</span>
              <span className="bg-red-700 px-2 py-1 rounded-full text-sm">
                {groupedData.kendaraan.length}
              </span>
            </div>
            {activeSection === 'kendaraan' ? (
              <ChevronDown className="w-5 h-5" />
            ) : (
              <ChevronRight className="w-5 h-5" />
            )}
          </button>
          
          {activeSection === 'kendaraan' && (
            <div className="p-4">
              {groupedData.kendaraan.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-3 gap-y-2">
                  {groupedData.kendaraan.map(renderAsetCard)}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  Tidak ada data kendaraan
                </div>
              )}
            </div>
          )}
        </div>

        {/* Elektronik Section */}
        <div className="bg-white rounded-none md:rounded-xl shadow-sm border border-gray-100 overflow-hidden mt-2">
          <button
            onClick={() => setActiveSection(activeSection === 'elektronik' ? '' : 'elektronik')}
            className="w-full px-6 py-3 bg-red-800 text-white flex items-center justify-between hover:bg-red-900 transition-colors"
          >
            <div className="flex items-center space-x-3">
              <Monitor className="w-6 h-6" />
              <span className="text-lg font-semibold">Elektronik</span>
              <span className="bg-red-700 px-2 py-1 rounded-full text-sm">
                {groupedData.elektronik.length}
              </span>
            </div>
            {activeSection === 'elektronik' ? (
              <ChevronDown className="w-5 h-5" />
            ) : (
              <ChevronRight className="w-5 h-5" />
            )}
          </button>
          
          {activeSection === 'elektronik' && (
            <div className="p-4">
              {groupedData.elektronik.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-3 gap-y-2">
                  {groupedData.elektronik.map(renderAsetCard)}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  Tidak ada data elektronik
                </div>
              )}
            </div>
          )}
        </div>
      </div>

        {/* Last Updated Info */}
        <div className="bg-gray-200 px-4 py-2 text-sm text-gray-600 mt-6 rounded-lg">
          Terakhir diupdate: {lastUpdatedText}
        </div>
      </div>

      {/* Form Modal */}
      <AdminDataAsetForm
        isOpen={showForm}
        onClose={() => setShowForm(false)}
        onSuccess={fetchDataAset}
      />
    </div>
  );
};

export default AdminDataAset;

