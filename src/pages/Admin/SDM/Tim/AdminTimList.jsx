import React from 'react';

const AdminTimList = () => {
  const [search, setSearch] = React.useState('');
  const [selected, setSelected] = React.useState(null);

  const data = React.useMemo(
    () => [
      { id: 1, nama: 'Tim Merah', warna: 'Merah', leader: 'Andi', anggota: 8, keterangan: 'Fokus proyek A' },
      { id: 2, nama: 'Tim Biru', warna: 'Biru', leader: 'Budi', anggota: 6, keterangan: 'Fokus proyek B' },
      { id: 3, nama: 'Tim Hijau', warna: 'Hijau', leader: 'Citra', anggota: 7, keterangan: 'Proyek internal' },
    ],
    []
  );

  const filtered = React.useMemo(() => {
    if (!search) return data;
    const s = search.toLowerCase();
    return data.filter(
      (d) =>
        d.nama.toLowerCase().includes(s) ||
        d.warna.toLowerCase().includes(s) ||
        d.leader.toLowerCase().includes(s)
    );
  }, [data, search]);

  return (
    <div className="w-full px-0">
      <div className="bg-white rounded-none shadow-sm p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <h1 className="text-2xl font-bold text-gray-800">Tim - Admin</h1>
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder=""
              aria-label="Pencarian tim"
              className="w-full sm:w-72 border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              className="whitespace-nowrap bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md"
              onClick={() => alert('Aksi tambah tim (stub)')}
            >
              + Tambah Tim
            </button>
          </div>
        </div>

        <div className="mt-4 overflow-x-auto">
          <table className="min-w-full border border-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left text-sm font-semibold text-gray-700 px-3 py-2 border-b">#</th>
                <th className="text-left text-sm font-semibold text-gray-700 px-3 py-2 border-b">Nama Tim</th>
                <th className="text-left text-sm font-semibold text-gray-700 px-3 py-2 border-b">Warna</th>
                <th className="text-left text-sm font-semibold text-gray-700 px-3 py-2 border-b">Leader</th>
                <th className="text-left text-sm font-semibold text-gray-700 px-3 py-2 border-b">Anggota</th>
                <th className="text-right text-sm font-semibold text-gray-700 px-3 py-2 border-b">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((row, idx) => (
                <tr key={row.id} className="odd:bg-white even:bg-gray-50">
                  <td className="px-3 py-2 border-b align-top">{idx + 1}</td>
                  <td className="px-3 py-2 border-b align-top font-medium text-gray-800">{row.nama}</td>
                  <td className="px-3 py-2 border-b align-top">
                    <span className="inline-flex items-center gap-2">
                      <span className={`h-3 w-3 rounded-full ${row.warna.toLowerCase() === 'merah' ? 'bg-red-500' : row.warna.toLowerCase() === 'biru' ? 'bg-blue-500' : 'bg-green-500'}`}></span>
                      {row.warna}
                    </span>
                  </td>
                  <td className="px-3 py-2 border-b align-top">{row.leader}</td>
                  <td className="px-3 py-2 border-b align-top">{row.anggota}</td>
                  <td className="px-3 py-2 border-b align-top">
                    <div className="flex justify-end gap-2">
                      <button
                        className="px-3 py-1.5 text-sm rounded-md border border-gray-300 hover:bg-gray-100"
                        onClick={() => setSelected(row)}
                      >
                        Detail
                      </button>
                      <button
                        className="px-3 py-1.5 text-sm rounded-md bg-amber-500 text-white hover:bg-amber-600"
                        onClick={() => alert('Aksi edit tim (stub)')}
                      >
                        Edit
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-3 py-6 text-center text-gray-500">Tidak ada data</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50" onClick={() => setSelected(null)} />
          <div className="relative z-10 w-full max-w-xl bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-start justify-between gap-4">
              <h2 className="text-xl font-semibold text-gray-800">Detail Tim</h2>
              <button
                className="p-2 rounded-md hover:bg-gray-100"
                onClick={() => setSelected(null)}
                aria-label="Tutup"
              >
                ✕
              </button>
            </div>
            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <div className="text-sm text-gray-500">Nama Tim</div>
                <div className="font-medium">{selected.nama}</div>
              </div>
              <div>
                <div className="text-sm text-gray-500">Warna</div>
                <div className="font-medium">{selected.warna}</div>
              </div>
              <div>
                <div className="text-sm text-gray-500">Leader</div>
                <div className="font-medium">{selected.leader}</div>
              </div>
              <div>
                <div className="text-sm text-gray-500">Jumlah Anggota</div>
                <div className="font-medium">{selected.anggota}</div>
              </div>
              <div className="sm:col-span-2">
                <div className="text-sm text-gray-500">Keterangan</div>
                <div className="font-medium">{selected.keterangan || '-'}</div>
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-2">
              <button
                className="px-4 py-2 rounded-md border border-gray-300 hover:bg-gray-100"
                onClick={() => setSelected(null)}
              >
                Tutup
              </button>
              <button
                className="px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700"
                onClick={() => alert('Menuju halaman edit (stub)')}
              >
                Edit Tim
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminTimList;
