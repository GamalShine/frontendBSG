import React, { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Save, AlertTriangle, Upload, X } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import Card, { CardHeader, CardBody, CardFooter } from '../../components/UI/Card'
import Button from '../../components/UI/Button'
import Input from '../../components/UI/Input'
import Select from '../../components/UI/Select'
import Textarea from '../../components/UI/Textarea'
import LoadingSpinner from '../../components/UI/LoadingSpinner'
import { komplainService } from '../../services/komplainService'
import { userService } from '../../services/userService'
import toast from 'react-hot-toast'

const KomplainForm = () => {
  const navigate = useNavigate()
  const { id } = useParams()
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

  const isEditMode = !!id

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

  // Load komplain data if in edit mode
  useEffect(() => {
    const loadKomplain = async () => {
      if (isEditMode && id) {
        try {
          setLoading(true)
          const response = await komplainService.getKomplainById(id)
          console.log('🔍 Komplain detail response:', response)
          
          if (response.success && response.data) {
            const data = response.data
            setFormData({
              judul_komplain: data.judul_komplain || '',
              deskripsi_komplain: data.deskripsi_komplain || '',
              kategori: data.kategori || 'lainnya',
              prioritas: data.prioritas || 'berproses',
              penerima_komplain_id: data.penerima_komplain_id || '',
              pihak_terkait: data.pihak_terkait || [],
              lampiran: data.lampiran || [],
              target_selesai: data.target_selesai || ''
            })
          } else {
            toast.error('Gagal memuat data komplain')
            navigate('/komplain')
          }
        } catch (error) {
          toast.error('Gagal memuat data komplain')
          console.error('Error loading komplain:', error)
          navigate('/komplain')
        } finally {
          setLoading(false)
        }
      }
    }
    loadKomplain()
  }, [id, isEditMode, navigate])

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

      if (isEditMode && id) {
        // Update existing komplain
        const response = await komplainService.updateKomplain(id, komplainData)
        console.log('📥 Response from API (Update):', response)
        if (response.success) {
          toast.success('Komplain berhasil diperbarui!')
          navigate('/komplain')
        } else {
          toast.error(response.message || 'Gagal memperbarui komplain')
        }
      } else {
        // Create new komplain
        const response = await komplainService.createKomplain(komplainData)
        console.log('📥 Response from API (Create):', response)
        if (response.success) {
          toast.success('Komplain berhasil ditambahkan!')
          navigate('/komplain')
        } else {
          toast.error(response.message || 'Gagal menambahkan komplain')
        }
      }
    } catch (error) {
      console.error('❌ Error adding/updating komplain:', error)
      console.error('❌ Error details:', error.response?.data)
      toast.error('Gagal menambahkan/memperbarui komplain. Silakan coba lagi.')
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = () => {
    navigate('/komplain')
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header Section */}
      <div className="bg-white rounded-lg shadow-sm border mb-6">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate('/komplain')}
              className="p-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {isEditMode ? 'Edit Komplain' : 'Tambah Komplain'}
              </h1>
              <p className="text-gray-600">
                {isEditMode ? 'Perbarui informasi komplain' : 'Buat komplain baru untuk outlet'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Form Section */}
      <div className="bg-white rounded-lg shadow-sm border">
        <form onSubmit={handleSubmit}>
          {/* Informasi Komplain */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-2 bg-red-100 rounded-lg">
                <AlertTriangle className="h-5 w-5 text-red-600" />
              </div>
              <label className="text-lg font-semibold text-gray-900">
                Informasi Komplain
              </label>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Judul Komplain *
                </label>
                <input
                  name="judul_komplain"
                  value={formData.judul_komplain}
                  onChange={handleChange}
                  placeholder="Masukkan judul komplain..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                />
                {errors.judul_komplain && <p className="text-red-500 text-sm mt-1">{errors.judul_komplain}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Kategori *
                </label>
                <select
                  name="kategori"
                  value={formData.kategori}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                >
                  {kategoriOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                {errors.kategori && <p className="text-red-500 text-sm mt-1">{errors.kategori}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Prioritas *
                </label>
                <select
                  name="prioritas"
                  value={formData.prioritas}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                >
                  {prioritasOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                {errors.prioritas && <p className="text-red-500 text-sm mt-1">{errors.prioritas}</p>}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Penerima Komplain *
                </label>
                <select
                  name="penerima_komplain_id"
                  value={formData.penerima_komplain_id}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                >
                  <option value="">Pilih Penerima</option>
                  {penerimaOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                {errors.penerima_komplain_id && <p className="text-red-500 text-sm mt-1">{errors.penerima_komplain_id}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Target Selesai
                </label>
                <input
                  name="target_selesai"
                  type="datetime-local"
                  value={formData.target_selesai}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Deskripsi Komplain */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-2 bg-blue-100 rounded-lg">
                <AlertTriangle className="h-5 w-5 text-blue-600" />
              </div>
              <label className="text-lg font-semibold text-gray-900">
                Deskripsi Komplain
              </label>
            </div>
            
            <textarea
              name="deskripsi_komplain"
              value={formData.deskripsi_komplain}
              onChange={handleChange}
              placeholder="Jelaskan detail komplain Anda..."
              rows={6}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
            />
            {errors.deskripsi_komplain && <p className="text-red-500 text-sm mt-1">{errors.deskripsi_komplain}</p>}
          </div>

          {/* Lampiran */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-2 bg-green-100 rounded-lg">
                <Upload className="h-5 w-5 text-green-600" />
              </div>
              <label className="text-lg font-semibold text-gray-900">
                Lampiran
              </label>
            </div>
            
            <div className="space-y-4">
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
                <div className="space-y-2">
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

          {/* Submit Buttons */}
          <div className="flex space-x-4 p-6">
            <button
              type="button"
              onClick={() => navigate('/komplain')}
              className="px-6 py-3 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center space-x-2 px-6 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              ) : (
                <Save className="h-4 w-4" />
              )}
              <span>{loading ? 'Menyimpan...' : (isEditMode ? 'Perbarui' : 'Simpan')}</span>
            </button>
          </div>
        </form>
      </div>

      {/* Tips Card */}
      <div className="bg-white rounded-lg shadow-sm border mt-6">
        <div className="p-6">
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
        </div>
      </div>
    </div>
  )
}

export default KomplainForm 