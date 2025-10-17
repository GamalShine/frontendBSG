import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Card, { CardHeader, CardBody } from '@/components/UI/Card';
import Button from '@/components/UI/Button';
import Input from '@/components/UI/Input';
import Select from '@/components/UI/Select';
import { X, Save, Building } from 'lucide-react';
import { dataSupplierService } from '@/services/dataSupplierService';

const AdminDataSupplierForm = ({ isOpen, onClose, onSuccess, editData = null }) => {
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    kategori_supplier: '',
    divisi: '',
    nama_supplier: '',
    no_hp_supplier: '',
    tanggal_kerjasama: '',
    npwp: '',
    alamat: '',
    keterangan: ''
  });

  // Determine open state (modal route fallback: open by default)
  const open = typeof isOpen === 'boolean' ? isOpen : true;

  useEffect(() => {
    if (editData) {
      setFormData({
        kategori_supplier: editData.kategori_supplier || '',
        divisi: editData.divisi || '',
        nama_supplier: editData.nama_supplier || '',
        no_hp_supplier: editData.no_hp_supplier || '',
        tanggal_kerjasama: editData.tanggal_kerjasama ? String(editData.tanggal_kerjasama).substring(0,10) : '',
        npwp: editData.npwp || '',
        alamat: editData.alamat || '',
        keterangan: editData.keterangan || ''
      });
    }
  }, [editData]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.kategori_supplier || !formData.divisi || !formData.nama_supplier || 
        !formData.no_hp_supplier || !formData.tanggal_kerjasama || !formData.alamat) {
      alert('Semua field wajib diisi kecuali NPWP dan keterangan');
      return;
    }

    try {
      setSaving(true);
      if (editData && editData.id) {
        await dataSupplierService.update(editData.id, formData);
        alert('Supplier berhasil diperbarui');
        if (onSuccess) onSuccess();
        if (onClose) return onClose();
        navigate('/admin/operasional/data-supplier');
      } else {
        await dataSupplierService.create(formData);
        alert('Supplier berhasil ditambahkan');
        if (onSuccess) onSuccess();
        if (onClose) return onClose();
        navigate('/admin/operasional/data-supplier');
      }
    } catch (err) {
      alert(editData ? 'Gagal memperbarui supplier' : 'Gagal menambahkan supplier');
      console.error('Error creating supplier:', err);
    } finally {
      setSaving(false);
    }
  };

  if (!open) return null;

  const handleClose = () => {
    if (onClose) return onClose();
    navigate('/admin/operasional/data-supplier');
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-[1px] flex items-center justify-center z-50 p-4">
      {/* Backdrop click to close (kept behavior) */}
      <button
        type="button"
        aria-hidden="true"
        onClick={handleClose}
        className="absolute inset-0"
        tabIndex={-1}
      />

      {/* Modal Panel */}
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[92vh] overflow-hidden border border-gray-200 flex flex-col relative">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-red-700 bg-red-800 text-white sticky top-0 z-10">
          <div className="flex items-center">
            <div>
              <h1 className="text-xl font-bold leading-tight">{editData ? 'Edit Supplier' : 'Tambah Supplier Baru'}</h1>
            </div>
          </div>
          <button
            type="button"
            onClick={handleClose}
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
              <h2 className="text-sm font-semibold text-gray-700">
                Informasi Supplier
              </h2>
            </CardHeader>
            <CardBody>
              <form id="supplierForm" onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Kategori Supplier <span className="text-red-500">*</span>
                      </label>
                      <Select 
                        value={formData.kategori_supplier} 
                        onValueChange={(value) => handleInputChange('kategori_supplier', value)}
                        placeholder="Pilih kategori supplier"
                        options={[
                          { value: 'SUPPLIER OUTLET', label: 'Supplier Outlet' },
                          { value: 'SUPPLIER TOKO TEPUNG & BB', label: 'Supplier Toko Tepung & BB' },
                          { value: 'SUPPLIER PRODUKSI', label: 'Supplier Produksi' },
                          { value: 'SUPPLIER KAMBING', label: 'Supplier Kambing' }
                        ]}
                      />
                      <p className="mt-1 text-xs text-gray-500">Kategori akan membantu pengelompokan supplier.</p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Divisi <span className="text-red-500">*</span>
                      </label>
                      <Select 
                        value={formData.divisi} 
                        onValueChange={(value) => handleInputChange('divisi', value)}
                        placeholder="Pilih divisi"
                        options={[
                          { value: 'PRODUKSI', label: 'Produksi' },
                          { value: 'MARKETING', label: 'Marketing' },
                          { value: 'OPERASIONAL', label: 'Operasional' }
                        ]}
                      />
                      <p className="mt-1 text-xs text-gray-500">Pilih divisi penanggung jawab supplier.</p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Nama Supplier <span className="text-red-500">*</span>
                      </label>
                      <Input
                        type="text"
                        value={formData.nama_supplier}
                        onChange={(e) => handleInputChange('nama_supplier', e.target.value)}
                        placeholder="Masukkan nama supplier (contoh: PT Contoh Abadi)"
                        className="w-full"
                      />
                      <p className="mt-1 text-xs text-gray-500">Gunakan nama legal/terdaftar bila ada.</p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        No. HP <span className="text-red-500">*</span>
                      </label>
                      <Input
                        type="tel"
                        value={formData.no_hp_supplier}
                        onChange={(e) => handleInputChange('no_hp_supplier', e.target.value)}
                        placeholder="Masukkan nomor HP/WA aktif"
                        className="w-full"
                      />
                      <p className="mt-1 text-xs text-gray-500">Pastikan nomor dapat dihubungi.</p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Tanggal Kerjasama <span className="text-red-500">*</span>
                      </label>
                      <Input
                        type="date"
                        value={formData.tanggal_kerjasama}
                        onChange={(e) => handleInputChange('tanggal_kerjasama', e.target.value)}
                        className="w-full"
                      />
                      <p className="mt-1 text-xs text-gray-500">Tanggal pertama kali bekerja sama.</p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        NPWP
                      </label>
                      <Input
                        type="text"
                        value={formData.npwp}
                        onChange={(e) => handleInputChange('npwp', e.target.value)}
                        placeholder="Masukkan NPWP (opsional)"
                        className="w-full"
                      />
                      <p className="mt-1 text-xs text-gray-500">Isi jika tersedia untuk keperluan administrasi.</p>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Alamat <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      value={formData.alamat}
                      onChange={(e) => handleInputChange('alamat', e.target.value)}
                      placeholder="Masukkan alamat lengkap"
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <p className="mt-1 text-xs text-gray-500">Cantumkan alamat operasional/lokasi pengiriman.</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Keterangan
                    </label>
                    <textarea
                      value={formData.keterangan}
                      onChange={(e) => handleInputChange('keterangan', e.target.value)}
                      placeholder="Masukkan keterangan tambahan (opsional)"
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </form>
            </CardBody>
          </Card>
        </div>

        {/* Footer (non-scrollable) */}
        <div className="p-0 border-t bg-white">
          <div className="grid grid-cols-2 gap-2 px-2 py-2">
            <button
              type="button"
              onClick={handleClose}
              className="w-full py-3 bg-red-700 text-white font-semibold hover:bg-red-800 transition-colors rounded-lg"
            >
              Batal
            </button>
            <button
              type="submit"
              form="supplierForm"
              disabled={saving}
              className="w-full py-3 bg-red-700 text-white font-semibold hover:bg-red-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors rounded-lg flex items-center justify-center gap-2"
            >
              {saving ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              ) : (
                <Save className="w-4 h-4" />
              )}
              <span>{saving ? 'Menyimpan...' : (editData ? 'Update Supplier' : 'Simpan Supplier')}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDataSupplierForm;