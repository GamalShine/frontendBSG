import React, { useState, useEffect } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import { timService } from '../../../../services/timService'
import { 
  ArrowLeft,
  Edit,
  User,
  Building,
  Award,
  AlertTriangle,
  Calendar,
  Clock
} from 'lucide-react'
import toast from 'react-hot-toast'

const OwnerTimMerahBiruDetail = () => {
  const navigate = useNavigate()
  const { type, id } = useParams() // 'merah' or 'biru' and id
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState(null)

  useEffect(() => {
    loadData()
  }, [id, type])

  const loadData = async () => {
    try {
      setLoading(true)
      let response

      if (type === 'merah') {
        response = await timService.getTimMerahByIdForOwner(id)
      } else {
        response = await timService.getTimBiruByIdForOwner(id)
      }

      if (response.success) {
        setData(response.data)
      } else {
        toast.error('Gagal memuat data')
        navigate(`/owner/sdm/tim-merah-biru`)
      }
    } catch (error) {
      toast.error('Terjadi kesalahan saat memuat data')
      console.error('Error loading data:', error)
      navigate(`/owner/sdm/tim-merah-biru`)
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'SP1':
        return 'bg-yellow-100 text-yellow-800'
      case 'SP2':
        return 'bg-orange-100 text-orange-800'
      case 'SP3':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusText = (status) => {
    switch (status) {
      case 'SP1':
        return 'Surat Peringatan 1'
      case 'SP2':
        return 'Surat Peringatan 2'
      case 'SP3':
        return 'Surat Peringatan 3'
      default:
        return status
    }
  }

  const formatDate = (dateString) => {
    if (!dateString) return '-'
    const date = new Date(dateString)
    return date.toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const isTimMerah = type === 'merah'

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="ml-4 text-gray-600">Memuat data...</p>
        </div>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="p-6">
        <div className="text-center">
          <p className="text-gray-600">Data tidak ditemukan</p>
          <button
            onClick={() => navigate(`/owner/sdm/tim-merah-biru`)}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Kembali
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate(`/owner/sdm/tim-merah-biru`)}
            className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Detail Tim {isTimMerah ? 'Merah' : 'Biru'}
            </h1>
            <p className="text-gray-600">
              Informasi lengkap tim {isTimMerah ? 'merah' : 'biru'}
            </p>
          </div>
        </div>
        <Link
          to={`/owner/sdm/tim/${type}/edit/${id}`}
          className={`text-white px-4 py-2 rounded-lg hover:opacity-90 flex items-center gap-2 ${
            isTimMerah ? 'bg-red-600 hover:bg-red-700' : 'bg-blue-600 hover:bg-blue-700'
          }`}
        >
          <Edit className="h-4 w-4" />
          Edit
        </Link>
      </div>

      {/* Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Main Information */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Informasi Utama</h2>
          
          <div className="space-y-4">
            {/* Nama */}
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                isTimMerah ? 'bg-red-100' : 'bg-blue-100'
              }`}>
                <User className={`h-5 w-5 ${
                  isTimMerah ? 'text-red-600' : 'text-blue-600'
                }`} />
              </div>
              <div>
                <p className="text-sm text-gray-500">Nama Karyawan</p>
                <p className="font-medium text-gray-900">{data.nama}</p>
              </div>
            </div>

            {/* Divisi */}
            <div className="flex items-center gap-3">
              <Building className="h-5 w-5 text-gray-400" />
              <div>
                <p className="text-sm text-gray-500">Divisi</p>
                <p className="font-medium text-gray-900">{data.divisi}</p>
              </div>
            </div>

            {/* Posisi */}
            <div className="flex items-center gap-3">
              <User className="h-5 w-5 text-gray-400" />
              <div>
                <p className="text-sm text-gray-500">Posisi</p>
                <p className="font-medium text-gray-900">{data.posisi}</p>
              </div>
            </div>

            {/* Status or Prestasi */}
            {isTimMerah ? (
              <div className="flex items-center gap-3">
                <AlertTriangle className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">Status</p>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(data.status)}`}>
                    {getStatusText(data.status)}
                  </span>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Award className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">Prestasi</p>
                  <p className="font-medium text-gray-900">{data.prestasi}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Additional Information */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Informasi Tambahan</h2>
          
          <div className="space-y-4">
            {/* Keterangan */}
            <div>
              <p className="text-sm text-gray-500 mb-2">Keterangan</p>
              <p className="text-gray-900">
                {data.keterangan || 'Tidak ada keterangan tambahan'}
              </p>
            </div>

            {/* Created At */}
            <div className="flex items-center gap-3">
              <Calendar className="h-5 w-5 text-gray-400" />
              <div>
                <p className="text-sm text-gray-500">Tanggal Dibuat</p>
                <p className="font-medium text-gray-900">
                  {formatDate(data.createdAt)}
                </p>
              </div>
            </div>

            {/* Updated At */}
            <div className="flex items-center gap-3">
              <Clock className="h-5 w-5 text-gray-400" />
              <div>
                <p className="text-sm text-gray-500">Terakhir Diperbarui</p>
                <p className="font-medium text-gray-900">
                  {formatDate(data.updatedAt)}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="mt-6 flex justify-end gap-4">
        <button
          onClick={() => navigate(`/owner/sdm/tim-merah-biru`)}
          className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
        >
          Kembali
        </button>
        <Link
          to={`/owner/sdm/tim/${type}/edit/${id}`}
          className={`text-white px-6 py-2 rounded-lg hover:opacity-90 ${
            isTimMerah ? 'bg-red-600 hover:bg-red-700' : 'bg-blue-600 hover:bg-blue-700'
          }`}
        >
          Edit Data
        </Link>
      </div>
    </div>
  )
}

export default OwnerTimMerahBiruDetail
