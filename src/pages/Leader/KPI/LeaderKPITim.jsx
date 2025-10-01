import React, { useCallback, useEffect, useMemo, useState } from 'react'
import api from '../../../services/api'
import { API_CONFIG } from '../../../config/constants'
import { useAuth } from '../../../contexts/AuthContext'
import { BarChart3, Target, Award } from 'lucide-react'

const LeaderKPITim = () => {
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [items, setItems] = useState([])
  const [leaderDivisi, setLeaderDivisi] = useState(null)
  const [selectedItem, setSelectedItem] = useState(null)

  const endpoint = useMemo(() => (user?.id ? `/kpi/leader/${user.id}` : null), [user?.id])

  const normalize = useCallback((it) => ({
    ...it,
    name: it.name || it.nama || 'KPI',
    description: it.description || it.deskripsi || '',
    category: (it.category ? String(it.category).toLowerCase() : ''),
    updated_at: it.updated_at || it.updatedAt || null,
    created_at: it.created_at || it.createdAt || null,
  }), [])

  const formatDateTime = (dateString) => {
    if (!dateString) return '-'
    const date = new Date(dateString)
    return date.toLocaleString('id-ID', {
      year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
    })
  }

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
    if (!items || items.length === 0) return '-'
    const latest = [...items].sort((a, b) => new Date(b.updated_at || b.created_at || 0) - new Date(a.updated_at || a.created_at || 0))[0]
    const dt = latest?.updated_at || latest?.created_at
    return formatDateTime(dt)
  }, [items])

  const fetchData = useCallback(async () => {
    if (!endpoint) return
    try {
      setLoading(true)
      setError('')
      const url = API_CONFIG.getUrl(endpoint)
      const res = await api.get(url)
      const data = res?.data?.data || {}
      const list = Array.isArray(data.kpis) ? data.kpis : []
      const normalized = list.map(normalize)
      setItems(normalized)
      setLeaderDivisi(data.leaderDivisi || null)
      setSelectedItem(normalized[0] || null)
    } catch (err) {
      setError(err?.response?.data?.message || 'Gagal memuat KPI tim leader')
      setItems([])
      setSelectedItem(null)
    } finally {
      setLoading(false)
    }
  }, [endpoint, normalize])

  useEffect(() => { fetchData() }, [fetchData])

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto"></div>
          <p className="mt-3 text-gray-600">Memuat KPI Tim...</p>
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
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-red-800 text-white px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span className="text-sm font-semibold bg-white/10 rounded px-2 py-1">LEADER</span>
            <div>
              <h1 className="text-xl md:text-2xl font-extrabold tracking-tight">KPI TIM SAYA</h1>
              <p className="text-sm text-red-100">Ringkasan KPI untuk divisi yang Anda pimpin</p>
            </div>
          </div>
          {leaderDivisi && (
            <div className="text-xs md:text-sm text-red-100">
              <span className="font-medium">Divisi Utama:</span> {leaderDivisi?.nama_divisi}
            </div>
          )}
        </div>
      </div>

      {/* Last Update Info */}
      <div className="bg-gray-200 px-6 py-2">
        <p className="text-sm text-gray-600">Data terakhir diupdate: {lastUpdatedText}</p>
      </div>

      {/* Main Content */}
      <div className="flex gap-6 p-6 min-h-[60vh]">
        {/* List kiri */}
        <div className="w-full md:w-1/2 bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
          <div className="p-4 border-b border-gray-200 bg-gray-50">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-gray-900 flex items-center">
                <BarChart3 className="w-5 h-5 mr-2 text-red-600" />
                Daftar KPI Tim
              </h3>
            </div>
          </div>
          <div className="p-4 overflow-y-auto max-h-[calc(100vh-360px)]">
            <div className="space-y-3" role="listbox" aria-label="Daftar KPI Tim">
              {items.length === 0 && (
                <div className="text-sm text-gray-500">Belum ada KPI untuk tim Anda.</div>
              )}
              {items.map((item, idx) => (
                <div
                  key={item.id || idx}
                  role="option"
                  aria-selected={selectedItem === item}
                  onClick={() => setSelectedItem(item)}
                  className={`p-4 rounded-lg cursor-pointer transition-all duration-200 border ${
                    selectedItem === item
                      ? 'bg-red-600 text-white border-red-600 shadow-lg'
                      : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <div className="font-semibold text-sm truncate" title={item.name}>{item.name}</div>
                      <div className="text-xs opacity-80 mt-0.5 flex flex-wrap gap-2">
                        <span className="capitalize">{item.category || '-'}</span>
                        <span>•</span>
                        <span>{item?.divisi?.nama_divisi || '-'}</span>
                        <span>•</span>
                        <span>{item?.user?.nama || '-'}</span>
                      </div>
                    </div>
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
              Detail KPI Tim
            </h3>
          </div>
          <div className="p-4 h-full">
            {selectedItem ? (
              <div className="h-full flex flex-col">
                <div className="mb-4">
                  <h4 className="text-xl font-bold text-gray-900 mb-2">{selectedItem.name}</h4>
                  <div className="text-sm text-gray-600 flex flex-wrap gap-3">
                    <span>Kategori: {selectedItem.category || '-'}</span>
                    <span>|</span>
                    <span>Divisi: {selectedItem?.divisi?.nama_divisi || '-'}</span>
                    <span>|</span>
                    <span>User: {selectedItem?.user?.nama || '-'}</span>
                  </div>
                </div>
                <div className="flex-1 bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg overflow-hidden border border-gray-200">
                  {getPhotoUrl(selectedItem) ? (
                    <img
                      src={getPhotoUrl(selectedItem)}
                      alt={`Foto KPI: ${selectedItem.name}`}
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
                {selectedItem?.description && (
                  <p className="mt-4 text-sm text-gray-700 whitespace-pre-line">{selectedItem.description}</p>
                )}
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

export default LeaderKPITim

