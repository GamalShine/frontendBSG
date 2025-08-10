import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { 
  CheckSquare, 
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
import { tugasService } from '../../services/tugasService'
import toast from 'react-hot-toast'

const TugasList = () => {
  const { user } = useAuth()
  const [tugas, setTugas] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')

  useEffect(() => {
    const loadTugas = async () => {
      try {
        setLoading(true)
        const response = await tugasService.getTugas()
        const tugasData = response.data || response || []
        setTugas(tugasData)
      } catch (error) {
        console.error('Error loading tugas:', error)
        toast.error('Gagal memuat data tugas')
      } finally {
        setLoading(false)
      }
    }

    loadTugas()
  }, [])

  const getPriorityBadge = (skala_prioritas) => {
    const variants = {
      mendesak: 'danger',
      penting: 'warning',
      berproses: 'success'
    }
    return <Badge variant={variants[skala_prioritas] || 'default'}>{skala_prioritas}</Badge>
  }

  const getStatusBadge = (status) => {
    const variants = {
      belum: 'danger',
      proses: 'warning',
      revisi: 'info',
      selesai: 'success'
    }
    return <Badge variant={variants[status] || 'default'}>{status}</Badge>
  }

  const getDaysRemaining = (targetDate) => {
    const today = new Date()
    const target = new Date(targetDate)
    const diffTime = target - today
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    
    if (diffDays < 0) {
      return <span className="text-red-600 font-medium">Terlambat {Math.abs(diffDays)} hari</span>
    } else if (diffDays === 0) {
      return <span className="text-orange-600 font-medium">Hari ini</span>
    } else {
      return <span className="text-gray-600">{diffDays} hari lagi</span>
    }
  }

  const filteredTugas = tugas.filter(tugas => {
    const matchesSearch = tugas.judul_tugas?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         tugas.penerimaTugas?.nama?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         tugas.keterangan_tugas?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'all' || tugas.status === statusFilter
    return matchesSearch && matchesStatus
  })

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Memuat data tugas...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Daftar Tugas</h1>
          <p className="text-gray-600 mt-1">Kelola semua tugas dan pekerjaan</p>
        </div>
        <div className="flex items-center space-x-3">
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Link to="/tugas/new">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Tambah Tugas
            </Button>
          </Link>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardBody>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Cari tugas..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="all">Semua Status</option>
              <option value="belum">Belum Mulai</option>
              <option value="proses">Sedang Proses</option>
              <option value="revisi">Revisi</option>
              <option value="selesai">Selesai</option>
            </select>
            <Button variant="outline" size="sm">
              <Filter className="h-4 w-4 mr-2" />
              Filter Lainnya
            </Button>
          </div>
        </CardBody>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardBody>
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <CheckSquare className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Tugas</p>
                <p className="text-2xl font-bold text-gray-900">{tugas.length}</p>
              </div>
            </div>
          </CardBody>
        </Card>
        <Card>
          <CardBody>
            <div className="flex items-center">
              <div className="p-2 bg-red-100 rounded-lg">
                <CheckSquare className="h-6 w-6 text-red-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Belum Mulai</p>
                <p className="text-2xl font-bold text-gray-900">
                  {tugas.filter(t => t.status === 'belum').length}
                </p>
              </div>
            </div>
          </CardBody>
        </Card>
        <Card>
          <CardBody>
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <CheckSquare className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Sedang Proses</p>
                <p className="text-2xl font-bold text-gray-900">
                  {tugas.filter(t => t.status === 'proses').length}
                </p>
              </div>
            </div>
          </CardBody>
        </Card>
        <Card>
          <CardBody>
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckSquare className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Selesai</p>
                <p className="text-2xl font-bold text-gray-900">
                  {tugas.filter(t => t.status === 'selesai').length}
                </p>
              </div>
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Table */}
      <Card>
        <CardHeader>
          <h3 className="text-lg font-medium text-gray-900">Daftar Tugas</h3>
        </CardHeader>
        <CardBody>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Judul Tugas</TableHead>
                <TableHead>Assigned To</TableHead>
                <TableHead>Target Selesai</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Prioritas</TableHead>
                <TableHead>Kategori</TableHead>
                <TableHead className="text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTugas.map((t) => (
                <TableRow key={t.id}>
                  <TableCell>
                    <div>
                      <p className="font-medium text-gray-900">{t.judul_tugas}</p>
                      <p className="text-sm text-gray-500 truncate max-w-xs">{t.keterangan_tugas}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      <User className="h-4 w-4 text-gray-400 mr-2" />
                      <p className="text-sm font-medium text-gray-900">{t.penerimaTugas?.nama}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="text-sm text-gray-900">{formatDate(t.target_selesai)}</p>
                      <p className="text-xs text-gray-500">{getDaysRemaining(t.target_selesai)}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    {getStatusBadge(t.status)}
                  </TableCell>
                  <TableCell>
                    {getPriorityBadge(t.skala_prioritas)}
                  </TableCell>
                  <TableCell>
                    <Badge variant="default">{t.kategori}</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center justify-end space-x-2">
                      <Link to={`/tugas/${t.id}`}>
                        <Button variant="ghost" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </Link>
                      <Link to={`/tugas/${t.id}/edit`}>
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
          
          {filteredTugas.length === 0 && (
            <div className="text-center py-8">
              <CheckSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">Tidak ada tugas ditemukan</p>
            </div>
          )}
        </CardBody>
      </Card>
    </div>
  )
}

export default TugasList 