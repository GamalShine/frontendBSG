import React, { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../../contexts/AuthContext'
import Card, { CardBody } from '../../../components/UI/Card'
import { videoManageService } from '../../../services/videoManageService'
import { API_CONFIG } from '../../../config/constants'
import { SkipBack, Play, Pause, SkipForward, Volume2, VolumeX, Users2, ClipboardList, AlertTriangle, FileText, ChevronRight, Expand, Minimize } from 'lucide-react'

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
  const containerRef = useRef(null)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [wasPlayingBeforeFs, setWasPlayingBeforeFs] = useState(false)
  const [posterUrl, setPosterUrl] = useState('')
  const [posterCaptured, setPosterCaptured] = useState(false)

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

  // Buat poster otomatis dari frame awal (seek ke ~0.1s untuk hindari frame gelap/putih)
  useEffect(() => {
    setPosterUrl('')
    setVideoError('')
    setPosterCaptured(false)
    const el = videoRef.current
    if (!el) return
    let cancelled = false
    const drawFrame = () => {
      try {
        if (cancelled || !videoRef.current) return
        const v = videoRef.current
        const w = v.videoWidth || 0
        const h = v.videoHeight || 0
        if (!w || !h) return
        const canvas = document.createElement('canvas')
        canvas.width = w
        canvas.height = h
        const ctx = canvas.getContext('2d')
        if (!ctx) return
        ctx.drawImage(v, 0, 0, w, h)
        const dataUrl = canvas.toDataURL('image/jpeg', 0.86)
        if (dataUrl) {
          setPosterUrl(dataUrl)
          setPosterCaptured(true)
        }
      } catch (e) {
        console.warn('Gagal membuat poster video:', e)
      }
    }

    const handleLoadedMeta = () => {
      if (cancelled) return
      const v = videoRef.current
      if (!v) return
      const prevPaused = v.paused
      const prevTime = v.currentTime
      const targetTime = Math.min((v.duration || 1) > 0 ? 0.1 : 0, (v.duration || 0))

      const onSeeked = () => {
        // Tunggu satu frame render agar tidak putih
        const tryDraw = () => {
          if (cancelled) return
          if (v.readyState >= 2) {
            requestAnimationFrame(() => {
              drawFrame()
              // Kembalikan ke waktu semula
              try {
                if (!cancelled && videoRef.current) {
                  videoRef.current.currentTime = prevTime
                  if (!prevPaused) {
                    videoRef.current.play().catch(() => {})
                  }
                }
              } finally {
                v.removeEventListener('seeked', onSeeked)
              }
            })
          } else {
            // Jika belum siap, coba lagi sedikit
            setTimeout(tryDraw, 30)
          }
        }
        tryDraw()
      }

      v.addEventListener('seeked', onSeeked)
      // Pause sementara untuk akurasi draw
      try { v.pause() } catch {}
      try { v.currentTime = targetTime } catch {
        // Jika gagal seek, coba langsung draw
        v.removeEventListener('seeked', onSeeked)
        requestAnimationFrame(drawFrame)
        // resume jika tadinya play
        if (!prevPaused) v.play().catch(() => {})
      }

      // Fallback: jika setelah 600ms poster belum tercapture, lakukan autoplay muted sebentar
      setTimeout(() => {
        if (cancelled || posterCaptured || !videoRef.current) return
        const vv = videoRef.current
        const wasPaused = vv.paused
        const prevT = vv.currentTime
        const resumeIfNeeded = () => {
          try {
            vv.pause()
            vv.currentTime = prevT
            if (!wasPaused) vv.play().catch(() => {})
          } catch {}
        }
        try {
          vv.muted = true
          vv.play().then(() => {
            setTimeout(() => {
              if (!posterCaptured) {
                requestAnimationFrame(drawFrame)
              }
              resumeIfNeeded()
            }, 220)
          }).catch(() => {})
        } catch {
          // abaikan
        }
      }, 600)
    }

    el.addEventListener('loadedmetadata', handleLoadedMeta)
    el.addEventListener('loadeddata', handleLoadedMeta)

    return () => {
      cancelled = true
      el.removeEventListener('loadedmetadata', handleLoadedMeta)
      el.removeEventListener('loadeddata', handleLoadedMeta)
    }
  }, [videoUrl])

  // Pantau perubahan fullscreen untuk sinkronkan UI tombol dan auto-resume bila perlu
  useEffect(() => {
    const onFsChange = () => {
      const fsEl = document.fullscreenElement || document.webkitFullscreenElement || document.mozFullScreenElement || document.msFullscreenElement
      const entering = !!fsEl
      setIsFullscreen(entering)
      // Jika baru saja keluar fullscreen dan sebelumnya video playing, lanjutkan play
      if (!entering && wasPlayingBeforeFs && videoRef.current) {
        videoRef.current.play().catch(() => {})
        setIsPlaying(true)
      }
    }
    document.addEventListener('fullscreenchange', onFsChange)
    // vendor prefixes (beberapa browser lama)
    document.addEventListener('webkitfullscreenchange', onFsChange)
    document.addEventListener('mozfullscreenchange', onFsChange)
    document.addEventListener('MSFullscreenChange', onFsChange)
    return () => {
      document.removeEventListener('fullscreenchange', onFsChange)
      document.removeEventListener('webkitfullscreenchange', onFsChange)
      document.removeEventListener('mozfullscreenchange', onFsChange)
      document.removeEventListener('MSFullscreenChange', onFsChange)
    }
  }, [wasPlayingBeforeFs, setIsPlaying])

  // iOS Safari: setelah keluar dari native fullscreen, event khusus dipicu
  useEffect(() => {
    const el = videoRef.current
    if (!el) return
    const onWebkitEndFs = () => {
      if (wasPlayingBeforeFs) {
        el.play().catch(() => {})
        setIsPlaying(true)
      }
    }
    el.addEventListener('webkitendfullscreen', onWebkitEndFs)
    return () => {
      el.removeEventListener('webkitendfullscreen', onWebkitEndFs)
    }
  }, [wasPlayingBeforeFs, setIsPlaying])

  const toggleFullscreen = () => {
    try {
      // Jika sedang fullscreen -> exit
      const fsEl = document.fullscreenElement || document.webkitFullscreenElement || document.mozFullScreenElement || document.msFullscreenElement
      if (fsEl) {
        if (document.exitFullscreen) return document.exitFullscreen()
        if (document.webkitExitFullscreen) return document.webkitExitFullscreen()
        if (document.mozCancelFullScreen) return document.mozCancelFullScreen()
        if (document.msExitFullscreen) return document.msExitFullscreen()
      }
      // Masuk fullscreen pada container (fallback ke video)
      const target = containerRef.current || videoRef.current
      if (!target) return
      // Catat apakah video sedang playing sebelum masuk fullscreen
      try {
        const playing = videoRef.current && !videoRef.current.paused
        setWasPlayingBeforeFs(!!playing)
      } catch {}
      if (target.requestFullscreen) return target.requestFullscreen()
      if (target.webkitRequestFullscreen) return target.webkitRequestFullscreen()
      if (target.mozRequestFullScreen) return target.mozRequestFullScreen()
      if (target.msRequestFullscreen) return target.msRequestFullscreen()
      // iOS Safari khusus: gunakan webkitEnterFullscreen pada video element
      if (videoRef.current && videoRef.current.webkitEnterFullscreen) {
        return videoRef.current.webkitEnterFullscreen()
      }
    } catch (e) {
      console.warn('Gagal mengubah mode fullscreen:', e)
    }
  }

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

  const togglePlay = () => {
    const el = videoRef.current
    if (!el) return
    try {
      if (el.paused) {
        el.play().then(() => setIsPlaying(true)).catch(() => setIsPlaying(false))
      } else {
        el.pause()
        setIsPlaying(false)
      }
    } catch {
      // fallback toggle state jika dibutuhkan
      setIsPlaying(v => !v)
    }
  }
  const toggleMute = () => setMuted(v => !v)

  return (
    <div className="pt-1 -mx-0 sm:-mx-1">
      {(user?.role === 'admin' || user?.role === 'owner') && (
            <div ref={containerRef} className="w-full overflow-hidden relative border-x-4 border-red-700 shadow-lg aspect-auto h-[calc(100vh-140px)] sm:h-[420px] lg:h-[640px]">
              {/* Tombol Fullscreen (pojok kanan atas) */}
              <div className="absolute top-2 right-1 z-10">
                <button
                  type="button"
                  onClick={toggleFullscreen}
                  className="w-8 h-8 flex items-center justify-center rounded-md bg-black/40 hover:bg-black/60 text-white backdrop-blur-sm border border-white/20"
                  aria-label={isFullscreen ? 'Keluar Fullscreen' : 'Masuk Fullscreen'}
                  title={isFullscreen ? 'Keluar Fullscreen' : 'Fullscreen'}
                >
                  {isFullscreen ? (
                    <Minimize className="w-5 h-5" />
                  ) : (
                    <Expand className="w-5 h-5" />
                  )}
                </button>
              </div>
              {videoUrl && !videoError ? (
                <video
                  ref={videoRef}
                  className="w-full h-full object-cover"
                  src={videoUrl}
                  poster={posterUrl || undefined}
                  crossOrigin="anonymous"
                  playsInline
                  preload="metadata"
                  disablePictureInPicture
                  controlsList="nofullscreen"
                  onEnded={handleNext}
                  onPlay={() => setIsPlaying(true)}
                  onPause={() => setIsPlaying(false)}
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
