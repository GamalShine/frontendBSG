import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { trainingService } from '../../services/trainingService'
import { 
  Search, 
  Plus, 
  Eye, 
  Edit, 
  GraduationCap,
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle
} from 'lucide-react'
import toast from 'react-hot-toast'

const TrainingList = () => {
  const { user } = useAuth()
  const [trainings, setTrainings] = useState([])
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  useEffect(() => {
    loadTrainings()
  }, [currentPage])

  const loadTrainings = async () => {
    try {
      setLoading(true)
      const params = {
        page: currentPage,
        limit: 10,
        search: searchTerm,
      }
      
      // Load trainings based on user role
      let response
      if (user.role === 'admin' || user.role === 'owner') {
        response = await trainingService.getTraining(params)
      } else {
        response = await trainingService.getTrainingByUser(user.id)
      }
      
      console.log('🔍 Training response:', response)
      
      if (response.success) {
        // Backend returns user data with training fields
        setTrainings(response.data || [])
        setTotalPages(response.pagination?.totalPages || 1)
      } else {
        console.error('❌ Training response not successful:', response)
        setTrainings([])
        setTotalPages(1)
      }
    } catch (error) {
      toast.error('Gagal memuat daftar training')
      console.error('Error loading trainings:', error)
      setTrainings([])
      setTotalPages(1)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = () => {
    setCurrentPage(1)
    loadTrainings()
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Data Training Karyawan</h1>
            <p className="text-gray-600">Kelola data training dan sertifikasi karyawan</p>
          </div>
          {(user.role === 'admin' || user.role === 'owner') && (
            <Link
              to="/admin/training/new"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center"
            >
              <Plus className="h-4 w-4 mr-2" />
              Tambah Data Training
            </Link>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Cari</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                placeholder="Cari nama karyawan..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          
          <div className="flex items-end">
            <button
              onClick={handleSearch}
              className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Search className="h-4 w-4 inline mr-2" />
              Cari
            </button>
          </div>
        </div>
      </div>

      {/* Training Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full text-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Memuat training...</p>
          </div>
        ) : trainings.length === 0 ? (
          <div className="col-span-full text-center py-8">
            <GraduationCap className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Belum ada data training</h3>
            <p className="text-gray-500 mb-4">
              {user.role === 'admin' || user.role === 'owner' 
                ? 'Belum ada data training karyawan'
                : 'Belum ada data training untuk Anda'
              }
            </p>
          </div>
        ) : (
          trainings.map((userTraining) => (
            <div key={userTraining.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
              <div className="p-6">
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-2">
                    <GraduationCap className="h-5 w-5 text-blue-600" />
                    <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                      {userTraining.role}
                    </span>
                  </div>
                </div>

                {/* User Info */}
                <div className="mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {userTraining.nama}
                  </h3>
                  <p className="text-gray-600 text-sm">
                    {userTraining.email}
                  </p>
                </div>

                {/* Training Status */}
                <div className="space-y-2 mb-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Training Dasar:</span>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      userTraining.training_dasar 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {userTraining.training_dasar ? 'Selesai' : 'Belum'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Training Leadership:</span>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      userTraining.training_leadership 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {userTraining.training_leadership ? 'Selesai' : 'Belum'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Training Skill:</span>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      userTraining.training_skill 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {userTraining.training_skill ? 'Selesai' : 'Belum'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Training Lanjutan:</span>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      userTraining.training_lanjutan 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {userTraining.training_lanjutan ? 'Selesai' : 'Belum'}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                  <div className="text-xs text-gray-500">
                    Bergabung: {formatDate(userTraining.created_at)}
                  </div>
                  <div className="flex space-x-2">
                    <Link
                      to={`/admin/training/${userTraining.id}/edit`}
                      className="p-1 text-blue-600 hover:text-blue-800"
                      title="Edit Training"
                    >
                      <Edit className="h-4 w-4" />
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-8 flex justify-center">
          <nav className="flex items-center space-x-2">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Sebelumnya
            </button>
            
            <span className="px-3 py-2 text-sm text-gray-700">
              Halaman {currentPage} dari {totalPages}
            </span>
            
            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Selanjutnya
            </button>
          </nav>
        </div>
      )}
    </div>
  )
}

export default TrainingList 