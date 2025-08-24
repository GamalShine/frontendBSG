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
import { 
  Search, 
  Plus, 
  Eye, 
  Edit, 
  Trash2,
  Instagram,
  Music,
  DollarSign,
  Users
} from 'lucide-react';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { dataTargetService } from '@/services/dataTargetService';

const AdminDataTarget = () => {
  const [dataTarget, setDataTarget] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [stats, setStats] = useState({});

  useEffect(() => {
    fetchDataTarget();
  }, [searchTerm]);

  const fetchDataTarget = async () => {
    try {
      setLoading(true);
      let params = {};
      
      if (searchTerm) {
        params.search = searchTerm;
      }

      const response = await dataTargetService.getAll(params);
      setDataTarget(response.data);
      setStats(response.stats);
    } catch (err) {
      setError('Gagal memuat data target');
      console.error('Error fetching data target:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Apakah Anda yakin ingin menghapus data target ini?')) {
      try {
        await dataTargetService.delete(id);
        fetchDataTarget(); // Refresh data
      } catch (err) {
        alert('Gagal menghapus data target');
        console.error('Error deleting data target:', err);
      }
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount || 0);
  };

  const formatNumber = (num) => {
    return new Intl.NumberFormat('id-ID').format(num || 0);
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Memuat data target...</p>
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
            onClick={fetchDataTarget} 
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
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Data Target</h1>
        <p className="text-gray-600">Kelola data target marketing dan influencer</p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <Card>
          <CardBody className="p-4">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-blue-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">Total Akun</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.total_akun || 0}
                </p>
              </div>
            </div>
          </CardBody>
        </Card>
        
        <Card>
          <CardBody className="p-4">
            <div className="flex items-center">
              <Instagram className="h-8 w-8 text-pink-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">Total Follower IG</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatNumber(stats.total_follower_ig || 0)}
                </p>
              </div>
            </div>
          </CardBody>
        </Card>
        
        <Card>
          <CardBody className="p-4">
            <div className="flex items-center">
              <Music className="h-8 w-8 text-black" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">Total Follower TikTok</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatNumber(stats.total_follower_tiktok || 0)}
                </p>
              </div>
            </div>
          </CardBody>
        </Card>
        
        <Card>
          <CardBody className="p-4">
            <div className="flex items-center">
              <DollarSign className="h-8 w-8 text-green-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">Total Rate Card</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatCurrency(stats.total_ratecard || 0)}
                </p>
              </div>
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Filters and Actions */}
      <Card className="mb-6">
        <CardBody className="p-6">
          <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
            <div className="flex flex-col sm:flex-row gap-4 flex-1">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Cari nama akun..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <Link to="/admin/marketing/target/form">
              <Button className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Tambah Target
              </Button>
            </Link>
          </div>
        </CardBody>
      </Card>

      {/* Data Target Table */}
      <Card>
        <CardHeader>
          <h2 className="text-xl font-semibold text-gray-900">Daftar Data Target</h2>
        </CardHeader>
        <CardBody>
          {dataTarget.length === 0 ? (
            <div className="text-center py-12">
              <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">Tidak ada data target</p>
              <p className="text-gray-400">Mulai dengan menambahkan target baru</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nama Akun</TableHead>
                    <TableHead>Follower Instagram</TableHead>
                    <TableHead>Follower TikTok</TableHead>
                    <TableHead>Rate Card</TableHead>
                    <TableHead>Tanggal Dibuat</TableHead>
                    <TableHead>Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {dataTarget.map((target) => (
                    <TableRow key={target.id}>
                      <TableCell>
                        <div className="font-medium text-gray-900">
                          {target.nama_akun}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Instagram className="h-4 w-4 text-pink-600" />
                          <span className="font-medium text-gray-900">
                            {formatNumber(target.follower_ig)}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Music className="h-4 w-4 text-black" />
                          <span className="font-medium text-gray-900">
                            {formatNumber(target.follower_tiktok)}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="font-medium text-gray-900">
                          {formatCurrency(target.ratecard)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm text-gray-600">
                          {target.created_at ? format(new Date(target.created_at), 'dd MMM yyyy', { locale: id }) : '-'}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Link to={`/admin/marketing/target/detail/${target.id}`}>
                            <Button size="sm" variant="outline">
                              <Eye className="h-4 w-4" />
                            </Button>
                          </Link>
                          <Link to={`/admin/marketing/target/edit/${target.id}`}>
                            <Button size="sm" variant="outline">
                              <Edit className="h-4 w-4" />
                            </Button>
                          </Link>
                          <Button 
                            size="sm" 
                            variant="outline" 
                            onClick={() => handleDelete(target.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
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

export default AdminDataTarget;
