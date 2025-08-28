import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Card, { CardHeader, CardBody } from '@/components/UI/Card';
import Button from '@/components/UI/Button';
import Input from '@/components/UI/Input';
import { ArrowLeft, Save, DollarSign } from 'lucide-react';
import { medsosService } from '@/services/medsosService';

const AdminMedsosAnggaranForm = () => {
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    nama_akun: '',
    follower_ig: '',
    follower_tiktok: '',
    ratecard: ''
  });

  const onChange = (field) => (e) => {
    setFormData((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.nama_akun || !formData.ratecard) {
      alert('Nama akun dan ratecard wajib diisi');
      return;
    }
    try {
      setSaving(true);
      await medsosService.createAnggaran({
        nama_akun: formData.nama_akun,
        follower_ig: parseInt(formData.follower_ig || '0', 10),
        follower_tiktok: parseInt(formData.follower_tiktok || '0', 10),
        ratecard: parseFloat(formData.ratecard)
      });
      alert('Data anggaran berhasil ditambahkan');
      navigate('/admin/marketing/medsos');
    } catch (err) {
      console.error(err);
      alert('Gagal menambahkan data anggaran');
    } finally {
      setSaving(false);
    }
  };

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
            <h1 className="text-3xl font-bold text-gray-900">Tambah Anggaran</h1>
            <p className="text-gray-600">Input anggaran berdasarkan akun</p>
          </div>
        </div>
      </div>

      <Card>
        <CardHeader>
          <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-green-600" />
            Form Anggaran
          </h2>
        </CardHeader>
        <CardBody>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Nama Akun *</label>
                <Input value={formData.nama_akun} onChange={onChange('nama_akun')} placeholder="@akun" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Follower Instagram</label>
                <Input type="number" value={formData.follower_ig} onChange={onChange('follower_ig')} min="0" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Follower TikTok</label>
                <Input type="number" value={formData.follower_tiktok} onChange={onChange('follower_tiktok')} min="0" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Ratecard (IDR) *</label>
                <Input type="number" value={formData.ratecard} onChange={onChange('ratecard')} min="0" step="1000" />
              </div>
            </div>

            <div className="flex justify-end gap-4 pt-6 border-t border-gray-200">
              <Link to="/admin/marketing/medsos">
                <Button variant="outline" type="button">Batal</Button>
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
                    Simpan Anggaran
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

export default AdminMedsosAnggaranForm;
