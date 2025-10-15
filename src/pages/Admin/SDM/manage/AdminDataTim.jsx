import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, ChevronDown, ChevronRight, Users, Search } from 'lucide-react';
import { adminSdmService } from '@/services/adminSdmService';
import { MENU_CODES } from '@/config/menuCodes';

const AdminDataTim = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [hierarchy, setHierarchy] = useState([]); // divisi -> jabatan -> employees
  const [expandedDivisi, setExpandedDivisi] = useState({});
  const [expandedJabatan, setExpandedJabatan] = useState({});
  const [search, setSearch] = useState('');
  const [selectedDivisi, setSelectedDivisi] = useState('');
  const [selectedJabatan, setSelectedJabatan] = useState('');
  const [selected, setSelected] = useState(null);
  const [detail, setDetail] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState(null);
  // Edit modal state
  const [editTarget, setEditTarget] = useState(null);
  const [editForm, setEditForm] = useState({
    // Informasi Personal
    nama: '',
    email: '',
    no_hp: '',
    tempat_lahir: '',
    tanggal_lahir: '',
    media_sosial: '',
    // Informasi Keluarga
    nama_pasangan: '',
    nama_anak: '',
    no_hp_pasangan: '',
    kontak_darurat: '',
    // Informasi Alamat
    alamat_sekarang: '',
    link_map_sekarang: '',
    alamat_asal: '',
    link_map_asal: '',
    nama_orang_tua: '',
    alamat_orang_tua: '',
    link_map_orang_tua: '',
    // Informasi Kerja
    tanggal_bergabung: '',
    lama_bekerja: '',
    jabatan_id: ''
  });
  const [editLoading, setEditLoading] = useState(false);
  const [savingEdit, setSavingEdit] = useState(false);

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
      const res = await adminSdmService.getHierarchy();
      if (!res?.success) throw new Error(res?.message || 'Gagal memuat hierarchy');
      const data = res.data || [];
      setHierarchy(data);
    } catch (err) {
      setError(err.message || 'Terjadi kesalahan');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchHierarchy(); }, []);

  // Load detail lengkap saat selected berubah
  useEffect(() => {
    const load = async () => {
      if (!selected?.id) return;
      try {
        setDetailLoading(true);
        setDetailError(null);
        const res = await adminSdmService.getEmployeeById(selected.id);
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

  // Load data untuk modal edit saat editTarget berubah
  useEffect(() => {
    const loadEdit = async () => {
      if (!editTarget?.id) return;
      try {
        setEditLoading(true);
        const res = await adminSdmService.getEmployeeById(editTarget.id);
        if (!res?.success) throw new Error(res?.message || 'Gagal memuat data');
        const d = res.data || {};
        setEditForm({
          // Personal
          nama: d.nama || '',
          email: d.email || '',
          no_hp: d.no_hp || '',
          tempat_lahir: d.tempat_lahir || '',
          tanggal_lahir: d.tanggal_lahir ? String(d.tanggal_lahir).slice(0,10) : '',
          media_sosial: d.media_sosial || '',
          // Keluarga
          nama_pasangan: d.nama_pasangan || '',
          nama_anak: d.nama_anak || '',
          no_hp_pasangan: d.no_hp_pasangan || '',
          kontak_darurat: d.kontak_darurat || '',
          // Alamat
          alamat_sekarang: d.alamat_sekarang || '',
          link_map_sekarang: d.link_map_sekarang || '',
          alamat_asal: d.alamat_asal || '',
          link_map_asal: d.link_map_asal || '',
          nama_orang_tua: d.nama_orang_tua || '',
          alamat_orang_tua: d.alamat_orang_tua || '',
          link_map_orang_tua: d.link_map_orang_tua || '',
          // Kerja
          tanggal_bergabung: d.tanggal_bergabung ? String(d.tanggal_bergabung).slice(0,10) : '',
          lama_bekerja: d.lama_bekerja || '',
          jabatan_id: d?.jabatan?.id || ''
        });
      } catch (e) {
        console.error(e);
        setEditForm({
          nama: editTarget?.name || '',
          email: editTarget?.email || '',
          no_hp: editTarget?.no_hp || '',
          tempat_lahir: editTarget?.tempat_lahir || '',
          tanggal_lahir: editTarget?.tanggal_lahir ? String(editTarget.tanggal_lahir).slice(0,10) : '',
          media_sosial: editTarget?.media_sosial || '',
          nama_pasangan: editTarget?.nama_pasangan || '',
          nama_anak: editTarget?.nama_anak || '',
          no_hp_pasangan: editTarget?.no_hp_pasangan || '',
          kontak_darurat: editTarget?.kontak_darurat || '',
          alamat_sekarang: editTarget?.alamat_sekarang || '',
          link_map_sekarang: editTarget?.link_map_sekarang || '',
          alamat_asal: editTarget?.alamat_asal || '',
          link_map_asal: editTarget?.link_map_asal || '',
          nama_orang_tua: editTarget?.nama_orang_tua || '',
          alamat_orang_tua: editTarget?.alamat_orang_tua || '',
          link_map_orang_tua: editTarget?.link_map_orang_tua || '',
          tanggal_bergabung: editTarget?.tanggal_bergabung ? String(editTarget.tanggal_bergabung).slice(0,10) : '',
          lama_bekerja: editTarget?.lama_bekerja || '',
          jabatan_id: editTarget?.jabatan?.id || ''
        });
      } finally {
        setEditLoading(false);
      }
    };
    if (editTarget) loadEdit();
    else {
      setEditForm({ nama: '', email: '', no_hp: '', jabatan_id: '' });
      setEditLoading(false);
    }
  }, [editTarget]);

  // Options untuk select
  const divisiOptions = useMemo(() => (hierarchy || []).map(d => ({ id: d.id, name: d.name })), [hierarchy]);
  const jabatanOptions = useMemo(() => {
    const build = [];
    (hierarchy || []).forEach(d => {
      if (selectedDivisi && String(d.id) !== String(selectedDivisi)) return;
      (d.children || []).forEach(j => build.push({ id: j.id, name: j.name }));
    });
    // unik berdasarkan id
    const seen = new Set();
    return build.filter(j => (seen.has(j.id) ? false : (seen.add(j.id), true)));
  }, [hierarchy, selectedDivisi]);

  const filteredHierarchy = useMemo(() => {
    const q = (search || '').toLowerCase();
    const matchText = (div, jab, emp) => {
      if (!q) return true;
      return (
        (emp?.name || '').toLowerCase().includes(q) ||
        (emp?.email || '').toLowerCase().includes(q) ||
        (jab?.name || '').toLowerCase().includes(q) ||
        (div?.name || '').toLowerCase().includes(q)
      );
    };

    // Terapkan filter Divisi/Jabatan dan kata kunci ke struktur
    return (hierarchy || [])
      .filter(div => !selectedDivisi || String(div.id) === String(selectedDivisi))
      .map(div => {
        const jabs = (div.children || [])
          .filter(j => !selectedJabatan || String(j.id) === String(selectedJabatan))
          .map(jab => {
            const emps = (jab.children || []).filter(emp => matchText(div, jab, emp));
            return { ...jab, children: emps };
          })
          .filter(j => j.children && j.children.length > 0);
        return { ...div, children: jabs };
      })
      .filter(d => d.children && d.children.length > 0);
  }, [hierarchy, search, selectedDivisi, selectedJabatan]);

  const toggleDivisi = (id) => setExpandedDivisi(prev => ({ ...prev, [id]: !prev[id] }));
  const toggleJabatan = (id) => setExpandedJabatan(prev => ({ ...prev, [id]: !prev[id] }));

  return (
    <div className="p-0 bg-gray-50 min-h-screen">
      {/* Global style untuk sembunyikan scrollbar */}
      <style>{`
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        .no-scrollbar::-webkit-scrollbar { display: none; }
      `}</style>
      {/* Header */}
      <div className="bg-red-800 text-white px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span className="text-sm font-semibold bg-white/10 rounded px-2 py-1">{MENU_CODES.sdm.dataTim}</span>
            <div>
              <h1 className="text-xl md:text-2xl font-extrabold tracking-tight">DATA TIM</h1>
              <p className="text-sm text-red-100">Kelola data tim: divisi, jabatan, dan karyawan</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => navigate('/admin/sdm/jabatan') } className="px-3 py-1.5 rounded-full border border-white/60 text-white hover:bg-white/10">JABATAN</button>
            <button onClick={() => navigate('/admin/sdm/divisi') } className="px-3 py-1.5 rounded-full border border-white/60 text-white hover:bg-white/10">DIVISI</button>
            <button onClick={() => navigate('/admin/sdm/tim/new')} className="inline-flex items-center gap-2 px-4 py-2 bg-white text-red-700 rounded-lg hover:bg-red-50 transition-colors shadow-sm">
              <Plus className="h-4 w-4" />
              <span className="font-semibold">Tambah</span>
            </button>
          </div>
        </div>
      </div>

      {/* Form Pencarian - full-bleed, 1 baris */}
      <div className="px-0 pt-4 mb-2">
        <div className="bg-white rounded-md shadow-sm border border-gray-100">
          <div className="px-6 py-4 grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Cari</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Cari nama / jabatan / divisi"
                  className="pl-10 pr-3 py-2 w-full border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-red-500 focus:border-transparent"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Divisi</label>
              <select
                value={selectedDivisi}
                onChange={(e) => { setSelectedDivisi(e.target.value); setSelectedJabatan(''); }}
                className="px-3 py-2 w-full border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-red-500 focus:border-transparent"
              >
                <option value="">Semua Divisi</option>
                {divisiOptions.map(d => (
                  <option key={d.id} value={d.id}>{d.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Jabatan</label>
              <select
                value={selectedJabatan}
                onChange={(e) => setSelectedJabatan(e.target.value)}
                className="px-3 py-2 w-full border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-red-500 focus:border-transparent"
              >
                <option value="">Semua Jabatan</option>
                {jabatanOptions.map(j => (
                  <option key={j.id} value={j.id}>{j.name}</option>
                ))}
              </select>
            </div>
            <div className="flex items-end">
              <button
                type="button"
                onClick={() => { setSearch(''); setSelectedDivisi(''); setSelectedJabatan(''); }}
                className="inline-flex items-center gap-2 px-5 py-2 rounded-full border border-red-600 text-red-700 hover:bg-red-50 transition-colors"
              >
                Reset
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="px-0 pb-8 pt-3">
        <div className="bg-white rounded-md shadow-sm border border-gray-100">
          {loading && <div className="p-8 text-center text-gray-500">Memuat data...</div>}
          {error && !loading && <div className="p-8 text-center text-red-600">{error}</div>}
          {!loading && !error && (
            <div className="divide-y">
              {(filteredHierarchy || []).map(div => {
                const totalDiv = (div.children || []).reduce((acc, j) => acc + (j.children?.length || 0), 0);
                const openDiv = !!expandedDivisi[div.id];
                return (
                  <div key={div.id} className="">
                    <button onClick={() => toggleDivisi(div.id)} className="w-full px-6 py-3 bg-red-800 text-white flex items-center justify-between hover:bg-red-900 transition-colors">
                      <div className="flex items-center gap-2">
                        {openDiv ? <ChevronDown className="h-5 w-5" /> : <ChevronRight className="h-5 w-5" />}
                        <span className="font-semibold tracking-tight">{div.name}</span>
                      </div>
                      <span className="text-sm bg-red-700 px-2 py-1 rounded-full">{totalDiv}</span>
                    </button>
                    {openDiv && (
                      <div className="mt-0 px-4 md:px-6 py-4 grid grid-cols-1 gap-3">
                        {(div.children || []).map(jab => {
                          const openJab = !!expandedJabatan[jab.id];
                          return (
                            <div key={jab.id} className="bg-white rounded-md shadow-sm border border-gray-100 overflow-hidden">
                              <div className="px-3 py-2 bg-gray-50 flex items-center justify-between">
                                <button onClick={() => toggleJabatan(jab.id)} className="flex items-center gap-2 text-left">
                                  {openJab ? <ChevronDown className="h-4 w-4 text-gray-600" /> : <ChevronRight className="h-4 w-4 text-gray-600" />}
                                  <span className="font-medium text-gray-700 text-sm">{jab.name}</span>
                                </button>
                                <span className="text-xs bg-gray-200 px-2 py-0.5 rounded-full text-gray-700">{jab.children?.length || 0}</span>
                              </div>
                              {openJab && (
                                <div className="divide-y">
                                  {(jab.children || []).map(emp => (
                                    <div key={emp.id} className="px-3 py-2 flex items-center justify-between text-sm">
                                      <div className="flex items-center gap-3 min-w-0">
                                        <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-red-100 text-red-700 flex-shrink-0"><Users className="h-4 w-4" /></span>
                                        <div className="min-w-0">
                                          <div className="font-semibold text-gray-900 truncate">{emp.name}</div>
                                          <div className="text-xs text-gray-500 truncate">{emp?.jabatan?.nama_jabatan} • {emp?.jabatan?.divisi?.nama_divisi}</div>
                                        </div>
                                      </div>
                                      <div className="flex items-center gap-2 flex-shrink-0">
                                        <button onClick={() => setSelected(emp)} className="px-2 py-1 text-blue-600 hover:bg-blue-50 rounded text-xs">Detail</button>
                                        <button onClick={() => setEditTarget(emp)} className="px-2 py-1 text-gray-700 hover:bg-gray-50 rounded text-xs">Edit</button>
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
          <div className="relative z-10 w-full max-w-4xl bg-white rounded-2xl shadow-2xl border flex flex-col max-h-[92vh] overflow-hidden">
            {/* Header */}
            <div className="px-6 py-4 bg-red-800 text-white flex items-center justify-between">
              <h2 className="text-lg font-semibold">Detail Anggota Tim</h2>
              <button className="p-2 rounded-md hover:bg-white/10" onClick={() => setSelected(null)} aria-label="Tutup">✕</button>
            </div>

            {/* Body scrollable */}
            <div className="flex-1 min-h-0 overflow-y-auto no-scrollbar">
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
            </div>

            {/* Footer buttons */}
            <div className="p-0 border-t bg-white">
              <div className="grid grid-cols-2 gap-2 px-2 py-2">
                <button className="w-full py-3 bg-red-700 text-white font-semibold hover:bg-red-800 transition-colors rounded-lg" onClick={() => setSelected(null)}>Tutup</button>
                <button className="w-full py-3 bg-red-700 text-white font-semibold hover:bg-red-800 transition-colors rounded-lg" onClick={() => { setEditTarget(detail); setSelected(null); }}>Edit</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {editTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50" onClick={() => setEditTarget(null)} />
          <div className="relative z-10 w-full max-w-3xl bg-white rounded-2xl shadow-2xl border flex flex-col max-h-[92vh] overflow-hidden">
            {/* Header */}
            <div className="px-6 py-4 bg-red-800 text-white flex items-center justify-between">
              <h2 className="text-lg font-semibold">Edit Anggota Tim</h2>
              <button className="p-2 rounded-md hover:bg-white/10" onClick={() => setEditTarget(null)} aria-label="Tutup">✕</button>
            </div>

            {/* Body */}
            <div className="flex-1 min-h-0 overflow-y-auto no-scrollbar">
              {editLoading ? (
                <div className="p-6 text-center text-gray-500">Memuat data...</div>
              ) : (
                <div className="p-0">
                  {/* Header ringkas seperti modal Detail */}
                  <div className="px-4 py-4 border-b">
                    <div className="text-lg font-semibold">{editForm.nama || editTarget?.name || '-'}</div>
                    <div className="text-sm text-gray-500">{editTarget?.jabatan?.nama_jabatan} • {editTarget?.jabatan?.divisi?.nama_divisi}</div>
                  </div>
                  {/* Informasi Personal */}
                  <div className="px-4 py-3 bg-gray-50 text-sm font-semibold text-gray-700">Informasi Personal</div>
                  <div className="p-4 space-y-4">
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Nama</label>
                      <input value={editForm.nama} onChange={(e) => setEditForm(f => ({ ...f, nama: e.target.value }))} className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-red-500 focus:border-transparent" placeholder="Nama lengkap" />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">Email</label>
                        <input type="email" value={editForm.email} onChange={(e) => setEditForm(f => ({ ...f, email: e.target.value }))} className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-red-500 focus:border-transparent" placeholder="email@domain.com" />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">No. HP</label>
                        <input value={editForm.no_hp} onChange={(e) => setEditForm(f => ({ ...f, no_hp: e.target.value }))} className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-red-500 focus:border-transparent" placeholder="08xxxxxxxxxx" />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">Media Sosial</label>
                        <input value={editForm.media_sosial} onChange={(e) => setEditForm(f => ({ ...f, media_sosial: e.target.value }))} className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-red-500 focus:border-transparent" placeholder="@username / url" />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">Tempat Lahir</label>
                        <input value={editForm.tempat_lahir} onChange={(e) => setEditForm(f => ({ ...f, tempat_lahir: e.target.value }))} className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-red-500 focus:border-transparent" />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">Tanggal Lahir</label>
                        <input type="date" value={editForm.tanggal_lahir} onChange={(e) => setEditForm(f => ({ ...f, tanggal_lahir: e.target.value }))} className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-red-500 focus:border-transparent" />
                      </div>
                    </div>
                  </div>

                  {/* Informasi Keluarga */}
                  <div className="px-4 py-3 bg-gray-50 text-sm font-semibold text-gray-700">Informasi Keluarga</div>
                  <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Nama Pasangan</label>
                      <input value={editForm.nama_pasangan} onChange={(e) => setEditForm(f => ({ ...f, nama_pasangan: e.target.value }))} className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-red-500 focus:border-transparent" />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">No. HP Pasangan</label>
                      <input value={editForm.no_hp_pasangan} onChange={(e) => setEditForm(f => ({ ...f, no_hp_pasangan: e.target.value }))} className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-red-500 focus:border-transparent" />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Nama Anak</label>
                      <input value={editForm.nama_anak} onChange={(e) => setEditForm(f => ({ ...f, nama_anak: e.target.value }))} className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-red-500 focus:border-transparent" />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Kontak Darurat</label>
                      <input value={editForm.kontak_darurat} onChange={(e) => setEditForm(f => ({ ...f, kontak_darurat: e.target.value }))} className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-red-500 focus:border-transparent" />
                    </div>
                  </div>

                  {/* Informasi Alamat */}
                  <div className="px-4 py-3 bg-gray-50 text-sm font-semibold text-gray-700">Informasi Alamat</div>
                  <div className="p-4 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">Alamat Sekarang</label>
                        <input value={editForm.alamat_sekarang} onChange={(e) => setEditForm(f => ({ ...f, alamat_sekarang: e.target.value }))} className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-red-500 focus:border-transparent" />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">Link Google Map Sekarang</label>
                        <input value={editForm.link_map_sekarang} onChange={(e) => setEditForm(f => ({ ...f, link_map_sekarang: e.target.value }))} className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-red-500 focus:border-transparent" placeholder="https://maps.google.com/..." />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">Alamat Asal</label>
                        <input value={editForm.alamat_asal} onChange={(e) => setEditForm(f => ({ ...f, alamat_asal: e.target.value }))} className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-red-500 focus:border-transparent" />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">Link Google Map Asal</label>
                        <input value={editForm.link_map_asal} onChange={(e) => setEditForm(f => ({ ...f, link_map_asal: e.target.value }))} className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-red-500 focus:border-transparent" placeholder="https://maps.google.com/..." />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">Nama Orang Tua</label>
                        <input value={editForm.nama_orang_tua} onChange={(e) => setEditForm(f => ({ ...f, nama_orang_tua: e.target.value }))} className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-red-500 focus:border-transparent" />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">Alamat Orang Tua</label>
                        <input value={editForm.alamat_orang_tua} onChange={(e) => setEditForm(f => ({ ...f, alamat_orang_tua: e.target.value }))} className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-red-500 focus:border-transparent" />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Link Google Map Orang Tua</label>
                      <input value={editForm.link_map_orang_tua} onChange={(e) => setEditForm(f => ({ ...f, link_map_orang_tua: e.target.value }))} className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-red-500 focus:border-transparent" placeholder="https://maps.google.com/..." />
                    </div>
                  </div>

                  {/* Informasi Kerja */}
                  <div className="px-4 py-3 bg-gray-50 text-sm font-semibold text-gray-700">Informasi Kerja</div>
                  <div className="p-4 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">Tanggal Bergabung</label>
                        <input type="date" value={editForm.tanggal_bergabung} onChange={(e) => setEditForm(f => ({ ...f, tanggal_bergabung: e.target.value }))} className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-red-500 focus:border-transparent" />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">Lama Bekerja</label>
                        <input value={editForm.lama_bekerja} onChange={(e) => setEditForm(f => ({ ...f, lama_bekerja: e.target.value }))} className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-red-500 focus:border-transparent" placeholder="mis. 24 bulan" />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">Jabatan</label>
                        <select value={editForm.jabatan_id} onChange={(e) => setEditForm(f => ({ ...f, jabatan_id: e.target.value }))} className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-red-500 focus:border-transparent">
                          <option value="">Pilih Jabatan</option>
                          {(hierarchy || []).flatMap(d => d.children || []).map(j => (
                            <option key={j.id} value={j.id}>{j.name}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-0 border-t bg-white">
              <div className="grid grid-cols-2 gap-2 px-2 py-2">
                <button className="w-full py-3 bg-red-700 text-white font-semibold hover:bg-red-800 transition-colors rounded-lg" onClick={() => setEditTarget(null)}>Batal</button>
                <button
                  className="w-full py-3 bg-red-700 text-white font-semibold hover:bg-red-800 transition-colors rounded-lg disabled:opacity-60"
                  disabled={savingEdit || editLoading}
                  onClick={async () => {
                    if (!editTarget?.id) return;
                    try {
                      setSavingEdit(true);
                      const payload = { ...editForm };
                      const res = await adminSdmService.updateEmployee(editTarget.id, payload);
                      if (res?.success === false) throw new Error(res?.message || 'Gagal menyimpan');
                      // Refresh data
                      await fetchHierarchy();
                      // Refresh detail jika sedang terbuka untuk orang yang sama
                      if (selected?.id && selected.id === editTarget.id) {
                        try {
                          const fresh = await adminSdmService.getEmployeeById(selected.id);
                          if (fresh?.success) setDetail(fresh.data);
                        } catch {}
                      }
                      window.alert('Perubahan disimpan');
                      setEditTarget(null);
                    } catch (e) {
                      console.error(e);
                      window.alert(e?.message || 'Gagal menyimpan perubahan');
                    } finally {
                      setSavingEdit(false);
                    }
                  }}
                >
                  {savingEdit ? 'Menyimpan...' : 'Simpan'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDataTim;


