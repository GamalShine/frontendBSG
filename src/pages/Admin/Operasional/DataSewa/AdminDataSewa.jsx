import React, { useEffect, useMemo, useRef, useState } from 'react'
import { format } from 'date-fns'
import { id } from 'date-fns/locale'
import { useNavigate } from 'react-router-dom'
import { dataSewaService } from '@/services/dataSewaService'
 
import { MENU_CODES } from '@/config/menuCodes'
import { toast } from 'react-hot-toast'
import { API_CONFIG } from '@/config/constants'
import { Edit, Trash2, FileText, Tag, Calendar, ZoomIn, ZoomOut, Download as DownloadIcon, X as CloseIcon, Plus } from 'lucide-react'

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
  const [selectedFiles, setSelectedFiles] = useState([])
  const [existingLampiran, setExistingLampiran] = useState([])
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [detailItem, setDetailItem] = useState(null)
  const [detailLampiran, setDetailLampiran] = useState([])
  // Preview lampiran (in-page)
  const [preview, setPreview] = useState({ open: false, url: '', name: '', type: 'other' })
  const [previewText, setPreviewText] = useState('')
  const [previewLoading, setPreviewLoading] = useState(false)
  // Zoom & Pan state untuk preview image
  const [zoom, setZoom] = useState({ scale: 1, x: 0, y: 0 })
  const isDraggingRef = useRef(false)
  const lastPosRef = useRef({ x: 0, y: 0 })

  const detectFileType = (nameOrUrl) => {
    const s = String(nameOrUrl || '')
    const ext = (s.split('.').pop() || '').toLowerCase()
    const imageExts = ['jpg','jpeg','png','gif','webp','bmp']
    const videoExts = ['mp4','webm','ogg','mov']
    const officeExts = ['doc','docx','xls','xlsx','ppt','pptx']
    const textExts = ['txt','csv','md','log','json']
    if (imageExts.includes(ext)) return 'image'
    if (videoExts.includes(ext)) return 'video'
    if (ext === 'pdf') return 'pdf'
    if (officeExts.includes(ext)) return 'office'
    if (textExts.includes(ext)) return 'text'
    return 'other'
  }
  const openPreview = (url, name) => {
    setPreview({ open: true, url, name: name || url, type: detectFileType(name || url) })
    setPreviewText('')
    setPreviewLoading(false)
  }
  const closePreview = () => setPreview({ open: false, url: '', name: '', type: 'other' })

  // Tutup dengan tombol ESC
  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.key === 'Escape') {
        closePreview()
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [])

  // Reset zoom ketika modal dibuka/ditutup atau file berubah
  useEffect(() => {
    if (preview.open) {
      setZoom({ scale: 1, x: 0, y: 0 })
      isDraggingRef.current = false
      lastPosRef.current = { x: 0, y: 0 }
    }
  }, [preview.open, preview.url])

  // Load text content when previewing text files (frontend-only)
  useEffect(() => {
    const loadText = async () => {
      if (!preview.open || preview.type !== 'text' || !preview.url) return
      try {
        setPreviewLoading(true)
        const res = await fetch(preview.url)
        const txt = await res.text()
        setPreviewText(txt)
      } catch (e) {
        setPreviewText('Gagal memuat konten teks.')
      } finally {
        setPreviewLoading(false)
      }
    }
    loadText()
  }, [preview.open, preview.type, preview.url])

  // Handlers untuk Zoom & Pan pada image
  const handleWheel = (e) => {
    if (preview.type !== 'image') return
    e.preventDefault()
    const delta = -Math.sign(e.deltaY) * 0.1
    setZoom((z) => {
      let nextScale = Math.min(5, Math.max(0.5, z.scale + delta))
      // Jika kembali ke 1, reset posisi
      if (nextScale === 1) {
        return { scale: 1, x: 0, y: 0 }
      }
      return { ...z, scale: nextScale }
    })
  }
  const handleMouseDown = (e) => {
    if (preview.type !== 'image') return
    if (zoom.scale <= 1) return
    isDraggingRef.current = true
    lastPosRef.current = { x: e.clientX, y: e.clientY }
  }
  const handleMouseMove = (e) => {
    if (preview.type !== 'image') return
    if (!isDraggingRef.current) return
    const dx = e.clientX - lastPosRef.current.x
    const dy = e.clientY - lastPosRef.current.y
    lastPosRef.current = { x: e.clientX, y: e.clientY }
    setZoom((z) => ({ ...z, x: z.x + dx, y: z.y + dy }))
  }
  const handleMouseUp = () => {
    isDraggingRef.current = false
  }
  const handleDoubleClick = () => {
    if (preview.type !== 'image') return
    setZoom((z) => (z.scale === 1 ? { scale: 2, x: 0, y: 0 } : { scale: 1, x: 0, y: 0 }))
  }

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
    setSelectedFiles([])
    setExistingLampiran([])
  }

  const openAdd = () => { resetForm(); setShowAddModal(true) }
  const openDetail = async (item) => {
    console.debug('[DataSewa] openDetail clicked for id:', item?.id)
    setDetailItem(item)
    // Pre-populate dari item
    try {
      const pre = Array.isArray(item.foto_aset) ? item.foto_aset : JSON.parse(item.foto_aset)
      setDetailLampiran(Array.isArray(pre) ? pre : (pre ? [pre] : []))
    } catch {
      setDetailLampiran(item.foto_aset ? [String(item.foto_aset)] : [])
    }
    setShowDetailModal(true)
    console.debug('[DataSewa] showDetailModal set to TRUE')
    // Fetch detail terbaru
    try {
      const detail = await dataSewaService.getById(item.id)
      const d = detail?.data || item
      setDetailItem(d)
      const raw = d?.foto_aset
      try {
        const parsed = Array.isArray(raw) ? raw : JSON.parse(raw)
        setDetailLampiran(Array.isArray(parsed) ? parsed : (parsed ? [parsed] : []))
      } catch {
        setDetailLampiran(raw ? [String(raw)] : [])
      }
    } catch (e) {
      // tetap pakai pre-populate
    }
  }
  const openEdit = async (item) => {
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
    setSelectedFiles([])
    // Pre-populate existingLampiran dari item saat ini agar langsung terlihat sebelum fetch detail
    try {
      const preParsed = Array.isArray(item.foto_aset) ? item.foto_aset : JSON.parse(item.foto_aset)
      setExistingLampiran(Array.isArray(preParsed) ? preParsed : (preParsed ? [preParsed] : []))
    } catch {
      setExistingLampiran(item.foto_aset ? [String(item.foto_aset)] : [])
    }
    // Tampilkan modal dulu agar UI muncul segera
    setShowEditModal(true)
    // Ambil data terbaru byId untuk memastikan nilai foto_aset terbaru (bisa JSON)
    try {
      const detail = await dataSewaService.getById(item.id)
      const raw = detail?.data?.foto_aset ?? item.foto_aset
      // Debug log untuk memastikan nilai yang diterima
      console.log('[Edit] foto_aset raw from API/item:', raw)
      try {
        const parsed = Array.isArray(raw) ? raw : JSON.parse(raw)
        console.log('[Edit] parsed existing lampiran:', parsed)
        setExistingLampiran(Array.isArray(parsed) ? parsed : (parsed ? [parsed] : []))
      } catch (err) {
        console.warn('[Edit] parse JSON foto_aset gagal, fallback single string', err)
        setExistingLampiran(raw ? [String(raw)] : [])
      }
    } catch (e) {
      // fallback pakai item yang ada
      try {
        const parsed = Array.isArray(item.foto_aset) ? item.foto_aset : JSON.parse(item.foto_aset)
        console.log('[Edit] fallback parsed existing lampiran:', parsed)
        setExistingLampiran(Array.isArray(parsed) ? parsed : (parsed ? [parsed] : []))
      } catch {
        setExistingLampiran(item.foto_aset ? [String(item.foto_aset)] : [])
      }
    }
  }
  const openDelete = (item) => { setSelectedItem(item); setShowDeleteModal(true) }

  const handleFile = (e) => {
    const picked = Array.from(e.target.files || [])
    const key = (f) => `${f.name}|${f.size}|${f.lastModified}`
    const existingMap = new Map(selectedFiles.map(f => [key(f), f]))
    for (const f of picked) {
      const k = key(f)
      if (!existingMap.has(k)) existingMap.set(k, f)
    }
    const merged = Array.from(existingMap.values())
    setSelectedFiles(merged)
    // Jangan reset e.target.value agar bisa pilih file yang sama lagi jika perlu
  }

  const buildFormData = () => {
    const fd = new FormData()
    Object.entries(formData).forEach(([k, v]) => {
      if (k !== 'foto_aset') {
        fd.append(k, v ?? '')
      }
    })
    // Lampiran multiple (mirip DataAset)
    for (const file of selectedFiles) {
      fd.append('lampiran', file)
    }
    // Kompatibilitas: tetap kirim 'foto_aset' sebagai file pertama jika ada
    if (selectedFiles.length > 0) {
      fd.append('foto_aset', selectedFiles[0])
    } else if (formData.foto_aset) {
      // fallback jika ada implementasi lama masih set satu file
      fd.append('foto_aset', formData.foto_aset)
    }
    // saat edit, kirim daftar lampiran existing (JSON) agar backend bisa merge dengan file baru
    if (selectedItem) {
      try {
        const json = JSON.stringify(existingLampiran || [])
        fd.append('foto_aset_existing', json)
      } catch {
        // fallback kirim kosong jika gagal
        fd.append('foto_aset_existing', '[]')
      }
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

  // Parse foto_aset yang bisa berupa string filename tunggal atau JSON array string
  const parseLampiran = (val) => {
    if (!val) return []
    if (Array.isArray(val)) return val
    const s = String(val || '').trim()
    if (!s) return []
    try {
      const parsed = JSON.parse(s)
      if (Array.isArray(parsed)) return parsed
      // kalau bukan array, anggap single filename
      return s ? [s] : []
    } catch {
      // bukan JSON, anggap single filename
      return s ? [s] : []
    }
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
              className="hidden md:inline-flex items-center gap-2 px-3 py-2 sm:px-4 sm:py-2 bg-white text-red-700 rounded-lg hover:bg-red-50 transition-colors shadow-sm"
            >
              + <span className="hidden sm:inline font-semibold">Tambah</span>
            </button>
          </div>
        </div>
      </div>

      {/* Info Bar */}
      <div className="bg-gray-200 px-4 sm:px-6 py-2">
        <p className="text-sm text-gray-900">Terakhir diupdate: {lastUpdatedText}</p>
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

      {/* Search (Kategori dan Reset dihapus) */}
      <div className="bg-white rounded-none md:rounded-xl shadow-sm border border-gray-100 mt-0 mb-4">
        <div className="px-6 py-4">
          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Cari Sewa</label>
              <div className="relative">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e)=>setSearchTerm(e.target.value)}
                  placeholder="Cari aset, jenis, atau kategori..."
                  className="w-full pl-3 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-red-500 focus:border-transparent"
                />
              </div>
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
                  <span className="text-lg font-semibold">{kategoriKey}</span>
                  <span className="bg-red-700 px-2 py-1 rounded-full text-sm">{items.length}</span>
                </div>
              </button>

              {expandedCategories.has(kategoriKey) && (
                <div className="p-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-3 gap-y-2">
                    {items.map(item => (
                      <div
                        key={item.id}
                        onClick={() => openDetail(item)}
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e)=>{ if(e.key==='Enter' || e.key===' '){ e.preventDefault(); openDetail(item) } }}
                        className="bg-white rounded-xl shadow-sm border border-gray-100 p-3 hover:shadow-md transition-shadow text-xs cursor-pointer"
                      >
                        {/* Header: Nama + Badge Kategori */}
                        <div className="flex items-start justify-between px-3 py-2 bg-gray-50 -mx-3 -mt-3 mb-0 border-b border-gray-100 cursor-pointer" onClick={(e)=>{ e.stopPropagation(); openDetail(item) }}>
                          <h3 className="text-sm md:text-base font-semibold text-gray-900 leading-snug break-words pr-2">{item.nama_aset || '-'}</h3>
                          <span className="inline-flex px-2 py-1 text-[10px] font-semibold rounded-full border bg-red-50 text-red-700 border-red-200">
                            {item.kategori_sewa || 'LAINNYA'}
                          </span>
                        </div>

                        {/* Meta info (urutkan dari yang terpenting) */}
                        <div className="mt-2 pt-2 space-y-1.5 text-sm text-gray-700 cursor-pointer" onClick={(e)=>{ e.stopPropagation(); openDetail(item) }}>
                          {/* Harga Sewa */}
                          <div className="grid grid-cols-[130px,1fr] items-center gap-2 leading-5">
                            <span className="text-gray-600">Harga Sewa</span>
                            <span className="text-gray-800">{item.harga_sewa || '-'}</span>
                          </div>
                          {/* Jangka Waktu */}
                          <div className="grid grid-cols-[130px,1fr] items-center gap-2 leading-5">
                            <span className="text-gray-600">Jangka Waktu</span>
                            <span className="text-gray-800">{item.jangka_waktu_sewa || '-'}</span>
                          </div>
                          {/* Periode Sewa */}
                          <div className="grid grid-cols-[130px,1fr] items-center gap-2 leading-5">
                            <span className="text-gray-600">Periode</span>
                            <span className="text-gray-800">{item.mulai_sewa ? new Date(item.mulai_sewa).toLocaleDateString('id-ID') : '-'} - {item.berakhir_sewa ? new Date(item.berakhir_sewa).toLocaleDateString('id-ID') : '-'}</span>
                          </div>
                          {/* Jenis Aset */}
                          <div className="grid grid-cols-[130px,1fr] items-center gap-2 leading-5">
                            <span className="text-gray-600">Jenis</span>
                            <span className="text-gray-800">{item.jenis_aset || '-'}</span>
                          </div>
                          {/* Pemilik */}
                          {item.nama_pemilik && (
                            <div className="grid grid-cols-[130px,1fr] items-center gap-2 leading-5">
                              <span className="text-gray-600">Pemilik</span>
                              <span className="text-gray-800 truncate" title={item.nama_pemilik || '-' }>{item.nama_pemilik || '-'}</span>
                            </div>
                          )}
                          {/* Kontak */}
                          {item.no_hp_pemilik && (
                            <div className="grid grid-cols-[130px,1fr] items-center gap-2 leading-5">
                              <span className="text-gray-600">Kontak</span>
                              <span className="text-gray-800">{item.no_hp_pemilik || '-'}</span>
                            </div>
                          )}
                          {/* Alamat Pemilik */}
                          {item.alamat_pemilik && (
                            <div className="grid grid-cols-[130px,1fr] items-start gap-2 leading-5">
                              <span className="text-gray-600">Alamat</span>
                              <span className="text-gray-800 line-clamp-2 leading-snug">{item.alamat_pemilik}</span>
                            </div>
                          )}
                        </div>
                        {/* Lampiran (foto_aset) - desain sama seperti halaman Data Aset */}
                        {(() => {
                          const list = parseLampiran(item.foto_aset)
                          if (list.length === 0) return null
                          return (
                            <div className="pt-2">
                              <div className="text-[11px] font-semibold text-gray-700 mb-1">Lampiran</div>
                              <div className="grid grid-cols-3 gap-2">
                                {list.map((name, idx) => {
                                  const url = buildLampiranUrl(name)
                                  const ext = (String(name).split('.').pop() || '').toLowerCase()
                                  const isImage = ['jpg','jpeg','png','gif','webp','bmp'].includes(ext)
                                  return (
                                    <div key={idx} className="border rounded-md p-1 flex flex-col gap-1">
                                      {isImage ? (
                                        <button
                                          type="button"
                                          onClick={(e) => { e.stopPropagation(); openPreview(url, String(name)) }}
                                          className="block text-left"
                                          title={String(name)}
                                        >
                                          <img src={url} alt={item.nama_aset || 'lampiran'} className="w-full h-16 object-cover rounded" />
                                        </button>
                                      ) : (
                                        <button
                                          type="button"
                                          onClick={(e) => { e.stopPropagation(); openPreview(url, String(name)) }}
                                          className="text-[10px] text-blue-600 truncate text-left hover:underline"
                                          title={String(name)}
                                        >
                                          {String(name)}
                                        </button>
                                      )}
                                    </div>
                                  )
                                })}
                                </div>
                              </div>
                            )
                          })()}
                        <div className="flex items-center justify-end gap-2 pt-3">
                          <button
                            onClick={(e) => { e.stopPropagation(); openEdit(item) }}
                            className="p-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200"
                            title="Edit"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={(e) => { e.stopPropagation(); openDelete(item) }}
                            className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200"
                            title="Hapus"
                          >
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

      {/* FAB Tambah (mobile only) */}
      <button
        type="button"
        onClick={openAdd}
        className="md:hidden fixed bottom-6 right-4 z-40 w-14 h-14 rounded-full bg-red-600 text-white shadow-lg flex items-center justify-center active:scale-95"
        aria-label="Tambah Data Sewa"
      >
        <Plus className="w-6 h-6" />
      </button>

      {/* Detail Modal */}
      {showDetailModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-[1px] flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[92vh] overflow-hidden border border-gray-200 flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-red-700 bg-red-800 text-white sticky top-0 z-10">
              <div>
                <h2 className="text-xl font-bold leading-tight">Detail Data Sewa</h2>
              </div>
              <button
                type="button"
                onClick={() => setShowDetailModal(false)}
                className="p-2 text-white/90 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                aria-label="Tutup"
              >
                ✕
              </button>
            </div>

            {/* Body */}
            <div className="flex-1 min-h-0 overflow-y-auto px-6 py-5 scrollbar-hide">
              {/* Detail (read-only, tidak dipisah section) */}
              <div className="rounded-xl border bg-white">
                <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4 text-gray-800">
                  <div className="md:col-span-2">
                    <div className="text-sm font-semibold text-gray-700 mb-1">Keterangan</div>
                    <div className="px-3 py-2 border rounded-lg bg-gray-50">{detailItem?.keterangan || '-'}</div>
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-gray-700 mb-1">Nama Aset</div>
                    <div className="px-3 py-2 border rounded-lg bg-gray-50">{detailItem?.nama_aset || '-'}</div>
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-gray-700 mb-1">Jenis Aset</div>
                    <div className="px-3 py-2 border rounded-lg bg-gray-50">{detailItem?.jenis_aset || '-'}</div>
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-gray-700 mb-1">Harga Sewa</div>
                    <div className="px-3 py-2 border rounded-lg bg-gray-50">{formatRupiah(detailItem?.harga_sewa)}</div>
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-gray-700 mb-1">Jangka Waktu</div>
                    <div className="px-3 py-2 border rounded-lg bg-gray-50">{detailItem?.jangka_waktu_sewa || '-'}</div>
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-gray-700 mb-1">Mulai Sewa</div>
                    <div className="px-3 py-2 border rounded-lg bg-gray-50">{detailItem?.mulai_sewa ? new Date(detailItem.mulai_sewa).toLocaleDateString('id-ID') : '-'}</div>
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-gray-700 mb-1">Berakhir Sewa</div>
                    <div className="px-3 py-2 border rounded-lg bg-gray-50">{detailItem?.berakhir_sewa ? new Date(detailItem.berakhir_sewa).toLocaleDateString('id-ID') : '-'}</div>
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-gray-700 mb-1">Kategori</div>
                    <div className="px-3 py-2 border rounded-lg bg-gray-50">{detailItem?.kategori_sewa || '-'}</div>
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-gray-700 mb-1">Penanggung Jawab Pajak</div>
                    <div className="px-3 py-2 border rounded-lg bg-gray-50">{detailItem?.penanggung_jawab_pajak || '-'}</div>
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-gray-700 mb-1">Pemilik</div>
                    <div className="px-3 py-2 border rounded-lg bg-gray-50">{detailItem?.nama_pemilik || '-'}</div>
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-gray-700 mb-1">Kontak Pemilik</div>
                    <div className="px-3 py-2 border rounded-lg bg-gray-50">{detailItem?.no_hp_pemilik || '-'}</div>
                  </div>
                  <div className="md:col-span-2">
                    <div className="text-sm font-semibold text-gray-700 mb-1">Alamat Pemilik</div>
                    <div className="px-3 py-2 border rounded-lg bg-gray-50 whitespace-pre-wrap">{detailItem?.alamat_pemilik || '-'}</div>
                  </div>
                  <div className="md:col-span-2">
                    <div className="text-sm font-semibold text-gray-700 mb-1">Keterangan</div>
                    <div className="px-3 py-2 border rounded-lg bg-gray-50 whitespace-pre-wrap">{detailItem?.keterangan || '-'}</div>
                  </div>
                  {/* Lampiran (dalam kontainer yang sama) */}
                  <div className="md:col-span-2 mt-2">
                    <div className="text-sm font-semibold text-gray-700 mb-1">Lampiran</div>
                    {detailLampiran.length === 0 ? (
                      <div className="text-xs text-gray-500">Tidak ada lampiran</div>
                    ) : (
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        {detailLampiran.map((name, idx) => {
                          const url = buildLampiranUrl(name)
                          const ext = (String(name).split('.').pop() || '').toLowerCase()
                          const isImage = ['jpg','jpeg','png','gif','webp','bmp'].includes(ext)
                          const displayName = String(name)
                          return (
                            <div key={`detail-${idx}`} className="border rounded p-2 text-xs bg-white">
                              {isImage ? (
                                <button
                                  type="button"
                                  onClick={() => openPreview(url, displayName)}
                                  className="block w-full text-left"
                                  title={displayName}
                                >
                                  <img src={url} alt={displayName} className="w-full h-24 object-cover rounded" />
                                </button>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => openPreview(url, displayName)}
                                  className="block w-full h-24 bg-gray-50 rounded border flex items-center justify-center"
                                  title={displayName}
                                >
                                  <span className="font-semibold text-gray-700">{(displayName.split('.').pop() || 'FILE').toUpperCase()}</span>
                                </button>
                              )}
                              <div className="mt-2 truncate" title={displayName}>{displayName}</div>
                            </div>
                          )
                        })}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-0 border-t bg-white">
              <div className="grid grid-cols-2 gap-2 px-2 py-2">
                <button
                  type="button"
                  onClick={() => { setShowDetailModal(false); if (detailItem) openEdit(detailItem) }}
                  className="w-full py-2 bg-red-700 text-white font-semibold hover:bg-red-800 transition-colors rounded-lg"
                >
                  Edit
                </button>
                <button
                  type="button"
                  onClick={() => { setShowDetailModal(false); if (detailItem) openDelete(detailItem) }}
                  className="w-full py-2 bg-red-700 text-white font-semibold hover:bg-red-800 transition-colors rounded-lg"
                >
                  Hapus
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-[1px] flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[92vh] overflow-hidden border border-gray-200 flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-red-700 bg-red-800 text-white sticky top-0 z-10">
              <div className="flex items-center">
                <div>
                  <h2 className="text-xl font-bold leading-tight">Tambah Data Sewa</h2>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="p-2 text-white/90 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                aria-label="Tutup"
              >
                ✕
              </button>
            </div>

            {/* Form */}
            <form onSubmit={submitCreate} className="flex flex-col flex-1 min-h-0">
              {/* Scrollable body */}
              <div className="flex-1 min-h-0 overflow-y-auto px-6 py-5 scrollbar-hide">
                <div className="rounded-xl border bg-white">
                  <div className="px-4 py-3 border-b bg-gray-50 rounded-t-xl">
                    <div className="text-sm font-semibold text-gray-700">Informasi Sewa</div>
                  </div>
                  <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">Keterangan <span className="text-red-500">*</span></label>
                      <select className="border rounded-lg px-3 py-2 w-full" value={formData.keterangan} onChange={e=>setFormData(p=>({...p,keterangan:e.target.value}))}>
                        <option value="">Pilih Keterangan</option>
                        <option value="OUTLET">OUTLET</option>
                        <option value="TOKO TEPUNG">TOKO TEPUNG</option>
                        <option value="KANTOR">KANTOR</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">Nama Aset <span className="text-red-500">*</span></label>
                      <input className="border rounded-lg px-3 py-2 w-full" value={formData.nama_aset} onChange={e=>setFormData(p=>({...p,nama_aset:e.target.value}))} />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">Jenis Aset <span className="text-red-500">*</span></label>
                      <input className="border rounded-lg px-3 py-2 w-full" value={formData.jenis_aset} onChange={e=>setFormData(p=>({...p,jenis_aset:e.target.value}))} />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">Jangka Waktu Sewa <span className="text-red-500">*</span></label>
                      <input className="border rounded-lg px-3 py-2 w-full" value={formData.jangka_waktu_sewa} onChange={e=>setFormData(p=>({...p,jangka_waktu_sewa:e.target.value}))} />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">Harga Sewa <span className="text-red-500">*</span></label>
                      <input className="border rounded-lg px-3 py-2 w-full" value={formData.harga_sewa} onChange={e=>setFormData(p=>({...p,harga_sewa:e.target.value}))} />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">Nama Pemilik <span className="text-red-500">*</span></label>
                      <input className="border rounded-lg px-3 py-2 w-full" value={formData.nama_pemilik} onChange={e=>setFormData(p=>({...p,nama_pemilik:e.target.value}))} />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">No HP Pemilik <span className="text-red-500">*</span></label>
                      <input className="border rounded-lg px-3 py-2 w-full" value={formData.no_hp_pemilik} onChange={e=>setFormData(p=>({...p,no_hp_pemilik:e.target.value}))} />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-semibold text-gray-700 mb-1">Alamat Pemilik <span className="text-red-500">*</span></label>
                      <input className="border rounded-lg px-3 py-2 w-full" value={formData.alamat_pemilik} onChange={e=>setFormData(p=>({...p,alamat_pemilik:e.target.value}))} />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">Mulai Sewa <span className="text-red-500">*</span></label>
                      <input type="date" className="border rounded-lg px-3 py-2 w-full" value={formData.mulai_sewa} onChange={e=>setFormData(p=>({...p,mulai_sewa:e.target.value}))} />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">Berakhir Sewa <span className="text-red-500">*</span></label>
                      <input type="date" className="border rounded-lg px-3 py-2 w-full" value={formData.berakhir_sewa} onChange={e=>setFormData(p=>({...p,berakhir_sewa:e.target.value}))} />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">Penanggung Jawab Pajak</label>
                      <input className="border rounded-lg px-3 py-2 w-full" value={formData.penanggung_jawab_pajak} onChange={e=>setFormData(p=>({...p,penanggung_jawab_pajak:e.target.value}))} />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">Kategori Sewa <span className="text-red-500">*</span></label>
                      <select className="border rounded-lg px-3 py-2 w-full" value={formData.kategori_sewa} onChange={e=>setFormData(p=>({...p,kategori_sewa:e.target.value}))}>
                        <option value="">Pilih Kategori</option>
                        <option value="SEWA TAHUNAN">SEWA TAHUNAN</option>
                        <option value="SEWA BULANAN">SEWA BULANAN</option>
                        <option value="SEWA JANGKA PANJANG">SEWA JANGKA PANJANG</option>
                      </select>
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Lampiran (opsional) - bisa lebih dari 1</label>
                      <div className="flex items-center gap-3">
                        <label className="inline-flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-lg text-sm cursor-pointer hover:bg-gray-50">
                          <input
                            type="file"
                            accept="image/*,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-powerpoint,application/vnd.openxmlformats-officedocument.presentationml.presentation,text/plain,video/*"
                            multiple
                            className="hidden"
                            onChange={handleFile}
                          />
                          <span>Pilih File</span>
                        </label>
                        {selectedFiles.length > 0 && (
                          <span className="text-xs text-gray-600">{selectedFiles.length} file dipilih</span>
                        )}
                      </div>
                      {/* Daftar lampiran tersimpan (existing) - selalu tampilkan kontainer */}
                      <div className="mt-3">
                        <div className="text-[11px] font-semibold text-gray-700 mb-1">Lampiran tersimpan ({existingLampiran.length}):</div>
                        {existingLampiran.length === 0 ? (
                          <p className="text-[11px] text-gray-500">Belum ada lampiran tersimpan</p>
                        ) : (
                          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                            {existingLampiran.map((name, idx) => {
                              const url = buildLampiranUrl(name)
                              const ext = (String(name).split('.').pop() || '').toLowerCase()
                              const imageExts = ['jpg','jpeg','png','gif','webp','bmp']
                              const videoExts = ['mp4','webm','ogg','mov']
                              const isImage = imageExts.includes(ext)
                              const isVideo = videoExts.includes(ext)
                              return (
                                <div key={`exist-${idx}`} className="relative border rounded p-1 text-xs text-gray-700 bg-white group">
                                  <button
                                    type="button"
                                    onClick={() => setExistingLampiran(prev => prev.filter((_, i) => i !== idx))}
                                    className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full w-6 h-6 text-[11px] leading-6 text-center shadow hidden group-hover:block"
                                    title="Hapus lampiran ini"
                                  >
                                    ×
                                  </button>
                                  <div className="w-full h-20 flex items-center justify-center bg-gray-50 rounded border overflow-hidden">
                                    {isImage ? (
                                      <img src={url} alt={name} className="w-full h-full object-cover" />
                                    ) : isVideo ? (
                                      <div className="w-full h-full flex items-center justify-center bg-black text-white text-[10px]">VIDEO</div>
                                    ) : (
                                      <span className="font-semibold">{(ext || 'FILE').toUpperCase()}</span>
                                    )}
                                  </div>
                                  <div className="mt-1 truncate" title={name}>
                                    <a href={url} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline break-all">{name}</a>
                                  </div>
                                </div>
                              )
                            })}
                          </div>
                        )}
                      </div>
                      {selectedFiles.length > 0 && (
                        <div className="mt-2 grid grid-cols-4 gap-2">
                          {selectedFiles.map((f, idx) => {
                            const isImage = (f.type || '').startsWith('image/')
                            const ext = (f.name.split('.').pop() || '').toUpperCase()
                            return (
                              <div key={idx} className="relative border rounded p-1 text-xs text-gray-700 bg-white group">
                                <button
                                  type="button"
                                  onClick={() => setSelectedFiles(prev => prev.filter((_, i) => i !== idx))}
                                  className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full w-6 h-6 text-[11px] leading-6 text-center shadow hidden group-hover:block"
                                  title="Hapus file ini"
                                >
                                  ×
                                </button>
                                {isImage ? (
                                  <img src={URL.createObjectURL(f)} alt={f.name} className="w-full h-20 object-cover rounded" />
                                ) : (
                                  <div className="w-full h-20 flex items-center justify-center bg-gray-50 rounded border">
                                    <span className="font-semibold">{ext || 'FILE'}</span>
                                  </div>
                                )}
                                <div className="mt-1 truncate" title={f.name}>{f.name}</div>
                              </div>
                            )
                          })}
                        </div>
                      )}
                      <p className="text-[11px] text-gray-500 mt-1">Format didukung: Gambar (JPG, PNG, GIF), PDF, DOC/DOCX, XLS/XLSX, PPT/PPTX, TXT, video.</p>
                    </div>
                  </div>
                </div>
              </div>
              {/* Footer */}
              <div className="p-0 border-t bg-white">
                <div className="grid grid-cols-2 gap-2 px-2 py-2">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="w-full py-3 bg-red-700 text-white font-semibold hover:bg-red-800 transition-colors rounded-lg"
                  >
                    Tutup
                  </button>
                  <button
                    type="submit"
                    disabled={uploading}
                    className="w-full py-3 bg-red-700 text-white font-semibold hover:bg-red-800 disabled:opacity-50 transition-colors rounded-lg"
                  >
                    {uploading ? 'Menyimpan...' : 'Simpan'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-[1px] flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[92vh] overflow-hidden border border-gray-200 flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-red-700 bg-red-800 text-white sticky top-0 z-10">
              <div className="flex items-center">
                <div>
                  <h2 className="text-xl font-bold leading-tight">Edit Data Sewa</h2>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowEditModal(false)}
                className="p-2 text-white/90 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                aria-label="Tutup"
              >
                ✕
              </button>
            </div>

            {/* Form */}
            <form onSubmit={submitUpdate} className="flex flex-col flex-1 min-h-0">
              {/* Scrollable body */}
              <div className="flex-1 min-h-0 overflow-y-auto px-6 py-5 scrollbar-hide">
                <div className="rounded-xl border bg-white">
                  <div className="px-4 py-3 border-b bg-gray-50 rounded-t-xl">
                    <div className="text-sm font-semibold text-gray-700">Informasi Sewa</div>
                  </div>
                  <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <select className="border rounded-lg px-3 py-2" value={formData.keterangan} onChange={e=>setFormData(p=>({...p,keterangan:e.target.value}))}>
                      <option value="">Pilih Keterangan *</option>
                      <option value="OUTLET">OUTLET</option>
                      <option value="TOKO TEPUNG">TOKO TEPUNG</option>
                      <option value="KANTOR">KANTOR</option>
                    </select>
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
                      <option value="SEWA TAHUNAN">SEWA TAHUNAN</option>
                      <option value="SEWA BULANAN">SEWA BULANAN</option>
                      <option value="SEWA JANGKA PANJANG">SEWA JANGKA PANJANG</option>
                    </select>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Lampiran (opsional) - bisa lebih dari 1</label>
                      <div className="flex items-center gap-3">
                        <label className="inline-flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-lg text-sm cursor-pointer hover:bg-gray-50">
                          <input
                            type="file"
                            accept="image/*,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-powerpoint,application/vnd.openxmlformats-officedocument.presentationml.presentation,text/plain,video/*"
                            multiple
                            className="hidden"
                            onChange={handleFile}
                          />
                          <span>Pilih File</span>
                        </label>
                        {selectedFiles.length > 0 && (
                          <span className="text-xs text-gray-600">{selectedFiles.length} file dipilih</span>
                        )}
                      </div>
                      {/* Daftar lampiran tersimpan (existing) - selalu tampilkan kontainer */}
                      <div className="mt-3">
                        <div className="text-[11px] font-semibold text-gray-700 mb-1">Lampiran tersimpan ({existingLampiran.length}):</div>
                        {existingLampiran.length === 0 ? (
                          <p className="text-[11px] text-gray-500">Belum ada lampiran tersimpan</p>
                        ) : (
                          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                            {existingLampiran.map((name, idx) => {
                              const url = buildLampiranUrl(name)
                              const ext = (String(name).split('.').pop() || '').toLowerCase()
                              const imageExts = ['jpg','jpeg','png','gif','webp','bmp']
                              const videoExts = ['mp4','webm','ogg','mov']
                              const isImage = imageExts.includes(ext)
                              const isVideo = videoExts.includes(ext)
                              return (
                                <div key={`exist-edit-${idx}`} className="relative border rounded p-1 text-xs text-gray-700 bg-white group">
                                  <button
                                    type="button"
                                    onClick={() => setExistingLampiran(prev => prev.filter((_, i) => i !== idx))}
                                    className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full w-6 h-6 text-[11px] leading-6 text-center shadow hidden group-hover:block"
                                    title="Hapus lampiran ini"
                                  >
                                    ×
                                  </button>
                                  <div className="w-full h-20 flex items-center justify-center bg-gray-50 rounded border overflow-hidden">
                                    {isImage ? (
                                      <img src={url} alt={name} className="w-full h-full object-cover" />
                                    ) : isVideo ? (
                                      <div className="w-full h-full flex items-center justify-center bg-black text-white text-[10px]">VIDEO</div>
                                    ) : (
                                      <span className="font-semibold">{(ext || 'FILE').toUpperCase()}</span>
                                    )}
                                  </div>
                                  <div className="mt-1 truncate" title={name}>
                                    <a href={url} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline break-all">{name}</a>
                                  </div>
                                </div>
                              )
                            })}
                          </div>
                        )}
                      </div>
                      {selectedFiles.length > 0 && (
                        <div className="mt-2 grid grid-cols-4 gap-2">
                          {selectedFiles.map((f, idx) => {
                            const isImage = (f.type || '').startsWith('image/')
                            const ext = (f.name.split('.').pop() || '').toUpperCase()
                            return (
                              <div key={idx} className="relative border rounded p-1 text-xs text-gray-700 bg-white group">
                                <button
                                  type="button"
                                  onClick={() => setSelectedFiles(prev => prev.filter((_, i) => i !== idx))}
                                  className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full w-6 h-6 text-[11px] leading-6 text-center shadow hidden group-hover:block"
                                  title="Hapus file ini"
                                >
                                  ×
                                </button>
                                {isImage ? (
                                  <img src={URL.createObjectURL(f)} alt={f.name} className="w-full h-20 object-cover rounded" />
                                ) : (
                                  <div className="w-full h-20 flex items-center justify-center bg-gray-50 rounded border">
                                    <span className="font-semibold">{ext || 'FILE'}</span>
                                  </div>
                                )}
                                <div className="mt-1 truncate" title={f.name}>{f.name}</div>
                              </div>
                            )
                          })}
                        </div>
                      )}
                    <p className="text-[11px] text-gray-500 mt-1">Format didukung: Gambar (JPG, PNG, GIF), PDF, DOC/DOCX, XLS/XLSX, PPT/PPTX, TXT, video.</p>
                  </div>
                  </div>
                </div>
              </div>
              {/* Footer */}
              <div className="p-0 border-t bg-white">
                <div className="grid grid-cols-2 gap-2 px-2 py-2">
                  <button
                    type="button"
                    onClick={() => setShowEditModal(false)}
                    className="w-full py-3 bg-red-700 text-white font-semibold hover:bg-red-800 transition-colors rounded-lg"
                  >
                    Tutup
                  </button>
                  <button
                    type="submit"
                    disabled={uploading}
                    className="w-full py-3 bg-red-700 text-white font-semibold hover:bg-red-800 disabled:opacity-50 transition-colors rounded-lg"
                  >
                    {uploading ? 'Menyimpan...' : 'Simpan'}
                  </button>
                </div>
              </div>
            </form>
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

      {/* Preview Lampiran Modal (clean, Drive-like) */}
      {preview.open && (
        <div className="fixed inset-0 bg-black/90 flex items-center justify-center p-0 z-[60]" onClick={closePreview}>
          <div className="relative max-w-[92vw] max-h-[92vh] w-auto h-auto" onClick={(e)=>e.stopPropagation()}>
            {/* Actions (Download & Close) - pojok kanan atas (fixed ke layar) */}
            <div className="fixed top-4 right-4 z-[61] flex items-center gap-2" onClick={(e)=>e.stopPropagation()}>
              <a
                href={preview.url}
                download
                target="_blank"
                rel="noreferrer"
                className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white shadow focus:outline-none"
                aria-label="Download"
                title="Download"
                onClick={(e)=>e.stopPropagation()}
              >
                <DownloadIcon className="w-5 h-5" />
              </a>
              <button
                type="button"
                onClick={closePreview}
                className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white shadow focus:outline-none"
                aria-label="Tutup"
                title="Tutup (Esc)"
              >
                <CloseIcon className="w-5 h-5" />
              </button>
            </div>
            {/* Zoom controls - vertikal di bawah tombol X/Download (fixed ke layar) */}
            <div className="fixed top-16 right-4 z-[61] flex flex-col items-center gap-2" onClick={(e)=>e.stopPropagation()}>
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); setZoom(z => ({ ...z, scale: Math.min(5, z.scale + 0.25) })) }}
                disabled={preview.type !== 'image'}
                className={`p-2 rounded-full shadow ${preview.type !== 'image' ? 'bg-white/10 text-white/40 cursor-not-allowed' : 'bg-white/10 hover:bg-white/20 text-white'}`}
                aria-label="Perbesar"
                title="Perbesar"
              >
                <ZoomIn className="w-5 h-5" />
              </button>
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); setZoom(z => ({ ...z, scale: Math.max(0.5, z.scale - 0.25), x: (z.scale - 0.25) <= 1 ? 0 : z.x, y: (z.scale - 0.25) <= 1 ? 0 : z.y })) }}
                disabled={preview.type !== 'image'}
                className={`p-2 rounded-full shadow ${preview.type !== 'image' ? 'bg-white/10 text-white/40 cursor-not-allowed' : 'bg-white/10 hover:bg-white/20 text-white'}`}
                aria-label="Perkecil"
                title="Perkecil"
              >
                <ZoomOut className="w-5 h-5" />
              </button>
            </div>
            {/* Filename badge - pojok kiri atas (fixed ke layar) */}
            <div className="fixed top-4 left-4 z-[61] text-white/90 text-xs max-w-[60vw] truncate" title={preview.name}>
              {preview.name}
            </div>
            {/* Content */}
            {preview.type === 'image' && (
              <div
                className="max-h-[92vh] max-w-[92vw] overflow-hidden cursor-grab active:cursor-grabbing select-none"
                onWheel={handleWheel}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
                onDoubleClick={handleDoubleClick}
              >
                <img
                  src={preview.url}
                  alt={preview.name}
                  draggable={false}
                  style={{ transform: `translate(${zoom.x}px, ${zoom.y}px) scale(${zoom.scale})`, transformOrigin: 'center center' }}
                  className="max-h-[92vh] max-w-[92vw] w-auto h-auto object-contain"
                />
              </div>
            )}
            {preview.type === 'video' && (
              <video src={preview.url} controls className="max-h-[92vh] max-w-[92vw] w-auto h-auto bg-black rounded select-none" />
            )}
            {preview.type === 'pdf' && (
              <iframe src={preview.url} title={preview.name} className="w-[92vw] h-[92vh] bg-white rounded" />
            )}
            {preview.type === 'office' && (
              (() => {
                const host = (API_CONFIG.BASE_HOST || '').toLowerCase()
                const isLocal = host.includes('localhost') || host.includes('127.0.0.1')
                if (isLocal) {
                  return (
                    <div className="text-center text-sm text-white/90 max-w-[80vw]">
                      <p className="mb-3">Preview dokumen Office tidak tersedia di lingkungan localhost.</p>
                      <div className="flex items-center justify-center gap-2">
                        <a href={preview.url} target="_blank" rel="noreferrer" className="inline-block px-3 py-1.5 rounded bg-white/10 hover:bg-white/20 text-white">Buka di tab baru</a>
                        <a href={preview.url} download target="_blank" rel="noreferrer" className="inline-block px-3 py-1.5 rounded bg-white/10 hover:bg-white/20 text-white">Download</a>
                      </div>
                    </div>
                  )
                }
                // Gunakan Microsoft Office Web Viewer agar tidak tergantung Google Docs
                const officeView = `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(preview.url)}`
                return (
                  <iframe src={officeView} title={preview.name} className="w-[92vw] h-[92vh] bg-white rounded" />
                )
              })()
            )}
            {preview.type === 'text' && (
              <div className="w-[92vw] h-[92vh] bg-white/95 rounded p-3 overflow-auto">
                {previewLoading ? (
                  <div className="text-sm text-gray-700">Memuat konten...</div>
                ) : (
                  <pre className="text-xs text-gray-900 whitespace-pre-wrap break-words">{previewText}</pre>
                )}
              </div>
            )}
            {preview.type === 'other' && (
              <div className="text-center text-sm text-white/90">
                <p className="mb-3">Preview tidak tersedia untuk tipe file ini.</p>
                <a href={preview.url} target="_blank" rel="noreferrer" className="inline-block px-3 py-1.5 rounded bg-white/10 hover:bg-white/20 text-white">Buka di tab baru</a>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminDataSewa
