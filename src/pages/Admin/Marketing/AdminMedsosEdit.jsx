import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import Card, { CardHeader, CardBody } from '@/components/UI/Card';
import Button from '@/components/UI/Button';
import Input from '@/components/UI/Input';
import Select from '@/components/UI/Select';
import { ArrowLeft, Save, Music } from 'lucide-react';
import { medsosService } from '@/services/medsosService';

const AdminMedsosEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    platform: '',
    biaya: ''
  });

  useEffect(() => {
    fetchMedsosData();
  }, [id]);

  const fetchMedsosData = async () => {
    try {
      setLoading(true);
      const response = await medsosService.getById(id);
      setFormData(response.data);
    } catch (err) {
      alert('Gagal memuat data medsos');
      console.error('Error fetching medsos:', err);
      navigate('/admin/marketing/medsos');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.platform || !formData.biaya) {
      alert('Semua field wajib diisi');
      return;
    }

    try {
      setSaving(true);
      await medsosService.update(id, {
        ...formData,
        biaya: parseFloat(formData.biaya)
      });
      alert('Platform medsos berhasil diperbarui');
      navigate('/admin/marketing/medsos');
    } catch (err) {
      alert('Gagal memperbarui platform medsos');
      console.error('Error updating medsos:', err);
    } finally {
      setSaving(false);
    }
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
            <h1 className="text-3xl font-bold text-gray-900">Edit Platform Medsos</h1>
            <p className="text-gray-600">Perbarui data platform media sosial</p>
          </div>
        </div>
      </div>

      <Card>
        <CardHeader>
          <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
            <Music className="h-5 w-5 text-blue-600" />
            Form Edit Platform Medsos
          </h2>
        </CardHeader>
        <CardBody>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Platform <span className="text-red-500">*</span>
                </label>
                <Select 
                  value={formData.platform} 
                  onValueChange={(value) => handleInputChange('platform', value)}
                  placeholder="Pilih platform"
                  options={[
                    { value: 'TIKTOK', label: 'TikTok' },
                    { value: 'INSTAGRAM', label: 'Instagram' },
                    { value: 'YOUTUBE', label: 'YouTube' }
                  ]}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Biaya (IDR) <span className="text-red-500">*</span>
                </label>
                <Input
                  type="number"
                  value={formData.biaya}
                  onChange={(e) => handleInputChange('biaya', e.target.value)}
                  placeholder="Masukkan biaya platform"
                  className="w-full"
                  min="0"
                  step="1000"
                />
                <p className="text-sm text-gray-500 mt-1">Contoh: 1000000 untuk 1 juta rupiah</p>
              </div>
            </div>

            <div className="flex justify-end gap-4 pt-6 border-t border-gray-200">
              <Link to={`/admin/marketing/medsos/detail/${id}`}>
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
                    Simpan Perubahan
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

export default AdminMedsosEdit;





