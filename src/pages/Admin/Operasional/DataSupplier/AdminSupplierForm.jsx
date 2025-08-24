import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Card, { CardHeader, CardBody } from '@/components/UI/Card';
import Button from '@/components/UI/Button';
import Input from '@/components/UI/Input';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/UI/Select';
import { 
  ArrowLeft, 
  Save, 
  Building
} from 'lucide-react';
import { dataSupplierService } from '@/services/dataSupplierService';

const AdminSupplierForm = () => {
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
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <div className="flex items-center gap-4 mb-4">
          <Link to="/admin/operasional/data-supplier">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Kembali
            </Button>
          </Link>
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-gray-900">Tambah Supplier Baru</h1>
            <p className="text-gray-600">Tambah data supplier baru ke sistem</p>
          </div>
        </div>
      </div>

      <Card>
        <CardHeader>
          <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
            <Building className="h-5 w-5 text-blue-600" />
            Form Tambah Supplier
          </h2>
        </CardHeader>
        <CardBody>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Kategori Supplier <span className="text-red-500">*</span>
                </label>
                <Select 
                  value={formData.kategori_supplier} 
                  onValueChange={(value) => handleInputChange('kategori_supplier', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih kategori supplier" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="SUPPLIER OUTLET">Supplier Outlet</SelectItem>
                    <SelectItem value="SUPPLIER TOKO TEPUNG & BB">Supplier Toko Tepung & BB</SelectItem>
                    <SelectItem value="SUPPLIER PRODUKSI">Supplier Produksi</SelectItem>
                    <SelectItem value="SUPPLIER KAMBING">Supplier Kambing</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Divisi <span className="text-red-500">*</span>
                </label>
                <Select 
                  value={formData.divisi} 
                  onValueChange={(value) => handleInputChange('divisi', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih divisi" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PRODUKSI">Produksi</SelectItem>
                    <SelectItem value="MARKETING">Marketing</SelectItem>
                    <SelectItem value="OPERASIONAL">Operasional</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nama Supplier <span className="text-red-500">*</span>
                </label>
                <Input
                  type="text"
                  value={formData.nama_supplier}
                  onChange={(e) => handleInputChange('nama_supplier', e.target.value)}
                  placeholder="Masukkan nama supplier"
                  className="w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  No. HP <span className="text-red-500">*</span>
                </label>
                <Input
                  type="tel"
                  value={formData.no_hp_supplier}
                  onChange={(e) => handleInputChange('no_hp_supplier', e.target.value)}
                  placeholder="Masukkan nomor HP"
                  className="w-full"
                />
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

            <div className="flex justify-end gap-3 pt-6 border-t">
              <Link to="/admin/operasional/data-supplier">
                <Button type="button" variant="outline">
                  Batal
                </Button>
              </Link>
              <Button type="submit" disabled={saving}>
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
          </form>
        </CardBody>
      </Card>
    </div>
  );
};

export default AdminSupplierForm;
