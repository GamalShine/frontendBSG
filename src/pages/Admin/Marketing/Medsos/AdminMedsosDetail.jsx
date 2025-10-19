import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { mediaSosialService } from '@/services/mediaSosialService';
import { getEnvironmentConfig } from '@/config/environment';
import { toast } from 'react-hot-toast';
import { ArrowLeft, Calendar, User, Clock, Edit, Trash2, MoreVertical, RefreshCw, Info } from 'lucide-react';
import { MENU_CODES } from '@/config/menuCodes';

const AdminMedsosDetail = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const env = getEnvironmentConfig();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [renderedHtml, setRenderedHtml] = useState('');
  const [showActionMenu, setShowActionMenu] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await mediaSosialService.getById(id);
        setData(res?.data || null);
      } catch (e) {
        setError('Gagal memuat detail');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  useEffect(() => {
    if (!data) return;
    // Parse images
    let imgs = [];
    try {
      if (Array.isArray(data.images)) imgs = data.images;
      else if (typeof data.images === 'string' && data.images.trim()) imgs = JSON.parse(data.images);
    } catch {}
    imgs = Array.isArray(imgs) ? imgs : [];
    // Normalize URL using API_BASE_URL (strip /api)
    const base = (env.API_BASE_URL || '').replace(/\/?$/, '');
    const baseNoApi = base.replace(/\/api\/?$/, '');
    const normUrl = (u) => {
      if (!u) return '';
      let x = u;
      if (x.startsWith('http://http://')) x = x.replace('http://http://','http://');
      if (x.startsWith('https://https://')) x = x.replace('https://https://','https://');
      if (x.includes('/api/uploads/')) x = x.replace('/api/uploads/','/uploads/');
      if (!/^https?:|^data:|^blob:/i.test(x)) {
        if (!x.startsWith('/')) x = '/' + x;
        x = baseNoApi + x;
      }
      return x;
    };
    const imgMap = new Map();
    imgs.forEach(im => {
      const key = String(im.id ?? im.image_id ?? '');
      if (!key) return;
      const src = normUrl(im.url || im.path || im.uri || im.displayUri || im.fallbackUri);
      imgMap.set(key, src);
    });
    // Build HTML from isi_laporan (already sanitized to allowed tags in form/edit)
    let html = String(data.isi_laporan || '');
    // Convert newlines to <br> if any
    html = html.replace(/\r?\n/g, '<br>');
    // Replace placeholders with <img>
    html = html.replace(/\[IMG:(\d+)\]/g, (_m, id) => {
      const src = imgMap.get(String(id));
      if (!src) return '';
      return `<img src="${src}" data-image-id="${id}" style="max-width:100%;height:auto;margin:8px 0;border-radius:6px;" />`;
    });
    // Light cleanup: remove dir and dangerous scripts (should already be sanitized)
    html = html
      .replace(/\sdir="[^"]*"/gi, '')
      .replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, '');
    setRenderedHtml(html);
  }, [data]);

  const fmtDate = (s) => {
    if (!s) return '-';
    const d = new Date(s);
    return d.toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' });
  };
  const fmtDT = (s) => {
    if (!s) return '-';
    const d = new Date(s);
    return d.toLocaleString('id-ID', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  const handleDelete = async () => {
    if (!window.confirm('Hapus laporan medsos ini?')) return;
    try {
      await mediaSosialService.remove(id);
      toast.success('Laporan medsos dihapus');
      navigate('/admin/marketing/medsos');
    } catch (e) {
      toast.error('Gagal menghapus data');
    }
  };

  return (
    <div className="p-0 bg-gray-50 min-h-screen">
      {/* Header - match Poskas */}
      <div className="bg-red-800 text-white px-6 py-4 mb-4 relative">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span className="text-sm font-semibold bg-white/10 rounded px-2 py-1">{MENU_CODES.marketing.medsos}</span>
            <div>
              <h1 className="text-xl md:text-2xl font-extrabold tracking-tight">MEDIA SOSIAL</h1>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate('/admin/marketing/medsos')}
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
                      onClick={() => { setShowActionMenu(false); navigate(`/admin/marketing/medsos/${id}/edit`); }}
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

      

      <div className="w-full px-0 md:px-0">
        {/* Summary cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div className="bg-white rounded-lg shadow-sm border p-3">
            <div className="flex items-center space-x-3">
              <div className="p-1 bg-red-100 rounded-lg">
                <Calendar className="h-4 w-4 text-red-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Tanggal Laporan</p>
                <p className="text-lg font-semibold text-gray-900">{fmtDate(data?.tanggal_laporan)}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border p-3">
            <div className="flex items-center space-x-3">
              <div className="p-1 bg-blue-100 rounded-lg">
                <User className="h-4 w-4 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Dibuat Oleh</p>
                <p className="text-lg font-semibold text-gray-900">{data?.user_nama || data?.admin_nama || data?.created_by || 'Admin'}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border p-3">
            <div className="flex items-center space-x-3">
              <div className="p-1 bg-purple-100 rounded-lg">
                <Clock className="h-4 w-4 text-purple-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Waktu Input</p>
                <p className="text-lg font-semibold text-gray-900">{fmtDT(data?.created_at)}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="bg-white rounded-lg shadow-sm border mb-12">
          <div className="p-3">
            {loading ? (
              <div className="text-sm text-gray-600">Memuat detail...</div>
            ) : error ? (
              <div className="text-sm text-red-600">{error}</div>
            ) : (
              <div className="prose max-w-none text-gray-800 leading-relaxed" dangerouslySetInnerHTML={{ __html: renderedHtml }} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminMedsosDetail;
