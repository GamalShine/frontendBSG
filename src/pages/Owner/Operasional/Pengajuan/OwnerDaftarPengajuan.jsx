import React, { useEffect, useMemo, useState } from 'react'
import pengajuanService from '../../../../services/pengajuanService'
import { MENU_CODES } from '@/config/menuCodes'
import { RefreshCw, Search, Calendar } from 'lucide-react'

const StatusBadge = ({ status }) => {
  const isApproved = status === 'disetujui'
  const isPending = status === 'pending'
  const cls = isApproved
    ? 'bg-green-100 text-green-700'
    : isPending
      ? 'bg-yellow-100 text-yellow-700'
      : 'bg-red-100 text-red-700'
  const label = isApproved ? 'Disetujui' : isPending ? 'Pending' : 'Tidak Disetujui'
  return <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${cls}`}>{label}</span>
}

const AttachmentCell = ({ items }) => {
  const list = Array.isArray(items) ? items : []
  if (list.length === 0) return <span className="text-gray-400 text-xs">-</span>
  return (
    <div className="flex flex-wrap gap-2">
      {list.map((att, i) => {
        if (att.type === 'image') {
          return (
            <a key={i} href={att.url} target="_blank" rel="noreferrer" className="block">
              <img src={att.url} alt={att.name || 'image'} className="h-10 w-10 object-cover rounded border" />
            </a>
          )
        }
        const icon = att.type === 'video' ? '🎞️' : '📄'
        return (
          <a key={i} href={att.url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-xs text-blue-700 underline">
            <span>{icon}</span>
            <span className="truncate max-w-[140px]">{att.name || att.url}</span>
          </a>
        )
      })}
    </div>
  )
}

const OwnerDaftarPengajuan = () => {
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(false)
  const [q, setQ] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [showFilters, setShowFilters] = useState(false)

  const fetchData = async () => {
    try {
      setLoading(true)
      const params = { page, limit: pageSize }
      if (q.trim()) params.q = q.trim()
      if (statusFilter !== 'all') params.status = statusFilter
      if (dateFrom) params.dateFrom = dateFrom
      if (dateTo) params.dateTo = dateTo
      const resp = await pengajuanService.list(params)
      const data = Array.isArray(resp?.data) ? resp.data : []
      setRows(data)
    } catch (e) {
      console.warn('Gagal memuat pengajuan owner:', e)
      setRows([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchData() }, [page, pageSize])

  const lastUpdatedText = useMemo(() => {
    if (!rows || rows.length === 0) return '-'
    const getTime = (r) => {
      if (r.created_at) return new Date(r.created_at).getTime()
      if (r.tanggal) return new Date(r.tanggal).getTime()
      return 0
    }
    const sorted = [...rows].sort((a,b) => getTime(b) - getTime(a))
    const latest = sorted[0]
    const dt = latest?.created_at || latest?.tanggal
    return dt ? new Date(dt).toLocaleString('id-ID', { year:'numeric', month:'long', day:'numeric', hour:'2-digit', minute:'2-digit' }) : '-'
  }, [rows])

  const onUpdateStatus = async (row, newStatus) => {
    try {
      if (newStatus === row.status) return
      const resp = await pengajuanService.updateStatus(row.id, newStatus)
      if (resp?.success) {
        setRows(prev => prev.map(r => r.id === row.id ? { ...r, status: newStatus } : r))
      } else {
        alert(resp?.message || 'Gagal memperbarui status')
      }
    } catch (e) {
      console.error('Update status error:', e)
      alert('Gagal memperbarui status')
    }
  }

  const formatCurrency = (num) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(num || 0)

  const pageData = useMemo(() => rows, [rows])

  const startIdx = (page - 1) * pageSize

  return (
    <div className="p-0 bg-gray-50 min-h-screen">
      {/* Header Merah */}
      <div className="bg-red-800 text-white px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span className="text-sm font-semibold bg-white/10 rounded px-2 py-1">{MENU_CODES.operasional.daftarPengajuan}</span>
            <div>
              <h1 className="text-xl md:text-2xl font-extrabold tracking-tight">DAFTAR PENGAJUAN</h1>
              <p className="text-sm text-red-100">Owner dapat melihat semua pengajuan dan mengubah statusnya</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setShowFilters(v => !v)} className="px-4 py-2 rounded-full border border-white/60 text-white bg-transparent">PENCARIAN</button>
            <button onClick={() => { fetchData() }} className="px-4 py-2 rounded-full border border-white/60 text-white bg-transparent inline-flex items-center gap-2" title="Refresh">
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Strip Terakhir Diupdate */}
      <div className="bg-gray-200 px-6 py-2 text-xs text-gray-600">Terakhir diupdate: {lastUpdatedText}</div>

      {/* Panel Filter (Toggle) */}
      {showFilters && (
        <div className="bg-white rounded-none md:rounded-xl shadow-sm border border-gray-100 my-4">
          <div className="px-6 py-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Cari</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input value={q} onChange={e=>setQ(e.target.value)} className="pl-10 pr-3 py-2 w-full border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-red-500 focus:border-transparent" placeholder="Cari judul pengajuan" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Status</label>
                <select value={statusFilter} onChange={e=>setStatusFilter(e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm">
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
                  <input type="date" value={dateFrom} onChange={e=>setDateFrom(e.target.value)} className="pl-10 pr-3 py-2 w-full border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-red-500 focus:border-transparent" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Tanggal Akhir</label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input type="date" value={dateTo} onChange={e=>setDateTo(e.target.value)} className="pl-10 pr-3 py-2 w-full border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-red-500 focus:border-transparent" />
                </div>
              </div>
            </div>
            <div className="mt-4 flex gap-2">
              <button onClick={()=>{setPage(1);fetchData()}} className="rounded bg-red-600 px-4 py-2 text-white hover:bg-red-700">Terapkan</button>
              <button onClick={()=>{setQ('');setStatusFilter('all');setDateFrom('');setDateTo('');setPage(1);fetchData()}} className="rounded border px-4 py-2">Reset</button>
            </div>
          </div>
        </div>
      )}

      {/* Tabel */}
      <div className="rounded-lg border bg-white overflow-hidden mx-0 md:mx-6">
        <div className="relative overflow-x-auto max-h-[60vh] overflow-y-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="sticky top-0 bg-red-700 z-10">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-extrabold text-white uppercase tracking-wider">NO</th>
                <th className="px-4 py-3 text-left text-xs font-extrabold text-white uppercase tracking-wider">TANGGAL</th>
                <th className="px-4 py-3 text-left text-xs font-extrabold text-white uppercase tracking-wider">APA YG DIAJUKAN DAN NILAI</th>
                <th className="px-4 py-3 text-left text-xs font-extrabold text-white uppercase tracking-wider">TERKAIT</th>
                <th className="px-4 py-3 text-left text-xs font-extrabold text-white uppercase tracking-wider">LAMPIRAN</th>
                <th className="px-4 py-3 text-left text-xs font-extrabold text-white uppercase tracking-wider">STATUS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr><td colSpan={6} className="px-4 py-6 text-center text-gray-100">Memuat data…</td></tr>
              ) : pageData.length === 0 ? (
                <tr><td colSpan={6} className="px-4 py-6 text-center text-gray-500">Tidak ada data</td></tr>
              ) : pageData.map((row, idx) => (
                <tr key={row.id || idx} className="hover:bg-gray-50/80">
                  <td className="px-4 py-3 text-sm text-gray-700">{startIdx + idx + 1}</td>
                  <td className="px-4 py-3 text-sm text-gray-700">{row.tanggal}</td>
                  <td className="px-4 py-3">
                    <div className="text-sm font-medium text-gray-900">{row.pengajuan}</div>
                    <div className="text-xs text-gray-500">Nilai: {formatCurrency(row.nilai)}</div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1">
                      {(row.terkait || []).map((t, i) => (
                        <span key={i} className="inline-flex items-center rounded-full bg-blue-50 px-2 py-0.5 text-xs text-blue-700">{t}</span>
                      ))}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <AttachmentCell items={row.lampiran || row.attachments} />
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <StatusBadge status={row.status} />
                      <select
                        className="rounded border px-2 py-1 text-sm"
                        value={row.status}
                        onChange={(e)=>onUpdateStatus(row, e.target.value)}
                      >
                        <option value="disetujui">Disetujui</option>
                        <option value="tidak_disetujui">Tidak Disetujui</option>
                        <option value="pending">Pending</option>
                      </select>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default OwnerDaftarPengajuan
