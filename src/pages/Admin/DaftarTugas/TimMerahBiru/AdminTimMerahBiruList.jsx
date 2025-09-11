import React, { useState } from 'react';
import { Plus, RefreshCw } from 'lucide-react';

const AdminTimMerahBiruList = () => {
  const [loading, setLoading] = useState(false);

  const resetFilters = () => {
    // Tambahkan filter state di masa depan; untuk sekarang placeholder
    console.log('Reset filters');
  };

  const handleRefresh = () => {
    setLoading(true);
    // Placeholder refresh; hubungkan ke loader data saat tersedia
    setTimeout(() => setLoading(false), 500);
  };

  const handleAdd = () => {
    // Placeholder untuk aksi tambah
    console.log('Tambah Tim');
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header - unified red style */}
      <div className="bg-red-800 text-white px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span className="text-sm font-semibold bg-white/10 rounded px-2 py-1">H01-TMB</span>
            <div>
              <h1 className="text-xl md:text-2xl font-extrabold tracking-tight">TIM MERAH BIRU</h1>
              <p className="text-sm text-red-100">Kelola struktur dan anggota tim</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={resetFilters} className="px-4 py-2 rounded-full border border-white/60 text-white hover:bg-white/10">
              RESET FILTER
            </button>
            <button
              onClick={handleRefresh}
              disabled={loading}
              className="inline-flex items-center gap-2 px-4 py-2 bg-white text-red-700 rounded-lg hover:bg-red-50 transition-colors shadow-sm disabled:opacity-60"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              <span className="font-semibold">Refresh</span>
            </button>
            <button onClick={handleAdd} className="inline-flex items-center gap-2 px-4 py-2 bg-white text-red-700 rounded-lg hover:bg-red-50 transition-colors shadow-sm">
              <Plus className="h-4 w-4" />
              <span className="font-semibold">Tambah</span>
            </button>
          </div>
        </div>
      </div>

      {/* Content placeholder card */}
      <div className="container mx-auto p-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Tim Merah Biru - Admin</h2>
          <div className="text-center py-12">
            <p className="text-gray-600 text-lg">Halaman ini sedang dalam pengembangan</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminTimMerahBiruList;
