import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Card, { CardHeader, CardBody } from '@/components/UI/Card';
import Button from '@/components/UI/Button';
import Badge from '@/components/UI/Badge';
import Separator from '@/components/UI/Separator';
import { 
  ArrowLeft, 
  Edit, 
  Trash2, 
  Download, 
  MessageSquare, 
  Clock, 
  User, 
  Tag, 
  AlertTriangle,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';

const AdminKomplainDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [komplain, setKomplain] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Mock data untuk demo
  const mockKomplain = {
    id: 1,
    judul_komplain: 'Sistem Login Bermasalah',
    deskripsi_komplain: 'Tidak bisa login ke sistem dengan kredensial yang benar. Sudah mencoba reset password tapi masih tidak bisa. Error message yang muncul: "Invalid credentials".',
    kategori: 'sistem',
    prioritas: 'mendesak',
    status: 'menunggu',
    pelapor: { 
      id: 1,
      nama: 'John Doe', 
      email: 'john@example.com',
      role: 'divisi',
      divisi: 'IT'
    },
    penerima_komplain: { 
      id: 2,
      nama: 'Admin System', 
      email: 'admin@example.com',
      role: 'admin'
    },
    pihak_terkait: [
      { id: 3, nama: 'Tech Support', email: 'support@example.com' },
      { id: 4, nama: 'Network Admin', email: 'network@example.com' }
    ],
    lampiran: [
      'screenshot-error-001.png',
      'error-log-2024-01-15.txt'
    ],
    tanggal_pelaporan: '2024-01-15T10:30:00.000Z',
    target_selesai: '2024-01-20T17:00:00.000Z',
    tanggal_selesai: null,
    catatan_admin: 'Komplain diterima dan sedang dalam proses investigasi.',
    rating_kepuasan: null,
    komentar_kepuasan: null,
    created_at: '2024-01-15T10:30:00.000Z',
    updated_at: '2024-01-15T14:20:00.000Z'
  };

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setKomplain(mockKomplain);
      setLoading(false);
    }, 1000);
  }, [id]);

  const handleEdit = () => {
    navigate(`/admin/komplain/${id}/edit`);
  };

  const handleDelete = () => {
    if (window.confirm('Apakah Anda yakin ingin menghapus komplain ini?')) {
      console.log('Delete komplain:', id);
      navigate('/admin/komplain');
    }
  };

  const handleStatusChange = (newStatus) => {
    // Update status logic
    console.log('Update status to:', newStatus);
  };

  const handleAssignTo = (userId) => {
    // Assign komplain logic
    console.log('Assign to user:', userId);
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      menunggu: { variant: 'secondary', text: 'Menunggu', icon: Clock },
      diproses: { variant: 'default', text: 'Diproses', icon: MessageSquare },
      selesai: { variant: 'default', text: 'Selesai', icon: CheckCircle },
      ditolak: { variant: 'destructive', text: 'Ditolak', icon: XCircle }
    };

    const config = statusConfig[status] || statusConfig.menunggu;
    const Icon = config.icon;
    
    return (
      <Badge variant={config.variant} className="flex items-center gap-2">
        <Icon className="w-4 h-4" />
        {config.text}
      </Badge>
    );
  };

  const getPrioritasBadge = (prioritas) => {
    const prioritasConfig = {
      mendesak: { variant: 'destructive', text: 'Mendesak', icon: AlertTriangle },
      penting: { variant: 'default', text: 'Penting', icon: AlertTriangle },
      berproses: { variant: 'secondary', text: 'Berproses', icon: Clock }
    };

    const config = prioritasConfig[prioritas] || prioritasConfig.berproses;
    const Icon = config.icon;
    
    return (
      <Badge variant={config.variant} className="flex items-center gap-2">
        <Icon className="w-4 h-4" />
        {config.text}
      </Badge>
    );
  };

  const getKategoriBadge = (kategori) => {
    const kategoriConfig = {
      sistem: { variant: 'outline', text: 'Sistem', icon: Tag },
      layanan: { variant: 'outline', text: 'Layanan', icon: Tag },
      produk: { variant: 'outline', text: 'Produk', icon: Tag },
      lainnya: { variant: 'outline', text: 'Lainnya', icon: Tag }
    };

    const config = kategoriConfig[kategori] || kategoriConfig.lainnya;
    const Icon = config.icon;
    
    return (
      <Badge variant={config.variant} className="flex items-center gap-2">
        <Icon className="w-4 h-4" />
        {config.text}
      </Badge>
    );
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

  if (!komplain) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center text-red-600">
          <p className="text-lg">Komplain tidak ditemukan</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            onClick={() => navigate('/admin/komplain')}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Kembali
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Detail Komplain</h1>
            <p className="text-gray-600">ID: #{komplain.id}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button onClick={handleEdit} className="bg-blue-600 hover:bg-blue-700">
            <Edit className="w-4 h-4 mr-2" />
            Edit
          </Button>
          <Button variant="destructive" onClick={handleDelete}>
            <Trash2 className="w-4 h-4 mr-2" />
            Hapus
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Komplain Info */}
          <Card>
            <CardHeader>
              <h3 className="text-xl font-semibold mb-2">{komplain.judul_komplain}</h3>
              <p className="text-gray-600 whitespace-pre-wrap">{komplain.deskripsi_komplain}</p>
            </CardHeader>
            <CardBody className="space-y-4">
              <Separator />
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-500 mb-1">Kategori</p>
                  {getKategoriBadge(komplain.kategori)}
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500 mb-1">Prioritas</p>
                  {getPrioritasBadge(komplain.prioritas)}
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500 mb-1">Status</p>
                  {getStatusBadge(komplain.status)}
                </div>
              </div>
            </CardBody>
          </Card>

          {/* Timeline & Notes */}
          <Card>
            <CardHeader>
              <h3>Timeline & Catatan</h3>
            </CardHeader>
            <CardBody className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
                  <div>
                    <p className="font-medium">Komplain Dibuat</p>
                    <p className="text-sm text-gray-500">
                      {format(new Date(komplain.tanggal_pelaporan), 'dd MMM yyyy HH:mm', { locale: id })}
                    </p>
                  </div>
                </div>
                
                {komplain.catatan_admin && (
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-yellow-600 rounded-full mt-2"></div>
                    <div>
                      <p className="font-medium">Catatan Admin</p>
                      <p className="text-sm text-gray-500">{komplain.catatan_admin}</p>
                    </div>
                  </div>
                )}
                
                {komplain.tanggal_selesai && (
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-green-600 rounded-full mt-2"></div>
                    <div>
                      <p className="font-medium">Selesai</p>
                      <p className="text-sm text-gray-500">
                        {format(new Date(komplain.tanggal_selesai), 'dd MMM yyyy HH:mm', { locale: id })}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </CardBody>
          </Card>

          {/* Attachments */}
          {komplain.lampiran && komplain.lampiran.length > 0 && (
            <Card>
              <CardHeader>
                <h3>Lampiran</h3>
              </CardHeader>
              <CardBody>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {komplain.lampiran.map((file, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                      <span className="text-sm font-medium">{file}</span>
                      <Button variant="outline" size="sm">
                        <Download className="w-4 h-4 mr-2" />
                        Download
                      </Button>
                    </div>
                  ))}
                </div>
              </CardBody>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Status Actions */}
          <Card>
            <CardHeader>
              <h3>Status & Aksi</h3>
            </CardHeader>
            <CardBody className="space-y-3">
              <div className="space-y-2">
                <p className="text-sm font-medium">Update Status:</p>
                <div className="flex flex-wrap gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleStatusChange('diproses')}
                    disabled={komplain.status === 'diproses'}
                  >
                    Diproses
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleStatusChange('selesai')}
                    disabled={komplain.status === 'selesai'}
                  >
                    Selesai
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleStatusChange('ditolak')}
                    disabled={komplain.status === 'ditolak'}
                  >
                    Ditolak
                  </Button>
                </div>
              </div>
              
              <Separator />
              
              <div className="space-y-2">
                <p className="text-sm font-medium">Assign To:</p>
                <div className="space-y-2">
                  {komplain.pihak_terkait.map((user) => (
                    <Button
                      key={user.id}
                      variant="outline"
                      size="sm"
                      className="w-full justify-start"
                      onClick={() => handleAssignTo(user.id)}
                    >
                      <User className="w-4 h-4 mr-2" />
                      {user.nama}
                    </Button>
                  ))}
                </div>
              </div>
            </CardBody>
          </Card>

          {/* Reporter Info */}
          <Card>
            <CardHeader>
              <h3>Informasi Pelapor</h3>
            </CardHeader>
            <CardBody className="space-y-3">
              <div>
                <p className="text-sm font-medium text-gray-500">Nama</p>
                <p className="font-medium">{komplain.pelapor.nama}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Email</p>
                <p className="text-sm">{komplain.pelapor.email}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Role</p>
                <Badge variant="outline">{komplain.pelapor.role}</Badge>
              </div>
              {komplain.pelapor.divisi && (
                <div>
                  <p className="text-sm font-medium text-gray-500">Divisi</p>
                  <p className="text-sm">{komplain.pelapor.divisi}</p>
                </div>
              )}
            </CardBody>
          </Card>

          {/* Dates */}
          <Card>
            <CardHeader>
              <h3>Informasi Tanggal</h3>
            </CardHeader>
            <CardBody className="space-y-3">
              <div>
                <p className="text-sm font-medium text-gray-500">Tanggal Pelaporan</p>
                <p className="text-sm">
                  {format(new Date(komplain.tanggal_pelaporan), 'dd MMM yyyy HH:mm', { locale: id })}
                </p>
              </div>
              {komplain.target_selesai && (
                <div>
                  <p className="text-sm font-medium text-gray-500">Target Selesai</p>
                  <p className="text-sm">
                    {format(new Date(komplain.target_selesai), 'dd MMM yyyy HH:mm', { locale: id })}
                  </p>
                </div>
              )}
              {komplain.tanggal_selesai && (
                <div>
                  <p className="text-sm font-medium text-gray-500">Tanggal Selesai</p>
                  <p className="text-sm">
                    {format(new Date(komplain.tanggal_selesai), 'dd MMM yyyy HH:mm', { locale: id })}
                  </p>
                </div>
              )}
            </CardBody>
          </Card>

          {/* Satisfaction Rating */}
          {komplain.rating_kepuasan && (
            <Card>
              <CardHeader>
                <h3>Rating Kepuasan</h3>
              </CardHeader>
              <CardBody className="space-y-3">
                <div className="flex items-center gap-2">
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <span
                        key={star}
                        className={`text-2xl ${
                          star <= komplain.rating_kepuasan
                            ? 'text-yellow-400'
                            : 'text-gray-300'
                        }`}
                      >
                        ★
                      </span>
                    ))}
                  </div>
                  <span className="text-sm text-gray-600">
                    ({komplain.rating_kepuasan}/5)
                  </span>
                </div>
                {komplain.komentar_kepuasan && (
                  <div>
                    <p className="text-sm font-medium text-gray-500">Komentar</p>
                    <p className="text-sm">{komplain.komentar_kepuasan}</p>
                  </div>
                )}
              </CardBody>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminKomplainDetail;

