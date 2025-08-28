import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Card, { CardHeader, CardBody } from '@/components/UI/Card';
import Button from '@/components/UI/Button';
import Input from '@/components/UI/Input';
import Select from '@/components/UI/Select';
import { ArrowLeft, Save, Music } from 'lucide-react';
import { medsosService } from '@/services/medsosService';

const AdminMedsosPlatformForm = () => {
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    platform: '',
    follower_saat_ini: '',
    follower_bulan_lalu: '',
    konten_terupload: '',
    story_terupload: '',
    konten_terbaik_link: ''
  });

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.platform || formData.follower_saat_ini === '' || formData.follower_bulan_lalu === '' || formData.konten_terupload === '' || formData.story_terupload === '') {
      alert('Semua field wajib diisi kecuali link konten terbaik');
      return;
    }
    try {
      setSaving(true);
      await medsosService.createPlatform({
        platform: formData.platform,
        follower_saat_ini: parseInt(formData.follower_saat_ini, 10),
        follower_bulan_lalu: parseInt(formData.follower_bulan_lalu, 10),
        konten_terupload: parseInt(formData.konten_terupload, 10),
        story_terupload: parseInt(formData.story_terupload, 10),
        konten_terbaik_link: formData.konten_terbaik_link || null
      });
      alert('Data platform medsos berhasil ditambahkan');
      navigate('/admin/marketing/medsos');
    } catch (err) {
      console.error(err);
      alert('Gagal menambahkan data platform medsos');
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
            <h1 className="text-3xl font-bold text-gray-900">Tambah Data Platform</h1>
            <p className="text-gray-600">Input metrik medsos per platform</p>
          </div>
        </div>
      </div>

      <Card>
        <CardHeader>
          <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
            <Music className="h-5 w-5 text-red-600" />
            Form Platform Medsos
          </h2>
        </CardHeader>
        <CardBody>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Platform *</label>
                <Select
                  value={formData.platform}
                  onValueChange={(v) => handleChange('platform', v)}
                  placeholder="Pilih platform"
                  options={[
                    { value: 'TIKTOK', label: 'TikTok' },
                    { value: 'INSTAGRAM', label: 'Instagram' },
                    { value: 'YOUTUBE', label: 'YouTube' }
                  ]}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Follower Saat Ini *</label>
                <Input type="number" min="0" value={formData.follower_saat_ini} onChange={(e) => handleChange('follower_saat_ini', e.target.value)} />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Follower Bulan Lalu *</label>
                <Input type="number" min="0" value={formData.follower_bulan_lalu} onChange={(e) => handleChange('follower_bulan_lalu', e.target.value)} />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Konten Terupload *</label>
                <Input type="number" min="0" value={formData.konten_terupload} onChange={(e) => handleChange('konten_terupload', e.target.value)} />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Story Terupload *</label>
                <Input type="number" min="0" value={formData.story_terupload} onChange={(e) => handleChange('story_terupload', e.target.value)} />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Link Konten Terbaik (opsional)</label>
                <Input type="url" value={formData.konten_terbaik_link} onChange={(e) => handleChange('konten_terbaik_link', e.target.value)} placeholder="https://..." />
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
                    Simpan Platform
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

export default AdminMedsosPlatformForm;
