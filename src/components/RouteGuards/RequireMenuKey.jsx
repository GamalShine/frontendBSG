import React from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'

const RequireMenuKey = ({ requiredKey, children }) => {
  const { allowedMenuKeys, loading, isAuthenticated } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-24 w-24 border-b-2 border-red-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Memuat izin akses...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  if (!requiredKey) {
    return children
  }

  // Bypass dihapus: akses hanya lewat allowedMenuKeys

  const allowed = Array.isArray(allowedMenuKeys) && allowedMenuKeys.includes(requiredKey)
  if (!allowed) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Akses Ditolak</h2>
          <p className="text-gray-600 mb-4">Anda tidak memiliki akses ke halaman ini.</p>
          <a href="/dashboard" className="text-red-700 hover:underline">Kembali ke Dashboard</a>
        </div>
      </div>
    )
  }

  return children
}

export default RequireMenuKey
