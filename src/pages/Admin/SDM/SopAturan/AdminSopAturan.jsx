import React, { useEffect, useState } from 'react';
import { Plus, FileText, Search, Edit3, Trash2 } from 'lucide-react';
import api from '../../../../services/api';
import { API_ENDPOINTS } from '../../../../config/constants';
import { aturanService } from '../../../../services/aturanService';
import { MENU_CODES } from '@/config/menuCodes';
import { useAuth } from '../../../../contexts/AuthContext';
import { toast } from 'react-hot-toast';

const AdminSopAturan = () => {
  const { user } = useAuth();
  // State SOP (sama pola dengan Owner)
  const [sop, setSop] = useState([]);
  const [loadingSop, setLoadingSop] = useState(true);
  const [errorSop, setErrorSop] = useState('');
  const [openSopDiv, setOpenSopDiv] = useState({});
  const [openSopCat, setOpenSopCat] = useState({});
  // Tambah SOP modal state
  const [showSopAddModal, setShowSopAddModal] = useState(false);
  const [sopType, setSopType] = useState('category'); // category | step (Prosedur)
  const [sopSaving, setSopSaving] = useState(false);
  const [sopForm, setSopForm] = useState({
    nama_divisi: '',
    divisi_id: '',
    nama_category: '',
    kategori_id: '',
    judul_procedure: ''
  });
  const [divisions, setDivisions] = useState([]);
  const [categories, setCategories] = useState([]);

  // Edit SOP (Division/Category/Step)
  const [showSopEditModal, setShowSopEditModal] = useState(false);
  const [sopEditType, setSopEditType] = useState('division'); // division | category | step
  const [sopEditSaving, setSopEditSaving] = useState(false);
  const [sopEditItem, setSopEditItem] = useState(null); // object item being edited
  const [sopEditForm, setSopEditForm] = useState({
    nama_divisi: '',
    nama_category: '',
    judul_procedure: ''
  });

  // Aturan state (kolom kanan)
  const [aturan, setAturan] = useState([]);
  const [loadingAturan, setLoadingAturan] = useState(true);
  const [errorAturan, setErrorAturan] = useState('');
  const [search, setSearch] = useState('');

  // Detail & Edit
  const [selected, setSelected] = useState(null);
  const [showDetail, setShowDetail] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editSaving, setEditSaving] = useState(false);
  const [editForm, setEditForm] = useState({ judul_aturan: '', tanggal_aturan: '', isi_aturan: '' });
  const [editFiles, setEditFiles] = useState([]);

  // Modal Tambah Aturan
  const [showAddModal, setShowAddModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    judul_aturan: '',
    tanggal_aturan: new Date().toISOString().slice(0, 10), // yyyy-mm-dd
    isi_aturan: '',
  });
  const [files, setFiles] = useState([]);
  const [lastUpdated, setLastUpdated] = useState(null);

  const loadSop = async () => {
    try {
      setLoadingSop(true);
      const res = await api.get(API_ENDPOINTS.SDM.SOP.STRUCTURE);
      const data = Array.isArray(res?.data?.data) ? res.data.data : [];
      // Backend mengembalikan kategori sebagai `sopCategories`; peta ke `categories` agar UI konsisten
      const mapped = data.map((div) => ({
        ...div,
        categories: Array.isArray(div?.sopCategories) ? div.sopCategories : (Array.isArray(div?.categories) ? div.categories : []),
      }));
      setSop(mapped);
      setErrorSop('');
    } catch (err) {
      setErrorSop(err?.response?.data?.message || 'Gagal memuat struktur SOP');
    } finally {
      setLoadingSop(false);
    }
  };

  useEffect(() => { loadSop(); }, []);

  const loadAturan = async (q = '') => {
    try {
      setLoadingAturan(true);
      const res = await aturanService.listAdmin(q ? { q } : {});
      const data = Array.isArray(res?.data) ? res.data : [];
      setAturan(data);
      // Hitung last updated dari data aturan (created_at paling baru)
      try {
        const maxCreated = data
          .map(it => it?.created_at || it?.createdAt)
          .filter(Boolean)
          .map(d => new Date(d).getTime());
        if (maxCreated.length > 0) {
          const maxTs = Math.max(...maxCreated);
          setLastUpdated(new Date(maxTs));
        }
      } catch {}
      setErrorAturan('');
    } catch (err) {
      setErrorAturan(err?.message || 'Gagal memuat aturan');
    } finally {
      setLoadingAturan(false);
    }
  };

  useEffect(() => { loadAturan(); }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Merah + Badge Code Menu (unified style) */}
      <div className="bg-red-800 text-white px-6 py-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span className="text-sm font-semibold bg-white/10 rounded px-2 py-1">{MENU_CODES.sdm.sopAturan}</span>
            <div>
              <h1 className="text-xl md:text-2xl font-extrabold tracking-tight">ATURAN & SOP</h1>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-gray-200 px-4 sm:px-6 py-2 text-sm text-gray-900">
        Terakhir diupdate: {lastUpdated ? new Date(lastUpdated).toLocaleString('id-ID', { day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '-'}
      </div>

      <div className="py-4 sm:py-6 px-0">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Kolom S.O.P */}
          <div className="bg-white border rounded-lg shadow-sm order-2">
            <div className="px-4 py-3 border-b bg-red-700 text-white flex items-center justify-between">
              <div>
                <h2 className="text-base md:text-lg font-semibold text-white">S.O.P</h2>
                <p className="text-xs text-red-100">Standar Operasional Prosedur</p>
              </div>
              <button
                type="button"
                onClick={async () => {
                  // load divisions untuk kebutuhan kategori/step
                  try {
                    const res = await api.get('/sop/divisions');
                    setDivisions(Array.isArray(res?.data?.data) ? res.data.data : []);
                  } catch { setDivisions([]); }
                  setShowSopAddModal(true);
                }}
                className="inline-flex items-center justify-center gap-2 px-3 py-2 bg-white text-red-700 border border-red-600 rounded-lg hover:bg-red-50"
              >
                <Plus className="h-4 w-4 shrink-0" />
                <span className="hidden sm:inline">Tambah</span>
              </button>
            </div>
            <div className="p-4">
              <div className="mb-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input type="text" className="w-full pl-9 pr-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-red-500 focus:border-transparent" placeholder="Cari S.O.P..." />
                </div>
              </div>
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
                    return (
                      <div key={`sop-div-${div.id}`} className="border rounded-md bg-white">
                        <button
                          type="button"
                          onClick={() => setOpenSopDiv((s) => ({ ...s, [div.id]: !s[div.id] }))}
                          className="w-full flex items-center justify-between px-3 py-2 hover:bg-gray-50"
                        >
                          <div className="font-medium text-gray-800">
                            {div.nama_divisi}
                          </div>
                          <svg className={`h-4 w-4 text-gray-500 transition-transform ${dOpen ? 'rotate-180' : ''}`} viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.08 1.04l-4.25 4.25a.75.75 0 01-1.06 0L5.21 8.27a.75.75 0 01.02-1.06z" clipRule="evenodd"/></svg>
                        </button>
                        {dOpen && (
                          <div className="px-3 pb-3 space-y-3">
                            {/* Toolbar aksi Divisi (ikon) */}
                            <div className="flex items-center justify-end gap-1">
                              <button
                                type="button"
                                title="Edit Divisi"
                                onClick={() => {
                                  setSopEditType('division');
                                  setSopEditItem(div);
                                  setSopEditForm({ nama_divisi: div.nama_divisi, nama_category: '', judul_procedure: '' });
                                  setShowSopEditModal(true);
                                  toast.dismiss(); toast('Edit Divisi dibuka');
                                }}
                                className="p-2 rounded hover:bg-gray-100 text-amber-600"
                              >
                                <Edit3 className="h-4 w-4" />
                              </button>
                              <button
                                type="button"
                                title="Hapus Divisi"
                                onClick={async () => {
                                  // Endpoint hapus divisi belum tersedia di backend
                                  toast.error('Hapus Divisi belum didukung oleh backend saat ini');
                                }}
                                className="p-2 rounded hover:bg-gray-100 text-red-600"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                            {Array.isArray(div.categories) && div.categories.length > 0 ? (
                              div.categories.map((cat) => (
                                <div key={`sop-cat-${cat.id}`} className="border rounded-md px-3 py-2">
                                  <div className="flex items-start justify-between">
                                    <div className="text-gray-800 font-semibold">{cat.nama_category}</div>
                                    <div className="shrink-0 flex items-center gap-1">
                                      <button
                                        type="button"
                                        title="Edit Kategori"
                                        onClick={() => {
                                          setSopEditType('category');
                                          setSopEditItem(cat);
                                          setSopEditForm({ nama_divisi: '', nama_category: cat.nama_category, judul_procedure: '' });
                                          setShowSopEditModal(true);
                                          toast.dismiss(); toast('Edit Kategori dibuka');
                                        }}
                                        className="p-2 rounded hover:bg-gray-100 text-amber-600"
                                      >
                                        <Edit3 className="h-4 w-4" />
                                      </button>
                                      <button
                                        type="button"
                                        title="Hapus Kategori"
                                        onClick={async () => {
                                          if (!window.confirm(`Hapus Kategori "${cat.nama_category}"? Semua prosedur terkait akan terhapus.`)) return;
                                          try {
                                            await api.delete(`/sop/categories/${cat.id}`);
                                            toast.success('Kategori terhapus');
                                            await loadSop();
                                          } catch {
                                            toast.error('Gagal menghapus kategori');
                                          }
                                        }}
                                        className="p-2 rounded hover:bg-gray-100 text-red-600"
                                      >
                                        <Trash2 className="h-4 w-4" />
                                      </button>
                                    </div>
                                  </div>
                                  {/* Daftar Prosedur di bawah kategori */}
                                  {Array.isArray(cat.steps) && cat.steps.length > 0 ? (
                                    <ul className="mt-2 space-y-1 text-sm text-gray-700">
                                      {cat.steps.map((step) => (
                                        <li key={`sop-proc-${step.id}`} className="flex items-start justify-between gap-2">
                                          <span className="list-disc list-inside">{step.judul_procedure}</span>
                                          <span className="shrink-0 flex items-center gap-1">
                                            <button
                                              type="button"
                                              title="Edit Prosedur"
                                              onClick={() => {
                                                setSopEditType('step');
                                                setSopEditItem(step);
                                                setSopEditForm({ nama_divisi:'', nama_category:'', judul_procedure: step.judul_procedure || '' });
                                                setShowSopEditModal(true);
                                                toast.dismiss(); toast('Edit Prosedur dibuka');
                                              }}
                                              className="p-2 rounded hover:bg-gray-100 text-amber-600"
                                            >
                                              <Edit3 className="h-4 w-4" />
                                            </button>
                                            <button
                                              type="button"
                                              title="Hapus Prosedur"
                                              onClick={async () => {
                                                if (!window.confirm('Hapus prosedur ini?')) return;
                                                try {
                                                  await api.delete(`/sop/steps/${step.id}`);
                                                  toast.success('Prosedur terhapus');
                                                  await loadSop();
                                                } catch {
                                                  toast.error('Gagal menghapus prosedur');
                                                }
                                              }}
                                              className="p-2 rounded hover:bg-gray-100 text-red-600"
                                            >
                                              <Trash2 className="h-4 w-4" />
                                            </button>
                                          </span>
                                        </li>
                                      ))}
                                    </ul>
                                  ) : (
                                    <div className="text-xs text-gray-400 mt-1">Belum ada prosedur.</div>
                                  )}
                                </div>
                              ))
                            ) : (
                              <div className="text-xs text-gray-400 mt-1">Tidak ada kategori.</div>
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
          <div className="bg-white border rounded-lg shadow-sm order-1">
            <div className="px-4 py-3 border-b bg-red-700 text-white flex items-center justify-between">
              <div>
                <h2 className="text-base md:text-lg font-semibold text-white">ATURAN</h2>
                <p className="text-xs text-red-100">Aturan & Tata Tertib Kerja</p>
              </div>
              <button
                type="button"
                onClick={() => setShowAddModal(true)}
                className="inline-flex items-center justify-center gap-2 px-3 py-2 bg-white text-red-700 border border-red-600 rounded-lg hover:bg-red-50"
              >
                <Plus className="h-4 w-4 shrink-0" />
                <span className="hidden sm:inline">Tambah</span>
              </button>
            </div>
            <div className="p-4">
              <div className="mb-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => {
                      const v = e.target.value;
                      setSearch(v);
                      // debounce sederhana
                      clearTimeout(window.__aturanSearchTimer);
                      window.__aturanSearchTimer = setTimeout(() => loadAturan(v), 300);
                    }}
                    className="w-full pl-9 pr-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    placeholder="Cari Aturan..."
                  />
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
                      <div key={it.id} className="relative border rounded-lg p-3 hover:bg-gray-50">
                        {/* Action icons top-right */}
                        <div className="absolute top-2 right-2 flex items-center gap-1">
                          <button
                            type="button"
                            title="Edit"
                            onClick={() => {
                              setSelected(it);
                              setEditForm({
                                judul_aturan: it.judul_aturan || '',
                                tanggal_aturan: (it.tanggal_aturan || '').slice(0,10),
                                isi_aturan: it.isi_aturan || ''
                              });
                              setEditFiles([]);
                              setShowEditModal(true);
                            }}
                            className="p-2 rounded hover:bg-gray-100 text-amber-600"
                          >
                            <Edit3 className="h-4 w-4" />
                          </button>
                          <button
                            type="button"
                            title="Hapus"
                            onClick={async () => {
                              if (!window.confirm('Yakin hapus aturan ini?')) return;
                              try {
                                const del = await aturanService.deleteAdmin(it.id);
                                if (del?.success) {
                                  toast.success('Aturan terhapus');
                                  loadAturan(search);
                                } else {
                                  toast.error('Gagal menghapus');
                                }
                              } catch (e) {
                                toast.error('Gagal menghapus');
                              }
                            }}
                            className="p-2 rounded hover:bg-gray-100 text-red-600"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>

                        <div className="min-w-0 pr-16">
                          <button
                            type="button"
                            onClick={() => { setSelected(it); setShowDetail(true); }}
                            className="font-semibold text-left text-gray-900 hover:underline truncate"
                          >
                            {it.judul_aturan || 'Aturan'}
                          </button>
                          <div className="text-xs text-gray-500">{new Date(it.tanggal_aturan).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' })} • {it.user_nama || 'Unknown'}</div>
                          {it.isi_aturan && (
                            <div className="text-sm text-gray-700 mt-1 line-clamp-2">
                              {String(it.isi_aturan).replace(/<[^>]*>/g, '').slice(0, 120)}{String(it.isi_aturan).length > 120 ? '…' : ''}
                            </div>
                          )}
                          <div className="mt-2 flex items-center gap-2 text-xs">
                            <span className="shrink-0 text-gray-600 bg-gray-100 rounded-full px-2 py-1">{lampiranCount} lampiran</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
            {/* Footer tombol simpan/batal di bawah list Aturan disembunyikan sesuai permintaan */}
          </div>
        </div>

        {/* Modal Tambah Aturan */}
        {showAddModal && (
          <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl w-full max-w-2xl overflow-hidden shadow-xl">
              <div className="px-6 py-4 bg-red-800 text-white flex items-center justify-between">
                <h3 className="text-lg font-semibold">Tambah Aturan</h3>
                <button onClick={() => setShowAddModal(false)} className="px-2 py-1 rounded hover:bg-white/10">✕</button>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Judul Aturan</label>
                  <input
                    type="text"
                    value={form.judul_aturan}
                    onChange={(e) => setForm({ ...form, judul_aturan: e.target.value })}
                    className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    placeholder="Masukkan judul aturan"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tanggal</label>
                  <input
                    type="date"
                    value={form.tanggal_aturan}
                    onChange={(e) => setForm({ ...form, tanggal_aturan: e.target.value })}
                    className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Isi Aturan</label>
                  <textarea
                    rows={4}
                    value={form.isi_aturan}
                    onChange={(e) => setForm({ ...form, isi_aturan: e.target.value })}
                    className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    placeholder="Tulis isi aturan di sini"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Lampiran (multiple)</label>
                  <input
                    type="file"
                    multiple
                    onChange={(e) => setFiles(Array.from(e.target.files || []))}
                    className="block w-full text-sm"
                    accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.txt"
                  />
                  {files.length > 0 && (
                    <div className="mt-2 text-xs text-gray-600">{files.length} file dipilih</div>
                  )}
                </div>
              </div>
              <div className="px-6 py-4 border-t bg-gray-50 flex items-center justify-end gap-2">
                <button onClick={() => setShowAddModal(false)} className="px-4 py-2 rounded-lg border">Batal</button>
                <button
                  disabled={saving}
                  onClick={async () => {
                    if (!form.judul_aturan || !form.tanggal_aturan) {
                      toast.error('Judul dan tanggal wajib diisi');
                      return;
                    }
                    try {
                      setSaving(true);
                      let images = [];
                      if (files.length > 0) {
                        const fd = new FormData();
                        files.forEach((f) => fd.append('files', f));
                        const up = await api.post('/upload/files', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
                        if (up?.data?.success) {
                          images = up.data.data || [];
                        }
                      }
                      const payload = {
                        id_user: user?.id,
                        judul_aturan: form.judul_aturan,
                        tanggal_aturan: form.tanggal_aturan,
                        isi_aturan: form.isi_aturan,
                        images,
                      };
                      const res = await aturanService.createAdmin(payload);
                      if (res?.success) {
                        toast.success('Aturan berhasil ditambahkan');
                        setShowAddModal(false);
                        setForm({ judul_aturan: '', tanggal_aturan: new Date().toISOString().slice(0, 10), isi_aturan: '' });
                        setFiles([]);
                        const rel = await aturanService.listAdmin();
                        const data = Array.isArray(rel?.data) ? rel.data : [];
                        setAturan(data);
                      } else {
                        toast.error('Gagal menambahkan aturan');
                      }
                    } catch (err) {
                      console.error('Create aturan error:', err);
                      toast.error('Terjadi kesalahan saat menyimpan');
                    } finally {
                      setSaving(false);
                    }
                  }}
                  className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 disabled:opacity-50"
                >
                  {saving ? 'Menyimpan...' : 'Simpan'}
                </button>
              </div>
            </div>
          </div>
        )}

      {/* Modal Tambah S.O.P */}
      {showSopAddModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl overflow-hidden shadow-xl">
            <div className="px-6 py-4 bg-red-800 text-white flex items-center justify-between">
              <h3 className="text-lg font-semibold">Tambah S.O.P</h3>
              <button onClick={() => setShowSopAddModal(false)} className="px-2 py-1 rounded hover:bg-white/10">✕</button>
            </div>
            <div className="px-6 pt-5 grid grid-cols-2 gap-2">
              <button onClick={() => setSopType('category')} className={`px-3 py-2 rounded-lg border ${sopType==='category'?'bg-red-50 border-red-400 text-red-700':'bg-white'}`}>Kategori</button>
              <button onClick={() => setSopType('step')} className={`px-3 py-2 rounded-lg border ${sopType==='step'?'bg-red-50 border-red-400 text-red-700':'bg-white'}`}>Prosedur</button>
            </div>
            <div className="p-6 space-y-4">
              {/* Opsi Divisi disembunyikan */}
              {sopType === 'category' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Divisi</label>
                    <select value={sopForm.divisi_id} onChange={async (e)=>{
                      const v=e.target.value; setSopForm({...sopForm, divisi_id:v, kategori_id:'', nama_category:''});
                      if (v) {
                        // Ambil kategori dari struktur SOP yang sudah dimuat agar tidak tergantung endpoint backend
                        const divObj = (sop || []).find(d => String(d.id) === String(v));
                        const localCats = Array.isArray(divObj?.categories) ? divObj.categories : [];
                        if (localCats.length > 0) {
                          setCategories(localCats);
                        } else {
                          // Fallback ke API bila perlu
                          try {
                            const cats = await api.get(`/sop/divisions/${v}/categories`);
                            setCategories(Array.isArray(cats?.data?.data) ? cats.data.data : []);
                          } catch { setCategories([]); }
                        }
                      } else {
                        setCategories([]);
                      }
                    }} className="w-full border rounded-lg px-3 py-2">
                      <option value="">-- Pilih Divisi --</option>
                      {divisions.map(d=> (<option key={d.id} value={d.id}>{d.nama_divisi}</option>))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nama Kategori</label>
                    <input type="text" value={sopForm.nama_category} onChange={(e)=>setSopForm({...sopForm, nama_category:e.target.value})} className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-red-500 focus:border-transparent" placeholder="Mis. Administrasi" />
                  </div>
                </>
              )}

              {sopType === 'step' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Divisi</label>
                    <select value={sopForm.divisi_id} onChange={async (e)=>{
                      const v=e.target.value; setSopForm({...sopForm, divisi_id:v, kategori_id:''});
                      if (v) {
                        const divObj = (sop || []).find(d => String(d.id) === String(v));
                        const localCats = Array.isArray(divObj?.categories) ? divObj.categories : [];
                        if (localCats.length > 0) {
                          setCategories(localCats);
                        } else {
                          try {
                            const cats = await api.get(`/sop/divisions/${v}/categories`);
                            setCategories(Array.isArray(cats?.data?.data) ? cats.data.data : []);
                          } catch { setCategories([]); }
                        }
                      } else {
                        setCategories([]);
                      }
                    }} className="w-full border rounded-lg px-3 py-2">
                      <option value="">-- Pilih Divisi --</option>
                      {divisions.map(d=> (<option key={d.id} value={d.id}>{d.nama_divisi}</option>))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Kategori</label>
                    <select value={sopForm.kategori_id} onChange={(e)=>setSopForm({...sopForm, kategori_id:e.target.value})} className="w-full border rounded-lg px-3 py-2">
                      <option value="">-- Pilih Kategori --</option>
                      {categories.map(c=> (<option key={c.id} value={c.id}>{c.nama_category}</option>))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Isi Prosedur</label>
                    <textarea
                      rows={5}
                      value={sopForm.judul_procedure}
                      onChange={(e)=>setSopForm({...sopForm, judul_procedure:e.target.value})}
                      className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-red-500 focus:border-transparent"
                      placeholder="Tulis isi prosedur di sini"
                    />
                  </div>
                </>
              )}
              
            </div>
            <div className="px-6 py-4 border-t bg-gray-50 flex items-center justify-end gap-2">
              <button onClick={()=>setShowSopAddModal(false)} className="px-4 py-2 rounded-lg border">Batal</button>
              <button
                disabled={sopSaving}
                onClick={async ()=>{
                  try {
                    setSopSaving(true);
                    if (sopType==='category') {
                      if (!sopForm.divisi_id || !sopForm.nama_category) { toast.error('Divisi dan nama kategori wajib'); setSopSaving(false); return; }
                      // Backend expects sdm_divisi_id & nama_category
                      await api.post('/sop/categories', { sdm_divisi_id: sopForm.divisi_id, nama_category: sopForm.nama_category });
                    } else if (sopType==='step') {
                      if (!sopForm.kategori_id || !sopForm.judul_procedure) { toast.error('Kategori dan isi prosedur wajib'); setSopSaving(false); return; }
                      // Backend expects category_id & judul_procedure; isi optional is ignored in controller
                      await api.post('/sop/steps', { category_id: sopForm.kategori_id, judul_procedure: sopForm.judul_procedure });
                    }
                    toast.success('S.O.P berhasil ditambahkan');
                    setShowSopAddModal(false);
                    setSopForm({ nama_divisi:'', divisi_id:'', nama_category:'', kategori_id:'', judul_procedure:'' });
                    await loadSop();
                  } catch (e) {
                    toast.error('Gagal menambahkan S.O.P');
                  } finally {
                    setSopSaving(false);
                  }
                }}
                className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 disabled:opacity-50"
              >{sopSaving ? 'Menyimpan...' : 'Simpan'}</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Edit S.O.P (Divisi/Kategori/Prosedur) */}
      {showSopEditModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg overflow-hidden shadow-xl">
            <div className="px-6 py-4 bg-red-800 text-white flex items-center justify-between">
              <h3 className="text-lg font-semibold">
                {sopEditType === 'division' ? 'Edit Divisi' : sopEditType === 'category' ? 'Edit Kategori' : 'Edit Prosedur'}
              </h3>
              <button onClick={() => setShowSopEditModal(false)} className="px-2 py-1 rounded hover:bg-white/10">✕</button>
            </div>
            <div className="p-6 space-y-4">
              {sopEditType === 'division' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nama Divisi</label>
                  <input
                    type="text"
                    value={sopEditForm.nama_divisi}
                    onChange={(e)=>setSopEditForm({...sopEditForm, nama_divisi: e.target.value})}
                    className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  />
                </div>
              )}
              {sopEditType === 'category' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nama Kategori</label>
                  <input
                    type="text"
                    value={sopEditForm.nama_category}
                    onChange={(e)=>setSopEditForm({...sopEditForm, nama_category: e.target.value})}
                    className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  />
                </div>
              )}
              {sopEditType === 'step' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Isi Prosedur</label>
                    <textarea
                      rows={5}
                      value={sopEditForm.judul_procedure}
                      onChange={(e)=>setSopEditForm({...sopEditForm, judul_procedure: e.target.value})}
                      className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    />
                  </div>
                </>
              )}
            </div>
            <div className="px-6 py-4 border-t bg-gray-50 flex items-center justify-end gap-2">
              <button onClick={()=>setShowSopEditModal(false)} className="px-4 py-2 rounded-lg border">Batal</button>
              <button
                disabled={sopEditSaving}
                onClick={async ()=>{
                  try {
                    setSopEditSaving(true);
                    if (sopEditType === 'division') {
                      if (!sopEditForm.nama_divisi) { toast.error('Nama divisi wajib'); setSopEditSaving(false); return; }
                      await api.put(`/sop/divisions/${sopEditItem?.id}`, { nama_divisi: sopEditForm.nama_divisi });
                    } else if (sopEditType === 'category') {
                      if (!sopEditForm.nama_category) { toast.error('Nama kategori wajib'); setSopEditSaving(false); return; }
                      await api.put(`/sop/categories/${sopEditItem?.id}`, { nama_category: sopEditForm.nama_category });
                    } else if (sopEditType === 'step') {
                      if (!sopEditForm.judul_procedure) { toast.error('Isi prosedur wajib'); setSopEditSaving(false); return; }
                      await api.put(`/sop/steps/${sopEditItem?.id}`, { judul_procedure: sopEditForm.judul_procedure });
                    }
                    toast.success('Perubahan disimpan');
                    setShowSopEditModal(false);
                    await loadSop();
                  } catch (e) {
                    toast.error('Gagal menyimpan');
                  } finally {
                    setSopEditSaving(false);
                  }
                }}
                className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 disabled:opacity-50"
              >{sopEditSaving ? 'Menyimpan...' : 'Simpan'}</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Detail Aturan */}
      {showDetail && selected && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-3xl overflow-hidden shadow-xl">
            <div className="px-6 py-4 bg-red-800 text-white flex items-center justify-between">
              <h3 className="text-lg font-semibold">Detail Aturan</h3>
              <button onClick={() => setShowDetail(false)} className="px-2 py-1 rounded hover:bg-white/10">✕</button>
            </div>
            <div className="p-6 space-y-3">
              <div className="text-xl font-semibold text-gray-900">{selected.judul_aturan}</div>
              <div className="text-xs text-gray-500">{new Date(selected.tanggal_aturan).toLocaleDateString('id-ID', { year:'numeric', month:'long', day:'numeric' })} • {selected.user_nama || 'Unknown'}</div>
              {selected.isi_aturan && (
                <div className="prose max-w-none text-gray-800 whitespace-pre-wrap">{String(selected.isi_aturan)}</div>
              )}
              <div>
                <div className="font-medium text-gray-900 mb-1">Lampiran</div>
                <ul className="list-disc list-inside text-sm">
                  {(Array.isArray(selected.images) ? selected.images : (selected.images ? JSON.parse(selected.images) : [])).map((f, idx) => (
                    <li key={idx}>
                      <a href={f.url} target="_blank" rel="noreferrer" className="text-red-700 hover:underline">{f.originalName || f.filename}</a>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Edit Aturan */}
      {showEditModal && selected && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl overflow-hidden shadow-xl">
            <div className="px-6 py-4 bg-red-800 text-white flex items-center justify-between">
              <h3 className="text-lg font-semibold">Edit Aturan</h3>
              <button onClick={() => setShowEditModal(false)} className="px-2 py-1 rounded hover:bg-white/10">✕</button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Judul Aturan</label>
                <input type="text" value={editForm.judul_aturan} onChange={(e)=>setEditForm({...editForm, judul_aturan:e.target.value})} className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-red-500 focus:border-transparent" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tanggal</label>
                <input type="date" value={editForm.tanggal_aturan} onChange={(e)=>setEditForm({...editForm, tanggal_aturan:e.target.value})} className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-red-500 focus:border-transparent" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Isi Aturan</label>
                <textarea rows={4} value={editForm.isi_aturan} onChange={(e)=>setEditForm({...editForm, isi_aturan:e.target.value})} className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-red-500 focus:border-transparent" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Lampiran baru (opsional)</label>
                <input type="file" multiple onChange={(e)=>setEditFiles(Array.from(e.target.files||[]))} className="block w-full text-sm" accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.txt" />
                {editFiles.length>0 && (<div className="mt-2 text-xs text-gray-600">{editFiles.length} file dipilih (akan mengganti lampiran lama jika diunggah)</div>)}
              </div>
            </div>
            <div className="px-6 py-4 border-t bg-gray-50 flex items-center justify-end gap-2">
              <button onClick={()=>setShowEditModal(false)} className="px-4 py-2 rounded-lg border">Batal</button>
              <button
                disabled={editSaving}
                onClick={async ()=>{
                  try {
                    setEditSaving(true);
                    let images = null; // null = tidak diubah; [] atau array = set baru
                    if (editFiles.length>0) {
                      const fd = new FormData();
                      editFiles.forEach((f)=>fd.append('files', f));
                      const up = await api.post('/upload/files', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
                      if (up?.data?.success) images = up.data.data || [];
                    }
                    const payload = {
                      judul_aturan: editForm.judul_aturan,
                      tanggal_aturan: editForm.tanggal_aturan,
                      isi_aturan: editForm.isi_aturan,
                    };
                    if (images !== null) payload.images = images;
                    const res = await aturanService.updateAdmin(selected.id, payload);
                    if (res?.success) {
                      toast.success('Aturan diperbarui');
                      setShowEditModal(false);
                      loadAturan(search);
                    } else {
                      toast.error('Gagal memperbarui');
                    }
                  } catch (e) {
                    toast.error('Gagal memperbarui');
                  } finally {
                    setEditSaving(false);
                  }
                }}
                className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 disabled:opacity-50"
              >{editSaving ? 'Menyimpan...' : 'Simpan Perubahan'}</button>
            </div>
          </div>
        </div>
      )}

      </div>
    </div>
  );
};

export default AdminSopAturan;
