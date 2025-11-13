import React, { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import LoadingSpinner from '@/components/UI/LoadingSpinner'
import { API_CONFIG } from '@/config/constants'
import { MENU_CODES } from '@/config/menuCodes'
import { ChevronDown, ChevronUp, Plus, Search } from 'lucide-react'
import Button from '@/components/UI/Button'
import Input from '@/components/UI/Input'

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

  // Modal tambah gaji
  const [showForm, setShowForm] = useState(false)
  const [divisions, setDivisions] = useState([]) // [{id,name,children:[{id,name}]}]
  const [selectedDivisiId, setSelectedDivisiId] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [jabatanOptions, setJabatanOptions] = useState([])
  const [loadingJabatan, setLoadingJabatan] = useState(false)
  const [usersOptions, setUsersOptions] = useState([])
  const [loadingUsers, setLoadingUsers] = useState(false)
  const [form, setForm] = useState({
    nama: '',
    jabatan_id: '',
    gaji_pokok: '',
    tunjangan_kinerja: '',
    tunjangan_posisi: '',
    uang_makan: '',
    lembur: '',
    bonus: '',
    potongan: '',
    bpjstk: '',
    bpjs_kesehatan: '',
    bpjs_kes_penambahan: '',
    sp_1_2: '',
    pinjaman_karyawan: '',
    pph21: '',
    user_id: '',
  })
  const [expandedEmployees, setExpandedEmployees] = useState({})

  const onChange = (e) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const numberProps = { type: 'number', step: '1', min: '0', inputMode: 'numeric' }

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
    // Saat pencarian nama aktif, jangan filter berdasarkan teks pada cabang/divisi
    if ((searchTerm || '').trim()) return matchesBranch
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

  // Load hierarchy saat modal dibuka
  useEffect(() => {
    if (!showForm) return
    const loadHierarchy = async () => {
      try {
        const token = localStorage.getItem('token') || localStorage.getItem('access_token')
        const res = await fetch(`${API_CONFIG.BASE_URL}/admin/sdm/hierarchy`, {
          headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        })
        const data = await res.json()
        if (res.ok && data?.success && Array.isArray(data.data)) setDivisions(data.data)
        else setDivisions(Array.isArray(hierarchy) ? hierarchy : [])
      } catch (e) {
        console.error('Gagal memuat hierarchy SDM:', e)
        setDivisions(Array.isArray(hierarchy) ? hierarchy : [])
      }
    }
    loadHierarchy()
  }, [showForm, hierarchy])

  // Load jabatan langsung dari endpoint sdm_jabatan ketika divisi dipilih
  useEffect(() => {
    const loadJabatanByDivisi = async () => {
      if (!showForm || !selectedDivisiId) {
        setJabatanOptions([])
        return
      }
      try {
        setLoadingJabatan(true)
        const token = localStorage.getItem('token') || localStorage.getItem('access_token')
        const url = `${API_CONFIG.BASE_URL}/admin/sdm/jabatan?divisi_id=${encodeURIComponent(selectedDivisiId)}&limit=200&status_aktif=true`
        const res = await fetch(url, {
          headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        })
        const data = await res.json()
        if (res.ok && data?.success && Array.isArray(data.data)) {
          const opts = data.data.map(j => ({ id: j.id, name: j.nama_jabatan || j.name || `Jabatan ${j.id}` }))
          setJabatanOptions(opts)
        } else {
          setJabatanOptions([])
        }
      } catch (e) {
        console.error('Gagal memuat jabatan:', e)
        setJabatanOptions([])
      } finally {
        setLoadingJabatan(false)
      }
    }
    loadJabatanByDivisi()
  }, [showForm, selectedDivisiId])

  // Load users (nama karyawan) dari tabel users saat modal dibuka
  useEffect(() => {
    const loadUsers = async () => {
      if (!showForm) return
      try {
        setLoadingUsers(true)
        // Ambil users aktif, limit besar agar memadai; sesuaikan jika perlu pagination
        const url = `${API_CONFIG.BASE_URL.replace(/\/$/, '')}/users?page=1&limit=200&status=active`
        const res = await fetch(url, { headers: { 'Content-Type': 'application/json' } })
        const data = await res.json()
        if (res.ok && data?.success && Array.isArray(data.data)) {
          // data.data adalah array user; exclude role 'owner'
          const opts = data.data
            .filter(u => String(u.role).toLowerCase() !== 'owner')
            .map(u => ({ id: u.id, name: u.nama || u.username || `User ${u.id}` }))
          setUsersOptions(opts)
        } else {
          setUsersOptions([])
        }
      } catch (e) {
        console.error('Gagal memuat users:', e)
        setUsersOptions([])
      } finally {
        setLoadingUsers(false)
      }
    }
    loadUsers()
  }, [showForm])

  // Sumber opsi divisi: gunakan hasil fetch modal, fallback ke hierarchy awal
  const divisionOptions = useMemo(() => {
    if (Array.isArray(divisions) && divisions.length) return divisions
    if (Array.isArray(hierarchy) && hierarchy.length) return hierarchy
    return []
  }, [divisions, hierarchy])

  const toNumber = (v) => {
    if (v === '' || v === null || v === undefined) return 0
    const n = Number(v)
    return isNaN(n) ? 0 : n
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (submitting) return
    if (!form.nama || !String(form.nama).trim()) { alert('Nama karyawan wajib diisi'); return }
    if (!form.jabatan_id) { alert('Silakan pilih jabatan'); return }

    const payload = {
      nama: form.nama,
      jabatan_id: Number(form.jabatan_id),
      gaji_pokok: toNumber(form.gaji_pokok),
      tunjangan_kinerja: toNumber(form.tunjangan_kinerja),
      tunjangan_posisi: toNumber(form.tunjangan_posisi),
      uang_makan: toNumber(form.uang_makan),
      lembur: toNumber(form.lembur),
      bonus: toNumber(form.bonus),
      potongan: toNumber(form.potongan),
      bpjstk: toNumber(form.bpjstk),
      bpjs_kesehatan: toNumber(form.bpjs_kesehatan),
      bpjs_kes_penambahan: toNumber(form.bpjs_kes_penambahan),
      sp_1_2: toNumber(form.sp_1_2),
      pinjaman_karyawan: toNumber(form.pinjaman_karyawan),
      pph21: toNumber(form.pph21),
      user_id: form.user_id ? Number(form.user_id) : null,
    }
    try {
      setSubmitting(true)
      const token = localStorage.getItem('token') || localStorage.getItem('access_token')
      const res = await fetch(`${API_CONFIG.BASE_URL}/admin/sdm/employees`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        body: JSON.stringify(payload),
      })
      const data = await res.json()
      if (res.ok && data?.success) {
        alert('Data gaji karyawan berhasil dibuat')
        setShowForm(false)
        setForm({ nama: '', jabatan_id: '', gaji_pokok: '', tunjangan_kinerja: '', tunjangan_posisi: '', uang_makan: '', lembur: '', bonus: '', potongan: '', bpjstk: '', bpjs_kesehatan: '', bpjs_kes_penambahan: '', sp_1_2: '', pinjaman_karyawan: '', pph21: '', user_id: '' })
        setSelectedDivisiId('')
        await loadInitial()
      } else {
        alert(data?.message || 'Gagal menyimpan data gaji')
      }
    } catch (err) {
      console.error('Error submit gaji:', err)
      alert('Terjadi kesalahan saat menyimpan data')
    } finally {
      setSubmitting(false)
    }
  }

  const toggleBranch = (branchId) => {
    const isClosing = expandedBranch === branchId
    const next = isClosing ? null : branchId
    setExpandedBranch(next)
    if (isClosing) {
      // Jika branch ditutup dan selectedDept berada di dalam branch tsb, kosongkan pilihan dan tutup daftar nama
      const branch = (data?.branches || []).find(b => String(b.id) === String(branchId))
      const deptIds = (branch?.departments || []).map(d => String(d.id))
      if (selectedDept && deptIds.includes(String(selectedDept))) {
        setSelectedDept(null)
        setExpandedEmployees({})
      }
    }
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
  const breakdown = selectedDept ? data.payrollByDepartment[selectedDept] : null
  const earningTotalComputed = breakdown ? Object.values(breakdown.earning).reduce((a, b) => a + (b || 0), 0) : 0
  const deductionTotalComputed = breakdown ? Object.values(breakdown.deduction).reduce((a, b) => a + (b || 0), 0) : 0
  const earningTotal = breakdown?.totalsFromBackend?.totalGaji ?? earningTotalComputed
  const deductionTotal = breakdown?.totalsFromBackend?.totalPotongan ?? deductionTotalComputed
  const takeHomePay = breakdown?.totalsFromBackend?.totalGajiDibayarkan ?? (earningTotalComputed - deductionTotalComputed)
  const isGlobalSearch = (searchTerm || '').trim().length > 0

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

  // Key unik untuk setiap karyawan (sinkron dengan strategi dedupe)
  const getEmployeeKey = (e) => {
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
    return keyCandidate
  }

  const toggleEmployee = (empKey) => {
    setExpandedEmployees(prev => ({
      ...prev,
      [empKey]: !prev[empKey]
    }))
  }

  const employeesOfDept = (deptId) => {
    for (const div of hierarchy) {
      for (const jab of (div.children || [])) {
        if (String(jab.id) === String(deptId)) return dedupeEmployees(jab.children || [])
      }
    }
    return []
  }

  // Ambil seluruh karyawan dari semua divisi (flatten) untuk pencarian global nama
  const allEmployees = () => {
    const collected = []
    for (const div of (hierarchy || [])) {
      for (const jab of (div.children || [])) {
        for (const emp of (jab.children || [])) {
          collected.push(emp)
        }
      }
    }
    return dedupeEmployees(collected)
  }

  // Filter karyawan sesuai teks pencarian (tanpa useMemo untuk menghindari mismatch hooks saat early return)
  const filteredEmployees = (() => {
    // Jika ada pencarian global (berdasarkan nama), gunakan seluruh karyawan
    const isGlobalSearch = (searchTerm || '').trim().length > 0
    if (isGlobalSearch && !selectedDept) {
      const q = (searchTerm || '').trim().toLowerCase()
      const list = allEmployees()
      return list.filter((emp) => {
        const nama = String(emp?.nama || '').toLowerCase()
        const posisi = String(emp?.jabatan?.nama_jabatan || '').toLowerCase()
        const divisi = String(emp?.jabatan?.divisi?.nama_divisi || '').toLowerCase()
        return nama.includes(q) || posisi.includes(q) || divisi.includes(q)
      })
    }
    if (!selectedDept) return []
    const q = (searchTerm || '').trim().toLowerCase()
    const list = employeesOfDept(selectedDept)
    if (!q) return list
    return list.filter((emp) => {
      const nama = String(emp?.nama || '').toLowerCase()
      const posisi = String(emp?.jabatan?.nama_jabatan || '').toLowerCase()
      const divisi = String(emp?.jabatan?.divisi?.nama_divisi || '').toLowerCase()
      return nama.includes(q) || posisi.includes(q) || divisi.includes(q)
    })
  })()

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
    const empKey = getEmployeeKey(emp)
    const isOpen = !!expandedEmployees[empKey]
    return (
      <div key={empKey} className="border border-gray-300 rounded-md overflow-hidden">
        <button
          type="button"
          onClick={() => toggleEmployee(empKey)}
          className="w-full flex items-center justify-between px-4 py-3 bg-white hover:bg-gray-50"
        >
          <div>
            <div className="text-sm font-semibold text-gray-900">{emp.nama || '—'}</div>
          </div>
          {isOpen ? <ChevronUp className="h-4 w-4 text-gray-600" /> : <ChevronDown className="h-4 w-4 text-gray-600" />}
        </button>
        {isOpen && (
          <div className="grid grid-cols-2">
            <div className="border-t border-b border-r border-gray-300 p-2 text-sm font-semibold">NAMA</div>
            <div className="border-t border-b border-gray-300 p-2 text-sm">{emp.nama}</div>
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
        )}
      </div>
    )
  }

  return (
    <div className="p-0 bg-gray-50 min-h-screen">
      {/* Header (disamakan dengan Poskas) */}
      <div className="bg-red-800 text-white px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span className="text-sm font-semibold bg-white/10 rounded px-2 py-1">{MENU_CODES.keuangan.daftarGaji}</span>
            <div>
              <h1 className="text-xl md:text-2xl font-extrabold tracking-tight">DAFTAR GAJI</h1>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowForm(true)}
              className="hidden"
            >
              <Plus className="h-4 w-4 text-red-700" />
              <span className="hidden sm:inline font-semibold text-red-700 text-base">Tambah</span>
            </button>
          </div>
        </div>
      </div>

      <div className="bg-gray-200 px-6 py-2 text-sm text-gray-900">Terakhir diupdate: {lastUpdatedText}</div>

      {/* ... rest of the code remains the same ... */}
      <div className="mt-4">
        {/* Form Pencarian */}
        <div className="bg-white rounded-none md:rounded-xl shadow-sm border border-gray-100 mb-2">
          <div className="px-6 py-2 md:py-4 grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1 md:mb-2">Cari Daftar Gaji</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Cari daftar gaji... (nama karyawan / divisi / cabang)"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-3 py-1.5 md:py-3 w-full border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-red-500 focus:border-transparent"
                />
              </div>
            </div>
            <div className="flex items-end"></div>
          </div>
        </div>

        {/* Daftar Cabang - disembunyikan saat pencarian global (nama) aktif dan belum memilih divisi */}
        {!(isGlobalSearch && !selectedDept) && (
          <div className="space-y-3 mt-4">
            {filteredBranches.map((branch) => (
              <div key={branch.id} className="rounded-md overflow-hidden bg-red-700 text-white border border-red-700">
                <button
                  type="button"
                  onClick={() => toggleBranch(branch.id)}
                  className="w-full h-10 md:h-11 flex items-center justify-between px-4 py-0 bg-red-700 text-white"
                >
                  <span className="font-semibold leading-none">{branch.name}</span>
                  <span className="text-sm opacity-90 leading-none flex items-center">{branchEmployeeCount(branch.id)} orang {expandedBranch === branch.id ? <ChevronUp className="inline h-4 w-4 ml-2"/> : <ChevronDown className="inline h-4 w-4 ml-2"/>}</span>
                </button>
                {expandedBranch === branch.id && (
                  <div className="bg-red-700">
                    {(branch.departments || []).map((dept) => (
                      <div key={dept.id} className="">
                        <button
                          type="button"
                          onClick={() => handleSelectDept(dept.id)}
                          className={`w-full flex items-center justify-between text-left px-4 py-2 border-t border-red-800 ${selectedDept === dept.id ? 'bg-gray-50' : 'bg-white hover:bg-gray-50'}`}
                        >
                          <span className="text-sm font-semibold text-gray-900">{dept.name}</span>
                          <span className="text-xs text-gray-700">{deptEmployeeCount(dept.id)} orang</span>
                        </button>
                        {selectedDept === dept.id && (
                          <div className="bg-white text-gray-900 border-t border-gray-200 px-4 py-3">
                            {loadingSummary ? (
                              <div className="text-sm text-gray-500 py-2">Memuat data...</div>
                            ) : (
                              <div className="space-y-3">
                                {filteredEmployees.length === 0 ? (
                                  <div className="text-center text-sm text-gray-500 py-4">Tidak ada karyawan pada jabatan ini</div>
                                ) : (
                                  filteredEmployees.map(renderEmployeeRow)
                                )}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Hasil pencarian global nama karyawan (saat belum memilih divisi) */}
        {isGlobalSearch && !selectedDept && (
          <div className="mt-3 space-y-3">
            {filteredEmployees.length === 0 ? (
              <div className="text-center text-sm text-gray-500 py-6">Tidak ada karyawan yang cocok</div>
            ) : (
              filteredEmployees.map(renderEmployeeRow)
            )}
          </div>
        )}

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
        {/* Daftar karyawan dipindahkan untuk tampil tepat di bawah tiap kotak jabatan */}
        {false && selectedDept && !loadingSummary && (
          <div className="mt-3 space-y-3">
            {filteredEmployees.map(renderEmployeeRow)}
          </div>
        )}
      </div>

      {/* Modal Tambah Daftar Gaji */}
      {showForm && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-[1px] flex items-end md:items-center justify-stretch md:justify-center z-50 p-0 md:p-4"
        >
          {/* Backdrop click to close */}
          <button
            type="button"
            aria-hidden="true"
            onClick={() => setShowForm(false)}
            className="absolute inset-0"
            tabIndex={-1}
          />

          <div className="bg-white rounded-t-2xl md:rounded-2xl shadow-2xl w-full md:w-auto max-w-none md:max-w-2xl lg:max-w-2xl max-h-[85vh] md:max-h-[92vh] overflow-hidden border border-gray-200 flex flex-col relative md:mt-0">
            {/* Header - mobile mengikuti Aneka Grafik (light), desktop tetap merah */}
            <div className="flex items-center justify-between px-4 py-2 md:px-6 md:py-2 border-b bg-white text-gray-900 md:bg-red-800 md:text-white md:border-red-700 sticky top-0 z-10">
              <div>
                <h3 className="text-base md:text-lg font-semibold leading-tight">Tambah Daftar Gaji</h3>
              </div>
              <button onClick={() => setShowForm(false)} className="p-1 md:p-2 text-gray-500 hover:text-gray-700 md:text-white/90 md:hover:text-white md:hover:bg-white/10 rounded-lg transition-colors" aria-label="Tutup">
                ✕
              </button>
            </div>

            {/* Body */}
            <div className="flex-1 min-h-0 overflow-y-auto px-4 md:px-6 py-4 lg:py-5 scrollbar-hide">
              <form id="gajiForm" onSubmit={handleSubmit} className="space-y-4">
                {/* Info Karyawan */}
                <div className="rounded-lg border border-gray-200 bg-white p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-semibold text-gray-900">Informasi Karyawan</h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Pilih User (Nama Karyawan) <span className="text-red-600">*</span></label>
                      <select
                        className="w-full border rounded-md px-3 py-2 md:py-1"
                        value={form.user_id || ''}
                        onChange={(e) => {
                          const selectedId = e.target.value
                          const user = usersOptions.find(u => String(u.id) === String(selectedId))
                          setForm(prev => ({ ...prev, user_id: selectedId ? Number(selectedId) : '', nama: user?.name || '' }))
                        }}
                        disabled={loadingUsers}
                      >
                        <option value="">{loadingUsers ? 'Memuat users...' : 'Pilih user'}</option>
                        {usersOptions.map(u => (
                          <option key={u.id} value={u.id}>{u.name}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Divisi <span className="text-red-600">*</span></label>
                      <select
                        className="w-full border rounded-md px-3 py-2 md:py-1"
                        value={selectedDivisiId}
                        onChange={(e) => { setSelectedDivisiId(e.target.value); setForm((p)=>({ ...p, jabatan_id: '' })) }}
                      >
                        <option value="">Pilih divisi</option>
                        {divisionOptions.map((d) => (
                          <option key={d.id} value={d.id}>{d.name}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Jabatan <span className="text-red-600">*</span></label>
                      <select
                        className="w-full border rounded-md px-3 py-2 md:py-1"
                        name="jabatan_id"
                        value={form.jabatan_id}
                        onChange={onChange}
                        disabled={!selectedDivisiId || loadingJabatan}
                      >
                        <option value="">{loadingJabatan ? 'Memuat jabatan...' : 'Pilih jabatan'}</option>
                        {jabatanOptions.map((j) => (
                          <option key={j.id} value={j.id}>{j.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                {/* Komponen Penghasilan */}
                <div className="rounded-lg border border-gray-200 bg-white p-4">
                  <h3 className="text-sm font-semibold text-gray-900 mb-3">Komponen Penghasilan</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                    <Input label="Gaji Pokok (Rp)" name="gaji_pokok" value={form.gaji_pokok} onChange={onChange} {...numberProps} inputClassName="py-1.5 text-sm md:py-1 md:text-base" />
                    <Input label="Tunjangan Kinerja (Rp)" name="tunjangan_kinerja" value={form.tunjangan_kinerja} onChange={onChange} {...numberProps} inputClassName="py-1.5 text-sm md:py-1 md:text-base" />
                    <Input label="Tunjangan Posisi (Rp)" name="tunjangan_posisi" value={form.tunjangan_posisi} onChange={onChange} {...numberProps} inputClassName="py-1.5 text-sm md:py-1 md:text-base" />
                    <Input label="Uang Makan (Rp)" name="uang_makan" value={form.uang_makan} onChange={onChange} {...numberProps} inputClassName="py-1.5 text-sm md:py-1 md:text-base" />
                    <Input label="Lembur (Rp)" name="lembur" value={form.lembur} onChange={onChange} {...numberProps} inputClassName="py-1.5 text-sm md:py-1 md:text-base" />
                    <Input label="Bonus (Rp)" name="bonus" value={form.bonus} onChange={onChange} {...numberProps} inputClassName="py-1.5 text-sm md:py-1 md:text-base" />
                  </div>
                </div>

                {/* Komponen Potongan */}
                <div className="rounded-lg border border-gray-200 bg-white p-4">
                  <h3 className="text-sm font-semibold text-gray-900 mb-3">Komponen Potongan</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                    <Input label="Potongan (Rp)" name="potongan" value={form.potongan} onChange={onChange} {...numberProps} inputClassName="py-1.5 text-sm md:py-1 md:text-base" />
                    <Input label="BPJSTK (Rp)" name="bpjstk" value={form.bpjstk} onChange={onChange} {...numberProps} inputClassName="py-1.5 text-sm md:py-1 md:text-base" />
                    <Input label="BPJS Kesehatan (Rp)" name="bpjs_kesehatan" value={form.bpjs_kesehatan} onChange={onChange} {...numberProps} inputClassName="py-1.5 text-sm md:py-1 md:text-base" />
                    <Input label="BPJS Kes Penambahan (Rp)" name="bpjs_kes_penambahan" value={form.bpjs_kes_penambahan} onChange={onChange} {...numberProps} inputClassName="py-1.5 text-sm md:py-1 md:text-base" />
                    <Input label="SP 1/2 (Rp)" name="sp_1_2" value={form.sp_1_2} onChange={onChange} {...numberProps} inputClassName="py-1.5 text-sm md:py-1 md:text-base" />
                    <Input label="Pinjaman Karyawan (Rp)" name="pinjaman_karyawan" value={form.pinjaman_karyawan} onChange={onChange} {...numberProps} inputClassName="py-1.5 text-sm md:py-1 md:text-base" />
                    <Input label="PPH21 (Rp)" name="pph21" value={form.pph21} onChange={onChange} {...numberProps} inputClassName="py-1.5 text-sm md:py-1 md:text-base" />
                  </div>
                </div>

                
              </form>
            </div>

            {/* Footer - mobile mengikuti Aneka Grafik */}
            <div className="p-4 border-t bg-white">
              <div className="flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  form="gajiForm"
                  disabled={submitting}
                  className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {submitting ? 'Menyimpan...' : 'Simpan'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* FAB Tambah (disembunyikan) */}
      {!showForm && (
        <button
          type="button"
          onClick={() => setShowForm(true)}
          className="hidden"
          aria-label="Tambah Data Gaji"
        >
          <Plus className="w-6 h-6" />
        </button>
      )}
    </div>
  )
}

export default AdminDaftarGaji
