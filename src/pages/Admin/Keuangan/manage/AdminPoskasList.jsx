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
  DollarSign,
  Calendar,
  User
} from 'lucide-react';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';

const AdminPoskasList = () => {
  const [poskas, setPoskas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [kategoriFilter, setKategoriFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [selectedPoskas, setSelectedPoskas] = useState(null);
  const [showDetailDialog, setShowDetailDialog] = useState(false);

  // Mock data untuk demo
  const mockPoskas = [
    {
      id: 1,
      judul: 'Pembelian Laptop untuk Tim IT',
      deskripsi: 'Laptop untuk development dan maintenance sistem',
      kategori: 'peralatan',
      jumlah: 15000000,
      tanggal: '2024-01-15T10:30:00.000Z',
      status: 'pending',
      catatan: 'Dibutuhkan untuk project baru',
      creator: { nama: 'John Doe', username: 'johndoe', role: 'admin' },
      lampiran: ['quotation-laptop.pdf', 'spec-laptop.pdf']
    },
    {
      id: 2,
      judul: 'Biaya Training SDM',
      deskripsi: 'Pelatihan soft skill dan technical skill',
      kategori: 'pelatihan',
      jumlah: 5000000,
      tanggal: '2024-01-14T14:20:00.000Z',
      status: 'approved',
      catatan: 'Training untuk 20 karyawan',
      creator: { nama: 'Jane Smith', username: 'janesmith', role: 'admin' },
      lampiran: ['training-proposal.pdf']
    },
    {
      id: 3,
      judul: 'Maintenance Server',
      deskripsi: 'Upgrade dan maintenance server production',
      kategori: 'maintenance',
      jumlah: 8000000,
      tanggal: '2024-01-13T09:15:00.000Z',
      status: 'rejected',
      catatan: 'Ditolak karena budget tidak mencukupi',
      creator: { nama: 'Bob Johnson', username: 'bobjohnson', role: 'admin' },
      lampiran: ['server-quote.pdf', 'maintenance-plan.pdf']
    }
  ];

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setPoskas(mockPoskas);
      setTotalItems(mockPoskas.length);
      setTotalPages(Math.ceil(mockPoskas.length / 10));
      setLoading(false);
    }, 1000);
  }, []);

  const handleSearch = (value) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  const handleFilter = (type, value) => {
    switch (type) {
      case 'status':
        setStatusFilter(value);
        break;
      case 'kategori':
        setKategoriFilter(value);
        break;
      default:
        break;
    }
    setCurrentPage(1);
  };

  const handleViewDetail = (item) => {
    setSelectedPoskas(item);
    setShowDetailDialog(true);
  };

  const handleEdit = (id) => {
    // Navigate to edit page
    console.log('Edit poskas:', id);
  };

  const handleDelete = (id) => {
    // Show confirmation dialog
    if (window.confirm('Apakah Anda yakin ingin menghapus poskas ini?')) {
      console.log('Delete poskas:', id);
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { variant: 'secondary', text: 'Pending' },
      approved: { variant: 'default', text: 'Approved' },
      rejected: { variant: 'destructive', text: 'Rejected' }
    };

    const config = statusConfig[status] || statusConfig.pending;
    return <Badge variant={config.variant}>{config.text}</Badge>;
  };

  const getKategoriBadge = (kategori) => {
    const kategoriConfig = {
      peralatan: { variant: 'outline', text: 'Peralatan' },
      pelatihan: { variant: 'outline', text: 'Pelatihan' },
      maintenance: { variant: 'outline', text: 'Maintenance' },
      operasional: { variant: 'outline', text: 'Operasional' },
      lainnya: { variant: 'outline', text: 'Lainnya' }
    };

    const config = kategoriConfig[kategori] || kategoriConfig.lainnya;
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
          <p className="mt-4 text-lg">Loading poskas...</p>
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
        <h1 className="text-3xl font-bold text-gray-900">Daftar Poskas</h1>
        <Button className="bg-blue-600 hover:bg-blue-700">
          <Plus className="w-4 h-4 mr-2" />
          Tambah Poskas
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
                placeholder="Cari poskas..."
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={statusFilter} onValueChange={(value) => handleFilter('status', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>

            <Select value={kategoriFilter} onValueChange={(value) => handleFilter('kategori', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Kategori" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Kategori</SelectItem>
                <SelectItem value="peralatan">Peralatan</SelectItem>
                <SelectItem value="pelatihan">Pelatihan</SelectItem>
                <SelectItem value="maintenance">Maintenance</SelectItem>
                <SelectItem value="operasional">Operasional</SelectItem>
                <SelectItem value="lainnya">Lainnya</SelectItem>
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
            <p className="text-sm text-gray-600">Total Poskas</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-yellow-600">
              {poskas.filter(p => p.status === 'pending').length}
            </div>
            <p className="text-sm text-gray-600">Pending</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-green-600">
              {poskas.filter(p => p.status === 'approved').length}
            </div>
            <p className="text-sm text-gray-600">Approved</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-red-600">
              {poskas.filter(p => p.status === 'rejected').length}
            </div>
            <p className="text-sm text-gray-600">Rejected</p>
          </CardContent>
        </Card>
      </Card>

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle>Daftar Poskas</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Judul</TableHead>
                <TableHead>Kategori</TableHead>
                <TableHead>Jumlah</TableHead>
                <TableHead>Tanggal</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Creator</TableHead>
                <TableHead>Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {poskas.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">{item.judul}</TableCell>
                  <TableCell>{getKategoriBadge(item.kategori)}</TableCell>
                  <TableCell className="font-mono">{formatCurrency(item.jumlah)}</TableCell>
                  <TableCell>
                    {format(new Date(item.tanggal), 'dd MMM yyyy', { locale: id })}
                  </TableCell>
                  <TableCell>{getStatusBadge(item.status)}</TableCell>
                  <TableCell>
                    <div>
                      <p className="font-medium">{item.creator.nama}</p>
                      <p className="text-sm text-gray-500">@{item.creator.username}</p>
                    </div>
                  </TableCell>
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
            <DialogTitle>Detail Poskas</DialogTitle>
          </DialogHeader>
          {selectedPoskas && (
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-lg">{selectedPoskas.judul}</h3>
                <p className="text-gray-600">{selectedPoskas.deskripsi}</p>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-500">Kategori</p>
                  <p>{getKategoriBadge(selectedPoskas.kategori)}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Jumlah</p>
                  <p className="font-mono">{formatCurrency(selectedPoskas.jumlah)}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Status</p>
                  <p>{getStatusBadge(selectedPoskas.status)}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Tanggal</p>
                  <p>{format(new Date(selectedPoskas.tanggal), 'dd MMM yyyy', { locale: id })}</p>
                </div>
              </div>
              
              {selectedPoskas.catatan && (
                <div>
                  <p className="text-sm font-medium text-gray-500">Catatan</p>
                  <p className="text-sm">{selectedPoskas.catatan}</p>
                </div>
              )}
              
              {selectedPoskas.lampiran && selectedPoskas.lampiran.length > 0 && (
                <div>
                  <p className="text-sm font-medium text-gray-500">Lampiran</p>
                  <div className="space-y-2">
                    {selectedPoskas.lampiran.map((file, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <Download className="w-4 h-4 text-gray-500" />
                        <span className="text-sm">{file}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              <div className="flex gap-2">
                <Button onClick={() => handleEdit(selectedPoskas.id)}>
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

export default AdminPoskasList;

