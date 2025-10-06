import React, { useMemo, useState } from 'react';
import { Clock } from 'lucide-react';
import Button from '@/components/UI/Button';
import Input from '@/components/UI/Input';

const AdminDaftarGajiForm = () => {
  const designUpdatedText = useMemo(() => new Date().toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' }), []);

  const [form, setForm] = useState({
    karyawan: '',
    divisi: '',
    posisi: '',
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
    catatan: '',
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

  const handleSubmit = (e) => {
    e.preventDefault();
    // TODO: sambungkan ke service API jika sudah tersedia
    console.log('Submit Daftar Gaji:', form);
    alert('Data gaji & bonus berhasil disiapkan (simulasi).');
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
                name="karyawan"
                placeholder="Contoh: Budi Santoso"
                value={form.karyawan}
                onChange={onChange}
              />
              <Input
                label="Divisi"
                name="divisi"
                placeholder="Contoh: Produksi"
                value={form.divisi}
                onChange={onChange}
              />
              <Input
                label="Posisi/Jabatan"
                name="posisi"
                placeholder="Contoh: Supervisor"
                value={form.posisi}
                onChange={onChange}
              />
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

          {/* Catatan */}
          <div>
            <Input
              label="Catatan"
              name="catatan"
              placeholder="Tambahkan catatan atau keterangan (opsional)"
              value={form.catatan}
              onChange={onChange}
            />
          </div>

          {/* Aksi */}
          <div className="flex items-center gap-3 justify-end">
            <Button type="button" variant="outline" onClick={() => setForm({
              karyawan: '', divisi: '', posisi: '', gaji_pokok: '', tunjangan_kinerja: '', tunjangan_posisi: '', uang_makan: '', lembur: '', bonus: '', potongan: '', bpjstk: '', bpjs_kesehatan: '', bpjs_kes_penambahan: '', sp_1_2: '', pinjaman_karyawan: '', pph21: '', catatan: '',
            })}>Reset</Button>
            <Button type="submit" className="px-6">Simpan</Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminDaftarGajiForm;
