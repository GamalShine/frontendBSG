import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Card, { CardHeader, CardBody } from '@/components/UI/Card';
import Button from '@/components/UI/Button';
import { mediaSosialService } from '@/services/mediaSosialService';
import { toast } from 'react-hot-toast';
import { getEnvironmentConfig } from '@/config/environment';

const OwnerMedsosEdit = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const envConfig = getEnvironmentConfig();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [form, setForm] = useState({ tanggal_laporan: '', isi_laporan: '' });
  const [editorHtml, setEditorHtml] = useState('');
  const [existingImages, setExistingImages] = useState([]); // images dari DB
  const [uploadedImages, setUploadedImages] = useState([]); // images baru dari paste

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
          setForm({ tanggal_laporan: `${yyyy}-${mm}-${dd}`, isi_laporan: data.isi_laporan || '' });
          // siapkan images
          let imgs = [];
          try {
            if (Array.isArray(data.images)) imgs = data.images;
            else if (typeof data.images === 'string' && data.images.trim()) imgs = JSON.parse(data.images);
          } catch {}
          imgs = Array.isArray(imgs) ? imgs : [];
          setExistingImages(imgs);
          // render isi_laporan -> editorHtml dengan mengganti [IMG:id] menjadi <img ...>
          const html = (data.isi_laporan || '').replace(/\[IMG:(\d+)\]/g, (_m, pid) => {
            const found = imgs.find(im => String(im.id) === String(pid));
            if (!found) return '';
            const src = found.url || found.uri || found.displayUri || found.fallbackUri || '';
            return `<img src="${src}" data-image-id="${pid}" style="max-width:100%;height:auto;margin:8px 0;border-radius:6px;" />`;
          }).replace(/\n/g, '<br/>');
          setEditorHtml(html);
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

  const submitUpdate = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      const isi = getProcessedContent();
      if (!form.tanggal_laporan) {
        toast.error('Tanggal laporan wajib diisi');
        setSaving(false);
        return;
      }
      if (!isi || isi.length < 5) {
        toast.error('Isi laporan terlalu pendek');
        setSaving(false);
        return;
      }
      // gabungkan images lama + baru (utamakan id unik)
      const merged = [...existingImages];
      uploadedImages.forEach(img => {
        if (!merged.find(x => String(x.id) === String(img.id))) merged.push(img);
      });
      await mediaSosialService.update(id, {
        tanggal_laporan: form.tanggal_laporan,
        isi_laporan: isi,
        images: merged,
      });
      toast.success('Laporan medsos berhasil diperbarui');
      navigate(`/owner/marketing/medsos/${id}`);
    } catch (err) {
      console.error('Gagal mengubah data media_sosial', err);
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
            <h1 className="text-2xl font-bold">Edit Laporan Media Sosial</h1>
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
              <form onSubmit={submitUpdate} className="space-y-4">
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
                    dangerouslySetInnerHTML={{ __html: editorHtml }}
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

export default OwnerMedsosEdit;
