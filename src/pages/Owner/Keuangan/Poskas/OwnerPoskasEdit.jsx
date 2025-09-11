import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../../../../contexts/AuthContext';
import { poskasService } from '../../../../services/poskasService';
import { uploadService } from '../../../../services/uploadService';
import { toast } from 'react-hot-toast';
import { 
  ArrowLeft, 
  Save, 
  Upload, 
  Image as ImageIcon,
  Trash2,
  Eye,
  X,
  Plus,
  Download,
  Calendar,
  FileText
} from 'lucide-react';
import LoadingSpinner from '../../../../components/UI/LoadingSpinner';
import { API_CONFIG } from '../../../../config/constants';
import { normalizeImageUrl } from '../../../../utils/url';

const OwnerPoskasEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  console.log('🔍 Environment config loaded:', API_CONFIG);
  console.log('🔍 BASE_URL:', API_CONFIG.BASE_URL);
  
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
  const [newImageIds, setNewImageIds] = useState([]); // Store IDs for new images
  const [usedInEditor, setUsedInEditor] = useState(new Set()); // Track which images are used in editor
  const fileInputRef = useRef(null);
  const editorRef = useRef(null);
  const savedRangeRef = useRef(null);
  const [isBoldActive, setIsBoldActive] = useState(false);
  const [isItalicActive, setIsItalicActive] = useState(false);
  const [isUnderlineActive, setIsUnderlineActive] = useState(false);
  const lastContentRef = useRef('');

  // Add CSS and force LTR for editor
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
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
        border: 1px solid #e5e7eb !important;
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
      .editor-image {
        max-width: 100% !important;
        height: auto !important;
        margin: 10px 0 !important;
        border-radius: 4px !important;
        box-shadow: 0 2px 4px rgba(0,0,0,0.1) !important;
        display: block !important;
        border: 1px solid #e5e7eb !important;
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

  const updateFormatState = () => {
    try {
      setIsBoldActive(document.queryCommandState('bold'));
      setIsItalicActive(document.queryCommandState('italic'));
      setIsUnderlineActive(document.queryCommandState('underline'));
    } catch {}
  };

  const saveSelection = () => {
    const sel = window.getSelection();
    if (sel && sel.rangeCount > 0) savedRangeRef.current = sel.getRangeAt(0).cloneRange();
  };

  const restoreSelection = () => {
    const range = savedRangeRef.current;
    if (!range) return;
    const sel = window.getSelection();
    sel.removeAllRanges();
    sel.addRange(range);
  };

  const exec = (cmd, value = null) => {
    if (savedRangeRef.current) restoreSelection();
    try {
      if (cmd === 'createLink') {
        const url = value || window.prompt('Masukkan URL tautan (https://...)');
        if (!url) return;
        document.execCommand('createLink', false, url);
      } else if (cmd === 'unlink') {
        document.execCommand('unlink');
      } else {
        document.execCommand(cmd, false, value);
      }
      saveSelection();
      updateFormatState();
    } catch {}
  };

  const sanitizeToLTR = (html) => {
    if (!html || typeof html !== 'string') return html || '';
    const removedBidi = html.replace(/[\u200E\u200F\u202A-\u202E\u2066-\u2069]/g, '');
    return removedBidi
      .replace(/\sdir=\"[^\"]*\"/gi, '')
      .replace(/\sdir='[^']*'/gi, '')
      .replace(/\sstyle=\"[^\"]*(direction\s*:\s*(rtl|ltr)|text-align\s*:\s*(right|left|center|justify))[^\"]*\"/gi, '')
      .replace(/\sstyle=\"\s*\"/gi, '')
      .replace(/\sstyle='\s*'/gi, '');
  };

  useEffect(() => {
      fetchPoskasDetail();
  }, [id]);

  // Update editor content when formData changes
  useEffect(() => {
    console.log('🔍 useEffect triggered with:', {
      hasEditorRef: !!editorRef.current,
      hasIsiPoskas: !!formData.isi_poskas,
      imagesCount: existingImages?.length || 0,
      images: existingImages
    });
    
    if (editorRef.current && formData.isi_poskas) {
      console.log('🔍 Setting editor content:', formData.isi_poskas);
      
      // Small delay to ensure CSS is applied
      setTimeout(() => {
        editorRef.current.innerHTML = formData.isi_poskas;
        
        // Check if images are present in the editor
        const imagesInEditor = editorRef.current.querySelectorAll('img');
        console.log('🔍 Images found in editor after setting content:', imagesInEditor.length);
        
        if (imagesInEditor.length === 0) {
          console.log('🔍 No images found in editor, checking if we need to render from existingImages');
          // If no images in editor but we have images in existingImages, try to render them
          if (existingImages && Array.isArray(existingImages) && existingImages.length > 0) {
            console.log('🔍 Rendering images from existingImages:', existingImages);
            existingImages.forEach((image, index) => {
              if (image && (image.url || image.uri)) {
                console.log(`🔍 Creating image element for image ${index + 1}:`, image);
                
                const img = document.createElement('img');
                img.src = normalizeImageUrl(image.url || image.uri);
                img.alt = `Gambar ${index + 1}`;
                img.className = 'max-w-full h-auto my-2 rounded-lg shadow-sm editor-image';
                img.setAttribute('data-image-id', image.id);
                img.style.maxWidth = '100%';
                img.style.height = 'auto';
                img.style.margin = '10px 0';
                img.style.borderRadius = '4px';
                img.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';
                img.style.display = 'block';
                img.style.visibility = 'visible';
                
                // Add error handling
                img.onerror = () => {
                  console.error(`❌ Failed to load image ${index + 1}:`, image.url || image.uri);
                  img.style.border = '2px solid red';
                  img.style.backgroundColor = '#fee';
                  img.alt = 'Gambar gagal dimuat';
                  img.style.padding = '20px';
                  img.style.textAlign = 'center';
                  img.style.fontSize = '12px';
                  img.style.color = '#666';
                };

                img.onload = () => {
                  console.log(`✅ Successfully loaded image ${index + 1}:`, image.url || image.uri);
                  img.style.display = 'block';
                  img.style.visibility = 'visible';
                };

                // Insert image into editor
                editorRef.current.appendChild(img);
                console.log(`➕ Inserted image ${index + 1} into editor`);
                
                // Add line break after image
                const br = document.createElement('br');
                editorRef.current.appendChild(br);
              }
            });
          } else {
            console.log('⚠️ No images in existingImages to render');
          }
        } else {
          console.log('🔍 Processing existing images in editor');
          // Process existing images in editor
          imagesInEditor.forEach((img, index) => {
            console.log(`🔍 Image ${index + 1} in editor:`, {
              src: img.src,
              dataImageId: img.getAttribute('data-image-id'),
              className: img.className,
              width: img.width,
              height: img.height,
              display: img.style.display,
              visibility: img.style.visibility
            });
            
            // Add error handling for image loading
            img.onerror = () => {
              console.error(`❌ Failed to load image ${index + 1}:`, img.src);
              // Show error placeholder
              img.style.border = '2px solid red';
              img.style.backgroundColor = '#fee';
              img.alt = 'Gambar gagal dimuat';
              img.style.padding = '20px';
              img.style.textAlign = 'center';
              img.style.fontSize = '12px';
              img.style.color = '#666';
            };
            
            img.onload = () => {
              console.log(`✅ Successfully loaded image ${index + 1}:`, img.src);
              // Ensure image is visible
              img.style.display = 'block';
              img.style.visibility = 'visible';
            };
            
            // Force image to be visible
            img.style.display = 'block';
            img.style.visibility = 'visible';
            img.style.maxWidth = '100%';
            img.style.height = 'auto';
            img.style.margin = '10px 0';
            img.style.borderRadius = '4px';
            img.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';
          });
        }
        
        // Update used images tracking
        updateUsedInEditor();
        lastContentRef.current = editorRef.current.innerHTML;
      }, 300); // Increased delay to ensure everything is ready
    }
  }, [formData.isi_poskas, existingImages]);

  const fetchPoskasDetail = async () => {
    try {
      setLoading(true);
      const response = await poskasService.getPoskasById(id);

      if (response.success) {
        const poskas = response.data;
        console.log('🔍 Raw poskas data from API:', poskas);
        console.log('🔍 Raw tanggal_poskas:', poskas.tanggal_poskas);
        console.log('🔍 Images field type:', typeof poskas.images);
        console.log('🔍 Images field value:', poskas.images);
        
        // Parse existing images first
        const parsedImages = parseImagesString(poskas.images);
        console.log('🔍 Parsed images:', parsedImages);
        setExistingImages(parsedImages);
        
        // Convert text with [IMG:id] placeholders to HTML for editor
        let editorContent = poskas.isi_poskas || '';
        console.log('🔍 Original editor content:', editorContent);
        
        // Check if there are any [IMG:id] placeholders in the content
        const imgPlaceholderRegex = /\[IMG:(\d+)\]/g;
        const placeholders = [...editorContent.matchAll(imgPlaceholderRegex)];
        console.log('🔍 Found image placeholders in content:', placeholders);
        
        // Replace [IMG:id] placeholders with actual image tags for editor
        if (Array.isArray(parsedImages)) {
          console.log('🔍 Processing parsed images for editor:', parsedImages);
          console.log('🔍 Environment config:', API_CONFIG);
          parsedImages.filter(image => {
            // Filter out images without valid URLs
            if (!image || (!image.url && !image.uri)) {
              console.log(`⚠️ Skipping image for editor - no valid URL:`, image);
              return false;
            }
            return true;
          }).forEach((image, index) => {
            console.log(`🔍 Processing image ${index + 1}:`, image);
            
            // Build URL via helper
            const imageUrl = normalizeImageUrl(image.url || image.uri);
            
            console.log(`🔍 Final image URL for editor: ${imageUrl}`);
            
            // Replace [IMG:id] placeholder with actual image tag
            const placeholder = `[IMG:${image.id}]`;
            if (editorContent.includes(placeholder)) {
              console.log(`🔍 Replacing placeholder ${placeholder} with image tag`);
              const imgTag = `<img src="${imageUrl}" alt="Gambar ${index + 1}" class="max-w-full h-auto my-2 rounded-lg shadow-sm editor-image" data-image-id="${image.id}" style="max-width: 100%; height: auto; margin: 10px 0; border-radius: 4px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); display: block; visibility: visible;">`;
              editorContent = editorContent.replace(placeholder, imgTag);
            } else {
              console.log(`⚠️ Placeholder ${placeholder} not found in content`);
            }
          });
        }
        
        console.log('🔍 Final editor content after image replacement:', editorContent);
        
        // Process tanggal_poskas
        const originalTanggal = poskas.tanggal_poskas;
        const processedTanggal = originalTanggal ? new Date(originalTanggal).toISOString().split('T')[0] : '';
        
        console.log('🔍 Tanggal processing:', {
          original: originalTanggal,
          processed: processedTanggal,
          originalType: typeof originalTanggal,
          isDate: originalTanggal instanceof Date
        });
        
        // Set the processed content
        setFormData(prev => ({
          ...prev,
          tanggal_poskas: processedTanggal,
          isi_poskas: editorContent,
          images: parsedImages
        }));
        
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

  // Parse images string to array
  const parseImagesString = (imagesString) => {
    if (!imagesString) return [];
    
    try {
      console.log('🔍 Parsing images string:', imagesString);
      console.log('🔍 imagesString type:', typeof imagesString);
      console.log('🔍 imagesString isArray:', Array.isArray(imagesString));
      
      let result;
      
      // Handle different formats
      if (Array.isArray(imagesString)) {
        // If it's already an array, use it directly
        result = imagesString;
        console.log('🔍 Images is already an array, using directly');
      } else if (typeof imagesString === 'string') {
        // Try to parse the string as JSON
        try {
          // Clean the string first - remove extra quotes if they exist
          let cleanImages = imagesString.trim();
          
          // Remove extra quotes if the string is wrapped in quotes
          if (cleanImages.startsWith('"') && cleanImages.endsWith('"')) {
            cleanImages = cleanImages.slice(1, -1);
          }
          
          // Unescape the string
          cleanImages = cleanImages.replace(/\\"/g, '"').replace(/\\\\/g, '\\');
          
          console.log('🔍 Cleaned images string:', cleanImages);
          
          result = JSON.parse(cleanImages);
          console.log('🔍 Successfully parsed string as JSON:', result);
        } catch (parseError) {
          console.log('ℹ️ Failed to parse string as JSON, treating as single image name:', parseError);
          // If it's not valid JSON, treat it as a single image name
          result = [{ name: imagesString, url: imagesString }];
        }
      } else if (typeof imagesString === 'object' && imagesString !== null) {
        // If it's a single object, wrap it in an array
        result = [imagesString];
        console.log('🔍 Single object wrapped in array');
      } else {
        console.log('ℹ️ Unknown images format:', typeof imagesString);
        return [];
      }
      
      // Ensure result is an array
      if (!Array.isArray(result)) {
        console.log('ℹ️ Parsed result is not an array, converting...');
        if (result && typeof result === 'object' && result !== null) {
          result = [result];
          console.log('🔍 Converted single object to array');
        } else {
          console.log('ℹ️ Invalid images data, returning empty array');
          return [];
        }
      }
      
      // Filter out invalid images and fix URLs
      result = result.filter(image => {
        if (!image || typeof image !== 'object') {
          console.log('ℹ️ Invalid image object:', image);
          return false;
        }
        return true;
      }).map(image => {
        // Ensure image has required properties
        const validImage = {
          id: image.id || Date.now() + Math.random(),
          name: image.name || `image_${Date.now()}`,
          url: image.url || '',
          uri: image.uri || '',
          serverPath: image.serverPath || ''
        };
        
        // Normalisasi URL menggunakan helper
        if (validImage.url) {
          const normalized = normalizeImageUrl(validImage.url);
          if (normalized !== validImage.url) {
            console.log(`🔍 Normalized image url: ${validImage.url} -> ${normalized}`);
          }
          validImage.url = normalized;
        }
        
        return validImage;
      });
      
      console.log('🔍 Final parsed images:', result);
      return result;
    } catch (error) {
      console.error('❌ Error parsing images string:', error);
      return [];
    }
  };

  // Track images used in editor
  const updateUsedInEditor = () => {
    if (editorRef.current) {
      const content = editorRef.current.innerHTML;
      const usedIds = new Set();
      
      // Find all existing image tags with data-image-id
      const existingImgRegex = /<img[^>]*data-image-id="(\d+)"[^>]*>/g;
      let match;
      
      while ((match = existingImgRegex.exec(content)) !== null) {
        const imageId = parseInt(match[1]);
        // Only add if the image exists and has a valid URL
        const imageExists = existingImages.some(img => 
          img && img.id === imageId && (img.url || img.uri)
        );
        if (imageExists) {
          usedIds.add(imageId);
        }
      }
      
      setUsedInEditor(usedIds);
    }
  };

  // Editor change handler: sanitize and sync state
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
    updateUsedInEditor();
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
    updateUsedInEditor();
  };

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
          setNewImageIds(prev => [...prev, imageId]);
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
            updateUsedInEditor();
          };
          reader.readAsDataURL(file);
        }
      }
    }
  };

  // Convert editor HTML to sanitized content with [IMG:id]
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

  const ensureEditorContent = () => {
    if (editorRef.current && !editorRef.current.innerHTML.trim()) {
      editorRef.current.innerHTML = formData.isi_poskas || '';
    }
  };

  const uploadNewImagesToServer = async (images) => {
    if (!images || images.length === 0) return [];
    try {
      const files = images.filter(i => i.file).map(i => i.file);
      if (files.length === 0) return [];
      const res = await uploadService.uploadMultipleFiles(files, 'poskas');
      // Support both {success,data} and direct array
      const payload = Array.isArray(res) ? res : (res?.data || []);
      if (!Array.isArray(payload)) return [];
      return payload;
    } catch (err) {
      console.error('❌ Error uploading images:', err);
      toast.error('Gagal mengupload gambar');
      return [];
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    ensureEditorContent();
    const editorContent = getEditorContent();
    if (!validateForm()) return;
    setIsSubmitting(true);
    try {
      // Determine which existing images are still used
      const existingUsed = existingImages.filter(img => usedInEditor.has(Number(img.id)));
      // Upload any newly pasted images
      const uploaded = await uploadNewImagesToServer(selectedImages);
      const baseUrl = API_CONFIG.BASE_URL.replace('/api', '');
      const newImages = selectedImages.map((img, idx) => {
        const uploadedFile = uploaded[idx];
        if (uploadedFile) {
          const url = uploadedFile.url || uploadedFile.filename || uploadedFile.path || '';
          const finalUrl = url.startsWith('http') ? url : `${baseUrl}${url.startsWith('/') ? '' : '/'}${url}`;
          return {
            uri: img.uri || '',
            id: img.id,
            name: img.name || `poskas_${img.id}.jpg`,
            url: finalUrl,
            serverPath: uploadedFile.path || uploadedFile.filename || ''
          };
        }
        // Fallback temp URL
        return {
          uri: img.uri || '',
          id: img.id,
          name: img.name || `poskas_${img.id}.jpg`,
          url: `${baseUrl}/uploads/poskas/temp_${img.id}.jpg`,
          serverPath: `poskas/temp_${img.id}.jpg`
        };
      });
      const finalImages = [...existingUsed, ...newImages];

      const payload = {
        tanggal_poskas: formData.tanggal_poskas,
        isi_poskas: editorContent,
        images: finalImages
      };

      const response = await poskasService.updatePoskas(id, payload);
      if (response.success) {
        toast.success('Laporan pos kas berhasil diperbarui');
        navigate('/owner/keuangan/poskas');
      } else {
        toast.error(response.message || 'Gagal memperbarui laporan');
      }
    } catch (err) {
      console.error('❌ Error updating poskas:', err);
      toast.error('Terjadi kesalahan saat menyimpan laporan');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6 bg-gray-50 min-h-screen">
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="p-8 text-center">
            <LoadingSpinner className="h-8 w-8 animate-spin text-blue-500 mx-auto mb-4" />
            <p className="text-gray-600">Memuat data...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-gray-50 min-h-screen">
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="p-8 text-center">
            <div className="bg-red-50 border border-red-200 rounded-lg p-6">
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
                  onClick={() => navigate('/owner/keuangan/poskas')}
                  className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-colors"
                >
                  Kembali ke Daftar
                </button>
              </div>
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
                Edit Laporan Pos Kas
              </h1>
              <p className="text-gray-600">
                Perbarui data laporan pos kas
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Form Section */}
      <div className="bg-white rounded-lg shadow-sm border">
        <form onSubmit={handleSubmit}>
          {/* Tanggal */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Calendar className="h-5 w-5 text-blue-600" />
              </div>
              <label className="text-lg font-semibold text-gray-900">
                Tanggal Laporan
              </label>
            </div>
              <input
                type="date"
                value={formData.tanggal_poskas}
              readOnly
              className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-600 cursor-not-allowed"
                required
              />
            <p className="text-sm text-gray-500 mt-2">
              Tanggal tidak dapat diubah karena sudah terdaftar saat pembuatan laporan
            </p>
            </div>

          {/* Content Editor */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            {/* Toolbar */}
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

            {/* Editor */}
            <div
              ref={editorRef}
              contentEditable
              onInput={handleEditorChange}
              onPaste={handleEditorPaste}
              onKeyUp={handleEditorKeyUp}
              onMouseUp={saveSelection}
              onKeyDown={saveSelection}
              onBlur={saveSelection}
              onFocus={saveSelection}
              className="min-h-[300px] p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              data-placeholder="Tulis laporan pos kas Anda di sini... (minimal 10 karakter)"
              style={{ 
                whiteSpace: 'pre-wrap',
                lineHeight: '1.6'
              }}
            ></div>
            
            <p className="text-sm text-gray-500">
              💡 Tips: Anda bisa paste gambar langsung dari clipboard (Ctrl+V)
            </p>
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
              className="flex items-center space-x-2 px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <LoadingSpinner className="h-4 w-4" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              <span>{isSubmitting ? 'Menyimpan...' : 'Simpan'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default OwnerPoskasEdit; 

