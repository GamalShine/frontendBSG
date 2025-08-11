import React, { useState, useEffect } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import { useAuth } from '../../../contexts/AuthContext'
import { trainingService } from '../../../services/trainingService'
import { 
  ArrowLeft, 
  Save, 
  BookOpen,
  Calendar,
  Clock,
  Users,
  MapPin
} from 'lucide-react'
import Card, { CardHeader, CardBody } from '../../../components/UI/Card'
import Button from '../../../components/UI/Button'
import Input from '../../../components/UI/Input'
import Select from '../../../components/UI/Select'
import Textarea from '../../../components/UI/Textarea'
import toast from 'react-hot-toast'

const AdminTrainingForm = () => {
  const navigate = useNavigate()
  const { id } = useParams()
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState({
    judul_training: '',
    deskripsi: '',
    tipe: 'technical',
    tanggal_training: new Date().toISOString().split('T')[0],
    waktu_mulai: '09:00',
    waktu_selesai: '17:00',
    lokasi: '',
    kapasitas: 20,
    status: 'upcoming',
    target_audience: 'all',
    materi: '',
    instruktur: '',
    biaya: 0,
    catatan: ''
  })
  const [errors, setErrors] = useState({})

  const isEditMode = !!id

  useEffect(() => {
    if (isEditMode) {
      loadTraining()
    }
  }, [id])

  const loadTraining = async () => {
    try {
      setLoading(true)
      const response = await trainingService.getTrainingDetail(id)
      
      if (response.success) {
        const data = response.data
        setFormData({
          judul_training: data.judul_training || '',
          deskripsi: data.deskripsi || '',
          tipe: data.tipe || 'technical',
          tanggal_training: data.tanggal_training ? new Date(data.tanggal_training).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
          waktu_mulai: data.waktu_mulai || '09:00',
          waktu_selesai: data.waktu_selesai || '17:00',
          lokasi: data.lokasi || '',
          kapasitas: data.kapasitas || 20,
          status: data.status || 'upcoming',
          target_audience: data.target_audience || 'all',
          materi: data.materi || '',
          instruktur: data.instruktur || '',
          biaya: data.biaya || 0,
          catatan: data.catatan || ''
        })
      } else {
        toast.error('Gagal memuat data training')
        navigate('/admin/training')
      }
    } catch (error) {
      toast.error('Gagal memuat data training')
      console.error('Error loading training:', error)
      navigate('/admin/training')
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
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }))
    }
  }

  const validateForm = () => {
    const newErrors = {}

    if (!formData.judul_training.trim()) {
      newErrors.judul_training = 'Judul training wajib diisi'
    }

    if (!formData.deskripsi.trim()) {
      newErrors.deskripsi = 'Deskripsi training wajib diisi'
    }

    if (!formData.tanggal_training) {
      newErrors.tanggal_training = 'Tanggal training wajib diisi'
    }

    if (!formData.lokasi.trim()) {
      newErrors.lokasi = 'Lokasi training wajib diisi'
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
      
      let response
      if (isEditMode) {
        response = await trainingService.updateTraining(id, formData)
      } else {
        response = await trainingService.createTraining(formData)
      }

      if (response.success) {
        toast.success(isEditMode ? 'Training berhasil diperbarui' : 'Training berhasil dibuat')
        navigate('/admin/training')
      } else {
        toast.error(response.message || 'Gagal menyimpan training')
      }
    } catch (error) {
      toast.error('Gagal menyimpan training')
      console.error('Error saving training:', error)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Memuat data training...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <Link to="/admin/training">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Kembali
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {isEditMode ? 'Edit Training' : 'Tambah Training Baru'}
            </h1>
            <p className="text-gray-600">
              {isEditMode ? 'Perbarui informasi training' : 'Buat sesi training baru untuk perusahaan'}
            </p>
          </div>
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
                    Judul Training *
                  </label>
                  <Input
                    name="judul_training"
                    value={formData.judul_training}
                    onChange={handleChange}
                    placeholder="Masukkan judul training..."
                    error={errors.judul_training}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Deskripsi *
                  </label>
                  <Textarea
                    name="deskripsi"
                    value={formData.deskripsi}
                    onChange={handleChange}
                    placeholder="Masukkan deskripsi training..."
                    rows={4}
                    error={errors.deskripsi}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tipe Training
                    </label>
                    <Select
                      name="tipe"
                      value={formData.tipe}
                      onChange={handleChange}
                    >
                      <option value="technical">Technical</option>
                      <option value="soft_skill">Soft Skill</option>
                      <option value="management">Management</option>
                      <option value="safety">Safety</option>
                    </Select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Status
                    </label>
                    <Select
                      name="status"
                      value={formData.status}
                      onChange={handleChange}
                    >
                      <option value="upcoming">Upcoming</option>
                      <option value="ongoing">Ongoing</option>
                      <option value="completed">Completed</option>
                      <option value="cancelled">Cancelled</option>
                    </Select>
                  </div>
                </div>
              </CardBody>
            </Card>

            {/* Schedule Information */}
            <Card>
              <CardHeader>
                <h3 className="text-lg font-semibold text-gray-900">Jadwal & Lokasi</h3>
              </CardHeader>
              <CardBody className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tanggal Training *
                    </label>
                    <Input
                      type="date"
                      name="tanggal_training"
                      value={formData.tanggal_training}
                      onChange={handleChange}
                      error={errors.tanggal_training}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Waktu Mulai
                    </label>
                    <Input
                      type="time"
                      name="waktu_mulai"
                      value={formData.waktu_mulai}
                      onChange={handleChange}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Waktu Selesai
                    </label>
                    <Input
                      type="time"
                      name="waktu_selesai"
                      value={formData.waktu_selesai}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Lokasi *
                  </label>
                  <Input
                    name="lokasi"
                    value={formData.lokasi}
                    onChange={handleChange}
                    placeholder="Masukkan lokasi training..."
                    error={errors.lokasi}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Kapasitas Peserta
                    </label>
                    <Input
                      type="number"
                      name="kapasitas"
                      value={formData.kapasitas}
                      onChange={handleChange}
                      min="1"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Biaya per Peserta
                    </label>
                    <Input
                      type="number"
                      name="biaya"
                      value={formData.biaya}
                      onChange={handleChange}
                      min="0"
                      placeholder="0"
                    />
                  </div>
                </div>
              </CardBody>
            </Card>

            {/* Additional Information */}
            <Card>
              <CardHeader>
                <h3 className="text-lg font-semibold text-gray-900">Informasi Tambahan</h3>
              </CardHeader>
              <CardBody className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Instruktur
                  </label>
                  <Input
                    name="instruktur"
                    value={formData.instruktur}
                    onChange={handleChange}
                    placeholder="Masukkan nama instruktur..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Materi Training
                  </label>
                  <Textarea
                    name="materi"
                    value={formData.materi}
                    onChange={handleChange}
                    placeholder="Masukkan materi yang akan diajarkan..."
                    rows={4}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Target Audience
                  </label>
                  <Select
                    name="target_audience"
                    value={formData.target_audience}
                    onChange={handleChange}
                  >
                    <option value="all">Semua Karyawan</option>
                    <option value="admin">Admin Only</option>
                    <option value="leader">Leader Only</option>
                    <option value="divisi">Divisi Only</option>
                  </Select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Catatan
                  </label>
                  <Textarea
                    name="catatan"
                    value={formData.catatan}
                    onChange={handleChange}
                    placeholder="Catatan tambahan..."
                    rows={3}
                  />
                </div>
              </CardBody>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Actions */}
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
                        {isEditMode ? 'Update Training' : 'Simpan Training'}
                      </>
                    )}
                  </Button>
                  
                  <Link to="/admin/training">
                    <Button variant="outline" className="w-full">
                      Batal
                    </Button>
                  </Link>
                </div>
              </CardBody>
            </Card>
          </div>
        </div>
      </form>
    </div>
  )
}

export default AdminTrainingForm 