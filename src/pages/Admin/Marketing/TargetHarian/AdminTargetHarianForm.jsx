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

  const onSelectFiles = (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    const newSelected = [];
    const newPreviews = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (file.size > 10 * 1024 * 1024) {
        toast.error('Gambar terlalu besar. Maksimal 10MB');
        continue;
      }
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
      {/* Header ala acuan */}
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

      <div className="max-w-4xl mx-auto mb-12 px-4">
        <form id="form-data-target" onSubmit={handleSubmit} className="bg-white shadow-sm border p-6 space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tanggal Target</label>
            <input type="date" name="tanggal_target" value={form.tanggal_target} onChange={handleChange} className="w-full border rounded px-3 py-2" required />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Isi Data Target</label>
            <div className="flex items-center gap-2 mb-2">
              <button type="button" onClick={() => exec('bold')} className={`px-2 py-1 rounded border ${isBold ? 'bg-red-50 border-red-300 text-red-700' : 'bg-white'}`}>B</button>
              <button type="button" onClick={() => exec('italic')} className={`px-2 py-1 rounded border ${isItalic ? 'bg-red-50 border-red-300 text-red-700' : 'bg-white'}`}>I</button>
              <button type="button" onClick={() => exec('underline')} className={`px-2 py-1 rounded border ${isUnderline ? 'bg-red-50 border-red-300 text-red-700' : 'bg-white'}`}>U</button>
            </div>
            <div
              ref={editorRef}
              contentEditable
              onInput={handleEditorChange}
              onMouseUp={handleEditorInteraction}
              onKeyUp={handleEditorInteraction}
              data-placeholder="Tulis data target di sini..."
              className="w-full border rounded px-3 py-2 min-h-[200px] focus:outline-none focus:ring-2 focus:ring-red-500"
              suppressContentEditableWarning
            />
            <p className="text-xs text-gray-500 mt-1">Anda dapat paste gambar langsung ke editor, atau unggah dari file.</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Gambar (opsional)</label>
            <input type="file" accept="image/*" multiple onChange={onSelectFiles} className="block w-full text-sm" />
            {(selectedImages.length > 0) && (
              <p className="text-xs text-gray-500 mt-1">{selectedImages.length} file dipilih. Akan diupload saat simpan.</p>
            )}
          </div>

          <div className="flex items-center gap-3">
            <button type="button" className="px-4 py-2 border" onClick={() => navigate('/admin/marketing/data-target')}>Batal</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminTargetHarianForm;
