import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../../../../contexts/AuthContext';
import { anekaGrafikService } from '../../../../services/anekaGrafikService';
import { toast } from 'react-hot-toast';
import { getEnvironmentConfig } from '../../../../config/environment';
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

const AdminAnekaGrafikForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { user } = useAuth();
  const envConfig = getEnvironmentConfig();
  
  // Simple URL cleanup function (generalized, no hardcoded IPs)
  const aggressivelyCleanUrl = (url) => {
    if (!url) return '';
    // Fix common double http duplication
    if (url.startsWith('http://http://')) {
      return url.replace('http://http://', 'http://');
    }
    if (url.startsWith('https://https://')) {
      return url.replace('https://https://', 'https://');
    }
    return url;
  };

  // Clean up corrupted images automatically (normalize via constructImageUrl)
  const cleanupCorruptedImages = (images) => {
    if (!images) return [];

    let processedImages;
    try {
      if (typeof images === 'string') {
        processedImages = JSON.parse(images);
      } else {
        processedImages = images;
      }
    } catch (error) {
      return [];
    }

    if (!Array.isArray(processedImages)) {
      return [];
    }

    return processedImages.map((img) => {
      if (img && img.url) {
        img.url = constructImageUrl(aggressivelyCleanUrl(img.url));
      }
      return img;
    });
  };

  // Helper function to construct proper image URLs (env-based, no hardcoded IPs)
  const constructImageUrl = (imageUrl) => {
    if (!imageUrl) return '';
    
    // Fix double http:// issue
    if (imageUrl.startsWith('http://http://')) {
      imageUrl = imageUrl.replace('http://http://', 'http://');
    }
    if (imageUrl.startsWith('https://https://')) {
      imageUrl = imageUrl.replace('https://https://', 'https://');
    }
    
    // Fix /api/uploads/ path
    if (imageUrl.includes('/api/uploads/')) {
      imageUrl = imageUrl.replace('/api/uploads/', '/uploads/');
    }
    
    // Ensure URL is absolute
    if (!imageUrl.startsWith('http') && !imageUrl.startsWith('data:')) {
      const baseUrl = envConfig.API_BASE_URL.replace('/api', '');
      imageUrl = `${baseUrl}${imageUrl.startsWith('/') ? '' : '/'}${imageUrl}`;
    }
    
    return imageUrl;
  };

  const [formData, setFormData] = useState({
    tanggal_grafik: new Date().toISOString().split('T')[0],
    isi_grafik: '',
    images: []
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedImages, setSelectedImages] = useState([]);
  const [imagePreviewUrls, setImagePreviewUrls] = useState([]);
  const [usedInEditor, setUsedInEditor] = useState(new Set());
  const editorRef = useRef(null);

  const loadAnekaGrafik = async () => {
    try {
      setLoading(true);
      const response = await anekaGrafikService.getAnekaGrafikById(id);
      
      if (response.success && response.data) {
        const anekaData = response.data;
        
        // Process existing images to match new format
        let processedImages = [];
        if (anekaData.images) {
          try {
            // Use the new cleanup function
            processedImages = cleanupCorruptedImages(anekaData.images);
            console.log('🔍 Cleaned images from AnekaGrafikForm:', processedImages);
            
            if (Array.isArray(processedImages)) {
              processedImages = processedImages.map(img => {
                console.log('🔍 Processing image object:', img);
                
                const processedImg = {
                  uri: img.uri || `file://temp/${img.id}.jpg`,
                  id: img.id,
                  name: img.name || `aneka_grafik_${img.id}.jpg`,
                  url: constructImageUrl(img.url || `${envConfig.API_BASE_URL.replace('/api', '')}/uploads/aneka-grafik/temp_${img.id}.jpg`),
                  serverPath: img.serverPath || `uploads/aneka-grafik/temp_${img.id}.jpg`
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

        // Convert [IMG:id] placeholders to HTML for editor
        let editorContent = anekaData.isi_grafik || '';
        if (Array.isArray(processedImages) && processedImages.length > 0) {
          processedImages.forEach((image, index) => {
            console.log(`🔍 Processing image ${index + 1}:`, image);
            
            // Use the cleaned URL directly
            let imageUrl = image.url || '';
            
            console.log(`🔍 Image ${index + 1}:`, {
              originalUrl: image.url,
              finalUrl: imageUrl,
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
          tanggal_grafik: anekaData.tanggal_grafik ? new Date(anekaData.tanggal_grafik).toISOString().split('T')[0] : '',
          isi_grafik: editorContent,
          images: processedImages
        });
        
        console.log('🔍 Set form data with:', {
          tanggal_grafik: anekaData.tanggal_grafik ? new Date(anekaData.tanggal_grafik).toISOString().split('T')[0] : '',
          isi_grafik_length: editorContent.length,
          images_count: processedImages.length,
          images: processedImages
        });
        
        // Update usedInEditor state after loading data
        setTimeout(() => {
          updateUsedInEditor();
        }, 500); // Wait for editor content to be set
      } else {
        toast.error('Gagal memuat data aneka grafik');
        navigate('/admin/keuangan/aneka-grafik');
      }
    } catch (error) {
      console.error('Error loading aneka grafik:', error);
      toast.error('Gagal memuat data aneka grafik');
      navigate('/admin/keuangan/aneka-grafik');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      setIsEditMode(true);
      loadAnekaGrafik();
    }
  }, [id]);

  // Apply editor-specific CSS
  useEffect(() => {
    if (editorRef.current) {
      const style = document.createElement('style');
      style.textContent = `
        .editor-content {
          min-height: 200px;
          padding: 1rem;
          border: 1px solid #d1d5db;
          border-radius: 0.5rem;
          outline: none;
          line-height: 1.6;
        }
        .editor-content:focus {
          border-color: #3b82f6;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }
        .editor-content img {
          max-width: 100%;
          height: auto;
          margin: 0.5rem 0;
          border-radius: 0.5rem;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        }
        .editor-content p {
          margin: 0.5rem 0;
        }
      `;
      document.head.appendChild(style);
      return () => {
        document.head.removeChild(style);
      };
    }
  }, []);

  const handleEditorChange = (e) => {
    const content = e.target.innerHTML;
    setFormData(prev => ({
      ...prev,
      isi_grafik: content
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

  const handleEditorDrop = (e) => {
    e.preventDefault();
    
    const files = Array.from(e.dataTransfer.files);
    const imageFiles = files.filter(file => file.type.startsWith('image/'));
    
    if (imageFiles.length > 0) {
      imageFiles.forEach(file => {
        const reader = new FileReader();
        reader.onload = (e) => {
          const imageData = {
            id: Date.now() + Math.random(),
            file: file,
            url: e.target.result,
            name: file.name,
            size: file.size
          };
          
          // Add to selected images
          setSelectedImages(prev => [...prev, imageData]);
          
          // Insert image into editor with data-image-id
          const img = document.createElement('img');
          img.src = e.target.result;
          img.alt = file.name;
          img.className = 'max-w-full h-auto my-2 rounded-lg shadow-sm';
          img.setAttribute('data-image-id', imageData.id);
          
          // Insert at cursor position
          const selection = window.getSelection();
          if (selection.rangeCount > 0) {
            const range = selection.getRangeAt(0);
            range.deleteContents();
            range.insertNode(img);
            range.collapse(false);
          }
          
          // Update form data
          setFormData(prev => ({
            ...prev,
            isi_grafik: editorRef.current.innerHTML
          }));
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const handleEditorDragOver = (e) => {
    e.preventDefault();
  };

  const handleEditorPaste = (e) => {
    e.preventDefault();
    
    // Check if pasting images
    const items = Array.from(e.clipboardData.items);
    const imageItems = items.filter(item => item.type.startsWith('image/'));
    
    if (imageItems.length > 0) {
      // Handle image paste
      imageItems.forEach(item => {
        const file = item.getAsFile();
        if (file) {
          const reader = new FileReader();
          reader.onload = (e) => {
            const imageData = {
              id: Date.now() + Math.random(),
              file: file,
              url: e.target.result,
              name: file.name || 'pasted-image',
              size: file.size
            };
            
            // Add to selected images
            setSelectedImages(prev => [...prev, imageData]);
            
            // Insert image into editor with data-image-id
            const img = document.createElement('img');
            img.src = e.target.result;
            img.alt = 'Pasted Image';
            img.className = 'max-w-full h-auto my-2 rounded-lg shadow-sm';
            img.setAttribute('data-image-id', imageData.id);
            
            // Insert at cursor position
            const selection = window.getSelection();
            if (selection.rangeCount > 0) {
              const range = selection.getRangeAt(0);
              range.deleteContents();
              range.insertNode(img);
              range.collapse(false);
            }
            
            // Update form data
            setFormData(prev => ({
              ...prev,
              isi_grafik: editorRef.current.innerHTML
            }));
          };
          reader.readAsDataURL(file);
        }
      });
    } else {
      // Handle text paste
      const text = e.clipboardData.getData('text/plain');
      document.execCommand('insertText', false, text);
    }
  };

  const getEditorContent = () => {
    if (!editorRef.current) return '';
    
    const content = editorRef.current.innerHTML;
    let processedContent = content;
    
    // Replace image tags with [IMG:id] placeholders
    const imgTags = editorRef.current.querySelectorAll('img[data-image-id]');
    imgTags.forEach(img => {
      const imageId = img.getAttribute('data-image-id');
      if (imageId) {
        processedContent = processedContent.replace(img.outerHTML, `[IMG:${imageId}]`);
      }
    });
    
    // Also check for any images without data-image-id that might be from selectedImages
    const allImgTags = editorRef.current.querySelectorAll('img');
    allImgTags.forEach(img => {
      if (!img.getAttribute('data-image-id')) {
        // Try to find matching image in selectedImages by src
        const matchingImage = selectedImages.find(selectedImg => 
          selectedImg.url === img.src || 
          selectedImg.url === img.src.replace('blob:', '')
        );
        
        if (matchingImage) {
          // Add data-image-id to the img tag
          img.setAttribute('data-image-id', matchingImage.id);
          // Replace with placeholder
          processedContent = processedContent.replace(img.outerHTML, `[IMG:${matchingImage.id}]`);
        }
      }
    });
    
    return processedContent;
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    const newImages = [];
    
    files.forEach(file => {
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => {
          const imageData = {
            id: Date.now() + Math.random(),
            file: file,
            url: e.target.result,
            name: file.name,
            size: file.size
          };
          newImages.push(imageData);
          
          if (newImages.length === files.length) {
            setSelectedImages(prev => [...prev, ...newImages]);
            setImagePreviewUrls(prev => [...prev, ...newImages.map(img => img.url)]);
          }
        };
        reader.readAsDataURL(file);
      }
    });
  };

  const insertImageIntoEditor = (imageData) => {
    if (!editorRef.current) return;
    
    const img = document.createElement('img');
    img.src = imageData.url;
    img.alt = imageData.name;
    img.className = 'max-w-full h-auto my-2 rounded-lg shadow-sm';
    img.setAttribute('data-image-id', imageData.id);
    
    // Insert at cursor position
    const selection = window.getSelection();
    if (selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      range.deleteContents();
      range.insertNode(img);
      range.collapse(false);
    } else {
      // If no selection, append to end
      editorRef.current.appendChild(img);
    }
    
    // Update form data
    setFormData(prev => ({
      ...prev,
      isi_grafik: editorRef.current.innerHTML
    }));
  };

  const removeImage = (imageId) => {
    setSelectedImages(prev => prev.filter(img => img.id !== imageId));
    setImagePreviewUrls(prev => prev.filter((_, index) => 
      selectedImages.findIndex(img => img.id === imageId) !== index
    ));
    
    // Remove from editor if it exists there
    if (editorRef.current) {
      const imgInEditor = editorRef.current.querySelector(`img[data-image-id="${imageId}"]`);
      if (imgInEditor) {
        imgInEditor.remove();
        // Update form data
        setFormData(prev => ({
          ...prev,
          isi_grafik: editorRef.current.innerHTML
        }));
      }
    }
  };

  const uploadImagesToServer = async (images) => {
    const uploadedImages = [];
    
    for (const image of images) {
      try {
        console.log('🔄 Starting upload for image:', image.name);
        const formData = new FormData();
        formData.append('images', image.file); // Use 'images' field name as expected by backend
        
        console.log('📤 Uploading to:', `${envConfig.API_BASE_URL}/upload/aneka-grafik`);
        const response = await fetch(`${envConfig.API_BASE_URL}/upload/aneka-grafik`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: formData
        });
        
        console.log('📥 Upload response status:', response.status);
        
        if (response.ok) {
          const result = await response.json();
          console.log('📥 Upload response:', result);
          
          if (result.success && result.data && result.data.length > 0) {
            // The backend returns data array, get the first (and only) uploaded image
            const uploadedFile = result.data[0];
            console.log('✅ Uploaded file info:', uploadedFile);
            
            // Construct full URL using env base
            const imageUrl = constructImageUrl(`${envConfig.API_BASE_URL.replace('/api', '')}${uploadedFile.url}`);
            
            uploadedImages.push({
              uri: `file://temp/${image.id}.jpg`,
              id: image.id,
              name: `aneka_grafik_${image.id}.jpg`,
              url: imageUrl,
              serverPath: uploadedFile.url
            });
          } else {
            console.error('❌ Upload response missing data:', result);
          }
        } else {
          const errorText = await response.text();
          console.error('❌ Upload failed:', response.status, response.statusText, errorText);
        }
      } catch (error) {
        console.error('❌ Error uploading image:', error);
      }
    }
    
    console.log('📊 Total uploaded images:', uploadedImages.length);
    return uploadedImages;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.tanggal_grafik || !formData.isi_grafik.trim()) {
      toast.error('Tanggal dan isi grafik harus diisi');
      return;
    }

    if (formData.isi_grafik.length < 10) {
      toast.error('Isi grafik minimal 10 karakter');
      return;
    }

    setIsSubmitting(true);
    
    try {
      console.log('🚀 Starting form submission...');
      console.log('📸 Selected images:', selectedImages);
      console.log('🖼️ Existing images:', formData.images);
      
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
                name: `aneka_grafik_${img.id}.jpg`,
                url: `${envConfig.API_BASE_URL.replace('/api', '')}${uploadedFile.url}`,
                serverPath: uploadedFile.url
              };
            } else {
              return {
                uri: `file://temp/${img.id}.jpg`,
                id: img.id,
                name: `aneka_grafik_${img.id}.jpg`,
                url: `${envConfig.API_BASE_URL.replace('/api', '')}/uploads/aneka-grafik/temp_${img.id}.jpg`,
                serverPath: `uploads/aneka-grafik/temp_${img.id}.jpg`
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
              name: `aneka_grafik_${img.id}.jpg`,
              url: `${envConfig.API_BASE_URL.replace('/api', '')}${uploadedFile.url}`,
              serverPath: uploadedFile.url
            };
          } else {
            return {
              uri: `file://temp/${img.id}.jpg`,
              id: img.id,
              name: `aneka_grafik_${img.id}.jpg`,
              url: `${envConfig.API_BASE_URL.replace('/api', '')}/uploads/aneka-grafik/temp_${img.id}.jpg`,
              serverPath: `uploads/aneka-grafik/temp_${img.id}.jpg`
            };
          }
        });
      }
      
      // Ensure all image URLs are properly formatted like OmsetHarian
      const finalImages = imagesWithServerUrls.map(img => {
        if (img && img.url) {
          const fixedUrl = constructImageUrl(img.url);
          return { ...img, url: fixedUrl };
        }
        return img;
      });
      
      console.log('📊 Images with server URLs:', imagesWithServerUrls);
      console.log('🔍 Final images with fixed URLs:', finalImages);
      
      // Get editor content with [IMG:id] placeholders
      const editorContent = getEditorContent();
      console.log('📝 Editor content:', editorContent);
      
      const submitData = {
        tanggal_grafik: formData.tanggal_grafik,
        isi_grafik: editorContent,
        images: finalImages
      };
      
      console.log('📤 Submitting data:', submitData);
      
      let response;
      if (isEditMode) {
        response = await anekaGrafikService.updateAnekaGrafik(id, submitData);
      } else {
        response = await anekaGrafikService.createAnekaGrafik(submitData);
      }
      
      console.log('📥 Backend response:', response);
      
      if (response.success) {
        toast.success(isEditMode ? 'Aneka grafik berhasil diperbarui' : 'Aneka grafik berhasil ditambahkan');
        navigate('/keuangan/aneka-grafik');
      } else {
        toast.error(response.message || 'Terjadi kesalahan');
      }
    } catch (error) {
      console.error('❌ Error submitting form:', error);
      toast.error('Terjadi kesalahan saat menyimpan data');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6 bg-gray-50 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="animate-spin h-8 w-8 text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Memuat data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="bg-white rounded-lg shadow-sm border">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <button
                onClick={() => navigate('/keuangan/aneka-grafik')}
                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
              <h1 className="text-2xl font-bold text-gray-900">
                {isEditMode ? 'Edit Aneka Grafik' : 'Tambah Aneka Grafik'}
              </h1>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Form Content */}
          <div className="p-6 space-y-6">
            {/* Tanggal Grafik */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Calendar className="inline h-4 w-4 mr-2" />
                Tanggal Grafik
              </label>
              <input
                type="date"
                value={formData.tanggal_grafik}
                onChange={(e) => setFormData(prev => ({ ...prev, tanggal_grafik: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>

            {/* Image Upload Section */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <ImageIcon className="inline h-4 w-4 mr-2" />
                Upload Gambar
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                  id="image-upload"
                />
                <label htmlFor="image-upload" className="cursor-pointer">
                  <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <p className="text-gray-600 mb-2">
                    Klik untuk memilih gambar atau drag & drop
                  </p>
                  <p className="text-sm text-gray-500">
                    PNG, JPG, GIF hingga 5MB
                  </p>
                </label>
              </div>
            </div>

                         {/* New Images Preview */}
             {selectedImages.length > 0 && (
               <div>
                 <h3 className="text-sm font-medium text-gray-700 mb-3">Gambar Baru:</h3>
                 <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                   {selectedImages.map((image) => (
                     <div key={image.id} className="relative group">
                       <img
                         src={image.url}
                         alt={image.name}
                         className="w-full h-24 object-cover rounded-lg border"
                       />
                       <div className="absolute top-2 right-2 flex space-x-1">
                         <button
                           type="button"
                           onClick={() => insertImageIntoEditor(image)}
                           className="bg-blue-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-blue-600"
                           title="Masukkan ke editor"
                         >
                           <FileText className="h-3 w-3" />
                         </button>
                         <button
                           type="button"
                           onClick={() => removeImage(image.id)}
                           className="bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                           title="Hapus gambar"
                         >
                           <X className="h-3 w-3" />
                         </button>
                       </div>
                     </div>
                   ))}
                 </div>
               </div>
             )}

            {/* Existing Images */}
            {formData.images.length > 0 && (
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-3">Gambar yang Sudah Ada:</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {formData.images.map((image, index) => (
                    <div key={image.id || index} className="relative">
                      <img
                        src={image.url}
                        alt={`Gambar ${index + 1}`}
                        className="w-full h-24 object-cover rounded-lg border"
                      />
                      <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                        <span className="text-white text-xs text-center px-2">
                          Gambar sudah tersimpan
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Isi Grafik Editor */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <FileText className="inline h-4 w-4 mr-2" />
                Isi Grafik
              </label>
                             <div
                 ref={editorRef}
                 contentEditable
                 className="editor-content"
                 onInput={handleEditorChange}
                 onPaste={handleEditorPaste}
                 onDrop={handleEditorDrop}
                 onDragOver={handleEditorDragOver}
                 dangerouslySetInnerHTML={{ __html: formData.isi_grafik }}
                 placeholder="Ketik atau paste konten di sini..."
               />
              <p className="text-sm text-gray-500 mt-2">
                Panjang konten: {formData.isi_grafik.replace(/<[^>]*>/g, '').length} karakter
              </p>
            </div>
          </div>

          {/* Submit Buttons */}
          <div className="flex space-x-4 p-6">
            <button
              type="button"
              onClick={() => navigate('/keuangan/aneka-grafik')}
              className="px-6 py-3 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
            >
              {isSubmitting ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  <span>Menyimpan...</span>
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  <span>{isEditMode ? 'Update' : 'Simpan'}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminAnekaGrafikForm;