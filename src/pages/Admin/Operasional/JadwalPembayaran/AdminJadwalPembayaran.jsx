import React, { useEffect, useMemo, useState } from 'react'
import { jadwalPembayaranService } from '../../../../services/jadwalPembayaranService'
import { Plus, ChevronDown, ChevronRight } from 'lucide-react'

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

  const openCreate = () => {
    setEditingId(null)
    setFormData(emptyForm)
    setShowForm(true)
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
          <div>
            <h1 className="text-xl md:text-2xl font-extrabold tracking-tight">Jadwal</h1>
            <p className="text-sm text-red-100">Pembayaran dan Perawatan</p>
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
      <div className="px-6 py-2 bg-white border-b">
        <div className="text-sm text-gray-600">Terakhir diupdate: {lastUpdatedText}</div>
      </div>

      <div className="px-6 py-6">
        {error && (
          <div className="text-red-600 mb-3">{error}</div>
        )}

        {loading ? (
          <div className="text-gray-600">Memuat data...</div>
        ) : (
          Object.keys(grouped).map((kategori) => {
            const prettyCat = kategori.replaceAll('_',' ').toUpperCase()
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
                                              <div className="border-b p-3 bg-gray-50 font-medium">SEWA OUTLET</div>
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
                                            <button onClick={() => openEdit(row)} className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-2">Edit</button>
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

      {/* Modal Form */}
      {showForm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-2xl">
            <div className="px-4 py-3 border-b flex items-center justify-between">
              <h3 className="font-semibold">{editingId ? 'Edit' : 'Tambah'} Jadwal Pembayaran</h3>
              <button onClick={() => setShowForm(false)} className="text-gray-500 hover:text-gray-700">✕</button>
            </div>
            <form onSubmit={onSubmit} className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
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
                <input value={formData.sewa} onChange={(e)=>setFormData(v=>({...v,sewa:e.target.value}))} className="w-full border rounded px-3 py-2" />
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

              <div className="md:col-span-2 flex items-center justify-end gap-2 mt-2">
                <button type="button" onClick={()=>setShowForm(false)} className="px-3 py-2 bg-gray-200 rounded hover:bg-gray-300">Batal</button>
                <button type="submit" disabled={submitting} className="px-3 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-60">
                  {submitting ? 'Menyimpan...' : 'Simpan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminJadwalPembayaran
