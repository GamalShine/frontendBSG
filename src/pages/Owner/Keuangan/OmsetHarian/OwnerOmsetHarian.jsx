import React, { useState, useEffect } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { 
  Calendar,
  DollarSign,
  TrendingUp,
  TrendingDown,
  BarChart3,
  Download,
  Plus,
  Search,
  Filter,
  RefreshCw
} from 'lucide-react'
import { toast } from 'react-hot-toast'

const OmsetHarian = () => {
  const { user } = useAuth()
  const [omsetData, setOmsetData] = useState([])
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])
  const [filterType, setFilterType] = useState('all')
  const [showAddModal, setShowAddModal] = useState(false)
  const [newOmset, setNewOmset] = useState({
    tanggal: new Date().toISOString().split('T')[0],
    omset: '',
    keterangan: '',
    kategori: 'penjualan'
  })

  useEffect(() => {
    loadOmsetData()
  }, [])

  const loadOmsetData = async () => {
    try {
      setLoading(true)
      // TODO: Replace with actual API call
      // const response = await omsetService.getOmsetHarian()
      // setOmsetData(response.data)
      
      // Mock data for now
      const mockData = [
        {
          id: 1,
          tanggal: '2024-01-15',
          omset: 2500000,
          keterangan: 'Penjualan produk A',
          kategori: 'penjualan',
          created_by: 'John Doe'
        },
        {
          id: 2,
          tanggal: '2024-01-15',
          omset: 500000,
          keterangan: 'Jasa konsultasi',
          kategori: 'jasa',
          created_by: 'Jane Smith'
        },
        {
          id: 3,
          tanggal: '2024-01-14',
          omset: 1800000,
          keterangan: 'Penjualan produk B',
          kategori: 'penjualan',
          created_by: 'Mike Johnson'
        }
      ]
      setOmsetData(mockData)
    } catch (error) {
      toast.error('Gagal memuat data omset')
      console.error('Error loading omset data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAddOmset = async () => {
    try {
      if (!newOmset.omset || !newOmset.keterangan) {
        toast.error('Mohon lengkapi data omset')
        return
      }

      // TODO: Replace with actual API call
      // const response = await omsetService.createOmset(newOmset)
      
      // Mock success
      const newData = {
        id: Date.now(),
        ...newOmset,
        omset: parseFloat(newOmset.omset),
        created_by: user.nama
      }
      
      setOmsetData(prev => [newData, ...prev])
      setShowAddModal(false)
      setNewOmset({
        tanggal: new Date().toISOString().split('T')[0],
        omset: '',
        keterangan: '',
        kategori: 'penjualan'
      })
      toast.success('Data omset berhasil ditambahkan')
    } catch (error) {
      toast.error('Gagal menambahkan data omset')
      console.error('Error adding omset:', error)
    }
  }

  const handleExport = () => {
    // TODO: Implement export functionality
    toast.success('Data berhasil diekspor')
  }

  const filteredData = omsetData.filter(item => {
    const matchesSearch = item.keterangan.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.created_by.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesDate = !selectedDate || item.tanggal === selectedDate
    const matchesFilter = filterType === 'all' || item.kategori === filterType
    
    return matchesSearch && matchesDate && matchesFilter
  })

  const totalOmset = filteredData.reduce((sum, item) => sum + item.omset, 0)
  const averageOmset = filteredData.length > 0 ? totalOmset / filteredData.length : 0

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR'
    }).format(amount)
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">OMSET HARIAN</h1>
        <p className="text-gray-600">Kelola dan monitor omset harian perusahaan</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <DollarSign className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Omset</p>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(totalOmset)}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <BarChart3 className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Rata-rata Omset</p>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(averageOmset)}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <TrendingUp className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Jumlah Transaksi</p>
              <p className="text-2xl font-bold text-gray-900">{filteredData.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="bg-white p-6 rounded-lg shadow-sm border mb-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Cari omset..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex gap-2">
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">Semua Kategori</option>
                <option value="penjualan">Penjualan</option>
                <option value="jasa">Jasa</option>
                <option value="lainnya">Lainnya</option>
              </select>
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={loadOmsetData}
              disabled={loading}
              className="flex items-center px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 disabled:opacity-50"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
            
            <button
              onClick={handleExport}
              className="flex items-center px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
            >
              <Download className="h-4 w-4 mr-2" />
              Export
            </button>
            
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
            >
              <Plus className="h-4 w-4 mr-2" />
              Tambah Omset
            </button>
          </div>
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tanggal
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Omset
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Keterangan
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Kategori
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Dibuat Oleh
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan="6" className="px-6 py-4 text-center">
                    <div className="flex justify-center items-center">
                      <RefreshCw className="h-6 w-6 animate-spin text-blue-500" />
                      <span className="ml-2">Memuat data...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredData.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-4 text-center text-gray-500">
                    Tidak ada data omset
                  </td>
                </tr>
              ) : (
                filteredData.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatDate(item.tanggal)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-green-600">
                      {formatCurrency(item.omset)}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {item.keterangan}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        item.kategori === 'penjualan' ? 'bg-green-100 text-green-800' :
                        item.kategori === 'jasa' ? 'bg-blue-100 text-blue-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {item.kategori}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {item.created_by}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button className="text-blue-600 hover:text-blue-900 mr-3">
                        Edit
                      </button>
                      <button className="text-red-600 hover:text-red-900">
                        Hapus
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-lg font-semibold mb-4">Tambah Data Omset</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tanggal
                </label>
                <input
                  type="date"
                  value={newOmset.tanggal}
                  onChange={(e) => setNewOmset(prev => ({ ...prev, tanggal: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Omset (Rp)
                </label>
                <input
                  type="number"
                  placeholder="Masukkan jumlah omset"
                  value={newOmset.omset}
                  onChange={(e) => setNewOmset(prev => ({ ...prev, omset: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Keterangan
                </label>
                <textarea
                  placeholder="Masukkan keterangan omset"
                  value={newOmset.keterangan}
                  onChange={(e) => setNewOmset(prev => ({ ...prev, keterangan: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows="3"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Kategori
                </label>
                <select
                  value={newOmset.kategori}
                  onChange={(e) => setNewOmset(prev => ({ ...prev, kategori: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="penjualan">Penjualan</option>
                  <option value="jasa">Jasa</option>
                  <option value="lainnya">Lainnya</option>
                </select>
              </div>
            </div>
            
            <div className="flex justify-end gap-2 mt-6">
              <button
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Batal
              </button>
              <button
                onClick={handleAddOmset}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
              >
                Simpan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default OmsetHarian 