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
          
          // Generate unique ID untuk gambar
          const imageId = Date.now() + Math.floor(Math.random() * 1000);
          
          // Add to selected images dengan ID
          const imageWithId = { file, id: imageId };
          setSelectedImages(prev => [...prev, imageWithId]);
          
          // Store mapping file -> ID
          setImageIdMap(prev => new Map(prev.set(file, imageId)));
          
          // Create preview URL and insert image into editor
          const reader = new FileReader();
          reader.onload = (e) => {
            const imageUrl = e.target.result;
            
            // Add to preview URLs
            setImagePreviewUrls(prev => [...prev, imageUrl]);
            
            // Create image element for editor dengan data-image-id
            const img = document.createElement('img');
            img.src = imageUrl;
            img.alt = 'Pasted image';
            img.className = 'pasted-image';
            img.setAttribute('data-image-id', imageId);
            
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

  // Get editor content dengan format [IMG:id] placeholder
  const getEditorContent = () => {
    if (!editorRef.current) {
      console.log('🔍 Debug: Editor ref not found');
      return '';
    }
    
    const content = editorRef.current.innerHTML;
    console.log('🔍 Debug: Raw editor HTML:', content);
    
    if (!content || content.trim() === '') {
      console.log('🔍 Debug: Editor content is empty');
      return '';
    }
    
    // Convert HTML content to text dengan [IMG:id] placeholders
    let processedContent = content;
    
    // Replace base64 images dengan [IMG:id] placeholders
    const imgRegex = /<img[^>]*data-image-id="([^"]*)"[^>]*>/g;
    let imgMatch;
    let imageCount = 0;
    
    while ((imgMatch = imgRegex.exec(content)) !== null) {
      const imageId = imgMatch[1];
      const placeholder = `[IMG:${imageId}]`;
      processedContent = processedContent.replace(imgMatch[0], placeholder);
      imageCount++;
      console.log(`🔍 Debug: Replaced image with placeholder: [IMG:${imageId}]`);
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
    
    console.log('🔍 Debug: Final processed content:', processedContent);
    console.log('🔍 Debug: Content length:', processedContent.length);
    console.log('🔍 Debug: Images found:', imageCount);
    
    return processedContent;
  };

  // Ensure editor has minimum content
  const ensureEditorContent = () => {
    if (editorRef.current) {
      const content = editorRef.current.innerHTML;
      if (!content || content.trim() === '' || content === '<br>' || content === '<div><br></div>') {
        editorRef.current.innerHTML = '';
        console.log('🔍 Debug: Editor content cleared for minimum content');
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

    // Check total image count
    if (selectedImages.length + validFiles.length > 5) {
      toast.error('Maksimal 5 gambar per laporan');
      return;
    }

    // Generate ID untuk setiap gambar
    const imagesWithIds = validFiles.map(file => ({
      file,
      id: Date.now() + Math.floor(Math.random() * 1000)
    }));

    setSelectedImages(prev => [...prev, ...imagesWithIds]);

    // Store mapping file -> ID
    validFiles.forEach((file, index) => {
      setImageIdMap(prev => new Map(prev.set(file, imagesWithIds[index].id)));
    });

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
    const removedImage = selectedImages[index];
    setSelectedImages(prev => prev.filter((_, i) => i !== index));
    setImagePreviewUrls(prev => prev.filter((_, i) => i !== index));
    
    // Remove dari imageIdMap
    if (removedImage && removedImage.file) {
      setImageIdMap(prev => {
        const newMap = new Map(prev);
        newMap.delete(removedImage.file);
        return newMap;
      });
    }
  };

  // Validate form data
  const validateForm = () => {
    if (!formData.tanggal_poskas) {
      toast.error('Tanggal laporan harus diisi');
      return false;
    }
    
    // Get content dari editor dengan format yang benar
    const editorContent = getEditorContent();
    console.log('🔍 Debug: Validating editor content:', editorContent);
    
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

  // Upload images to server first
  const uploadImagesToServer = async (images) => {
    if (images.length === 0) return [];

    console.log('📁 Starting POSKAS image upload...');
    console.log('📁 Number of images:', images.length);

    const formData = new FormData();
    
    images.forEach((imageData, index) => {
      console.log(`📁 Processing image ${index + 1}:`, {
        name: imageData.file.name,
        size: imageData.file.size,
        id: imageData.id
      });
      
      formData.append('images', imageData.file);
    });

    try {
      console.log('📤 Sending upload request to: /api/upload/poskas');
      
      const response = await fetch('/api/upload/poskas', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: formData
      });

      console.log('📥 Response status:', response.status);
      
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
            url: `http://192.168.1.2:3000${uploadedFile.url}`, // URL lengkap dengan IP untuk mobile
            serverPath: uploadedFile.path // Path dari server
          };
        } else {
          // Fallback jika upload gagal
          return {
            uri: `file://temp/${img.id}.jpg`,
            id: img.id,
            name: `poskas_${img.id}.jpg`,
            url: `http://192.168.1.2:3000/uploads/poskas/temp_${img.id}.jpg`,
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
                  data-placeholder="Tulis laporan pos kas Anda di sini... (minimal 10 karakter)"
                ></div>
              </div>
              <p className="text-sm text-gray-500 mt-1">
                Minimal 10 karakter. Gunakan toolbar di atas untuk formatting. 
                <br />
                <span className="text-blue-600">💡 Tips: Anda bisa paste gambar langsung ke editor (Ctrl+V)</span>
                <br />
                <span className="text-green-600">📝 Format: Gambar akan otomatis diganti dengan [IMG:id] saat disimpan</span>
                <br />
                <span className="text-orange-600">⚠️ Note: Gambar akan disimpan sebagai referensi dengan [IMG:id] placeholder</span>
                <br />
                <span className="text-purple-600">🔗 Backend: Gambar akan diupload ke server folder uploads/poskas terlebih dahulu</span>
                <br />
                <span className="text-indigo-600">📁 Upload: Gambar akan diupload ke /api/upload/poskas sebelum submit data</span>
                <br />
                <span className="text-red-600">📱 Mobile: Images akan disimpan sebagai array object dengan URL lengkap untuk mobile</span>
              </p>
            </div>

            {/* Image Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Upload Gambar (Opsional) - Akan diupload ke server folder uploads/poskas
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
                  <br />
                  <span className="text-orange-600">Gambar akan diupload ke server folder uploads/poskas</span>
                  <br />
                  <span className="text-purple-600">Metadata: URI, URL, dan serverPath akan diisi otomatis setelah upload</span>
                  <br />
                  <span className="text-red-600">📱 Format: Images akan disimpan sebagai array object dengan URL lengkap untuk mobile</span>
                </p>
              </div>

              {/* Image Previews */}
              {imagePreviewUrls.length > 0 && (
                <div className="mt-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Gambar yang Dipilih:</h4>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {imagePreviewUrls.map((url, index) => {
                      const imageData = selectedImages[index];
                      return (
                        <div key={index} className="relative group">
                          <img
                            src={url}
                            alt={`Preview ${index + 1}`}
                            className="w-full h-32 object-cover rounded-lg"
                          />
                          <div className="absolute bottom-2 left-2 bg-black bg-opacity-70 text-white text-xs px-2 py-1 rounded">
                            ID: {imageData?.id}
                          </div>
                          <button
                            type="button"
                            onClick={() => removeImage(index)}
                            className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            ×
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Submit Buttons */}
            <div className="flex space-x-4 pt-6">
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isSubmitting ? 'Menyimpan...' : 'Simpan Laporan'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default PoskasForm; 