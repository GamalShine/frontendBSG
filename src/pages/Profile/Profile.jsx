import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { userService } from '../../services/userService'
import { authService } from '../../services/authService'
import { API_CONFIG } from '../../config/constants'
import {
  User,
  Mail,
  CheckCircle2,
  Lock,
  HelpCircle,
  MessageCircle,
  Edit,
  Save,
  X,
} from 'lucide-react'
import toast from 'react-hot-toast'

const Profile = () => {
  const { user, updateUser } = useAuth()
  const [isEditing, setIsEditing] = useState(false)
  const [loading, setLoading] = useState(false)
  const [totalTugas, setTotalTugas] = useState(0)
  const [training, setTraining] = useState([
    { id: 1, title: 'Training Dasar', desc: 'Fundamental skills & knowledge', done: false },
    { id: 2, title: 'Training Leadership', desc: 'Management & leadership skills', done: false },
    { id: 3, title: 'Training Skill', desc: 'Technical & professional skills', done: false },
    { id: 4, title: 'Training Lanjutan', desc: 'Advanced & specialized training', done: false },
  ])
  const [latestUser, setLatestUser] = useState(null)
  const [profileError, setProfileError] = useState(false)
  const [showPasswordModal, setShowPasswordModal] = useState(false)
  const [pwdForm, setPwdForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' })

  const [formData, setFormData] = useState({
    nama: '',
    username: '',
    email: ''
  })

  useEffect(() => {
    if (user) {
      setFormData({
        nama: user.nama || '',
        username: user.username || '',
        email: user.email || ''
      })
      // TODO: tarik statistik asli jika endpoint tersedia
      // Placeholder: total tugas 0
      setTotalTugas(Number(user?.stats?.totalTugas || 0))
      // Set training progress dari data user di database
      setTraining([
        { id: 1, title: 'Training Dasar', desc: 'Fundamental skills & knowledge', done: Boolean(user?.training_dasar) },
        { id: 2, title: 'Training Leadership', desc: 'Management & leadership skills', done: Boolean(user?.training_leadership) },
        { id: 3, title: 'Training Skill', desc: 'Technical & professional skills', done: Boolean(user?.training_skill) },
        { id: 4, title: 'Training Lanjutan', desc: 'Advanced & specialized training', done: Boolean(user?.training_lanjutan) },
      ])
    }
  }, [user])

  // Reset error fallback ketika path foto berubah
  useEffect(() => {
    const pathNow = (latestUser?.profile || user?.profile) || ''
    setProfileError(false)
  }, [latestUser?.profile, user?.profile])

  // Pastikan progress training sesuai data terbaru di database
  useEffect(() => {
    const fetchLatestUser = async () => {
      try {
        if (!user?.id) return
        const res = await userService.getUserById(user.id)
        const data = res?.data || res // normalisasi bentuk respons
        setLatestUser(data)
        setTraining([
          { id: 1, title: 'Training Dasar', desc: 'Fundamental skills & knowledge', done: Boolean(data?.training_dasar) },
          { id: 2, title: 'Training Leadership', desc: 'Management & leadership skills', done: Boolean(data?.training_leadership) },
          { id: 3, title: 'Training Skill', desc: 'Technical & professional skills', done: Boolean(data?.training_skill) },
          { id: 4, title: 'Training Lanjutan', desc: 'Advanced & specialized training', done: Boolean(data?.training_lanjutan) },
        ])
      } catch (e) {
        console.warn('Gagal memuat data training user terbaru:', e)
      }
    }
    fetchLatestUser()
  }, [user?.id])

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handlePwdChange = (e) => {
    const { name, value } = e.target
    setPwdForm(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      setLoading(true)
      const response = await userService.updateUser(user.id, formData)
      if (response.success) {
        toast.success('Profile berhasil diperbarui')
        updateUser(response.data)
        setIsEditing(false)
      }
    } catch (error) {
      toast.error('Gagal memperbarui profile')
      console.error('Error updating profile:', error)
    } finally {
      setLoading(false)
    }
  }

  // Submit perubahan password (modal)
  const handleSubmitPassword = async (e) => {
    e.preventDefault()
    if (!pwdForm.currentPassword || !pwdForm.newPassword || !pwdForm.confirmPassword) {
      toast.error('Semua field password harus diisi')
      return
    }
    if (pwdForm.newPassword !== pwdForm.confirmPassword) {
      toast.error('Password baru dan konfirmasi tidak sama')
      return
    }
    try {
      setLoading(true)
      const res = await authService.changePassword({
        currentPassword: pwdForm.currentPassword,
        newPassword: pwdForm.newPassword,
        confirmPassword: pwdForm.confirmPassword,
      })
      toast.success(res?.message || 'Password berhasil diubah')
      setShowPasswordModal(false)
      setPwdForm({ currentPassword: '', newPassword: '', confirmPassword: '' })
    } catch (err) {
      const msg = err?.message || err?.error || (typeof err === 'string' ? err : null) || 'Gagal mengubah password'
      toast.error(msg)
      console.error('Change password error:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = () => {
    setFormData({
      nama: user.nama || '',
      username: user.username || '',
      email: user.email || ''
    })
    setIsEditing(false)
  }

  const getRoleText = (role) => {
    switch (role) {
      case 'owner':
        return 'Owner'
      case 'admin':
        return 'Admin'
      case 'leader':
        return 'Leader'
      case 'divisi':
        return 'Divisi'
      default:
        return 'Unknown'
    }
  }

  const getRoleColor = (role) => {
    switch (role) {
      case 'owner':
        return 'bg-purple-100 text-purple-800'
      case 'admin':
        return 'bg-red-100 text-red-800'
      case 'leader':
        return 'bg-blue-100 text-blue-800'
      case 'divisi':
        return 'bg-green-100 text-green-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="p-0">
      <div className="w-full">
        

        {/* Bagian atas: hanya card merah (dan form di bawahnya) full width */}
        <div className="grid grid-cols-1 gap-8">
          {/* Card Merah */}
          <div>
            <div className="bg-red-700 text-white rounded-xl p-6 shadow-md">
              <div className="flex items-start justify-between">
                {/* Profil: Foto di paling atas, lalu nama, email, role & status */}
                <div className="flex-1">
                  <div className="flex flex-col items-center text-center gap-3">
                    <div className="w-28 h-28 rounded-full overflow-hidden bg-white/20 flex items-center justify-center">
                      {(() => {
                        const profilePath = latestUser?.profile || user?.profile
                        if (profilePath && !profileError) {
                          const isAbsolute = /^https?:\/\//i.test(profilePath)
                          const src = isAbsolute ? profilePath : `${API_CONFIG.BASE_HOST}${profilePath}`
                          return (
                            <img
                              src={src}
                              alt="Foto Profil"
                              className="w-full h-full object-cover"
                              onError={() => setProfileError(true)}
                            />
                          )
                        }
                        return <User className="h-14 w-14 text-white" />
                      })()}
                    </div>
                    {/* Kurangi jarak antara nama dan email */}
                    <div className="flex flex-col items-center gap-1">
                      <div className="text-xl font-extrabold">{user?.nama}</div>
                      <div className="text-white/90 text-sm">{user?.email}</div>
                    </div>
                    <div className="mt-2 flex items-center gap-2">
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${getRoleColor(user.role)}`}>{getRoleText(user.role)}</span>
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${user?.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>{user?.status || 'unknown'}</span>
                    </div>
                  </div>
                </div>
                {/* Tombol di sisi kanan dihapus agar tidak duplikat dengan form (modal) */}
              </div>
              {/* (Dipindah): Quick Action dipindahkan ke sisi kanan atas bawah bagian Training */}
            </div>

            {/* Form edit dipindahkan ke modal mengambang di tengah layar */}
          </div>
        </div>
        {/* Bagian bawah: dua kolom - kiri Quick Action & Support, kanan Training Progress */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
          {/* Kiri: Quick Action di atas, Support & Help di bawah */}
          <div className="space-y-6">
            {/* Quick Action */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
              <div className="text-gray-900 font-semibold text-base md:text-lg mb-5">Quick Action</div>
              <div className="divide-y divide-gray-200">
                <Link to="#" onClick={(e)=>{ e.preventDefault(); setIsEditing(true); }} className="flex items-center justify-between py-3 hover:bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center"><User className="h-5 w-5"/></div>
                    <div>
                      <div className="font-medium text-gray-900">Profile</div>
                      <div className="text-sm text-gray-500">Edit your profile</div>
                    </div>
                  </div>
                  <div className="text-gray-300">›</div>
                </Link>
                <Link to="#" onClick={(e)=>{ e.preventDefault(); setShowPasswordModal(true); }} className="flex items-center justify-between py-3 hover:bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center"><Lock className="h-5 w-5"/></div>
                    <div>
                      <div className="font-medium text-gray-900">Change Password</div>
                      <div className="text-sm text-gray-500">Update your password</div>
                    </div>
                  </div>
                  <div className="text-gray-300">›</div>
                </Link>
              </div>
            </div>

            {/* Support & Help */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
              <div className="text-gray-900 font-semibold text-base md:text-lg mb-5">Support & Help</div>
              <div className="divide-y divide-gray-200">
                <Link to="#" className="flex items-center justify-between py-3 hover:bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center"><HelpCircle className="h-5 w-5"/></div>
                    <div>
                      <div className="font-medium text-gray-900">Pusat Bantuan</div>
                      <div className="text-sm text-gray-500">FAQ dan panduan</div>
                    </div>
                  </div>
                  <div className="text-gray-300">›</div>
                </Link>
                <Link to="#" className="flex items-center justify-between py-3 hover:bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center"><MessageCircle className="h-5 w-5"/></div>
                    <div>
                      <div className="font-medium text-gray-900">Hubungi Kami</div>
                      <div className="text-sm text-gray-500">Support dan feedback</div>
                    </div>
                  </div>
                  <div className="text-gray-300">›</div>
                </Link>
              </div>
            </div>
          </div>

          {/* Kanan: Training Progress */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
            <div className="text-gray-900 font-semibold text-base md:text-lg mb-5">Training Progress</div>
            <div className="space-y-3">
              {training.map((t) => (
                <div key={t.id} className="flex items-start justify-between rounded-lg border border-gray-200 p-4">
                  <div className="flex items-start gap-3">
                    <div className={`mt-0.5 w-8 h-8 rounded-full flex items-center justify-center ${t.done ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'}`}> 
                      {t.done ? <CheckCircle2 className="h-5 w-5" /> : <span className="h-2 w-2 rounded-full bg-gray-300"></span>}
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900">{t.title}</div>
                      <div className="text-sm text-gray-500">{t.desc}</div>
                    </div>
                  </div>
                  <div className="text-green-600 text-sm">{t.done ? '✓' : '-'}</div>
                </div>
              ))}
            </div>
            {/* Overall Progress */}
            <div className="mt-5">
              <div className="flex items-center justify-between text-sm text-gray-700 mb-1">
                <span>Overall Progress</span>
                <span className="font-semibold">{`${training.filter(t=>t.done).length}/${training.length} Completed`}</span>
              </div>
              <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                <div className="h-full bg-green-500" style={{ width: `${(training.filter(t=>t.done).length / training.length) * 100}%` }} />
              </div>
            </div>
          </div>
        </div>

        {/* Modal Informasi Pribadi - mengambang di tengah layar */}
        {isEditing && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/50" onClick={handleCancel} />
            <div className="relative z-10 w-full max-w-2xl bg-white rounded-2xl border shadow-lg">
              <div className="flex items-center justify-between px-6 pt-5">
                <h3 className="text-lg font-semibold text-gray-900">Informasi Pribadi</h3>
                <button onClick={handleCancel} className="p-2 rounded-full hover:bg-gray-100">
                  <X className="h-5 w-5 text-gray-600" />
                </button>
              </div>
              <div className="p-6 pt-4">
                <form onSubmit={handleSubmit} className="space-y-6" onClick={(e)=> e.stopPropagation()}>
                  <div className="grid grid-cols-1 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Nama Lengkap</label>
                      <input type="text" name="nama" value={formData.nama} onChange={handleInputChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" required />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Username</label>
                      <input type="text" name="username" value={formData.username} onChange={handleInputChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" required />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                      <input type="email" name="email" value={formData.email} onChange={handleInputChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" required />
                    </div>
                  </div>
                  <div className="flex items-center justify-end gap-2">
                    <button type="button" onClick={handleCancel} className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center"><X className="h-4 w-4 mr-2"/>Batal</button>
                    <button type="submit" disabled={loading} className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors flex items-center"><Save className="h-4 w-4 mr-2"/>{loading ? 'Menyimpan...' : 'Simpan'}</button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Modal Change Password - mengambang di tengah layar */}
        {showPasswordModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/50" onClick={() => setShowPasswordModal(false)} />
            <div className="relative z-10 w-full max-w-xl bg-white rounded-2xl border shadow-lg">
              <div className="flex items-center justify-between px-6 pt-5">
                <h3 className="text-lg font-semibold text-gray-900">Change Password</h3>
                <button onClick={() => setShowPasswordModal(false)} className="p-2 rounded-full hover:bg-gray-100">
                  <X className="h-5 w-5 text-gray-600" />
                </button>
              </div>
              <div className="p-6 pt-4">
                <form onSubmit={handleSubmitPassword} className="space-y-5" onClick={(e)=> e.stopPropagation()}>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Password Saat Ini</label>
                    <input type="password" name="currentPassword" value={pwdForm.currentPassword} onChange={handlePwdChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" required />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Password Baru</label>
                    <input type="password" name="newPassword" value={pwdForm.newPassword} onChange={handlePwdChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" required />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Konfirmasi Password Baru</label>
                    <input type="password" name="confirmPassword" value={pwdForm.confirmPassword} onChange={handlePwdChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" required />
                  </div>
                  <div className="flex items-center justify-end gap-2">
                    <button type="button" onClick={() => setShowPasswordModal(false)} className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center"><X className="h-4 w-4 mr-2"/>Batal</button>
                    <button type="submit" disabled={loading} className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors flex items-center"><Save className="h-4 w-4 mr-2"/>{loading ? 'Menyimpan...' : 'Simpan'}</button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default Profile