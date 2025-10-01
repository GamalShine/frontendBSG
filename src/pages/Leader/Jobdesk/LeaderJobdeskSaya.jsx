import React, { useEffect, useState } from 'react'
import api from '../../../services/api'

const LeaderJobdeskSaya = () => {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        setError('')
        const res = await api.get('/jobdesk/user-structure')
        const json = res.data
        if (json.success === false) {
          throw new Error(json.message || 'Gagal mengambil data jobdesk saya')
        }
        setData(json.data)
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  if (loading) return <div className="p-4">Memuat data jobdesk saya...</div>
  if (error) return (
    <div className="p-6">
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
        {error}
      </div>
    </div>
  )
  if (!data) return (
    <div className="p-8 flex items-center justify-center">
      <div className="text-center">
        <div className="mx-auto h-14 w-14 rounded-full bg-gray-100 flex items-center justify-center">
          <span className="text-gray-400 text-2xl">🗂️</span>
        </div>
        <p className="mt-3 text-gray-600 font-medium">Belum ada data</p>
        <p className="text-gray-500 text-sm">Data jobdesk Anda akan tampil di sini</p>
      </div>
    </div>
  )

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight">Jobdesk Saya</h1>
        <p className="text-gray-600">Struktur jobdesk berdasarkan divisi dan jabatan Anda</p>
      </div>

      {/* Ringkasan User */}
      <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6 shadow-sm">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
          <div>
            <div className="text-gray-500">Nama</div>
            <div className="font-medium text-gray-900">{data.user?.nama || '-'}</div>
          </div>
          <div>
            <div className="text-gray-500">Jabatan</div>
            <div className="font-medium text-gray-900">{data.user?.jabatan || '-'}</div>
          </div>
          <div>
            <div className="text-gray-500">Divisi</div>
            <div className="font-medium text-gray-900">{data.user?.divisi || '-'}</div>
          </div>
        </div>
      </div>

      {/* Departemen & Posisi */}
      <div className="space-y-4">
        {data.departments?.length ? (
          data.departments.map((dept) => (
            <div key={dept.id} className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <div className="text-base font-semibold text-gray-900">{dept.nama}</div>
                  {dept.keterangan && <div className="text-sm text-gray-600 mt-0.5">{dept.keterangan}</div>}
                </div>
                <div className="text-xs text-gray-500 bg-gray-50 border border-gray-200 rounded px-2 py-1">
                  {dept.positions?.length || 0} posisi
                </div>
              </div>

              {dept.positions?.length ? (
                <ul className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {dept.positions.map((pos) => (
                    <li key={pos.id} className="border border-gray-200 rounded-md p-3 bg-gray-50">
                      <div className="font-medium text-gray-900">{pos.nama}</div>
                      {pos.keterangan && <div className="text-sm text-gray-600 mt-0.5">{pos.keterangan}</div>}
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="mt-3 text-sm text-gray-500">Belum ada posisi pada departemen ini</div>
              )}
            </div>
          ))
        ) : (
          <div className="flex items-center justify-center py-12">
            <div className="text-center text-gray-600">
              <div className="text-4xl mb-2">📄</div>
              <div className="font-medium">Tidak ada departemen</div>
              <div className="text-sm text-gray-500">Silakan hubungi admin untuk pengaturan jobdesk</div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default LeaderJobdeskSaya
