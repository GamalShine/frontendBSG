import React, { useEffect, useState } from 'react';
import { FileText, Search } from 'lucide-react';
import { aturanService } from '../../../../services/aturanService';

const TimSopAturan = () => {
  const [aturan, setAturan] = useState([]);
  const [loadingAturan, setLoadingAturan] = useState(true);
  const [errorAturan, setErrorAturan] = useState('');

  useEffect(() => {
    const fetchAturan = async () => {
      try {
        setLoadingAturan(true);
        const res = await aturanService.listTim();
        const data = Array.isArray(res?.data) ? res.data : [];
        setAturan(data);
        setErrorAturan('');
      } catch (err) {
        setErrorAturan(err?.message || 'Gagal memuat aturan');
      } finally {
        setLoadingAturan(false);
      }
    };
    fetchAturan();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-red-800 text-white px-4 sm:px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl md:text-2xl font-extrabold tracking-tight">S.O.P dan Aturan</h1>
            <p className="text-sm text-red-100">Tim - SDM</p>
          </div>
        </div>
      </div>

      <div className="bg-gray-100 px-4 sm:px-6 py-2 text-xs text-gray-700">
        Terakhir diupdate: {new Date().toLocaleString('id-ID', { day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
      </div>

      <div className="p-4 sm:p-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Kolom S.O.P (placeholder view-only) */}
          <div className="bg-white border rounded-lg shadow-sm">
            <div className="px-4 py-3 border-b">
              <h2 className="text-base md:text-lg font-semibold text-gray-900">S.O.P</h2>
              <p className="text-xs text-gray-500">Standar Operasional Prosedur</p>
            </div>
            <div className="p-4 text-sm text-gray-500">Silakan lihat S.O.P pada halaman khusus jika diperlukan.</div>
          </div>

          {/* Kolom Aturan (view-only) */}
          <div className="bg-white border rounded-lg shadow-sm">
            <div className="px-4 py-3 border-b">
              <h2 className="text-base md:text-lg font-semibold text-gray-900">Aturan</h2>
              <p className="text-xs text-gray-500">Aturan & Tata Tertib Kerja</p>
            </div>
            <div className="p-4">
              <div className="mb-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input type="text" className="w-full pl-9 pr-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-red-500 focus:border-transparent" placeholder="Cari Aturan..." />
                </div>
              </div>
              {loadingAturan ? (
                <div className="text-sm text-gray-500">Memuat Aturan...</div>
              ) : errorAturan ? (
                <div className="text-sm text-red-600">{errorAturan}</div>
              ) : aturan.length === 0 ? (
                <div className="border rounded-lg p-4 text-center text-gray-600">
                  <FileText className="w-8 h-8 text-red-600 mx-auto mb-2" />
                  <p className="text-sm">Belum ada Aturan ditampilkan.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {aturan.map((it) => {
                    let imgs = [];
                    try { imgs = typeof it.images === 'string' ? JSON.parse(it.images) : (Array.isArray(it.images) ? it.images : []);} catch {}
                    const lampiranCount = Array.isArray(imgs) ? imgs.length : 0;
                    return (
                      <div key={it.id} className="border rounded-lg p-3 hover:bg-gray-50">
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <div className="font-semibold text-gray-900 truncate">{it.judul_aturan || 'Aturan'}</div>
                            <div className="text-xs text-gray-500">{new Date(it.tanggal_aturan).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' })} • {it.user_nama || 'Unknown'}</div>
                            {it.isi_aturan && (
                              <div className="text-sm text-gray-700 mt-1 line-clamp-2">
                                {String(it.isi_aturan).replace(/<[^>]*>/g, '').slice(0, 120)}{String(it.isi_aturan).length > 120 ? '…' : ''}
                              </div>
                            )}
                          </div>
                          <div className="shrink-0 text-xs text-gray-600 bg-gray-100 rounded-full px-2 py-1">{lampiranCount} lampiran</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TimSopAturan;
