import React, { useEffect, useMemo, useState } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import Sidebar from './Sidebar'
import Header from './Header'
import { useLocation, useNavigate } from 'react-router-dom'
import { Plus } from 'lucide-react'

const Layout = ({ children }) => {
  const { user } = useAuth()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [headerHeight, setHeaderHeight] = useState(0)
  const location = useLocation()
  const [fabSignal, setFabSignal] = useState({ lapkeu: false, month: '', datatarget: false })

  // Tutup sidebar saat menekan ESC
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') setSidebarOpen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  // Hitung tinggi header aktual (termasuk breadcrumb mobile) agar spacer akurat
  useEffect(() => {
    const measure = () => {
      try {
        const el = document.querySelector('header')
        if (el) {
          const h = el.getBoundingClientRect().height || 0
          setHeaderHeight(h)
        }
      } catch {}
    }
    measure()
    let ro
    try {
      ro = new ResizeObserver(measure)
      const el = document.querySelector('header')
      if (el) ro.observe(el)
    } catch {}
    window.addEventListener('resize', measure)
    return () => {
      try { ro && ro.disconnect() } catch {}
      window.removeEventListener('resize', measure)
    }
  }, [])

  // Amati perubahan atribut pada body untuk sinyal FAB (lapkeu month)
  useEffect(() => {
    const readSignals = () => {
      try {
        const lap = typeof document !== 'undefined' && document.body.getAttribute('data-lapkeu-month') === 'true'
        const m = typeof document !== 'undefined' ? (document.body.getAttribute('data-month-filter') || '') : ''
        const dt = typeof document !== 'undefined' && document.body.getAttribute('data-datatarget-month') === 'true'
        setFabSignal({ lapkeu: !!lap, month: m, datatarget: !!dt })
      } catch {}
    }
    readSignals()
    let mo
    try {
      mo = new MutationObserver(readSignals)
      mo.observe(document.body, { attributes: true, attributeFilter: ['data-lapkeu-month', 'data-month-filter', 'data-hide-fab', 'data-datatarget-month'] })
    } catch {}
    return () => { try { mo && mo.disconnect() } catch {} }
  }, [])

  return (
      <div className="flex h-[100dvh] bg-gray-100 min-h-0 overflow-hidden">
        {/* Sidebar */}
        <div className="hidden lg:flex lg:sticky lg:top-0 lg:h-[100dvh] lg:flex-shrink-0">
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
        <div className="flex-1 flex flex-col overflow-hidden min-h-0">
          <Header onMenuClick={() => setSidebarOpen(true)} />
          {/* Spacer to offset fixed header + mobile breadcrumb height (mobile only, dynamic) */}
          <div className="lg:hidden" style={{ height: headerHeight ? `${headerHeight}px` : undefined }}></div>
          
          {/* Page content */}
          <main
            className="flex-1 overflow-y-auto overscroll-contain bg-gray-50 p-4 sm:p-6 pb-32 lg:pb-0 min-h-0"
            style={{
              WebkitOverflowScrolling: 'touch',
              paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 96px)'
            }}
          >
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
            const isDataTargetPath = /^\/admin\/marketing\/data-target\b/.test(location.pathname)
            const isAnekaDetailOrEdit = /^\/admin\/keuangan\/aneka-grafik\/[A-Za-z0-9_-]+(?:\/edit)?$/.test(location.pathname)
            const hasMonthParam = (() => {
              try {
                const sp = new URLSearchParams(location.search)
                return !!sp.get('month')
              } catch { return false }
            })()
            const bodySaysLapkeuMonth = fabSignal.lapkeu
            const bodySaysDataTargetMonth = fabSignal.datatarget
            // Izinkan FAB di Poskas/Omset kecuali di detail/edit
            const allowFabPoskas = isPoskasPath && !isPoskasDetailOrEdit
            const allowFabOmset = isOmsetPath && !isOmsetDetailOrEdit
            // Izinkan FAB di Laporan Keuangan hanya saat berada di folder bulan (ada query month)
            const allowFabLapkeu = isLapkeuPath && (hasMonthParam || bodySaysLapkeuMonth)
            // Izinkan FAB di Aneka Grafik (hanya list)
            const allowFabAneka = isAnekaPath && !isAnekaDetailOrEdit
            // Izinkan FAB di Data Target hanya saat monthContent aktif (sinyal body)
            const allowFabDataTarget = isDataTargetPath && bodySaysDataTargetMonth
            const allowFab = allowFabPoskas || allowFabOmset || allowFabLapkeu || allowFabAneka || allowFabDataTarget

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
  const fs = fabSignalProp || { lapkeu: false, month: '', datatarget: false }

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
  const isOnDataTargetPath = /^\/admin\/marketing\/data-target\b/.test(location.pathname)
  const isOnLapkeuMonth = (() => {
    if (!/^\/admin\/keuangan\/laporan\b/.test(location.pathname)) return false
    try {
      const hasQuery = !!(new URLSearchParams(location.search)).get('month')
      const hasBody = fs.lapkeu
      return hasQuery || hasBody
    } catch { return false }
  })()
  const isOnDataTargetMonth = isOnDataTargetPath && !!(fs.datatarget)
  if (!isOnPoskasMain && !isOnOmsetMain && !isOnLapkeuMonth && !isOnAnekaMain && !isOnDataTargetMonth && !targetBtn) return null

  return (
    <div className="lg:hidden">
      <button
        type="button"
        aria-label={
          isOnPoskasMain ? 'Tambah Poskas' : (
          isOnOmsetMain ? 'Tambah Omset' : (
          isOnLapkeuMonth ? 'Tambah Lap Keu' : (
          isOnAnekaMain ? 'Tambah Aneka Grafik' : (
          isOnDataTargetMonth ? 'Tambah Data Target' : 'Tambah'))))}
        title={
          isOnPoskasMain ? 'Tambah Poskas' : (
          isOnOmsetMain ? 'Tambah Omset' : (
          isOnLapkeuMonth ? 'Tambah Lap Keu' : (
          isOnAnekaMain ? 'Tambah Aneka Grafik' : (
          isOnDataTargetMonth ? 'Tambah Data Target' : 'Tambah'))))}
        onClick={() => {
          // Prioritaskan navigasi eksplisit sesuai halaman
          if (isOnPoskasMain) {
            navigate('/admin/keuangan/poskas/new')
          } else if (isOnOmsetMain) {
            navigate('/admin/keuangan/omset-harian/new')
          } else if (isOnDataTargetMonth) {
            navigate('/admin/marketing/data-target/new')
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
 