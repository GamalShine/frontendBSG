import React, { useEffect, useMemo, useRef, useState } from 'react'
import { format } from 'date-fns'
import { id } from 'date-fns/locale'
import { jadwalPembayaranService } from '../../../../services/jadwalPembayaranService'
import { MENU_CODES } from '../../../../config/menuCodes'
import { Plus, ChevronDown, ChevronRight, Edit2, Trash2, Search } from 'lucide-react'

const KATEGORI_OPTIONS = [
  'pajak_kendaraan_pribadi',
  'pajak_kendaraan_operasional',
  'pajak_kendaraan_distribusi',
  'asuransi_kendaraan_pribadi',
  'asuransi_kendaraan_operasional',
  'asuransi_kendaraan_distribusi',
  'service_kendaraan_pribadi',
  'service_kendaraan_operasional',
  'service_kendaraan_distribusi',
  'pbb_pribadi',
  'pbb_outlet',
  'angsuran_pribadi',
  'angsuran_usaha',
  'sewa_pribadi',
  'sewa_outlet'
]

const BULAN_OPTIONS = [
  'JANUARI','FEBRUARI','MARET','APRIL','MEI','JUNI',
  'JULI','AGUSTUS','SEPTEMBER','OKTOBER','NOVEMBER','DESEMBER'
]

