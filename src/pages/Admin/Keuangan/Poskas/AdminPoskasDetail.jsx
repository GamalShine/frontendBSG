import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../../contexts/AuthContext';
import { poskasService } from '../../../../services/poskasService';
import { toast } from 'react-hot-toast';
import { ArrowLeft, Calendar, User, Clock, FileText, RefreshCw, Edit, Trash2, Info, MoreVertical, X } from 'lucide-react';
import { MENU_CODES } from '@/config/menuCodes';
import { getEnvironmentConfig } from '../../../../config/environment';

const AdminPoskasDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const envConfig = getEnvironmentConfig();
  
  const [poskasData, setPoskasData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [fullScreenImage, setFullScreenImage] = useState(null);
  const [showFullScreenModal, setShowFullScreenModal] = useState(false);
  const [contentParts, setContentParts] = useState([]);
  const [showActionMenu, setShowActionMenu] = useState(false);

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
        navigate('/admin/keuangan/poskas');
      }
    } catch (error) {
      console.error('Error fetching poskas detail:', error);
      toast.error('Gagal memuat detail POSKAS');
      navigate('/admin/keuangan/poskas');
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
    
    // Normalize image URLs
    return imagesArray.map(image => {
      if (image && image.url) {
        let fixedUrl = image.url;
        
        // Fix double http:// issue
        if (fixedUrl.startsWith('http://http://')) {
          fixedUrl = fixedUrl.replace('http://http://', 'http://');
          console.log(`🔍 Fixed double http:// URL: ${image.url} -> ${fixedUrl}`);
        }
        
        // Remove /api from upload URLs
        if (fixedUrl.includes('/api/uploads/')) {
          fixedUrl = fixedUrl.replace('/api/uploads/', '/uploads/');
          console.log(`🔍 Fixed /api in upload URL: ${image.url} -> ${fixedUrl}`);
        }
        
        // Make relative URLs absolute using env base
        if (!fixedUrl.startsWith('http') && !fixedUrl.startsWith('data:')) {
          const baseUrl = envConfig.BASE_URL.replace('/api', '');
          fixedUrl = `${baseUrl}${fixedUrl.startsWith('/') ? '' : '/'}${fixedUrl}`;
          console.log(`🔍 Made URL absolute: ${image.url} -> ${fixedUrl}`);
        }
        
        const processedImg = { ...image, url: fixedUrl };
        console.log('🔍 Processed image object:', processedImg);
        return processedImg;
      }
      return image;
    });
  };

  const parseFormattedText = (text) => {
    if (!text) return '';
    let html = String(text);
    // Convert markdown-like markers to HTML
    html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
    html = html.replace(/(^|[^*])\*(?!\s)([^*]+?)\*(?!\*)/g, (m, p1, p2) => `${p1}<em>${p2}</em>`);
    html = html.replace(/__(.+?)__/g, '<u>$1</u>');
    // Preserve line breaks
    html = html.replace(/\n/g, '<br>');
    // Basic sanitize
    html = html.replace(/<script.*?>[\s\S]*?<\/script>/gi, '');
    return html;
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
            
            // Remove /api from upload URLs
            if (imageUrl.includes('/api/uploads/')) {
              imageUrl = imageUrl.replace('/api/uploads/', '/uploads/');
              console.log(`🔍 Fixed /api in upload URL: ${image.url} -> ${imageUrl}`);
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
            
            // Remove /api from upload URLs for fallback too
            if (imageUrl.includes('/api/uploads/')) {
              imageUrl = imageUrl.replace('/api/uploads/', '/uploads/');
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
      navigate('/admin/keuangan/poskas');
    } catch (error) {
      console.error('Error deleting poskas:', error);
      toast.error('Gagal menghapus data POSKAS');
    }
  };

  if (loading) {
    return (
      <div className="p-0 bg-gray-50 min-h-screen">
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="p-8 text-center">
            <RefreshCw className="h-8 w-8 animate-spin text-green-500 mx-auto mb-4" />
            <p className="text-gray-600">Memuat data...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!poskasData) {
    return (
      <div className="p-0 bg-gray-50 min-h-screen">
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="p-8 text-center">
            <div className="text-6xl text-gray-300 mb-4">📄</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Data tidak ditemukan</h3>
            <p className="text-gray-500 mb-4">Detail POSKAS yang Anda cari tidak ditemukan</p>
            <button
              onClick={() => navigate('/admin/keuangan/poskas')}
              className="inline-flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
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
    <div className="p-0 bg-gray-50 min-h-screen">
      {/* Header - match list style */}
      <div className="bg-red-800 text-white px-6 py-4 mb-4 relative">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span className="text-sm font-semibold bg-white/10 rounded px-2 py-1">{MENU_CODES.keuangan.poskas}</span>
            <div>
              <h1 className="text-xl md:text-2xl font-extrabold tracking-tight">POSKAS</h1>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {/* Mobile: tombol EDIT ikon saja, Desktop: tombol KEMBALI */}
            <button
              onClick={() => navigate(`/admin/keuangan/poskas/${id}/edit`)}
              className="lg:hidden inline-flex items-center justify-center h-9 w-9 rounded-full border border-white/60 text-white hover:bg-white/10"
              aria-label="Edit"
              title="Edit"
            >
              <Edit className="h-4 w-4" />
            </button>
            <button
              onClick={() => navigate('/admin/keuangan/poskas')}
              className="hidden lg:inline-flex px-4 py-2 rounded-full border border-white/60 text-white hover:bg-white/10"
            >
              KEMBALI
            </button>
            <div className="relative flex items-center gap-2">
              {/* Mobile: X untuk menutup halaman detail */}
              <button
                onClick={() => navigate('/admin/keuangan/poskas')}
                aria-label="Tutup"
                title="Tutup"
                className="lg:hidden inline-flex items-center justify-center h-9 w-9 rounded-full border border-white/60 text-white/90 hover:bg-white/10"
              >
                <X className="h-4 w-4" />
              </button>
              {/* Desktop: kebab untuk toggle menu aksi */}
              <button
                onClick={() => setShowActionMenu(v => !v)}
                aria-label="Aksi"
                className="hidden lg:inline-flex items-center justify-center h-9 w-9 rounded-full border border-white/60 text-white/90 hover:bg-white/10"
              >
                <MoreVertical className="h-4 w-4" />
              </button>
              {showActionMenu && (
                <div className="absolute right-0 mt-2 w-44 bg-white text-gray-800 rounded-lg shadow-lg border border-gray-200 z-20">
                  <div className="py-1">
                    <button
                      onClick={() => { setShowActionMenu(false); navigate(`/admin/keuangan/poskas/${id}/edit`); }}
                      className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50 flex items-center gap-2"
                    >
                      <Edit className="h-4 w-4 text-blue-600" />
                      <span>Edit</span>
                    </button>
                    <button
                      onClick={() => { setShowActionMenu(false); handleDelete(); }}
                      className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50 flex items-center gap-2 text-red-600"
                    >
                      <Trash2 className="h-4 w-4" />
                      <span>Hapus</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Information Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <div className="bg-white rounded-lg shadow-sm border p-3">
          <div className="flex items-center space-x-3">
            <div className="p-1 bg-red-100 rounded-lg">
              <Calendar className="h-4 w-4 text-red-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Tanggal Pos Kas</p>
              <p className="text-lg font-semibold text-gray-900">{formatDate(poskasData.tanggal_poskas)}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-3">
          <div className="flex items-center space-x-3">
            <div className="p-1 bg-blue-100 rounded-lg">
              <User className="h-4 w-4 text-blue-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Dibuat Oleh</p>
              <p className="text-lg font-semibold text-gray-900">{poskasData.user_nama || poskasData.admin_nama || poskasData.created_by || 'Admin'}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-3">
          <div className="flex items-center space-x-3">
            <div className="p-1 bg-purple-100 rounded-lg">
              <Clock className="h-4 w-4 text-purple-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Waktu Input</p>
              <p className="text-lg font-semibold text-gray-900">{formatDateTime(poskasData.created_at)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="bg-white rounded-lg shadow-sm border mb-4">
        <div className="p-3">
          {contentParts && contentParts.length > 0 ? (
            <div className="bg-white p-0">
              <div className="prose max-w-none">
                {contentParts.map((part, index) => (
                  <div key={index}>
                    {part.type === 'text' ? (
                      <div className="mb-3">
                        <div
                          className="text-gray-700 text-base leading-relaxed whitespace-pre-wrap"
                          dangerouslySetInnerHTML={{ __html: part.content }}
                        />
                      </div>
                    ) : part.type === 'image' ? (
                      <div className="my-2">
                        <div className="flex justify-start">
                          <button
                            onClick={() => openFullScreenImage(part.image)}
                            className="cursor-pointer hover:opacity-90 transition-opacity duration-200"
                          >
                            <img
                              src={part.image.displayUri || part.image.fallbackUri}
                              alt="Gambar POSKAS"
                              className="h-auto max-w-full rounded-lg border"
                              style={{ 
                                maxHeight: '500px',
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
        <div className="bg-white rounded-lg shadow-sm border mb-4">
          <div className="p-3 border-b border-gray-200">
            <div className="flex items-center space-x-3">
              <div className="p-1 bg-blue-100 rounded-lg">
                <Info className="h-4 w-4 text-blue-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Catatan Tambahan</h3>
                <p className="text-gray-500">Informasi tambahan terkait posisi kas</p>
              </div>
            </div>
          </div>
          <div className="p-3">
            <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
              <p className="text-blue-900 leading-relaxed">{poskasData.catatan}</p>
            </div>
          </div>
        </div>
      )}

      {/* Action Buttons moved into header kebab menu */}

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

export default AdminPoskasDetail;