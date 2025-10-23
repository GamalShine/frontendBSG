import React, { useState, useEffect } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import { trainingService } from '@/services/trainingService'
import { userService } from '@/services/userService'
import { ArrowLeft, Save, Users, RefreshCw, BookOpen } from 'lucide-react'
import Card, { CardHeader, CardBody } from '@/components/UI/Card'
import Button from '@/components/UI/Button'
import Input from '@/components/UI/Input'
import Select from '@/components/UI/Select'
import toast from 'react-hot-toast'

const AdminTrainingForm = ({ inModal = false, onSuccess, onCancel, formId, editingIdOverride = null, initialData = null }) => {
  const navigate = useNavigate()
  const { id: routeId } = useParams()
  const id = editingIdOverride || routeId
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [users, setUsers] = useState([])
  const [usersLoading, setUsersLoading] = useState(true)
  const usersEmpty = users.length === 0
  const [errors, setErrors] = useState({})
  const [formData, setFormData] = useState({
    user_id: '',
    training_dasar: false,
    training_leadership: false,
    training_skill: false,
    training_lanjutan: false,
    catatan: ''
  })

  const isEditMode = !!id

  useEffect(() => {
    loadUsers()
    if (isEditMode) {
      if (initialData) {
        setFormData({
          user_id: initialData.user_id || initialData.id || '',
          training_dasar: !!initialData.training_dasar,
          training_leadership: !!initialData.training_leadership,
          training_skill: !!initialData.training_skill,
          training_lanjutan: !!initialData.training_lanjutan,
          catatan: initialData.catatan || ''
        })
      } else {
        loadTraining()
      }
    }
  }, [id, initialData])

  const loadTraining = async () => {
    try {
      setLoading(true)
      const response = await trainingService.getTrainingById(id)
      
      if (response.success) {
        const d = response.data || {}
        setFormData({
          user_id: d.user_id || d.id || '',
          training_dasar: !!d.training_dasar,
          training_leadership: !!d.training_leadership,
          training_skill: !!d.training_skill,
          training_lanjutan: !!d.training_lanjutan,
          catatan: d.catatan || ''
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

  const loadUsers = async () => {
    // Ambil data user dari tabel users (1x call, limit besar)
    const LIMIT = 1000
    try {
      setUsersLoading(true)
      const res = await userService.getUsers({ page: 1, limit: LIMIT })
      // Normalisasi hasil response agar konsisten menjadi array
      const candidates = [
        res?.data?.data,
        res?.data?.rows,
        res?.data?.users,
        res?.data?.list,
        res?.data,
        res?.rows,
        res?.users,
        res?.list,
        Array.isArray(res) ? res : null
      ]
      let list = []
      for (const c of candidates) { if (Array.isArray(c)) { list = c; break } }

      setUsers(list)
      console.log('[AdminTrainingForm] users loaded total:', Array.isArray(list) ? list.length : 0)
      if (!list.length) {
        toast.error('Tidak ada data karyawan yang tersedia pada tabel users')
      }
    } catch (e) {
      setUsers([])
      toast.error('Gagal memuat daftar karyawan dari tabel users')
      console.error('loadUsers error:', e)
    } finally {
      setUsersLoading(false)
    }
  }

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
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

    if (!formData.user_id) {
      newErrors.user_id = 'Pilih karyawan terlebih dahulu'
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

      // Pastikan user terpilih valid dan bisa diedit (bukan owner)
      const selected = users.find(u => String(u?.id ?? u?.user_id ?? u?._id) === String(formData.user_id))
      if (!selected) {
        toast.error('Pengguna tidak ditemukan atau tidak dapat diedit')
        setSaving(false)
        return
      }
      if (String(selected?.role || '').toLowerCase() === 'owner') {
        toast.error('Status training untuk role Owner tidak dapat diedit')
        setSaving(false)
        return
      }

      const payload = {
        user_id: Number(formData.user_id),
        training_dasar: !!formData.training_dasar,
        training_leadership: !!formData.training_leadership,
        training_skill: !!formData.training_skill,
        training_lanjutan: !!formData.training_lanjutan,
        catatan: formData.catatan || ''
      }

      const response = isEditMode
        ? await trainingService.updateTraining(id, payload)
        : await trainingService.createTraining(payload)

      if (response.success) {
        toast.success(isEditMode ? 'Training berhasil diperbarui' : 'Training berhasil dibuat')
        if (typeof onSuccess === 'function') {
          onSuccess()
        } else {
          navigate('/admin/training')
        }
      } else {
        const msg = response.message || 'Gagal menyimpan training'
        toast.error(msg)
      }
    } catch (error) {
      const msg = error?.message || error?.response?.data?.message || 'Gagal menyimpan training'
      toast.error(msg)
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
      {!inModal && (
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
                {isEditMode ? 'Edit Status Training Karyawan' : 'Tambah Status Training Karyawan'}
              </h1>
              <p className="text-gray-600">
                {isEditMode ? 'Perbarui status training karyawan' : 'Set status training untuk karyawan'}
              </p>
            </div>
          </div>
        </div>
      )}

      <form id={formId} onSubmit={handleSubmit}>
        <div className={inModal ? "grid grid-cols-1 gap-6" : "grid grid-cols-1 lg:grid-cols-3 gap-6"}>
          {/* Main Form */}
          <div className={inModal ? "space-y-6" : "lg:col-span-2 space-y-6"}>
            {inModal ? (
              <>
                <div className="space-y-2">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-black mb-2 flex items-center gap-2">
                        <Users className="h-4 w-4 text-gray-500" />
                        <span>Pilih Karyawan *</span>
                      </label>
                      {usersLoading ? (
                        <div className="text-sm text-gray-500">Memuat daftar karyawan...</div>
                      ) : (
                        <>
                          {(() => {
                            const options = users
                              .map(u => {
                                const uid = (u?.id ?? u?.user_id ?? u?._id)
                                if (!uid) return null
                                // Backend melarang edit training untuk role 'owner'
                                if (String(u?.role || '').toLowerCase() === 'owner') return null
                                const label = u?.nama || u?.username || u?.full_name || u?.email || `User ${uid}`
                                return { value: String(uid), label }
                              })
                              .filter(Boolean)

                            return (
                              <Select
                                name="user_id"
                                value={String(formData.user_id || '')}
                                onValueChange={(val) => handleChange({ target: { name: 'user_id', value: val, type: 'text' } })}
                                options={options}
                                placeholder={users.length ? '-- Pilih karyawan --' : 'Tidak ada opsi tersedia'}
                                disabled={isEditMode || users.length === 0}
                                buttonClassName="py-2 text-sm"
                              />
                            )
                          })()}
                          {users.length === 0 && (
                            <>
                              <Input
                                type="number"
                                name="user_id"
                                value={formData.user_id}
                                onChange={handleChange}
                                placeholder="Masukkan User ID secara manual"
                                className="mt-2"
                              />
                              <p className="text-xs text-gray-500 mt-1">Tidak ada opsi dari tabel users. Isi User ID secara manual, lalu simpan.</p>
                            </>
                          )}
                        </>
                      )}
                      {errors.user_id && (
                        <p className="text-sm text-red-600 mt-1">{errors.user_id}</p>
                      )}
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="text-sm font-medium text-black mb-2 flex items-center gap-2">
                    <BookOpen className="h-4 w-4 text-gray-500" />
                    <span>Status Training</span>
                  </div>
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <label className="flex items-center gap-2">
                        <input type="checkbox" name="training_dasar" checked={formData.training_dasar} onChange={handleChange} />
                        <span className="flex items-center gap-2">Training Dasar</span>
                      </label>
                      <label className="flex items-center gap-2">
                        <input type="checkbox" name="training_leadership" checked={formData.training_leadership} onChange={handleChange} />
                        <span className="flex items-center gap-2">Training Leadership</span>
                      </label>
                      <label className="flex items-center gap-2">
                        <input type="checkbox" name="training_skill" checked={formData.training_skill} onChange={handleChange} />
                        <span className="flex items-center gap-2">Training Skill</span>
                      </label>
                      <label className="flex items-center gap-2">
                        <input type="checkbox" name="training_lanjutan" checked={formData.training_lanjutan} onChange={handleChange} />
                        <span className="flex items-center gap-2">Training Lanjutan</span>
                      </label>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <>
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold text-gray-900">Pilih Karyawan</h3>
                      {!inModal && (
                        <button
                          type="button"
                          onClick={loadUsers}
                          className="inline-flex items-center gap-2 text-sm px-3 py-1 rounded border border-gray-300 hover:bg-gray-50"
                        >
                          <RefreshCw className="h-4 w-4" /> Muat ulang
                        </button>
                      )}
                    </div>
                  </CardHeader>
                  <CardBody className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                        <Users className="h-4 w-4 text-gray-500" />
                        <span>Pilih Karyawan *</span>
                      </label>
                      {usersLoading ? (
                        <div className="text-sm text-gray-500">Memuat daftar karyawan...</div>
                      ) : (
                        <>
                          {(() => {
                            const options = users
                              .map(u => {
                                const uid = (u?.id ?? u?.user_id ?? u?._id)
                                if (!uid) return null
                                // Backend melarang edit training untuk role 'owner'
                                if (String(u?.role || '').toLowerCase() === 'owner') return null
                                const label = u?.nama || u?.username || u?.full_name || u?.email || `User ${uid}`
                                return { value: String(uid), label }
                              })
                              .filter(Boolean)

                            return (
                              <Select
                                name="user_id"
                                value={String(formData.user_id || '')}
                                onValueChange={(val) => handleChange({ target: { name: 'user_id', value: val, type: 'text' } })}
                                options={options}
                                placeholder={users.length ? '-- Pilih karyawan --' : 'Tidak ada opsi tersedia'}
                                disabled={isEditMode || users.length === 0}
                                buttonClassName="py-2 text-sm"
                              />
                            )
                          })()}
                          {users.length === 0 && (
                            <>
                              <Input
                                type="number"
                                name="user_id"
                                value={formData.user_id}
                                onChange={handleChange}
                                placeholder="Masukkan User ID secara manual"
                                className="mt-2"
                              />
                              <p className="text-xs text-gray-500 mt-1">Tidak ada opsi dari tabel users. Isi User ID secara manual, lalu simpan.</p>
                            </>
                          )}
                        </>
                      )}
                      {errors.user_id && (
                        <p className="text-sm text-red-600 mt-1">{errors.user_id}</p>
                      )}
                    </div>
                  </CardBody>
                </Card>

                <Card>
                  <CardHeader>
                    <div className="text-sm font-medium text-black mb-2 flex items-center gap-2">
                      <BookOpen className="h-4 w-4 text-gray-500" />
                      <span>Status Training</span>
                    </div>
                  </CardHeader>
                  <CardBody className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <label className="flex items-center gap-2">
                        <input type="checkbox" name="training_dasar" checked={formData.training_dasar} onChange={handleChange} />
                        <span className="flex items-center gap-2">Training Dasar</span>
                      </label>
                      <label className="flex items-center gap-2">
                        <input type="checkbox" name="training_leadership" checked={formData.training_leadership} onChange={handleChange} />
                        <span className="flex items-center gap-2">Training Leadership</span>
                      </label>
                      <label className="flex items-center gap-2">
                        <input type="checkbox" name="training_skill" checked={formData.training_skill} onChange={handleChange} />
                        <span className="flex items-center gap-2">Training Skill</span>
                      </label>
                      <label className="flex items-center gap-2">
                        <input type="checkbox" name="training_lanjutan" checked={formData.training_lanjutan} onChange={handleChange} />
                        <span className="flex items-center gap-2">Training Lanjutan</span>
                      </label>
                    </div>

                    {!inModal && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Catatan</label>
                        <Input name="catatan" value={formData.catatan} onChange={handleChange} placeholder="Catatan tambahan (opsional)" />
                      </div>
                    )}
                  </CardBody>
                </Card>
              </>
            )}
          </div>

        {/* Sidebar */}
        {!inModal && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <h3 className="text-lg font-semibold text-gray-900">Aksi</h3>
              </CardHeader>
              <CardBody>
                <div className="space-y-3">
                  <Button type="submit" className="w-full" disabled={saving}>
                    {saving ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Menyimpan...
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4 mr-2" />
                        {isEditMode ? 'Update Status' : 'Simpan Status'}
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
        )}
        </div>
      </form>
    </div>
  )
}

export default AdminTrainingForm