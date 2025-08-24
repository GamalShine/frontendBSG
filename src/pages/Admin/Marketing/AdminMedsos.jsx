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
  Plus, 
  Eye, 
  Edit, 
  Trash2,
  Instagram,
  Youtube,
  Music,
  DollarSign
} from 'lucide-react';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { medsosService } from '@/services/medsosService';

const AdminMedsos = () => {
  const [medsosData, setMedsosData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [platformFilter, setPlatformFilter] = useState('all');
  const [stats, setStats] = useState({});

  useEffect(() => {
    fetchMedsosData();
  }, [searchTerm, platformFilter]);

  const fetchMedsosData = async () => {
    try {
      setLoading(true);
      let params = {};
      
      if (searchTerm) {
        params.search = searchTerm;
      } else if (platformFilter !== 'all') {
        params.platform = platformFilter;
      }

      const response = await medsosService.getAll(params);
      setMedsosData(response.data);
      setStats(response.stats);
    } catch (err) {
      setError('Gagal memuat data medsos');
      console.error('Error fetching medsos data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Apakah Anda yakin ingin menghapus data medsos ini?')) {
      try {
        await medsosService.delete(id);
        fetchMedsosData(); // Refresh data
      } catch (err) {
        alert('Gagal menghapus data medsos');
        console.error('Error deleting medsos:', err);
      }
    }
  };

  const getPlatformIcon = (platform) => {
    switch (platform) {
      case 'TIKTOK':
        return <Music className="h-4 w-4 text-black" />;
      case 'INSTAGRAM':
        return <Instagram className="h-4 w-4 text-pink-600" />;
      case 'YOUTUBE':
        return <Youtube className="h-4 w-4 text-red-600" />;
      default:
        return <Music className="h-4 w-4 text-gray-400" />;
    }
  };

  const getPlatformColor = (platform) => {
    const colors = {
      'TIKTOK': 'bg-black text-white',
      'INSTAGRAM': 'bg-gradient-to-r from-pink-500 to-purple-500 text-white',
      'YOUTUBE': 'bg-red-600 text-white'
    };
    return colors[platform] || 'bg-gray-100 text-gray-800';
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount || 0);
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Memuat data medsos...</p>
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
            onClick={fetchMedsosData} 
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
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Data Medsos</h1>
        <p className="text-gray-600">Kelola biaya platform media sosial</p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <Card>
          <CardBody className="p-4">
            <div className="flex items-center">
              <DollarSign className="h-8 w-8 text-green-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">Total Biaya</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatCurrency(stats.total_biaya || 0)}
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
                <p className="text-sm font-medium text-gray-600">TikTok</p>
                <p className="text-2xl font-bold text-gray-900">{stats.tiktok_count || 0}</p>
              </div>
            </div>
          </CardBody>
        </Card>
        
        <Card>
          <CardBody className="p-4">
            <div className="flex items-center">
              <Instagram className="h-8 w-8 text-pink-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">Instagram</p>
                <p className="text-2xl font-bold text-gray-900">{stats.instagram_count || 0}</p>
              </div>
            </div>
          </CardBody>
        </Card>
        
        <Card>
          <CardBody className="p-4">
            <div className="flex items-center">
              <Youtube className="h-8 w-8 text-red-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">YouTube</p>
                <p className="text-2xl font-bold text-gray-900">{stats.youtube_count || 0}</p>
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
                  placeholder="Cari platform..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <Select 
                value={platformFilter} 
                onValueChange={setPlatformFilter}
                placeholder="Filter Platform"
                className="w-48"
                options={[
                  { value: 'all', label: 'Semua Platform' },
                  { value: 'TIKTOK', label: 'TikTok' },
                  { value: 'INSTAGRAM', label: 'Instagram' },
                  { value: 'YOUTUBE', label: 'YouTube' }
                ]}
              />
            </div>
            
            <Link to="/admin/marketing/medsos/form">
              <Button className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Tambah Platform
              </Button>
            </Link>
          </div>
        </CardBody>
      </Card>

      {/* Medsos Data Table */}
      <Card>
        <CardHeader>
          <h2 className="text-xl font-semibold text-gray-900">Daftar Platform Medsos</h2>
        </CardHeader>
        <CardBody>
          {medsosData.length === 0 ? (
            <div className="text-center py-12">
              <Music className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">Tidak ada data platform medsos</p>
              <p className="text-gray-400">Mulai dengan menambahkan platform baru</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Platform</TableHead>
                    <TableHead>Biaya</TableHead>
                    <TableHead>Tanggal Dibuat</TableHead>
                    <TableHead>Terakhir Update</TableHead>
                    <TableHead>Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {medsosData.map((medsos) => (
                    <TableRow key={medsos.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          {getPlatformIcon(medsos.platform)}
                          <Badge className={getPlatformColor(medsos.platform)}>
                            {medsos.platform}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="font-medium text-gray-900">
                          {formatCurrency(medsos.biaya)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm text-gray-600">
                          {medsos.created_at ? format(new Date(medsos.created_at), 'dd MMM yyyy', { locale: id }) : '-'}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm text-gray-600">
                          {medsos.updated_at ? format(new Date(medsos.updated_at), 'dd MMM yyyy', { locale: id }) : '-'}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Link to={`/admin/marketing/medsos/detail/${medsos.id}`}>
                            <Button size="sm" variant="outline">
                              <Eye className="h-4 w-4" />
                            </Button>
                          </Link>
                          <Link to={`/admin/marketing/medsos/edit/${medsos.id}`}>
                            <Button size="sm" variant="outline">
                              <Edit className="h-4 w-4" />
                            </Button>
                          </Link>
                          <Button 
                            size="sm" 
                            variant="outline" 
                            onClick={() => handleDelete(medsos.id)}
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

export default AdminMedsos;





