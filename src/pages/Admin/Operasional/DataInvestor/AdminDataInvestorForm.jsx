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
import { MENU_CODES } from '@/config/menuCodes';

const AdminDataInvestorForm = ({ isOpen, onClose, onSuccess, editData = null, initialOpenAttachmentModal = false }) => {
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
    ahli_waris: '',
    // Lampiran disimpan 1 kolom TEXT berisi JSON array. UI: textarea URL per baris
    lampiranText: '',
    investasi_di_outlet: '',
    persentase_bagi_hasil_biodata: '',
    // Two-column percent inputs for Biodata
    bosgil_percent: '',
    investor_percent: ''
  });

  // Paksa hanya tipe Investor (Biodata)
  const [selectedType, setSelectedType] = useState('investor');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [outlets, setOutlets] = useState([]);
  // Lampiran upload state (admin-only use case)
  const [attachments, setAttachments] = useState([]);
  const [filesToUpload, setFilesToUpload] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [showAttachmentModal, setShowAttachmentModal] = useState(false);

  // Inject utility to hide scrollbar while keeping scroll behavior
  useEffect(() => {
    const styleId = 'no-scrollbar-style';
    if (!document.getElementById(styleId)) {
      const style = document.createElement('style');
      style.id = styleId;
      style.textContent = `
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        .no-scrollbar::-webkit-scrollbar { display: none; }
      `;
      document.head.appendChild(style);
    }
  }, []);

  // Normalisasi persentase: '30' atau '30%' => '30%'
  const formatPercent = (val) => {
    if (!val) return '';
    const n = Number(val.toString().replace('%','').trim());
    if (Number.isNaN(n)) return '';
    const clamped = Math.max(0, Math.min(100, n));
    return `${clamped}%`;
  };

  // Format tanggal ke yyyy-MM-dd untuk input type="date"
  const formatDateInput = (val) => {
    if (!val) return '';
    try {
      const d = new Date(val);
      if (Number.isNaN(d.getTime())) return '';
      const yyyy = d.getFullYear();
      const mm = String(d.getMonth() + 1).padStart(2, '0');
      const dd = String(d.getDate()).padStart(2, '0');
      return `${yyyy}-${mm}-${dd}`;
    } catch { return ''; }
  };

  // Parse persen ke number 0-100
  const parsePercent = (val) => {
    if (!val) return 0;
    const n = Number(val.toString().replace('%','').trim());
    if (Number.isNaN(n)) return 0;
    return Math.max(0, Math.min(100, n));
  };

  // Ambil angka persen dari satu baris (mendukung: "Nama - 30%", "Nama | 30", "Nama,30%")
  const extractPercentFromLine = (line) => {
    if (!line) return '';
    const match = line.match(/(\d+(?:\.\d+)?)%?/); // ambil angka pertama
    return match ? formatPercent(match[1]) : '';
  };

  // Ambil nama investor dari satu baris (hapus angka dan simbol % yang terkait)
  const extractNameFromLine = (line) => {
    if (!line) return '';
    // Hilangkan bagian setelah pemisah umum jika ada
    let cleaned = line.replace(/(\d+(?:\.\d+)?)%?/g, '').replace(/[\-|,|\|]/g, ' ').replace(/\s{2,}/g, ' ').trim();
    return cleaned;
  };

  useEffect(() => {
    if (editData) {
      // Force ke biodata
      setSelectedType('investor');
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
          tanggal_join: formatDateInput(editData.tanggal_join) || '',
          kontak_darurat: editData.kontak_darurat || '',
          nama_pasangan: editData.nama_pasangan || '',
          nama_anak: editData.nama_anak || '',
          ahli_waris: editData.ahli_waris || '',
          lampiranText: (() => {
            try {
              if (!editData.lampiran) return '';
              const arr = typeof editData.lampiran === 'string' ? JSON.parse(editData.lampiran) : editData.lampiran;
              if (Array.isArray(arr)) {
                // dukung array of string atau array of object {url}
                return arr.map(it => (typeof it === 'string' ? it : (it && it.url ? it.url : ''))).filter(Boolean).join('\n');
              }
              return '';
            } catch { return ''; }
          })(),
          investasi_di_outlet: editData.investasi_di_outlet || '',
          persentase_bagi_hasil_biodata: editData.persentase_bagi_hasil || '',
          bosgil_percent: (()=>{ const inv=parsePercent(editData.persentase_bagi_hasil); return (100 - inv).toString(); })(),
          investor_percent: (()=>{ const inv=parsePercent(editData.persentase_bagi_hasil); return inv.toString(); })(),
          // Reset outlet fields
          daftar_investor: '',
          persentase_bagi_hasil: ''
        });
      }
      // Load lampiran list saat edit mode
      if (editData.id) {
        (async () => {
          try {
            const res = await dataInvestorService.listLampiran(editData.id);
            if (res && res.success) setAttachments(res.data || []);
          } catch (e) {
            // abaikan error list lampiran
          }
        })();
      }
    }
  }, [editData]);

  // Buka modal lampiran otomatis bila diminta dari parent (tombol Kelola Lampiran di kartu)
  useEffect(() => {
    if (isOpen && editData && initialOpenAttachmentModal) {
      setShowAttachmentModal(true);
    }
  }, [isOpen, editData, initialOpenAttachmentModal]);

  // Reset form saat membuka modal dalam mode tambah (editData null)
  useEffect(() => {
    if (isOpen && !editData) {
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
        ahli_waris: '',
        lampiranText: '',
        investasi_di_outlet: '',
        persentase_bagi_hasil_biodata: '',
        bosgil_percent: '',
        investor_percent: ''
      });
      setAttachments([]);
      setFilesToUpload([]);
      setErrors({});
      setSelectedType('investor');
      setShowAttachmentModal(false);
    }
  }, [isOpen, editData]);

  // Load daftar outlet saat modal dibuka
  useEffect(() => {
    const loadOutlets = async () => {
      try {
        const res = await dataInvestorService.getUniqueOutlets();
        if (res.success) {
          setOutlets(res.data || []);
        }
      } catch (err) {
        // diamkan saja; outlet bisa ditulis manual
      }
    };
    if (isOpen) loadOutlets();
  }, [isOpen]);

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

  // Sinkronisasi dua kolom persen biodata
  const handleInvestorPercentChange = (e) => {
    const raw = e.target.value;
    const inv = parsePercent(raw);
    const bos = Math.max(0, 100 - inv);
    setFormData(prev => ({ ...prev, investor_percent: inv.toString(), bosgil_percent: bos.toString(), persentase_bagi_hasil_biodata: formatPercent(inv) }));
  };
  const handleBosgilPercentChange = (e) => {
    const raw = e.target.value;
    const bos = parsePercent(raw);
    const inv = Math.max(0, 100 - bos);
    setFormData(prev => ({ ...prev, bosgil_percent: bos.toString(), investor_percent: inv.toString(), persentase_bagi_hasil_biodata: formatPercent(inv) }));
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
    
    // Selalu gunakan validasi biodata
    if (!formData.nama_investor) {
      newErrors.nama_investor = 'Nama investor harus diisi';
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
      // Lampiran tidak dikirim lewat form utama lagi (upload via endpoint khusus)
      const lampiran = null;
      
      if (editData) {
        // Update investor (biodata) saja
        const updateData = {
          outlet: formData.outlet,
          nama_investor: formData.nama_investor,
          ttl_investor: formData.ttl_investor,
          no_hp: formData.no_hp,
          alamat: formData.alamat,
          tanggal_join: formData.tanggal_join,
          kontak_darurat: formData.kontak_darurat,
          nama_pasangan: formData.nama_pasangan,
          nama_anak: formData.nama_anak,
          ahli_waris: formData.ahli_waris,
          investasi_di_outlet: formData.investasi_di_outlet || 0,
          // Prioritas: dua kolom persen jika diisi, else field tunggal
          persentase_bagi_hasil: (formatPercent(formData.investor_percent) || formatPercent(formData.persentase_bagi_hasil_biodata) || '0%'),
          tipe_data: 'biodata'
        };
        const response = await dataInvestorService.updateDataInvestor(editData.id, updateData);
        if (response.success) {
          toast.success('Biodata investor berhasil diupdate');
        } else {
          success = false;
        }
      } else {
        // Create investor (biodata)
        const createData = {
          outlet: formData.outlet,
          nama_investor: formData.nama_investor,
          ttl_investor: formData.ttl_investor,
          no_hp: formData.no_hp,
          alamat: formData.alamat,
          tanggal_join: formData.tanggal_join,
          kontak_darurat: formData.kontak_darurat,
          nama_pasangan: formData.nama_pasangan,
          nama_anak: formData.nama_anak,
          ahli_waris: formData.ahli_waris,
          lampiran,
          investasi_di_outlet: formData.investasi_di_outlet || 0,
          persentase_bagi_hasil: (formatPercent(formData.investor_percent) || formatPercent(formData.persentase_bagi_hasil_biodata) || '0%'),
          tipe_data: 'biodata'
        };
        // Jika user memilih file lampiran saat create, gunakan endpoint multipart create-with-attachments
        const response = filesToUpload && filesToUpload.length > 0
          ? await dataInvestorService.createWithAttachments(createData, filesToUpload)
          : await dataInvestorService.createDataInvestor(createData);
        if (response.success) {
          toast.success('Biodata investor berhasil ditambahkan');
        } else {
          success = false;
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
        ahli_waris: '',
        investasi_di_outlet: '',
        persentase_bagi_hasil_biodata: '',
        bosgil_percent: '',
        investor_percent: ''
      });
      setSelectedType('investor');
      setAttachments([]);
      setFilesToUpload([]);
    }
  } catch (error) {
    console.error('Error saving data investor:', error);
    toast.error(editData ? 'Gagal update data investor' : 'Gagal tambah data investor');
  } finally {
    setLoading(false);
  }
};

