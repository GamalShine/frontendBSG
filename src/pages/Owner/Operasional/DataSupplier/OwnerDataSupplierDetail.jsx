import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import Card, { CardHeader, CardBody } from '@/components/UI/Card';
import Button from '@/components/UI/Button';
import Badge from '@/components/UI/Badge';
import { 
  ArrowLeft, 
  Edit, 
  Trash2, 
  Building, 
  MapPin, 
  Calendar, 
  Phone, 
  FileText,
  User,
  Tag,
  Briefcase
} from 'lucide-react';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { dataSupplierService } from '@/services/dataSupplierService';

const OwnerDataSupplierDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [supplier, setSupplier] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchSupplier();
  }, [id]);

  const fetchSupplier = async () => {
    try {
      setLoading(true);
      const response = await dataSupplierService.getById(id);
      setSupplier(response.data);
    } catch (err) {
      setError('Gagal memuat data supplier');
      console.error('Error fetching supplier:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Apakah Anda yakin ingin menghapus supplier ini?')) {
      try {
        await dataSupplierService.delete(id);
        alert('Supplier berhasil dihapus');
        navigate('/owner/operasional/data-supplier');
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

  if (error || !supplier) {
    return (
      <div className="container mx-auto p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">{error || 'Supplier tidak ditemukan'}</p>
          <Button 
            onClick={() => navigate('/owner/operasional/data-supplier')} 
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
          <Link to="/owner/operasional/data-supplier">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Kembali
            </Button>
          </Link>
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-gray-900">Detail Supplier</h1>
            <p className="text-gray-600">Informasi lengkap supplier</p>
          </div>
          <div className="flex items-center gap-2">
            <Link to={`/owner/operasional/data-supplier/edit/${supplier.id}`}>
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
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                <Building className="h-5 w-5 text-blue-600" />
                Informasi Dasar
              </h2>
            </CardHeader>
            <CardBody className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Nama Supplier</label>
                  <p className="text-lg font-medium text-gray-900">{supplier.nama_supplier}</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Kategori</label>
                  <Badge className={getKategoriColor(supplier.kategori_supplier)}>
                    {supplier.kategori_supplier}
                  </Badge>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Divisi</label>
                  <Badge className={getDivisiColor(supplier.divisi)}>
                    {supplier.divisi}
                  </Badge>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Tanggal Kerjasama</label>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-gray-400" />
                    <span className="text-lg text-gray-900">
                      {format(new Date(supplier.tanggal_kerjasama), 'dd MMMM yyyy', { locale: id })}
                    </span>
                  </div>
                </div>
              </div>
            </CardBody>
          </Card>

          {/* Contact Information */}
          <Card>
            <CardHeader>
              <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                <Phone className="h-5 w-5 text-green-600" />
                Informasi Kontak
              </h2>
            </CardHeader>
            <CardBody className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">Nomor HP</label>
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-gray-400" />
                  <span className="text-lg text-gray-900">{supplier.no_hp_supplier}</span>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">Alamat</label>
                <div className="flex items-start gap-2">
                  <MapPin className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />
                  <p className="text-lg text-gray-900">{supplier.alamat}</p>
                </div>
              </div>
            </CardBody>
          </Card>

          {/* Additional Information */}
          {(supplier.npwp || supplier.keterangan) && (
            <Card>
              <CardHeader>
                <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                  <FileText className="h-5 w-5 text-purple-600" />
                  Informasi Tambahan
                </h2>
              </CardHeader>
              <CardBody className="space-y-4">
                {supplier.npwp && (
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">NPWP</label>
                    <p className="text-lg text-gray-900">{supplier.npwp}</p>
                  </div>
                )}
                
                {supplier.keterangan && (
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">Keterangan</label>
                    <p className="text-lg text-gray-900">{supplier.keterangan}</p>
                  </div>
                )}
              </CardBody>
            </Card>
          )}
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
                  {supplier.created_at ? format(new Date(supplier.created_at), 'dd MMM yyyy', { locale: id }) : '-'}
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">Terakhir Update</span>
                <span className="text-sm text-gray-900">
                  {supplier.updated_at ? format(new Date(supplier.updated_at), 'dd MMM yyyy', { locale: id }) : '-'}
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
              <Link to={`/owner/operasional/data-supplier/edit/${supplier.id}`} className="w-full">
                <Button variant="outline" className="w-full justify-center">
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Supplier
                </Button>
              </Link>
              
              <Button 
                variant="outline" 
                onClick={handleDelete}
                className="w-full justify-center text-red-600 hover:text-red-700"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Hapus Supplier
              </Button>
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default OwnerDataSupplierDetail;
