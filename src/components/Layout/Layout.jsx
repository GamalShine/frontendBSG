import React, { useEffect, useMemo, useState } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import Sidebar from './Sidebar'
import Header from './Header'
import { useLocation } from 'react-router-dom'
import { Plus } from 'lucide-react'

const Layout = ({ children }) => {
  const { user } = useAuth()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const location = useLocation()

  // Tutup sidebar saat menekan ESC
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') setSidebarOpen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
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
          <MobileFloatingAdd key={location.pathname} />
        </div>
      </div>
  )
}

export default Layout

// Komponen: FAB yang mencari tombol "Tambah" di halaman dan memicunya saat ditekan (mobile only)
const MobileFloatingAdd = () => {
  const [targetBtn, setTargetBtn] = useState(null)

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

  if (!isMobile || !targetBtn) return null

  return (
    <div className="lg:hidden">
      <button
        type="button"
        aria-label="Tambah"
        title="Tambah"
        onClick={() => targetBtn?.click()}
        className="fixed right-4 bottom-4 z-50 h-14 w-14 rounded-full bg-red-600 text-white shadow-lg shadow-red-300/40 flex items-center justify-center active:scale-95 transition-transform"
        style={{ envSafeAreaInsetBottom: 'constant(safe-area-inset-bottom)' }}
      >
        <Plus className="w-7 h-7" />
      </button>
    </div>
  )
}
 