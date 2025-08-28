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
    nama_target: '',
    target_nominal: ''
  });

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.nama_target) {
      alert('Nama target wajib diisi');
      return;
    }

    try {
      setSaving(true);
      await dataTargetService.create({
        nama_target: formData.nama_target,
        target_nominal: parseFloat(formData.target_nominal) || 0
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
            <p className="text-gray-600">Tambah data target pemasaran</p>
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
                  Nama Target <span className="text-red-500">*</span>
                </label>
                <Input
                  type="text"
                  value={formData.nama_target}
                  onChange={(e) => handleInputChange('nama_target', e.target.value)}
                  placeholder="Masukkan nama target"
                  className="w-full"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Target Nominal (IDR)
                </label>
                <Input
                  type="number"
                  value={formData.target_nominal}
                  onChange={(e) => handleInputChange('target_nominal', e.target.value)}
                  placeholder="Masukkan target nominal"
                  className="w-full"
                  min="0"
                  step="1000"
                />
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
