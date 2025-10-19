import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../../../../contexts/AuthContext';
import { laporanKeuanganService } from '../../../../services/laporanKeuanganService';
import { toast } from 'react-hot-toast';
import { getEnvironmentConfig } from '../../../../config/environment';
import { 
  Calendar, 
  FileText,
  User,
  Clock,
  Edit,
  X
} from 'lucide-react';
import { MENU_CODES } from '@/config/menuCodes';

const AdminLaporanKeuanganDetail = () => {
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
        navigate('/admin/keuangan/laporan');
      }
    } catch (error) {
      console.error('Error loading laporan keuangan:', error);
              toast.error('Gagal memuat data laporan keuangan');
        navigate('/admin/keuangan/laporan');
    } finally {
      setLoading(false);
    }
  };

  // Helper to derive title if judul_laporan empty
  const deriveTitle = (content) => {
    if (!content) return 'Laporan Keuangan';
    const firstLine = content.split('\n')[0] || '';
    return firstLine.trim() || 'Laporan Keuangan';
  };

  const handleDelete = async () => {
    if (!window.confirm('Apakah Anda yakin ingin menghapus data laporan keuangan ini?')) {
      return;
    }

    try {
      await laporanKeuanganService.deleteLaporanKeuangan(id);
      toast.success('Data laporan keuangan berhasil dihapus');
      navigate('/admin/keuangan/laporan');
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

  // Helper untuk membersihkan URL dari duplikasi protokol/path
  const aggressivelyCleanUrl = (url) => {
    if (!url) return '';
    let cleaned = url.trim();
    cleaned = cleaned.replace(/^https?:\/\/https?:\/\//, match => match.replace('http://http://', 'http://').replace('https://https://', 'https://'));
    cleaned = cleaned.replace(/([^:])\/+/g, '$1/');
    return cleaned;
  };

  // Normalisasi URL gambar agar environment-agnostic
  const constructImageUrl = (imageUrl) => {
    if (!imageUrl) return '';
    if (imageUrl.startsWith('file://')) return imageUrl;
    if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
      return aggressivelyCleanUrl(imageUrl);
    }
    const baseUrl = envConfig.API_BASE_URL.replace('/api', '');
    const pathPart = imageUrl.startsWith('/') ? imageUrl : `/${imageUrl}`;
    return aggressivelyCleanUrl(`${baseUrl}${pathPart}`);
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
    
    // Normalisasi URL untuk semua gambar
    return processedImages.map(img => {
      if (!img) return img;
      let urlCandidate = img.url;
      if (!urlCandidate && img.serverPath) {
        const cleanServerPath = img.serverPath.startsWith('/') ? img.serverPath : `/${img.serverPath}`;
        urlCandidate = cleanServerPath;
      }
      if (!urlCandidate) return img;

      // Perbaiki path ganda uploads
      if (typeof urlCandidate === 'string' && urlCandidate.includes('/uploads//uploads/')) {
        urlCandidate = urlCandidate.replace('/uploads//uploads/', '/uploads/');
      }

      const normalized = constructImageUrl(urlCandidate);
      return { ...img, url: normalized };
    });
  };

  // Render content with images inline (pertahankan teks di sekitar placeholder)
  const renderContentWithImages = (content, images = []) => {
    if (!content) return [];
    const parts = [];
    const regex = /\[IMG:(\d+)\]/g;
    let lastIndex = 0;
    let match;
    while ((match = regex.exec(content)) !== null) {
      const start = match.index;
      const end = regex.lastIndex;
      if (start > lastIndex) {
        const textSeg = content.slice(lastIndex, start);
        if (textSeg) parts.push({ type: 'text', data: textSeg });
      }
      const imgId = parseInt(match[1]);
      const image = images.find((img) => img.id === imgId);
      if (image) {
        parts.push({ type: 'image', data: image });
      } else {
        parts.push({ type: 'text', data: match[0] });
      }
      lastIndex = end;
    }
    if (lastIndex < content.length) {
      const tail = content.slice(lastIndex);
      if (tail) parts.push({ type: 'text', data: tail });
    }
    if (parts.length === 0) parts.push({ type: 'text', data: content });
    return parts;
  };

  const openFullScreenImage = (imageUrl) => {
    // Terima object image atau string URL, normalisasi seperti di Omset
    let finalUrl = '';
    if (typeof imageUrl === 'string') {
      finalUrl = imageUrl;
    } else if (imageUrl && typeof imageUrl === 'object') {
      const raw = imageUrl.url || imageUrl.displayUri || imageUrl.fallbackUri || '';
      if (raw.startsWith('http')) {
        finalUrl = raw;
      } else {
        const baseUrl = envConfig.BASE_URL.replace('/api', '');
        finalUrl = `${baseUrl}${raw.startsWith('/') ? '' : '/'}${raw}`;
      }
    }
    setFullScreenImage(finalUrl || imageUrl);
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
    <div className="p-0 bg-gray-50 min-h-screen">
      {/* Header - match list/detail style like Omset Harian */}
      <div className="bg-red-800 text-white px-6 py-4 mb-0 relative">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span className="text-sm font-semibold bg-white/10 rounded px-2 py-1">{MENU_CODES.keuangan.laporanKeuangan}</span>
            <div>
              <h1 className="text-xl md:text-2xl font-extrabold tracking-tight">LAPORAN KEUANGAN</h1>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate('/admin/keuangan/laporan')}
              className="px-4 py-2 rounded-full border border-white/60 text-white hover:bg-white/10"
            >
              KEMBALI
            </button>
            <button
              onClick={() => navigate(`/admin/keuangan/laporan/${id}/edit`)}
              className="px-4 py-2 rounded-full border border-white/60 text-white hover:bg-white/10 inline-flex items-center gap-2"
            >
              <Edit className="h-4 w-4" />
              <span>Edit</span>
            </button>
          </div>
        </div>
      </div>

      

      {/* Information Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4 mb-4">
        <div className="bg-white rounded-lg shadow-sm border p-3">
          <div className="flex items-center space-x-3">
            <div className="p-1 bg-blue-100 rounded-lg">
              <Calendar className="h-4 w-4 text-blue-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Tanggal Laporan</p>
              <p className="text-lg font-semibold text-gray-900">{formatDate(laporanData.tanggal_laporan)}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-3">
          <div className="flex items-center space-x-3">
            <div className="p-1 bg-purple-100 rounded-lg">
              <User className="h-4 w-4 text-purple-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Dibuat Oleh</p>
              <p className="text-lg font-semibold text-gray-900">{laporanData.user_nama || 'Admin'}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-3">
          <div className="flex items-center space-x-3">
            <div className="p-1 bg-orange-100 rounded-lg">
              <Clock className="h-4 w-4 text-orange-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Waktu Input</p>
              <p className="text-lg font-semibold text-gray-900">{formatDateTime(laporanData.created_at)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Isi Laporan Section */}
      <div className="bg-white rounded-lg shadow-sm border mb-4">
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900 mb-1">{(laporanData.judul_laporan || '').trim() || deriveTitle(laporanData.isi_laporan) || 'Isi Laporan'}</h2>
        </div>
        <div className="p-3">
          <div className="prose max-w-none">
            {contentParts.map((part, index) => {
              if (part.type === 'text') {
                return (
                  <div
                    key={index}
                    className="whitespace-pre-wrap text-gray-700 leading-relaxed font-sans"
                    dangerouslySetInnerHTML={{ __html: part.data }}
                  />
                );
              } else if (part.type === 'image') {
                return (
                  <div key={index} className="my-2">
                    <button
                      onClick={() => openFullScreenImage(part.data)}
                      className="block w-full text-left"
                    >
                      <img
                        src={part.data.url}
                        alt={part.data.name || 'Laporan image'}
                        className="max-w-full h-auto max-h-96 object-contain rounded-lg shadow-sm border"
                        style={{ maxHeight: '500px' }}
                        onError={(e) => {
                          console.error('❌ Image failed to load:', part.data.url);
                          e.target.style.display = 'none';
                          const errorDiv = document.createElement('div');
                          errorDiv.className = 'p-8 text-center bg-red-50 border-2 border-red-200 rounded-lg';
                          errorDiv.innerHTML = `
                            <div class=\"text-red-600 mb-2\">
                              <svg class=\"w-12 h-12 mx-auto\" fill=\"none\" stroke=\"currentColor\" viewBox=\"0 0 24 24\">
                                <path stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-width=\"2\" d=\"M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z\"></path>
                              </svg>
                            </div>
                            <p class=\"text-red-800 font-medium\">Gambar gagal dimuat</p>
                            <p class=\"text-red-600 text-sm\">URL: ${part.data.url}</p>
                          `;
                          e.target.parentNode.appendChild(errorDiv);
                        }}
                      />
                    </button>
                  </div>
                );
              }
              return null;
            })}
            {contentParts.length === 0 && (
              <div
                className="whitespace-pre-wrap text-gray-700 leading-relaxed font-sans"
                dangerouslySetInnerHTML={{ __html: laporanData.isi_laporan || '-' }}
              />
            )}
          </div>
        </div>
      </div>

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

export default AdminLaporanKeuanganDetail; 