const formatCurrency = (val) => {
  if (val === null || val === undefined || val === '') return ''
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

const emptyForm = {
  nama_item: '',
  kategori: '',
  tanggal_jatuh_tempo: '',
  tanggal_hari: '',
  outlet: '',
  sewa: '',
  pemilik_sewa: '',
  no_kontak_pemilik_sewa: '',
  no_rekening: '',
  bulan: '',
  tahun: new Date().getFullYear()
}

const AdminJadwalPembayaran = () => {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState(emptyForm)
  const [editingId, setEditingId] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [formErrors, setFormErrors] = useState({})
  const [expandedKategori, setExpandedKategori] = useState({})
  const [expandedYear, setExpandedYear] = useState({})
  const [expandedMonth, setExpandedMonth] = useState({})
  const [searchTerm, setSearchTerm] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [filterLoading, setFilterLoading] = useState(false)
  const [kategoriFilter, setKategoriFilter] = useState('all')
  const [showDetail, setShowDetail] = useState(false)
  const [detailItem, setDetailItem] = useState(null)

  // Refs untuk baris scroll chips (desktop: bisa geser dengan mouse wheel)
  const kategoriScrollRef = useRef(null)
  const bulanScrollRef = useRef(null)

  const wheelToHorizontal = (ref) => (e) => {
    // Di desktop: alihkan scroll vertikal mouse menjadi horizontal scroll pada row chips
    try {
      const isDesktop = window.matchMedia('(min-width: 768px)').matches
      if (!isDesktop) return
      // Bila dominan vertikal, alihkan ke horizontal
      if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
        e.preventDefault()
        ref?.current?.scrollBy({ left: e.deltaY, behavior: 'smooth' })
      }
    } catch {}
  }

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

  useEffect(() => { load() }, [])

  // Debounce pencarian 300ms
  useEffect(() => {
    setFilterLoading(true)
    const t = setTimeout(() => {
      setDebouncedSearch(searchTerm)
      setFilterLoading(false)
    }, 300)
    return () => clearTimeout(t)
  }, [searchTerm])

  const lastUpdatedText = useMemo(() => {
    if (!data || data.length === 0) return '-'
    const dates = data
      .map(d => d.updated_at || d.created_at)
      .filter(Boolean)
      .map(d => new Date(d).getTime())
    const max = Math.max(...dates)
    if (!isFinite(max)) return '-'
    const dt = new Date(max)
    try {
      return format(dt, "d MMMM yyyy 'pukul' HH.mm", { locale: id })
    } catch {
      return '-'
    }
  }, [data])

  // Filter data berdasarkan pencarian sederhana
  const filteredData = useMemo(() => {
    let base = data || []
    if (kategoriFilter !== 'all') {
      base = base.filter(row => (row.kategori || '').toLowerCase() === kategoriFilter.toLowerCase())
    }
    if (!debouncedSearch) return base
    const q = debouncedSearch.toLowerCase()
    return base.filter(row => (
      (row.nama_item || '').toLowerCase().includes(q) ||
      (row.kategori || '').toLowerCase().includes(q) ||
      (row.outlet || '').toLowerCase().includes(q) ||
      (row.pemilik_sewa || '').toLowerCase().includes(q) ||
      (row.no_kontak_pemilik_sewa || '').toLowerCase().includes(q) ||
      (row.no_rekening || '').toLowerCase().includes(q) ||
      (row.bulan || '').toLowerCase().includes(q)
    ))
  }, [data, debouncedSearch, kategoriFilter])

  // group -> kategori -> tahun -> bulan
  const grouped = useMemo(() => {
    const map = {}
    for (const item of filteredData) {
      const cat = item.kategori || 'lainnya'
      const year = item.tahun || new Date().getFullYear()
      const month = item.bulan || ''
      if (!map[cat]) map[cat] = {}
      if (!map[cat][year]) map[cat][year] = {}
      if (!map[cat][year][month]) map[cat][year][month] = []
      map[cat][year][month].push(item)
    }
    return map
  }, [filteredData])

  // Auto-expand kategori/tahun/bulan bila ada keyword: buka hanya grup yang berisi hasil (grouped sudah hasil filter)
  useEffect(() => {
    const hasKeyword = (debouncedSearch || '').trim().length > 0
    if (!hasKeyword) {
      setExpandedKategori({})
      setExpandedYear({})
      setExpandedMonth({})
      return
    }
    const nextCat = {}
    const nextYear = {}
    const nextMonth = {}
    Object.keys(grouped).forEach(cat => {
      nextCat[cat] = true
      const yearsObj = grouped[cat] || {}
      Object.keys(yearsObj).forEach(y => {
        const yearKey = `${cat}-${y}`
        nextYear[yearKey] = true
        const monthsObj = yearsObj[y] || {}
        Object.keys(monthsObj).forEach(m => {
          const monthKey = `${yearKey}-${m}`
          // buka hanya jika ada item
          if ((monthsObj[m] || []).length > 0) nextMonth[monthKey] = true
        })
      })
    })
    setExpandedKategori(nextCat)
    setExpandedYear(nextYear)
    setExpandedMonth(nextMonth)
  }, [debouncedSearch, grouped])

  // Helper highlight teks sesuai keyword
  const highlightText = (val) => {
    const text = String(val ?? '')
    const q = String(debouncedSearch || '').trim()
    if (!q) return text
    try {
      const esc = q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
      const re = new RegExp(esc, 'ig')
      const parts = text.split(re)
      const matches = text.match(re)
      if (!matches) return text
      const nodes = []
      for (let i = 0; i < parts.length; i++) {
        if (parts[i]) nodes.push(<span key={`p-${i}`}>{parts[i]}</span>)
        if (i < matches.length) nodes.push(<mark key={`m-${i}`} className="bg-yellow-200 px-0.5 rounded">{matches[i]}</mark>)
      }
      return <>{nodes}</>
    } catch {
      return text
    }
  }

  const openCreate = () => {
    setEditingId(null)
    setFormData(emptyForm)
    setShowForm(true)
  }

  const openDetail = (item) => {
    setDetailItem(item)
    setShowDetail(true)
  }

  const openEdit = (item) => {
    setEditingId(item.id)
    setFormData({
      nama_item: item.nama_item || '',
      kategori: item.kategori || '',
      tanggal_jatuh_tempo: item.tanggal_jatuh_tempo || '',
      tanggal_hari: item.tanggal_jatuh_tempo ? new Date(item.tanggal_jatuh_tempo).getDate() : '',
      outlet: item.outlet || '',
      sewa: item.sewa || '',
      pemilik_sewa: item.pemilik_sewa || '',
      no_kontak_pemilik_sewa: item.no_kontak_pemilik_sewa || '',
      no_rekening: item.no_rekening || '',
      bulan: item.bulan || '',
      tahun: item.tahun || new Date().getFullYear(),
    })
    setShowForm(true)
  }

  const onSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    setError(null)
    setFormErrors({})
    // Validasi minimal dari backend: nama_item & kategori wajib
    const errs = {}
    const k = String(formData.kategori || '')
    const isSewaOutlet = k === 'sewa_outlet'

    if (!formData.nama_item) errs.nama_item = 'Nama item wajib'
    if (!formData.kategori) errs.kategori = 'Kategori wajib'

    // Aturan baru:
    // - Default (semua kategori) mengikuti pola pajak: tanggal_hari, bulan, tahun wajib
    // - KECUALI sewa_outlet: outlet, nominal (sewa), bulan, tahun wajib
    if (isSewaOutlet) {
      if (!formData.outlet) errs.outlet = 'Outlet wajib untuk SEWA OUTLET'
      if (!formData.sewa) errs.sewa = 'Nominal sewa wajib'
      if (!formData.bulan) errs.bulan = 'Bulan wajib'
      if (!formData.tahun) errs.tahun = 'Tahun wajib'
    } else {
      if (!formData.tanggal_hari) errs.tanggal_hari = 'Tanggal (hari) wajib'
      const dayNum = Number(formData.tanggal_hari)
      if (formData.tanggal_hari && (isNaN(dayNum) || dayNum < 1 || dayNum > 31)) errs.tanggal_hari = 'Tanggal harus 1-31'
      if (!formData.bulan) errs.bulan = 'Bulan wajib'
      if (!formData.tahun) errs.tahun = 'Tahun wajib'
    }

    if (Object.keys(errs).length > 0) {
      setFormErrors(errs)
      setSubmitting(false)
      return
    }
    try {
      // Normalisasi payload untuk menghindari error 500 di backend:
      // - Ubah '' menjadi null pada field opsional/ENUM/DATE
      // - Parse number untuk sewa (DECIMAL) dan tahun (INTEGER)
      const normalize = (v) => (v === '' || v === undefined ? null : v)
      const monthIndex = BULAN_OPTIONS.findIndex(b => String(b).toUpperCase() === String(formData.bulan||'').toUpperCase())
      let tanggalJatuhTempo = normalize(formData.tanggal_jatuh_tempo)
      if (!isSewaOutlet) {
        if (formData.tahun && formData.bulan && formData.tanggal_hari) {
          const y = Number(formData.tahun)
          const m = monthIndex >= 0 ? (monthIndex + 1) : 1
          const d = Math.min(Math.max(Number(formData.tanggal_hari), 1), 31)
          const mm = String(m).padStart(2, '0')
          const dd = String(d).padStart(2, '0')
          tanggalJatuhTempo = `${y}-${mm}-${dd}`
        } else {
          tanggalJatuhTempo = null
        }
      }
      const payload = {
        nama_item: formData.nama_item,
        kategori: formData.kategori,
        tanggal_jatuh_tempo: tanggalJatuhTempo,
        outlet: normalize(formData.outlet),
        sewa:
          formData.sewa === '' || formData.sewa === null || formData.sewa === undefined
            ? null
            : Number(formData.sewa),
        pemilik_sewa: normalize(formData.pemilik_sewa),
        no_kontak_pemilik_sewa: normalize(formData.no_kontak_pemilik_sewa),
        no_rekening: normalize(formData.no_rekening),
        bulan: normalize(formData.bulan),
        tahun: formData.tahun ? Number(formData.tahun) : new Date().getFullYear(),
      }

      if (editingId) {
        await jadwalPembayaranService.update(editingId, payload)
      } else {
        await jadwalPembayaranService.create(payload)
      }
      setShowForm(false)
      await load()
    } catch (e) {
      setError(e?.response?.data?.message || 'Gagal menyimpan data')
    } finally {
      setSubmitting(false)
    }
  }

  const onDelete = async (id) => {
    if (!confirm('Hapus item ini?')) return
    try {
      await jadwalPembayaranService.remove(id)
      await load()
    } catch (e) {
      setError(e?.response?.data?.message || 'Gagal menghapus data')
    }
  }

  return (
    <div className="p-0 bg-gray-50 min-h-screen">
      {/* Header merah */}
      <div className="bg-red-800 text-white px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 md:gap-4">
            <span className="text-[10px] md:text-sm font-semibold bg-white/10 rounded px-2 py-0.5 md:py-1">{MENU_CODES.operasional.jadwalPembayaran}</span>
            <div>
              <h1 className="text-lg md:text-2xl font-extrabold tracking-tight">JADWAL PEMBAYARAN/PERAWATAN</h1>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={openCreate} className="hidden md:inline-flex items-center gap-2 px-4 py-2 bg-white text-red-700 rounded-lg hover:bg-red-50 transition-colors shadow-sm">
              <Plus className="h-4 w-4" />
              <span className="font-semibold">Tambah</span>
            </button>
          </div>
        </div>
      </div>

      {/* Last updated */}
      <div className="px-4 py-2 bg-gray-200">
        <div className="text-sm text-gray-900">Terakhir diupdate: {lastUpdatedText}</div>
      </div>

      {/* Form Pencarian (selalu tampil) */}
      <div className="bg-white rounded-none md:rounded-xl shadow-sm border border-gray-100 mt-6 mb-0">
        <div className="px-6 py-4">
          <div className="grid grid-cols-1 gap-4">
            <div>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e)=>setSearchTerm(e.target.value)}
                  placeholder="Cari nama item, kategori, outlet, pemilik, rekening, bulan..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-red-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="px-0 my-6">
        {error && (
          <div className="text-red-600 mb-3">{error}</div>
        )}

        {loading ? (
          <div className="text-gray-600">Memuat data...</div>
        ) : (
          Object.keys(grouped).map((kategori) => {
            const prettyCat = prettyKategori(kategori)
            const catOpen = !!expandedKategori[kategori]
            const years = Object.keys(grouped[kategori] || {}).sort((a,b)=>b-a)
            const totalItemsInCat = years.reduce((acc, y)=> acc + Object.values(grouped[kategori][y]||{}).reduce((a,arr)=>a+arr.length,0), 0)
            const totalSewaInCat = years.reduce((acc, y)=> acc + Object.values(grouped[kategori][y]||{}).flat().reduce((a,row)=> a + (Number(row.sewa)||0), 0), 0)
            return (
              <div key={kategori} className="mb-6 border rounded-lg overflow-hidden shadow-sm">
                <button onClick={() => setExpandedKategori(v=>({...v,[kategori]:!v[kategori]}))} className="w-full flex items-center justify-between px-5 py-4 bg-red-700 text-white">
                  <div className="flex items-start gap-3 flex-col md:flex-row md:items-center md:gap-3">
                    <span className="font-bold tracking-wide">{prettyCat}</span>
                    <div className="hidden md:flex items-center gap-2">
                      <span className="ml-2 text-xs bg-white/15 px-2 py-0.5 rounded-full">{totalItemsInCat} item</span>
                      <span className="ml-1 text-xs bg-white/15 px-2 py-0.5 rounded-full">{formatCurrency(totalSewaInCat)}</span>
                    </div>
                  </div>
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
                          <button onClick={() => setExpandedYear(v=>({...v,[yearKey]:!v[yearKey]}))} className="w-full flex items-center justify-between px-5 py-3 bg-gray-50 text-gray-800 font-semibold">
                            <span className="flex items-center gap-2">Tahun {y}</span>
                            <span className="text-xs font-medium text-gray-600 flex items-center gap-2">
                              <span className="bg-gray-200 px-2 py-0.5 rounded-full">{months.reduce((a,m)=> a + (grouped[kategori][y][m]?.length||0), 0)} item</span>
                              <span className="bg-gray-200 px-2 py-0.5 rounded-full">{formatCurrency(months.reduce((a,m)=> a + (grouped[kategori][y][m]||[]).reduce((s,row)=> s + (Number(row.sewa)||0), 0), 0))}</span>
                              {yOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                            </span>
                          </button>
                          {yOpen && (
                            <div className="">
                              {months.map((m) => {
                                const monthKey = `${yearKey}-${m}`
                                const mOpen = !!expandedMonth[monthKey]
                                const items = grouped[kategori][y][m] || []
                                const monthTotal = items.reduce((a,row)=> a + (Number(row.sewa)||0), 0)
                                return (
                                  <div key={m} className="border-t">
                                    <button onClick={() => setExpandedMonth(v=>({...v,[monthKey]:!v[monthKey]}))} className="w-full flex items-center justify-between px-5 py-2 text-gray-800 font-semibold">
                                      <span className="capitalize">{m || '-'}</span>
                                      <span className="text-xs font-medium text-gray-600 flex items-center gap-2">
                                        <span className="bg-gray-100 px-2 py-0.5 rounded-full">{items.length} item</span>
                                        <span className="bg-gray-100 px-2 py-0.5 rounded-full">{formatCurrency(monthTotal)}</span>
                                        {mOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                                      </span>
                                    </button>
                                    {mOpen && (
                                      <div className="px-4 pb-4">
                                        {/* Mobile: list sederhana */}
                                        <div className="block md:hidden divide-y">
                                          {items.map((row) => (
                                            <div key={row.id} className="pt-3 pb-2" onClick={() => openDetail(row)}>
                                              <div className="text-sm font-semibold text-gray-900 mb-2">{row.nama_item || '-'}</div>
                                              <div className="border border-gray-200 rounded">
                                                <div className="grid grid-cols-[1fr,1fr] text-sm">
                                                  <div className="px-3 py-2 border-b border-r text-gray-700">Jatuh Tempo</div>
                                                  <div className="px-3 py-2 border-b">{row.tanggal_jatuh_tempo ? new Date(row.tanggal_jatuh_tempo).toLocaleDateString('id-ID', { day:'2-digit', month:'long', year:'numeric' }) : '-'}</div>
                                                  <div className="px-3 py-2 border-r text-gray-700">Bulan</div>
                                                  <div className="px-3 py-2">{row.bulan || '-'}</div>
                                                </div>
                                              </div>
                                              <div className="mt-0 flex items-center justify-end gap-1">
                                                <button
                                                  onClick={(e) => { e.stopPropagation(); openEdit(row) }}
                                                  className="inline-flex items-center justify-center p-1 rounded text-red-700 hover:text-red-800 hover:bg-red-50"
                                                  aria-label="Edit"
                                                >
                                                  <Edit2 className="h-4 w-4" />
                                                </button>
                                                <button
                                                  onClick={(e) => { e.stopPropagation(); onDelete(row.id) }}
                                                  className="inline-flex items-center justify-center p-1 rounded text-red-700 hover:text-red-800 hover:bg-red-50"
                                                  aria-label="Hapus"
                                                >
                                                  <Trash2 className="h-4 w-4" />
                                                </button>
                                              </div>
                                            </div>
                                          ))}
                                        </div>

                                        {/* Desktop: kartu dengan tabel ringkas, hanya field terisi */}
                                        <div className="hidden md:grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                          {items.map((row) => (
                                            <div
                                              key={row.id}
                                              className="border rounded-md overflow-hidden shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                                              onClick={() => openDetail(row)}
                                            >
                                              <div className="p-4">
                                                <div className="text-sm font-semibold text-gray-900 mb-2 truncate" title={row.nama_item || '-'}>{row.nama_item || '-'}</div>
                                                <div className="border border-gray-200 rounded">
                                                  <div className="grid grid-cols-[1fr,1fr] text-sm">
                                                    {/* Jatuh Tempo */}
                                                    {(row.tanggal_jatuh_tempo) && (
                                                      <>
                                                        <div className="px-3 py-2 border-b border-r text-gray-700">Jatuh Tempo</div>
                                                        <div className="px-3 py-2 border-b">{new Date(row.tanggal_jatuh_tempo).toLocaleDateString('id-ID', { day:'2-digit', month:'long', year:'numeric' })}</div>
                                                      </>
                                                    )}
                                                    {/* Bulan */}
                                                    {(row.bulan) && (
                                                      <>
                                                        <div className="px-3 py-2 border-b border-r text-gray-700">Bulan</div>
                                                        <div className="px-3 py-2 border-b">{row.bulan}</div>
                                                      </>
                                                    )}
                                                    {/* Outlet */}
                                                    {(row.outlet) && (
                                                      <>
                                                        <div className="px-3 py-2 border-b border-r text-gray-700">Outlet</div>
                                                        <div className="px-3 py-2 border-b">{row.outlet}</div>
                                                      </>
                                                    )}
                                                    {/* Sewa/Nominal */}
                                                    {(row.sewa !== null && row.sewa !== undefined && row.sewa !== '') && (
                                                      <>
                                                        <div className="px-3 py-2 border-b border-r text-gray-700">Sewa</div>
                                                        <div className="px-3 py-2 border-b">{formatCurrency(row.sewa)}</div>
                                                      </>
                                                    )}
                                                    {/* Pemilik */}
                                                    {(row.pemilik_sewa) && (
                                                      <>
                                                        <div className="px-3 py-2 border-b border-r text-gray-700">Pemilik</div>
                                                        <div className="px-3 py-2 border-b">{row.pemilik_sewa}</div>
                                                      </>
                                                    )}
                                                    {/* Kontak */}
                                                    {(row.no_kontak_pemilik_sewa) && (
                                                      <>
                                                        <div className="px-3 py-2 border-b border-r text-gray-700">Kontak</div>
                                                        <div className="px-3 py-2 border-b">{row.no_kontak_pemilik_sewa}</div>
                                                      </>
                                                    )}
                                                    {/* Rekening */}
                                                    {(row.no_rekening) && (
                                                      <>
                                                        <div className="px-3 py-2 border-r text-gray-700">Rekening</div>
                                                        <div className="px-3 py-2">{row.no_rekening}</div>
                                                      </>
                                                    )}
                                                  </div>
                                                </div>
                                                <div className="mt-0 flex items-center justify-end gap-1">
                                                  <button
                                                    onClick={(e) => { e.stopPropagation(); openEdit(row) }}
                                                    className="inline-flex items-center justify-center p-1 rounded text-red-700 hover:text-red-800 hover:bg-red-50"
                                                    aria-label="Edit"
                                                  >
                                                    <Edit2 className="h-4 w-4" />
                                                  </button>
                                                  <button
                                                    onClick={(e) => { e.stopPropagation(); onDelete(row.id) }}
                                                    className="inline-flex items-center justify-center p-1 rounded text-red-700 hover:text-red-800 hover:bg-red-50"
                                                    aria-label="Hapus"
                                                  >
                                                    <Trash2 className="h-4 w-4" />
                                                  </button>
                                                </div>
                                              </div>
                                            </div>
                                          ))}
                                        </div>
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
          })
        )}
      </div>

      {/* FAB Tambah (mobile only) */}
      <button
        type="button"
        onClick={openCreate}
        className="md:hidden fixed bottom-6 right-4 z-40 w-14 h-14 rounded-full bg-red-600 text-white shadow-lg flex items-center justify-center active:scale-95"
        aria-label="Tambah Jadwal Pembayaran"
      >
        <Plus className="w-6 h-6" />
      </button>

      {/* Modal Detail */}
      {showDetail && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-[1px] flex items-center justify-center z-50 p-4">
          {/* Backdrop click to close */}
          <button
            type="button"
            aria-hidden="true"
            onClick={() => setShowDetail(false)}
            className="absolute inset-0"
            tabIndex={-1}
          />

          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[92vh] overflow-hidden border border-gray-200 flex flex-col relative">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-red-700 bg-red-800 text-white sticky top-0 z-10">
              <div>
                <h3 className="text-xl font-bold leading-tight">Detail Jadwal Pembayaran</h3>
              </div>
              <button onClick={() => setShowDetail(false)} className="p-2 text-white/90 hover:text-white hover:bg-white/10 rounded-lg transition-colors" aria-label="Tutup">
                ✕
              </button>
            </div>

            {/* Body */}
            <div className="flex-1 min-h-0 overflow-y-auto px-6 py-5 scrollbar-hide">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-gray-800">
                <div>
                  <div className="text-sm text-gray-500 mb-1">Nama Item</div>
                  <div className="text-base font-medium">{detailItem?.nama_item || '-'}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-500 mb-1">Kategori</div>
                  <div className="text-base font-medium">{prettyKategori(detailItem?.kategori) || '-'}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-500 mb-1">Tanggal Jatuh Tempo</div>
                  <div className="text-base font-medium">{detailItem?.tanggal_jatuh_tempo ? new Date(detailItem.tanggal_jatuh_tempo).toLocaleDateString('id-ID') : '-'}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-500 mb-1">Outlet</div>
                  <div className="text-base font-medium">{detailItem?.outlet || '-'}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-500 mb-1">Sewa</div>
                  <div className="text-base font-medium">{formatCurrency(detailItem?.sewa)}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-500 mb-1">Pemilik Sewa</div>
                  <div className="text-base font-medium">{detailItem?.pemilik_sewa || '-'}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-500 mb-1">No. Kontak Pemilik</div>
                  <div className="text-base font-medium">{detailItem?.no_kontak_pemilik_sewa || '-'}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-500 mb-1">No. Rekening</div>
                  <div className="text-base font-medium">{detailItem?.no_rekening || '-'}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-500 mb-1">Bulan</div>
                  <div className="text-base font-medium">{detailItem?.bulan || '-'}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-500 mb-1">Tahun</div>
                  <div className="text-base font-medium">{detailItem?.tahun || '-'}</div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-0 border-t bg-white">
              <div className="px-4 py-3 flex justify-end">
                <button
                  type="button"
                  onClick={() => setShowDetail(false)}
                  className="px-4 py-2 bg-red-700 text-white font-semibold rounded-lg hover:bg-red-800"
                >
                  Tutup
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Form */}
      {showForm && (
        <div className="fixed inset-0 bg-black/40 flex items-end md:items-center justify-center z-50">
          {/* Backdrop click to close */}
          <button
            type="button"
            aria-hidden="true"
            onClick={() => setShowForm(false)}
            className="absolute inset-0"
            tabIndex={-1}
          />

          <div className="w-full max-w-[100vw] md:max-w-2xl lg:max-w-3xl bg-white rounded-none md:rounded-2xl shadow-lg overflow-hidden border border-gray-200 flex flex-col relative">
            {/* Header */}
            <div className="relative flex items-center justify-center px-4 py-3 border-b border-gray-200 bg-white text-gray-900 sticky top-0 z-10">
              <h3 className="text-base md:text-xl font-semibold leading-tight text-center">{editingId ? 'Edit' : 'Tambah'} Jadwal Pembayaran</h3>
              <button onClick={() => setShowForm(false)} className="absolute right-2 md:right-3 p-2 text-gray-500 hover:text-gray-700 rounded-lg transition-colors" aria-label="Tutup">
                ✕
              </button>
            </div>

            {/* Body */}
            <div className="flex-1 min-h-0 overflow-y-auto px-6 py-5 scrollbar-hide">
              <form id="jadwalForm" onSubmit={onSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Nama Item */}
                <div className="md:col-span-2">
                  <label className="block text-sm mb-1">Nama Item</label>
                  <input value={formData.nama_item} onChange={(e)=>setFormData(v=>({...v,nama_item:e.target.value}))} className={`w-full border rounded px-3 py-2 ${formErrors.nama_item?'border-red-500':''}`} required />
                  {formErrors.nama_item && <div className="text-xs text-red-600 mt-1">{formErrors.nama_item}</div>}
                </div>
                {/* Kategori (single row, horizontal scroll) */}
                <div className="md:col-span-2">
                  <label className="block text-sm mb-1">Kategori</label>
                  <div ref={kategoriScrollRef} onWheel={wheelToHorizontal(kategoriScrollRef)} className="overflow-x-auto whitespace-nowrap no-scrollbar">
                    <div className="inline-flex items-center gap-2 pr-2">
                      {/* Kategori chips */}
                      {KATEGORI_OPTIONS.map((opt) => {
                        const active = String(formData.kategori||'') === String(opt)
                        return (
                          <button
                            type="button"
                            key={opt}
                            onClick={() => setFormData(v=>({...v,kategori:opt}))}
                            className={`px-3 py-1.5 text-xs md:text-sm rounded border transition-colors ${active ? 'bg-red-700 text-white border-red-700' : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'}`}
                            title={prettyKategori(opt)}
                          >
                            {prettyKategori(opt)}
                          </button>
                        )
                      })}
                    </div>
                  </div>
                  {/* Error messages */}
                  {formErrors.kategori && <div className="text-xs text-red-600 mt-1">{formErrors.kategori}</div>}
                </div>

                {/* Tanggal Jatuh Tempo: tampil untuk semua kategori KECUALI sewa_outlet (dipindah ke atas Bulan) */}
                {(String(formData.kategori||'') !== 'sewa_outlet') && (
                  <div className="md:col-span-2">
                    <label className="block text-sm mb-1">Tanggal Jatuh Tempo</label>
                    <input
                      type="number"
                      min={1}
                      max={31}
                      placeholder="1-31"
                      value={formData.tanggal_hari}
                      onChange={(e)=>setFormData(v=>({...v,tanggal_hari:e.target.value}))}
                      className={`w-full border rounded px-3 py-2 ${formErrors.tanggal_hari?'border-red-500':''}`}
                    />
                    {formErrors.tanggal_hari && <div className="text-xs text-red-600 mt-1">{formErrors.tanggal_hari}</div>}
                  </div>
                )}

                {/* Bulan (chips) diletakkan tepat di bawah Tanggal Jatuh Tempo */}
                <div className="md:col-span-2">
                  <label className="block text-sm mb-1">Bulan</label>
                  <div ref={bulanScrollRef} onWheel={wheelToHorizontal(bulanScrollRef)} className="overflow-x-auto whitespace-nowrap no-scrollbar">
                    <div className="inline-flex items-center gap-2 pr-2">
                      {BULAN_OPTIONS.map((b) => {
                        const active = String(formData.bulan||'') === String(b)
                        return (
                          <button
                            type="button"
                            key={b}
                            onClick={() => setFormData(v=>({...v,bulan:b}))}
                            className={`px-2.5 py-1.5 text-xs md:text-sm rounded border transition-colors ${active ? 'bg-red-700 text-white border-red-700' : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'}`}
                          >
                            {b}
                          </button>
                        )
                      })}
                    </div>
                  </div>
                  {formErrors.bulan && <div className="text-xs text-red-600 mt-1">{formErrors.bulan}</div>}
                </div>

                {/* Outlet: tampil hanya untuk sewa_outlet */}
                {(String(formData.kategori||'') === 'sewa_outlet') && (
                  <div>
                    <label className="block text-sm mb-1">Outlet</label>
                    <input value={formData.outlet} onChange={(e)=>setFormData(v=>({...v,outlet:e.target.value}))} className={`w-full border rounded px-3 py-2 ${formErrors.outlet?'border-red-500':''}`} />
                    {formErrors.outlet && <div className="text-xs text-red-600 mt-1">{formErrors.outlet}</div>}
                  </div>
                )}

                {/* Nominal: tampil hanya untuk sewa_outlet */}
                {(String(formData.kategori||'') === 'sewa_outlet') && (
                  <div>
                    <label className="block text-sm mb-1">Nominal</label>
                    <input type="number" step="1000" placeholder="0" value={formData.sewa} onChange={(e)=>setFormData(v=>({...v,sewa:e.target.value}))} className={`w-full border rounded px-3 py-2 ${formErrors.sewa?'border-red-500':''}`} />
                    <div className="text-xs text-gray-500 mt-1">Gunakan angka saja. Contoh: 1500000</div>
                    {formErrors.sewa && <div className="text-xs text-red-600 mt-1">{formErrors.sewa}</div>}
                  </div>
                )}

                {/* Info pemilik: tampil hanya untuk sewa_outlet */}
                {(String(formData.kategori||'') === 'sewa_outlet') && (
                  <>
                    <div>
                      <label className="block text-sm mb-1">Pemilik Sewa</label>
                      <input value={formData.pemilik_sewa} onChange={(e)=>setFormData(v=>({...v,pemilik_sewa:e.target.value}))} className="w-full border rounded px-3 py-2" />
                    </div>
                    <div>
                      <label className="block text-sm mb-1">No. Kontak Pemilik</label>
                      <input value={formData.no_kontak_pemilik_sewa} onChange={(e)=>setFormData(v=>({...v,no_kontak_pemilik_sewa:e.target.value}))} className="w-full border rounded px-3 py-2" />
                    </div>
                    <div>
                      <label className="block text-sm mb-1">No. Rekening</label>
                      <input value={formData.no_rekening} onChange={(e)=>setFormData(v=>({...v,no_rekening:e.target.value}))} className="w-full border rounded px-3 py-2" />
                    </div>
                  </>
                )}

                {/* Bulan dipindah ke atas berdampingan dengan Kategori */}

                {/* Tahun: selalu tampil */}
                <div>
                  <label className="block text-sm mb-1">Tahun</label>
                  <input type="number" value={formData.tahun} onChange={(e)=>setFormData(v=>({...v,tahun:e.target.value}))} className={`w-full border rounded px-3 py-2 ${formErrors.tahun?'border-red-500':''}`} />
                  {formErrors.tahun && <div className="text-xs text-red-600 mt-1">{formErrors.tahun}</div>}
                </div>

              </form>
            </div>

            {/* Footer */}
            <div className="p-4 border-t bg-white">
              <div className="flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  form="jadwalForm"
                  disabled={submitting}
                  className="px-4 py-2 rounded-lg bg-red-700 text-white hover:bg-red-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {submitting ? 'Menyimpan...' : 'Simpan'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminJadwalPembayaran
