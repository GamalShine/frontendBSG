import React, { useState, useEffect } from 'react';
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
  Building,
  MapPin,
  Calendar,
  Phone,
  Eye
} from 'lucide-react';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { dataSupplierService } from '@/services/dataSupplierService';

const DataSupplier = () => {
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [kategoriFilter, setKategoriFilter] = useState('all');
  const [divisiFilter, setDivisiFilter] = useState('all');
  const [stats, setStats] = useState({});

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
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Data Supplier</h1>
        <p className="text-gray-600">Daftar supplier perusahaan</p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <Card>
          <CardBody className="p-4">
            <div className="flex items-center">
              <Building className="h-8 w-8 text-blue-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">Total Supplier</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total_suppliers || 0}</p>
              </div>
            </div>
          </CardBody>
        </Card>
        
        <Card>
          <CardBody className="p-4">
            <div className="flex items-center">
              <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-blue-600 font-bold text-sm">O</span>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">Supplier Outlet</p>
                <p className="text-2xl font-bold text-gray-900">{stats.outlet_count || 0}</p>
              </div>
            </div>
          </CardBody>
        </Card>
        
        <Card>
          <CardBody className="p-4">
            <div className="flex items-center">
              <div className="h-8 w-8 bg-green-100 rounded-full flex items-center justify-center">
                <span className="text-green-600 font-bold text-sm">P</span>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">Supplier Produksi</p>
                <p className="text-2xl font-bold text-gray-900">{stats.produksi_count || 0}</p>
              </div>
            </div>
          </CardBody>
        </Card>
        
        <Card>
          <CardBody className="p-4">
            <div className="flex items-center">
              <div className="h-8 w-8 bg-purple-100 rounded-full flex items-center justify-center">
                <span className="text-purple-600 font-bold text-sm">M</span>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">Supplier Marketing</p>
                <p className="text-2xl font-bold text-gray-900">{stats.marketing_divisi_count || 0}</p>
              </div>
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardBody className="p-6">
          <div className="flex flex-col lg:flex-row gap-4 items-center">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                type="text"
                placeholder="Cari supplier..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
                          <Select 
                value={kategoriFilter} 
                onValueChange={setKategoriFilter}
                placeholder="Kategori Supplier"
                className="w-48"
                options={[
                  { value: 'all', label: 'Semua Kategori' },
                  { value: 'SUPPLIER OUTLET', label: 'Supplier Outlet' },
                  { value: 'SUPPLIER TOKO TEPUNG & BB', label: 'Supplier Toko Tepung & BB' },
                  { value: 'SUPPLIER PRODUKSI', label: 'Supplier Produksi' },
                  { value: 'SUPPLIER KAMBING', label: 'Supplier Kambing' }
                ]}
              />
            
                          <Select 
                value={divisiFilter} 
                onValueChange={setDivisiFilter}
                placeholder="Divisi"
                className="w-48"
                options={[
                  { value: 'all', label: 'Semua Divisi' },
                  { value: 'PRODUKSI', label: 'Produksi' },
                  { value: 'MARKETING', label: 'Marketing' },
                  { value: 'OPERASIONAL', label: 'Operasional' }
                ]}
              />
          </div>
        </CardBody>
      </Card>

      {/* Suppliers Table */}
      <Card>
        <CardHeader>
          <h2 className="text-xl font-semibold text-gray-900">Daftar Supplier</h2>
        </CardHeader>
        <CardBody>
          {suppliers.length === 0 ? (
            <div className="text-center py-12">
              <Building className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">Tidak ada data supplier</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nama Supplier</TableHead>
                    <TableHead>Kategori</TableHead>
                    <TableHead>Divisi</TableHead>
                    <TableHead>No. HP</TableHead>
                    <TableHead>Tanggal Kerjasama</TableHead>
                    <TableHead>Alamat</TableHead>
                    <TableHead>Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {suppliers.map((supplier) => (
                    <TableRow key={supplier.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium text-gray-900">{supplier.nama_supplier}</p>
                          {supplier.npwp && (
                            <p className="text-sm text-gray-500">NPWP: {supplier.npwp}</p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={getKategoriColor(supplier.kategori_supplier)}>
                          {supplier.kategori_supplier}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={getDivisiColor(supplier.divisi)}>
                          {supplier.divisi}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Phone className="h-4 w-4 text-gray-400" />
                          <span className="text-sm">{supplier.no_hp_supplier}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-gray-400" />
                          <span className="text-sm">
                            {format(new Date(supplier.tanggal_kerjasama), 'dd MMM yyyy', { locale: id })}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="max-w-xs">
                          <div className="flex items-start gap-2">
                            <MapPin className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />
                            <p className="text-sm text-gray-600 line-clamp-2">{supplier.alamat}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Button size="sm" variant="outline">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardBody>
      </Card>
    </div>
  );
};

export default DataSupplier; 