import React, { useState, useEffect } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import api from '../../services/api'
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

const TimMerahForm = () => {
  const navigate = useNavigate()
  const { id } = useParams()
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState({
    user_id: '',
    status: 'SP1',
    keterangan: ''
  })
  const [errors, setErrors] = useState({})
  const [users, setUsers] = useState([])

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

  useEffect(() => {
    // Load daftar user untuk dipilih
    (async () => {
      try {
        const resp = await api.get('/users')
        const list = Array.isArray(resp?.data?.data) ? resp.data.data : (Array.isArray(resp?.data) ? resp.data : [])
        setUsers(list.map(u => ({ id: u.id, nama: u.nama || u.username || `User ${u.id}` })))
      } catch (e) {
        setUsers([])
      }
    })()
  }, [])

  const loadMember = async () => {
    try {
      setLoading(true)
      const response = await timService.getTimMerahDetail(id)
      console.log('🔍 Tim Merah detail response:', response)
      
      if (response.success) {
        const data = response.data
        setFormData({
          user_id: data.user_id ? String(data.user_id) : '',
          status: data.status || 'SP1',
          keterangan: data.keterangan || ''
        })
      } else {
        toast.error('Gagal memuat data anggota')
        navigate('/tim/merah')
      }
    } catch (error) {
      toast.error('Gagal memuat data anggota')
      console.error('Error loading member:', error)
      navigate('/tim/merah')
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

    if (!formData.status) {
      newErrors.status = 'Status peringatan wajib dipilih'
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
      
      const submitData = {
        user_id: formData.user_id ? Number(formData.user_id) : null,
        status: formData.status,
        keterangan: formData.keterangan || ''
      }

      let response
      if (isEditMode) {
        response = await timService.updateTimMerah(id, submitData)
      } else {
        response = await timService.createTimMerah(submitData)
      }

      console.log('🔍 Tim Merah submit response:', response)

      if (response.success) {
        toast.success(isEditMode ? 'Anggota berhasil diperbarui' : 'Anggota berhasil ditambahkan')
        navigate('/tim/merah')
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
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header Section */}
      <div className="bg-white rounded-lg shadow-sm border mb-6">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center space-x-4">
            <Link to="/tim/merah">
              <button className="p-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors">
                <ArrowLeft className="h-4 w-4" />
              </button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {isEditMode ? 'Edit Anggota Tim Merah' : 'Tambah Anggota Tim Merah'}
              </h1>
              <p className="text-gray-600">
                {isEditMode ? 'Perbarui informasi anggota tim' : 'Tambah anggota baru ke Tim Merah'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Form Section */}
      <div className="bg-white rounded-lg shadow-sm border">
        <form onSubmit={handleSubmit}>
          {/* Informasi Anggota */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-2 bg-red-100 rounded-lg">
                <User className="h-5 w-5 text-red-600" />
              </div>
              <label className="text-lg font-semibold text-gray-900">
                Informasi Anggota
              </label>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Pilih Karyawan (user)
                </label>
                <select
                  name="user_id"
                  value={formData.user_id}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                >
                  <option value="">Pilih User</option>
                  {users.map(u => (
                    <option key={u.id} value={u.id}>{u.nama}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status Peringatan *
                </label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                >
                  <option value="SP1">SP1 - Surat Peringatan 1</option>
                  <option value="SP2">SP2 - Surat Peringatan 2</option>
                  <option value="SP3">SP3 - Surat Peringatan 3</option>
                </select>
                {errors.status && <p className="text-red-500 text-sm mt-1">{errors.status}</p>}
              </div>
            </div>
          </div>

          {/* Keterangan */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-2 bg-orange-100 rounded-lg">
                <Shield className="h-5 w-5 text-orange-600" />
              </div>
              <label className="text-lg font-semibold text-gray-900">
                Keterangan
              </label>
            </div>
            
            <textarea
              name="keterangan"
              value={formData.keterangan}
              onChange={handleChange}
              placeholder="Masukkan keterangan tambahan..."
              rows={4}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
            />
          </div>

          {/* Submit Buttons */}
          <div className="flex space-x-4 p-6">
            <button
              type="button"
              onClick={() => navigate('/tim/merah')}
              className="px-6 py-3 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex items-center space-x-2 px-6 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              ) : (
                <Save className="h-4 w-4" />
              )}
              <span>{saving ? 'Menyimpan...' : (isEditMode ? 'Perbarui' : 'Simpan')}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default TimMerahForm 