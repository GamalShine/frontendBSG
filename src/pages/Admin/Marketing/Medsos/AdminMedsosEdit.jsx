import React, { useEffect, useState, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Card, { CardHeader, CardBody } from '@/components/UI/Card';
import Button from '@/components/UI/Button';
import { mediaSosialService } from '@/services/mediaSosialService';
import { toast } from 'react-hot-toast';
import { getEnvironmentConfig } from '@/config/environment';

const AdminMedsosEdit = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const env = getEnvironmentConfig();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [form, setForm] = useState({ tanggal_laporan: '' });
  const [existingImages, setExistingImages] = useState([]);
  const [uploadedImages, setUploadedImages] = useState([]);
  const editorRef = useRef(null);
  const editorHtmlRef = useRef('');

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
    out = out.replace(/<\/?strong>/gi, (m) => m.toLowerCase().includes('</') ? '</b>' : '<b>');
    out = out.replace(/<b>\s*<\/b>/gi, '');
    try {
      let prev;
      do {
        prev = out;
        out = out.replace(/<b>\s*<b>/gi, '<b>').replace(/<\/b>\s*<\/b>/gi, '</b>');
      } while (out !== prev);
    } catch {}
    out = out.replace(/<b>\s*(\[IMG:\d+\])\s*<\/b>/gi, '$1');
    out = out.replace(/<b>([\s\S]*?)<br\s*\/?>([\s\S]*?)<\/b>/gi, (m, a, b) => {
      const left = a.trim() ? `<b>${a}</b>` : '';
      const right = b.trim() ? `<b>${b}</b>` : '';
      return `${left}<br>${right}`;
    });
    out = out.replace(/<b>([^]*?)\[IMG:(\d+)\]([^]*?)<\/b>/gi, (m, left, id, right) => {
      const L = left.trim() ? `<b>${left}</b>` : '';
      const R = right.trim() ? `<b>${right}</b>` : '';
      return `${L}[IMG:${id}]${R}`;
    });
    return out;
  };
  const escapeHtml = (str) => (str || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');

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
          setExistingImages(normalizedImgs);
          const html = (data.isi_laporan || '')
            .replace(/\[IMG:(\d+)\]/g, (_m, pid) => {
              const found = normalizedImgs.find(im => String(im.id) === String(pid));
              if (!found) return '';
              const src = found.url || found.uri || found.displayUri || found.fallbackUri || '';
              return `<img src="${src}" data-image-id="${pid}" style="max-width:100%;height:auto;margin:8px 0;border-radius:6px;" />`;
            })
            .replace(/\n/g, '<br/>');
          editorHtmlRef.current = html;
          // Initialize editor content without rerender
          setTimeout(() => {
            if (editorRef.current) {
              editorRef.current.innerHTML = html;
            }
          }, 0);
        }
      } catch (e) {
        setError('Gagal memuat data');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  const handleEditorChange = (e) => {
    const el = e.target;
    editorHtmlRef.current = el.innerHTML;
    // micro sanitize dir/style
    requestAnimationFrame(() => {
      try {
        const nodes = el.querySelectorAll('[dir], [style]');
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
  };

  const handlePaste = async (e) => {
    const items = e.clipboardData?.items || [];
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      if (item.type && item.type.indexOf('image') !== -1) {
        e.preventDefault();
        const file = item.getAsFile();
        if (!file) continue;
        if (file.size > 10 * 1024 * 1024) { toast.error('Gambar terlalu besar. Maksimal 10MB'); continue; }
        try {
          const fd = new FormData();
          fd.append('images', file);
          const res = await fetch(`${env.API_BASE_URL}/upload/media-sosial`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` },
            body: fd,
          });
          const json = await res.json();
          if (!json.success) throw new Error(json.message || 'Upload gagal');
          const fileInfo = json.data[0];
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
            if (target) target.dispatchEvent(new Event('input', { bubbles: true }));
          } else if (editorRef.current) {
            editorRef.current.insertAdjacentHTML('beforeend', imgTag);
            editorHtmlRef.current = editorRef.current.innerHTML;
          }
          toast.success('Gambar ditambahkan');
        } catch (err) {
          console.error(err);
          toast.error('Gagal upload gambar');
        }
      }
      else if (item.kind === 'string' && item.type === 'text/plain') {
        // safe text paste
        e.preventDefault();
        item.getAsString((text) => {
          const safe = escapeHtml(text).replace(/\r?\n/g, '<br>');
          const sel = window.getSelection();
          const container = editorRef.current || document.querySelector('[contenteditable][data-medsos-editor]') || null;
          if (sel && sel.rangeCount > 0) {
            const range = sel.getRangeAt(0);
            range.deleteContents();
            const temp = document.createElement('div');
            temp.innerHTML = safe;
            const frag = document.createDocumentFragment();
            let n; while ((n = temp.firstChild)) frag.appendChild(n);
            range.insertNode(frag);
            range.collapse(false);
            (container || document).dispatchEvent(new Event('input', { bubbles: true }));
          } else if (container) {
            container.insertAdjacentHTML('beforeend', safe);
            editorHtmlRef.current = container.innerHTML;
          }
        });
      }
    }
  };

  const handleEditorBlur = (e) => {
    const el = e?.target || editorRef.current;
    if (!el) return;
    let html = el.innerHTML || '';
    html = removeZeroWidth(html);
    html = sanitizeToLTR(html);
    html = normalizeBoldHtml(html);
    el.innerHTML = html;
    editorHtmlRef.current = html;
  };

  const getEditorContent = () => {
    const container = editorRef.current;
    let html = container ? container.innerHTML : editorHtmlRef.current || '';
    html = removeZeroWidth(html);
    // images to placeholders
    html = html.replace(/<img[^>]*data-image-id="(\d+)"[^>]*>/g, (_m, id) => `[IMG:${id}]`);
    // strip disallowed while preserving lines
    html = html
      .replace(/<\/?(div|p)>/gi, '\n')
      .replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, '')
      .replace(/<\/?(span|font|h\d|blockquote|pre|code|table|thead|tbody|tr|td)[^>]*>/gi, '')
      .replace(/&nbsp;/g, ' ');
    html = normalizeBoldHtml(html);
    html = html.replace(/\n+/g, '<br>');
    return html.trim();
  };

  const getProcessedContent = () => {
    let content = editorHtml || '';
    if (!content) return '';
    content = content.replace(/<img[^>]*data-image-id="(\d+)"[^>]*>/g, (_m, id) => `[IMG:${id}]`)
      .replace(/<br\s*\/?>/gi, '\n')
      .replace(/<div[^>]*>/gi, '\n')
      .replace(/<\/div>/gi, '')
      .replace(/<[^>]*>/g, '')
      .replace(/&nbsp;/g, ' ')
      .trim();
    return content;
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      if (!form.tanggal_laporan) { toast.error('Tanggal laporan wajib diisi'); setSaving(false); return; }
      // sanitize before serialize
      if (editorRef.current) {
        let tmp = editorRef.current.innerHTML || '';
        tmp = removeZeroWidth(tmp);
        tmp = sanitizeToLTR(tmp);
        tmp = normalizeBoldHtml(tmp);
        editorRef.current.innerHTML = tmp;
        editorHtmlRef.current = tmp;
      }
      const isi = getEditorContent();
      if (!isi || isi.replace(/<br>/g,'').trim().length < 5) { toast.error('Isi laporan terlalu pendek'); setSaving(false); return; }
      const merged = [...existingImages];
      uploadedImages.forEach(img => { if (!merged.find(x => String(x.id) === String(img.id))) merged.push(img); });
      await mediaSosialService.update(id, { tanggal_laporan: form.tanggal_laporan, isi_laporan: isi, images: merged });
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
      <div className="bg-red-800 text-white p-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Edit Laporan Media Sosial (Admin)</h1>
            <p className="text-sm opacity-90">Marketing - Medsos</p>
          </div>
          <Button onClick={() => navigate(-1)} className="bg-white text-red-700 hover:bg-gray-100">Kembali</Button>
        </div>
      </div>

      <div className="w-full px-4 md:px-6 mt-4">
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold">Form Edit</h2>
                {error && <div className="text-sm text-red-600 mt-1">{error}</div>}
              </div>
            </div>
          </CardHeader>
          <CardBody>
            {loading ? (
              <div className="text-sm text-gray-600">Memuat data...</div>
            ) : (
              <form onSubmit={onSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-700 mb-1">Tanggal Laporan</label>
                  <input type="date" className="w-full border rounded px-3 py-2" value={form.tanggal_laporan} onChange={(e) => setForm(prev => ({ ...prev, tanggal_laporan: e.target.value }))} required />
                </div>
                <div>
                  <label className="block text-sm text-gray-700 mb-1">Isi Laporan (bisa paste gambar)</label>
                  <div
                    ref={editorRef}
                    contentEditable
                    data-medsos-editor
                    onInput={handleEditorChange}
                    onBlur={handleEditorBlur}
                    onPaste={handlePaste}
                    className="w-full border rounded px-3 py-2 min-h-56 bg-white focus:outline-none text-left"
                    style={{ whiteSpace: 'pre-wrap' }}
                  />
                </div>
                <div className="flex items-center justify-end gap-2">
                  <Button type="button" onClick={() => navigate(-1)} className="bg-gray-100 text-gray-700 hover:bg-gray-200">Batal</Button>
                  <Button type="submit" disabled={saving} className="bg-red-700 text-white hover:bg-red-800">{saving ? 'Menyimpan...' : 'Simpan'}</Button>
                </div>
              </form>
            )}
          </CardBody>
        </Card>
      </div>
    </div>
  );
};

export default AdminMedsosEdit;
