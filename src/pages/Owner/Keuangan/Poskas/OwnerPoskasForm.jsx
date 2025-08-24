import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../../../../contexts/AuthContext';
import { poskasService } from '../../../../services/poskasService';
import { toast } from 'react-hot-toast';
import { Calendar, FileText, ArrowLeft, Save, RefreshCw } from 'lucide-react';
import getEnvironmentConfig from '../../../../config/environment';

const OwnerPoskasForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { user } = useAuth();
  const editorRef = useRef(null);
  const [loading, setLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedImages, setSelectedImages] = useState([]);
  
  const [formData, setFormData] = useState({
    tanggal_poskas: '',
    isi_poskas: '',
    images: []
  });

  // Dynamic CSS for editor images
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      [contenteditable] img {
        max-width: 100%;
        height: auto;
        border-radius: 8px;
        margin: 8px 0;
        box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        cursor: pointer;
        transition: transform 0.2s;
      }
      [contenteditable] img:hover {
        transform: scale(1.02);
      }
    `;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, []);

  // Check if this is edit mode and load data
  useEffect(() => {
    if (id) {
      setIsEditMode(true);
      fetchPoskasDetail();
    } else {
      // Set default date to today for new poskas
      const today = new Date().toISOString().split('T')[0];
      setFormData(prev => ({ ...prev, tanggal_poskas: today }));
    }
  }, [id]);

  // Fetch poskas detail for editing
  const fetchPoskasDetail = async () => {
    setLoading(true);
    try {
      const response = await poskasService.getPoskasById(id);
      if (response.success && response.data) {
        const poskas = response.data;
        
        // Parse images if they exist
        let parsedImages = [];
        if (poskas.images) {
          parsedImages = parseImagesString(poskas.images);
        }
        
        // Replace [IMG:id] placeholders with actual image tags
        let processedContent = poskas.isi_poskas || '';
        if (parsedImages.length > 0) {
          parsedImages.forEach(img => {
            const placeholder = `[IMG:${img.id}]`;
            const imageUrl = img.url?.startsWith('http') ? img.url : `${envConfig.BASE_URL}${img.url}`;
            const imgTag = `<img src="${imageUrl}" alt="Poskas Image" data-img-id="${img.id}" />`;
            processedContent = processedContent.replace(new RegExp(placeholder, 'g'), imgTag);
          });
        }
        
        // Process tanggal_poskas
        let formattedDate = '';
        if (poskas.tanggal_poskas) {
          const date = new Date(poskas.tanggal_poskas);
          formattedDate = date.toISOString().split('T')[0];
        }
        
        setFormData({
          tanggal_poskas: formattedDate,
          isi_poskas: processedContent,
          images: parsedImages
        });
        
        setSelectedImages(parsedImages);
      }
    } catch (error) {
      console.error('Error fetching poskas detail:', error);
      toast.error('Gagal memuat data poskas');
    } finally {
      setLoading(false);
    }
  };

  // Parse images string utility
  const parseImagesString = (imagesData) => {
    if (!imagesData) return [];
    
    try {
      // If it's already an array
      if (Array.isArray(imagesData)) {
        return imagesData.map(img => {
          if (typeof img === 'string') {
            return {
              id: Date.now() + Math.random(),
              name: img,
              url: img.startsWith('/') ? img : `/uploads/poskas/${img}`,
              uri: `file://temp/${img}`
            };
          }
          return img;
        });
      }
      
      // If it's a JSON string
      if (typeof imagesData === 'string') {
        // Try to parse as JSON first
        try {
          const parsed = JSON.parse(imagesData);
          if (Array.isArray(parsed)) {
            return parsed;
          }
        } catch (e) {
          // If not JSON, treat as single image name
          return [{
            id: Date.now(),
            name: imagesData,
            url: imagesData.startsWith('/') ? imagesData : `/uploads/poskas/${imagesData}`,
            uri: `file://temp/${imagesData}`
          }];
        }
      }
      
      // If it's an object
      if (typeof imagesData === 'object') {
        return [imagesData];
      }
      
      return [];
    } catch (error) {
      console.error('Error parsing images:', error);
      return [];
    }
  };

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle editor changes
  const handleEditorChange = () => {
    if (editorRef.current) {
      const content = editorRef.current.innerHTML;
      setFormData(prev => ({
        ...prev,
        isi_poskas: content
      }));
    }
  };

  // Ensure editor has proper content
  const ensureEditorContent = () => {
    if (editorRef.current && !editorRef.current.innerHTML.trim()) {
      editorRef.current.innerHTML = formData.isi_poskas || '';
    }
  };

  // Handle paste events in editor (for images)
  const handleEditorPaste = async (e) => {
    const items = e.clipboardData?.items;
    if (!items) return;

    for (let item of items) {
      if (item.type.indexOf('image') !== -1) {
        e.preventDefault();
        
        const file = item.getAsFile();
        if (file) {
          // Validate image
          if (file.size > 5 * 1024 * 1024) {
            toast.error('Ukuran gambar tidak boleh lebih dari 5MB');
            return;
          }

          if (selectedImages.length >= 10) {
            toast.error('Maksimal 10 gambar per laporan');
            return;
          }

          // Create image preview
          const reader = new FileReader();
          reader.onload = (event) => {
            const imageId = Date.now() + Math.random();
            const img = document.createElement('img');
            img.src = event.target.result;
            img.setAttribute('data-img-id', imageId);
            img.style.maxWidth = '100%';
            img.style.height = 'auto';
            img.style.borderRadius = '8px';
            img.style.margin = '8px 0';
            img.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)';
            
            // Insert image at cursor position
            const selection = window.getSelection();
            if (selection.rangeCount > 0) {
              const range = selection.getRangeAt(0);
              range.insertNode(img);
              range.collapse(false);
            } else {
              editorRef.current.appendChild(img);
            }

            // Add to selected images
            const newImage = {
              id: imageId,
              file: file,
              preview: event.target.result,
              name: `poskas_${imageId}.jpg`
            };
            
            setSelectedImages(prev => [...prev, newImage]);
            handleEditorChange();
          };
          reader.readAsDataURL(file);
        }
      }
    }
  };

  // Get editor content with [IMG:id] placeholders
  const getEditorContent = () => {
    if (!editorRef.current) return '';
    
    let content = editorRef.current.innerHTML;
    
    // Replace img tags with [IMG:id] placeholders
    const imgTags = editorRef.current.querySelectorAll('img');
    imgTags.forEach(img => {
      const imgId = img.getAttribute('data-img-id');
      if (imgId) {
        const placeholder = `[IMG:${imgId}]`;
        content = content.replace(img.outerHTML, placeholder);
      } else if (img.src.startsWith('data:')) {
        // Handle base64 images (newly pasted)
        const imgId = Date.now() + Math.random();
        const placeholder = `[IMG:${imgId}]`;
        content = content.replace(img.outerHTML, placeholder);
        
        // Add to selected images if not already there
        const existingImage = selectedImages.find(si => si.preview === img.src);
        if (!existingImage) {
          // Convert base64 to file
          fetch(img.src)
            .then(res => res.blob())
            .then(blob => {
              const file = new File([blob], `poskas_${imgId}.jpg`, { type: 'image/jpeg' });
              const newImage = {
                id: imgId,
                file: file,
                preview: img.src,
                name: `poskas_${imgId}.jpg`
              };
              setSelectedImages(prev => [...prev, newImage]);
            });
        }
      }
    });
    
    // Clean up HTML tags and return plain text with image placeholders
    return content
      .replace(/<div><br><\/div>/g, '\n')
      .replace(/<div>/g, '\n')
      .replace(/<\/div>/g, '')
      .replace(/<br>/g, '\n')
      .replace(/<[^>]*>/g, '')
      .trim();
  };

  // Validate form
  const validateForm = () => {
    if (!formData.tanggal_poskas) {
      toast.error('Tanggal laporan harus diisi');
      return false;
    }
    
    const editorContent = getEditorContent();
    if (!editorContent || editorContent.trim() === '') {
      toast.error('Isi laporan tidak boleh kosong');
      return false;
    }
    
    if (editorContent.trim().length < 10) {
      toast.error('Isi laporan minimal 10 karakter');
      return false;
    }
    
    return true;
  };

  // Upload images to server
  const uploadImagesToServer = async (images) => {
    if (!images || images.length === 0) {
      console.log('📁 No images to upload');
      return [];
    }

    console.log('📁 Uploading', images.length, 'images to server...');
    
    try {
      const formData = new FormData();
      
      images.forEach((image, index) => {
        if (image.file) {
          console.log(`📎 Adding image ${index + 1}:`, {
            name: image.name,
            size: image.file.size,
            type: image.file.type
          });
          formData.append('images', image.file, image.name);
        }
      });
      
      console.log('📤 Sending upload request to /api/upload/poskas');
      
      const response = await fetch(`${envConfig.BASE_URL}/api/upload/poskas`, {
        method: 'POST',
        body: formData,
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      console.log('📥 Upload response status:', response.status);
      
      if (!response.ok) {
        console.error('❌ Response not OK:', response.status, response.statusText);
        const errorText = await response.text();
        console.error('❌ Error response body:', errorText);
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const result = await response.json();
      console.log('📥 Response data:', JSON.stringify(result, null, 2));

      if (result.success) {
        console.log('✅ POSKAS image upload successful!');
        console.log('✅ Uploaded files:', result.data);
        return result.data;
      } else {
        console.error('❌ Upload failed:', result.message);
        toast.error(result.message || 'Gagal mengupload gambar');
        return [];
      }
    } catch (error) {
      console.error('❌ Error uploading POSKAS images:', error);
      toast.error(`Gagal mengupload gambar: ${error.message}`);
      return [];
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    console.log('🔍 Debug: Form submission started');
    
    // Ensure editor has proper content
    ensureEditorContent();
    
    // Get content from editor dengan format [IMG:id]
    const editorContent = getEditorContent();
    console.log('🔍 Debug: Editor content:', editorContent);
    
    // Double check validation
    if (!formData.tanggal_poskas) {
      toast.error('Tanggal laporan harus diisi');
      return;
    }
    
    if (!editorContent || editorContent.trim() === '') {
      toast.error('Isi laporan tidak boleh kosong');
      return;
    }
    
    if (editorContent.trim().length < 10) {
      toast.error('Isi laporan minimal 10 karakter');
      return;
    }
    
    if (!validateForm()) return;
    
    setIsSubmitting(true);

    try {
      if (isEditMode) {
        // Update existing poskas
        const response = await poskasService.updatePoskas(id, {
          tanggal_poskas: formData.tanggal_poskas,
          isi_poskas: editorContent,
          images: formData.images
        });
        
        if (response.success) {
          toast.success('Laporan pos kas berhasil diperbarui');
          navigate('/owner/keuangan/poskas');
        } else {
          toast.error(response.message || 'Gagal memperbarui laporan');
        }
      } else {
        // Create new poskas (existing logic)
        // Upload images to server first
        console.log('📁 Starting image upload process...');
        const uploadedFiles = await uploadImagesToServer(selectedImages);
        
        // Update images array with server URLs
        const imagesWithServerUrls = selectedImages.map((img, index) => {
          const uploadedFile = uploadedFiles[index];
          
          if (uploadedFile) {
            console.log(`🖼️ Image ${index + 1}:`, {
              originalId: img.id,
              serverUrl: uploadedFile.url,
              serverPath: uploadedFile.path
            });
            
            return {
              uri: `file://temp/${img.id}.jpg`, // Simulasi URI untuk mobile
              id: img.id,
              name: `poskas_${img.id}.jpg`,
              url: `${envConfig.BASE_URL}${uploadedFile.url}`, // URL lengkap dengan IP untuk mobile
              serverPath: uploadedFile.path // Path dari server
            };
          } else {
            // Fallback jika upload gagal
            return {
              uri: `file://temp/${img.id}.jpg`,
              id: img.id,
              name: `poskas_${img.id}.jpg`,
              url: `${envConfig.BASE_URL}/uploads/poskas/temp_${img.id}.jpg`,
              serverPath: `poskas/temp_${img.id}.jpg`
            };
          }
        });

        // Buat data sesuai format backend yang sudah ada
        const finalFormData = {
          tanggal_poskas: formData.tanggal_poskas,
          isi_poskas: editorContent,
          images: imagesWithServerUrls // Kirim sebagai array object, bukan JSON string
        };
        
        console.log('🔍 Debug: Final form data:', finalFormData);
        console.log('🔍 Debug: Selected images:', selectedImages);
        console.log('🔍 Debug: User info:', user);
        console.log('🔍 Debug: Images JSON string:', JSON.stringify(imagesWithServerUrls));
        console.log('🔍 Debug: Images length:', imagesWithServerUrls.length);
        
        // Gunakan service yang sudah ada (tanpa FormData)
        const response = await poskasService.createPoskas(finalFormData);
        
        console.log('🔍 Debug: Service response:', response);
        console.log('🔍 Debug: Data sent to service:', finalFormData);
        console.log('🔍 Debug: Images field type:', typeof finalFormData.images);
        console.log('🔍 Debug: Images field value:', finalFormData.images);

      if (response.success) {
          toast.success('Laporan pos kas berhasil disimpan');
        navigate('/owner/keuangan/poskas');
      } else {
          toast.error(response.message || 'Gagal menyimpan laporan');
        }
      }
    } catch (error) {
      console.error('❌ Error submitting poskas:', error);
      console.error('❌ Error details:', {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data,
        config: error.config
      });
      
      // Provide specific error messages based on error type
      if (error.response?.status === 404) {
        toast.error('Backend server tidak ditemukan. Pastikan server berjalan di port 3000');
      } else if (error.response?.status === 401) {
        toast.error('Sesi Anda telah berakhir. Silakan login ulang');
        navigate('/login');
      } else if (error.code === 'ERR_NETWORK') {
        toast.error('Tidak dapat terhubung ke server. Periksa koneksi internet atau status server');
      } else {
        toast.error('Terjadi kesalahan saat menyimpan laporan: ' + (error.response?.data?.message || error.message));
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="p-6 bg-gray-50 min-h-screen">
        <div className="bg-white rounded-lg shadow-sm border p-12">
          <div className="flex justify-center items-center">
            <div className="text-center">
              <RefreshCw className="h-12 w-12 animate-spin text-red-600 mx-auto mb-4" />
              <p className="text-gray-600 text-lg font-medium">
                {isEditMode ? 'Memuat data untuk diedit...' : 'Memuat form...'}
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header Section */}
      <div className="bg-white rounded-lg shadow-sm border mb-6">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/owner/keuangan/poskas')}
              className="p-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
              <ArrowLeft className="h-4 w-4" />
              </button>
              <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {isEditMode ? 'Edit Pos Kas' : 'Tambah Pos Kas'}
              </h1>
              <p className="text-gray-600">
                {isEditMode ? 'Perbarui data posisi kas' : 'Tambah data posisi kas baru'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Form Section */}
      <div className="bg-white rounded-lg shadow-sm border">
        <form onSubmit={handleSubmit}>
            {/* Tanggal Pos Kas */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-2 bg-red-100 rounded-lg">
                <Calendar className="h-5 w-5 text-red-600" />
              </div>
              <label className="text-lg font-semibold text-gray-900">
                Tanggal Pos Kas
              </label>
            </div>
                <input
                  type="date"
                  name="tanggal_poskas"
                  value={formData.tanggal_poskas}
                  onChange={handleInputChange}
                  required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                />
            <p className="text-sm text-gray-500 mt-2">
              Pilih tanggal untuk posisi kas ini
            </p>
            </div>

          {/* Isi Pos Kas Editor */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-2 bg-green-100 rounded-lg">
                <FileText className="h-5 w-5 text-green-600" />
              </div>
              <label className="text-lg font-semibold text-gray-900">
                Isi Pos Kas
              </label>
            </div>

            <div className="space-y-4">
              <div
                ref={editorRef}
                contentEditable
                data-placeholder="Masukkan isi posisi kas... Anda bisa paste gambar langsung dari clipboard (Ctrl+V)"
                onInput={handleEditorChange}
                onPaste={handleEditorPaste}
                className="min-h-[300px] p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none"
                style={{ whiteSpace: 'pre-wrap' }}
                dangerouslySetInnerHTML={isEditMode ? { __html: formData.isi_poskas } : undefined}
              />
              
              <p className="text-sm text-gray-500">
                💡 Tips: Anda bisa paste gambar langsung dari clipboard (Ctrl+V)
              </p>
            </div>
          </div>

          {/* Submit Buttons */}
          <div className="flex space-x-4 p-6">
            <button
              type="button"
              onClick={() => navigate('/owner/keuangan/poskas')}
              className="px-6 py-3 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center space-x-2 px-6 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                  <RefreshCw className="h-4 w-4 animate-spin" />
              ) : (
                  <Save className="h-4 w-4" />
              )}
              <span>{isSubmitting ? 'Menyimpan...' : (isEditMode ? 'Perbarui' : 'Simpan')}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default OwnerPoskasForm;

