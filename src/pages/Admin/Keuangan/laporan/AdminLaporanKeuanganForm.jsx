import React, { useState, useRef, useEffect } from 'react';
import CKEditorPoskas from '../../../../components/UI/CKEditorPoskas';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { useAuth } from '../../../../contexts/AuthContext';
import { laporanKeuanganService } from '../../../../services/laporanKeuanganService';
import { toast } from 'react-hot-toast';
import { getEnvironmentConfig } from '../../../../config/environment';
import {
  Calendar,
  FileText,
  Image as ImageIcon,
  Upload,
  X,
  Save,
  RefreshCw
} from 'lucide-react';
import { MENU_CODES } from '@/config/menuCodes';

const AdminLaporanKeuanganForm = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams();
  const { user } = useAuth();
  const envConfig = getEnvironmentConfig();

  const [formData, setFormData] = useState({
    judul_laporan: '',
    tanggal_laporan: '',
    isi_laporan: '',
    images: []
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedImages, setSelectedImages] = useState([]);
  const [imagePreviewUrls, setImagePreviewUrls] = useState([]);
  const editorRef = useRef(null);
  const [hasInitializedContent, setHasInitializedContent] = useState(false);
  const backMonth = (() => {
    try {
      const qs = new URLSearchParams(location.search || '');
      const m = qs.get('month');
      return m && m.trim() ? m.trim() : null;
    } catch (_) {
      return null;
    }
  })();

  // Handler RichTextEditor: sinkronkan HTML ke formData
  const handleEditorHtmlChange = (e) => {
    const html = e?.target?.value ?? '';
    setFormData(prev => ({ ...prev, isi_laporan: html }));
  };

  // Utilities to match Poskas/Omset behavior
  const normalizeUrl = (url) => {
    if (!url) return '';
    try {
      const base = envConfig.BASE_URL.replace('/api','');
      let out = String(url).trim();
      if (out.startsWith(base)) out = out.slice(base.length);
      out = out.replace('http://http://','http://');
      out = out.replace('/api/uploads/','/uploads/');
      return out;
    } catch (e) {
      return String(url);
    }
  };
  const convertHtmlToPlaceholders = (html, images) => {
    if (!html) return '';
    let out = html;
    try {
      const parser = new DOMParser();
      const doc = parser.parseFromString(out, 'text/html');
      const imgs = Array.from(doc.querySelectorAll('img'));
      imgs.forEach(img => {
        const src = img.getAttribute('src') || '';
        const nsrc = normalizeUrl(src);
        const match = (Array.isArray(images) ? images : []).find(it => {
          const iurl = normalizeUrl(it?.url || '');
          return iurl && (iurl === nsrc || src.endsWith(iurl));
        });
        const id = match?.id;
        const token = doc.createTextNode(id ? `[IMG:${id}]` : '');
        if (token.textContent) {
          img.parentNode.replaceChild(token, img);
        } else {
          const br = doc.createElement('br');
          img.parentNode.replaceChild(br, img);
        }
      });
      out = doc.body.innerHTML;
    } catch (_) {}
    return out;
  };
  const normalizeBlocks = (html) => {
    if (!html) return '';
    let out = String(html);
    try {
      out = out
        .replace(/<\s*figcaption[^>]*>[\s\S]*?<\s*\/\s*figcaption\s*>/gi, '')
        .replace(/<\s*figure[^>]*>/gi, '')
        .replace(/<\s*\/\s*figure\s*>/gi, '')
        .replace(/<\s*\/\s*p\s*>/gi, '<br>')
        .replace(/<\s*p[^>]*>/gi, '')
        .replace(/<\s*\/\s*div\s*>/gi, '<br>')
        .replace(/<\s*div[^>]*>/gi, '')
        .replace(/&nbsp;/gi, ' ')
        .replace(/\s*<br\s*\/\?\s*>\s*/gi, '<br>')
        .replace(/(?:<br>\s*){3,}/gi, '<br><br>')
        .replace(/^(?:\s*<br>)+/i, '')
        .replace(/(?:<br>\s*)+$/i, '')
        .replace(/(\[IMG:\d+\])(?:<br>\s*){2,}/gi, '$1<br>')
        .replace(/<br>\s*<br>/gi, '<br>');
    } catch(_) {}
    return out;
  };

  // Formatting active states
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

  // Helpers: zero-width cleanup and bold normalization to <strong>
  const removeZeroWidth = (html) => (html || '').replace(/[\u200B-\u200D\uFEFF]/g, '');
  const normalizeBoldHtml = (html) => {
    if (!html) return html;
    let out = html;
    // standardize <b> -> <strong>
    out = out.replace(/<\s*b\s*>/gi, '<strong>').replace(/<\s*\/\s*b\s*>/gi, '</strong>');
    // remove <strong><br></strong> and empty strong
    out = out.replace(/<strong>\s*(?:<br\s*\/?\s*>)+\s*<\/strong>/gi, '<br>');
    out = out.replace(/<strong>\s*<\/strong>/gi, '');
    // collapse nested strong
    try {
      let prev;
      do {
        prev = out;
        out = out.replace(/<strong>\s*<strong>/gi, '<strong>').replace(/<\/strong>\s*<\/strong>/gi, '</strong>');
      } while (out !== prev);
    } catch {}
    // unwrap <strong>[IMG:id]</strong>
    out = out.replace(/<strong>\s*(\[IMG:\d+\])\s*<\/strong>/gi, '$1');
    // split strong across <br>
    out = out.replace(/<strong>([\s\S]*?)<br\s*\/?>([\s\S]*?)<\/strong>/gi, (m, a, b) => {
      const left = a.trim() ? `<strong>${a}</strong>` : '';
      const right = b.trim() ? `<strong>${b}</strong>` : '';
      return `${left}<br>${right}`;
    });
    // split strong around [IMG:id]
    out = out.replace(/<strong>([^]*?)\[IMG:(\d+)\]([^]*?)<\/strong>/gi, (m, left, id, right) => {
      const L = left.trim() ? `<strong>${left}</strong>` : '';
      const R = right.trim() ? `<strong>${right}</strong>` : '';
      return `${L}[IMG:${id}]${R}`;
    });
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
    // break strong scope around spans that force normal
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

  useEffect(() => {
    if (id) {
      setIsEditMode(true);
      // Pastikan efek inisialisasi editor akan berjalan ulang untuk setiap ID
      setHasInitializedContent(false);
      loadLaporanKeuangan();
    } else {
      // Set default date only for new reports
      setFormData(prev => ({
        ...prev,
        tanggal_laporan: new Date().toISOString().split('T')[0]
      }));
      setHasInitializedContent(false);
    }
  }, [id]);

  // Initialize editor content once in edit mode to avoid caret jump while typing
  useEffect(() => {
    if (editorRef.current && isEditMode && !hasInitializedContent && formData.isi_laporan) {
      console.log('🔍 Setting editor content:', formData.isi_laporan);

      // Small delay to ensure CSS is applied
      setTimeout(() => {
        editorRef.current.innerHTML = formData.isi_laporan;
        try { placeCaretAtEnd(editorRef.current); } catch {}
        updateFormatState();

        // Pastikan setiap <img> berdiri di baris sendiri: tambah satu <br> setelahnya, dan sebelum jika diperlukan
        try {
          const imgs = editorRef.current.querySelectorAll('img');
          imgs.forEach(img => {
            // AFTER: jika setelah img bukan <br>, sisipkan satu <br>
            let next = img.nextSibling;
            if (!(next && next.nodeType === Node.ELEMENT_NODE && next.tagName === 'BR')) {
              const brAfter = document.createElement('br');
              img.parentNode.insertBefore(brAfter, img.nextSibling);
            }
            // BEFORE: jika sebelum img bukan <br> atau boundary block, sisipkan satu <br>
            let prev = img.previousSibling;
            const prevIsBr = prev && prev.nodeType === Node.ELEMENT_NODE && prev.tagName === 'BR';
            if (!prevIsBr && prev) {
              const brBefore = document.createElement('br');
              img.parentNode.insertBefore(brBefore, img);
            }
          });
          // Collapse <br> bertumpuk menjadi satu
          editorRef.current.innerHTML = editorRef.current.innerHTML.replace(/(?:<br>\s*){3,}/gi, '<br><br>');
        } catch(_) {}

        // Check if images are present in the editor
        const imagesInEditor = editorRef.current.querySelectorAll('img');
        console.log('🔍 Images found in editor after setting content:', imagesInEditor.length);
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
        });
        setHasInitializedContent(true);
      }, 200); // Increased delay to ensure everything is ready
    }
  }, [formData.isi_laporan, isEditMode, hasInitializedContent]);

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
        visibility: visible !important;
      }
      [contenteditable="true"] img[data-image-id] {
        cursor: pointer !important;
      }
      [contenteditable="true"] img[data-image-id]:hover {
        opacity: 0.8 !important;
        transition: opacity 0.2s ease !important;
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

  const loadLaporanKeuangan = async () => {
    try {
      setLoading(true);
      const response = await laporanKeuanganService.getLaporanKeuanganById(id);

      if (response.success && response.data) {
        const laporanData = response.data;
        
        console.log('🔍 Raw laporan data received:', laporanData);
        console.log('🔍 Raw tanggal_laporan:', laporanData.tanggal_laporan);

        // Process existing images to match new format
        let processedImages = [];
        if (laporanData.images) {
          try {
            const parsedImages = JSON.parse(laporanData.images);
            console.log('🔍 Parsed images from LaporanKeuanganForm:', parsedImages);
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
                console.log('🔍 Converted array-like object to array in LaporanKeuanganForm');
              } else {
                // If it's a single object, wrap it in an array
                processedImages = [parsedImages];
                console.log('🔍 Single object wrapped in array in LaporanKeuanganForm');
              }
            } else {
              console.log('ℹ️ Parsed images is not an array or object in LaporanKeuanganForm:', parsedImages);
              processedImages = [];
            }
            
            if (Array.isArray(processedImages)) {
              processedImages = processedImages.map(img => {
                // Fix double http:// issue in existing URLs
                let fixedUrl = img.url;
                if (fixedUrl) {
                  // Fix double http:// issue
                  if (fixedUrl.startsWith('http://http://')) {
                    fixedUrl = fixedUrl.replace('http://http://', 'http://');
                    console.log(`🔍 Fixed double http:// in existing URL: ${img.url} -> ${fixedUrl}`);
                  }
                }

                return {
                  uri: img.uri || `file://temp/${img.id}.jpg`,
                  id: img.id,
                  name: img.name || `laporan_${img.id}.jpg`,
                  url: fixedUrl || `${envConfig.BASE_URL.replace('/api', '')}/uploads/laporan-keuangan/temp_${img.id}.jpg`,
                  serverPath: img.serverPath || `uploads/laporan-keuangan/temp_${img.id}.jpg`
                };
              });
            }
          } catch (error) {
            console.error('Error parsing existing images:', error);
            processedImages = [];
          }
        }

        // Convert text with [IMG:id] placeholders to HTML for editor
        let editorContent = laporanData.isi_laporan || '';
        console.log('🔍 Original editor content:', editorContent);

        // Replace [IMG:id] placeholders with actual image tags for editor
        if (Array.isArray(processedImages)) {
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

              if (cleanUrl.startsWith('http') || cleanUrl.startsWith('data:')) {
                // Already absolute URL or data URL
                imageUrl = cleanUrl;
              } else {
                // Relative URL, add base URL
                const baseUrl = envConfig.BASE_URL.replace('/api', '');
                imageUrl = `${baseUrl}${cleanUrl.startsWith('/') ? '' : '/'}${cleanUrl}`;
              }
            }

            console.log(`🔍 Image ${index + 1}:`, {
              originalUrl: image.url,
              constructedUrl: imageUrl,
              id: image.id
            });

            // Tambahkan satu <br> setelah <img> agar baris setelah gambar rapi (match Poskas/Omset)
            const imageHtmlTag = `<img src="${imageUrl}" alt="Gambar ${index + 1}" class="max-w-full h-auto my-2 rounded-lg shadow-sm" data-image-id="${image.id}" /><br>`;
            const placeholderRegex = new RegExp(`\\[IMG:${image.id}\\]`, 'g');

            // Check if this placeholder exists in content
            const matches = editorContent.match(placeholderRegex);
            console.log(`🔍 Placeholder [IMG:${image.id}] matches:`, matches);

            if (matches) {
              editorContent = editorContent.replace(placeholderRegex, imageHtmlTag);
              console.log(`✅ Replaced [IMG:${image.id}] with image tag`);
            } else {
              console.log(`❌ Placeholder [IMG:${image.id}] not found in content`);
            }
          });
        }

        // Convert line breaks to <br> tags for editor
        editorContent = editorContent.replace(/\n/g, '<br>');
        console.log('🔍 Final editor content:', editorContent);

        // Process tanggal_laporan
        const originalTanggal = laporanData.tanggal_laporan;
        const processedTanggal = originalTanggal ? new Date(originalTanggal).toISOString().split('T')[0] : '';
        
        console.log('🔍 Tanggal processing:', {
          original: originalTanggal,
          processed: processedTanggal,
          originalType: typeof originalTanggal,
          isDate: originalTanggal instanceof Date
        });

        // Reset flag agar normalisasi DOM (penambahan <br> sebelum/sesudah <img>) dieksekusi setiap kali data baru dimuat
        setHasInitializedContent(false);
        setFormData({
          judul_laporan: laporanData.judul_laporan || '',
          tanggal_laporan: processedTanggal,
          isi_laporan: editorContent,
          images: processedImages
        });

        console.log('🔍 Set form data with tanggal_laporan:', processedTanggal);
      } else {
        toast.error('Gagal memuat data laporan keuangan');
        navigate('/admin/keuangan/laporan');
      }
    } catch (error) {
      console.error('Error loading laporan keuangan:', error);
      toast.error('Gagal memuat data laporan keuangan');
      navigate('/admin/keuangan/laporan');
    } finally {
      setLoading(false);
    }
  };

  const handleEditorChange = (e) => {
    const content = e.target.innerHTML;
    setFormData(prev => ({
      ...prev,
      isi_laporan: content
    }));
  };

  const handleEditorPaste = async (e) => {
    const items = e.clipboardData.items;

    for (let i = 0; i < items.length; i++) {
      const item = items[i];

      if (item.type.indexOf('image') !== -1) {
        e.preventDefault();

        const file = item.getAsFile();
        if (file) {

          const imageId = Date.now() + Math.floor(Math.random() * 1000);
          const imageWithId = { file, id: imageId };
          setSelectedImages(prev => [...prev, imageWithId]);

          const reader = new FileReader();
          reader.onload = (e) => {
            const imageUrl = e.target.result;
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
    // Safe plain text paste
    const text = e.clipboardData.getData('text/plain');
    if (text) {
      e.preventDefault();
      const safe = String(text).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/\r?\n/g,'<br>');
      document.execCommand('insertHTML', false, safe);
    }
  };

  const getEditorContent = () => {
    if (!editorRef.current) return '';

    const content = editorRef.current.innerHTML;
    if (!content || content.trim() === '') return '';

    let html = removeZeroWidth(content);

    // Convert existing image tags with data-image-id to placeholders [IMG:id]
    const existingImgRegex = /<img[^>]*data-image-id="(\d+)"[^>]*>/g;
    html = html.replace(existingImgRegex, (_m, imageId) => `[IMG:${imageId}]`);

    // Convert base64 images to placeholders as well
    const base64ImgRegex = /<img[^>]*src="data:image[^"]*"[^>]*>/g;
    let match;
    while ((match = base64ImgRegex.exec(html)) !== null) {
      const imgId = Date.now() + Math.floor(Math.random() * 1000);
      html = html.replace(match[0], `[IMG:${imgId}]`);
    }

    // Normalize <b>/<i> to semantic tags
    html = html.replace(/<\s*b\s*>/gi, '<strong>')
               .replace(/<\s*\/\s*b\s*>/gi, '</strong>')
               .replace(/<\s*i\s*>/gi, '<em>')
               .replace(/<\s*\/\s*i\s*>/gi, '</em>');

    // Turn paragraph endings into <br>
    html = html.replace(/<\s*p[^>]*>/gi, '')
               .replace(/<\s*\/\s*p\s*>/gi, '<br>')
               .replace(/<\s*div[^>]*>/gi, '')
               .replace(/<\s*\/\s*div\s*>/gi, '');

    // Allow only <strong>, <em>, <u>, <br>; remove others
    const placeholders = {
      strongOpen: '%%STRONG_OPEN%%', strongClose: '%%STRONG_CLOSE%%',
      emOpen: '%%EM_OPEN%%', emClose: '%%EM_CLOSE%%',
      uOpen: '%%U_OPEN%%', uClose: '%%U_CLOSE%%',
      brTag: '%%BR%%'
    };
    html = html.replace(/<strong>/gi, placeholders.strongOpen)
               .replace(/<\/strong>/gi, placeholders.strongClose)
               .replace(/<em>/gi, placeholders.emOpen)
               .replace(/<\/em>/gi, placeholders.emClose)
               .replace(/<u>/gi, placeholders.uOpen)
               .replace(/<\/u>/gi, placeholders.uClose)
               .replace(/<br\s*\/?\s*>/gi, placeholders.brTag);

    // Strip remaining tags
    html = html.replace(/<[^>]*>/g, '');

    // Restore allowed tags
    html = html.replace(new RegExp(placeholders.strongOpen, 'gi'), '<strong>')
               .replace(new RegExp(placeholders.strongClose, 'gi'), '</strong>')
               .replace(new RegExp(placeholders.emOpen, 'gi'), '<em>')
               .replace(new RegExp(placeholders.emClose, 'gi'), '</em>')
               .replace(new RegExp(placeholders.uOpen, 'gi'), '<u>')
               .replace(new RegExp(placeholders.uClose, 'gi'), '</u>')
               .replace(new RegExp(placeholders.brTag, 'gi'), '<br>');

    // Unbold-safe, normalize bold structure and basic sanitize
    html = unboldSafe(html);
    html = normalizeBoldHtml(html)
               .replace(/^(\s*<\/strong>)+/i, '')
               .replace(/(<strong>\s*)+$/i, '')
               .replace(/<script.*?>[\s\S]*?<\/script>/gi, '')
               .replace(/&nbsp;/g, ' ')
               .trim();

    return html;
  };

  // Upload selected images to server and return array aligned with input order
  const uploadImagesToServer = async (images) => {
    const uploadedFiles = [];
    for (const image of images) {
      try {
        const formData = new FormData();
        formData.append('images', image.file);

        const response = await fetch(`${envConfig.API_BASE_URL}/upload/laporan-keuangan`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: formData
        });

        if (response.ok) {
          const result = await response.json();
          if (result?.success && Array.isArray(result.data) && result.data[0]) {
            uploadedFiles.push(result.data[0]);
          } else {
            console.error('Invalid upload response:', result);
            uploadedFiles.push(null);
          }
        } else {
          console.error('Failed to upload image');
          uploadedFiles.push(null);
        }
      } catch (error) {
        console.error('Error uploading image:', error);
        uploadedFiles.push(null);
      }
    }
    return uploadedFiles;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.judul_laporan || formData.judul_laporan.trim() === '') {
      toast.error('Judul laporan harus diisi');
      return;
    }

    if (formData.judul_laporan.trim().length < 3) {
      toast.error('Judul laporan minimal 3 karakter');
      return;
    }

    if (!formData.tanggal_laporan) {
      toast.error('Tanggal laporan harus diisi');
      return;
    }

    // Ambil konten dari CKEditorPoskas lalu normalisasi dan konversi seperti Poskas/Omset
    const editorContentRaw = formData?.isi_laporan || '';
    const normalized = normalizeBlocks(editorContentRaw);
    const editorContent = convertHtmlToPlaceholders(normalized, formData.images || []);
    if (!editorContent || editorContent.trim() === '') {
      toast.error('Isi laporan tidak boleh kosong');
      return;
    }

    if (editorContent.trim().length < 10) {
      toast.error('Isi laporan minimal 10 karakter');
      return;
    }

    setIsSubmitting(true);

    try {
      // Gunakan images dari CKEditor (sudah terupload otomatis via upload adapter)
      const finalImages = Array.isArray(formData.images) ? formData.images : [];

      // Normalize any residual <img> tags with data-image-id back to placeholders
      const normalizedIsi = (() => {
        if (!editorContent) return '';
        // Replace <img ... data-image-id="123" ...> with [IMG:123]
        let out = editorContent.replace(/<img[^>]*data-image-id="(\d+)"[^>]*>/gi, (_m, id) => `[IMG:${id}]`);
        // Normalize <b>/<i> to semantic tags and strip other tags except <br>
        out = out.replace(/<\s*b\s*>/gi, '<strong>')
                 .replace(/<\s*\/\s*b\s*>/gi, '</strong>')
                 .replace(/<\s*i\s*>/gi, '<em>')
                 .replace(/<\s*\/\s*i\s*>/gi, '</em>')
                 .replace(/<script.*?>[\s\S]*?<\/script>/gi, '')
                 .replace(/<\s*p[^>]*>/gi, '')
                 .replace(/<\s*\/\s*p\s*>/gi, '<br>')
                 .replace(/<\s*div[^>]*>/gi, '')
                 .replace(/<\s*\/\s*div\s*>/gi, '');
        return out;
      })();

      const submitData = {
        judul_laporan: formData.judul_laporan,
        tanggal_laporan: formData.tanggal_laporan,
        isi_laporan: editorContent,
        images: finalImages
      };

      console.log('🔍 Debug: Submitting data:', submitData);
      console.log('🔍 Debug: Final images with fixed URLs:', finalImages);

      let response;
      if (isEditMode) {
        response = await laporanKeuanganService.updateLaporanKeuangan(id, submitData);
      } else {
        response = await laporanKeuanganService.createLaporanKeuangan(submitData);
      }

      if (response.success) {
        toast.success(isEditMode ? 'Laporan keuangan berhasil diperbarui' : 'Laporan keuangan berhasil dibuat');
        const target = backMonth ? `/admin/keuangan/laporan?month=${encodeURIComponent(backMonth)}` : '/admin/keuangan/laporan';
        navigate(target);
      } else {
        toast.error(response.message || 'Gagal menyimpan laporan keuangan');
      }
    } catch (error) {
      console.error('Error saving laporan keuangan:', error);
      toast.error('Gagal menyimpan laporan keuangan');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files || []);

    if (files.length === 0) return;

    // Tidak ada batasan jumlah/tipe file
    const validFiles = files;

    // Bungkus ke objek { file, id } agar kompatibel dengan uploadImagesToServer (menggunakan image.file)
    const withIds = validFiles.map(file => ({ file, id: Date.now() + Math.floor(Math.random() * 1000) }));
    setSelectedImages(prev => [...prev, ...withIds]);

    // Buat preview untuk setiap file
    withIds.forEach(({ file }) => {
      const reader = new FileReader();
      reader.onload = (ev) => {
        setImagePreviewUrls(prev => [...prev, ev.target.result]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index) => {
    setSelectedImages(prev => prev.filter((_, i) => i !== index));
    setImagePreviewUrls(prev => prev.filter((_, i) => i !== index));
  };

  const insertImage = (imageUrl, imageId) => {
    if (editorRef.current) {
      const img = document.createElement('img');
      img.src = imageUrl;
      img.alt = 'Laporan Keuangan Image';
      img.setAttribute('data-image-id', imageId);
      img.style.maxWidth = '100%';
      img.style.height = 'auto';
      img.style.margin = '10px 0';
      img.style.borderRadius = '4px';
      img.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';

      // Insert at cursor position
      const selection = window.getSelection();
      if (selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        range.deleteContents();
        range.insertNode(img);
        range.collapse(false);
      } else {
        editorRef.current.appendChild(img);
      }

      // Update form data
      handleEditorChange({ target: { innerHTML: editorRef.current.innerHTML } });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-red-500"></div>
      </div>
    );
  }

  return (
    <div className="p-0 bg-gray-50 min-h-screen">
      {/* Header - match Poskas style */}
      <div className="bg-red-800 text-white px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span className="text-sm font-semibold bg-white/10 rounded px-2 py-1 select-none">{MENU_CODES.keuangan.laporanKeuangan}</span>
            <div>
              <h1 className="text-xl md:text-2xl font-extrabold tracking-tight">
                <span className="md:hidden">{isEditMode ? 'EDIT LAP KEUANGAN' : 'TAMBAH LAP KEUANGAN'}</span>
                <span className="hidden md:inline">{isEditMode ? 'EDIT LAPORAN KEUANGAN' : 'TAMBAH LAPORAN KEUANGAN'}</span>
              </h1>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => backMonth ? navigate(`/admin/keuangan/laporan?month=${encodeURIComponent(backMonth)}`) : navigate(-1)}
              className="hidden lg:inline-flex items-center gap-2 px-4 py-2 rounded-full border border-white/60 text-white hover:bg-white/10 transition-colors"
              title="Batal"
            >
              <X className="h-4 w-4" />
              <span>Batal</span>
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="hidden lg:inline-flex items-center gap-2 px-4 py-2 bg-white text-red-700 rounded-full hover:bg-red-50 transition-colors shadow-sm disabled:opacity-60"
            >
              {isSubmitting ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              <span>{isEditMode ? (isSubmitting ? 'Menyimpan...' : 'Perbarui') : (isSubmitting ? 'Menyimpan...' : 'Simpan')}</span>
            </button>
          </div>
        </div>
      </div>
      

      <div className="grid grid-cols-1 gap-0 mt-3">
        {/* Main Form */}
        <div className="col-span-1 lg:col-span-3">
          {/* Basic Info */}
          <div className="bg-white shadow-sm border rounded-xl overflow-hidden">
            <div className="p-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Informasi Laporan</h2>
            </div>
            <div className="p-4 space-y-4">
              {/* Judul Laporan */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Judul Laporan *
                </label>
                <div className="relative">
                  <input
                    type="text"
                    name="judul_laporan"
                    value={formData.judul_laporan}
                    onChange={handleInputChange}
                    maxLength={255}
                    required
                    placeholder="Masukkan judul laporan"
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  />
                  <FileText className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                </div>
              </div>

              {/* Tanggal Laporan */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tanggal Laporan *
                </label>
                <div className="relative">
                  <input
                    type="date"
                    name="tanggal_laporan"
                    value={formData.tanggal_laporan}
                    onChange={handleInputChange}
                    required
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  />
                  <Calendar className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                </div>
              </div>

              {/* Isi Laporan */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Isi Laporan *
                </label>
                <CKEditorPoskas
                  value={formData.isi_laporan}
                  onChangeHTML={handleEditorHtmlChange}
                  onImagesChange={(images) => setFormData(prev => ({ ...prev, images }))}
                  placeholder="Tulis isi laporan keuangan di sini... (Anda bisa paste gambar langsung dari clipboard)"
                  uploadPath="/upload/laporan-keuangan"
                />
                {/* Mobile action bar under editor */}
                <div className="mt-4 lg:hidden flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => backMonth ? navigate(`/admin/keuangan/laporan?month=${encodeURIComponent(backMonth)}`) : navigate(-1)}
                    aria-label="Batal"
                    title="Batal"
                    className="inline-flex items-center justify-center h-10 w-10 rounded-full border border-gray-300 text-gray-700 bg-white active:scale-95 transition"
                  >
                    <X className="h-5 w-5" />
                  </button>
                  <button
                    type="button"
                    onClick={handleSubmit}
                    aria-label={isEditMode ? 'Perbarui' : 'Simpan'}
                    title={isEditMode ? 'Perbarui' : 'Simpan'}
                    disabled={isSubmitting}
                    className="inline-flex items-center justify-center h-10 w-10 rounded-full bg-red-600 text-white shadow active:scale-95 transition disabled:opacity-60"
                  >
                    {isSubmitting ? <RefreshCw className="h-5 w-5 animate-spin" /> : <Save className="h-5 w-5" />}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Image Upload (hidden visually, functions retained) */}
          <div className="bg-white border hidden">
            <div className="p-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Gambar</h2>
            </div>
            <div className="p-4 space-y-3">
              {/* Upload New Images */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Upload Gambar Baru
                </label>
                <div className="border-2 border-dashed border-gray-300 p-4 text-center">
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
                          className="w-full h-20 object-cover"
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

              {/* Existing Images */}
              {formData.images && formData.images.length > 0 && (
                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-2">Gambar yang Ada</h3>
                  <div className="grid grid-cols-2 gap-2">
                    {formData.images.map((image, index) => {
                      // Ensure proper URL construction
                      let imageUrl = image.url;
                      if (imageUrl) {
                        // Fix double http:// issue
                        if (imageUrl.startsWith('http://http://')) {
                          imageUrl = imageUrl.replace('http://http://', 'http://');
                        }
                        
                        // If relative URL, add base URL
                        if (!imageUrl.startsWith('http') && !imageUrl.startsWith('data:')) {
                          const baseUrl = envConfig.BASE_URL.replace('/api', '');
                          imageUrl = `${baseUrl}${imageUrl.startsWith('/') ? '' : '/'}${imageUrl}`;
                        }
                      }
                      
                      return (
                      <div key={index} className="relative">
                        <img
                            src={imageUrl}
                            alt={image.name || `Gambar ${index + 1}`}
                          className="w-full h-20 object-cover cursor-pointer hover:opacity-75"
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
                        <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-20 transition-all duration-200 flex items-center justify-center">
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
            </div>
          </div>

          {/* Help (hidden visually) */}
          <div className="bg-blue-50 border border-blue-200 p-4 hidden">
            <h3 className="text-lg font-semibold text-blue-900 mb-3">Panduan</h3>
            <div className="space-y-3 text-sm text-blue-800">
              <div>
                <h4 className="font-medium text-blue-900 mb-1">Format Teks:</h4>
                <ul className="space-y-1">
                  <li>• <strong>**teks**</strong> untuk teks tebal</li>
                  <li>• <em>*teks*</em> untuk teks miring</li>
                  <li>• <u>__teks__</u> untuk teks bergaris bawah</li>
                  <li>• <strong># Judul</strong> untuk heading</li>
                  <li>• <strong>- Item</strong> untuk list</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium text-blue-900 mb-1">Gambar:</h4>
                <ul className="space-y-1">
                  <li>• Upload gambar dari file</li>
                  <li>• Paste gambar langsung dari clipboard</li>
                  <li>• Klik gambar yang ada untuk menyisipkan</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLaporanKeuanganForm; 
