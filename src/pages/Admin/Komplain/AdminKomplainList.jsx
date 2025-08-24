import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Card, { CardHeader, CardBody } from '@/components/UI/Card';
import Button from '@/components/UI/Button';
import Input from '@/components/UI/Input';
import Badge from '@/components/UI/Badge';
import Table, { 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/UI/Table';
import Select, { 
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
  Download 
} from 'lucide-react';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';

const AdminKomplainList = () => {
  const navigate = useNavigate();
  const [komplain, setKomplain] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [kategoriFilter, setKategoriFilter] = useState('all');
  const [prioritasFilter, setPrioritasFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [selectedKomplain, setSelectedKomplain] = useState(null);
  const [showDetailDialog, setShowDetailDialog] = useState(false);

  // Mock data untuk demo
  const mockKomplain = [
    {
      id: 1,
      judul_komplain: 'Sistem Login Bermasalah',
      deskripsi_komplain: 'Tidak bisa login ke sistem dengan kredensial yang benar',
      kategori: 'sistem',
      prioritas: 'mendesak',
      status: 'menunggu',
      pelapor: { nama: 'John Doe', email: 'john@example.com' },
      tanggal_pelaporan: '2024-01-15T10:30:00.000Z',
      target_selesai: '2024-01-20T17:00:00.000Z'
    },
    {
      id: 2,
      judul_komplain: 'Laporan Tidak Tersimpan',
      deskripsi_komplain: 'Data laporan hilang setelah submit',
      kategori: 'layanan',
      prioritas: 'penting',
      status: 'diproses',
      pelapor: { nama: 'Jane Smith', email: 'jane@example.com' },
      tanggal_pelaporan: '2024-01-14T14:20:00.000Z',
      target_selesai: '2024-01-18T17:00:00.000Z'
    },
    {
      id: 3,
      judul_komplain: 'Upload File Gagal',
      deskripsi_komplain: 'Error saat upload file PDF',
      kategori: 'sistem',
      prioritas: 'berproses',
      status: 'selesai',
      pelapor: { nama: 'Bob Johnson', email: 'bob@example.com' },
      tanggal_pelaporan: '2024-01-13T09:15:00.000Z',
      target_selesai: '2024-01-16T17:00:00.000Z'
    }
  ];

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setKomplain(mockKomplain);
      setTotalItems(mockKomplain.length);
      setTotalPages(Math.ceil(mockKomplain.length / 10));
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
      case 'prioritas':
        setPrioritasFilter(value);
        break;
      default:
        break;
    }
    setCurrentPage(1);
  };

  const handleViewDetail = (item) => {
    setSelectedKomplain(item);
    setShowDetailDialog(true);
  };

  const handleEdit = (id) => {
    // Navigate to edit page
    navigate(`/admin/komplain/${id}/edit`);
  };

  const handleDelete = (id) => {
    // Show confirmation dialog
    if (window.confirm('Apakah Anda yakin ingin menghapus komplain ini?')) {
      console.log('Delete komplain:', id);
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      menunggu: { variant: 'secondary', text: 'Menunggu' },
      diproses: { variant: 'default', text: 'Diproses' },
      selesai: { variant: 'default', text: 'Selesai' },
      ditolak: { variant: 'destructive', text: 'Ditolak' }
    };

    const config = statusConfig[status] || statusConfig.menunggu;
    return <Badge variant={config.variant}>{config.text}</Badge>;
  };

  const getPrioritasBadge = (prioritas) => {
    const prioritasConfig = {
      mendesak: { variant: 'destructive', text: 'Mendesak' },
      penting: { variant: 'default', text: 'Penting' },
      berproses: { variant: 'secondary', text: 'Berproses' }
    };

    const config = prioritasConfig[prioritas] || prioritasConfig.berproses;
    return <Badge variant={config.variant}>{config.text}</Badge>;
  };

  const getKategoriBadge = (kategori) => {
    const kategoriConfig = {
      sistem: { variant: 'outline', text: 'Sistem' },
      layanan: { variant: 'outline', text: 'Layanan' },
      produk: { variant: 'outline', text: 'Produk' },
      lainnya: { variant: 'outline', text: 'Lainnya' }
    };

    const config = kategoriConfig[kategori] || kategoriConfig.lainnya;
    return <Badge variant={config.variant}>{config.text}</Badge>;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-lg">Loading komplain...</p>
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
        <h1 className="text-3xl font-bold text-gray-900">Daftar Komplain</h1>
        <Button 
          className="bg-blue-600 hover:bg-blue-700"
          onClick={() => navigate('/admin/komplain/new')}
        >
          <Plus className="w-4 h-4 mr-2" />
          Tambah Komplain
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Filter & Pencarian
          </div>
        </CardHeader>
        <CardBody className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Cari komplain..."
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
                <SelectItem value="menunggu">Menunggu</SelectItem>
                <SelectItem value="diproses">Diproses</SelectItem>
                <SelectItem value="selesai">Selesai</SelectItem>
                <SelectItem value="ditolak">Ditolak</SelectItem>
              </SelectContent>
            </Select>

            <Select value={kategoriFilter} onValueChange={(value) => handleFilter('kategori', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Kategori" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Kategori</SelectItem>
                <SelectItem value="sistem">Sistem</SelectItem>
                <SelectItem value="layanan">Layanan</SelectItem>
                <SelectItem value="produk">Produk</SelectItem>
                <SelectItem value="lainnya">Lainnya</SelectItem>
              </SelectContent>
            </Select>

            <Select value={prioritasFilter} onValueChange={(value) => handleFilter('prioritas', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Prioritas" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Prioritas</SelectItem>
                <SelectItem value="mendesak">Mendesak</SelectItem>
                <SelectItem value="penting">Penting</SelectItem>
                <SelectItem value="berproses">Berproses</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardBody>
      </Card>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardBody className="p-4">
            <div className="text-2xl font-bold text-blue-600">{totalItems}</div>
            <p className="text-sm text-gray-600">Total Komplain</p>
          </CardBody>
        </Card>
        <Card>
          <CardBody className="p-4">
            <div className="text-2xl font-bold text-yellow-600">
              {komplain.filter(k => k.status === 'menunggu').length}
            </div>
            <p className="text-sm text-gray-600">Menunggu</p>
          </CardBody>
        </Card>
        <Card>
          <CardBody className="p-4">
            <div className="text-2xl font-bold text-orange-600">
              {komplain.filter(k => k.status === 'diproses').length}
            </div>
            <p className="text-sm text-gray-600">Diproses</p>
          </CardBody>
        </Card>
        <Card>
          <CardBody className="p-4">
            <div className="text-2xl font-bold text-green-600">
              {komplain.filter(k => k.status === 'selesai').length}
            </div>
            <p className="text-sm text-gray-600">Selesai</p>
          </CardBody>
        </Card>
      </div>

      {/* Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-bold text-gray-900">Daftar Komplain</h2>
          </div>
        </CardHeader>
        <CardBody>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Judul</TableHead>
                <TableHead>Pelapor</TableHead>
                <TableHead>Kategori</TableHead>
                <TableHead>Prioritas</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Tanggal</TableHead>
                <TableHead>Target Selesai</TableHead>
                <TableHead>Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {komplain.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">{item.judul_komplain}</TableCell>
                  <TableCell>
                    <div>
                      <p className="font-medium">{item.pelapor.nama}</p>
                      <p className="text-sm text-gray-500">{item.pelapor.email}</p>
                    </div>
                  </TableCell>
                  <TableCell>{getKategoriBadge(item.kategori)}</TableCell>
                  <TableCell>{getPrioritasBadge(item.prioritas)}</TableCell>
                  <TableCell>{getStatusBadge(item.status)}</TableCell>
                  <TableCell>
                    {format(new Date(item.tanggal_pelaporan), 'dd MMM yyyy', { locale: id })}
                  </TableCell>
                  <TableCell>
                    {item.target_selesai ? 
                      format(new Date(item.target_selesai), 'dd MMM yyyy', { locale: id }) : 
                      '-'
                    }
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
        </CardBody>
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
            <DialogTitle>Detail Komplain</DialogTitle>
          </DialogHeader>
          {selectedKomplain && (
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-lg">{selectedKomplain.judul_komplain}</h3>
                <p className="text-gray-600">{selectedKomplain.deskripsi_komplain}</p>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-500">Kategori</p>
                  <p>{getKategoriBadge(selectedKomplain.kategori)}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Prioritas</p>
                  <p>{getPrioritasBadge(selectedKomplain.prioritas)}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Status</p>
                  <p>{getStatusBadge(selectedKomplain.status)}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Pelapor</p>
                  <p>{selectedKomplain.pelapor.nama}</p>
                  <p className="text-sm text-gray-500">{selectedKomplain.pelapor.email}</p>
                </div>
              </div>
              
              <div className="flex gap-2">
                <Button onClick={() => {
                  handleEdit(selectedKomplain.id);
                  setShowDetailDialog(false);
                }}>
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

export default AdminKomplainList;

