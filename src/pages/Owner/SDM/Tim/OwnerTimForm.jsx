import React from 'react';

const OwnerTimForm = () => {
  const [form, setForm] = React.useState({
    nama: '',
    warna: 'Merah',
    leader: '',
    anggota: 0,
    keterangan: '',
  });

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((s) => ({ ...s, [name]: name === 'anggota' ? Number(value) : value }));
  };

  const onSubmit = (e) => {
    e.preventDefault();
    alert('Submit form (stub): ' + JSON.stringify(form, null, 2));
  };

  return (
    <div className="w-full px-0">
      <div className="bg-white rounded-none shadow-sm p-4 sm:p-6">
        <h1 className="text-2xl font-bold text-gray-800">Form Tim - Owner</h1>

        <form onSubmit={onSubmit} className="mt-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Nama Tim</label>
              <input
                name="nama"
                value={form.nama}
                onChange={onChange}
                className="mt-1 w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Contoh: Tim Merah"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Warna</label>
              <select
                name="warna"
                value={form.warna}
                onChange={onChange}
                className="mt-1 w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option>Merah</option>
                <option>Biru</option>
                <option>Hijau</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Leader</label>
              <input
                name="leader"
                value={form.leader}
                onChange={onChange}
                className="mt-1 w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Nama leader"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Jumlah Anggota</label>
              <input
                type="number"
                min={0}
                name="anggota"
                value={form.anggota}
                onChange={onChange}
                className="mt-1 w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700">Keterangan</label>
              <textarea
                name="keterangan"
                value={form.keterangan}
                onChange={onChange}
                rows={4}
                className="mt-1 w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Catatan tambahan..."
              />
            </div>
          </div>

          <div className="pt-4 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => setForm({ nama: '', warna: 'Merah', leader: '', anggota: 0, keterangan: '' })}
              className="px-4 py-2 rounded-md border border-gray-300 hover:bg-gray-100"
            >
              Reset
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700"
            >
              Simpan
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default OwnerTimForm;
