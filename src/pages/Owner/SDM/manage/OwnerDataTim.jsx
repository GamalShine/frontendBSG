import React, { useEffect, useMemo, useState } from 'react';
import { ChevronDown, ChevronRight, Users, Search } from 'lucide-react';
import { ownerSdmService } from '@/services/ownerSdmService';
import { MENU_CODES } from '@/config/menuCodes';

const OwnerDataTim = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [hierarchy, setHierarchy] = useState([]); // divisi -> jabatan -> employees
  const [expandedDivisi, setExpandedDivisi] = useState({});
  const [expandedJabatan, setExpandedJabatan] = useState({});
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState(null);
  const [detail, setDetail] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState(null);

  const Row = ({ label, children }) => (
    <div className="grid grid-cols-1 md:grid-cols-3 border-t">
      <div className="px-4 py-2 text-xs md:text-sm font-medium text-gray-600 bg-gray-50">{label}</div>
      <div className="px-4 py-2 md:col-span-2 text-sm text-gray-800">{children || '-'}</div>
    </div>
  );

  const formatCurrency = (n) => {
    if (n === null || n === undefined) return '-';
    const val = Number(n) || 0;
    return `Rp ${val.toLocaleString('id-ID')}`;
  };

  const fetchHierarchy = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await ownerSdmService.getHierarchy();
      if (!res?.success) {
        throw new Error(res?.message || 'Gagal memuat hierarchy');
      }
      setHierarchy(res.data || []);
    } catch (err) {
      setError(err.message || 'Terjadi kesalahan');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchHierarchy(); }, []);

  useEffect(() => {
    const load = async () => {
      if (!selected?.id) return;
      try {
        setDetailLoading(true);
        setDetailError(null);
        const res = await ownerSdmService.getEmployeeById(selected.id);
        if (!res?.success) throw new Error(res?.message || 'Gagal memuat data');
        setDetail(res.data);
      } catch (err) {
        setDetailError(err.message || 'Terjadi kesalahan');
      } finally {
        setDetailLoading(false);
      }
    };
    if (selected) load();
    else {
      setDetail(null);
      setDetailError(null);
      setDetailLoading(false);
    }
  }, [selected]);

  const filteredHierarchy = useMemo(() => {
    if (!search.trim()) return hierarchy;
    const q = search.toLowerCase();
    return hierarchy.map(div => {
      const jabs = (div.children || []).map(jab => {
        const emps = (jab.children || []).filter(emp =>
          (emp.name || '').toLowerCase().includes(q) ||
          (emp.email || '').toLowerCase().includes(q) ||
          (jab.name || '').toLowerCase().includes(q) ||
          (div.name || '').toLowerCase().includes(q)
        );
        return { ...jab, children: emps };
      }).filter(j => j.children && j.children.length > 0);
      return { ...div, children: jabs };
    }).filter(d => d.children && d.children.length > 0);
  }, [hierarchy, search]);

  const toggleDivisi = (id) => setExpandedDivisi(prev => ({ ...prev, [id]: !prev[id] }));
  const toggleJabatan = (id) => setExpandedJabatan(prev => ({ ...prev, [id]: !prev[id] }));

  return (
    <div className="p-0 bg-gray-50 min-h-screen">
      {/* Header (tanpa tombol tambah) */}
      <div className="bg-red-800 text-white px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span className="text-sm font-semibold bg-white/10 rounded px-2 py-1">{MENU_CODES.sdm.dataTim}</span>
            <div>
              <h1 className="text-xl md:text-2xl font-extrabold tracking-tight">DATA TIM</h1>
              <p className="text-sm text-red-100">Struktur tim: divisi, jabatan, dan karyawan</p>
            </div>
          </div>
        </div>
      </div>

      {/* Toolbar Pencarian */}
      <div className="px-6 py-4 bg-gray-50">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Cari nama karyawan, jabatan, divisi..." className="pl-10 pr-3 py-2 w-full border rounded-lg text-sm focus:ring-2 focus:ring-red-500 focus:border-transparent" />
        </div>
      </div>

      {/* Konten Hierarki */}
      <div className="px-6 pb-8">
        <div className="bg-white rounded-none shadow-sm border">
          {loading && <div className="p-8 text-center text-gray-500">Memuat data...</div>}
          {error && !loading && <div className="p-8 text-center text-red-600">{error}</div>}
          {!loading && !error && (
            <div className="divide-y">
              {(filteredHierarchy || []).map(div => {
                  const totalDiv = (div.children || []).reduce((acc, j) => acc + (j.children?.length || 0), 0);
                  const openDiv = !!expandedDivisi[div.id];
                  return (
                    <div key={div.id} className="p-4">
                      <button onClick={() => toggleDivisi(div.id)} className="w-full flex items-center justify-between text-left">
                        <div className="flex items-center gap-2">
                          {openDiv ? <ChevronDown className="h-5 w-5 text-gray-600" /> : <ChevronRight className="h-5 w-5 text-gray-600" />}
                          <span className="font-semibold text-gray-800">{div.name}</span>
                        </div>
                        <span className="text-sm text-gray-600">{totalDiv} orang</span>
                      </button>
                      {openDiv && (
                        <div className="mt-3 ml-7 space-y-2">
                          {(div.children || []).map(jab => {
                            const openJab = !!expandedJabatan[jab.id];
                            return (
                              <div key={jab.id} className="border rounded-lg">
                                <div className="px-3 py-2 bg-gray-50 flex items-center justify-between">
                                  <button onClick={() => toggleJabatan(jab.id)} className="flex items-center gap-2">
                                    {openJab ? <ChevronDown className="h-4 w-4 text-gray-600" /> : <ChevronRight className="h-4 w-4 text-gray-600" />}
                                    <span className="font-medium text-gray-700">{jab.name}</span>
                                  </button>
                                  <span className="text-xs text-gray-600">{jab.children?.length || 0} orang</span>
                                </div>
                                {openJab && (
                                  <div className="divide-y">
                                    {(jab.children || []).map(emp => (
                                      <div key={emp.id} className="px-3 py-3 flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                          <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-red-100 text-red-700"><Users className="h-4 w-4" /></span>
                                          <div>
                                            <div className="font-semibold text-gray-900">{emp.name}</div>
                                            <div className="text-xs text-gray-500">{emp?.jabatan?.nama_jabatan} • {emp?.jabatan?.divisi?.nama_divisi}</div>
                                          </div>
                                        </div>
                                        <div>
                                          <button onClick={() => setSelected(emp)} className="text-blue-600 hover:text-blue-800 text-sm">Detail</button>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
                {(!filteredHierarchy || filteredHierarchy.length === 0) && (
                  <div className="p-8 text-center text-gray-500">Tidak ada data</div>
                )}
            </div>
          )}
        </div>
      </div>

      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50" onClick={() => setSelected(null)} />
          <div className="relative z-10 w-full max-w-3xl bg-white rounded-lg shadow-lg">
            <div className="px-6 py-4 border-b flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-800">Detail Anggota Tim</h2>
              <button className="p-2 rounded-md hover:bg-gray-100" onClick={() => setSelected(null)} aria-label="Tutup">✕</button>
            </div>
            {detailLoading && <div className="p-6 text-center text-gray-500">Memuat detail...</div>}
            {detailError && !detailLoading && <div className="p-6 text-center text-red-600">{detailError}</div>}
            {!detailLoading && !detailError && detail && (
              <div className="overflow-hidden">
                <div className="px-4 py-4 border-b">
                  <div className="text-lg font-semibold">{detail.nama}</div>
                  <div className="text-sm text-gray-500">{detail?.jabatan?.nama_jabatan} • {detail?.jabatan?.divisi?.nama_divisi}</div>
                </div>

                <div className="px-4 py-3 bg-gray-50 text-sm font-semibold text-gray-700">Informasi Personal</div>
                <Row label="Nama Lengkap">{detail.nama}</Row>
                <Row label="Email">{detail.email}</Row>
                <Row label="No. HP">{detail.no_hp}</Row>
                <Row label="Tempat Lahir">{detail.tempat_lahir}</Row>
                <Row label="Tanggal Lahir">{detail.tanggal_lahir ? new Date(detail.tanggal_lahir).toLocaleDateString('id-ID') : '-'}</Row>
                <Row label="Media Sosial">{detail.media_sosial}</Row>

                <div className="px-4 py-3 bg-gray-50 text-sm font-semibold text-gray-700">Informasi Keluarga</div>
                <Row label="Nama Pasangan">{detail.nama_pasangan}</Row>
                <Row label="Nama Anak">{detail.nama_anak}</Row>
                <Row label="No. HP Pasangan">{detail.no_hp_pasangan}</Row>
                <Row label="Kontak Darurat">{detail.kontak_darurat}</Row>

                <div className="px-4 py-3 bg-gray-50 text-sm font-semibold text-gray-700">Informasi Alamat</div>
                <Row label="Alamat Sekarang">{detail.alamat_sekarang}</Row>
                <Row label="Link Google Map Sekarang">{detail.link_map_sekarang ? (<a className="text-blue-600 hover:underline" href={detail.link_map_sekarang} target="_blank" rel="noreferrer">Buka Link</a>) : '-'}</Row>
                <Row label="Alamat Asal">{detail.alamat_asal}</Row>
                <Row label="Link Google Map Asal">{detail.link_map_asal ? (<a className="text-blue-600 hover:underline" href={detail.link_map_asal} target="_blank" rel="noreferrer">Buka Link</a>) : '-'}</Row>
                <Row label="Nama Orang Tua">{detail.nama_orang_tua}</Row>
                <Row label="Alamat Orang Tua">{detail.alamat_orang_tua}</Row>
                <Row label="Link Google Map Orang Tua">{detail.link_map_orang_tua ? (<a className="text-blue-600 hover:underline" href={detail.link_map_orang_tua} target="_blank" rel="noreferrer">Buka Link</a>) : '-'}</Row>

                <div className="px-4 py-3 bg-gray-50 text-sm font-semibold text-gray-700">Informasi Kerja</div>
                <Row label="Tanggal Bergabung">{detail.tanggal_bergabung ? new Date(detail.tanggal_bergabung).toLocaleDateString('id-ID') : '-'}</Row>
                <Row label="Lama Bekerja">{detail.lama_bekerja}</Row>
                <Row label="Divisi">{detail?.jabatan?.divisi?.nama_divisi}</Row>
                <Row label="Jabatan">{detail?.jabatan?.nama_jabatan}</Row>

                <Row label="Data Training">{`DASAR ${detail.training_dasar ? '✓' : '✗'}, SKILLO ${detail.training_skillo ? '✓' : '✗'}, LEADERSHIP ${detail.training_leadership ? '✓' : '✗'}, LANJUTAN ${detail.training_lanjutan ? '✓' : '✗'}`}</Row>

                <div className="px-4 py-3 bg-gray-50 text-sm font-semibold text-gray-700">Informasi Gaji</div>
                <Row label="Gaji Pokok">{formatCurrency(detail.gaji_pokok)}</Row>
                <Row label="Tunjangan Kinerja">{formatCurrency(detail.tunjangan_kinerja)}</Row>
                <Row label="Tunjangan Posisi">{formatCurrency(detail.tunjangan_posisi)}</Row>
                <Row label="Uang Makan">{formatCurrency(detail.uang_makan)}</Row>
                <Row label="Lembur">{formatCurrency(detail.lembur)}</Row>
                <Row label="Bonus">{formatCurrency(detail.bonus)}</Row>
                <Row label="Total Gaji">{formatCurrency(detail.total_gaji)}</Row>
                <Row label="Potongan">{formatCurrency(detail.potongan)}</Row>
                <Row label="BPJSTK">{formatCurrency(detail.bpjstk)}</Row>
                <Row label="BPJS Kesehatan">{formatCurrency(detail.bpjs_kesehatan)}</Row>
                <Row label="BPJS Kes Penambahan">{formatCurrency(detail.bpjs_kes_penambahan)}</Row>
                <Row label="SP 1/2">{formatCurrency(detail.sp_1_2)}</Row>
                <Row label="Pinjaman Karyawan">{formatCurrency(detail.pinjaman_karyawan)}</Row>
                <Row label="PPH21">{formatCurrency(detail.pph21)}</Row>
                <Row label="Total Potongan">{formatCurrency(detail.total_potongan)}</Row>
                <Row label="Total Gaji yang Dibayarkan">{formatCurrency(detail.total_gaji_dibayarkan)}</Row>
              </div>
            )}
            <div className="px-6 py-4 border-t flex justify-end">
              <button className="px-4 py-2 rounded-md border border-gray-300 hover:bg-gray-100" onClick={() => setSelected(null)}>Tutup</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OwnerDataTim;

