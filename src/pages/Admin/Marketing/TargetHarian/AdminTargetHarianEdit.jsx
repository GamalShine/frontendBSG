import React, { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { getEnvironmentConfig } from '@/config/environment';
import { targetHarianService } from '../../../../services/targetHarianService';
import { ArrowLeft, Save } from 'lucide-react';
import { MENU_CODES } from '@/config/menuCodes';

const AdminTargetHarianEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const env = getEnvironmentConfig();

  const [form, setForm] = useState({ tanggal_target: '', isi_target: '', images: [] });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [selectedImages, setSelectedImages] = useState([]);
  const [imagePreviewUrls, setImagePreviewUrls] = useState([]);
  const editorRef = useRef(null);
  const savedRangeRef = useRef(null);
  const [isBold, setIsBold] = useState(false);
  const [isItalic, setIsItalic] = useState(false);
  const [isUnderline, setIsUnderline] = useState(false);
  const [hasInitializedContent, setHasInitializedContent] = useState(false);

  const load = async () => {
    try {
      setLoading(true);
      const res = await targetHarianService.getById(id);
      if (!res?.success) throw new Error(res?.error || 'Gagal memuat data');
      const d = res.data;
      let imgs = [];
      try { imgs = d.images ? JSON.parse(d.images) : []; } catch (_) { imgs = []; }
      setForm({
        tanggal_target: d.tanggal_target ? new Date(d.tanggal_target).toISOString().split('T')[0] : '',
        isi_target: d.isi_target || '',
        images: imgs || []
      });
    } catch (err) {
      toast.error(err.message || 'Gagal memuat data');
      navigate('/admin/marketing/data-target');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); /* eslint-disable-next-line */ }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const onSelectFiles = (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    const newSelected = [];
    const newPreviews = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (file.size > 10 * 1024 * 1024) { toast.error('Gambar terlalu besar. Maksimal 10MB'); continue; }
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

  const uploadImages = async () => {
    if (!selectedImages.length) return [];
    try {
      const fd = new FormData();
      selectedImages.forEach(img => fd.append('images', img.file));
      const res = await fetch(`${env.API_BASE_URL}/upload/target`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` },
        body: fd
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      if (!json.success) throw new Error(json.message || 'Upload gagal');
      const uploaded = json.data || [];
      return selectedImages.map((img, idx) => {
        const u = uploaded[idx];
        if (u) {
          return {
            uri: `file://temp/${img.id}.jpg`,
            id: img.id,
            name: u.filename || `target_${img.id}.jpg`,
            url: `${env.BASE_URL.replace('/api','')}${u.url}`,
            serverPath: u.url
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
    }
  };

  const handleEditorChange = (e) => {
    const content = e.target.innerHTML;
    setForm(prev => ({ ...prev, isi_target: content }));
  };

  // Helper konstruksi URL gambar dari serverPath/url (hindari double protocol)
  const aggressivelyCleanUrl = (url) => {
    if (!url) return '';
    let cleaned = url.trim();
    cleaned = cleaned.replace(/^https?:\/\/https?:\/+/, (m) => m.replace('http://http://', 'http://').replace('https://https://', 'https://'));
    cleaned = cleaned.replace(/([^:])\/+\/+/, '$1/');
    return cleaned;
  };
  const constructImageUrl = (imageUrl) => {
    if (!imageUrl) return '';
    if (imageUrl.startsWith('file://')) return imageUrl;
    if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) return aggressivelyCleanUrl(imageUrl);
    const baseUrl = env.API_BASE_URL.replace('/api', '');
    const pathPart = imageUrl.startsWith('/') ? imageUrl : `/${imageUrl}`;
    return aggressivelyCleanUrl(`${baseUrl}${pathPart}`);
  };

  // Inisialisasi editor: ganti [IMG:id] -> <img src=... data-image-id=id>
  useEffect(() => {
    if (!editorRef.current) return;
    if (hasInitializedContent) return;
    // pastikan form sudah terisi dari load()
    if (!form || typeof form.isi_target !== 'string') return;
    const images = Array.isArray(form.images) ? form.images : [];
    let content = form.isi_target || '';
    if (!content) return;
    try {
      // siapkan mapping id -> url
      const byId = new Map();
      const normalizedList = [];
      images.forEach((img) => {
        const urlCandidate = img?.url || (img?.serverPath ? (img.serverPath.startsWith('/') ? img.serverPath : `/${img.serverPath}`) : '');
        if (typeof img?.id === 'number' || typeof img?.id === 'string') {
          const finalUrl = constructImageUrl(urlCandidate);
          byId.set(Number(img.id), finalUrl);
          normalizedList.push({ id: Number(img.id), url: finalUrl });
        }
      });
      // ganti placeholder menjadi tag image
      const placeholderRegex = /\[IMG:(\d+)\]/g;
      content = content.replace(placeholderRegex, (match, idStr) => {
        const imgId = Number(idStr);
        const src = byId.get(imgId);
        if (!src) return match; // biarkan placeholder jika tidak ada gambar
        return `<img src="${src}" data-image-id="${imgId}" alt="Gambar ${imgId}" />`;
      });

      // ganti URL gambar mentah menjadi <img> agar tampil sebagai foto asli (bukan link)
      const urlImgRegex = /(https?:[^\s]+\.(?:jpg|jpeg|png|gif|webp))(?![^<]*>)/gi;
      content = content.replace(urlImgRegex, (m) => `<img src="${aggressivelyCleanUrl(m)}" alt="Gambar" />`);
      editorRef.current.innerHTML = content;

      // Setelah set HTML, coba set data-image-id untuk <img> yang cocok URL-nya dengan daftar gambar existing
      try {
        const nodeImgs = editorRef.current.querySelectorAll('img');
        nodeImgs.forEach((node) => {
          if (node.getAttribute('data-image-id')) return;
          const src = aggressivelyCleanUrl(node.getAttribute('src') || '');
          const found = normalizedList.find((x) => aggressivelyCleanUrl(x.url) === src);
          if (found) node.setAttribute('data-image-id', String(found.id));
        });
      } catch (_) {}

      setHasInitializedContent(true);
      // sync state isi_target agar konsisten
      setForm(prev => ({ ...prev, isi_target: content }));
    } catch (_) {}
  }, [form.isi_target, form.images, hasInitializedContent]);
  const handleEditorPaste = async (e) => {
    const items = e.clipboardData?.items || [];
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      if (item.type && item.type.indexOf('image') !== -1) {
        e.preventDefault();
        const file = item.getAsFile();
        if (!file) continue;
        if (file.size > 10 * 1024 * 1024) { toast.error('Gambar terlalu besar. Maksimal 10MB'); continue; }
        if (selectedImages.length >= 5) { toast.error('Maksimal 5 gambar'); continue; }
        const imageId = Date.now() + Math.floor(Math.random() * 1000);
        const imageWithId = { file, id: imageId };
        setSelectedImages(prev => [...prev, imageWithId]);
        const reader = new FileReader();
        reader.onload = (ev) => {
          const imageUrl = ev.target.result;
          setImagePreviewUrls(prev => [...prev, imageUrl]);
          const img = document.createElement('img');
          img.src = imageUrl;
          img.alt = 'Pasted image';
          img.setAttribute('data-image-id', imageId);
          img.className = 'pasted-image';
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
          const event = new Event('input', { bubbles: true });
          editorRef.current?.dispatchEvent(event);
          toast.success('Gambar berhasil ditambahkan');
        };
        reader.readAsDataURL(file);
      }
    }
  };

  // Convert editor HTML to plain text with placeholders
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.tanggal_target) return toast.error('Tanggal target wajib diisi');
    const editorContent = getEditorContent();
    if (!editorContent || editorContent.trim().length < 10) return toast.error('Isi target minimal 10 karakter');
    setSubmitting(true);
    try {
      // upload gambar baru bila ada
      const uploaded = await uploadImages();
      // Gabung gambar lama + baru
      const images = [...(Array.isArray(form.images) ? form.images : []), ...uploaded];
      const payload = { tanggal_target: form.tanggal_target, isi_target: editorContent, images };
      const res = await targetHarianService.update(id, payload);
      if (!res?.success) throw new Error(res?.error || 'Gagal memperbarui');
      toast.success('Target harian berhasil diperbarui');
      navigate(`/admin/marketing/data-target/${id}`);
    } catch (err) {
      toast.error(err.message || 'Gagal menyimpan');
    } finally {
      setSubmitting(false);
    }
  };

  // Filter gambar invalid agar preview tidak memicu request 404
  const safeImages = (Array.isArray(form.images) ? form.images : []).filter((img) => {
    const u = img?.url || img?.serverPath
    return Boolean(u && typeof u === 'string' && !u.includes(':id'))
  })

  if (loading) return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="p-8 text-center text-gray-500">Memuat...</div>
      </div>
    </div>
  );

  return (
    <div className="px-0 py-2 bg-gray-50 min-h-screen">
      {/* Header ala referensi */}
      <div className="bg-red-800 text-white p-4 mb-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate('/admin/marketing/data-target')} aria-label="Kembali" className="inline-flex items-center bg-white/0 text-white hover:text-gray-100">
              <ArrowLeft className="h-5 w-5" />
            </button>
            <span className="text-sm font-semibold bg-white/10 rounded px-2 py-1">{MENU_CODES.marketing.dataTarget}</span>
            <div>
              <h1 className="text-2xl font-bold">Edit Data Target</h1>
              <p className="text-sm opacity-90">Admin - Marketing</p>
            </div>
          </div>
          <button type="submit" form="form-admin-target-edit" className="bg-white border-red-600 text-red-700 hover:bg-red-50 inline-flex items-center gap-2 px-3 py-2 disabled:opacity-50" disabled={submitting}>
            <Save className="h-4 w-4" />
            <span>{submitting ? 'Menyimpan...' : 'Simpan'}</span>
          </button>
        </div>
      </div>
      <div className="bg-gray-200 px-4 py-2 text-xs text-gray-600 -mt-1 mb-4">Mode Edit</div>

      {/* Grid dua kolom */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Kolom kiri */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white shadow-sm border">
            <div className="p-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Informasi Target</h2>
            </div>
            <form id="form-admin-target-edit" onSubmit={handleSubmit} className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Tanggal Target *</label>
                <input type="date" name="tanggal_target" value={form.tanggal_target} onChange={handleChange} required className="w-full pl-3 pr-3 py-2 border border-gray-300 focus:ring-2 focus:ring-red-500 focus:border-transparent" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Isi Target *</label>
                <div className="flex flex-wrap items-center gap-2 p-2 rounded-md bg-gray-50 border border-gray-200 mb-3">
                  <button type="button" onClick={() => exec('bold')} className={`px-2 py-1 text-sm rounded font-semibold hover:bg-gray-100 ${isBold ? 'bg-gray-200 ring-1 ring-gray-300' : ''}`}>B</button>
                  <button type="button" onClick={() => exec('italic')} className={`px-2 py-1 text-sm rounded italic hover:bg-gray-100 ${isItalic ? 'bg-gray-200 ring-1 ring-gray-300' : ''}`}>I</button>
                  <button type="button" onClick={() => exec('underline')} className={`px-2 py-1 text-sm rounded underline hover:bg-gray-100 ${isUnderline ? 'bg-gray-200 ring-1 ring-gray-300' : ''}`}>U</button>
                </div>
                <div
                  ref={editorRef}
                  contentEditable
                  onInput={handleEditorChange}
                  onMouseUp={handleEditorInteraction}
                  onKeyUp={handleEditorInteraction}
                  onFocus={handleEditorInteraction}
                  onPaste={handleEditorPaste}
                  data-placeholder="Edit data target di sini... (bisa paste gambar)"
                  className="w-full min-h-[400px] p-4 border border-gray-300 focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none"
                  suppressContentEditableWarning
                ></div>
              </div>
            </form>
          </div>
        </div>
        {/* Sidebar kanan */}
        <div className="space-y-4">
          <div className="bg-white border">
            <div className="p-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Gambar</h2>
            </div>
            <div className="p-4 space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Upload Gambar Baru</label>
                <div className="border-2 border-dashed border-gray-300 p-4 text-center">
                  <input type="file" multiple accept="image/*" onChange={onSelectFiles} className="hidden" id="image-upload-target-edit" />
                  <label htmlFor="image-upload-target-edit" className="cursor-pointer inline-flex items-center space-x-2 text-gray-600 hover:text-gray-900">
                    <span>Pilih Gambar</span>
                  </label>
                  <p className="text-sm text-gray-500 mt-2">Maksimal 5 gambar, JPG/PNG/GIF</p>
                </div>
              </div>
              {(selectedImages.length > 0) && (
                <p className="text-xs text-gray-500">{selectedImages.length} file baru akan diupload saat simpan.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminTargetHarianEdit;
