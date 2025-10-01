import React, { useEffect, useState } from 'react'
import api from '../../../services/api'

const LeaderStrukturJobdesk = () => {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        setError('')
        const res = await api.get('/jobdesk/structure')
        const json = res.data
        if (json.success === false) throw new Error(json.message || 'Gagal mengambil struktur jobdesk')
        setData(json.data)
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  if (loading) return (
    <div className="p-8 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto"></div>
        <p className="mt-3 text-gray-600">Memuat struktur & jobdesk...</p>
      </div>
    </div>
  )
  if (error) return (
    <div className="p-6">
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">{error}</div>
    </div>
  )
  if (!data || data.length === 0) return (
    <div className="p-8 flex items-center justify-center">
      <div className="text-center text-gray-600">
        <div className="text-4xl mb-2">🏢</div>
        <div className="font-medium">Belum ada struktur</div>
        <div className="text-sm text-gray-500">Struktur organisasi & jobdesk akan tampil di sini</div>
      </div>
    </div>
  )

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight">Struktur dan Jobdesk</h1>
        <p className="text-gray-600">Struktur organisasi dan jobdesk perusahaan</p>
      </div>

      <div className="space-y-4">
        {data.map((divisi) => (
          <div key={divisi.id} className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
            <div className="text-base font-semibold text-gray-900">{divisi.nama_divisi || divisi.nama}</div>
            {divisi.departments?.length ? (
              <ul className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2">
                {divisi.departments.map((dept) => (
                  <li key={dept.id} className="border border-gray-200 rounded-md p-3 bg-gray-50">
                    <div className="font-medium text-gray-900">{dept.nama}</div>
                    {dept.positions?.length ? (
                      <ul className="mt-2 list-disc ml-5 text-sm text-gray-700 space-y-1">
                        {dept.positions.map((pos) => (
                          <li key={pos.id}>{pos.nama}</li>
                        ))}
                      </ul>
                    ) : (
                      <div className="text-sm text-gray-500 mt-1">Belum ada posisi</div>
                    )}
                  </li>
                ))}
              </ul>
            ) : (
              <div className="mt-3 text-sm text-gray-500">Belum ada departemen untuk divisi ini</div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

export default LeaderStrukturJobdesk
