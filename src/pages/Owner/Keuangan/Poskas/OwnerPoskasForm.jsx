import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../../../../contexts/AuthContext';
import { poskasService } from '../../../../services/poskasService';
import { toast } from 'react-hot-toast';
import { ArrowLeft, Calendar, FileText, RefreshCw, Save } from 'lucide-react';
import { getEnvironmentConfig } from '../../../../config/environment';

const OwnerPoskasForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { user } = useAuth();
  const envConfig = getEnvironmentConfig();
  const isEditMode = Boolean(id);
  
  // Add CSS for editor images
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      [contenteditable="true"] img {
        max-width: 100% !important;
        height: auto !important;
        margin: 10px 0 !important;
        border-radius: 4px !important;
        box-shadow: 0 2px 4px rgba(0,0,0,0.1) !important;
        display: block !important;
      }
      .pasted-image {
        max-width: 100% !important;
        height: auto !important;
        margin: 10px 0 !important;
        border-radius: 4px !important;
        box-shadow: 0 2px 4px rgba(0,0,0,0.1) !important;
        display: block !important;
        border: 1px solid #e5e7eb !important;
      }
      .image-placeholder {
        background: #f3f4f6;
        border: 2px dashed #d1d5db;
        border-radius: 8px;
        padding: 20px;
        text-align: center;
        color: #6b7280;
        font-style: italic;
        margin: 10px 0;
      }
      [contenteditable="true"]:empty:before {
        content: attr(data-placeholder);
        color: #9ca3af;
        font-style: italic;
        pointer-events: none;
      }
      [contenteditable="true"]:focus:empty:before {
        content: "";
      }
    `;
    document.head.appendChild(style);
    
    return () => {
      document.head.removeChild(style);
    };
  }, []);
  
  const [formData, setFormData] = useState({
    tanggal_poskas: new Date().toISOString().split('T')[0],
    isi_poskas: '',
    images: []
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedImages, setSelectedImages] = useState([]);
  const [imagePreviewUrls, setImagePreviewUrls] = useState([]);
  const [imageIdMap, setImageIdMap] = useState(new Map()); // Map untuk tracking image ID
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef(null);
  const editorRef = useRef(null);

  // Load existing data if in edit mode
  useEffect(() => {
    if (isEditMode && id) {
      loadExistingData();
    }
  }, [isEditMode, id]);

  const loadExistingData = async () => {
    try {
      setLoading(true);
      const response = await poskasService.getPoskasById(id);
      
      if (response.success) {
        const data = response.data;
        setFormData({
          tanggal_poskas: data.tanggal_poskas || new Date().toISOString().split('T')[0],
          isi_poskas: data.isi_poskas || '',
          images: data.images || []
        });
        
        // Process existing images if any
        if (data.images && Array.isArray(data.images)) {
          const processedImages = data.images.map((img, index) => ({
            file: null, // We don't have the actual file in edit mode
            id: img.id || `existing-${index}`,
            url: img.url || img,
            isExisting: true
          }));
          
          setSelectedImages(processedImages);
          setImagePreviewUrls(processedImages.map(img => img.url));
          
          // Create image ID map for existing images
          const newImageIdMap = new Map();
          processedImages.forEach(img => {
            if (img.id) {
              newImageIdMap.set(img.id, img);
            }
          });
          setImageIdMap(newImageIdMap);
        }
      } else {
        toast.error('Gagal memuat data pos kas');
      }
    } catch (error) {
      console.error('Error loading existing data:', error);
      toast.error('Gagal memuat data pos kas');
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

  const handleEditorChange = (e) => {
    setFormData(prev => ({
      ...prev,
      isi_poskas: e.target.innerHTML
    }));
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    const validFiles = files.filter(file => file.type.startsWith('image/'));
    
    if (validFiles.length === 0) {
      toast.error('Pilih file gambar yang valid');
      return;
    }
    
    const newImages = validFiles.map(file => ({
      file,
      id: `new-${Date.now()}-${Math.random()}`,
      url: URL.createObjectURL(file),
      isExisting: false
    }));
    
    setSelectedImages(prev => [...prev, ...newImages]);
    setImagePreviewUrls(prev => [...prev, ...newImages.map(img => img.url)]);
    
    // Clear file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removeImage = (imageId) => {
    setSelectedImages(prev => prev.filter(img => img.id !== imageId));
    setImagePreviewUrls(prev => prev.filter((url, index) => {
      const img = selectedImages[index];
      return img && img.id !== imageId;
    }));
    
    // Remove from image ID map
    const newImageIdMap = new Map(imageIdMap);
    newImageIdMap.delete(imageId);
    setImageIdMap(newImageIdMap);
  };

  const handlePaste = (e) => {
    const items = e.clipboardData?.items;
    if (!items) return;
    
    for (let item of items) {
      if (item.type.startsWith('image/')) {
        const file = item.getAsFile();
        if (file) {
          const newImage = {
            file,
            id: `pasted-${Date.now()}-${Math.random()}`,
            url: URL.createObjectURL(file),
            isExisting: false
          };
          
          setSelectedImages(prev => [...prev, newImage]);
          setImagePreviewUrls(prev => [...prev, newImage.url]);
          
          toast.success('Gambar berhasil di-paste');
        }
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.tanggal_poskas || !formData.isi_poskas.trim()) {
      toast.error('Mohon isi semua field yang diperlukan');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const formDataToSend = new FormData();
      formDataToSend.append('tanggal_poskas', formData.tanggal_poskas);
      formDataToSend.append('isi_poskas', formData.isi_poskas);
      
      // Add new images
      selectedImages.forEach(img => {
        if (!img.isExisting && img.file) {
          formDataToSend.append('images', img.file);
        }
      });
      
      // Add existing image IDs
      const existingImageIds = selectedImages
        .filter(img => img.isExisting && img.id)
        .map(img => img.id);
      
      if (existingImageIds.length > 0) {
        formDataToSend.append('existing_image_ids', JSON.stringify(existingImageIds));
      }
      
      let response;
      if (isEditMode) {
        response = await poskasService.updateOwnerPoskas(id, formDataToSend);
      } else {
        response = await poskasService.createOwnerPoskas(formDataToSend);
      }
      
      if (response.success) {
        toast.success(isEditMode ? 'Pos kas berhasil diperbarui' : 'Pos kas berhasil dibuat');
        navigate('/owner/keuangan/poskas');
      } else {
        toast.error(response.message || 'Gagal menyimpan pos kas');
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      toast.error('Gagal menyimpan pos kas');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    navigate('/owner/keuangan/poskas');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 text-red-500 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Memuat data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={handleCancel}
                className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {isEditMode ? 'Edit Pos Kas' : 'Tambah Pos Kas Baru'}
                </h1>
                <p className="text-gray-600">
                  {isEditMode ? 'Perbarui informasi pos kas' : 'Buat laporan pos kas baru'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Date Input */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Calendar className="inline h-4 w-4 mr-2" />
              Tanggal Pos Kas
            </label>
            <input
              type="date"
              name="tanggal_poskas"
              value={formData.tanggal_poskas}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              required
            />
          </div>

          {/* Content Editor */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <FileText className="inline h-4 w-4 mr-2" />
              Isi Pos Kas
            </label>
            <div
              ref={editorRef}
              contentEditable
              data-placeholder="Ketik atau paste konten pos kas di sini..."
              onInput={handleEditorChange}
              onPaste={handlePaste}
              className="min-h-[200px] p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              dangerouslySetInnerHTML={{ __html: formData.isi_poskas }}
            />
            <p className="text-sm text-gray-500 mt-2">
              Anda dapat mengetik langsung, paste teks, atau paste gambar dari clipboard
            </p>
          </div>

          {/* Image Upload */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Gambar (Opsional)
            </label>
            
            {/* Upload Button */}
            <div className="mb-4">
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Pilih Gambar
              </button>
              <p className="text-sm text-gray-500 mt-1">
                Drag & drop gambar atau paste dari clipboard
              </p>
            </div>

            {/* Image Preview */}
            {imagePreviewUrls.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {selectedImages.map((img, index) => (
                  <div key={img.id} className="relative group">
                    <img
                      src={img.url}
                      alt={`Preview ${index + 1}`}
                      className="w-full h-32 object-cover rounded-lg border border-gray-200"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(img.id)}
                      className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Submit Buttons */}
          <div className="flex items-center justify-end space-x-4">
            <button
              type="button"
              onClick={handleCancel}
              className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              {isSubmitting ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  <span>Menyimpan...</span>
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  <span>{isEditMode ? 'Perbarui' : 'Simpan'}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default OwnerPoskasForm;