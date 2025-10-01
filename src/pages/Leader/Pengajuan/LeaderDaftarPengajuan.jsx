import React, { useEffect, useMemo, useState } from 'react'
import api from '../../../services/api'
import { API_CONFIG, API_ENDPOINTS } from '../../../config/constants'
import Card, { CardHeader, CardContent, CardTitle } from '../../../components/UI/Card'
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../../../components/UI/Table'
import { MENU_CODES } from '@/config/menuCodes'
import { RefreshCw, Search, Calendar } from 'lucide-react'

const StatusBadge = ({ status }) => {
  const isApproved = status === 'disetujui'
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
      isApproved ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
    }`}>
      {isApproved ? 'Disetujui' : 'Tidak Disetujui'}
    </span>
  )
}

const AttachmentCell = ({ items }) => {
  if (!items || items.length === 0) {
    return <span className="text-gray-400 text-sm">Tidak ada</span>
  }

  return (
    <div className="flex flex-wrap gap-2">
      {items.map((att, idx) => {
        const key = `${att.type}-${idx}`
        if (att.type === 'image') {
          return (
            <a
              key={key}
              href={att.url}
              target="_blank"
              rel="noreferrer"
              className="block w-16 h-10 overflow-hidden rounded border"
              title={att.name || 'Foto'}
            >
              <img src={att.url} alt={att.name || 'lampiran'} className="w-full h-full object-cover" />
            </a>
          )
        }
        if (att.type === 'video') {
          return (
            <a
              key={key}
              href={att.url}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 rounded border px-2 py-1 text-xs hover:bg-gray-50"
              title={att.name || 'Video'}
            >
              <span>🎬</span>
              <span className="truncate max-w-[120px]">{att.name || 'Video'}</span>
            </a>
          )
        }
        if (att.type === 'text') {
          return (
            <span key={key} className="inline-flex items-center gap-1 rounded bg-gray-100 px-2 py-1 text-xs text-gray-700">
              📝 {att.content?.slice(0, 28) || 'Catatan'}{att.content && att.content.length > 28 ? '…' : ''}
            </span>
          )
        }
        // file (pdf/doc/zip/dll)
        return (
          <a
            key={key}
            href={att.url}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1 rounded border px-2 py-1 text-xs hover:bg-gray-50"
            title={att.name || 'File'}
          >
            <span>📎</span>
            <span className="truncate max-w-[140px]">{att.name || 'File Lampiran'}</span>
          </a>
        )
      })}
    </div>
  )
}

const LeaderDaftarPengajuan = () => {
  const initialData = useMemo(() => ([
    {
      tanggal: '2025-09-15',
      pengajuan: 'Pembelian Laptop Lenovo ThinkPad X1 Carbon',
      nilai: 24500000,
      terkait: ['owner'],
      lampiran: [
        { type: 'image', url: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=300&q=50', name: 'Laptop.jpg' },
        { type: 'file', url: '#', name: 'Penawaran_Harga.pdf' }
      ],
      status: 'disetujui'
    },
    {
      tanggal: '2025-09-16',
      pengajuan: 'Pengajuan Lembur Event Internal Bulanan',
      nilai: 1500000,
      terkait: ['leader: Operasional'],
      lampiran: [
        { type: 'text', content: 'Kebutuhan lembur 5 orang, 3 jam, dokumentasi terlampir.' },
        { type: 'image', url: 'https://images.unsplash.com/photo-1433354359170-23a4ae7338c6?w=300&q=50', name: 'Dokumentasi.jpg' }
      ],
      status: 'tidak_disetujui'
    },
    {
      tanggal: '2025-09-17',
      pengajuan: 'Perbaikan AC Ruang Meeting Lantai 2',
      nilai: 950000,
      terkait: ['owner', 'leader: Fasilitas'],
      lampiran: [
        { type: 'video', url: '#', name: 'Kondisi_AC.mp4' },
        { type: 'file', url: '#', name: 'RAB_Perbaikan.xlsx' }
      ],
      status: 'disetujui'
    }
  ]), [])

  const [data, setData] = useState(initialData)
  const [loadingList, setLoadingList] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [selectedFiles, setSelectedFiles] = useState([])
  const [form, setForm] = useState({
    tanggal: '',
    pengajuan: '',
    nilai: '',
    terkait: [], // array of usernames
    status: 'disetujui',
  })

  // User options for 'Terkait' (owner/leader)
  const [userOptions, setUserOptions] = useState([])
  const [loadingUsers, setLoadingUsers] = useState(false)

  useEffect(() => {
    // Load users when modal opens the first time
    if (showModal && userOptions.length === 0 && !loadingUsers) {
      const loadUsers = async () => {
        try {
          setLoadingUsers(true)
          const res = await api.get(API_ENDPOINTS.USERS.LIST)
          const list = Array.isArray(res?.data?.data) ? res.data.data : (Array.isArray(res?.data) ? res.data : [])
          // Filter hanya role owner/leader; fallback jika properti role tidak ada
          const filtered = list.filter(u => ['owner','leader'].includes((u.role || '').toLowerCase()))
          // Map ke opsi yang akan ditampilkan
          const options = filtered.map(u => ({
            id: u.id,
            username: u.username || u.nama || `user-${u.id}`,
            label: `${u.username || u.nama} (${(u.role || '').toUpperCase()})`,
          }))
          setUserOptions(options)
        } catch (e) {
          console.warn('Gagal memuat daftar user untuk Terkait:', e)
          setUserOptions([])
        } finally {
          setLoadingUsers(false)
        }
      }
      loadUsers()
    }
  }, [showModal, userOptions.length, loadingUsers])

  // Filters & pagination (client-side)
  const [q, setQ] = useState('')
  const [statusFilter, setStatusFilter] = useState('all') // all | disetujui | tidak_disetujui
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(5)
  const [showFilters, setShowFilters] = useState(false)

  // Load list dari backend
  const fetchPengajuan = async () => {
    try {
      setLoadingList(true)
      const params = new URLSearchParams()
      params.set('page', String(page))
      params.set('limit', String(pageSize))
      if (q.trim()) params.set('q', q.trim())
      if (statusFilter !== 'all') params.set('status', statusFilter)
      if (dateFrom) params.set('dateFrom', dateFrom)
      if (dateTo) params.set('dateTo', dateTo)
      const resp = await api.get(`/pengajuan?${params.toString()}`)
      const rows = Array.isArray(resp?.data?.data) ? resp.data.data : []
      setData(rows)
    } catch (e) {
      console.warn('Gagal memuat daftar pengajuan, gunakan data lokal sementara.', e)
    } finally {
      setLoadingList(false)
    }
  }

  // Initial load & on filter/pagination changes
  useEffect(() => {
    fetchPengajuan()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, pageSize])

  const lastUpdatedText = useMemo(() => {
    if (!data || data.length === 0) return '-'
    const getTime = (r) => {
      if (r.updated_at) return new Date(r.updated_at).getTime()
      if (r.tanggal) return new Date(r.tanggal).getTime()
      return 0
    }
    const sorted = [...data].sort((a,b) => getTime(b) - getTime(a))
    const latest = sorted[0]
    const dt = latest?.updated_at || latest?.tanggal
    return dt ? new Date(dt).toLocaleString('id-ID', { year:'numeric', month:'long', day:'numeric', hour:'2-digit', minute:'2-digit' }) : '-'
  }, [data])

  const resetForm = () => setForm({
    tanggal: '', pengajuan: '', nilai: '', terkait: [], status: 'disetujui'
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    const doSubmit = async () => {
      const attachments = []

      // file uploads via backend /upload/files
      if (selectedFiles && selectedFiles.length > 0) {
        try {
          setUploading(true)
          const formData = new FormData()
          Array.from(selectedFiles).forEach(file => {
            formData.append('files', file)
          })
          const resp = await api.post('/upload/files', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
            timeout: API_CONFIG.TIMEOUT.UPLOAD || 60000,
          })
          const files = (resp?.data?.data) || []
          const toAttachment = (f) => {
            const fullUrl = `${API_CONFIG.BASE_HOST || ''}${f.url}`
            // map mimetype to type
            let type = 'file'
            if (f.mimetype?.startsWith('image/')) type = 'image'
            else if (f.mimetype?.startsWith('video/')) type = 'video'
            else if (f.mimetype?.includes('pdf') || f.mimetype?.includes('document') || f.mimetype?.includes('text')) type = 'file'
            return { type, url: fullUrl, name: f.originalName }
          }
          attachments.push(...files.map(toAttachment))
        } catch (err) {
          console.error('Upload files failed:', err)
          alert('Gagal mengunggah lampiran. Coba lagi atau periksa ukuran/format file.')
        } finally {
          setUploading(false)
          setSelectedFiles([])
        }
      }

      const payload = {
        tanggal: form.tanggal || new Date().toISOString().slice(0, 10),
        pengajuan: form.pengajuan,
        nilai: Number(form.nilai || 0),
        status: form.status,
        terkait: Array.isArray(form.terkait) ? form.terkait : [],
        attachments: attachments,
      }

      try {
        const resp = await api.post('/pengajuan', payload)
        const created = resp?.data?.data
        if (created) {
          // Prepend hasil dari backend agar konsisten dengan DB
          setData(prev => [created, ...prev])
        } else {
          // Fallback lokal jika tidak ada data
          setData(prev => [{ ...payload, recipients: (payload.terkait||[]).map(u => ({ recipient_username: u })), attachments, tanggal: payload.tanggal }, ...prev])
        }
      } catch (err) {
        console.error('Gagal menyimpan pengajuan:', err)
        alert('Gagal menyimpan pengajuan. Coba lagi nanti.')
      }

      setShowModal(false)
      resetForm()
    }
    doSubmit()
  }

  const formatCurrency = (num) =>
    new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(num)

  const filteredData = useMemo(() => {
    let rows = [...data]
    // search by pengajuan or terkait tags
    if (q.trim()) {
      const term = q.trim().toLowerCase()
      rows = rows.filter(r =>
        r.pengajuan.toLowerCase().includes(term) ||
        r.terkait.some(t => t.toLowerCase().includes(term))
      )
    }
    // status filter
    if (statusFilter !== 'all') {
      rows = rows.filter(r => r.status === statusFilter)
    }
    // date range
    if (dateFrom) {
      rows = rows.filter(r => r.tanggal >= dateFrom)
    }
    if (dateTo) {
      rows = rows.filter(r => r.tanggal <= dateTo)
    }
    return rows
  }, [data, q, statusFilter, dateFrom, dateTo])

  const totalPages = Math.max(1, Math.ceil(filteredData.length / pageSize))
  const currentPage = Math.min(page, totalPages)
  const startIdx = (currentPage - 1) * pageSize
  const endIdx = Math.min(filteredData.length, startIdx + pageSize)
  const pageData = filteredData.slice(startIdx, endIdx)

  const gotoPrev = () => setPage(p => Math.max(1, p - 1))
  const gotoNext = () => setPage(p => Math.min(totalPages, p + 1))
  const onChangePageSize = (e) => { setPageSize(Number(e.target.value)); setPage(1) }

  return (
    <div className="p-0 bg-gray-100 min-h-screen">
      {/* Header Merah */}
      <div className="bg-red-800 text-white px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span className="text-sm font-semibold bg-white/10 rounded px-2 py-1">{MENU_CODES.operasional.daftarPengajuan}</span>
            <div>
              <h1 className="text-xl md:text-2xl font-extrabold tracking-tight">DAFTAR PENGAJUAN</h1>
              <p className="text-sm text-red-100">Daftar pengajuan untuk dikirim ke Owner atau Leader lain</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setShowFilters(v => !v)} className="px-4 py-2 rounded-full border border-white/60 text-white bg-transparent">PENCARIAN</button>
            <button onClick={() => { fetchPengajuan() }} className="px-4 py-2 rounded-full border border-white/60 text-white bg-transparent inline-flex items-center gap-2" title="Refresh">
              <RefreshCw className="w-4 h-4" />
            </button>
            <button onClick={() => setShowModal(true)} className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-white/60 text-white bg-transparent">
              <span>＋</span>
              <span>Buat</span>
            </button>
          </div>
        </div>
      </div>

      {/* Strip Terakhir Diupdate */}
      <div className="bg-gray-200 px-6 py-2 text-xs text-gray-600">Terakhir diupdate: {lastUpdatedText}</div>

      {/* Kategori (Tabs) ala KPI */}
      <div className="bg-white px-6 py-3 border-b border-gray-200">
        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={() => { setStatusFilter('all'); setPage(1) }}
            className={`px-6 py-2 rounded-lg text-sm font-medium transition-colors ${statusFilter === 'all' ? 'bg-red-600 text-white shadow-md' : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'}`}
          >
            Semua
          </button>
          <button
            type="button"
            onClick={() => { setStatusFilter('pending'); setPage(1) }}
            className={`px-6 py-2 rounded-lg text-sm font-medium transition-colors ${statusFilter === 'pending' ? 'bg-red-600 text-white shadow-md' : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'}`}
          >
            Pending
          </button>
          <button
            type="button"
            onClick={() => { setStatusFilter('disetujui'); setPage(1) }}
            className={`px-6 py-2 rounded-lg text-sm font-medium transition-colors ${statusFilter === 'disetujui' ? 'bg-red-600 text-white shadow-md' : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'}`}
          >
            Disetujui
          </button>
          <button
            type="button"
            onClick={() => { setStatusFilter('tidak_disetujui'); setPage(1) }}
            className={`px-6 py-2 rounded-lg text-sm font-medium transition-colors ${statusFilter === 'tidak_disetujui' ? 'bg-red-600 text-white shadow-md' : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'}`}
          >
            Tidak Disetujui
          </button>
        </div>
      </div>

      {/* Panel Filter (Toggle) */}
      {showFilters && (
        <div className="bg-white rounded-none shadow-sm border border-gray-100 my-4">
          <div className="px-0 py-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Cari</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    value={q}
                    onChange={e => { setQ(e.target.value); setPage(1) }}
                    className="pl-10 pr-3 py-2 w-full border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    placeholder="Cari pengajuan/terkait..."
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Status</label>
                <select value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1) }} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm">
                  <option value="all">Semua Status</option>
                  <option value="disetujui">Disetujui</option>
                  <option value="tidak_disetujui">Tidak Disetujui</option>
                  <option value="pending">Pending</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Tanggal Awal</label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input type="date" value={dateFrom} onChange={e => { setDateFrom(e.target.value); setPage(1) }} className="pl-10 pr-3 py-2 w-full border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-red-500 focus:border-transparent" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Tanggal Akhir</label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input type="date" value={dateTo} onChange={e => { setDateTo(e.target.value); setPage(1) }} className="pl-10 pr-3 py-2 w-full border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-red-500 focus:border-transparent" />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Konten Tabel */}
      <div className="px-0 pb-6 mt-4 md:mt-6">
        <Card className="rounded-none border-0 shadow-none">
          <CardContent className="p-0">
            <Table>
              <TableHeader className="sticky top-0 bg-red-700 z-10">
                <tr>
                  <TableHead className="px-4 py-3 text-left text-xs font-extrabold text-white uppercase tracking-wider">NO</TableHead>
                  <TableHead className="px-4 py-3 text-left text-xs font-extrabold text-white uppercase tracking-wider">TANGGAL</TableHead>
                  <TableHead className="px-4 py-3 text-left text-xs font-extrabold text-white uppercase tracking-wider">APA YG DIAJUKAN DAN NILAI</TableHead>
                  <TableHead className="px-4 py-3 text-left text-xs font-extrabold text-white uppercase tracking-wider">TERKAIT</TableHead>
                  <TableHead className="px-4 py-3 text-left text-xs font-extrabold text-white uppercase tracking-wider">LAMPIRAN</TableHead>
                  <TableHead className="px-4 py-3 text-left text-xs font-extrabold text-white uppercase tracking-wider">STATUS</TableHead>
                </tr>
              </TableHeader>
              <TableBody className="divide-y divide-gray-100">
                {loadingList ? (
                  <TableRow>
                    <TableCell colSpan={6} className="px-4 py-6 text-center text-gray-100">Memuat data…</TableCell>
                  </TableRow>
                ) : pageData.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="px-4 py-6 text-center text-gray-500">Tidak ada data</TableCell>
                  </TableRow>
                ) : pageData.map((row, idx) => (
                  <TableRow key={idx} className="hover:bg-gray-50/80">
                    <TableCell className="text-sm text-gray-700">{startIdx + idx + 1}</TableCell>
                    <TableCell className="text-sm text-gray-700">{row.tanggal}</TableCell>
                    <TableCell>
                      <div className="text-sm font-medium text-gray-900">{row.pengajuan}</div>
                      <div className="text-xs text-gray-500">Nilai: {formatCurrency(row.nilai || 0)}</div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {(row.terkait ? row.terkait : (row.recipients ? row.recipients.map(r => r.recipient_username) : [])).map((t, i) => (
                          <span key={i} className="inline-flex items-center rounded-full bg-blue-50 px-2 py-0.5 text-xs text-blue-700">{t}</span>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell>
                      <AttachmentCell items={row.lampiran || row.attachments} />
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={row.status} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            <div className="mt-3 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
              <div className="text-sm text-gray-500">Menampilkan {filteredData.length === 0 ? 0 : startIdx + 1}-{endIdx} dari {filteredData.length} data</div>
              <div className="flex items-center gap-2">
                <button onClick={gotoPrev} disabled={currentPage === 1} className={`rounded border px-3 py-1 text-sm ${currentPage === 1 ? 'text-gray-300' : 'hover:bg-gray-50'}`}>Sebelumnya</button>
                <button onClick={gotoNext} disabled={currentPage === totalPages} className={`rounded border px-3 py-1 text-sm ${currentPage === totalPages ? 'text-gray-300' : 'hover:bg-gray-50'}`}>Berikutnya</button>
                <select value={pageSize} onChange={onChangePageSize} className="rounded border px-2 py-1 text-sm">
                  <option value={5}>5</option>
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                </select>
              </div>
            </div>

            {showModal && (
              <div className="fixed inset-0 z-50 flex items-center justify-center">
                <div className="absolute inset-0 bg-black/40" onClick={() => setShowModal(false)}></div>
                <div className="relative z-10 w-full max-w-2xl rounded-lg bg-white shadow-lg">
                  <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div className="flex items-center justify-between mb-2">
                      <h2 className="text-lg font-semibold">Buat Pengajuan</h2>
                      <button type="button" onClick={() => setShowModal(false)} className="text-gray-500 hover:text-gray-700">✕</button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Tanggal</label>
                        <input type="date" value={form.tanggal} onChange={e => setForm({ ...form, tanggal: e.target.value })} className="w-full rounded border px-3 py-2" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Nilai (Rp)</label>
                        <input type="number" min="0" value={form.nilai} onChange={e => setForm({ ...form, nilai: e.target.value })} className="w-full rounded border px-3 py-2" placeholder="0" />
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Apa yang diajukan</label>
                        <input type="text" value={form.pengajuan} onChange={e => setForm({ ...form, pengajuan: e.target.value })} className="w-full rounded border px-3 py-2" placeholder="Contoh: Pembelian alat, Perbaikan aset, dst" required />
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Terkait (pilih Owner/Leader)</label>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                          <select
                            multiple
                            value={form.terkait}
                            onChange={(e) => {
                              const opts = Array.from(e.target.selectedOptions).map(o => o.value)
                              setForm({ ...form, terkait: opts })
                            }}
                            className="w-full rounded border px-3 py-2 md:col-span-2"
                            size={5}
                          >
                            {loadingUsers && <option value="" disabled>Memuat...</option>}
                            {!loadingUsers && userOptions.length === 0 && <option value="" disabled>Tidak ada data</option>}
                            {userOptions.map(opt => (
                              <option key={opt.id} value={opt.username}>{opt.label}</option>
                            ))}
                          </select>
                          <div className="text-xs text-gray-500 md:self-center">
                            Dipilih: {Array.isArray(form.terkait) ? form.terkait.length : 0}
                          </div>
                        </div>
                      </div>

                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                        <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value })} className="w-full rounded border px-3 py-2">
                          <option value="disetujui">Disetujui</option>
                          <option value="tidak_disetujui">Tidak Disetujui</option>
                        </select>
                      </div>

                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Lampiran (Upload File)</label>
                        <input
                          type="file"
                          multiple
                          onChange={(e) => setSelectedFiles(e.target.files)}
                          className="w-full rounded border px-3 py-2"
                          accept="image/*,video/*,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt"
                        />
                        {selectedFiles && selectedFiles.length > 0 && (
                          <div className="mt-2 text-xs text-gray-600">
                            {Array.from(selectedFiles).map((f, i) => (
                              <div key={i} className="truncate">• {f.name} <span className="text-gray-400">({Math.round(f.size/1024)} KB)</span></div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center justify-end gap-2 pt-2">
                      <button type="button" onClick={() => setShowModal(false)} className="rounded border px-4 py-2 text-gray-700 hover:bg-gray-50">Batal</button>
                      <button type="submit" disabled={uploading} className={`rounded px-4 py-2 text-white ${uploading ? 'bg-gray-400' : 'bg-red-600 hover:bg-red-700'}`}>{uploading ? 'Mengunggah…' : 'Simpan'}</button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default LeaderDaftarPengajuan
