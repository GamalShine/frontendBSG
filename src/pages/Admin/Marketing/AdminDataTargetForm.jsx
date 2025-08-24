import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Card, { CardHeader, CardBody } from '@/components/UI/Card';
import Button from '@/components/UI/Button';
import Input from '@/components/UI/Input';
import { ArrowLeft, Save, Users } from 'lucide-react';
import { dataTargetService } from '@/services/dataTargetService';

const AdminDataTargetForm = () => {
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    nama_akun: '',
    follower_ig: '',
    follower_tiktok: '',
    ratecard: ''
  });

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.nama_akun) {
      alert('Nama akun wajib diisi');
      return;
    }

    try {
      setSaving(true);
      await dataTargetService.create({
        ...formData,
        follower_ig: parseInt(formData.follower_ig) || 0,
        follower_tiktok: parseInt(formData.follower_tiktok) || 0,
        ratecard: parseFloat(formData.ratecard) || 0,
        created_by: 1 // TODO: Get from auth context
      });
      alert('Data target berhasil ditambahkan');
      navigate('/admin/marketing/target');
    } catch (err) {
      alert('Gagal menambahkan data target');
      console.error('Error creating data target:', err);
    } finally {
      setSaving(false);
    }
  };

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
            <h1 className="text-3xl font-bold text-gray-900">Tambah Data Target</h1>
            <p className="text-gray-600">Tambah data target marketing dan influencer baru</p>
          </div>
        </div>
      </div>

      <Card>
        <CardHeader>
          <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
            <Users className="h-5 w-5 text-blue-600" />
            Form Tambah Data Target
          </h2>
        </CardHeader>
        <CardBody>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nama Akun <span className="text-red-500">*</span>
                </label>
                <Input
                  type="text"
                  value={formData.nama_akun}
                  onChange={(e) => handleInputChange('nama_akun', e.target.value)}
                  placeholder="Masukkan nama akun/influencer"
                  className="w-full"
                />
                <p className="text-sm text-gray-500 mt-1">Contoh: @username atau nama lengkap</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Follower Instagram
                </label>
                <Input
                  type="number"
                  value={formData.follower_ig}
                  onChange={(e) => handleInputChange('follower_ig', e.target.value)}
                  placeholder="Jumlah follower Instagram"
                  className="w-full"
                  min="0"
                />
                <p className="text-sm text-gray-500 mt-1">Kosongkan jika tidak ada</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Follower TikTok
                </label>
                <Input
                  type="number"
                  value={formData.follower_tiktok}
                  onChange={(e) => handleInputChange('follower_tiktok', e.target.value)}
                  placeholder="Jumlah follower TikTok"
                  className="w-full"
                  min="0"
                />
                <p className="text-sm text-gray-500 mt-1">Kosongkan jika tidak ada</p>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Rate Card (IDR)
                </label>
                <Input
                  type="number"
                  value={formData.ratecard}
                  onChange={(e) => handleInputChange('ratecard', e.target.value)}
                  placeholder="Masukkan rate card"
                  className="w-full"
                  min="0"
                  step="1000"
                />
                <p className="text-sm text-gray-500 mt-1">Contoh: 1000000 untuk 1 juta rupiah</p>
              </div>
            </div>

            <div className="flex justify-end gap-4 pt-6 border-t border-gray-200">
              <Link to="/admin/marketing/target">
                <Button variant="outline" type="button">
                  Batal
                </Button>
              </Link>
              <Button type="submit" disabled={saving} className="flex items-center gap-2">
                {saving ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Menyimpan...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    Simpan Target
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardBody>
      </Card>
    </div>
  );
};

export default AdminDataTargetForm;
