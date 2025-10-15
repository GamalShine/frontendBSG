import React, { useEffect, useMemo, useState } from 'react'
import { format } from 'date-fns'
import { id } from 'date-fns/locale'
import { useNavigate } from 'react-router-dom'
import { dataSewaService } from '@/services/dataSewaService'
import { Search, ChevronDown, ChevronUp, FileText, Eye, Edit, Trash2, MapPin, Calendar, Phone, User, Image as ImageIcon, Tag } from 'lucide-react'
import { MENU_CODES } from '@/config/menuCodes'
import { toast } from 'react-hot-toast'
import { API_CONFIG } from '@/config/constants'

const AdminDataSewa = () => {
  const navigate = useNavigate()
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [kategori, setKategori] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [categories, setCategories] = useState([])
  const [expandedCategories, setExpandedCategories] = useState(new Set())
  const [showAddModal, setShowAddModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [selectedItem, setSelectedItem] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [formData, setFormData] = useState({
    nama_aset: '',
    jenis_aset: '',
    jangka_waktu_sewa: '',
    harga_sewa: '',
    nama_pemilik: '',
    no_hp_pemilik: '',
    alamat_pemilik: '',
    mulai_sewa: '',
    berakhir_sewa: '',
    penanggung_jawab_pajak: '',
    kategori_sewa: '',
    keterangan: '',
    foto_aset: null,
  })

  const load = async () => {
    try {
      setLoading(true)
      setError(null)
      const [allRes, catRes] = await Promise.all([
        dataSewaService.getAll(),
        dataSewaService.getCategories()
      ])
      setData(allRes?.data || [])
      setCategories(catRes?.data || catRes || [])
    } catch (e) {
      setError(e?.response?.data?.message || 'Gagal memuat data sewa')
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

  const filtered = useMemo(() => {
    const byKategori = kategori === 'all' ? data : (data || []).filter(d => (d.kategori_sewa || '').toLowerCase() === (kategori || '').toLowerCase())
    if (!searchTerm) return byKategori
    const q = searchTerm.toLowerCase()
    return (byKategori || []).filter(d =>
      (d.nama_aset || '').toLowerCase().includes(q) ||
      (d.jenis_aset || '').toLowerCase().includes(q) ||
      (d.kategori_sewa || '').toLowerCase().includes(q)
    )
  }, [data, kategori, searchTerm])

  // Grouping per kategori
  const groupedData = useMemo(() => {
    const g = {}
    ;(filtered || []).forEach(item => {
      const key = item.kategori_sewa || 'LAINNYA'
      if (!g[key]) g[key] = []
      g[key].push(item)
    })
    return g
  }, [filtered])

  // Stats sederhana untuk header cards
  const stats = useMemo(() => {
    const total = (data || []).length
    const kategoriSet = new Set((data || []).map(d => d.kategori_sewa || 'LAINNYA'))
    const kategoriCount = kategoriSet.size
    // Sewa berakhir bulan ini
    const now = new Date()
    const thisMonth = now.getMonth()
    const thisYear = now.getFullYear()
    const endingThisMonth = (data || []).filter(d => {
      if (!d?.berakhir_sewa) return false
      const dt = new Date(d.berakhir_sewa)
      return dt.getMonth() === thisMonth && dt.getFullYear() === thisYear
    }).length
    return { total, kategoriCount, endingThisMonth }
  }, [data])

  const toggleCategory = (category) => {
    const next = new Set(expandedCategories)
    next.has(category) ? next.delete(category) : next.add(category)
    setExpandedCategories(next)
  }

  const resetFilters = () => {
    setSearchTerm('')
    setKategori('all')
  }

  const resetForm = () => {
    setFormData({
      nama_aset: '', jenis_aset: '', jangka_waktu_sewa: '', harga_sewa: '',
      nama_pemilik: '', no_hp_pemilik: '', alamat_pemilik: '',
      mulai_sewa: '', berakhir_sewa: '', penanggung_jawab_pajak: '',
      kategori_sewa: '', keterangan: '', foto_aset: null,
    })
    setSelectedItem(null)
  }

  const openAdd = () => { resetForm(); setShowAddModal(true) }
  const openEdit = (item) => {
    setSelectedItem(item)
    setFormData({
      nama_aset: item.nama_aset || '', jenis_aset: item.jenis_aset || '',
      jangka_waktu_sewa: item.jangka_waktu_sewa || '', harga_sewa: item.harga_sewa || '',
      nama_pemilik: item.nama_pemilik || '', no_hp_pemilik: item.no_hp_pemilik || '', alamat_pemilik: item.alamat_pemilik || '',
      mulai_sewa: item.mulai_sewa ? item.mulai_sewa.substring(0,10) : '',
      berakhir_sewa: item.berakhir_sewa ? item.berakhir_sewa.substring(0,10) : '',
      penanggung_jawab_pajak: item.penanggung_jawab_pajak || '',
      kategori_sewa: item.kategori_sewa || '', keterangan: item.keterangan || '',
      foto_aset: null,
    })
    setShowEditModal(true)
  }
  const openDelete = (item) => { setSelectedItem(item); setShowDeleteModal(true) }

  const handleFile = (e) => {
    const file = e.target.files && e.target.files[0]
    setFormData(prev => ({ ...prev, foto_aset: file || null }))
  }

  const buildFormData = () => {
    const fd = new FormData()
    Object.entries(formData).forEach(([k, v]) => {
      if (k === 'foto_aset') {
        if (v) fd.append('foto_aset', v)
      } else {
        fd.append(k, v ?? '')
      }
    })
    // saat edit, jika tidak upload foto baru, kirim existing name (jika ada)
    if (selectedItem && !formData.foto_aset && selectedItem.foto_aset) {
      fd.append('foto_aset_existing', selectedItem.foto_aset)
    }
    return fd
  }

  // Helpers tampilan
  const formatRupiah = (val) => {
    const num = Number(val || 0)
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(num)
  }
  const buildLampiranUrl = (stored) => {
    if (!stored) return ''
    const s = String(stored)
    if (s.startsWith('http')) return s
    if (s.startsWith('/uploads')) return `${API_CONFIG.BASE_HOST}${s}`
    return `${API_CONFIG.BASE_HOST}/uploads/data-sewa/${s}`
  }

  const submitCreate = async (e) => {
    e.preventDefault()
    try {
      setUploading(true)
      const fd = buildFormData()
      const res = await dataSewaService.create(fd)
      if (res.success) {
        toast.success('Data sewa berhasil dibuat')
        setShowAddModal(false)
        resetForm()
        load()
      } else {
        toast.error(res.message || 'Gagal membuat data sewa')
      }
    } catch (err) {
      toast.error('Gagal membuat data sewa')
      console.error(err)
    } finally {
      setUploading(false)
    }
  }

  const submitUpdate = async (e) => {
    e.preventDefault()
    try {
      setUploading(true)
      const fd = buildFormData()
      const res = await dataSewaService.update(selectedItem.id, fd)
      if (res.success) {
        toast.success('Data sewa berhasil diupdate')
        setShowEditModal(false)
        resetForm()
        load()
      } else {
        toast.error(res.message || 'Gagal mengupdate data sewa')
      }
    } catch (err) {
      toast.error('Gagal mengupdate data sewa')
      console.error(err)
    } finally {
      setUploading(false)
    }
  }

  const confirmDelete = async () => {
    if (!selectedItem) return
    try {
      setUploading(true)
      const res = await dataSewaService.remove(selectedItem.id)
      if (res.success) {
        toast.success('Data sewa berhasil dihapus')
        setShowDeleteModal(false)
        resetForm()
        load()
      } else {
        toast.error(res.message || 'Gagal menghapus data sewa')
      }
    } catch (err) {
      toast.error('Gagal menghapus data sewa')
      console.error(err)
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-red-800 text-white px-4 sm:px-6 py-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div className="flex items-center gap-4 min-w-0">
            <span className="text-sm font-semibold bg-white/10 rounded px-2 py-1">{MENU_CODES.operasional.dataSewa}</span>
            <h1 className="text-xl md:text-2xl font-extrabold tracking-tight">DATA SEWA MENYEWA</h1>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={openAdd}
              aria-label="Tambah Data Sewa"
              className="inline-flex items-center gap-2 px-3 py-2 sm:px-4 sm:py-2 bg-white text-red-700 rounded-lg hover:bg-red-50 transition-colors shadow-sm"
            >
              + <span className="hidden sm:inline font-semibold">Tambah</span>
            </button>
          </div>
        </div>
      </div>

      {/* Info Bar */}
      <div className="bg-gray-100 px-4 sm:px-6 py-2">
        <p className="text-gray-700 text-sm">Terakhir diupdate: {lastUpdatedText}</p>
      </div>

      {/* Stats Cards */}
      <div className="px-0 py-4">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-0">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <FileText className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-xs font-medium text-gray-500">Total Sewa</p>
                <p className="text-lg font-bold text-gray-900">{stats.total}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <Tag className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-xs font-medium text-gray-500">Jumlah Kategori</p>
                <p className="text-lg font-bold text-gray-900">{stats.kategoriCount}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Calendar className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-xs font-medium text-gray-500">Berakhir Bulan Ini</p>
                <p className="text-lg font-bold text-gray-900">{stats.endingThisMonth}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Search & Filter */}
      <div className="bg-white rounded-none md:rounded-xl shadow-sm border border-gray-100 mt-0 mb-4">
        <div className="px-6 py-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Cari Sewa</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e)=>setSearchTerm(e.target.value)}
                  placeholder="Cari aset, jenis, atau kategori..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-red-500 focus:border-transparent"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Kategori</label>
              <select value={kategori} onChange={(e)=>setKategori(e.target.value)} className="w-full border rounded px-3 py-2 text-sm focus:ring-2 focus:ring-red-500 focus:border-transparent">
                <option value="all">Semua Kategori</option>
                {(categories||[]).map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
            <div className="flex items-end">
              <button onClick={resetFilters} className="inline-flex items-center gap-2 px-5 py-2 rounded-full border border-red-600 text-red-700 hover:bg-red-50 transition-colors">
                Reset
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* List grouped by kategori (accordion) */}
      <div className="pb-0">
        <div className="space-y-3">
          {loading && <div className="text-gray-600">Memuat data...</div>}
          {error && !loading && <div className="text-red-600">{error}</div>}
          {!loading && !error && Object.keys(groupedData).length === 0 && (
            <div className="text-gray-600">Tidak ada data.</div>
          )}

          {Object.entries(groupedData).map(([kategoriKey, items]) => (
            <div key={kategoriKey} className="bg-white rounded-none md:rounded-xl shadow-sm border border-gray-100 overflow-hidden mt-2">
              <button
                onClick={() => toggleCategory(kategoriKey)}
                className="w-full px-6 py-3 bg-red-800 text-white flex items-center justify-between hover:bg-red-900 transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <FileText className="w-6 h-6" />
                  <span className="text-lg font-semibold">{kategoriKey}</span>
                  <span className="bg-red-700 px-2 py-1 rounded-full text-sm">{items.length}</span>
                </div>
                {expandedCategories.has(kategoriKey) ? (
                  <ChevronUp className="w-5 h-5" />
                ) : (
                  <ChevronDown className="w-5 h-5" />
                )}
              </button>

              {expandedCategories.has(kategoriKey) && (
                <div className="p-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-3 gap-y-2">
                    {items.map(item => (
                      <div key={item.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-3 hover:shadow-md transition-shadow text-xs">
                        {/* Header: Nama + Badge Kategori */}
                        <div className="flex items-start justify-between mb-2">
                          <h3 className="text-sm font-medium text-gray-900 leading-snug break-words pr-2">{item.nama_aset || '-'}</h3>
                          <span className="inline-flex items-center gap-1 px-2 py-1 text-[10px] font-semibold rounded-full border bg-red-50 text-red-700 border-red-200">
                            <Tag className="w-3 h-3" /> {item.kategori_sewa || 'LAINNYA'}
                          </span>
                        </div>

                        {/* Meta info (urutkan dari yang terpenting) */}
                        <div className="mt-2 pt-2 border-t border-gray-100 space-y-1 text-xs leading-relaxed text-gray-700">
                          {/* Harga Sewa */}
                          <div className="flex items-center gap-2">
                            <Tag className="w-4 h-4 text-gray-400" />
                            <span className="text-gray-600">Harga Sewa:</span>
                            <span className="font-semibold text-gray-900">{formatRupiah(item.harga_sewa)}</span>
                          </div>
                          {/* Jangka Waktu */}
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-gray-400" />
                            <span className="text-gray-600">Jangka Waktu:</span>
                            <span className="font-medium text-gray-800">{item.jangka_waktu_sewa || '-'}</span>
                          </div>
                          {/* Periode Sewa */}
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-gray-400" />
                            <span className="text-gray-600">Periode:</span>
                            <span className="font-medium text-gray-800">{item.mulai_sewa ? new Date(item.mulai_sewa).toLocaleDateString('id-ID') : '-'} - {item.berakhir_sewa ? new Date(item.berakhir_sewa).toLocaleDateString('id-ID') : '-'}</span>
                          </div>
                          {/* Jenis Aset */}
                          <div className="flex items-center gap-2">
                            <ImageIcon className="w-4 h-4 text-gray-400" />
                            <span className="text-gray-600">Jenis:</span>
                            <span className="font-medium text-gray-800">{item.jenis_aset || '-'}</span>
                          </div>
                          {/* Pemilik & Kontak */}
                          {(item.nama_pemilik || item.no_hp_pemilik) && (
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <User className="w-4 h-4 text-gray-400" />
                                <span className="truncate" title={item.nama_pemilik || '-'}>{item.nama_pemilik || '-'}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Phone className="w-4 h-4 text-gray-400" />
                                <span>{item.no_hp_pemilik || '-'}</span>
                              </div>
                            </div>
                          )}
                          {/* Alamat Pemilik */}
                          {item.alamat_pemilik && (
                            <div className="flex items-start gap-2">
                              <MapPin className="w-4 h-4 text-gray-400 mt-0.5" />
                              <span className="line-clamp-2">{item.alamat_pemilik}</span>
                            </div>
                          )}
                          {/* Lampiran (foto aset) di bagian bawah */}
                          {item.foto_aset && (
                            <div className="pt-2">
                              <div className="text-[10px] font-semibold text-gray-700 mb-1">Lampiran:</div>
                              <div className="flex items-center gap-3">
                                <div className="w-16 h-16 bg-white border rounded flex items-center justify-center overflow-hidden">
                                  <img src={buildLampiranUrl(item.foto_aset)} alt={item.nama_aset} className="max-w-full max-h-full object-cover" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <a href={buildLampiranUrl(item.foto_aset)} target="_blank" rel="noreferrer" className="text-xs text-blue-600 hover:underline break-all">{buildLampiranUrl(item.foto_aset)}</a>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Actions: icon-only */}
                        <div className="flex items-center justify-end gap-2 pt-3">
                          <button onClick={() => navigate(`/admin/operasional/sewa/${item.id}`)} className="p-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200" title="Detail">
                            <Eye className="w-4 h-4" />
                          </button>
                          <button onClick={() => openEdit(item)} className="p-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200" title="Edit">
                            <Edit className="w-4 h-4" />
                          </button>
                          <button onClick={() => openDelete(item)} className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200" title="Hapus">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-xl">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold">Tambah Data Sewa</h2>
                <button onClick={() => setShowAddModal(false)} className="px-3 py-1 rounded hover:bg-gray-100">✕</button>
              </div>
              <form onSubmit={submitCreate} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input className="border rounded-lg px-3 py-2" placeholder="Nama Aset *" value={formData.nama_aset} onChange={e=>setFormData(p=>({...p,nama_aset:e.target.value}))} />
                  <input className="border rounded-lg px-3 py-2" placeholder="Jenis Aset *" value={formData.jenis_aset} onChange={e=>setFormData(p=>({...p,jenis_aset:e.target.value}))} />
                  <input className="border rounded-lg px-3 py-2" placeholder="Jangka Waktu Sewa *" value={formData.jangka_waktu_sewa} onChange={e=>setFormData(p=>({...p,jangka_waktu_sewa:e.target.value}))} />
                  <input className="border rounded-lg px-3 py-2" placeholder="Harga Sewa *" value={formData.harga_sewa} onChange={e=>setFormData(p=>({...p,harga_sewa:e.target.value}))} />
                  <input className="border rounded-lg px-3 py-2" placeholder="Nama Pemilik *" value={formData.nama_pemilik} onChange={e=>setFormData(p=>({...p,nama_pemilik:e.target.value}))} />
                  <input className="border rounded-lg px-3 py-2" placeholder="No HP Pemilik *" value={formData.no_hp_pemilik} onChange={e=>setFormData(p=>({...p,no_hp_pemilik:e.target.value}))} />
                  <input className="border rounded-lg px-3 py-2 md:col-span-2" placeholder="Alamat Pemilik *" value={formData.alamat_pemilik} onChange={e=>setFormData(p=>({...p,alamat_pemilik:e.target.value}))} />
                  <div>
                    <label className="block text-sm mb-1">Mulai Sewa *</label>
                    <input type="date" className="border rounded-lg px-3 py-2 w-full" value={formData.mulai_sewa} onChange={e=>setFormData(p=>({...p,mulai_sewa:e.target.value}))} />
                  </div>
                  <div>
                    <label className="block text-sm mb-1">Berakhir Sewa *</label>
                    <input type="date" className="border rounded-lg px-3 py-2 w-full" value={formData.berakhir_sewa} onChange={e=>setFormData(p=>({...p,berakhir_sewa:e.target.value}))} />
                  </div>
                  <input className="border rounded-lg px-3 py-2" placeholder="Penanggung Jawab Pajak" value={formData.penanggung_jawab_pajak} onChange={e=>setFormData(p=>({...p,penanggung_jawab_pajak:e.target.value}))} />
                  <select className="border rounded-lg px-3 py-2" value={formData.kategori_sewa} onChange={e=>setFormData(p=>({...p,kategori_sewa:e.target.value}))}>
                    <option value="">Pilih Kategori *</option>
                    {(categories||[]).map(c => (<option key={c} value={c}>{c}</option>))}
                  </select>
                  <textarea className="border rounded-lg px-3 py-2 md:col-span-2" rows="3" placeholder="Keterangan" value={formData.keterangan} onChange={e=>setFormData(p=>({...p,keterangan:e.target.value}))} />
                  <div className="md:col-span-2">
                    <label className="block text-sm mb-1">Foto Aset (opsional)</label>
                    <input type="file" accept="image/*" onChange={handleFile} />
                  </div>
                </div>
                <button type="submit" disabled={uploading} className="w-full bg-red-600 text-white py-3 rounded-lg font-semibold hover:bg-red-700 disabled:opacity-50">{uploading ? 'Menyimpan...' : 'Simpan'}</button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-xl">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold">Edit Data Sewa</h2>
                <button onClick={() => setShowEditModal(false)} className="px-3 py-1 rounded hover:bg-gray-100">✕</button>
              </div>
              <form onSubmit={submitUpdate} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input className="border rounded-lg px-3 py-2" placeholder="Nama Aset *" value={formData.nama_aset} onChange={e=>setFormData(p=>({...p,nama_aset:e.target.value}))} />
                  <input className="border rounded-lg px-3 py-2" placeholder="Jenis Aset *" value={formData.jenis_aset} onChange={e=>setFormData(p=>({...p,jenis_aset:e.target.value}))} />
                  <input className="border rounded-lg px-3 py-2" placeholder="Jangka Waktu Sewa *" value={formData.jangka_waktu_sewa} onChange={e=>setFormData(p=>({...p,jangka_waktu_sewa:e.target.value}))} />
                  <input className="border rounded-lg px-3 py-2" placeholder="Harga Sewa *" value={formData.harga_sewa} onChange={e=>setFormData(p=>({...p,harga_sewa:e.target.value}))} />
                  <input className="border rounded-lg px-3 py-2" placeholder="Nama Pemilik *" value={formData.nama_pemilik} onChange={e=>setFormData(p=>({...p,nama_pemilik:e.target.value}))} />
                  <input className="border rounded-lg px-3 py-2" placeholder="No HP Pemilik *" value={formData.no_hp_pemilik} onChange={e=>setFormData(p=>({...p,no_hp_pemilik:e.target.value}))} />
                  <input className="border rounded-lg px-3 py-2 md:col-span-2" placeholder="Alamat Pemilik *" value={formData.alamat_pemilik} onChange={e=>setFormData(p=>({...p,alamat_pemilik:e.target.value}))} />
                  <div>
                    <label className="block text-sm mb-1">Mulai Sewa *</label>
                    <input type="date" className="border rounded-lg px-3 py-2 w-full" value={formData.mulai_sewa} onChange={e=>setFormData(p=>({...p,mulai_sewa:e.target.value}))} />
                  </div>
                  <div>
                    <label className="block text-sm mb-1">Berakhir Sewa *</label>
                    <input type="date" className="border rounded-lg px-3 py-2 w-full" value={formData.berakhir_sewa} onChange={e=>setFormData(p=>({...p,berakhir_sewa:e.target.value}))} />
                  </div>
                  <input className="border rounded-lg px-3 py-2" placeholder="Penanggung Jawab Pajak" value={formData.penanggung_jawab_pajak} onChange={e=>setFormData(p=>({...p,penanggung_jawab_pajak:e.target.value}))} />
                  <select className="border rounded-lg px-3 py-2" value={formData.kategori_sewa} onChange={e=>setFormData(p=>({...p,kategori_sewa:e.target.value}))}>
                    <option value="">Pilih Kategori *</option>
                    {(categories||[]).map(c => (<option key={c} value={c}>{c}</option>))}
                  </select>
                  <textarea className="border rounded-lg px-3 py-2 md:col-span-2" rows="3" placeholder="Keterangan" value={formData.keterangan} onChange={e=>setFormData(p=>({...p,keterangan:e.target.value}))} />
                  <div className="md:col-span-2">
                    <label className="block text-sm mb-1">Foto Aset (opsional)</label>
                    <input type="file" accept="image/*" onChange={handleFile} />
                  </div>
                </div>
                <button type="submit" disabled={uploading} className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50">{uploading ? 'Menyimpan...' : 'Update'}</button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl w-full max-w-md shadow-xl p-6">
            <h3 className="text-lg font-bold mb-2">Hapus Data Sewa</h3>
            <p className="text-gray-600 mb-4">Anda yakin ingin menghapus "{selectedItem?.nama_aset}"? Tindakan ini tidak dapat dibatalkan.</p>
            <div className="grid grid-cols-2 gap-3">
              <button onClick={() => setShowDeleteModal(false)} className="px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-50">Batal</button>
              <button onClick={confirmDelete} className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700" disabled={uploading}>{uploading ? 'Menghapus...' : 'Hapus'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminDataSewa
