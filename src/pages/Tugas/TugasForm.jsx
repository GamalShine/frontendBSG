import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Save, CheckSquare, Calendar, User } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import Card, { CardHeader, CardBody, CardFooter } from '../../components/UI/Card'
import Button from '../../components/UI/Button'
import Input from '../../components/UI/Input'
import Select from '../../components/UI/Select'
import Textarea from '../../components/UI/Textarea'
import { tugasService } from '../../services/tugasService'
import { userService } from '../../services/userService'
import toast from 'react-hot-toast'

const TugasForm = () => {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [users, setUsers] = useState([])
  const [formData, setFormData] = useState({
    judul_tugas: '',
    keterangan_tugas: '',
    penerima_tugas: '',
    skala_prioritas: 'berproses',
    target_selesai: '',
    pihak_terkait: [],
    lampiran: []
  })
  const [errors, setErrors] = useState({})

  const skalaPrioritasOptions = [
    { value: 'mendesak', label: 'Mendesak' },
    { value: 'penting', label: 'Penting' },
    { value: 'berproses', label: 'Berproses' }
  ]

  // Load users for penerima_tugas dropdown
  useEffect(() => {
    const loadUsers = async () => {
      try {
        const response = await userService.getUsers()
        if (response.success) {
          setUsers(response.data)
        }
      } catch (error) {
        console.error('Error loading users:', error)
      }
    }
    loadUsers()
  }, [])

  const penerimaOptions = users
    .filter(u => u.status === 'active' && u.status_deleted === 0)
    .map(user => ({
      value: user.id.toString(),
      label: `${user.nama} (${user.role})`
    }))

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

  const validateForm = () => {
    const newErrors = {}
    
    if (!formData.judul_tugas.trim()) {
      newErrors.judul_tugas = 'Judul tugas harus diisi'
    }
    
    if (!formData.keterangan_tugas.trim()) {
      newErrors.keterangan_tugas = 'Keterangan tugas harus diisi'
    }
    
    if (!formData.penerima_tugas) {
      newErrors.penerima_tugas = 'Penerima tugas harus dipilih'
    }
    
    if (!formData.skala_prioritas) {
      newErrors.skala_prioritas = 'Skala prioritas harus dipilih'
    }
    
    if (!formData.target_selesai) {
      newErrors.target_selesai = 'Target selesai harus diisi'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    setLoading(true)
    
    try {
      // Check if user is authenticated
      const token = localStorage.getItem('token')
      if (!token) {
        toast.error('Anda harus login terlebih dahulu')
        navigate('/login')
        return
      }

      console.log('🔑 Token available:', !!token)
      console.log('👤 Current user:', user)

      // Prepare data for API
      const tugasData = {
        ...formData,
        pemberi_tugas: user.id,
        penerima_tugas: parseInt(formData.penerima_tugas),
        target_selesai: formData.target_selesai,
        lampiran: formData.lampiran,
        pihak_terkait: formData.pihak_terkait
      }

      console.log('📤 Sending tugas data:', tugasData)

      const response = await tugasService.createTugas(tugasData)
      
      console.log('📥 Response from API:', response)
      
      if (response.success) {
        toast.success('Tugas berhasil ditambahkan!')
        navigate('/tugas')
      } else {
        toast.error(response.message || 'Gagal menambahkan tugas')
      }
    } catch (error) {
      console.error('❌ Error adding tugas:', error)
      console.error('❌ Error details:', error.response?.data)
      toast.error('Gagal menambahkan tugas. Silakan coba lagi.')
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = () => {
    navigate('/tugas')
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleCancel}
            className="flex items-center"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Kembali
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Tambah Tugas Baru</h1>
            <p className="text-gray-600 mt-1">Buat tugas baru untuk ditugaskan</p>
          </div>
        </div>
      </div>

      {/* Form Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg mr-3">
              <CheckSquare className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h3 className="text-lg font-medium text-gray-900">Form Tugas</h3>
              <p className="text-sm text-gray-600">Lengkapi informasi tugas di bawah ini</p>
            </div>
          </div>
        </CardHeader>
        
        <form onSubmit={handleSubmit}>
          <CardBody>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Judul Tugas */}
              <div className="md:col-span-2">
                <Input
                  label="Judul Tugas"
                  name="judul_tugas"
                  value={formData.judul_tugas}
                  onChange={handleChange}
                  placeholder="Masukkan judul tugas"
                  error={errors.judul_tugas}
                  required
                />
              </div>

              {/* Assigned To */}
              <Select
                label="Assigned To"
                name="penerima_tugas"
                value={formData.penerima_tugas}
                onChange={handleChange}
                options={penerimaOptions}
                placeholder="Pilih penerima tugas"
                error={errors.penerima_tugas}
                required
              />

              {/* Prioritas */}
              <Select
                label="Prioritas"
                name="skala_prioritas"
                value={formData.skala_prioritas}
                onChange={handleChange}
                options={skalaPrioritasOptions}
                placeholder="Pilih prioritas"
                error={errors.skala_prioritas}
                required
              />

              {/* Target Selesai */}
              <Input
                label="Target Selesai"
                name="target_selesai"
                type="date"
                value={formData.target_selesai}
                onChange={handleChange}
                error={errors.target_selesai}
                required
              />

              {/* Deskripsi Tugas */}
              <div className="md:col-span-2">
                <Textarea
                  label="Deskripsi Tugas"
                  name="keterangan_tugas"
                  value={formData.keterangan_tugas}
                  onChange={handleChange}
                  placeholder="Jelaskan detail tugas yang harus dikerjakan..."
                  error={errors.keterangan_tugas}
                  rows={6}
                  required
                />
              </div>
            </div>
          </CardBody>

          <CardFooter>
            <div className="flex items-center justify-end space-x-3">
              <Button
                type="button"
                variant="outline"
                onClick={handleCancel}
                disabled={loading}
              >
                Batal
              </Button>
              <Button
                type="submit"
                disabled={loading}
                className="flex items-center"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Menyimpan...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Simpan Tugas
                  </>
                )}
              </Button>
            </div>
          </CardFooter>
        </form>
      </Card>

      {/* Info Card */}
      <Card>
        <CardBody>
          <div className="flex items-start space-x-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <CheckSquare className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <h4 className="text-sm font-medium text-gray-900 mb-1">Tips Membuat Tugas</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Berikan judul yang jelas dan spesifik</li>
                <li>• Jelaskan detail tugas dengan lengkap</li>
                <li>• Pilih assignee yang sesuai dengan kemampuan</li>
                <li>• Tetapkan target selesai yang realistis</li>
                <li>• Pilih prioritas berdasarkan urgensi</li>
              </ul>
            </div>
          </div>
        </CardBody>
      </Card>
    </div>
  )
}

export default TugasForm 