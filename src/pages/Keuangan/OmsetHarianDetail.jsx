import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { omsetHarianService } from '../../services/omsetHarianService';
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

const OmsetHarianDetail = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { user } = useAuth();
  const envConfig = getEnvironmentConfig();
  
  const [omsetData, setOmsetData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [fullScreenImage, setFullScreenImage] = useState(null);
  const [showFullScreenModal, setShowFullScreenModal] = useState(false);
  const [contentParts, setContentParts] = useState([]);

  useEffect(() => {
    if (id) {
      loadOmsetHarian();
    }
  }, [id]);

  // Process images and content when omsetData changes
  useEffect(() => {
    if (omsetData) {
      console.log('🔍 🔍 🔍 OMSET DATA LOADED:', omsetData);
      console.log('🔍 🔍 🔍 Images field:', omsetData.images);
      console.log('🔍 🔍 🔍 Images field type:', typeof omsetData.images);
      console.log('🔍 🔍 🔍 Environment config:', envConfig);
      console.log('🔍 🔍 🔍 BASE_URL:', envConfig.BASE_URL);
      
      const processedImages = processImages(omsetData.images);
      console.log('🔍 🔍 🔍 Final processed images:', processedImages);
      
      const parts = renderContentWithImages(
        omsetData.isi_omset,
        processedImages
      );
      
      setContentParts(parts);
    }
  }, [omsetData]);

  const loadOmsetHarian = async () => {
    try {
      console.log('🔍 🔍 🔍 Loading omset harian with ID:', id);
      setLoading(true);
      const response = await omsetHarianService.getOmsetHarianById(id);
      
      console.log('🔍 🔍 🔍 API Response:', response);
      console.log('🔍 🔍 🔍 Response success:', response.success);
      console.log('🔍 🔍 🔍 Response data:', response.data);
      
      if (response.success && response.data) {
        console.log('🔍 🔍 🔍 Setting omset data:', response.data);
        setOmsetData(response.data);
      } else {
        console.error('❌ ❌ ❌ API response indicates failure:', response);
        toast.error('Gagal memuat data omset harian');
        navigate('/keuangan/omset-harian');
      }
    } catch (error) {
      console.error('❌ ❌ ❌ Error loading omset harian:', error);
      toast.error('Gagal memuat data omset harian');
      navigate('/keuangan/omset-harian');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Apakah Anda yakin ingin menghapus data omset harian ini?')) {
      return;
    }

    try {
      await omsetHarianService.deleteOmsetHarian(id);
      toast.success('Data omset harian berhasil dihapus');
      navigate('/keuangan/omset-harian');
    } catch (error) {
      console.error('Error deleting omset harian:', error);
      toast.error('Gagal menghapus data omset harian');
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

  const parseFormattedText = (text) => {
    let parsedText = text;
    parsedText = parsedText.replace(/<b>(.*?)<\/b>/g, '**$1**');
    parsedText = parsedText.replace(/<i>(.*?)<\/i>/g, '*$1*');
    parsedText = parsedText.replace(/<u>(.*?)<\/u>/g, '__$1__');
    return parsedText;
  };

  // Render content with images inline
  const renderContentWithImages = (content, images = []) => {
    console.log('🔍 🔍 🔍 renderContentWithImages called with:');
    console.log('🔍 🔍 🔍 content:', content);
    console.log('🔍 🔍 🔍 content type:', typeof content);
    console.log('🔍 🔍 🔍 content length:', content ? content.length : 0);
    console.log('🔍 🔍 🔍 images:', images);
    console.log('🔍 🔍 🔍 images type:', typeof images);
    console.log('🔍 🔍 🔍 images length:', Array.isArray(images) ? images.length : 'not array');
    
    if (!content) {
      console.log('🔍 🔍 🔍 No content, returning null');
      return null;
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
            content: parseFormattedText(content.slice(lastIndex, placeholderMatch.index)),
          });
        }

        // Add image with complete server URL
        let imageUrl = '';
        if (image.url) {
          console.log(`🔍 🔍 🔍 Processing image URL for ID ${imageId}:`, image.url);
          if (image.url.startsWith('http')) {
            // Already absolute URL
            imageUrl = image.url;
            console.log(`🔍 🔍 🔍 Image ${imageId} already has absolute URL:`, imageUrl);
          } else {
            // Relative URL, add base URL
            const baseUrl = envConfig.BASE_URL.replace('/api', '');
            imageUrl = `${baseUrl}${image.url.startsWith('/') ? '' : '/'}${image.url}`;
            console.log(`🔍 🔍 🔍 Image ${imageId} constructed URL:`, {
              originalUrl: image.url,
              baseUrl: baseUrl,
              finalUrl: imageUrl
            });
          }
        } else {
          console.log(`🔍 🔍 🔍 Image ${imageId} has no URL field`);
        }
        
        console.log(`🔍 🔍 🔍 Final image URL for ID ${imageId}:`, imageUrl);
        
        parts.push({
          type: 'image',
          image: {
            ...image,
            displayUri: imageUrl,
            fallbackUri: imageUrl,
          },
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
              content: parseFormattedText(content.slice(lastIndex, imgIndex)),
            });
          }
          
          // Add image
          parts.push({
            type: 'image',
            image: {
              id: dataImageId || index,
              name: imgAlt,
              url: imgSrc,
              displayUri: imgSrc,
              fallbackUri: imgSrc,
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
        content: parseFormattedText(remainingText),
      });
    }

    console.log('🔍 🔍 🔍 Final parts array:', parts);
    console.log('🔍 🔍 🔍 Parts count:', parts.length);
    parts.forEach((part, index) => {
      console.log(`🔍 🔍 🔍 Part ${index + 1}:`, {
        type: part.type,
        contentLength: part.type === 'text' ? part.content.length : 'N/A',
        imageData: part.type === 'image' ? {
          id: part.image.id,
          url: part.image.url,
          displayUri: part.image.displayUri
        } : 'N/A'
      });
    });
    
    return parts;
  };

  const openFullScreenImage = (image) => {
    // Handle both relative and absolute URLs
    let imageUrl = '';
    if (image.url) {
      if (image.url.startsWith('http')) {
        // Already absolute URL
        imageUrl = image.url;
      } else {
        // Relative URL, add base URL
        const baseUrl = envConfig.BASE_URL.replace('/api', '');
        imageUrl = `${baseUrl}${image.url.startsWith('/') ? '' : '/'}${image.url}`;
      }
    } else {
      imageUrl = image.displayUri || image.fallbackUri;
    }
    
    console.log('🔍 Opening full screen image with URL:', imageUrl);
    setFullScreenImage(imageUrl);
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

  if (!omsetData) {
    return (
      <div className="p-6 bg-gray-50 min-h-screen">
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="p-8 text-center">
            <FileText className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Data tidak ditemukan</h3>
            <p className="text-gray-500 mb-4">Data omset harian yang Anda cari tidak ditemukan</p>
            <button
              onClick={() => navigate('/keuangan/omset-harian')}
              className="inline-flex items-center space-x-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
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
                onClick={() => navigate('/keuangan/omset-harian')}
                className="p-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                <ArrowLeft className="h-4 w-4" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Detail Omset Harian</h1>
                <p className="text-gray-600">Informasi lengkap data omset harian</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <div className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm font-medium">
                OMSET HARIAN
              </div>
            </div>
          </div>
        </div>

        {/* Summary Card */}
        <div className="p-6 bg-gradient-to-r from-red-600 to-red-700 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold mb-1">OMSET HARIAN</h2>
              <p className="text-red-100">Tanggal: {formatDate(omsetData.tanggal_omset)}</p>
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
              <p className="text-sm font-medium text-gray-500">Tanggal Omset</p>
              <p className="text-lg font-semibold text-gray-900">{formatDate(omsetData.tanggal_omset)}</p>
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
              <p className="text-lg font-semibold text-gray-900">{omsetData.user_nama || 'Admin'}</p>
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
              <p className="text-lg font-semibold text-gray-900">{formatDateTime(omsetData.created_at)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Isi Omset Section */}
      <div className="bg-white rounded-lg shadow-sm border mb-6">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <FileText className="h-5 w-5 text-blue-600" />
            </div>
            <h2 className="text-xl font-bold text-gray-900">Isi Omset Harian</h2>
          </div>
        </div>
        <div className="p-6">
          <div className="prose max-w-none">
            {contentParts.map((part, index) => {
              if (part.type === 'text') {
                return (
                  <pre key={index} className="whitespace-pre-wrap text-gray-700 leading-relaxed font-sans">
                    {part.content}
                  </pre>
                );
              } else if (part.type === 'image') {
                return (
                  <div key={index} className="my-4">
                    <button
                      onClick={() => openFullScreenImage(part.image)}
                      className="block w-full text-left"
                    >
                      <img
                        src={part.image.displayUri}
                        alt={part.image.filename || part.image.name || 'Omset image'}
                        className="max-w-full h-auto max-h-96 object-contain rounded-lg shadow-sm border"
                        style={{ maxHeight: '500px' }}
                        onError={(e) => {
                          console.error('❌ Image failed to load:', part.image.displayUri);
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
                            <p class="text-red-600 text-sm">URL: ${part.image.displayUri}</p>
                          `;
                          e.target.parentNode.appendChild(errorDiv);
                        }}
                        onLoad={() => {
                          console.log('✅ Image loaded successfully:', part.image.displayUri);
                        }}
                      />
                    </button>
                  </div>
                );
              }
              return null;
            })}
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="flex items-center justify-between">
          <div className="flex space-x-4">
            <button
              onClick={() => navigate('/keuangan/omset-harian')}
              className="px-6 py-3 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Kembali
            </button>
            
            {/* Debug button for testing */}
            <button
              onClick={() => {
                console.log('🔍 🔍 🔍 DEBUG BUTTON CLICKED');
                console.log('🔍 🔍 🔍 Current omsetData:', omsetData);
                console.log('🔍 🔍 🔍 Current contentParts:', contentParts);
                if (omsetData) {
                  console.log('🔍 🔍 🔍 Testing image processing...');
                  const processedImages = processImages(omsetData.images);
                  console.log('🔍 🔍 🔍 Test processed images:', processedImages);
                  const testParts = renderContentWithImages(omsetData.isi_omset, processedImages);
                  console.log('🔍 🔍 🔍 Test content parts:', testParts);
                }
              }}
              className="px-6 py-3 text-blue-600 border border-blue-300 rounded-lg hover:bg-blue-50 transition-colors"
            >
              Debug Images
            </button>
          </div>
          <div className="flex space-x-4">
            <button
              onClick={() => navigate(`/keuangan/omset-harian/${id}/edit`)}
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

export default OmsetHarianDetail; 