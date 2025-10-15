import React, { useEffect, useMemo, useState } from 'react';
import { Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Button from '@/components/UI/Button';
import Input from '@/components/UI/Input';
import { API_CONFIG } from '@/config/constants';

const AdminDaftarGajiForm = () => {
  const designUpdatedText = useMemo(() => new Date().toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' }), []);

  const navigate = useNavigate();

  // Options untuk select divisi & jabatan
  const [divisions, setDivisions] = useState([]); // [{id, name, children:[{id,name}]}]
  const [selectedDivisiId, setSelectedDivisiId] = useState('');

  const [form, setForm] = useState({
    nama: '',
    jabatan_id: '',
    gaji_pokok: '',
    tunjangan_kinerja: '',
    tunjangan_posisi: '',
    uang_makan: '',
    lembur: '',
    bonus: '',
    potongan: '',
    bpjstk: '',
    bpjs_kesehatan: '',
    bpjs_kes_penambahan: '',
    sp_1_2: '',
    pinjaman_karyawan: '',
    pph21: '',
    user_id: '',
  });

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const numberProps = {
    type: 'number',
    step: '1',
    min: '0',
    inputMode: 'numeric',
  };

  useEffect(() => {
    // Ambil hierarchy untuk isi pilihan divisi & jabatan
    const loadHierarchy = async () => {
      try {
        const token = localStorage.getItem('token') || localStorage.getItem('access_token');
        const res = await fetch(`${API_CONFIG.BASE_URL}/admin/sdm/hierarchy`, {
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        });
        const data = await res.json();
        if (res.ok && data?.success && Array.isArray(data.data)) {
          setDivisions(data.data);
        } else {
          setDivisions([]);
        }
      } catch (err) {
        console.error('Gagal memuat hierarchy SDM:', err);
        setDivisions([]);
      }
    };
    loadHierarchy();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Validasi minimal
    if (!form.nama || !String(form.nama).trim()) {
      alert('Nama karyawan wajib diisi');
      return;
    }
    if (!form.jabatan_id) {
      alert('Silakan pilih jabatan');
      return;
    }

    const toNumber = (v) => {
      if (v === '' || v === null || v === undefined) return 0;
      const n = Number(v);
      return isNaN(n) ? 0 : n;
    };

    const payload = {
      nama: form.nama,
      jabatan_id: Number(form.jabatan_id),
      // Komponen penghasilan
      gaji_pokok: toNumber(form.gaji_pokok),
      tunjangan_kinerja: toNumber(form.tunjangan_kinerja),
      tunjangan_posisi: toNumber(form.tunjangan_posisi),
      uang_makan: toNumber(form.uang_makan),
      lembur: toNumber(form.lembur),
      bonus: toNumber(form.bonus),
      // Komponen potongan
      potongan: toNumber(form.potongan),
      bpjstk: toNumber(form.bpjstk),
      bpjs_kesehatan: toNumber(form.bpjs_kesehatan),
      bpjs_kes_penambahan: toNumber(form.bpjs_kes_penambahan),
      sp_1_2: toNumber(form.sp_1_2),
      pinjaman_karyawan: toNumber(form.pinjaman_karyawan),
      pph21: toNumber(form.pph21),
      // Optional keterkaitan user
      user_id: form.user_id ? Number(form.user_id) : null,
    };

    try {
      const token = localStorage.getItem('token') || localStorage.getItem('access_token');
      const res = await fetch(`${API_CONFIG.BASE_URL}/admin/sdm/employees`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (res.ok && data?.success) {
        alert('Data gaji karyawan berhasil dibuat');
        navigate('/admin/keuangan/daftar-gaji');
      } else {
        alert(data?.message || 'Gagal menyimpan data gaji');
      }
    } catch (err) {
      console.error('Error submit gaji:', err);
      alert('Terjadi kesalahan saat menyimpan data');
    }
  };

  return (
    <div className="p-0 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="bg-red-800 text-white px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span className="text-sm font-semibold bg-white/10 rounded px-2 py-1">K01-G1</span>
            <div>
              <h1 className="text-xl md:text-2xl font-extrabold tracking-tight">DAFTAR GAJI</h1>
              <p className="text-sm text-red-100">Form input gaji pokok, tunjangan, lembur, bonus, dan potongan</p>
            </div>
          </div>
        </div>
      </div>

      {/* Info Bar */}
      <div className="bg-gray-200 px-6 py-2 text-xs text-gray-700 flex items-center gap-2">
        <Clock className="h-4 w-4 text-gray-600" />
        <span>Desain terakhir diupdate: {designUpdatedText}</span>
      </div>

      <div className="container mx-auto px-6 py-6">
        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md border p-6 space-y-6">
          {/* Info Karyawan */}
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Informasi Karyawan</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Input
                label="Nama Karyawan"
                name="nama"
                placeholder="Contoh: Budi Santoso"
                value={form.nama}
                onChange={onChange}
              />
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Divisi</label>
                <select
                  className="w-full border rounded-md px-3 py-2"
                  value={selectedDivisiId}
                  onChange={(e) => {
                    setSelectedDivisiId(e.target.value);
                    setForm((prev) => ({ ...prev, jabatan_id: '' }));
                  }}
                >
                  <option value="">Pilih divisi</option>
                  {divisions.map((d) => (
                    <option key={d.id} value={d.id}>{d.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Jabatan</label>
                <select
                  className="w-full border rounded-md px-3 py-2"
                  name="jabatan_id"
                  value={form.jabatan_id}
                  onChange={onChange}
                  disabled={!selectedDivisiId}
                >
                  <option value="">Pilih jabatan</option>
                  {divisions
                    .find((d) => String(d.id) === String(selectedDivisiId))?.children?.map((j) => (
                      <option key={j.id} value={j.id}>{j.name}</option>
                    ))}
                </select>
              </div>
            </div>
          </div>

          {/* Komponen Penghasilan */}
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Komponen Penghasilan</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Input label="Gaji Pokok (Rp)" name="gaji_pokok" value={form.gaji_pokok} onChange={onChange} {...numberProps} />
              <Input label="Tunjangan Kinerja (Rp)" name="tunjangan_kinerja" value={form.tunjangan_kinerja} onChange={onChange} {...numberProps} />
              <Input label="Tunjangan Posisi (Rp)" name="tunjangan_posisi" value={form.tunjangan_posisi} onChange={onChange} {...numberProps} />
              <Input label="Uang Makan (Rp)" name="uang_makan" value={form.uang_makan} onChange={onChange} {...numberProps} />
              <Input label="Lembur (Rp)" name="lembur" value={form.lembur} onChange={onChange} {...numberProps} />
              <Input label="Bonus (Rp)" name="bonus" value={form.bonus} onChange={onChange} {...numberProps} />
            </div>
          </div>

          {/* Komponen Potongan */}
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Komponen Potongan</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Input label="Potongan (Rp)" name="potongan" value={form.potongan} onChange={onChange} {...numberProps} />
              <Input label="BPJSTK (Rp)" name="bpjstk" value={form.bpjstk} onChange={onChange} {...numberProps} />
              <Input label="BPJS Kesehatan (Rp)" name="bpjs_kesehatan" value={form.bpjs_kesehatan} onChange={onChange} {...numberProps} />
              <Input label="BPJS Kes Penambahan (Rp)" name="bpjs_kes_penambahan" value={form.bpjs_kes_penambahan} onChange={onChange} {...numberProps} />
              <Input label="SP 1/2 (Rp)" name="sp_1_2" value={form.sp_1_2} onChange={onChange} {...numberProps} />
              <Input label="Pinjaman Karyawan (Rp)" name="pinjaman_karyawan" value={form.pinjaman_karyawan} onChange={onChange} {...numberProps} />
              <Input label="PPH21 (Rp)" name="pph21" value={form.pph21} onChange={onChange} {...numberProps} />
            </div>
          </div>

          {/* Optional: User ID terkait (jika ingin mengaitkan akun aplikasi) */}
          <div>
            <Input
              label="User ID (opsional)"
              name="user_id"
              placeholder="Isi jika ingin mengaitkan ke user tertentu"
              value={form.user_id}
              onChange={onChange}
              type="number"
              min="0"
              step="1"
              inputMode="numeric"
            />
          </div>

          {/* Aksi */}
          <div className="flex items-center gap-3 justify-end">
            <Button type="button" variant="outline" onClick={() => {
              setForm({
                nama: '', jabatan_id: '', gaji_pokok: '', tunjangan_kinerja: '', tunjangan_posisi: '', uang_makan: '', lembur: '', bonus: '', potongan: '', bpjstk: '', bpjs_kesehatan: '', bpjs_kes_penambahan: '', sp_1_2: '', pinjaman_karyawan: '', pph21: '', user_id: '',
              });
              setSelectedDivisiId('');
            }}>Reset</Button>
            <Button type="submit" className="px-6">Simpan</Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminDaftarGajiForm;
