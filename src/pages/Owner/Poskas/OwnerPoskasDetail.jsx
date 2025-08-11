import React, { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../../../contexts/AuthContext'
import { poskasService } from '../../../services/poskasService'
import { 
  ArrowLeft, 
  Eye, 
  Edit, 
  DollarSign,
  Calendar,
  User,
  FileText,
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  Download
} from 'lucide-react'
import Card, { CardHeader, CardBody } from '../../../components/UI/Card'
import Button from '../../../components/UI/Button'
import Badge from '../../../components/UI/Badge'
import toast from 'react-hot-toast'

const OwnerPoskasDetail = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [poska, setPoska] = useState(null)
  const [loading, setLoading] = useState(false)
  const [actionLoading, setActionLoading] = useState(false)

  useEffect(() => {
    loadPoskaDetail()
  }, [id])

  const loadPoskaDetail = async () => {
    try {
      setLoading(true)
      const response = await poskasService.getOwnerPoskaDetail(id)
      
      if (response.success) {
        setPoska(response.data)
      } else {
        toast.error('Gagal memuat detail pos kas')
        navigate('/owner/poskas')
      }
    } catch (error) {
      toast.error('Gagal memuat detail pos kas')
      console.error('Error loading poska detail:', error)
      navigate('/owner/poskas')
    } finally {
      setLoading(false)
    }
  }

  const handleApprove = async () => {
    try {
      setActionLoading(true)
      const response = await poskasService.approvePoska(id)
      
      if (response.success) {
        toast.success('Pos kas berhasil disetujui')
        loadPoskaDetail() // Reload data
      } else {
        toast.error('Gagal menyetujui pos kas')
      }
    } catch (error) {
      toast.error('Gagal menyetujui pos kas')
      console.error('Error approving poska:', error)
    } finally {
      setActionLoading(false)
    }
  }

  const handleReject = async () => {
    const reason = prompt('Alasan penolakan:')
    if (!reason) return

    try {
      setActionLoading(true)
      const response = await poskasService.rejectPoska(id, { reason })
      
      if (response.success) {
        toast.success('Pos kas berhasil ditolak')
        loadPoskaDetail() // Reload data
      } else {
        toast.error('Gagal menolak pos kas')
      }
    } catch (error) {
      toast.error('Gagal menolak pos kas')
      console.error('Error rejecting poska:', error)
    } finally {
      setActionLoading(false)
    }
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR'
    }).format(amount)
  }

  const getTypeBadge = (type) => {
    const variants = {
      pemasukan: 'success',
      pengeluaran: 'danger'
    }
    return <Badge variant={variants[type] || 'default'}>{type}</Badge>
  }

  const getStatusBadge = (status) => {
    const variants = {
      approved: 'success',
      pending: 'warning',
      rejected: 'danger'
    }
    return <Badge variant={variants[status] || 'default'}>{status}</Badge>
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="h-5 w-5 text-green-600" />
      case 'rejected':
        return <XCircle className="h-5 w-5 text-red-600" />
      case 'pending':
        return <Clock className="h-5 w-5 text-yellow-600" />
      default:
        return <AlertTriangle className="h-5 w-5 text-gray-600" />
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Memuat detail pos kas...</p>
        </div>
      </div>
    )
  }

  if (!poska) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">Pos kas tidak ditemukan</p>
          <Link to="/owner/poskas">
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
          <Link to="/owner/poskas">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Kembali
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Detail Pos Kas</h1>
            <p className="text-gray-600">ID: {poska.id}</p>
          </div>
        </div>
        
        {/* Action Buttons */}
        {poska.status === 'pending' && (
          <div className="flex gap-2">
            <Button 
              variant="success" 
              onClick={handleApprove}
              disabled={actionLoading}
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              Setujui
            </Button>
            <Button 
              variant="danger" 
              onClick={handleReject}
              disabled={actionLoading}
            >
              <XCircle className="h-4 w-4 mr-2" />
              Tolak
            </Button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold text-gray-900">Informasi Transaksi</h3>
            </CardHeader>
            <CardBody>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Tanggal</label>
                  <div className="flex items-center gap-2 text-gray-900">
                    <Calendar className="h-4 w-4" />
                    {new Date(poska.tanggal).toLocaleDateString('id-ID', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Tipe</label>
                  {getTypeBadge(poska.tipe)}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Jumlah</label>
                  <div className="flex items-center gap-2 text-2xl font-bold text-gray-900">
                    <DollarSign className="h-5 w-5" />
                    {formatCurrency(poska.jumlah)}
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                  <div className="flex items-center gap-2">
                    {getStatusIcon(poska.status)}
                    {getStatusBadge(poska.status)}
                  </div>
                </div>
              </div>
            </CardBody>
          </Card>

          {/* Description */}
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold text-gray-900">Keterangan</h3>
            </CardHeader>
            <CardBody>
              <div className="bg-gray-50 rounded-lg p-4">
                <div 
                  className="text-gray-900 whitespace-pre-wrap"
                  dangerouslySetInnerHTML={{ __html: poska.keterangan }}
                />
              </div>
            </CardBody>
          </Card>

          {/* User Information */}
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold text-gray-900">Informasi User</h3>
            </CardHeader>
            <CardBody>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Nama</label>
                  <div className="flex items-center gap-2 text-gray-900">
                    <User className="h-4 w-4" />
                    {poska.user?.nama || 'Unknown'}
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Username</label>
                  <div className="text-gray-900">{poska.user?.username || 'Unknown'}</div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                  <div className="text-gray-900">{poska.user?.email || 'Unknown'}</div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Role</label>
                  <Badge variant="info">{poska.user?.role || 'Unknown'}</Badge>
                </div>
              </div>
            </CardBody>
          </Card>

          {/* Attachments */}
          {poska.attachments && poska.attachments.length > 0 && (
            <Card>
              <CardHeader>
                <h3 className="text-lg font-semibold text-gray-900">Lampiran</h3>
              </CardHeader>
              <CardBody>
                <div className="space-y-2">
                  {poska.attachments.map((attachment, index) => (
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
          {/* Status Timeline */}
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold text-gray-900">Timeline Status</h3>
            </CardHeader>
            <CardBody>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">Dibuat</p>
                    <p className="text-xs text-gray-600">
                      {new Date(poska.created_at).toLocaleString('id-ID')}
                    </p>
                  </div>
                </div>
                
                {poska.updated_at && poska.updated_at !== poska.created_at && (
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-yellow-600 rounded-full mt-2"></div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">Diperbarui</p>
                      <p className="text-xs text-gray-600">
                        {new Date(poska.updated_at).toLocaleString('id-ID')}
                      </p>
                    </div>
                  </div>
                )}
                
                {poska.status === 'approved' && poska.approved_at && (
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-green-600 rounded-full mt-2"></div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">Disetujui</p>
                      <p className="text-xs text-gray-600">
                        {new Date(poska.approved_at).toLocaleString('id-ID')}
                      </p>
                    </div>
                  </div>
                )}
                
                {poska.status === 'rejected' && poska.rejected_at && (
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-red-600 rounded-full mt-2"></div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">Ditolak</p>
                      <p className="text-xs text-gray-600">
                        {new Date(poska.rejected_at).toLocaleString('id-ID')}
                      </p>
                      {poska.rejection_reason && (
                        <p className="text-xs text-gray-600 mt-1">
                          Alasan: {poska.rejection_reason}
                        </p>
                      )}
                    </div>
                  </div>
                )}
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
                  Cetak Detail
                </Button>
                
                <Link to={`/poskas/${poska.id}/edit`}>
                  <Button 
                    variant="outline" 
                    className="w-full justify-start"
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Edit Transaksi
                  </Button>
                </Link>
              </div>
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default OwnerPoskasDetail 