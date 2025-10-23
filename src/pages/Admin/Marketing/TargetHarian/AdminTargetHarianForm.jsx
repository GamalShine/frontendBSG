import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { getEnvironmentConfig } from '@/config/environment';
import { targetHarianService } from '../../../../services/targetHarianService';
import { Save, ArrowLeft } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

const AdminTargetHarianForm = () => {
  const navigate = useNavigate();
  const env = getEnvironmentConfig();
  const { user } = useAuth();

  const [form, setForm] = useState({
    tanggal_target: new Date().toISOString().split('T')[0],
    isi_target: '',
    images: []
  });
  const [submitting, setSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [selectedImages, setSelectedImages] = useState([]);
  const [imagePreviewUrls, setImagePreviewUrls] = useState([]);
  const [usedInEditor, setUsedInEditor] = useState(new Set());

  const editorRef = React.useRef(null);
  const savedRangeRef = React.useRef(null);
  const [isBold, setIsBold] = useState(false);
  const [isItalic, setIsItalic] = useState(false);
  const [isUnderline, setIsUnderline] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  // Helpers: remove zero-width, unbold-safe, normalize strong
  const removeZeroWidth = (html) => (html || '').replace(/[\u200B-\u200D\uFEFF]/g, '');
  const normalizeBoldHtml = (html) => {
    if (!html) return html;
    let out = html;
    // standardize <b> -> <strong>
    out = out.replace(/<\s*b\s*>/gi, '<strong>').replace(/<\s*\/\s*b\s*>/gi, '</strong>');
    // remove empty and <strong><br></strong>
    out = out.replace(/<strong>\s*(?:<br\s*\/?\s*>)+\s*<\/strong>/gi, '<br>');
    out = out.replace(/<strong>\s*<\/strong>/gi, '');
    // collapse nested
    try { let prev; do { prev = out; out = out.replace(/<strong>\s*<strong>/gi, '<strong>').replace(/<\/strong>\s*<\/strong>/gi, '</strong>'); } while (out !== prev); } catch {}
    // unwrap placeholder-only
    out = out.replace(/<strong>\s*(\[IMG:\d+\])\s*<\/strong>/gi, '$1');
    // split across <br>
    out = out.replace(/<strong>([\s\S]*?)<br\s*\/?>([\s\S]*?)<\/strong>/gi, (m,a,b) => {
      const L = a.trim() ? `<strong>${a}</strong>` : '';
      const R = b.trim() ? `<strong>${b}</strong>` : '';
      return `${L}<br>${R}`;
    });
    // split around [IMG:id]
    out = out.replace(/<strong>([^]*?)\[IMG:(\d+)\]([^]*?)<\/strong>/gi, (m,left,id,right) => {
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
    out = out.replace(/<span[^>]*style="[^"]*font-weight\s*:\s*normal[^"]*"[^>]*>([\s\S]*?)<\/span>/gi, (_m, inner) => `</strong>${inner}<strong>`);
    return fixStrayStrong(out);
  };

  const onSelectFiles = (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    const newSelected = [];
    const newPreviews = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const imageId = Date.now() + Math.floor(Math.random() * 1000);
      newSelected.push({ file, id: imageId });
      const reader = new FileReader();
      reader.onload = (ev) => {
        newPreviews.push(ev.target.result);
        if (newPreviews.length === newSelected.length) {
          setSelectedImages(prev => [...prev, ...newSelected]);
          setImagePreviewUrls(prev => [...prev, ...newPreviews]);
          toast.success('Gambar berhasil ditambahkan');
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const saveSelection = () => {
    const sel = window.getSelection();
    if (sel && sel.rangeCount > 0) savedRangeRef.current = sel.getRangeAt(0).cloneRange();
  };
  const restoreSelection = () => {
    const range = savedRangeRef.current;
    if (!range) return;
    const sel = window.getSelection();
    sel.removeAllRanges();
    sel.addRange(range);
  };
  const exec = (command) => {
    if (!editorRef.current) return;
    if (savedRangeRef.current) restoreSelection();
    editorRef.current.focus();
    document.execCommand(command, false, null);
    saveSelection();
    try {
      setIsBold(document.queryCommandState('bold'));
      setIsItalic(document.queryCommandState('italic'));
      setIsUnderline(document.queryCommandState('underline'));
    } catch (_) {}
  };
  const handleEditorInteraction = () => {
    saveSelection();
    try {
      setIsBold(document.queryCommandState('bold'));
      setIsItalic(document.queryCommandState('italic'));
      setIsUnderline(document.queryCommandState('underline'));
    } catch (_) {}
  };

  useEffect(() => {
    const onSel = () => {
      try {
        setIsBold(document.queryCommandState('bold'));
        setIsItalic(document.queryCommandState('italic'));
        setIsUnderline(document.queryCommandState('underline'));
      } catch (_) {}
    };
    document.addEventListener('selectionchange', onSel);
    return () => document.removeEventListener('selectionchange', onSel);
  }, []);

  const handleEditorChange = (e) => {
    const content = e.target.innerHTML;
    setForm(prev => ({ ...prev, isi_target: content }));
  };

  // Paste image support ala AdminLaporanKeuanganForm
  const handleEditorPaste = async (e) => {
    const items = e.clipboardData?.items || [];
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      if (item.type && item.type.indexOf('image') !== -1) {
        e.preventDefault();
        const file = item.getAsFile();
        if (!file) continue;
        const imageId = Date.now() + Math.floor(Math.random() * 1000);
        const imageWithId = { file, id: imageId };
        setSelectedImages(prev => [...prev, imageWithId]);

        const reader = new FileReader();
        reader.onload = (ev) => {
          const imageUrl = ev.target.result;
          setImagePreviewUrls(prev => [...prev, imageUrl]);

          // Sisipkan gambar ke posisi kursor
          const img = document.createElement('img');
          img.src = imageUrl;
          img.alt = 'Pasted image';
          img.className = 'pasted-image';
          img.setAttribute('data-image-id', imageId);

          const selection = window.getSelection();
          if (selection && selection.rangeCount > 0) {
            const range = selection.getRangeAt(0);
            range.deleteContents();
            range.insertNode(img);
            range.collapse(false);
            const br = document.createElement('br');
            range.insertNode(br);
            range.collapse(false);
          } else if (editorRef.current) {
            editorRef.current.appendChild(img);
          }

          // Trigger change agar form.isi_target terupdate
          const event = new Event('input', { bubbles: true });
          editorRef.current?.dispatchEvent(event);
          toast.success('Gambar berhasil ditambahkan');
        };
        reader.readAsDataURL(file);
      }
    }
  };

  const getEditorContent = () => {
    if (!editorRef.current) return '';
    let content = editorRef.current.innerHTML || '';
    if (!content.trim()) return '';
    const existingImgRegex = /<img[^>]*data-image-id="(\d+)"[^>]*>/g;
    content = content.replace(existingImgRegex, (match, imageId) => `[IMG:${imageId}]`);
    content = content
      .replace(/<br\s*\/?>(?=\n?)/gi, '\n')
      .replace(/<div[^>]*>/gi, '\n')
      .replace(/<\/div>/gi, '')
      .replace(/<[^>]*>/g, '')
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .trim();
    return content;
  };

  const uploadImages = async (images) => {
    const list = images || selectedImages;
    if (!list.length) return [];
    setUploading(true);
    try {
      const fd = new FormData();
      list.forEach(img => fd.append('images', img.file));
      const res = await fetch(`${env.API_BASE_URL}/upload/target`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` },
        body: fd
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      if (!json.success) throw new Error(json.message || 'Upload gagal');
      const uploaded = json.data || [];
      return list.map((img, idx) => {
        const server = uploaded[idx];
        if (server) {
          return {
            uri: `file://temp/${img.id}.jpg`,
            id: img.id,
            name: server.filename || `target_${img.id}.jpg`,
            url: `${env.BASE_URL.replace('/api','')}${server.url}`,
            serverPath: server.url
          };
        }
        return {
          uri: `file://temp/${img.id}.jpg`,
          id: img.id,
          name: `target_${img.id}.jpg`,
          url: `${env.BASE_URL.replace('/api','')}/uploads/target/temp_${img.id}.jpg`,
          serverPath: `uploads/target/temp_${img.id}.jpg`
        };
      });
    } catch (err) {
      toast.error(`Upload gambar gagal: ${err.message}`);
      return [];
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.tanggal_target) return toast.error('Tanggal target wajib diisi');
    // sanitize editor before serialize
    if (editorRef.current) {
      let tmp = removeZeroWidth(editorRef.current.innerHTML || '');
      tmp = unboldSafe(tmp);
      tmp = normalizeBoldHtml(tmp);
      tmp = fixStrayStrong(tmp);
      editorRef.current.innerHTML = tmp;
    }
    const editorContent = getEditorContent();
    if (!editorContent || editorContent.trim().length < 10) return toast.error('Isi target minimal 10 karakter');
    setSubmitting(true);
    try {
      const uploadedImages = await uploadImages(selectedImages);
      const finalImages = (uploadedImages || []).map(img => img?.url?.startsWith('http://http://') ? { ...img, url: img.url.replace('http://http://', 'http://') } : img);
      const payload = { tanggal_target: form.tanggal_target, isi_target: editorContent, images: finalImages, id_user: user?.id };
      const res = await targetHarianService.create(payload);
      if (res?.success) {
        toast.success('Data target berhasil ditambahkan');
        navigate('/admin/marketing/data-target');
      } else {
        throw new Error(res?.error || 'Gagal menambahkan data');
      }
    } catch (err) {
      toast.error(err.message || 'Gagal menyimpan');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="px-0 py-2 bg-gray-50 min-h-screen">
      {/* Header merah ala referensi */}
      <div className="bg-red-800 text-white p-4 mb-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button type="button" onClick={() => navigate('/admin/marketing/data-target')} aria-label="Kembali" className="inline-flex items-center bg-white/0 text-white hover:text-gray-100">
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div>
              <h1 className="text-2xl font-bold">Tambah Data Target</h1>
              <p className="text-sm opacity-90">Admin - Marketing</p>
            </div>
          </div>
          <button type="submit" form="form-data-target" className="bg-white border-red-600 text-red-700 hover:bg-red-50 inline-flex items-center gap-2 px-3 py-2 disabled:opacity-50" disabled={submitting || uploading}>
            <Save className="h-4 w-4" />
            <span>{submitting ? 'Menyimpan...' : 'Simpan'}</span>
          </button>
        </div>
      </div>
      <div className="bg-gray-200 px-4 py-2 text-xs text-gray-600 -mt-1 mb-4">Mode Tambah</div>

      {/* Grid dua kolom: form utama + sidebar gambar */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Kolom kiri (2/3) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white shadow-sm border">
            <div className="p-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Informasi Target</h2>
            </div>
            <form id="form-data-target" onSubmit={handleSubmit} className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Tanggal Target *</label>
                <input type="date" name="tanggal_target" value={form.tanggal_target} onChange={handleChange} required className="w-full pl-3 pr-3 py-2 border border-gray-300 focus:ring-2 focus:ring-red-500 focus:border-transparent" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Isi Target *</label>
                {/* Toolbar */}
                <div className="flex flex-wrap items-center gap-2 p-2 rounded-md bg-gray-50 border border-gray-200 mb-3">
                  <button type="button" onClick={() => { exec('bold'); }} className={`px-2 py-1 text-sm rounded font-semibold hover:bg-gray-100 ${isBold ? 'bg-gray-200 ring-1 ring-gray-300' : ''}`} aria-pressed={isBold} title="Bold">B</button>
                  <button type="button" onClick={() => { exec('italic'); }} className={`px-2 py-1 text-sm rounded italic hover:bg-gray-100 ${isItalic ? 'bg-gray-200 ring-1 ring-gray-300' : ''}`} aria-pressed={isItalic} title="Italic">I</button>
                  <button type="button" onClick={() => { exec('underline'); }} className={`px-2 py-1 text-sm rounded underline hover:bg-gray-100 ${isUnderline ? 'bg-gray-200 ring-1 ring-gray-300' : ''}`} aria-pressed={isUnderline} title="Underline">U</button>
                </div>
                <div
                  ref={editorRef}
                  contentEditable
                  onInput={handleEditorChange}
                  onBlur={() => {
                    if (!editorRef.current) return;
                    let html = editorRef.current.innerHTML || '';
                    html = removeZeroWidth(html);
                    html = unboldSafe(html);
                    html = normalizeBoldHtml(html);
                    html = fixStrayStrong(html);
                    editorRef.current.innerHTML = html;
                  }}
                  onMouseUp={handleEditorInteraction}
                  onKeyUp={handleEditorInteraction}
                  onFocus={handleEditorInteraction}
                  onPaste={handleEditorPaste}
                  data-placeholder="Tulis data target di sini... (Anda bisa paste gambar langsung dari clipboard)"
                  className="w-full min-h-[400px] p-4 border border-gray-300 focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none"
                  suppressContentEditableWarning
                />
                <p className="text-xs text-gray-500 mt-1">Anda bisa paste gambar atau unggah dari file di panel kanan.</p>
              </div>
            </form>
          </div>
        </div>

        {/* Sidebar kanan (1/3) */}
        <div className="space-y-4">
          <div className="bg-white border">
            <div className="p-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Gambar</h2>
            </div>
            <div className="p-4 space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Upload Gambar Baru</label>
                <div className="border-2 border-dashed border-gray-300 p-4 text-center">
                  <input type="file" multiple accept="image/*" onChange={onSelectFiles} className="hidden" id="image-upload-target" />
                  <label htmlFor="image-upload-target" className="cursor-pointer inline-flex items-center space-x-2 text-gray-600 hover:text-gray-900">
                    <span>Pilih Gambar</span>
                  </label>
                  <p className="text-sm text-gray-500 mt-2">Format file bebas sesuai kebutuhan</p>
                </div>
              </div>
              {(selectedImages.length > 0) && (
                <p className="text-xs text-gray-500">{selectedImages.length} file akan diupload saat simpan.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminTargetHarianForm;
