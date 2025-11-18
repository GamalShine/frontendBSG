import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { mediaSosialService } from '@/services/mediaSosialService';
import { toast } from 'react-hot-toast';
import { getEnvironmentConfig } from '@/config/environment';
import CKEditorPoskas from '@/components/UI/CKEditorPoskas';
import { MENU_CODES } from '@/config/menuCodes';
import { X, Save, RefreshCw } from 'lucide-react';

const AdminMedsosEdit = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const env = getEnvironmentConfig();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [form, setForm] = useState({ tanggal_laporan: '', isi_laporan: '' });
  const [images, setImages] = useState([]);

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
    // standardize <b> -> <strong>
    out = out.replace(/<\/?b>/gi, (m) => m.includes('/') ? '</strong>' : '<strong>');
    // remove <strong><br></strong> and empty <strong></strong>
    out = out.replace(/<strong>\s*(?:<br\s*\/?\s*>)+\s*<\/strong>/gi, '<br>');
    out = out.replace(/<strong>\s*<\/strong>/gi, '');
    // collapse nested <strong>
    try {
      let prev;
      do {
        prev = out;
        out = out.replace(/<strong>\s*<strong>/gi, '<strong>').replace(/<\/strong>\s*<\/strong>/gi, '</strong>');
      } while (out !== prev);
    } catch {}
    // unwrap placeholder-only bold
    out = out.replace(/<strong>\s*(\[IMG:\d+\])\s*<\/strong>/gi, '$1');
    // split bold across <br>
    out = out.replace(/<strong>([\s\S]*?)<br\s*\/?>([\s\S]*?)<\/strong>/gi, (m, a, b) => {
      const left = a.trim() ? `<strong>${a}</strong>` : '';
      const right = b.trim() ? `<strong>${b}</strong>` : '';
      return `${left}<br>${right}`;
    });
    // split bold around placeholders
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
  // Unbold-safe: convert spans with font-weight: normal into strong splits
  const unboldSafe = (html) => {
    if (!html) return html;
    let out = html;
    // Replace any span that forces normal weight with closing/opening strong
    out = out.replace(/<span[^>]*style="[^"]*font-weight\s*:\s*normal[^"]*"[^>]*>([\s\S]*?)<\/span>/gi, (_m, inner) => `</strong>${inner}<strong>`);
    // Clean possible stray strong tags afterwards
    out = fixStrayStrong(out);
    return out;
  };
  const escapeHtml = (str) => (str || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');

  // Handler RichTextEditor: sinkronkan HTML ke form.isi_laporan
  const handleEditorHtmlChange = (e) => {
    const html = e?.target?.value ?? '';
    setForm(prev => ({ ...prev, isi_laporan: html }));
  };

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await mediaSosialService.getById(id);
        const data = res?.data;
        if (data) {
          const d = new Date(data.tanggal_laporan);
          const yyyy = d.getFullYear();
          const mm = String(d.getMonth() + 1).padStart(2, '0');
          const dd = String(d.getDate()).padStart(2, '0');
          setForm({ tanggal_laporan: `${yyyy}-${mm}-${dd}` });
          let imgs = [];
          try {
            if (Array.isArray(data.images)) imgs = data.images;
            else if (typeof data.images === 'string' && data.images.trim()) imgs = JSON.parse(data.images);
          } catch {}
          imgs = Array.isArray(imgs) ? imgs : [];
          // Normalize URL helper
          const normalizeImageUrl = (url) => {
            if (!url) return '';
            let u = url;
            if (u.startsWith('http://http://')) u = u.replace('http://http://', 'http://');
            if (u.startsWith('https://https://')) u = u.replace('https://https://', 'https://');
            if (u.includes('/api/uploads/')) u = u.replace('/api/uploads/', '/uploads/');
            const base = env.API_BASE_URL?.replace(/\/$/, '') || '';
            if (!/^https?:|^data:|^blob:/i.test(u)) {
              const baseNoApi = base.replace(/\/api\/?$/, '');
              if (!u.startsWith('/')) u = '/' + u;
              u = baseNoApi + u;
            }
            return u;
          };
          const normalizedImgs = imgs.map(im => ({
            ...im,
            url: normalizeImageUrl(im.url || im.path || im.serverPath || im.uri)
          }));
          setImages(normalizedImgs);
          const html = (data.isi_laporan || '')
            .replace(/\[IMG:(\d+)\]/g, (_m, pid) => {
              const found = normalizedImgs.find(im => String(im.id) === String(pid));
              if (!found) return '';
              const src = found.url || found.uri || found.displayUri || found.fallbackUri || '';
              return `<img src="${src}" data-image-id="${pid}" style="max-width:100%;height:auto;margin:8px 0;border-radius:6px;" /><br>`;
            })
            .replace(/\n/g, '<br/>');
          // Rapikan <br> berlebih di edit view
          const tidied = html
            .replace(/(?:<br\s*\/?>\s*)+(<img[^>]*>)/gi, '$1')
            .replace(/(<img[^>]*>)(\s*(?:<br\s*\/?>\s*)+)/gi, '$1<br>')
            .replace(/(?:<br>\s*){3,}/gi, '<br><br>')
            .replace(/^(?:\s*<br>)+/i, '')
            .replace(/(?:<br>\s*)+$/i, '');
          // Set initial value untuk CKEditor
          setForm(prev => ({ ...prev, isi_laporan: tidied }));
        }
      } catch (e) {
        setError('Gagal memuat data');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  // Utils normalize & convert placeholder (selaras Omset/Laporan)
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
  const convertHtmlToPlaceholders = (html, imagesList) => {
    if (!html) return '';
    let out = html;
    try {
      const parser = new DOMParser();
      const doc = parser.parseFromString(out, 'text/html');
      const imgs = Array.from(doc.querySelectorAll('img'));
      imgs.forEach(img => {
        const src = img.getAttribute('src') || '';
        const nsrc = normalizeUrl(src);
        const match = (Array.isArray(imagesList) ? imagesList : []).find(it => {
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

  const onSubmit = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      if (!form.tanggal_laporan) { toast.error('Tanggal laporan wajib diisi'); setSaving(false); return; }
      const isi = form?.isi_laporan || '';
      if (!isi || isi.replace(/<br>/g,'').trim().length < 10) { toast.error('Isi laporan terlalu pendek'); setSaving(false); return; }
      // Normalisasi & konversi placeholder
      const normalized = normalizeBlocks(isi);
      const contentForSave = convertHtmlToPlaceholders(normalized, images || []);

      // Pastikan URL yang dikirim relatif seperti sebelum edit
      const relativizeUrl = (u) => {
        try {
          if (!u) return ''
          const base = (env.API_BASE_URL || '').replace(/\/$/, '')
          const baseNoApi = base.replace(/\/api\/?$/, '')
          // Jika absolut (http/https), ambil pathname saja
          if (/^https?:\/\//i.test(u)) {
            const urlObj = new URL(u, baseNoApi)
            return urlObj.pathname
          }
          // Jika sudah relatif tapi tanpa leading slash, tambahkan
          return u.startsWith('/') ? u : `/${u}`
        } catch {
          return u
        }
      }
      const imagesPayload = (Array.isArray(images) ? images : []).map(im => {
        const rel = relativizeUrl(im.url || im.serverPath || im.path || '')
        return {
          ...im,
          url: rel,
          serverPath: im.serverPath || rel
        }
      })

      await mediaSosialService.update(id, { tanggal_laporan: form.tanggal_laporan, isi_laporan: contentForSave, images: imagesPayload });
      toast.success('Laporan medsos berhasil diperbarui');
      navigate(`/admin/marketing/medsos/${id}`);
    } catch (err) {
      console.error(err);
      setError('Gagal menyimpan perubahan');
      toast.error('Gagal memperbarui laporan medsos');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header merah ala keuangan */}
      <div className="bg-red-800 text-white px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span className="text-sm font-semibold bg-white/10 rounded px-2 py-1">{MENU_CODES.marketing.medsos}</span>
            <h1 className="text-2xl font-bold">EDIT LAP MEDSOS</h1>
          </div>
          <div className="hidden md:flex items-center gap-2">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-white/60 text-white hover:bg-white/10 transition-colors"
            >
              <X className="h-4 w-4" />
              <span>Batal</span>
            </button>
            <button
              form="medsos-edit-form"
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

      {/* Section putih tanpa kotak judul */}
      <div className="bg-white rounded-none shadow-sm border-y mt-0">
        {loading ? (
          <div className="p-6 text-sm text-gray-600">Memuat data...</div>
        ) : (
          <form id="medsos-edit-form" onSubmit={onSubmit}>
            {/* Tanggal Laporan */}
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center space-x-3 mb-4">
                <div className="p-2 bg-red-100 rounded-lg">
                  <span className="text-red-700 font-semibold">📅</span>
                </div>
                <label className="text-lg font-semibold text-gray-900">Tanggal Laporan</label>
              </div>
              <input
                type="date"
                value={form.tanggal_laporan}
                onChange={(e) => setForm(prev => ({ ...prev, tanggal_laporan: e.target.value }))}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              />
            </div>

            {/* Isi Laporan */}
            <div className="p-6">
              <div className="flex items-center space-x-3 mb-4">
                <div className="p-2 bg-green-100 rounded-lg">
                  <span className="text-green-700 font-semibold">📝</span>
                </div>
                <label className="text-lg font-semibold text-gray-900">Isi Laporan</label>
              </div>
              <CKEditorPoskas
                value={form.isi_laporan}
                onChangeHTML={handleEditorHtmlChange}
                onImagesChange={(imgs) => setImages(imgs)}
                placeholder="Masukkan isi laporan media sosial..."
                uploadPath="/upload/media-sosial"
                imageAlign="left"
              />
              {/* Tombol aksi mobile: ikon saja, diletakkan di kanan bawah editor */}
              <div className="mt-4 flex items-center justify-end gap-3 md:hidden">
                <button
                  type="button"
                  onClick={() => navigate(-1)}
                  className="inline-flex items-center justify-center h-10 w-10 rounded-full border border-red-600 text-red-700 hover:bg-red-50 active:scale-95 transition"
                  title="Batal"
                  aria-label="Batal"
                >
                  <X className="h-5 w-5" />
                </button>
                <button
                  form="medsos-edit-form"
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
        )}
      </div>
    </div>
  );
};

export default AdminMedsosEdit;
