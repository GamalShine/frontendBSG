import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { mediaSosialService } from '@/services/mediaSosialService';
import { getEnvironmentConfig } from '@/config/environment';
import { toast } from 'react-hot-toast';
import { ArrowLeft, Calendar, User, Clock, Edit } from 'lucide-react';

const AdminMedsosDetail = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const env = getEnvironmentConfig();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [renderedHtml, setRenderedHtml] = useState('');

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

  return (
    <div className="px-0 py-2 bg-gray-50 min-h-screen">
      {/* Header ala acuan */}
      <div className="bg-red-800 text-white p-4 mb-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate('/admin/marketing/medsos')} aria-label="Kembali" className="inline-flex items-center bg-white/0 text-white hover:text-gray-100">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-2xl font-bold">Detail Laporan Medsos</h1>
              <p className="text-sm opacity-90">Admin - Marketing</p>
            </div>
          </div>
          <button onClick={() => navigate(`/admin/marketing/medsos/${id}/edit`)} className="bg-white border-red-600 text-red-700 hover:bg-red-50 inline-flex items-center gap-2 px-3 py-2">
            <Edit className="w-4 h-4" /> <span>Edit</span>
          </button>
        </div>
      </div>
      {/* Info bar */}
      <div className="bg-gray-200 px-4 py-2 text-xs text-gray-600 -mt-1 mb-4">
        Terakhir diupdate: {data ? fmtDate(data.updated_at || data.created_at) : '-'} pukul {data ? new Date(data.updated_at || data.created_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) : '-'}
      </div>

      <div className="w-full px-4 md:px-6">
        {/* Summary cards flat */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div className="bg-white shadow-sm border p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100"><Calendar className="h-5 w-5 text-blue-600" /></div>
              <div>
                <div className="text-sm text-gray-500">Tanggal Laporan</div>
                <div className="text-lg font-semibold text-gray-900">{fmtDate(data?.tanggal_laporan)}</div>
              </div>
            </div>
          </div>
          <div className="bg-white shadow-sm border p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100"><User className="h-5 w-5 text-green-600" /></div>
              <div>
                <div className="text-sm text-gray-500">Dibuat Oleh</div>
                <div className="text-lg font-semibold text-gray-900">{data?.user_nama || '-'}</div>
              </div>
            </div>
          </div>
          <div className="bg-white shadow-sm border p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100"><Clock className="h-5 w-5 text-purple-600" /></div>
              <div>
                <div className="text-sm text-gray-500">Waktu Input</div>
                <div className="text-lg font-semibold text-gray-900">{fmtDT(data?.created_at)}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Content flat */}
        <div className="bg-white shadow-sm border mb-12">
          <div className="p-4">
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
