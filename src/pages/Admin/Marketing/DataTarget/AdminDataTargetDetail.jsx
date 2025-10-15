import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { targetHarianService } from '@/services/targetHarianService';
import { toast } from 'react-hot-toast';
import { ArrowLeft, Calendar, User, Clock, FileText, RefreshCw, Edit, Trash2, MoreVertical, X } from 'lucide-react';

const AdminDataTargetDetail = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showActionMenu, setShowActionMenu] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);
  const [modalImageSrc, setModalImageSrc] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const res = await targetHarianService.getById(id);
        if (res?.success && res.data) {
          setData(res.data);
        } else {
          toast.error(res?.error || 'Data tidak ditemukan');
          navigate('/admin/marketing/data-target');
        }
      } catch (e) {
        console.error('Gagal memuat detail taget:', e);
        toast.error('Gagal memuat detail');
        navigate('/admin/marketing/data-target');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  const parsedImages = useMemo(() => {
    if (!data?.images) return [];
    try {
      if (typeof data.images === 'string') {
        return JSON.parse(data.images);
      }
      if (Array.isArray(data.images)) return data.images;
      return [];
    } catch {
      return [];
    }
  }, [data]);

  const handleDelete = async () => {
    if (!window.confirm('Hapus data ini?')) return;
    try {
      const res = await targetHarianService.remove(id);
      if (res?.success !== false) {
        toast.success('Berhasil dihapus');
        navigate('/admin/marketing/data-target');
      } else {
        toast.error(res?.error || 'Gagal menghapus');
      }
    } catch (e) {
      console.error('Hapus gagal:', e);
      toast.error('Gagal menghapus');
    }
  };

  if (loading) {
    return (
      <div className="p-0 bg-gray-50 min-h-screen">
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="p-8 text-center">
            <RefreshCw className="h-8 w-8 animate-spin text-red-600 mx-auto mb-4" />
            <p className="text-gray-600">Memuat data...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="p-0 bg-gray-50 min-h-screen">
      {/* Header - ala Omset Harian */}
      <div className="bg-red-800 text-white px-6 py-4 mb-4 relative">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span className="text-sm font-semibold bg-white/10 rounded px-2 py-1">TAGET</span>
            <div>
              <h1 className="text-xl md:text-2xl font-extrabold tracking-tight">DETAIL TAGET HARIAN</h1>
              <p className="text-sm text-red-100">Detail isi Taget Harian</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate('/admin/marketing/data-target')}
              className="px-4 py-2 rounded-full border border-white/60 text-white hover:bg-white/10"
            >
              KEMBALI
            </button>
            <div className="relative">
              <button
                onClick={() => setShowActionMenu(v => !v)}
                aria-label="Aksi"
                className="inline-flex items-center justify-center h-9 w-9 rounded-full border border-white/60 text-white/90 hover:bg-white/10"
              >
                <MoreVertical className="h-4 w-4" />
              </button>
              {showActionMenu && (
                <div className="absolute right-0 mt-2 w-44 bg-white text-gray-800 rounded-lg shadow-lg border border-gray-200 z-20">
                  <div className="py-1">
                    <button
                      onClick={() => { setShowActionMenu(false); navigate(`/admin/marketing/data-target/${id}/edit`); }}
                      className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50 flex items-center gap-2"
                    >
                      <Edit className="h-4 w-4 text-blue-600" />
                      <span>Edit</span>
                    </button>
                    <button
                      onClick={() => { setShowActionMenu(false); handleDelete(); }}
                      className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50 flex items-center gap-2 text-red-600"
                    >
                      <Trash2 className="h-4 w-4" />
                      <span>Hapus</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <div className="bg-white rounded-lg shadow-sm border p-3">
          <div className="flex items-center space-x-3">
            <div className="p-1 bg-red-100 rounded-lg"><Calendar className="h-4 w-4 text-red-600" /></div>
            <div>
              <p className="text-sm font-medium text-gray-500">Tanggal</p>
              <p className="text-lg font-semibold text-gray-900">{new Date(data.tanggal_target).toLocaleDateString('id-ID')}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border p-3">
          <div className="flex items-center space-x-3">
            <div className="p-1 bg-blue-100 rounded-lg"><User className="h-4 w-4 text-blue-600" /></div>
            <div>
              <p className="text-sm font-medium text-gray-500">Dibuat Oleh</p>
              <p className="text-lg font-semibold text-gray-900">{data.user_nama || '-'}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border p-3">
          <div className="flex items-center space-x-3">
            <div className="p-1 bg-purple-100 rounded-lg"><Clock className="h-4 w-4 text-purple-600" /></div>
            <div>
              <p className="text-sm font-medium text-gray-500">Waktu Input</p>
              <p className="text-lg font-semibold text-gray-900">{new Date(data.created_at).toLocaleString('id-ID', { year:'numeric', month:'short', day:'numeric', hour:'2-digit', minute:'2-digit' })}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="bg-white rounded-lg shadow-sm border mb-4">
        <div className="p-3">
          <div className="flex items-center space-x-3 mb-2">
            <div className="p-1 bg-orange-100 rounded-lg"><FileText className="h-4 w-4 text-orange-600" /></div>
            <h2 className="text-lg font-semibold text-gray-900">Isi Taget</h2>
          </div>
          <div className="text-gray-700 text-base leading-relaxed whitespace-pre-wrap">
            {String(data.isi_target || '').split('\n').map((ln, idx) => (
              <div key={idx}>{ln}</div>
            ))}
          </div>

          {parsedImages.length > 0 && (
            <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-3">
              {parsedImages.map((img, idx) => (
                <div key={idx} className="bg-gray-50 border rounded-lg p-2">
                  <img
                    src={img.url || img.uri}
                    alt={img.name || `image_${idx+1}`}
                    className="w-full h-32 object-cover rounded cursor-pointer"
                    onClick={() => { setModalImageSrc(img.url || img.uri); setShowImageModal(true); }}
                    onError={(e) => { e.currentTarget.style.display = 'none'; }}
                  />
                  <div className="mt-1 text-xs text-gray-500 truncate">{img.name || '-'}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Modal Gambar Sederhana */}
      {showImageModal && (
        <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center">
          <button
            onClick={() => setShowImageModal(false)}
            className="absolute top-4 right-4 text-white p-2 rounded-full hover:bg-white/10"
            aria-label="Tutup"
          >
            <X className="h-6 w-6" />
          </button>
          <img src={modalImageSrc} alt="Preview" className="max-w-[90vw] max-h-[90vh] object-contain rounded" />
        </div>
      )}
    </div>
  );
};

export default AdminDataTargetDetail;
