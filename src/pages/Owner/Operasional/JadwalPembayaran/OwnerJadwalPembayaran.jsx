import React, { useEffect, useMemo, useState } from 'react'
import { useAuth } from '../../../../contexts/AuthContext'
import { jadwalPembayaranService } from '../../../../services/jadwalPembayaranService'
import { ChevronDown, ChevronRight } from 'lucide-react'

const formatCurrency = (val) => {
  if (val === null || val === undefined || val === '') return '-'
  const num = Number(val)
  if (isNaN(num)) return val
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(num)
}

const prettyKategori = (k) => {
  const key = String(k || '')
  if (key === 'pajak_kendaraan_pribadi') return 'PAJAK/STNK KENDARAAN PRIBADI'
  if (key === 'pajak_kendaraan_operasional') return 'PAJAK/STNK KENDARAAN OPERASIONAL'
  if (key === 'pajak_kendaraan_distribusi') return 'PAJAK/STNK KENDARAAN DISTRIBUSI'
  return key.replaceAll('_', ' ').toUpperCase()
}

const OwnerJadwalPembayaran = () => {
  const { user } = useAuth()
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [expandedKategori, setExpandedKategori] = useState({})
  const [expandedYear, setExpandedYear] = useState({})
  const [expandedMonth, setExpandedMonth] = useState({})

  const load = async () => {
    try {
      setLoading(true)
      const res = await jadwalPembayaranService.getAll()
      setData(res?.data || [])
    } catch (e) {
      setError(e?.response?.data?.message || 'Gagal memuat data')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  const lastUpdatedText = useMemo(() => {
    if (!data || data.length === 0) return '-'
    const dates = data
      .map(d => d.updated_at || d.created_at)
      .filter(Boolean)
      .map(d => new Date(d).getTime())
    const max = Math.max(...dates)
    if (!isFinite(max)) return '-'
    const dt = new Date(max)
    return `${dt.toLocaleDateString('id-ID')} pukul ${dt.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}`
  }, [data])

  // group -> kategori -> tahun -> bulan
  const grouped = useMemo(() => {
    const map = {}
    for (const item of data) {
      const cat = item.kategori || 'lainnya'
      const year = item.tahun || new Date().getFullYear()
      const month = item.bulan || ''
      if (!map[cat]) map[cat] = {}
      if (!map[cat][year]) map[cat][year] = {}
      if (!map[cat][year][month]) map[cat][year][month] = []
      map[cat][year][month].push(item)
    }
    return map
  }, [data])

  return (
    <div className="p-0 bg-gray-50 min-h-screen">
      {/* Header merah (Owner) */}
      <div className="bg-red-800 text-white px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl md:text-2xl font-extrabold tracking-tight">Jadwal</h1>
            <p className="text-sm text-red-100">Pembayaran dan Perawatan</p>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={load} className="px-4 py-2 rounded-lg border border-white/60 hover:bg-white/10">Refresh</button>
          </div>
        </div>
      </div>

      {/* Last updated */}
      <div className="px-6 py-2 bg-white border-b">
        <div className="text-sm text-gray-600">Terakhir diupdate: {lastUpdatedText}</div>
      </div>

      <div className="px-6 py-6">
        {loading && (
          <div className="text-gray-600">Memuat data...</div>
        )}

        {error && (
          <div className="text-red-600 mb-3">{error}</div>
        )}

        {!loading && !error && Object.keys(grouped).length === 0 && (
          <div className="text-gray-600">Belum ada data.</div>
        )}

        {!loading && !error && Object.keys(grouped).map((kategori) => {
          const prettyCat = prettyKategori(kategori)
          const catOpen = !!expandedKategori[kategori]
          const years = Object.keys(grouped[kategori] || {}).sort((a,b)=>b-a)
          return (
            <div key={kategori} className="mb-4 border rounded-lg overflow-hidden">
              <button onClick={() => setExpandedKategori(v=>({...v,[kategori]:!v[kategori]}))} className="w-full flex items-center justify-between px-4 py-3 bg-red-700 text-white">
                <span className="font-semibold">{prettyCat}</span>
                {catOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
              </button>
              {catOpen && (
                <div className="bg-white">
                  {years.map((y) => {
                    const yearKey = `${kategori}-${y}`
                    const yOpen = !!expandedYear[yearKey]
                    const months = Object.keys(grouped[kategori][y] || {})
                    return (
                      <div key={y} className="border-t">
                        <button onClick={() => setExpandedYear(v=>({...v,[yearKey]:!v[yearKey]}))} className="w-full flex items-center justify-between px-4 py-2 bg-gray-50 text-gray-800 font-semibold">
                          <span>Tahun {y}</span>
                          {yOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                        </button>
                        {yOpen && (
                          <div className="divide-y">
                            {months.map((m) => {
                              const monthKey = `${yearKey}-${m}`
                              const mOpen = !!expandedMonth[monthKey]
                              const items = grouped[kategori][y][m] || []
                              return (
                                <div key={m}>
                                  <button onClick={() => setExpandedMonth(v=>({...v,[monthKey]:!v[monthKey]}))} className="w-full flex items-center justify-between px-4 py-2 text-gray-800 font-medium">
                                    <span className="capitalize">{m || '-'}</span>
                                    {mOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                                  </button>
                                  {mOpen && (
                                    <div className="px-0">
                                      {items.map((row) => (
                                        <div key={row.id} className="mx-4 mb-4 border rounded overflow-hidden">
                                          {/* Tabel key:value */}
                                          <div className="grid grid-cols-1 md:grid-cols-2">
                                            <div className="border-b p-3 bg-gray-50 font-medium">{prettyCat}</div>
                                            <div className="border-b p-3">{row.nama_item}</div>
                                            <div className="p-3 border-b bg-gray-50">Sewa</div>
                                            <div className="p-3 border-b">{formatCurrency(row.sewa)}</div>
                                            <div className="p-3 border-b bg-gray-50">Pemilik</div>
                                            <div className="p-3 border-b">{row.pemilik_sewa || '-'}</div>
                                            <div className="p-3 border-b bg-gray-50">Kontak</div>
                                            <div className="p-3 border-b">{row.no_kontak_pemilik_sewa || '-'}</div>
                                            <div className="p-3 border-b bg-gray-50">Rekening</div>
                                            <div className="p-3 border-b">{row.no_rekening || '-'}</div>
                                            <div className="p-3 border-b bg-gray-50">Jatuh Tempo</div>
                                            <div className="p-3 border-b">{row.tanggal_jatuh_tempo ? new Date(row.tanggal_jatuh_tempo).toLocaleDateString('id-ID') : '-'}</div>
                                            <div className="p-3 border-b bg-gray-50">Bulan</div>
                                            <div className="p-3 border-b">{row.bulan || '-'}</div>
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              )
                            })}
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default OwnerJadwalPembayaran
