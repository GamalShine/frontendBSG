import React, { useMemo, useState, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Card, { CardHeader, CardBody } from '@/components/UI/Card';
import Button from '@/components/UI/Button';
import { mediaSosialService } from '@/services/mediaSosialService';
import { toast } from 'react-hot-toast';
import { getEnvironmentConfig } from '@/config/environment';

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
  const [form, setForm] = useState({ tanggal_laporan: defaultDate });
  const [editorHtml, setEditorHtml] = useState('');
  const [uploadedImages, setUploadedImages] = useState([]);
  const editorRef = useRef(null);

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
    // standardize strong to b
    out = out.replace(/<\/?strong>/gi, (m) => m.toLowerCase().includes('</') ? '</b>' : '<b>');
    // remove empty <b></b>
    out = out.replace(/<b>\s*<\/b>/gi, '');
    // collapse nested b until stable
    try {
      let prev;
      do {
        prev = out;
        out = out.replace(/<b>\s*<b>/gi, '<b>').replace(/<\/b>\s*<\/b>/gi, '</b>');
      } while (out !== prev);
    } catch {}
    // unwrap [IMG:id] inside bold
    out = out.replace(/<b>\s*(\[IMG:\d+\])\s*<\/b>/gi, '$1');
    // split bold across <br>
    out = out.replace(/<b>([\s\S]*?)<br\s*\/?>([\s\S]*?)<\/b>/gi, (m, a, b) => {
      const left = a.trim() ? `<b>${a}</b>` : '';
      const right = b.trim() ? `<b>${b}</b>` : '';
      return `${left}<br>${right}`;
    });
    // split bold around placeholders
    out = out.replace(/<b>([^]*?)\[IMG:(\d+)\]([^]*?)<\/b>/gi, (m, left, id, right) => {
      const L = left.trim() ? `<b>${left}</b>` : '';
      const R = right.trim() ? `<b>${right}</b>` : '';
      return `${L}[IMG:${id}]${R}`;
    });
    return out;
  };
  const escapeHtml = (str) => (str || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');

  const handleEditorChange = (e) => {
    setEditorHtml(e.target.innerHTML);
    // Micro sanitize dir/style only; avoid heavy ops to keep caret stable
    if (editorRef.current) {
      requestAnimationFrame(() => {
        try {
          const nodes = editorRef.current.querySelectorAll('[dir], [style]');
          nodes.forEach((n) => {
            if (n.hasAttribute('dir')) n.removeAttribute('dir');
            const style = n.getAttribute('style');
            if (style) {
              let cleaned = style
                .replace(/direction\s*:\s*(rtl|ltr)\s*;?/gi, '')
                .replace(/text-align\s*:\s*(right|left|center|justify)\s*;?/gi, '')
                .replace(/\s*;\s*$/, '');
              if (cleaned.trim().length === 0) n.removeAttribute('style');
              else n.setAttribute('style', cleaned);
            }
          });
        } catch {}
      });
    }
  };

  const handleEditorBlur = () => {
    if (!editorRef.current) return;
    let html = editorRef.current.innerHTML || '';
    html = removeZeroWidth(html);
    html = sanitizeToLTR(html);
    html = normalizeBoldHtml(html);
    editorRef.current.innerHTML = html;
    setEditorHtml(html);
  };

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

  const handlePaste = async (e) => {
    const items = e.clipboardData?.items || [];
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      if (item.type && item.type.indexOf('image') !== -1) {
        e.preventDefault();
        const file = item.getAsFile();
        if (!file) continue;
        if (file.size > 10 * 1024 * 1024) {
          toast.error('Gambar terlalu besar. Maksimal 10MB');
          continue;
        }
        try {
          const formData = new FormData();
          formData.append('images', file);
          const res = await fetch(`${env.API_BASE_URL}/upload/media-sosial`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` },
            body: formData,
          });
          const json = await res.json();
          if (!json.success) throw new Error(json.message || 'Upload gagal');
          const fileInfo = json.data[0];
          const displayUrl = normalizeImageUrl(fileInfo.url || fileInfo.path);
          const imgId = Date.now() + Math.floor(Math.random() * 1000);
          setUploadedImages(prev => [...prev, { id: imgId, url: displayUrl, serverPath: fileInfo.path || fileInfo.url }]);
          const imgTag = `<img src="${displayUrl}" data-image-id="${imgId}" style="max-width:100%;height:auto;margin:8px 0;border-radius:6px;" />`;
          const sel = window.getSelection();
          if (sel && sel.rangeCount > 0) {
            const range = sel.getRangeAt(0);
            range.deleteContents();
            const temp = document.createElement('div');
            temp.innerHTML = imgTag;
            const node = temp.firstChild;
            range.insertNode(node);
            range.setStartAfter(node);
            range.collapse(true);
            sel.removeAllRanges();
            sel.addRange(range);
            const target = e.target.closest('[contenteditable="true"]');
            if (target) {
              const event = new Event('input', { bubbles: true });
              target.dispatchEvent(event);
            }
          } else {
            setEditorHtml(prev => prev + imgTag);
          }
          toast.success('Gambar ditambahkan');
        } catch (err) {
          console.error(err);
          toast.error('Gagal upload gambar');
        }
      } else if (item.kind === 'string' && item.type === 'text/plain') {
        // Safe text paste: escape and convert newlines to <br>
        e.preventDefault();
        item.getAsString((text) => {
          const safe = escapeHtml(text).replace(/\r?\n/g, '<br>');
          const sel = window.getSelection();
          if (sel && sel.rangeCount > 0) {
            const range = sel.getRangeAt(0);
            range.deleteContents();
            const temp = document.createElement('div');
            temp.innerHTML = safe;
            const frag = document.createDocumentFragment();
            let n;
            while ((n = temp.firstChild)) frag.appendChild(n);
            range.insertNode(frag);
            range.collapse(false);
            if (editorRef.current) editorRef.current.dispatchEvent(new Event('input', { bubbles: true }));
          } else {
            setEditorHtml((prev) => prev + safe);
          }
        });
      }
    }
  };

  const getEditorContent = () => {
    if (!editorRef.current) return '';
    let html = editorRef.current.innerHTML || '';
    html = removeZeroWidth(html);
    // Convert images to placeholders
    html = html.replace(/<img[^>]*data-image-id="(\d+)"[^>]*>/g, (_m, id) => `[IMG:${id}]`);
    // Only allow basic tags: b i u br and placeholders/text
    // Replace disallowed tags but preserve line breaks
    html = html
      .replace(/<\/?(div|p)>/gi, '\n')
      .replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, '')
      .replace(/<\/?(span|font|h\d|blockquote|pre|code|table|thead|tbody|tr|td)[^>]*>/gi, '')
      .replace(/&nbsp;/g, ' ');
    // Normalize bold structure
    html = normalizeBoldHtml(html);
    // Collapse multiple newlines and convert to <br>
    html = html.replace(/\n+/g, '<br>');
    // Final trim
    html = html.trim();
    return html;
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!form.tanggal_laporan) {
      toast.error('Tanggal laporan wajib diisi');
      return;
    }
    try {
      setSaving(true);
      // Sanitize on submit
      if (editorRef.current) {
        let tmp = editorRef.current.innerHTML || '';
        tmp = removeZeroWidth(tmp);
        tmp = sanitizeToLTR(tmp);
        tmp = normalizeBoldHtml(tmp);
        editorRef.current.innerHTML = tmp;
        setEditorHtml(tmp);
      }
      const isi = getEditorContent();
      if (!isi || isi.replace(/<br>/g,'').trim().length < 5) {
        toast.error('Isi laporan terlalu pendek');
        setSaving(false);
        return;
      }
      await mediaSosialService.create({
        tanggal_laporan: form.tanggal_laporan,
        isi_laporan: isi,
        images: uploadedImages,
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
      {/* Header merah full-width ala Omset Harian */}
      <div className="bg-red-800 text-white px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/admin/marketing/medsos')}
              className="px-3 py-2 rounded-lg border border-white/60 hover:bg-white/10"
              title="Kembali"
            >
              {/* Icon bisa ditambahkan jika dibutuhkan */}
              <span className="font-semibold">Kembali</span>
            </button>
            <div>
              <h1 className="text-xl md:text-2xl font-extrabold tracking-tight">TAMBAH LAPORAN MEDSOS</h1>
              <p className="text-sm text-red-100">Tambah data laporan media sosial baru</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              form="medsos-form"
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-2 px-4 py-2 bg-white text-red-700 rounded-lg hover:bg-red-50 transition-colors shadow-sm disabled:opacity-60"
            >
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

          {/* Isi Laporan Editor */}
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
              {/* Toolbar sederhana */}
              <div className="flex flex-wrap items-center gap-2 p-2 rounded-md bg-gray-50 border border-gray-200">
                <button type="button" onMouseDown={applyFormat('bold')} className="px-2 py-1 text-sm rounded font-semibold hover:bg-gray-100">B</button>
                <button type="button" onMouseDown={applyFormat('italic')} className="px-2 py-1 text-sm rounded italic hover:bg-gray-100">I</button>
                <button type="button" onMouseDown={applyFormat('underline')} className="px-2 py-1 text-sm rounded underline hover:bg-gray-100">U</button>
              </div>
              <div
                ref={editorRef}
                contentEditable
                data-placeholder="Masukkan isi laporan medsos... Anda bisa paste gambar langsung dari clipboard (Ctrl+V)"
                onInput={handleEditorChange}
                onBlur={handleEditorBlur}
                onPaste={handlePaste}
                className="min-h-[300px] p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none text-left"
                style={{ whiteSpace: 'pre-wrap' }}
              />
              <p className="text-sm text-gray-500">💡 Tips: Anda bisa paste gambar langsung dari clipboard (Ctrl+V)</p>
            </div>
          </div>

          {/* Tombol Submit bawah (opsional) */}
          <div className="flex space-x-4 p-6">
            <button
              type="button"
              onClick={() => navigate('/admin/marketing/medsos')}
              className="px-6 py-3 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex items-center space-x-2 px-6 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span>{saving ? 'Menyimpan...' : 'Simpan'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminMedsosForm;
