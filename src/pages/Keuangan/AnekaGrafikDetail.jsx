import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { anekaGrafikService } from '../../services/anekaGrafikService';
import { toast } from 'react-hot-toast';
import { getEnvironmentConfig } from '../../config/environment';
import { 
  ArrowLeft, 
  Calendar, 
  FileText,
  User,
  Clock,
  Edit,
  Trash2,
  RefreshCw,
  Image as ImageIcon,
  X
} from 'lucide-react';

const AnekaGrafikDetail = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { user } = useAuth();
  const envConfig = getEnvironmentConfig();
  
  const [anekaGrafikData, setAnekaGrafikData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [fullScreenImage, setFullScreenImage] = useState(null);
  const [showFullScreenModal] = useState(false);
  const [processedImages, setProcessedImages] = useState([]);
  const [contentParts, setContentParts] = useState([]);
  const [formData, setFormData] = useState({
    tanggal_grafik: '',
    isi_grafik: '',
    images: []
  });

  useEffect(() => {
    if (id) {
      loadAnekaGrafik();
    }
  }, [id]);

  // Process images and content when anekaGrafikData changes (same as form)
  useEffect(() => {
    if (anekaGrafikData) {
      console.log('🔍 🔍 🔍 ANEKA GRAFIK DATA LOADED:', anekaGrafikData);
      console.log('🔍 🔍 🔍 Images field:', anekaGrafikData.images);
      console.log('🔍 🔍 🔍 Images field type:', typeof anekaGrafikData.images);
      console.log('🔍 🔍 🔍 Environment config:', envConfig);
      console.log('🔍 🔍 🔍 BASE_URL:', envConfig.BASE_URL);
      
      const processedImages = processImages(anekaGrafikData.images);
      console.log('🔍 🔍 🔍 Final processed images:', processedImages);
      
      const parts = renderContentWithImages(
        anekaGrafikData.isi_grafik,
        processedImages
      );
      
      setContentParts(parts);
      setProcessedImages(processedImages);
      
      setFormData({
        tanggal_grafik: anekaGrafikData.tanggal_grafik || '',
        isi_grafik: anekaGrafikData.isi_grafik || '',
        images: processedImages
      });
    }
  }, [anekaGrafikData]);

  const loadAnekaGrafik = async () => {
    try {
      console.log('🔍 🔍 🔍 Loading aneka grafik with ID:', id);
      setLoading(true);
      const response = await anekaGrafikService.getAnekaGrafikById(id);
      
      console.log('🔍 🔍 🔍 API Response:', response);
      console.log('🔍 🔍 🔍 Response success:', response.success);
      console.log('🔍 🔍 🔍 Response data:', response.data);
      
      if (response.success && response.data) {
        console.log('🔍 🔍 🔍 Setting aneka grafik data:', response.data);
        setAnekaGrafikData(response.data);
      } else {
        console.error('❌ ❌ ❌ API response indicates failure:', response);
        toast.error('Gagal memuat data aneka grafik');
        navigate('/keuangan/aneka-grafik');
      }
    } catch (error) {
      console.error('❌ ❌ ❌ Error loading aneka grafik:', error);
      toast.error('Gagal memuat data aneka grafik');
      navigate('/keuangan/aneka-grafik');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Apakah Anda yakin ingin menghapus data aneka grafik ini?')) {
      return;
    }

    try {
      await anekaGrafikService.deleteAnekaGrafik(id);
      toast.success('Data aneka grafik berhasil dihapus');
      navigate('/keuangan/aneka-grafik');
    } catch (error) {
      console.error('Error deleting aneka grafik:', error);
      toast.error('Gagal menghapus data aneka grafik');
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleString('id-ID', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleImagePress = (imageUri) => {
    setFullScreenImage(imageUri);
    setShowFullScreenModal(true);
  };

  // Helper function to safely process images
  const processImages = (images) => {
    console.log('🔍 🔍 🔍 processImages called with:', images);
    console.log('🔍 🔍 🔍 Images type:', typeof images);
    console.log('🔍 🔍 🔍 Images is null/undefined:', images === null || images === undefined);
    
    if (!images) {
      console.log('🔍 🔍 🔍 No images data, returning empty array');
      return [];
    }
    
    let processedImages = [];
    
    if (typeof images === 'string') {
      console.log('🔍 🔍 🔍 Images is string, attempting to parse JSON');
      try {
        processedImages = JSON.parse(images);
        console.log('🔍 🔍 🔍 Successfully parsed images string:', processedImages);
      } catch (error) {
        console.error('❌ ❌ ❌ Error parsing images JSON:', error);
        console.error('❌ ❌ ❌ Raw string content:', images);
        // If JSON parsing fails, try to treat it as a single image URL
        if (images.trim()) {
          processedImages = [{ url: images, name: images.split('/').pop() || 'image' }];
          console.log('🔍 🔍 🔍 Treated string as single image URL:', processedImages);
        } else {
          console.log('🔍 🔍 🔍 Empty string, returning empty array');
        return [];
        }
      }
    } else if (Array.isArray(images)) {
      console.log('🔍 🔍 🔍 Images is already an array');
      processedImages = images;
    } else if (typeof images === 'object' && images !== null) {
      // If it's a single object, wrap it in an array
      console.log('🔍 🔍 🔍 Images is single object, wrapping in array');
      processedImages = [images];
    } else {
      console.warn('⚠️ ⚠️ ⚠️ Unknown images format:', typeof images);
      return [];
    }
    
    // Ensure it's always an array
    if (!Array.isArray(processedImages)) {
      if (processedImages && typeof processedImages === 'object' && processedImages !== null) {
        processedImages = [processedImages];
        console.log('🔍 🔍 🔍 Converted single object to array');
      } else {
        console.warn('⚠️ ⚠️ ⚠️ Invalid images data, returning empty array');
        return [];
      }
    }
    
    console.log('🔍 🔍 🔍 Final processed images array:', processedImages);
    console.log('🔍 🔍 🔍 Array length:', processedImages.length);
    
    // Log each image details
    processedImages.forEach((img, index) => {
      console.log(`🔍 🔍 🔍 Image ${index + 1}:`, {
        id: img?.id,
        url: img?.url,
        uri: img?.uri,
        name: img?.name,
        filename: img?.filename,
        serverPath: img?.serverPath
      });
    });
    
    return processedImages;
  };

  // Helper function to render content with images (same as form)
  const renderContentWithImages = (content, images = []) => {
    console.log('🔍 🔍 🔍 renderContentWithImages called with:');
    console.log('🔍 🔍 🔍 content:', content);
    console.log('🔍 🔍 🔍 content type:', typeof content);
    console.log('🔍 🔍 🔍 content length:', content ? content.length : 0);
    console.log('🔍 🔍 🔍 images:', images);
    console.log('🔍 🔍 🔍 images type:', typeof images);
    console.log('🔍 🔍 🔍 images length:', Array.isArray(images) ? images.length : 'not array');
    
    if (!content) {
      console.log('🔍 🔍 🔍 No content, returning empty array');
      return [];
    }

    // Ensure images is an array and process if it's a string
    let imagesArray = [];
    if (typeof images === 'string') {
      console.log('🔍 🔍 🔍 Images is string in renderContentWithImages, attempting to parse');
      try {
        imagesArray = JSON.parse(images);
        console.log('🔍 🔍 🔍 Successfully parsed images string in renderContentWithImages:', imagesArray);
      } catch (error) {
        console.error('❌ ❌ ❌ Error parsing images in renderContentWithImages:', error);
        // If JSON parsing fails, try to treat it as a single image URL
        if (images.trim()) {
          imagesArray = [{ url: images, name: images.split('/').pop() || 'image' }];
          console.log('🔍 🔍 🔍 Treated string as single image URL in renderContentWithImages:', imagesArray);
        } else {
          imagesArray = [];
        }
      }
    } else if (Array.isArray(images)) {
      imagesArray = images;
      console.log('🔍 🔍 🔍 Images is already an array in renderContentWithImages');
    } else if (typeof images === 'object' && images !== null) {
      // If it's a single object, wrap it in an array
      imagesArray = [images];
      console.log('🔍 🔍 🔍 Single object wrapped in array in renderContentWithImages');
    } else {
      console.warn('⚠️ ⚠️ ⚠️ Unknown images format in renderContentWithImages:', typeof images);
      imagesArray = [];
    }
    console.log('🔍 🔍 🔍 Final imagesArray:', imagesArray);
    console.log('🔍 🔍 🔍 imagesArray length:', imagesArray.length);

    const parts = [];
    let lastIndex = 0;

    // First, try to find [IMG:id] placeholders (for backward compatibility)
    const imagePlaceholderRegex = /\[IMG:(\d+)\]/g;
    let placeholderMatch;
    let hasPlaceholders = false;

    while ((placeholderMatch = imagePlaceholderRegex.exec(content)) !== null) {
      hasPlaceholders = true;
      const imageId = parseInt(placeholderMatch[1]);
      console.log(`🔍 Found image placeholder: [IMG:${imageId}]`);
      
      const image = imagesArray.find((img) => img && img.id === imageId);
      console.log(`🔍 Looking for image with ID ${imageId}:`, image);

      if (image) {
        console.log(`✅ Image found for ID ${imageId}`);
        
        // Add text before image
        if (placeholderMatch.index > lastIndex) {
          parts.push({
            type: 'text',
            text: content.slice(lastIndex, placeholderMatch.index),
          });
        }

        // Add image
        parts.push({
          type: 'image',
          image: image,
        });

        lastIndex = placeholderMatch.index + placeholderMatch[0].length;
      } else {
        console.log(`❌ Image not found for ID: ${imageId}`);
        console.log(`📁 Available images:`, imagesArray.map(img => ({ id: img?.id })));
      }
    }

    // If no placeholders found, try to find HTML img tags
    if (!hasPlaceholders) {
      console.log('🔍 🔍 🔍 No [IMG:id] placeholders found, looking for HTML img tags');
      
      // Create a temporary div to parse HTML content
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = content;
      
      const imgTags = tempDiv.querySelectorAll('img');
      console.log(`🔍 🔍 🔍 Found ${imgTags.length} HTML img tags`);
      
      imgTags.forEach((imgTag, index) => {
        const imgSrc = imgTag.getAttribute('src');
        const imgAlt = imgTag.getAttribute('alt') || `Gambar ${index + 1}`;
        const dataImageId = imgTag.getAttribute('data-image-id');
        
        console.log(`🔍 🔍 🔍 HTML img tag ${index + 1}:`, { 
          src: imgSrc, 
          alt: imgAlt, 
          dataImageId,
          outerHTML: imgTag.outerHTML 
        });
        
        if (imgSrc) {
          // Add text before image if any
          const imgIndex = content.indexOf(imgTag.outerHTML);
          console.log(`🔍 🔍 🔍 Image ${index + 1} found at index:`, imgIndex);
          
          if (imgIndex > lastIndex) {
            parts.push({
              type: 'text',
              text: content.slice(lastIndex, imgIndex),
            });
          }
          
          // Add image
          parts.push({
            type: 'image',
            image: {
              id: dataImageId || index,
              name: imgAlt,
              url: imgSrc,
            },
          });
          
          lastIndex = imgIndex + imgTag.outerHTML.length;
          console.log(`🔍 🔍 🔍 Updated lastIndex to:`, lastIndex);
        }
      });
    }

    // Add remaining text
    if (lastIndex < content.length) {
      const remainingText = content.slice(lastIndex);
      console.log('🔍 🔍 🔍 Adding remaining text:', remainingText);
      parts.push({
        type: 'text',
        text: remainingText,
      });
    }

    console.log('🔍 🔍 🔍 Final parts array:', parts);
    console.log('🔍 🔍 🔍 Parts count:', parts.length);
    parts.forEach((part, index) => {
      console.log(`🔍 🔍 🔍 Part ${index + 1}:`, {
        type: part.type,
        contentLength: part.type === 'text' ? part.text.length : 'N/A',
        imageData: part.type === 'image' ? {
          id: part.image.id,
          url: part.image.url,
        } : 'N/A'
      });
    });
    
    return parts;
  };

  const openFullScreenImage = (image) => {
    setFullScreenImage(image.url);
    setShowFullScreenModal(true);
  };

  if (loading) {
    return (
      <div className="p-6 bg-gray-50 min-h-screen">
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="p-8 text-center">
            <RefreshCw className="h-8 w-8 animate-spin text-green-500 mx-auto mb-4" />
          <p className="text-gray-600">Memuat data...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!anekaGrafikData) {
    return (
      <div className="p-6 bg-gray-50 min-h-screen">
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="p-8 text-center">
            <FileText className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Data tidak ditemukan</h3>
            <p className="text-gray-500 mb-4">Data aneka grafik yang Anda cari tidak ditemukan</p>
            <button
              onClick={() => navigate('/keuangan/aneka-grafik')}
              className="inline-flex items-center space-x-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Kembali ke Daftar</span>
            </button>
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
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/keuangan/aneka-grafik')}
                className="p-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                <ArrowLeft className="h-4 w-4" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Detail Aneka Grafik</h1>
                <p className="text-gray-600">Informasi lengkap data aneka grafik</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <div className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                ANEKA GRAFIK
              </div>
            </div>
          </div>
        </div>

        {/* Summary Card */}
        <div className="p-6 bg-gradient-to-r from-blue-600 to-blue-700 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold mb-1">ANEKA GRAFIK</h2>
              <p className="text-blue-100">Tanggal: {formatDate(anekaGrafikData.tanggal_grafik)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Information Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Calendar className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Tanggal Grafik</p>
              <p className="text-lg font-semibold text-gray-900">{formatDate(anekaGrafikData.tanggal_grafik)}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <User className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Dibuat Oleh</p>
              <p className="text-lg font-semibold text-gray-900">{anekaGrafikData.user_nama || 'Admin'}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-orange-100 rounded-lg">
              <Clock className="h-5 w-5 text-orange-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Waktu Input</p>
              <p className="text-lg font-semibold text-gray-900">{formatDateTime(anekaGrafikData.created_at)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Isi Grafik Section */}
      <div className="bg-white rounded-lg shadow-sm border mb-6">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <FileText className="h-5 w-5 text-blue-600" />
            </div>
            <h2 className="text-xl font-bold text-gray-900">Isi Aneka Grafik</h2>
          </div>
        </div>
        <div className="p-6">
          {contentParts && contentParts.length > 0 ? (
            contentParts.map((part, index) => (
              <React.Fragment key={index}>
                {part.type === 'text' && part.text && (
                  <div 
                    className="prose max-w-none"
                    dangerouslySetInnerHTML={{ 
                      __html: part.text.replace(/\n/g, '<br>') 
                    }}
                  />
                )}
                {part.type === 'image' && part.image && (
                  <div className="my-4">
                    <button
                      onClick={() => openFullScreenImage(part.image)}
                      className="block w-full text-left"
                    >
                      <img
                        src={part.image.url}
                        alt={part.image.filename || part.image.name || 'Aneka grafik image'}
                        className="max-w-full h-auto max-h-96 object-contain rounded-lg shadow-sm border"
                        style={{ maxHeight: '500px' }}
                        onError={(e) => {
                          console.error('❌ Image failed to load:', part.image.url);
                          console.error('❌ Image data:', part.image);
                          // Show error placeholder
                          e.target.style.display = 'none';
                          const errorDiv = document.createElement('div');
                          errorDiv.className = 'p-8 text-center bg-red-50 border-2 border-red-200 rounded-lg';
                          errorDiv.innerHTML = `
                            <div class="text-red-600 mb-2">
                              <svg class="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"></path>
                              </svg>
                            </div>
                            <p class="text-red-800 font-medium">Gambar gagal dimuat</p>
                            <p class="text-red-600 text-sm">URL: ${part.image.url}</p>
                          `;
                          e.target.parentNode.appendChild(errorDiv);
                        }}
                        onLoad={() => {
                          console.log('✅ Image loaded successfully:', part.image.url);
                        }}
                      />
                    </button>
                  </div>
                )}
              </React.Fragment>
            ))
          ) : (
            <div 
              className="prose max-w-none"
              dangerouslySetInnerHTML={{ 
                __html: (formData.isi_grafik || '').replace(/\n/g, '<br>') 
              }}
            />
          )}
        </div>

        {/* CSS for editor content - same as form */}
        <style dangerouslySetInnerHTML={{
          __html: `
            .editor-content {
              line-height: 1.6;
              color: #374151;
              font-family: inherit;
            }
            .editor-content img {
              max-width: 100%;
              height: auto;
              margin: 8px 0;
              border-radius: 8px;
              box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
              display: block;
              cursor: pointer;
              transition: transform 0.2s ease-in-out;
            }
            .editor-content img:hover {
              transform: scale(1.02);
            }
            .editor-content p {
              margin: 8px 0;
            }
            .editor-content br {
              display: block;
              margin: 4px 0;
            }
            .editor-content * {
              max-width: 100%;
            }
            .editor-content h1, .editor-content h2, .editor-content h3, .editor-content h4, .editor-content h5, .editor-content h6 {
              margin: 1rem 0 0.5rem 0;
              font-weight: 600;
            }
            .editor-content ul, .editor-content ol {
              margin: 0.5rem 0;
              padding-left: 1.5rem;
            }
            .editor-content li {
              margin: 0.25rem 0;
            }
            .editor-content blockquote {
              margin: 1rem 0;
              padding: 0.5rem 1rem;
              border-left: 4px solid #3b82f6;
              background-color: #f8fafc;
              font-style: italic;
            }
            .editor-content code {
              background-color: #f1f5f9;
              padding: 0.125rem 0.25rem;
              border-radius: 0.25rem;
              font-family: 'Courier New', monospace;
              font-size: 0.875rem;
            }
            .editor-content pre {
              background-color: #f1f5f9;
              padding: 1rem;
              border-radius: 0.5rem;
              overflow-x: auto;
              margin: 1rem 0;
            }
          `
        }} />
        

      </div>

      {/* Action Buttons */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="flex items-center justify-between">
          <div className="flex space-x-4">
            <button
              onClick={() => navigate('/keuangan/aneka-grafik')}
              className="px-6 py-3 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Kembali
            </button>
            
            {/* Debug button for testing */}
            <button
              onClick={() => {
                console.log('🔍 🔍 🔍 DEBUG BUTTON CLICKED');
                console.log('🔍 🔍 🔍 Current anekaGrafikData:', anekaGrafikData);
                console.log('🔍 🔍 🔍 Current formData:', formData);
                console.log('🔍 🔍 🔍 Current processedImages:', processedImages);
                if (anekaGrafikData) {
                  console.log('🔍 🔍 🔍 Testing image processing...');
                  const testProcessedImages = processImages(anekaGrafikData.images);
                  console.log('🔍 🔍 🔍 Test processed images:', testProcessedImages);
                  
                  // Check if content contains [IMG:] placeholders
                  const hasPlaceholders = anekaGrafikData.isi_grafik.includes('[IMG:');
                  console.log('🔍 Content contains [IMG:] placeholders:', hasPlaceholders);
                  
                  if (hasPlaceholders) {
                    const placeholderRegex = /\[IMG:(\d+)\]/g;
                    const placeholders = anekaGrafikData.isi_grafik.match(placeholderRegex);
                    console.log('🔍 Found placeholders:', placeholders);
                  }
                }
              }}
              className="px-6 py-3 text-blue-600 border border-blue-300 rounded-lg hover:bg-blue-50 transition-colors"
            >
              Debug Images & Content
            </button>
          </div>
          <div className="flex space-x-4">
            <button
              onClick={() => navigate(`/keuangan/aneka-grafik/${id}/edit`)}
              className="flex items-center space-x-2 px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              <Edit className="h-4 w-4" />
              <span>Edit</span>
            </button>
            <button
              onClick={handleDelete}
              className="flex items-center space-x-2 px-6 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
            >
              <Trash2 className="h-4 w-4" />
              <span>Hapus</span>
            </button>
          </div>
        </div>
      </div>

      {/* Full Screen Image Modal */}
      {showFullScreenModal && fullScreenImage && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
          <div className="relative max-w-4xl max-h-full p-4">
            <button
              onClick={() => setShowFullScreenModal(false)}
              className="absolute top-4 right-4 text-white bg-black bg-opacity-50 rounded-full p-2 hover:bg-opacity-75 transition-colors z-10"
            >
              <X className="h-6 w-6" />
            </button>
            <img
              src={fullScreenImage}
              alt="Full screen"
              className="max-w-full max-h-full object-contain"
              style={{ maxWidth: '90vw', maxHeight: '90vh', width: 'auto', height: 'auto' }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default AnekaGrafikDetail; 