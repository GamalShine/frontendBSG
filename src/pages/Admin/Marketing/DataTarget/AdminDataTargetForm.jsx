import React from 'react';

const AdminDataTargetForm = () => {
  const { useState } = React;
  const { useNavigate } = require('react-router-dom');
  const { toast } = require('react-hot-toast');
  const { dataTargetService } = require('@/services/dataTargetService');

  const navigate = useNavigate();
  const [form, setForm] = useState({ nama_target: '', target_nominal: '' });
  const [saving, setSaving] = useState(false);

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: name === 'target_nominal' ? value.replace(/[^0-9]/g, '') : value }));
  };

  const validate = () => {
    if (!form.nama_target.trim()) {
      toast.error('Nama target wajib diisi');
      return false;
    }
    const nominal = Number(form.target_nominal || 0);
    if (!isFinite(nominal) || nominal < 0) {
      toast.error('Target nominal tidak valid');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    try {
      setSaving(true);
      const payload = {
        nama_target: form.nama_target.trim(),
        target_nominal: Number(form.target_nominal || 0)
      };
      const res = await dataTargetService.create(payload);
      if (res?.success) {
        toast.success('Data Target berhasil ditambahkan');
        navigate('/admin/marketing/data-target');
      } else {
        toast.error(res?.message || 'Gagal menambah Data Target');
      }
    } catch (err) {
      console.error('Create DataTarget error:', err);
      toast.error(err?.response?.data?.message || err.message || 'Terjadi kesalahan');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-red-800 text-white p-4">
        <h1 className="text-xl font-bold">Tambah Data Target</h1>
        <p className="text-sm opacity-90">Admin - Marketing</p>
      </div>
      <form onSubmit={handleSubmit} className="max-w-xl mx-auto mt-6 bg-white shadow-sm border rounded-lg p-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Nama Target</label>
          <input
            type="text"
            name="nama_target"
            value={form.nama_target}
            onChange={onChange}
            className="w-full border-gray-300 rounded-lg shadow-sm focus:ring-red-600 focus:border-red-600"
            placeholder="Contoh: TEPUNG BOSGIL"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Target Nominal (Rp)</label>
          <input
            type="text"
            inputMode="numeric"
            name="target_nominal"
            value={form.target_nominal}
            onChange={onChange}
            className="w-full border-gray-300 rounded-lg shadow-sm focus:ring-red-600 focus:border-red-600"
            placeholder="Contoh: 50000000"
          />
          <p className="mt-1 text-xs text-gray-500">Masukkan angka tanpa titik/koma.</p>
        </div>
        <div className="pt-2 flex items-center gap-3">
          <button type="submit" disabled={saving} className="px-4 py-2 bg-red-700 text-white rounded-lg hover:bg-red-800 disabled:opacity-60">
            {saving ? 'Menyimpan...' : 'Simpan'}
          </button>
          <button type="button" onClick={() => navigate('/admin/marketing/data-target')} className="px-4 py-2 border rounded-lg hover:bg-gray-50">
            Batal
          </button>
        </div>
      </form>
    </div>
  );
};

export default AdminDataTargetForm;
