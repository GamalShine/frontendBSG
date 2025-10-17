import React, { useEffect, useMemo, useState } from 'react'
import { format } from 'date-fns'
import { id } from 'date-fns/locale'
import { jadwalPembayaranService } from '../../../../services/jadwalPembayaranService'
import { MENU_CODES } from '../../../../config/menuCodes'
import { Plus, ChevronDown, ChevronRight, Edit2, Search } from 'lucide-react'

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

const prettyKategori = (k) => (k || '').replaceAll('_',' ').toUpperCase()

const emptyForm = {
  nama_item: '',
  kategori: '',
  tanggal_jatuh_tempo: '',
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
  const [expandedKategori, setExpandedKategori] = useState({})
  const [expandedYear, setExpandedYear] = useState({})
  const [expandedMonth, setExpandedMonth] = useState({})
  const [searchTerm, setSearchTerm] = useState('')
  const [kategoriFilter, setKategoriFilter] = useState('all')
  const [showDetail, setShowDetail] = useState(false)
  const [detailItem, setDetailItem] = useState(null)

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
    if (!searchTerm) return base
    const q = searchTerm.toLowerCase()
    return base.filter(row => (
      (row.nama_item || '').toLowerCase().includes(q) ||
      (row.kategori || '').toLowerCase().includes(q) ||
      (row.outlet || '').toLowerCase().includes(q) ||
      (row.pemilik_sewa || '').toLowerCase().includes(q) ||
      (row.no_kontak_pemilik_sewa || '').toLowerCase().includes(q) ||
      (row.no_rekening || '').toLowerCase().includes(q) ||
      (row.bulan || '').toLowerCase().includes(q)
    ))
  }, [data, searchTerm, kategoriFilter])

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
    try {
      if (editingId) {
        await jadwalPembayaranService.update(editingId, formData)
      } else {
        await jadwalPembayaranService.create(formData)
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
          <div className="flex items-center gap-4">
            <span className="text-sm font-semibold bg-white/10 rounded px-2 py-1">{MENU_CODES.operasional.jadwalPembayaran}</span>
            <div>
              <h1 className="text-xl md:text-2xl font-extrabold tracking-tight">JADWAL PEMBAYARAN/PERAWATAN</h1>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={openCreate} className="inline-flex items-center gap-2 px-4 py-2 bg-white text-red-700 rounded-lg hover:bg-red-50 transition-colors shadow-sm">
              <Plus className="h-4 w-4" />
              <span className="font-semibold">Tambah</span>
            </button>
          </div>
        </div>
      </div>

      {/* Last updated */}
      <div className="px-4 py-2 bg-gray-200">
        <div className="text-sm text-gray-600">Terakhir diupdate: {lastUpdatedText}</div>
      </div>

      {/* Form Pencarian (selalu tampil) */}
      <div className="bg-white rounded-none md:rounded-xl shadow-sm border border-gray-100 mt-6 mb-0">
        <div className="px-6 py-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Cari Jadwal</label>
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
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Kategori</label>
              <select
                value={kategoriFilter}
                onChange={(e)=>setKategoriFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-red-500 focus:border-transparent"
              >
                <option value="all">Semua Kategori</option>
                {KATEGORI_OPTIONS.map(opt => (
                  <option key={opt} value={opt}>{opt.replaceAll('_',' ')}</option>
                ))}
              </select>
            </div>
            <div className="flex items-end">
              <button
                onClick={() => { setSearchTerm(''); setKategoriFilter('all'); }}
                className="inline-flex items-center gap-2 px-5 py-2 rounded-full border border-red-600 text-red-700 hover:bg-red-50 transition-colors"
              >
                Reset
              </button>
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
                  <div className="flex items-center gap-3">
                    <span className="font-bold tracking-wide">{prettyCat}</span>
                    <span className="ml-2 text-xs bg-white/15 px-2 py-0.5 rounded-full">{totalItemsInCat} item</span>
                    <span className="ml-1 text-xs bg-white/15 px-2 py-0.5 rounded-full">{formatCurrency(totalSewaInCat)}</span>
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
                                      <div className="px-4 pb-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                        {items.map((row) => (
                                          <div
                                            key={row.id}
                                            className="border rounded-md overflow-hidden shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                                            onClick={() => openDetail(row)}
                                          >
                                            <div className="px-4 py-3 bg-gray-50 flex items-center justify-between">
                                              <div className="font-semibold text-gray-800">{prettyKategori(row.kategori)}</div>
                                              <div className="flex items-center gap-2">
                                                <button onClick={(e) => { e.stopPropagation(); openEdit(row) }} className="inline-flex items-center gap-1 text-red-700 hover:text-red-800 text-sm font-medium">
                                                  <Edit2 className="h-4 w-4" /> Edit
                                                </button>
                                                <button onClick={(e) => { e.stopPropagation(); onDelete(row.id) }} className="inline-flex items-center gap-1 text-red-700 hover:text-red-800 text-sm font-medium">
                                                  Hapus
                                                </button>
                                              </div>
                                            </div>
                                            <div className="p-4 grid grid-cols-1 gap-2 text-sm text-gray-700">
                                              <div className="flex items-center gap-2"><span className="w-28 text-gray-500">Sewa</span><span className="font-semibold">{formatCurrency(row.sewa)}</span></div>
                                              <div className="flex items-center gap-2"><span className="w-28 text-gray-500">Pemilik</span><span>{row.pemilik_sewa || '-'}</span></div>
                                              <div className="flex items-center gap-2"><span className="w-28 text-gray-500">Kontak</span><span>{row.no_kontak_pemilik_sewa || '-'}</span></div>
                                              <div className="flex items-center gap-2"><span className="w-28 text-gray-500">Rekening</span><span>{row.no_rekening || '-'}</span></div>
                                              <div className="flex items-center gap-2"><span className="w-28 text-gray-500">Jatuh Tempo</span><span>{row.tanggal_jatuh_tempo ? new Date(row.tanggal_jatuh_tempo).toLocaleDateString('id-ID') : '-'}</span></div>
                                              <div className="flex items-center gap-2"><span className="w-28 text-gray-500">Bulan</span><span>{row.bulan || '-'}</span></div>
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
          })
        )}
      </div>

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

          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[92vh] overflow-hidden border border-gray-200 flex flex-col relative">
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
        <div className="fixed inset-0 bg-black/60 backdrop-blur-[1px] flex items-center justify-center z-50 p-4">
          {/* Backdrop click to close */}
          <button
            type="button"
            aria-hidden="true"
            onClick={() => setShowForm(false)}
            className="absolute inset-0"
            tabIndex={-1}
          />

          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[92vh] overflow-hidden border border-gray-200 flex flex-col relative">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-red-700 bg-red-800 text-white sticky top-0 z-10">
              <div>
                <h3 className="text-xl font-bold leading-tight">{editingId ? 'Edit' : 'Tambah'} Jadwal Pembayaran</h3>
              </div>
              <button onClick={() => setShowForm(false)} className="p-2 text-white/90 hover:text-white hover:bg-white/10 rounded-lg transition-colors" aria-label="Tutup">
                ✕
              </button>
            </div>

            {/* Body */}
            <div className="flex-1 min-h-0 overflow-y-auto px-6 py-5 scrollbar-hide">
              <form id="jadwalForm" onSubmit={onSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm mb-1">Nama Item</label>
                <input value={formData.nama_item} onChange={(e)=>setFormData(v=>({...v,nama_item:e.target.value}))} className="w-full border rounded px-3 py-2" required />
              </div>
              <div>
                <label className="block text-sm mb-1">Kategori</label>
                <select value={formData.kategori} onChange={(e)=>setFormData(v=>({...v,kategori:e.target.value}))} className="w-full border rounded px-3 py-2" required>
                  <option value="">- Pilih -</option>
                  {KATEGORI_OPTIONS.map(opt=> (
                    <option key={opt} value={opt}>{opt.replaceAll('_',' ')}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm mb-1">Tanggal Jatuh Tempo</label>
                <input type="date" value={formData.tanggal_jatuh_tempo || ''} onChange={(e)=>setFormData(v=>({...v,tanggal_jatuh_tempo:e.target.value}))} className="w-full border rounded px-3 py-2" />
              </div>
              <div>
                <label className="block text-sm mb-1">Outlet</label>
                <input value={formData.outlet} onChange={(e)=>setFormData(v=>({...v,outlet:e.target.value}))} className="w-full border rounded px-3 py-2" />
              </div>
              <div>
                <label className="block text-sm mb-1">Sewa</label>
                <input type="number" step="1000" placeholder="0" value={formData.sewa} onChange={(e)=>setFormData(v=>({...v,sewa:e.target.value}))} className="w-full border rounded px-3 py-2" />
                <div className="text-xs text-gray-500 mt-1">Gunakan angka saja. Contoh: 1500000</div>
              </div>
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
              <div>
                <label className="block text-sm mb-1">Bulan</label>
                <select value={formData.bulan || ''} onChange={(e)=>setFormData(v=>({...v,bulan:e.target.value}))} className="w-full border rounded px-3 py-2">
                  <option value="">- Pilih -</option>
                  {BULAN_OPTIONS.map(b => <option key={b} value={b}>{b}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm mb-1">Tahun</label>
                <input type="number" value={formData.tahun} onChange={(e)=>setFormData(v=>({...v,tahun:e.target.value}))} className="w-full border rounded px-3 py-2" />
              </div>

              </form>
            </div>

            {/* Footer */}
            <div className="p-0 border-t bg-white">
              <div className="grid grid-cols-2 gap-2 px-2 py-2">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="w-full py-3 bg-red-700 text-white font-semibold hover:bg-red-800 transition-colors rounded-lg"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  form="jadwalForm"
                  disabled={submitting}
                  className="w-full py-3 bg-red-700 text-white font-semibold hover:bg-red-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors rounded-lg"
                  onClick={(e)=>{ /* allow form submit through default form */ }}
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
