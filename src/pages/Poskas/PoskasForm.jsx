import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { poskasService } from '../../services/poskasService';
import { toast } from 'react-hot-toast';

const PoskasForm = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  
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
  const fileInputRef = useRef(null);
  const editorRef = useRef(null);

  // Handle text editor changes
  const handleEditorChange = (e) => {
    const content = e.target.innerHTML;
    console.log('🔍 Debug: Editor content changed:', content);
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
          
          // Check total image count
          if (selectedImages.length >= 5) {
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

    // Check total image count
    if (selectedImages.length + validFiles.length > 5) {
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

  // Remove image
  const removeImage = (index) => {
    setSelectedImages(prev => prev.filter((_, i) => i !== index));
    setImagePreviewUrls(prev => prev.filter((_, i) => i !== index));
  };

  // Validate form data
  const validateForm = () => {
    if (!formData.tanggal_poskas) {
      toast.error('Tanggal laporan harus diisi');
      return false;
    }
    
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
    
    // Get content from editor
    const editorContent = getEditorContent();
    const finalFormData = {
      ...formData,
      isi_poskas: editorContent
    };
    
    console.log('🔍 Debug: Final form data:', finalFormData);
    
    if (!validateForm()) return;
    
    console.log('🔍 Debug: Form submission started');
    console.log('🔍 Debug: Selected images:', selectedImages);
    console.log('🔍 Debug: User info:', user);
    
    setIsSubmitting(true);

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('tanggal_poskas', finalFormData.tanggal_poskas);
      formDataToSend.append('isi_poskas', finalFormData.isi_poskas);

      // Add images to form data
      selectedImages.forEach((image, index) => {
        formDataToSend.append('images', image);
        console.log('🔍 Debug: Added image', index, ':', image.name, image.size);
      });

      console.log('🔍 Debug: Sending form data to service...');
      console.log('🔍 Debug: FormData entries:');
      for (let [key, value] of formDataToSend.entries()) {
        console.log('🔍 Debug:', key, ':', value);
      }
      
      // Use the correct service method
      const response = await poskasService.createPoskasWithImages(formDataToSend);
      
      console.log('🔍 Debug: Service response:', response);
      
      if (response.success) {
        toast.success('Laporan pos kas berhasil disimpan');
        navigate('/poskas');
      } else {
        toast.error(response.message || 'Gagal menyimpan laporan');
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
  };

  // Handle text-only submission
  const handleTextOnlySubmit = async (e) => {
    e.preventDefault();
    
    // Get content from editor
    const editorContent = getEditorContent();
    const finalFormData = {
      ...formData,
      isi_poskas: editorContent
    };
    
    console.log('🔍 Debug: Text-only submission started');
    console.log('🔍 Debug: Final form data:', finalFormData);
    
    if (!validateForm()) return;
    
    setIsSubmitting(true);

    try {
      console.log('🔍 Debug: Sending text-only data to service...');
      const response = await poskasService.createPoskas({
        tanggal_poskas: finalFormData.tanggal_poskas,
        isi_poskas: finalFormData.isi_poskas
      });
      
      console.log('🔍 Debug: Service response:', response);
      
      if (response.success) {
        toast.success('Laporan pos kas berhasil disimpan');
        navigate('/poskas');
      } else {
        toast.error(response.message || 'Gagal menyimpan laporan');
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
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold text-gray-800">
              Laporan Pos Kas
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
                ></div>
              </div>
              <p className="text-sm text-gray-500 mt-1">
                Minimal 10 karakter. Gunakan toolbar di atas untuk formatting. 
                <br />
                <span className="text-blue-600">💡 Tips: Anda bisa paste gambar langsung ke editor (Ctrl+V)</span>
              </p>
            </div>

            {/* Image Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Upload Gambar (Opsional)
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
                  Pilih Gambar
                </button>
                <p className="text-sm text-gray-500 mt-2">
                  Maksimal 5 gambar, ukuran maksimal 10MB per gambar
                </p>
              </div>

              {/* Image Previews */}
              {imagePreviewUrls.length > 0 && (
                <div className="mt-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Gambar yang Dipilih:</h4>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {imagePreviewUrls.map((url, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={url}
                          alt={`Preview ${index + 1}`}
                          className="w-full h-32 object-cover rounded-lg"
                        />
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
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

export default PoskasForm; 