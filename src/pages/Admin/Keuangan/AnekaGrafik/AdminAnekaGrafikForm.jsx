import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { 
  X, 
  Upload, 
  Image as ImageIcon,
  Save,
  Trash2
} from 'lucide-react';
import { anekaGrafikService } from '../../../../services/anekaGrafikService';
import { API_CONFIG, API_ENDPOINTS } from '../../../../config/constants';

const AdminAnekaGrafikForm = ({ isEdit = false, anekaGrafikData = null, onClose, onSuccess }) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    category: 'omzet',
    photo_url: ''
  });
  const [uploadedFiles, setUploadedFiles] = useState([]);

  useEffect(() => {
    if (isEdit && anekaGrafikData) {
      setFormData({
        name: anekaGrafikData.name || '',
        category: anekaGrafikData.category || 'omzet',
        photo_url: anekaGrafikData.photo_url || ''
      });
      if (anekaGrafikData.photo_url) {
        setUploadedFiles([{ url: anekaGrafikData.photo_url, name: 'Current Image' }]);
      }
    }
  }, [isEdit, anekaGrafikData]);



  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    try {
      setLoading(true);
      console.log('🔄 Starting file upload for:', files.length, 'files');
      console.log('📁 Files to upload:', files.map(f => ({ name: f.name, size: f.size, type: f.type })));
      
      // Test the endpoint first
      console.log('🧪 Testing endpoint:', `${API_ENDPOINTS.ANEKA_GRAFIK.ADMIN.LIST}/upload`);
      console.log('🌐 Full URL:', `${API_CONFIG.BASE_URL}${API_ENDPOINTS.ANEKA_GRAFIK.ADMIN.LIST}/upload`);
      
      const response = await anekaGrafikService.uploadImages(files);
      console.log('📥 Upload response:', response);
      
      if (response.success && response.files) {
        const newFiles = response.files.map(file => ({
          url: file.url,
          name: file.name,
          id: file.id
        }));
        
        console.log('📁 New files processed:', newFiles);
        setUploadedFiles(prev => [...prev, ...newFiles]);
        setFormData(prev => ({
          ...prev,
          photo_url: newFiles[0]?.url || ''
        }));
        toast.success('Foto berhasil diupload');
      } else {
        console.error('❌ Upload response not successful:', response);
        toast.error(response.error || 'Gagal upload foto');
      }
    } catch (error) {
      console.error('❌ Error uploading files:', error);
      console.error('❌ Error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        statusText: error.response?.statusText
      });
      toast.error(error.message || 'Gagal upload foto');
    } finally {
      setLoading(false);
    }
  };

  const removeFile = (index) => {
    setUploadedFiles(prev => {
      const newFiles = prev.filter((_, i) => i !== index);
      setFormData(prevData => ({
        ...prevData,
        photo_url: newFiles.length > 0 ? newFiles[0].url : ''
      }));
      return newFiles;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name || !formData.category) {
      toast.error('Nama dan kategori harus diisi');
      return;
    }

    try {
      setLoading(true);
      let response;

      if (isEdit) {
        response = await anekaGrafikService.updateAnekaGrafik(anekaGrafikData.id, formData);
      } else {
        response = await anekaGrafikService.createAnekaGrafik(formData);
      }

      if (response.success) {
        toast.success(isEdit ? 'Aneka grafik berhasil diupdate' : 'Aneka grafik berhasil dibuat');
        if (onSuccess) onSuccess();
        if (onClose) onClose();
        navigate('/admin/keuangan/aneka-grafik');
      } else {
        toast.error(response.message || 'Gagal menyimpan data');
      }
    } catch (error) {
      console.error('Error saving aneka grafik:', error);
      toast.error('Gagal menyimpan data');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!anekaGrafikData?.id) return;
    
    if (!window.confirm('Apakah Anda yakin ingin menghapus aneka grafik ini?')) {
      return;
    }

    try {
      setLoading(true);
      const response = await anekaGrafikService.deleteAnekaGrafik(anekaGrafikData.id);
      
      if (response.success) {
        toast.success('Aneka grafik berhasil dihapus');
        if (onSuccess) onSuccess();
        if (onClose) onClose();
        navigate('/admin/keuangan/aneka-grafik');
      } else {
        toast.error(response.message || 'Gagal menghapus data');
      }
    } catch (error) {
      console.error('Error deleting aneka grafik:', error);
      toast.error('Gagal menghapus data');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[2147483647] flex items-start md:items-center justify-center bg-black/40">
      <div className="relative z-[2147483647] w-full md:max-w-lg bg-white rounded-b-2xl md:rounded-2xl shadow-lg overflow-hidden">
        {/* Header */}
        <div className="px-4 py-3 border-b flex items-center justify-between">
          <h2 className="text-base md:text-lg font-semibold text-gray-900">
            {isEdit ? 'Edit Aneka Grafik' : 'Tambah Aneka Grafik'}
          </h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700" aria-label="Tutup">✕</button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <div className="p-4 space-y-4">
            {/* Nama */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nama Aneka Grafik *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Masukkan nama aneka grafik"
                required
              />
            </div>

            {/* Kategori */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Kategori *
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              >
                <option value="omzet">OMZET</option>
                <option value="bahan_baku">BAHAN BAKU</option>
                <option value="gaji_bonus_ops">GAJI BONUS OPS</option>
                <option value="gaji">GAJI</option>
                <option value="bonus">BONUS</option>
                <option value="operasional">OPERASIONAL</option>
              </select>
            </div>

            {/* Photo Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Foto Aneka Grafik
              </label>
              
              {/* Upload Area */}
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-red-400 transition-colors">
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleFileUpload}
                  className="hidden"
                  id="photo-upload"
                  disabled={loading}
                />
                <label htmlFor="photo-upload" className="cursor-pointer">
                  <Upload className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-600">
                    {loading ? 'Uploading...' : 'Klik untuk upload foto atau drag & drop'}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    PNG, JPG, GIF up to 10MB
                  </p>
                </label>
              </div>

              {/* Uploaded Files */}
              {uploadedFiles.length > 0 && (
                <div className="mt-4 space-y-2">
                  <p className="text-sm font-medium text-gray-700">Foto yang diupload:</p>
                  {uploadedFiles.map((file, index) => (
                    <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                      <ImageIcon className="w-5 h-5 text-gray-400" />
                      <span className="text-sm text-gray-700 flex-1">{file.name}</span>
                      <button
                        type="button"
                        onClick={() => removeFile(index)}
                        className="p-1 hover:bg-red-100 rounded text-red-600"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
          {/* Footer actions */}
          <div className="p-4 border-t flex items-center justify-between">
            <div className="flex items-center gap-2">
              {isEdit && (
                <button
                  type="button"
                  onClick={handleDelete}
                  disabled={loading}
                  className="px-4 py-2 rounded-lg border border-red-300 text-red-600 hover:bg-red-50 disabled:opacity-50"
                >
                  Hapus
                </button>
              )}
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                disabled={loading}
                className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 lg:bg-blue-600 lg:hover:bg-blue-700 text-white disabled:opacity-50 flex items-center gap-2"
              >
                {loading ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                ) : (
                  <Save className="w-4 h-4" />
                )}
                <span>{isEdit ? 'Update' : 'Simpan'}</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminAnekaGrafikForm;