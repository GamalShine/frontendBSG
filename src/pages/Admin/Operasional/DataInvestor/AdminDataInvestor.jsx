import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Building2, 
  User, 
  Plus, 
  Search, 
  Filter, 
  Edit, 
  Trash2, 
  Eye,
  ChevronDown,
  ChevronRight,
  Phone,
  MapPin,
  Calendar,
  DollarSign,
  Percent,
  ArrowLeft,
  MoreVertical
} from 'lucide-react';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { dataInvestorService } from '@/services/dataInvestorService';
import { toast } from 'react-hot-toast';
import AdminDataInvestorForm from './AdminDataInvestorForm';

const AdminDataInvestor = () => {
  const [activeSection, setActiveSection] = useState('outlet');
  const [dataInvestor, setDataInvestor] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [outletFilter, setOutletFilter] = useState('all');
  const [tipeFilter, setTipeFilter] = useState('all');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [outlets, setOutlets] = useState([]);

  useEffect(() => {
    fetchDataInvestor();
    fetchOutlets();
  }, []);

  const fetchDataInvestor = async () => {
    try {
      setLoading(true);
      const response = await dataInvestorService.getAllDataInvestor();
      if (response.success) {
        setDataInvestor(response.data);
      }
    } catch (error) {
      console.error('Error fetching data investor:', error);
      setError('Gagal mengambil data investor');
      toast.error('Gagal mengambil data investor');
    } finally {
      setLoading(false);
    }
  };

  const fetchOutlets = async () => {
    try {
      const response = await dataInvestorService.getUniqueOutlets();
      if (response.success) {
        setOutlets(response.data);
      }
    } catch (error) {
      console.error('Error fetching outlets:', error);
    }
  };

  const handleDelete = async (id) => {
    try {
      const response = await dataInvestorService.deleteDataInvestor(id);
      if (response.success) {
        toast.success('Data investor berhasil dihapus');
        fetchDataInvestor();
        setShowDeleteConfirm(null);
      }
    } catch (error) {
      console.error('Error deleting data investor:', error);
      toast.error('Gagal menghapus data investor');
    }
  };

  const filteredData = dataInvestor.filter(item => {
    const matchesSearch = 
      item.nama_investor?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.outlet?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.no_hp?.includes(searchTerm) ||
      item.alamat?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesOutlet = outletFilter === 'all' || item.outlet === outletFilter;
    const matchesTipe = tipeFilter === 'all' || item.tipe_data === tipeFilter;
    
    return matchesSearch && matchesOutlet && matchesTipe;
  });

  const getTipeColor = (tipe) => {
    switch (tipe) {
      case 'outlet': return 'bg-blue-100 text-blue-800';
      case 'biodata': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTipeIcon = (tipe) => {
    switch (tipe) {
      case 'outlet': return <Building2 className="w-4 h-4" />;
      case 'biodata': return <User className="w-4 h-4" />;
      default: return <Users className="w-4 h-4" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-red-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="text-red-600 text-xl mb-4">{error}</div>
          <button 
            onClick={fetchDataInvestor}
            className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
          >
            Coba Lagi
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header - Merah Gelap seperti Mobile App */}
      <div className="bg-red-800 text-white p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <button className="p-2 hover:bg-red-700 rounded-lg">
              <ArrowLeft className="w-6 h-6" />
            </button>
            <div>
              <h1 className="text-xl font-bold">DATA INVESTOR</h1>
              <p className="text-sm text-red-100">H01-P4</p>
            </div>
          </div>
          <button className="p-2 hover:bg-red-700 rounded-lg">
            <MoreVertical className="w-6 h-6" />
          </button>
        </div>
      </div>

      {/* Info Update Bar - Abu-abu Muda */}
      <div className="bg-gray-200 px-4 py-2 text-sm text-gray-600">
        Data terakhir diupdate: {format(new Date(), 'dd MMMM yyyy \'pukul\' HH:mm', { locale: id })}
      </div>

      {/* Search and Filters */}
      <div className="bg-white p-4 border-b border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Cari investor, outlet, HP, alamat..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
            />
          </div>
          
          <div>
            <select
              value={outletFilter}
              onChange={(e) => setOutletFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
            >
              <option value="all">Semua Outlet</option>
              {outlets.map((outlet, index) => (
                <option key={index} value={outlet}>{outlet}</option>
              ))}
            </select>
          </div>
          
          <div>
            <select
              value={tipeFilter}
              onChange={(e) => setTipeFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
            >
              <option value="all">Semua Tipe</option>
              <option value="outlet">Outlet</option>
              <option value="biodata">Biodata</option>
            </select>
          </div>
        </div>
      </div>

      {/* Content Sections */}
      <div className="p-4 space-y-4">
        {/* Section 1: Data Investor/Outlet & Jumlah % Bagi Hasil */}
        <div className="bg-white rounded-lg overflow-hidden shadow-sm">
          <div 
            className="bg-red-800 text-white p-4 cursor-pointer flex items-center justify-between"
            onClick={() => setActiveSection(activeSection === 'outlet' ? null : 'outlet')}
          >
            <span className="font-semibold">Data Investor/Outlet & Jumlah % Bagi Hasil</span>
            {activeSection === 'outlet' ? (
              <ChevronDown className="w-5 h-5" />
            ) : (
              <ChevronRight className="w-5 h-5" />
            )}
          </div>
          
          {activeSection === 'outlet' && (
            <div className="p-4 space-y-4">
              {/* Group by Outlet */}
              {outlets.map((outlet) => {
                const outletInvestors = filteredData.filter(item => item.outlet === outlet);
                if (outletInvestors.length === 0) return null;
                
  return (
                  <div key={outlet} className="border border-gray-200 rounded-lg overflow-hidden">
                    <div className="bg-red-800 text-white p-3 flex items-center justify-between">
                      <span className="font-semibold">{outlet}</span>
                      <ChevronDown className="w-5 h-5" />
                    </div>
                    
                    <div className="p-4 bg-white space-y-3">
                      {outletInvestors.map((investor) => (
                        <div key={investor.id} className="space-y-2">
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <span className="font-semibold text-gray-700">OUTLET:</span>
                              <span className="ml-2 text-gray-600">{investor.outlet}</span>
                            </div>
                            <div>
                              <span className="font-semibold text-gray-700">DAFTAR INVESTOR:</span>
                              <span className="ml-2 text-gray-600">{investor.nama_investor}</span>
                            </div>
                            <div>
                              <span className="font-semibold text-gray-700">BAGI HASIL:</span>
                              <span className="ml-2 text-gray-600">{investor.persentase_bagi_hasil || '50%-50%'}</span>
                            </div>
                          </div>
                          
                          {/* Action Buttons */}
                          <div className="flex space-x-2 pt-2">
                            <button className="p-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200">
                              <Edit className="w-4 h-4" />
                            </button>
                            <button 
                              onClick={() => setShowDeleteConfirm(investor.id)}
                              className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Section 2: Biodata Investor */}
        <div className="bg-white rounded-lg overflow-hidden shadow-sm">
          <div 
            className="bg-red-800 text-white p-4 cursor-pointer flex items-center justify-between"
            onClick={() => setActiveSection(activeSection === 'biodata' ? null : 'biodata')}
          >
            <span className="font-semibold">Biodata Investor</span>
            {activeSection === 'biodata' ? (
              <ChevronDown className="w-5 h-5" />
            ) : (
              <ChevronRight className="w-5 h-5" />
            )}
          </div>
          
          {activeSection === 'biodata' && (
            <div className="p-4">
              <div className="bg-pink-50 p-4 rounded-lg">
                <h3 className="font-bold text-gray-800 mb-4 text-center">BIODATA INVESTOR</h3>
                
                {filteredData.slice(0, 3).map((investor) => (
                  <div key={investor.id} className="mb-6 p-4 bg-white rounded-lg border border-gray-200">
                    <div className="space-y-3 text-sm">
                      <div className="flex justify-between">
                        <span className="font-semibold text-gray-700">Nama:</span>
                        <span className="text-gray-600">{investor.nama_investor}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-semibold text-gray-700">TTL Investor:</span>
                        <span className="text-gray-600">{investor.ttl_investor || '-'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-semibold text-gray-700">No. HP:</span>
                        <span className="text-gray-600">{investor.no_hp}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-semibold text-gray-700">ALAMAT:</span>
                        <span className="text-gray-600">{investor.alamat}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-semibold text-gray-700">TANGGAL JOIN:</span>
                        <span className="text-gray-600">
                          {investor.tanggal_join ? format(new Date(investor.tanggal_join), 'dd MMMM yyyy', { locale: id }) : '-'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-semibold text-gray-700">KONTAK DARURAT:</span>
                        <span className="text-gray-600">{investor.kontak_darurat || '-'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-semibold text-gray-700">NAMA PASANGAN:</span>
                        <span className="text-gray-600">{investor.nama_pasangan || '-'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-semibold text-gray-700">NAMA ANAK:</span>
                        <span className="text-gray-600">{investor.nama_anak || '-'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-semibold text-gray-700">INVESTASI DI OUTLET:</span>
                        <span className="text-gray-600">
                          {investor.investasi_di_outlet ? 
                            `Rp ${parseFloat(investor.investasi_di_outlet).toLocaleString('id-ID')}` : '-'
                          }
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-semibold text-gray-700">PERSENTASE BAGI HASIL:</span>
                        <span className="text-gray-600">{investor.persentase_bagi_hasil || '50%-50%'}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Tombol Tambah - Merah Gelap seperti Mobile App */}
        <button 
          onClick={() => setShowForm(true)}
          className="w-full bg-red-800 text-white py-4 px-6 rounded-lg hover:bg-red-700 flex items-center justify-center space-x-3 text-lg font-semibold"
        >
          <Plus className="w-6 h-6" />
          <span>TAMBAH DATA INVESTOR/OUTLET</span>
        </button>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Konfirmasi Hapus</h3>
            <p className="text-sm text-gray-500 mb-6">
              Apakah Anda yakin ingin menghapus data investor ini? Tindakan ini tidak dapat dibatalkan.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowDeleteConfirm(null)}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
              >
                Batal
              </button>
              <button
                onClick={() => handleDelete(showDeleteConfirm)}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Hapus
              </button>
        </div>
      </div>
        </div>
      )}

      {/* Form Modal */}
      <AdminDataInvestorForm
        isOpen={showForm}
        onClose={() => setShowForm(false)}
        onSuccess={fetchDataInvestor}
      />
    </div>
  );
};

export default AdminDataInvestor;
