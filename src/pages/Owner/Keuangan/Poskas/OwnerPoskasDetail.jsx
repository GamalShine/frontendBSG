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
      const response = await poskasService.getOwnerPoskasById(id);

      if (response.success) {
        const poskasData = response.data;
        console.log('🔍 Raw owner poskas data:', poskasData);
        console.log('🔍 Raw images data:', poskasData.images);
        console.log('🔍 Raw images type:', typeof poskasData.images);
        
        setPoskasData(poskasData);
      } else {
        toast.error('Data POSKAS tidak ditemukan');
        navigate('/owner/keuangan/poskas');
      }
    } catch (error) {
      console.error('Error fetching owner poskas detail:', error);
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

  const closeFullScreenModal = () => {
    setShowFullScreenModal(false);
    setFullScreenImage(null);
  };

  const processImages = (images) => {
    if (!images) return [];
    
    console.log('🔍 Processing images input:', images);
    
    // Handle different image data structures
    let processedImages = [];
    
    if (Array.isArray(images)) {
      // If images is already an array
      processedImages = images.map((img, index) => {
        if (typeof img === 'string') {
          // If image is just a string (URL)
          return {
            id: `img-${index}`,
            url: img,
            uri: img,
            name: `image_${index}.jpg`
          };
        } else if (typeof img === 'object') {
          // If image is an object
          return {
            id: img.id || `img-${index}`,
            url: img.url || img.uri || img.path || img,
            uri: img.uri || img.url || img.path || img,
            name: img.name || `image_${index}.jpg`
          };
        }
        return null;
      }).filter(Boolean);
    } else if (typeof images === 'string') {
      // If images is a JSON string
      try {
        const parsedImages = JSON.parse(images);
        if (Array.isArray(parsedImages)) {
          processedImages = parsedImages.map((img, index) => ({
            id: img.id || `img-${index}`,
            url: img.url || img.uri || img.path || img,
            uri: img.uri || img.url || img.path || img,
            name: img.name || `image_${index}.jpg`
          }));
        }
      } catch (e) {
        console.log('🔍 Failed to parse images JSON string:', e);
        // Treat as single image URL
        processedImages = [{
          id: 'img-0',
          url: images,
          uri: images,
          name: 'image.jpg'
        }];
      }
    } else if (images && typeof images === 'object') {
      // If images is a single object
      processedImages = [{
        id: images.id || 'img-0',
        url: images.url || images.uri || images.path || images,
        uri: images.uri || images.url || images.path || images,
        name: images.name || 'image.jpg'
      }];
    }
    
    // Ensure all images have valid URLs
    processedImages = processedImages.filter(img => {
      if (!img.url && !img.uri) {
        console.log('🔍 Filtering out image without URL:', img);
        return false;
      }
      return true;
    });
    
    console.log('🔍 Final processed images:', processedImages);
    return processedImages;
  };

  const renderContentWithImages = (content, images) => {
    if (!content) return [];
    
    console.log('🔍 Rendering content with images:', { content, images });
    
    // Split content by [IMG:id] placeholders
    const parts = [];
    let currentIndex = 0;

    // Find all [IMG:id] patterns
    const imgPattern = /\[IMG:([^\]]+)\]/g;
    let match;

    while ((match = imgPattern.exec(content)) !== null) {
      const fullMatch = match[0];
      const imageId = match[1];
      const matchIndex = match.index;
        
        // Add text before image
      if (matchIndex > currentIndex) {
        const textBefore = content.substring(currentIndex, matchIndex);
        if (textBefore.trim()) {
          parts.push({
            type: 'text',
            content: textBefore
          });
        }
      }
      
      // Find corresponding image
      const image = images.find(img => img.id === imageId);
      if (image) {
        parts.push({
          type: 'image',
          image: image
        });
      } else {
        // If image not found, add placeholder
          parts.push({
            type: 'text',
          content: `[Gambar tidak ditemukan: ${imageId}]`
        });
      }
      
      currentIndex = matchIndex + fullMatch.length;
    }
    
    // Add remaining text after last image
    if (currentIndex < content.length) {
      const remainingText = content.substring(currentIndex);
      if (remainingText.trim()) {
        parts.push({
          type: 'text',
          content: remainingText
        });
      }
    }

    // If no images found, just return the content as text
    if (parts.length === 0) {
      parts.push({
        type: 'text',
        content: content
      });
    }

    console.log('🔍 Content parts:', parts);
    return parts;
  };

  const handleEdit = () => {
    navigate(`/owner/keuangan/poskas/${id}/edit`);
  };

  const handleDelete = async () => {
    if (window.confirm('Apakah Anda yakin ingin menghapus laporan pos kas ini?')) {
    try {
        const response = await poskasService.deleteOwnerPoskas(id);
        if (response.success) {
          toast.success('Laporan pos kas berhasil dihapus');
      navigate('/owner/keuangan/poskas');
        } else {
          toast.error(response.message || 'Gagal menghapus laporan pos kas');
        }
    } catch (error) {
        console.error('Error deleting owner poskas:', error);
        toast.error('Gagal menghapus laporan pos kas');
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
            <div className="text-center">
          <RefreshCw className="h-8 w-8 text-red-500 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Memuat detail pos kas...</p>
        </div>
      </div>
    );
  }

  if (!poskasData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
          <Info className="h-8 w-8 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">Data pos kas tidak ditemukan</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
      {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/owner/keuangan/poskas')}
                className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Detail Pos Kas</h1>
                <p className="text-gray-600">Informasi lengkap posisi kas</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <button
                onClick={handleEdit}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                <Edit className="h-4 w-4" />
                <span>Edit</span>
              </button>
              <button
                onClick={handleDelete}
                className="flex items-center space-x-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
              >
                <Trash2 className="h-4 w-4" />
                <span>Hapus</span>
              </button>
          </div>
        </div>
      </div>

        {/* Content */}
        <div className="space-y-6">
          {/* Basic Info Card */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Informasi Dasar</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-center space-x-3">
                <Calendar className="h-5 w-5 text-gray-400" />
            <div>
                  <p className="text-sm font-medium text-gray-500">Tanggal</p>
                  <p className="text-gray-900">{formatDate(poskasData.tanggal_poskas)}</p>
          </div>
        </div>

          <div className="flex items-center space-x-3">
                <User className="h-5 w-5 text-gray-400" />
            <div>
              <p className="text-sm font-medium text-gray-500">Dibuat Oleh</p>
                  <p className="text-gray-900">
                    {poskasData.user_nama || poskasData.admin_nama || poskasData.created_by || 'Admin'}
                  </p>
          </div>
        </div>

          <div className="flex items-center space-x-3">
                <Clock className="h-5 w-5 text-gray-400" />
            <div>
                  <p className="text-sm font-medium text-gray-500">Dibuat Pada</p>
                  <p className="text-gray-900">{formatDateTime(poskasData.created_at)}</p>
        </div>
      </div>

              {poskasData.updated_at && (
          <div className="flex items-center space-x-3">
                  <Clock className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-500">Diperbarui Pada</p>
                    <p className="text-gray-900">{formatDateTime(poskasData.updated_at)}</p>
                  </div>
            </div>
              )}
            </div>
          </div>

          {/* Content Card */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center space-x-3 mb-4">
              <FileText className="h-5 w-5 text-gray-400" />
              <h2 className="text-lg font-semibold text-gray-900">Isi Pos Kas</h2>
        </div>
        
              <div className="prose max-w-none">
                {contentParts.map((part, index) => (
                  <div key={index}>
                  {part.type === 'text' && (
                    <div 
                      className="whitespace-pre-wrap text-gray-700 leading-relaxed"
                      dangerouslySetInnerHTML={{ __html: part.content }}
                    />
                  )}
                  {part.type === 'image' && (
                    <div className="my-4">
                      <img
                        src={part.image.url}
                        alt={part.image.name}
                        className="max-w-full h-auto rounded-lg shadow-sm cursor-pointer hover:shadow-md transition-shadow"
                        onClick={() => handleImagePress(part.image.url)}
                      />
                      </div>
                  )}
                                    </div>
              ))}
                        </div>
                      </div>

          {/* Images Card */}
          {poskasData.images && poskasData.images.length > 0 && (
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Gambar</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {processImages(poskasData.images).map((image, index) => (
                  <div key={image.id || index} className="relative group">
                    <img
                      src={image.url}
                      alt={image.name}
                      className="w-full h-32 object-cover rounded-lg border border-gray-200 cursor-pointer hover:shadow-md transition-shadow"
                      onClick={() => handleImagePress(image.url)}
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-all duration-200 rounded-lg flex items-center justify-center">
                      <Eye className="h-6 w-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Full Screen Image Modal */}
      {showFullScreenModal && fullScreenImage && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-4"
          onClick={closeFullScreenModal}
        >
          <div className="relative max-w-4xl max-h-full">
            <img
              src={fullScreenImage}
              alt="Full screen"
              className="max-w-full max-h-full object-contain"
            />
            <button
              onClick={closeFullScreenModal}
              className="absolute top-4 right-4 bg-white bg-opacity-20 hover:bg-opacity-30 text-white rounded-full p-2 transition-all"
            >
              ×
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default OwnerPoskasDetail;