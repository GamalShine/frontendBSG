import React, { useEffect, useState } from 'react';
import { FileText, Search } from 'lucide-react';
import api from '../../../../services/api';
import { API_ENDPOINTS } from '../../../../config/constants';
import { aturanService } from '../../../../services/aturanService';

const OwnerSopAturan = () => {
  // State untuk data SOP (meniru StrukturJobdeskSOP tab SOP)
  const [sop, setSop] = useState([]);
  const [loadingSop, setLoadingSop] = useState(true);
  const [errorSop, setErrorSop] = useState('');
  const [openSopDiv, setOpenSopDiv] = useState({}); // { [divisiId]: boolean }
  const [openSopCat, setOpenSopCat] = useState({}); // { [categoryId]: boolean }
  // State untuk Aturan (side kanan)
  const [aturan, setAturan] = useState([]);
  const [loadingAturan, setLoadingAturan] = useState(true);
  const [errorAturan, setErrorAturan] = useState('');

  useEffect(() => {
    const fetchSop = async () => {
      try {
        setLoadingSop(true);
        const res = await api.get(API_ENDPOINTS.SDM.SOP.STRUCTURE);
        const data = Array.isArray(res?.data?.data) ? res.data.data : [];
        setSop(data);
        setErrorSop('');
      } catch (err) {
        setErrorSop(err?.response?.data?.message || 'Gagal memuat struktur SOP');
      } finally {
        setLoadingSop(false);
      }
    };
    fetchSop();
  }, []);

  useEffect(() => {
    const fetchAturan = async () => {
      try {
        setLoadingAturan(true);
        const res = await aturanService.listOwner();
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
      {/* Header merah */}
      <div className="bg-red-800 text-white px-4 sm:px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl md:text-2xl font-extrabold tracking-tight">S.O.P dan Aturan</h1>
            <p className="text-sm text-red-100">Owner - SDM</p>
          </div>
          {/* Tombol tambah disembunyikan untuk Owner */}
        </div>
      </div>

      {/* Info bar */}
      <div className="bg-gray-100 px-4 sm:px-6 py-2 text-xs text-gray-700">
        Terakhir diupdate: {new Date().toLocaleString('id-ID', { day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
      </div>

      {/* Dua kolom: S.O.P dan Aturan */}
      <div className="p-4 sm:p-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Kolom S.O.P */}
          <div className="bg-white border rounded-lg shadow-sm">
            <div className="px-4 py-3 border-b flex items-center justify-between">
              <div>
                <h2 className="text-base md:text-lg font-semibold text-gray-900">S.O.P</h2>
                <p className="text-xs text-gray-500">Standar Operasional Prosedur</p>
              </div>
              {/* Tombol tambah disembunyikan untuk Owner */}
            </div>
            <div className="p-4">
              {/* Toolbar kecil */}
              <div className="mb-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input type="text" className="w-full pl-9 pr-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-red-500 focus:border-transparent" placeholder="Cari S.O.P..." />
                </div>
              </div>
              {/* Daftar SOP (collapsible) */}
              {loadingSop ? (
                <div className="text-sm text-gray-500">Memuat SOP...</div>
              ) : errorSop ? (
                <div className="text-sm text-red-600">{errorSop}</div>
              ) : sop.length === 0 ? (
                <div className="border rounded-lg p-4 text-center text-gray-600">
                  <FileText className="w-8 h-8 text-red-600 mx-auto mb-2" />
                  <p className="text-sm">Belum ada S.O.P ditampilkan.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {sop.map((div) => {
                    const dOpen = !!openSopDiv[div.id];
                    const catCount = div.categories?.length || 0;
                    return (
                      <div key={`sop-div-${div.id}`} className="border rounded-md bg-white">
                        <button
                          type="button"
                          onClick={() => setOpenSopDiv((s) => ({ ...s, [div.id]: !s[div.id] }))}
                          className="w-full flex items-center justify-between px-3 py-2 hover:bg-gray-50"
                        >
                          <div className="font-medium text-gray-800">
                            {div.nama_divisi}
                            <span className="ml-2 text-xs bg-gray-100 text-gray-700 rounded px-2 py-0.5">{catCount} Kategori</span>
                          </div>
                          <svg className={`h-4 w-4 text-gray-500 transition-transform ${dOpen ? 'rotate-180' : ''}`} viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.08 1.04l-4.25 4.25a.75.75 0 01-1.06 0L5.21 8.27a.75.75 0 01.02-1.06z" clipRule="evenodd"/></svg>
                        </button>
                        {dOpen && (
                          <div className="px-3 pb-3">
                            {catCount > 0 ? (
                              <div className="space-y-2">
                                {div.categories.map((cat) => {
                                  const cOpen = !!openSopCat[cat.id];
                                  const stepCount = cat.steps?.length || 0;
                                  return (
                                    <div key={`sop-cat-${cat.id}`} className="border rounded-md">
                                      <button
                                        type="button"
                                        onClick={() => setOpenSopCat((s) => ({ ...s, [cat.id]: !s[cat.id] }))}
                                        className="w-full flex items-center justify-between px-3 py-2 hover:bg-gray-50"
                                      >
                                        <div className="text-gray-700 font-medium">
                                          {cat.nama_category}
                                          <span className="ml-2 text-xs bg-gray-100 text-gray-700 rounded px-2 py-0.5">{stepCount} Langkah</span>
                                        </div>
                                        <svg className={`h-4 w-4 text-gray-500 transition-transform ${cOpen ? 'rotate-180' : ''}`} viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.08 1.04l-4.25 4.25a.75.75 0 01-1.06 0L5.21 8.27a.75.75 0 01.02-1.06z" clipRule="evenodd"/></svg>
                                      </button>
                                      {cOpen && (
                                        <div className="px-3 pb-3">
                                          {stepCount > 0 ? (
                                            <ul className="mt-1 list-disc list-inside space-y-1 text-sm text-gray-700">
                                              {cat.steps.map((step) => (
                                                <li key={`sop-step-${step.id}`}>{step.judul_procedure}</li>
                                              ))}
                                            </ul>
                                          ) : (
                                            <div className="text-xs text-gray-400 mt-1">Tidak ada langkah.</div>
                                          )}
                                        </div>
                                      )}
                                    </div>
                                  );
                                })}
                              </div>
                            ) : (
                              <div className="text-sm text-gray-500 mt-2">Tidak ada kategori.</div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Kolom Aturan */}
          <div className="bg-white border rounded-lg shadow-sm">
            <div className="px-4 py-3 border-b flex items-center justify-between">
              <div>
                <h2 className="text-base md:text-lg font-semibold text-gray-900">Aturan</h2>
                <p className="text-xs text-gray-500">Aturan & Tata Tertib Kerja</p>
              </div>
              {/* Tombol tambah disembunyikan untuk Owner */}
            </div>
            <div className="p-4">
              {/* Toolbar kecil */}
              <div className="mb-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input type="text" className="w-full pl-9 pr-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-red-500 focus:border-transparent" placeholder="Cari Aturan..." />
                </div>
              </div>
              {/* Daftar Aturan */}
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
                    // Normalisasi images jika string
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

export default OwnerSopAturan;
