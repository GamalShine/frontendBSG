import React, { useEffect, useMemo, useState } from 'react'
import toast from 'react-hot-toast'
import saranService from '@/services/saranService'
import Card, { CardHeader, CardBody } from '@/components/UI/Card'
import Button from '@/components/UI/Button'
import Input from '@/components/UI/Input'
import Table, { TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/UI/Table'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogBody, DialogFooter } from '@/components/UI/Dialog'
import { Search, Filter, Plus, Edit, Trash2, Eye, Calendar, TrendingUp, DollarSign, RefreshCw, MoreVertical, Copy as CopyIcon, Share2 } from 'lucide-react'
import { MENU_CODES } from '@/config/menuCodes'

const AdminDaftarSaran = () => {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [showDetail, setShowDetail] = useState(false)
  const [current, setCurrent] = useState(null)
  const [formData, setFormData] = useState({ saran: '', deskripsi_saran: '' })
  const [submitting, setSubmitting] = useState(false)
  const [showFilters, setShowFilters] = useState(false)
  const [selectedItems, setSelectedItems] = useState([])
  const [showBulkMenu, setShowBulkMenu] = useState(false)

  const roleLabel = ''
  const useOwnerEndpoint = true // Admin melihat semua data

  const fetchData = async () => {
    try {
      setLoading(true)
      setError(null)
      const res = useOwnerEndpoint ? await saranService.getOwnerSaran() : await saranService.getSaran()
      const data = res?.data || []
      setItems(data)
      setSelectedItems([])
    } catch (err) {
      const message = err?.message || err?.error || 'Gagal memuat data saran'
      setError(message)
      toast.error(message)
    } finally {
      setLoading(false)
    }

  // Bulk helper seperti Omset
  const getSelectedEntries = () => {
    if (!Array.isArray(selectedItems) || selectedItems.length === 0) return []
    const byId = new Map((items || []).map(it => [it.id, it]))
    return selectedItems.map(id => byId.get(id)).filter(Boolean)
  }

  const handleBulkCopy = async () => {
    const entries = getSelectedEntries()
    if (entries.length === 0) return toast.error('Pilih minimal satu saran terlebih dahulu')
    const combined = entries.map(e => {
      const tgl = e.created_at ? new Date(e.created_at).toLocaleDateString('id-ID', { year:'numeric', month:'long', day:'numeric' }) : '-'
      return `${tgl}\n${e.nama || '-'} — ${e.saran || '-'}${e.deskripsi_saran ? `, ${e.deskripsi_saran}` : ''}`
    }).join('\n\n---\n\n')
    await navigator.clipboard.writeText(combined)
    toast.success(`Menyalin ${entries.length} saran`)
    setShowBulkMenu(false)
  }

  const handleBulkDownload = () => {
    const entries = getSelectedEntries()
    if (entries.length === 0) return toast.error('Pilih minimal satu saran terlebih dahulu')
    const combined = entries.map(e => {
      const tgl = e.created_at ? new Date(e.created_at).toLocaleDateString('id-ID', { year:'numeric', month:'long', day:'numeric' }) : '-'
      return `${tgl}\n${e.nama || '-'} — ${e.saran || '-'}${e.deskripsi_saran ? `, ${e.deskripsi_saran}` : ''}`
    }).join('\n\n---\n\n')
    const blob = new Blob([combined], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `admin_saran_selected_${entries.length}.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    setShowBulkMenu(false)
  }

  const handleBulkShare = async () => {
    const entries = getSelectedEntries()
    if (entries.length === 0) return toast.error('Pilih minimal satu saran terlebih dahulu')
    const combined = entries.map(e => {
      const tgl = e.created_at ? new Date(e.created_at).toLocaleDateString('id-ID', { year:'numeric', month:'long', day:'numeric' }) : '-'
      return `${tgl}\n${e.nama || '-'} — ${e.saran || '-'}${e.deskripsi_saran ? `, ${e.deskripsi_saran}` : ''}`
    }).join('\n\n---\n\n')
    if (navigator.share) {
      try { await navigator.share({ title: `Saran (${entries.length})`, text: combined }) } catch {}
    } else {
      await navigator.clipboard.writeText(combined)
      toast.success('Teks disalin untuk dibagikan')
    }
    setShowBulkMenu(false)
  }
  }

  // Selection handlers (paritas dengan Poskas)
  const handleCheckboxChange = (id) => {
    setSelectedItems((prev) => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])
  }

  const handleSelectAll = () => {
    if (!items?.length) return
    if (selectedItems.length === filteredItems.length) {
      setSelectedItems([])
    } else {
      setSelectedItems(filteredItems.map(it => it.id))
    }
  }

  const handleBulkDelete = async () => {
    if (selectedItems.length === 0) {
      toast.error('Pilih item yang akan dihapus')
      return
    }
    if (!window.confirm(`Apakah Anda yakin ingin menghapus ${selectedItems.length} saran terpilih?`)) return
    try {
      await Promise.all(selectedItems.map(id => saranService.remove(id)))
      toast.success(`${selectedItems.length} saran berhasil dihapus`)
      setSelectedItems([])
      fetchData()
    } catch (err) {
      toast.error('Gagal menghapus beberapa saran')
    }
  }

  // Stats & Last Updated
  const stats = useMemo(() => {
    const now = new Date()
    const thisMonth = now.getMonth()
    const thisYear = now.getFullYear()
    const dataArr = Array.isArray(items) ? items : []
    const thisMonthItems = dataArr.filter((it) => {
      const d = it?.created_at ? new Date(it.created_at) : null
      return d && d.getMonth() === thisMonth && d.getFullYear() === thisYear
    })
    const thisYearItems = dataArr.filter((it) => {
      const d = it?.created_at ? new Date(it.created_at) : null
      return d && d.getFullYear() === thisYear
    })
    return {
      total: dataArr.length,
      totalThisMonth: thisMonthItems.length,
      totalThisYear: thisYearItems.length,
    }
  }, [items])

  const lastUpdatedText = useMemo(() => {
    if (!items || items.length === 0) return '-'
    const sorted = [...items].sort((a, b) => {
      const aCreated = a?.created_at ? new Date(a.created_at).getTime() : 0
      const bCreated = b?.created_at ? new Date(b.created_at).getTime() : 0
      return bCreated - aCreated
    })
    const dt = sorted[0]?.created_at
    return dt ? new Date(dt).toLocaleString('id-ID', {
      year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
    }) : '-'
  }, [items])

  useEffect(() => {
    fetchData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Debounce searchTerm -> debouncedSearch
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(searchTerm), 300)
    return () => clearTimeout(t)
  }, [searchTerm])

  const filteredItems = useMemo(() => {
    const term = (debouncedSearch || '').toLowerCase()
    let data = Array.isArray(items) ? items : []
    if (term) {
      data = data.filter((it) => (
        it?.saran?.toLowerCase().includes(term) ||
        it?.deskripsi_saran?.toLowerCase().includes(term) ||
        it?.nama?.toLowerCase().includes(term)
      ))
    }
    if (startDate) {
      const s = new Date(startDate).setHours(0,0,0,0)
      data = data.filter((it) => {
        const t = it?.created_at ? new Date(it.created_at).setHours(0,0,0,0) : null
        return t !== null && t >= s
      })
    }
    if (endDate) {
      const e = new Date(endDate).setHours(23,59,59,999)
      data = data.filter((it) => {
        const t = it?.created_at ? new Date(it.created_at).getTime() : null
        return t !== null && t <= e
      })
    }
    return data
  }, [items, debouncedSearch, startDate, endDate])

  

  const openCreate = () => {
    setCurrent(null)
    setFormData({ saran: '', deskripsi_saran: '' })
    setShowForm(true)
  }

  const openEdit = (item) => {
    setCurrent(item)
    setFormData({ saran: item.saran || '', deskripsi_saran: item.deskripsi_saran || '' })
    setShowForm(true)
  }

  const openDetail = (item) => {
    setCurrent(item)
    setShowDetail(true)
  }

  const handleDelete = async (item) => {
    if (!window.confirm('Hapus saran ini?')) return
    try {
      await saranService.remove(item.id)
      toast.success('Saran berhasil dihapus')
      fetchData()
    } catch (err) {
      toast.error(err?.message || 'Gagal menghapus saran')
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!formData.saran?.trim()) {
      toast.error('Saran harus diisi')
      return
    }
    try {
      setSubmitting(true)
      if (current?.id) {
        await saranService.update(current.id, formData)
        toast.success('Saran berhasil diupdate')
      } else {
        await saranService.create(formData)
        toast.success('Saran berhasil dibuat')
      }
      setShowForm(false)
      fetchData()
    } catch (err) {
      toast.error(err?.message || 'Gagal menyimpan saran')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-lg">Memuat saran...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center text-red-600">
          <p className="text-lg">Error: {String(error)}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-0 bg-gray-50 min-h-screen">
      {/* Header - Poskas style */}
      <div className="bg-red-800 text-white px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span className="text-sm font-semibold bg-white/10 rounded px-2 py-1">{MENU_CODES.operasional.daftarSaran}</span>
            <div>
              <h1 className="text-xl md:text-2xl font-extrabold tracking-tight">DAFTAR SARAN</h1>
              <p className="text-sm text-red-100">Kelola saran dari outlet/pegawai</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowFilters(v => !v)}
              className="px-4 py-2 rounded-full border border-white/60 text-white bg-transparent"
            >
              PENCARIAN
            </button>
            <button
              onClick={() => { fetchData() }}
              className="px-4 py-2 rounded-full border border-white/60 text-white bg-transparent inline-flex items-center gap-2"
              title="Refresh"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
            <Button className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-white/60 text-white bg-transparent" onClick={openCreate}>
              <Plus className="w-4 h-4" />
              <span className="font-semibold">Tambah</span>
            </Button>
          </div>
        </div>
      </div>
      <div className="bg-gray-200 px-6 py-2 text-sm text-gray-900">Terakhir diupdate: {lastUpdatedText}</div>

      {/* Stats Cards */}
      <div className="px-6 py-4 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-lg bg-blue-50 flex items-center justify-center">
              <DollarSign className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-xs font-medium text-gray-500">Total Saran</p>
              <p className="text-xl font-bold text-gray-900">{stats.total}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-lg bg-green-50 flex items-center justify-center">
              <TrendingUp className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-xs font-medium text-gray-500">Bulan Ini</p>
              <p className="text-xl font-bold text-gray-900">{stats.totalThisMonth}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-lg bg-purple-50 flex items-center justify-center">
              <Calendar className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <p className="text-xs font-medium text-gray-500">Tahun Ini</p>
              <p className="text-xl font-bold text-gray-900">{stats.totalThisYear}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      {showFilters && (
      <div className="bg-white rounded-none md:rounded-xl shadow-sm border border-gray-100 my-4">
        <div className="px-6 py-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Cari</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Cari saran / deskripsi / nama..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') e.currentTarget.blur() }}
                  className="pl-10 pr-3 py-2 w-full border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-red-500 focus:border-transparent"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Tanggal Awal</label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="pl-10 pr-3 py-2 w-full border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-red-500 focus:border-transparent"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Tanggal Akhir</label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="pl-10 pr-3 py-2 w-full border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-red-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
      )}

      {/* Table - Omset style */}
      <Card>
        <CardHeader className="px-6 py-3 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold text-gray-900">Daftar Saran</h2>
            <div className="flex items-center gap-3">
              {selectedItems.length > 0 && (
                <>
                  <span className="text-sm text-gray-600 hidden sm:inline">{selectedItems.length} item dipilih</span>
                  <Button onClick={handleBulkDelete} className="bg-red-600 hover:bg-red-700 text-white">
                    <Trash2 className="w-4 h-4 mr-2" /> Hapus ({selectedItems.length})
                  </Button>
                </>
              )}
              <div className="relative">
                <button
                  onClick={() => setShowBulkMenu(v => !v)}
                  aria-label="Aksi massal"
                  className="inline-flex items-center justify-center h-9 w-9 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50"
                >
                  <MoreVertical className="h-4 w-4" />
                </button>
                {showBulkMenu && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-100 z-20">
                    <div className="py-1">
                      <button onClick={handleBulkCopy} className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50">Copy (ceklist)</button>
                      <button onClick={handleBulkDownload} className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50">Download (ceklist)</button>
                      <button onClick={handleBulkShare} className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50">Share (ceklist)</button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </CardHeader>
        <CardBody className="p-0">
          <div className="relative overflow-x-auto max-h-[60vh] overflow-y-auto">
            <Table>
              <TableHeader className="sticky top-0 bg-red-700 z-10">
                <TableRow>
                  <TableHead className="pl-6 pr-0 py-3 text-left text-xs font-extrabold text-white uppercase tracking-wider">
                    <input
                      type="checkbox"
                      onChange={handleSelectAll}
                      checked={filteredItems.length > 0 && selectedItems.length === filteredItems.length}
                      className="rounded border-white text-white focus:ring-white"
                    />
                  </TableHead>
                  <TableHead className="pl-0 pr-12 py-3 text-left text-sm md:text-base font-extrabold text-white uppercase tracking-wider">No</TableHead>
                  <TableHead className="px-12 py-3 text-left text-sm md:text-base font-extrabold text-white uppercase tracking-wider">Tanggal</TableHead>
                  <TableHead className="px-12 py-3 text-left text-sm md:text-base font-extrabold text-white uppercase tracking-wider">Saran</TableHead>
                  <TableHead className="px-12 py-3 text-left text-sm md:text-base font-extrabold text-white uppercase tracking-wider">Deskripsi</TableHead>
                  <TableHead className="px-12 py-3 text-left text-sm md:text-base font-extrabold text-white uppercase tracking-wider">Nama</TableHead>
                  <TableHead className="px-12 py-3 text-left text-sm md:text-base font-extrabold text-white uppercase tracking-wider">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredItems.map((item, idx) => (
                  <TableRow key={item.id} className="hover:bg-gray-50/80">
                    <TableCell className="pl-6 pr-0 py-4 whitespace-nowrap text-sm text-gray-900">
                      <input
                        type="checkbox"
                        checked={selectedItems.includes(item.id)}
                        onChange={() => handleCheckboxChange(item.id)}
                        className="rounded border-gray-300 text-red-600 focus:ring-red-500"
                      />
                    </TableCell>
                    <TableCell className="pl-0 pr-12 py-4 whitespace-nowrap text-sm text-gray-900">{idx + 1}</TableCell>
                    <TableCell className="px-12 py-4 whitespace-nowrap text-sm text-gray-900">
                      {item.created_at ? new Date(item.created_at).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' }).toUpperCase() : '-'}
                    </TableCell>
                    <TableCell className="px-12 py-4 text-sm text-gray-900">
                      <div className="md:truncate max-w-[14rem] md:max-w-md" title={item.saran || '-'}>
                        {item.saran || '-'}
                      </div>
                    </TableCell>
                    <TableCell className="px-12 py-4 text-sm text-gray-900">
                      <div className="md:truncate max-w-[14rem] md:max-w-md" title={item.deskripsi_saran || '-'}>
                        {item.deskripsi_saran || '-'}
                      </div>
                    </TableCell>
                    <TableCell className="px-12 py-4 whitespace-nowrap text-sm text-gray-900">{item.nama || '-'}</TableCell>
                    <TableCell className="px-12 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div className="flex items-center gap-3">
                        <button onClick={() => openDetail(item)} className="text-blue-600 hover:text-blue-900" title="Lihat">
                          <Eye className="h-4 w-4" />
                        </button>
                        <button onClick={() => openEdit(item)} className="text-green-600 hover:text-green-900" title="Edit">
                          <Edit className="h-4 w-4" />
                        </button>
                        <button onClick={() => handleDelete(item)} className="text-red-600 hover:text-red-900" title="Hapus">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {filteredItems.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-gray-500 py-6">
                      Tidak ada data
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardBody>
      </Card>

      {/* Dialog Form Create/Edit */}
      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>{current ? 'Edit Saran' : 'Tambah Saran'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <DialogBody>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Saran<span className="text-red-500">*</span></label>
                  <Input
                    value={formData.saran}
                    onChange={(e) => setFormData((p) => ({ ...p, saran: e.target.value }))}
                    placeholder="Tulis saran singkat"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Deskripsi</label>
                  <textarea
                    value={formData.deskripsi_saran}
                    onChange={(e) => setFormData((p) => ({ ...p, deskripsi_saran: e.target.value }))}
                    placeholder="Detail saran (opsional)"
                    rows={4}
                    className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </DialogBody>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                Batal
              </Button>
              <Button type="submit" disabled={submitting}>
                {submitting ? 'Menyimpan...' : 'Simpan'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Dialog Detail */}
      <Dialog open={showDetail} onOpenChange={setShowDetail}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>Detail Saran</DialogTitle>
          </DialogHeader>
          {current && (
            <>
              <DialogBody>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-gray-500">Nama</p>
                    <p className="font-medium">{current.nama}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Saran</p>
                    <p className="font-medium">{current.saran}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Deskripsi</p>
                    <p>{current.deskripsi_saran || '-'}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500">Dibuat</p>
                      <p>{current.created_at ? new Date(current.created_at).toLocaleString('id-ID') : '-'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Diupdate</p>
                      <p>{current.updated_at ? new Date(current.updated_at).toLocaleString('id-ID') : '-'}</p>
                    </div>
                  </div>
                </div>
              </DialogBody>
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowDetail(false)}>Tutup</Button>
                <Button onClick={() => { setShowDetail(false); openEdit(current) }}>
                  <Edit className="w-4 h-4 mr-2" />
                  Edit
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default AdminDaftarSaran
