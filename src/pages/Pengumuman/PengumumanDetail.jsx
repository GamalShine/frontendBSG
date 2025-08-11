import React, { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { pengumumanService } from '../../services/pengumumanService'
import { 
  ArrowLeft, 
  Eye, 
  Edit, 
  Megaphone,
  Calendar,
  User,
  FileText,
  Download,
  Share2,
  Bookmark,
  BookmarkPlus
} from 'lucide-react'
import Card, { CardHeader, CardBody } from '../../components/UI/Card'
import Button from '../../components/UI/Button'
import Badge from '../../components/UI/Badge'
import toast from 'react-hot-toast'

const PengumumanDetail = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [pengumuman, setPengumuman] = useState(null)
  const [loading, setLoading] = useState(false)
  const [isBookmarked, setIsBookmarked] = useState(false)

  useEffect(() => {
    loadPengumumanDetail()
  }, [id])

  const loadPengumumanDetail = async () => {
    try {
      setLoading(true)
      const response = await pengumumanService.getPengumumanDetail(id)
      
      if (response.success) {
        setPengumuman(response.data)
        setIsBookmarked(response.data.is_bookmarked || false)
      } else {
        toast.error('Gagal memuat detail pengumuman')
        navigate('/pengumuman')
      }
    } catch (error) {
      toast.error('Gagal memuat detail pengumuman')
      console.error('Error loading pengumuman detail:', error)
      navigate('/pengumuman')
    } finally {
      setLoading(false)
    }
  }

  const handleBookmark = async () => {
    try {
      const response = await pengumumanService.toggleBookmark(id)
      if (response.success) {
        setIsBookmarked(!isBookmarked)
        toast.success(isBookmarked ? 'Dihapus dari bookmark' : 'Ditambahkan ke bookmark')
      }
    } catch (error) {
      toast.error('Gagal mengubah bookmark')
      console.error('Error toggling bookmark:', error)
    }
  }

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: pengumuman.judul_pengumuman,
        text: pengumuman.isi_pengumuman.substring(0, 100) + '...',
        url: window.location.href
      })
    } else {
      navigator.clipboard.writeText(window.location.href)
      toast.success('Link berhasil disalin')
    }
  }

  const getPriorityBadge = (priority) => {
    const variants = {
      high: 'danger',
      medium: 'warning',
      low: 'info'
    }
    return <Badge variant={variants[priority] || 'default'}>{priority}</Badge>
  }

  const getStatusBadge = (status) => {
    const variants = {
      published: 'success',
      draft: 'warning',
      archived: 'danger'
    }
    return <Badge variant={variants[status] || 'default'}>{status}</Badge>
  }

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('id-ID', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Memuat detail pengumuman...</p>
        </div>
      </div>
    )
  }

  if (!pengumuman) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Megaphone className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">Pengumuman tidak ditemukan</p>
          <Link to="/pengumuman">
            <Button className="mt-4">Kembali ke Daftar</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <Link to="/pengumuman">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Kembali
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Detail Pengumuman</h1>
            <p className="text-gray-600">ID: {pengumuman.id}</p>
          </div>
        </div>
        
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleBookmark}>
            {isBookmarked ? (
              <>
                <Bookmark className="h-4 w-4 mr-2" />
                Bookmarked
              </>
            ) : (
              <>
                <BookmarkPlus className="h-4 w-4 mr-2" />
                Bookmark
              </>
            )}
          </Button>
          <Button variant="outline" onClick={handleShare}>
            <Share2 className="h-4 w-4 mr-2" />
            Share
          </Button>
          {(user.role === 'admin' || user.role === 'owner') && (
            <Link to={`/admin/pengumuman/${id}/edit`}>
              <Button variant="outline">
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </Button>
            </Link>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Announcement Content */}
          <Card>
            <CardBody className="p-6">
              <div className="space-y-4">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    {pengumuman.judul_pengumuman}
                  </h2>
                  <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      {formatDate(pengumuman.tanggal_pengumuman)}
                    </div>
                    <div className="flex items-center gap-1">
                      <User className="h-4 w-4" />
                      {pengumuman.author?.nama || 'Unknown'}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 mb-4">
                    {getPriorityBadge(pengumuman.prioritas)}
                    {getStatusBadge(pengumuman.status)}
                  </div>
                </div>
                
                <div className="prose prose-lg max-w-none">
                  <div className="bg-gray-50 rounded-lg p-6">
                    <p className="text-gray-900 whitespace-pre-wrap leading-relaxed">
                      {pengumuman.isi_pengumuman}
                    </p>
                  </div>
                </div>
              </div>
            </CardBody>
          </Card>

          {/* Attachments */}
          {pengumuman.attachments && pengumuman.attachments.length > 0 && (
            <Card>
              <CardHeader>
                <h3 className="text-lg font-semibold text-gray-900">Lampiran</h3>
              </CardHeader>
              <CardBody>
                <div className="space-y-2">
                  {pengumuman.attachments.map((attachment, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <FileText className="h-5 w-5 text-gray-600" />
                        <span className="text-gray-900">{attachment.filename}</span>
                      </div>
                      <Button size="sm" variant="outline">
                        <Download className="h-4 w-4 mr-2" />
                        Download
                      </Button>
                    </div>
                  ))}
                </div>
              </CardBody>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Metadata */}
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold text-gray-900">Informasi</h3>
            </CardHeader>
            <CardBody>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  {getStatusBadge(pengumuman.status)}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Prioritas</label>
                  {getPriorityBadge(pengumuman.prioritas)}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Target Audience</label>
                  <p className="text-sm text-gray-900 capitalize">
                    {pengumuman.target_audience || 'Semua Karyawan'}
                  </p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Views</label>
                  <p className="text-sm text-gray-900">{pengumuman.views || 0} kali dilihat</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Dibuat</label>
                  <p className="text-sm text-gray-900">
                    {new Date(pengumuman.created_at).toLocaleString('id-ID')}
                  </p>
                </div>
                
                {pengumuman.updated_at && pengumuman.updated_at !== pengumuman.created_at && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Diperbarui</label>
                    <p className="text-sm text-gray-900">
                      {new Date(pengumuman.updated_at).toLocaleString('id-ID')}
                    </p>
                  </div>
                )}
              </div>
            </CardBody>
          </Card>

          {/* Author Information */}
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold text-gray-900">Penulis</h3>
            </CardHeader>
            <CardBody>
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                  <span className="text-blue-600 font-medium text-lg">
                    {pengumuman.author?.nama?.charAt(0).toUpperCase() || 'U'}
                  </span>
                </div>
                <div>
                  <p className="font-medium text-gray-900">{pengumuman.author?.nama || 'Unknown'}</p>
                  <p className="text-sm text-gray-600">{pengumuman.author?.role || 'Unknown'}</p>
                  <p className="text-sm text-gray-600">{pengumuman.author?.email || 'Unknown'}</p>
                </div>
              </div>
            </CardBody>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold text-gray-900">Aksi Cepat</h3>
            </CardHeader>
            <CardBody>
              <div className="space-y-2">
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={() => window.print()}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Cetak Pengumuman
                </Button>
                
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={handleShare}
                >
                  <Share2 className="h-4 w-4 mr-2" />
                  Bagikan
                </Button>
                
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={handleBookmark}
                >
                  {isBookmarked ? (
                    <>
                      <Bookmark className="h-4 w-4 mr-2" />
                      Hapus Bookmark
                    </>
                  ) : (
                    <>
                      <BookmarkPlus className="h-4 w-4 mr-2" />
                      Tambah Bookmark
                    </>
                  )}
                </Button>
              </div>
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default PengumumanDetail 