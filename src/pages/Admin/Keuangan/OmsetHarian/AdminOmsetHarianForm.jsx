import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../../../../contexts/AuthContext';
import { omsetHarianService } from '../../../../services/omsetHarianService';
import api from '../../../../services/api';
import { toast } from 'react-hot-toast';
import LoadingSpinner from '../../../../components/UI/LoadingSpinner';
import { getEnvironmentConfig } from '../../../../config/environment';
import { normalizeImageUrl } from '../../../../utils/url';
import RichTextEditor from '../../../../components/UI/RichTextEditor';
import { ArrowLeft, Calendar, FileText,  Image as ImageIcon, Upload, X, Save, RefreshCw 
} from 'lucide-react';

const AdminOmsetHarianForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { user } = useAuth();
  const envConfig = getEnvironmentConfig();
  
  const [formData, setFormData] = useState({
    tanggal_omset: new Date().toISOString().split('T')[0],
    isi_omset: '',
    images: []
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedImages, setSelectedImages] = useState([]);
  const [imagePreviewUrls, setImagePreviewUrls] = useState([]);
  const [usedInEditor, setUsedInEditor] = useState(new Set()); // Track which images are used in editor
  const editorRef = useRef(null);
  const lastContentRef = useRef('');
  const selectionRef = useRef(null); // keep last selection range inside editor
  const [isBoldActive, setIsBoldActive] = useState(false);
  const [isItalicActive, setIsItalicActive] = useState(false);
  const [isUnderlineActive, setIsUnderlineActive] = useState(false);
  const SHOW_IMAGE_UI = false; // sembunyikan UI gambar di halaman edit

  // Handler RichTextEditor: sinkronkan HTML ke formData
  const handleEditorHtmlChange = (e) => {
    const html = e?.target?.value ?? '';
    setFormData(prev => ({ ...prev, isi_omset: html }));
  };

  const updateFormatState = () => {
    try {
      setIsBoldActive(document.queryCommandState('bold'));
      setIsItalicActive(document.queryCommandState('italic'));
      setIsUnderlineActive(document.queryCommandState('underline'));
    } catch (_) {}
  };

  // Escape HTML to prevent unintended tags when inserting plain text
  const escapeHtml = (text) => {
    if (text == null) return '';
    return String(text)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  };

  // Selection helpers so toolbar can apply formatting in one click
  const saveSelection = () => {
    try {
      const sel = window.getSelection();
      if (sel && sel.rangeCount > 0) {
        const range = sel.getRangeAt(0);
        if (editorRef.current && editorRef.current.contains(range.commonAncestorContainer)) {
          selectionRef.current = range.cloneRange();
        }
      }
    } catch (_) {}
  };

  const restoreSelection = () => {
    try {
      const sel = window.getSelection();
      if (selectionRef.current && sel) {
        sel.removeAllRanges();
        sel.addRange(selectionRef.current);
      }
    } catch (_) {}
  };

  // Helpers: preserve line breaks during toolbar formatting
  const selectionHasBr = () => {
    try {
      if (!selectionRef.current) return false;
      const frag = selectionRef.current.cloneContents();
      if (!frag) return false;
      return !!frag.querySelector?.('br');
    } catch (_) { return false; }
  };

  const ensureBrAtCursor = () => {
    try {
      const sel = window.getSelection();
      if (!sel || sel.rangeCount === 0) return;
      const range = sel.getRangeAt(0);
      // If nextSibling is not a BR and we're at the end of a line, insert BR
      const container = range.endContainer;
      let node = container.nodeType === Node.TEXT_NODE ? container.parentNode : container;
      if (!node) return;
      // Check if there's a BR right at caret position by looking at following nodes
      let after = range.endContainer;
      if (after.nodeType === Node.TEXT_NODE) {
        // split not needed, just inspect nextSibling of parent when at end of text
        if (range.endOffset < after.textContent.length) return; // caret in middle of text
        after = after.parentNode?.nextSibling;
      } else {
        after = after.childNodes[range.endOffset] || after.nextSibling;
      }
      const isBrThere = after && after.nodeType === Node.ELEMENT_NODE && after.tagName === 'BR';
      if (!isBrThere) {
        document.execCommand('insertHTML', false, '<br>');
      }
    } catch (_) {}
  };

  // Normalize/sanitize bold tags in HTML so there are no empty <strong></strong> and standardize to <strong>
  const normalizeBoldHtml = (html) => {
    if (!html) return html;
    let out = html;
    // Normalize b -> strong
    out = out.replace(/<\s*b\s*>/gi, '<strong>')
             .replace(/<\s*\/\s*b\s*>/gi, '</strong>');
    // Remove <strong><br></strong> -> <br>
    out = out.replace(/<strong>\s*(?:<br\s*\/?\s*>)+\s*<\/strong>/gi, '<br>');
    // Remove empty bolds: <strong>   </strong>
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

    // Unwrap placeholder-only bold: <strong>[IMG:123]</strong> -> [IMG:123]
    out = out.replace(/<strong>\s*(\[IMG:\d+\])\s*<\/strong>/gi, '$1');

    // Split strong across placeholders so image breaks bold scope
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

    // Split strong across <br>: <strong>a<br>b</strong> => <strong>a</strong><br><strong>b</strong>
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
    // Break strong scope where span forces normal weight
    out = out.replace(/<span[^>]*style="[^"]*font-weight\s*:\s*normal[^"]*"[^>]*>([\s\S]*?)<\/span>/gi, (_m, inner) => `</strong>${inner}<strong>`);
    out = fixStrayStrong(out);
    return out;
  };

  // Sanitize the current editor DOM HTML in-place
  const sanitizeEditorHtml = () => {
    if (!editorRef.current) return;
    const before = editorRef.current.innerHTML;
    let cleaned = unboldSafe(before);
    cleaned = normalizeBoldHtml(cleaned);
    cleaned = fixStrayStrong(cleaned);
    if (cleaned !== before) {
      editorRef.current.innerHTML = cleaned;
    }
  };

  // Helper: place caret at the end of editor content (match Poskas UX)
  const placeCaretAtEnd = (el) => {
    if (!el) return;
    const range = document.createRange();
    range.selectNodeContents(el);
    range.collapse(false);
    const sel = window.getSelection();
    sel.removeAllRanges();
    sel.addRange(range);
  };

  useEffect(() => {
    if (id) {
      setIsEditMode(true);
      loadOmsetHarian();
    }
  }, [id]);

  // Update editor content when formData changes
  useEffect(() => {
    console.log('🔍 useEffect triggered with:', {
      hasEditorRef: !!editorRef.current,
      hasIsiOmset: !!formData.isi_omset,
      isEditMode,
      imagesCount: formData.images?.length || 0,
      images: formData.images
    });
    
    if (editorRef.current && formData.isi_omset && isEditMode) {
      console.log('🔍 Setting editor content:', formData.isi_omset);
      
      // Small delay to ensure CSS is applied
      setTimeout(() => {
        editorRef.current.innerHTML = formData.isi_omset;
        // Sanitize once after load so existing content is normalized (including bold tags)
        sanitizeEditorHtml();
        
        // Check if images are present in the editor
        const imagesInEditor = editorRef.current.querySelectorAll('img');
        console.log('🔍 Images found in editor after setting content:', imagesInEditor.length);
        
        if (imagesInEditor.length === 0) {
          console.log('🔍 No images found in editor, checking if we need to render from formData.images');
          // If no images in editor but we have images in formData, try to render them
          if (formData.images && Array.isArray(formData.images) && formData.images.length > 0) {
            console.log('🔍 Rendering images from formData.images:', formData.images);
            formData.images.forEach((image, index) => {
              if (image && image.url) {
                console.log(`🔍 Creating image element for image ${index + 1}:`, image);
                
                const img = document.createElement('img');
                img.src = normalizeImageUrl(image.url);
                img.alt = `Gambar ${index + 1}`;
                img.className = 'max-w-full h-auto my-2 rounded-lg shadow-sm';
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
                  console.error(`❌ Failed to load image ${index + 1}:`, image.url);
                  img.style.border = '2px solid red';
                  img.style.backgroundColor = '#fee';
                  img.alt = 'Gambar gagal dimuat';
                  img.style.padding = '20px';
                  img.style.textAlign = 'center';
                  img.style.fontSize = '12px';
                  img.style.color = '#666';
                };

                img.onload = () => {
                  console.log(`✅ Successfully loaded image ${index + 1}:`, image.url);
                  img.style.display = 'block';
                  img.style.visibility = 'visible';
                };

                // Force image to be visible
                img.style.display = 'block';
                img.style.visibility = 'visible';
                img.style.maxWidth = '100%';
                img.style.height = 'auto';
                
                // Append image to editor
                editorRef.current.appendChild(img);
                
                // Add a line break after image
                const br = document.createElement('br');
                editorRef.current.appendChild(br);
                
                console.log(`✅ Image ${index + 1} appended to editor`);
              }
            });
          }
        }
        
        // Update usedInEditor state after setting content
        updateUsedInEditor();
        // Move caret to end for natural typing like Poskas
        placeCaretAtEnd(editorRef.current);
      }, 300); // Increased delay to ensure everything is ready
    }
  }, [formData.isi_omset, formData.images, isEditMode]);

  // Add CSS for editor
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

  const loadOmsetHarian = async () => {
    try {
      setLoading(true);
      const response = await omsetHarianService.getOmsetHarianById(id);

      // Terima kedua bentuk: {success, data} atau langsung data object
      const ok = (response && response.success === true) || (response && typeof response === 'object' && response.id);
      const omsetData = response?.data || response;

      if (ok && omsetData) {
        console.log('🔍 Raw omset data:', omsetData);
        console.log('🔍 Raw images data:', omsetData.images);
        console.log('🔍 Raw images type:', typeof omsetData.images);
        
        // Process existing images to match new format
        let processedImages = [];
        if (omsetData.images) {
          try {
            const parsedImages = JSON.parse(omsetData.images);
            console.log('🔍 Parsed images from OmsetHarianForm:', parsedImages);
            console.log('🔍 Parsed type:', typeof parsedImages);
            console.log('🔍 Parsed isArray:', Array.isArray(parsedImages));
            console.log('🔍 Parsed constructor:', parsedImages?.constructor?.name);
            
            if (Array.isArray(parsedImages)) {
              processedImages = parsedImages;
            } else if (parsedImages && typeof parsedImages === 'object' && parsedImages !== null) {
              // Check if it's actually an array-like object or a single object
              if (parsedImages.length !== undefined && typeof parsedImages.length === 'number') {
                // It's an array-like object, convert to array
                processedImages = Array.from(parsedImages);
                console.log('🔍 Converted array-like object to array in OmsetHarianForm');
              } else {
                // If it's a single object, wrap it in an array
                processedImages = [parsedImages];
                console.log('🔍 Single object wrapped in array in OmsetHarianForm');
              }
            } else {
              console.log('ℹ️ Parsed images is not an array or object in OmsetHarianForm:', parsedImages);
              processedImages = [];
            }
            
            console.log('🔍 Final processed images array:', processedImages);
            
            if (Array.isArray(processedImages)) {
              processedImages = processedImages.map(img => {
                console.log('🔍 Processing image object:', img);
                
                // Normalize existing URLs
                let fixedUrl = img.url;
                if (fixedUrl) {
                  // Fix double http://
                  if (fixedUrl.startsWith('http://http://')) {
                    fixedUrl = fixedUrl.replace('http://http://', 'http://');
                    console.log(`🔍 Fixed double http:// in existing URL: ${img.url} -> ${fixedUrl}`);
                  }
                  // Remove /api from upload URLs
                  if (fixedUrl.includes('/api/uploads/')) {
                    fixedUrl = fixedUrl.replace('/api/uploads/', '/uploads/');
                    console.log(`🔍 Fixed /api in upload URL: ${img.url} -> ${fixedUrl}`);
                  }
                  // Make relative URLs absolute using env base
                  if (!fixedUrl.startsWith('http') && !fixedUrl.startsWith('data:')) {
                    const baseUrl = envConfig.BASE_URL.replace('/api', '');
                    fixedUrl = `${baseUrl}${fixedUrl.startsWith('/') ? '' : '/'}${fixedUrl}`;
                    console.log(`🔍 Made URL absolute: ${img.url} -> ${fixedUrl}`);
                  }
                }
                
                const processedImg = {
                  uri: img.uri || `file://temp/${img.id}.jpg`,
                  id: img.id,
                  name: img.name || `omset_${img.id}.jpg`,
                  url: fixedUrl || `${envConfig.BASE_URL.replace('/api', '')}/uploads/omset-harian/temp_${img.id}.jpg`,
                  serverPath: img.serverPath || `uploads/omset-harian/temp_${img.id}.jpg`
                };
                
                console.log('🔍 Processed image object:', processedImg);
                return processedImg;
              });
            }
          } catch (error) {
            console.error('Error parsing existing images:', error);
            processedImages = [];
          }
        }

        console.log('🔍 Final processed images before setting form data:', processedImages);
        console.log('🔍 Environment config:', envConfig);
        console.log('🔍 BASE_URL:', envConfig.BASE_URL);
        
        // Convert text with [IMG:id] placeholders to HTML for editor
        let editorContent = omsetData.isi_omset || '';
        console.log('🔍 Original editor content:', editorContent);
        
        // Replace [IMG:id] placeholders with actual image tags for editor
        if (Array.isArray(processedImages) && processedImages.length > 0) {
          console.log('🔍 Processing parsed images for editor:', processedImages);
          processedImages.forEach((image, index) => {
            console.log(`🔍 Processing image ${index + 1}:`, image);
            
            // Construct the correct image URL
            let imageUrl = '';
            if (image.url) {
              // Fix double http:// issue
              let cleanUrl = image.url;
              if (cleanUrl.startsWith('http://http://')) {
                cleanUrl = cleanUrl.replace('http://http://', 'http://');
                console.log(`🔍 Fixed double http:// URL: ${image.url} -> ${cleanUrl}`);
              }
              // Remove /api from upload URLs if present
              if (cleanUrl.includes('/api/uploads/')) {
                cleanUrl = cleanUrl.replace('/api/uploads/', '/uploads/');
                console.log(`🔍 Fixed /api in upload URL for editor: ${image.url} -> ${cleanUrl}`);
              }
              
              if (cleanUrl.startsWith('http') || cleanUrl.startsWith('data:')) {
                // Already absolute URL or data URL
                imageUrl = cleanUrl;
              } else {
                // Relative URL, add base URL
                const baseUrl = envConfig.BASE_URL.replace('/api', '');
                imageUrl = `${baseUrl}${cleanUrl.startsWith('/') ? '' : '/'}${cleanUrl}`;
              }
            } else if (image.uri && image.uri.startsWith('file://temp/')) {
              // Handle temp file URIs
              imageUrl = image.uri;
            }
            
            console.log(`🔍 Image ${index + 1}:`, {
              originalUrl: image.url,
              constructedUrl: imageUrl,
              id: image.id
            });
            
            const imageHtmlTag = `<img src="${imageUrl}" alt="Gambar ${index + 1}" class="max-w-full h-auto my-2 rounded-lg shadow-sm" data-image-id="${image.id}" />`;
            const placeholderRegex = new RegExp(`\\[IMG:${image.id}\\]`, 'g');
            
            // Check if this placeholder exists in content
            const matches = editorContent.match(placeholderRegex);
            console.log(`🔍 Placeholder [IMG:${image.id}] matches:`, matches);
            
            if (matches) {
              editorContent = editorContent.replace(placeholderRegex, imageHtmlTag);
              console.log(`✅ Replaced [IMG:${image.id}] with image tag`);
            } else {
              console.log(`❌ Placeholder [IMG:${image.id}] not found in content`);
              // If no placeholder found, append image at the end
              editorContent += imageHtmlTag;
              console.log(`➕ Appended image ${image.id} to content since no placeholder found`);
            }
          });
        } else {
          console.log('⚠️ No processed images to render in editor');
        }
        
        // Convert line breaks to <br> tags for editor
        editorContent = editorContent.replace(/\n/g, '<br>');
        console.log('🔍 Final editor content:', editorContent);
        
        setFormData({
          tanggal_omset: omsetData.tanggal_omset ? new Date(omsetData.tanggal_omset).toISOString().split('T')[0] : '',
          isi_omset: editorContent,
          images: processedImages
        });
        
        console.log('🔍 Set form data with:', {
          tanggal_omset: omsetData.tanggal_omset ? new Date(omsetData.tanggal_omset).toISOString().split('T')[0] : '',
          isi_omset_length: editorContent.length,
          images_count: processedImages.length,
          images: processedImages
        });
        
        // Update usedInEditor state after loading data
        setTimeout(() => {
          updateUsedInEditor();
        }, 500); // Wait for editor content to be set
      } else {
        toast.error('Gagal memuat data omset harian');
        navigate('/admin/keuangan/omset-harian');
      }
    } catch (error) {
      console.error('Error loading omset harian:', error);
      toast.error('Gagal memuat data omset harian');
              navigate('/admin/keuangan/omset-harian');
    } finally {
      setLoading(false);
    }
  };

  const handleEditorChange = (e) => {
    const content = e.target.innerHTML;
    // Avoid frequent state updates to prevent caret reset; store in ref
    lastContentRef.current = content;
    // Keep tracking used images
    updateUsedInEditor();
    // Update active formatting state while typing
    updateFormatState();
    // Save latest selection inside editor so toolbar can use it
    saveSelection();
    // Catatan: jangan sanitasi di onInput karena bisa mengacaukan selection dan menggandakan tag
  };

  const handleEditorBlur = () => {
    const content = editorRef.current ? editorRef.current.innerHTML : '';
    let cleaned = unboldSafe(content);
    cleaned = normalizeBoldHtml(cleaned);
    cleaned = fixStrayStrong(cleaned);
    if (editorRef.current && cleaned !== content) {
      editorRef.current.innerHTML = cleaned;
    }
    lastContentRef.current = cleaned;
    setFormData(prev => ({ ...prev, isi_omset: cleaned }));
  };

  // Ensure Enter creates a clean line break
  const handleEditorKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      // Sisipkan line break sederhana tanpa manipulasi <b>
      try {
        document.execCommand('insertLineBreak');
      } catch (_) {
        document.execCommand('insertHTML', false, '<br>');
      }
      // Clean and keep UI state updated
      saveSelection();
      updateFormatState();
    }
  };

