import React, { useEffect, useState } from 'react'
import { useAuth } from '../../../contexts/AuthContext'
import api from '../../../services/api'

const LeaderSaranList = () => {
  const { token, user } = useAuth()
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        setError('')
        const res = await api.get(`/saran/receiver/${user?.id}`)
        const json = res.data
        if (json.success === false) {
          throw new Error(json.message || 'Gagal mengambil data saran')
        }
        setItems(json.data || [])
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    if (user?.id) fetchData()
  }, [user])

  if (loading) return (
    <div className="p-8 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto"></div>
        <p className="mt-3 text-gray-600">Memuat saran...</p>
      </div>
    </div>
  )
  if (error) return (
    <div className="p-6">
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">{error}</div>
    </div>
  )

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight">Saran untuk Saya</h1>
        <p className="text-gray-600">Daftar saran yang ditujukan kepada Anda</p>
      </div>

      {items.length === 0 ? (
        <div className="flex items-center justify-center py-12">
          <div className="text-center text-gray-600">
            <div className="text-4xl mb-2">💬</div>
            <div className="font-medium">Belum ada saran</div>
            <div className="text-sm text-gray-500">Saran baru akan tampil di sini</div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {items.map((s) => (
            <div key={s.id} className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="font-semibold text-gray-900">{s.judul || 'Tanpa Judul'}</div>
                  {s.isi && <div className="text-gray-700 mt-1 whitespace-pre-wrap text-sm">{s.isi}</div>}
                </div>
                <div className="text-xs text-gray-500 bg-gray-50 border border-gray-200 rounded px-2 py-1 whitespace-nowrap">
                  {s.tanggal || s.created_at}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default LeaderSaranList
