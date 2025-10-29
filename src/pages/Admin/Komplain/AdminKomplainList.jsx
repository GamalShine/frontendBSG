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
    navigate(`/admin/operasional/komplain/${id}/edit`);
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
          onClick={() => navigate('/admin/operasional/komplain/new')}
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

      {/* List as Table */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="px-4 py-3 border-b">
          <h2 className="text-2xl font-bold text-gray-900">Daftar Komplain</h2>
        </div>
        <div className="relative overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="pl-4 sm:pl-6 pr-2 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">No</th>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Judul</th>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Kategori</th>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Prioritas</th>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Status</th>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Pelapor</th>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Tgl Lapor</th>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Target Selesai</th>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Aksi</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              {komplain.map((item, idx) => (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="pl-4 sm:pl-6 pr-2 py-3 text-sm text-gray-900">{idx + 1 + (currentPage - 1) * 10}</td>
                  <td className="px-3 py-3 text-sm font-medium text-gray-900 max-w-[18rem] truncate" title={item.judul_komplain}>{item.judul_komplain}</td>
                  <td className="px-3 py-3 text-sm">{getKategoriBadge(item.kategori)}</td>
                  <td className="px-3 py-3 text-sm">{getPrioritasBadge(item.prioritas)}</td>
                  <td className="px-3 py-3 text-sm">{getStatusBadge(item.status)}</td>
                  <td className="px-3 py-3 text-sm text-gray-700">
                    <div className="truncate max-w-[14rem]" title={`${item.pelapor.nama} • ${item.pelapor.email}`}>
                      {item.pelapor.nama} <span className="text-gray-400">•</span> {item.pelapor.email}
                    </div>
                  </td>
                  <td className="px-3 py-3 text-sm text-gray-700">{format(new Date(item.tanggal_pelaporan), 'dd MMM yyyy', { locale: id })}</td>
                  <td className="px-3 py-3 text-sm text-gray-700">{item.target_selesai ? format(new Date(item.target_selesai), 'dd MMM yyyy', { locale: id }) : '-'}</td>
                  <td className="px-3 py-3 text-sm">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        title="Lihat"
                        onClick={() => handleViewDetail(item)}
                        className="p-2 rounded hover:bg-gray-100 text-gray-700"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        title="Edit"
                        onClick={() => handleEdit(item.id)}
                        className="p-2 rounded hover:bg-gray-100 text-amber-600"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        title="Hapus"
                        onClick={() => handleDelete(item.id)}
                        className="p-2 rounded hover:bg-gray-100 text-red-600"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

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

