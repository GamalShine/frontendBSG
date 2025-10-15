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
import React, { useEffect, useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { targetHarianService } from '@/services/targetHarianService';
import { X, Save, RefreshCw, Calendar, FileText } from 'lucide-react';
import api from '@/services/api';

const AdminDataTargetEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ tanggal_target: '', isi_target: '' });
  const [images, setImages] = useState([]);

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
    if (!form.isi_target || String(form.isi_target).trim().length < 3) {
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
      const payload = {
        tanggal_target: form.tanggal_target,
        isi_target: form.isi_target,
        images: images && images.length ? images : null
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
      {/* Header ala Omset Harian */}
      <div className="bg-red-800 text-white px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-sm font-semibold bg.white/10 rounded px-2 py-1 select-none">TAGET</span>
            <div>
              <h1 className="text-xl md:text-2xl font-extrabold tracking-tight">EDIT TAGET HARIAN</h1>
              <p className="text-sm text-red-100">Perbarui data taget harian</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => navigate('/admin/marketing/data-target')}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-white/60 text.white hover:bg-white/10 transition-colors"
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
            >
              {saving ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              <span>{saving ? 'Menyimpan...' : 'Perbarui'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Form Section */}
      <div className="bg-white rounded-none shadow-sm border-y">
        <form id="taget-edit-form" onSubmit={handleSubmit} className="max-w-3xl mx-auto">
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
                <textarea
                  name="isi_target"
                  value={form.isi_target}
                  onChange={onChange}
                  onPaste={handlePaste}
                  rows={10}
                  placeholder="Tulis isi taget harian..."
                  className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                />
                {images.length > 0 && (
                  <div className="mt-4">
                    <div className="text-sm font-medium text-gray-700 mb-2">Gambar</div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {images.map((img, idx) => (
                        <div key={idx} className="bg-gray-50 border rounded-lg p-2 relative">
                          <img
                            src={img.url || img.uri}
                            alt={img.originalName || img.name || `image_${idx+1}`}
                            className="w-full h-32 object-cover rounded"
                            onError={(e) => { e.currentTarget.style.display = 'none'; }}
                          />
                          <button
                            type="button"
                            onClick={() => removeImage(idx)}
                            className="absolute top-1 right-1 bg-white/90 hover:bg-white text-red-600 border rounded px-2 py-0.5 text-xs"
                          >
                            Hapus
                          </button>
                          <div className="mt-1 text-xs text-gray-500 truncate">{img.originalName || img.name || '-'}</div>
                        </div>
                      ))}
                    </div>
                    <p className="text-xs text-gray-500 mt-2">Anda bisa paste gambar (Ctrl+V) langsung ke textarea untuk menambahkan gambar.</p>
                  </div>
                )}
              </div>
            </>
          )}
        </form>
      </div>
    </div>
  );
};

export default AdminDataTargetEdit;
