import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { 
  AlertTriangle, 
  Plus, 
  Search, 
  Filter,
  Eye,
  Edit,
  Trash2,
  Download
} from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { formatDate } from '../../utils/helpers'
import Card, { CardHeader, CardBody } from '../../components/UI/Card'
import Button from '../../components/UI/Button'
import Badge from '../../components/UI/Badge'
import Table, { TableHeader, TableBody, TableRow, TableHead, TableCell } from '../../components/UI/Table'
import { komplainService } from '../../services/komplainService'
import toast from 'react-hot-toast'

const KomplainList = () => {
  const { user } = useAuth()
  const [komplains, setKomplains] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')

  useEffect(() => {
    const loadKomplains = async () => {
      try {
        setLoading(true)
        const response = await komplainService.getKomplains()
        const komplainsData = response.data || response || []
        setKomplains(komplainsData)
      } catch (error) {
        console.error('Error loading komplains:', error)
        toast.error('Gagal memuat data komplain')
      } finally {
        setLoading(false)
      }
    }

    loadKomplains()
  }, [])

  const getStatusBadge = (status) => {
    const variants = {
      menunggu: 'warning',
      diproses: 'info',
      selesai: 'success',
      dibatalkan: 'danger'
    }
    return <Badge variant={variants[status] || 'default'}>{status}</Badge>
  }

  const getPriorityBadge = (prioritas) => {
    const variants = {
      tinggi: 'danger',
      sedang: 'warning',
      rendah: 'success'
    }
    return <Badge variant={variants[prioritas] || 'default'}>{prioritas}</Badge>
  }

  const filteredKomplains = komplains.filter(komplain => {
    const matchesSearch = komplain.judul_komplain?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         komplain.Pelapor?.nama?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         komplain.deskripsi_komplain?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'all' || komplain.status === statusFilter
    return matchesSearch && matchesStatus
  })

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Memuat data komplain...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Page Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Daftar Komplain</h1>
          <p className="text-gray-600 mt-1">Kelola semua komplain dan laporan</p>
        </div>
        <div className="flex items-center space-x-3">
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Link to="/komplain/new">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Tambah Komplain
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
                placeholder="Cari komplain..."
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
              <option value="menunggu">Menunggu</option>
              <option value="diproses">Diproses</option>
              <option value="selesai">Selesai</option>
              <option value="ditolak">Ditolak</option>
            </select>
            <Button variant="outline" size="sm">
              <Filter className="h-4 w-4 mr-2" />
              Filter Lainnya
            </Button>
          </div>
        </CardBody>
      </Card>

             {/* Stats */}
       <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
         <Card>
           <CardBody className="py-3">
             <div className="flex items-center">
               <div className="p-2 bg-blue-100 rounded-lg">
                 <AlertTriangle className="h-5 w-5 text-blue-600" />
               </div>
               <div className="ml-3">
                 <p className="text-sm font-medium text-gray-600">Total Komplain</p>
                 <p className="text-xl font-bold text-gray-900">{komplains.length}</p>
               </div>
             </div>
           </CardBody>
         </Card>
         <Card>
           <CardBody className="py-3">
             <div className="flex items-center">
               <div className="p-2 bg-yellow-100 rounded-lg">
                 <AlertTriangle className="h-5 w-5 text-yellow-600" />
               </div>
               <div className="ml-3">
                 <p className="text-sm font-medium text-gray-600">Menunggu</p>
                 <p className="text-xl font-bold text-gray-900">
                   {komplains.filter(k => k.status === 'menunggu').length}
                 </p>
               </div>
             </div>
           </CardBody>
         </Card>
         <Card>
           <CardBody className="py-3">
             <div className="flex items-center">
               <div className="p-2 bg-blue-100 rounded-lg">
                 <AlertTriangle className="h-5 w-5 text-blue-600" />
               </div>
               <div className="ml-3">
                 <p className="text-sm font-medium text-gray-600">Diproses</p>
                 <p className="text-xl font-bold text-gray-900">
                   {komplains.filter(k => k.status === 'diproses').length}
                 </p>
               </div>
             </div>
           </CardBody>
         </Card>
         <Card>
           <CardBody className="py-3">
             <div className="flex items-center">
               <div className="p-2 bg-green-100 rounded-lg">
                 <AlertTriangle className="h-5 w-5 text-green-600" />
               </div>
               <div className="ml-3">
                 <p className="text-sm font-medium text-gray-600">Selesai</p>
                 <p className="text-xl font-bold text-gray-900">
                   {komplains.filter(k => k.status === 'selesai').length}
                 </p>
               </div>
             </div>
           </CardBody>
         </Card>
       </div>

      {/* Table */}
      <Card>
        <CardHeader>
          <h3 className="text-lg font-medium text-gray-900">Daftar Komplain</h3>
        </CardHeader>
        <CardBody>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Judul</TableHead>
                <TableHead>Pelapor</TableHead>
                <TableHead>Tanggal</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Prioritas</TableHead>
                <TableHead>Kategori</TableHead>
                <TableHead className="text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredKomplains.map((komplain) => (
                <TableRow key={komplain.id}>
                  <TableCell>
                    <div>
                      <p className="font-medium text-gray-900">{komplain.judul_komplain}</p>
                      <p className="text-sm text-gray-500 truncate max-w-xs">{komplain.deskripsi_komplain}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <p className="text-sm font-medium text-gray-900">{komplain.Pelapor?.nama}</p>
                  </TableCell>
                  <TableCell>
                    <p className="text-sm text-gray-900">{formatDate(komplain.tanggal_pelaporan)}</p>
                  </TableCell>
                  <TableCell>
                    {getStatusBadge(komplain.status)}
                  </TableCell>
                  <TableCell>
                    {getPriorityBadge(komplain.prioritas)}
                  </TableCell>
                  <TableCell>
                    <Badge variant="default">{komplain.kategori}</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center justify-end space-x-2">
                      <Link to={`/komplain/${komplain.id}`}>
                        <Button variant="ghost" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </Link>
                      <Link to={`/komplain/${komplain.id}/edit`}>
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
          
          {filteredKomplains.length === 0 && (
            <div className="text-center py-8">
              <AlertTriangle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">Tidak ada komplain ditemukan</p>
            </div>
          )}
        </CardBody>
      </Card>
    </div>
  )
}

export default KomplainList 