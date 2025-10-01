import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminSdmService } from '@/services/adminSdmService';
import { toast } from 'react-hot-toast';

const SectionTitle = ({ children }) => (
  <div className="px-4 py-3 bg-gray-200 text-sm font-semibold text-gray-800">{children}</div>
);

const Input = ({ label, type = 'text', ...props }) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
    <input type={type} className="w-full border rounded px-3 py-2 text-sm" {...props} />
  </div>
);

const Select = ({ label, children, ...props }) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
    <select className="w-full border rounded px-3 py-2 text-sm" {...props}>{children}</select>
  </div>
);

const number = (v) => (v === '' || v === null || v === undefined) ? 0 : Number(v);

const AdminDataTimForm = () => {
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);

  const [divisiList, setDivisiList] = useState([]);
  const [jabatanList, setJabatanList] = useState([]);

  const [form, setForm] = useState({
    // personal
    nama: '', email: '', no_hp: '', tempat_lahir: '', tanggal_lahir: '', media_sosial: '',
    // keluarga
    nama_pasangan: '', nama_anak: '', no_hp_pasangan: '', kontak_darurat: '',
    // alamat
    alamat_sekarang: '', link_map_sekarang: '', alamat_asal: '', link_map_asal: '',
    nama_orang_tua: '', alamat_orang_tua: '', link_map_orang_tua: '',
    // kerja
    tanggal_bergabung: '', lama_bekerja: '', divisi_id: '', jabatan_id: '', user_id: '',
    // gaji
    gaji_pokok: '', tunjangan_kinerja: '', tunjangan_posisi: '', uang_makan: '', lembur: '', bonus: '',
    potongan: '', bpjstk: '', bpjs_kesehatan: '', bpjs_kes_penambahan: '', sp_1_2: '', pinjaman_karyawan: '', pph21: ''
  });

  // hitung lama bekerja otomatis
  useEffect(() => {
    if (!form.tanggal_bergabung) return;
    const start = new Date(form.tanggal_bergabung);
    if (isNaN(start)) return;
    const now = new Date();
    const diff = Math.max(0, now - start);
    const years = Math.floor(diff / (365 * 24 * 60 * 60 * 1000));
    const days = Math.floor((diff % (365 * 24 * 60 * 60 * 1000)) / (24 * 60 * 60 * 1000));
    const months = Math.floor(days / 30);
    const remDays = days % 30;
    setForm((prev) => ({ ...prev, lama_bekerja: `${years} tahun ${months} bulan ${remDays} hari` }));
  }, [form.tanggal_bergabung]);

  const loadRefs = async () => {
    try {
      const [divRes, jabRes] = await Promise.all([
        adminSdmService.getDivisi({ limit: 200 }),
        adminSdmService.getJabatan({ limit: 200 })
      ]);
      setDivisiList(divRes?.data || divRes || []);
      setJabatanList((jabRes?.data || jabRes || []).map(j => ({ id: j.id, nama_jabatan: j.nama_jabatan, divisi_id: j.divisi?.id || j.divisi_id })));
    } catch (_) {}
  };

  useEffect(() => { loadRefs(); }, []);

  const filteredJabatan = useMemo(() => {
    if (!form.divisi_id) return jabatanList;
    return jabatanList.filter(j => String(j.divisi_id) === String(form.divisi_id));
  }, [jabatanList, form.divisi_id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.nama?.trim()) return toast.error('Nama wajib diisi');
    if (!form.jabatan_id) return toast.error('Jabatan wajib dipilih');

    setSaving(true);
    try {
      const payload = {
        nama: form.nama?.trim(),
        email: form.email || null,
        no_hp: form.no_hp || null,
        tempat_lahir: form.tempat_lahir || null,
        tanggal_lahir: form.tanggal_lahir || null,
        media_sosial: form.media_sosial || null,
        nama_pasangan: form.nama_pasangan || null,
        nama_anak: form.nama_anak || null,
        no_hp_pasangan: form.no_hp_pasangan || null,
        kontak_darurat: form.kontak_darurat || null,
        alamat_sekarang: form.alamat_sekarang || null,
        link_map_sekarang: form.link_map_sekarang || null,
        alamat_asal: form.alamat_asal || null,
        link_map_asal: form.link_map_asal || null,
        nama_orang_tua: form.nama_orang_tua || null,
        alamat_orang_tua: form.alamat_orang_tua || null,
        link_map_orang_tua: form.link_map_orang_tua || null,
        jabatan_id: form.jabatan_id,
        tanggal_bergabung: form.tanggal_bergabung || null,
        lama_bekerja: form.lama_bekerja || null,
        training_dasar: false,
        training_skillo: false,
        training_leadership: false,
        training_lanjutan: false,
        gaji_pokok: number(form.gaji_pokok),
        tunjangan_kinerja: number(form.tunjangan_kinerja),
        tunjangan_posisi: number(form.tunjangan_posisi),
        uang_makan: number(form.uang_makan),
        lembur: number(form.lembur),
        bonus: number(form.bonus),
        potongan: number(form.potongan),
        bpjstk: number(form.bpjstk),
        bpjs_kesehatan: number(form.bpjs_kesehatan),
        bpjs_kes_penambahan: number(form.bpjs_kes_penambahan),
        sp_1_2: number(form.sp_1_2),
        pinjaman_karyawan: number(form.pinjaman_karyawan),
        pph21: number(form.pph21),
        user_id: form.user_id || null
      };

      const res = await adminSdmService.createEmployee(payload);
      if (!res?.success) throw new Error(res?.message || 'Gagal menyimpan');
      toast.success('Data tim berhasil disimpan');
      navigate('/admin/sdm/tim');
    } catch (err) {
      toast.error(err.message || 'Gagal menyimpan');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-0 bg-gray-50 min-h-screen">
      <div className="bg-red-800 text-white px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl md:text-2xl font-extrabold tracking-tight">Data Tim</h1>
            <p className="text-sm text-red-100">Tambahkan data tim anggota</p>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => navigate('/admin/sdm/tim')} className="px-4 py-2 rounded-lg border border-white/60 hover:bg-white/10">Kembali</button>
            <button form="form-data-tim" type="submit" disabled={saving} className="px-4 py-2 bg-white text-red-700 rounded-lg hover:bg-red-50 disabled:opacity-60">{saving ? 'Menyimpan...' : 'Simpan'}</button>
          </div>
        </div>
      </div>

      <div className="mt-0 mb-0 px-0">
        <form id="form-data-tim" onSubmit={handleSubmit} className="bg-white rounded-none shadow-sm border-y p-6 space-y-6">
          {/* Personal */}
          <SectionTitle>Informasi Personal</SectionTitle>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Input label="Nama Lengkap *" name="nama" value={form.nama} onChange={handleChange} required />
            <Input label="Email *" name="email" value={form.email} onChange={handleChange} required />
            <Input label="No. HP *" name="no_hp" value={form.no_hp} onChange={handleChange} required />
            <Input label="Tempat Lahir" name="tempat_lahir" value={form.tempat_lahir} onChange={handleChange} />
            <Input label="Tanggal Lahir" type="date" name="tanggal_lahir" value={form.tanggal_lahir} onChange={handleChange} />
            <Input label="Media Sosial" name="media_sosial" value={form.media_sosial} onChange={handleChange} />
          </div>

          {/* Keluarga */}
          <SectionTitle>Informasi Keluarga</SectionTitle>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Input label="Nama Pasangan" name="nama_pasangan" value={form.nama_pasangan} onChange={handleChange} />
            <Input label="Nama Anak" name="nama_anak" value={form.nama_anak} onChange={handleChange} />
            <Input label="No. HP Pasangan" name="no_hp_pasangan" value={form.no_hp_pasangan} onChange={handleChange} />
            <Input label="Kontak Darurat" name="kontak_darurat" value={form.kontak_darurat} onChange={handleChange} />
          </div>

          {/* Alamat */}
          <SectionTitle>Informasi Alamat</SectionTitle>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input label="Alamat Sekarang" name="alamat_sekarang" value={form.alamat_sekarang} onChange={handleChange} />
            <Input label="Link Google Map Sekarang" name="link_map_sekarang" value={form.link_map_sekarang} onChange={handleChange} />
            <Input label="Alamat Asal" name="alamat_asal" value={form.alamat_asal} onChange={handleChange} />
            <Input label="Link Google Map Asal" name="link_map_asal" value={form.link_map_asal} onChange={handleChange} />
            <Input label="Nama Orang Tua" name="nama_orang_tua" value={form.nama_orang_tua} onChange={handleChange} />
            <Input label="Alamat Orang Tua" name="alamat_orang_tua" value={form.alamat_orang_tua} onChange={handleChange} />
            <Input label="Link Google Map Orang Tua" name="link_map_orang_tua" value={form.link_map_orang_tua} onChange={handleChange} />
          </div>

          {/* Kerja */}
          <SectionTitle>Informasi Kerja</SectionTitle>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Input label="Tanggal Bergabung" type="date" name="tanggal_bergabung" value={form.tanggal_bergabung} onChange={handleChange} />
            <Input label="Lama Bekerja" name="lama_bekerja" value={form.lama_bekerja} onChange={handleChange} readOnly />
            <Select label="Divisi *" name="divisi_id" value={form.divisi_id} onChange={handleChange} required>
              <option value="">Pilih divisi</option>
              {divisiList.map(d => (
                <option key={d.id} value={d.id}>{d.nama_divisi}</option>
              ))}
            </Select>
            <Select label="Jabatan *" name="jabatan_id" value={form.jabatan_id} onChange={handleChange} required>
              <option value="">Pilih jabatan</option>
              {filteredJabatan.map(j => (
                <option key={j.id} value={j.id}>{j.nama_jabatan}</option>
              ))}
            </Select>
            <Input label="Link ke Akun User (Opsional)" name="user_id" value={form.user_id} onChange={handleChange} />
          </div>

          {/* Gaji */}
          <SectionTitle>Informasi Gaji</SectionTitle>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Input label="Gaji Pokok" type="number" name="gaji_pokok" value={form.gaji_pokok} onChange={handleChange} />
            <Input label="Tunjangan Kinerja" type="number" name="tunjangan_kinerja" value={form.tunjangan_kinerja} onChange={handleChange} />
            <Input label="Tunjangan Posisi" type="number" name="tunjangan_posisi" value={form.tunjangan_posisi} onChange={handleChange} />
            <Input label="Uang Makan" type="number" name="uang_makan" value={form.uang_makan} onChange={handleChange} />
            <Input label="Lembur" type="number" name="lembur" value={form.lembur} onChange={handleChange} />
            <Input label="Bonus" type="number" name="bonus" value={form.bonus} onChange={handleChange} />
            <Input label="Potongan" type="number" name="potongan" value={form.potongan} onChange={handleChange} />
            <Input label="BPJSTK" type="number" name="bpjstk" value={form.bpjstk} onChange={handleChange} />
            <Input label="BPJS Kesehatan" type="number" name="bpjs_kesehatan" value={form.bpjs_kesehatan} onChange={handleChange} />
            <Input label="BPJS Kes Penambahan" type="number" name="bpjs_kes_penambahan" value={form.bpjs_kes_penambahan} onChange={handleChange} />
            <Input label="SP 1/2" type="number" name="sp_1_2" value={form.sp_1_2} onChange={handleChange} />
            <Input label="Pinjaman Karyawan" type="number" name="pinjaman_karyawan" value={form.pinjaman_karyawan} onChange={handleChange} />
            <Input label="PPH21" type="number" name="pph21" value={form.pph21} onChange={handleChange} />
          </div>

          <div className="flex items-center gap-3">
            <button type="submit" disabled={saving} className="px-5 py-2.5 bg-red-700 text-white rounded-lg disabled:opacity-60">{saving ? 'Menyimpan...' : 'Simpan Data Tim'}</button>
            <button type="button" onClick={() => navigate('/admin/sdm/tim')} className="px-5 py-2.5 border rounded-lg">Batal</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminDataTimForm;
