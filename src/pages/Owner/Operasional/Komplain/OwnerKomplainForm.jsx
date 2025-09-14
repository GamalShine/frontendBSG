import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Card, { CardHeader, CardBody } from '@/components/UI/Card';
import Button from '@/components/UI/Button';
import Input from '@/components/UI/Input';
import Select, { 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/UI/Select';
import { 
  ArrowLeft, 
  Save, 
  X 
} from 'lucide-react';
import { userService } from '@/services/userService';
import { komplainService } from '@/services/komplainService';
import toast from 'react-hot-toast';

const OwnerKomplainForm = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    judul_komplain: '',
    deskripsi_komplain: '',
    kategori: 'lainnya',
    prioritas: 'berproses',
    status: 'menunggu',
    target_selesai: '',
    penerima_komplain_id: '',
    pihak_terkait: []
  });
  const [users, setUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [pihakSelect, setPihakSelect] = useState('');

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Batas tanggal minimum untuk target_selesai (tidak boleh tanggal lampau)
  const today = new Date().toISOString().split('T')[0];

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate required fields
    if (!formData.judul_komplain || !formData.deskripsi_komplain || !formData.kategori || !formData.prioritas) {
      toast.error('Mohon lengkapi semua field yang wajib diisi');
      return;
    }

    try {
      const payload = {
        judul_komplain: formData.judul_komplain.trim(),
        deskripsi_komplain: formData.deskripsi_komplain.trim(),
        kategori: formData.kategori || 'lainnya',
        prioritas: formData.prioritas || 'berproses',
        status: formData.status || 'menunggu',
        penerima_komplain_id: formData.penerima_komplain_id ? Number(formData.penerima_komplain_id) : undefined,
        // Kirim sebagai array angka; backend akan stringify
        pihak_terkait: Array.isArray(formData.pihak_terkait)
          ? formData.pihak_terkait.map((n) => Number(n))
          : (formData.pihak_terkait || [])
              .toString()
              .split(',')
              .map((s) => s.trim())
              .filter(Boolean)
              .map((n) => Number(n)),
        lampiran: [],
        target_selesai: formData.target_selesai || undefined,
      }
      await komplainService.createKomplain(payload)
      toast.success('Komplain berhasil dibuat')
      navigate('/owner/operasional/komplain')
    } catch (err) {
      const msg = typeof err === 'string' ? err : err?.message || 'Gagal membuat komplain'
      toast.error(msg)
      console.error('Error creating komplain:', err)
    }
  };

  useEffect(() => {
    const load = async () => {
      try {
        setLoadingUsers(true)
        const res = await userService.getUsers({ page: 1, limit: 100 })
        if (res?.success) {
          setUsers(res.data?.users || [])
        } else if (Array.isArray(res)) {
          setUsers(res)
        } else if (Array.isArray(res?.data)) {
          setUsers(res.data)
        }
      } catch (e) {
        console.error('Gagal memuat users untuk owner komplain form:', e)
      } finally {
        setLoadingUsers(false)
      }
    }
    load()
  }, [])

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button 
          variant="outline" 
          onClick={() => navigate('/owner/operasional/komplain')}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Kembali
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Tambah Komplain Baru - Owner</h1>
          <p className="text-gray-600">Buat komplain baru ke sistem</p>
        </div>
      </div>

      {/* Form */}
      <Card>
        <CardHeader>
          <h2 className="text-xl font-semibold">Form Tambah Komplain</h2>
        </CardHeader>
        <CardBody>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Judul Komplain */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Judul Komplain <span className="text-red-500">*</span>
                </label>
                <Input
                  value={formData.judul_komplain}
                  onChange={(e) => handleInputChange('judul_komplain', e.target.value)}
                  placeholder="Masukkan judul komplain"
                  required
                />
              </div>

              {/* Deskripsi Komplain */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Deskripsi Komplain <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={formData.deskripsi_komplain}
                  onChange={(e) => handleInputChange('deskripsi_komplain', e.target.value)}
                  placeholder="Masukkan deskripsi lengkap komplain"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={4}
                  required
                />
              </div>

              {/* Kategori */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Kategori <span className="text-red-500">*</span></label>
                <Select 
                  value={formData.kategori} 
                  onValueChange={(value) => handleInputChange('kategori', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih kategori" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sistem">Sistem</SelectItem>
                    <SelectItem value="layanan">Layanan</SelectItem>
                    <SelectItem value="produk">Produk</SelectItem>
                    <SelectItem value="lainnya">Lainnya</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Prioritas */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Prioritas <span className="text-red-500">*</span></label>
                <Select 
                  value={formData.prioritas} 
                  onValueChange={(value) => handleInputChange('prioritas', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih prioritas" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="mendesak">Mendesak</SelectItem>
                    <SelectItem value="penting">Penting</SelectItem>
                    <SelectItem value="berproses">Berproses</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Status - Default 'menunggu' */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                <Select 
                  value={formData.status} 
                  onValueChange={(value) => handleInputChange('status', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="menunggu">Menunggu</SelectItem>
                    <SelectItem value="diproses">Diproses</SelectItem>
                    <SelectItem value="selesai">Selesai</SelectItem>
                    <SelectItem value="ditolak">Ditolak</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Target Selesai */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Target Selesai
                </label>
                <Input
                  type="date"
                  value={formData.target_selesai}
                  onChange={(e) => handleInputChange('target_selesai', e.target.value)}
                  min={today}
                />
              </div>

              {/* Penerima Komplain */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Penerima Komplain</label>
                <select
                  value={formData.penerima_komplain_id}
                  onChange={(e) => handleInputChange('penerima_komplain_id', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                >
                  <option value="">-- Pilih User --</option>
                  {users.map((u) => (
                    <option key={u.id} value={u.id}>{u.username || u.nama || u.full_name || `User ${u.id}`}</option>
                  ))}
                </select>
              </div>

              {/* Pihak Terkait (single select + Tambah + chips) */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Pihak Terkait</label>
                <div className="flex gap-2">
                  <select
                    value={pihakSelect}
                    onChange={(e) => setPihakSelect(e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                  >
                    <option value="">-- Pilih User --</option>
                    {users
                      .filter((u) => !(formData.pihak_terkait || []).some((id) => String(id) === String(u.id)))
                      .map((u) => (
                        <option key={u.id} value={u.id}>{u.username || u.nama || u.full_name || `User ${u.id}`}</option>
                      ))}
                  </select>
                  <Button type="button" onClick={() => {
                    if (!pihakSelect) return;
                    if ((formData.pihak_terkait||[]).some((id)=> String(id)===String(pihakSelect))) return;
                    handleInputChange('pihak_terkait', [...(formData.pihak_terkait||[]), pihakSelect]);
                    setPihakSelect('');
                  }}>
                    Tambah
                  </Button>
                </div>
                <div className="mt-2 p-3 border border-gray-200 rounded-lg bg-gray-50 min-h-[60px] max-h-40 overflow-y-auto">
                  {(formData.pihak_terkait||[]).length === 0 ? (
                    <span className="text-xs text-gray-500">Belum ada pihak terkait yang dipilih</span>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {users
                        .filter((u) => (formData.pihak_terkait||[]).some((id)=> String(id)===String(u.id)))
                        .map((u) => (
                          <span key={`pt-${u.id}`} className="inline-flex items-center gap-2 px-2 py-1 text-xs rounded-full bg-red-50 text-red-700 border border-red-200">
                            {u.username || u.nama || u.full_name || `User ${u.id}`}
                            <button type="button" className="ml-1 text-red-600 hover:text-red-800" onClick={() => {
                              handleInputChange('pihak_terkait', (formData.pihak_terkait||[]).filter((id)=> String(id)!==String(u.id)))
                            }}>×</button>
                          </span>
                        ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-6 border-t">
              <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                <Save className="w-4 h-4 mr-2" />
                Simpan Komplain
              </Button>
              <Button 
                type="button" 
                variant="outline"
                onClick={() => navigate('/owner/operasional/komplain')}
              >
                <X className="w-4 h-4 mr-2" />
                Batal
              </Button>
            </div>
          </form>
        </CardBody>
      </Card>
    </div>
  );
};

export default OwnerKomplainForm;
