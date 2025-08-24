import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Card, { CardHeader, CardBody } from '@/components/UI/Card';
import Button from '@/components/UI/Button';
import Input from '@/components/UI/Input';
import Select, { 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/UI/Select';
import { 
  ArrowLeft, 
  Save, 
  X 
} from 'lucide-react';

const OwnerKomplainForm = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    judul_komplain: '',
    deskripsi_komplain: '',
    kategori: '',
    prioritas: '',
    status: 'menunggu',
    target_selesai: ''
  });

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate required fields
    if (!formData.judul_komplain || !formData.deskripsi_komplain || 
        !formData.kategori || !formData.prioritas) {
      alert('Mohon lengkapi semua field yang wajib diisi');
      return;
    }

    try {
      // Simulate API call
      console.log('Creating komplain:', formData);
      alert('Komplain berhasil dibuat');
      navigate('/owner/operasional/komplain');
    } catch (err) {
      alert('Gagal membuat komplain');
      console.error('Error creating komplain:', err);
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button 
          variant="outline" 
          onClick={() => navigate('/owner/operasional/komplain')}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Kembali
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Tambah Komplain Baru - Owner</h1>
          <p className="text-gray-600">Buat komplain baru ke sistem</p>
        </div>
      </div>

      {/* Form */}
      <Card>
        <CardHeader>
          <h2 className="text-xl font-semibold">Form Tambah Komplain</h2>
        </CardHeader>
        <CardBody>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Judul Komplain */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Judul Komplain <span className="text-red-500">*</span>
                </label>
                <Input
                  value={formData.judul_komplain}
                  onChange={(e) => handleInputChange('judul_komplain', e.target.value)}
                  placeholder="Masukkan judul komplain"
                  required
                />
              </div>

              {/* Deskripsi Komplain */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Deskripsi Komplain <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={formData.deskripsi_komplain}
                  onChange={(e) => handleInputChange('deskripsi_komplain', e.target.value)}
                  placeholder="Masukkan deskripsi lengkap komplain"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={4}
                  required
                />
              </div>

              {/* Kategori */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Kategori <span className="text-red-500">*</span>
                </label>
                <Select 
                  value={formData.kategori} 
                  onValueChange={(value) => handleInputChange('kategori', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih kategori" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sistem">Sistem</SelectItem>
                    <SelectItem value="layanan">Layanan</SelectItem>
                    <SelectItem value="produk">Produk</SelectItem>
                    <SelectItem value="lainnya">Lainnya</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Prioritas */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Prioritas <span className="text-red-500">*</span>
                </label>
                <Select 
                  value={formData.prioritas} 
                  onValueChange={(value) => handleInputChange('prioritas', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih prioritas" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="mendesak">Mendesak</SelectItem>
                    <SelectItem value="penting">Penting</SelectItem>
                    <SelectItem value="berproses">Berproses</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Status - Default to 'menunggu' for new komplain */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status
                </label>
                <Select 
                  value={formData.status} 
                  onValueChange={(value) => handleInputChange('status', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="menunggu">Menunggu</SelectItem>
                    <SelectItem value="diproses">Diproses</SelectItem>
                    <SelectItem value="selesai">Selesai</SelectItem>
                    <SelectItem value="ditolak">Ditolak</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Target Selesai */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Target Selesai
                </label>
                <Input
                  type="date"
                  value={formData.target_selesai}
                  onChange={(e) => handleInputChange('target_selesai', e.target.value)}
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-6 border-t">
              <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                <Save className="w-4 h-4 mr-2" />
                Simpan Komplain
              </Button>
              <Button 
                type="button" 
                variant="outline"
                onClick={() => navigate('/owner/operasional/komplain')}
              >
                <X className="w-4 h-4 mr-2" />
                Batal
              </Button>
            </div>
          </form>
        </CardBody>
      </Card>
    </div>
  );
};

export default OwnerKomplainForm;