if (!isOpen) return null;

const isOutletForm = false;
const title = editData ? 'Edit Biodata Investor' : 'Tambah Biodata Investor';
const buttonText = 'SIMPAN BIODATA';

return (
  <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 md:p-6">
    <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 w-full max-w-3xl max-h-[90vh] overflow-y-auto no-scrollbar">
      {/* Header */}
      <div className="bg-red-800 text-white p-4 md:p-5 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center space-x-3">
          <div>
            <h2 className="text-xl font-semibold">{title}</h2>
            <p className="text-sm text-red-100">{MENU_CODES.operasional.dataInvestor}</p>
          </div>
        </div>
        <button onClick={onClose} className="p-2 hover:bg-red-700 rounded-lg transition-colors">
          <X className="w-6 h-6" />
        </button>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="p-6 md:p-8 pb-8">
        <div className="space-y-6 md:space-y-7">
          {/* NAMA OUTLET */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">NAMA OUTLET <span className="text-red-500">*</span></label>
            <input
              list="outletOptions"
              name="outlet"
              value={formData.outlet}
              onChange={handleInputChange}
              className={`w-full px-3 h-11 border rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent text-base md:text-lg ${errors.outlet ? 'border-red-500' : 'border-gray-300'}`}
              placeholder="Pilih atau ketik nama outlet"
            />
            <datalist id="outletOptions">
              {outlets.map((o) => (<option key={o} value={o} />))}
            </datalist>
            {errors.outlet && (<p className="text-red-500 text-sm mt-1">{errors.outlet}</p>)}
          </div>

          {/* NAMA INVESTOR */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">NAMA INVESTOR <span className="text-red-500">*</span></label>
            <input
              type="text"
              name="nama_investor"
              value={formData.nama_investor}
              onChange={handleInputChange}
              className={`w-full px-3 h-11 border rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent text-base md:text-lg ${errors.nama_investor ? 'border-red-500' : 'border-gray-300'}`}
              placeholder="Masukkan nama investor"
            />
            {errors.nama_investor && (<p className="text-red-500 text-sm mt-1">{errors.nama_investor}</p>)}
          </div>

          {/* TTL INVESTOR */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">TTL INVESTOR</label>
            <input type="text" name="ttl_investor" value={formData.ttl_investor} onChange={handleInputChange} className="w-full px-3 h-11 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent text-base md:text-lg" placeholder="Contoh: Jakarta, 01 Januari 1990" />
          </div>

          {/* NO. HP */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">NO. HP</label>
            <input type="text" name="no_hp" value={formData.no_hp} onChange={handleInputChange} className="w-full px-3 h-11 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent text-base md:text-lg" placeholder="Contoh: 081234567890" />
          </div>

          {/* ALAMAT */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">ALAMAT</label>
            <textarea name="alamat" value={formData.alamat} onChange={handleInputChange} rows={3} className="w-full px-3 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent text-base md:text-lg min-h-[96px]" placeholder="Masukkan alamat lengkap" />
          </div>

          {/* TANGGAL JOIN */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">TANGGAL JOIN</label>
            <input type="date" name="tanggal_join" value={formData.tanggal_join} onChange={handleInputChange} className="w-full px-3 h-11 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent text-base md:text-lg" />
          </div>

          {/* KONTAK DARURAT */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">KONTAK DARURAT</label>
            <input type="text" name="kontak_darurat" value={formData.kontak_darurat} onChange={handleInputChange} className="w-full px-3 h-11 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent text-base md:text-lg" placeholder="Contoh: 081234567890" />
          </div>

          {/* NAMA PASANGAN */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">NAMA PASANGAN</label>
            <input type="text" name="nama_pasangan" value={formData.nama_pasangan} onChange={handleInputChange} className="w-full px-3 h-11 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent text-base md:text-lg" placeholder="Masukkan nama pasangan" />
          </div>

          {/* NAMA ANAK */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">NAMA ANAK</label>
            <input type="text" name="nama_anak" value={formData.nama_anak} onChange={handleInputChange} className="w-full px-3 h-11 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent text-base md:text-lg" placeholder="Masukkan nama anak (pisahkan dengan koma)" />
          </div>

          {/* AHLI WARIS */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">AHLI WARIS</label>
            <input
              type="text"
              name="ahli_waris"
              value={formData.ahli_waris}
              onChange={handleInputChange}
              className="w-full px-3 h-11 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent text-base md:text-lg"
              placeholder="Masukkan nama ahli waris"
              maxLength={150}
            />
          </div>

          {/* LAMPIRAN */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">LAMPIRAN</label>
            {!editData ? (
              <div className="space-y-2">
                <input
                  type="file"
                  multiple
                  accept=".pdf,image/*"
                  onChange={(e) => setFilesToUpload(Array.from(e.target.files || []))}
                  className="block w-full text-sm text-gray-700"
                />
                <p className="text-xs text-gray-500">File akan diunggah saat Anda menekan tombol Simpan.</p>
                {filesToUpload && filesToUpload.length > 0 && (
                  <p className="text-xs text-gray-600">{filesToUpload.length} file dipilih.</p>
                )}
              </div>
            ) : (
              <div className="space-y-3">
                <input
                  type="file"
                  multiple
                  accept=".pdf,image/*"
                  onChange={(e) => setFilesToUpload(Array.from(e.target.files || []))}
                  className="block w-full text-sm text-gray-700"
                />
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    disabled={uploading || !filesToUpload.length}
                    onClick={async () => {
                      try {
                        setUploading(true);
                        const res = await dataInvestorService.uploadLampiran(editData.id, filesToUpload);
                        if (res && res.success) {
                          setAttachments(res.data || []);
                          setFilesToUpload([]);
                          toast.success('Lampiran berhasil diunggah');
                        } else {
                          toast.error('Gagal mengunggah lampiran');
                        }
                      } catch (e) {
                        toast.error('Gagal mengunggah lampiran');
                      } finally {
                        setUploading(false);
                      }
                    }}
                    className="px-4 py-2 bg-red-800 text-white rounded-lg disabled:opacity-50"
                  >{uploading ? 'Mengunggah...' : 'Unggah'}</button>
                  {filesToUpload && filesToUpload.length > 0 && (
                    <span className="text-xs text-gray-600">{filesToUpload.length} file dipilih.</span>
                  )}
                </div>
                <div className="border rounded-lg divide-y max-h-80 overflow-y-auto">
                  {(attachments || []).length === 0 ? (
                    <div className="p-3 text-sm text-gray-500">Belum ada lampiran.</div>
                  ) : (
                    attachments.map((att, idx) => (
                      <div key={att.stored_name || idx} className="p-3 flex items-center justify-between gap-3">
                        <div className="min-w-0">
                          <div className="font-medium text-sm truncate">{att.name}</div>
                          <div className="text-xs text-gray-500">{att.mime} • {(att.size/1024).toFixed(1)} KB • {new Date(att.uploaded_at).toLocaleString()}</div>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <a href={att.url} target="_blank" rel="noreferrer" className="px-3 py-1 text-sm bg-gray-100 rounded hover:bg-gray-200">Lihat</a>
                          <button type="button" className="px-3 py-1 text-sm bg-red-100 text-red-700 rounded hover:bg-red-200" onClick={async () => {
                            try {
                              const res = await dataInvestorService.deleteLampiran(editData.id, att.stored_name);
                              if (res && res.success) {
                                setAttachments(res.data || []);
                                toast.success('Lampiran dihapus');
                              } else {
                                toast.error('Gagal menghapus lampiran');
                              }
                            } catch (e) {
                              toast.error('Gagal menghapus lampiran');
                            }
                          }}>Hapus</button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* INVESTASI DI OUTLET */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">INVESTASI DI OUTLET</label>
            <input type="number" name="investasi_di_outlet" value={formData.investasi_di_outlet} onChange={handleInputChange} className="w-full px-3 h-11 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent text-base md:text-lg" placeholder="Contoh: 10000000" step="1000" />
          </div>

          {/* PERSENTASE BAGI HASIL (single legacy) - disembunyikan sesuai permintaan */}

          {/* Dua kolom: Bosgil% dan Investor% */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">PERSENTASE (Bosgil — Investor)</label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Bosgil (%)</label>
                <input type="number" name="bosgil_percent" min="0" max="100" value={formData.bosgil_percent} onChange={handleBosgilPercentChange} className="w-full px-3 h-11 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent" placeholder="Contoh: 70" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Investor (%)</label>
                <input type="number" name="investor_percent" min="0" max="100" value={formData.investor_percent} onChange={handleInvestorPercentChange} className="w-full px-3 h-11 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent" placeholder="Contoh: 30" />
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-1">Total harus 100%. Mengisi salah satu akan otomatis menyesuaikan yang lain.</p>
          </div>
        </div>

        {/* Action Button */}
        <div className="pt-6 mt-6 sticky bottom-0 bg-white border-t border-gray-200 px-6 md:px-8 pb-4">
          <button type="submit" disabled={loading} className="w-full bg-red-800 text-white py-4 px-6 rounded-xl hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-base md:text-lg font-bold uppercase shadow mb-4">
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
