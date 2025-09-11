import React, { useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Save } from 'lucide-react';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { mediaSosialService } from '@/services/mediaSosialService';
import { toast } from 'react-hot-toast';
import { getEnvironmentConfig } from '@/config/environment';

const OwnerMedsosForm = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const prefillYear = searchParams.get('year');
  const prefillMonth = searchParams.get('month');

  const defaultDate = useMemo(() => {
    if (prefillYear && prefillMonth) {
      const y = Number(prefillYear);
      const m = Number(prefillMonth) - 1; // 0-based
      const d = new Date(y, m, 1);
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

  const envConfig = getEnvironmentConfig();
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ tanggal_laporan: defaultDate, isi_laporan: '' });
  const [editorHtml, setEditorHtml] = useState('');
  const [uploadedImages, setUploadedImages] = useState([]); // {id, url, serverPath}

  const handleEditorChange = (e) => {
    setEditorHtml(e.target.innerHTML);
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
          const res = await fetch(`${envConfig.API_BASE_URL}/upload/media-sosial`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('token')}`,
            },
            body: formData,
          });
          const json = await res.json();
          if (!json.success) throw new Error(json.message || 'Upload gagal');
          const fileInfo = json.data[0];
          const imgId = Date.now() + Math.floor(Math.random() * 1000);
          setUploadedImages(prev => [...prev, { id: imgId, url: fileInfo.url, serverPath: fileInfo.url }]);
          // sisipkan img ke editor
          const imgTag = `<img src="${fileInfo.url}" data-image-id="${imgId}" style="max-width:100%;height:auto;margin:8px 0;border-radius:6px;" />`;
          // insert at caret
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
            // trigger change
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
      }
    }
  };

  const getProcessedContent = () => {
    // convert <img data-image-id="ID"> menjadi [IMG:ID], dan hapus tag html lain, ubah <br> jadi newline
    let content = editorHtml || '';
    if (!content) return '';
    // convert existing img tags with data-image-id to placeholders
    content = content.replace(/<img[^>]*data-image-id="(\d+)"[^>]*>/g, (_m, id) => `[IMG:${id}]`);
    // convert <br> and <div> to newline
    content = content
      .replace(/<br\s*\/?>/gi, '\n')
      .replace(/<div[^>]*>/gi, '\n')
      .replace(/<\/div>/gi, '')
      .replace(/<[^>]*>/g, '')
      .replace(/&nbsp;/g, ' ')
      .trim();
    return content;
  };

  const submitCreate = async (e) => {
    e.preventDefault();
    if (!form.tanggal_laporan) {
      toast.error('Tanggal laporan wajib diisi');
      return;
    }
    try {
      setSaving(true);
      const isi = getProcessedContent();
      if (!isi || isi.length < 5) {
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
      navigate('/owner/marketing/medsos');
    } catch (err) {
      console.error('Gagal membuat data media_sosial', err);
      toast.error('Gagal menambahkan laporan medsos');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="px-0 py-2 bg-gray-50 min-h-screen">
      {/* Header ala acuan */}
      <div className="bg-red-800 text-white p-4 mb-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button type="button" onClick={() => navigate(-1)} aria-label="Kembali" className="inline-flex items-center bg-white/0 text-white hover:text-gray-100">
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div>
              <h1 className="text-2xl font-bold">Tambah Laporan Media Sosial</h1>
              <p className="text-sm opacity-90">Marketing - Medsos</p>
            </div>
          </div>
          <button type="submit" form="owner-medsos-form" className="bg-white border-red-600 text-red-700 hover:bg-red-50 inline-flex items-center gap-2 px-3 py-2 disabled:opacity-50" disabled={saving}>
            <Save className="h-4 w-4" />
            <span>{saving ? 'Menyimpan...' : 'Simpan'}</span>
          </button>
        </div>
      </div>
      {/* Info bar */}
      <div className="bg-gray-200 px-4 py-2 text-xs text-gray-600 -mt-1 mb-4">Mode Tambah • {format(new Date(), "dd MMMM yyyy", { locale: id })}</div>

      <div className="w-full px-4 md:px-6">
        <form id="owner-medsos-form" onSubmit={submitCreate} className="bg-white shadow-sm border p-6 space-y-4">
          <div>
            <label className="block text-sm text-gray-700 mb-1">Tanggal Laporan</label>
            <input
              type="date"
              className="w-full border rounded px-3 py-2"
              value={form.tanggal_laporan}
              onChange={(e) => setForm(prev => ({ ...prev, tanggal_laporan: e.target.value }))}
              required
            />
          </div>
          <div>
            <label className="block text-sm text-gray-700 mb-1">Isi Laporan (bisa paste gambar)</label>
            <div
              contentEditable
              onInput={handleEditorChange}
              onPaste={handlePaste}
              className="w-full border rounded px-3 py-2 min-h-56 bg-white focus:outline-none"
              data-placeholder="Tulis ringkasan performa, engagement, reach, dst..."
              style={{ whiteSpace: 'pre-wrap' }}
            />
          </div>
          <div className="flex items-center gap-2">
            <button type="button" onClick={() => navigate(-1)} className="px-4 py-2 border">Batal</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default OwnerMedsosForm;
