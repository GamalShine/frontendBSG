import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { omsetHarianService } from '../../services/omsetHarianService';
import { toast } from 'react-hot-toast';
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
      const processedImages = processImages(omsetData.images);
      console.log('🔍 Final processed images:', processedImages);
      
      const parts = renderContentWithImages(
        omsetData.isi_omset,
        processedImages
      );
      
      setContentParts(parts);
    }
  }, [omsetData]);

  const loadOmsetHarian = async () => {
    try {
      setLoading(true);
      const response = await omsetHarianService.getOmsetHarianById(id);
      
      if (response.success && response.data) {
        setOmsetData(response.data);
      } else {
        toast.error('Gagal memuat data omset harian');
        navigate('/keuangan/omset-harian');
      }
    } catch (error) {
      console.error('Error loading omset harian:', error);
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

  // Render content with images inline
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
        console.log(`✅ Image found for ID ${imageId}:`, image.filename || image.name);
        
        // Add text before image
        if (match.index > lastIndex) {
          parts.push({
            type: 'text',
            content: parseFormattedText(content.slice(lastIndex, match.index)),
          });
        }

        // Add image with complete server URL - handle both relative and absolute URLs
        let imageUrl = '';
        if (image.url) {
          if (image.url.startsWith('http')) {
            // Already absolute URL
            imageUrl = image.url;
          } else {
            // Relative URL, add base URL
            const baseUrl = 'http://192.168.1.2:3000';
            imageUrl = `${baseUrl}${image.url}`;
          }
        }
        
        parts.push({
          type: 'image',
          image: {
            ...image,
            // Use complete server URL
            displayUri: imageUrl,
            fallbackUri: imageUrl,
          },
        });

        lastIndex = match.index + match[0].length;
      } else {
        // Image not found for ID
        console.log(`❌ Image not found for ID: ${imageId}`);
        console.log(`📁 Available images:`, imagesArray.map(img => ({ id: img?.id, name: img?.filename || img?.name })));
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
    // Handle both relative and absolute URLs
    let imageUrl = '';
    if (image.url) {
      if (image.url.startsWith('http')) {
        // Already absolute URL
        imageUrl = image.url;
      } else {
        // Relative URL, add base URL
        const baseUrl = 'http://192.168.1.2:3000';
        imageUrl = `${baseUrl}${image.url}`;
      }
    } else {
      imageUrl = image.displayUri || image.fallbackUri;
    }
    
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
                          e.target.style.display = 'none';
                        }}
                      />
                      <p className="text-sm text-gray-500 mt-2 italic">
                        {part.image.filename || part.image.name || 'Gambar omset'}
                      </p>
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