import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from './components/UI/Card';

const TestPage = () => {
  return (
    <div className="p-6 space-y-6">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">
        Test Page - Struktur Folder Baru
      </h1>

      {/* Owner Routes */}
      <Card>
        <CardHeader>
          <CardTitle>Owner Routes - New Structure</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h3 className="font-semibold text-lg mb-2">Keuangan</h3>
              <div className="space-y-2">
                <Link 
                  to="/owner/keuangan/laporan" 
                  className="block text-blue-600 hover:text-blue-800"
                >
                  /owner/keuangan/laporan - Laporan Keuangan
                </Link>
                <Link 
                  to="/owner/keuangan/omset-harian" 
                  className="block text-blue-600 hover:text-blue-800"
                >
                  /owner/keuangan/omset-harian - Omset Harian
                </Link>
                <Link 
                  to="/owner/keuangan/aneka-grafik" 
                  className="block text-blue-600 hover:text-blue-800"
                >
                  /owner/keuangan/aneka-grafik - Aneka Grafik
                </Link>
                <Link 
                  to="/owner/keuangan/gaji" 
                  className="block text-blue-600 hover:text-blue-800"
                >
                  /owner/keuangan/gaji - Daftar Gaji
                </Link>
              </div>
            </div>
            <div>
              <h3 className="font-semibold text-lg mb-2">Operasional</h3>
              <div className="space-y-2">
                <Link 
                  to="/owner/operasional/aset" 
                  className="block text-blue-600 hover:text-blue-800"
                >
                  /owner/operasional/aset - Data Aset
                </Link>
              </div>
            </div>
            <div>
              <h3 className="font-semibold text-lg mb-2">Marketing</h3>
              <div className="space-y-2">
                <Link 
                  to="/owner/marketing/target" 
                  className="block text-blue-600 hover:text-blue-800"
                >
                  /owner/marketing/target - Data Target
                </Link>
              </div>
            </div>
            <div>
              <h3 className="font-semibold text-lg mb-2">SDM</h3>
              <div className="space-y-2">
                <Link 
                  to="/owner/sdm/tim" 
                  className="block text-blue-600 hover:text-blue-800"
                >
                  /owner/sdm/tim - Data Tim
                </Link>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Admin Routes */}
      <Card>
        <CardHeader>
          <CardTitle>Admin Routes - New Structure</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h3 className="font-semibold text-lg mb-2">Keuangan</h3>
              <div className="space-y-2">
                <Link 
                  to="/admin/keuangan/laporan" 
                  className="block text-blue-600 hover:text-blue-800"
                >
                  /admin/keuangan/laporan - Laporan Keuangan
                </Link>
                <Link 
                  to="/admin/keuangan/poskas/new" 
                  className="block text-blue-600 hover:text-blue-800"
                >
                  /admin/keuangan/poskas/new - Buat Poskas
                </Link>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tim Routes */}
      <Card>
        <CardHeader>
          <CardTitle>Tim Routes - New Structure</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h3 className="font-semibold text-lg mb-2">Keuangan</h3>
              <div className="space-y-2">
                <Link 
                  to="/tim/keuangan/poskas/new" 
                  className="block text-blue-600 hover:text-blue-800"
                >
                  /tim/keuangan/poskas/new - Input Poskas
                </Link>
              </div>
            </div>
            <div>
              <h3 className="font-semibold text-lg mb-2">Operasional</h3>
              <div className="space-y-2">
                <Link 
                  to="/tim/operasional/komplain/new" 
                  className="block text-blue-600 hover:text-blue-800"
                >
                  /tim/operasional/komplain/new - Input Komplain
                </Link>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Divisi Routes */}
      <Card>
        <CardHeader>
          <CardTitle>Divisi Routes - New Structure</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h3 className="font-semibold text-lg mb-2">Keuangan</h3>
              <div className="space-y-2">
                <Link 
                  to="/divisi/keuangan/poskas" 
                  className="block text-blue-600 hover:text-blue-800"
                >
                  /divisi/keuangan/poskas - Lihat Poskas (Read Only)
                </Link>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Legacy Routes */}
      <Card>
        <CardHeader>
          <CardTitle>Legacy Routes (Still Working)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h3 className="font-semibold text-lg mb-2">Owner Legacy</h3>
              <div className="space-y-2">
                <Link 
                  to="/owner/poskas" 
                  className="block text-blue-600 hover:text-blue-800"
                >
                  /owner/poskas - Owner Poskas List
                </Link>
                <Link 
                  to="/owner/tim" 
                  className="block text-blue-600 hover:text-blue-800"
                >
                  /owner/tim - Owner Tim List
                </Link>
                <Link 
                  to="/owner/training" 
                  className="block text-blue-600 hover:text-blue-800"
                >
                  /owner/training - Owner Training List
                </Link>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TestPage; 