import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../../contexts/AuthContext'
import { timService } from '../../../services/timService'
import { 
  Search, 
  Plus, 
  Eye, 
  Edit, 
  Users,
  UserPlus,
  UserMinus,
  Filter,
  Download,
  BarChart3,
  RefreshCw,
  Crown,
  Shield
} from 'lucide-react'
import Card, { CardHeader, CardBody } from '../../../components/UI/Card'
import Button from '../../../components/UI/Button'
import Input from '../../../components/UI/Input'
import Select from '../../../components/UI/Select'
import Badge from '../../../components/UI/Badge'
import toast from 'react-hot-toast'

const OwnerTimList = () => {
  const { user } = useAuth()
  const [timMerah, setTimMerah] = useState([])
  const [timBiru, setTimBiru] = useState([])
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [teamFilter, setTeamFilter] = useState('')
  const [roleFilter, setRoleFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [stats, setStats] = useState({
    totalMerah: 0,
    totalBiru: 0,
    totalMembers: 0,
    activeMembers: 0
  })

  useEffect(() => {
    loadTeams()
    loadStats()
  }, [currentPage, teamFilter, roleFilter, statusFilter])

  const loadTeams = async () => {
    try {
      setLoading(true)
      const params = {
        page: currentPage,
        limit: 15,
        search: searchTerm,
        team: teamFilter,
        role: roleFilter,
        status: statusFilter
      }
      
      const response = await timService.getOwnerTeams(params)
      
      if (response.success) {
        setTimMerah(response.data.timMerah || [])
        setTimBiru(response.data.timBiru || [])
        setTotalPages(response.data.totalPages || 1)
      }
    } catch (error) {
      toast.error('Gagal memuat daftar tim')
      console.error('Error loading teams:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadStats = async () => {
    try {
      const response = await timService.getOwnerStats()
      if (response.success) {
        setStats(response.data)
      }
    } catch (error) {
      console.error('Error loading stats:', error)
    }
  }

  const handleSearch = () => {
    setCurrentPage(1)
    loadTeams()
  }

  const handleReset = () => {
    setSearchTerm('')
    setTeamFilter('')
    setRoleFilter('')
    setStatusFilter('')
    setCurrentPage(1)
    loadTeams()
  }

  const getRoleBadge = (role) => {
    const variants = {
      owner: 'danger',
      admin: 'warning',
      leader: 'info',
      divisi: 'success'
    }
    return <Badge variant={variants[role] || 'default'}>{role}</Badge>
  }

  const getTeamBadge = (team) => {
    const variants = {
      merah: 'danger',
      biru: 'info'
    }
    return <Badge variant={variants[team] || 'default'}>{team}</Badge>
  }

  const getStatusBadge = (status) => {
    const variants = {
      active: 'success',
      inactive: 'danger',
      suspended: 'warning'
    }
    return <Badge variant={variants[status] || 'default'}>{status}</Badge>
  }

  const exportData = async () => {
    try {
      const response = await timService.exportOwnerTeams({
        team: teamFilter,
        role: roleFilter,
        status: statusFilter
      })
      
      if (response.success) {
        // Create download link
        const blob = new Blob([response.data], { type: 'text/csv' })
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `tim-owner-${new Date().toISOString().split('T')[0]}.csv`
        a.click()
        window.URL.revokeObjectURL(url)
        toast.success('Data berhasil diekspor')
      }
    } catch (error) {
      toast.error('Gagal mengekspor data')
      console.error('Error exporting data:', error)
    }
  }

  const allMembers = [...timMerah, ...timBiru]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Owner Tim Management</h1>
          <p className="text-gray-600">Kelola semua anggota tim perusahaan</p>
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
              <div className="p-2 bg-red-100 rounded-lg">
                <Users className="h-6 w-6 text-red-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Tim Merah</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalMerah}</p>
              </div>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardBody className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Tim Biru</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalBiru}</p>
              </div>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardBody className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <UserPlus className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Anggota</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalMembers}</p>
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
                <p className="text-sm font-medium text-gray-600">Aktif</p>
                <p className="text-2xl font-bold text-gray-900">{stats.activeMembers}</p>
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
                placeholder="Cari anggota tim..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Tim</label>
              <Select
                value={teamFilter}
                onChange={(e) => setTeamFilter(e.target.value)}
              >
                <option value="">Semua Tim</option>
                <option value="merah">Tim Merah</option>
                <option value="biru">Tim Biru</option>
              </Select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Role</label>
              <Select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
              >
                <option value="">Semua Role</option>
                <option value="owner">Owner</option>
                <option value="admin">Admin</option>
                <option value="leader">Leader</option>
                <option value="divisi">Divisi</option>
              </Select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
              <Select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="">Semua Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="suspended">Suspended</option>
              </Select>
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

      {/* Team Management Tabs */}
      <div className="space-y-6">
        {/* Tim Merah */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="w-4 h-4 bg-red-600 rounded-full"></div>
                <h3 className="text-lg font-semibold text-gray-900">Tim Merah</h3>
                <Badge variant="danger">{timMerah.length} anggota</Badge>
              </div>
              <Link to="/tim/merah/new">
                <Button size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Tambah Anggota
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardBody>
            {timMerah.length === 0 ? (
              <div className="text-center py-8">
                <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">Tidak ada anggota tim merah</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Nama
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Role
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Email
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Aksi
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {timMerah.map((member) => (
                      <tr key={member.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10">
                              <div className="h-10 w-10 rounded-full bg-red-100 flex items-center justify-center">
                                <span className="text-red-600 font-medium">
                                  {member.nama?.charAt(0).toUpperCase()}
                                </span>
                              </div>
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">
                                {member.nama}
                                {member.role === 'owner' && <Crown className="h-4 w-4 text-yellow-600 inline ml-1" />}
                                {member.role === 'admin' && <Shield className="h-4 w-4 text-blue-600 inline ml-1" />}
                              </div>
                              <div className="text-sm text-gray-500">{member.username}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {getRoleBadge(member.role)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {getStatusBadge(member.status)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {member.email}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex gap-2">
                            <Link to={`/users/${member.id}`}>
                              <Button size="sm" variant="outline">
                                <Eye className="h-4 w-4" />
                              </Button>
                            </Link>
                            <Link to={`/users/${member.id}/edit`}>
                              <Button size="sm" variant="outline">
                                <Edit className="h-4 w-4" />
                              </Button>
                            </Link>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardBody>
        </Card>

        {/* Tim Biru */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="w-4 h-4 bg-blue-600 rounded-full"></div>
                <h3 className="text-lg font-semibold text-gray-900">Tim Biru</h3>
                <Badge variant="info">{timBiru.length} anggota</Badge>
              </div>
              <Link to="/tim/biru/new">
                <Button size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Tambah Anggota
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardBody>
            {timBiru.length === 0 ? (
              <div className="text-center py-8">
                <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">Tidak ada anggota tim biru</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Nama
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Role
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Email
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Aksi
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {timBiru.map((member) => (
                      <tr key={member.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10">
                              <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                                <span className="text-blue-600 font-medium">
                                  {member.nama?.charAt(0).toUpperCase()}
                                </span>
                              </div>
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">
                                {member.nama}
                                {member.role === 'owner' && <Crown className="h-4 w-4 text-yellow-600 inline ml-1" />}
                                {member.role === 'admin' && <Shield className="h-4 w-4 text-blue-600 inline ml-1" />}
                              </div>
                              <div className="text-sm text-gray-500">{member.username}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {getRoleBadge(member.role)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {getStatusBadge(member.status)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {member.email}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex gap-2">
                            <Link to={`/users/${member.id}`}>
                              <Button size="sm" variant="outline">
                                <Eye className="h-4 w-4" />
                              </Button>
                            </Link>
                            <Link to={`/users/${member.id}/edit`}>
                              <Button size="sm" variant="outline">
                                <Edit className="h-4 w-4" />
                              </Button>
                            </Link>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardBody>
        </Card>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-between items-center">
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
    </div>
  )
}

export default OwnerTimList 