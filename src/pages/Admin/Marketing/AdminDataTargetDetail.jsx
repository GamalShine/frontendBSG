import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import Card, { CardHeader, CardBody } from '@/components/UI/Card';
import Button from '@/components/UI/Button';
import Badge from '@/components/UI/Badge';
import { 
  ArrowLeft, 
  Edit, 
  Trash2, 
  Users, 
  DollarSign,
  User
} from 'lucide-react';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { dataTargetService } from '@/services/dataTargetService';

const AdminDataTargetDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [dataTarget, setDataTarget] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDataTarget();
  }, [id]);

  const fetchDataTarget = async () => {
    try {
      setLoading(true);
      const response = await dataTargetService.getById(id);
      setDataTarget(response.data);
    } catch (err) {
      setError('Gagal memuat data target');
      console.error('Error fetching data target:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Apakah Anda yakin ingin menghapus data target ini?')) {
      try {
        await dataTargetService.delete(id);
        alert('Data target berhasil dihapus');
        navigate('/admin/marketing/target');
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

  if (error || !dataTarget) {
    return (
      <div className="container mx-auto p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">{error || 'Data target tidak ditemukan'}</p>
          <Button 
            onClick={() => navigate('/admin/marketing/target')} 
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
          <Link to="/admin/marketing/target">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Kembali
            </Button>
          </Link>
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-gray-900">Detail Data Target</h1>
            <p className="text-gray-600">Informasi lengkap data target pemasaran</p>
          </div>
          <div className="flex items-center gap-2">
            <Link to={`/admin/marketing/target/edit/${dataTarget.id}`}>
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
          {/* Target Information */}
          <Card>
            <CardHeader>
              <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                <Users className="h-5 w-5 text-blue-600" />
                Informasi Target
              </h2>
            </CardHeader>
            <CardBody className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Nama Target</label>
                  <div className="text-lg font-semibold text-gray-900">
                    {dataTarget.nama_target}
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Target Nominal</label>
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-5 w-5 text-green-600" />
                    <span className="text-2xl font-bold text-gray-900">
                      {formatCurrency(dataTarget.target_nominal)}
                    </span>
                  </div>
                </div>
              </div>
            </CardBody>
          </Card>
        </div>

        {/* Sidebar Information */}
        <div className="space-y-6">
          {/* Status */}
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
                  {dataTarget.created_at ? format(new Date(dataTarget.created_at), 'dd MMM yyyy', { locale: id }) : '-'}
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">Terakhir Update</span>
                <span className="text-sm text-gray-900">
                  {dataTarget.updated_at ? format(new Date(dataTarget.updated_at), 'dd MMM yyyy', { locale: id }) : '-'}
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
              <Link to={`/admin/marketing/target/edit/${dataTarget.id}`} className="w-full">
                <Button variant="outline" className="w-full justify-center">
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Target
                </Button>
              </Link>
              
              <Button 
                variant="outline" 
                onClick={handleDelete}
                className="w-full justify-center text-red-600 hover:text-red-700"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Hapus Target
              </Button>
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AdminDataTargetDetail;
