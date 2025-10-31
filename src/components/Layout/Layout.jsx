import React, { useEffect, useMemo, useState } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import Sidebar from './Sidebar'
import Header from './Header'
import { useLocation, useNavigate } from 'react-router-dom'
import { Plus } from 'lucide-react'

const Layout = ({ children }) => {
  const { user } = useAuth()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const location = useLocation()
  const [fabSignal, setFabSignal] = useState({ lapkeu: false, month: '' })

  // Tutup sidebar saat menekan ESC
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') setSidebarOpen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  // Amati perubahan atribut pada body untuk sinyal FAB (lapkeu month)
  useEffect(() => {
    const readSignals = () => {
      try {
        const lap = typeof document !== 'undefined' && document.body.getAttribute('data-lapkeu-month') === 'true'
        const m = typeof document !== 'undefined' ? (document.body.getAttribute('data-month-filter') || '') : ''
        setFabSignal({ lapkeu: !!lap, month: m })
      } catch {}
    }
    readSignals()
    let mo
    try {
      mo = new MutationObserver(readSignals)
      mo.observe(document.body, { attributes: true, attributeFilter: ['data-lapkeu-month', 'data-month-filter', 'data-hide-fab'] })
    } catch {}
    return () => { try { mo && mo.disconnect() } catch {} }
  }, [])

  return (
      <div className="flex h-screen bg-gray-100">
        {/* Sidebar */}
        <div className="hidden lg:flex lg:flex-shrink-0">
          <Sidebar />
        </div>

        {/* Mobile sidebar (off-canvas) */}
        <>
          {/* Backdrop */}
          <div
            className={`${sidebarOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'} fixed inset-0 z-40 bg-black/40 transition-opacity duration-200 lg:hidden`}
            onClick={() => setSidebarOpen(false)}
          />
          {/* Slide-in panel */}
          <div
            className={`${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} fixed inset-y-0 left-0 z-50 w-[80vw] max-w-72 bg-white transition-transform duration-300 lg:hidden shadow-xl`}
            aria-hidden={!sidebarOpen}
          >
            <div className="absolute top-3 right-3">
              <button
                onClick={() => setSidebarOpen(false)}
                className="inline-flex items-center justify-center h-8 w-8 rounded-md bg-white/80 hover:bg-white shadow border border-gray-200"
                aria-label="Tutup sidebar"
              >
                ✕
              </button>
            </div>
            <div className="h-full overflow-y-auto">
              <Sidebar />
            </div>
          </div>
        </>

        {/* Main content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <Header onMenuClick={() => setSidebarOpen(true)} />
          
          {/* Page content */}
          <main className="flex-1 overflow-y-auto bg-gray-50 p-4 sm:p-6">
            {children}
          </main>

          {/* Floating Add Button khusus mobile */}
          {(() => {
            // Tampilkan FAB di:
            // - Poskas (kecuali detail/edit)
            // - Omset Harian (kecuali detail/edit)
            // - Laporan Keuangan hanya saat berada di folder bulan (ada ?month=YYYY-MM)
            // - Aneka Grafik (kecuali detail/edit)
            const isPoskasPath = /^\/admin\/keuangan\/poskas\b/.test(location.pathname)
            const isPoskasDetailOrEdit = /^\/admin\/keuangan\/poskas\/[A-Za-z0-9_-]+(?:\/edit)?$/.test(location.pathname)
            const isOmsetPath = /^\/admin\/keuangan\/omset-harian\b/.test(location.pathname)
            const isOmsetDetailOrEdit = /^\/admin\/keuangan\/omset-harian\/[A-Za-z0-9_-]+(?:\/edit)?$/.test(location.pathname)
            const isLapkeuPath = /^\/admin\/keuangan\/laporan\b/.test(location.pathname)
            const isAnekaPath = /^\/admin\/keuangan\/aneka-grafik\b/.test(location.pathname)
            const isAnekaDetailOrEdit = /^\/admin\/keuangan\/aneka-grafik\/[A-Za-z0-9_-]+(?:\/edit)?$/.test(location.pathname)
            const hasMonthParam = (() => {
              try {
                const sp = new URLSearchParams(location.search)
                return !!sp.get('month')
              } catch { return false }
            })()
            const bodySaysLapkeuMonth = fabSignal.lapkeu
            // Izinkan FAB di Poskas/Omset kecuali di detail/edit
            const allowFabPoskas = isPoskasPath && !isPoskasDetailOrEdit
            const allowFabOmset = isOmsetPath && !isOmsetDetailOrEdit
            // Izinkan FAB di Laporan Keuangan hanya saat berada di folder bulan (ada query month)
            const allowFabLapkeu = isLapkeuPath && (hasMonthParam || bodySaysLapkeuMonth)
            // Izinkan FAB di Aneka Grafik (hanya list)
            const allowFabAneka = isAnekaPath && !isAnekaDetailOrEdit
            const allowFab = allowFabPoskas || allowFabOmset || allowFabLapkeu || allowFabAneka

            const globalHideFab = (() => {
              try {
                if (typeof document !== 'undefined') {
                  return document.body.getAttribute('data-hide-fab') === 'true'
                }
              } catch {}
              return false
            })()
            // Saat di Lapkeu bulan, tampilkan FAB meski ada data-hide-fab (race condition saat mount)
            const shouldShowFab = (allowFabLapkeu && allowFab) || (allowFab && !globalHideFab)
            return shouldShowFab ? (
              <MobileFloatingAdd key={`${location.pathname}${location.search}`} fabSignal={fabSignal} />
            ) : null
          })()}
        </div>
      </div>
  )
}

