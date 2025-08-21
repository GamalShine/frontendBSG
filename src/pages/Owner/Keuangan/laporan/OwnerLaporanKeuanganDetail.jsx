import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../../../../contexts/AuthContext';
import { laporanKeuanganService } from '../../../../services/laporanKeuanganService';
import { toast } from 'react-hot-toast';
import { getEnvironmentConfig } from '../../../../config/environment';
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

const OwnerLaporanKeuanganDetail = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { user } = useAuth();
  const envConfig = getEnvironmentConfig();
  
  const [laporanData, setLaporanData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [fullScreenImage, setFullScreenImage] = useState(null);
  const [showFullScreenModal, setShowFullScreenModal] = useState(false);
  const [contentParts, setContentParts] = useState([]);

  useEffect(() => {
    if (id) {
      loadLaporanKeuangan();
    }
  }, [id]);

  // Process images and content when laporanData changes
  useEffect(() => {
    if (laporanData) {
      const processedImages = processImages(laporanData.images);
      console.log('🔍 Final processed images:', processedImages);
      
      const parts = renderContentWithImages(
        laporanData.isi_laporan,
        processedImages
      );
      
      setContentParts(parts);
    }
  }, [laporanData]);

  const loadLaporanKeuangan = async () => {
    try {
      setLoading(true);
      const response = await laporanKeuanganService.getLaporanKeuanganById(id);
      
      if (response.success && response.data) {
        setLaporanData(response.data);
      } else {
        toast.error('Gagal memuat data laporan keuangan');
        navigate('/owner/keuangan/laporan');
      }
    } catch (error) {
      console.error('Error loading laporan keuangan:', error);
      toast.error('Gagal memuat data laporan keuangan');
      navigate('/owner/keuangan/laporan');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Apakah Anda yakin ingin menghapus data laporan keuangan ini?')) {
      return;
    }

    try {
      await laporanKeuanganService.deleteLaporanKeuangan(id);
      toast.success('Data laporan keuangan berhasil dihapus');
      navigate('/owner/keuangan/laporan');
    } catch (error) {
      console.error('Error deleting laporan keuangan:', error);
      toast.error('Gagal menghapus data laporan keuangan');
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
      minute: '2-digit'
    });
  };

  // Helper function to safely process images
  const processImages = (images) => {
    if (!images) return [];
    
    let processedImages = [];
    
    if (typeof images === 'string') {
      try {
        processedImages = JSON.parse(images);
        console.log('🔍 Successfully parsed images string:', processedImages);
      } catch (error) {
        console.error('Error parsing images JSON:', error);
        // If JSON parsing fails, try to treat it as a single image URL
        if (images.trim()) {
          processedImages = [{ url: images, name: images.split('/').pop() || 'image' }];
          console.log('🔍 Treated string as single image URL:', processedImages);
        } else {
          return [];
        }
      }
    } else if (Array.isArray(images)) {
      processedImages = images;
      console.log('🔍 Images is already an array');
    } else if (typeof images === 'object' && images !== null) {
      // If it's a single object, wrap it in an array
      processedImages = [images];
      console.log('🔍 Single object wrapped in array');
    } else {
      console.warn('⚠️ Unknown images format:', typeof images);
      return [];
    }
    
    // Ensure it's always an array
    if (!Array.isArray(processedImages)) {
      if (processedImages && typeof processedImages === 'object' && processedImages !== null) {
        processedImages = [processedImages];
        console.log('🔍 Converted single object to array');
      } else {
        console.warn('⚠️ Invalid images data, returning empty array');
        return [];
      }
    }
    
         // Fix URLs for all images
     return processedImages.map(img => {
       if (img && img.url) {
         let fixedUrl = img.url;
         
         // Fix double http:// issue
         if (fixedUrl.startsWith('http://http://')) {
           fixedUrl = fixedUrl.replace('http://http://', 'http://');
           console.log(`🔍 Fixed double http:// in detail: ${img.url} -> ${fixedUrl}`);
         }
         
         // Fix old IP addresses and localhost issues
         if (fixedUrl.includes('192.168.30.124:3000')) {
           const baseUrl = envConfig.BASE_URL.replace('/api', '');
           fixedUrl = fixedUrl.replace('http://192.168.30.124:3000', baseUrl);
           console.log(`🔍 Fixed old IP in detail: ${img.url} -> ${fixedUrl}`);
         } else if (fixedUrl.includes('192.168.30.124:3000')) {
           const baseUrl = envConfig.BASE_URL.replace('/api', '');
           fixedUrl = fixedUrl.replace('http://192.168.30.124:3000', baseUrl);
           console.log(`🔍 Fixed old IP in detail: ${img.url} -> ${fixedUrl}`);
         } else if (fixedUrl.includes('localhost:5173')) {
           // Fix localhost:5173 to use backend URL
           const baseUrl = envConfig.BASE_URL.replace('/api', '');
           fixedUrl = fixedUrl.replace('http://localhost:5173', baseUrl);
           console.log(`🔍 Fixed localhost:5173 in detail: ${img.url} -> ${fixedUrl}`);
         } else if (fixedUrl.startsWith('/uploads/')) {
           // If URL starts with /uploads/, add the backend base URL
           const baseUrl = envConfig.BASE_URL.replace('/api', '');
           fixedUrl = `${baseUrl}${fixedUrl}`;
           console.log(`🔍 Fixed relative upload URL in detail: ${img.url} -> ${fixedUrl}`);
         }
         
         return { ...img, url: fixedUrl };
       }
       return img;
     });
  };

  // Render content with images inline
  const renderContentWithImages = (content, images = []) => {
    if (!content) return [];
    
    const parts = [];
    const lines = content.split('\n');
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      
      // Check if line contains image placeholder
      const imgMatch = line.match(/\[IMG:(\d+)\]/);
      if (imgMatch) {
        const imageId = parseInt(imgMatch[1]);
        const image = images.find(img => img.id === imageId);
        
        if (image) {
          parts.push({
            type: 'image',
            data: image
          });
        }
      } else {
        parts.push({
          type: 'text',
          data: line
        });
      }
    }
    
    return parts;
  };

  const openFullScreenImage = (imageUrl) => {
    setFullScreenImage(imageUrl);
    setShowFullScreenModal(true);
  };

  const closeFullScreenModal = () => {
    setShowFullScreenModal(false);
    setFullScreenImage(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-red-500"></div>
      </div>
    );
  }

  if (!laporanData) {
    return (
      <div className="p-6">
        <div className="text-center">
          <p className="text-gray-500">Data laporan keuangan tidak ditemukan</p>
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
                onClick={() => navigate('/owner/keuangan/laporan')}
                className="inline-flex items-center space-x-2 text-gray-600 hover:text-gray-900"
              >
                <ArrowLeft className="h-5 w-5" />
                <span>Kembali</span>
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Detail Laporan Keuangan</h1>
                <p className="text-gray-600">Informasi lengkap laporan keuangan</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => navigate(`/owner/keuangan/laporan/${id}/edit`)}
                className="inline-flex items-center space-x-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                <Edit className="h-4 w-4" />
                <span>Edit</span>
              </button>
              <button
                onClick={handleDelete}
                className="inline-flex items-center space-x-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
              >
                <Trash2 className="h-4 w-4" />
                <span>Hapus</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Summary Card */}
      <div className="bg-white rounded-lg shadow-sm border mb-6">
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Calendar className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Tanggal Laporan</p>
                <p className="text-lg font-semibold text-gray-900">{formatDate(laporanData.tanggal_laporan)}</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <User className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Dibuat Oleh</p>
                <p className="text-lg font-semibold text-gray-900">{laporanData.user_nama || 'Unknown'}</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Clock className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Dibuat Pada</p>
                <p className="text-lg font-semibold text-gray-900">{formatDateTime(laporanData.created_at)}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="bg-white rounded-lg shadow-sm border mb-6">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Isi Laporan</h2>
        </div>
        <div className="p-6">
          <div className="prose max-w-none">
            {contentParts.map((part, index) => (
              <div key={index}>
                {part.type === 'image' ? (
                  <div className="my-4">
                    <img
                      src={part.data.url}
                      alt={part.data.name || 'Laporan Keuangan Image'}
                      className="max-w-full h-auto rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
                      onClick={() => openFullScreenImage(part.data.url)}
                      onError={(e) => {
                        console.error(`❌ Failed to load content image:`, part.data.url);
                        e.target.style.border = '2px solid red';
                        e.target.style.backgroundColor = '#fee';
                        e.target.alt = 'Gambar gagal dimuat';
                      }}
                    />
                  </div>
                ) : (
                  <div className="whitespace-pre-wrap font-sans text-sm leading-relaxed">
                    {part.data}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Images Gallery */}
      {laporanData.images && processImages(laporanData.images).length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border mb-6">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Galeri Gambar</h2>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {processImages(laporanData.images).map((image, index) => (
                <div key={index} className="relative group">
                  <img
                    src={image.url}
                    alt={image.name || `Image ${index + 1}`}
                    className="w-full h-32 object-cover rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
                    onClick={() => openFullScreenImage(image.url)}
                    onError={(e) => {
                      console.error(`❌ Failed to load image ${index + 1}:`, image.url);
                      e.target.style.border = '2px solid red';
                      e.target.style.backgroundColor = '#fee';
                      e.target.alt = 'Gambar gagal dimuat';
                    }}
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-200 rounded-lg flex items-center justify-center">
                    <ImageIcon className="h-8 w-8 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Full Screen Image Modal */}
      {showFullScreenModal && fullScreenImage && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
          <div className="relative max-w-4xl max-h-full p-4">
            <button
              onClick={closeFullScreenModal}
              className="absolute top-4 right-4 text-white hover:text-gray-300 z-10"
            >
              <X className="h-8 w-8" />
            </button>
            <img
              src={fullScreenImage}
              alt="Full Screen"
              className="max-w-full max-h-full object-contain"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default OwnerLaporanKeuanganDetail; 