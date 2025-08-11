import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { poskasService } from '../../services/poskasService';
import { toast } from 'react-hot-toast';

const PoskasDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
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
        console.log(`✅ Image found for ID ${imageId}:`, image.name);
        
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
            displayUri: image.url || image.uri || '',
            fallbackUri: image.uri || image.url || '',
          },
        });

        lastIndex = match.index + match[0].length;
      } else {
        // Image not found for ID
        console.log(`❌ Image not found for ID: ${imageId}`);
        console.log(`📁 Available images:`, imagesArray.map(img => ({ id: img?.id, name: img?.name })));
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

  if (loading) {
    return (
      <div className="flex-1 bg-gray-50 flex justify-center items-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto"></div>
          <p className="text-gray-600 mt-4">Memuat detail POSKAS...</p>
        </div>
      </div>
    );
  }

  if (!poskasData) {
    return (
      <div className="flex-1 bg-gray-50 flex justify-center items-center min-h-screen">
        <div className="text-center">
          <div className="text-6xl text-gray-400 mb-4">📄</div>
          <h1 className="text-xl font-bold text-gray-900 mb-2">Data Tidak Ditemukan</h1>
          <p className="text-gray-600 mb-6">Detail POSKAS tidak dapat dimuat</p>
          <button
            onClick={() => navigate('/poskas')}
            className="bg-red-500 px-6 py-3 rounded-lg text-white font-medium hover:bg-red-600 transition-colors"
          >
            Kembali
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between max-w-4xl mx-auto">
          <button
            onClick={() => navigate('/poskas')}
            className="w-10 h-10 bg-gray-100 rounded-full flex justify-center items-center hover:bg-gray-200 transition-colors"
          >
            ←
          </button>
          <h1 className="text-xl font-bold text-gray-900">Detail POSKAS</h1>
          <div className="w-10"></div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto">
        {/* Transaction Summary Card */}
        <div className="mx-6 mt-6 bg-red-600 rounded-2xl shadow-sm border border-red-300">
          <div className="p-6">
            <h2 className="text-lg font-bold text-white mb-2">POSISI KAS OUTLET</h2>
            <p className="text-white">{formatDate(poskasData.tanggal_poskas)}</p>
          </div>
        </div>

        {/* Detail Information */}
        <div className="p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Informasi Detail</h2>

          <div className="space-y-4">
            <div className="flex justify-between py-2 border-b border-gray-100">
              <span className="text-gray-600">Tanggal</span>
              <span className="text-gray-900 font-medium">{formatDate(poskasData.tanggal_poskas)}</span>
            </div>

            <div className="flex justify-between py-2 border-b border-gray-100">
              <span className="text-gray-600">Dibuat oleh</span>
              <span className="text-gray-900 font-medium">{poskasData.admin_nama || 'Admin'}</span>
            </div>

            <div className="flex justify-between py-2">
              <span className="text-gray-600">Waktu Input</span>
              <span className="text-gray-900 font-medium">{formatDateTime(poskasData.created_at)}</span>
            </div>
          </div>
        </div>

        {/* Isi POSKAS Section - sama seperti admin */}
        <div className="p-6 border-t border-gray-400">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Isi POSKAS</h2>
          <div className="w-full min-h-[120px]">
            {contentParts && contentParts.length > 0 ? (
              <div className="w-full">
                {contentParts.map((part, index) => (
                  <div key={index}>
                    {part.type === 'text' ? (
                      <p className="text-gray-800 text-sm leading-5 mb-4 whitespace-pre-wrap">
                        {part.content}
                      </p>
                    ) : part.type === 'image' ? (
                      <div className="w-full mb-4">
                        <button
                          onClick={() => openFullScreenImage(part.image)}
                          className="w-full cursor-pointer hover:opacity-90 transition-opacity"
                        >
                          <img
                            src={part.image.displayUri || part.image.fallbackUri}
                            alt={part.image.name || 'Gambar POSKAS'}
                            className="w-full mx-auto"
                            style={{
                              height: 'auto',
                            }}
                            onError={(e) => {
                              console.error('Error loading image:', e);
                              e.target.style.display = 'none';
                            }}
                          />
                        </button>
                        <div className="mt-2 flex items-center justify-center w-full">
                          <span className="text-gray-500 text-xs">🔍 Klik untuk tampilkan full screen</span>
                        </div>
                      </div>
                    ) : null}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-sm">Tidak ada konten</p>
            )}
          </div>
        </div>

        {/* Additional Notes */}
        {poskasData.catatan && (
          <div className="mx-6 mb-6 bg-blue-50 rounded-2xl border border-blue-200">
            <div className="p-6">
              <div className="flex items-center mb-3">
                <span className="text-blue-600 text-xl mr-2">ℹ️</span>
                <h3 className="text-blue-900 font-bold">Catatan Tambahan</h3>
              </div>
              <p className="text-blue-800 leading-6">{poskasData.catatan}</p>
            </div>
          </div>
        )}
      </div>

      {/* Full Screen Image Modal - sama seperti admin */}
      {showFullScreenModal && (
        <div className="fixed inset-0 bg-black z-50 flex items-center justify-center">
          {/* Header */}
          <div className="absolute top-0 left-0 right-0 pt-12 pb-4 px-4 flex items-center justify-between z-10">
            <button
              onClick={() => setShowFullScreenModal(false)}
              className="w-10 h-10 bg-black bg-opacity-50 rounded-full flex justify-center items-center text-white hover:bg-opacity-70 transition-colors"
            >
              ✕
            </button>
            <h2 className="text-white font-bold text-lg">Gambar POSKAS</h2>
            <button
              onClick={() => {
                // Reset zoom to center
                setShowFullScreenModal(false);
                setTimeout(() => setShowFullScreenModal(true), 100);
              }}
              className="w-10 h-10 bg-black bg-opacity-50 rounded-full flex justify-center items-center text-white hover:bg-opacity-70 transition-colors"
            >
              🔄
            </button>
          </div>

          {/* Image Container */}
          <div className="flex-1 flex items-center justify-center p-4">
            {fullScreenImage && (
              <img
                src={fullScreenImage}
                alt="Gambar POSKAS Full Screen"
                className="max-w-full max-h-full object-contain"
                style={{
                  width: '100%',
                  height: '100%',
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