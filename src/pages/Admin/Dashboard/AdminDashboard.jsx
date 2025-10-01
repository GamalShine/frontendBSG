import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../../contexts/AuthContext'
import Card, { CardHeader, CardBody } from '../../../components/UI/Card'
import Button from '../../../components/UI/Button'
import Badge from '../../../components/UI/Badge'
import toast from 'react-hot-toast'
import { videoManageService } from '../../../services/videoManageService'

const AdminDashboard = () => {
  const { user } = useAuth()
  const [videoUrl, setVideoUrl] = useState('')
  const [selectedFile, setSelectedFile] = useState(null)
  const [loading, setLoading] = useState(false)
  const [targetRole, setTargetRole] = useState('admin') // admin | leader
  const navigate = useNavigate()

  // Load current video from backend (berdasarkan targetRole)
  useEffect(() => {
    const load = async () => {
      if (!(user?.role === 'admin' || user?.role === 'owner')) return
      try {
        const res = await videoManageService.getCurrent(targetRole)
        const url = res?.data?.url || ''
        setVideoUrl(url)
      } catch (e) {
        console.error('Gagal memuat video admin:', e)
      }
    }
    load()
  }, [user?.role, targetRole])

  const goToVideoLibrary = () => {
    navigate('/admin/video-library')
  }

  const handleUpload = async () => {
    if (!selectedFile) return toast.error('Pilih file video terlebih dahulu')
    try {
      setLoading(true)
      const res = await videoManageService.upload(targetRole, selectedFile)
      setVideoUrl(res?.data?.url || '')
      setSelectedFile(null)
      toast.success('Video berhasil diunggah')
    } catch (e) {
      console.error(e)
      toast.error(e?.message || 'Gagal mengunggah video')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard Admin</h1>
          <p className="text-gray-600 mt-2">Selamat datang di dashboard Admin.</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="success">Administrator</Badge>
        </div>
      </div>

      {/* Video Section: tampil untuk admin dan owner */}
      {(user?.role === 'admin' || user?.role === 'owner') && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between gap-3">
              <h3 className="text-lg font-semibold text-gray-900">Video Pembuka</h3>
              <div className="flex items-center gap-2">
                <label className="text-sm text-gray-600">Target Role</label>
                <select
                  value={targetRole}
                  onChange={(e) => setTargetRole(e.target.value)}
                  className="rounded-md border border-gray-300 px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="admin">Admin</option>
                  <option value="leader">Leader</option>
                </select>
                <Button variant="ghost" onClick={goToVideoLibrary}>Semua Video</Button>
              </div>
            </div>
          </CardHeader>
          <CardBody>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <div className="lg:col-span-2">
                {videoUrl ? (
                  <div className="aspect-video w-full bg-black/5 rounded-lg overflow-hidden">
                    <video className="w-full h-full" src={videoUrl} controls />
                  </div>
                ) : (
                  <div className="aspect-video w-full bg-gray-100 rounded-lg flex items-center justify-center text-gray-500">
                    Tidak ada video. Unggah file video untuk role {targetRole}.
                  </div>
                )}
              </div>
              <div className="space-y-3">
                <label className="block text-sm font-medium text-gray-700">Unggah Video (mp4, webm, dll.)</label>
                <input
                  type="file"
                  accept="video/*"
                  onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <div className="flex gap-2">
                  <Button onClick={handleUpload} disabled={loading}>{loading ? 'Menyimpan...' : 'Simpan'}</Button>
                  <Button variant="ghost" onClick={() => setSelectedFile(null)}>Reset</Button>
                </div>
                <p className="text-xs text-gray-500">File akan disimpan ke backend dan ditampilkan otomatis untuk role {targetRole}.</p>
              </div>
            </div>
          </CardBody>
        </Card>
      )}

      {/* Placeholder konten admin lama */}
      <Card>
        <CardBody>
          <p className="text-gray-600">Tambahkan widget dan ringkasan khusus admin di sini.</p>
        </CardBody>
      </Card>

    </div>
  )
}

export default AdminDashboard
