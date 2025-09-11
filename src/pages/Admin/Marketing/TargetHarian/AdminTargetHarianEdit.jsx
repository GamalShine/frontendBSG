import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { getEnvironmentConfig } from '@/config/environment';
import { targetHarianService } from '../../../../services/targetHarianService';
import { ArrowLeft, Save } from 'lucide-react';

const AdminTargetHarianEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const env = getEnvironmentConfig();

  const [form, setForm] = useState({ tanggal_target: '', isi_target: '', images: [] });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState([]);

  const load = async () => {
    try {
      setLoading(true);
      const res = await targetHarianService.getById(id);
      if (!res?.success) throw new Error(res?.error || 'Gagal memuat data');
      const d = res.data;
      let imgs = [];
      try { imgs = d.images ? JSON.parse(d.images) : []; } catch (_) { imgs = []; }
      setForm({
        tanggal_target: d.tanggal_target ? new Date(d.tanggal_target).toISOString().split('T')[0] : '',
        isi_target: d.isi_target || '',
        images: imgs || []
      });
    } catch (err) {
      toast.error(err.message || 'Gagal memuat data');
      navigate('/admin/marketing/data-target');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); /* eslint-disable-next-line */ }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const onSelectFiles = (e) => {
    const files = Array.from(e.target.files || []);
    setSelectedFiles(files);
  };

  const uploadImages = async () => {
    if (!selectedFiles.length) return [];
    try {
      const fd = new FormData();
      selectedFiles.forEach(f => fd.append('images', f));
      const res = await fetch(`${env.API_BASE_URL}/upload/target`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` },
        body: fd
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      if (!json.success) throw new Error(json.message || 'Upload gagal');
      const uploaded = json.data || [];
      return uploaded.map(u => ({
        id: Date.now() + Math.floor(Math.random()*1000),
        name: u.filename || 'image',
        url: `${env.BASE_URL.replace('/api','')}${u.url}`,
        serverPath: u.url
      }));
    } catch (err) {
      toast.error(`Upload gambar gagal: ${err.message}`);
      return [];
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.tanggal_target) return toast.error('Tanggal target wajib diisi');
    if (!form.isi_target || form.isi_target.trim().length < 5) return toast.error('Isi target minimal 5 karakter');
    setSubmitting(true);
    try {
      let images = form.images;
      if (selectedFiles.length) {
        const uploaded = await uploadImages();
        images = [...images, ...uploaded];
      }
      const payload = { tanggal_target: form.tanggal_target, isi_target: form.isi_target, images };
      const res = await targetHarianService.update(id, payload);
      if (!res?.success) throw new Error(res?.error || 'Gagal memperbarui');
      toast.success('Target harian berhasil diperbarui');
      navigate(`/admin/marketing/data-target/${id}`);
    } catch (err) {
      toast.error(err.message || 'Gagal menyimpan');
    } finally {
      setSubmitting(false);
    }
  };

  // Filter gambar invalid agar preview tidak memicu request 404
  const safeImages = (Array.isArray(form.images) ? form.images : []).filter((img) => {
    const u = img?.url || img?.serverPath
    return Boolean(u && typeof u === 'string' && !u.includes(':id'))
  })

  if (loading) return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="p-8 text-center text-gray-500">Memuat...</div>
      </div>
    </div>
  );

  return (
    <div className="px-0 py-2 bg-gray-50 min-h-screen">
      {/* Header ala acuan */}
      <div className="bg-red-800 text-white p-4 mb-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate('/admin/marketing/data-target')} aria-label="Kembali" className="inline-flex items-center bg-white/0 text-white hover:text-gray-100">
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div>
              <h1 className="text-2xl font-bold">Edit Data Target</h1>
              <p className="text-sm opacity-90">Admin - Marketing</p>
            </div>
          </div>
          <button type="submit" form="form-admin-target-edit" className="bg-white border-red-600 text-red-700 hover:bg-red-50 inline-flex items-center gap-2 px-3 py-2 disabled:opacity-50" disabled={submitting}>
            <Save className="h-4 w-4" />
            <span>{submitting ? 'Menyimpan...' : 'Simpan'}</span>
          </button>
        </div>
      </div>
      <div className="bg-gray-200 px-4 py-2 text-xs text-gray-600 -mt-1 mb-4">Mode Edit</div>

      <div className="max-w-4xl mx-auto mb-12 px-4">
        <form id="form-admin-target-edit" onSubmit={handleSubmit} className="bg-white shadow-sm border p-6 space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tanggal Target</label>
            <input type="date" name="tanggal_target" value={form.tanggal_target} onChange={handleChange} className="w-full border rounded px-3 py-2" required />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Isi Target</label>
            <textarea name="isi_target" value={form.isi_target} onChange={handleChange} rows={10} className="w-full border rounded px-3 py-2" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tambah Gambar (opsional)</label>
            <input type="file" accept="image/*" multiple onChange={onSelectFiles} className="block w-full text-sm" />
            <div className="mt-3 flex flex-wrap gap-2">
              {safeImages.map((img, i) => (
                <img key={i} src={img.url || img.serverPath} alt={img.name || `img-${i}`} className="h-16 w-16 object-cover rounded border" />
              ))}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button type="button" className="px-4 py-2 border" onClick={() => navigate('/admin/marketing/data-target')}>Batal</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminTargetHarianEdit;
