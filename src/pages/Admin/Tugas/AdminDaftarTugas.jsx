import React, { useState, useEffect, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { tugasService, adminTugasService } from '../../../services/tugasService'
import { uploadService } from '../../../services/uploadService'
import { userService } from '../../../services/userService'
import { 
  Search, 
  Plus, 
  Eye, 
  Edit, 
  Trash2, 
  CheckSquare,
  Clock,
  AlertTriangle,
  CheckCircle,
  XCircle,
  X,
  User,
  Calendar,
  Filter,
  RefreshCw,
} from 'lucide-react'
import toast from 'react-hot-toast'
import { MENU_CODES } from '@/config/menuCodes'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogBody, DialogFooter } from '@/components/UI/Dialog'
import { API_CONFIG } from '@/config/constants'
import { useAuth } from '../../../contexts/AuthContext'

const AdminDaftarTugas = () => {
  const { user } = useAuth()
  const [tugas, setTugas] = useState([])
  const [users, setUsers] = useState([])
  const [userLookup, setUserLookup] = useState({}) // { [id]: displayName }
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [priorityFilter, setPriorityFilter] = useState('')
  const [assigneeFilter, setAssigneeFilter] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalItems, setTotalItems] = useState(0)
  const [uploadingTaskId, setUploadingTaskId] = useState(null)
  const [showUploadModal, setShowUploadModal] = useState(false)
  const [targetTask, setTargetTask] = useState(null)
  const [selectedFiles, setSelectedFiles] = useState([])
  const [filePreviews, setFilePreviews] = useState([]) // [{name,type,size,url,isImage,isVideo}]
  const [showDetail, setShowDetail] = useState(false)
  const [detailItem, setDetailItem] = useState(null)
  // Modal Revisi states
  const [showRevisiModal, setShowRevisiModal] = useState(false)
  const [revisiItem, setRevisiItem] = useState(null)
  const [revisiFiles, setRevisiFiles] = useState([])
  const [revisiPreviews, setRevisiPreviews] = useState([])
  const [revisiNote, setRevisiNote] = useState('')

  // Modal Upload handlers (diletakkan di awal agar jelas terdefinisi sebelum dipakai di JSX)
  const openUploadModal = (task) => {
    setTargetTask(task)
    setSelectedFiles([])
    setShowUploadModal(true)
  }

  // Render aksi pada modal Detail (versi full-width button/label)
  const renderDetailAction = (item) => {
    const s = String(item?.status || '').toLowerCase()
    if (s === 'belum') {
      return (
        <button
          type="button"
          onClick={() => { const it = item; closeDetail(); if (it) openUploadModal(it) }}
          className="w-full py-2 bg-red-700 text-white font-medium hover:bg-red-800 transition-colors rounded-lg"
        >
          Tindak
        </button>
      )
    }
    if (s === 'proses') {
      return (
        <span className="w-full inline-flex items-center justify-center py-2 rounded-lg bg-blue-100 text-blue-800 text-sm font-medium select-none">
          Proses
        </span>
      )
    }
    if (s === 'selesai') {
      return (
        <span className="w-full inline-flex items-center justify-center gap-2 py-2 rounded-lg bg-green-100 text-green-800 text-sm font-medium select-none">
          <CheckCircle className="h-4 w-4" />
          Selesai
        </span>
      )
    }
    if (s === 'revisi') {
      return (
        <button
          type="button"
          onClick={() => { const it = item; closeDetail(); if (it) openRevisiModal(it) }}
          className="w-full py-2 bg-red-700 text-white font-medium hover:bg-red-800 transition-colors rounded-lg"
        >
          Revisi
        </button>
      )
    }
    // default fallback
    return (
      <button
        type="button"
        onClick={() => { const it = item; closeDetail(); if (it) openUploadModal(it) }}
        className="w-full py-2 bg-red-700 text-white font-medium hover:bg-red-800 transition-colors rounded-lg"
      >
        Tindak
      </button>
    )
  }

  // Modal Revisi handlers
  const openRevisiModal = (task) => {
    setRevisiItem(task)
    setRevisiFiles([])
    setRevisiPreviews([])
    setRevisiNote('')
    setShowRevisiModal(true)
  }
  const closeRevisiModal = () => {
    setShowRevisiModal(false)
    try { revisiPreviews.forEach(p => { if (p.url) URL.revokeObjectURL(p.url) }) } catch {}
    setRevisiItem(null)
    setRevisiFiles([])
    setRevisiPreviews([])
    setRevisiNote('')
  }

  // Kelola preview Revisi saat file berubah
  useEffect(() => {
    try { revisiPreviews.forEach(p => { if (p.url) URL.revokeObjectURL(p.url) }) } catch {}
    const arr = Array.from(revisiFiles || [])
    const next = arr.map(f => ({
      name: f.name,
      type: f.type,
      size: f.size,
      url: URL.createObjectURL(f),
      isImage: (f.type || '').startsWith('image/'),
      isVideo: (f.type || '').startsWith('video/'),
    }))
    setRevisiPreviews(next)
    return () => {
      try { next.forEach(p => { if (p.url) URL.revokeObjectURL(p.url) }) } catch {}
    }
  }, [revisiFiles])

  const handleConfirmRevisi = async () => {
    if (!revisiItem?.id) return
    // Hanya penerima tugas yang boleh mengubah status/lampiran sesuai backend
    if (user?.id !== revisiItem?.penerima_tugas) {
      toast.error('Hanya penerima tugas yang dapat mengirim revisi (ubah status/lampiran)')
      return
    }
    const files = Array.from(revisiFiles || [])
    if (files.length === 0 && !revisiNote.trim()) {
      toast.error('Tambahkan catatan atau pilih minimal satu file revisi')
      return
    }
    try {
      setUploadingTaskId(revisiItem.id)
      let uploadedNames = []
      if (files.length > 0) {
        const res = await uploadService.uploadMultipleFiles(files, 'document')
        const candidate = res?.files || res?.data || res
        if (Array.isArray(candidate)) {
          uploadedNames = candidate.map((it) => typeof it === 'string' ? it : (it?.filename || it?.name || it?.path || '')).filter(Boolean)
        }
      }
      const existing = Array.isArray(revisiItem?.lampiran) ? revisiItem.lampiran : []
      const merged = uploadedNames.length > 0 ? [...existing, ...uploadedNames] : existing
      const payload = { lampiran: merged, status: 'proses' }
      if (revisiNote.trim()) payload.catatan = revisiNote.trim()
      const upd = await adminTugasService.updateTugasByAdmin(revisiItem.id, payload)
      if (upd?.success || upd?.data) {
        toast.success('Revisi berhasil dikirim')
        closeRevisiModal()
        await loadTugas()
      } else {
        toast.error('Gagal menyimpan revisi tugas')
      }
    } catch (e) {
      console.error('Revisi error:', e)
      toast.error(e?.message || 'Gagal mengirim revisi')
    } finally {
      setUploadingTaskId(null)
    }
  }

  // Helper file URL dan tipe
  const toFileUrl = (p) => {
    if (!p) return '#'
    const raw = String(p)
    // Sudah absolute URL
    if (/^https?:\/\//i.test(raw)) return raw
    // Hilangkan leading slash
    const clean = raw.replace(/^\/+/, '')
    const base = API_CONFIG?.BASE_HOST || ''
    // Jika sudah diawali uploads/, gabung langsung
    if (clean.startsWith('uploads/')) return encodeURI(`${base}/${clean}`)
    // Jika path memiliki slash (subfolder lain), gabung apa adanya
    if (clean.includes('/')) return encodeURI(`${base}/${clean}`)
    // Jika hanya nama file (tanpa folder), tentukan subfolder berdasarkan ekstensi
    const ext = getExt(clean)
    const imageExts = ['jpg','jpeg','png','gif','bmp','webp','svg']
    const videoExts = ['mp4','webm','ogg','mov','mkv']
    const docExts = ['pdf','doc','docx','xls','xlsx','ppt','pptx','txt','csv','md','log','json']
    let sub = 'general'
    if (imageExts.includes(ext)) sub = 'images'
    else if (videoExts.includes(ext)) sub = 'videos'
    else if (docExts.includes(ext)) sub = 'documents'
    return encodeURI(`${base}/uploads/data-pengajuan/${sub}/${clean}`)
  }
  const getExt = (name) => String(name || '').split('.').pop()?.toLowerCase() || ''
  const isImageExt = (ext) => ['jpg','jpeg','png','gif','bmp','webp','svg'].includes(String(ext).toLowerCase())
  const isVideoExt = (ext) => ['mp4','webm','ogg','mov','mkv'].includes(String(ext).toLowerCase())

  // Render tombol/aksi berdasarkan status
  const renderAction = (tugasItem) => {
    const s = String(tugasItem?.status || '').toLowerCase()
    const isPenerima = user?.id === tugasItem?.penerima_tugas
    if (s === 'belum') {
      return (
        <button
          onClick={(e) => { e.stopPropagation(); if (!isPenerima) return toast.error('Hanya penerima tugas yang dapat menindak'); openUploadModal(tugasItem) }}
          className={`inline-flex items-center px-3 py-1.5 rounded-md transition-colors bg-red-600 text-white hover:bg-red-700`}
          disabled={!!uploadingTaskId || !isPenerima}
        >
          Tindak
        </button>
      )
    }
    if (s === 'proses') {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 select-none">
          Proses
        </span>
      )
    }
    if (s === 'selesai') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 select-none">
          <CheckCircle className="h-4 w-4" />
          Selesai
        </span>
      )
    }
    if (s === 'revisi') {
      return (
        <button
          onClick={(e) => { e.stopPropagation(); if (!isPenerima) return toast.error('Hanya penerima tugas yang dapat mengirim revisi'); openRevisiModal(tugasItem) }}
          className={`inline-flex items-center px-3 py-1.5 rounded-md transition-colors bg-red-600 text-white hover:bg-red-700`}
          disabled={!!uploadingTaskId || !isPenerima}
        >
          Revisi
        </button>
      )
    }
    // default fallback
    return (
      <button
        onClick={(e) => { e.stopPropagation(); if (!isPenerima) return toast.error('Hanya penerima tugas yang dapat menindak'); openUploadModal(tugasItem) }}
        className={`inline-flex items-center px-3 py-1.5 rounded-md transition-colors bg-red-600 text-white hover:bg-red-700`}
        disabled={!!uploadingTaskId || !isPenerima}
      >
        Tindak
      </button>
    )
  }

  // Detail modal handlers
  const openDetail = (item) => { setDetailItem(item); setShowDetail(true) }
  const closeDetail = () => { setShowDetail(false); setDetailItem(null) }

  // Kelola pembuatan URL preview saat files berubah
  useEffect(() => {
    // Bersihkan URL lama
    try { filePreviews.forEach(p => { if (p.url) URL.revokeObjectURL(p.url) }) } catch {}
    const arr = Array.from(selectedFiles || [])
    const next = arr.map(f => ({
      name: f.name,
      type: f.type,
      size: f.size,
      url: URL.createObjectURL(f),
      isImage: String(f.type || '').startsWith('image/'),
      isVideo: String(f.type || '').startsWith('video/'),
    }))
    setFilePreviews(next)
    // Cleanup ketika unmount
    return () => {
      try { next.forEach(p => { if (p.url) URL.revokeObjectURL(p.url) }) } catch {}
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedFiles])

  const closeUploadModal = () => {
    if (uploadingTaskId) return // prevent closing while uploading
    setShowUploadModal(false)
    setTargetTask(null)
    setSelectedFiles([])
    // Bersihkan preview URLs
    try {
      filePreviews.forEach(p => { if (p.url) URL.revokeObjectURL(p.url) })
    } catch {}
    setFilePreviews([])
  }

  const handleConfirmUpload = async () => {
    if (!targetTask?.id) return
    // Hanya penerima tugas yang boleh mengunggah lampiran/ubah status
    if (user?.id !== targetTask?.penerima_tugas) {
      toast.error('Hanya penerima tugas yang dapat menindak')
      return
    }
    const files = Array.from(selectedFiles || [])
    if (files.length === 0) {
      toast.error('Pilih minimal satu file foto/video')
      return
    }
    try {
      setUploadingTaskId(targetTask.id)
      // Upload files terlebih dahulu untuk mendapatkan nama file
      const res = await uploadService.uploadMultipleFiles(files, 'document')
      let uploadedNames = []
      const candidate = res?.files || res?.data || res
      if (Array.isArray(candidate)) {
        uploadedNames = candidate.map((it) => typeof it === 'string' ? it : (it?.filename || it?.name || it?.path || '')).filter(Boolean)
      } else if (candidate && typeof candidate === 'object') {
        const arr = candidate.files || candidate.data || []
        if (Array.isArray(arr)) {
          uploadedNames = arr.map((it) => typeof it === 'string' ? it : (it?.filename || it?.name || it?.path || '')).filter(Boolean)
        }
      }

      // Merge dengan lampiran lama dari state
      const currentItem = tugas.find(t => t.id === targetTask.id)
      const existing = Array.isArray(currentItem?.lampiran) ? currentItem.lampiran : []
      const merged = [...existing, ...uploadedNames]

      const upd = await adminTugasService.updateTugasByAdmin(targetTask.id, { lampiran: merged, status: 'proses' })
      if (upd?.success || upd?.data) {
        toast.success('Lampiran berhasil diupload')
        setShowUploadModal(false)
        setTargetTask(null)
        setSelectedFiles([])
        try { filePreviews.forEach(p => { if (p.url) URL.revokeObjectURL(p.url) }) } catch {}
        setFilePreviews([])
        await loadTugas()
      } else {
        toast.error('Gagal menyimpan lampiran tugas')
      }
    } catch (e) {
      console.error('Upload lampiran (modal) error:', e)
      toast.error(e?.message || 'Gagal upload lampiran')
    } finally {
      setUploadingTaskId(null)
    }
  }

  // Stats prioritas dari data yang sedang ditampilkan
  const priorityStats = useMemo(() => {
    const rows = Array.isArray(tugas) ? tugas : []
    const count = { mendesak: 0, penting: 0, berproses: 0 }
    rows.forEach((t) => {
      const p = String(t?.skala_prioritas || '').toLowerCase()
      if (p === 'mendesak') count.mendesak += 1
      else if (p === 'penting') count.penting += 1
      else if (p === 'berproses') count.berproses += 1
    })
    return count
  }, [tugas])

  // Last updated text from latest of updated_at/created_at among tugas
  const lastUpdatedText = useMemo(() => {
    try {
      const rows = Array.isArray(tugas) ? tugas : []
      if (!rows.length) return '-'
      const toTime = (it) => {
        const d = it?.updated_at || it?.updatedAt || it?.updated || it?.created_at || it?.createdAt || it?.created
        const t = d ? new Date(d).getTime() : NaN
        return Number.isFinite(t) ? t : NaN
      }
      const maxTime = rows.reduce((m, it) => {
        const t = toTime(it)
        return Number.isFinite(t) ? Math.max(m, t) : m
      }, -Infinity)
      if (!Number.isFinite(maxTime)) return '-'
      const dt = new Date(maxTime)
      return dt.toLocaleString('id-ID', {
        day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit'
      })
    } catch {
      return '-'
    }
  }, [tugas])

  useEffect(() => {
    loadTugas()
    loadUsers()
  }, [currentPage, statusFilter, priorityFilter, assigneeFilter])

  const loadTugas = async () => {
    try {
      setLoading(true)
      const params = {
        page: currentPage,
        limit: 10,
        search: searchTerm,
        status: statusFilter,
        priority: priorityFilter,
        // Selaraskan dengan backend adminTugas: tampilkan tugas yang ditugaskan ke admin atau pihak terkait
        scope: 'assigned_or_related'
      }

  // Upload lampiran langsung dari baris (fitur Tindak di list)
  const handleUploadLampiranRow = async (taskId, event) => {
    const files = Array.from(event?.target?.files || [])
    if (files.length === 0) return
    try {
      setUploadingTaskId(taskId)
      // Cegah pihak terkait mengubah lampiran
      const currentItem = tugas.find(t => t.id === taskId)
      if (user?.id !== currentItem?.penerima_tugas) {
        toast.error('Hanya penerima tugas yang dapat mengunggah lampiran')
        return
      }
      const res = await uploadService.uploadMultipleFiles(files, 'document')
      // Normalisasi nama file
      let uploadedNames = []
      const candidate = res?.files || res?.data || res
      if (Array.isArray(candidate)) {
        uploadedNames = candidate.map((it) => typeof it === 'string' ? it : (it?.filename || it?.name || it?.path || '')).filter(Boolean)
      } else if (candidate && typeof candidate === 'object') {
        const arr = candidate.files || candidate.data || []
        if (Array.isArray(arr)) {
          uploadedNames = arr.map((it) => typeof it === 'string' ? it : (it?.filename || it?.name || it?.path || '')).filter(Boolean)
        }
      }

      // Ambil item tugas saat ini untuk merge lampiran lama jika tersedia di state
      const existing = Array.isArray(currentItem?.lampiran) ? currentItem.lampiran : []
      const merged = [...existing, ...uploadedNames]

      const upd = await adminTugasService.updateTugasByAdmin(taskId, { lampiran: merged })
      if (upd?.success || upd?.data) {
        toast.success('Lampiran berhasil diupload')
        await loadTugas()
      } else {
        toast.error('Gagal menyimpan lampiran tugas')
      }
    } catch (e) {
      console.error('Upload lampiran row error:', e)
      toast.error(e?.message || 'Gagal upload lampiran')
    } finally {
      setUploadingTaskId(null)
      if (event?.target) event.target.value = ''
    }
  }
      
      // Gunakan endpoint khusus admin agar relasi user ikut ter-join
      const response = await adminTugasService.getAdminTugas(params)
      console.log('🔍 Admin Tugas response:', response)
      
      if (response.success) {
        setTugas(response.data || [])
        setTotalPages(response.pagination?.totalPages || 1)
        setTotalItems(response.pagination?.totalItems || 0)
      } else {
        console.error('❌ Admin Tugas response not successful:', response)
        setTugas([])
        setTotalPages(1)
      }
    } catch (error) {
      toast.error('Gagal memuat daftar tugas')
      console.error('Error loading tugas:', error)
      setTugas([])
      setTotalPages(1)
    } finally {
      setLoading(false)
    }
  }

  const loadUsers = async () => {
    try {
      const response = await userService.getUsers()
      // Normalisasi berbagai bentuk response
      const rows = Array.isArray(response)
        ? response
        : Array.isArray(response?.data)
          ? response.data
          : Array.isArray(response?.rows)
            ? response.rows
            : Array.isArray(response?.data?.rows)
              ? response.data.rows
              : (response?.success && Array.isArray(response?.data))
                ? response.data
                : []

      setUsers(rows)
      // Bangun lookup id -> display name
      const toName = (u) => u?.nama || u?.name || u?.nama_lengkap || u?.full_name || u?.username || u?.email || `User ${u?.id || ''}`
      const map = {}
      rows.forEach(u => { if (u && u.id != null) map[u.id] = toName(u) })
      setUserLookup(map)
    } catch (error) {
      console.error('Error loading users:', error)
      setUsers([])
      setUserLookup({})
    }
  }

  const handleSearch = () => {
    setCurrentPage(1)
    loadTugas()
  }

  const handleStatusUpdate = async (id, newStatus) => {
    try {
      const response = await adminTugasService.updateTugasByAdmin(id, { status: newStatus })
      if (response.success || response.data) {
        toast.success('Status tugas berhasil diperbarui')
        loadTugas()
      }
    } catch (error) {
      toast.error('Gagal memperbarui status tugas')
      console.error('Error updating status:', error)
    }
  }

  const handleDelete = async (id) => {
    if (window.confirm('Apakah Anda yakin ingin menghapus tugas ini?')) {
      try {
        await tugasService.deleteTugas(id)
        toast.success('Tugas berhasil dihapus')
        loadTugas()
      } catch (error) {
        toast.error('Gagal menghapus tugas')
        console.error('Error deleting tugas:', error)
      }
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'belum':
        return <Clock className="h-4 w-4 text-yellow-500" />
      case 'proses':
        return <AlertTriangle className="h-4 w-4 text-blue-500" />
      case 'selesai':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'revisi':
        return <XCircle className="h-4 w-4 text-red-500" />
      default:
        return <Clock className="h-4 w-4 text-gray-500" />
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'belum':
        return 'bg-yellow-100 text-yellow-800'
      case 'proses':
        return 'bg-blue-100 text-blue-800'
      case 'selesai':
        return 'bg-green-100 text-green-800'
      case 'revisi':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'mendesak':
        return 'bg-red-100 text-red-800'
      case 'penting':
        return 'bg-yellow-100 text-yellow-800'
      case 'berproses':
        return 'bg-green-100 text-green-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const formatDate = (dateString) => {
    if (!dateString) return '-'
    const date = new Date(dateString)
    return date.toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getUserName = (userId) => {
    if (!userId && userId !== 0) return 'Unknown'
    if (userLookup[userId]) return userLookup[userId]
    const user = users.find(u => u?.id === userId)
    if (user) {
      const name = user?.nama || user?.name || user?.nama_lengkap || user?.full_name || user?.username || user?.email
      return name || 'Unknown'
    }
    return 'Unknown'
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header - mengikuti gaya Struktur & Jobdesk */}
      <div className="bg-red-800 text-white px-4 sm:px-6 py-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span className="text-sm font-semibold bg-white/10 rounded px-2 py-1">{MENU_CODES.sdm.daftarTugas}</span>
            <div>
              <h1 className="text-xl md:text-2xl font-extrabold tracking-tight">DAFTAR TUGAS</h1>
            </div>
          </div>
        </div>
      </div>

      {/* Subheader: Terakhir diupdate */}
      <div className="bg-gray-200 px-4 sm:px-6 py-2 text-sm text-gray-900">
        Terakhir diupdate: {lastUpdatedText}
      </div>

      {/* Main Content */}
      <div className="px-0 pt-0 pb-6">
        {/* Page Header */}
        <div className="mb-3">
          <div className="flex items-center justify-between">
            <div></div>
            {/* Tombol Tambah disembunyikan sesuai permintaan */}
          </div>
        </div>

        {/* Priority Stats Cards */}
        <div className="mt-0 mb-0 px-0 py-2 grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-lg bg-red-50 flex items-center justify-center">
                <AlertTriangle className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <p className="text-xs font-medium text-gray-500">Mendesak</p>
                <p className="text-xl font-bold text-gray-900">{priorityStats.mendesak}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-lg bg-yellow-50 flex items-center justify-center">
                <AlertTriangle className="h-5 w-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-xs font-medium text-gray-500">Penting</p>
                <p className="text-xl font-bold text-gray-900">{priorityStats.penting}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-lg bg-green-50 flex items-center justify-center">
                <Clock className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-xs font-medium text-gray-500">Berproses</p>
                <p className="text-xl font-bold text-gray-900">{priorityStats.berproses}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters - bergaya seperti Admin Saran */}
        <div className="bg-white rounded-none md:rounded-xl shadow-sm border border-gray-100 mt-2 mb-3">
          <div className="px-6 py-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Cari</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <input
                    type="text"
                    placeholder="Cari tugas..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') handleSearch() }}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  />
                </div>
              </div>
            
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Status</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-red-500 focus:border-transparent"
              >
                <option value="">Semua Status</option>
                <option value="belum">Belum</option>
                <option value="proses">Proses</option>
                <option value="selesai">Selesai</option>
                <option value="revisi">Revisi</option>
              </select>
            </div>
            
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Prioritas</label>
              <select
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-red-500 focus:border-transparent"
              >
                <option value="">Semua Prioritas</option>
                <option value="mendesak">Mendesak</option>
                <option value="penting">Penting</option>
                <option value="berproses">Berproses</option>
              </select>
            </div>
            
            <div className="flex items-end">
              <button
                onClick={() => { setSearchTerm(''); setStatusFilter(''); setPriorityFilter(''); setAssigneeFilter(''); setCurrentPage(1); loadTugas(); }}
                className="inline-flex items-center gap-2 px-5 py-2 rounded-full border border-red-600 text-red-700 hover:bg-red-50 transition-colors"
              >
                <RefreshCw className="h-4 w-4" />
                <span className="font-semibold">Reset</span>
              </button>
            </div>
            </div>
          </div>
        </div>

        {/* Tugas List - bergaya seperti Admin Saran */}
        <div className="bg-white rounded-none md:rounded-xl shadow-sm border border-gray-100 mt-1">
          <div className="px-6 py-3 border-b border-gray-100 flex items-center justify-between">
            <h2 className="text-base font-semibold text-gray-900">Daftar Tugas</h2>
          </div>
          <div className="relative overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="sticky top-0 bg-red-700 z-10">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-extrabold text-white uppercase tracking-wider">No</th>
                  <th className="px-6 py-3 text-left text-sm font-extrabold text-white uppercase tracking-wider">Tugas</th>
                  <th className="px-6 py-3 text-left text-sm font-extrabold text-white uppercase tracking-wider">Pemberi</th>
                  <th className="px-6 py-3 text-left text-sm font-extrabold text-white uppercase tracking-wider">Penerima</th>
                  <th className="px-6 py-3 text-left text-sm font-extrabold text-white uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-sm font-extrabold text-white uppercase tracking-wider">Prioritas</th>
                  <th className="px-6 py-3 text-left text-sm font-extrabold text-white uppercase tracking-wider">Target Selesai</th>
                  <th className="px-6 py-3 text-left text-sm font-extrabold text-white uppercase tracking-wider">Aksi</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {loading ? (
                  <tr>
                    <td colSpan="8" className="px-6 py-4 text-center text-gray-500">
                      Memuat data...
                    </td>
                  </tr>
                ) : tugas.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="px-6 py-4 text-center text-gray-500">
                      Tidak ada tugas ditemukan
                    </td>
                  </tr>
                ) : (
                  tugas.map((tugasItem, idx) => (
                    <tr
                      key={tugasItem.id}
                      className="hover:bg-gray-50/80 cursor-pointer"
                      onClick={() => openDetail(tugasItem)}
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{(currentPage - 1) * 10 + idx + 1}</td>
                      <td className="px-6 py-4">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {tugasItem.judul_tugas}
                          </div>
                          <div className="text-sm text-gray-500 truncate max-w-xs">
                            {(() => {
                              const text = String(tugasItem.keterangan_tugas || '').trim()
                              if (!text) return '-'
                              const words = text.split(/\s+/)
                              const preview = words.slice(0, 3).join(' ')
                              return preview + (words.length > 3 ? '...' : '')
                            })()}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {tugasItem?.pemberiTugas?.nama || getUserName(tugasItem.pemberi_tugas)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {tugasItem?.penerimaTugas?.nama || getUserName(tugasItem.penerima_tugas)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm align-middle">
                        <div className="pt-0.5">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(tugasItem.status)}`}>
                            {getStatusIcon(tugasItem.status)}
                            <span className="ml-1">{tugasItem.status}</span>
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(tugasItem.skala_prioritas)}`}>
                          {tugasItem.skala_prioritas}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(tugasItem.target_selesai)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        {renderAction(tugasItem)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
              <tfoot></tfoot>
          </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
              <div className="flex-1 flex justify-between sm:hidden">
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                >
                  Sebelumnya
                </button>
                <button
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                >
                  Selanjutnya
                </button>
              </div>
              <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-gray-700">
                    Menampilkan <span className="font-medium">{(currentPage - 1) * 10 + 1}</span> sampai{' '}
                    <span className="font-medium">
                      {Math.min(currentPage * 10, totalItems)}
                    </span>{' '}
                    dari <span className="font-medium">{totalItems}</span> hasil
                  </p>
                </div>
                <div>
                  <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                    <button
                      onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                      disabled={currentPage === 1}
                      className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                    >
                      Sebelumnya
                    </button>
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                          page === currentPage
                            ? 'z-10 bg-red-50 border-red-500 text-red-600'
                            : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                        }`}
                      >
                        {page}
                      </button>
                    ))}
                    <button
                      onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                      disabled={currentPage === totalPages}
                      className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                    >
                      Selanjutnya
                    </button>
                  </nav>
                </div>
              </div>
            </div>
          )}

          {/* Modal Upload (Dialog) dengan desain ala Data Aset */}
          <Dialog open={showUploadModal} onOpenChange={(o) => { if (!o) closeUploadModal() }}>
            <DialogContent className="p-0 max-w-sm sm:max-w-md md:max-w-md lg:max-w-lg overflow-hidden overflow-y-hidden">
              <div className="bg-white rounded-2xl shadow-2xl w-full max-h-[92vh] overflow-hidden border border-gray-200 flex flex-col scrollbar-hide">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-3 border-b border-red-700 bg-red-800 text-white sticky top-0 z-10">
                  <div>
                    <h2 className="text-lg font-bold leading-tight">Upload Lampiran Tugas</h2>
                  </div>
                  <button
                    type="button"
                    onClick={closeUploadModal}
                    className="p-2 text-white/90 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                    aria-label="Tutup"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Body */}
                <div className="flex-1 min-h-0 overflow-y-auto px-6 py-4 scrollbar-hide">
                  <div className="space-y-3 text-[13px]">
                    <div>
                      <p className="text-xs font-bold text-gray-700">Lampiran*</p>
                    </div>

                    {/* Picker ala Data Aset */}
                    <div className="flex items-center gap-3">
                      <label className="inline-flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-lg text-xs cursor-pointer hover:bg-gray-50">
                        <input
                          type="file"
                          multiple
                          accept="image/*,video/*"
                          className="hidden"
                          onChange={(e) => {
                            const picked = Array.from(e.target.files || [])
                            const key = (f) => `${f.name}|${f.size}|${f.lastModified}`
                            const existingMap = new Map(Array.from(selectedFiles || []).map(f => [key(f), f]))
                            for (const f of picked) {
                              const k = key(f)
                              if (!existingMap.has(k)) existingMap.set(k, f)
                            }
                            const merged = Array.from(existingMap.values())
                            setSelectedFiles(merged)
                          }}
                          disabled={!!uploadingTaskId}
                        />
                        <span>Pilih File</span>
                      </label>
                      {selectedFiles && selectedFiles.length > 0 && (
                        <span className="text-[11px] text-gray-600">{selectedFiles.length} file dipilih</span>
                      )}
                    </div>

                    {/* Previews ala Data Aset */}
                    {(filePreviews && filePreviews.length > 0) && (
                      <div className="mt-2 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                        {filePreviews.map((fp, idx) => (
                          <div key={idx} className="relative border rounded p-1 text-[11px] text-gray-700 bg-white group">
                            {/* Remove */}
                            <button
                              type="button"
                              onClick={() => {
                                // remove by index
                                setSelectedFiles(prev => prev.filter((_, i) => i !== idx))
                                // revoke preview url
                                try { if (filePreviews[idx]?.url) URL.revokeObjectURL(filePreviews[idx].url) } catch {}
                                setFilePreviews(prev => prev.filter((_, i) => i !== idx))
                              }}
                              className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full w-6 h-6 text-[11px] leading-6 text-center shadow hidden group-hover:block"
                              title="Hapus file ini"
                            >
                              ×
                            </button>

                            {fp.isImage ? (
                              <img src={fp.url} alt={fp.name} className="w-full h-20 object-cover rounded" />
                            ) : fp.isVideo ? (
                              <video src={fp.url} className="w-full h-20 object-cover rounded" muted controls />
                            ) : (
                              <div className="w-full h-20 flex items-center justify-center bg-gray-50 rounded border">
                                <span className="font-semibold truncate px-1" title={fp.name}>{(fp.name.split('.').pop() || 'FILE').toUpperCase()}</span>
                              </div>
                            )}
                            <div className="mt-1 truncate text-[11px]" title={fp.name}>{fp.name}</div>
                          </div>
                        ))}
                      </div>
                    )}

                    <p className="text-[11px] text-gray-500 mt-1">Format didukung: Gambar (semua), Video (semua).</p>

                    {/* Lampiran Lama (khusus status revisi) */}
                    {String(targetTask?.status || '').toLowerCase() === 'revisi' && Array.isArray(targetTask?.lampiran) && (
                      <div className="mt-3">
                        <div className="text-xs font-semibold text-gray-700 mb-2">Lampiran Lama (dianggap salah)</div>
                        {targetTask.lampiran.length === 0 ? (
                          <div className="text-xs text-gray-500">Tidak ada lampiran lama.</div>
                        ) : (
                          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                            {targetTask.lampiran.map((f, idx) => {
                              const path = typeof f === 'string' ? f : (f?.path || f?.url || f?.filename || '')
                              const url = toFileUrl(path)
                              const name = typeof f === 'string' ? (f.split('/').pop() || f) : (f?.originalname || f?.filename || path.split('/').pop() || `file-${idx}`)
                              const ext = getExt(name)
                              const isImg = isImageExt(ext) || String(f?.mimetype || '').startsWith('image/')
                              const isVid = isVideoExt(ext) || String(f?.mimetype || '').startsWith('video/')
                              return (
                                <div key={idx} className="relative border rounded p-1 text-[11px] text-gray-700 bg-white">
                                  {isImg ? (
                                    <a href={url} target="_blank" rel="noreferrer">
                                      <img src={url} alt={name} className="w-full h-20 object-cover rounded" />
                                    </a>
                                  ) : isVid ? (
                                    <a href={url} target="_blank" rel="noreferrer" className="block">
                                      <video src={url} className="w-full h-20 object-cover rounded" muted />
                                    </a>
                                  ) : (
                                    <a href={url} target="_blank" rel="noreferrer" className="w-full h-20 flex items-center justify-center bg-gray-50 rounded border">
                                      <span className="font-semibold truncate px-1" title={name}>{(ext || 'FILE').toUpperCase()}</span>
                                    </a>
                                  )}
                                  <div className="mt-1 truncate" title={name}>{name}</div>
                                </div>
                              )
                            })}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Footer */}
                <div className="p-0 border-t bg-white">
                  <div className="grid grid-cols-2 gap-2 px-2 pt-2 pb-2">
                    <button
                      type="button"
                      onClick={closeUploadModal}
                      className="w-full py-1.5 bg-red-700 text-white font-medium hover:bg-red-800 transition-colors rounded-lg flex items-center justify-center text-sm"
                      disabled={!!uploadingTaskId}
                    >
                      Batal
                    </button>
                    <button
                      type="button"
                      onClick={handleConfirmUpload}
                      className="w-full py-1.5 bg-red-700 text-white font-medium hover:bg-red-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors rounded-lg flex items-center justify-center text-sm"
                      disabled={!!uploadingTaskId}
                    >
                      {uploadingTaskId ? 'Mengunggah...' : 'Upload'}
                    </button>
                  </div>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          {/* Modal Revisi Tugas */}
          <Dialog open={showRevisiModal} onOpenChange={(o) => { if (!o) closeRevisiModal() }}>
            <DialogContent className="p-0 max-w-sm sm:max-w-md md:max-w-md lg:max-w-lg overflow-hidden overflow-y-hidden">
              <div className="bg-white rounded-2xl shadow-2xl w-full max-h-[92vh] overflow-hidden border border-gray-200 flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-3 border-b border-red-700 bg-red-800 text-white sticky top-0 z-10">
                  <div>
                    <h2 className="text-lg font-bold leading-tight">Revisi Tugas</h2>
                  </div>
                  <button type="button" onClick={closeRevisiModal} className="p-2 text-white/90 hover:text-white hover:bg-white/10 rounded-lg transition-colors" aria-label="Tutup">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Body */}
                <div className="flex-1 min-h-0 overflow-y-auto px-6 py-4 scrollbar-hide">
                  {/* Lampiran Lama */}
                  {revisiItem && (
                    <div className="mb-4">
                      <div className="text-xs font-semibold text-gray-700 mb-2">Lampiran Lama (dianggap salah)</div>
                      {Array.isArray(revisiItem.lampiran) && revisiItem.lampiran.length > 0 ? (
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                          {revisiItem.lampiran.map((f, idx) => {
                            const path = typeof f === 'string' ? f : (f?.path || f?.url || f?.filename || '')
                            const url = toFileUrl(path)
                            const name = typeof f === 'string' ? (f.split('/').pop() || f) : (f?.originalname || f?.filename || path.split('/').pop() || `file-${idx}`)
                            const ext = getExt(name)
                            const isImg = isImageExt(ext) || String(f?.mimetype || '').startsWith('image/')
                            const isVid = isVideoExt(ext) || String(f?.mimetype || '').startsWith('video/')
                            return (
                              <div key={idx} className="relative border rounded p-1 text-[11px] text-gray-700 bg-white group">
                                {/* Tombol hapus lampiran lama */}
                                <button
                                  type="button"
                                  title="Hapus lampiran ini"
                                  className="absolute -top-2 -right-2 bg-red-700 text-white rounded-full w-6 h-6 text-[11px] leading-6 text-center shadow hidden group-hover:block"
                                  onClick={async () => {
                                    if (!revisiItem?.id) return;
                                    if (!window.confirm('Hapus lampiran lama ini?')) return;
                                    try {
                                      const nextLampiran = (Array.isArray(revisiItem?.lampiran) ? revisiItem.lampiran : []).filter((_, i) => i !== idx)
                                      const upd = await adminTugasService.updateTugasByAdmin(revisiItem.id, { lampiran: nextLampiran })
                                      if (upd?.success || upd?.data) {
                                        toast.success('Lampiran lama dihapus')
                                        setRevisiItem(prev => ({ ...prev, lampiran: nextLampiran }))
                                        await loadTugas()
                                      } else {
                                        toast.error('Gagal menghapus lampiran')
                                      }
                                    } catch (err) {
                                      console.error('Hapus lampiran revisi error:', err)
                                      toast.error(err?.message || 'Gagal menghapus lampiran')
                                    }
                                  }}
                                >
                                  ×
                                </button>
                                {isImg ? (
                                  <a href={url} target="_blank" rel="noreferrer"><img src={url} alt={name} className="w-full h-20 object-cover rounded" /></a>
                                ) : isVid ? (
                                  <a href={url} target="_blank" rel="noreferrer" className="block"><video src={url} className="w-full h-20 object-cover rounded" muted /></a>
                                ) : (
                                  <a href={url} target="_blank" rel="noreferrer" className="w-full h-20 flex items-center justify-center bg-gray-50 rounded border"><span className="font-semibold truncate px-1" title={name}>{(ext || 'FILE').toUpperCase()}</span></a>
                                )}
                                <div className="mt-1 truncate" title={name}>{name}</div>
                              </div>
                            )
                          })}
                        </div>
                      ) : (
                        <div className="text-xs text-gray-500">Tidak ada lampiran lama.</div>
                      )}
                    </div>
                  )}

                  {/* Catatan Revisi */}
                  <div className="mb-3">
                    <label className="block text-xs font-medium text-gray-700 mb-1">Catatan Revisi</label>
                    <textarea value={revisiNote} onChange={(e) => setRevisiNote(e.target.value)} rows={3} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent" placeholder="Jelaskan apa yang perlu direvisi" />
                  </div>

                  {/* Upload File Revisi */}
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Upload Lampiran Revisi (opsional)</label>
                    <div className="flex items-center gap-3">
                      <label className="inline-flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-lg text-xs cursor-pointer hover:bg-gray-50">
                        <input type="file" multiple accept="image/*,video/*" className="hidden" onChange={(e) => setRevisiFiles(Array.from(e.target.files || []))} />
                        <span>Pilih File</span>
                      </label>
                      {revisiFiles && revisiFiles.length > 0 && (
                        <span className="text-[11px] text-gray-600">{revisiFiles.length} file dipilih</span>
                      )}
                    </div>
                    {revisiPreviews.length > 0 && (
                      <div className="mt-2 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                        {revisiPreviews.map((fp, idx) => (
                          <div key={idx} className="relative border rounded p-1 text-[11px] text-gray-700 bg-white group">
                            <button type="button" onClick={() => { setRevisiFiles(prev => prev.filter((_, i) => i !== idx)); try { if (revisiPreviews[idx]?.url) URL.revokeObjectURL(revisiPreviews[idx].url) } catch {} setRevisiPreviews(prev => prev.filter((_, i) => i !== idx)) }} className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full w-6 h-6 text-[11px] leading-6 text-center shadow hidden group-hover:block" title="Hapus file ini">×</button>
                            {fp.isImage ? (
                              <img src={fp.url} alt={fp.name} className="w-full h-20 object-cover rounded" />
                            ) : fp.isVideo ? (
                              <video src={fp.url} className="w-full h-20 object-cover rounded" muted controls />
                            ) : (
                              <div className="w-full h-20 flex items-center justify-center bg-gray-50 rounded border"><span className="font-semibold truncate px-1" title={fp.name}>{(fp.name.split('.').pop() || 'FILE').toUpperCase()}</span></div>
                            )}
                            <div className="mt-1 truncate" title={fp.name}>{fp.name}</div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Footer */}
                <div className="p-0 border-t bg-white">
                  <div className="grid grid-cols-2 gap-2 px-2 pt-2 pb-2">
                    <button type="button" onClick={closeRevisiModal} className="w-full py-1.5 bg-red-700 text-white font-medium hover:bg-red-800 transition-colors rounded-lg flex items-center justify-center text-sm">Tutup</button>
                    <button type="button" onClick={handleConfirmRevisi} disabled={!!uploadingTaskId} className="w-full py-1.5 bg-red-700 text-white font-medium hover:bg-red-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors rounded-lg flex items-center justify-center text-sm">Kirim Revisi</button>
                  </div>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          {/* Modal Detail Tugas */}
          <Dialog open={showDetail} onOpenChange={(o) => { if (!o) closeDetail() }}>
            <DialogContent className="p-0 max-w-lg overflow-hidden overflow-y-hidden">
              <div className="bg-white rounded-2xl shadow-2xl w-full max-h-[92vh] overflow-hidden border border-gray-200 flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-3 border-b border-red-700 bg-red-800 text-white sticky top-0 z-10">
                  <div>
                    <h2 className="text-lg font-bold leading-tight">Detail Tugas</h2>
                  </div>
                  <button
                    type="button"
                    onClick={closeDetail}
                    className="p-2 text-white/90 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                    aria-label="Tutup"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Body */}
                <div className="flex-1 min-h-0 overflow-y-auto px-6 py-4 scrollbar-hide">
                  {detailItem && (
                    <div className="space-y-4 text-sm">
                      {/* Judul & Deskripsi */}
                      <div className="rounded-xl border bg-white">
                        <div className="px-4 py-3 border-b bg-gray-50 rounded-t-xl">
                          <div className="text-sm font-semibold text-gray-700">Informasi Tugas</div>
                        </div>
                        <div className="p-4 space-y-2">
                          <div>
                            <div className="text-xs text-gray-600">Judul</div>
                            <div className="text-base font-semibold text-gray-900">{detailItem.judul_tugas || '-'}</div>
                          </div>
                          <div>
                            <div className="text-xs text-gray-600">Keterangan</div>
                            <div className="text-gray-800 whitespace-pre-wrap">{detailItem.keterangan_tugas || '-'}</div>
                          </div>
                        </div>
                      </div>

                      {/* Grid Info */}
                      <div className="rounded-xl border bg-white">
                        <div className="px-4 py-3 border-b bg-gray-50 rounded-t-xl">
                          <div className="text-sm font-semibold text-gray-700">Detail</div>
                        </div>
                        <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <div className="text-xs text-gray-600">Pemberi</div>
                            <div className="text-gray-900">{detailItem?.pemberiTugas?.nama || getUserName(detailItem.pemberi_tugas)}</div>
                          </div>
                          <div>
                            <div className="text-xs text-gray-600">Penerima</div>
                            <div className="text-gray-900">{detailItem?.penerimaTugas?.nama || getUserName(detailItem.penerima_tugas)}</div>
                          </div>
                          <div>
                            <div className="text-xs text-gray-600">Status</div>
                            <div className="text-gray-900 capitalize">{detailItem.status || '-'}</div>
                          </div>
                          <div>
                            <div className="text-xs text-gray-600">Prioritas</div>
                            <div className="text-gray-900 capitalize">{detailItem.skala_prioritas || '-'}</div>
                          </div>
                          <div>
                            <div className="text-xs text-gray-600">Target Selesai</div>
                            <div className="text-gray-900">{formatDate(detailItem.target_selesai)}</div>
                          </div>
                          <div>
                            <div className="text-xs text-gray-600">Terakhir Diubah</div>
                            <div className="text-gray-900">{formatDate(detailItem.updated_at || detailItem.created_at)}</div>
                          </div>
                        </div>
                      </div>

                      {/* Lampiran */}
                      <div className="rounded-xl border bg-white">
                        <div className="px-4 py-3 border-b bg-gray-50 rounded-t-xl">
                          <div className="text-sm font-semibold text-gray-700">Lampiran</div>
                        </div>
                        <div className="p-4 space-y-1">
                          {!(Array.isArray(detailItem?.lampiran) && detailItem.lampiran.length > 0) ? (
                            <div className="text-sm text-gray-500">Belum ada lampiran.</div>
                          ) : (
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                              {detailItem.lampiran.map((f, idx) => {
                                const path = typeof f === 'string' ? f : (f?.path || f?.url || f?.filename || '')
                                const url = toFileUrl(path)
                                const name = typeof f === 'string' ? (f.split('/').pop() || f) : (f?.originalname || f?.filename || path.split('/').pop() || `file-${idx}`)
                                const ext = getExt(name)
                                const isImg = isImageExt(ext) || String(f?.mimetype || '').startsWith('image/')
                                return (
                                  <div key={idx} className="border rounded-md p-1 flex flex-col gap-1">
                                    {isImg ? (
                                      <a href={url} target="_blank" rel="noreferrer" className="block" title={name}>
                                        <img src={url} alt={name} className="w-full h-20 object-cover rounded" />
                                      </a>
                                    ) : (
                                      <a href={url} target="_blank" rel="noreferrer" className="text-[11px] text-blue-600 truncate text-left hover:underline" title={name}>
                                        {name}
                                      </a>
                                    )}
                                  </div>
                                )
                              })}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Footer */}
                <div className="p-0 border-t bg-white">
                  <div className="px-2 py-2 grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={closeDetail}
                      className="w-full py-2 bg-red-700 text-white font-medium hover:bg-red-800 transition-colors rounded-lg"
                    >
                      Tutup
                    </button>
                    {renderDetailAction(detailItem)}
                  </div>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </div>
  )
}

export default AdminDaftarTugas
