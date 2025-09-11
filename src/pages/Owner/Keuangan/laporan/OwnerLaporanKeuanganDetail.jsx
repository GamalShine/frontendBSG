import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../../../../contexts/AuthContext';
import { laporanKeuanganService } from '../../../../services/laporanKeuanganService';
import { toast } from 'react-hot-toast';
import { getEnvironmentConfig } from '../../../../config/environment';
import { normalizeImageUrl } from '../../../../utils/url';
import { 
  ArrowLeft, 
  Calendar, 
  FileText,
  User,
  Clock,
  Edit,
  Trash2,
  RefreshCw,
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
      try { sessionStorage.setItem('owner.lapkeu.returning','1'); } catch(_){}
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
    
    // Fix URLs for all images via helper
    return processedImages.map(img => {
      if (img && img.url) {
        const fixedUrl = normalizeImageUrl(img.url);
        if (fixedUrl !== img.url) {
          console.log(`🔍 Normalized image URL: ${img.url} -> ${fixedUrl}`);
        }
        return { ...img, url: fixedUrl };
      }
      return img;
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
      // Tambahkan teks sebelum placeholder jika ada
      if (start > lastIndex) {
        const textSeg = content.slice(lastIndex, start);
        if (textSeg) parts.push({ type: 'text', data: textSeg });
      }
      const imgId = parseInt(match[1]);
      const image = images.find((img) => img.id === imgId);
      if (image) {
        parts.push({ type: 'image', data: image });
      } else {
        // Jika image tidak ditemukan, tampilkan placeholder sebagai teks apa adanya
        parts.push({ type: 'text', data: match[0] });
      }
      lastIndex = end;
    }

    // Sisa teks setelah placeholder terakhir
    if (lastIndex < content.length) {
      const tail = content.slice(lastIndex);
      if (tail) parts.push({ type: 'text', data: tail });
    }

    // Fallback: bila tidak ada part sama sekali, tampilkan seluruh content sebagai teks
    if (parts.length === 0) {
      parts.push({ type: 'text', data: content });
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
    <div className="px-0 py-2 bg-gray-50 min-h-screen">
      {/* Header ala list */}
      <div className="bg-red-800 text-white p-4 mb-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => { try { sessionStorage.setItem('owner.lapkeu.returning','1'); } catch(_){}; navigate('/owner/keuangan/laporan') }}
              aria-label="Kembali"
              className="inline-flex items-center bg-white/0 text-white hover:text-gray-100"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div>
              <h1 className="text-2xl font-bold">Detail Laporan Keuangan</h1>
              <p className="text-sm opacity-90">Owner - Keuangan</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => { try { sessionStorage.setItem('owner.lapkeu.returning','1'); } catch(_){}; navigate(`/owner/keuangan/laporan/${id}/edit`) }}
              className="bg-white border-red-600 text-red-700 hover:bg-red-50 inline-flex items-center gap-2 px-3 py-2"
            >
              <Edit className="h-4 w-4" />
              <span>Edit</span>
            </button>
            <button
              onClick={handleDelete}
              className="bg-white border-red-600 text-red-700 hover:bg-red-50 inline-flex items-center gap-2 px-3 py-2"
            >
              <Trash2 className="h-4 w-4" />
              <span>Hapus</span>
            </button>
          </div>
        </div>
      </div>
      <div className="bg-gray-200 px-4 py-2 text-xs text-gray-600 -mt-1 mb-4">
        Terakhir diupdate: {new Date(laporanData.updated_at || laporanData.created_at).toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric'})}
        {' '}pukul {new Date(laporanData.updated_at || laporanData.created_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit'})}
      </div>

      {/* Summary Card */}
      <div className="bg-white shadow-sm border mb-4">
        <div className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100">
                <Calendar className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Tanggal Laporan</p>
                <p className="text-lg font-semibold text-gray-900">{formatDate(laporanData.tanggal_laporan)}</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-green-100">
                <User className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Dibuat Oleh</p>
                <p className="text-lg font-semibold text-gray-900">{laporanData.user_nama || 'Unknown'}</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-purple-100">
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
      <div className="bg-white shadow-sm border mb-4">
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Isi Laporan</h2>
        </div>
        <div className="p-4">
          <div className="prose max-w-none">
            {contentParts.length === 0 && (
              <div className="whitespace-pre-wrap font-sans text-sm leading-relaxed">{laporanData.isi_laporan || '-'}</div>
            )}
            {contentParts.map((part, index) => (
              <div key={index}>
                {part.type === 'image' ? (
                  <div className="my-3">
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
                  <div className="whitespace-pre-wrap font-sans text-sm leading-relaxed">{part.data}</div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Galeri gambar dihilangkan sesuai permintaan */}

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