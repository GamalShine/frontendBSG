import React, { useState, useEffect } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { timService } from '../../services/timService'
import { 
  ArrowLeft, 
  Save, 
  Users,
  User,
  Mail,
  Phone,
  MapPin,
  Shield
} from 'lucide-react'
import Card, { CardHeader, CardBody } from '../../components/UI/Card'
import Button from '../../components/UI/Button'
import Input from '../../components/UI/Input'
import Select from '../../components/UI/Select'
import toast from 'react-hot-toast'

const TimBiruForm = () => {
  const navigate = useNavigate()
  const { id } = useParams()
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState({
    nama: '',
    divisi: '',
    posisi: '',
    prestasi: '',
    keterangan: ''
  })
  const [errors, setErrors] = useState({})

  // Dropdown options based on database data
  const divisiOptions = [
    { value: 'BSG PUSAT', label: 'BSG PUSAT' },
    { value: 'BSG BSD', label: 'BSG BSD' },
    { value: 'SOGIL', label: 'SOGIL' },
    { value: 'BSG SIDOARJO', label: 'BSG SIDOARJO' },
    { value: 'BSG BUAH BATU', label: 'BSG BUAH BATU' },
    { value: 'BSG KARAWACI', label: 'BSG KARAWACI' }
  ]

  const posisiOptions = [
    { value: 'KOKI', label: 'KOKI' },
    { value: 'MANAGER', label: 'MANAGER' },
    { value: 'BARISTA', label: 'BARISTA' },
    { value: 'WAITRESS', label: 'WAITRESS' },
    { value: 'SUPERVISOR', label: 'SUPERVISOR' },
    { value: 'PR', label: 'PR' },
    { value: 'KASIR', label: 'KASIR' }
  ]

  const isEditMode = !!id

  useEffect(() => {
    if (isEditMode) {
      loadMember()
    }
  }, [id])

  const loadMember = async () => {
    try {
      setLoading(true)
      const response = await timService.getTimBiruDetail(id)
      console.log('🔍 Tim Biru detail response:', response)
      
      if (response.success) {
        const data = response.data
        setFormData({
          nama: data.nama || '',
          divisi: data.divisi || '',
          posisi: data.posisi || '',
          prestasi: data.prestasi || '',
          keterangan: data.keterangan || ''
        })
      } else {
        toast.error('Gagal memuat data anggota')
        navigate('/tim/biru')
      }
    } catch (error) {
      toast.error('Gagal memuat data anggota')
      console.error('Error loading member:', error)
      navigate('/tim/biru')
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

    if (!formData.nama.trim()) {
      newErrors.nama = 'Nama wajib diisi'
    }

    if (!formData.divisi.trim()) {
      newErrors.divisi = 'Divisi wajib diisi'
    }

    if (!formData.posisi.trim()) {
      newErrors.posisi = 'Posisi wajib diisi'
    }

    if (!formData.prestasi.trim()) {
      newErrors.prestasi = 'Prestasi wajib diisi'
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
      
      // Ensure keterangan is sent as empty string if not filled
      const submitData = {
        ...formData,
        keterangan: formData.keterangan || ''
      }
      
      let response
      if (isEditMode) {
        response = await timService.updateTimBiru(id, submitData)
      } else {
        response = await timService.createTimBiru(submitData)
      }

      console.log('🔍 Tim Biru submit response:', response)

      if (response.success) {
        toast.success(isEditMode ? 'Anggota berhasil diperbarui' : 'Anggota berhasil ditambahkan')
        navigate('/tim/biru')
      } else {
        toast.error(response.message || 'Gagal menyimpan anggota')
      }
    } catch (error) {
      toast.error('Gagal menyimpan anggota')
      console.error('Error saving member:', error)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Memuat data anggota...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <Link to="/tim/biru">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Kembali
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {isEditMode ? 'Edit Anggota Tim Biru' : 'Tambah Anggota Tim Biru'}
            </h1>
            <p className="text-gray-600">
              {isEditMode ? 'Perbarui informasi anggota tim' : 'Tambah anggota baru ke Tim Biru'}
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Form */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <h3 className="text-lg font-semibold text-gray-900">Informasi Anggota</h3>
              </CardHeader>
              <CardBody>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Nama Lengkap *
                      </label>
                      <Input
                        name="nama"
                        value={formData.nama}
                        onChange={handleChange}
                        placeholder="Masukkan nama lengkap..."
                        error={errors.nama}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Divisi *
                      </label>
                      <Select
                        name="divisi"
                        value={formData.divisi}
                        onChange={handleChange}
                        error={errors.divisi}
                        placeholder="Pilih Divisi"
                        options={divisiOptions}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Posisi/Jabatan *
                      </label>
                      <Select
                        name="posisi"
                        value={formData.posisi}
                        onChange={handleChange}
                        error={errors.posisi}
                        placeholder="Pilih Posisi"
                        options={posisiOptions}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Prestasi *
                      </label>
                      <Input
                        name="prestasi"
                        value={formData.prestasi}
                        onChange={handleChange}
                        placeholder="Masukkan prestasi yang diraih..."
                        error={errors.prestasi}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Keterangan
                    </label>
                    <textarea
                      name="keterangan"
                      value={formData.keterangan}
                      onChange={handleChange}
                      placeholder="Masukkan keterangan tambahan..."
                      rows={4}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </CardBody>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Team Info */}
            <Card>
              <CardHeader>
                <h3 className="text-lg font-semibold text-gray-900">Informasi Tim Biru</h3>
              </CardHeader>
              <CardBody>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-4 h-4 bg-blue-600 rounded-full"></div>
                    <span className="text-sm font-medium text-gray-900">Tim Prestasi</span>
                  </div>
                  <div className="text-sm text-gray-600">
                    Tim Biru adalah tim yang mencatat dan mengelola prestasi karyawan dalam perusahaan. Data prestasi ini digunakan untuk evaluasi kinerja dan pengembangan karir.
                  </div>
                </div>
              </CardBody>
            </Card>

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
                        {isEditMode ? 'Update Anggota' : 'Simpan Anggota'}
                      </>
                    )}
                  </Button>
                  
                  <Link to="/tim/biru">
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

export default TimBiruForm 