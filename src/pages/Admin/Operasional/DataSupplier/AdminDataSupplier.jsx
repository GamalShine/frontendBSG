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
  const [expandedKategori, setExpandedKategori] = useState({});

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

  // Auto expand/collapse groups based on search
  useEffect(() => {
    const hasKeyword = String(searchTerm || '').trim().length > 0;
    if (hasKeyword) {
      // expand all groups containing items
      const next = {};
      Object.entries(groupedSuppliers).forEach(([k, arr]) => { if ((arr || []).length) next[k] = true; });
      setExpandedKategori(next);
    } else {
      // collapse all by default
      setExpandedKategori({});
    }
  }, [searchTerm, suppliers]);

  const renderSupplierCard = (supplier) => (
    <div
      key={supplier.id}
      onClick={() => { setDetailItem(supplier); setShowDetail(true); }}
      className="bg-white rounded-xl shadow-sm border border-gray-100 px-4 pt-4 pb-2 md:pb-3 hover:shadow-md transition-shadow cursor-pointer text-sm"
    >
      {/* Header strip ala Bina Lingkungan */}
      <div className="flex items-start justify-between px-3 py-3 bg-red-800 -mx-4 -mt-4 mb-0 border-b border-red-700">
        <h4 className="text-sm md:text-base font-semibold text-white leading-snug break-words pr-2" title={supplier.nama_supplier}>
          {supplier.nama_supplier || '-'}
        </h4>
      </div>

      {/* Meta ala grid label:value */}
      <div className="mt-2 pt-2 text-gray-800">
        <div className="grid grid-cols-[130px,12px,1fr] items-start leading-6 gap-x-2 text-sm">
          <span className="font-semibold text-[12px] tracking-wide text-gray-700 uppercase">Divisi</span>
          <span>:</span>
          <span className="break-words">{supplier.divisi || '-'}</span>
        </div>
        <div className="grid grid-cols-[130px,12px,1fr] items-start leading-6 gap-x-2 text-sm">
          <span className="font-semibold text-[12px] tracking-wide text-gray-700 uppercase">Kategori Supplier</span>
          <span>:</span>
          <span className="break-words">{supplier.kategori_supplier || '-'}</span>
        </div>
        <div className="grid grid-cols-[130px,12px,1fr] items-start leading-6 gap-x-2 text-sm">
          <span className="font-semibold text-[12px] tracking-wide text-gray-700 uppercase">No. HP</span>
          <span>:</span>
          <span className="break-words" title={supplier.no_hp_supplier}>{supplier.no_hp_supplier || '-'}</span>
        </div>
        <div className="grid grid-cols-[130px,12px,1fr] items-start leading-6 gap-x-2 text-sm">
          <span className="font-semibold text-[12px] tracking-wide text-gray-700 uppercase">Tanggal Kerjasama</span>
          <span>:</span>
          <span className="break-words">{supplier.tanggal_kerjasama ? format(new Date(supplier.tanggal_kerjasama), 'dd MMM yyyy', { locale: id }) : '-'}</span>
        </div>
        <div className="grid grid-cols-[130px,12px,1fr] items-start leading-6 gap-x-2 text-sm">
          <span className="font-semibold text-[12px] tracking-wide text-gray-700 uppercase">NPWP</span>
          <span>:</span>
          <span className="break-words" title={supplier.npwp}>{supplier.npwp || '-'}</span>
        </div>
        <div className="grid grid-cols-[130px,12px,1fr] items-start leading-6 gap-x-2 text-sm">
          <span className="font-semibold text-[12px] tracking-wide text-gray-700 uppercase">Alamat</span>
          <span>:</span>
          <span className="break-words line-clamp-2 leading-snug">{supplier.alamat || '-'}</span>
        </div>
        {supplier.keterangan && (
          <div className="grid grid-cols-[130px,12px,1fr] items-start leading-6 gap-x-2 text-sm">
            <span className="font-semibold text-[12px] tracking-wide text-gray-700 uppercase">Outlet</span>
            <span>:</span>
            <span className="break-words line-clamp-2 leading-snug">{supplier.keterangan}</span>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center justify-end gap-1 md:gap-2 pt-2">
        <button
          onClick={(e) => { e.stopPropagation(); setEditData(supplier); setShowForm(true); }}
          className="w-8 h-8 inline-flex items-center justify-center border border-blue-300 text-blue-600 rounded-sm hover:bg-blue-50 md:rounded-lg p-0 leading-none"
          title="Edit"
        >
          <Edit className="h-4 w-4 block" />
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); handleDelete(supplier.id); }}
          className="w-8 h-8 inline-flex items-center justify-center border border-red-300 text-red-600 rounded-sm hover:bg-red-50 md:rounded-lg p-0 leading-none"
          title="Hapus"
        >
          <Trash2 className="h-4 w-4 block" />
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
              <button className="hidden md:inline-flex items-center gap-2 px-4 py-2 bg-white text-red-700 rounded-lg hover:bg-red-50 transition-colors shadow-sm">
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
        {/* Pencarian nama saja */}
        <div className="bg-white rounded-none md:rounded-xl shadow-sm border border-gray-100 mb-2">
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
        {/* Daftar supplier dikelompokkan per kategori */}
        {filterLoading && (
          <div className="px-6 py-2 text-xs text-gray-600 flex items-center gap-2">
            <span className="inline-block w-3 h-3 border-2 border-gray-300 border-t-red-600 rounded-full animate-spin" />
            Memuat hasil pencarian...
          </div>
        )}
        <div className="mt-1">
          {(() => {
            const order = ['SUPPLIER OUTLET','SUPPLIER TOKO TEPUNG & BB','SUPPLIER PRODUKSI','SUPPLIER KAMBING'];
            const keys = order.filter(k => (groupedSuppliers[k] || []).length > 0);
            if (!keys.length) return <div className="bg-white rounded-none md:rounded-xl shadow-sm border border-gray-100 overflow-hidden"><div className="p-6 text-center text-gray-500">Tidak ada data</div></div>;
            return keys.map((kat) => {
              const arr = groupedSuppliers[kat] || [];
              const open = !!expandedKategori[kat];
              return (
                <div key={kat} className="mb-2 overflow-hidden rounded-none border border-gray-200 bg-white">
                  <button
                    onClick={() => setExpandedKategori(prev => ({ ...prev, [kat]: !prev[kat] }))}
                    className="w-full flex items-center justify-between px-4 md:px-6 py-3 bg-red-700 text-white"
                  >
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">{kat}</span>
                      <span className="hidden md:inline-flex ml-2 text-xs bg-white/15 px-2 py-0.5 rounded-full">{arr.length} item</span>
                    </div>
                    {open ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                  </button>
                  {open && (
                    <div className="p-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-3 gap-y-2">
                        {arr.map(renderSupplierCard)}
                      </div>
                    </div>
                  )}
                </div>
              );
            });
          })()}
        </div>

        
      </div>
      {/* FAB Tambah (mobile only) */}
      <Link
        to="/admin/operasional/data-supplier/form"
        state={{ backgroundLocation: location }}
      >
        <button
          type="button"
          className="md:hidden fixed bottom-6 right-4 z-40 w-14 h-14 rounded-full bg-red-600 text-white shadow-lg flex items-center justify-center active:scale-95"
          aria-label="Tambah Supplier"
        >
          <Plus className="w-6 h-6" />
        </button>
      </Link>
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
                            <div className="text-xs text-gray-500 mb-1">Outlet</div>
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
