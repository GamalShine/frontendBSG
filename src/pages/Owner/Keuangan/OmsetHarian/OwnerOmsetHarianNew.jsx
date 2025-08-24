import React, { useState, useEffect } from 'react'
import { useAuth } from '../../../contexts/AuthContext'
import { 
  Calendar,
  DollarSign,
  TrendingUp,
  TrendingDown,
  BarChart3,
  Download,
  Plus,
  Search,
  Filter,
  RefreshCw
} from 'lucide-react'
import { toast } from 'react-hot-toast'

const OwnerOmsetHarianNew = () => {
  const { user } = useAuth()
  
  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">OMSET HARIAN - NEW</h1>
        <p className="text-gray-600">Test file untuk memastikan import berfungsi</p>
        <p className="text-sm text-gray-500">User: {user?.nama || 'Not logged in'}</p>
      </div>
    </div>
  )
}

export default OwnerOmsetHarianNew
