import React, { useEffect, useMemo, useState } from 'react'
import tugasSayaService from '../../../services/tugasSayaService'
import api from '../../../services/api'
import { toast } from 'react-hot-toast'
import { MENU_CODES } from '@/config/menuCodes'
import { RefreshCw, Search } from 'lucide-react'

const LeaderTugasSaya = () => {
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(false)
  const [q, setQ] = useState('')
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(10)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ tugas_saya: '', id_user: '' })
  const [showFilters, setShowFilters] = useState(false)
  const [users, setUsers] = useState([])

  const fetchData = async () => {
    try {
      setLoading(true)
      const params = { page, limit }
      if (q.trim()) params.q = q.trim()
      const resp = await tugasSayaService.list(params)
      const data = Array.isArray(resp?.data) ? resp.data : []
      setRows(data)
    } catch (e) {
      console.error('Gagal memuat Tugas Saya:', e)
      toast.error('Gagal memuat data tugas')
      setRows([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchData() }, [page, limit])

  useEffect(() => {
    // load users untuk dropdown penugasan
    (async () => {
      try {
        const resp = await api.get('/users')
        const list = Array.isArray(resp?.data?.data) ? resp.data.data : (Array.isArray(resp?.data) ? resp.data : [])
        setUsers(list.map(u => ({ id: u.id, nama: u.nama || u.username || `User ${u.id}` })))
      } catch (e) {
        console.warn('Gagal memuat daftar user:', e)
        setUsers([])
      }
    })()
  }, [])

  const data = useMemo(() => rows, [rows])

  const lastUpdatedText = useMemo(() => {
    if (!rows || rows.length === 0) return '-'
    const getTime = (r) => {
      if (r.updated_at) return new Date(r.updated_at).getTime()
      if (r.created_at) return new Date(r.created_at).getTime()
      return 0
    }
    const sorted = [...rows].sort((a,b) => getTime(b) - getTime(a))
    const dt = sorted[0]?.updated_at || sorted[0]?.created_at
    return dt ? new Date(dt).toLocaleString('id-ID', { year:'numeric', month:'long', day:'numeric', hour:'2-digit', minute:'2-digit' }) : '-'
  }, [rows])

  return (
    <div className="p-0 bg-gray-100 min-h-screen">
      {/* Header Merah */}
      <div className="bg-red-800 text-white px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span className="text-sm font-semibold bg-white/10 rounded px-2 py-1">{MENU_CODES.sdm.daftarTugas}</span>
            <div>
              <h1 className="text-xl md:text-2xl font-extrabold tracking-tight">TUGAS SAYA</h1>
              <p className="text-sm text-red-100">Daftar tugas yang tercatat untuk Anda</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setShowFilters(v => !v)} className="px-4 py-2 rounded-full border border-white/60 text-white bg-transparent">PENCARIAN</button>
            <button onClick={() => fetchData()} className="px-4 py-2 rounded-full border border-white/60 text-white bg-transparent inline-flex items-center gap-2" title="Refresh">
              <RefreshCw className="w-4 h-4" />
            </button>
            <button className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-white/60 text-white bg-transparent" onClick={()=>setShowForm(true)}>
              <span>＋</span>
              <span>Tambah</span>
            </button>
          </div>
        </div>
      </div>

      {/* Strip Terakhir Diupdate */}
      <div className="bg-gray-200 px-6 py-2 text-xs text-gray-600">Terakhir diupdate: {lastUpdatedText}</div>

      {/* Panel Filter (Toggle) */}
      {showFilters && (
        <div className="bg-white rounded-none shadow-sm border border-gray-100 my-4">
          <div className="px-6 py-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Cari</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input value={q} onChange={e=>setQ(e.target.value)} placeholder="Cari tugas saya" className="pl-10 pr-3 py-2 w-full border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-red-500 focus:border-transparent" />
                </div>
              </div>
              <div className="md:col-span-2 flex items-end gap-2">
                <button className="rounded bg-red-600 text-white px-4 py-2 hover:bg-red-700" onClick={()=>{setPage(1);fetchData()}}>Terapkan</button>
                <button className="rounded border px-4 py-2" onClick={()=>{setQ('');setPage(1);fetchData()}}>Reset</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/40" onClick={()=>setShowForm(false)} />
          {/* Modal */}
          <div className="relative z-10 w-full max-w-lg rounded-lg bg-white shadow-lg">
            <div className="flex items-center justify-between border-b px-5 py-3">
              <h3 className="text-base font-semibold">Tambah Tugas</h3>
              <button className="rounded p-1 text-gray-500 hover:bg-gray-100" onClick={()=>setShowForm(false)}>✕</button>
            </div>
            <div className="px-5 py-4">
              <div className="grid grid-cols-1 gap-3">
                <div>
                  <label className="mb-1 block text-sm text-gray-700">Tugas saya<span className="text-red-500">*</span></label>
                  <input
                    className="w-full rounded border px-3 py-2"
                    placeholder="Tulis tugas Anda"
                    value={form.tugas_saya}
                    onChange={(e)=>setForm(f=>({ ...f, tugas_saya: e.target.value }))}
                    autoFocus
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm text-gray-700">Ditugaskan ke (opsional)</label>
                  <select
                    className="w-full rounded border px-3 py-2 bg-white"
                    value={form.id_user}
                    onChange={(e)=>setForm(f=>({ ...f, id_user: e.target.value }))}
                  >
                    <option value="">Pilih User</option>
                    {users.map(u => (
                      <option key={u.id} value={u.id}>{u.nama}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
            <div className="flex items-center justify-end gap-2 border-t px-5 py-3">
              <button className="rounded border px-4 py-2" onClick={()=>setShowForm(false)}>Batal</button>
              <button
                className="rounded bg-red-600 text-white px-4 py-2 hover:bg-red-700"
                onClick={async ()=>{
                  if (!form.tugas_saya.trim()) { alert('Tugas wajib diisi'); return }
                  const payload = { tugas_saya: form.tugas_saya.trim() }
                  if (String(form.id_user).trim() !== '') payload.id_user = Number(form.id_user)
                  const resp = await tugasSayaService.create(payload)
                  if (resp?.success) {
                    setForm({ tugas_saya: '', id_user: '' })
                    setShowForm(false)
                    fetchData()
                    toast.success('Tugas berhasil dibuat')
                  } else {
                    toast.error(resp?.message || 'Gagal menyimpan tugas')
                  }
                }}
              >Simpan</button>
            </div>
          </div>
        </div>
      )}

      <div className="rounded-lg border bg-white overflow-hidden mx-0 md:mx-6 mt-4 md:mt-6">
        <div className="relative overflow-x-auto max-h-[60vh] overflow-y-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="sticky top-0 bg-red-700 z-10">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-extrabold text-white uppercase tracking-wider">NO</th>
                <th className="px-4 py-3 text-left text-xs font-extrabold text-white uppercase tracking-wider">TUGAS SAYA</th>
                <th className="px-4 py-3 text-left text-xs font-extrabold text-white uppercase tracking-wider">DIBUAT OLEH</th>
                <th className="px-4 py-3 text-left text-xs font-extrabold text-white uppercase tracking-wider">DITUGASKAN KE</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan={4} className="px-4 py-6 text-center text-gray-100">Memuat data…</td>
                </tr>
              ) : data.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-4 py-6 text-center text-gray-500">Tidak ada data</td>
                </tr>
              ) : (
                data.map((row, idx) => (
                  <tr key={row.id || idx} className="hover:bg-gray-50/80">
                    <td className="px-4 py-3 text-sm text-gray-700">{(page - 1) * limit + idx + 1}</td>
                    <td className="px-4 py-3 text-sm text-gray-800">{row.tugas_saya || '-'}</td>
                    <td className="px-4 py-3 text-sm text-gray-700">{row.created_by_name || '-'}</td>
                    <td className="px-4 py-3 text-sm text-gray-700">{row.assignedUser?.nama || row.assignedUser?.name || '-'}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default LeaderTugasSaya
