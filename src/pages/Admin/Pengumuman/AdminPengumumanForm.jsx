import React, { useState, useEffect } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import { useAuth } from '../../../contexts/AuthContext'
import { pengumumanService } from '../../../services/pengumumanService'
import { 
  ArrowLeft, 
  Save, 
  Eye, 
  Megaphone,
  Calendar,
  AlertTriangle,
  CheckCircle,
  XCircle
} from 'lucide-react'
import Card, { CardHeader, CardBody, CardFooter } from '../../../components/UI/Card'
import Button from '../../../components/UI/Button'
import Input from '../../../components/UI/Input'
import Select from '../../../components/UI/Select'
import Textarea from '../../../components/UI/Textarea'
import Badge from '../../../components/UI/Badge'
import toast from 'react-hot-toast'

const AdminPengumumanForm = () => {
  const navigate = useNavigate()
  const { id } = useParams()
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState({
    judul_pengumuman: '',
    isi_pengumuman: '',
    prioritas: 'medium',
    status: 'draft',
    tanggal_pengumuman: new Date().toISOString().split('T')[0],
    target_audience: 'all',
    attachments: []
  })
  const [errors, setErrors] = useState({})
  const [previewMode, setPreviewMode] = useState(false)

  const isEditMode = !!id

  useEffect(() => {
    if (isEditMode) {
      loadPengumuman()
    }
  }, [id])

  const loadPengumuman = async () => {
    try {
      setLoading(true)
      const response = await pengumumanService.getPengumumanDetail(id)
      
      if (response.success) {
        const data = response.data
        setFormData({
          judul_pengumuman: data.judul_pengumuman || '',
          isi_pengumuman: data.isi_pengumuman || '',
          prioritas: data.prioritas || 'medium',
          status: data.status || 'draft',
          tanggal_pengumuman: data.tanggal_pengumuman ? new Date(data.tanggal_pengumuman).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
          target_audience: data.target_audience || 'all',
          attachments: data.attachments || []
        })
      } else {
        toast.error('Gagal memuat data pengumuman')
        navigate('/admin/pengumuman')
      }
    } catch (error) {
      toast.error('Gagal memuat data pengumuman')
      console.error('Error loading pengumuman:', error)
      navigate('/admin/pengumuman')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }))
    }
  }

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files)
    setFormData(prev => ({
      ...prev,
      attachments: [...prev.attachments, ...files]
    }))
  }

  const removeAttachment = (index) => {
    setFormData(prev => ({
      ...prev,
      attachments: prev.attachments.filter((_, i) => i !== index)
    }))
  }

  const validateForm = () => {
    const newErrors = {}

    if (!formData.judul_pengumuman.trim()) {
      newErrors.judul_pengumuman = 'Judul pengumuman wajib diisi'
    }

    if (!formData.isi_pengumuman.trim()) {
      newErrors.isi_pengumuman = 'Isi pengumuman wajib diisi'
    }

    if (!formData.tanggal_pengumuman) {
      newErrors.tanggal_pengumuman = 'Tanggal pengumuman wajib diisi'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!validateForm()) {
      toast.error('Mohon perbaiki kesalahan pada form')
      return
    }

    try {
      setSaving(true)
      
      const formDataToSend = new FormData()
      formDataToSend.append('judul_pengumuman', formData.judul_pengumuman)
      formDataToSend.append('isi_pengumuman', formData.isi_pengumuman)
      formDataToSend.append('prioritas', formData.prioritas)
      formDataToSend.append('status', formData.status)
      formDataToSend.append('tanggal_pengumuman', formData.tanggal_pengumuman)
      formDataToSend.append('target_audience', formData.target_audience)

      // Add attachments
      formData.attachments.forEach((file, index) => {
        if (file instanceof File) {
          formDataToSend.append(`attachments`, file)
        }
      })

      let response
      if (isEditMode) {
        response = await pengumumanService.updatePengumuman(id, formDataToSend)
      } else {
        response = await pengumumanService.createPengumuman(formDataToSend)
      }

      if (response.success) {
        toast.success(isEditMode ? 'Pengumuman berhasil diperbarui' : 'Pengumuman berhasil dibuat')
        navigate('/admin/pengumuman')
      } else {
        toast.error(response.message || 'Gagal menyimpan pengumuman')
      }
    } catch (error) {
      toast.error('Gagal menyimpan pengumuman')
      console.error('Error saving pengumuman:', error)
    } finally {
      setSaving(false)
    }
  }

  const getPriorityBadge = (priority) => {
    const variants = {
      high: 'danger',
      medium: 'warning',
      low: 'info'
    }
    return <Badge variant={variants[priority] || 'default'}>{priority}</Badge>
  }

  const getStatusBadge = (status) => {
    const variants = {
      published: 'success',
      draft: 'warning',
      archived: 'danger'
    }
    return <Badge variant={variants[status] || 'default'}>{status}</Badge>
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'published':
        return <CheckCircle className="h-5 w-5 text-green-600" />
      case 'draft':
        return <AlertTriangle className="h-5 w-5 text-yellow-600" />
      case 'archived':
        return <XCircle className="h-5 w-5 text-red-600" />
      default:
        return <AlertTriangle className="h-5 w-5 text-gray-600" />
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Memuat data pengumuman...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <Link to="/admin/pengumuman">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Kembali
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {isEditMode ? 'Edit Pengumuman' : 'Tambah Pengumuman Baru'}
            </h1>
            <p className="text-gray-600">
              {isEditMode ? 'Perbarui informasi pengumuman' : 'Buat pengumuman baru untuk perusahaan'}
            </p>
          </div>
        </div>
        
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={() => setPreviewMode(!previewMode)}
          >
            {previewMode ? (
              <>
                <Eye className="h-4 w-4 mr-2" />
                Edit Mode
              </>
            ) : (
              <>
                <Eye className="h-4 w-4 mr-2" />
                Preview
              </>
            )}
          </Button>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Information */}
            <Card>
              <CardHeader>
                <h3 className="text-lg font-semibold text-gray-900">Informasi Dasar</h3>
              </CardHeader>
              <CardBody className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Judul Pengumuman *
                  </label>
                  <Input
                    name="judul_pengumuman"
                    value={formData.judul_pengumuman}
                    onChange={handleChange}
                    placeholder="Masukkan judul pengumuman..."
                    error={errors.judul_pengumuman}
                    disabled={previewMode}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Isi Pengumuman *
                  </label>
                  <Textarea
                    name="isi_pengumuman"
                    value={formData.isi_pengumuman}
                    onChange={handleChange}
                    placeholder="Masukkan isi pengumuman..."
                    rows={8}
                    error={errors.isi_pengumuman}
                    disabled={previewMode}
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    Gunakan format markdown untuk formatting teks
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tanggal Pengumuman *
                  </label>
                  <Input
                    type="date"
                    name="tanggal_pengumuman"
                    value={formData.tanggal_pengumuman}
                    onChange={handleChange}
                    error={errors.tanggal_pengumuman}
                    disabled={previewMode}
                  />
                </div>
              </CardBody>
            </Card>

            {/* Attachments */}
            <Card>
              <CardHeader>
                <h3 className="text-lg font-semibold text-gray-900">Lampiran</h3>
              </CardHeader>
              <CardBody>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Upload File
                    </label>
                    <Input
                      type="file"
                      multiple
                      onChange={handleFileChange}
                      disabled={previewMode}
                      accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.gif"
                    />
                    <p className="text-sm text-gray-500 mt-1">
                      Format yang didukung: PDF, DOC, DOCX, JPG, PNG, GIF (Max 5MB per file)
                    </p>
                  </div>

                  {formData.attachments.length > 0 && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        File Terpilih
                      </label>
                      <div className="space-y-2">
                        {formData.attachments.map((file, index) => (
                          <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <div className="flex items-center gap-3">
                              <Megaphone className="h-5 w-5 text-gray-600" />
                              <span className="text-sm text-gray-900">
                                {file.name || file.filename}
                              </span>
                            </div>
                            {!previewMode && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => removeAttachment(index)}
                                className="text-red-600 hover:text-red-700"
                              >
                                <XCircle className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </CardBody>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Settings */}
            <Card>
              <CardHeader>
                <h3 className="text-lg font-semibold text-gray-900">Pengaturan</h3>
              </CardHeader>
              <CardBody className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Prioritas
                  </label>
                  <Select
                    name="prioritas"
                    value={formData.prioritas}
                    onChange={handleChange}
                    disabled={previewMode}
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </Select>
                  <div className="mt-2">
                    {getPriorityBadge(formData.prioritas)}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Status
                  </label>
                  <Select
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                    disabled={previewMode}
                  >
                    <option value="draft">Draft</option>
                    <option value="published">Published</option>
                    <option value="archived">Archived</option>
                  </Select>
                  <div className="mt-2 flex items-center gap-2">
                    {getStatusIcon(formData.status)}
                    {getStatusBadge(formData.status)}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Target Audience
                  </label>
                  <Select
                    name="target_audience"
                    value={formData.target_audience}
                    onChange={handleChange}
                    disabled={previewMode}
                  >
                    <option value="all">Semua Karyawan</option>
                    <option value="admin">Admin Only</option>
                    <option value="leader">Leader Only</option>
                    <option value="divisi">Divisi Only</option>
                  </Select>
                </div>
              </CardBody>
            </Card>

            {/* Preview */}
            {previewMode && (
              <Card>
                <CardHeader>
                  <h3 className="text-lg font-semibold text-gray-900">Preview</h3>
                </CardHeader>
                <CardBody>
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">
                        {formData.judul_pengumuman || 'Judul Pengumuman'}
                      </h4>
                      <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          {formData.tanggal_pengumuman ? new Date(formData.tanggal_pengumuman).toLocaleDateString('id-ID') : 'Tanggal'}
                        </div>
                        {getPriorityBadge(formData.prioritas)}
                        {getStatusBadge(formData.status)}
                      </div>
                      <div className="prose prose-sm max-w-none">
                        <p className="text-gray-700 whitespace-pre-wrap">
                          {formData.isi_pengumuman || 'Isi pengumuman akan ditampilkan di sini...'}
                        </p>
                      </div>
                    </div>
                  </div>
                </CardBody>
              </Card>
            )}

            {/* Actions */}
            {!previewMode && (
              <Card>
                <CardHeader>
                  <h3 className="text-lg font-semibold text-gray-900">Aksi</h3>
                </CardHeader>
                <CardBody>
                  <div className="space-y-3">
                    <Button
                      type="submit"
                      className="w-full"
                      disabled={saving}
                    >
                      {saving ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Menyimpan...
                        </>
                      ) : (
                        <>
                          <Save className="h-4 w-4 mr-2" />
                          {isEditMode ? 'Update Pengumuman' : 'Simpan Pengumuman'}
                        </>
                      )}
                    </Button>
                    
                    <Link to="/admin/pengumuman">
                      <Button variant="outline" className="w-full">
                        Batal
                      </Button>
                    </Link>
                  </div>
                </CardBody>
              </Card>
            )}
          </div>
        </div>
      </form>
    </div>
  )
}

export default AdminPengumumanForm 