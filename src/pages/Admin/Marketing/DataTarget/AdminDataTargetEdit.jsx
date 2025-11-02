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
            serverPath = u.pathname;
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
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { targetHarianService } from '@/services/targetHarianService';
import { X, Save, RefreshCw, Calendar, FileText } from 'lucide-react';
import api from '@/services/api';
import { MENU_CODES } from '@/config/menuCodes';
import RichTextEditor from '@/components/UI/RichTextEditor';
import { getEnvironmentConfig } from '@/config/environment';

const AdminDataTargetEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ tanggal_target: '', isi_target: '' });
  const [images, setImages] = useState([]); // legacy pasted images
  const [selectedImages, setSelectedImages] = useState([]); // files from RichTextEditor (not yet uploaded)
  const [editorInitialHtml, setEditorInitialHtml] = useState('');
  const env = getEnvironmentConfig();

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const res = await targetHarianService.getById(id);
        if (res?.success && res.data) {
          const it = res.data;
          setForm({
            tanggal_target: (it.tanggal_target ? new Date(it.tanggal_target).toISOString().slice(0,10) : ''),
            isi_target: it.isi_target || ''
          });
          // parse images jika ada
          let imgs = [];
          try {
            if (it.images) {
              imgs = typeof it.images === 'string' ? JSON.parse(it.images) : (Array.isArray(it.images) ? it.images : []);
            }
          } catch { imgs = []; }
          setImages(imgs || []);

          // Bangun HTML awal editor agar foto asli tampil (ganti [IMG:id] -> <img data-image-id src=...>)
          const normalizeImageUrl = (u) => {
            try {
              let url = String(u || '');
              if (!url) return '';
              url = url.replace(/^https?:\/\/https?:\/\//i, (m) => m.replace('http://http://', 'http://').replace('https://https://', 'https://'));
              url = url.replace(/\/api\/uploads\//i, '/uploads/');
              const isAbsolute = /^https?:|^data:|^blob:/i.test(url);
              if (!isAbsolute) {
                if (!url.startsWith('/')) url = '/' + url;
                const base = (env.API_BASE_URL || '').replace(/\/$/, '');
                const baseNoApi = base.replace(/\/api\/?$/, '');
                return `${baseNoApi}${url}`;
              }
              return url;
            } catch { return String(u || ''); }
          };
          try {
            const byId = new Map();
            (imgs || []).forEach((img) => {
              if (typeof img.id !== 'undefined') byId.set(Number(img.id), normalizeImageUrl(img.url || img.uri || img.path || ''));
            });
            let html = String(it.isi_target || '');
            html = html.replace(/\[IMG:(\d+)\]/g, (_m, g1) => {
              const id = Number(g1);
              const src = byId.get(id);
              if (!src) return '';
              return `<img data-image-id="${id}" src="${src}" style="max-width:100%;height:auto;border-radius:0.5rem;margin:10px 0;box-shadow:0 2px 4px rgba(0,0,0,0.1)" />`;
            });
            setEditorInitialHtml(html);
          } catch {
            setEditorInitialHtml(String(it.isi_target || ''));
          }
        } else {
          toast.error(res?.error || 'Gagal memuat data');
        }
      } catch (err) {
        console.error('Load Taget error:', err);
        toast.error(err?.response?.data?.message || err.message || 'Terjadi kesalahan');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

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
          const resUp = await api.post('/upload/target', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
          if (resUp?.data?.success && Array.isArray(resUp.data.data)) {
            uploadedEditorImages = resUp.data.data.map((f, idx) => ({
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
      const allImages = [...uploadedEditorImages, ...(images || [])];
      const usedIdMatches = [...String(form.isi_target||'').matchAll(/\[IMG:(\d+)\]/g)];
      const usedIds = new Set(usedIdMatches.map((m) => parseInt(m[1], 10)));
      const filteredImages = allImages.filter((img) => (typeof img.id !== 'undefined') ? usedIds.has(parseInt(img.id, 10)) : true);

      const payload = {
        tanggal_target: form.tanggal_target,
        isi_target: form.isi_target,
        images: filteredImages.length ? filteredImages : null,
      };
      const res = await targetHarianService.update(id, payload);
      if (res?.success) {
        toast.success('Taget harian berhasil diperbarui');
        navigate('/admin/marketing/data-target');
      } else {
        toast.error(res?.error || 'Gagal memperbarui taget');
      }
    } catch (err) {
      console.error('Update Taget error:', err);
      toast.error(err?.response?.data?.message || err.message || 'Terjadi kesalahan');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-0 bg-gray-50 min-h-screen">
      {/* Header ala Medsos */}
      <div className="bg-red-800 text-white px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-sm font-semibold bg-white/10 rounded px-2 py-1 select-none">{MENU_CODES.marketing.dataTarget}</span>
            <div>
              <h1 className="text-xl md:text-2xl font-extrabold tracking-tight">EDIT DATA TARGET</h1>
            </div>
          </div>
          <div className="hidden md:flex items-center gap-2">
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
              form="taget-edit-form"
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-2 px-4 py-2 bg-white text-red-700 rounded-full hover:bg-red-50 transition-colors shadow-sm disabled:opacity-60"
              title="Simpan"
            >
              {saving ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              <span>{saving ? 'Menyimpan...' : 'Perbarui'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Form Section */}
      <div className="bg-white rounded-none shadow-sm border-y">
        <form id="taget-edit-form" onSubmit={handleSubmit} className="w-full">
          {loading ? (
            <div className="p-8 text-center text-gray-600">Memuat data...</div>
          ) : (
            <>
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
                <RichTextEditor
                  value={editorInitialHtml}
                  onChange={(e) => setForm((f) => ({ ...f, isi_target: e?.target?.value ?? '' }))}
                  onFilesChange={(files) => setSelectedImages(files)}
                  placeholder="Tulis isi taget harian..."
                  rows={12}
                  hideAlign={true}
                  hideImage={true}
                />
                {/* Preview/grid gambar disembunyikan sesuai permintaan */}
                {/* Action buttons (icon-only) under editor, mobile only */}
                <div className="mt-4 flex items-center justify-end gap-3 md:hidden">
                  <button
                    type="button"
                    onClick={() => navigate('/admin/marketing/data-target')}
                    className="inline-flex items-center justify-center h-10 w-10 rounded-full border border-red-600 text-red-700 hover:bg-red-50 active:scale-95 transition"
                    aria-label="Batal"
                    title="Batal"
                  >
                    <X className="h-5 w-5" />
                  </button>
                  <button
                    form="taget-edit-form"
                    type="submit"
                    disabled={saving}
                    className="inline-flex items-center justify-center h-10 w-10 rounded-full bg-red-600 text-white hover:bg-red-700 active:scale-95 transition disabled:opacity-60"
                    aria-label="Simpan"
                    title="Simpan"
                  >
                    {saving ? <RefreshCw className="h-5 w-5 animate-spin" /> : <Save className="h-5 w-5" />}
                  </button>
                </div>
              </div>
            </>
          )}
        </form>
      </div>
    </div>
  );
};

export default AdminDataTargetEdit;
