import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Card, { CardHeader, CardBody } from '@/components/UI/Card';
import Button from '@/components/UI/Button';
import Input from '@/components/UI/Input';
import Select from '@/components/UI/Select';
import { X, Save, Building } from 'lucide-react';
import { dataSupplierService } from '@/services/dataSupplierService';

const AdminDataSupplierForm = () => {
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
      await dataSupplierService.create(formData);
      alert('Supplier berhasil ditambahkan');
      navigate('/admin/operasional/data-supplier');
    } catch (err) {
      alert('Gagal menambahkan supplier');
      console.error('Error creating supplier:', err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[1000]">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-[1px]"
        onClick={() => navigate('/admin/operasional/data-supplier')}
        aria-hidden="true"
      />

      {/* Modal Panel */}
      <div className="absolute inset-0 flex items-center justify-center p-4">
        <div className="w-full max-w-4xl bg-white rounded-xl shadow-2xl ring-1 ring-black/5">
          <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-4 border-b bg-red-800 text-white">
            <div className="flex items-center gap-3">
              <div>
                <h1 className="text-xl md:text-2xl font-extrabold tracking-tight">Tambah Supplier Baru</h1>
                <p className="text-red-100 text-sm">Lengkapi data supplier dengan benar, pastikan nomor dan alamat valid</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => navigate('/admin/operasional/data-supplier')}
              className="p-2 text-white/90 hover:text-white hover:bg-white/10 rounded-lg"
              aria-label="Tutup"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="max-h-[70vh] overflow-auto px-6 py-4">
            <Card>
              <CardHeader>
                <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <Building className="h-5 w-5 text-blue-600" />
                  Informasi Supplier
                </h2>
              </CardHeader>
              <CardBody>
                <form id="supplierForm" onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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

          {/* Modal Footer - sticky */}
          <div className="sticky bottom-0 z-10 flex items-center justify-end gap-3 px-6 py-4 border-t bg-white/95 supports-[backdrop-filter]:bg-white/75 backdrop-blur rounded-b-xl">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate('/admin/operasional/data-supplier')}
            >
              Batal
            </Button>
            <Button type="submit" form="supplierForm" disabled={saving}>
              {saving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Menyimpan...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Simpan Supplier
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
;

export default AdminDataSupplierForm;