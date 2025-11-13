import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { targetHarianService } from '@/services/targetHarianService';
import { toast } from 'react-hot-toast';
import { ArrowLeft, Calendar, User, Clock, FileText, RefreshCw, Edit, Trash2, MoreVertical, X } from 'lucide-react';
import { MENU_CODES } from '@/config/menuCodes';
import { getEnvironmentConfig } from '@/config/environment';

const AdminDataTargetDetail = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showActionMenu, setShowActionMenu] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);
  const [modalImageSrc, setModalImageSrc] = useState('');
  const contentRef = useRef(null);
  const env = getEnvironmentConfig();

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        // Guard: jika id tidak valid, kembali ke list
        if (!id || id === 'undefined' || id === 'null') {
          toast.error('ID tidak valid');
          navigate('/admin/marketing/data-target');
          return;
        }
        const res = await targetHarianService.getById(id);
        if (res?.success && res.data) {
          setData(res.data);
        } else {
          toast.error(res?.error || 'Data tidak ditemukan');
          navigate('/admin/marketing/data-target');
        }
      } catch (e) {
        console.error('Gagal memuat detail taget:', e);
        toast.error(e?.response?.data?.error || e?.message || 'Gagal memuat detail');
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

  // Bangun HTML final: ganti placeholder [IMG:id] ke tag <img>, hilangkan tag/atribut berbahaya
  const renderedHtml = useMemo(() => {
    let html = String(data?.isi_target || '');
    if (!html) return '';
    const normalizeImageUrl = (u) => {
      try {
        let url = String(u || '');
        if (!url) return '';
        // perbaiki duplikasi skema
        url = url.replace(/^https?:\/\/https?:\/\//i, (m) => m.replace('http://http://', 'http://').replace('https://https://', 'https://'));
        // ganti /api/uploads -> /uploads
        url = url.replace(/\/api\/uploads\//i, '/uploads/');
        // jika relatif tanpa leading slash, tambahkan
        const isAbsolute = /^https?:|^data:|^blob:/i.test(url);
        if (!isAbsolute) {
          if (!url.startsWith('/')) url = '/' + url;
          const base = (env.API_BASE_URL || '').replace(/\/$/, '');
          const baseNoApi = base.replace(/\/api\/?$/, '');
          return `${baseNoApi}${url}`;
        }
        return url;
      } catch { return String(u || ''); }
    };
    // Sanitasi sederhana
    try {
      html = html.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '');
      html = html.replace(/on\w+=\"[^\"]*\"/gi, '');
      html = html.replace(/on\w+=\'[^\']*\'/gi, '');
      html = html.replace(/javascript:/gi, '');
    } catch {}
    // Map id -> url
    const byId = new Map();
    parsedImages.forEach((img) => {
      if (typeof img.id !== 'undefined') byId.set(Number(img.id), normalizeImageUrl(img.url || img.uri || img.path || ''));
    });
    html = html.replace(/\[IMG:(\d+)\]/g, (_m, g1) => {
      const id = Number(g1);
      const src = byId.get(id);
      if (!src) return '';
      return `<figure class=\"my-2\"><img src=\"${src}\" alt=\"image_${id}\" style=\"max-width:100%;height:auto;border-radius:0.5rem\" /></figure>`;
    });
    // Normalisasi tag <img> yang sudah ada di konten ke URL yang valid dan styling responsif
    html = html.replace(/<img\s+[^>]*src=(["'])([^"']+)\1[^>]*>/gi, (_m, q, src) => {
      const nsrc = normalizeImageUrl(src);
      return `<img src="${nsrc}" style="max-width:100%;height:auto;border-radius:0.5rem" />`;
    });
    // Ubah newline menjadi <br> jika masih ada
    html = html.replace(/\n/g, '<br>');
    return html;
  }, [data, parsedImages]);

  // Enable click-to-preview for inline images rendered from HTML
  useEffect(() => {
    const root = contentRef.current;
    if (!root) return;
    const imgs = Array.from(root.querySelectorAll('img'));
    const handlers = imgs.map((img) => {
      const handler = (e) => {
        e.preventDefault();
        const src = img.getAttribute('src');
        if (src) {
          setModalImageSrc(src);
          setShowImageModal(true);
        }
      };
      img.addEventListener('click', handler);
      img.style.cursor = 'pointer';
      return { img, handler };
    });
    return () => {
      handlers.forEach(({ img, handler }) => img.removeEventListener('click', handler));
    };
  }, [renderedHtml]);

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
      {/* Header - samakan badge dengan halaman lain */}
      <div className="bg-red-800 text-white px-6 py-2 md:py-4 mb-4 relative">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span className="text-sm font-semibold bg-white/10 rounded px-2 py-1">{MENU_CODES.marketing.dataTarget}</span>
            <div>
              <h1 className="text-xl md:text-2xl font-extrabold tracking-tight">DATA TARGET</h1>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {/* Mobile: icon-only buttons */}
            <div className="flex items-center gap-2 md:hidden">
              <button
                onClick={() => navigate('/admin/marketing/data-target')}
                className="inline-flex items-center justify-center h-9 w-9 rounded-full border border-white/60 text-white hover:bg-white/10"
                aria-label="Kembali"
                title="Kembali"
              >
                <X className="h-5 w-5" />
              </button>
              <button
                onClick={() => navigate(`/admin/marketing/data-target/${id}/edit`)}
                className="inline-flex items-center justify-center h-9 w-9 rounded-full border border-white/60 text-white hover:bg-white/10"
                aria-label="Edit"
                title="Edit"
              >
                <Edit className="h-5 w-5" />
              </button>
            </div>
            {/* Desktop: text buttons */}
            <div className="hidden md:flex items-center gap-2">
              <button
                onClick={() => navigate('/admin/marketing/data-target')}
                className="px-4 py-2 rounded-full border border-white/60 text-white hover:bg-white/10"
              >
                KEMBALI
              </button>
              <button
                onClick={() => navigate(`/admin/marketing/data-target/${id}/edit`)}
                className="px-4 py-2 rounded-full border border-white/60 text-white hover:bg-white/10 inline-flex items-center gap-2"
              >
                <Edit className="h-4 w-4" />
                <span>Edit</span>
              </button>
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

      {/* Content Section */
      }
      <div className="bg-white rounded-lg shadow-sm border mb-4">
        <div className="p-3">
          <div className="flex items-center space-x-3 mb-2">
            <div className="p-1 bg-orange-100 rounded-lg"><FileText className="h-4 w-4 text-orange-600" /></div>
            <h2 className="text-lg font-semibold text-gray-900">Isi Taget</h2>
          </div>
          <div ref={contentRef} className="prose prose-sm max-w-none text-gray-800 leading-relaxed">
            <div dangerouslySetInnerHTML={{ __html: renderedHtml }} />
          </div>
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
