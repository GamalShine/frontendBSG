import React, { useState, useEffect, useMemo } from 'react';
import { Link, useLocation } from 'react-router-dom';
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
  Store,
  X
} from 'lucide-react';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { dataSupplierService } from '@/services/dataSupplierService';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogBody, DialogFooter } from '@/components/UI/Dialog';
import AdminDataSupplierForm from './AdminDataSupplierForm';

const AdminDataSupplier = () => {
  const location = useLocation();
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterLoading, setFilterLoading] = useState(false);
  const [initialLoaded, setInitialLoaded] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [kategoriFilter, setKategoriFilter] = useState('all');
  const [divisiFilter, setDivisiFilter] = useState('all');
  const [stats, setStats] = useState({});
  const [activeSection, setActiveSection] = useState('');
  const [showDetail, setShowDetail] = useState(false);
  const [detailItem, setDetailItem] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editData, setEditData] = useState(null);

  // Initial load (full loader)
  useEffect(() => {
    const run = async () => {
      await fetchSuppliers(true);
      setInitialLoaded(true);
    };
    run();
  }, []);

  // Reactive load on filters with debounce (soft loading)
  useEffect(() => {
    if (!initialLoaded) return;
    setFilterLoading(true);
    const t = setTimeout(async () => {
      await fetchSuppliers(false);
      setFilterLoading(false);
    }, 300);
    return () => clearTimeout(t);
  }, [searchTerm, kategoriFilter, divisiFilter, initialLoaded]);

  const fetchSuppliers = async (showFullLoading = false) => {
    try {
      if (showFullLoading) setLoading(true);
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
      if (showFullLoading) setLoading(false);
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
    <div
      key={supplier.id}
      onClick={() => { setDetailItem(supplier); setShowDetail(true); }}
      className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 hover:shadow-md transition-shadow cursor-pointer text-sm"
    >
      {/* Header: Nama + Badge */}
      <div className="flex items-start justify-between mb-2">
        <div className="pr-2 min-w-0">
          <h4 className="text-base font-semibold text-gray-900 leading-snug truncate" title={supplier.nama_supplier}>{supplier.nama_supplier || '-'}</h4>
        </div>
        <div className="flex items-center gap-1 flex-shrink-0">
          <span className={`inline-flex px-2 py-1 text-[11px] font-semibold rounded-full ${getDivisiColor(supplier.divisi)}`}>{supplier.divisi || '-'}</span>
        </div>
      </div>

      {/* Meta (tanpa ikon, pakai label teks) */}
      <div className="mt-2 pt-2 border-t border-gray-100 space-y-1.5 text-gray-800">
        <div className="flex gap-2">
          <span className="text-xs text-gray-500 min-w-[130px]">No. HP:</span>
          <span className="font-medium truncate" title={supplier.no_hp_supplier}>{supplier.no_hp_supplier || '-'}</span>
        </div>
        <div className="flex gap-2">
          <span className="text-xs text-gray-500 min-w-[130px]">Tanggal Kerjasama:</span>
          <span className="font-medium">{supplier.tanggal_kerjasama ? format(new Date(supplier.tanggal_kerjasama), 'dd MMM yyyy', { locale: id }) : '-'}</span>
        </div>
        <div className="flex gap-2">
          <span className="text-xs text-gray-500 min-w-[130px]">NPWP:</span>
          <span className="font-medium truncate" title={supplier.npwp}>{supplier.npwp || '-'}</span>
        </div>
        <div className="flex gap-2">
          <span className="text-xs text-gray-500 min-w-[130px]">Alamat:</span>
          <span className="font-medium line-clamp-2">{supplier.alamat || '-'}</span>
        </div>
        {supplier.keterangan && (
          <div className="flex gap-2">
            <span className="text-xs text-gray-500 min-w-[130px]">Keterangan:</span>
            <span className="font-medium line-clamp-2">{supplier.keterangan}</span>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center justify-end gap-2 pt-3">
        <button
          onClick={(e) => { e.stopPropagation(); setEditData(supplier); setShowForm(true); }}
          className="p-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200"
          title="Edit"
        >
          <Edit className="h-4 w-4" />
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); handleDelete(supplier.id); }}
          className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200"
          title="Hapus"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
    </div>
  );

  // Hitung teks "Terakhir diupdate" dari created_at terbaru; fallback ke tanggal_kerjasama; jika tidak ada, '-'
  const lastUpdatedText = useMemo(() => {
    if (!Array.isArray(suppliers) || suppliers.length === 0) return '-';
    const latest = [...suppliers]
      .sort((a, b) => {
        const aDate = a?.created_at || a?.tanggal_kerjasama;
        const bDate = b?.created_at || b?.tanggal_kerjasama;
        return new Date(bDate || 0) - new Date(aDate || 0);
      })[0];
    const dt = latest?.created_at || latest?.tanggal_kerjasama;
    if (!dt) return '-';
    try {
      return format(new Date(dt), "d MMMM yyyy 'pukul' HH.mm", { locale: id });
    } catch {
      return '-';
    }
  }, [suppliers]);

  if (loading && !initialLoaded) {
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
            <span className="text-sm font-semibold bg-white/10 rounded px-2 py-1">A01-O2</span>
            <div>
              <h1 className="text-xl md:text-2xl font-extrabold tracking-tight">DATA SUPPLIER</h1>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Link
              to="/admin/operasional/data-supplier/form"
              state={{ backgroundLocation: location }}
            >
              <button className="inline-flex items-center gap-2 px-4 py-2 bg-white text-red-700 rounded-lg hover:bg-red-50 transition-colors shadow-sm">
                <Plus className="h-4 w-4" />
                <span className="font-semibold">Tambah</span>
              </button>
            </Link>
          </div>
        </div>
      </div>
      
      {/* Info Bar */}
      <div className="bg-gray-200 px-6 py-2 text-sm text-gray-900">
        Terakhir diupdate: {lastUpdatedText}
      </div>

      <div className="px-0 py-4">
        {/* Statistics Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Building className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-xs font-medium text-gray-500">Total Supplier</p>
                <p className="text-lg font-bold text-gray-900">{stats.total_suppliers || 0}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <span className="text-green-600 font-bold text-sm">O</span>
              </div>
              <div>
                <p className="text-xs font-medium text-gray-500">Supplier Outlet</p>
                <p className="text-lg font-bold text-gray-900">{stats.outlet_count || 0}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <span className="text-purple-600 font-bold text-sm">P</span>
              </div>
              <div>
                <p className="text-xs font-medium text-gray-500">Supplier Produksi</p>
                <p className="text-lg font-bold text-gray-900">{stats.produksi_count || 0}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-orange-100 rounded-lg">
                <span className="text-orange-600 font-bold text-sm">M</span>
              </div>
              <div>
                <p className="text-xs font-medium text-gray-500">Supplier Marketing</p>
                <p className="text-lg font-bold text-gray-900">{stats.marketing_divisi_count || 0}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters and Actions */}
        <div className="bg-white rounded-none md:rounded-xl shadow-sm border border-gray-100 mb-6">
          <div className="px-6 py-4">
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Cari Supplier</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Masukkan nama supplier..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Data Sections by Category */}
        {filterLoading && (
          <div className="px-6 py-2 text-xs text-gray-600 flex items-center gap-2">
            <span className="inline-block w-3 h-3 border-2 border-gray-300 border-t-red-600 rounded-full animate-spin" />
            Memuat hasil pencarian...
          </div>
        )}
        <div className="space-y-3">
          {/* Supplier Outlet Section */}
          <div className="bg-white rounded-none md:rounded-xl shadow-sm border border-gray-100 overflow-hidden mt-2">
            <button
              onClick={() => setActiveSection(activeSection === 'outlet' ? '' : 'outlet')}
              className="w-full px-6 py-3 bg-red-800 text-white flex items-center justify-between hover:bg-red-900 transition-colors"
            >
              <div className="flex items-center space-x-3">
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
              <div className="p-4">
                {groupedSuppliers['SUPPLIER OUTLET'].length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-3 gap-y-2">
                    {groupedSuppliers['SUPPLIER OUTLET'].map(renderSupplierCard)}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    Tidak ada data supplier outlet
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Supplier Toko Tepung & BB Section */}
          <div className="bg-white rounded-none md:rounded-xl shadow-sm border border-gray-100 overflow-hidden mt-2">
            <button
              onClick={() => setActiveSection(activeSection === 'tepung' ? '' : 'tepung')}
              className="w-full px-6 py-3 bg-red-800 text-white flex items-center justify-between hover:bg-red-900 transition-colors"
            >
              <div className="flex items-center space-x-3">
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
              <div className="p-4">
                {groupedSuppliers['SUPPLIER TOKO TEPUNG & BB'].length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-3 gap-y-2">
                    {groupedSuppliers['SUPPLIER TOKO TEPUNG & BB'].map(renderSupplierCard)}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    Tidak ada data supplier toko tepung & BB
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Supplier Produksi Section */}
          <div className="bg-white rounded-none md:rounded-xl shadow-sm border border-gray-100 overflow-hidden mt-2">
            <button
              onClick={() => setActiveSection(activeSection === 'produksi' ? '' : 'produksi')}
              className="w-full px-6 py-3 bg-red-800 text-white flex items-center justify-between hover:bg-red-900 transition-colors"
            >
              <div className="flex items-center space-x-3">
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
              <div className="p-4">
                {groupedSuppliers['SUPPLIER PRODUKSI'].length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-3 gap-y-2">
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
          <div className="bg-white rounded-none md:rounded-xl shadow-sm border border-gray-100 overflow-hidden mt-2">
            <button
              onClick={() => setActiveSection(activeSection === 'kambing' ? '' : 'kambing')}
              className="w-full px-6 py-3 bg-red-800 text-white flex items-center justify-between hover:bg-red-900 transition-colors"
            >
              <div className="flex items-center space-x-3">
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
              <div className="p-4">
                {groupedSuppliers['SUPPLIER KAMBING'].length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-3 gap-y-2">
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

        
      </div>
      {/* Edit Modal */}
      <AdminDataSupplierForm
        isOpen={showForm}
        onClose={() => { setShowForm(false); setEditData(null); }}
        onSuccess={fetchSuppliers}
        editData={editData}
      />

      {/* Detail Modal (read-only, styled like form modal) */}
      <Dialog open={showDetail} onOpenChange={setShowDetail}>
        <DialogContent className="p-0 max-w-3xl">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-h-[92vh] overflow-hidden border border-gray-200 flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-red-700 bg-red-800 text-white sticky top-0 z-10">
              <div className="flex items-center">
                <div>
                  <h2 className="text-xl font-bold leading-tight">Detail Supplier</h2>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowDetail(false)}
                className="p-2 text-white/90 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                aria-label="Tutup"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Body */}
            <div className="flex-1 min-h-0 overflow-y-auto px-6 py-5 scrollbar-hide">
              {detailItem && (
                <div className="grid grid-cols-12 gap-4">
                  {/* Card informasi utama */}
                  <div className="col-span-12">
                    <div className="rounded-xl border bg-white">
                      <div className="px-4 py-3 border-b bg-gray-50 rounded-t-xl">
                        <div className="text-sm font-semibold text-gray-700">Informasi Supplier</div>
                      </div>
                      <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div>
                          <div className="text-xs text-gray-500 mb-1">Nama Supplier</div>
                          <div className="font-medium text-gray-900">{detailItem.nama_supplier || '-'}</div>
                        </div>
                        <div>
                          <div className="text-xs text-gray-500 mb-1">Divisi</div>
                          <div className="font-medium text-gray-900">{detailItem.divisi || '-'}</div>
                        </div>
                        <div>
                          <div className="text-xs text-gray-500 mb-1">Kategori Supplier</div>
                          <div className="text-gray-800">{detailItem.kategori_supplier || '-'}</div>
                        </div>
                        <div>
                          <div className="text-xs text-gray-500 mb-1">No. HP</div>
                          <div className="text-gray-800">{detailItem.no_hp_supplier || '-'}</div>
                        </div>
                        <div>
                          <div className="text-xs text-gray-500 mb-1">Tanggal Kerjasama</div>
                          <div className="text-gray-800">{detailItem.tanggal_kerjasama ? format(new Date(detailItem.tanggal_kerjasama), 'dd MMM yyyy', { locale: id }) : '-'}</div>
                        </div>
                        <div>
                          <div className="text-xs text-gray-500 mb-1">NPWP</div>
                          <div className="text-gray-800">{detailItem.npwp || '-'}</div>
                        </div>
                        <div className="md:col-span-2">
                          <div className="text-xs text-gray-500 mb-1">Alamat</div>
                          <div className="text-gray-800 leading-relaxed">{detailItem.alamat || '-'}</div>
                        </div>
                        {detailItem.keterangan && (
                          <div className="md:col-span-2">
                            <div className="text-xs text-gray-500 mb-1">Keterangan</div>
                            <div className="text-gray-800 leading-relaxed">{detailItem.keterangan}</div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-0 border-t bg-white">
              <div className="grid grid-cols-2 gap-2 px-2 py-2">
                <button
                  type="button"
                  onClick={() => { setShowDetail(false); setEditData(detailItem); setShowForm(true); }}
                  className="w-full py-3 bg-red-700 text-white font-semibold hover:bg-red-800 transition-colors rounded-lg"
                >
                  Edit
                </button>
                <button
                  type="button"
                  onClick={() => setShowDetail(false)}
                  className="w-full py-3 bg-red-700 text-white font-semibold hover:bg-red-800 transition-colors rounded-lg"
                >
                  Tutup
                </button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminDataSupplier;
