import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { targetHarianService } from '@/services/targetHarianService';
import { X, Save, RefreshCw, Calendar, FileText } from 'lucide-react';
import { MENU_CODES } from '@/config/menuCodes';
import CKEditorPoskas from '@/components/UI/CKEditorPoskas';

const AdminDataTargetForm = () => {
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ tanggal_target: new Date().toISOString().slice(0,10), isi_target: '', images: [] });

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

  // Utils normalize and convert like Poskas/Omset
  const normalizeUrl = (url) => {
    if (!url) return '';
    try {
      let out = String(url).trim();
      out = out.replace('http://http://','http://').replace('https://https://','https://');
      out = out.replace('/api/uploads/','/uploads/');
      return out;
    } catch { return String(url||''); }
  };
  const normalizeBlocks = (html) => {
    if (!html) return '';
    let out = String(html);
    try {
      out = out
        .replace(/<\s*figcaption[^>]*>[\s\S]*?<\s*\/\s*figcaption\s*>/gi, '')
        .replace(/<\s*figure[^>]*>/gi, '')
        .replace(/<\s*\/\s*figure\s*>/gi, '')
        .replace(/<\s*\/\s*p\s*>/gi, '<br>')
        .replace(/<\s*p[^>]*>/gi, '')
        .replace(/<\s*\/\s*div\s*>/gi, '<br>')
        .replace(/<\s*div[^>]*>/gi, '')
        .replace(/&nbsp;/gi, ' ')
        .replace(/\s*<br\s*\/\?\s*>\s*/gi, '<br>')
        .replace(/(?:<br>\s*){3,}/gi, '<br><br>')
        .replace(/^(?:\s*<br>)+/i, '')
        .replace(/(?:<br>\s*)+$/i, '')
        .replace(/(\[IMG:\d+\])(?:<br>\s*){2,}/gi, '$1<br>')
        .replace(/<br>\s*<br>/gi, '<br>');
    } catch(_) {}
    return out;
  };
  const convertHtmlToPlaceholders = (html, images) => {
    if (!html) return '';
    let out = html;
    try {
      const parser = new DOMParser();
      const doc = parser.parseFromString(out, 'text/html');
      const imgs = Array.from(doc.querySelectorAll('img'));
      imgs.forEach(img => {
        const src = img.getAttribute('src') || '';
        const nsrc = normalizeUrl(src);
        const match = (Array.isArray(images) ? images : []).find(it => {
          const iurl = normalizeUrl(it?.url || '');
          return iurl && (iurl === nsrc || src.endsWith(iurl));
        });
        const id = match?.id;
        const token = doc.createTextNode(id ? `[IMG:${id}]` : '');
        if (token.textContent) {
          img.parentNode.replaceChild(token, img);
        } else {
          const br = doc.createElement('br');
          img.parentNode.replaceChild(br, img);
        }
      });
      out = doc.body.innerHTML;
    } catch(_) {}
    return out;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    try {
      setSaving(true);
      // Ambil konten dari CKEditor dan konversi
      const normalized = normalizeBlocks(form.isi_target || '');
      const contentForSave = convertHtmlToPlaceholders(normalized, form.images || []);

      const payload = {
        tanggal_target: form.tanggal_target,
        isi_target: contentForSave,
        images: Array.isArray(form.images) ? form.images : null,
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
              <h1 className="text-xl md:text-2xl font-extrabold tracking-tight">TAMBAH DATA TARGET</h1>
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
              form="taget-form"
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-2 px-4 py-2 bg-white text-red-700 rounded-full hover:bg-red-50 transition-colors shadow-sm disabled:opacity-60"
              title="Simpan"
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
            <CKEditorPoskas
              value={form.isi_target}
              onChangeHTML={(e) => setForm((f) => ({ ...f, isi_target: e?.target?.value ?? '' }))}
              onImagesChange={(images) => setForm((f) => ({ ...f, images }))}
              placeholder="Tulis isi taget harian..."
              uploadPath="/upload/target"
              imageAlign="left"
            />
            {/* Preview/grid gambar disembunyikan sesuai permintaan */}
            {/* Action buttons (icon-only) under editor, mobile only */}
            <div className="mt-4 flex items-center justify-end gap-3 md:hidden">
              <button
                type="button"
                onClick={() => navigate('/admin/marketing/data-target')}
                className="inline-flex items-center justify-center h-10 w-10 rounded-full border border-red-600 text-red-700 hover:bg-red-50 active:scale-95 transition"
                title="Batal"
                aria-label="Batal"
              >
                <X className="h-5 w-5" />
              </button>
              <button
                form="taget-form"
                type="submit"
                disabled={saving}
                className="inline-flex items-center justify-center h-10 w-10 rounded-full bg-red-600 text-white hover:bg-red-700 active:scale-95 transition disabled:opacity-60"
                title="Simpan"
                aria-label="Simpan"
              >
                {saving ? <RefreshCw className="h-5 w-5 animate-spin" /> : <Save className="h-5 w-5" />}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminDataTargetForm;
