import React, { useEffect, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import LoadingSpinner from '@/components/UI/LoadingSpinner'
import { API_CONFIG } from '@/config/constants'
import { MENU_CODES } from '@/config/menuCodes'
import { ChevronDown, ChevronUp, Plus, Search } from 'lucide-react'

const currency = (n) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(n || 0)

const AdminDaftarGaji = () => {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [data, setData] = useState(null)
  const [expandedBranch, setExpandedBranch] = useState(null)
  const [selectedDept, setSelectedDept] = useState(null)
  const [loadingSummary, setLoadingSummary] = useState(false)
  const [hierarchy, setHierarchy] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [branchFilter, setBranchFilter] = useState('all')

  const buildMock = () => ({
    pic: 'Ka.Keuangan',
    lastUpdated: new Date().toISOString(),
    branches: [],
    payrollByDepartment: {}
  })

  const ENDPOINTS = {
    ADMIN_SDM_HIERARCHY: '/admin/sdm/hierarchy',
  }

  // Filter cabang berdasarkan pencarian dan pilihan cabang
  const branches = Array.isArray(data?.branches) ? data.branches : []
  const filteredBranches = branches.filter((b) => {
    const matchesBranch = branchFilter === 'all' || String(b.id) === String(branchFilter) || (b.name || '') === branchFilter
    const q = (searchTerm || '').toLowerCase()
    const matchesSearch = !q
      || (b.name || '').toLowerCase().includes(q)
      || (b.departments || []).some((d) => (d.name || '').toLowerCase().includes(q))
    return matchesBranch && matchesSearch
  })

  const safeFetch = async (endpoint, opts) => {
    const url = `${API_CONFIG.BASE_URL}${endpoint}`
    const res = await fetch(url, { ...opts, headers: { 'Content-Type': 'application/json', ...(opts?.headers || {}) } })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    return res.json()
  }

  const loadInitial = async () => {
    try {
      setLoading(true)
      setError(null)
      const token = localStorage.getItem('token') || localStorage.getItem('access_token')
      const headers = token ? { Authorization: `Bearer ${token}` } : {}
      const res = await safeFetch(ENDPOINTS.ADMIN_SDM_HIERARCHY, { headers }).catch(() => null)
      if (!res || !res.success || !Array.isArray(res.data)) {
        setData(buildMock())
        setHierarchy([])
        return
      }
      const divisions = res.data
      setHierarchy(divisions)
      // Ambil timestamp terbaru dari seluruh employees pada hierarchy
      const getLatestTs = (divisions) => {
        let latest = 0
        for (const div of divisions) {
          for (const jab of (div.children || [])) {
            for (const emp of (jab.children || [])) {
              const c1 = emp?.created_at ? new Date(emp.created_at).getTime() : 0
              const c2 = emp?.updated_at ? new Date(emp.updated_at).getTime() : 0
              const c3 = emp?.tanggal_bergabung ? new Date(emp.tanggal_bergabung).getTime() : 0
              const m = Math.max(c1, c2, c3)
              if (m > latest) latest = m
            }
          }
        }
        return latest || Date.now()
      }
      const latestTs = getLatestTs(divisions)

      setData({
        pic: 'Ka.Keuangan',
        lastUpdated: new Date(latestTs).toISOString(),
        branches: divisions.map(d => ({ id: String(d.id), name: d.name, departments: (d.children || []).map(j => ({ id: String(j.id), name: j.name })) })),
        payrollByDepartment: {},
      })
    } catch (e) {
      console.error('Load initial payroll (admin) failed:', e)
      setError('Gagal memuat data')
      setData(buildMock())
      setHierarchy([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadInitial() }, [])

  const toggleBranch = (branchId) => {
    const next = expandedBranch === branchId ? null : branchId
    setExpandedBranch(next)
  }

  const handleSelectDept = async (deptId) => {
    // Toggle: jika klik departemen yang sama, tutup detail
    if (String(selectedDept) === String(deptId)) {
      setSelectedDept(null)
      return
    }
    setSelectedDept(deptId)
    if (data?.payrollByDepartment?.[deptId]) return
    try {
      setLoadingSummary(true)
      let employees = []
      for (const div of hierarchy) {
        for (const jab of (div.children || [])) {
          if (String(jab.id) === String(deptId)) {
            employees = jab.children || []
            break
          }
        }
        if (employees.length) break
      }
      if (!employees.length) {
        return
      }
      const sum = (arr, key) => arr.reduce((a, b) => a + (Number(b[key]) || 0), 0)
      const earning = {
        gajiPokok: sum(employees, 'gaji_pokok'),
        tunjanganKinerja: sum(employees, 'tunjangan_kinerja'),
        tunjanganPosisi: sum(employees, 'tunjangan_posisi'),
        uangMakan: sum(employees, 'uang_makan'),
        lembur: sum(employees, 'lembur'),
        bonus: sum(employees, 'bonus'),
      }
      const deduction = {
        potongan: sum(employees, 'potongan'),
        bpjstk: sum(employees, 'bpjstk'),
        bpjsKesehatan: sum(employees, 'bpjs_kesehatan'),
        bpjsKesPenambahan: sum(employees, 'bpjs_kes_penambahan'),
        spi2: sum(employees, 'sp_1_2'),
        pinjaman: sum(employees, 'pinjaman_karyawan'),
        pph21: sum(employees, 'pph21'),
      }
      // Totals dari backend (lebih konsisten dengan perhitungan server)
      const totalsFromBackend = {
        totalGaji: sum(employees, 'total_gaji'),
        totalPotongan: sum(employees, 'total_potongan'),
        totalGajiDibayarkan: sum(employees, 'total_gaji_dibayarkan'),
      }
      const sample = employees[0]
      const monthsDiff = (start) => {
        if (!start) return null
        const d = new Date(start)
        const now = new Date()
        return (now.getFullYear() - d.getFullYear()) * 12 + (now.getMonth() - d.getMonth())
      }
      const employeeSample = {
        nama: sample?.nama || '—',
        posisi: sample?.jabatan?.nama_jabatan || '—',
        lamaBekerjaBulan: sample?.lama_bekerja ? Number(String(sample.lama_bekerja).replace(/\D/g, '')) : monthsDiff(sample?.tanggal_bergabung) || 0,
      }
      setData((prev) => ({
        ...prev,
        payrollByDepartment: {
          ...prev.payrollByDepartment,
          [deptId]: { employeeSample, earning, deduction, totalsFromBackend },
        },
      }))
    } catch (e) {
      console.error('Compute department summary (admin) failed:', e)
    } finally {
      setLoadingSummary(false)
    }
  }

  // Format tanggal Waktu: "10 Oktober 2025 pukul 14.00"
  const formatDateTimeID = (dateString) => {
    if (!dateString) return '-'
    const d = new Date(dateString)
    const datePart = d.toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' })
    const timePart = d.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', hour12: false })
    return `${datePart} pukul ${timePart}`
  }

  if (loading) return <LoadingSpinner />
  if (error) return <div className="text-red-500 p-4">{error}</div>
  if (!data) return null

  const lastUpdatedText = formatDateTimeID(data.lastUpdated)
  const designUpdatedText = new Date().toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' })
  const breakdown = selectedDept ? data.payrollByDepartment[selectedDept] : null
  const earningTotalComputed = breakdown ? Object.values(breakdown.earning).reduce((a, b) => a + (b || 0), 0) : 0
  const deductionTotalComputed = breakdown ? Object.values(breakdown.deduction).reduce((a, b) => a + (b || 0), 0) : 0
  const earningTotal = breakdown?.totalsFromBackend?.totalGaji ?? earningTotalComputed
  const deductionTotal = breakdown?.totalsFromBackend?.totalPotongan ?? deductionTotalComputed
  const takeHomePay = breakdown?.totalsFromBackend?.totalGajiDibayarkan ?? (earningTotalComputed - deductionTotalComputed)

  // Helper: hitung jumlah orang per branch dan per department dari hierarchy
  const deptEmployeeCount = (deptId) => {
    for (const div of hierarchy) {
      for (const jab of (div.children || [])) {
        if (String(jab.id) === String(deptId)) return (jab.children || []).length || 0
      }
    }
    return 0
  }
  const branchEmployeeCount = (branchId) => {
    const div = hierarchy.find(d => String(d.id) === String(branchId))
    if (!div) return 0
    return (div.children || []).reduce((sum, jab) => sum + ((jab.children || []).length || 0), 0)
  }

  // Helper: dedupe karyawan dengan prioritas key yang lebih kuat
  const dedupeEmployees = (arr) => {
    const seen = new Set()
    const out = []
    for (const e of (arr || [])) {
      const namaNorm = (e?.nama || e?.name || '').toString().trim().toLowerCase()
      const jabatanNorm = (e?.jabatan?.nama_jabatan || '').toString().trim().toLowerCase()
      const tglJoin = (e?.tanggal_bergabung || '').toString().slice(0, 10)
      const keyCandidate =
        (e?.user_id != null) ? `user:${e.user_id}` :
        (e?.karyawan_id != null) ? `karyawan:${e.karyawan_id}` :
        (e?.pegawai_id != null) ? `pegawai:${e.pegawai_id}` :
        (e?.nik != null) ? `nik:${e.nik}` :
        (e?.id != null) ? `id:${e.id}` :
        `name:${namaNorm}|pos:${jabatanNorm}|join:${tglJoin}`
      const key = keyCandidate
      if (!seen.has(key)) {
        seen.add(key)
        out.push(e)
      }
    }
    return out
  }

  const employeesOfDept = (deptId) => {
    for (const div of hierarchy) {
      for (const jab of (div.children || [])) {
        if (String(jab.id) === String(deptId)) return dedupeEmployees(jab.children || [])
      }
    }
    return []
  }

  // Helper hitung lama bekerja (bulan)
  const calcLamaBekerjaBulan = (emp) => {
    if (emp?.lama_bekerja) {
      const n = Number(String(emp.lama_bekerja).replace(/\D/g, ''))
      return isNaN(n) ? 0 : n
    }
    if (emp?.tanggal_bergabung) {
      const d = new Date(emp.tanggal_bergabung)
      const now = new Date()
      return (now.getFullYear() - d.getFullYear()) * 12 + (now.getMonth() - d.getMonth())
    }
    return 0
  }

  // Render satu baris karyawan ter-aggregasi
  const renderEmployeeRow = (emp) => {
    const lamaBekerjaBulan = calcLamaBekerjaBulan(emp)
    const totalGaji = emp.total_gaji ?? ((emp.gaji_pokok||0)+(emp.tunjangan_kinerja||0)+(emp.tunjangan_posisi||0)+(emp.uang_makan||0)+(emp.lembur||0)+(emp.bonus||0))
    const totalPotongan = emp.total_potongan ?? ((emp.potongan||0)+(emp.bpjstk||0)+(emp.bpjs_kesehatan||0)+(emp.bpjs_kes_penambahan||0)+(emp.sp_1_2||0)+(emp.pinjaman_karyawan||0)+(emp.pph21||0))
    const takeHome = emp.total_gaji_dibayarkan ?? (totalGaji - totalPotongan)
    return (
      <div key={emp.id} className="border border-gray-300 rounded-md overflow-hidden">
        <div className="px-4 py-3 bg-red-50 text-red-800 font-semibold border-b border-gray-200">{emp.nama}</div>
        <div className="grid grid-cols-2">
          <div className="border-b border-r border-gray-300 p-2 text-sm font-semibold">NAMA</div>
          <div className="border-b border-gray-300 p-2 text-sm">{emp.nama}</div>
          <div className="border-b border-r border-gray-300 p-2 text-sm font-semibold">DIVISI</div>
          <div className="border-b border-gray-300 p-2 text-sm">{emp.jabatan?.divisi?.nama_divisi || '-'}</div>
          <div className="border-b border-r border-gray-300 p-2 text-sm font-semibold">POSISI</div>
          <div className="border-b border-gray-300 p-2 text-sm">{emp.jabatan?.nama_jabatan || '-'}</div>
          <div className="border-b border-r border-gray-300 p-2 text-sm font-semibold">LAMA BEKERJA</div>
          <div className="border-b border-gray-300 p-2 text-sm">{lamaBekerjaBulan} bulan</div>

          <div className="border-b border-r border-gray-300 p-2 text-sm font-semibold">GAJI POKOK</div>
          <div className="border-b border-gray-300 p-2 text-sm font-mono">{currency(emp.gaji_pokok)}</div>
          <div className="border-b border-r border-gray-300 p-2 text-sm font-semibold">TUNJANGAN KINERJA</div>
          <div className="border-b border-gray-300 p-2 text-sm font-mono">{currency(emp.tunjangan_kinerja)}</div>
          <div className="border-b border-r border-gray-300 p-2 text-sm font-semibold">TUNJANGAN POSISI</div>
          <div className="border-b border-gray-300 p-2 text-sm font-mono">{currency(emp.tunjangan_posisi)}</div>
          <div className="border-b border-r border-gray-300 p-2 text-sm font-semibold">UANG MAKAN</div>
          <div className="border-b border-gray-300 p-2 text-sm font-mono">{currency(emp.uang_makan)}</div>
          <div className="border-b border-r border-gray-300 p-2 text-sm font-semibold">LEMBUR</div>
          <div className="border-b border-gray-300 p-2 text-sm font-mono">{currency(emp.lembur)}</div>
          <div className="border-b border-r border-gray-300 p-2 text-sm font-semibold">BONUS</div>
          <div className="border-b border-gray-300 p-2 text-sm font-mono">{currency(emp.bonus)}</div>
          <div className="border-b border-r border-gray-300 p-2 text-sm font-semibold">TOTAL GAJI</div>
          <div className="border-b border-gray-300 p-2 text-sm font-mono font-bold">{currency(totalGaji)}</div>

          <div className="border-b border-r border-gray-300 p-2 text-sm font-semibold">POTONGAN</div>
          <div className="border-b border-gray-300 p-2 text-sm font-mono">{currency(emp.potongan)}</div>
          <div className="border-b border-r border-gray-300 p-2 text-sm font-semibold">BPJSTK</div>
          <div className="border-b border-gray-300 p-2 text-sm font-mono">{currency(emp.bpjstk)}</div>
          <div className="border-b border-r border-gray-300 p-2 text-sm font-semibold">BPJS KESEHATAN</div>
          <div className="border-b border-gray-300 p-2 text-sm font-mono">{currency(emp.bpjs_kesehatan)}</div>
          <div className="border-b border-r border-gray-300 p-2 text-sm font-semibold">BPJS KES PENAMBAHAN</div>
          <div className="border-b border-gray-300 p-2 text-sm font-mono">{currency(emp.bpjs_kes_penambahan)}</div>
          <div className="border-b border-r border-gray-300 p-2 text-sm font-semibold">SP 1/2</div>
          <div className="border-b border-gray-300 p-2 text-sm font-mono">{currency(emp.sp_1_2)}</div>
          <div className="border-b border-r border-gray-300 p-2 text-sm font-semibold">PINJAMAN KARYAWAN</div>
          <div className="border-b border-gray-300 p-2 text-sm font-mono">{currency(emp.pinjaman_karyawan)}</div>
          <div className="border-b border-r border-gray-300 p-2 text-sm font-semibold">PPH21</div>
          <div className="border-b border-gray-300 p-2 text-sm font-mono">{currency(emp.pph21)}</div>
          <div className="border-b border-r border-gray-300 p-2 text-sm font-semibold">TOTAL POTONGAN</div>
          <div className="border-b border-gray-300 p-2 text-sm font-mono font-bold">{currency(totalPotongan)}</div>

          <div className="col-span-2 p-2 text-sm font-semibold text-center">TOTAL GAJI DIBAYARKAN</div>
          <div className="col-span-2 border-t border-gray-300 p-3 text-center text-lg font-bold font-mono">{currency(takeHome)}</div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-0 bg-gray-50 min-h-screen">
      {/* Header (konsisten dengan halaman lain) */}
      <div className="bg-red-800 text-white px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span className="text-sm font-semibold bg-white/10 rounded px-2 py-1">{MENU_CODES.keuangan.daftarGaji}</span>
            <div>
              <h1 className="text-xl md:text-2xl font-extrabold tracking-tight">DAFTAR GAJI</h1>
              <p className="text-sm text-red-100">Ringkasan gaji per cabang dan divisi</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              className="px-4 py-2 rounded-full border border-white/60 text-white hover:bg-white/10"
            >
              PENCARIAN
            </button>
            <Link
              to="/admin/keuangan/daftar-gaji/new"
              className="inline-flex items-center gap-2 px-4 py-2 bg-white text-red-700 rounded-lg hover:bg-red-50 transition-colors shadow-sm"
            >
              <Plus className="h-4 w-4" />
              <span className="font-semibold">Tambah</span>
            </Link>
          </div>
        </div>
      </div>

      <div className="bg-gray-200 px-6 py-2 text-xs text-gray-600">Terakhir diupdate: {lastUpdatedText}</div>

      <div className="mt-4">
        {/* Form Pencarian */}
        <div className="bg-white rounded-none md:rounded-xl shadow-sm border border-gray-100 mb-3">
          <div className="px-6 py-4 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Cari</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Cari cabang / divisi ..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-3 py-2 w-full border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-red-500 focus:border-transparent"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Cabang</label>
              <select
                value={branchFilter}
                onChange={(e) => setBranchFilter(e.target.value)}
                className="px-3 py-2 w-full border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-red-500 focus:border-transparent"
              >
                <option value="all">Semua Cabang</option>
                {branches.map((b) => (
                  <option key={b.id} value={b.id}>{b.name}</option>
                ))}
              </select>
            </div>
            <div className="flex items-end">
              <button
                type="button"
                onClick={() => { setSearchTerm(''); setBranchFilter('all'); }}
                className="inline-flex items-center gap-2 px-5 py-2 rounded-full border border-red-600 text-red-700 hover:bg-red-50 transition-colors"
              >
                Reset
              </button>
            </div>
          </div>
        </div>

        {/* Daftar Cabang */}
        <div className="space-y-3">
          {filteredBranches.map((branch) => (
            <div key={branch.id} className="border border-gray-200 rounded-md overflow-hidden">
              <button
                type="button"
                onClick={() => toggleBranch(branch.id)}
                className="w-full flex items-center justify-between px-4 py-2 bg-red-700 text-white"
              >
                <span className="font-semibold">{branch.name}</span>
                <span className="text-sm opacity-90">{branchEmployeeCount(branch.id)} orang {expandedBranch === branch.id ? <ChevronUp className="inline h-4 w-4 ml-2"/> : <ChevronDown className="inline h-4 w-4 ml-2"/>}</span>
              </button>
              {expandedBranch === branch.id && (
                <div className="bg-white">
                  {(branch.departments || []).map((dept) => (
                    <button
                      key={dept.id}
                      type="button"
                      onClick={() => handleSelectDept(dept.id)}
                      className={`w-full flex items-center justify-between text-left px-4 py-2 border-t border-gray-100 ${selectedDept === dept.id ? 'bg-gray-50' : 'bg-white hover:bg-gray-50'}`}
                    >
                      <span className="text-sm font-semibold text-gray-800">{dept.name}</span>
                      <span className="text-xs text-gray-600">{deptEmployeeCount(dept.id)} orang</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Ringkasan per divisi di-nonaktifkan; hanya daftar per karyawan yang ditampilkan */}
        {false && (
          <div className="mt-6">
            <div className="border border-gray-300 rounded-md overflow-hidden">
              {loadingSummary && (
                <div className="p-3 text-sm text-gray-500">Memuat ringkasan gaji...</div>
              )}
              {!loadingSummary && breakdown && (
                <div className="w-full">
                  {/* Nama karyawan highlight */}
                  <div className="px-4 py-3 bg-red-50 text-red-800 font-semibold border-b border-gray-200">{breakdown.employeeSample.nama}</div>
                  {/* Daftar karyawan yang ter-aggregasi */}
                  {/* Ringkasan 'Termasuk N orang' dihapus sesuai permintaan */}
                  {/* Tabel dua kolom */}
                  <div className="grid grid-cols-2">
                    <div className="border-b border-r border-gray-300 p-2 text-sm font-semibold">NAMA</div>
                    <div className="border-b border-gray-300 p-2 text-sm">{breakdown.employeeSample.nama}</div>
                    <div className="border-b border-r border-gray-300 p-2 text-sm font-semibold">DIVISI</div>
                    <div className="border-b border-gray-300 p-2 text-sm">{data.branches.find(b => (b.departments||[]).some(d => String(d.id)===String(selectedDept)))?.name || '-'}</div>
                    <div className="border-b border-r border-gray-300 p-2 text-sm font-semibold">POSISI</div>
                    <div className="border-b border-gray-300 p-2 text-sm">{breakdown.employeeSample.posisi}</div>
                    <div className="border-b border-r border-gray-300 p-2 text-sm font-semibold">LAMA BEKERJA</div>
                    <div className="border-b border-gray-300 p-2 text-sm">{breakdown.employeeSample.lamaBekerjaBulan} bulan</div>

                    <div className="border-b border-r border-gray-300 p-2 text-sm font-semibold">GAJI POKOK</div>
                    <div className="border-b border-gray-300 p-2 text-sm font-mono">{currency(breakdown.earning.gajiPokok)}</div>
                    <div className="border-b border-r border-gray-300 p-2 text-sm font-semibold">TUNJANGAN KINERJA</div>
                    <div className="border-b border-gray-300 p-2 text-sm font-mono">{currency(breakdown.earning.tunjanganKinerja)}</div>
                    <div className="border-b border-r border-gray-300 p-2 text-sm font-semibold">TUNJANGAN POSISI</div>
                    <div className="border-b border-gray-300 p-2 text-sm font-mono">{currency(breakdown.earning.tunjanganPosisi)}</div>
                    <div className="border-b border-r border-gray-300 p-2 text-sm font-semibold">UANG MAKAN</div>
                    <div className="border-b border-gray-300 p-2 text-sm font-mono">{currency(breakdown.earning.uangMakan)}</div>
                    <div className="border-b border-r border-gray-300 p-2 text-sm font-semibold">LEMBUR</div>
                    <div className="border-b border-gray-300 p-2 text-sm font-mono">{currency(breakdown.earning.lembur)}</div>
                    <div className="border-b border-r border-gray-300 p-2 text-sm font-semibold">BONUS</div>
                    <div className="border-b border-gray-300 p-2 text-sm font-mono">{currency(breakdown.earning.bonus)}</div>
                    <div className="border-b border-r border-gray-300 p-2 text-sm font-semibold">TOTAL GAJI</div>
                    <div className="border-b border-gray-300 p-2 text-sm font-mono font-bold">{currency(earningTotal)}</div>

                    <div className="border-b border-r border-gray-300 p-2 text-sm font-semibold">POTONGAN</div>
                    <div className="border-b border-gray-300 p-2 text-sm font-mono">{currency(breakdown.deduction.potongan)}</div>
                    <div className="border-b border-r border-gray-300 p-2 text-sm font-semibold">BPJSTK</div>
                    <div className="border-b border-gray-300 p-2 text-sm font-mono">{currency(breakdown.deduction.bpjstk)}</div>
                    <div className="border-b border-r border-gray-300 p-2 text-sm font-semibold">BPJS KESEHATAN</div>
                    <div className="border-b border-gray-300 p-2 text-sm font-mono">{currency(breakdown.deduction.bpjsKesehatan)}</div>
                    <div className="border-b border-r border-gray-300 p-2 text-sm font-semibold">BPJS KES PENAMBAHAN</div>
                    <div className="border-b border-gray-300 p-2 text-sm font-mono">{currency(breakdown.deduction.bpjsKesPenambahan)}</div>
                    <div className="border-b border-r border-gray-300 p-2 text-sm font-semibold">SP 1/2</div>
                    <div className="border-b border-gray-300 p-2 text-sm font-mono">{currency(breakdown.deduction.spi2)}</div>
                    <div className="border-b border-r border-gray-300 p-2 text-sm font-semibold">PINJAMAN KARYAWAN</div>
                    <div className="border-b border-gray-300 p-2 text-sm font-mono">{currency(breakdown.deduction.pinjaman)}</div>
                    <div className="border-b border-r border-gray-300 p-2 text-sm font-semibold">PPH21</div>
                    <div className="border-b border-gray-300 p-2 text-sm font-mono">{currency(breakdown.deduction.pph21)}</div>
                    <div className="border-b border-r border-gray-300 p-2 text-sm font-semibold">TOTAL POTONGAN</div>
                    <div className="border-b border-gray-300 p-2 text-sm font-mono font-bold">{currency(deductionTotal)}</div>

                    <div className="col-span-2 p-2 text-sm font-semibold text-center">TOTAL GAJI DIBAYARKAN</div>
                    <div className="col-span-2 border-t border-gray-300 p-3 text-center text-lg font-bold font-mono">{currency(takeHomePay)}</div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
        {/* Daftar karyawan berderet ke bawah */}
        {selectedDept && !loadingSummary && (
          <div className="mt-3 space-y-3">
            {employeesOfDept(selectedDept).map(renderEmployeeRow)}
          </div>
        )}
      </div>
    </div>
  )
}

export default AdminDaftarGaji