export default Layout

// Komponen: FAB yang mencari tombol "Tambah" di halaman dan memicunya saat ditekan (mobile only)
const MobileFloatingAdd = ({ fabSignal: fabSignalProp }) => {
  const [targetBtn, setTargetBtn] = useState(null)
  const location = useLocation()
  const navigate = useNavigate()
  const fs = fabSignalProp || { lapkeu: false, month: '' }

  const isMobile = useMemo(() => {
    if (typeof window === 'undefined') return false
    return window.matchMedia('(max-width: 768px)').matches
  }, [])

  useEffect(() => {
    if (!isMobile) return

    const findAddButton = () => {
      const candidates = Array.from(document.querySelectorAll('button, a[role="button"], a, .btn'))
      // Scoring: prioritas tombol dengan atribut khusus dulu, lalu teks
      const scored = candidates
        .filter(el => el && el.offsetParent !== null) // visible-ish
        .map(el => {
          const text = (el.getAttribute('aria-label') || el.textContent || '').trim().toLowerCase()
          const hasAddAttr = el.hasAttribute('data-add') || el.classList.contains('btn-add')
          let score = 0
          if (hasAddAttr) score += 3
          if (text.startsWith('tambah') || text === '+') score += 2
          if (text.includes('tambah')) score += 1
          // Prefer button near bottom/right in document flow
          const rect = el.getBoundingClientRect()
          const viewportH = window.innerHeight || 0
          const viewportW = window.innerWidth || 0
          if (rect.top > viewportH * 0.4) score += 0.5
          if (rect.left > viewportW * 0.5) score += 0.5
          return { el, score }
        })
        .filter(x => x.score > 0)
        .sort((a, b) => b.score - a.score)

      setTargetBtn(scored[0]?.el || null)
    }

    // Cari saat mount
    findAddButton()

    // Observer untuk perubahan DOM (navigasi atau render ulang)
    const mo = new MutationObserver(() => findAddButton())
    mo.observe(document.body, { childList: true, subtree: true })
    return () => mo.disconnect()
  }, [isMobile])

  // Jangan hentikan render berdasarkan isMobile, biarkan CSS (lg:hidden) yang kontrol visibilitas

  const isOnPoskasMain = /^\/admin\/keuangan\/poskas\/?$/.test(location.pathname)
  const isOnOmsetMain = /^\/admin\/keuangan\/omset-harian\/?$/.test(location.pathname)
  const isOnAnekaMain = /^\/admin\/keuangan\/aneka-grafik\/?$/.test(location.pathname)
  const isOnLapkeuMonth = (() => {
    if (!/^\/admin\/keuangan\/laporan\b/.test(location.pathname)) return false
    try {
      const hasQuery = !!(new URLSearchParams(location.search)).get('month')
      const hasBody = fabSignal.lapkeu
      return hasQuery || hasBody
    } catch { return false }
  })()
  if (!isOnPoskasMain && !isOnOmsetMain && !isOnLapkeuMonth && !isOnAnekaMain && !targetBtn) return null

  return (
    <div className="lg:hidden">
      <button
        type="button"
        aria-label={
          isOnPoskasMain ? 'Tambah Poskas' : (
          isOnOmsetMain ? 'Tambah Omset' : (
          isOnLapkeuMonth ? 'Tambah Lap Keu' : (
          isOnAnekaMain ? 'Tambah Aneka Grafik' : 'Tambah')))}
        title={
          isOnPoskasMain ? 'Tambah Poskas' : (
          isOnOmsetMain ? 'Tambah Omset' : (
          isOnLapkeuMonth ? 'Tambah Lap Keu' : (
          isOnAnekaMain ? 'Tambah Aneka Grafik' : 'Tambah')))}
        onClick={() => {
          // Prioritaskan navigasi eksplisit sesuai halaman
          if (isOnPoskasMain) {
            navigate('/admin/keuangan/poskas/new')
          } else if (isOnOmsetMain) {
            navigate('/admin/keuangan/omset-harian/new')
          } else {
            // Deteksi lapkeu month secara defensif: berdasarkan path + (query month atau sinyal body)
            const onLapkeuPath = /^\/admin\/keuangan\/laporan\b/.test(location.pathname)
            let lapkeuMonthActive = false
            if (onLapkeuPath) {
              try {
                const m = new URLSearchParams(location.search).get('month')
                lapkeuMonthActive = !!m || !!fs.lapkeu
              } catch {
                lapkeuMonthActive = !!fs.lapkeu
              }
            }
            if (lapkeuMonthActive) {
              // Selalu ke halaman tambah Lap Keu (tanpa query), sesuai permintaan
              navigate('/admin/keuangan/laporan/new')
              return
            }
            // Fallback umum: picu tombol 'Tambah' yang terdeteksi
            targetBtn?.click()
          }
        }}
        className="fixed right-4 bottom-4 z-[9999] h-14 w-14 rounded-full bg-red-600 text-white shadow-lg shadow-red-300/40 flex items-center justify-center active:scale-95 transition-transform pointer-events-auto"
        style={{ envSafeAreaInsetBottom: 'constant(safe-area-inset-bottom)' }}
      >
        <Plus className="w-7 h-7" />
      </button>
    </div>
  )
}
 