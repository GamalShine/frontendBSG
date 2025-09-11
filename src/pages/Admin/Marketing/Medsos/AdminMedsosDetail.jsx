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
  const [parts, setParts] = useState([]);

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
    let imgs = [];
    try {
      if (Array.isArray(data.images)) imgs = data.images;
      else if (typeof data.images === 'string' && data.images.trim()) imgs = JSON.parse(data.images);
    } catch {}
    imgs = Array.isArray(imgs) ? imgs : [];

    const buildUrl = (u) => {
      if (!u) return '';
      if (u.startsWith('http')) return u;
      const base = (env.BASE_URL || '').replace(/\/api$/, '');
      return `${base}${u.startsWith('/') ? '' : '/'}${u}`;
    };

    const content = data.isi_laporan || '';
    const regex = /\[IMG:(\d+)\]/g;
    const out = [];
    let last = 0;
    let m;
    while ((m = regex.exec(content)) !== null) {
      if (m.index > last) out.push({ type: 'text', content: content.substring(last, m.index) });
      const pid = m[1];
      const found = imgs.find(im => String(im.id) === String(pid));
      if (found) out.push({ type: 'image', src: buildUrl(found.url || found.uri || found.displayUri || found.fallbackUri), alt: found.filename || 'image' });
      last = m.index + m[0].length;
    }
    if (last < content.length) out.push({ type: 'text', content: content.substring(last) });
    setParts(out);
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
              <div className="prose max-w-none">
                {parts.map((p, idx) => p.type === 'text' ? (
                  <pre key={idx} className="whitespace-pre-wrap text-gray-700 leading-relaxed font-sans text-sm">{p.content}</pre>
                ) : (
                  <div key={idx} className="my-3">
                    <img src={p.src} alt={p.alt} className="max-w-full h-auto border shadow-sm" style={{ maxHeight: '480px', objectFit: 'contain' }} />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminMedsosDetail;
