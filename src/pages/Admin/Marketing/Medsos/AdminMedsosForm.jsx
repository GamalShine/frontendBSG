import React, { useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Card, { CardHeader, CardBody } from '@/components/UI/Card';
import Button from '@/components/UI/Button';
import { mediaSosialService } from '@/services/mediaSosialService';
import { toast } from 'react-hot-toast';
import { getEnvironmentConfig } from '@/config/environment';
import CKEditorPoskas from '@/components/UI/CKEditorPoskas';
import { MENU_CODES } from '@/config/menuCodes';
import { X, Save, RefreshCw, Calendar, FileText } from 'lucide-react';

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
  const [form, setForm] = useState({ tanggal_laporan: defaultDate, isi_laporan: '', images: [] });

  // Utils normalize & convert placeholder (disederhanakan seperti Omset/Laporan)
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
  const normalizeUrl = (url) => {
    if (!url) return '';
    try {
      let out = String(url).trim();
      out = out.replace('http://http://','http://').replace('https://https://','https://');
      out = out.replace('/api/uploads/','/uploads/');
      return out;
    } catch { return String(url||''); }
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

  // CKEditorPoskas menyimpan konten HTML mentah; normalisasi dilakukan saat submit

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
      // Normalisasi & konversi placeholder
      const normalized = normalizeBlocks(isi);
      const contentForSave = convertHtmlToPlaceholders(normalized, form.images || []);

      await mediaSosialService.create({
        tanggal_laporan: form.tanggal_laporan,
        isi_laporan: contentForSave,
        images: Array.isArray(form.images) ? form.images : [],
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
              <span className="text-sm font-semibold bg-white/10 rounded px-2 py-1 select-none">{MENU_CODES.marketing.medsos}</span>
              <h1 className="text-xl md:text-2xl font-extrabold tracking-tight">TAMBAH MEDSOS</h1>
            </div>
          </div>
          <div className="hidden md:flex items-center gap-2">
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
            <div className="flex items-center space-x-3 mb-2">
              <div className="p-2 bg-red-100 rounded-lg">
                <Calendar className="h-5 w-5 text-red-600" />
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
          </div>

          {/* Isi Laporan Editor */
          }
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-2 bg-green-100 rounded-lg">
                <FileText className="h-5 w-5 text-green-600" />
              </div>
              <label className="text-lg font-semibold text-gray-900">
                Isi Laporan
              </label>
            </div>

            <div className="space-y-4">
              <CKEditorPoskas
                value={form.isi_laporan}
                onChangeHTML={handleEditorHtmlChange}
                onImagesChange={(images) => setForm(prev => ({ ...prev, images }))}
                placeholder="Masukkan isi laporan media sosial..."
                uploadPath="/upload/media-sosial"
                imageAlign="left"
              />
              {/* Tombol aksi mobile: ikon saja, di kanan bawah editor */}
              <div className="mt-4 flex items-center justify-end gap-3 md:hidden">
                <button
                  type="button"
                  onClick={() => navigate('/admin/marketing/medsos')}
                  className="inline-flex items-center justify-center h-10 w-10 rounded-full border border-red-600 text-red-700 hover:bg-red-50 active:scale-95 transition"
                  title="Batal"
                  aria-label="Batal"
                >
                  <X className="h-5 w-5" />
                </button>
                <button
                  form="medsos-form"
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
          </div>

          {/* Tombol header khusus desktop; mobile tombol ada di bawah editor */}
        </form>
      </div>
    </div>
  );
};

export default AdminMedsosForm;
