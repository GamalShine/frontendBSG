import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../../../../contexts/AuthContext';
import { poskasService } from '../../../../services/poskasService';
import { toast } from 'react-hot-toast';
import { ArrowLeft, Calendar, FileText, RefreshCw, Save, X } from 'lucide-react';
import { MENU_CODES } from '@/config/menuCodes';
import { getEnvironmentConfig } from '../../../../config/environment';
import RichTextEditor from '../../../../components/UI/RichTextEditor';

const AdminPoskasForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { user } = useAuth();
  const envConfig = getEnvironmentConfig();
  const isEditMode = Boolean(id);
  
  // Add CSS for editor images
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      /* Force LTR typing for editor (element and all descendants) */
      [contenteditable="true"], [contenteditable="true"] * {
        direction: ltr !important;
        unicode-bidi: isolate !important;
        text-align: left !important;
      }
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
  // Editor RichTextEditor tidak membutuhkan ref/toolbar state di sini
  
  // Handler untuk RichTextEditor (sinkronkan HTML ke formData)
  const handleEditorHtmlChange = (e) => {
    const html = e?.target?.value ?? '';
    setFormData(prev => ({ ...prev, isi_poskas: html }));
  };

  // Editor contentEditable lama dihapus; helper terkait selection/toolbar tidak diperlukan lagi

  // Escape plain text to safe HTML
  const escapeHtml = (text) => {
    if (text == null) return '';
    return String(text)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  };

  // Normalize/sanitize bold tags in HTML and keep structure stable (standardize to <strong>)
  const normalizeBoldHtml = (html) => {
    if (!html) return html;
    let out = html;
    // Convert <b> -> <strong>
    out = out.replace(/<\s*b\s*>/gi, '<strong>')
             .replace(/<\s*\/\s*b\s*>/gi, '</strong>');
    // Remove <strong><br></strong> -> <br>
    out = out.replace(/<strong>\s*(?:<br\s*\/?\s*>)+\s*<\/strong>/gi, '<br>');
    // Remove empty strongs
    out = out.replace(/<strong>\s*<\/strong>/gi, '');
    // Collapse nested strongs
    try {
      let prevCollapse;
      do {
        prevCollapse = out;
        out = out.replace(/<strong>\s*<strong>/gi, '<strong>')
                 .replace(/<\/strong>\s*<\/strong>/gi, '</strong>');
      } while (out !== prevCollapse);
    } catch (_) {}
    // Unwrap placeholder-only bold
    out = out.replace(/<strong>\s*(\[IMG:\d+\])\s*<\/strong>/gi, '$1');
    // Split strong across placeholders
    try {
      let prevSplitImg;
      do {
        prevSplitImg = out;
        out = out.replace(/<strong>([^<>]*?)\s*(\[IMG:\d+\])\s*([^<>]*?)<\/strong>/gi, (m, left, img, right) => {
          const l = left.trim() ? `<strong>${left}</strong>` : '';
          const r = right.trim() ? `<strong>${right}</strong>` : '';
          return `${l}${img}${r}`;
        });
      } while (out !== prevSplitImg);
    } catch (_) {}
    // Split strong across <br>
    try {
      let prev;
      do {
        prev = out;
        out = out.replace(/<strong>([^<>]*)<br\s*\/?\s*>([^<>]*)<\/strong>/gi, (m, a, b) => {
          const left = a.trim() ? `<strong>${a}</strong>` : '';
          const right = b.trim() ? `<strong>${b}</strong>` : '';
          return `${left}<br>${right}`;
        });
      } while (out !== prev);
    } catch (_) {}
    return out;
  };
  const fixStrayStrong = (html) => {
    if (!html) return html;
    let out = html;
    out = out.replace(/^(\s*<\/strong>)+/i, '');
    out = out.replace(/(<strong>\s*)+$/i, '');
    return out;
  };
  const unboldSafe = (html) => {
    if (!html) return html;
    let out = html;
    // break strong scope where span enforces normal weight
    out = out.replace(/<span[^>]*style="[^"]*font-weight\s*:\s*normal[^"]*"[^>]*>([\s\S]*?)<\/span>/gi, (_m, inner) => `</strong>${inner}<strong>`);
    out = fixStrayStrong(out);
    return out;
  };

  const placeCaretAtEnd = (el) => {
    if (!el) return;
    const range = document.createRange();
    range.selectNodeContents(el);
    range.collapse(false);
    const sel = window.getSelection();
    sel.removeAllRanges();
    sel.addRange(range);
  };

  // Sanitize HTML to enforce LTR by removing dir/style that set RTL or right alignment
  const sanitizeToLTR = (html) => {
    if (!html || typeof html !== 'string') return html || '';
    // Remove Unicode BiDi control characters that can flip cursor direction
    const removedBidi = html.replace(/[\u200E\u200F\u202A-\u202E\u2066-\u2069]/g, '');
    return removedBidi
      .replace(/\sdir=\"[^\"]*\"/gi, '')
      .replace(/\sdir='[^']*'/gi, '')
      .replace(/\sstyle=\"[^\"]*(direction\s*:\s*(rtl|ltr))[^\"]*\"/gi, (m) => m.replace(/direction\s*:\s*(rtl|ltr)\s*;?/gi, ''))
      .replace(/\sstyle=\"[^\"]*(text-align\s*:\s*(right|left|center|justify))[^\"]*\"/gi, (m) => m.replace(/text-align\s*:\s*(right|left|center|justify)\s*;?/gi, ''))
      .replace(/\sstyle=\"\s*\"/gi, '')
      .replace(/\sstyle='\s*'/gi, '');
  };

  // Load existing data if in edit mode
  useEffect(() => {
    if (isEditMode && id) {
      loadExistingData();
    }
  }, [isEditMode, id]);

  // Listener selection untuk contentEditable lama dihapus

  const loadExistingData = async () => {
    try {
      setLoading(true);
      const response = await poskasService.getPoskasById(id);
      
      if (response.success) {
        const data = response.data;
        setFormData({
          tanggal_poskas: data.tanggal_poskas || new Date().toISOString().split('T')[0],
          isi_poskas: sanitizeToLTR(data.isi_poskas || ''),
          images: data.images || []
        });
        
        // Process existing images if any
        if (data.images && Array.isArray(data.images)) {
          const processedImages = data.images.map((img, index) => ({
            file: null, // We don't have the actual file in edit mode
            id: img.id || Date.now() + index,
            name: img.name || `existing_image_${index}`
          }));
          setSelectedImages(processedImages);
          
          // Set preview URLs from existing image URLs
          const urls = data.images.map(img => img.url || img.uri || '');
          setImagePreviewUrls(urls.filter(url => url));
        }
      } else {
        toast.error('Gagal memuat data yang akan diedit');
        navigate('/admin/keuangan/poskas');
      }
    } catch (error) {
      console.error('Error loading existing data:', error);
      toast.error('Gagal memuat data yang akan diedit');
      navigate('/admin/keuangan/poskas');
    } finally {
      setLoading(false);
      setTimeout(() => {
        if (editorRef.current) {
          const cleaned = sanitizeToLTR(editorRef.current.innerHTML);
          editorRef.current.innerHTML = cleaned;
          placeCaretAtEnd(editorRef.current);
          updateFormatState();
        }
      }, 0);
    }
  };

  // Inisialisasi editor contentEditable lama dihapus (menggunakan RichTextEditor)

  // Handle text editor changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handler editor lama dihapus (digantikan RichTextEditor)

  // Handler editor lama dihapus (digantikan RichTextEditor)

  // Handler editor lama dihapus (digantikan RichTextEditor)

  // Ensure Enter creates a clean line break without ZWSP or bold manipulation
  // Handler editor lama dihapus (digantikan RichTextEditor)

  // Focus editor helper
  // Handler editor lama dihapus (digantikan RichTextEditor)

  // Execute formatting command
  // Handler editor lama dihapus (digantikan RichTextEditor)

  // Handle paste event in editor
  // Handler editor lama dihapus (digantikan RichTextEditor)

  // Get editor content with [IMG:id] placeholders and preserve safe formatting
  // Serializer editor lama dihapus (digantikan RichTextEditor)

  // Ensure editor has minimum content
  // Helper editor lama dihapus (digantikan RichTextEditor)

  // Handle image selection
  const handleImageSelect = (e) => {
    const files = Array.from(e.target.files);
    // Tidak ada batasan jumlah/ukuran/tipe file
    const validFiles = files;

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
    
    const editorContent = formData.isi_poskas || '';
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
      console.log('📤 Sending upload request to: /upload/poskas');
      
      const response = await fetch(`${envConfig.BASE_URL}/upload/poskas`, {
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
    
    // Ambil konten dari state (RichTextEditor mengisi formData.isi_poskas)
    const editorContent = formData.isi_poskas || '';
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
          navigate('/admin/keuangan/poskas');
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
              // Gunakan nama file dari server bila tersedia
              name: uploadedFile.filename || (uploadedFile.path ? uploadedFile.path.split('/').pop() : `poskas_${img.id}.jpg`),
              // Jika relatif, prefix dengan BASE_URL tanpa /api karena static route '/uploads'
              url: uploadedFile.url && /^https?:\/\//i.test(uploadedFile.url)
                ? uploadedFile.url
                : `${envConfig.BASE_URL.replace('/api','')}${uploadedFile.url}`,
              serverPath: uploadedFile.serverPath || uploadedFile.path // Prefer serverPath if available
            };
          } else {
            // Fallback jika upload gagal
            return {
              uri: `file://temp/${img.id}.jpg`,
              id: img.id,
              name: `poskas_${img.id}.jpg`,
              url: `${envConfig.BASE_URL.replace('/api','')}/uploads/poskas/temp_${img.id}.jpg`,
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
          navigate('/admin/keuangan/poskas');
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
      <div className="p-0 bg-gray-50 min-h-screen">
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="p-8 text-center">
            <RefreshCw className="h-8 w-8 animate-spin text-green-500 mx-auto mb-4" />
            <p className="text-gray-600">{isEditMode ? 'Memuat data...' : 'Memuat form...'}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-0 bg-gray-50 min-h-screen">
      {/* Header - match Omset style */}
      <div className="bg-red-800 text-white px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-sm font-semibold bg-white/10 rounded px-2 py-1 select-none">{MENU_CODES.keuangan.poskas}</span>
            <div>
              <h1 className="text-xl md:text-2xl font-extrabold tracking-tight">{isEditMode ? 'EDIT POSKAS' : 'TAMBAH POSKAS'}</h1>
              {isEditMode && (
                <p className="text-sm text-red-100">Perbarui data posisi kas</p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => navigate('/admin/keuangan/poskas')}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-white/60 text-white hover:bg-white/10 transition-colors"
              title="Batal"
            >
              <X className="h-4 w-4" />
              <span>Batal</span>
            </button>
            <button
              form="poskas-form"
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center gap-2 px-4 py-2 bg-white text-red-700 rounded-full hover:bg-red-50 transition-colors shadow-sm disabled:opacity-60"
            >
              {isSubmitting ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              <span>{isSubmitting ? 'Menyimpan...' : (isEditMode ? 'Perbarui' : 'Simpan')}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Form Section */}
      <div className="bg-white rounded-none shadow-sm border-y">
        <form id="poskas-form" onSubmit={handleSubmit}>
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
              <RichTextEditor
                value={formData.isi_poskas}
                onChange={handleEditorHtmlChange}
                onFilesChange={(files) => {
                  // files: array of { file, id }
                  setSelectedImages(files.map(f => ({ file: f.file, id: f.id })));
                }}
                placeholder="Masukkan isi posisi kas . . . "
                rows={12}
                showUploadList={false}
                hideAlign={true}
                hideImage={true}
              />
               </div>
              </div>

          {/* Submit Buttons hidden (moved to header) */}
          {false && (
            <div className="flex space-x-4 p-6">
              <button
                type="button"
                onClick={() => navigate('/admin/keuangan/poskas')}
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
          )}
          </form>
      </div>
    </div>
  );
};

export default AdminPoskasForm;