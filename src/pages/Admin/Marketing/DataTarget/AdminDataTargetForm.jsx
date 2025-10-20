import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { targetHarianService } from '@/services/targetHarianService';
import api from '@/services/api';
import { X, Save, RefreshCw, Calendar, FileText } from 'lucide-react';
import { MENU_CODES } from '@/config/menuCodes';
import RichTextEditor from '@/components/UI/RichTextEditor';

const AdminDataTargetForm = () => {
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ tanggal_target: new Date().toISOString().slice(0,10), isi_target: '' });
  const [images, setImages] = useState([]); // Hasil upload via paste lama (fallback)
  const [selectedImages, setSelectedImages] = useState([]); // Files dari RichTextEditor (belum terupload)

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const validate = () => {
    if (!form.tanggal_target) {
      toast.error('Tanggal target wajib diisi');
      return false;
    }
    if (!form.isi_target || String(form.isi_target).replace(/<br>/g,'').trim().length < 10) {
      toast.error('Isi target wajib diisi');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    try {
      setSaving(true);
      // Upload gambar baru dari editor jika ada
      let uploadedEditorImages = [];
      if (selectedImages && selectedImages.length) {
        const fd = new FormData();
        selectedImages.forEach((item) => { if (item?.file) fd.append('images', item.file); });
        try {
          const res = await api.post('/upload/target', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
          if (res?.data?.success && Array.isArray(res.data.data)) {
            uploadedEditorImages = res.data.data.map((f, idx) => ({
              id: selectedImages[idx]?.id,
              name: f.originalName || selectedImages[idx]?.file?.name || `target_${Date.now()}_${idx}.jpg`,
              url: f.url || f.path,
              serverPath: f.path || f.url,
            }));
          }
        } catch (err) {
          console.error('Upload editor images gagal:', err);
          toast.error('Upload gambar gagal');
        }
      }

      // Gabungkan dengan gambar hasil paste lama (jika ada)
      const allImages = [...uploadedEditorImages, ...(images || [])];
      // Kirim hanya gambar yang dipakai di konten editor berdasarkan placeholder [IMG:id]
      const usedIdMatches = [...String(form.isi_target||'').matchAll(/\[IMG:(\d+)\]/g)];
      const usedIds = new Set(usedIdMatches.map((m) => parseInt(m[1], 10)));
      const filteredImages = allImages.filter((img) => (typeof img.id !== 'undefined') ? usedIds.has(parseInt(img.id, 10)) : true);

      const payload = {
        tanggal_target: form.tanggal_target,
        isi_target: form.isi_target,
        images: filteredImages.length ? filteredImages : null,
      };
      const res = await targetHarianService.create(payload);
      if (res?.success) {
        toast.success('Taget harian berhasil ditambahkan');
        navigate('/admin/marketing/data-target');
      } else {
        toast.error(res?.error || 'Gagal menambah taget');
      }
    } catch (err) {
      console.error('Create Taget error:', err);
      toast.error(err?.response?.data?.message || err.message || 'Terjadi kesalahan');
    } finally {
      setSaving(false);
    }
  };

  // Handle paste image from clipboard
  const handlePaste = async (e) => {
    try {
      const items = e.clipboardData?.items || [];
      const files = [];
      for (let i = 0; i < items.length; i++) {
        const it = items[i];
        if (it.type && it.type.startsWith('image/')) {
          const file = it.getAsFile();
          if (file) files.push(file);
        }
      }
      if (files.length === 0) return;
      // Upload to backend
      const fd = new FormData();
      files.forEach((f) => fd.append('images', f));
      const res = await api.post('/upload/target', fd, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      if (res.data?.success) {
        const uploaded = (res.data.data || []).map((f) => {
          const nowId = Date.now() + Math.floor(Math.random()*1000);
          const name = f.filename || f.originalName || f.name || '';
          let serverPath = '';
          try {
            const u = new URL(f.url, window.location.origin);
            serverPath = u.pathname; // e.g. /uploads/target/xxx.png
          } catch {
            serverPath = f.path ? `/${String(f.path).replace(/^\/+/, '')}` : '';
          }
          return {
            uri: f.uri || '',
            id: nowId,
            name,
            url: f.url,
            serverPath
          };
        });
        setImages((prev) => [...prev, ...uploaded]);
        toast.success(`${uploaded.length} gambar ditambahkan`);
      } else {
        toast.error(res.data?.message || 'Upload gambar gagal');
      }
    } catch (err) {
      console.error('Paste/upload image error:', err);
      toast.error(err?.response?.data?.message || err.message || 'Gagal upload gambar');
    }
  };

  const removeImage = (idx) => {
    setImages((prev) => prev.filter((_, i) => i !== idx));
  };

  return (
    <div className="p-0 bg-gray-50 min-h-screen">
      {/* Header ala Medsos */}
      <div className="bg-red-800 text-white px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-sm font-semibold bg-white/10 rounded px-2 py-1 select-none">{MENU_CODES.marketing.dataTarget}</span>
            <div>
              <h1 className="text-xl md:text-2xl font-extrabold tracking-tight">TAMBAH TAGET HARIAN</h1>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => navigate('/admin/marketing/data-target')}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-white/60 text-white hover:bg-white/10 transition-colors"
              title="Batal"
            >
              <X className="h-4 w-4" />
              <span>Batal</span>
            </button>
            <button
              form="taget-form"
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-2 px-4 py-2 bg-white text-red-700 rounded-full hover:bg-red-50 transition-colors shadow-sm disabled:opacity-60"
            >
              {saving ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              <span>{saving ? 'Menyimpan...' : 'Simpan'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Form Section */}
      <div className="bg-white rounded-none shadow-sm border-y">
        <form id="taget-form" onSubmit={handleSubmit} className="w-full">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center space-x-3 mb-2">
              <div className="p-2 bg-red-100 rounded-lg">
                <Calendar className="h-5 w-5 text-red-600" />
              </div>
              <label className="text-lg font-semibold text-gray-900">Tanggal Target</label>
            </div>
            <input
              type="date"
              name="tanggal_target"
              value={form.tanggal_target}
              onChange={onChange}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
            />
          </div>

          <div className="p-6">
            <div className="flex items-center space-x-3 mb-2">
              <div className="p-2 bg-green-100 rounded-lg">
                <FileText className="h-5 w-5 text-green-600" />
              </div>
              <label className="text-lg font-semibold text-gray-900">Isi Target</label>
            </div>
            {/* Gunakan RichTextEditor seperti di Medsos */}
            <RichTextEditor
              value={form.isi_target}
              onChange={(e) => setForm((f) => ({ ...f, isi_target: e?.target?.value ?? '' }))}
              onFilesChange={(files) => setSelectedImages(files)}
              placeholder="Tulis isi taget harian..."
              rows={12}
            />
            {/* Preview/grid gambar disembunyikan sesuai permintaan */}
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminDataTargetForm;
