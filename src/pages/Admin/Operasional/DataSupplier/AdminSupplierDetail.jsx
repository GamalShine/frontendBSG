import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import Card, { CardHeader, CardBody } from '@/components/UI/Card';
import Button from '@/components/UI/Button';
import Badge from '@/components/UI/Badge';
import { 
  ArrowLeft, 
  Edit, 
  Trash2, 
  Building, 
  MapPin, 
  Phone, 
  Calendar, 
  FileText,
  User,
  Clock
} from 'lucide-react';
import { format } from 'date-fns';
import { id as idLocale } from 'date-fns/locale/id';
import { dataSupplierService } from '@/services/dataSupplierService';

const AdminSupplierDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [supplier, setSupplier] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchSupplierDetail();
  }, [id]);

  const fetchSupplierDetail = async () => {
    try {
      setLoading(true);
      const response = await dataSupplierService.getById(id);
      setSupplier(response.data);
    } catch (err) {
      setError('Gagal memuat detail supplier');
      console.error('Error fetching supplier detail:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Apakah Anda yakin ingin menghapus supplier ini?')) {
      try {
        await dataSupplierService.delete(id);
        navigate('/admin/operasional/data-supplier');
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
          <p className="mt-4 text-gray-600">Memuat detail supplier...</p>
        </div>
      </div>
    );
  }

  if (error || !supplier) {
    return (
      <div className="container mx-auto p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">{error || 'Supplier tidak ditemukan'}</p>
          <div className="mt-4 flex gap-2">
            <Button onClick={() => navigate('/admin/operasional/data-supplier')} variant="outline">
              Kembali ke Daftar
            </Button>
            <Button onClick={fetchSupplierDetail} variant="outline">
              Coba Lagi
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-4 mb-4">
          <Link to="/admin/operasional/data-supplier">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Kembali
            </Button>
          </Link>
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-gray-900">Detail Supplier</h1>
            <p className="text-gray-600">Informasi lengkap supplier</p>
          </div>
          <div className="flex gap-2">
            <Link to={`/admin/operasional/data-supplier/edit/${supplier.id}`}>
              <Button variant="outline">
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </Button>
            </Link>
            <Button variant="outline" onClick={handleDelete} className="text-red-600 hover:text-red-700">
              <Trash2 className="h-4 w-4 mr-2" />
              Hapus
            </Button>
          </div>
        </div>
      </div>

      {/* Supplier Information */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Information */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                <Building className="h-5 w-5 text-blue-600" />
                Informasi Utama
              </h2>
            </CardHeader>
            <CardBody className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Nama Supplier</label>
                  <p className="text-lg font-semibold text-gray-900">{supplier.nama_supplier}</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Kategori Supplier</label>
                  <Badge className={getKategoriColor(supplier.kategori_supplier)}>
                    {supplier.kategori_supplier}
                  </Badge>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Divisi</label>
                  <Badge className={getDivisiColor(supplier.divisi)}>
                    {supplier.divisi}
                  </Badge>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">No. HP</label>
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-gray-400" />
                    <span className="text-lg text-gray-900">{supplier.no_hp_supplier}</span>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Tanggal Kerjasama</label>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-gray-400" />
                    <span className="text-lg text-gray-900">
                      {format(new Date(supplier.tanggal_kerjasama), 'dd MMMM yyyy', { locale: id })}
                    </span>
                  </div>
                </div>
                
                {supplier.npwp && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">NPWP</label>
                    <p className="text-lg text-gray-900">{supplier.npwp}</p>
                  </div>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Alamat</label>
                <div className="flex items-start gap-2">
                  <MapPin className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />
                  <p className="text-lg text-gray-900">{supplier.alamat}</p>
                </div>
              </div>
              
              {supplier.keterangan && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Keterangan</label>
                  <div className="flex items-start gap-2">
                    <FileText className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />
                    <p className="text-lg text-gray-900">{supplier.keterangan}</p>
                  </div>
                </div>
              )}
            </CardBody>
          </Card>
        </div>

        {/* Side Information */}
        <div className="space-y-6">
          {/* System Information */}
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <Clock className="h-4 w-4 text-gray-600" />
                Informasi Sistem
              </h3>
            </CardHeader>
            <CardBody className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">ID Supplier</label>
                <p className="text-sm text-gray-900 font-mono">#{supplier.id}</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Dibuat Pada</label>
                <p className="text-sm text-gray-900">
                  {format(new Date(supplier.created_at), 'dd MMM yyyy HH:mm', { locale: id })}
                </p>
              </div>
              
              {supplier.updated_at && supplier.updated_at !== supplier.created_at && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Terakhir Diupdate</label>
                  <p className="text-sm text-gray-900">
                    {format(new Date(supplier.updated_at), 'dd MMM yyyy HH:mm', { locale: id })}
                  </p>
                </div>
              )}
              
              {supplier.created_by && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Dibuat Oleh</label>
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-gray-400" />
                    <p className="text-sm text-gray-900">User ID: {supplier.created_by}</p>
                  </div>
                </div>
              )}
            </CardBody>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold text-gray-900">Aksi Cepat</h3>
            </CardHeader>
            <CardBody className="space-y-3">
              <Link to={`/admin/operasional/data-supplier/edit/${supplier.id}`} className="w-full">
                <Button className="w-full" variant="outline">
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Supplier
                </Button>
              </Link>
              
              <Button 
                className="w-full" 
                variant="outline" 
                onClick={handleDelete}
                className="w-full text-red-600 hover:text-red-700"
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

export default AdminSupplierDetail;





