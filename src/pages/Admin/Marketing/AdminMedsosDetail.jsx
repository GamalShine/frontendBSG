import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import Card, { CardHeader, CardBody } from '@/components/UI/Card';
import Button from '@/components/UI/Button';
import Badge from '@/components/UI/Badge';
import { 
  ArrowLeft, 
  Edit, 
  Trash2, 
  Music, 
  Instagram, 
  Youtube,
  DollarSign,
  Calendar,
  User
} from 'lucide-react';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { medsosService } from '@/services/medsosService';

const AdminMedsosDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [medsosData, setMedsosData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchMedsosData();
  }, [id]);

  const fetchMedsosData = async () => {
    try {
      setLoading(true);
      const response = await medsosService.getById(id);
      setMedsosData(response.data);
    } catch (err) {
      setError('Gagal memuat data medsos');
      console.error('Error fetching medsos:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Apakah Anda yakin ingin menghapus platform medsos ini?')) {
      try {
        await medsosService.delete(id);
        alert('Platform medsos berhasil dihapus');
        navigate('/admin/marketing/medsos');
      } catch (err) {
        alert('Gagal menghapus platform medsos');
        console.error('Error deleting medsos:', err);
      }
    }
  };

  const getPlatformIcon = (platform) => {
    switch (platform) {
      case 'TIKTOK':
        return <Music className="h-8 w-8 text-black" />;
      case 'INSTAGRAM':
        return <Instagram className="h-8 w-8 text-pink-600" />;
      case 'YOUTUBE':
        return <Youtube className="h-8 w-8 text-red-600" />;
      default:
        return <Music className="h-8 w-8 text-gray-400" />;
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

  if (error || !medsosData) {
    return (
      <div className="container mx-auto p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">{error || 'Data medsos tidak ditemukan'}</p>
          <Button 
            onClick={() => navigate('/admin/marketing/medsos')} 
            className="mt-2"
            variant="outline"
          >
            Kembali ke Daftar
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <div className="flex items-center gap-4 mb-4">
          <Link to="/admin/marketing/medsos">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Kembali
            </Button>
          </Link>
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-gray-900">Detail Platform Medsos</h1>
            <p className="text-gray-600">Informasi lengkap platform media sosial</p>
          </div>
          <div className="flex items-center gap-2">
            <Link to={`/admin/marketing/medsos/edit/${medsosData.id}`}>
              <Button variant="outline" className="flex items-center gap-2">
                <Edit className="h-4 w-4" />
                Edit
              </Button>
            </Link>
            <Button 
              variant="outline" 
              onClick={handleDelete}
              className="text-red-600 hover:text-red-700 flex items-center gap-2"
            >
              <Trash2 className="h-4 w-4" />
              Hapus
            </Button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Information */}
        <div className="lg:col-span-2 space-y-6">
          {/* Platform Information */}
          <Card>
            <CardHeader>
              <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                {getPlatformIcon(medsosData.platform)}
                Informasi Platform
              </h2>
            </CardHeader>
            <CardBody className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Platform</label>
                  <Badge className={getPlatformColor(medsosData.platform)}>
                    {medsosData.platform}
                  </Badge>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Biaya</label>
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-5 w-5 text-green-600" />
                    <span className="text-2xl font-bold text-gray-900">
                      {formatCurrency(medsosData.biaya)}
                    </span>
                  </div>
                </div>
              </div>
            </CardBody>
          </Card>

          {/* Additional Information */}
          <Card>
            <CardHeader>
              <h2 className="text-xl font-semibold text-gray-900">Informasi Tambahan</h2>
            </CardHeader>
            <CardBody className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Dibuat Oleh</label>
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-gray-400" />
                    <span className="text-gray-900">User ID: {medsosData.created_by || '-'}</span>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Status</label>
                  <Badge className="bg-green-100 text-green-800">Aktif</Badge>
                </div>
              </div>
            </CardBody>
          </Card>
        </div>

        {/* Sidebar Information */}
        <div className="space-y-6">
          {/* Quick Stats */}
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold text-gray-900">Status</h3>
            </CardHeader>
            <CardBody className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">Status Aktif</span>
                <Badge className="bg-green-100 text-green-800">Aktif</Badge>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">Dibuat</span>
                <span className="text-sm text-gray-900">
                  {medsosData.created_at ? format(new Date(medsosData.created_at), 'dd MMM yyyy', { locale: id }) : '-'}
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">Terakhir Update</span>
                <span className="text-sm text-gray-900">
                  {medsosData.updated_at ? format(new Date(medsosData.updated_at), 'dd MMM yyyy', { locale: id }) : '-'}
                </span>
              </div>
            </CardBody>
          </Card>

          {/* Actions */}
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold text-gray-900">Aksi</h3>
            </CardHeader>
            <CardBody className="space-y-3">
              <Link to={`/admin/marketing/medsos/edit/${medsosData.id}`} className="w-full">
                <Button variant="outline" className="w-full justify-center">
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Platform
                </Button>
              </Link>
              
              <Button 
                variant="outline" 
                onClick={handleDelete}
                className="w-full justify-center text-red-600 hover:text-red-700"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Hapus Platform
              </Button>
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AdminMedsosDetail;





