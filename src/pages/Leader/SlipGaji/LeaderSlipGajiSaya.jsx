import React, { useEffect, useMemo, useState } from 'react'
import api from '../../../services/api'
import { API_CONFIG } from '../../../config/constants'
import { useAuth } from '../../../contexts/AuthContext'

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

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">SLIP GAJI SAYA</h1>
          <p className="text-gray-600">Daftar slip gaji yang terkait dengan akun Anda</p>
        </div>
        <div className="flex items-center gap-2">
          <label className="text-sm text-gray-600">Tampil:</label>
          <select value={limit} onChange={onChangeLimit} className="border rounded px-2 py-1">
            <option value={5}>5</option>
            <option value={10}>10</option>
            <option value={20}>20</option>
          </select>
        </div>
      </div>

      {loading && (
        <div className="py-8 text-center text-gray-600">Memuat data...</div>
      )}

      {error && !loading && (
        <div className="py-3 mb-4 text-red-700 bg-red-50 border border-red-200 rounded px-3">{error}</div>
      )}

      {!loading && !error && (
        <div className="overflow-x-auto border rounded">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tanggal</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Penerima</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Lampiran</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Keterangan</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {data.length === 0 && (
                <tr>
                  <td className="px-4 py-6 text-center text-gray-500" colSpan={4}>Belum ada slip gaji</td>
                </tr>
              )}
              {data.map((row) => (
                <tr key={row.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 align-top">{new Date(row.created_at).toLocaleString()}</td>
                  <td className="px-4 py-3 align-top">{row?.user?.nama || authUser?.nama || '-'}</td>
                  <td className="px-4 py-3 align-top">
                    {row.lampiran_foto ? (
                      <a href={toAbsoluteUrl(row.lampiran_foto)} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline">
                        Lihat Lampiran
                      </a>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </td>
                  <td className="px-4 py-3 align-top">{row.keterangan || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      {!loading && pagination.totalPages > 1 && (
        <div className="flex items-center justify-between mt-4">
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
