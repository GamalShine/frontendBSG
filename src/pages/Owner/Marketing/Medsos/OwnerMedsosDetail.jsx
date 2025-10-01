import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { mediaSosialService } from '@/services/mediaSosialService';
import { toast } from 'react-hot-toast';
import { 
  ArrowLeft,
  Calendar,
  FileText,
  User,
  Clock,
  Edit,
  Trash2,
  RefreshCw
} from 'lucide-react';
import { getEnvironmentConfig } from '@/config/environment';

const OwnerMedsosDetail = () => {
  const navigate = useNavigate();
  const { id: itemId } = useParams();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [contentParts, setContentParts] = useState([]);
  const envConfig = getEnvironmentConfig();

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await mediaSosialService.getById(itemId);
        setData(res?.data || null);
      } catch (e) {
        setError('Gagal memuat detail');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [itemId]);

  useEffect(() => {
    if (!data) return;
    // proses images
    let imgs = [];
    try {
      if (Array.isArray(data.images)) imgs = data.images;
      else if (typeof data.images === 'string' && data.images.trim()) imgs = JSON.parse(data.images);
    } catch {}
    imgs = Array.isArray(imgs) ? imgs : [];

    const buildUrl = (u) => {
      if (!u) return '';
      if (u.startsWith('http')) return u;
      const base = envConfig.BASE_URL?.replace('/api', '') || '';
      return `${base}${u.startsWith('/') ? '' : '/'}${u}`;
    };

    const parts = [];
    const content = data.isi_laporan || '';
    const regex = /\[IMG:(\d+)\]/g;
    let lastIndex = 0;
    let m;
    while ((m = regex.exec(content)) !== null) {
      const idx = m.index;
      const idStr = m[1];
      if (idx > lastIndex) {
        parts.push({ type: 'text', content: content.substring(lastIndex, idx) });
      }
      const found = imgs.find(im => String(im.id) === String(idStr));
      if (found) {
        parts.push({ type: 'image', image: { ...found, displayUri: buildUrl(found.url || found.uri || found.displayUri || found.fallbackUri) } });
      }
      lastIndex = idx + m[0].length;
    }
    if (lastIndex < content.length) {
      parts.push({ type: 'text', content: content.substring(lastIndex) });
    }
    setContentParts(parts);
  }, [data]);

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const d = new Date(dateString);
    return d.toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' });
  };
  const formatDateTime = (dateString) => {
    if (!dateString) return '-';
    const d = new Date(dateString);
    return d.toLocaleString('id-ID', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="px-0 py-2 bg-gray-50 min-h-screen">
      {/* Header ala acuan */}
      <div className="bg-red-800 text-white p-4 mb-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate('/owner/marketing/medsos')} aria-label="Kembali" className="inline-flex items-center bg-white/0 text-white hover:text-gray-100">
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div>
              <h1 className="text-2xl font-bold">Detail Laporan Medsos</h1>
              <p className="text-sm opacity-90">Owner - Marketing</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate(`/owner/marketing/medsos/${itemId}/edit`)}
              className="bg-white border-red-600 text-red-700 hover:bg-red-50 inline-flex items-center gap-2 px-3 py-2"
            >
              <Edit className="h-4 w-4" />
              <span>Edit</span>
            </button>
            <button
              onClick={async () => {
                if (!window.confirm('Apakah Anda yakin ingin menghapus data laporan medsos ini?')) return;
                try {
                  setDeleting(true);
                  await mediaSosialService.remove(itemId);
                  toast.success('Laporan medsos berhasil dihapus');
                  navigate('/owner/marketing/medsos');
                } catch (e) {
                  console.error('Gagal menghapus data medsos:', e);
                  toast.error('Gagal menghapus laporan medsos');
                } finally {
                  setDeleting(false);
                }
              }}
              className="bg-white border-red-600 text-red-700 hover:bg-red-50 inline-flex items-center gap-2 px-3 py-2"
              disabled={deleting}
            >
              <Trash2 className="h-4 w-4" />
              <span>{deleting ? 'Menghapus...' : 'Hapus'}</span>
            </button>
          </div>
        </div>
      </div>
      {/* Info bar */}
      <div className="bg-gray-200 px-4 py-2 text-xs text-gray-600 -mt-1 mb-4">
        Terakhir diupdate: {data ? formatDate(data.updated_at || data.created_at) : '-'} pukul {data ? new Date(data.updated_at || data.created_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) : '-'}
      </div>

      {/* Loading / Error */}
      {loading && (
        <div className="bg-white shadow-sm border mb-4">
          <div className="p-8 text-center">
            <RefreshCw className="h-8 w-8 animate-spin text-green-500 mx-auto mb-4" />
            <p className="text-gray-600">Memuat data...</p>
          </div>
        </div>
      )}
      {!loading && error && (
        <div className="bg-white shadow-sm border mb-4">
          <div className="p-8 text-center text-red-600">{error}</div>
        </div>
      )}

      {!loading && data && (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div className="bg-white shadow-sm border p-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-100">
                  <Calendar className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Tanggal Laporan</p>
                  <p className="text-lg font-semibold text-gray-900">{formatDate(data.tanggal_laporan)}</p>
                </div>
              </div>
            </div>

            <div className="bg-white shadow-sm border p-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-purple-100">
                  <User className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Dibuat Oleh</p>
                  <p className="text-lg font-semibold text-gray-900">{data.user_nama || 'Admin'}</p>
                </div>
              </div>
            </div>

            <div className="bg-white shadow-sm border p-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-orange-100">
                  <Clock className="h-5 w-5 text-orange-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Waktu Input</p>
                  <p className="text-lg font-semibold text-gray-900">{formatDateTime(data.created_at)}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Isi Laporan */}
          <div className="bg-white shadow-sm border mb-4">
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-100">
                  <FileText className="h-5 w-5 text-blue-600" />
                </div>
                <h2 className="text-lg font-semibold text-gray-900">Isi Laporan</h2>
              </div>
            </div>
            <div className="p-4">
              <div className="prose max-w-none">
                {contentParts.map((part, index) => {
                  if (part.type === 'text') {
                    return (
                      <pre key={index} className="whitespace-pre-wrap text-gray-700 leading-relaxed font-sans text-sm">
                        {part.content}
                      </pre>
                    );
                  } else if (part.type === 'image') {
                    return (
                      <div key={index} className="my-3">
                        <img
                          src={part.image.displayUri}
                          alt={part.image.filename || part.image.name || 'Medsos image'}
                          className="max-w-full h-auto object-contain border shadow-sm"
                          style={{ maxHeight: '480px' }}
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                          }}
                        />
                      </div>
                    );
                  }
                  return null;
                })}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default OwnerMedsosDetail;
