import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { MENU_CODES } from '@/config/menuCodes'
import { useAuth } from '../../../contexts/AuthContext'
import api from '../../../services/api'
import { API_CONFIG } from '../../../config/constants'
import { BarChart3, Target, Award } from 'lucide-react'

const LeaderKPISaya = () => {
  const { user } = useAuth()

  const [kpiData, setKpiData] = useState({ divisi: [], leader: [], individu: [] })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [selectedItem, setSelectedItem] = useState(null)

  const fetchData = useCallback(async () => {
    if (!user?.id) return
    try {
      setLoading(true)
      setError('')
      // Ambil KPI berbasis divisi leader dari backend
      const res = await api.get(`/kpi/leader/${user.id}`)
      console.log('[LeaderKPISaya] /kpi/leader response:', res?.data)
      const data = res?.data?.data || {}
      const list = Array.isArray(data.kpis) ? data.kpis : []

      // Normalisasi properti agar konsisten (tanpa memaksa kategori)
      const normalize = (it) => ({
        ...it,
        name: it.name || it.nama || 'KPI',
        description: it.description || it.deskripsi || '',
        category: (it.category ? String(it.category).toLowerCase() : ''),
        updated_at: it.updated_at || it.updatedAt || null,
        created_at: it.created_at || it.createdAt || null,
      })

      const items = list.map(normalize)
      const grouped = {
        divisi: items.filter(i => i.category === 'divisi'),
        leader: items.filter(i => i.category === 'leader'),
        individu: items.filter(i => i.category === 'individu'),
      }
      setKpiData(grouped)
      // Pilihan default: item pertama kategori leader; jika kosong, tidak tampilkan apapun (tanpa fallback)
      setSelectedItem((grouped.leader && grouped.leader[0]) || null)
    } catch (e) {
      const status = e?.response?.status
      const msg = e?.response?.data?.message || e?.message
      const doFallbackToLeaderCategory = async () => {
        console.warn('[LeaderKPISaya] Fallback ke /kpi/category/leader karena status:', status, 'msg:', msg)
        try {
          const alt = await api.get('/kpi/category/leader')
          const arr = Array.isArray(alt?.data?.data) ? alt.data.data : (Array.isArray(alt?.data) ? alt.data : [])
          const normalize = (it) => ({
            ...it,
            name: it.name || it.nama || 'KPI',
            description: it.description || it.deskripsi || '',
            category: (it.category || 'leader').toLowerCase(),
            updated_at: it.updated_at || it.updatedAt || null,
            created_at: it.created_at || it.createdAt || null,
          })
          const items = arr.map(normalize)
          const grouped = { divisi: [], leader: items, individu: [] }
          setKpiData(grouped)
          setSelectedItem(items[0] || null)
          setError('')
        } catch (e2) {
          console.error('[LeaderKPISaya] Fallback /kpi/category/leader gagal:', e2)
          setError('KPI Leader tidak tersedia untuk akun ini.')
          setKpiData({ divisi: [], leader: [], individu: [] })
          setSelectedItem(null)
        }
      }

      if (status === 404) {
        await doFallbackToLeaderCategory()
      } else if (status === 401) {
        setError('Tidak terotorisasi. Silakan login ulang atau periksa token akses Anda.')
        setKpiData({ divisi: [], leader: [], individu: [] })
        setSelectedItem(null)
      } else {
        // Untuk kasus 500 atau error lain, coba fallback dulu
        await doFallbackToLeaderCategory()
      }
    } finally {
      setLoading(false)
    }
  }, [user?.id])

  useEffect(() => { fetchData() }, [fetchData])

  const getCurrentData = () => (kpiData.leader || [])

  // Helper format tanggal dan teks "Terakhir diupdate"
  const formatDateTime = (dateString) => {
    if (!dateString) return '-'
    const date = new Date(dateString)
    return date.toLocaleString('id-ID', {
      year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
    })
  }

  // Helper URL foto KPI (mengikuti AdminKPI)
  const getPhotoUrl = (item) => {
    if (!item) return ''
    const raw = item.photo_url
    if (!raw) return ''
    if (typeof raw === 'string' && raw.startsWith('http')) return raw
    const base = (API_CONFIG && API_CONFIG.BASE_HOST && API_CONFIG.BASE_HOST.startsWith('http'))
      ? API_CONFIG.BASE_HOST
      : ((API_CONFIG && API_CONFIG.BASE_URL && API_CONFIG.BASE_URL.startsWith('http'))
          ? API_CONFIG.BASE_URL
          : (typeof window !== 'undefined' ? window.location.origin : 'http://localhost'))
    const path = raw.startsWith('/') ? raw : `/uploads/${raw}`
    try {
      return new URL(path, base).toString()
    } catch {
      return `${String(base).replace(/\/$/, '')}${path}`
    }
  }

  const lastUpdatedText = useMemo(() => {
    const list = getCurrentData()
    if (!list || list.length === 0) return '-'
    // Ambil item dengan tanggal terbaru
    const latest = [...list].sort((a, b) => new Date(b.updated_at || b.created_at || 0) - new Date(a.updated_at || a.created_at || 0))[0]
    const dt = latest?.updated_at || latest?.created_at
    return formatDateTime(dt)
  }, [kpiData.leader])

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto"></div>
          <p className="mt-3 text-gray-600">Memuat KPI Saya...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">{error}</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header - konsisten dengan Admin */}
      <div className="bg-red-800 text-white px-4 sm:px-6 py-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span className="text-sm font-semibold bg-white/10 rounded px-2 py-1">{MENU_CODES.sdm.kpi}</span>
            <div>
              <h1 className="text-xl md:text-2xl font-extrabold tracking-tight">KPI SAYA</h1>
            </div>
          </div>
        </div>
      </div>

      {/* Last Update Info */}
      <div className="bg-gray-200 px-4 sm:px-6 py-2">
        <p className="text-sm text-gray-900">Terakhir diupdate: {lastUpdatedText}</p>
      </div>

      {/* Tidak ada tabs: halaman ini khusus kategori Leader */}

      {/* Main Content - side by side seperti Admin */}
      <div className="flex gap-6 p-6 min-h-[60vh]">
        {/* List kiri */}
        <div className="w-full md:w-1/2 bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
          <div className="p-4 border-b border-gray-200 bg-gray-50">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-gray-900 flex items-center">
                <BarChart3 className="w-5 h-5 mr-2 text-red-600" />
                Daftar KPI
              </h3>
            </div>
          </div>
          <div className="p-4 overflow-y-auto max-h-[calc(100vh-360px)]">
            <div className="space-y-3">
              {getCurrentData().length === 0 && (
                <div className="text-sm text-gray-500">Belum ada KPI pada kategori ini.</div>
              )}
              {getCurrentData().map((item, idx) => (
                <div
                  key={idx}
                  onClick={() => setSelectedItem(item)}
                  className={`p-4 rounded-lg cursor-pointer transition-all duration-200 border ${
                    selectedItem === item
                      ? 'bg-red-600 text-white border-red-600 shadow-lg'
                      : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-sm">{item.name}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Detail kanan */}
        <div className="hidden md:block md:w-1/2 bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
          <div className="p-4 border-b border-gray-200 bg-gray-50">
            <h3 className="text-lg font-bold text-gray-900 flex items-center">
              <Target className="w-5 h-5 mr-2 text-red-600" />
              Detail KPI
            </h3>
          </div>
          <div className="p-4 h-full">
            {selectedItem ? (
              <div className="h-full flex flex-col">
                <div className="mb-4">
                  <h4 className="text-xl font-bold text-gray-900 mb-2">{selectedItem.name}</h4>
                  <p className="text-sm text-gray-600">Kategori: {selectedItem.category}</p>
                </div>
                <div className="flex-1 bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg overflow-hidden border border-gray-200">
                  {getPhotoUrl(selectedItem) ? (
                    <img
                      src={getPhotoUrl(selectedItem)}
                      alt={selectedItem.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.onerror = null
                        e.currentTarget.src = 'https://placehold.co/600x400?text=No+Image'
                      }}
                    />
                  ) : (
                    <div className="h-full flex items-center justify-center p-6">
                      <div className="text-center">
                        <div className="w-24 h-24 mx-auto mb-4 bg-gradient-to-br from-red-100 to-red-200 rounded-full flex items-center justify-center">
                          <Award className="w-12 h-12 text-red-600" />
                        </div>
                        <p className="text-gray-500 text-sm">Belum ada foto KPI untuk item ini</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="h-full flex items-center justify-center">
                <div className="text-center">
                  <div className="w-24 h-24 mx-auto mb-4 bg-gradient-to-br from-red-100 to-red-200 rounded-full flex items-center justify-center">
                    <Award className="w-12 h-12 text-red-600" />
                  </div>
                  <h4 className="text-xl font-bold text-gray-800 mb-2">Pilih KPI</h4>
                  <p className="text-gray-500 text-sm">Klik item di sebelah kiri untuk melihat detail</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default LeaderKPISaya
