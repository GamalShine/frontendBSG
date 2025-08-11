import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { poskasService } from '../../services/poskasService';
import { toast } from 'react-hot-toast';

const PoskasDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [poskas, setPoskas] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchPoskasDetail();
  }, [id]);

  const fetchPoskasDetail = async () => {
    try {
      setLoading(true);
      const response = await poskasService.getPoskasById(id);
      
      if (response.success) {
        console.log('🔍 Debug: Backend response data:', response.data);
        console.log('🔍 Debug: isi_poskas:', response.data.isi_poskas);
        console.log('🔍 Debug: images:', response.data.images);
        
        setPoskas(response.data);
      } else {
        setError(response.message || 'Gagal memuat detail laporan');
        toast.error(response.message || 'Gagal memuat detail laporan');
      }
    } catch (error) {
      console.error('Error fetching poskas detail:', error);
      setError('Terjadi kesalahan saat memuat detail laporan');
      
      if (error.response?.status === 404) {
        toast.error('Laporan tidak ditemukan atau backend server tidak berjalan');
      } else if (error.code === 'ERR_NETWORK') {
        toast.error('Tidak dapat terhubung ke server. Periksa koneksi internet atau status server');
      } else {
        toast.error('Gagal memuat detail laporan: ' + error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const parseImages = (imagesString) => {
    if (!imagesString) {
      console.log('🔍 Debug: parseImages - No imagesString provided');
      return [];
    }
    try {
      console.log('🔍 Debug: parseImages - Input:', imagesString);
      console.log('🔍 Debug: parseImages - Type:', typeof imagesString);
      
      const parsed = JSON.parse(imagesString);
      console.log('🔍 Debug: parseImages - Parsed:', parsed);
      console.log('🔍 Debug: parseImages - Is Array:', Array.isArray(parsed));
      console.log('🔍 Debug: parseImages - Constructor:', parsed?.constructor);
      console.log('🔍 Debug: parseImages - Length:', parsed?.length);
      
      // Check if it's an array-like object or actual array
      let result = [];
      if (Array.isArray(parsed)) {
        result = parsed;
      } else if (parsed && typeof parsed === 'object' && parsed.length !== undefined) {
        // Convert array-like object to array
        result = Array.from(parsed);
      } else if (parsed && typeof parsed === 'object') {
        // If it's a single object, wrap it in array
        result = [parsed];
      }
      
      console.log('🔍 Debug: parseImages - Final result:', result);
      return result;
    } catch (error) {
      console.error('Error parsing images:', error);
      console.log('🔍 Debug: parseImages - Error parsing, returning empty array');
      return [];
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const renderContentWithImages = (text, images) => {
    if (!text) return '';
    let renderedText = text;
    
    console.log('🔍 Debug: renderContentWithImages - Original text:', text);
    console.log('🔍 Debug: renderContentWithImages - Images:', images);
    
    // Check if text contains HTML with base64 images (old format)
    const hasBase64Images = /<img[^>]*src="data:image[^"]*"[^>]*>/g.test(text);
    
    if (hasBase64Images) {
      console.log('🔍 Debug: Found base64 images in text, keeping as is');
      return text; // Keep the original HTML with base64 images
    }
    
    // Check if text contains [IMG:xxx] placeholders (new format)
    // Use a more flexible regex to catch all possible formats
    const placeholderRegex = /\[IMG:([^\]]+)\]/g;
    const placeholders = text.match(placeholderRegex);
    
    console.log('🔍 Debug: Found placeholders:', placeholders);
    
    if (placeholders && placeholders.length > 0) {
      console.log('🔍 Debug: Found placeholders, replacing with images');
      
      // If we have placeholders but no images, show a message
      if (!Array.isArray(images) || images.length === 0) {
        console.log('🔍 Debug: No images available, replacing placeholders with error message');
        placeholders.forEach(placeholder => {
          const errorMsg = '<div class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded my-2">⚠️ Gambar tidak tersedia</div>';
          renderedText = renderedText.replace(placeholder, errorMsg);
        });
      } else {
        // Replace placeholders with actual images
        placeholders.forEach((placeholder, index) => {
          const image = images[index];
          if (image && image.url) {
            console.log('🔍 Debug: Replacing placeholder with image:', image);
            const imgTag = `<img src="http://192.168.1.2:3000${image.url}" alt="Gambar ${index + 1}" class="max-w-full h-auto my-2 rounded-lg shadow-sm" />`;
            renderedText = renderedText.replace(placeholder, imgTag);
          } else {
            console.log('🔍 Debug: No matching image for placeholder:', placeholder);
            const errorMsg = '<div class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded my-2">⚠️ Gambar tidak tersedia</div>';
            renderedText = renderedText.replace(placeholder, errorMsg);
          }
        });
      }
    } else {
      console.log('🔍 Debug: No placeholders found');
    }
    
    console.log('🔍 Debug: Final rendered text:', renderedText);
    return renderedText;
  };

  const handleDelete = async () => {
    if (!window.confirm('Apakah Anda yakin ingin menghapus laporan ini?')) {
      return;
    }

    try {
      const response = await poskasService.deletePoskas(id);
      if (response.success) {
        toast.success('Laporan berhasil dihapus');
        navigate('/poskas');
      } else {
        toast.error(response.message || 'Gagal menghapus laporan');
      }
    } catch (error) {
      console.error('Error deleting poskas:', error);
      toast.error('Terjadi kesalahan saat menghapus laporan: ' + error.message);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  if (error || !poskas) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <h2 className="text-xl font-semibold text-red-800 mb-2">Error</h2>
            <p className="text-red-600 mb-4">{error || 'Laporan tidak ditemukan'}</p>
            <div className="space-x-4">
              <button
                onClick={fetchPoskasDetail}
                className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors"
              >
                Coba Lagi
              </button>
              <button
                onClick={() => navigate('/poskas')}
                className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-colors"
              >
                Kembali ke Daftar
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const images = parseImages(poskas.images);
  const hasImages = Array.isArray(images) && images.length > 0;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-white">
                  Detail Laporan Pos Kas
                </h1>
                <p className="text-blue-100 mt-1">
                  ID: {poskas.id} • {formatDate(poskas.tanggal_poskas)}
                </p>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => navigate('/poskas')}
                  className="px-4 py-2 bg-white bg-opacity-20 text-white rounded-md hover:bg-opacity-30 transition-colors"
                >
                  ← Kembali
                </button>
                <button
                  onClick={() => navigate(`/poskas/${id}/edit`)}
                  className="px-4 py-2 bg-yellow-500 text-white rounded-md hover:bg-yellow-600 transition-colors"
                >
                  Edit
                </button>
                <button
                  onClick={handleDelete}
                  className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors"
                >
                  Hapus
                </button>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            {/* Basic Info */}
            <div className="grid md:grid-cols-2 gap-6 mb-6">
              {hasImages && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">Gambar ({images.length})</h3>
                  <div className="grid grid-cols-2 gap-2">
                    {images.slice(0, 4).map((image, index) => (
                      <div key={index} className="relative">
                        <img
                          src={`http://192.168.1.2:3000${image.url}`}
                          alt={`Gambar ${index + 1}`}
                          className="w-full h-24 object-cover rounded-lg"
                          onError={(e) => {
                            e.target.style.display = 'none';
                            e.target.nextSibling.style.display = 'flex';
                          }}
                        />
                        <div 
                          className="hidden w-full h-24 items-center justify-center text-gray-400 bg-gray-100 rounded-lg"
                          style={{ display: 'none' }}
                        >
                          <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        </div>
                      </div>
                    ))}
                    {images.length > 4 && (
                      <div className="relative">
                        <div className="w-full h-24 bg-gray-100 rounded-lg flex items-center justify-center">
                          <span className="text-gray-500 text-sm">+{images.length - 4} lagi</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Content */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-3">Isi Laporan</h3>
              <div className="bg-gray-50 rounded-lg p-4">
                {/* Display text with proper line breaks and images */}
                <div 
                  className="prose max-w-none whitespace-pre-wrap"
                  dangerouslySetInnerHTML={{ __html: renderContentWithImages(poskas.isi_poskas, images) }}
                />
              </div>
            </div>

            {/* Full Images Gallery */}
            {hasImages && (
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-3">Galeri Gambar</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {images.map((image, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={`http://192.168.1.2:3000${image.url}`}
                        alt={`Gambar ${index + 1}`}
                        className="w-full h-32 object-cover rounded-lg cursor-pointer hover:opacity-75 transition-opacity"
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.nextSibling.style.display = 'flex';
                        }}
                      />
                      <div 
                        className="hidden w-full h-32 items-center justify-center text-gray-400 bg-gray-100 rounded-lg"
                        style={{ display: 'none' }}
                      >
                        <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-200 rounded-lg flex items-center justify-center">
                        <span className="text-white opacity-0 group-hover:opacity-100 transition-opacity text-sm">
                          Gambar {index + 1}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PoskasDetail; 