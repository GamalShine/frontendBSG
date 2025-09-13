import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { targetHarianService } from '../../../../services/targetHarianService';
import { getEnvironmentConfig } from '@/config/environment';
import { ArrowLeft, Edit, Trash2, Calendar, User, Clock, X } from 'lucide-react';

const AdminTargetHarianDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const env = getEnvironmentConfig();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [fullScreenImage, setFullScreenImage] = useState(null);
  const [showFullScreenModal, setShowFullScreenModal] = useState(false);
  const [contentParts, setContentParts] = useState([]);

  useEffect(() => {
    const fetch = async () => {
      try {
        setLoading(true);
        const res = await targetHarianService.getById(id);
        if (res?.success) {
          setData(res.data);
        } else {
          throw new Error(res?.error || 'Gagal memuat detail');
        }
      } catch (err) {
        setError(err.message || 'Terjadi kesalahan');
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [id]);

  // Helpers
  const aggressivelyCleanUrl = (url) => {
    if (!url) return '';
    let cleaned = url.trim();
    cleaned = cleaned.replace(/^https?:\/\/https?:\/+/, (m) => m.replace('http://http://', 'http://').replace('https://https://', 'https://'));
    cleaned = cleaned.replace(/([^:])\/+\/+/g, '$1/');
    return cleaned;
  };

  const constructImageUrl = (imageUrl) => {
    if (!imageUrl) return '';
    if (imageUrl.startsWith('file://')) return imageUrl;
    if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) return aggressivelyCleanUrl(imageUrl);
    const baseUrl = env.API_BASE_URL.replace('/api', '');
    const pathPart = imageUrl.startsWith('/') ? imageUrl : `/${imageUrl}`;
    return aggressivelyCleanUrl(`${baseUrl}${pathPart}`);
  };

  const processImages = (images) => {
    if (!images) return [];
    let processed = [];
    if (typeof images === 'string') {
      try { processed = JSON.parse(images); } catch { processed = images.trim() ? [{ url: images }] : []; }
    } else if (Array.isArray(images)) {
      processed = images;
    } else if (typeof images === 'object') {
      processed = [images];
    }
    if (!Array.isArray(processed)) return [];
    return processed.map((img) => {
      if (!img) return img;
      let urlCandidate = img.url || (img.serverPath ? (img.serverPath.startsWith('/') ? img.serverPath : `/${img.serverPath}`) : '');
      if (!urlCandidate) return img;
      if (typeof urlCandidate === 'string' && urlCandidate.includes('/uploads//uploads/')) {
        urlCandidate = urlCandidate.replace('/uploads//uploads/', '/uploads/');
      }
      return { ...img, url: constructImageUrl(urlCandidate) };
    });
  };

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
      if (image) parts.push({ type: 'image', data: image }); else parts.push({ type: 'text', data: match[0] });
      lastIndex = end;
    }
    if (lastIndex < content.length) {
      const tail = content.slice(lastIndex);
      if (tail) parts.push({ type: 'text', data: tail });
    }
    return parts.length ? parts : [{ type: 'text', data: content }];
  };

  useEffect(() => {
    if (data) {
      const imgs = processImages(data.images);
      setContentParts(renderContentWithImages(data.isi_target, imgs));
    }
  }, [data]);

  const openFullScreenImage = (url) => { setFullScreenImage(url); setShowFullScreenModal(true); };
  const closeFullScreenModal = () => { setShowFullScreenModal(false); setFullScreenImage(null); };

  return (
    <div className="px-0 py-2 bg-gray-50 min-h-screen">
      {/* Header merah */}
      <div className="bg-red-800 text-white p-4 mb-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => { try { sessionStorage.setItem('admin.dataTarget.returning','1'); } catch(_){}; navigate('/admin/marketing/data-target') }}
              aria-label="Kembali"
              className="inline-flex items-center bg-white/0 text-white hover:text-gray-100"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div>
              <h1 className="text-2xl font-bold">Detail Data Target</h1>
              <p className="text-sm opacity-90">Admin - Marketing</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => { try { sessionStorage.setItem('admin.dataTarget.returning','1'); } catch(_){}; navigate(`/admin/marketing/data-target/${id}/edit`) }}
              className="bg-white border-red-600 text-red-700 hover:bg-red-50 inline-flex items-center gap-2 px-3 py-2"
            >
              <Edit className="h-4 w-4" />
              <span>Edit</span>
            </button>
            <button
              onClick={async () => {
                if (!window.confirm('Hapus data target ini?')) return;
                try { await targetHarianService.remove(id); navigate('/admin/marketing/data-target'); } catch (e) { alert('Gagal menghapus'); }
              }}
              className="bg-white border-red-600 text-red-700 hover:bg-red-50 inline-flex items-center gap-2 px-3 py-2"
            >
              <Trash2 className="h-4 w-4" />
              <span>Hapus</span>
            </button>
          </div>
        </div>
      </div>
      {/* Info bar */}
      <div className="bg-gray-200 px-4 py-2 text-xs text-gray-600 -mt-1 mb-4">
        Terakhir diupdate: {data ? new Date(data.updated_at || data.created_at).toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric'}) : '-'}
        {' '}pukul {data ? new Date(data.updated_at || data.created_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit'}) : '-'}
      </div>

      {/* Summary ala keuangan */}
      <div className="bg-white shadow-sm border mb-4">
        <div className="p-4">
          {loading && <div className="text-center py-6 text-gray-500">Memuat detail...</div>}
          {error && !loading && <div className="text-center py-6 text-red-600">{error}</div>}
          {!loading && !error && data && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-100"><Calendar className="h-6 w-6 text-blue-600" /></div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Tanggal Target</p>
                  <p className="text-lg font-semibold text-gray-900">{new Date(data.tanggal_target).toLocaleDateString('id-ID')}</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-green-100"><User className="h-6 w-6 text-green-600" /></div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Dibuat Oleh</p>
                  <p className="text-lg font-semibold text-gray-900">{data.user_nama || '-'}</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-purple-100"><Clock className="h-6 w-6 text-purple-600" /></div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Dibuat Pada</p>
                  <p className="text-lg font-semibold text-gray-900">{new Date(data.created_at).toLocaleString('id-ID', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Isi dengan gambar inline */}
      {!loading && !error && data && (
        <div className="bg-white shadow-sm border mb-4">
          <div className="p-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Isi Data Target</h2>
          </div>
          <div className="p-4">
            <div className="prose max-w-none">
              {contentParts.length === 0 && (
                <div className="whitespace-pre-wrap font-sans text-sm leading-relaxed">{data.isi_target || '-'}</div>
              )}
              {contentParts.map((part, idx) => (
                <div key={idx}>
                  {part.type === 'image' ? (
                    <div className="my-3">
                      <img
                        src={part.data.url}
                        alt={part.data.name || 'Target Image'}
                        className="max-w-full h-auto rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
                        onClick={() => openFullScreenImage(part.data.url)}
                        onError={(e) => { e.currentTarget.style.border = '2px solid red'; e.currentTarget.style.backgroundColor = '#fee'; e.currentTarget.alt = 'Gambar gagal dimuat'; }}
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
      )}

      {/* Fullscreen Modal */}
      {showFullScreenModal && fullScreenImage && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
          <div className="relative max-w-4xl max-h-full p-4">
            <button onClick={closeFullScreenModal} className="absolute top-4 right-4 text-white hover:text-gray-300 z-10">
              <X className="h-8 w-8" />
            </button>
            <img src={fullScreenImage} alt="Full Screen" className="max-w-full max-h-full object-contain" />
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminTargetHarianDetail;
