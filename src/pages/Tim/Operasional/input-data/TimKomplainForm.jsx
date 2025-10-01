import React, { useState, useEffect } from 'react';
import Card, { CardHeader, CardBody } from '@/components/UI/Card';
import Button from '@/components/UI/Button';
import Input from '@/components/UI/Input';
import Textarea from '@/components/UI/Textarea';
import Select from '@/components/UI/Select';
import Badge from '@/components/UI/Badge';
import ImagePreview from '@/components/UI/ImagePreview';
import LoadingSpinner from '@/components/UI/LoadingSpinner';

const TimKomplainForm = () => {
  const [formData, setFormData] = useState({
    judul_komplain: '',
    deskripsi_komplain: '',
    kategori: 'TEKNIS',
    prioritas: 'NORMAL',
    lokasi: ''
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
      if (!formData.judul_komplain || !formData.deskripsi_komplain) {
        throw new Error('Judul dan deskripsi komplain harus diisi');
      }

      // Simulate API call
      console.log('Submitting komplain:', { ...formData, images: images.length });
      
      // Reset form
      setFormData({
        judul_komplain: '',
        deskripsi_komplain: '',
        kategori: 'TEKNIS',
        prioritas: 'NORMAL',
        lokasi: ''
      });
      setImages([]);
      
      alert('Komplain berhasil dikirim! Tim IT akan segera menindaklanjuti.');
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
          <CardTitle>Form Komplain - Tim</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Judul Komplain */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Judul Komplain *
              </label>
              <Input
                name="judul_komplain"
                value={formData.judul_komplain}
                onChange={handleInputChange}
                placeholder="Masukkan judul komplain..."
                required
              />
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
                <option value="TEKNIS">Teknis</option>
                <option value="FASILITAS">Fasilitas</option>
                <option value="SISTEM">Sistem</option>
                <option value="LAINNYA">Lainnya</option>
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

            {/* Lokasi */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Lokasi
              </label>
              <Input
                name="lokasi"
                value={formData.lokasi}
                onChange={handleInputChange}
                placeholder="Lokasi masalah (opsional)"
              />
            </div>

            {/* Deskripsi Komplain */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Deskripsi Komplain *
              </label>
              <Textarea
                name="deskripsi_komplain"
                value={formData.deskripsi_komplain}
                onChange={handleInputChange}
                placeholder="Jelaskan detail masalah yang Anda alami..."
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
                Maksimal 3 gambar, ukuran maksimal 5MB per gambar
              </p>
            </div>

            {/* Image Preview */}
            {images.length > 0 && (
              <div>
                <label className="block text-sm font-medium mb-2">
                  Preview Gambar
                </label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
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
                {loading ? 'Mengirim...' : 'Kirim Komplain'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default TimKomplainForm;

