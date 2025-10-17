import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  Car, 
  Monitor, 
  X,
  Save,
  AlertCircle
} from 'lucide-react';
import { dataAsetService } from '@/services/dataAsetService';
import { API_CONFIG } from '@/config/constants';
import { toast } from 'react-hot-toast';

const AdminDataAsetForm = ({ isOpen, onClose, onSuccess, editData = null }) => {
  const initialForm = {
    nama_aset: '',
    merk_kendaraan: '',
    nama_barang: '',
    kategori: 'PROPERTI',
    no_sertifikat: '',
    lokasi: '',
    atas_nama: '',
    data_pembelian: '',
    status: 'AKTIF',
    data_pbb: '',
    plat_nomor: '',
    nomor_mesin: '',
    nomor_rangka: '',
    pajak_berlaku: '',
    stnk_berlaku: '',
    estimasi_pembayaran_pajak: '',
    terakhir_service: '',
    jadwal_service_berikutnya: '',
    asuransi_pakai: 'TIDAK',
    jenis_asuransi: '',
    asuransi_berlaku: '',
    penanggung_jawab: '',
    merk: '',
    model: '',
    serial_number: '',
    tahun_pembelian: '',
    lampiran: ''
  }
  const [formData, setFormData] = useState(initialForm);

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [selectedFiles, setSelectedFiles] = useState([]);

  const toFileUrl = (p) => {
    if (!p) return '#';
    const raw = String(p);
    if (/^https?:\/\//i.test(raw)) return raw;
    const clean = raw.replace(/^\/+/, '');
    const url = `${API_CONFIG.BASE_HOST}/${clean}`;
    return encodeURI(url);
  };

  useEffect(() => {
    if (editData) {
      setFormData(editData);
    } else {
      setFormData(initialForm);
    }
    setSelectedFiles([]);
    setErrors({});
  }, [editData]);

  const handleClose = () => {
    setFormData(initialForm);
    setSelectedFiles([]);
    setErrors({});
    onClose();
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.kategori) {
      newErrors.kategori = 'Kategori harus dipilih';
    }
    
    if (formData.kategori === 'PROPERTI' && !formData.nama_aset) {
      newErrors.nama_aset = 'Nama aset properti harus diisi';
    }
    
    if (['KENDARAAN_PRIBADI', 'KENDARAAN_OPERASIONAL', 'KENDARAAN_DISTRIBUSI'].includes(formData.kategori) && !formData.merk_kendaraan) {
      newErrors.merk_kendaraan = 'Merk kendaraan harus diisi';
    }
    
    if (formData.kategori === 'ELEKTRONIK' && !formData.nama_barang) {
      newErrors.nama_barang = 'Nama barang elektronik harus diisi';
    }
    
    if (!formData.lokasi) {
      newErrors.lokasi = 'Lokasi harus diisi';
    }
    
    if (!formData.atas_nama) {
      newErrors.atas_nama = 'Atas nama harus diisi';
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
      let response;
      if (editData) {
        response = await dataAsetService.updateDataAset(editData.id, formData);
        toast.success('Data aset berhasil diupdate');
      } else {
        response = await dataAsetService.createDataAset(formData);
        toast.success('Data aset berhasil ditambahkan');
        // Jika ada file foto dipilih, langsung upload setelah create
        try {
          const newId = response?.data?.id;
          if (newId && selectedFiles.length > 0) {
            const loadingToast = toast.loading('Mengunggah lampiran foto...');
            await dataAsetService.uploadLampiran(newId, selectedFiles);
            toast.dismiss(loadingToast);
            toast.success('Lampiran foto berhasil diunggah');
          }
        } catch (upErr) {
          console.error('Upload lampiran setelah create gagal:', upErr);
          toast.error('Lampiran foto gagal diunggah');
        }
      }
      
      if (response.success) {
        onSuccess();
        onClose();
        setFormData({
          nama_aset: '',
          merk_kendaraan: '',
          nama_barang: '',
          kategori: 'PROPERTI',
          no_sertifikat: '',
          lokasi: '',
          atas_nama: '',
          data_pembelian: '',
          status: 'AKTIF',
          data_pbb: '',
          plat_nomor: '',
          nomor_mesin: '',
          nomor_rangka: '',
          pajak_berlaku: '',
          stnk_berlaku: '',
          estimasi_pembayaran_pajak: '',
          terakhir_service: '',
          jadwal_service_berikutnya: '',
          asuransi_pakai: 'TIDAK',
          jenis_asuransi: '',
          asuransi_berlaku: '',
          penanggung_jawab: '',
          merk: '',
          model: '',
          serial_number: '',
          tahun_pembelian: '',
          lampiran: ''
        });
        setSelectedFiles([]);
      }
    } catch (error) {
      console.error('Error saving data aset:', error);
      toast.error(editData ? 'Gagal update data aset' : 'Gagal tambah data aset');
    } finally {
      setLoading(false);
    }
  };

  const renderKategoriFields = () => {
    switch (formData.kategori) {
      case 'PROPERTI':
        return (
          <>
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nama Aset <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="nama_aset"
                value={formData.nama_aset}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent ${
                  errors.nama_aset ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Contoh: TANAH KAVLING"
              />
              {errors.nama_aset && (
                <p className="text-red-500 text-sm mt-1">{errors.nama_aset}</p>
              )}
            </div>
            
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                No Sertifikat
              </label>
              <input
                type="text"
                name="no_sertifikat"
                value={formData.no_sertifikat}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                placeholder="Contoh: 0205"
              />
            </div>
            
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Data PBB
              </label>
              <input
                type="text"
                name="data_pbb"
                value={formData.data_pbb}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                placeholder="Contoh: TERBAYAR, 2025"
              />
            </div>
          </>
        );
        
      case 'KENDARAAN_PRIBADI':
      case 'KENDARAAN_OPERASIONAL':
      case 'KENDARAAN_DISTRIBUSI':
        return (
          <>
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Merk Kendaraan <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="merk_kendaraan"
                value={formData.merk_kendaraan}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent ${
                  errors.merk_kendaraan ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Contoh: TOYOTA AVANZA"
              />
              {errors.merk_kendaraan && (
                <p className="text-red-500 text-sm mt-1">{errors.merk_kendaraan}</p>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Plat Nomor
              </label>
              <input
                type="text"
                name="plat_nomor"
                value={formData.plat_nomor}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                placeholder="Contoh: B 1234 ABC"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Pajak Berlaku
              </label>
              <input
                type="text"
                name="pajak_berlaku"
                value={formData.pajak_berlaku}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                placeholder="Contoh: 2025"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                STNK Berlaku
              </label>
              <input
                type="text"
                name="stnk_berlaku"
                value={formData.stnk_berlaku}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                placeholder="Contoh: 2025"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Asuransi Pakai
              </label>
              <select
                name="asuransi_pakai"
                value={formData.asuransi_pakai}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              >
                <option value="YA">YA</option>
                <option value="TIDAK">TIDAK</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Jenis Asuransi
              </label>
              <select
                name="jenis_asuransi"
                value={formData.jenis_asuransi}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              >
                <option value="">Pilih Jenis</option>
                <option value="TLO">TLO</option>
                <option value="ALL RISK">ALL RISK</option>
              </select>
            </div>
          </>
        );
        
      case 'ELEKTRONIK':
        return (
          <>
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nama Barang <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="nama_barang"
                value={formData.nama_barang}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent ${
                  errors.nama_barang ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Contoh: LAPTOP DELL"
              />
              {errors.nama_barang && (
                <p className="text-red-500 text-sm mt-1">{errors.nama_barang}</p>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Merk
              </label>
              <input
                type="text"
                name="merk"
                value={formData.merk}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                placeholder="Contoh: DELL"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Model
              </label>
              <input
                type="text"
                name="model"
                value={formData.model}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                placeholder="Contoh: Latitude 5520"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Serial Number
              </label>
              <input
                type="text"
                name="serial_number"
                value={formData.serial_number}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                placeholder="Contoh: ABC123XYZ"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tahun Pembelian
              </label>
              <input
                type="text"
                name="tahun_pembelian"
                value={formData.tahun_pembelian}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                placeholder="Contoh: 2023"
              />
            </div>
          </>
        );
        
      default:
        return null;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-[1px] flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[92vh] overflow-hidden border border-gray-200 flex flex-col">
        {/* Header (tetap terlihat saat scroll) */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-red-700 bg-red-800 text-white sticky top-0 z-10">
          <div className="flex items-center">
            <div>
              <h2 className="text-xl font-bold leading-tight">{editData ? 'Edit Data Aset' : 'Tambah Data Aset Baru'}</h2>
            </div>
          </div>
          <button onClick={handleClose} className="p-2 text-white/90 hover:text-white hover:bg-white/10 rounded-lg transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0">
          {/* Scrollable body */}
          <div className="flex-1 min-h-0 overflow-y-auto px-6 py-5 scrollbar-hide">
            {/* Kategori - segmented control */}
            <div className="mb-5">
              <label className="block text-xs font-semibold text-gray-600 mb-2">Jenis Aset</label>
              <div className="flex flex-wrap gap-2">
                {[
                  { v: 'PROPERTI', label: 'Properti' },
                  { v: 'KENDARAAN_PRIBADI', label: 'Kendaraan Pribadi' },
                  { v: 'KENDARAAN_OPERASIONAL', label: 'Kendaraan Operasional' },
                  { v: 'KENDARAAN_DISTRIBUSI', label: 'Kendaraan Distribusi' },
                  { v: 'ELEKTRONIK', label: 'Elektronik' },
                ].map((opt) => (
                  <button
                    key={opt.v}
                    type="button"
                    onClick={() => handleInputChange({ target: { name: 'kategori', value: opt.v } })}
                    className={`${formData.kategori === opt.v ? 'bg-red-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'} px-3 py-1.5 rounded-full text-sm font-medium transition-colors`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
              {errors.kategori && <p className="text-red-600 text-xs mt-2 flex items-center gap-1"><AlertCircle className="w-3.5 h-3.5" />{errors.kategori}</p>}
            </div>

            {/* Grid wrapper */}
            <div className="grid grid-cols-12 gap-4">
              {/* Kategori-specific card */}
              <div className="col-span-12">
                <div className="rounded-xl border bg-white">
                  <div className="px-4 py-3 border-b bg-gray-50 rounded-t-xl">
                    <div className="text-sm font-semibold text-gray-700">Detail {formData.kategori.replace('_', ' ').replace('_', ' ')}</div>
                  </div>
                  <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                    {renderKategoriFields()}
                  </div>
                </div>
              </div>

              {/* Common fields card */}
              <div className="col-span-12">
                <div className="rounded-xl border bg-white">
                  <div className="px-4 py-3 border-b bg-gray-50 rounded-t-xl flex items-center justify-between">
                    <div className="text-sm font-semibold text-gray-700">Informasi Umum</div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-500">Status</span>
                      <select
                        name="status"
                        value={formData.status}
                        onChange={handleInputChange}
                        className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-red-500 focus:border-transparent"
                      >
                        <option value="AKTIF">AKTIF</option>
                        <option value="NONAKTIF">NONAKTIF</option>
                        <option value="DIJAMINKAN">DIJAMINKAN</option>
                        <option value="DIMILIKI SENDIRI">DIMILIKI SENDIRI</option>
                      </select>
                    </div>
                  </div>
                  <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Lokasi <span className="text-red-500">*</span></label>
                      <input
                        type="text"
                        name="lokasi"
                        value={formData.lokasi}
                        onChange={handleInputChange}
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent ${errors.lokasi ? 'border-red-500' : 'border-gray-300'}`}
                        placeholder="Contoh: JL KAV. PERKEBUNAN NO. 1 BENCONGAN"
                      />
                      {errors.lokasi && <p className="text-red-600 text-xs mt-1 flex items-center gap-1"><AlertCircle className="w-3.5 h-3.5" />{errors.lokasi}</p>}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Atas Nama <span className="text-red-500">*</span></label>
                      <input
                        type="text"
                        name="atas_nama"
                        value={formData.atas_nama}
                        onChange={handleInputChange}
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent ${errors.atas_nama ? 'border-red-500' : 'border-gray-300'}`}
                        placeholder="Contoh: N.A. RAMADHAN"
                      />
                      {errors.atas_nama && <p className="text-red-600 text-xs mt-1 flex items-center gap-1"><AlertCircle className="w-3.5 h-3.5" />{errors.atas_nama}</p>}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Data Pembelian</label>
                      <input
                        type="text"
                        name="data_pembelian"
                        value={formData.data_pembelian}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                        placeholder="Contoh: 2010"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Penanggung Jawab</label>
                      <input
                        type="text"
                        name="penanggung_jawab"
                        value={formData.penanggung_jawab}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                        placeholder="Contoh: John Doe"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Upload Lampiran (foto/dokumen) - bisa lebih dari 1
                      </label>
                      <div className="flex items-center gap-3">
                        <label className="inline-flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-lg text-sm cursor-pointer hover:bg-gray-50">
                          <input
                            type="file"
                            accept="image/*,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-powerpoint,application/vnd.openxmlformats-officedocument.presentationml.presentation,text/plain"
                            multiple
                            className="hidden"
                            onChange={(e) => {
                              const picked = Array.from(e.target.files || [])
                              // Gabungkan dengan yang sudah dipilih, hilangkan duplikat by (name,size,lastModified)
                              const key = (f) => `${f.name}|${f.size}|${f.lastModified}`
                              const existingMap = new Map(selectedFiles.map(f => [key(f), f]))
                              for (const f of picked) {
                                const k = key(f)
                                if (!existingMap.has(k)) existingMap.set(k, f)
                              }
                              const merged = Array.from(existingMap.values())
                              setSelectedFiles(merged)
                              // Jangan reset e.target.value agar bisa pilih file yang sama lagi jika perlu
                            }}
                          />
                          <span>Pilih File</span>
                        </label>
                        {selectedFiles.length > 0 && (
                          <span className="text-xs text-gray-600">{selectedFiles.length} file dipilih</span>
                        )}
                      </div>
                      {selectedFiles.length > 0 && (
                        <div className="mt-2 grid grid-cols-4 gap-2">
                          {selectedFiles.map((f, idx) => {
                            const isImage = (f.type || '').startsWith('image/')
                            const ext = (f.name.split('.').pop() || '').toUpperCase()
                            return (
                              <div key={idx} className="relative border rounded p-1 text-xs text-gray-700 bg-white group">
                                {/* Remove button */}
                                <button
                                  type="button"
                                  onClick={() => {
                                    setSelectedFiles(prev => prev.filter((_, i) => i !== idx))
                                  }}
                                  className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full w-6 h-6 text-[11px] leading-6 text-center shadow hidden group-hover:block"
                                  title="Hapus file ini"
                                >
                                  ×
                                </button>

                                {isImage ? (
                                  <img
                                    src={URL.createObjectURL(f)}
                                    alt={f.name}
                                    className="w-full h-20 object-cover rounded"
                                  />
                                ) : (
                                  <div className="w-full h-20 flex items-center justify-center bg-gray-50 rounded border">
                                    <span className="font-semibold">{ext || 'FILE'}</span>
                                  </div>
                                )}
                                <div className="mt-1 truncate" title={f.name}>{f.name}</div>
                              </div>
                            )
                          })}
                        </div>
                      )}
                      <p className="text-[11px] text-gray-500 mt-1">
                        Format didukung: Gambar (JPG, PNG, GIF), PDF, DOC/DOCX, XLS/XLSX, PPT/PPTX, TXT.
                      </p>
                      {/* Existing attachments (edit mode) */}
                      {editData && Array.isArray(formData.lampiran) && (
                        <div className="mt-3">
                          <div className="text-xs font-semibold text-gray-700 mb-2">Lampiran Tersimpan</div>
                          {formData.lampiran.length === 0 ? (
                            <div className="text-xs text-gray-500">Belum ada lampiran.</div>
                          ) : (
                            <div className="grid grid-cols-4 gap-2">
                              {formData.lampiran.map((file, idx) => {
                                const isImage = String(file.mimetype || '').startsWith('image/');
                                const url = toFileUrl(file.path);
                                const name = file.originalname || file.filename || `file-${idx}`;
                                return (
                                  <div key={idx} className="relative border rounded p-1 text-xs text-gray-700 bg-white group">
                                    {isImage ? (
                                      <a href={url} target="_blank" rel="noreferrer">
                                        <img src={url} alt={name} className="w-full h-20 object-cover rounded" />
                                      </a>
                                    ) : (
                                      <a href={url} target="_blank" rel="noreferrer" className="w-full h-20 flex items-center justify-center bg-gray-50 rounded border">
                                        <span className="font-semibold truncate px-1" title={name}>{(name.split('.').pop() || 'FILE').toUpperCase()}</span>
                                      </a>
                                    )}
                                    <div className="mt-1 truncate" title={name}>{name}</div>
                                    <button
                                      type="button"
                                      onClick={async () => {
                                        if (!window.confirm('Hapus lampiran ini?')) return;
                                        try {
                                          await dataAsetService.deleteLampiran(editData.id, idx);
                                          toast.success('Lampiran dihapus');
                                          // Update local state to remove the deleted file
                                          setFormData(prev => ({
                                            ...prev,
                                            lampiran: (prev.lampiran || []).filter((_, i) => i !== idx)
                                          }));
                                        } catch (err) {
                                          toast.error('Gagal menghapus lampiran');
                                        }
                                      }}
                                      className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full w-6 h-6 text-[11px] leading-6 text-center shadow hidden group-hover:block"
                                      title="Hapus lampiran"
                                    >
                                      ×
                                    </button>
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer (non-scrollable) */}
          <div className="p-0 border-t bg-white">
            <div className="grid grid-cols-2 gap-2 px-2 pt-3 pb-0">
              <button
                type="button"
                onClick={handleClose}
                className="w-full py-2 bg-red-700 text-white font-semibold hover:bg-red-800 transition-colors rounded-lg flex items-center justify-center"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={loading}
                className="w-full py-2 bg-red-700 text-white font-semibold hover:bg-red-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors rounded-lg flex items-center justify-center gap-2"
              >
                {loading ? <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div> : <Save className="w-4 h-4" />}
                <span>{loading ? 'Menyimpan...' : (editData ? 'Update' : 'Simpan')}</span>
              </button>
            </div>
          </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminDataAsetForm;
