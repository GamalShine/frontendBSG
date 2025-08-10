import React, { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { 
  ArrowLeft, Edit, Trash2, Calendar, User, DollarSign, Download, Share2
} from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { formatDate } from '../../utils/helpers'
import Card, { CardHeader, CardBody } from '../../components/UI/Card'
import Button from '../../components/UI/Button'
import Badge from '../../components/UI/Badge'
import ContentPreview from '../../components/UI/ContentPreview'
import { poskasService } from '../../services/poskasService'
import toast from 'react-hot-toast'

const PosKasDetail = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [poskas, setPoskas] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadPoskas = async () => {
      try {
        setLoading(true)
        const response = await poskasService.getPoskasById(id)
        console.log('📥 Detail API Response:', response)
        
        // Handle different response formats
        let poskasData = null
        if (response.success && response.data) {
          poskasData = response.data
        } else if (response.data) {
          poskasData = response.data
        } else if (response.id) {
          poskasData = response
        }
        
        setPoskas(poskasData)
      } catch (error) {
        console.error('Error loading poskas detail:', error)
        toast.error('Gagal memuat detail laporan pos kas')
        navigate('/poskas')
      } finally {
        setLoading(false)
      }
    }

    if (id) {
      loadPoskas()
    }
  }, [id, navigate])

  const handleDelete = async () => {
    if (window.confirm('Apakah Anda yakin ingin menghapus laporan ini?')) {
      try {
        await poskasService.deletePoskas(id)
        toast.success('Laporan pos kas berhasil dihapus')
        navigate('/poskas')
      } catch (error) {
        console.error('Error deleting poskas:', error)
        toast.error('Gagal menghapus laporan pos kas')
      }
    }
  }

  const getStatusBadge = (statusDeleted) => {
    return statusDeleted === 0 ? 
      <Badge variant="success">Aktif</Badge> : 
      <Badge variant="danger">Dihapus</Badge>
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Memuat detail laporan...</p>
        </div>
      </div>
    )
  }

  if (!poskas) {
    return (
      <div className="text-center py-8">
        <DollarSign className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-500">Laporan tidak ditemukan</p>
        <Link to="/poskas" className="text-primary-600 hover:text-primary-700">
          Kembali ke daftar
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/poskas')}
            className="flex items-center"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Kembali
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Detail Laporan Pos Kas</h1>
            <p className="text-gray-600 mt-1">Lihat detail lengkap laporan keuangan</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button variant="outline" size="sm">
            <Share2 className="h-4 w-4 mr-2" />
            Share
          </Button>
          <Link to={`/poskas/${id}/edit`}>
            <Button variant="outline" size="sm">
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Button>
          </Link>
          <Button 
            variant="outline" 
            size="sm" 
            className="text-red-600 hover:text-red-700"
            onClick={handleDelete}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Hapus
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Content - Wider for text and images */}
        <div className="lg:col-span-3">
          {/* Report Content */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="p-3 bg-blue-100 rounded-lg mr-4">
                    <DollarSign className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">Laporan Pos Kas</h2>
                    <p className="text-sm text-gray-600 mt-1">
                      Tanggal: {formatDate(poskas.tanggal_poskas)}
                    </p>
                  </div>
                </div>
                {getStatusBadge(poskas.status_deleted)}
              </div>
            </CardHeader>
            <CardBody className="p-6">
              {/* Content Area - Integrated Text and Images */}
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <div 
                  className="prose prose-lg max-w-none text-gray-800 leading-relaxed"
                  dangerouslySetInnerHTML={{ 
                    __html: poskas.isi_poskas ? 
                      poskas.isi_poskas.replace(
                        /<img([^>]+)>/g, 
                        '<div class="my-6 text-center"><img$1 class="max-w-full h-auto rounded-lg shadow-md border border-gray-200 inline-block" style="max-height: 400px;"></div>'
                      ) : 
                      '<p class="text-gray-500 italic text-center py-8">Tidak ada konten laporan.</p>' 
                  }}
                  style={{
                    fontSize: '16px',
                    lineHeight: '1.8',
                    color: '#374151'
                  }}
                />
              </div>
              
              {/* Content Stats */}
              <div className="mt-6 pt-6 border-t border-gray-200">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div className="text-center p-3 bg-blue-50 rounded-lg">
                    <p className="font-semibold text-blue-800">Panjang Teks</p>
                    <p className="text-blue-600">
                      {poskas.isi_poskas ? poskas.isi_poskas.replace(/<[^>]*>/g, '').length : 0} karakter
                    </p>
                  </div>
                  <div className="text-center p-3 bg-green-50 rounded-lg">
                    <p className="font-semibold text-green-800">Jumlah Gambar</p>
                    <p className="text-green-600">
                      {(poskas.isi_poskas?.match(/<img/g) || []).length} gambar
                    </p>
                  </div>
                  <div className="text-center p-3 bg-purple-50 rounded-lg">
                    <p className="font-semibold text-purple-800">Dibuat Oleh</p>
                    <p className="text-purple-600">
                      {poskas.user_nama || 'Unknown'}
                    </p>
                  </div>
                  <div className="text-center p-3 bg-orange-50 rounded-lg">
                    <p className="font-semibold text-orange-800">Tanggal Dibuat</p>
                    <p className="text-orange-600">
                      {formatDate(poskas.created_at)}
                    </p>
                  </div>
                </div>
              </div>
            </CardBody>
          </Card>
        </div>

        {/* Sidebar - Narrower */}
        <div className="lg:col-span-1 space-y-6">
          {/* Quick Info */}
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold text-gray-900">Info Laporan</h3>
            </CardHeader>
            <CardBody>
              <div className="space-y-4">
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wide font-semibold">Tanggal Laporan</p>
                  <p className="text-sm font-medium text-gray-900 mt-1">
                    {formatDate(poskas.tanggal_poskas)}
                  </p>
                </div>
                
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wide font-semibold">Status</p>
                  <div className="mt-1">
                    {getStatusBadge(poskas.status_deleted)}
                  </div>
                </div>

                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wide font-semibold">Dibuat Oleh</p>
                  <p className="text-sm font-medium text-gray-900 mt-1">
                    {poskas.user_nama || 'Unknown'}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wide font-semibold">Tanggal Dibuat</p>
                  <p className="text-sm font-medium text-gray-900 mt-1">
                    {formatDate(poskas.created_at)}
                  </p>
                </div>

                {poskas.updated_at && poskas.updated_at !== poskas.created_at && (
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wide font-semibold">Terakhir Diupdate</p>
                    <p className="text-sm font-medium text-gray-900 mt-1">
                      {formatDate(poskas.updated_at)}
                    </p>
                  </div>
                )}
              </div>
            </CardBody>
          </Card>

          {/* Actions */}
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold text-gray-900">Aksi</h3>
            </CardHeader>
            <CardBody>
              <div className="space-y-3">
                <Link to={`/poskas/${id}/edit`} className="w-full">
                  <Button variant="outline" className="w-full justify-start">
                    <Edit className="h-4 w-4 mr-2" />
                    Edit Laporan
                  </Button>
                </Link>
                
                <Button variant="outline" className="w-full justify-start">
                  <Download className="h-4 w-4 mr-2" />
                  Download PDF
                </Button>
                
                <Button variant="outline" className="w-full justify-start">
                  <Share2 className="h-4 w-4 mr-2" />
                  Share Laporan
                </Button>
                
                <Button 
                  variant="outline" 
                  className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
                  onClick={handleDelete}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Hapus Laporan
                </Button>
              </div>
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default PosKasDetail 