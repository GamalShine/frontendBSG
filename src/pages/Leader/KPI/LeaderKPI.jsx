import React, { useEffect, useState } from 'react'
import api from '../../../services/api'
import Card, { CardHeader, CardContent, CardTitle } from '../../../components/UI/Card'

const LeaderKPI = ({ defaultCategory = '', title = 'KPI', subtitle = 'Daftar Key Performance Indicator' }) => {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [category, setCategory] = useState(defaultCategory)

  const load = async (cat = '') => {
    try {
      setLoading(true)
      setError('')
      const url = cat ? `/kpi/category/${encodeURIComponent(cat)}` : '/kpi'
      const res = await api.get(url)
      const json = res.data
      if (json.success === false) {
        throw new Error(json.message || 'Gagal mengambil data KPI')
      }
      setItems(json.data || [])
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (defaultCategory) {
      load(defaultCategory)
    } else {
      load()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [defaultCategory])

  if (loading) return (
    <div className="p-8 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto"></div>
        <p className="mt-3 text-gray-600">Memuat KPI...</p>
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
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <CardTitle as="h1" className="text-2xl">{title}</CardTitle>
              <p className="text-gray-600">{subtitle}</p>
            </div>
            <div className="flex items-center gap-2">
              <input
                className="border rounded px-3 py-2 text-sm w-56"
                placeholder="Filter kategori (opsional)"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              />
              <button
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded text-sm"
                onClick={() => load(category)}
              >
                Terapkan
              </button>
              <button
                className="border px-4 py-2 rounded text-sm"
                onClick={() => { setCategory(defaultCategory); defaultCategory ? load(defaultCategory) : load('') }}
              >
                Reset
              </button>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          {items.length === 0 ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center text-gray-600">
                <div className="text-4xl mb-2">📊</div>
                <div className="font-medium">Belum ada KPI</div>
                <div className="text-sm text-gray-500">Silakan ubah filter atau hubungi admin</div>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {items.map((kpi) => (
                <div key={kpi.id} className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="font-semibold text-gray-900">{kpi.nama || kpi.title || 'KPI'}</div>
                      {kpi.deskripsi && (
                        <div className="text-gray-700 mt-1 whitespace-pre-wrap text-sm">{kpi.deskripsi}</div>
                      )}
                    </div>
                    {kpi.category && (
                      <div className="text-xs text-gray-500 bg-gray-50 border border-gray-200 rounded px-2 py-1 whitespace-nowrap">
                        {kpi.category}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default LeaderKPI

