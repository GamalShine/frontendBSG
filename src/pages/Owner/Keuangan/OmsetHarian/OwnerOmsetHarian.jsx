import React from 'react'
import { useAuth } from '@/contexts/AuthContext'

const OwnerOmsetHarian = () => {
  const { user } = useAuth()
  
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-2">OMSET HARIAN</h1>
      <p className="text-gray-600">Test import AuthContext</p>
      <p className="text-sm text-gray-500">User: {user?.nama || 'Not logged in'}</p>
    </div>
  )
}

export default OwnerOmsetHarian
