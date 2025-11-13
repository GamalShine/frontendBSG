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
  // Hanya izinkan tipe file yang didukung backend (lihat allowedMimes di backend routes)
  const ALLOWED_MIMES = new Set([
    'application/pdf',
    'image/jpeg',
    'image/png',
    'image/webp'
  ]);

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
          
          // Upload lampiran jika ada file yang dipilih
          if (filesToUpload && filesToUpload.length > 0) {
            try {
              const uploadRes = await dataInvestorService.uploadLampiran(editData.id, filesToUpload);
              if (uploadRes && uploadRes.success) {
                toast.success('Lampiran berhasil diunggah');
              } else {
                toast.error('Gagal mengunggah lampiran');
              }
            } catch (e) {
              toast.error('Gagal mengunggah lampiran');
            }
          }
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
  const title = editData ? 'Edit Biodata Investor' : 'Tambah Investor';
  const buttonText = 'SIMPAN';

return (
  <div className="fixed inset-0 bg-black/60 backdrop-blur-[1px] flex items-center md:items-center justify-center z-50 p-0 md:p-4">
    {/* Backdrop click to close */}
    <button
      type="button"
      aria-hidden="true"
      onClick={onClose}
      className="absolute inset-0"
      tabIndex={-1}
    />

    {/* Modal Panel */}
    <div className="bg-white w-full h-full md:h-auto md:max-h-[92vh] md:rounded-2xl shadow-2xl md:max-w-3xl overflow-hidden border border-gray-200 flex flex-col relative">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-red-700 bg-red-800 text-white md:px-6 md:py-4 sticky top-0 z-10">
        <div className="flex items-center gap-2">
          {/* Mobile back button */}
          <button
            type="button"
            onClick={onClose}
            className="md:hidden p-2 text-white/90 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
            aria-label="Kembali"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-lg md:text-xl font-bold leading-tight">{title}</h1>
        </div>
        {/* Desktop close button */}
        <button
          type="button"
          onClick={onClose}
          className="hidden md:inline-flex p-2 text-white/90 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
          aria-label="Tutup"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Scrollable body */}
      <div className="flex-1 min-h-0 overflow-y-auto px-4 py-4 md:px-6 md:py-5 scrollbar-hide">
        {/* Form */}
        <form id="investorForm" onSubmit={handleSubmit} className="space-y-3 md:space-y-4">
          {/* NAMA OUTLET */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">NAMA OUTLET <span className="text-red-500">*</span></label>
            <input
              list="outletOptions"
              name="outlet"
              value={formData.outlet}
              onChange={handleInputChange}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent ${errors.outlet ? 'border-red-500' : 'border-gray-300'}`}
              placeholder="Pilih atau ketik nama outlet"
            />
            <datalist id="outletOptions">
              {outlets.map((o) => (<option key={o} value={o} />))}
            </datalist>
            {errors.outlet && (<p className="text-red-500 text-sm mt-1">{errors.outlet}</p>)}
          </div>

          {/* NAMA INVESTOR */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">NAMA INVESTOR <span className="text-red-500">*</span></label>
            <input
              type="text"
              name="nama_investor"
              value={formData.nama_investor}
              onChange={handleInputChange}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent ${errors.nama_investor ? 'border-red-500' : 'border-gray-300'}`}
              placeholder="Masukkan nama investor"
            />
            {errors.nama_investor && (<p className="text-red-500 text-sm mt-1">{errors.nama_investor}</p>)}
          </div>

          {/* TTL INVESTOR */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">TTL INVESTOR</label>
            <input type="text" name="ttl_investor" value={formData.ttl_investor} onChange={handleInputChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent" placeholder="Contoh: Jakarta, 01 Januari 1990" />
          </div>

          {/* NO. HP */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">NO. HP</label>
            <input type="text" name="no_hp" value={formData.no_hp} onChange={handleInputChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent" placeholder="Contoh: 081234567890" />
          </div>

          {/* ALAMAT */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">ALAMAT</label>
            <textarea name="alamat" value={formData.alamat} onChange={handleInputChange} rows={3} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent min-h-[84px]" placeholder="Masukkan alamat lengkap" />
          </div>

          {/* TANGGAL JOIN */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">TANGGAL JOIN</label>
            <input type="date" name="tanggal_join" value={formData.tanggal_join} onChange={handleInputChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent" />
          </div>

          {/* KONTAK DARURAT */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">KONTAK DARURAT</label>
            <input type="text" name="kontak_darurat" value={formData.kontak_darurat} onChange={handleInputChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent" placeholder="Contoh: 081234567890" />
          </div>

          {/* NAMA PASANGAN */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">NAMA PASANGAN</label>
            <input type="text" name="nama_pasangan" value={formData.nama_pasangan} onChange={handleInputChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent" placeholder="Masukkan nama pasangan" />
          </div>

          {/* NAMA ANAK */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">NAMA ANAK</label>
            <input type="text" name="nama_anak" value={formData.nama_anak} onChange={handleInputChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent" placeholder="Masukkan nama anak (pisahkan dengan koma)" />
          </div>

          {/* AHLI WARIS */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">AHLI WARIS</label>
            <input
              type="text"
              name="ahli_waris"
              value={formData.ahli_waris}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
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
                  accept="image/jpeg,image/png,image/webp,application/pdf"
                  onChange={(e) => {
                    const pickedAll = Array.from(e.target.files || [])
                    const picked = pickedAll.filter(f => ALLOWED_MIMES.has(f.type))
                    const rejected = pickedAll.filter(f => !ALLOWED_MIMES.has(f.type))
                    if (rejected.length) {
                      toast.error(`Ada ${rejected.length} file ditolak (tipe tidak didukung). Hanya PDF/JPEG/PNG/WEBP yang diizinkan.`)
                    }
                    // gabungkan dengan sebelumnya + dedup by name|size|lastModified
                    const key = (f) => `${f.name}|${f.size}|${f.lastModified}`
                    const map = new Map((filesToUpload || []).map(f => [key(f), f]))
                    for (const f of picked) {
                      const k = key(f)
                      if (!map.has(k)) map.set(k, f)
                    }
                    const merged = Array.from(map.values())
                    setFilesToUpload(merged)
                    // Reset input agar bisa pilih file yang sama lagi
                    e.target.value = ''
                  }}
                  className="block w-full text-sm text-gray-700 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-red-50 file:text-red-700 hover:file:bg-red-100 cursor-pointer"
                />
                <p className="text-xs text-gray-500">Anda bisa memilih lebih dari 1 file sekaligus (tekan Ctrl/Cmd saat memilih). File akan diunggah saat Anda menekan tombol Simpan.</p>
                {filesToUpload && filesToUpload.length > 0 && (
                  <>
                    <p className="text-xs text-gray-600">{filesToUpload.length} file dipilih.</p>
                    <div className="grid grid-cols-4 gap-2 mt-1">
                      {filesToUpload.map((f, idx) => {
                        const isImage = (f.type || '').startsWith('image/')
                        const ext = (f.name.split('.').pop() || '').toUpperCase()
                        return (
                          <div key={idx} className="relative border rounded p-1 text-xs text-gray-700 bg-white group">
                            <button
                              type="button"
                              onClick={() => setFilesToUpload(prev => prev.filter((_, i) => i !== idx))}
                              className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full w-6 h-6 text-[11px] leading-6 text-center shadow hidden group-hover:block"
                              title="Hapus file ini"
                            >
                              ×
                            </button>
                            {isImage ? (
                              <img src={URL.createObjectURL(f)} alt={f.name} className="w-full h-20 object-cover rounded" />
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
                  </>
                )}
              </div>
            ) : (
              <div className="space-y-3">
                <div>
                  <input
                    type="file"
                    multiple
                    accept="image/jpeg,image/png,image/webp,application/pdf"
                    onChange={(e) => {
                      const pickedAll = Array.from(e.target.files || [])
                      const picked = pickedAll.filter(f => ALLOWED_MIMES.has(f.type))
                      const rejected = pickedAll.filter(f => !ALLOWED_MIMES.has(f.type))
                      if (rejected.length) {
                        toast.error(`Ada ${rejected.length} file ditolak (tipe tidak didukung). Hanya PDF/JPEG/PNG/WEBP yang diizinkan.`)
                      }
                      const key = (f) => `${f.name}|${f.size}|${f.lastModified}`
                      const map = new Map((filesToUpload || []).map(f => [key(f), f]))
                      for (const f of picked) {
                        const k = key(f)
                        if (!map.has(k)) map.set(k, f)
                      }
                      const merged = Array.from(map.values())
                      setFilesToUpload(merged)
                      // Reset input agar bisa pilih file yang sama lagi
                      e.target.value = ''
                    }}
                    className="block w-full text-sm text-gray-700 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-red-50 file:text-red-700 hover:file:bg-red-100 cursor-pointer"
                  />
                  <p className="text-xs text-gray-500 mt-1">Anda bisa memilih lebih dari 1 file sekaligus (tekan Ctrl/Cmd saat memilih). File akan diunggah saat Anda menekan tombol Simpan.</p>
                </div>
                {filesToUpload && filesToUpload.length > 0 && (
                  <>
                    <p className="text-xs text-gray-600">{filesToUpload.length} file dipilih untuk diunggah.</p>
                    <div className="grid grid-cols-4 gap-2">
                      {filesToUpload.map((f, idx) => {
                        const isImage = (f.type || '').startsWith('image/')
                        const ext = (f.name.split('.').pop() || '').toUpperCase()
                        return (
                          <div key={idx} className="relative border rounded p-1 text-xs text-gray-700 bg-white group">
                            <button
                              type="button"
                              onClick={() => setFilesToUpload(prev => prev.filter((_, i) => i !== idx))}
                              className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full w-6 h-6 text-[11px] leading-6 text-center shadow hidden group-hover:block"
                              title="Hapus file ini"
                            >
                              ×
                            </button>
                            {isImage ? (
                              <img src={URL.createObjectURL(f)} alt={f.name} className="w-full h-20 object-cover rounded" />
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
                  </>
                )}
                <div className="border rounded-lg divide-y max-h-80 overflow-y-auto">
                  <div className="p-2 bg-gray-50 text-xs font-semibold text-gray-700">Lampiran yang sudah diunggah:</div>
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
            <label className="block text-sm font-medium text-gray-700 mb-1">INVESTASI DI OUTLET</label>
            <input type="number" name="investasi_di_outlet" value={formData.investasi_di_outlet} onChange={handleInputChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent" placeholder="Contoh: 10000000" step="1000" />
          </div>

          {/* PERSENTASE BAGI HASIL (single legacy) - disembunyikan sesuai permintaan */}

          {/* Dua kolom: Bosgil% dan Investor% */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">PERSENTASE (Bosgil — Investor)</label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Bosgil (%)</label>
                <input type="number" name="bosgil_percent" min="0" max="100" value={formData.bosgil_percent} onChange={handleBosgilPercentChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent" placeholder="Contoh: 70" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Investor (%)</label>
                <input type="number" name="investor_percent" min="0" max="100" value={formData.investor_percent} onChange={handleInvestorPercentChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent" placeholder="Contoh: 30" />
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-1">Total harus 100%. Mengisi salah satu akan otomatis menyesuaikan yang lain.</p>
          </div>
        </form>
      </div>

      {/* Footer (non-scrollable) */}
      <div className="p-0 border-t bg-white">
        <div className="grid grid-cols-2 gap-2 px-2 py-2 md:flex md:justify-end md:space-x-4 md:px-6 md:py-6 items-center">
          <button
            type="button"
            onClick={onClose}
            className="w-full py-3 bg-red-700 text-white font-semibold hover:bg-red-800 transition-colors rounded-lg md:w-auto md:px-6 md:bg-white md:text-gray-600 md:hover:bg-gray-50 md:border md:border-gray-300"
          >
            Batal
          </button>
          <button
            type="submit"
            form="investorForm"
            disabled={loading}
            className="w-full py-3 bg-red-700 text-white font-semibold hover:bg-red-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors rounded-lg flex items-center justify-center gap-2 md:w-auto md:px-6 md:bg-blue-600 md:hover:bg-blue-700"
          >
            {loading ? <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div> : <Save className="w-4 h-4" />}
            <span>{loading ? 'Menyimpan...' : 'Simpan'}</span>
          </button>
        </div>
      </div>
    </div>
  </div>
);
};

export default AdminDataInvestorForm;
