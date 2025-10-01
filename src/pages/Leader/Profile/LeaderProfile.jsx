import React, { useEffect, useState } from 'react'
import { useAuth } from '../../../contexts/AuthContext'
import api from '../../../services/api'

const LeaderProfile = () => {
  const { user } = useAuth()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true)
        setError('')
        const res = await api.get(`/api/users/${user?.id}`)
        const json = res.data
        if (json.success === false) {
          throw new Error(json.message || 'Gagal mengambil profil')
        }
        setData(json.data)
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    if (user?.id) load()
  }, [user])

  if (loading) return <div className="p-4">Memuat profil...</div>
  if (error) return <div className="p-4 text-red-600">{error}</div>
  if (!data) return <div className="p-4">Tidak ada data.</div>

  return (
    <div className="p-4">
      <h1 className="text-xl font-semibold mb-4">Profil Saya</h1>
      <div className="space-y-1">
        <div><strong>Nama:</strong> {data.nama}</div>
        <div><strong>Username:</strong> {data.username}</div>
        <div><strong>Email:</strong> {data.email}</div>
        <div><strong>Role:</strong> {data.role}</div>
        <div><strong>Status:</strong> {data.status}</div>
      </div>
    </div>
  )
}

export default LeaderProfile
