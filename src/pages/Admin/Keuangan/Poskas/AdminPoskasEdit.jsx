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
import { MENU_CODES } from '@/config/menuCodes';
import { API_CONFIG } from '../../../../config/constants';
import { normalizeImageUrl } from '../../../../utils/url';
import RichTextEditor from '../../../../components/UI/RichTextEditor';

const AdminPoskasEdit = () => {
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
  const lastContentRef = useRef('');
  const [editorInitialized, setEditorInitialized] = useState(false);

  // Formatting active states
  const [isBoldActive, setIsBoldActive] = useState(false);
  const [isItalicActive, setIsItalicActive] = useState(false);
  const [isUnderlineActive, setIsUnderlineActive] = useState(false);

  // Handler untuk RichTextEditor (sinkronkan HTML ke formData)
  const handleEditorHtmlChange = (e) => {
    const html = e?.target?.value ?? '';
    setFormData(prev => ({ ...prev, isi_poskas: html }));
  };

  const updateFormatState = () => {
    try {
      setIsBoldActive(document.queryCommandState('bold'));
      setIsItalicActive(document.queryCommandState('italic'));
      setIsUnderlineActive(document.queryCommandState('underline'));
    } catch (_) {}
  };

  // Helper: upload only new images for Edit flow and return server metadata
  const uploadNewImagesToServer = async (images) => {
    if (!images || images.length === 0) return [];
    const results = [];
    for (const img of images) {
      try {
        const file = img?.file || img; // accept File or {file,id}
        if (!file) { results.push(null); continue; }
        const formData = new FormData();
        formData.append('images', file);
        const res = await fetch(`${API_CONFIG.BASE_URL}/upload/poskas`, {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` },
          body: formData,
        });
        if (!res.ok) { results.push(null); continue; }
        const json = await res.json();
        const first = Array.isArray(json?.data) ? json.data[0] : null;
        results.push(first || null);
      } catch (err) {
        console.error('❌ uploadNewImagesToServer error:', err);
        results.push(null);
      }
    }
    return results;
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

  // Sanitize HTML to enforce LTR by removing dir/style and BiDi control chars
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

  // Remove zero-width characters
  const removeZeroWidth = (html) => (html || '').replace(/[\u200B-\u200D\uFEFF]/g, '');

  // Normalize <b> structure: collapse nested, split around <br> and [IMG:id], unwrap placeholder-only bold
  const normalizeBoldHtml = (html) => {
    if (!html) return html;
    let out = html;
    // standardize strong to b
    out = out.replace(/<\/?strong>/gi, (m) => m.toLowerCase().includes('</') ? '</b>' : '<b>');
    // remove <b><br></b> and empty <b></b>
    out = out.replace(/<b>\s*(?:<br\s*\/?\s*>)+\s*<\/b>/gi, '<br>');
    out = out.replace(/<b>\s*<\/b>/gi, '');
    // collapse nested <b> until stable
    try {
      let prev;
      do {
        prev = out;
        out = out.replace(/<b>\s*<b>/gi, '<b>').replace(/<\/b>\s*<\/b>/gi, '</b>');
      } while (out !== prev);
    } catch {}
    // unwrap placeholder-only bold
    out = out.replace(/<b>\s*(\[IMG:\d+\])\s*<\/b>/gi, '$1');
    // split bold across <br>
    out = out.replace(/<b>([\s\S]*?)<br\s*\/?>([\s\S]*?)<\/b>/gi, (m, a, b) => {
      const left = a.trim() ? `<b>${a}</b>` : '';
      const right = b.trim() ? `<b>${b}</b>` : '';
      return `${left}<br>${right}`;
    });
    // split bold around placeholders
    out = out.replace(/<b>([^]*?)\[IMG:(\d+)\]([^]*?)<\/b>/gi, (m, left, id, right) => {
      const L = left.trim() ? `<b>${left}</b>` : '';
      const R = right.trim() ? `<b>${right}</b>` : '';
      return `${L}[IMG:${id}]${R}`;
    });
    return out;
  };
  // Cleanup leading/trailing unmatched <b> tags
  const fixStrayB = (html) => {
    if (!html) return html;
    let out = html;
    out = out.replace(/^(\s*<\/b>)+/i, '');
    out = out.replace(/(<b>\s*)+$/i, '');
    return out;
  };
  // Unbold-safe: break bold scope where spans force normal weight
  const unboldSafe = (html) => {
    if (!html) return html;
    let out = html;
    // Replace span with font-weight: normal to close/open <b> around it
    out = out.replace(/<span[^>]*style="[^"]*font-weight\s*:\s*normal[^"]*"[^>]*>([\s\S]*?)<\/span>/gi, (_m, inner) => `</b>${inner}<b>`);
    out = fixStrayB(out);
    return out;
  };

  // Add CSS for editor behavior (LTR + images + placeholder)
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      /* Force LTR typing for editor and children */
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

  useEffect(() => {
    fetchPoskasDetail();
  }, [id]);

  // Keep toolbar state in sync with selection inside the editor
  useEffect(() => {
    const editor = editorRef.current;
    if (!editor) return;
    const onMouseUp = () => { updateFormatState(); };
    const onKeyUp = () => { updateFormatState(); };
    const onSelectionChange = () => {
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

  // Update editor content when formData changes (only once to avoid caret reset)
  useEffect(() => {
    console.log('🔍 useEffect triggered with:', {
      hasEditorRef: !!editorRef.current,
      hasIsiPoskas: !!formData.isi_poskas,
      imagesCount: existingImages?.length || 0,
      images: existingImages
    });
    
    if (!editorInitialized && editorRef.current && formData.isi_poskas) {
      console.log('🔍 Setting editor content:', formData.isi_poskas);
      
      // Small delay to ensure CSS is applied
      setTimeout(() => {
        const sanitized = sanitizeToLTR(formData.isi_poskas);
        editorRef.current.innerHTML = sanitized;
        lastContentRef.current = sanitized;
        setEditorInitialized(true);
        // place caret at end
        try { placeCaretAtEnd(editorRef.current); } catch {}
        updateFormatState();
        
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
      }, 300); // Increased delay to ensure everything is ready
    }
  }, [formData.isi_poskas, existingImages, editorInitialized]);

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
      console.log('🔍 Images used in editor:', Array.from(usedIds));
    }
  };

  // Handle text editor changes (do not set state on every keystroke; avoid caret reset)
  const handleEditorChange = (e) => {
    const content = e.target.innerHTML;
    lastContentRef.current = content;
    // Microtask sanitize for any rogue dir/style injected during typing
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
                .replace(/text-align\s*:\s*right\s*;?/gi, 'text-align: left;')
                .replace(/\s*;\s*$/, '');
              if (cleaned.trim().length === 0) n.removeAttribute('style');
              else n.setAttribute('style', cleaned);
            }
          });
        } catch {}
      });
    }
    // Update used images tracking
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
            .replace(/text-align\s*:\s*right\s*;?/gi, 'text-align: left;')
            .replace(/\s*;\s*$/, '');
          if (cleaned.trim().length === 0) n.removeAttribute('style');
          else n.setAttribute('style', cleaned);
        }
      });
    } catch {}
  };

  const handleEditorBlur = () => {
    const content = editorRef.current ? editorRef.current.innerHTML : '';
    let clean = removeZeroWidth(content);
    clean = sanitizeToLTR(clean);
    clean = unboldSafe(clean);
    clean = normalizeBoldHtml(clean);
    clean = fixStrayB(clean);
    if (editorRef.current) editorRef.current.innerHTML = clean;
    lastContentRef.current = clean;
    setFormData(prev => ({ ...prev, isi_poskas: clean }));
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
          
          // Tidak ada validasi ukuran atau jumlah gambar
          
          // Generate ID for this new image
          const timestamp = Date.now();
          const imageId = timestamp + Math.floor(Math.random() * 1000);
          
          // Add to selected images
          setSelectedImages(prev => [...prev, file]);
          
          // Store the ID for this image
          setNewImageIds(prev => [...prev, imageId]);
          
          console.log(`🔍 Generated ID for pasted image: ${imageId}`);
          
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
            img.setAttribute('data-image-id', imageId); // Add data attribute for ID
            
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
    // Handle plain text paste safely
    const plain = e.clipboardData.getData('text/plain');
    if (plain) {
      e.preventDefault();
      const safe = plain.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/\r?\n/g, '<br>');
      document.execCommand('insertHTML', false, safe);
    }
    // Post-paste sanitize for non-image content
    setTimeout(() => {
      if (editorRef.current) {
        let cleaned = removeZeroWidth(editorRef.current.innerHTML);
        cleaned = sanitizeToLTR(cleaned);
        cleaned = unboldSafe(cleaned);
        cleaned = normalizeBoldHtml(cleaned);
        cleaned = fixStrayB(cleaned);
        editorRef.current.innerHTML = cleaned;
        try { placeCaretAtEnd(editorRef.current); } catch {}
      }
    }, 0);
  };

  // Handle image selection
  const handleImageSelect = (e) => {
    const files = Array.from(e.target.files);
    
    // Tidak ada validasi tipe/ukuran/jumlah file
    const validFiles = files;

    // Generate IDs for new images
    const newIds = validFiles.map(() => {
      const timestamp = Date.now();
      return timestamp + Math.floor(Math.random() * 1000);
    });

    setSelectedImages(prev => [...prev, ...validFiles]);
    setNewImageIds(prev => [...prev, ...newIds]);

    console.log(`🔍 Generated IDs for selected images:`, newIds);

    // Create preview URLs and INSERT images into editor with data-image-id so they are referenced
    validFiles.forEach((file, idx) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const dataUrl = e.target.result;
        setImagePreviewUrls(prev => [...prev, dataUrl]);

        // Insert into editor at caret/end with data-image-id matching newIds[idx]
        const imageId = newIds[idx];
        if (editorRef.current && imageId) {
          const img = document.createElement('img');
          img.src = dataUrl;
          img.alt = `New image ${idx + 1}`;
          img.className = 'pasted-image';
          img.setAttribute('data-image-id', imageId);

          // Insert at current selection or append at end
          const sel = window.getSelection();
          if (sel && sel.rangeCount > 0) {
            const range = sel.getRangeAt(0);
            range.deleteContents();
            range.insertNode(img);
            range.collapse(false);

            const br = document.createElement('br');
            range.insertNode(br);
            range.collapse(false);
          } else {
            editorRef.current.appendChild(img);
            editorRef.current.appendChild(document.createElement('br'));
          }

          // Trigger input event so state/toolbar updates
          const evt = new Event('input', { bubbles: true });
          editorRef.current.dispatchEvent(evt);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  // Remove new image
  const removeNewImage = (index) => {
    setSelectedImages(prev => prev.filter((_, i) => i !== index));
    setImagePreviewUrls(prev => prev.filter((_, i) => i !== index));
    setNewImageIds(prev => prev.filter((_, i) => i !== index));
  };

  // Remove existing image
  const removeExistingImage = (index) => {
    setExistingImages(prev => prev.filter((_, i) => i !== index));
  };

  // Add image to editor
  const addImageToEditor = (image) => {
    if (editorRef.current) {
      // Build URL via helper
      const imageUrl = normalizeImageUrl(image.url || image.uri);
      
      if (!imageUrl) {
        console.error('❌ No valid URL for image:', image);
        toast.error('Gambar tidak memiliki URL yang valid');
        return;
      }
      
      const imgElement = document.createElement('img');
      imgElement.src = imageUrl;
      imgElement.alt = `Existing ${image.name || 'image'}`;
      imgElement.className = 'editor-image';
      imgElement.setAttribute('data-image-id', image.id);

      const selection = window.getSelection();
      if (selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        range.deleteContents();
        range.insertNode(imgElement);
        range.collapse(false);

        // Add a line break after the image
        const br = document.createElement('br');
        range.insertNode(br);
        range.collapse(false);

        // Trigger editor change event
        const event = new Event('input', { bubbles: true });
        editorRef.current.dispatchEvent(event);

        // Update usedInEditor state
        setUsedInEditor(prev => new Set([...prev, image.id]));
        console.log(`✅ Image with ID ${image.id} added to editor.`);
        toast.success('Gambar berhasil ditambahkan ke editor');
      } else {
        console.warn('No selection found to insert image.');
        toast.error('Gagal menambahkan gambar ke editor. Tidak ada teks yang dipilih.');
      }
    } else {
      console.warn('Editor ref not available.');
      toast.error('Gagal menambahkan gambar ke editor. Editor tidak tersedia.');
    }
  };

  // Validate form data (gunakan nilai dari RichTextEditor melalui formData.isi_poskas)
  const validateForm = () => {
    const editorContent = (formData?.isi_poskas || '').trim();
    if (!editorContent) {
      toast.error('Isi laporan tidak boleh kosong');
      return false;
    }
    if (editorContent.replace(/<br\s*\/?>/gi, '').replace(/<[^>]+>/g, '').trim().length < 10) {
      toast.error('Isi laporan minimal 10 karakter');
      return false;
    }
    return true;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    // Ambil konten dari state yang sudah diserialisasi oleh RichTextEditor
    const editorContent = formData?.isi_poskas || '';
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
      // Check if there are any images in the editor content
      const hasImagesInContent = editorContent.includes('[IMG:');
      console.log('🔍 Debug: Has images in content:', hasImagesInContent);
      
      if (hasImagesInContent) {
        // Save with images
        console.log('🔍 Debug: Saving with images...');

        // Kumpulkan ID gambar yang benar-benar dipakai di konten editor
        const usedIds = new Set();
        const idRegex = /\[IMG:(\d+(?:\.\d+)?)\]/g;
        let m;
        while ((m = idRegex.exec(editorContent)) !== null) {
          usedIds.add(String(m[1]));
        }
        console.log('🔍 Used image IDs in content:', Array.from(usedIds));

        // Siapkan data gambar untuk dikirim (hanya yang dipakai)
        let allImagesData = [];

        // 1) Ambil gambar existing yang masih direferensikan
        const existingUsed = (existingImages || [])
          .filter(img => img && img.id && (img.url || img.uri))
          .filter(img => usedIds.has(String(img.id)));
        allImagesData.push(...existingUsed);

        // 2) Upload gambar baru (File) bila ada, lalu padankan ID-nya dari newImageIds dan filter by usedIds
        if (selectedImages.length > 0) {
          console.log('🔍 Uploading new images to server...');
          const uploadedNewImages = await uploadNewImagesToServer(selectedImages);
          console.log('🔍 Uploaded new images metadata:', uploadedNewImages);

          const mappedNew = uploadedNewImages.map((uploaded, index) => {
            if (!uploaded) return null;
            const idForThis = newImageIds[index];
            if (!idForThis) return null;
            // Bangun objek gambar baru dengan id sesuai placeholder di konten
            return {
              id: idForThis,
              name: uploaded.filename || (uploaded.path ? uploaded.path.split('/').pop() : `poskas_${idForThis}.jpg`),
              url: uploaded.url && /^https?:\/\//i.test(uploaded.url)
                ? uploaded.url
                : `${API_CONFIG.BASE_URL.replace('/api','')}${uploaded.url}`,
              serverPath: uploaded.serverPath || uploaded.path,
            };
          }).filter(Boolean)
            // Hanya sertakan yang benar-benar dipakai di konten
            .filter(img => usedIds.has(String(img.id)));

          allImagesData.push(...mappedNew);
        }

        // Urutkan allImagesData mengikuti urutan kemunculan di konten (usedIds sequence)
        const order = Array.from(usedIds);
        allImagesData.sort((a, b) => order.indexOf(String(a.id)) - order.indexOf(String(b.id)));
        console.log('🔍 Debug: Final images to send (ordered by content):', allImagesData);

        // Use the existing PUT route with JSON data
        const updatePayload = {
          tanggal_poskas: finalFormData.tanggal_poskas,
          isi_poskas: finalFormData.isi_poskas,
          // Konsisten dengan create: kirim sebagai array of objects
          images: allImagesData || []
        };
        console.log('🔍 Debug: Update payload being sent:', updatePayload);
        const response = await poskasService.updatePoskas(id, updatePayload);
        
        console.log('🔍 Debug: Service response:', response);
        
        if (response.success) {
          toast.success('Laporan pos kas berhasil diperbarui');
          navigate('/admin/keuangan/poskas');
        } else {
          toast.error(response.message || 'Gagal memperbarui laporan');
        }
      } else {
        // Save without images - use text-only logic
        console.log('🔍 Debug: Saving without images...');
        
                 // Prepare existing images data
         const allExistingImages = existingImages.filter(img => img && img.id && (img.url || img.uri));
         console.log('🔍 Debug: All existing images to preserve (text-only):', allExistingImages);

        console.log('🔍 Debug: Sending text-only data to service...');
        const response = await poskasService.updatePoskas(id, {
          tanggal_poskas: finalFormData.tanggal_poskas,
          isi_poskas: finalFormData.isi_poskas,
          images: allExistingImages
        });
        
        console.log('🔍 Debug: Service response:', response);
        
        if (response.success) {
          toast.success('Laporan pos kas berhasil diperbarui');
          navigate('/admin/keuangan/poskas');
        } else {
          toast.error(response.message || 'Gagal memperbarui laporan');
        }
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
    }
  };

  // Ambil konten editor dan konversi, mempertahankan <strong>/<em>/<u>/<br> + placeholder [IMG:id]
  const getEditorContent = () => {
    if (!editorRef.current) return '';
    let html = editorRef.current.innerHTML || '';
    console.log('🔍 Debug: Getting editor content:', html);

    // Replace existing image tags with [IMG:id]
    html = html.replace(/<img[^>]*data-image-id="(\d+)"[^>]*>/g, (_m, id) => `[IMG:${id}]`);
    // Replace base64 images with new IDs
    html = html.replace(/<img[^>]*src="data:image[^"]*"[^>]*>/g, () => `[IMG:${Date.now() + Math.floor(Math.random()*1000)}]`);

    // Normalize <b>/<i> to <strong>/<em>
    html = html.replace(/<\s*b\s*>/gi, '<strong>')
               .replace(/<\s*\/\s*b\s*>/gi, '</strong>')
               .replace(/<\s*i\s*>/gi, '<em>')
               .replace(/<\s*\/\s*i\s*>/gi, '</em>');

    // Block to line breaks
    html = html.replace(/<\s*p[^>]*>/gi, '')
               .replace(/<\s*\/\s*p\s*>/gi, '<br>')
               .replace(/<\s*div[^>]*>/gi, '')
               .replace(/<\s*\/\s*div\s*>/gi, '');

    // Protect allowed tags
    const ph = { so:'%%SO%%', sc:'%%SC%%', eo:'%%EO%%', ec:'%%EC%%', uo:'%%UO%%', uc:'%%UC%%', br:'%%BR%%' };
    html = html.replace(/<strong>/gi, ph.so)
               .replace(/<\/strong>/gi, ph.sc)
               .replace(/<em>/gi, ph.eo)
               .replace(/<\/em>/gi, ph.ec)
               .replace(/<u>/gi, ph.uo)
               .replace(/<\/u>/gi, ph.uc)
               .replace(/<br\s*\/?\s*>/gi, ph.br);

    // Strip others
    html = html.replace(/<[^>]*>/g, '');

    // Restore allowed
    html = html.replace(new RegExp(ph.so,'g'), '<strong>')
               .replace(new RegExp(ph.sc,'g'), '</strong>')
               .replace(new RegExp(ph.eo,'g'), '<em>')
               .replace(new RegExp(ph.ec,'g'), '</em>')
               .replace(new RegExp(ph.uo,'g'), '<u>')
               .replace(new RegExp(ph.uc,'g'), '</u>')
               .replace(new RegExp(ph.br,'g'), '<br>');

    // Basic sanitize
    html = html.replace(/<script.*?>[\s\S]*?<\/script>/gi, '').replace(/&nbsp;/g, ' ').trim();
    console.log('🔍 Debug: Processed content:', html);
    return html;
  };

  if (loading) {
    return (
      <div className="p-0 bg-gray-50 min-h-screen">
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="p-8 text-center">
            <LoadingSpinner className="h-8 w-8 animate-spin text-red-600 mx-auto mb-4" />
            <p className="text-gray-600">Memuat data...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-0 bg-gray-50 min-h-screen">
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
                  onClick={() => navigate('/admin/keuangan/poskas')}
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
    <div className="p-0 bg-gray-50 min-h-screen">
      {/* Header - match Omset style */}
      <div className="bg-red-800 text-white px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-sm font-semibold bg-white/10 rounded px-2 py-1 select-none">{MENU_CODES.keuangan.poskas}</span>
            <div>
              <h1 className="text-xl md:text-2xl font-extrabold tracking-tight">EDIT POSKAS</h1>
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
              form="poskas-edit-form"
              type="submit"
              className="inline-flex items-center gap-2 px-4 py-2 bg-white text-red-700 rounded-full hover:bg-red-50 transition-colors shadow-sm"
            >
              <Save className="h-4 w-4" />
              <span>Perbarui</span>
            </button>
          </div>
        </div>
      </div>

      {/* Form Section */}
      <div className="bg-white rounded-none shadow-sm border-y">
        <form id="poskas-edit-form" onSubmit={handleSubmit}>
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

          {/* Existing Images Section (hidden) */}
          {false && (
          <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-2 bg-blue-100 rounded-lg">
                <ImageIcon className="h-5 w-5 text-blue-600" />
              </div>
              <label className="text-lg font-semibold text-gray-900">
                Gambar yang Ada ({existingImages.filter(image => image && (image.url || image.uri)).length})
              </label>
            </div>
            
            {existingImages.filter(image => image && (image.url || image.uri)).length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {existingImages.filter(image => {
                  // Filter out images without valid URLs
                  if (!image || (!image.url && !image.uri)) {
                    console.log(`⚠️ Skipping image - no valid URL:`, image);
                    return false;
                  }
                  return true;
                }).map((image, index) => {
                  // Construct the correct image URL
                  let imageUrl = '';
                  if (image.url) {
                    if (image.url.startsWith('http') || image.url.startsWith('data:')) {
                      // Already absolute URL or data URL, but check if it has /api in wrong place
                      imageUrl = image.url;
                      if (imageUrl.includes('/api/uploads/')) {
                        // Remove /api from upload URLs
                        imageUrl = imageUrl.replace('/api/uploads/', '/uploads/');
                        console.log(`🔍 Fixed /api in existing image display URL: ${image.url} -> ${imageUrl}`);
                      }
                    } else {
                      // Relative URL, add base URL
                      const baseUrl = API_CONFIG.BASE_URL.replace('/api', '');
                      imageUrl = `${baseUrl}${image.url.startsWith('/') ? '' : '/'}${image.url}`;
                    }
                  } else if (image.uri) {
                    // Fallback to uri if url is not available
                    imageUrl = image.uri;
                  }
                  
                  const isUsedInEditor = usedInEditor.has(image.id);
                  
                  console.log(`🔍 Existing image ${index + 1} display:`, {
                    originalUrl: image.url,
                    uri: image.uri,
                    constructedUrl: imageUrl,
                    baseUrl: API_CONFIG.BASE_URL,
                    imageData: image,
                    isUsedInEditor
                  });
                  
                  // Only render if we have a valid URL
                  if (!imageUrl) {
                    console.warn(`⚠️ No valid URL for image ${index + 1}:`, image);
                    return null;
                  }
                  
                  return (
                    <div key={index} className="relative group">
                      <div className={`relative ${isUsedInEditor ? 'ring-2 ring-green-500' : 'ring-2 ring-gray-300'}`}>
                        <img
                          src={imageUrl}
                          alt={`Existing ${index + 1}`}
                          className="w-full h-32 object-cover rounded-lg"
                          onError={(e) => {
                            console.error(`❌ Failed to load existing image ${index + 1}:`, imageUrl);
                            e.target.style.display = 'none';
                            e.target.nextSibling.style.display = 'flex';
                          }}
                          onLoad={() => {
                            console.log(`✅ Successfully loaded existing image ${index + 1}:`, imageUrl);
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
                        
                        {/* Status indicator */}
                        <div className={`absolute top-2 left-2 px-2 py-1 rounded-full text-xs font-medium ${
                          isUsedInEditor 
                            ? 'bg-green-500 text-white' 
                            : 'bg-gray-500 text-white'
                        }`}>
                          {isUsedInEditor ? '✓ Digunakan' : 'Tidak digunakan'}
                        </div>
                      </div>
                      
                      {/* Action buttons */}
                      <div className="absolute top-2 right-2 flex space-x-1">
                        {!isUsedInEditor && (
                          <button
                            type="button"
                            onClick={() => addImageToEditor(image)}
                            className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                            title="Tambah ke editor"
                          >
                            +
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => removeExistingImage(index)}
                          className="bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                          title="Hapus gambar"
                        >
                          ×
                        </button>
                      </div>
                      
                      {/* Click to insert overlay */}
                      {!isUsedInEditor && (
                        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-200 rounded-lg flex items-center justify-center">
                          <div className="text-white text-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <div className="text-sm font-medium">Klik untuk sisipkan</div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500">Tidak ada gambar tersimpan</p>
              </div>
            )}
            
            {existingImages.filter(image => image && (image.url || image.uri)).length > 0 && (
              <p className="text-sm text-gray-500 mt-4">
                💡 Gambar dengan border hijau sedang digunakan di editor. Klik tombol "+" untuk menambahkan gambar ke editor.
              </p>
            )}
          </div>
          )}

          {/* Content Editor */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            {/* Header: Isi Pos Kas */}
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-2 bg-green-100 rounded-lg">
                <FileText className="h-5 w-5 text-green-600" />
              </div>
              <label className="text-lg font-semibold text-gray-900">
                Isi Pos Kas
              </label>
            </div>
            {/* Toolbar */}
            {/* Toolbar contentEditable dihapus karena memakai RichTextEditor */}
            
            {/* Editor e-learning */}
            <RichTextEditor
              value={formData.isi_poskas}
              onChange={handleEditorHtmlChange}
              onFilesChange={(files) => {
                // files: array of { file, id }
                setSelectedImages(files); // uploadNewImagesToServer menerima File atau {file,id}
                setNewImageIds(files.map(f => f.id));
              }}
              placeholder="Tulis laporan pos kas Anda di sini... (minimal 10 karakter)"
              rows={12}
              hideAlign={true}
              hideImage={true}
            />
            
            
          </div>

          {/* Hidden sections for existing images and upload */}
          <div style={{ display: 'none' }}>
            {/* Existing Images */}
            <div style={{ display: 'none' }}>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Gambar yang Ada ({existingImages.filter(image => image && (image.url || image.uri)).length})
              </label>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {existingImages.filter(image => {
                  // Filter out images without valid URLs
                  if (!image || (!image.url && !image.uri)) {
                    console.warn(`⚠️ Skipping image ${index + 1} - no valid URL:`, image);
                    return false;
                  }
                  return true;
                }).map((image, index) => {
                  // Construct the correct image URL
                  let imageUrl = '';
                  if (image.url) {
                    if (image.url.startsWith('http') || image.url.startsWith('data:')) {
                      // Already absolute URL or data URL
                      imageUrl = image.url;
                    } else {
                      // Relative URL, add base URL
                      const baseUrl = API_CONFIG.BASE_URL.replace('/api', '');
                      imageUrl = `${baseUrl}${image.url.startsWith('/') ? '' : '/'}${image.url}`;
                    }
                  } else if (image.uri) {
                    // Fallback to uri if url is not available
                    imageUrl = image.uri;
                  }
                  
                  const isUsedInEditor = usedInEditor.has(image.id);
                  
                  console.log(`🔍 Existing image ${index + 1} display:`, {
                    originalUrl: image.url,
                    uri: image.uri,
                    constructedUrl: imageUrl,
                    baseUrl: API_CONFIG.BASE_URL,
                    imageData: image,
                    isUsedInEditor
                  });
                  
                  // Only render if we have a valid URL
                  if (!imageUrl) {
                    console.warn(`⚠️ No valid URL for image ${index + 1}:`, image);
                    return null;
                  }
                  
                  return (
                    <div key={index} className="relative group">
                      <div className={`relative ${isUsedInEditor ? 'ring-2 ring-green-500' : 'ring-2 ring-gray-300'}`}>
                        <img
                          src={imageUrl}
                          alt={`Existing ${index + 1}`}
                          className="w-full h-32 object-cover rounded-lg"
                          onError={(e) => {
                            console.error(`❌ Failed to load existing image ${index + 1}:`, imageUrl);
                            e.target.style.display = 'none';
                            e.target.nextSibling.style.display = 'flex';
                          }}
                          onLoad={() => {
                            console.log(`✅ Successfully loaded existing image ${index + 1}:`, imageUrl);
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
                        
                        {/* Status indicator */}
                        <div className={`absolute top-2 left-2 px-2 py-1 rounded-full text-xs font-medium ${
                          isUsedInEditor 
                            ? 'bg-green-500 text-white' 
                            : 'bg-gray-500 text-white'
                        }`}>
                          {isUsedInEditor ? '✓ Digunakan' : 'Tidak digunakan'}
                        </div>
                      </div>
                      
                      {/* Action buttons */}
                      <div className="absolute top-2 right-2 flex space-x-1">
                        {!isUsedInEditor && (
                          <button
                            type="button"
                            onClick={() => addImageToEditor(image)}
                            className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                            title="Tambah ke editor"
                          >
                            +
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => removeExistingImage(index)}
                          className="bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                          title="Hapus gambar"
                        >
                          ×
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
              {existingImages.filter(image => image && (image.url || image.uri)).length === 0 ? (
                <div className="text-center py-8">
                  <div className="text-4xl text-gray-300 mb-2">📷</div>
                  <p className="text-gray-500">Tidak ada gambar yang tersedia</p>
                </div>
              ) : (
                <p className="text-sm text-gray-500 mt-2">
                  Gambar dengan border hijau sedang digunakan di editor. Klik tombol "+" untuk menambahkan gambar ke editor.
                </p>
              )}
            </div>

            {/* New Image Upload */}
            <div style={{ display: 'none' }}>
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
                  Format file bebas, tidak ada batasan jumlah maupun ukuran.
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
          )}
        </form>
      </div>
    </div>
  );
};

export default AdminPoskasEdit; 