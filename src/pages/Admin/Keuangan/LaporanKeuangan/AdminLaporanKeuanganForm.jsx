import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { laporanKeuanganService } from '../../services/laporanKeuanganService';
import { toast } from 'react-hot-toast';
import { getEnvironmentConfig } from '../../config/environment';
import {
  ArrowLeft,
  Calendar,
  FileText,
  Image as ImageIcon,
  Upload,
  X,
  Save,
  RefreshCw
} from 'lucide-react';

const LaporanKeuanganForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { user } = useAuth();
  const envConfig = getEnvironmentConfig();

  const [formData, setFormData] = useState({
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

  useEffect(() => {
    if (id) {
      setIsEditMode(true);
      loadLaporanKeuangan();
    } else {
      // Set default date only for new reports
      setFormData(prev => ({
        ...prev,
        tanggal_laporan: new Date().toISOString().split('T')[0]
      }));
    }
  }, [id]);

  // Update editor content when formData changes
  useEffect(() => {
    if (editorRef.current && formData.isi_laporan && isEditMode) {
      console.log('🔍 Setting editor content:', formData.isi_laporan);

      // Small delay to ensure CSS is applied
      setTimeout(() => {
        editorRef.current.innerHTML = formData.isi_laporan;

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
      }, 200); // Increased delay to ensure everything is ready
    }
  }, [formData.isi_laporan, isEditMode]);

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

                  // Fix old IP addresses
                  if (fixedUrl.includes('192.168.30.124:3000')) {
                    const baseUrl = envConfig.BASE_URL.replace('/api', '');
                    fixedUrl = fixedUrl.replace('http://192.168.30.124:3000', baseUrl);
                    console.log(`🔍 Fixed old IP in existing URL: ${img.url} -> ${fixedUrl}`);
                  } else if (fixedUrl.includes('192.168.30.124:3000')) {
                    const baseUrl = envConfig.BASE_URL.replace('/api', '');
                    fixedUrl = fixedUrl.replace('http://192.168.30.124:3000', baseUrl);
                    console.log(`🔍 Fixed old IP in existing URL: ${img.url} -> ${fixedUrl}`);
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

              // Fix old IP addresses
              if (cleanUrl.includes('192.168.30.124:3000')) {
                const baseUrl = envConfig.BASE_URL.replace('/api', '');
                cleanUrl = cleanUrl.replace('http://192.168.30.124:3000', baseUrl);
                console.log(`🔍 Fixed old IP URL: ${image.url} -> ${baseUrl}`);
              } else if (cleanUrl.includes('192.168.30.124:3000')) {
                const baseUrl = envConfig.BASE_URL.replace('/api', '');
                cleanUrl = cleanUrl.replace('http://192.168.30.124:3000', baseUrl);
                console.log(`🔍 Fixed old IP URL: ${image.url} -> ${baseUrl}`);
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

        setFormData({
          tanggal_laporan: processedTanggal,
          isi_laporan: editorContent,
          images: processedImages
        });

        console.log('🔍 Set form data with tanggal_laporan:', processedTanggal);
      } else {
        toast.error('Gagal memuat data laporan keuangan');
        navigate('/keuangan/laporan');
      }
    } catch (error) {
      console.error('Error loading laporan keuangan:', error);
      toast.error('Gagal memuat data laporan keuangan');
      navigate('/keuangan/laporan');
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
          uploadedFiles.push(result.data[0]);
        } else {
          console.error('Failed to upload image:', image.file.name);
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

    if (!formData.tanggal_laporan) {
      toast.error('Tanggal laporan harus diisi');
      return;
    }

    const editorContent = getEditorContent();
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
      let imagesWithServerUrls = [];

      if (isEditMode) {
        // In edit mode, preserve existing images
        console.log('🔍 Debug: Edit mode - preserving existing images');
        imagesWithServerUrls = formData.images || [];

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
                name: `laporan_${img.id}.jpg`,
                url: `${envConfig.BASE_URL.replace('/api', '')}${uploadedFile.url}`,
                serverPath: uploadedFile.url
              };
            } else {
              return {
                uri: `file://temp/${img.id}.jpg`,
                id: img.id,
                name: `laporan_${img.id}.jpg`,
                url: `${envConfig.BASE_URL.replace('/api', '')}/uploads/laporan-keuangan/temp_${img.id}.jpg`,
                serverPath: `uploads/laporan-keuangan/temp_${img.id}.jpg`
              };
            }
          });

          imagesWithServerUrls = [...imagesWithServerUrls, ...newImages];
        }
      } else {
        // In create mode, upload all selected images
        if (selectedImages.length > 0) {
          console.log('🔍 Debug: Uploading images in create mode');
          const uploadedFiles = await uploadImagesToServer(selectedImages);

          imagesWithServerUrls = selectedImages.map((img, index) => {
            const uploadedFile = uploadedFiles[index];

            if (uploadedFile) {
              return {
                uri: `file://temp/${img.id}.jpg`,
                id: img.id,
                name: `laporan_${img.id}.jpg`,
                url: `${envConfig.BASE_URL.replace('/api', '')}${uploadedFile.url}`,
                serverPath: uploadedFile.url
              };
            } else {
              return {
                uri: `file://temp/${img.id}.jpg`,
                id: img.id,
                name: `laporan_${img.id}.jpg`,
                url: `${envConfig.BASE_URL.replace('/api', '')}/uploads/laporan-keuangan/temp_${img.id}.jpg`,
                serverPath: `uploads/laporan-keuangan/temp_${img.id}.jpg`
              };
            }
          });
        }
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

          // Fix old IP addresses
          if (fixedUrl.includes('192.168.30.124:3000')) {
            const baseUrl = envConfig.BASE_URL.replace('/api', '');
            fixedUrl = fixedUrl.replace('http://192.168.30.124:3000', baseUrl);
            console.log(`🔍 Fixed old IP in submit: ${img.url} -> ${fixedUrl}`);
          } else if (fixedUrl.includes('192.168.30.124:3000')) {
            const baseUrl = envConfig.BASE_URL.replace('/api', '');
            fixedUrl = fixedUrl.replace('http://192.168.30.124:3000', baseUrl);
            console.log(`🔍 Fixed old IP in submit: ${img.url} -> ${fixedUrl}`);
          }

          return { ...img, url: fixedUrl };
        }
        return img;
      });

      const submitData = {
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
        navigate('/keuangan/laporan');
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
    const files = Array.from(e.target.files);

    if (files.length === 0) return;

    if (files.length > 5) {
      toast.error('Maksimal 5 gambar');
      return;
    }

    const validFiles = files.filter(file => {
      const isValidType = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'].includes(file.type);
      if (!isValidType) {
        toast.error('Hanya file gambar yang diperbolehkan');
        return false;
      }
      return true;
    });

    if (validFiles.length === 0) return;

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
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border mb-6">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/keuangan/laporan')}
                className="inline-flex items-center space-x-2 text-gray-600 hover:text-gray-900"
              >
                <ArrowLeft className="h-5 w-5" />
                <span>Kembali</span>
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {isEditMode ? 'Edit Laporan Keuangan' : 'Tambah Laporan Keuangan'}
                </h1>
                <p className="text-gray-600">
                  {isEditMode ? 'Perbarui data laporan keuangan' : 'Buat laporan keuangan baru'}
                </p>
              </div>
            </div>
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="inline-flex items-center space-x-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50"
            >
              <Save className="h-4 w-4" />
              <span>{isSubmitting ? 'Menyimpan...' : 'Simpan'}</span>
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Form */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Info */}
          <div className="bg-white rounded-lg shadow-sm border">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Informasi Laporan</h2>
            </div>
            <div className="p-6 space-y-6">
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
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  />
                  <Calendar className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                </div>
              </div>

              {/* Isi Laporan */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Isi Laporan *
                </label>
                <div
                  ref={editorRef}
                  contentEditable
                  onInput={handleEditorChange}
                  onPaste={handleEditorPaste}
                  data-placeholder="Tulis isi laporan keuangan di sini... (Anda bisa paste gambar langsung dari clipboard)"
                  className="w-full min-h-[400px] p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Image Upload */}
          <div className="bg-white rounded-lg shadow-sm border">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Gambar</h2>
            </div>
            <div className="p-6 space-y-4">
              {/* Upload New Images */}
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
                        
                        // Fix old IP addresses
                        if (imageUrl.includes('192.168.30.124:3000')) {
                          const baseUrl = envConfig.BASE_URL.replace('/api', '');
                          imageUrl = imageUrl.replace('http://192.168.30.124:3000', baseUrl);
                        } else if (imageUrl.includes('192.168.30.124:3000')) {
                          const baseUrl = envConfig.BASE_URL.replace('/api', '');
                          imageUrl = imageUrl.replace('http://192.168.30.124:3000', baseUrl);
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
            </div>
          </div>

          {/* Help */}
          <div className="bg-blue-50 rounded-lg border border-blue-200 p-6">
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

export default LaporanKeuanganForm; 
