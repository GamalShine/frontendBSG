import React, { useMemo, useState } from 'react';
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
          const res = await fetch(`${env.API_BASE_URL}/upload/media-sosial`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` },
            body: formData,
          });
          const json = await res.json();
          if (!json.success) throw new Error(json.message || 'Upload gagal');
          const fileInfo = json.data[0];
          const imgId = Date.now() + Math.floor(Math.random() * 1000);
          setUploadedImages(prev => [...prev, { id: imgId, url: fileInfo.url, serverPath: fileInfo.url }]);
          const imgTag = `<img src="${fileInfo.url}" data-image-id="${imgId}" style="max-width:100%;height:auto;margin:8px 0;border-radius:6px;" />`;
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
      }
    }
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
      <div className="bg-red-800 text-white p-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Tambah Laporan Media Sosial (Admin)</h1>
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
                <h2 className="text-lg font-semibold">Form Tambah</h2>
              </div>
            </div>
          </CardHeader>
          <CardBody>
            <form onSubmit={onSubmit} className="space-y-4">
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
                  style={{ whiteSpace: 'pre-wrap' }}
                />
              </div>
              <div className="flex items-center justify-end gap-2">
                <Button type="button" onClick={() => navigate(-1)} className="bg-gray-100 text-gray-700 hover:bg-gray-200">Batal</Button>
                <Button type="submit" disabled={saving} className="bg-red-700 text-white hover:bg-red-800">{saving ? 'Menyimpan...' : 'Simpan'}</Button>
              </div>
            </form>
          </CardBody>
        </Card>
      </div>
    </div>
  );
};

export default AdminMedsosForm;