// Track selection changes to make toolbar apply immediately
const handleEditorKeyUp = () => {
  saveSelection();
  updateFormatState();
};

const handleEditorMouseUp = () => {
  saveSelection();
  updateFormatState();
};

  // Update usedInEditor state by scanning editor content
  const updateUsedInEditor = () => {
    if (editorRef.current) {
      const content = editorRef.current.innerHTML;
      const imgPlaceholderRegex = /\[IMG:(\d+)\]/g;
      const matches = [...content.matchAll(imgPlaceholderRegex)];
      const usedIds = new Set(matches.map(match => parseInt(match[1])));
      
      console.log('🔍 Used in editor IDs:', usedIds);
      setUsedInEditor(usedIds);
    }
  };

  const handleEditorPaste = async (e) => {
    const items = e.clipboardData.items;
    let handled = false;

    // 1) Handle image paste
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      if (item.type.indexOf('image') !== -1) {
        e.preventDefault();
        handled = true;
        const file = item.getAsFile();
        if (file) {
          if (file.size > 10 * 1024 * 1024) {
            toast.error('Gambar terlalu besar. Maksimal 10MB');
            return;
          }
          if (selectedImages.length >= 5) {
            toast.error('Maksimal 5 gambar per laporan');
            return;
          }
          const imageId = Date.now() + Math.floor(Math.random() * 1000);
          const imageWithId = { file, id: imageId };
          setSelectedImages(prev => [...prev, imageWithId]);
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

    // 2) Handle plain text paste to behave like Word (preserve line breaks, remove unwanted HTML)
    if (!handled) {
      const text = e.clipboardData.getData('text/plain');
      if (text) {
        e.preventDefault();
        const html = escapeHtml(text).replace(/\r?\n/g, '<br>');
        document.execCommand('insertHTML', false, html);
        // After inserting, sanitize to keep our rules
        sanitizeEditorHtml();
        saveSelection();
      }
    }
  };

  const getEditorContent = () => {
    if (!editorRef.current) return '';
    
    const content = editorRef.current.innerHTML;
    if (!content || content.trim() === '') return '';
    
    console.log('🔍 Debug: Getting editor content:', content);
    
    let processedContent = content;
    // Hapus karakter zero-width yang bisa menyusup saat editing (ZWSP, ZWNJ, ZWJ, BOM)
    processedContent = processedContent
      .replace(/\u200B/g, '')   // ZWSP
      .replace(/\u200C/g, '')   // ZWNJ
      .replace(/\u200D/g, '')   // ZWJ
      .replace(/\uFEFF/g, '');  // BOM
    
    // Replace existing image tags that have data-image-id back to [IMG:id] placeholders
    const existingImgRegex = /<img[^>]*data-image-id="(\d+)"[^>]*>/g;
    processedContent = processedContent.replace(existingImgRegex, (match, imageId) => {
      console.log(`🔍 Converting existing image tag back to placeholder: [IMG:${imageId}]`);
      return `[IMG:${imageId}]`;
    });
    
    // Replace base64 images with [IMG:id] placeholders
    const base64ImgRegex = /<img[^>]*src="data:image[^"]*"[^>]*>/g;
    let imgMatch;
    let imgIndex = 0;
    
    while ((imgMatch = base64ImgRegex.exec(processedContent)) !== null) {
      const timestamp = Date.now();
      const imgId = timestamp + Math.floor(Math.random() * 1000);
      console.log(`🔍 Generated new ID for base64 image ${imgIndex + 1}: ${imgId}`);
      
      const placeholder = `[IMG:${imgId}]`;
      processedContent = processedContent.replace(imgMatch[0], placeholder);
      console.log(`🔍 Converting base64 image ${imgIndex + 1} to placeholder: ${placeholder}`);
      imgIndex++;
    }
    
    // Normalize block separators by turning divs/p into line breaks
    processedContent = processedContent
      .replace(/<div[^>]*>/gi, '\n')
      .replace(/<\/div>/gi, '')
      .replace(/<p[^>]*>/gi, '\n')
      .replace(/<\/p>/gi, '');
    
    // Keep only allowed tags and sanitize anchors
    processedContent = processedContent
      .replace(/<br[^>]*>/gi, '<br>')
      .replace(/<a([^>]*)>/gi, (m, attrs) => {
        const hrefMatch = attrs.match(/href\s*=\s*"([^"]*)"|href\s*=\s*'([^']*)'|href\s*=\s*([^\s>]+)/i);
        let href = hrefMatch ? (hrefMatch[1] || hrefMatch[2] || hrefMatch[3] || '') : '';
        if (!/^https?:|^mailto:|^tel:/i.test(href)) href = '';
        return href ? `<a href="${href}">` : '<a>';
      })
      .replace(/<(b|strong|i|em|u|ul|ol|li)[^>]*>/gi, (m, tag) => {
        const t = tag.toLowerCase();
        if (t === 'b') return '<strong>';
        return `<${t}>`;
      });

    // Normalize bold variants to <strong> and prevent wrapping <br> or [IMG:id]
    processedContent = processedContent
      .replace(/<\s*b\s*>/gi, '<strong>')
      .replace(/<\s*\/\s*b\s*>/gi, '</strong>')
      .replace(/<strong>\s*(?:<br\s*\/?\s*>)+\s*<\/strong>/gi, '<br>')
      .replace(/<strong>\s*<\/strong>/gi, '')
      // unwrap placeholder-only bold
      .replace(/<strong>\s*(\[IMG:\d+\])\s*<\/strong>/gi, '$1');

    // Split strong across placeholders in processed content
    try {
      let prevSplitImg2;
      do {
        prevSplitImg2 = processedContent;
        processedContent = processedContent.replace(/<strong>([^<>]*?)\s*(\[IMG:\d+\])\s*([^<>]*?)<\/strong>/gi, (m, left, img, right) => {
          const l = left.trim() ? `<strong>${left}</strong>` : '';
          const r = right.trim() ? `<strong>${right}</strong>` : '';
          return `${l}${img}${r}`;
        });
      } while (processedContent !== prevSplitImg2);
    } catch (_) {}

    // Ulangi collapse nested <strong> sampai stabil
    try {
      let prevCollapse2;
      do {
        prevCollapse2 = processedContent;
        processedContent = processedContent
          .replace(/<strong>\s*<strong>/gi, '<strong>')
          .replace(/<\/strong>\s*<\/strong>/gi, '</strong>');
      } while (processedContent !== prevCollapse2);
    } catch (_) {}

    // Split strong across <br>: <strong>a<br>b</strong> => <strong>a</strong><br><strong>b</strong>
    try {
      let prev2;
      do {
        prev2 = processedContent;
        processedContent = processedContent.replace(/<strong>([^<>]*)<br\s*\/?\s*>([^<>]*)<\/strong>/gi, (m, a, b) => {
          const left = a.trim() ? `<strong>${a}</strong>` : '';
          const right = b.trim() ? `<strong>${b}</strong>` : '';
          return `${left}<br>${right}`;
        });
      } while (processedContent !== prev2);
    } catch (_) {}

    // Decode common HTML entities
    // IMPORTANT: Jangan decode &lt; atau &gt; agar teks seperti "<b>" tidak berubah jadi tag HTML asli
    processedContent = processedContent
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&');

    // Ensure any newline characters are persisted visually as <br>
    processedContent = processedContent.replace(/\n/g, '<br>');

    // Final cleanup: hapus tag <strong> yang tidak berpasangan di awal/akhir konten
    // - leading </strong> tanpa pembuka
    processedContent = processedContent.replace(/^(\s*<\/strong>)+/i, '');
    // - trailing <strong> tanpa penutup
    processedContent = processedContent.replace(/(<strong>\s*)+$/i, '');

    // Jalankan normalisasi bold terakhir kali untuk memastikan konsistensi akhir
    processedContent = normalizeBoldHtml(processedContent);

    console.log('🔍 Debug: Processed content (kept basic formatting):', processedContent);
    return processedContent;
  };

  // Handlers referenced in JSX
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    const max = 5 - selectedImages.length;
    const toAdd = files.slice(0, Math.max(0, max));
    const newItems = toAdd.map(file => ({ file, id: Date.now() + Math.floor(Math.random() * 1000) }));
    setSelectedImages(prev => [...prev, ...newItems]);
    newItems.forEach((item) => {
      const reader = new FileReader();
      reader.onload = (ev) => setImagePreviewUrls(prev => [...prev, ev.target.result]);
      reader.readAsDataURL(item.file);
    });
  };

  const insertImage = (imageUrl, imageId) => {
    if (!editorRef.current) return;
    const img = document.createElement('img');
    img.src = imageUrl;
    img.alt = 'Inserted image';
    img.className = 'pasted-image';
    img.setAttribute('data-image-id', imageId);
    const sel = window.getSelection();
    if (sel && sel.rangeCount > 0) {
      const range = sel.getRangeAt(0);
      range.deleteContents();
      range.insertNode(img);
      range.collapse(false);
      const br = document.createElement('br');
      range.insertNode(br);
    } else {
      editorRef.current.appendChild(img);
    }
    const event = new Event('input', { bubbles: true });
    editorRef.current.dispatchEvent(event);
  };

  const removeImage = (index) => {
    setSelectedImages(prev => prev.filter((_, i) => i !== index));
    setImagePreviewUrls(prev => prev.filter((_, i) => i !== index));
  };

  // Validasi isi omset harian (menggunakan nilai dari RichTextEditor)
  const validateIsiOmset = () => {
    const html = formData?.isi_omset || '';
    const plain = html
      .replace(/<br\s*\/?>/gi, '\n')
      .replace(/<[^>]+>/g, '')
      .trim();
    if (!plain) {
      toast.error('Isi omset tidak boleh kosong');
      return false;
    }
    if (plain.length < 10) {
      toast.error('Isi omset minimal 10 karakter');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Validasi sebelum proses upload & submit
    if (!validateIsiOmset()) return;
    setIsSubmitting(true);
    try {
      // 1) Pastikan gambar baru diupload ke server terlebih dahulu
      const uploadNewImages = async () => {
        if (!selectedImages || selectedImages.length === 0) return [];
        const fd = new FormData();
        selectedImages.forEach((item) => {
          if (item?.file) fd.append('images', item.file);
        });

        try {
          const res = await api.post('/upload/omset-harian', fd, {
            headers: { 'Content-Type': 'multipart/form-data' }
          });
          if (res?.data?.success && Array.isArray(res.data.data)) {
            const uploaded = res.data.data; // array sejajar dengan selectedImages
            // Petakan kembali dengan id lokal agar cocok dengan [IMG:id]
            return uploaded.map((f, idx) => ({
              id: selectedImages[idx]?.id,
              name: f.originalName || selectedImages[idx]?.file?.name || `omset_${Date.now()}_${idx}.jpg`,
              url: f.url,
              serverPath: f.path
            })).filter(img => img.id);
          }
          toast.error('Upload gambar gagal');
          return [];
        } catch (err) {
          console.error('❌ Upload OMSET HARIAN gagal:', err);
          toast.error('Gagal mengupload gambar');
          return [];
        }
      };

      const newImages = await uploadNewImages();

      // 2) Kumpulkan seluruh images: existing + yang baru diupload
      const allImages = [
        ...((formData.images && Array.isArray(formData.images)) ? formData.images : []),
        ...newImages
      ];

      // 3) Ambil konten dari RichTextEditor (sudah diserialisasi: img -> [IMG:id], normalisasi <strong>/<br>)
      const isiContent = formData?.isi_omset || '';

      // 4) Hanya simpan gambar yang benar-benar dipakai di editor
      const usedIdMatches = [...isiContent.matchAll(/\[IMG:(\d+)\]/g)];
      const usedIds = new Set(usedIdMatches.map((m) => parseInt(m[1], 10)));
      const filteredImages = allImages.filter((img) => img && typeof img.id !== 'undefined' && usedIds.has(parseInt(img.id, 10)));

      const payload = {
        tanggal_omset: formData.tanggal_omset,
        isi_omset: isiContent,
        images: filteredImages
      };
      if (isEditMode) {
        await omsetHarianService.updateOmsetHarian(id, payload);
      } else {
        await omsetHarianService.createOmsetHarian(payload);
      }
      toast.success('Berhasil menyimpan omset harian');
      navigate('/admin/keuangan/omset-harian');
    } catch (error) {
      console.error('Gagal menyimpan omset harian', error);
      toast.error('Gagal menyimpan omset harian');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isEditMode && loading) {
    return (
      <div className="p-6"><LoadingSpinner /></div>
    );
  }

  return (
    <div className="p-0 bg-gray-50 min-h-screen">
      {/* Header merah full-width */}
      <div className="bg-red-800 text-white px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-sm font-semibold bg-white/10 rounded px-2 py-1 select-none">H01-K6</span>
            <div>
              <h1 className="text-xl md:text-2xl font-extrabold tracking-tight">{isEditMode ? 'EDIT OMSET HARIAN' : 'TAMBAH OMSET HARIAN'}</h1>
              <p className="text-sm text-red-100">{isEditMode ? 'Perbarui data omset harian' : 'Tambah data omset harian baru'}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => navigate('/admin/keuangan/omset-harian')}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-white/60 text-white hover:bg-white/10 transition-colors"
              title="Batal"
            >
              <X className="h-4 w-4" />
              <span>Batal</span>
            </button>
            <button
              form="omset-form"
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
        <form id="omset-form" onSubmit={handleSubmit}>
          {/* Tanggal Omset */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-2 bg-red-100 rounded-lg">
                <Calendar className="h-5 w-5 text-red-600" />
              </div>
              <label className="text-lg font-semibold text-gray-900">
                Tanggal Omset
              </label>
            </div>
            <input
              type="date"
              name="tanggal_omset"
              value={formData.tanggal_omset}
              onChange={isEditMode ? () => {} : handleInputChange}
              readOnly={isEditMode}
              disabled={isEditMode}
              required
              className={`w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent ${
                isEditMode ? 'bg-gray-50 text-gray-600 cursor-not-allowed' : ''
              }`}
            />
            <p className="text-sm text-gray-500 mt-2">
              {isEditMode 
                ? 'Tanggal tidak dapat diubah karena sudah terdaftar saat pembuatan laporan'
                : 'Pilih tanggal untuk omset harian ini'
              }
            </p>
          </div>

          {/* Isi Omset Editor */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-2 bg-green-100 rounded-lg">
                <FileText className="h-5 w-5 text-green-600" />
              </div>
              <label className="text-lg font-semibold text-gray-900">
                Isi Omset Harian
              </label>
            </div>

            <RichTextEditor
              value={formData.isi_omset}
              onChange={handleEditorHtmlChange}
              onFilesChange={(files) => {
                // files: array of { file, id }
                setSelectedImages(files);
              }}
              placeholder="Masukkan isi omset harian... Anda bisa paste gambar langsung dari clipboard (Ctrl+V)"
              rows={12}
            />
            <p className="text-sm text-gray-500">💡 Tips: Anda bisa paste gambar langsung dari clipboard (Ctrl+V)</p>
          </div>

          {/* Image Management Section - Only show in edit mode (disembunyikan sementara) */}
          {isEditMode && SHOW_IMAGE_UI && (
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center space-x-3 mb-4">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <ImageIcon className="h-5 w-5 text-blue-600" />
                </div>
                <label className="text-lg font-semibold text-gray-900">
                  Gambar
                </label>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Image Upload */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Upload Gambar Baru
                  </label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                      id="image-upload"
                    />
                    <label
                      htmlFor="image-upload"
                      className="cursor-pointer inline-flex items-center space-x-2 text-gray-600 hover:text-gray-900"
                    >
                      <Upload className="h-5 w-5" />
                      <span>Pilih Gambar</span>
                    </label>
                    <p className="text-sm text-gray-500 mt-2">
                      Maksimal 5 gambar, format JPG, PNG, GIF
                    </p>
                  </div>
                </div>

                {/* New Images Preview */}
                {selectedImages.length > 0 && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-700 mb-2">Gambar Baru</h3>
                    <div className="grid grid-cols-2 gap-2">
                      {selectedImages.map((image, index) => (
                        <div key={index} className="relative">
                          <img
                            src={imagePreviewUrls[index]}
                            alt={`Preview ${index + 1}`}
                            className="w-full h-20 object-cover rounded-lg"
                          />
                          <button
                            onClick={() => removeImage(index)}
                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

            {/* Existing Images (disembunyikan sementara) */}
            {SHOW_IMAGE_UI && formData.images && formData.images.length > 0 && (
              <div className="mt-6">
                <h3 className="text-sm font-medium text-gray-700 mb-2">Gambar yang Ada</h3>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
                  {formData.images.map((image, index) => {
                    // Build URL via helper
                    const imageUrl = normalizeImageUrl(image.url);
                    
                    return (
                      <div key={index} className="relative">
                        <img
                          src={imageUrl}
                          alt={image.name || `Gambar ${index + 1}`}
                          className="w-full h-20 object-cover rounded-lg cursor-pointer hover:opacity-75"
                          onClick={() => insertImage(imageUrl, image.id)}
                          onError={(e) => {
                            console.error(`❌ Failed to load existing image ${index + 1}:`, imageUrl);
                            e.target.style.border = '2px solid red';
                            e.target.style.backgroundColor = '#fee';
                            e.target.alt = 'Gambar gagal dimuat';
                            e.target.style.padding = '20px';
                            e.target.style.textAlign = 'center';
                            e.target.style.fontSize = '10px';
                            e.target.style.color = '#666';
                          }}
                          onLoad={() => {
                            console.log(`✅ Successfully loaded existing image ${index + 1}:`, imageUrl);
                          }}
                        />
                        <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-20 transition-all duration-200 rounded-lg flex items-center justify-center">
                          <span className="text-white text-xs opacity-0 hover:opacity-100">Klik untuk sisipkan</span>
                        </div>
                        <div className="absolute top-1 left-1 bg-black bg-opacity-50 text-white text-xs px-1 py-0.5 rounded">
                          {image.name || `IMG ${index + 1}`}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

          {/* Submit Buttons (disembunyikan, aksi dipindah ke header) */}
          {false && (
            <div className="flex space-x-4 p-6">
              <button
                type="button"
                onClick={() => navigate('/admin/keuangan/omset-harian')}
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

export default AdminOmsetHarianForm; 