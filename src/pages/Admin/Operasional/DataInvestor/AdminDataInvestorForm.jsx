import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  Users, 
  User,
  X,
  Save,
  ArrowLeft
} from 'lucide-react';
import { dataInvestorService } from '@/services/dataInvestorService';
import { toast } from 'react-hot-toast';

const AdminDataInvestorForm = ({ isOpen, onClose, onSuccess, editData = null }) => {
  const [formData, setFormData] = useState({
    outlet: '',
    daftar_investor: '',
    persentase_bagi_hasil: '',
    // Biodata fields
    nama_investor: '',
    ttl_investor: '',
    no_hp: '',
    alamat: '',
    tanggal_join: '',
    kontak_darurat: '',
    nama_pasangan: '',
    nama_anak: '',
    investasi_di_outlet: '',
    persentase_bagi_hasil_biodata: ''
  });

  const [selectedType, setSelectedType] = useState('outlet');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (editData) {
      setSelectedType(editData.tipe_data || 'outlet');
      if (editData.tipe_data === 'outlet') {
        setFormData({
          outlet: editData.outlet || '',
          daftar_investor: editData.nama_investor || '',
          persentase_bagi_hasil: editData.persentase_bagi_hasil || '',
          // Reset biodata fields
          nama_investor: '',
          ttl_investor: '',
          no_hp: '',
          alamat: '',
          tanggal_join: '',
          kontak_darurat: '',
          nama_pasangan: '',
          nama_anak: '',
          investasi_di_outlet: '',
          persentase_bagi_hasil_biodata: ''
        });
      } else {
        setFormData({
          outlet: editData.outlet || '',
          nama_investor: editData.nama_investor || '',
          ttl_investor: editData.ttl_investor || '',
          no_hp: editData.no_hp || '',
          alamat: editData.alamat || '',
          tanggal_join: editData.tanggal_join || '',
          kontak_darurat: editData.kontak_darurat || '',
          nama_pasangan: editData.nama_pasangan || '',
          nama_anak: editData.nama_anak || '',
          investasi_di_outlet: editData.investasi_di_outlet || '',
          persentase_bagi_hasil_biodata: editData.persentase_bagi_hasil || '',
          // Reset outlet fields
          daftar_investor: '',
          persentase_bagi_hasil: ''
        });
      }
    }
  }, [editData]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleTypeChange = (e) => {
    const newType = e.target.value;
    setSelectedType(newType);
    
    // Reset form data when switching types
    setFormData({
      outlet: formData.outlet, // Keep outlet
      daftar_investor: '',
      persentase_bagi_hasil: '',
      nama_investor: '',
      ttl_investor: '',
      no_hp: '',
      alamat: '',
      tanggal_join: '',
      kontak_darurat: '',
      nama_pasangan: '',
      nama_anak: '',
      investasi_di_outlet: '',
      persentase_bagi_hasil_biodata: ''
    });
    
    // Clear errors
    setErrors({});
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.outlet) {
      newErrors.outlet = 'Nama outlet harus diisi';
    }
    
    if (selectedType === 'outlet') {
      if (!formData.daftar_investor) {
        newErrors.daftar_investor = 'Daftar investor harus diisi';
      }
    } else {
      if (!formData.nama_investor) {
        newErrors.nama_investor = 'Nama investor harus diisi';
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);
    
    try {
      let success = true;
      
      if (editData) {
        // Update investor yang ada
        const updateData = selectedType === 'outlet' ? {
          outlet: formData.outlet,
          nama_investor: formData.daftar_investor,
          persentase_bagi_hasil: formData.persentase_bagi_hasil || '50%-50%',
          tipe_data: 'outlet'
        } : {
          outlet: formData.outlet,
          nama_investor: formData.nama_investor,
          ttl_investor: formData.ttl_investor,
          no_hp: formData.no_hp,
          alamat: formData.alamat,
          tanggal_join: formData.tanggal_join,
          kontak_darurat: formData.kontak_darurat,
          nama_pasangan: formData.nama_pasangan,
          nama_anak: formData.nama_anak,
          investasi_di_outlet: formData.investasi_di_outlet || 0,
          persentase_bagi_hasil: formData.persentase_bagi_hasil_biodata || '50%-50%',
          tipe_data: 'biodata'
        };
        
        const response = await dataInvestorService.updateDataInvestor(editData.id, updateData);
        if (!response.success) success = false;
        toast.success('Data investor berhasil diupdate');
      } else {
        if (selectedType === 'outlet') {
          // Buat multiple investor baru untuk outlet
          const investorNames = formData.daftar_investor
            .split('\n')
            .map(name => name.trim())
            .filter(name => name.length > 0);

          const investorsData = investorNames.map(nama_investor => ({
            outlet: formData.outlet,
            nama_investor: nama_investor,
            persentase_bagi_hasil: formData.persentase_bagi_hasil || '50%-50%',
            tipe_data: 'outlet',
            no_hp: '',
            alamat: '',
            ttl_investor: '',
            tanggal_join: '',
            kontak_darurat: '',
            nama_pasangan: '',
            nama_anak: '',
            investasi_di_outlet: 0
          }));

          for (const investorData of investorsData) {
            const response = await dataInvestorService.createDataInvestor(investorData);
            if (!response.success) {
              success = false;
              break;
            }
          }
          if (success) {
            toast.success(`${investorsData.length} data investor berhasil ditambahkan`);
          }
        } else {
          // Buat single investor biodata
          const response = await dataInvestorService.createDataInvestor({
            outlet: formData.outlet,
            nama_investor: formData.nama_investor,
            ttl_investor: formData.ttl_investor,
            no_hp: formData.no_hp,
            alamat: formData.alamat,
            tanggal_join: formData.tanggal_join,
            kontak_darurat: formData.kontak_darurat,
            nama_pasangan: formData.nama_pasangan,
            nama_anak: formData.nama_anak,
            investasi_di_outlet: formData.investasi_di_outlet || 0,
            persentase_bagi_hasil: formData.persentase_bagi_hasil_biodata || '50%-50%',
            tipe_data: 'biodata'
          });
          
          if (response.success) {
            toast.success('Biodata investor berhasil ditambahkan');
          } else {
            success = false;
          }
        }
      }
      
      if (success) {
        onSuccess();
        onClose();
        setFormData({
          outlet: '',
          daftar_investor: '',
          persentase_bagi_hasil: '',
          nama_investor: '',
          ttl_investor: '',
          no_hp: '',
          alamat: '',
          tanggal_join: '',
          kontak_darurat: '',
          nama_pasangan: '',
          nama_anak: '',
          investasi_di_outlet: '',
          persentase_bagi_hasil_biodata: ''
        });
        setSelectedType('outlet');
      }
    } catch (error) {
      console.error('Error saving data investor:', error);
      toast.error(editData ? 'Gagal update data investor' : 'Gagal tambah data investor');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const isOutletForm = selectedType === 'outlet';
  const title = editData ? 'Edit Data Investor' : 'Tambah Data Investor';
  const buttonText = isOutletForm ? 'SIMPAN DATA' : 'SIMPAN BIODATA';

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header - Merah Gelap seperti Mobile App */}
        <div className="bg-red-800 text-white p-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <button
              onClick={onClose}
              className="p-2 hover:bg-red-700 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>
            <div>
              <h2 className="text-xl font-semibold">
                {title}
              </h2>
              <p className="text-sm text-red-100">H01-P4</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-red-700 rounded-lg transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6">
          <div className="space-y-6">
            {/* Pilih Tipe Data */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                <Building2 className="w-5 h-5 text-red-600 mr-2" />
                Pilih Tipe Data
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Tipe Data */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tipe Data <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="tipe_data"
                    value={selectedType}
                    onChange={handleTypeChange}
                    className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent text-lg"
                  >
                    <option value="outlet">Outlet</option>
                    <option value="investor">Investor (Biodata)</option>
                  </select>
        </div>
              </div>
            </div>

            {/* NAMA OUTLET - Selalu tampil */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                NAMA OUTLET <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="outlet"
                value={formData.outlet}
                onChange={handleInputChange}
                className={`w-full px-3 py-3 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent text-lg ${
                  errors.outlet ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Masukkan nama outlet"
              />
              {errors.outlet && (
                <p className="text-red-500 text-sm mt-1">{errors.outlet}</p>
              )}
            </div>

            {/* Form Outlet - Hanya tampil jika selectedType = 'outlet' */}
            {isOutletForm && (
              <>
                {/* DAFTAR INVESTOR */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    DAFTAR INVESTOR <span className="text-red-500">*</span>
                  </label>
                  <p className="text-sm text-gray-600 mb-2">
                    Masukkan nama investor (satu nama per baris)
                  </p>
                  <textarea
                    name="daftar_investor"
                    value={formData.daftar_investor}
                    onChange={handleInputChange}
                    rows={6}
                    className={`w-full px-3 py-3 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent text-lg ${
                      errors.daftar_investor ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Nama Investor 1&#10;Nama Investor 2&#10;Nama Investor 3"
                  />
                  {errors.daftar_investor && (
                    <p className="text-red-500 text-sm mt-1">{errors.daftar_investor}</p>
                  )}
                </div>

                {/* PERSENTASE BAGI HASIL */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    PERSENTASE BAGI HASIL
                  </label>
                  <input
                    type="text"
                    name="persentase_bagi_hasil"
                    value={formData.persentase_bagi_hasil}
                    onChange={handleInputChange}
                    className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent text-lg"
                    placeholder="Contoh: 30%"
                  />
                </div>
              </>
            )}

            {/* Form Investor (Biodata) - Hanya tampil jika selectedType = 'investor' */}
            {!isOutletForm && (
              <>
                {/* NAMA INVESTOR */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    NAMA INVESTOR <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="nama_investor"
                    value={formData.nama_investor}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-3 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent text-lg ${
                      errors.nama_investor ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Masukkan nama investor"
                  />
                  {errors.nama_investor && (
                    <p className="text-red-500 text-sm mt-1">{errors.nama_investor}</p>
                  )}
                </div>

                {/* TTL INVESTOR */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    TTL INVESTOR
                  </label>
                  <input
                    type="text"
                    name="ttl_investor"
                    value={formData.ttl_investor}
                    onChange={handleInputChange}
                    className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent text-lg"
                    placeholder="Contoh: Jakarta, 01 Januari 1990"
                  />
                </div>

                {/* NO. HP */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    NO. HP
                  </label>
                  <input
                    type="text"
                    name="no_hp"
                    value={formData.no_hp}
                    onChange={handleInputChange}
                    className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent text-lg"
                    placeholder="Contoh: 081234567890"
                  />
                </div>

                {/* ALAMAT */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    ALAMAT
                  </label>
                  <textarea
                    name="alamat"
                    value={formData.alamat}
                    onChange={handleInputChange}
                    rows={3}
                    className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent text-lg"
                    placeholder="Masukkan alamat lengkap"
                  />
                </div>

                {/* TANGGAL JOIN */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    TANGGAL JOIN
                  </label>
                  <input
                    type="date"
                    name="tanggal_join"
                    value={formData.tanggal_join}
                    onChange={handleInputChange}
                    className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent text-lg"
                  />
                </div>

                {/* KONTAK DARURAT */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    KONTAK DARURAT
                  </label>
                  <input
                    type="text"
                    name="kontak_darurat"
                    value={formData.kontak_darurat}
                    onChange={handleInputChange}
                    className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent text-lg"
                    placeholder="Contoh: 081234567890"
                  />
                </div>

                {/* NAMA PASANGAN */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    NAMA PASANGAN
                  </label>
                  <input
                    type="text"
                    name="nama_pasangan"
                    value={formData.nama_pasangan}
                    onChange={handleInputChange}
                    className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent text-lg"
                    placeholder="Masukkan nama pasangan"
                  />
                </div>

                {/* NAMA ANAK */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    NAMA ANAK
                  </label>
                  <input
                    type="text"
                    name="nama_anak"
                    value={formData.nama_anak}
                    onChange={handleInputChange}
                    className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent text-lg"
                    placeholder="Masukkan nama anak (pisahkan dengan koma)"
                  />
                </div>

                {/* INVESTASI DI OUTLET */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    INVESTASI DI OUTLET
                  </label>
                  <input
                    type="number"
                    name="investasi_di_outlet"
                    value={formData.investasi_di_outlet}
                    onChange={handleInputChange}
                    className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent text-lg"
                    placeholder="Contoh: 10000000"
                    step="1000"
                  />
                </div>

                {/* PERSENTASE BAGI HASIL */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    PERSENTASE BAGI HASIL
                  </label>
                  <input
                    type="text"
                    name="persentase_bagi_hasil_biodata"
                    value={formData.persentase_bagi_hasil_biodata}
                    onChange={handleInputChange}
                    className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent text-lg"
                    placeholder="Contoh: 30%"
                  />
                </div>
              </>
            )}
          </div>

          {/* Action Button */}
          <div className="pt-6 mt-6">
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-red-800 text-white py-4 px-6 rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-lg font-bold uppercase"
            >
              {loading ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  <span>Menyimpan...</span>
                </div>
              ) : (
                buttonText
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminDataInvestorForm;
