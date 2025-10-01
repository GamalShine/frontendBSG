import React, { useState, useEffect } from 'react';
import Card, { CardHeader, CardBody } from '@/components/UI/Card';
import Button from '@/components/UI/Button';
import Input from '@/components/UI/Input';
import Textarea from '@/components/UI/Textarea';
import Select from '@/components/UI/Select';
import Badge from '@/components/UI/Badge';
import ImagePreview from '@/components/UI/ImagePreview';
import LoadingSpinner from '@/components/UI/LoadingSpinner';

const TimPoskasForm = () => {
  const [formData, setFormData] = useState({
    tanggal_poskas: new Date().toISOString().split('T')[0],
    isi_poskas: '',
    kategori: 'HARIAN',
    prioritas: 'NORMAL'
  });
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

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
      
      // Reset form
      setFormData({
        tanggal_poskas: new Date().toISOString().split('T')[0],
        isi_poskas: '',
        kategori: 'HARIAN',
        prioritas: 'NORMAL'
      });
      setImages([]);
      
      alert('Poskas berhasil disimpan!');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Input Poskas Harian - Tim</CardTitle>
        </CardHeader>
        <CardContent>
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

            {/* Kategori */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Kategori
              </label>
              <select
                name="kategori"
                value={formData.kategori}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="HARIAN">Harian</option>
                <option value="MINGGUAN">Mingguan</option>
                <option value="BULANAN">Bulanan</option>
                <option value="KHUSUS">Khusus</option>
              </select>
            </div>

            {/* Prioritas */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Prioritas
              </label>
              <select
                name="prioritas"
                value={formData.prioritas}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="RENDAH">Rendah</option>
                <option value="NORMAL">Normal</option>
                <option value="TINGGI">Tinggi</option>
                <option value="URGENT">Urgent</option>
              </select>
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
                placeholder="Tuliskan detail poskas harian Anda..."
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
            <div className="flex justify-end">
              <Button
                type="submit"
                disabled={loading}
                className="min-w-[120px]"
              >
                {loading ? 'Menyimpan...' : 'Simpan Poskas'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default TimPoskasForm;

