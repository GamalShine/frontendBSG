import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Save, AlertTriangle, Upload, X } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import Card, { CardHeader, CardBody, CardFooter } from '../../components/UI/Card'
import Button from '../../components/UI/Button'
import Input from '../../components/UI/Input'
import Select from '../../components/UI/Select'
import Textarea from '../../components/UI/Textarea'
import { komplainService } from '../../services/komplainService'
import { userService } from '../../services/userService'
import toast from 'react-hot-toast'

const KomplainForm = () => {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [users, setUsers] = useState([])
  const [formData, setFormData] = useState({
    judul_komplain: '',
    deskripsi_komplain: '',
    kategori: 'lainnya',
    prioritas: 'berproses',
    penerima_komplain_id: '',
    pihak_terkait: [],
    lampiran: [],
    target_selesai: ''
  })
  const [errors, setErrors] = useState({})
  const [selectedFiles, setSelectedFiles] = useState([])

  const kategoriOptions = [
    { value: 'sistem', label: 'Sistem' },
    { value: 'layanan', label: 'Layanan' },
    { value: 'produk', label: 'Produk' },
    { value: 'lainnya', label: 'Lainnya' }
  ]

  const prioritasOptions = [
    { value: 'mendesak', label: 'Mendesak' },
    { value: 'penting', label: 'Penting' },
    { value: 'berproses', label: 'Berproses' }
  ]

  // Load users for penerima_komplain_id dropdown
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
    .filter(u => u.role === 'admin' || u.role === 'leader')
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

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files)
    setSelectedFiles(prev => [...prev, ...files])
  }

  const removeFile = (index) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index))
  }

  const validateForm = () => {
    const newErrors = {}
    
    if (!formData.judul_komplain.trim()) {
      newErrors.judul_komplain = 'Judul komplain harus diisi'
    }
    
    if (!formData.deskripsi_komplain.trim()) {
      newErrors.deskripsi_komplain = 'Deskripsi komplain harus diisi'
    }
    
    if (!formData.kategori) {
      newErrors.kategori = 'Kategori harus dipilih'
    }
    
    if (!formData.prioritas) {
      newErrors.prioritas = 'Prioritas harus dipilih'
    }
    
    if (!formData.penerima_komplain_id) {
      newErrors.penerima_komplain_id = 'Penerima komplain harus dipilih'
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
      const komplainData = {
        ...formData,
        target_selesai: formData.target_selesai || null,
        lampiran: selectedFiles.map(file => file.name), // For now, just send file names
        pihak_terkait: formData.pihak_terkait
      }

      console.log('📤 Sending komplain data:', komplainData)

      const response = await komplainService.createKomplain(komplainData)
      
      console.log('📥 Response from API:', response)
      
      if (response.success) {
        toast.success('Komplain berhasil ditambahkan!')
        navigate('/komplain')
      } else {
        toast.error(response.message || 'Gagal menambahkan komplain')
      }
    } catch (error) {
      console.error('❌ Error adding komplain:', error)
      console.error('❌ Error details:', error.response?.data)
      toast.error('Gagal menambahkan komplain. Silakan coba lagi.')
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = () => {
    navigate('/komplain')
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
            <h1 className="text-2xl font-bold text-gray-900">Tambah Komplain Baru</h1>
            <p className="text-gray-600 mt-1">Buat komplain baru untuk ditindaklanjuti</p>
          </div>
        </div>
      </div>

      {/* Form Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center">
            <div className="p-2 bg-orange-100 rounded-lg mr-3">
              <AlertTriangle className="h-6 w-6 text-orange-600" />
            </div>
            <div>
              <h3 className="text-lg font-medium text-gray-900">Form Komplain</h3>
              <p className="text-sm text-gray-600">Lengkapi informasi komplain di bawah ini</p>
            </div>
          </div>
        </CardHeader>
        
        <form onSubmit={handleSubmit}>
          <CardBody>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Judul Komplain */}
              <div className="md:col-span-2">
                <Input
                  label="Judul Komplain"
                  name="judul_komplain"
                  value={formData.judul_komplain}
                  onChange={handleChange}
                  placeholder="Masukkan judul komplain"
                  error={errors.judul_komplain}
                  required
                />
              </div>

              {/* Kategori */}
              <Select
                label="Kategori"
                name="kategori"
                value={formData.kategori}
                onChange={handleChange}
                options={kategoriOptions}
                placeholder="Pilih kategori"
                error={errors.kategori}
                required
              />

              {/* Prioritas */}
              <Select
                label="Prioritas"
                name="prioritas"
                value={formData.prioritas}
                onChange={handleChange}
                options={prioritasOptions}
                placeholder="Pilih prioritas"
                error={errors.prioritas}
                required
              />

              {/* Penerima Komplain */}
              <Select
                label="Penerima Komplain"
                name="penerima_komplain_id"
                value={formData.penerima_komplain_id}
                onChange={handleChange}
                options={penerimaOptions}
                placeholder="Pilih penerima"
                error={errors.penerima_komplain_id}
                required
              />

              {/* Target Selesai */}
              <Input
                label="Target Selesai"
                name="target_selesai"
                type="datetime-local"
                value={formData.target_selesai}
                onChange={handleChange}
                placeholder="Pilih target selesai"
              />

              {/* Deskripsi Komplain */}
              <div className="md:col-span-2">
                <Textarea
                  label="Deskripsi Komplain"
                  name="deskripsi_komplain"
                  value={formData.deskripsi_komplain}
                  onChange={handleChange}
                  placeholder="Jelaskan detail komplain Anda..."
                  error={errors.deskripsi_komplain}
                  rows={6}
                  required
                />
              </div>

              {/* File Upload */}
              <div className="md:col-span-2">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Lampiran
                  </label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                    <input
                      type="file"
                      multiple
                      onChange={handleFileChange}
                      className="hidden"
                      id="file-upload"
                      accept="image/*,.pdf,.doc,.docx"
                    />
                    <label
                      htmlFor="file-upload"
                      className="cursor-pointer flex flex-col items-center"
                    >
                      <Upload className="h-8 w-8 text-gray-400 mb-2" />
                      <span className="text-sm text-gray-600">
                        Klik untuk memilih file atau drag & drop
                      </span>
                      <span className="text-xs text-gray-500 mt-1">
                        PNG, JPG, PDF, DOC hingga 10MB
                      </span>
                    </label>
                  </div>
                  
                  {/* Selected Files */}
                  {selectedFiles.length > 0 && (
                    <div className="mt-4 space-y-2">
                      <h4 className="text-sm font-medium text-gray-700">File Terpilih:</h4>
                      <div className="space-y-2">
                        {selectedFiles.map((file, index) => (
                          <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                            <span className="text-sm text-gray-600">{file.name}</span>
                            <button
                              type="button"
                              onClick={() => removeFile(index)}
                              className="text-red-500 hover:text-red-700"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
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
                loading={loading}
                disabled={loading}
                className="flex items-center"
              >
                <Save className="h-4 w-4 mr-2" />
                {loading ? 'Menyimpan...' : 'Simpan Komplain'}
              </Button>
            </div>
          </CardFooter>
        </form>
      </Card>

      {/* Info Card */}
      <Card>
        <CardBody>
          <div className="flex items-start space-x-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <AlertTriangle className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <h4 className="text-sm font-medium text-gray-900 mb-1">Tips Menulis Komplain</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Jelaskan masalah dengan detail dan jelas</li>
                <li>• Sertakan langkah-langkah yang sudah dicoba</li>
                <li>• Pilih kategori dan prioritas yang sesuai</li>
                <li>• Berikan informasi tambahan yang relevan</li>
              </ul>
            </div>
          </div>
        </CardBody>
      </Card>
    </div>
  )
}

export default KomplainForm 