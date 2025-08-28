import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../../../../contexts/AuthContext';
import { poskasService } from '../../../../services/poskasService';
import { toast } from 'react-hot-toast';
import { ArrowLeft, Calendar, FileText, RefreshCw, Save } from 'lucide-react';
import { getEnvironmentConfig } from '../../../../config/environment';

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
  const editorRef = useRef(null);
  const savedRangeRef = useRef(null);
  const lastContentRef = useRef('');
  const [editorInitialized, setEditorInitialized] = useState(false);
  const [isBoldActive, setIsBoldActive] = useState(false);
  const [isItalicActive, setIsItalicActive] = useState(false);
  const [isUnderlineActive, setIsUnderlineActive] = useState(false);

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

  // Track selection changes to keep latest range (mouse/keyboard and global selectionchange)
  useEffect(() => {
    const editor = editorRef.current;
    if (!editor) return;
    const onMouseUp = () => { saveSelection(); updateFormatState(); };
    const onKeyUp = () => { saveSelection(); updateFormatState(); };
    const onSelectionChange = () => {
      saveSelection();
      // Only update when selection is inside the editor
      const sel = window.getSelection();
      if (!sel || sel.rangeCount === 0) return;
      const node = sel.anchorNode;
      if (node && editor.contains(node)) {
        updateFormatState();
      }
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

  // Initialize editor content once after data load to avoid React resets of selection
  useEffect(() => {
    if (!editorInitialized && !loading && editorRef.current) {
      const initial = formData.isi_poskas || '';
      editorRef.current.innerHTML = sanitizeToLTR(initial);
      lastContentRef.current = initial;
      setEditorInitialized(true);
      // Move caret to end for a natural typing experience
      placeCaretAtEnd(editorRef.current);
      updateFormatState();
    }
  }, [editorInitialized, loading, formData.isi_poskas]);

  // Handle text editor changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleEditorChange = (e) => {
    const content = e.target.innerHTML;
    lastContentRef.current = content;
    // Avoid frequent setState to prevent caret reset; commit on blur/submit
    // Microtask sanitize to remove any accidental RTL attributes/styles from new nodes
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
                .replace(/\s*;\s*$/,'');
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
    updateFormatState();
  };

  const handleEditorKeyUp = () => {
    // As an additional safeguard, normalize after keyup
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
            .replace(/\s*;\s*$/,'');
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

  const handleEditorBlur = () => {
    const content = editorRef.current ? editorRef.current.innerHTML : '';
    const clean = sanitizeToLTR(content);
    if (editorRef.current) editorRef.current.innerHTML = clean;
    lastContentRef.current = clean;
    setFormData(prev => ({
      ...prev,
      isi_poskas: clean
    }));
  };

  // Focus editor helper
  const focusEditor = () => {
    if (editorRef.current) {
      editorRef.current.focus();
    }
  };

  // Execute formatting command
  const exec = (cmd, value = null) => {
    // Restore selection so formatting applies to the highlighted text
    if (savedRangeRef.current) {
      restoreSelection();
    } else if (editorRef.current) {
      // No saved selection: put caret at end to ensure command still works
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
      // Save selection after command so subsequent actions keep range
      saveSelection();
    } catch (e) {
      console.warn('Exec command error', cmd, e);
    }
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

  // Get editor content with [IMG:id] placeholders and preserve safe formatting
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
    
    // Convert HTML content but keep allowed tags and replace pasted images with placeholders
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
    
    // Normalize block separators by turning divs/p into line breaks
    processedContent = processedContent
      .replace(/<div[^>]*>/gi, '\n')
      .replace(/<\/div>/gi, '')
      .replace(/<p[^>]*>/gi, '\n')
      .replace(/<\/p>/gi, '');

    // Simplify allowed tags and sanitize anchors
    processedContent = processedContent
      .replace(/<br[^>]*>/gi, '<br>')
      .replace(/<a([^>]*)>/gi, (m, attrs) => {
        const hrefMatch = attrs.match(/href\s*=\s*"([^"]*)"|href\s*=\s*'([^']*)'|href\s*=\s*([^\s>]+)/i);
        let href = hrefMatch ? (hrefMatch[1] || hrefMatch[2] || hrefMatch[3] || '') : '';
        if (!/^https?:|^mailto:|^tel:/i.test(href)) href = '';
        return href ? `<a href="${href}">` : '<a>';
      })
      .replace(/<(b|strong|i|em|u|ul|ol|li)[^>]*>/gi, '<$1>');

    // Remove all other tags except the allowed set and their closing tags
    processedContent = processedContent.replace(/<(?!\/?(b|strong|i|em|u|a|ul|ol|li|br)\b)[^>]*>/gi, '');

    // Strip direction-related attributes that could flip RTL
    processedContent = processedContent
      .replace(/\sdir=\"[^\"]*\"/gi, '')
      .replace(/\sstyle=\"[^\"]*(direction\s*:\s*(rtl|ltr)|text-align\s*:\s*(right|left|center|justify))[^\"]*\"/gi, '');

    // Remove Unicode BiDi control characters
    processedContent = processedContent.replace(/[\u200E\u200F\u202A-\u202E\u2066-\u2069]/g, '');

    // Decode common HTML entities
    processedContent = processedContent
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
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
              onClick={() => navigate('/admin/keuangan/poskas')}
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
              {/* Toolbar (B/I/U) - match Edit page behavior */}
              <div className="flex flex-wrap items-center gap-2 p-2 rounded-md bg-gray-50 border border-gray-200">
                <button
                  type="button"
                  onClick={() => { document.execCommand('bold'); updateFormatState(); }}
                  className={`px-2 py-1 text-sm rounded font-semibold hover:bg-gray-100 ${isBoldActive ? 'bg-gray-200 ring-1 ring-gray-300' : ''}`}
                  aria-pressed={isBoldActive}
                  title="Bold"
                >
                  B
                </button>
                <button
                  type="button"
                  onClick={() => { document.execCommand('italic'); updateFormatState(); }}
                  className={`px-2 py-1 text-sm rounded italic hover:bg-gray-100 ${isItalicActive ? 'bg-gray-200 ring-1 ring-gray-300' : ''}`}
                  aria-pressed={isItalicActive}
                  title="Italic"
                >
                  I
                </button>
                <button
                  type="button"
                  onClick={() => { document.execCommand('underline'); updateFormatState(); }}
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
                className="min-h-[300px] p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none text-left"
                style={{ whiteSpace: 'pre-wrap' }}
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
          </form>
      </div>
    </div>
  );
};

export default AdminPoskasForm;