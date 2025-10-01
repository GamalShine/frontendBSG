import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Card, { CardHeader, CardBody } from '@/components/UI/Card';
import Button from '@/components/UI/Button';
import Input from '@/components/UI/Input';
import Badge from '@/components/UI/Badge';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/UI/Table';
import Select from '@/components/UI/Select';
import { 
  Search, 
  Filter, 
  Plus, 
  Eye, 
  Edit, 
  Trash2,
  Building,
  MapPin,
  Calendar,
  Phone,
  ChevronDown,
  ChevronRight,
  Truck,
  Factory,
  Store
} from 'lucide-react';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { dataSupplierService } from '@/services/dataSupplierService';
import { MENU_CODES } from '@/config/menuCodes';

const OwnerDataSupplier = () => {
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [kategoriFilter, setKategoriFilter] = useState('all');
  const [divisiFilter, setDivisiFilter] = useState('all');
  const [stats, setStats] = useState({});
  const [activeSection, setActiveSection] = useState('');

  useEffect(() => {
    fetchSuppliers();
  }, [searchTerm, kategoriFilter, divisiFilter]);

  const fetchSuppliers = async () => {
    try {
      setLoading(true);
      let params = {};
      
      if (searchTerm) {
        params.search = searchTerm;
      } else if (kategoriFilter !== 'all') {
        params.category = kategoriFilter;
      } else if (divisiFilter !== 'all') {
        params.divisi = divisiFilter;
      }

      const response = await dataSupplierService.getAll(params);
      setSuppliers(response.data);
      setStats(response.stats);
    } catch (err) {
      setError('Gagal memuat data supplier');
      console.error('Error fetching suppliers:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Apakah Anda yakin ingin menghapus supplier ini?')) {
      try {
        await dataSupplierService.delete(id);
        fetchSuppliers(); // Refresh data
      } catch (err) {
        alert('Gagal menghapus supplier');
        console.error('Error deleting supplier:', err);
      }
    }
  };

  const getKategoriColor = (kategori) => {
    const colors = {
      'SUPPLIER OUTLET': 'bg-blue-100 text-blue-800',
      'SUPPLIER TOKO TEPUNG & BB': 'bg-green-100 text-green-800',
      'SUPPLIER PRODUKSI': 'bg-purple-100 text-purple-800',
      'SUPPLIER KAMBING': 'bg-orange-100 text-orange-800'
    };
    return colors[kategori] || 'bg-gray-100 text-gray-800';
  };

  const getDivisiColor = (divisi) => {
    const colors = {
      'PRODUKSI': 'bg-red-100 text-red-800',
      'MARKETING': 'bg-blue-100 text-blue-800',
      'OPERASIONAL': 'bg-green-100 text-green-800'
    };
    return colors[divisi] || 'bg-gray-100 text-gray-800';
  };

  // Group suppliers by category
  const groupedSuppliers = {
    'SUPPLIER OUTLET': suppliers.filter(s => s.kategori_supplier === 'SUPPLIER OUTLET'),
    'SUPPLIER TOKO TEPUNG & BB': suppliers.filter(s => s.kategori_supplier === 'SUPPLIER TOKO TEPUNG & BB'),
    'SUPPLIER PRODUKSI': suppliers.filter(s => s.kategori_supplier === 'SUPPLIER PRODUKSI'),
    'SUPPLIER KAMBING': suppliers.filter(s => s.kategori_supplier === 'SUPPLIER KAMBING')
  };

  const renderSupplierCard = (supplier) => (
    <div key={supplier.id} className="bg-gray-50 rounded-lg p-4 border hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-3">
        <div className="flex-1">
          <h4 className="font-semibold text-gray-900">{supplier.nama_supplier}</h4>
          {supplier.npwp && (
            <p className="text-sm text-gray-500">NPWP: {supplier.npwp}</p>
          )}
        </div>
        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getDivisiColor(supplier.divisi)}`}>
          {supplier.divisi}
        </span>
      </div>
      
      <div className="space-y-2 mb-4">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Phone className="h-4 w-4" />
          <span>{supplier.no_hp_supplier}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Calendar className="h-4 w-4" />
          <span>{format(new Date(supplier.tanggal_kerjasama), 'dd MMM yyyy', { locale: id })}</span>
        </div>
        <div className="flex items-start gap-2 text-sm text-gray-600">
          <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0" />
          <span className="line-clamp-2">{supplier.alamat}</span>
        </div>
      </div>
      
      <div className="flex items-center gap-2">
        <Link to={`/owner/operasional/data-supplier/detail/${supplier.id}`}>
          <button className="p-1.5 text-gray-400 hover:text-gray-600 border border-gray-300 rounded hover:bg-gray-50">
            <Eye className="h-4 w-4" />
          </button>
        </Link>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Memuat data supplier...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">{error}</p>
          <Button 
            onClick={fetchSuppliers} 
            className="mt-2"
            variant="outline"
          >
            Coba Lagi
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-0 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="bg-red-800 text-white px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span className="text-sm font-semibold bg-white/10 rounded px-2 py-1">{MENU_CODES.operasional.dataSupplier}</span>
            <div>
              <h1 className="text-xl md:text-2xl font-extrabold tracking-tight">DATA SUPPLIER</h1>
              <p className="text-sm text-red-100">Monitor dan lihat semua data supplier perusahaan</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={() => { setSearchTerm(''); setKategoriFilter('all'); setDivisiFilter('all'); }} 
              className="px-4 py-2 rounded-full border border-white/60 text-white hover:bg-white/10"
            >
              RESET FILTER
            </button>
          </div>
        </div>
      </div>
      
      {/* Info Bar */}
      <div className="bg-gray-200 px-6 py-2 text-xs text-gray-600">
        Data supplier terbaru berada di paling atas
      </div>

      <div className="px-6 py-6">
        {/* Statistics Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Building className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Total Supplier</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total_suppliers || 0}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <span className="text-green-600 font-bold text-sm">O</span>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Supplier Outlet</p>
                <p className="text-2xl font-bold text-gray-900">{stats.outlet_count || 0}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <span className="text-purple-600 font-bold text-sm">P</span>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Supplier Produksi</p>
                <p className="text-2xl font-bold text-gray-900">{stats.produksi_count || 0}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-orange-100 rounded-lg">
                <span className="text-orange-600 font-bold text-sm">M</span>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Supplier Marketing</p>
                <p className="text-2xl font-bold text-gray-900">{stats.marketing_divisi_count || 0}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters and Actions */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Cari Supplier</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Masukkan nama supplier..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Kategori Supplier</label>
              <select 
                value={kategoriFilter} 
                onChange={(e) => setKategoriFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
              >
                <option value="all">Semua Kategori</option>
                <option value="SUPPLIER OUTLET">Supplier Outlet</option>
                <option value="SUPPLIER TOKO TEPUNG & BB">Supplier Toko Tepung & BB</option>
                <option value="SUPPLIER PRODUKSI">Supplier Produksi</option>
                <option value="SUPPLIER KAMBING">Supplier Kambing</option>
              </select>
            </div>
          </div>
        </div>

        {/* Data Sections by Category */}
        <div className="space-y-6">
          {/* Supplier Outlet Section */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <button
              onClick={() => setActiveSection(activeSection === 'outlet' ? '' : 'outlet')}
              className="w-full px-6 py-4 bg-red-800 text-white flex items-center justify-between"
            >
              <div className="flex items-center space-x-3">
                <Store className="w-6 h-6" />
                <span className="text-lg font-semibold">Supplier Outlet</span>
                <span className="bg-red-700 px-2 py-1 rounded-full text-sm">
                  {groupedSuppliers['SUPPLIER OUTLET'].length}
                </span>
              </div>
              {activeSection === 'outlet' ? (
                <ChevronDown className="w-5 h-5" />
              ) : (
                <ChevronRight className="w-5 h-5" />
              )}
            </button>
            {activeSection === 'outlet' && (
              <div className="p-6">
                {groupedSuppliers['SUPPLIER OUTLET'].length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {groupedSuppliers['SUPPLIER OUTLET'].map(renderSupplierCard)}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">Tidak ada data supplier outlet</div>
                )}
              </div>
            )}
          </div>

          {/* Supplier Toko Tepung & BB Section */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <button
              onClick={() => setActiveSection(activeSection === 'tepung' ? '' : 'tepung')}
              className="w-full px-6 py-4 bg-red-800 text-white flex items-center justify-between"
            >
              <div className="flex items-center space-x-3">
                <Building className="w-6 h-6" />
                <span className="text-lg font-semibold">Supplier Toko Tepung & BB</span>
                <span className="bg-red-700 px-2 py-1 rounded-full text-sm">
                  {groupedSuppliers['SUPPLIER TOKO TEPUNG & BB'].length}
                </span>
              </div>
              {activeSection === 'tepung' ? (
                <ChevronDown className="w-5 h-5" />
              ) : (
                <ChevronRight className="w-5 h-5" />
              )}
            </button>
            {activeSection === 'tepung' && (
              <div className="p-6">
                {groupedSuppliers['SUPPLIER TOKO TEPUNG & BB'].length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {groupedSuppliers['SUPPLIER TOKO TEPUNG & BB'].map(renderSupplierCard)}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">Tidak ada data supplier toko tepung & BB</div>
                )}
              </div>
            )}
          </div>

          {/* Supplier Produksi Section */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <button
              onClick={() => setActiveSection(activeSection === 'produksi' ? '' : 'produksi')}
              className="w-full px-6 py-4 bg-red-800 text-white flex items-center justify-between"
            >
              <div className="flex items-center space-x-3">
                <Factory className="w-6 h-6" />
                <span className="text-lg font-semibold">Supplier Produksi</span>
                <span className="bg-red-700 px-2 py-1 rounded-full text-sm">
                  {groupedSuppliers['SUPPLIER PRODUKSI'].length}
                </span>
              </div>
              {activeSection === 'produksi' ? (
                <ChevronDown className="w-5 h-5" />
              ) : (
                <ChevronRight className="w-5 h-5" />
              )}
            </button>
            
            {activeSection === 'produksi' && (
              <div className="p-6">
                {groupedSuppliers['SUPPLIER PRODUKSI'].length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {groupedSuppliers['SUPPLIER PRODUKSI'].map(renderSupplierCard)}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    Tidak ada data supplier produksi
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Supplier Kambing Section */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <button
              onClick={() => setActiveSection(activeSection === 'kambing' ? '' : 'kambing')}
              className="w-full px-6 py-4 bg-red-800 text-white flex items-center justify-between hover:bg-red-900 transition-colors"
            >
              <div className="flex items-center space-x-3">
                <Truck className="w-6 h-6" />
                <span className="text-lg font-semibold">Supplier Kambing</span>
                <span className="bg-red-700 px-2 py-1 rounded-full text-sm">
                  {groupedSuppliers['SUPPLIER KAMBING'].length}
                </span>
              </div>
              {activeSection === 'kambing' ? (
                <ChevronDown className="w-5 h-5" />
              ) : (
                <ChevronRight className="w-5 h-5" />
              )}
            </button>
            
            {activeSection === 'kambing' && (
              <div className="p-6">
                {groupedSuppliers['SUPPLIER KAMBING'].length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {groupedSuppliers['SUPPLIER KAMBING'].map(renderSupplierCard)}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    Tidak ada data supplier kambing
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Last Updated Info */}
        <div className="bg-gray-200 px-4 py-2 text-sm text-gray-600 mt-6 rounded-lg">
          Data terakhir diupdate: {format(new Date(), 'dd MMMM yyyy \'pukul\' HH:mm', { locale: id })}
        </div>
      </div>
    </div>
  );
};

export default OwnerDataSupplier;
