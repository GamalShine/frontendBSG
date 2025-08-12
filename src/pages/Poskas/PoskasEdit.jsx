import React, { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { poskasService } from '../../services/poskasService';
import { toast } from 'react-hot-toast';

const PoskasEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    tanggal_poskas: '',
    isi_poskas: '',
    images: []
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedImages, setSelectedImages] = useState([]);
  const [imagePreviewUrls, setImagePreviewUrls] = useState([]);
  const [existingImages, setExistingImages] = useState([]);
  const fileInputRef = useRef(null);
  const editorRef = useRef(null);

  useEffect(() => {
    fetchPoskasDetail();
  }, [id]);

  const fetchPoskasDetail = async () => {
    try {
      setLoading(true);
      const response = await poskasService.getPoskasById(id);
      
      if (response.success) {
        const poskas = response.data;
        
        // Convert text with [IMG:id] placeholders to HTML for editor
        let editorContent = poskas.isi_poskas || '';
        
        // Parse existing images
        const parsedImages = parseImages(poskas.images);
        setExistingImages(parsedImages);
        
        // Replace [IMG:id] placeholders with actual image tags for editor
        if (Array.isArray(parsedImages)) {
          parsedImages.forEach((image, index) => {
            const imgTag = `<img src="http://192.168.30.21:3000${image.url}" alt="Gambar ${index + 1}" class="max-w-full h-auto my-2 rounded-lg shadow-sm" />`;
            const placeholderRegex = new RegExp(`\\[IMG:${image.id}\\]`, 'g');
            editorContent = editorContent.replace(placeholderRegex, imgTag);
          });
        }
        
        // Convert line breaks to <br> tags for editor
        editorContent = editorContent.replace(/\n/g, '<br>');
        
        setFormData({
          tanggal_poskas: poskas.tanggal_poskas,
          isi_poskas: editorContent,
          images: poskas.images || []
        });
      } else {
        setError(response.message || 'Gagal memuat detail laporan');
        toast.error(response.message || 'Gagal memuat detail laporan');
      }
    } catch (error) {
      console.error('Error fetching poskas detail:', error);
      setError('Terjadi kesalahan saat memuat detail laporan');
      
      if (error.response?.status === 404) {
        toast.error('Laporan tidak ditemukan atau backend server tidak berjalan');
      } else if (error.code === 'ERR_NETWORK') {
        toast.error('Tidak dapat terhubung ke server. Periksa koneksi internet atau status server');
      } else {
        toast.error('Gagal memuat detail laporan: ' + error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const parseImages = (imagesString) => {
    if (!imagesString) return [];
    try {
      const parsed = JSON.parse(imagesString);
      return Array.isArray(parsed) ? parsed : [];
    } catch (error) {
      console.error('Error parsing images:', error);
      return [];
    }
  };

  // Handle text editor changes
  const handleEditorChange = (e) => {
    const content = e.target.innerHTML;
    setFormData(prev => ({
      ...prev,
      isi_poskas: content
    }));
  };

  // Handle paste event in editor
  const handleEditorPaste = async (e) => {
    const items = e.clipboardData.items;
    
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      
      if (item.type.indexOf('image') !== -1) {
        e.preventDefault();
        
        const file = item.getAsFile();
        if (file) {
          console.log('📸 Pasted image detected:', file.name, file.size);
          
          // Validate file size
          if (file.size > 10 * 1024 * 1024) { // 10MB limit
            toast.error('Gambar terlalu besar. Maksimal 10MB');
            return;
          }
          
          // Check total image count (existing + new)
          if (existingImages.length + selectedImages.length >= 5) {
            toast.error('Maksimal 5 gambar per laporan');
            return;
          }
          
          // Add to selected images
          setSelectedImages(prev => [...prev, file]);
          
          // Create preview URL and insert image into editor
          const reader = new FileReader();
          reader.onload = (e) => {
            const imageUrl = e.target.result;
            
            // Add to preview URLs
            setImagePreviewUrls(prev => [...prev, imageUrl]);
            
            // Create image element for editor
            const img = document.createElement('img');
            img.src = imageUrl;
            img.alt = 'Pasted image';
            img.className = 'pasted-image';
            img.setAttribute('data-image-id', file.name); // Add data attribute for ID
            
            // Insert image into editor at cursor position
            const selection = window.getSelection();
            if (selection.rangeCount > 0) {
              const range = selection.getRangeAt(0);
              range.deleteContents();
              range.insertNode(img);
              range.collapse(false);
              
              // Add a line break after the image
              const br = document.createElement('br');
              range.insertNode(br);
              range.collapse(false);
              
              // Trigger editor change event
              const event = new Event('input', { bubbles: true });
              editorRef.current.dispatchEvent(event);
            }
            
            toast.success('Gambar berhasil ditambahkan');
          };
          reader.readAsDataURL(file);
        }
      }
    }
  };

  // Handle image selection
  const handleImageSelect = (e) => {
    const files = Array.from(e.target.files);
    
    // Validate file types
    const validFiles = files.filter(file => {
      if (!file.type.startsWith('image/')) {
        toast.error(`${file.name} bukan file gambar yang valid`);
        return false;
      }
      if (file.size > 10 * 1024 * 1024) { // 10MB limit
        toast.error(`${file.name} terlalu besar. Maksimal 10MB`);
        return false;
      }
      return true;
    });

    // Check total image count (existing + new)
    if (existingImages.length + selectedImages.length + validFiles.length > 5) {
      toast.error('Maksimal 5 gambar per laporan');
      return;
    }

    setSelectedImages(prev => [...prev, ...validFiles]);

    // Create preview URLs
    validFiles.forEach(file => {
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreviewUrls(prev => [...prev, e.target.result]);
      };
      reader.readAsDataURL(file);
    });
  };

  // Remove new image
  const removeNewImage = (index) => {
    setSelectedImages(prev => prev.filter((_, i) => i !== index));
    setImagePreviewUrls(prev => prev.filter((_, i) => i !== index));
  };

  // Remove existing image
  const removeExistingImage = (index) => {
    setExistingImages(prev => prev.filter((_, i) => i !== index));
  };

  // Validate form data
  const validateForm = () => {
    const editorContent = editorRef.current?.innerHTML || '';
    // Remove base64 images for validation purposes
    const cleanContent = editorContent.replace(/<img[^>]*src="data:image[^"]*"[^>]*>/g, '').trim();
    
    if (!cleanContent) {
      toast.error('Isi laporan tidak boleh kosong');
      return false;
    }
    
    if (cleanContent.length < 10) {
      toast.error('Isi laporan minimal 10 karakter');
      return false;
    }
    
    return true;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    // Get content from editor
    const editorContent = getEditorContent();
    const finalFormData = {
      ...formData,
      isi_poskas: editorContent
    };
    
    console.log('🔍 Debug: Form submission started');
    console.log('🔍 Debug: Form data:', finalFormData);
    console.log('🔍 Debug: Selected images:', selectedImages);
    console.log('🔍 Debug: Existing images:', existingImages);
    
    setIsSubmitting(true);

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('tanggal_poskas', finalFormData.tanggal_poskas);
      formDataToSend.append('isi_poskas', finalFormData.isi_poskas);

      // Add new images to form data
      selectedImages.forEach((image, index) => {
        formDataToSend.append('images', image);
      });

      // Add existing images info
      if (existingImages.length > 0) {
        formDataToSend.append('existing_images', JSON.stringify(existingImages));
      }

      console.log('🔍 Debug: Sending form data to service...');
      const response = await poskasService.updatePoskasWithImages(id, formDataToSend);
      
      console.log('🔍 Debug: Service response:', response);
      
      if (response.success) {
        toast.success('Laporan pos kas berhasil diperbarui');
        navigate('/poskas');
      } else {
        toast.error(response.message || 'Gagal memperbarui laporan');
      }
    } catch (error) {
      console.error('❌ Error updating poskas:', error);
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
        toast.error('Terjadi kesalahan saat memperbarui laporan: ' + (error.response?.data?.message || error.message));
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle text-only submission
  const handleTextOnlySubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    // Get content from editor
    const editorContent = getEditorContent();
    const finalFormData = {
      ...formData,
      isi_poskas: editorContent
    };
    
    console.log('🔍 Debug: Text-only submission started');
    console.log('🔍 Debug: Form data:', finalFormData);
    
    setIsSubmitting(true);

    try {
      console.log('🔍 Debug: Sending text-only data to service...');
      const response = await poskasService.updatePoskas(id, {
        tanggal_poskas: finalFormData.tanggal_poskas,
        isi_poskas: finalFormData.isi_poskas
      });
      
      console.log('🔍 Debug: Service response:', response);
      
      if (response.success) {
        toast.success('Laporan pos kas berhasil diperbarui');
        navigate('/poskas');
      } else {
        toast.error(response.message || 'Gagal memperbarui laporan');
      }
    } catch (error) {
      console.error('❌ Error updating poskas:', error);
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
        toast.error('Terjadi kesalahan saat memperbarui laporan: ' + (error.response?.data?.message || error.message));
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Get editor content
  const getEditorContent = () => {
    if (editorRef.current) {
      const content = editorRef.current.innerHTML;
      console.log('🔍 Debug: Getting editor content:', content);
      
      // Convert HTML content to text with [IMG:id] placeholders
      let processedContent = content;
      
      // Replace base64 images with [IMG:id] placeholders
      const imgRegex = /<img[^>]*src="data:image[^"]*"[^>]*>/g;
      let imgMatch;
      let imgIndex = 0;
      
      while ((imgMatch = imgRegex.exec(content)) !== null) {
        // Generate a consistent ID that will match the database
        const timestamp = Date.now();
        const imgId = timestamp + Math.floor(Math.random() * 1000);
        const placeholder = `[IMG:${imgId}]`;
        processedContent = processedContent.replace(imgMatch[0], placeholder);
        imgIndex++;
      }
      
      // Remove any remaining HTML tags but keep line breaks
      processedContent = processedContent
        .replace(/<br\s*\/?>/gi, '\n') // Convert <br> to line breaks
        .replace(/<div[^>]*>/gi, '\n') // Convert <div> to line breaks
        .replace(/<\/div>/gi, '') // Remove closing div tags
        .replace(/<[^>]*>/g, '') // Remove all other HTML tags
        .replace(/&nbsp;/g, ' ') // Convert &nbsp; to spaces
        .replace(/&amp;/g, '&') // Convert &amp; to &
        .replace(/&lt;/g, '<') // Convert &lt; to <
        .replace(/&gt;/g, '>') // Convert &gt; to >
        .replace(/&quot;/g, '"') // Convert &quot; to "
        .replace(/&#39;/g, "'") // Convert &#39; to '
        .trim();
      
      console.log('🔍 Debug: Processed content:', processedContent);
      return processedContent;
    }
    return '';
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <h2 className="text-xl font-semibold text-red-800 mb-2">Error</h2>
            <p className="text-red-600 mb-4">{error}</p>
            <div className="space-x-4">
              <button
                onClick={fetchPoskasDetail}
                className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors"
              >
                Coba Lagi
              </button>
              <button
                onClick={() => navigate('/poskas')}
                className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-colors"
              >
                Kembali ke Daftar
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold text-gray-800">
              Edit Laporan Pos Kas
            </h1>
            <button
              onClick={() => navigate('/poskas')}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              ← Kembali
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Tanggal */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tanggal Laporan
              </label>
              <input
                type="date"
                value={formData.tanggal_poskas}
                onChange={(e) => setFormData(prev => ({ ...prev, tanggal_poskas: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            {/* Rich Text Editor */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Isi Laporan <span className="text-red-500">*</span>
              </label>
              <div className="border border-gray-300 rounded-md">
                {/* Toolbar */}
                <div className="bg-gray-50 px-3 py-2 border-b border-gray-300 flex items-center space-x-2">
                  <button
                    type="button"
                    onClick={() => document.execCommand('bold')}
                    className="px-2 py-1 text-sm bg-white border border-gray-300 rounded hover:bg-gray-100"
                    title="Bold"
                  >
                    <strong>B</strong>
                  </button>
                  <button
                    type="button"
                    onClick={() => document.execCommand('italic')}
                    className="px-2 py-1 text-sm bg-white border border-gray-300 rounded hover:bg-gray-100"
                    title="Italic"
                  >
                    <em>I</em>
                  </button>
                  <button
                    type="button"
                    onClick={() => document.execCommand('underline')}
                    className="px-2 py-1 text-sm bg-white border border-gray-300 rounded hover:bg-gray-100"
                    title="Underline"
                  >
                    <u>U</u>
                  </button>
                  <div className="w-px h-6 bg-gray-300"></div>
                  <button
                    type="button"
                    onClick={() => document.execCommand('insertUnorderedList')}
                    className="px-2 py-1 text-sm bg-white border border-gray-300 rounded hover:bg-gray-100"
                    title="Bullet List"
                  >
                    • List
                  </button>
                  <button
                    type="button"
                    onClick={() => document.execCommand('insertOrderedList')}
                    className="px-2 py-1 text-sm bg-white border border-gray-300 rounded hover:bg-gray-100"
                    title="Numbered List"
                  >
                    1. List
                  </button>
                </div>
                
                {/* Editor */}
                <div
                  ref={editorRef}
                  contentEditable
                  onInput={handleEditorChange}
                  onPaste={handleEditorPaste}
                  className="min-h-[200px] px-3 py-2 focus:outline-none"
                  placeholder="Tulis laporan pos kas Anda di sini... (minimal 10 karakter)"
                  style={{ 
                    whiteSpace: 'pre-wrap',
                    lineHeight: '1.6'
                  }}
                  dangerouslySetInnerHTML={{ __html: formData.isi_poskas }}
                ></div>
              </div>
              <p className="text-sm text-gray-500 mt-1">
                Minimal 10 karakter. Gunakan toolbar di atas untuk formatting.
              </p>
            </div>

            {/* Existing Images */}
            {Array.isArray(existingImages) && existingImages.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Gambar yang Ada ({existingImages.length})
                </label>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {existingImages.map((image, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={`http://192.168.30.21:3000${image.url}`}
                        alt={`Existing ${index + 1}`}
                        className="w-full h-32 object-cover rounded-lg"
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.nextSibling.style.display = 'flex';
                        }}
                      />
                      <div 
                        className="hidden w-full h-32 items-center justify-center text-gray-400 bg-gray-100 rounded-lg"
                        style={{ display: 'none' }}
                      >
                        <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeExistingImage(index)}
                        className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                        title="Hapus gambar"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* New Image Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Upload Gambar Baru (Opsional)
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleImageSelect}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
                >
                  Pilih Gambar Baru
                </button>
                <p className="text-sm text-gray-500 mt-2">
                  Maksimal 5 gambar total, ukuran maksimal 10MB per gambar
                </p>
              </div>

              {/* New Image Previews */}
              {imagePreviewUrls.length > 0 && (
                <div className="mt-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Gambar Baru yang Dipilih:</h4>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {imagePreviewUrls.map((url, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={url}
                          alt={`New Preview ${index + 1}`}
                          className="w-full h-32 object-cover rounded-lg"
                        />
                        <button
                          type="button"
                          onClick={() => removeNewImage(index)}
                          className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Submit Buttons */}
            <div className="flex space-x-4 pt-6">
              <button
                type="button"
                onClick={handleTextOnlySubmit}
                disabled={isSubmitting}
                className="flex-1 px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isSubmitting ? 'Menyimpan...' : 'Simpan (Tanpa Gambar)'}
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isSubmitting ? 'Menyimpan...' : 'Simpan dengan Gambar'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default PoskasEdit; 