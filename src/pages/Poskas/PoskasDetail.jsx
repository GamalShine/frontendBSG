import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { poskasService } from '../../services/poskasService';
import { toast } from 'react-hot-toast';
import { ArrowLeft, Calendar, User, Clock, FileText, Eye, RefreshCw, Edit, Trash2, Info } from 'lucide-react';
import { getEnvironmentConfig } from '../../config/environment';

const PoskasDetail = () => {
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
      const processedImages = processImages(poskasData.images);
      console.log('🔍 Final processed images:', processedImages);
      
      const parts = renderContentWithImages(
        poskasData.isi_poskas,
        processedImages
      );
      
      setContentParts(parts);
    }
  }, [poskasData]);

  const fetchPoskasDetail = async () => {
    try {
      setLoading(true);
      const response = await poskasService.getPoskasById(id);

      if (response.success) {
        setPoskasData(response.data);
      } else {
        toast.error('Data POSKAS tidak ditemukan');
        navigate('/poskas');
      }
    } catch (error) {
      console.error('Error fetching poskas detail:', error);
      toast.error('Gagal memuat detail POSKAS');
      navigate('/poskas');
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
    if (!images) return [];
    if (typeof images === 'string') {
      try {
        return JSON.parse(images);
      } catch (error) {
        console.error('Error parsing images JSON:', error);
        return [];
      }
    }
    return Array.isArray(images) ? images : [];
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
    
    if (!content) return null;

    // Ensure images is an array and process if it's a string
    let imagesArray = [];
    if (typeof images === 'string') {
      try {
        imagesArray = JSON.parse(images);
      } catch (error) {
        console.error('❌ Error parsing images in renderContentWithImages:', error);
        imagesArray = [];
      }
    } else if (Array.isArray(images)) {
      imagesArray = images;
    }
    console.log('🔍 imagesArray:', imagesArray);

    const parts = [];
    let lastIndex = 0;

    // Find all image tags
    const imageRegex = /\[IMG:(\d+)\]/g;
    let match;

    while ((match = imageRegex.exec(content)) !== null) {
      const imageId = parseInt(match[1]);
      console.log(`🔍 Found image tag: [IMG:${imageId}]`);
      
      const image = imagesArray.find((img) => img && img.id === imageId);
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
        parts.push({
          type: 'image',
          image: {
            ...image,
            // Use server URL if available, otherwise fallback to local URI
            displayUri: (() => {
              if (image.url) {
                if (image.url.startsWith('http')) {
                  // Already absolute URL
                  return image.url;
                } else {
                  // Relative URL, add base URL
                  return `${envConfig.BASE_URL}${image.url}`;
                }
              }
              return image.uri || '';
            })(),
            fallbackUri: image.uri || image.url || '',
          },
        });

        lastIndex = match.index + match[0].length;
      } else {
        // Image not found for ID
        console.log(`❌ Image not found for ID: ${imageId}`);
        console.log(`📁 Available images:`, imagesArray.map(img => ({ id: img?.id })));
      }
    }

    // Add remaining text
    if (lastIndex < content.length) {
      parts.push({
        type: 'text',
        content: parseFormattedText(content.slice(lastIndex)),
      });
    }

    console.log('🔍 Final parts:', parts);
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
      navigate('/poskas');
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
              onClick={() => navigate('/poskas')}
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
                onClick={() => navigate('/poskas')}
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
                              onError={(e) => {
                                console.error('Error loading image:', e);
                                e.target.style.display = 'none';
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
              onClick={() => navigate('/poskas')}
              className="px-6 py-3 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium"
            >
              ← Kembali ke Daftar
            </button>
          </div>
          <div className="flex space-x-4">
            <button
              onClick={() => navigate(`/poskas/${id}/edit`)}
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
                }}
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default PoskasDetail; 