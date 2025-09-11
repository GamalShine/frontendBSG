import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { omsetHarianService } from '@/services/omsetHarianService';
import { toast } from 'react-hot-toast';
import { getEnvironmentConfig } from '@/config/environment';
import { 
  ArrowLeft, 
  Calendar, 
  FileText, 
  Save,
  RefreshCw
} from 'lucide-react';

const OwnerOmsetHarianForm = () => {
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
  const [isBold, setIsBold] = useState(false);
  const [isItalic, setIsItalic] = useState(false);
  const [isUnderline, setIsUnderline] = useState(false);
  const editorRef = useRef(null);
  const savedRangeRef = useRef(null);
  const didPlaceCaretRef = useRef(false);
  const hasInitializedContentRef = useRef(false);

  useEffect(() => {
    if (id) {
      setIsEditMode(true);
      // Reset caret placement flag when switching/editing different item
      didPlaceCaretRef.current = false;
      loadOmsetHarian();
    }
  }, [id]);

  // Initialize editor content once in edit mode (avoid resetting caret on each keystroke)
  useEffect(() => {
    console.log('🔍 useEffect triggered with:', {
      hasEditorRef: !!editorRef.current,
      hasIsiOmset: !!formData.isi_omset,
      isEditMode,
      imagesCount: formData.images?.length || 0,
      images: formData.images
    });
    
    if (editorRef.current && formData.isi_omset && isEditMode && !hasInitializedContentRef.current) {
      console.log('🔍 Setting editor content:', formData.isi_omset);
      
      // Small delay to ensure CSS is applied
      setTimeout(() => {
        editorRef.current.innerHTML = formData.isi_omset;
        hasInitializedContentRef.current = true;
        
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
                img.src = image.url;
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

        // Place caret at end once after content is set (robust)
        if (!didPlaceCaretRef.current) {
          ensureCaretAtEnd();
        }
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

  // Toolbar helpers
  const exec = (command) => {
    if (!editorRef.current) return;
    // Restore last selection if available, else put caret at end
    if (savedRangeRef.current) {
      restoreSelection();
    } else {
      placeCaretAtEnd(editorRef.current);
    }
    editorRef.current.focus();
    document.execCommand(command, false, null);
    // Save selection after exec and update active states
    saveSelection();
    setIsBold(document.queryCommandState('bold'));
    setIsItalic(document.queryCommandState('italic'));
    setIsUnderline(document.queryCommandState('underline'));
  };

  const updateFormatState = () => {
    try {
      setIsBold(document.queryCommandState('bold'));
      setIsItalic(document.queryCommandState('italic'));
      setIsUnderline(document.queryCommandState('underline'));
    } catch (_) {}
  };

  // Track selection changes to highlight active buttons
  useEffect(() => {
    const handleSelection = () => {
      try {
        setIsBold(document.queryCommandState('bold'));
        setIsItalic(document.queryCommandState('italic'));
        setIsUnderline(document.queryCommandState('underline'));
      } catch (e) {
        // ignore
      }
    };

    document.addEventListener('selectionchange', handleSelection);
    return () => document.removeEventListener('selectionchange', handleSelection);
  }, []);

  const handleEditorInteraction = () => {
    saveSelection();
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

  const placeCaretAtEnd = (el) => {
    if (!el) return;
    const range = document.createRange();
    range.selectNodeContents(el);
    range.collapse(false);
    const sel = window.getSelection();
    sel.removeAllRanges();
    sel.addRange(range);
    savedRangeRef.current = range.cloneRange();
    // Try to scroll caret into view if overflowing
    try {
      const dummy = document.createElement('span');
      dummy.textContent = '\u200B';
      range.insertNode(dummy);
      dummy.scrollIntoView({ block: 'nearest' });
      // Clean up dummy
      const parent = dummy.parentNode;
      if (parent) parent.removeChild(dummy);
      sel.removeAllRanges();
      sel.addRange(range);
    } catch (_) {}
  };

  // Ensure caret after DOM settles (images/layout) using RAF + timeout
  const ensureCaretAtEnd = () => {
    const el = editorRef.current;
    if (!el) return;
    const place = () => {
      placeCaretAtEnd(el);
      el.focus();
      didPlaceCaretRef.current = true;
    };
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        place();
        setTimeout(place, 0);
        setTimeout(place, 150);
      });
    });
  };

  // On first focus in edit mode, ensure caret at end once
  const handleEditorFocus = () => {
    if (!editorRef.current) return;
    if (isEditMode && !didPlaceCaretRef.current) {
      ensureCaretAtEnd();
    }
    handleEditorInteraction();
  };

  const loadOmsetHarian = async () => {
    try {
      setLoading(true);
      const response = await omsetHarianService.getOmsetHarianById(id);
      
      if (response.success && response.data) {
        const omsetData = response.data;
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
                
                // Fix double http:// issue in existing URLs
                let fixedUrl = img.url;
                if (fixedUrl) {
                  // Fix double http:// issue
                  if (fixedUrl.startsWith('http://http://')) {
                    fixedUrl = fixedUrl.replace('http://http://', 'http://');
                    console.log(`🔍 Fixed double http:// in existing URL: ${img.url} -> ${fixedUrl}`);
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
        navigate('/owner/keuangan/omset-harian');
      }
    } catch (error) {
      console.error('Error loading omset harian:', error);
      toast.error('Gagal memuat data omset harian');
              navigate('/owner/keuangan/omset-harian');
    } finally {
      setLoading(false);
    }
  };

  const handleEditorChange = (e) => {
    const content = e.target.innerHTML;
    setFormData(prev => ({
      ...prev,
      isi_omset: content
    }));
    
    // Update usedInEditor state
    updateUsedInEditor();
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
    
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      
      if (item.type.indexOf('image') !== -1) {
        e.preventDefault();
        
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
  };

  const getEditorContent = () => {
    if (!editorRef.current) return '';
    
    const content = editorRef.current.innerHTML;
    if (!content || content.trim() === '') return '';
    
    console.log('🔍 Debug: Getting editor content:', content);
    
    let processedContent = content;
    
    // First, replace existing image tags with data-image-id back to [IMG:id] placeholders
    const existingImgRegex = /<img[^>]*data-image-id="(\d+)"[^>]*>/g;
    processedContent = processedContent.replace(existingImgRegex, (match, imageId) => {
      console.log(`🔍 Converting existing image tag back to placeholder: [IMG:${imageId}]`);
      return `[IMG:${imageId}]`;
    });
    
    // Then, replace base64 images with [IMG:id] placeholders
    const base64ImgRegex = /<img[^>]*src="data:image[^"]*"[^>]*>/g;
    let imgMatch;
    let imgIndex = 0;
    
    while ((imgMatch = base64ImgRegex.exec(processedContent)) !== null) {
      // Generate new ID for base64 images
      const timestamp = Date.now();
      const imgId = timestamp + Math.floor(Math.random() * 1000);
      console.log(`🔍 Generated new ID for base64 image ${imgIndex + 1}: ${imgId}`);
      
      const placeholder = `[IMG:${imgId}]`;
      processedContent = processedContent.replace(imgMatch[0], placeholder);
      console.log(`🔍 Converting base64 image ${imgIndex + 1} to placeholder: ${placeholder}`);
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
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.tanggal_omset) {
      toast.error('Tanggal omset harus diisi');
      return;
    }
    
    const editorContent = getEditorContent();
    if (!editorContent || editorContent.trim() === '') {
      toast.error('Isi omset tidak boleh kosong');
      return;
    }
    
    if (editorContent.trim().length < 10) {
      toast.error('Isi omset minimal 10 karakter');
      return;
    }
    
    setIsSubmitting(true);

    try {
      let imagesWithServerUrls = [];
      
      if (isEditMode) {
        // In edit mode, only preserve images that are still used in editor
        console.log('🔍 Debug: Edit mode - filtering images by usage in editor');
        console.log('🔍 Debug: Used in editor IDs:', usedInEditor);
        console.log('🔍 Debug: All formData images:', formData.images);
        
        // Filter existing images to only include those still used in editor
        const usedExistingImages = (formData.images || []).filter(img => {
          const isUsed = usedInEditor.has(img.id);
          console.log(`🔍 Image ${img.id} used in editor: ${isUsed}`);
          return isUsed;
        });
        
        console.log('🔍 Debug: Filtered existing images:', usedExistingImages);
        imagesWithServerUrls = usedExistingImages;
        
        // Upload new images if any
        if (selectedImages.length > 0) {
          console.log('🔍 Debug: Uploading new images in edit mode');
          const uploadedFiles = await uploadImagesToServer(selectedImages);
          
          // Add new uploaded images to existing ones
          const newImages = selectedImages.map((img, index) => {
            const uploadedFile = uploadedFiles[index];
            
            if (uploadedFile) {
              return {
                uri: `file://temp/${img.id}.jpg`,
                id: img.id,
                name: `omset_${img.id}.jpg`,
                url: `${envConfig.BASE_URL.replace('/api', '')}${uploadedFile.url}`,
                serverPath: uploadedFile.url
              };
            } else {
              return {
                uri: `file://temp/${img.id}.jpg`,
                id: img.id,
                name: `omset_${img.id}.jpg`,
                url: `${envConfig.BASE_URL.replace('/api', '')}/uploads/omset-harian/temp_${img.id}.jpg`,
                serverPath: `uploads/omset-harian/temp_${img.id}.jpg`
              };
            }
          });
          
          imagesWithServerUrls = [...imagesWithServerUrls, ...newImages];
        }
      } else {
        // In create mode, upload all selected images
        console.log('🔍 Debug: Create mode - uploading all images');
        const uploadedFiles = await uploadImagesToServer(selectedImages);
        
        imagesWithServerUrls = selectedImages.map((img, index) => {
          const uploadedFile = uploadedFiles[index];
          
          if (uploadedFile) {
            return {
              uri: `file://temp/${img.id}.jpg`,
              id: img.id,
              name: `omset_${img.id}.jpg`,
              url: `${envConfig.BASE_URL.replace('/api', '')}${uploadedFile.url}`,
              serverPath: uploadedFile.url
            };
          } else {
            return {
              uri: `file://temp/${img.id}.jpg`,
              id: img.id,
              name: `omset_${img.id}.jpg`,
              url: `${envConfig.BASE_URL.replace('/api', '')}/uploads/omset-harian/temp_${img.id}.jpg`,
              serverPath: `uploads/omset-harian/temp_${img.id}.jpg`
            };
          }
        });
      }
      
      // Ensure all image URLs are properly formatted
      const finalImages = imagesWithServerUrls.map(img => {
        if (img && img.url) {
          let fixedUrl = img.url;
          
          // Fix double http:// issue
          if (fixedUrl.startsWith('http://http://')) {
            fixedUrl = fixedUrl.replace('http://http://', 'http://');
            console.log(`🔍 Fixed double http:// in submit: ${img.url} -> ${fixedUrl}`);
          }
          
          return { ...img, url: fixedUrl };
        }
        return img;
      });
      
      const submitData = {
        tanggal_omset: formData.tanggal_omset,
        isi_omset: editorContent,
        images: finalImages
      };
      
      console.log('🔍 Debug: Submit data:', submitData);
      console.log('🔍 Debug: Final images with fixed URLs:', finalImages);
      
      if (isEditMode) {
        await omsetHarianService.updateOmsetHarian(id, submitData);
        toast.success('Data omset harian berhasil diperbarui');
      } else {
        await omsetHarianService.createOmsetHarian(submitData);
        toast.success('Data omset harian berhasil ditambahkan');
      }
      
              navigate('/owner/keuangan/omset-harian');
    } catch (error) {
      console.error('Error submitting form:', error);
      toast.error(isEditMode ? 'Gagal memperbarui data omset harian' : 'Gagal menambahkan data omset harian');
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
    const files = Array.from(e.target.files);
    const newSelectedImages = [];
    const newImagePreviewUrls = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      
      if (file.size > 10 * 1024 * 1024) {
        toast.error('Gambar terlalu besar. Maksimal 10MB');
        continue;
      }

      if (selectedImages.length + newSelectedImages.length >= 5) {
        toast.error('Maksimal 5 gambar per laporan');
        break;
      }

      const imageId = Date.now() + Math.floor(Math.random() * 1000);
      newSelectedImages.push({ file, id: imageId });
      
      const reader = new FileReader();
      reader.onload = (e) => {
        newImagePreviewUrls.push(e.target.result);
        if (newSelectedImages.length === files.length) {
          setSelectedImages(prev => [...prev, ...newSelectedImages]);
          setImagePreviewUrls(prev => [...prev, ...newImagePreviewUrls]);
          toast.success('Gambar berhasil ditambahkan');
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = (index) => {
    const newSelectedImages = selectedImages.filter((_, i) => i !== index);
    const newImagePreviewUrls = imagePreviewUrls.filter((_, i) => i !== index);
    setSelectedImages(newSelectedImages);
    setImagePreviewUrls(newImagePreviewUrls);
  };

  // Remove image from editor by ID
  const removeImageFromEditor = (imageId) => {
    if (editorRef.current) {
      // Remove image placeholder from editor content
      const content = editorRef.current.innerHTML;
      const placeholderRegex = new RegExp(`\\[IMG:${imageId}\\]`, 'g');
      const newContent = content.replace(placeholderRegex, '');
      editorRef.current.innerHTML = newContent;
      
      // Update formData
      setFormData(prev => ({
        ...prev,
        isi_omset: newContent
      }));
      
      // Update usedInEditor state
      updateUsedInEditor();
      
      toast.success('Gambar berhasil dihapus dari editor');
    }
  };

  const insertImage = (imageUrl, imageId) => {
    const placeholder = `[IMG:${imageId}]`;
    const newContent = editorRef.current.innerHTML.replace(placeholder, `<img src="${imageUrl}" alt="Gambar ${imageId}" class="max-w-full h-auto my-2 rounded-lg shadow-sm" data-image-id="${imageId}" />`);
    editorRef.current.innerHTML = newContent;
    
    // Update formData
    setFormData(prev => ({
      ...prev,
      isi_omset: newContent
    }));
    
    // Update usedInEditor state
    updateUsedInEditor();
    
    // Trigger input to update formData
    const event = new Event('input', { bubbles: true });
    editorRef.current.dispatchEvent(event);
  };

  const uploadImagesToServer = async (images) => {
    if (images.length === 0) return [];

    const formData = new FormData();
    images.forEach((imageData) => {
      formData.append('images', imageData.file);
    });

    try {
      const response = await fetch(`${envConfig.API_BASE_URL}/upload/omset-harian`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: formData
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const result = await response.json();

      if (result.success) {
        return result.data;
      } else {
        toast.error(result.message || 'Gagal mengupload gambar');
        return [];
      }
    } catch (error) {
      console.error('Error uploading images:', error);
      toast.error(`Gagal mengupload gambar: ${error.message}`);
      return [];
    }
  };

  if (loading) {
    return (
      <div className="p-6 bg-gray-50 min-h-screen">
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="p-8 text-center">
            <RefreshCw className="h-8 w-8 animate-spin text-red-500 mx-auto mb-4" />
            <p className="text-gray-600">Memuat data...</p>
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
              onClick={() => navigate('/owner/keuangan/omset-harian')}
              className="p-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {isEditMode ? 'Edit Omset Harian' : 'Tambah Omset Harian'}
              </h1>
              <p className="text-gray-600">
                {isEditMode ? 'Perbarui data omset harian' : 'Tambah data omset harian baru'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Form Section */}
      <div className="bg-white rounded-lg shadow-sm border">
        <form onSubmit={handleSubmit}>
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
            
            <p className="text-sm text-gray-500">
              Tips: Anda bisa paste gambar langsung dari clipboard (Ctrl+V)
            </p>
              <div
                ref={editorRef}
                contentEditable
                data-placeholder="Masukkan isi omset harian... Anda bisa paste gambar langsung dari clipboard (Ctrl+V)"
                onInput={handleEditorChange}
                onPaste={handleEditorPaste}
                onKeyUp={handleEditorInteraction}
                onMouseUp={handleEditorInteraction}
                onFocus={handleEditorFocus}
                dir="ltr"
                className="min-h-[300px] p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none"
                style={{ whiteSpace: 'pre-wrap' }}
              />
              
              <p className="text-sm text-gray-500">
                💡 Tips: Anda bisa paste gambar langsung dari clipboard (Ctrl+V)
              </p>
            </div>
          

          {/* Image Upload UI removed intentionally to simplify interface */}

          {/* Existing Images section hidden intentionally */}

          {/* Submit Buttons */}
          <div className="flex space-x-4 p-6">
            <button
              type="button"
              onClick={() => navigate('/owner/keuangan/omset-harian')}
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

export default OwnerOmsetHarianForm; 