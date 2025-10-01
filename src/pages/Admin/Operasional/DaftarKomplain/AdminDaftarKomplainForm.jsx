import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { komplainService } from '@/services/komplainService';
import { toast } from 'react-hot-toast';
import { Save, ArrowLeft, RefreshCw, MessageSquare } from 'lucide-react';
import { useEffect } from 'react';
import { userService } from '@/services/userService';

const AdminDaftarKomplainForm = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    judul_komplain: '',
    deskripsi_komplain: '',
    kategori: 'lainnya', // sistem | layanan | produk | lainnya
    prioritas: 'berproses', // mendesak | penting | berproses
    status: 'menunggu', // menunggu | diproses | selesai | ditolak
    penerima_komplain_id: '', // optional (ID user admin penanggung jawab)
    pihak_terkait: [], // array of user IDs
    target_selesai: '', // yyyy-mm-dd
  });
  const [submitting, setSubmitting] = useState(false);
  const [users, setUsers] = useState([]);
  const [pihakSelect, setPihakSelect] = useState('');

  useEffect(() => {
    const loadUsers = async () => {
      try {
        const res = await userService.getUsers({ page: 1, limit: 100 });
        // Backend users.js mengembalikan: { success, data: [users], pagination }
        // Normalisasi agar kompatibel dengan berbagai bentuk respons
        const list = Array.isArray(res?.data)
          ? res.data
          : Array.isArray(res?.data?.users)
          ? res.data.users
          : Array.isArray(res)
          ? res
          : [];
        setUsers(list);
      } catch (e) {
        console.error('Gagal memuat users untuk selector:', e);
        toast.error('Gagal memuat daftar user');
      }
    };
    loadUsers();
  }, []);

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const resetForm = () => {
    setForm({
      judul_komplain: '',
      deskripsi_komplain: '',
      kategori: 'lainnya',
      prioritas: 'berproses',
      status: 'menunggu',
      penerima_komplain_id: '',
      pihak_terkait: [],
      target_selesai: '',
    });
  };

  const addPihakTerkait = () => {
    if (!pihakSelect) return;
    setForm((prev) => {
      const exists = Array.isArray(prev.pihak_terkait)
        ? prev.pihak_terkait.some((id) => String(id) === String(pihakSelect))
        : false;
      if (exists) return prev;
      const next = [...(prev.pihak_terkait || []), pihakSelect];
      return { ...prev, pihak_terkait: next };
    });
    setPihakSelect('');
  };

  const removePihakTerkait = (id) => {
    setForm((prev) => ({
      ...prev,
      pihak_terkait: (prev.pihak_terkait || []).filter((x) => String(x) !== String(id))
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Basic validation sesuai backend: judul_komplain & deskripsi_komplain wajib
    if (!form.judul_komplain.trim() || !form.deskripsi_komplain.trim()) {
      toast.error('Judul dan deskripsi komplain wajib diisi');
      return;
    }

    // Bentuk payload sesuai backend/routes/daftarKomplain.js
    const payload = {
      judul_komplain: form.judul_komplain.trim(),
      deskripsi_komplain: form.deskripsi_komplain.trim(),
      kategori: form.kategori || 'lainnya',
      prioritas: form.prioritas || 'berproses',
      status: form.status || 'menunggu',
      // optional fields
      penerima_komplain_id: form.penerima_komplain_id ? Number(form.penerima_komplain_id) : undefined,
      // Kirim sebagai array angka (backend akan stringify sendiri)
      pihak_terkait: Array.isArray(form.pihak_terkait)
        ? form.pihak_terkait.map((n) => Number(n))
        : (form.pihak_terkait || '')
            .toString()
            .split(',')
            .map((s) => s.trim())
            .filter(Boolean)
            .map((n) => Number(n)),
      // Kirim sebagai array (backend akan stringify)
      lampiran: [],
      target_selesai: form.target_selesai || undefined, // backend akan cast ke Date
      // lampiran dikosongkan untuk sekarang (bisa ditambah fitur upload terpisah)
    };

    try {
      setSubmitting(true);
      await komplainService.createKomplain(payload);
      toast.success('Komplain berhasil dibuat');
      navigate('/admin/operasional/komplain');
    } catch (err) {
      console.error('Gagal membuat komplain:', err);
      const msg = typeof err === 'string' ? err : err?.message || 'Gagal membuat komplain';
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="p-0 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="bg-red-800 text-white px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span className="text-sm font-semibold bg-white/10 rounded px-2 py-1">A01-C1-N</span>
            <div>
              <h1 className="text-xl md:text-2xl font-extrabold tracking-tight">BUAT KOMPLAIN</h1>
              <p className="text-sm text-red-100">Form pembuatan komplain baru</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Link
              to="/admin/operasional/komplain"
              className="inline-flex items-center gap-2 px-4 py-2 bg-white text-red-700 rounded-lg hover:bg-red-50 transition-colors shadow-sm"
            >
              <ArrowLeft className="h-4 w-4" />
              <span className="font-semibold">Kembali</span>
            </Link>
          </div>
        </div>
      </div>

      <div className="mx-6 my-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-visible">
          <div className="p-6 border-b border-gray-100">
            <div className="flex items-center gap-2 text-gray-700">
              <MessageSquare className="h-5 w-5" />
              <h2 className="text-lg font-semibold">Data Komplain</h2>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block text-xs font-medium text-gray-600 mb-1">Judul Komplain<span className="text-red-500">*</span></label>
              <input
                type="text"
                name="judul_komplain"
                value={form.judul_komplain}
                onChange={onChange}
                placeholder="Masukkan judul komplain"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-red-500 focus:border-transparent"
                required
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-medium text-gray-600 mb-1">Deskripsi Komplain<span className="text-red-500">*</span></label>
              <textarea
                name="deskripsi_komplain"
                value={form.deskripsi_komplain}
                onChange={onChange}
                placeholder="Jelaskan keluhan, detail masalah, langkah yang sudah dicoba, dsb."
                rows={5}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-red-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Kategori</label>
              <select
                name="kategori"
                value={form.kategori}
                onChange={onChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white text-gray-900 focus:ring-2 focus:ring-red-500 focus:border-transparent"
              >
                <option value="sistem">Sistem</option>
                <option value="layanan">Layanan</option>
                <option value="produk">Produk</option>
                <option value="lainnya">Lainnya</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Prioritas</label>
              <select
                name="prioritas"
                value={form.prioritas}
                onChange={onChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white text-gray-900 focus:ring-2 focus:ring-red-500 focus:border-transparent"
              >
                <option value="mendesak">Mendesak</option>
                <option value="penting">Penting</option>
                <option value="berproses">Berproses</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Status</label>
              <select
                name="status"
                value={form.status}
                onChange={onChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white text-gray-900 focus:ring-2 focus:ring-red-500 focus:border-transparent"
              >
                <option value="menunggu">Menunggu</option>
                <option value="diproses">Diproses</option>
                <option value="selesai">Selesai</option>
                <option value="ditolak">Ditolak</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Penerima Komplain</label>
              <select
                name="penerima_komplain_id"
                value={form.penerima_komplain_id}
                onChange={onChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white text-gray-900 focus:ring-2 focus:ring-red-500 focus:border-transparent"
              >
                <option value="">-- Pilih User --</option>
                {users.map((u) => {
                  const label = u.username || u.nama || u.full_name || u.name || u.nama_lengkap || u.displayName || u.email || `User ${u.id}`;
                  return (
                    <option key={u.id} value={`${u.id}`}>{label}</option>
                  );
                })}
              </select>
              <p className="mt-1 text-xs text-gray-500">Opsional. Jika diisi, komplain akan ditugaskan ke user tersebut.</p>
              {form.penerima_komplain_id && (
                (() => {
                  const sel = users.find((u) => String(u.id) === String(form.penerima_komplain_id));
                  if (!sel) return null;
                  const label = sel.username || sel.nama || sel.full_name || sel.name || sel.nama_lengkap || sel.displayName || sel.email || `User ${sel.id}`;
                  return (
                    <div className="mt-2 text-xs text-gray-700">
                      Dipilih: <span className="font-semibold">{label}</span>{sel.email ? ` • ${sel.email}` : ''}
                    </div>
                  );
                })()
              )}
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Pihak Terkait</label>
              <div className="flex gap-2">
                <select
                  name="pihak_terkait_select"
                  value={pihakSelect}
                  onChange={(e) => setPihakSelect(e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white text-gray-900 focus:ring-2 focus:ring-red-500 focus:border-transparent"
                >
                  <option value="">-- Pilih User --</option>
                  {users
                    .filter((u) => !(form.pihak_terkait || []).some((id) => String(id) === String(u.id)))
                    .map((u) => {
                      const label = u.username || u.nama || u.full_name || u.name || u.nama_lengkap || u.displayName || u.email || `User ${u.id}`;
                      return (
                        <option key={u.id} value={`${u.id}`}>{label}</option>
                      );
                    })}
                </select>
                <button
                  type="button"
                  onClick={addPihakTerkait}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  Tambah
                </button>
              </div>
              <p className="mt-1 text-xs text-gray-500">Tambah beberapa pihak terkait dengan memilih dari dropdown lalu klik Tambah.</p>
              <div className="mt-2 p-3 border border-gray-200 rounded-lg bg-gray-50 min-h-[80px] max-h-40 overflow-y-auto">
                {Array.isArray(form.pihak_terkait) && form.pihak_terkait.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {users
                      .filter((u) => (form.pihak_terkait || []).some((id) => String(id) === String(u.id)))
                      .map((u) => {
                        const label = u.nama || u.full_name || u.username || `User ${u.id}`;
                        return (
                          <span
                            key={`pt-${u.id}`}
                            className="inline-flex items-center gap-2 px-2 py-1 text-xs rounded-full bg-red-50 text-red-700 border border-red-200"
                          >
                            {label}
                            <button
                              type="button"
                              onClick={() => removePihakTerkait(u.id)}
                              className="ml-1 text-red-600 hover:text-red-800"
                              aria-label={`Hapus ${label}`}
                            >
                              ×
                            </button>
                          </span>
                        );
                      })}
                  </div>
                ) : (
                  <span className="text-xs text-gray-500">Belum ada pihak terkait yang dipilih</span>
                )}
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Target Selesai</label>
              <input
                type="date"
                name="target_selesai"
                value={form.target_selesai}
                onChange={onChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-red-500 focus:border-transparent"
              />
            </div>

            <div className="md:col-span-2 flex items-center justify-between pt-2">
              <button
                type="button"
                onClick={resetForm}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-red-600 text-red-700 hover:bg-red-50 transition-colors"
                disabled={submitting}
              >
                <RefreshCw className="h-4 w-4" />
                <span className="font-semibold">Reset</span>
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="inline-flex items-center gap-2 px-5 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-60"
              >
                <Save className="h-4 w-4" />
                <span className="font-semibold">{submitting ? 'Menyimpan...' : 'Simpan'}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AdminDaftarKomplainForm;
