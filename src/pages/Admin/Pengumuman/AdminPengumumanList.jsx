import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../../contexts/AuthContext'
import { pengumumanService } from '../../../services/pengumumanService'
import { 
  Search, 
  Plus, 
  Eye, 
  Edit, 
  Trash2,
  Megaphone,
  Calendar,
  User,
  Filter,
  Download,
  BarChart3,
  RefreshCw,
  CheckCircle,
  XCircle,
  AlertTriangle
} from 'lucide-react'
import Card, { CardHeader, CardBody } from '../../../components/UI/Card'
import Button from '../../../components/UI/Button'
import Input from '../../../components/UI/Input'
import Select from '../../../components/UI/Select'
import Badge from '../../../components/UI/Badge'
import toast from 'react-hot-toast'

const AdminPengumumanList = () => {
  const { user } = useAuth()
  const [pengumuman, setPengumuman] = useState([])
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [priorityFilter, setPriorityFilter] = useState('')
  const [dateFilter, setDateFilter] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [stats, setStats] = useState({
    totalPengumuman: 0,
    activePengumuman: 0,
    draftPengumuman: 0,
    totalViews: 0
  })

  useEffect(() => {
    loadPengumuman()
    loadStats()
  }, [currentPage, statusFilter, priorityFilter, dateFilter])

  const loadPengumuman = async () => {
    try {
      setLoading(true)
      const params = {
        page: currentPage,
        limit: 15,
        search: searchTerm,
        status: statusFilter,
        priority: priorityFilter,
        date: dateFilter
      }
      
      const response = await pengumumanService.getAdminPengumuman(params)
      console.log('🔍 Admin Pengumuman response:', response)
      
      if (response.success) {
        // Backend returns data directly
        setPengumuman(response.data || [])
        setTotalPages(response.pagination?.totalPages || 1)
      } else {
        console.error('❌ Admin Pengumuman response not successful:', response)
        setPengumuman([])
        setTotalPages(1)
      }
    } catch (error) {
      toast.error('Gagal memuat daftar pengumuman')
      console.error('Error loading pengumuman:', error)
      setPengumuman([])
      setTotalPages(1)
    } finally {
      setLoading(false)
    }
  }

  const loadStats = async () => {
    try {
      const response = await pengumumanService.getAdminStats()
      if (response.success) {
        setStats(response.data)
      }
    } catch (error) {
      console.error('Error loading stats:', error)
    }
  }

  const handleSearch = () => {
    setCurrentPage(1)
    loadPengumuman()
  }

  const handleReset = () => {
    setSearchTerm('')
    setStatusFilter('')
    setPriorityFilter('')
    setDateFilter('')
    setCurrentPage(1)
    loadPengumuman()
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Apakah Anda yakin ingin menghapus pengumuman ini?')) {
      return
    }

    try {
      const response = await pengumumanService.deletePengumuman(id)
      
      if (response.success) {
        toast.success('Pengumuman berhasil dihapus')
        loadPengumuman()
        loadStats()
      } else {
        toast.error('Gagal menghapus pengumuman')
      }
    } catch (error) {
      toast.error('Gagal menghapus pengumuman')
      console.error('Error deleting pengumuman:', error)
    }
  }

  const getStatusBadge = (status) => {
    const variants = {
      published: 'success',
      draft: 'warning',
      archived: 'danger'
    }
    return <Badge variant={variants[status] || 'default'}>{status}</Badge>
  }

  const getPriorityBadge = (priority) => {
    const variants = {
      high: 'danger',
      medium: 'warning',
      low: 'info'
    }
    return <Badge variant={variants[priority] || 'default'}>{priority}</Badge>
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'published':
        return <CheckCircle className="h-5 w-5 text-green-600" />
      case 'draft':
        return <AlertTriangle className="h-5 w-5 text-yellow-600" />
      case 'archived':
        return <XCircle className="h-5 w-5 text-red-600" />
      default:
        return <AlertTriangle className="h-5 w-5 text-gray-600" />
    }
  }

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('id-ID', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const exportData = async () => {
    try {
      const response = await pengumumanService.exportAdminPengumuman({
        status: statusFilter,
        priority: priorityFilter,
        date: dateFilter
      })
      
      if (response.success) {
        // Create download link
        const blob = new Blob([response.data], { type: 'text/csv' })
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `pengumuman-admin-${new Date().toISOString().split('T')[0]}.csv`
        a.click()
        window.URL.revokeObjectURL(url)
        toast.success('Data berhasil diekspor')
      }
    } catch (error) {
      toast.error('Gagal mengekspor data')
      console.error('Error exporting data:', error)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Admin Pengumuman</h1>
          <p className="text-gray-600">Kelola semua pengumuman perusahaan</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={exportData}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button variant="outline" onClick={loadStats}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardBody className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Megaphone className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Pengumuman</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalPengumuman}</p>
              </div>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardBody className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Published</p>
                <p className="text-2xl font-bold text-gray-900">{stats.activePengumuman}</p>
              </div>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardBody className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <AlertTriangle className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Draft</p>
                <p className="text-2xl font-bold text-gray-900">{stats.draftPengumuman}</p>
              </div>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardBody className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <BarChart3 className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Views</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalViews}</p>
              </div>
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold text-gray-900">Filter & Pencarian</h3>
        </CardHeader>
        <CardBody>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Pencarian</label>
              <Input
                placeholder="Cari pengumuman..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
              <Select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="">Semua Status</option>
                <option value="published">Published</option>
                <option value="draft">Draft</option>
                <option value="archived">Archived</option>
              </Select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Prioritas</label>
              <Select
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
              >
                <option value="">Semua Prioritas</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </Select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Tanggal</label>
              <Input
                type="date"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
              />
            </div>
          </div>
          
          <div className="flex gap-2 mt-4">
            <Button onClick={handleSearch}>
              <Search className="h-4 w-4 mr-2" />
              Cari
            </Button>
            <Button variant="outline" onClick={handleReset}>
              Reset
            </Button>
          </div>
        </CardBody>
      </Card>

      {/* Pengumuman List */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold text-gray-900">Daftar Pengumuman</h3>
            <Link to="/admin/pengumuman/new">
              <Button size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Tambah Pengumuman
              </Button>
            </Link>
          </div>
        </CardHeader>
        <CardBody>
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2 text-gray-600">Memuat data...</p>
            </div>
          ) : pengumuman.length === 0 ? (
            <div className="text-center py-8">
              <Megaphone className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">Tidak ada pengumuman ditemukan</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Judul
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Prioritas
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tanggal
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Author
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Views
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Aksi
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {pengumuman.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {item.judul_pengumuman}
                          </div>
                          <div className="text-sm text-gray-500">
                            {item.isi_pengumuman && item.isi_pengumuman.length > 50 
                              ? `${item.isi_pengumuman.substring(0, 50)}...` 
                              : item.isi_pengumuman}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          {getStatusIcon(item.status)}
                          {getStatusBadge(item.status)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getPriorityBadge(item.prioritas)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatDate(item.tanggal_pengumuman)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4" />
                          {item.author?.nama || 'Unknown'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {item.views || 0}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex gap-2">
                          <Link to={`/pengumuman/${item.id}`}>
                            <Button size="sm" variant="outline">
                              <Eye className="h-4 w-4" />
                            </Button>
                          </Link>
                          <Link to={`/admin/pengumuman/${item.id}/edit`}>
                            <Button size="sm" variant="outline">
                              <Edit className="h-4 w-4" />
                            </Button>
                          </Link>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => handleDelete(item.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-between items-center mt-6">
              <p className="text-sm text-gray-700">
                Halaman {currentPage} dari {totalPages}
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(currentPage - 1)}
                >
                  Sebelumnya
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage(currentPage + 1)}
                >
                  Selanjutnya
                </Button>
              </div>
            </div>
          )}
        </CardBody>
      </Card>
    </div>
  )
}

export default AdminPengumumanList 