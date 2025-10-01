import React, { useState, useEffect } from 'react';
import Card, { CardHeader, CardBody } from '@/components/UI/Card';
import Button from '@/components/UI/Button';
import { Input } from '@/components/UI/Input';
import Badge from '@/components/UI/Badge';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/UI/Table';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/UI/Select';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from '@/components/UI/Dialog';
import { 
  Pagination, 
  PaginationContent, 
  PaginationItem, 
  PaginationLink, 
  PaginationNext, 
  PaginationPrevious 
} from '@/components/UI/Pagination';
import { 
  Search, 
  Filter, 
  Plus, 
  Eye, 
  Edit, 
  Trash2, 
  Download,
  Building,
  MapPin,
  Calendar,
  DollarSign
} from 'lucide-react';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';

const AdminDataAset = () => {
  const [aset, setAset] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [kategoriFilter, setKategoriFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [selectedAset, setSelectedAset] = useState(null);
  const [showDetailDialog, setShowDetailDialog] = useState(false);

  // Mock data untuk demo
  const mockAset = [
    {
      id: 1,
      nama_aset: 'Gedung Utama',
      kategori: 'bangunan',
      lokasi: 'Jl. Sudirman No. 123, Jakarta',
      luas: 2500,
      satuan_luas: 'm²',
      nilai_aset: 50000000000,
      tanggal_perolehan: '2020-01-15T00:00:00.000Z',
      status: 'aktif',
      deskripsi: 'Gedung kantor utama perusahaan',
      pemilik: 'PT Bosgil Group',
      dokumen: ['sertifikat-gedung.pdf', 'peta-lokasi.pdf']
    },
    {
      id: 2,
      nama_aset: 'Mobil Operasional',
      kategori: 'kendaraan',
      lokasi: 'Garasi Utama',
      luas: 1,
      satuan_luas: 'unit',
      nilai_aset: 250000000,
      tanggal_perolehan: '2021-06-20T00:00:00.000Z',
      status: 'aktif',
      deskripsi: 'Mobil untuk operasional tim',
      pemilik: 'PT Bosgil Group',
      dokumen: ['bpkb-mobil.pdf', 'stnk-mobil.pdf']
    },
    {
      id: 3,
      nama_aset: 'Server Production',
      kategori: 'peralatan',
      lokasi: 'Data Center Lt. 2',
      luas: 1,
      satuan_luas: 'unit',
      nilai_aset: 15000000,
      tanggal_perolehan: '2022-03-10T00:00:00.000Z',
      status: 'maintenance',
      deskripsi: 'Server untuk aplikasi production',
      pemilik: 'PT Bosgil Group',
      dokumen: ['invoice-server.pdf', 'manual-server.pdf']
    }
  ];

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setAset(mockAset);
      setTotalItems(mockAset.length);
      setTotalPages(Math.ceil(mockAset.length / 10));
      setLoading(false);
    }, 1000);
  }, []);

  const handleSearch = (value) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  const handleFilter = (type, value) => {
    switch (type) {
      case 'kategori':
        setKategoriFilter(value);
        break;
      case 'status':
        setStatusFilter(value);
        break;
      default:
        break;
    }
    setCurrentPage(1);
  };

  const handleViewDetail = (item) => {
    setSelectedAset(item);
    setShowDetailDialog(true);
  };

  const handleEdit = (id) => {
    // Navigate to edit page
    console.log('Edit aset:', id);
  };

  const handleDelete = (id) => {
    // Show confirmation dialog
    if (window.confirm('Apakah Anda yakin ingin menghapus aset ini?')) {
      console.log('Delete aset:', id);
    }
  };

  const getKategoriBadge = (kategori) => {
    const kategoriConfig = {
      bangunan: { variant: 'outline', text: 'Bangunan', icon: Building },
      kendaraan: { variant: 'outline', text: 'Kendaraan', icon: Building },
      peralatan: { variant: 'outline', text: 'Peralatan', icon: Building },
      tanah: { variant: 'outline', text: 'Tanah', icon: Building },
      lainnya: { variant: 'outline', text: 'Lainnya', icon: Building }
    };

    const config = kategoriConfig[kategori] || kategoriConfig.lainnya;
    return <Badge variant={config.variant}>{config.text}</Badge>;
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      aktif: { variant: 'default', text: 'Aktif' },
      maintenance: { variant: 'secondary', text: 'Maintenance' },
      nonaktif: { variant: 'destructive', text: 'Nonaktif' }
    };

    const config = statusConfig[status] || statusConfig.aktif;
    return <Badge variant={config.variant}>{config.text}</Badge>;
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR'
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-lg">Loading aset...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center text-red-600">
          <p className="text-lg">Error: {error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Data Aset</h1>
        <Button className="bg-blue-600 hover:bg-blue-700">
          <Plus className="w-4 h-4 mr-2" />
          Tambah Aset
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Filter & Pencarian
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Cari aset..."
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={kategoriFilter} onValueChange={(value) => handleFilter('kategori', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Kategori" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Kategori</SelectItem>
                <SelectItem value="bangunan">Bangunan</SelectItem>
                <SelectItem value="kendaraan">Kendaraan</SelectItem>
                <SelectItem value="peralatan">Peralatan</SelectItem>
                <SelectItem value="tanah">Tanah</SelectItem>
                <SelectItem value="lainnya">Lainnya</SelectItem>
              </SelectContent>
            </Select>

            <Select value={statusFilter} onValueChange={(value) => handleFilter('status', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Status</SelectItem>
                <SelectItem value="aktif">Aktif</SelectItem>
                <SelectItem value="maintenance">Maintenance</SelectItem>
                <SelectItem value="nonaktif">Nonaktif</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-blue-600">{totalItems}</div>
            <p className="text-sm text-gray-600">Total Aset</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-green-600">
              {aset.filter(a => a.status === 'aktif').length}
            </div>
            <p className="text-sm text-gray-600">Aktif</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-yellow-600">
              {aset.filter(a => a.status === 'maintenance').length}
            </div>
            <p className="text-sm text-gray-600">Maintenance</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-red-600">
              {aset.filter(a => a.status === 'nonaktif').length}
            </div>
            <p className="text-sm text-gray-600">Nonaktif</p>
          </CardContent>
        </Card>
      </Card>

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle>Daftar Aset</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nama Aset</TableHead>
                <TableHead>Kategori</TableHead>
                <TableHead>Lokasi</TableHead>
                <TableHead>Luas</TableHead>
                <TableHead>Nilai</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {aset.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">{item.nama_aset}</TableCell>
                  <TableCell>{getKategoriBadge(item.kategori)}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-gray-500" />
                      <span className="max-w-xs truncate">{item.lokasi}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    {item.luas} {item.satuan_luas}
                  </TableCell>
                  <TableCell className="font-mono">{formatCurrency(item.nilai_aset)}</TableCell>
                  <TableCell>{getStatusBadge(item.status)}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleViewDetail(item)}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(item.id)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(item.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Pagination */}
      {totalPages > 1 && (
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious 
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                className={currentPage === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
              />
            </PaginationItem>
            
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <PaginationItem key={page}>
                <PaginationLink
                  onClick={() => setCurrentPage(page)}
                  className={currentPage === page ? 'bg-blue-600 text-white' : 'cursor-pointer'}
                >
                  {page}
                </PaginationLink>
              </PaginationItem>
            ))}
            
            <PaginationItem>
              <PaginationNext 
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                className={currentPage === totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}

      {/* Detail Dialog */}
      <Dialog open={showDetailDialog} onOpenChange={setShowDetailDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Detail Aset</DialogTitle>
          </DialogHeader>
          {selectedAset && (
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-lg">{selectedAset.nama_aset}</h3>
                <p className="text-gray-600">{selectedAset.deskripsi}</p>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-500">Kategori</p>
                  <p>{getKategoriBadge(selectedAset.kategori)}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Status</p>
                  <p>{getStatusBadge(selectedAset.status)}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Luas</p>
                  <p>{selectedAset.luas} {selectedAset.satuan_luas}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Nilai Aset</p>
                  <p className="font-mono">{formatCurrency(selectedAset.nilai_aset)}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Tanggal Perolehan</p>
                  <p>{format(new Date(selectedAset.tanggal_perolehan), 'dd MMM yyyy', { locale: id })}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Pemilik</p>
                  <p>{selectedAset.pemilik}</p>
                </div>
              </div>
              
              <div>
                <p className="text-sm font-medium text-gray-500">Lokasi</p>
                <div className="flex items-center gap-2 mt-1">
                  <MapPin className="w-4 h-4 text-gray-500" />
                  <p>{selectedAset.lokasi}</p>
                </div>
              </div>
              
              {selectedAset.dokumen && selectedAset.dokumen.length > 0 && (
                <div>
                  <p className="text-sm font-medium text-gray-500">Dokumen</p>
                  <div className="space-y-2">
                    {selectedAset.dokumen.map((file, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <Download className="w-4 h-4 text-gray-500" />
                        <span className="text-sm">{file}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              <div className="flex gap-2">
                <Button onClick={() => handleEdit(selectedAset.id)}>
                  <Edit className="w-4 h-4 mr-2" />
                  Edit
                </Button>
                <Button variant="outline" onClick={() => setShowDetailDialog(false)}>
                  Tutup
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminDataAset;

