import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Card, { CardHeader, CardBody } from '@/components/UI/Card';
import { X, Save } from 'lucide-react';

const AdminDataBinaLingkunganForm = () => {
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      // TODO: implement create bina lingkungan
      navigate('/admin/operasional/bina-lingkungan');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-[1px] flex items-center justify-center z-50 p-4">
      {/* Backdrop click to close */}
      <button
        type="button"
        aria-hidden="true"
        onClick={() => navigate('/admin/operasional/bina-lingkungan')}
        className="absolute inset-0"
        tabIndex={-1}
      />

      {/* Modal Panel */}
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[92vh] overflow-hidden border border-gray-200 flex flex-col relative">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-red-700 bg-red-800 text-white sticky top-0 z-10">
          <div>
            <h1 className="text-xl font-bold leading-tight">Tambah Data Bina Lingkungan</h1>
            <p className="text-xs text-red-100">Lengkapi data bina lingkungan sesuai kebutuhan</p>
          </div>
          <button
            type="button"
            onClick={() => navigate('/admin/operasional/bina-lingkungan')}
            className="p-2 text-white/90 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
            aria-label="Tutup"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable body */}
        <div className="flex-1 min-h-0 overflow-y-auto px-6 py-5 scrollbar-hide">
          <Card>
            <CardHeader>
              <h2 className="text-sm font-semibold text-gray-700">Informasi Bina Lingkungan</h2>
            </CardHeader>
            <CardBody>
              <form id="binaLingkunganForm" onSubmit={handleSubmit} className="space-y-6">
                <div className="text-gray-600">Konten form akan disiapkan. Desain modal sudah seragam.</div>
              </form>
            </CardBody>
          </Card>
        </div>

        {/* Footer (non-scrollable) */}
        <div className="p-0 border-t bg-white">
          <div className="grid grid-cols-2 gap-2 px-2 py-2">
            <button
              type="button"
              onClick={() => navigate('/admin/operasional/bina-lingkungan')}
              className="w-full py-3 bg-red-700 text-white font-semibold hover:bg-red-800 transition-colors rounded-lg"
            >
              Batal
            </button>
            <button
              type="submit"
              form="binaLingkunganForm"
              disabled={saving}
              className="w-full py-3 bg-red-700 text-white font-semibold hover:bg-red-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors rounded-lg flex items-center justify-center gap-2"
            >
              {saving ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              ) : (
                <Save className="w-4 h-4" />
              )}
              <span>{saving ? 'Menyimpan...' : 'Simpan'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDataBinaLingkunganForm;
