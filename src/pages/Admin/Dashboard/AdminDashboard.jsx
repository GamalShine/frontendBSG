import React, { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../../contexts/AuthContext'
import Card, { CardBody } from '../../../components/UI/Card'
import { videoManageService } from '../../../services/videoManageService'
import { API_CONFIG } from '../../../config/constants'
import { SkipBack, Play, Pause, SkipForward, Volume2, VolumeX, Users2, ClipboardList, AlertTriangle, FileText, ChevronRight } from 'lucide-react'

const AdminDashboard = () => {
  const { user } = useAuth()
  const [videoUrl, setVideoUrl] = useState('')
  const [targetRole, setTargetRole] = useState('admin') // admin | leader
  const [videoError, setVideoError] = useState('')
  const [list, setList] = useState([])
  const [currentIdx, setCurrentIdx] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [muted, setMuted] = useState(false)
  const videoRef = useRef(null)

  const toAbsoluteUrl = (path) => {
    if (!path) return ''
    if (/^https?:\/\//i.test(path)) return path
    const base = API_CONFIG?.BASE_HOST || ''
    return `${base}${path.startsWith('/') ? path : '/' + path}`
  }

  // Load daftar video dan tentukan aktif/default
  useEffect(() => {
    const load = async () => {
      if (!(user?.role === 'admin' || user?.role === 'owner')) return
      try {
        // Ambil list video untuk role target
        const res = await videoManageService.list(targetRole)
        const items = res?.data || []
        // Normalisasi url absolut
        const normalized = items.map(v => ({ ...v, url: toAbsoluteUrl(v?.url || '') }))
        setList(normalized)

        // Tentukan index aktif atau fallback ke index 0
        const activeIndex = normalized.findIndex(v => v.active)
        const idx = activeIndex >= 0 ? activeIndex : 0
        const url = normalized[idx]?.url || ''
        setCurrentIdx(idx)
        setVideoUrl(url)
        setVideoError('')

        // Jika list kosong untuk role saat ini, fallback ke role lain
        if (!url) {
          const altRole = targetRole === 'admin' ? 'leader' : 'admin'
          try {
            const altRes = await videoManageService.list(altRole)
            const altItems = (altRes?.data || []).map(v => ({ ...v, url: toAbsoluteUrl(v?.url || '') }))
            if (altItems.length > 0) {
              setList(altItems)
              setCurrentIdx(0)
              setTargetRole(altRole)
              setVideoUrl(altItems[0].url)
              setVideoError('')
            }
          } catch (altErr) {
            console.warn('[AdminDashboard] Fallback gagal untuk list role lain', altErr)
          }
        }
      } catch (e) {
        console.error('Gagal memuat video admin:', e)
      }
    }
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.role, targetRole])

  // Sinkronkan play/pause dan mute pada element video
  useEffect(() => {
    const el = videoRef.current
    if (!el) return
    el.muted = muted
    if (isPlaying) {
      el.play().catch(() => setIsPlaying(false))
    } else {
      el.pause()
    }
  }, [isPlaying, muted, videoUrl])

  const handlePrev = () => {
    if (!list.length) return
    const nextIdx = (currentIdx - 1 + list.length) % list.length
    setCurrentIdx(nextIdx)
    setVideoUrl(list[nextIdx].url)
    setIsPlaying(true)
  }

  const handleNext = () => {
    if (!list.length) return
    const nextIdx = (currentIdx + 1) % list.length
    setCurrentIdx(nextIdx)
    setVideoUrl(list[nextIdx].url)
    setIsPlaying(true)
  }

  const togglePlay = () => setIsPlaying(v => !v)
  const toggleMute = () => setMuted(v => !v)

  return (
    <div className="pt-1 -mx-0 sm:-mx-1">
      {(user?.role === 'admin' || user?.role === 'owner') && (
            <div className="w-full overflow-hidden relative border-x-4 border-red-700 shadow-lg aspect-auto h-[calc(100vh-140px)] sm:h-[420px] lg:aspect-[21/9] lg:h-auto">
              {videoUrl && !videoError ? (
                <video
                  ref={videoRef}
                  className="w-full h-full object-cover"
                  src={videoUrl}
                  playsInline
                  preload="metadata"
                  disablePictureInPicture
                  controlsList="nofullscreen"
                  onEnded={handleNext}
                  onCanPlay={() => isPlaying && videoRef.current?.play()}
                  onError={() => {
                    console.warn('[AdminDashboard] Gagal memuat file video:', videoUrl)
                    setVideoError('Gagal memuat file video (500).')
                  }}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-500">
                  {videoError || 'Tidak ada video'}
                </div>
              )}

              {/* Kontrol kustom: bar merah */}
              <div className="absolute bottom-0 left-0 right-0 bg-red-700/95 text-white">
                <div className="flex items-center justify-between px-4 py-3">
                  <div className="flex items-center gap-4">
                    <button
                      type="button"
                      onClick={handlePrev}
                      className="p-2 rounded-md hover:bg-red-600 active:scale-95"
                      aria-label="Sebelumnya"
                    >
                      <SkipBack className="w-6 h-6" />
                    </button>
                    <button
                      type="button"
                      onClick={togglePlay}
                      className="p-2 rounded-md hover:bg-red-600 active:scale-95"
                      aria-label={isPlaying ? 'Jeda' : 'Putar'}
                    >
                      {isPlaying ? <Pause className="w-7 h-7" /> : <Play className="w-7 h-7" />}
                    </button>
                    <button
                      type="button"
                      onClick={handleNext}
                      className="p-2 rounded-md hover:bg-red-600 active:scale-95"
                      aria-label="Berikutnya"
                    >
                      <SkipForward className="w-6 h-6" />
                    </button>
                  </div>

                  <div className="text-sm opacity-90">
                    {list.length > 0 ? `${currentIdx + 1} / ${list.length}` : '0 / 0'}
                  </div>

                  <div className="flex items-center">
                    <button
                      type="button"
                      onClick={toggleMute}
                      className="p-2 rounded-md hover:bg-red-600 active:scale-95"
                      aria-label={muted ? 'Unmute' : 'Mute'}
                    >
                      {muted ? <VolumeX className="w-6 h-6" /> : <Volume2 className="w-6 h-6" />}
                    </button>
                  </div>
                </div>
              </div>
            </div>
      )}
      {/* Fitur Dashboard (versi website) */}
      {false && (
      <div className="mt-6">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3">Fitur Dashboard</h2>
        <div className="space-y-3">
          {/* Struktur & Jobdesk */}
          <Link to="/admin/struktur-jobdesk" className="block bg-white rounded-xl border border-red-100/60 shadow-sm hover:shadow-md transition p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-red-50 text-red-700 flex items-center justify-center">
                  <Users2 className="w-5 h-5" />
                </div>
                <span className="text-base sm:text-lg font-semibold text-gray-900">Struktur & Jobdesk</span>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400" />
            </div>
          </Link>

          {/* Tugas Saya Apa? */}
          <Link to="/admin/tugas-saya" className="block bg-white rounded-xl border border-red-100/60 shadow-sm hover:shadow-md transition p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-red-50 text-red-700 flex items-center justify-center">
                  <ClipboardList className="w-5 h-5" />
                </div>
                <span className="text-base sm:text-lg font-semibold text-gray-900">Tugas Saya Apa?</span>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400" />
            </div>
          </Link>

          {/* Daftar Komplain */}
          <Link to="/admin/komplain" className="block bg-white rounded-xl border border-red-100/60 shadow-sm hover:shadow-md transition p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-red-50 text-red-700 flex items-center justify-center">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <span className="text-base sm:text-lg font-semibold text-gray-900">Daftar Komplain</span>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400" />
            </div>
          </Link>

          {/* SOP Terkait */}
          <Link to="/admin/sop-terkait" className="block bg-white rounded-xl border border-red-100/60 shadow-sm hover:shadow-md transition p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-red-50 text-red-700 flex items-center justify-center">
                  <FileText className="w-5 h-5" />
                </div>
                <span className="text-base sm:text-lg font-semibold text-gray-900">SOP Terkait</span>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400" />
            </div>
          </Link>
        </div>
      </div>
      )}
    </div>
  )
}

export default AdminDashboard
