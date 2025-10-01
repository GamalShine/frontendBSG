import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { targetHarianService } from '../../../../services/targetHarianService';
import { ArrowLeft, Edit, Trash2 } from 'lucide-react';

const OwnerTargetHarianDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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

  let images = [];
  try { images = data?.images ? JSON.parse(data.images) : []; } catch (_) {}
  // Filter URL gambar yang invalid (mis. masih placeholder ':id' atau kosong)
  const safeImages = (Array.isArray(images) ? images : []).filter((img) => {
    const u = img?.url || img?.serverPath
    return Boolean(u && typeof u === 'string' && !u.includes(':id'))
  })

  return (
    <div className="px-0 py-2 bg-gray-50 min-h-screen">
      {/* Header ala Owner Laporan Keuangan */}
      <div className="bg-red-800 text-white p-4 mb-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => { try { sessionStorage.setItem('owner.dataTarget.returning','1'); } catch(_){}; navigate('/owner/marketing/data-target') }}
              aria-label="Kembali"
              className="inline-flex items-center bg-white/0 text-white hover:text-gray-100"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div>
              <h1 className="text-2xl font-bold">Detail Data Target</h1>
              <p className="text-sm opacity-90">Owner - Marketing</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => { try { sessionStorage.setItem('owner.dataTarget.returning','1'); } catch(_){}; navigate(`/owner/marketing/data-target/${id}/edit`) }}
              className="bg-white border-red-600 text-red-700 hover:bg-red-50 inline-flex items-center gap-2 px-3 py-2"
            >
              <Edit className="h-4 w-4" />
              <span>Edit</span>
            </button>
            <button
              onClick={() => { try { sessionStorage.setItem('owner.dataTarget.returning','1'); } catch(_){}; navigate('/owner/marketing/data-target') }}
              className="bg-white border-red-600 text-red-700 hover:bg-red-50 inline-flex items-center gap-2 px-3 py-2"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Kembali</span>
            </button>
          </div>
        </div>
      </div>
      {/* Info bar */}
      <div className="bg-gray-200 px-4 py-2 text-xs text-gray-600 -mt-1 mb-4">
        Terakhir diupdate: {data ? new Date(data.updated_at || data.created_at).toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric'}) : '-'}
        {' '}pukul {data ? new Date(data.updated_at || data.created_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit'}) : '-'}
      </div>

      {/* Summary */}
      <div className="bg-white shadow-sm border mb-4">
        <div className="p-4">
          {loading && <div className="text-center py-6 text-gray-500">Memuat detail...</div>}
          {error && !loading && <div className="text-center py-6 text-red-600">{error}</div>}
          {!loading && !error && data && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <div className="text-sm text-gray-500">Tanggal</div>
                <div className="text-lg font-semibold">{new Date(data.tanggal_target).toLocaleDateString('id-ID')}</div>
              </div>
              <div>
                <div className="text-sm text-gray-500">Dibuat Oleh</div>
                <div className="text-lg font-medium">{data.user_nama || '-'}</div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Isi */}
      {!loading && !error && data && (
        <div className="bg-white shadow-sm border mb-4">
          <div className="p-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Isi Data Target</h2>
          </div>
          <div className="p-4">
            <div className="whitespace-pre-wrap leading-relaxed text-gray-800">{data.isi_target}</div>
          </div>
        </div>
      )}

      {/* Lampiran */}
      {!loading && !error && (
        <div className="bg-white shadow-sm border mb-12">
          <div className="p-4 border-b border-gray-200">
            <h3 className="text-base font-semibold text-gray-900">Lampiran Gambar</h3>
          </div>
          <div className="p-4">
            <div className="flex flex-wrap gap-3">
              {safeImages.length === 0 && <div className="text-gray-500 text-sm">Tidak ada gambar</div>}
              {safeImages.map((img, i) => (
                <a key={i} href={img.url || img.serverPath || '#'} target="_blank" rel="noreferrer" className="block">
                  <img src={img.url || img.serverPath} alt={img.name || `img-${i}`} className="h-24 w-24 object-cover border" />
                </a>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OwnerTargetHarianDetail;
