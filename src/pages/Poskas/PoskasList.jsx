import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { 
  DollarSign, 
  Plus, 
  Search, 
  Filter,
  Eye,
  Edit,
  Trash2,
  Download,
  Calendar,
  User
} from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { formatDate } from '../../utils/helpers'
import Card, { CardHeader, CardBody } from '../../components/UI/Card'
import Button from '../../components/UI/Button'
import Badge from '../../components/UI/Badge'
import Table, { TableHeader, TableBody, TableRow, TableHead, TableCell } from '../../components/UI/Table'
import { poskasService } from '../../services/poskasService'
import toast from 'react-hot-toast'

const PoskasList = () => {
  const { user } = useAuth()
  const [poskas, setPoskas] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')

  useEffect(() => {
    const loadPoskas = async () => {
      try {
        setLoading(true)
        const response = await poskasService.getPoskas()
        console.log('📥 API Response:', response)
        
        // Handle different response formats
        let poskasData = []
        if (response.success && response.data) {
          poskasData = response.data
        } else if (Array.isArray(response)) {
          poskasData = response
        } else if (response.data && Array.isArray(response.data)) {
          poskasData = response.data
        }
        
        setPoskas(poskasData)
      } catch (error) {
        console.error('Error loading poskas:', error)
        toast.error('Gagal memuat data pos kas')
        setPoskas([])
      } finally {
        setLoading(false)
      }
    }

    loadPoskas()
  }, [])

  const getStatusBadge = (statusDeleted) => {
    return statusDeleted === 0 ? 
      <Badge variant="success">Aktif</Badge> : 
      <Badge variant="danger">Dihapus</Badge>
  }

  const truncateText = (text, maxLength = 100) => {
    if (!text) return '-'
    if (text.length <= maxLength) return text
    return text.slice(0, maxLength) + '...'
  }

  const filteredPoskas = poskas.filter(poskas => {
    const matchesSearch = !searchTerm || 
      formatDate(poskas.created_at)?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      poskas.user_nama?.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = statusFilter === 'all' || 
      (statusFilter === 'active' && poskas.status_deleted === 0) ||
      (statusFilter === 'deleted' && poskas.status_deleted === 1)
    
    return matchesSearch && matchesStatus
  })

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Memuat data pos kas...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Pos Kas</h1>
          <p className="text-gray-600 mt-1">Kelola laporan keuangan dan pos kas</p>
        </div>
        <Link to="/poskas/new">
          <Button className="flex items-center">
            <Plus className="h-4 w-4 mr-2" />
            Tambah Pos Kas
          </Button>
        </Link>
      </div>

      {/* Filters */}
      <Card>
        <CardBody>
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <input
                  type="text"
                  placeholder="Cari berdasarkan tanggal atau pembuat..."
                  className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            
            {/* Status Filter */}
            <div className="md:w-48">
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="all">Semua Status</option>
                <option value="active">Aktif</option>
                <option value="deleted">Dihapus</option>
              </select>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Poskas Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <DollarSign className="h-5 w-5 text-green-600 mr-2" />
              <h3 className="text-lg font-medium text-gray-900">
                Daftar Pos Kas ({filteredPoskas.length})
              </h3>
            </div>
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </CardHeader>
        <CardBody>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-16">No</TableHead>
                <TableHead>Tanggal Dibuat</TableHead>
                <TableHead>Dibuat Oleh</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPoskas.map((poskas, index) => (
                <TableRow key={poskas.id}>
                  <TableCell>
                    <span className="font-medium text-gray-900">
                      {index + 1}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 text-gray-400 mr-2" />
                      <span className="font-medium">
                        {formatDate(poskas.created_at)}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      <User className="h-4 w-4 text-gray-400 mr-2" />
                      <span className="text-sm text-gray-900">
                        {poskas.user_nama || 'Unknown'}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    {getStatusBadge(poskas.status_deleted)}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center justify-end space-x-2">
                      <Link to={`/poskas/${poskas.id}`}>
                        <Button variant="ghost" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </Link>
                      <Link to={`/poskas/${poskas.id}/edit`}>
                        <Button variant="ghost" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                      </Link>
                      <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          
          {filteredPoskas.length === 0 && (
            <div className="text-center py-8">
              <DollarSign className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">Tidak ada pos kas ditemukan</p>
              <Link to="/poskas/new" className="mt-2 inline-block">
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Tambah Pos Kas Pertama
                </Button>
              </Link>
            </div>
          )}
        </CardBody>
      </Card>
    </div>
  )
}

export default PoskasList 