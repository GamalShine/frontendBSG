import React from 'react';

import { MENU_CODES } from '@/config/menuCodes';

const OwnerLaporanKeuangan = () => {
  return (
    <div className="p-0 bg-gray-50 min-h-screen">
      {/* Header Merah + Badge */}
      <div className="bg-red-800 text-white px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span className="text-sm font-semibold bg-white/10 rounded px-2 py-1">{MENU_CODES.keuangan.laporanKeuangan}</span>
            <div>
              <h1 className="text-xl md:text-2xl font-extrabold tracking-tight">LAPORAN KEUANGAN</h1>
              <p className="text-sm text-red-100">Ringkasan laporan keuangan untuk Owner</p>
            </div>
          </div>
        </div>
      </div>

      {/* Konten (placeholder) */}
      <div className="container mx-auto p-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-2">Laporan Keuangan - Owner</h2>
          <div className="text-center py-12">
            <p className="text-gray-600 text-lg">Halaman ini sedang dalam pengembangan</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OwnerLaporanKeuangan;

