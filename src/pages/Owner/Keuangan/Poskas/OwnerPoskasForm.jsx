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
  const envConfig = getEnvironmentConfig();
  const editorRef = useRef(null);
  const savedRangeRef = useRef(null);
  const lastContentRef = useRef('');
  const [loading, setLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedImages, setSelectedImages] = useState([]);
  const [imagePreviewUrls, setImagePreviewUrls] = useState([]);
  const [imageIdMap, setImageIdMap] = useState(new Map());
  const [editorInitialized, setEditorInitialized] = useState(false);
  const [isBoldActive, setIsBoldActive] = useState(false);
  const [isItalicActive, setIsItalicActive] = useState(false);
  const [isUnderlineActive, setIsUnderlineActive] = useState(false);

  const [formData, setFormData] = useState({
    tanggal_poskas: '',
    isi_poskas: '',
    images: []
  });

  // Editor CSS and behavior helpers (match Admin)
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
    return () => document.head.removeChild(style);
  }, []);

  const updateFormatState = () => {
    try {
      setIsBoldActive(document.queryCommandState('bold'));
      setIsItalicActive(document.queryCommandState('italic'));
      setIsUnderlineActive(document.queryCommandState('underline'));
    } catch (_) {}
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

  const sanitizeToLTR = (html) => {
    if (!html || typeof html !== 'string') return html || '';
    const removedBidi = html.replace(/[\u200E\u200F\u202A-\u202E\u2066-\u2069]/g, '');
    return removedBidi
      .replace(/\sdir=\"[^\"]*\"/gi, '')
      .replace(/\sdir='[^']*'/gi, '')
      .replace(/\sstyle=\"[^\"]*(direction\s*:\s*(rtl|ltr))[^\"]*\"/gi, (m) => m.replace(/direction\s*:\s*(rtl|ltr)\s*;?/gi, ''))
      .replace(/\sstyle=\"[^\"]*(text-align\s*:\s*(right|left|center|justify))[^\"]*\"/gi, (m) => m.replace(/text-align\s*:\s*(right|left|center|justify)\s*;?/gi, ''))
      .replace(/\sstyle=\"\s*\"/gi, '')
      .replace(/\sstyle='\s*'/gi, '');
  };

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

  // Track selection changes similar to Admin
  useEffect(() => {
    const editor = editorRef.current;
    if (!editor) return;
    const onMouseUp = () => { saveSelection(); updateFormatState(); };
    const onKeyUp = () => { saveSelection(); updateFormatState(); };
    const onSelectionChange = () => {
      saveSelection();
      const sel = window.getSelection();
      if (!sel || sel.rangeCount === 0) return;
      const node = sel.anchorNode;
      if (node && editor.contains(node)) updateFormatState();
    };
    editor.addEventListener('mouseup', onMouseUp);
    editor.addEventListener('keyup', onKeyUp);
    document.addEventListener('selectionchange', onSelectionChange);
    return () => {
      editor.removeEventListener('mouseup', onMouseUp);
      editor.removeEventListener('keyup', onKeyUp);
      document.removeEventListener('selectionchange', onSelectionChange);
    };
  }, []);

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
            // Backend menyajikan static uploads di '/uploads' (bukan '/api/uploads')
            const imageUrl = img.url?.startsWith('http')
              ? img.url
              : `${envConfig.BASE_URL.replace('/api','')}${img.url}`;
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
  const handleEditorChange = (e) => {
    const content = e?.target?.innerHTML ?? (editorRef.current ? editorRef.current.innerHTML : '');
    lastContentRef.current = content;
    if (editorRef.current) {
      requestAnimationFrame(() => {
        try {
          const nodes = editorRef.current.querySelectorAll('[dir], [style]');
          nodes.forEach((n) => {
            if (n.hasAttribute('dir')) n.removeAttribute('dir');
            const style = n.getAttribute('style');
            if (style) {
              let cleaned = style
                .replace(/direction\s*:\s*(rtl|ltr)\s*;?/gi, '')
                .replace(/text-align\s*:\s*(right)\s*;?/gi, 'text-align: left;')
                .replace(/\s*;\s*$/, '');
              if (cleaned.trim().length === 0) {
                n.removeAttribute('style');
              } else {
                n.setAttribute('style', cleaned);
              }
            }
          });
        } catch {}
      });
    }
    setFormData(prev => ({ ...prev, isi_poskas: content }));
    updateFormatState();
  };

  const handleEditorKeyUp = () => {
    if (!editorRef.current) return;
    try {
      const nodes = editorRef.current.querySelectorAll('[dir], [style]');
      nodes.forEach((n) => {
        if (n.hasAttribute('dir')) n.removeAttribute('dir');
        const style = n.getAttribute('style');
        if (style) {
          let cleaned = style
            .replace(/direction\s*:\s*(rtl|ltr)\s*;?/gi, '')
            .replace(/text-align\s*:\s*(right)\s*;?/gi, 'text-align: left;')
            .replace(/\s*;\s*$/, '');
          if (cleaned.trim().length === 0) {
            n.removeAttribute('style');
          } else {
            n.setAttribute('style', cleaned);
          }
        }
      });
    } catch {}
    updateFormatState();
  };

  const saveSelection = () => {
    const sel = window.getSelection();
    if (sel && sel.rangeCount > 0) {
      savedRangeRef.current = sel.getRangeAt(0).cloneRange();
    }
  };

  const restoreSelection = () => {
    const range = savedRangeRef.current;
    if (!range) return;
    const sel = window.getSelection();
    sel.removeAllRanges();
    sel.addRange(range);
  };

  const exec = (cmd, value = null) => {
    if (savedRangeRef.current) {
      restoreSelection();
    } else if (editorRef.current) {
      placeCaretAtEnd(editorRef.current);
    }
    try {
      if (cmd === 'createLink') {
        const url = value || window.prompt('Masukkan URL tautan (https://...)');
        if (!url) return;
        document.execCommand('createLink', false, url);
        return;
      }
      if (cmd === 'unlink') {
        document.execCommand('unlink');
        return;
      }
      document.execCommand(cmd, false, value);
      saveSelection();
    } catch (e) {
      console.warn('Exec command error', cmd, e);
    }
  };

  // Ensure editor has proper content
  const ensureEditorContent = () => {
    if (editorRef.current && !editorRef.current.innerHTML.trim()) {
      editorRef.current.innerHTML = formData.isi_poskas || '';
    }
  };

  // Handle paste events in editor (for images) - match Admin behavior
  const handleEditorPaste = async (e) => {
    const items = e.clipboardData?.items;
    if (!items) return;
    for (let item of items) {
      if (item.type.indexOf('image') !== -1) {
        e.preventDefault();
        const file = item.getAsFile();
        if (file) {
          if (file.size > 10 * 1024 * 1024) { // 10MB limit
            toast.error('Gambar terlalu besar. Maksimal 10MB');
            return;
          }
          if (selectedImages.length >= 5) {
            toast.error('Maksimal 5 gambar per laporan');
            return;
          }
          const imageId = Date.now() + Math.floor(Math.random() * 1000);
          const imageWithId = { file, id: imageId, name: `poskas_${imageId}.jpg` };
          setSelectedImages(prev => [...prev, imageWithId]);
          setImageIdMap(prev => new Map(prev.set(file, imageId)));
          const reader = new FileReader();
          reader.onload = (ev) => {
            const imageUrl = ev.target.result;
            setImagePreviewUrls(prev => [...prev, imageUrl]);
            const img = document.createElement('img');
            img.src = imageUrl;
            img.alt = 'Pasted image';
            img.className = 'pasted-image';
            img.setAttribute('data-image-id', imageId);
            const selection = window.getSelection();
            if (selection.rangeCount > 0) {
              const range = selection.getRangeAt(0);
              range.deleteContents();
              range.insertNode(img);
              range.collapse(false);
              const br = document.createElement('br');
              range.insertNode(br);
              range.collapse(false);
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

  // Get editor content with [IMG:id] placeholders and safe formatting (match Admin)
  const getEditorContent = () => {
    if (!editorRef.current) return '';
    const content = editorRef.current.innerHTML;
    if (!content || content.trim() === '') return '';
    let processedContent = content;
    const imgRegex = /<img[^>]*data-image-id="([^"]*)"[^>]*>/g;
    let imgMatch;
    while ((imgMatch = imgRegex.exec(content)) !== null) {
      const imageId = imgMatch[1];
      const placeholder = `[IMG:${imageId}]`;
      processedContent = processedContent.replace(imgMatch[0], placeholder);
    }
    processedContent = processedContent
      .replace(/<div[^>]*>/gi, '\n')
      .replace(/<\/div>/gi, '')
      .replace(/<p[^>]*>/gi, '\n')
      .replace(/<\/p>/gi, '');
    processedContent = processedContent
      .replace(/<br[^>]*>/gi, '<br>')
      .replace(/<a([^>]*)>/gi, (m, attrs) => {
        const hrefMatch = attrs.match(/href\s*=\s*"([^"]*)"|href\s*=\s*'([^']*)'|href\s*=\s*([^\s>]+)/i);
        let href = hrefMatch ? (hrefMatch[1] || hrefMatch[2] || hrefMatch[3] || '') : '';
        if (!/^https?:|^mailto:|^tel:/i.test(href)) href = '';
        return href ? `<a href="${href}">` : '<a>';
      })
      .replace(/<(b|strong|i|em|u|ul|ol|li)[^>]*>/gi, '<$1>');
    processedContent = processedContent.replace(/<(?!\/?(b|strong|i|em|u|a|ul|ol|li|br)\b)[^>]*>/gi, '');
    processedContent = processedContent
      .replace(/\sdir=\"[^\"]*\"/gi, '')
      .replace(/\sstyle=\"[^\"]*(direction\s*:\s*(rtl|ltr)|text-align\s*:\s*(right|left|center|justify))[^\"]*\"/gi, '');
    processedContent = processedContent.replace(/[\u200E\u200F\u202A-\u202E\u2066-\u2069]/g, '');
    processedContent = processedContent
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .trim();
    return processedContent;
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
      
      console.log('📤 Sending upload request to /upload/poskas');
      
      // BASE_URL sudah mengandung '/api', jadi cukup tambahkan '/upload/poskas'
      const response = await fetch(`${envConfig.BASE_URL}/upload/poskas`, {
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
              // Gunakan nama file dari server jika tersedia, fallback ke basename dari path
              name: uploadedFile.filename || (uploadedFile.path ? uploadedFile.path.split('/').pop() : `poskas_${img.id}.jpg`),
              // Jika relatif, prefix dengan BASE_URL tanpa /api karena static route ada di '/uploads'
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
              {/* Toolbar (B/I/U) to match Admin */}
              <div className="flex flex-wrap items-center gap-2 p-2 rounded-md bg-gray-50 border border-gray-200">
                <button
                  type="button"
                  onClick={() => { exec('bold'); updateFormatState(); }}
                  className={`px-2 py-1 text-sm rounded font-semibold hover:bg-gray-100 ${isBoldActive ? 'bg-gray-200 ring-1 ring-gray-300' : ''}`}
                  aria-pressed={isBoldActive}
                  title="Bold"
                >
                  B
                </button>
                <button
                  type="button"
                  onClick={() => { exec('italic'); updateFormatState(); }}
                  className={`px-2 py-1 text-sm rounded italic hover:bg-gray-100 ${isItalicActive ? 'bg-gray-200 ring-1 ring-gray-300' : ''}`}
                  aria-pressed={isItalicActive}
                  title="Italic"
                >
                  I
                </button>
                <button
                  type="button"
                  onClick={() => { exec('underline'); updateFormatState(); }}
                  className={`px-2 py-1 text-sm rounded underline hover:bg-gray-100 ${isUnderlineActive ? 'bg-gray-200 ring-1 ring-gray-300' : ''}`}
                  aria-pressed={isUnderlineActive}
                  title="Underline"
                >
                  U
                </button>
              </div>
              <div
                ref={editorRef}
                contentEditable
                data-placeholder="Masukkan isi posisi kas... Anda bisa paste gambar langsung dari clipboard (Ctrl+V)"
                onInput={handleEditorChange}
                onKeyUp={handleEditorKeyUp}
                onMouseUp={handleEditorKeyUp}
                onFocus={updateFormatState}
                onPaste={handleEditorPaste}
                dir="ltr"
                className="min-h-[300px] p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none"
                style={{ whiteSpace: 'pre-wrap' }}
                dangerouslySetInnerHTML={isEditMode ? { __html: sanitizeToLTR(formData.isi_poskas) } : undefined}
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

