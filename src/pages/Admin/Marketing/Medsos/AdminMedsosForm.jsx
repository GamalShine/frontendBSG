import React, { useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Card, { CardHeader, CardBody } from '@/components/UI/Card';
import Button from '@/components/UI/Button';
import { mediaSosialService } from '@/services/mediaSosialService';
import { toast } from 'react-hot-toast';
import { getEnvironmentConfig } from '@/config/environment';
import RichTextEditor from '@/components/UI/RichTextEditor';
import { MENU_CODES } from '@/config/menuCodes';
import { X, Save, RefreshCw } from 'lucide-react';

const AdminMedsosForm = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const prefillYear = searchParams.get('year');
  const prefillMonth = searchParams.get('month');

  const defaultDate = useMemo(() => {
    if (prefillYear && prefillMonth) {
      const y = Number(prefillYear);
      const m = Number(prefillMonth);
      const d = new Date(y, m - 1, 1);
      const yyyy = d.getFullYear();
      const mm = String(d.getMonth() + 1).padStart(2, '0');
      const dd = String(d.getDate()).padStart(2, '0');
      return `${yyyy}-${mm}-${dd}`;
    }
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  }, [prefillYear, prefillMonth]);

  const env = getEnvironmentConfig();
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ tanggal_laporan: defaultDate, isi_laporan: '' });
  const [selectedImages, setSelectedImages] = useState([]); // { file, id }

  // Helpers: sanitizer & normalizer
  const removeZeroWidth = (html) => (html || '').replace(/[\u200B-\u200D\uFEFF]/g, '');
  const sanitizeToLTR = (html) => {
    if (!html || typeof html !== 'string') return html || '';
    const removedBidi = html.replace(/[\u200E\u200F\u202A-\u202E\u2066-\u2069]/g, '');
    return removedBidi
      .replace(/\sdir="[^"]*"/gi, '')
      .replace(/\sdir='[^']*'/gi, '')
      .replace(/\sstyle="[^"]*(direction\s*:\s*(rtl|ltr))[^"]*"/gi, (m) => m.replace(/direction\s*:\s*(rtl|ltr)\s*;?/gi, ''))
      .replace(/\sstyle="[^"]*(text-align\s*:\s*(right|left|center|justify))[^"]*"/gi, (m) => m.replace(/text-align\s*:\s*(right|left|center|justify)\s*;?/gi, ''))
      .replace(/\sstyle="\s*"/gi, '')
      .replace(/\sstyle='\s*'/gi, '');
  };
  const normalizeBoldHtml = (html) => {
    if (!html) return html;
    let out = html;
    // standardize b -> strong
    out = out.replace(/<\/?b>/gi, (m) => m.includes('</') ? '</strong>' : '<strong>');
    // remove <strong><br></strong> and empty <strong></strong>
    out = out.replace(/<strong>\s*(?:<br\s*\/?\s*>)+\s*<\/strong>/gi, '<br>');
    out = out.replace(/<strong>\s*<\/strong>/gi, '');
    // collapse nested <strong>
    try {
      let prev;
      do {
        prev = out;
        out = out.replace(/<strong>\s*<strong>/gi, '<strong>')
                 .replace(/<\/strong>\s*<\/strong>/gi, '</strong>');
      } while (out !== prev);
    } catch {}
    // unwrap placeholder-only bold
    out = out.replace(/<strong>\s*(\[IMG:\d+\])\s*<\/strong>/gi, '$1');
    // split strong across <br>
    out = out.replace(/<strong>([\s\S]*?)<br\s*\/?>([\s\S]*?)<\/strong>/gi, (m, a, b) => {
      const left = a.trim() ? `<strong>${a}</strong>` : '';
      const right = b.trim() ? `<strong>${b}</strong>` : '';
      return `${left}<br>${right}`;
    });
    // split strong around placeholders
    out = out.replace(/<strong>([^]*?)\[IMG:(\d+)\]([^]*?)<\/strong>/gi, (m, left, id, right) => {
      const L = left.trim() ? `<strong>${left}</strong>` : '';
      const R = right.trim() ? `<strong>${right}</strong>` : '';
      return `${L}[IMG:${id}]${R}`;
    });
    return out;
  };
  const fixStrayStrong = (html) => {
    if (!html) return html;
    let out = html;
    out = out.replace(/^(\s*<\/strong>)+/i, '');
    out = out.replace(/(<strong>\s*)+$/i, '');
    return out;
  };
  const unboldSafe = (html) => {
    if (!html) return html;
    let out = html;
    // convert spans that force normal weight to break strong scope
    out = out.replace(/<span[^>]*style="[^"]*font-weight\s*:\s*normal[^"]*"[^>]*>([\s\S]*?)<\/span>/gi, (_m, inner) => `</strong>${inner}<strong>`);
    out = fixStrayStrong(out);
    return out;
  };
  const escapeHtml = (str) => (str || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');

  const handleEditorHtmlChange = (e) => {
    const html = e?.target?.value ?? '';
    setForm(prev => ({ ...prev, isi_laporan: html }));
  };

  // RichTextEditor sudah melakukan normalisasi dan serialisasi saat onChange/blur

  const applyFormat = (cmd) => (e) => {
    e.preventDefault();
    try {
      if (editorRef.current) editorRef.current.focus();
      document.execCommand(cmd);
    } catch (_) {}
  };

  // Helper untuk memastikan URL gambar absolut dan kompatibel
  const normalizeImageUrl = (url) => {
    if (!url) return '';
    let u = url;
    // Perbaiki double http(s)://
    if (u.startsWith('http://http://')) u = u.replace('http://http://', 'http://');
    if (u.startsWith('https://https://')) u = u.replace('https://https://', 'https://');
    // Jika mengandung /api/uploads/, ubah ke /uploads/
    if (u.includes('/api/uploads/')) u = u.replace('/api/uploads/', '/uploads/');
    // Jika relatif, jadikan absolut dari BASE (tanpa /api di depan path)
    const base = env.API_BASE_URL?.replace(/\/$/, '') || '';
    if (!/^https?:|^data:|^blob:/i.test(u)) {
      const baseNoApi = base.replace(/\/api\/?$/, '');
      if (!u.startsWith('/')) u = '/' + u;
      u = baseNoApi + u;
    }
    return u;
  };

  // Paste/upload ditangani oleh RichTextEditor melalui onFilesChange

  // RichTextEditor sudah menyimpan konten ter-serialisasi di form.isi_laporan

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!form.tanggal_laporan) {
      toast.error('Tanggal laporan wajib diisi');
      return;
    }
    try {
      setSaving(true);
      const isi = form?.isi_laporan || '';
      if (!isi || isi.replace(/<br>/g,'').trim().length < 10) {
        toast.error('Isi laporan terlalu pendek');
        setSaving(false);
        return;
      }
      // Upload gambar baru terlebih dahulu
      const uploadNewImages = async () => {
        if (!selectedImages || selectedImages.length === 0) return [];
        const fd = new FormData();
        selectedImages.forEach((item) => { if (item?.file) fd.append('images', item.file); });
        try {
          const res = await fetch(`${env.API_BASE_URL}/upload/media-sosial`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` },
            body: fd,
          });
          if (!res.ok) throw new Error('Upload gagal');
          const json = await res.json();
          if (json?.success && Array.isArray(json.data)) {
            return json.data.map((f, idx) => ({
              id: selectedImages[idx]?.id,
              name: f.originalName || selectedImages[idx]?.file?.name || `medsos_${Date.now()}_${idx}.jpg`,
              url: f.url || f.path,
              serverPath: f.path || f.url,
            })).filter(x => x.id);
          }
          toast.error('Upload gambar gagal');
          return [];
        } catch (err) {
          console.error('Upload medsos gagal:', err);
          toast.error('Gagal mengupload gambar');
          return [];
        }
      };
      const newImages = await uploadNewImages();
      const allImages = [...newImages];
      // Filter hanya gambar yang dipakai di konten (berdasarkan [IMG:id])
      const usedIdMatches = [...isi.matchAll(/\[IMG:(\d+)\]/g)];
      const usedIds = new Set(usedIdMatches.map((m) => parseInt(m[1], 10)));
      const filteredImages = allImages.filter((img) => img && typeof img.id !== 'undefined' && usedIds.has(parseInt(img.id, 10)));

      await mediaSosialService.create({
        tanggal_laporan: form.tanggal_laporan,
        isi_laporan: isi,
        images: filteredImages,
      });
      toast.success('Laporan medsos berhasil ditambahkan');
      navigate('/admin/marketing/medsos');
    } catch (err) {
      console.error(err);
      toast.error('Gagal menambahkan laporan medsos');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header merah: samakan dengan halaman utama */}
      <div className="bg-red-800 text-white px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="flex items-center gap-4">
              <span className="text-sm font-semibold bg-white/10 rounded px-2 py-1">{MENU_CODES.marketing.medsos}</span>
              <h1 className="text-2xl font-bold">TAMBAH LAP MEDSOS</h1>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => navigate('/admin/marketing/medsos')}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-white/60 text-white hover:bg-white/10 transition-colors"
            >
              <X className="h-4 w-4" />
              <span>Batal</span>
            </button>
            <button
              form="medsos-form"
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

      {/* Form Section ala Omset Harian */}
      <div className="bg-white rounded-none shadow-sm border-y">
        <form id="medsos-form" onSubmit={onSubmit}>
          {/* Tanggal Laporan */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-2 bg-red-100 rounded-lg">
                <span className="text-red-700 font-semibold">📅</span>
              </div>
              <label className="text-lg font-semibold text-gray-900">
                Tanggal Laporan
              </label>
            </div>
            <input
              type="date"
              name="tanggal_laporan"
              value={form.tanggal_laporan}
              onChange={(e) => setForm(prev => ({ ...prev, tanggal_laporan: e.target.value }))}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
            />
            <p className="text-sm text-gray-500 mt-2">Pilih tanggal untuk laporan medsos ini</p>
          </div>

          {/* Isi Laporan Editor */
          }
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-2 bg-green-100 rounded-lg">
                <span className="text-green-700 font-semibold">📝</span>
              </div>
              <label className="text-lg font-semibold text-gray-900">
                Isi Laporan
              </label>
            </div>

            <div className="space-y-4">
              <RichTextEditor
                value={form.isi_laporan}
                onChange={handleEditorHtmlChange}
                onFilesChange={(files) => setSelectedImages(files)}
                placeholder="Masukkan isi laporan media sosial..."
                rows={12}
                hideAlign={true}
                hideImage={true}
              />
            </div>
          </div>

          {/* Tombol Submit bawah dihilangkan agar fokus pada tombol header */}
        </form>
      </div>
    </div>
  );
};

export default AdminMedsosForm;
