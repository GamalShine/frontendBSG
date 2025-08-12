import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { omsetHarianService } from '../../services/omsetHarianService';
import { toast } from 'react-hot-toast';
import { 
  ArrowLeft, 
  Calendar, 
  FileText, 
  Image as ImageIcon,
  Upload,
  X,
  Save,
  RefreshCw
} from 'lucide-react';

const OmsetHarianForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { user } = useAuth();
  
  const [formData, setFormData] = useState({
    tanggal_omset: new Date().toISOString().split('T')[0],
    isi_omset: '',
    images: []
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedImages, setSelectedImages] = useState([]);
  const [imagePreviewUrls, setImagePreviewUrls] = useState([]);
  const editorRef = useRef(null);

  useEffect(() => {
    if (id) {
      setIsEditMode(true);
      loadOmsetHarian();
    }
  }, [id]);

  // Add CSS for editor
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      [contenteditable="true"] img {
        max-width: 100% !important;
        height: auto !important;
        margin: 10px 0 !important;
        border-radius: 4px !important;
        box-shadow: 0 2px 4px rgba(0,0,0,0.1) !important;
        display: block !important;
      }
      .pasted-image {
        max-width: 100% !important;
        height: auto !important;
        margin: 10px 0 !important;
        border-radius: 4px !important;
        box-shadow: 0 2px 4px rgba(0,0,0,0.1) !important;
        display: block !important;
        border: 1px solid #e5e7eb !important;
      }
      [contenteditable="true"]:empty:before {
        content: attr(data-placeholder);
        color: #9ca3af;
        font-style: italic;
        pointer-events: none;
      }
      [contenteditable="true"]:focus:empty:before {
        content: "";
      }
    `;
    document.head.appendChild(style);
    
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  const loadOmsetHarian = async () => {
    try {
      setLoading(true);
      const response = await omsetHarianService.getOmsetHarianById(id);
      
      if (response.success && response.data) {
        const omsetData = response.data;
        setFormData({
          tanggal_omset: omsetData.tanggal_omset,
          isi_omset: omsetData.isi_omset,
          images: omsetData.images ? JSON.parse(omsetData.images) : []
        });
      } else {
        toast.error('Gagal memuat data omset harian');
        navigate('/keuangan/omset-harian');
      }
    } catch (error) {
      console.error('Error loading omset harian:', error);
      toast.error('Gagal memuat data omset harian');
      navigate('/keuangan/omset-harian');
    } finally {
      setLoading(false);
    }
  };

  const handleEditorChange = (e) => {
    const content = e.target.innerHTML;
    setFormData(prev => ({
      ...prev,
      isi_omset: content
    }));
  };

  const handleEditorPaste = async (e) => {
    const items = e.clipboardData.items;
    
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      
      if (item.type.indexOf('image') !== -1) {
        e.preventDefault();
        
        const file = item.getAsFile();
        if (file) {
          if (file.size > 10 * 1024 * 1024) {
            toast.error('Gambar terlalu besar. Maksimal 10MB');
            return;
          }
          
          if (selectedImages.length >= 5) {
            toast.error('Maksimal 5 gambar per laporan');
            return;
          }
          
          const imageId = Date.now() + Math.floor(Math.random() * 1000);
          const imageWithId = { file, id: imageId };
          setSelectedImages(prev => [...prev, imageWithId]);
          
          const reader = new FileReader();
          reader.onload = (e) => {
            const imageUrl = e.target.result;
            setImagePreviewUrls(prev => [...prev, imageUrl]);
            
            const img = document.createElement('img');
            img.src = imageUrl;
            img.alt = 'Pasted image';
            img.className = 'pasted-image';
            img.setAttribute('data-image-id', imageId);
            
            const selection = window.getSelection();
            if (selection.rangeCount > 0) {
              const range = selection.getRangeAt(0);
              range.deleteContents();
              range.insertNode(img);
              range.collapse(false);
              
              const br = document.createElement('br');
              range.insertNode(br);
              range.collapse(false);
              
              const event = new Event('input', { bubbles: true });
              editorRef.current.dispatchEvent(event);
            }
            
            toast.success('Gambar berhasil ditambahkan');
          };
          reader.readAsDataURL(file);
        }
      }
    }
  };

  const getEditorContent = () => {
    if (!editorRef.current) return '';
    
    const content = editorRef.current.innerHTML;
    if (!content || content.trim() === '') return '';
    
    let processedContent = content;
    const imgRegex = /<img[^>]*data-image-id="([^"]*)"[^>]*>/g;
    let imgMatch;
    
    while ((imgMatch = imgRegex.exec(content)) !== null) {
      const imageId = imgMatch[1];
      const placeholder = `[IMG:${imageId}]`;
      processedContent = processedContent.replace(imgMatch[0], placeholder);
    }
    
    // Remove any remaining HTML tags but keep line breaks
    processedContent = processedContent
      .replace(/<br\s*\/?>/gi, '\n') // Convert <br> to line breaks
      .replace(/<div[^>]*>/gi, '\n') // Convert <div> to line breaks
      .replace(/<\/div>/gi, '') // Remove closing div tags
      .replace(/<[^>]*>/g, '') // Remove all other HTML tags
      .replace(/&nbsp;/g, ' ') // Convert &nbsp; to spaces
      .replace(/&amp;/g, '&') // Convert &amp; to &
      .replace(/&lt;/g, '<') // Convert &lt; to <
      .replace(/&gt;/g, '>') // Convert &gt; to >
      .replace(/&quot;/g, '"') // Convert &quot; to "
      .replace(/&#39;/g, "'") // Convert &#39; to '
      .trim();
    
    return processedContent;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.tanggal_omset) {
      toast.error('Tanggal omset harus diisi');
      return;
    }
    
    const editorContent = getEditorContent();
    if (!editorContent || editorContent.trim() === '') {
      toast.error('Isi omset tidak boleh kosong');
      return;
    }
    
    if (editorContent.trim().length < 10) {
      toast.error('Isi omset minimal 10 karakter');
      return;
    }
    
    setIsSubmitting(true);

    try {
      // Upload images to server first if there are pasted images
      const uploadedFiles = await uploadImagesToServer(selectedImages);
      
      // Update images array with server URLs
      const imagesWithServerUrls = selectedImages.map((img, index) => {
        const uploadedFile = uploadedFiles[index];
        
        if (uploadedFile) {
          return {
            id: img.id,
            url: uploadedFile.url,
            filename: uploadedFile.filename
          };
        } else {
          return {
            id: img.id,
            url: img.url,
            filename: img.filename
          };
        }
      });
      
      const submitData = {
        tanggal_omset: formData.tanggal_omset,
        isi_omset: editorContent,
        images: imagesWithServerUrls
      };
      
      if (isEditMode) {
        await omsetHarianService.updateOmsetHarian(id, submitData);
        toast.success('Data omset harian berhasil diperbarui');
      } else {
        await omsetHarianService.createOmsetHarian(submitData);
        toast.success('Data omset harian berhasil ditambahkan');
      }
      
      navigate('/keuangan/omset-harian');
    } catch (error) {
      console.error('Error submitting form:', error);
      toast.error(isEditMode ? 'Gagal memperbarui data omset harian' : 'Gagal menambahkan data omset harian');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const uploadImagesToServer = async (images) => {
    if (images.length === 0) return [];

    const formData = new FormData();
    images.forEach((imageData) => {
      formData.append('images', imageData.file);
    });

    try {
      const response = await fetch('/api/upload/omset-harian', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: formData
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const result = await response.json();

      if (result.success) {
        return result.data;
      } else {
        toast.error(result.message || 'Gagal mengupload gambar');
        return [];
      }
    } catch (error) {
      console.error('Error uploading images:', error);
      toast.error(`Gagal mengupload gambar: ${error.message}`);
      return [];
    }
  };

  if (loading) {
    return (
      <div className="p-6 bg-gray-50 min-h-screen">
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="p-8 text-center">
            <RefreshCw className="h-8 w-8 animate-spin text-red-500 mx-auto mb-4" />
            <p className="text-gray-600">Memuat data...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header Section */}
      <div className="bg-white rounded-lg shadow-sm border mb-6">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate('/keuangan/omset-harian')}
              className="p-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {isEditMode ? 'Edit Omset Harian' : 'Tambah Omset Harian'}
              </h1>
              <p className="text-gray-600">
                {isEditMode ? 'Perbarui data omset harian' : 'Tambah data omset harian baru'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Form Section */}
      <div className="bg-white rounded-lg shadow-sm border">
        <form onSubmit={handleSubmit}>
          {/* Tanggal Omset */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-2 bg-red-100 rounded-lg">
                <Calendar className="h-5 w-5 text-red-600" />
              </div>
              <label className="text-lg font-semibold text-gray-900">
                Tanggal Omset
              </label>
            </div>
            <input
              type="date"
              name="tanggal_omset"
              value={formData.tanggal_omset}
              onChange={handleInputChange}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
            />
            <p className="text-sm text-gray-500 mt-2">
              Pilih tanggal untuk omset harian ini
            </p>
          </div>

          {/* Isi Omset Editor */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-2 bg-green-100 rounded-lg">
                <FileText className="h-5 w-5 text-green-600" />
              </div>
              <label className="text-lg font-semibold text-gray-900">
                Isi Omset Harian
              </label>
            </div>
            
            <div className="space-y-4">
              <div
                ref={editorRef}
                contentEditable
                data-placeholder="Masukkan isi omset harian... Anda bisa paste gambar langsung dari clipboard (Ctrl+V)"
                onInput={handleEditorChange}
                onPaste={handleEditorPaste}
                className="min-h-[300px] p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none"
                style={{ whiteSpace: 'pre-wrap' }}
                dangerouslySetInnerHTML={isEditMode ? { __html: formData.isi_omset } : undefined}
              />
              
              <p className="text-sm text-gray-500">
                💡 Tips: Anda bisa paste gambar langsung dari clipboard (Ctrl+V)
              </p>
            </div>
          </div>

          {/* Submit Buttons */}
          <div className="flex space-x-4 p-6">
            <button
              type="button"
              onClick={() => navigate('/keuangan/omset-harian')}
              className="px-6 py-3 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center space-x-2 px-6 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              <span>{isSubmitting ? 'Menyimpan...' : (isEditMode ? 'Perbarui' : 'Simpan')}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default OmsetHarianForm; 