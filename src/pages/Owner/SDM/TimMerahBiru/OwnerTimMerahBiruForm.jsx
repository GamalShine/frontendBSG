import React, { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { timService } from '../../../../services/timService'
import { 
  ArrowLeft,
  Save,
  User,
  Building,
  Award,
  AlertTriangle
} from 'lucide-react'
import toast from 'react-hot-toast'

const OwnerTimMerahBiruForm = () => {
  const navigate = useNavigate()
  const { type } = useParams() // 'merah' or 'biru'
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    nama: '',
    divisi: '',
    posisi: '',
    status: 'SP1', // Only for tim merah
    prestasi: '', // Only for tim biru
    keterangan: ''
  })

  const divisiOptions = [
    'BSG PUSAT',
    'BSG BSD',
    'SOGIL',
    'BSG SIDOARJO',
    'BSG BUAH BATU',
    'BSG KARAWACI'
  ]

  const statusOptions = [
    { value: 'SP1', label: 'Surat Peringatan 1' },
    { value: 'SP2', label: 'Surat Peringatan 2' },
    { value: 'SP3', label: 'Surat Peringatan 3' }
  ]

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!formData.nama || !formData.divisi || !formData.posisi) {
      toast.error('Mohon lengkapi data yang wajib diisi')
      return
    }

    if (type === 'merah' && !formData.status) {
      toast.error('Status wajib diisi untuk Tim Merah')
      return
    }

    if (type === 'biru' && !formData.prestasi) {
      toast.error('Prestasi wajib diisi untuk Tim Biru')
      return
    }

    try {
      setLoading(true)
      let response

      if (type === 'merah') {
        response = await timService.createTimMerahForOwner(formData)
      } else {
        response = await timService.createTimBiruForOwner(formData)
      }

      if (response.success) {
        toast.success(`Tim ${type === 'merah' ? 'Merah' : 'Biru'} berhasil ditambahkan`)
        navigate(`/owner/sdm/tim-merah-biru`)
      } else {
        toast.error(response.message || 'Gagal menambahkan data')
      }
    } catch (error) {
      toast.error('Terjadi kesalahan saat menyimpan data')
      console.error('Error creating tim:', error)
    } finally {
      setLoading(false)
    }
  }

  const isTimMerah = type === 'merah'

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate(`/owner/sdm/tim-merah-biru`)}
            className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Tambah Tim {isTimMerah ? 'Merah' : 'Biru'}
            </h1>
            <p className="text-gray-600">
              Form untuk menambahkan data tim {isTimMerah ? 'merah' : 'biru'} baru
            </p>
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="bg-white rounded-lg shadow p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Nama */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <User className="inline h-4 w-4 mr-2" />
              Nama Karyawan *
            </label>
            <input
              type="text"
              name="nama"
              value={formData.nama}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Masukkan nama karyawan"
              required
            />
          </div>

          {/* Divisi */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Building className="inline h-4 w-4 mr-2" />
              Divisi *
            </label>
            <select
              name="divisi"
              value={formData.divisi}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            >
              <option value="">Pilih Divisi</option>
              {divisiOptions.map((divisi) => (
                <option key={divisi} value={divisi}>
                  {divisi}
                </option>
              ))}
            </select>
          </div>

          {/* Posisi */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <User className="inline h-4 w-4 mr-2" />
              Posisi *
            </label>
            <input
              type="text"
              name="posisi"
              value={formData.posisi}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Masukkan posisi/jabatan"
              required
            />
          </div>

          {/* Status (Tim Merah) or Prestasi (Tim Biru) */}
          {isTimMerah ? (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <AlertTriangle className="inline h-4 w-4 mr-2" />
                Status Surat Peringatan *
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              >
                {statusOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          ) : (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Award className="inline h-4 w-4 mr-2" />
                Prestasi *
              </label>
              <input
                type="text"
                name="prestasi"
                value={formData.prestasi}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Masukkan prestasi yang diraih"
                required
              />
            </div>
          )}

          {/* Keterangan */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Keterangan
            </label>
            <textarea
              name="keterangan"
              value={formData.keterangan}
              onChange={handleInputChange}
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Tambahkan keterangan tambahan (opsional)"
            />
          </div>

          {/* Submit Button */}
          <div className="flex justify-end gap-4 pt-4">
            <button
              type="button"
              onClick={() => navigate(`/owner/sdm/tim-merah-biru`)}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={loading}
              className={`px-6 py-2 text-white rounded-lg hover:opacity-90 flex items-center gap-2 ${
                isTimMerah ? 'bg-red-600 hover:bg-red-700' : 'bg-blue-600 hover:bg-blue-700'
              } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Menyimpan...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  Simpan
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default OwnerTimMerahBiruForm
