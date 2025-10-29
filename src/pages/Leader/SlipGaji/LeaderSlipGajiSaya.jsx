import React, { useEffect, useMemo, useState } from 'react'
import api from '../../../services/api'
import { API_CONFIG } from '../../../config/constants'
import { useAuth } from '../../../contexts/AuthContext'
import { MENU_CODES } from '@/config/menuCodes'

const LeaderSlipGajiSaya = () => {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(10)
  const [pagination, setPagination] = useState({ currentPage: 1, totalPages: 1, totalItems: 0, itemsPerPage: 10 })
  const { user: authUser } = useAuth()

  const endpoint = useMemo(() => '/sdm/slip-gaji/user/my-slips', [])

  const fetchData = async (pageNum = page, pageLimit = limit) => {
    try {
      setLoading(true)
      setError('')
      const url = `${API_CONFIG.getUrl(endpoint)}?page=${pageNum}&limit=${pageLimit}`
      const res = await api.get(url)
      setData(res?.data?.data || [])
      setPagination(res?.data?.pagination || { currentPage: 1, totalPages: 1, totalItems: 0, itemsPerPage: pageLimit })
    } catch (err) {
      console.error('Gagal mengambil slip gaji:', err)
      setError(err?.response?.data?.message || 'Gagal mengambil data slip gaji')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData(1, limit)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const onChangePage = (p) => {
    if (p < 1 || p > pagination.totalPages) return
    setPage(p)
    fetchData(p, limit)
  }

  const onChangeLimit = (e) => {
    const newLimit = parseInt(e.target.value) || 10
    setLimit(newLimit)
    setPage(1)
    fetchData(1, newLimit)
  }

  const toAbsoluteUrl = (path) => {
    if (!path) return ''
    // If path already absolute, return it
    if (/^https?:\/\//i.test(path)) return path
    // Otherwise prefix with backend host
    return `${API_CONFIG.BASE_HOST}${path.startsWith('/') ? path : `/${path}`}`
  }

  const lastUpdatedText = useMemo(() => {
    if (!Array.isArray(data) || data.length === 0) return '-'
    try {
      const latest = [...data].sort((a, b) => new Date(b?.updated_at || b?.created_at || 0) - new Date(a?.updated_at || a?.created_at || 0))[0]
      const dt = latest?.updated_at || latest?.created_at
      return dt ? new Date(dt).toLocaleString('id-ID', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : '-'
    } catch {
      return '-'
    }
  }, [data])

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-red-800 text-white px-4 sm:px-6 py-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span className="text-sm font-semibold bg-white/10 rounded px-2 py-1">{MENU_CODES.keuangan.daftarGaji}</span>
            <div>
              <h1 className="text-xl md:text-2xl font-extrabold tracking-tight">SLIP GAJI SAYA</h1>
            </div>
          </div>
        </div>
      </div>

      {/* Subheader */}
      <div className="bg-gray-200 px-4 sm:px-6 py-2 text-sm text-gray-900">Terakhir diupdate: {lastUpdatedText}</div>

      {loading && (
        <div className="py-8 text-center text-gray-600 mt-6">Memuat data...</div>
      )}

      {error && !loading && (
        <div className="px-4 sm:px-6 py-3 text-red-700 bg-red-50 border-y border-red-200 mt-6">{error}</div>
      )}

      {!loading && !error && (
        <div className="bg-white rounded-none md:rounded-xl shadow-sm border border-gray-100 mt-6">
          <div className="px-6 py-3 border-b border-gray-100 flex items-center justify-between">
            <h2 className="text-base font-semibold text-gray-900">Slip Gaji</h2>
            <div className="flex items-center gap-2">
              <label className="text-sm text-gray-600">Tampil:</label>
              <select value={limit} onChange={onChangeLimit} className="border rounded px-2 py-1 text-sm">
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={20}>20</option>
              </select>
            </div>
          </div>
          <div className="relative overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="sticky top-0 bg-red-700 z-10">
                <tr>
                  <th className="w-10 sm:w-12 pl-4 sm:pl-6 pr-0 py-3 text-left text-sm font-extrabold text-white uppercase tracking-wider">
                    <input type="checkbox" className="rounded border-white text-white focus:ring-white" aria-label="Pilih semua" />
                  </th>
                  <th className="w-12 sm:w-16 pl-2 pr-4 sm:pr-8 py-3 text-left text-sm font-extrabold text-white uppercase tracking-wider">No</th>
                  <th className="px-4 py-3 text-left text-sm font-extrabold text-white uppercase tracking-wider">Tanggal</th>
                  <th className="px-4 py-3 text-left text-sm font-extrabold text-white uppercase tracking-wider">Penerima</th>
                  <th className="px-4 py-3 text-left text-sm font-extrabold text-white uppercase tracking-wider">Lampiran</th>
                  <th className="px-4 py-3 text-left text-sm font-extrabold text-white uppercase tracking-wider">Keterangan</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {data.length === 0 && (
                  <tr>
                    <td className="px-4 py-6 text-center text-gray-500" colSpan={6}>Belum ada slip gaji</td>
                  </tr>
                )}
                {data.map((row, idx) => (
                  <tr key={row.id} className="hover:bg-gray-50/80">
                    <td className="w-10 sm:w-12 pl-4 sm:pl-6 pr-0 py-3 align-top" onClick={(e) => e.stopPropagation()}>
                      <input type="checkbox" className="rounded border-gray-300 text-red-600 focus:ring-red-500" aria-label={`Pilih baris ${(page - 1) * limit + (idx + 1)}`} />
                    </td>
                    <td className="w-12 sm:w-16 pl-2 pr-4 sm:pr-8 py-3 align-top text-sm text-gray-800">{(page - 1) * limit + (idx + 1)}</td>
                    <td className="px-4 py-3 align-top text-sm text-gray-800">{new Date(row.created_at).toLocaleString('id-ID', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</td>
                    <td className="px-4 py-3 align-top text-sm text-gray-800">{row?.user?.nama || authUser?.nama || '-'}</td>
                    <td className="px-4 py-3 align-top text-sm">
                      {row.lampiran_foto ? (
                        <a href={toAbsoluteUrl(row.lampiran_foto)} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline">Lihat Lampiran</a>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                    <td className="px-4 py-3 align-top text-sm text-gray-800">{row.keterangan || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Pagination */}
      {!loading && pagination.totalPages > 1 && (
        <div className="flex items-center justify-between px-4 sm:px-6 mt-4">
          <div className="text-sm text-gray-600">
            Menampilkan halaman {pagination.currentPage} dari {pagination.totalPages} (total {pagination.totalItems} item)
          </div>
          <div className="flex gap-2">
            <button onClick={() => onChangePage(1)} disabled={page === 1} className="px-3 py-1 border rounded disabled:opacity-50">Awal</button>
            <button onClick={() => onChangePage(page - 1)} disabled={page === 1} className="px-3 py-1 border rounded disabled:opacity-50">Prev</button>
            <button onClick={() => onChangePage(page + 1)} disabled={page === pagination.totalPages} className="px-3 py-1 border rounded disabled:opacity-50">Next</button>
            <button onClick={() => onChangePage(pagination.totalPages)} disabled={page === pagination.totalPages} className="px-3 py-1 border rounded disabled:opacity-50">Akhir</button>
          </div>
        </div>
      )}
    </div>
  )
}

export default LeaderSlipGajiSaya
