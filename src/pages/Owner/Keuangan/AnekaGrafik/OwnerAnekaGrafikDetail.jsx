import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../../../../contexts/AuthContext';
import { anekaGrafikService } from '../../../../services/anekaGrafikService';
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

const OwnerAnekaGrafikDetail = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { user } = useAuth();
  const envConfig = getEnvironmentConfig();
  
  const [anekaGrafikData, setAnekaGrafikData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [fullScreenImage, setFullScreenImage] = useState(null);
  const [showFullScreenModal, setShowFullScreenModal] = useState(false);
  const [processedImages, setProcessedImages] = useState([]);

  useEffect(() => {
    if (id) {
      loadAnekaGrafik();
    }
  }, [id]);

  useEffect(() => {
    if (anekaGrafikData) {
      console.log('🔍 🔍 🔍 ANEKA GRAFIK DATA LOADED:', anekaGrafikData);
      console.log('🔍 🔍 🔍 Images field:', anekaGrafikData.images);
      console.log('🔍 🔍 🔍 Images field type:', typeof anekaGrafikData.images);
      console.log('🔍 🔍 🔍 Environment config:', envConfig);
      console.log('🔍 🔍 🔍 API_BASE_URL:', envConfig.API_BASE_URL);
      
      let processedImages = [];
      if (anekaGrafikData.images) {
        try {
          processedImages = cleanupCorruptedImages(anekaGrafikData.images);
          console.log('🔍 Cleaned images from AnekaGrafikDetail:', processedImages);
          
          if (Array.isArray(processedImages)) {
            processedImages = processedImages.map(img => {
              console.log('🔍 Processing image object:', img);
              
              let imageUrl = img.url;
              if (!imageUrl && img.serverPath) {
                const baseUrl = envConfig.API_BASE_URL.replace('/api', '');
                const cleanServerPath = img.serverPath.startsWith('/') ? img.serverPath.slice(1) : img.serverPath;
                imageUrl = `${baseUrl}/${cleanServerPath}`;
                console.log('🔍 Constructed URL from serverPath:', imageUrl);
              }
              
              if (imageUrl) {
                imageUrl = constructImageUrl(imageUrl);
                console.log('🔍 Cleaned image URL:', imageUrl);
              }
              
              const processedImg = {
                uri: img.uri || `file://temp/${img.id}.jpg`,
                id: img.id,
                name: img.name || `aneka_grafik_${img.id}.jpg`,
                url: imageUrl || `${envConfig.API_BASE_URL.replace('/api', '')}/uploads/aneka-grafik/temp_${img.id}.jpg`,
                serverPath: img.serverPath || `uploads/aneka-grafik/temp_${img.id}.jpg`
              };
              
              console.log('🔍 Processed image object:', processedImg);
              return processedImg;
            });
          }
        } catch (error) {
          console.error('Error parsing existing images:', error);
          processedImages = [];
        }
      }
      
      setProcessedImages(processedImages);
      
      let displayContent = anekaGrafikData.isi_grafik || '';
      if (Array.isArray(processedImages) && processedImages.length > 0) {
        processedImages.forEach((image, index) => {
          console.log(`🔍 Processing image ${index + 1}:`, image);
          
          let imageUrl = image.url || '';
          if (imageUrl) {
            imageUrl = constructImageUrl(imageUrl);
            console.log(`🔍 Final image URL for display:`, imageUrl);
          }
          
          const imgTag = `<img src="${imageUrl}" alt="Grafik ${index + 1}" class="max-w-full h-auto rounded-lg shadow-md my-4" />`;
          displayContent = displayContent.replace(`[IMG:${image.id}]`, imgTag);
        });
      }
    }
  }, [anekaGrafikData, envConfig]);

  const loadAnekaGrafik = async () => {
    try {
      setLoading(true);
      const response = await anekaGrafikService.getAnekaGrafikById(id);
      setAnekaGrafikData(response.data);
    } catch (error) {
      console.error('Error loading aneka grafik:', error);
      toast.error('Gagal memuat data aneka grafik');
    } finally {
      setLoading(false);
    }
  };

  // Helper untuk membersihkan URL dari duplikasi protokol/path
  const aggressivelyCleanUrl = (url) => {
    if (!url) return '';
    let cleaned = url.trim();
    cleaned = cleaned.replace(/^https?:\/\/https?:\/\//, match => match.replace('http://http://', 'http://').replace('https://https://', 'https://'));
    cleaned = cleaned.replace(/([^:])\/+/g, '$1/');
    return cleaned;
  };

  const constructImageUrl = (imageUrl) => {
    if (!imageUrl) return '';
    
    console.log('🔍 🔍 🔍 Constructing URL for:', imageUrl);
    
    if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
      const abs = aggressivelyCleanUrl(imageUrl);
      console.log('🔍 🔍 🔍 Already absolute URL (cleaned):', abs);
      return abs;
    }
    
    if (imageUrl.startsWith('file://')) {
      console.log('🔍 🔍 🔍 File URL, returning as is:', imageUrl);
      return imageUrl;
    }
    
    const baseUrl = envConfig.API_BASE_URL.replace('/api', '');
    let finalUrl = imageUrl;
    
    if (!imageUrl.startsWith('/')) {
      finalUrl = `/${imageUrl}`;
    }
    
    finalUrl = `${baseUrl}${finalUrl}`;
    
    finalUrl = aggressivelyCleanUrl(finalUrl);
    
    console.log('🔍 🔍 🔍 Final constructed URL:', finalUrl);
    return finalUrl;
  };

  const cleanupCorruptedImages = (images) => {
    if (!images) return [];

    let processedImages;
    try {
      if (typeof images === 'string') {
        processedImages = JSON.parse(images);
      } else {
        processedImages = images;
      }
    } catch (error) {
      return [];
    }

    if (!Array.isArray(processedImages)) {
      return [];
    }

    return processedImages.map((img) => {
      if (img && img.url) {
        console.log('🔍 🔍 🔍 Processing image URL:', img.url);
        
        let fixedUrl = img.url;

        // Fix path ganda uploads
        if (fixedUrl.includes('/uploads//uploads/')) {
          fixedUrl = fixedUrl.replace('/uploads//uploads/', '/uploads/');
          console.log('🔍 Fixed double /uploads/ in cleanup:', fixedUrl);
        }

        img.url = constructImageUrl(fixedUrl);
        console.log('🔍 🔍 🔍 Final image URL after cleanup:', img.url);
      }
      return img;
    });
  };

  const openFullScreenImage = (image) => {
    let imageUrl = '';
    if (image.url) {
      imageUrl = constructImageUrl(image.url);
    } else {
      imageUrl = image.displayUri || image.fallbackUri || '';
      if (imageUrl) imageUrl = constructImageUrl(imageUrl);
    }
    
    console.log('🔍 Opening full screen image with URL:', imageUrl);
    setFullScreenImage(imageUrl);
    setShowFullScreenModal(true);
  };

  const handleDelete = async () => {
    if (window.confirm('Apakah Anda yakin ingin menghapus aneka grafik ini?')) {
      try {
        await anekaGrafikService.deleteAnekaGrafik(id);
        toast.success('Aneka grafik berhasil dihapus');
        navigate('/owner/keuangan/aneka-grafik');
      } catch (error) {
        console.error('Error deleting aneka grafik:', error);
        toast.error('Gagal menghapus aneka grafik');
      }
    }
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
            <p className="text-gray-600">Data tidak ditemukan</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => navigate('/owner/keuangan/aneka-grafik')}
                  className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 transition-colors"
                >
                  <ArrowLeft className="h-5 w-5" />
                  <span>Kembali</span>
                </button>
                <h1 className="text-2xl font-bold text-gray-900">Detail Aneka Grafik</h1>
              </div>
            </div>
          </div>

          <div className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <div className="space-y-6">
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">Informasi Grafik</h2>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="flex items-center space-x-3">
                          <Calendar className="h-5 w-5 text-gray-400" />
                          <div>
                            <p className="text-sm text-gray-500">Tanggal</p>
                            <p className="font-medium text-gray-900">
                              {new Date(anekaGrafikData.tanggal_grafik).toLocaleDateString('id-ID', {
                                weekday: 'long',
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                              })}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-3">
                          <User className="h-5 w-5 text-gray-400" />
                          <div>
                            <p className="text-sm text-gray-500">Dibuat oleh</p>
                            <p className="font-medium text-gray-900">{anekaGrafikData.created_by || 'Unknown'}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-3">
                          <Clock className="h-5 w-5 text-gray-400" />
                          <div>
                            <p className="text-sm text-gray-500">Dibuat pada</p>
                            <p className="font-medium text-gray-900">
                              {new Date(anekaGrafikData.created_at).toLocaleString('id-ID')}
                            </p>
                          </div>
                        </div>
                        {anekaGrafikData.updated_at && (
                          <div className="flex items-center space-x-3">
                            <Clock className="h-5 w-5 text-gray-400" />
                            <div>
                              <p className="text-sm text-gray-500">Diperbarui pada</p>
                              <p className="font-medium text-gray-900">
                                {new Date(anekaGrafikData.updated_at).toLocaleString('id-ID')}
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div>
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">Isi Grafik</h2>
                    <div className="bg-white border border-gray-200 rounded-lg p-4">
                      <div 
                        className="prose max-w-none"
                        dangerouslySetInnerHTML={{ 
                          __html: anekaGrafikData.isi_grafik 
                            ? anekaGrafikData.isi_grafik.replace(/\n/g, '<br>') 
                            : 'Tidak ada konten' 
                        }} 
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="lg:col-span-1">
                <div className="space-y-6">
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">Galeri Gambar</h2>
                    {processedImages && processedImages.length > 0 ? (
                      <div className="grid grid-cols-2 gap-4">
                        {processedImages.map((image, index) => (
                          <div key={image.id || index} className="relative group">
                            <img
                              src={image.url}
                              alt={image.name || `Grafik ${index + 1}`}
                              className="w-full h-32 object-cover rounded-lg cursor-pointer hover:opacity-75 transition-opacity"
                              onClick={() => openFullScreenImage(image)}
                            />
                            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-200 rounded-lg flex items-center justify-center">
                              <ImageIcon className="h-6 w-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-gray-500">
                        <ImageIcon className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                        <p>Tidak ada gambar</p>
                      </div>
                    )}
                  </div>

                  <div className="flex space-x-4">
                    <button
                      onClick={() => navigate(`/owner/keuangan/aneka-grafik/${id}/edit`)}
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
            </div>
          </div>
        </div>
      </div>

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

export default OwnerAnekaGrafikDetail;
