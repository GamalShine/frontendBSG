import React, { useState, useEffect, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { Dialog, DialogContent } from '@/components/UI/Dialog'
import AdminTimMerahBiruForm from './AdminTimMerahBiruForm'
import { timService } from '../../../../services/timService'
import { 
  Search, 
  Plus, 
  Edit, 
  Trash2,
  AlertTriangle,
  User,
  Building,
  Award,
  RefreshCw
} from 'lucide-react'
import toast from 'react-hot-toast'
import { MENU_CODES } from '@/config/menuCodes'

const AdminTimMerahBiru = () => {
  const [timMerah, setTimMerah] = useState([])
  const [timBiru, setTimBiru] = useState([])
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState('merah')
  const [searchTerm, setSearchTerm] = useState('')
  const [divisiFilter, setDivisiFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalItems, setTotalItems] = useState(0)
  // Pencarian selalu tampil; state toggle dihapus
  const [showForm, setShowForm] = useState(false)
  // Edit modal state
  const [showEditForm, setShowEditForm] = useState(false)
  const [editInitial, setEditInitial] = useState(null)
  const [editId, setEditId] = useState(null)
  const [editLoading, setEditLoading] = useState(false)

  useEffect(() => {
    if (activeTab === 'merah') {
      loadTimMerah()
    } else {
      loadTimBiru()
    }
  }, [activeTab, currentPage, divisiFilter, statusFilter, searchTerm])

  const loadTimMerah = async () => {
    try {
      setLoading(true)
      const params = {
        page: currentPage,
        limit: 10,
        search: searchTerm,
        divisi: divisiFilter !== 'all' ? divisiFilter : undefined,
        status: statusFilter !== 'all' ? statusFilter : undefined
      }

      const response = await timService.getTimMerah(params)
      if (response.success) {
        setTimMerah(response.data)
        setTotalPages(response.pagination?.totalPages || 1)
        setTotalItems(response.pagination?.totalItems || 0)
      }
    } catch (error) {
      toast.error('Gagal memuat daftar tim merah')
      console.error('Error loading tim merah:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadTimBiru = async () => {
    try {
      setLoading(true)
      const params = {
        page: currentPage,
        limit: 10,
        search: searchTerm,
        divisi: divisiFilter !== 'all' ? divisiFilter : undefined
      }

      const response = await timService.getTimBiru(params)
      if (response.success) {
        setTimBiru(response.data)
        setTotalPages(response.pagination?.totalPages || 1)
        setTotalItems(response.pagination?.totalItems || 0)
      }
    } catch (error) {
      toast.error('Gagal memuat daftar tim biru')
      console.error('Error loading tim biru:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = () => {
    setCurrentPage(1)
    if (activeTab === 'merah') {
      loadTimMerah()
    } else {
      loadTimBiru()
    }
  }

  const handleDeleteMerah = async (id) => {
    if (!window.confirm('Apakah Anda yakin ingin menghapus data ini?')) {
      return
    }

    try {
      const response = await timService.deleteTimMerah(id)
      if (response.success) {
        toast.success('Data berhasil dihapus')
        loadTimMerah()
      }
    } catch (error) {
      toast.error('Gagal menghapus data')
      console.error('Error deleting tim merah:', error)
    }
  }

  const handleDeleteBiru = async (id) => {
    if (!window.confirm('Apakah Anda yakin ingin menghapus data ini?')) {
      return
    }

    try {
      const response = await timService.deleteTimBiru(id)
      if (response.success) {
        toast.success('Data berhasil dihapus')
        loadTimBiru()
      }
    } catch (error) {
      toast.error('Gagal menghapus data')
      console.error('Error deleting tim biru:', error)
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

  const currentData = activeTab === 'merah' ? timMerah : timBiru

  const resetFilters = () => {
    setSearchTerm('')
    setDivisiFilter('all')
    setStatusFilter('all')
    setActiveTab('merah')
    setCurrentPage(1)
  }

  const handleRefresh = () => {
    if (activeTab === 'merah') {
      loadTimMerah()
    } else {
      loadTimBiru()
    }
  }

  // Open edit modal and fetch detail
  const openEdit = async (id) => {
    try {
      setEditLoading(true)
      setEditId(id)
      const resp = activeTab === 'merah' ? await timService.getTimMerahById(id) : await timService.getTimBiruById(id)
      if (resp?.success) {
        const data = resp.data
        setEditInitial({
          user_id: data.user_id,
          status: data.status,
          prestasi: data.prestasi,
          keterangan: data.keterangan || ''
        })
        setShowEditForm(true)
      } else {
        toast.error('Gagal memuat data untuk edit')
      }
    } catch (e) {
      console.error('Open edit error:', e)
      toast.error('Gagal memuat data untuk edit')
    } finally {
      setEditLoading(false)
    }
  }

  // Tanggal + jam untuk banner "Terakhir diupdate"
  const formatDateTime = (dateString) => {
    if (!dateString) return '-'
    const date = new Date(dateString)
    return date.toLocaleString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  // Ambil waktu update terakhir dari item terbaru pada tab aktif
  const lastUpdatedText = useMemo(() => {
    const data = activeTab === 'merah' ? timMerah : timBiru
    if (!data || data.length === 0) return '-'
    const latest = data[0]
    const dt = latest?.updated_at || latest?.created_at
    return formatDateTime(dt)
  }, [activeTab, timMerah, timBiru])

  return (
    <div className="min-h-screen">
      {/* Header - mengikuti gaya Omset Harian */}
      <div className="bg-red-800 text-white px-4 sm:px-6 py-5">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div className="flex items-center gap-4 min-w-0">
            <span className="text-sm font-semibold bg-white/10 rounded px-2 py-1">{MENU_CODES.sdm.timMerahBiru}</span>
            <div>
              <h1 className="text-xl md:text-2xl font-extrabold tracking-tight">TIM MERAH BIRU</h1>
            </div>
          </div>
          <div className="flex items-center gap-2 mt-2 md:mt-0 flex-wrap w-full md:w-auto justify-start md:justify-end"></div>
        </div>
      </div>

      {/* Info bar */}
      <div className="bg-gray-200 px-4 sm:px-6 py-2 text-sm text-gray-900">Terakhir diupdate: {lastUpdatedText}</div>

      {/* Pencarian & Filter (selalu tampil) - gaya mengikuti Training */}
      <div className="p-0">
        <div className="bg-white rounded-none md:rounded-xl shadow-sm border border-gray-100 my-4">
          <div className="px-6 py-4">
            <div className={`grid grid-cols-1 ${activeTab === 'merah' ? 'md:grid-cols-4' : 'md:grid-cols-3'} gap-4`}>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Cari</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Cari nama karyawan..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                    className="pl-10 pr-3 py-2 w-full border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  />
                </div>
              </div>
              {activeTab === 'merah' && (
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Status</label>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="px-3 py-2 w-full border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  >
                    <option value="all">Semua Status</option>
                    <option value="SP1">SP1</option>
                    <option value="SP2">SP2</option>
                    <option value="SP3">SP3</option>
                  </select>
                </div>
              )}
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Divisi</label>
                <select
                  value={divisiFilter}
                  onChange={(e) => setDivisiFilter(e.target.value)}
                  className="px-3 py-2 w-full border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-red-500 focus:border-transparent"
                >
                  <option value="all">Semua Divisi</option>
                  <option value="BSG PUSAT">BSG PUSAT</option>
                  <option value="BSG BSD">BSG BSD</option>
                  <option value="SOGIL">SOGIL</option>
                  <option value="BSG SIDOARJO">BSG SIDOARJO</option>
                  <option value="BSG BUAH BATU">BSG BUAH BATU</option>
                  <option value="BSG KARAWACI">BSG KARAWACI</option>
                </select>
              </div>
              <div className="flex items-end h-full">
                <button
                  onClick={() => {
                    setSearchTerm('')
                    setDivisiFilter('all')
                    setStatusFilter('all')
                    setActiveTab('merah')
                    setCurrentPage(1)
                    loadTimMerah()
                  }}
                  className="inline-flex items-center gap-2 px-5 py-2 rounded-full border border-red-600 text-red-700 hover:bg-red-50 transition-colors w-full md:w-auto"
                >
                  <RefreshCw className="h-4 w-4" />
                  <span className="font-semibold">Reset</span>
                </button>
              </div>
            </div>
          </div>
        </div>

      {/* Tabs */}
      <div className="mb-0">
        <div className="bg-red-800 text-white">
          <div className="flex items-center justify-between px-4 py-3">
            <nav className="flex space-x-2 overflow-x-auto whitespace-nowrap scrollbar-hide">
              <button
                onClick={() => setActiveTab('merah')}
                className={`py-2 px-4 font-semibold text-base rounded-md transition-colors ${
                  activeTab === 'merah'
                    ? 'bg-white/20 text-white'
                  : 'text-white/80 hover:text-white hover:bg-white/10'
                }`}
              >
                TIM MERAH
              </button>
              <button
                onClick={() => setActiveTab('biru')}
                className={`py-2 px-4 font-semibold text-base rounded-md transition-colors ${
                  activeTab === 'biru'
                    ? 'bg-white/20 text-white'
                  : 'text-white/80 hover:text-white hover:bg-white/10'
                }`}
              >
                TIM BIRU
              </button>
            </nav>
            <button
              type="button"
              onClick={() => setShowForm(true)}
              aria-label="Tambah Data Tim"
              className={`ml-4 inline-flex items-center gap-2 px-3 py-2 sm:px-4 sm:py-2 rounded-lg transition-colors shadow-sm bg-white ${activeTab === 'merah' ? 'text-red-700 hover:bg-red-50' : 'text-blue-700 hover:bg-blue-50'}`}
            >
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline font-semibold">Tambah</span>
            </button>
          </div>
        </div>
      </div>

      {/* Filters lama dihapus karena sudah dipindahkan dan selalu ditampilkan */}

      {/* Actions box dihapus sesuai permintaan; tombol Tambah dipindah ke header Tabs */}

      {/* Table */}
      <div className="bg-white rounded-b-lg shadow table-responsive">
        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Memuat data...</p>
          </div>
        ) : currentData.length === 0 ? (
          <div className="p-8 text-center">
            <AlertTriangle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Tidak ada data</h3>
            <p className="text-gray-500">Belum ada data tim {activeTab} yang tersedia</p>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="sticky top-0 bg-gray-200 z-10">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-black uppercase tracking-wider">
                    Karyawan
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-black uppercase tracking-wider">
                    Divisi
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-black uppercase tracking-wider">
                    Posisi
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-black uppercase tracking-wider">
                    {activeTab === 'merah' ? 'Status' : 'Prestasi'}
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-black uppercase tracking-wider">
                    Keterangan
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-black uppercase tracking-wider">
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {currentData.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="px-4 sm:px-6 py-4 whitespace-normal md:whitespace-nowrap">
                      <div className="flex items-center">
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                          activeTab === 'merah' ? 'bg-red-100' : 'bg-blue-100'
                        }`}>
                          <User className={`h-6 w-6 ${
                            activeTab === 'merah' ? 'text-red-600' : 'text-blue-600'
                          }`} />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{item.nama}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Building className="h-4 w-4 text-gray-400 mr-2" />
                        <span className="text-sm text-gray-900">{item.divisi}</span>
                      </div>
                    </td>
                    <td className="px-4 sm:px-6 py-4 whitespace-normal md:whitespace-nowrap text-sm text-gray-900 break-anywhere">
                      {item.posisi}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {activeTab === 'merah' ? (
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(item.status)}`}>
                          {getStatusText(item.status)}
                        </span>
                      ) : (
                        <div className="flex items-center">
                          <Award className="h-4 w-4 text-yellow-500 mr-2" />
                          <span className="text-sm text-gray-900">{item.prestasi}</span>
                        </div>
                      )}
                    </td>
                    <td className="px-4 sm:px-6 py-4">
                      <div className="text-sm text-gray-900 max-w-[12rem] md:max-w-xs break-anywhere md:truncate">
                        {item.keterangan || '-'}
                      </div>
                    </td>
                    <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        <button
                          type="button"
                          onClick={() => openEdit(item.id)}
                          className="text-blue-600 hover:text-blue-900"
                          title="Edit"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => activeTab === 'merah' ? handleDeleteMerah(item.id) : handleDeleteBiru(item.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
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
          <div className="px-6 py-4 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-700">
                Menampilkan {((currentPage - 1) * 10) + 1} - {Math.min(currentPage * 10, totalItems)} dari {totalItems} data
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1 border border-gray-300 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  Sebelumnya
                </button>
                <span className="px-3 py-1 text-sm text-gray-700">
                  Halaman {currentPage} dari {totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1 border border-gray-300 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  Selanjutnya
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modal Tambah Tim Merah/Biru */}
      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-w-2xl w-full p-0 overflow-hidden rounded-2xl border border-gray-200">
          {/* Header Modal */}
          <div className="flex items-center justify-between px-6 py-3 border-b border-red-700 bg-red-800 text-white sticky top-0 z-10">
            <div>
              <h3 className="text-xl font-bold leading-tight">Tambah Tim {activeTab === 'merah' ? 'Merah' : 'Biru'}</h3>
            </div>
            <button
              onClick={() => setShowForm(false)}
              className="p-2 text-white/90 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
              aria-label="Tutup"
            >
              ✕
            </button>
          </div>

          {/* Body Modal */}
          <div className="flex-1 min-h-0 overflow-y-auto px-6 py-5 scrollbar-hide">
            <AdminTimMerahBiruForm
              typeOverride={activeTab}
              formId="timMBForm"
              hideHeader
              hideActions
              onSuccess={() => {
                setShowForm(false)
                if (activeTab === 'merah') {
                  loadTimMerah()
                } else {
                  loadTimBiru()
                }
              }}
              onCancel={() => setShowForm(false)}
            />
          </div>

          {/* Footer Modal */}
          <div className="p-0 border-t bg-white">
            <div className="grid grid-cols-2 gap-2 px-2 py-2">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="w-full py-2 bg-red-700 text-white font-semibold hover:bg-red-800 transition-colors rounded-lg"
              >
                Batal
              </button>
              <button
                type="submit"
                form="timMBForm"
                className="w-full py-2 bg-red-700 text-white font-semibold hover:bg-red-800 transition-colors rounded-lg"
              >
                Simpan
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal Edit Tim Merah/Biru */}
      <Dialog open={showEditForm} onOpenChange={setShowEditForm}>
        <DialogContent className="max-w-2xl w-full p-0 overflow-hidden rounded-2xl border border-gray-200">
          {/* Header Modal */}
          <div className="flex items-center justify-between px-6 py-3 border-b border-red-700 bg-red-800 text-white sticky top-0 z-10">
            <div>
              <h3 className="text-xl font-bold leading-tight">Edit Tim {activeTab === 'merah' ? 'Merah' : 'Biru'}</h3>
            </div>
            <button
              onClick={() => setShowEditForm(false)}
              className="p-2 text-white/90 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
              aria-label="Tutup"
            >
              ✕
            </button>
          </div>

          {/* Body Modal */}
          <div className="flex-1 min-h-0 overflow-y-auto px-6 py-5 scrollbar-hide">
            {editLoading ? (
              <div className="text-gray-600">Memuat data...</div>
            ) : (
              <AdminTimMerahBiruForm
                typeOverride={activeTab}
                formId="timMBEditForm"
                hideHeader
                hideActions
                editingId={editId}
                initialData={editInitial}
                onSuccess={() => {
                  setShowEditForm(false)
                  if (activeTab === 'merah') {
                    loadTimMerah()
                  } else {
                    loadTimBiru()
                  }
                }}
                onCancel={() => setShowEditForm(false)}
              />
            )}
          </div>

          {/* Footer Modal */}
          <div className="p-0 border-t bg-white">
            <div className="grid grid-cols-2 gap-2 px-2 py-2">
              <button
                type="button"
                onClick={() => setShowEditForm(false)}
                className="w-full py-2 bg-red-700 text-white font-semibold hover:bg-red-800 transition-colors rounded-lg"
              >
                Batal
              </button>
              <button
                type="submit"
                form="timMBEditForm"
                className="w-full py-2 bg-red-700 text-white font-semibold hover:bg-red-800 transition-colors rounded-lg"
              >
                Simpan
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      {/* Close inner content wrapper */}
      </div>
    </div>
  )
}

export default AdminTimMerahBiru
