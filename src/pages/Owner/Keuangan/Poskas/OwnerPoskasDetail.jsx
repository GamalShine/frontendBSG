import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../../contexts/AuthContext';
import { poskasService } from '../../../../services/poskasService';
import { toast } from 'react-hot-toast';
import { ArrowLeft, Calendar, User, Clock, FileText, Eye, RefreshCw, Edit, Trash2, Info } from 'lucide-react';
import { getEnvironmentConfig } from '../../../../config/environment';

const OwnerPoskasDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const envConfig = getEnvironmentConfig();
  
  const [poskasData, setPoskasData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [fullScreenImage, setFullScreenImage] = useState(null);
  const [showFullScreenModal, setShowFullScreenModal] = useState(false);
  const [contentParts, setContentParts] = useState([]);

  useEffect(() => {
    if (id) {
      fetchPoskasDetail();
    }
  }, [id]);

  // Process images and content when poskasData changes
  useEffect(() => {
    if (poskasData) {
      console.log('🔍 Processing poskasData:', poskasData);
      console.log('🔍 Raw images data:', poskasData.images);
      console.log('🔍 Images data type:', typeof poskasData.images);
      console.log('🔍 Images data length:', poskasData.images?.length);
      console.log('🔍 Images data constructor:', poskasData.images?.constructor?.name);
      
      const processedImages = processImages(poskasData.images);
      console.log('🔍 Final processed images:', processedImages);
      console.log('🔍 Processed images count:', processedImages.length);
      
      const parts = renderContentWithImages(
        poskasData.isi_poskas,
        processedImages
      );
      
      console.log('🔍 Final content parts:', parts);
      console.log('🔍 Content parts count:', parts.length);
      
      setContentParts(parts);
    }
  }, [poskasData]);

  const fetchPoskasDetail = async () => {
    try {
      setLoading(true);
      const response = await poskasService.getPoskasById(id);

      if (response.success) {
        const poskasData = response.data;
        console.log('🔍 Raw poskas data:', poskasData);
        console.log('🔍 Raw images data:', poskasData.images);
        console.log('🔍 Raw images type:', typeof poskasData.images);
        
        setPoskasData(poskasData);
      } else {
        toast.error('Data POSKAS tidak ditemukan');
        navigate('/owner/keuangan/poskas');
      }
    } catch (error) {
      console.error('Error fetching poskas detail:', error);
      toast.error('Gagal memuat detail POSKAS');
      navigate('/owner/keuangan/poskas');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
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

  // Helper function to safely process images (sama seperti admin)
  const processImages = (images) => {
    console.log('🔍 processImages called with:', images);
    console.log('🔍 images type:', typeof images);
    console.log('🔍 images isArray:', Array.isArray(images));
    
    if (!images) return [];
    
    let imagesArray = [];
    
    // If images is already an array, use it directly
    if (Array.isArray(images)) {
      imagesArray = images;
      console.log('✅ Images is already an array, using directly');
    } else if (typeof images === 'string') {
      try {
        // Clean the string first - remove extra quotes if they exist
        let cleanImages = images.trim();
        
        // Remove extra quotes if the string is wrapped in quotes
        if (cleanImages.startsWith('"') && cleanImages.endsWith('"')) {
          cleanImages = cleanImages.slice(1, -1);
        }
        
        // Unescape the string
        cleanImages = cleanImages.replace(/\\"/g, '"').replace(/\\\\/g, '\\');
        
        console.log('🔍 Original images string:', images);
        console.log('🔍 Cleaned images string:', cleanImages);
        
        // Parse JSON
        const parsed = JSON.parse(cleanImages);
        console.log('🔍 Parsed result:', parsed);
        console.log('🔍 Parsed type:', typeof parsed);
        console.log('🔍 Parsed isArray:', Array.isArray(parsed));
        
        if (parsed && typeof parsed === 'object' && parsed !== null) {
          if (Array.isArray(parsed)) {
            imagesArray = parsed;
            console.log('✅ Using parsed array directly');
          } else {
            // Single object, wrap in array
            imagesArray = [parsed];
            console.log('✅ Single object wrapped in array');
          }
        } else {
          console.log('ℹ️ Parsed result is not an object, skipping:', parsed);
          return [];
        }
      } catch (error) {
        console.error('❌ Error parsing JSON:', error);
        return [];
      }
    } else if (images && typeof images === 'object' && images !== null) {
      // Single object, wrap in array
      imagesArray = [images];
      console.log('✅ Single object wrapped in array');
    } else {
      console.log('ℹ️ Invalid images format:', typeof images);
      return [];
    }
    
    // Ensure imagesArray is actually an array
    if (!Array.isArray(imagesArray)) {
      console.error('❌ imagesArray is not an array:', imagesArray);
      return [];
    }
    
    console.log('🔍 Final images array:', imagesArray);
    
    // Fix old IP addresses in image URLs
    return imagesArray.map(image => {
      if (image && image.url) {
        let fixedUrl = image.url;
        
        // Fix double http:// issue
        if (fixedUrl.startsWith('http://http://')) {
          fixedUrl = fixedUrl.replace('http://http://', 'http://');
          console.log(`🔍 Fixed double http:// URL: ${image.url} -> ${fixedUrl}`);
        }
        
        // Fix old IP addresses
        if (fixedUrl.includes('192.168.30.116:3000')) {
          const baseUrl = envConfig.BASE_URL.replace('/api', '');
          fixedUrl = fixedUrl.replace('http://192.168.30.116:3000', baseUrl);
          console.log(`🔍 Fixed old IP in processImages: ${image.url} -> ${baseUrl}`);
        } else if (fixedUrl.includes('192.168.30.116:3000')) {
          const baseUrl = envConfig.BASE_URL.replace('/api', '');
          fixedUrl = fixedUrl.replace('http://192.168.30.116:3000', baseUrl);
          console.log(`🔍 Fixed old IP in processImages: ${image.url} -> ${baseUrl}`);
        }
        
        const processedImg = { ...image, url: fixedUrl };
        console.log('🔍 Processed image object:', processedImg);
        return processedImg;
      }
      return image;
    });
  };

  const parseFormattedText = (text) => {
    let parsedText = text;
    parsedText = parsedText.replace(/<b>(.*?)<\/b>/g, '**$1**');
    parsedText = parsedText.replace(/<i>(.*?)<\/i>/g, '*$1*');
    parsedText = parsedText.replace(/<u>(.*?)<\/u>/g, '__$1__');
    return parsedText;
  };

  // Render content with images inline (sama seperti admin)
  const renderContentWithImages = (content, images = []) => {
    console.log('🔍 renderContentWithImages called with:');
    console.log('🔍 content:', content);
    console.log('🔍 images:', images);
    console.log('🔍 images type:', typeof images);
    console.log('🔍 images isArray:', Array.isArray(images));
    
    if (!content) return null;

    // Ensure images is an array and process if it's a string
    let imagesArray = [];
    
    // If images is already an array, use it directly
    if (Array.isArray(images)) {
      imagesArray = images;
      console.log('🔍 Images is already an array in renderContentWithImages');
    } else if (typeof images === 'string') {
      try {
        // Clean the string first - remove extra quotes if they exist
        let cleanImages = images.trim();
        
        // Remove extra quotes if the string is wrapped in quotes
        if (cleanImages.startsWith('"') && cleanImages.endsWith('"')) {
          cleanImages = cleanImages.slice(1, -1);
        }
        
        // Unescape the string
        cleanImages = cleanImages.replace(/\\"/g, '"').replace(/\\\\/g, '\\');
        
        console.log('🔍 Original images string in renderContentWithImages:', images);
        console.log('🔍 Cleaned images string in renderContentWithImages:', cleanImages);
        
        // Parse JSON
        const parsed = JSON.parse(cleanImages);
        console.log('🔍 Parsed result in renderContentWithImages:', parsed);
        console.log('🔍 Parsed type in renderContentWithImages:', typeof parsed);
        console.log('🔍 Parsed isArray in renderContentWithImages:', Array.isArray(parsed));
        
        if (parsed && typeof parsed === 'object' && parsed !== null) {
          if (Array.isArray(parsed)) {
            imagesArray = parsed;
            console.log('✅ Using parsed array directly in renderContentWithImages');
          } else {
            // Single object, wrap in array
            imagesArray = [parsed];
            console.log('✅ Single object wrapped in array in renderContentWithImages');
          }
        } else {
          console.log('ℹ️ Parsed result is not an object in renderContentWithImages:', parsed);
          imagesArray = [];
        }
      } catch (error) {
        console.error('❌ Error parsing JSON in renderContentWithImages:', error);
        imagesArray = [];
      }
    } else if (images && typeof images === 'object' && images !== null) {
      // Single object, wrap in array
      imagesArray = [images];
      console.log('✅ Converted object to array in renderContentWithImages');
    } else {
      console.log('ℹ️ Invalid images format in renderContentWithImages:', typeof images);
      imagesArray = [];
    }
    
    // Ensure imagesArray is actually an array
    if (!Array.isArray(imagesArray)) {
      console.error('❌ imagesArray is not an array in renderContentWithImages:', imagesArray);
      imagesArray = [];
    }
    
    console.log('🔍 Final imagesArray:', imagesArray);

    const parts = [];
    let lastIndex = 0;

    // Find all image tags
    const imageRegex = /\[IMG:(\d+(?:\.\d+)?)\]/g;
    let match;

    while ((match = imageRegex.exec(content)) !== null) {
      const imageId = match[1];
      console.log(`🔍 Found image tag: [IMG:${imageId}]`);
      
      // Try to find image by ID (handle both integer and float IDs)
      const image = imagesArray.find((img) => {
        if (!img || !img.id) return false;
        // Convert both to strings for comparison to handle float IDs
        return String(img.id) === String(imageId);
      });
      
      console.log(`🔍 Looking for image with ID ${imageId}:`, image);

      if (image) {
        console.log(`✅ Image found for ID ${imageId}`);
        
        // Add text before image
        if (match.index > lastIndex) {
          parts.push({
            type: 'text',
            content: parseFormattedText(content.slice(lastIndex, match.index)),
          });
        }

        // Add image with server URL if available
        const displayUri = (() => {
          if (image.url) {
            let imageUrl = image.url;
            
            // Fix double http:// issue
            if (imageUrl.startsWith('http://http://')) {
              imageUrl = imageUrl.replace('http://http://', 'http://');
              console.log(`🔍 Fixed double http:// URL: ${image.url} -> ${imageUrl}`);
            }
            
            // Fix old IP addresses
            if (imageUrl.includes('192.168.30.116:3000')) {
              const baseUrl = envConfig.BASE_URL.replace('/api', '');
              imageUrl = imageUrl.replace('http://192.168.30.116:3000', baseUrl);
              console.log(`🔍 Fixed old IP URL: ${image.url} -> ${baseUrl}`);
            } else if (imageUrl.includes('192.168.30.116:3000')) {
              const baseUrl = envConfig.BASE_URL.replace('/api', '');
              imageUrl = imageUrl.replace('http://192.168.30.116:3000', baseUrl);
              console.log(`🔍 Fixed old IP URL: ${image.url} -> ${baseUrl}`);
            }
            
            if (imageUrl.startsWith('http')) {
              // Already absolute URL, but check if it has /api in wrong place
              if (imageUrl.includes('/api/uploads/')) {
                // Remove /api from upload URLs
                imageUrl = imageUrl.replace('/api/uploads/', '/uploads/');
                console.log(`🔍 Fixed /api in upload URL: ${image.url} -> ${imageUrl}`);
              }
              console.log(`🔍 Using absolute URL: ${imageUrl}`);
              return imageUrl;
            } else {
              // Relative URL, add base URL without /api
              const baseUrl = envConfig.BASE_URL.replace('/api', '');
              const fullUrl = `${baseUrl}${imageUrl.startsWith('/') ? '' : '/'}${imageUrl}`;
              console.log(`🔍 Using relative URL with base: ${fullUrl}`);
              return fullUrl;
            }
          }
          console.log(`🔍 No URL found, using URI: ${image.uri || 'none'}`);
          return image.uri || '';
        })();

        const fallbackUri = (() => {
          if (image.uri) {
            console.log(`🔍 Using URI as fallback: ${image.uri}`);
            return image.uri;
          }
          if (image.url) {
            let imageUrl = image.url;
            
            // Fix double http:// issue for fallback too
            if (imageUrl.startsWith('http://http://')) {
              imageUrl = imageUrl.replace('http://http://', 'http://');
            }
            
            // Fix old IP addresses for fallback too
            if (imageUrl.includes('192.168.30.116:3000')) {
              const baseUrl = envConfig.BASE_URL.replace('/api', '');
              imageUrl = imageUrl.replace('http://192.168.30.116:3000', baseUrl);
            } else if (imageUrl.includes('192.168.30.116:3000')) {
              const baseUrl = envConfig.BASE_URL.replace('/api', '');
              imageUrl = imageUrl.replace('http://192.168.30.116:3000', baseUrl);
            }
            
            // Check if it has /api in wrong place
            if (imageUrl.includes('/api/uploads/')) {
              // Remove /api from upload URLs
              imageUrl = imageUrl.replace('/api/uploads/', '/uploads/');
              console.log(`🔍 Fixed /api in fallback upload URL: ${image.url} -> ${imageUrl}`);
            }
            
            console.log(`🔍 Using URL as fallback: ${imageUrl}`);
            return imageUrl;
          }
          console.log(`🔍 No fallback URI available`);
          return '';
        })();

        console.log(`🔍 Final image data for ID ${imageId}:`, {
          displayUri,
          fallbackUri,
          originalImage: image
        });

        parts.push({
          type: 'image',
          image: {
            ...image,
            displayUri,
            fallbackUri,
          },
        });

        lastIndex = match.index + match[0].length;
      } else {
        // Image not found for ID
        console.log(`❌ Image not found for ID: ${imageId}`);
        console.log(`📁 Available images:`, imagesArray.map(img => ({ id: img?.id })));
        
        // Still add the placeholder as text so it's visible
        if (match.index > lastIndex) {
          parts.push({
            type: 'text',
            content: parseFormattedText(content.slice(lastIndex, match.index)),
          });
        }
        
        parts.push({
          type: 'text',
          content: `[Gambar tidak ditemukan: ${imageId}]`,
        });
        
        lastIndex = match.index + match[0].length;
      }
    }

    // Add remaining text
    if (lastIndex < content.length) {
      parts.push({
        type: 'text',
        content: parseFormattedText(content.slice(lastIndex)),
      });
    }

    console.log('🔍 Final content parts:', parts);
    console.log('🔍 Content parts count:', parts.length);
    
    return parts;
  };

  const openFullScreenImage = (image) => {
    setFullScreenImage(image.displayUri || image.fallbackUri);
    setShowFullScreenModal(true);
  };

  const handleDelete = async () => {
    if (!window.confirm('Apakah Anda yakin ingin menghapus data POSKAS ini?')) {
      return;
    }

    try {
      await poskasService.deletePoskas(id);
      toast.success('Data POSKAS berhasil dihapus');
      navigate('/owner/keuangan/poskas');
    } catch (error) {
      console.error('Error deleting poskas:', error);
      toast.error('Gagal menghapus data POSKAS');
    }
  };

  if (loading) {
  return (
      <div className="p-6 bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen">
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-12">
          <div className="flex justify-center items-center">
            <div className="text-center">
              <RefreshCw className="h-12 w-12 animate-spin text-red-600 mx-auto mb-4" />
              <p className="text-gray-600 text-lg font-medium">Memuat detail POSKAS...</p>
            </div>
        </div>
      </div>
    </div>
  );
  }

  if (!poskasData) {
    return (
      <div className="p-6 bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen">
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-12">
          <div className="text-center">
            <div className="text-8xl text-gray-300 mb-6">📄</div>
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Data Tidak Ditemukan</h1>
            <p className="text-gray-600 text-lg mb-8">Detail POSKAS tidak dapat dimuat</p>
            <button
              onClick={() => navigate('/owner/keuangan/poskas')}
              className="px-8 py-4 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl font-medium hover:from-red-600 hover:to-red-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              ← Kembali ke Daftar
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border mb-6">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6">
              <button
                onClick={() => navigate('/owner/keuangan/poskas')}
                className="p-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Detail Pos Kas</h1>
                <p className="text-gray-600">Posisi Kas Outlet - Informasi Lengkap</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="px-6 py-3 bg-red-500 text-white rounded-full text-sm font-bold">
                💰 POSKAS
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Information Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-red-100 rounded-lg">
              <Calendar className="h-5 w-5 text-red-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Tanggal Pos Kas</p>
              <p className="text-xl font-bold text-gray-900">{formatDate(poskasData.tanggal_poskas)}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <User className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Dibuat Oleh</p>
              <p className="text-xl font-bold text-gray-900">{poskasData.user_nama || poskasData.admin_nama || poskasData.created_by || 'Admin'}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Clock className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Waktu Input</p>
              <p className="text-xl font-bold text-gray-900">{formatDateTime(poskasData.created_at)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="bg-white rounded-lg shadow-sm border mb-6">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-orange-100 rounded-lg">
              <FileText className="h-5 w-5 text-orange-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Isi Pos Kas</h2>
              <p className="text-gray-600">Detail lengkap posisi kas outlet</p>
            </div>
          </div>
        </div>
        
        <div className="p-6">
          {contentParts && contentParts.length > 0 ? (
            <div className="bg-white p-6 shadow-sm">
              <div className="prose max-w-none">
                {contentParts.map((part, index) => (
                  <div key={index}>
                    {part.type === 'text' ? (
                      <div className="mb-4">
                        <p className="text-gray-800 text-base leading-relaxed whitespace-pre-wrap">
                          {part.content}
                        </p>
                      </div>
                    ) : part.type === 'image' ? (
                      <div className="mb-6">
                        <div className="flex justify-start">
                          <button
                            onClick={() => openFullScreenImage(part.image)}
                            className="cursor-pointer hover:opacity-90 transition-opacity duration-200"
                          >
                            <img
                              src={part.image.displayUri || part.image.fallbackUri}
                              alt="Gambar POSKAS"
                              className="h-auto max-w-full rounded"
                              style={{ 
                                maxHeight: '400px',
                                objectFit: 'contain'
                              }}
                              onLoad={() => {
                                console.log('✅ Image loaded successfully:', part.image.displayUri || part.image.fallbackUri);
                              }}
                              onError={(e) => {
                                console.error('❌ Error loading image:', e.target.src);
                                console.error('🔍 Image data:', part.image);
                                console.error('🔍 Display URI:', part.image.displayUri);
                                console.error('🔍 Fallback URI:', part.image.fallbackUri);
                                e.target.style.display = 'none';
                                
                                // Check if parent already has error placeholder
                                const parent = e.target.parentNode;
                                if (!parent.querySelector('.error-placeholder')) {
                                  // Show error placeholder
                                  const errorDiv = document.createElement('div');
                                  errorDiv.className = 'error-placeholder w-full h-32 flex items-center justify-center text-gray-400 bg-gray-100 rounded-lg';
                                  errorDiv.innerHTML = `
                                    <div class="text-center">
                                      <svg class="h-8 w-8 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                      </svg>
                                      <p class="text-xs text-gray-500">Gambar tidak dapat dimuat</p>
                                      <p class="text-xs text-gray-400">${part.image.displayUri || part.image.fallbackUri || 'No URL'}</p>
                                    </div>
                                  `;
                                  parent.appendChild(errorDiv);
                                }
                              }}
                            />
                          </button>
                        </div>
                      </div>
                    ) : null}
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="text-6xl text-gray-300 mb-4">📄</div>
              <h3 className="text-xl font-semibold text-gray-600 mb-2">Tidak ada konten</h3>
              <p className="text-gray-500">Belum ada data posisi kas yang tersedia</p>
            </div>
          )}
        </div>
      </div>

      {/* Additional Notes */}
      {poskasData.catatan && (
        <div className="bg-white rounded-lg shadow-sm border mb-6">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Info className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900">Catatan Tambahan</h3>
                <p className="text-gray-600">Informasi tambahan terkait posisi kas</p>
              </div>
            </div>
          </div>
          <div className="p-6">
            <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
              <p className="text-blue-900 leading-relaxed">{poskasData.catatan}</p>
            </div>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="flex items-center justify-between">
          <div className="flex space-x-4">
            <button
              onClick={() => navigate('/owner/keuangan/poskas')}
              className="px-6 py-3 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium"
            >
              ← Kembali ke Daftar
            </button>
          </div>
          <div className="flex space-x-4">
            <button
              onClick={() => navigate(`/owner/keuangan/poskas/${id}/edit`)}
              className="flex items-center space-x-2 px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium"
            >
              <Edit className="h-4 w-4" />
              <span>Edit Pos Kas</span>
            </button>
            <button
              onClick={handleDelete}
              className="flex items-center space-x-2 px-6 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors font-medium"
            >
              <Trash2 className="h-4 w-4" />
              <span>Hapus</span>
            </button>
          </div>
        </div>
      </div>

      {/* Full Screen Image Modal */}
      {showFullScreenModal && (
        <div className="fixed inset-0 bg-black bg-opacity-95 z-50 flex items-center justify-center">
          {/* Header */}
          <div className="absolute top-0 left-0 right-0 pt-8 pb-6 px-8 flex items-center justify-between z-10">
            <button
              onClick={() => setShowFullScreenModal(false)}
              className="p-3 bg-black bg-opacity-50 rounded-xl flex justify-center items-center text-white hover:bg-opacity-70 transition-all duration-200 shadow-lg"
            >
              <ArrowLeft className="h-6 w-6" />
            </button>
            <h2 className="text-white font-bold text-xl">Gambar POSKAS</h2>
            <button
              onClick={() => {
                setShowFullScreenModal(false);
                setTimeout(() => setShowFullScreenModal(true), 100);
              }}
              className="p-3 bg-black bg-opacity-50 rounded-xl flex justify-center items-center text-white hover:bg-opacity-70 transition-all duration-200 shadow-lg"
            >
              <RefreshCw className="h-6 w-6" />
            </button>
          </div>

          {/* Image Container */}
          <div className="flex-1 flex items-center justify-center p-8">
            {fullScreenImage && (
              <img
                src={fullScreenImage}
                alt="Gambar POSKAS Full Screen"
                className="max-w-full max-h-full object-contain rounded-xl shadow-2xl"
                style={{
                  maxWidth: '90vw',
                  maxHeight: '90vh',
                  width: 'auto',
                  height: 'auto'
                }}
                                 onError={(error) => {
                  console.error('Error loading full screen image:', error);
                  // Show error message in modal
                  const modal = document.querySelector('.fixed.inset-0');
                  if (modal) {
                    const errorDiv = document.createElement('div');
                    errorDiv.className = 'absolute inset-0 flex items-center justify-center bg-black bg-opacity-95';
                    errorDiv.innerHTML = `
                      <div class="text-center text-white">
                        <svg class="h-16 w-16 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <p class="text-lg font-medium">Gambar tidak dapat dimuat</p>
                        <p class="text-sm text-gray-300 mt-2">URL: ${fullScreenImage}</p>
                      </div>
                    `;
                    modal.appendChild(errorDiv);
                  }
                 }}
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default OwnerPoskasDetail;