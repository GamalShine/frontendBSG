import React, { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Save, CheckSquare, Calendar, User, ChevronRight } from 'lucide-react'
import { tugasService } from '../../../services/tugasService'
import { userService } from '../../../services/userService'
import toast from 'react-hot-toast'

const AdminTugasForm = () => {
  const navigate = useNavigate()
  const { id } = useParams()
  const isEditMode = !!id
  
  const [loading, setLoading] = useState(false)
  const [users, setUsers] = useState([])
  const [formData, setFormData] = useState({
    judul_tugas: '',
    keterangan_tugas: '',
    pemberi_tugas: '',
    penerima_tugas: '',
    skala_prioritas: 'berproses',
    target_selesai: '',
    pihak_terkait: [],
    lampiran: [],
    status: 'belum',
    rating: '',
    catatan: ''
  })
  const [errors, setErrors] = useState({})

  const skalaPrioritasOptions = [
    { value: 'mendesak', label: 'Mendesak' },
    { value: 'penting', label: 'Penting' },
    { value: 'berproses', label: 'Berproses' }
  ]

  const statusOptions = [
    { value: 'belum', label: 'Belum' },
    { value: 'proses', label: 'Proses' },
    { value: 'selesai', label: 'Selesai' },
    { value: 'revisi', label: 'Revisi' }
  ]

  // Load users for dropdowns
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

  // Load task data if editing
  useEffect(() => {
    if (isEditMode) {
      const loadTask = async () => {
        try {
          setLoading(true)
          const response = await tugasService.getTugasById(id)
          if (response.success) {
            const task = response.data
            setFormData({
              judul_tugas: task.judul_tugas || '',
              keterangan_tugas: task.keterangan_tugas || '',
              pemberi_tugas: task.pemberi_tugas?.toString() || '',
              penerima_tugas: task.penerima_tugas?.toString() || '',
              skala_prioritas: task.skala_prioritas || 'berproses',
              target_selesai: task.target_selesai ? new Date(task.target_selesai).toISOString().split('T')[0] : '',
              pihak_terkait: Array.isArray(task.pihak_terkait) ? task.pihak_terkait : [],
              lampiran: Array.isArray(task.lampiran) ? task.lampiran : [],
              status: task.status || 'belum',
              rating: task.rating?.toString() || '',
              catatan: task.catatan || ''
            })
          }
        } catch (error) {
          toast.error('Gagal memuat data tugas')
          console.error('Error loading task:', error)
        } finally {
          setLoading(false)
        }
      }
      loadTask()
    }
  }, [id, isEditMode])

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

  const handleMultiSelectChange = (e) => {
    const { name, value } = e.target
    const selectedOptions = Array.from(e.target.selectedOptions, option => option.value)
    setFormData(prev => ({
      ...prev,
      [name]: selectedOptions
    }))
  }

  const validateForm = () => {
    const newErrors = {}

    if (!formData.judul_tugas.trim()) {
      newErrors.judul_tugas = 'Judul tugas harus diisi'
    }

    if (!formData.keterangan_tugas.trim()) {
      newErrors.keterangan_tugas = 'Keterangan tugas harus diisi'
    }

    if (!formData.pemberi_tugas) {
      newErrors.pemberi_tugas = 'Pemberi tugas harus dipilih'
    }

    if (!formData.penerima_tugas) {
      newErrors.penerima_tugas = 'Penerima tugas harus dipilih'
    }

    if (!formData.target_selesai) {
      newErrors.target_selesai = 'Target selesai harus diisi'
    }

    if (formData.rating && (parseInt(formData.rating) < 1 || parseInt(formData.rating) > 5)) {
      newErrors.rating = 'Rating harus antara 1-5'
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
      const tugasData = {
        ...formData,
        pemberi_tugas: parseInt(formData.pemberi_tugas),
        penerima_tugas: parseInt(formData.penerima_tugas),
        rating: formData.rating ? parseInt(formData.rating) : null
      }

      let response
      if (isEditMode) {
        response = await tugasService.updateTugas(id, tugasData)
      } else {
        response = await tugasService.createTugas(tugasData)
      }
      
      if (response.success) {
        toast.success(isEditMode ? 'Tugas berhasil diperbarui!' : 'Tugas berhasil ditambahkan!')
        navigate('/admin/tugas')
      } else {
        toast.error(response.message || `Gagal ${isEditMode ? 'memperbarui' : 'menambahkan'} tugas`)
      }
    } catch (error) {
      console.error('Error saving tugas:', error)
      toast.error(`Gagal ${isEditMode ? 'memperbarui' : 'menambahkan'} tugas. Silakan coba lagi.`)
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = () => {
    navigate('/admin/tugas')
  }

  const userOptions = users
    .filter(u => u.status === 'active' && u.status_deleted === 0)
    .map(user => ({
      value: user.id.toString(),
      label: `${user.nama} (${user.role})`
    }))

  if (loading && isEditMode) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Memuat data tugas...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header - Dark Red (WhatsApp-like) */}
      <div className="bg-red-800 text-white">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <button 
                onClick={handleCancel}
                className="p-2 text-white hover:bg-red-700 rounded-full transition-colors"
              >
                <ChevronRight className="h-5 w-5 rotate-180" />
              </button>
              <div>
                <div className="text-xs font-medium text-red-200">H01-S4</div>
                <div className="text-lg font-bold">
                  {isEditMode ? 'Edit Tugas' : 'Tambah Tugas Baru'}
                </div>
              </div>
            </div>
            <button className="p-2 text-white hover:bg-red-700 rounded-full transition-colors">
              <div className="w-1 h-1 bg-white rounded-full mb-1"></div>
              <div className="w-1 h-1 bg-white rounded-full mb-1"></div>
              <div className="w-1 h-1 bg-white rounded-full"></div>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-6">
        <div className="max-w-4xl mx-auto">
          {/* Page Header */}
          <div className="mb-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {isEditMode ? 'Edit Tugas' : 'Tambah Tugas Baru'}
                </h1>
                <p className="text-gray-600">
                  {isEditMode ? 'Perbarui informasi tugas yang ada' : 'Buat tugas baru untuk tim'}
                </p>
              </div>
            </div>
          </div>

          {/* Form */}
          <div className="bg-white rounded-lg shadow-sm border">
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {/* Basic Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Judul Tugas <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="judul_tugas"
                    value={formData.judul_tugas}
                    onChange={handleChange}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent ${
                      errors.judul_tugas ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Masukkan judul tugas"
                  />
                  {errors.judul_tugas && (
                    <p className="mt-1 text-sm text-red-600">{errors.judul_tugas}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Skala Prioritas <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="skala_prioritas"
                    value={formData.skala_prioritas}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  >
                    {skalaPrioritasOptions.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Keterangan Tugas <span className="text-red-500">*</span>
                </label>
                <textarea
                  name="keterangan_tugas"
                  value={formData.keterangan_tugas}
                  onChange={handleChange}
                  rows={4}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent ${
                    errors.keterangan_tugas ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Jelaskan detail tugas yang harus dilakukan"
                />
                {errors.keterangan_tugas && (
                  <p className="mt-1 text-sm text-red-600">{errors.keterangan_tugas}</p>
                )}
              </div>

              {/* Assignment Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Pemberi Tugas <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="pemberi_tugas"
                    value={formData.pemberi_tugas}
                    onChange={handleChange}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent ${
                      errors.pemberi_tugas ? 'border-red-500' : 'border-gray-300'
                    }`}
                  >
                    <option value="">Pilih pemberi tugas</option>
                    {userOptions.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                  {errors.pemberi_tugas && (
                    <p className="mt-1 text-sm text-red-600">{errors.pemberi_tugas}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Penerima Tugas <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="penerima_tugas"
                    value={formData.penerima_tugas}
                    onChange={handleChange}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent ${
                      errors.penerima_tugas ? 'border-red-500' : 'border-gray-300'
                    }`}
                  >
                    <option value="">Pilih penerima tugas</option>
                    {userOptions.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                  {errors.penerima_tugas && (
                    <p className="mt-1 text-sm text-red-600">{errors.penerima_tugas}</p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Pihak Terkait
                </label>
                <select
                  name="pihak_terkait"
                  value={formData.pihak_terkait}
                  onChange={handleMultiSelectChange}
                  multiple
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                >
                  {userOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                <p className="mt-1 text-sm text-gray-500">
                  Tekan Ctrl (atau Cmd di Mac) untuk memilih multiple
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Target Selesai <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  name="target_selesai"
                  value={formData.target_selesai}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent ${
                    errors.target_selesai ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.target_selesai && (
                  <p className="mt-1 text-sm text-red-600">{errors.target_selesai}</p>
                )}
              </div>

              {/* Additional Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Status
                  </label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  >
                    {statusOptions.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Rating (1-5)
                  </label>
                  <input
                    type="number"
                    name="rating"
                    value={formData.rating}
                    onChange={handleChange}
                    min="1"
                    max="5"
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent ${
                      errors.rating ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Masukkan rating (opsional)"
                  />
                  {errors.rating && (
                    <p className="mt-1 text-sm text-red-600">{errors.rating}</p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Catatan Tambahan
                </label>
                <textarea
                  name="catatan"
                  value={formData.catatan}
                  onChange={handleChange}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  placeholder="Catatan tambahan untuk tugas (opsional)"
                />
              </div>

              {/* Form Actions */}
              <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
                <button
                  type="button"
                  onClick={handleCancel}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Menyimpan...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      {isEditMode ? 'Update Tugas' : 'Simpan Tugas'}
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdminTugasForm
