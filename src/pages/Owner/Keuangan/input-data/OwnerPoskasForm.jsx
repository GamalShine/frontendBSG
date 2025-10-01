import React, { useState, useEffect } from 'react';
import Card, { CardHeader, CardBody } from '@/components/UI/Card';
import Button from '@/components/UI/Button';
import Input from '@/components/UI/Input';
import Textarea from '@/components/UI/Textarea';
import Select from '@/components/UI/Select';
import Badge from '@/components/UI/Badge';
import ImagePreview from '@/components/UI/ImagePreview';
import LoadingSpinner from '@/components/UI/LoadingSpinner';

const OwnerPoskasForm = () => {
  const [formData, setFormData] = useState({
    tanggal_poskas: new Date().toISOString().split('T')[0],
    isi_poskas: '',
    kategori: 'HARIAN',
    prioritas: 'NORMAL',
    divisi: 'KEUANGAN',
    status: 'DRAFT'
  });
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isEdit, setIsEdit] = useState(false);

  useEffect(() => {
    // Check if editing existing poskas
    const urlParams = new URLSearchParams(window.location.search);
    const id = urlParams.get('id');
    if (id) {
      setIsEdit(true);
      fetchPoskasData(id);
    }
  }, []);

  const fetchPoskasData = async (id) => {
    try {
      setLoading(true);
      // Simulate API call
      const mockData = {
        id: id,
        tanggal_poskas: '2024-08-18',
        isi_poskas: 'Laporan keuangan harian yang perlu direview',
        kategori: 'HARIAN',
        prioritas: 'TINGGI',
        divisi: 'KEUANGAN',
        status: 'DRAFT'
      };
      setFormData(mockData);
    } catch (err) {
      setError('Gagal mengambil data poskas');
      console.error('Error fetching poskas:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    const newImages = files.map(file => ({
      id: Date.now() + Math.random(),
      file,
      preview: URL.createObjectURL(file)
    }));
    setImages(prev => [...prev, ...newImages]);
  };

  const removeImage = (imageId) => {
    setImages(prev => prev.filter(img => img.id !== imageId));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Validate form
      if (!formData.tanggal_poskas || !formData.isi_poskas) {
        throw new Error('Tanggal dan isi poskas harus diisi');
      }

      // Simulate API call
      console.log('Submitting poskas:', { ...formData, images: images.length });
      
      if (isEdit) {
        console.log('Updating existing poskas...');
      } else {
        console.log('Creating new poskas...');
      }
      
      // Reset form if creating new
      if (!isEdit) {
        setFormData({
          tanggal_poskas: new Date().toISOString().split('T')[0],
          isi_poskas: '',
          kategori: 'HARIAN',
          prioritas: 'NORMAL',
          divisi: 'KEUANGAN',
          status: 'DRAFT'
        });
        setImages([]);
      }
      
      alert(isEdit ? 'Poskas berhasil diupdate!' : 'Poskas berhasil dibuat!');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading && isEdit) return <LoadingSpinner />;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <h3 className="text-xl font-semibold">
            {isEdit ? 'Edit Poskas - Owner' : 'Buat Poskas Baru - Owner'}
          </h3>
        </CardHeader>
        <CardBody>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Tanggal */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Tanggal Poskas *
              </label>
              <Input
                type="date"
                name="tanggal_poskas"
                value={formData.tanggal_poskas}
                onChange={handleInputChange}
                required
              />
            </div>

            {/* Divisi */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Divisi *
              </label>
              <Select
                name="divisi"
                value={formData.divisi}
                onValueChange={(value) => handleInputChange({ target: { name: 'divisi', value } })}
              >
                <option value="KEUANGAN">Keuangan</option>
                <option value="OPERASIONAL">Operasional</option>
                <option value="MARKETING">Marketing</option>
                <option value="SDM">SDM</option>
              </Select>
            </div>

            {/* Kategori */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Kategori
              </label>
              <Select
                name="kategori"
                value={formData.kategori}
                onValueChange={(value) => handleInputChange({ target: { name: 'kategori', value } })}
              >
                <option value="HARIAN">Harian</option>
                <option value="MINGGUAN">Mingguan</option>
                <option value="BULANAN">Bulanan</option>
                <option value="KHUSUS">Khusus</option>
              </Select>
            </div>

            {/* Prioritas */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Prioritas
              </label>
              <Select
                name="prioritas"
                value={formData.prioritas}
                onValueChange={(value) => handleInputChange({ target: { name: 'prioritas', value } })}
              >
                <option value="RENDAH">Rendah</option>
                <option value="NORMAL">Normal</option>
                <option value="TINGGI">Tinggi</option>
                <option value="URGENT">Urgent</option>
              </Select>
            </div>

            {/* Status */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Status
              </label>
              <Select
                name="status"
                value={formData.status}
                onValueChange={(value) => handleInputChange({ target: { name: 'status', value } })}
              >
                <option value="DRAFT">Draft</option>
                <option value="PUBLISHED">Published</option>
                <option value="ARCHIVED">Archived</option>
              </Select>
            </div>

            {/* Isi Poskas */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Isi Poskas *
              </label>
              <Textarea
                name="isi_poskas"
                value={formData.isi_poskas}
                onChange={handleInputChange}
                placeholder="Tuliskan detail poskas..."
                rows={6}
                required
              />
            </div>

            {/* Image Upload */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Upload Gambar (Opsional)
              </label>
              <Input
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageUpload}
                className="cursor-pointer"
              />
              <p className="text-sm text-gray-500 mt-1">
                Maksimal 5 gambar, ukuran maksimal 10MB per gambar
              </p>
            </div>

            {/* Image Preview */}
            {images.length > 0 && (
              <div>
                <label className="block text-sm font-medium mb-2">
                  Preview Gambar
                </label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {images.map((image) => (
                    <div key={image.id} className="relative">
                      <ImagePreview
                        src={image.preview}
                        alt="Preview"
                        className="w-full h-24 object-cover rounded-md"
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        className="absolute -top-2 -right-2 w-6 h-6 p-0"
                        onClick={() => removeImage(image.id)}
                      >
                        ×
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="text-red-500 text-sm bg-red-50 p-3 rounded-md">
                {error}
              </div>
            )}

            {/* Submit Button */}
            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => window.history.back()}
              >
                Batal
              </Button>
              <Button
                type="submit"
                disabled={loading}
                className="min-w-[120px]"
              >
                {loading ? 'Menyimpan...' : (isEdit ? 'Update Poskas' : 'Simpan Poskas')}
              </Button>
            </div>
          </form>
        </CardBody>
      </Card>
    </div>
  );
};

export default OwnerPoskasForm;













