import React, { useEffect, useMemo, useState } from 'react'
import api from '../../services/api'
import { API_CONFIG, API_ENDPOINTS } from '../../config/constants'
import { useAuth } from '../../contexts/AuthContext'
import { MENU_CODES } from '@/config/menuCodes'

const TabButton = ({ active, onClick, children }) => (
  <button
    onClick={onClick}
    className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
      active ? 'bg-red-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
    }`}
  >
    {children}
  </button>
)

const SectionCard = ({ title, children, right }) => (
  <div className="bg-white rounded-lg shadow-md p-6">
    <div className="flex items-center justify-between mb-4">
      <h2 className="text-xl font-semibold text-gray-800">{title}</h2>
      {right}
    </div>
    {children}
  </div>
)

const EmptyState = ({ text = 'Belum ada data.' }) => (
  <div className="text-center py-8 text-gray-500">{text}</div>
)

const Loading = () => (
  <div className="py-6 text-gray-500">Memuat data...</div>
)

const ErrorBox = ({ message }) => (
  <div className="p-4 rounded-md bg-red-50 text-red-700 border border-red-200">{message}</div>
)

const StrukturJobdeskSOP = () => {
  const { user } = useAuth()
  const role = user?.role
  const canManage = role === 'admin' || role === 'owner'
  const [activeTab, setActiveTab] = useState('struktur') // struktur | jobdesk | sop

  const [struktur, setStruktur] = useState(null)
  const [jobdesk, setJobdesk] = useState([])
  const [sop, setSop] = useState([])

  const [loading, setLoading] = useState({ struktur: true, jobdesk: true, sop: true })
  const [error, setError] = useState({ struktur: '', jobdesk: '', sop: '' })

  // Modal/form state for Struktur Organisasi
  const [showForm, setShowForm] = useState(false)
  const [formMode, setFormMode] = useState('create') // create | update
  const [form, setForm] = useState({ judul: '', deskripsi: '', foto: null })
  const [preview, setPreview] = useState(null)

  // Collapsible states for Jobdesk/SOP
  const [openJobDiv, setOpenJobDiv] = useState({}) // { [divisiId]: boolean }
  const [openJobDept, setOpenJobDept] = useState({}) // { [deptId]: boolean }
  const [openSopDiv, setOpenSopDiv] = useState({}) // { [divisiId]: boolean }
  const [openSopCat, setOpenSopCat] = useState({}) // { [categoryId]: boolean }

  const imageBase = useMemo(() => (API_CONFIG.BASE_HOST ? `${API_CONFIG.BASE_HOST}/uploads/` : ''), [])

  const fetchAll = async () => {
    // Struktur Organisasi (ambil entri terbaru)
    try {
      setLoading((s) => ({ ...s, struktur: true }))
      const res = await api.get(API_ENDPOINTS.SDM.STRUKTUR_ORGANISASI)
      const data = res.data?.data
      const normalized = Array.isArray(data) ? (data[0] || null) : (data || null)
      setStruktur(normalized)
      setError((e) => ({ ...e, struktur: '' }))
    } catch (err) {
      setError((e) => ({ ...e, struktur: err.response?.data?.message || 'Gagal memuat struktur organisasi' }))
    } finally {
      setLoading((s) => ({ ...s, struktur: false }))
    }

    // Jobdesk (struktur lengkap)
    try {
      setLoading((s) => ({ ...s, jobdesk: true }))
      const res = await api.get(API_ENDPOINTS.SDM.JOBDESK.STRUCTURE)
      const data = res.data?.data || []
      setJobdesk(Array.isArray(data) ? data : [])
      setError((e) => ({ ...e, jobdesk: '' }))
    } catch (err) {
      setError((e) => ({ ...e, jobdesk: err.response?.data?.message || 'Gagal memuat struktur jobdesk' }))
    } finally {
      setLoading((s) => ({ ...s, jobdesk: false }))
    }

    // SOP (struktur lengkap)
    try {
      setLoading((s) => ({ ...s, sop: true }))
      const res = await api.get(API_ENDPOINTS.SDM.SOP.STRUCTURE)
      const data = res.data?.data || []
      setSop(Array.isArray(data) ? data : [])
      setError((e) => ({ ...e, sop: '' }))
    } catch (err) {
      setError((e) => ({ ...e, sop: err.response?.data?.message || 'Gagal memuat struktur SOP' }))
    } finally {
      setLoading((s) => ({ ...s, sop: false }))
    }
  }

  useEffect(() => {
    const init = async () => {
      await fetchAll()
    }
    init()
  }, [])

  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview)
    }
  }, [preview])

  // Handlers for Struktur Organisasi CRUD
  const openCreate = () => {
    setFormMode('create')
    setForm({ judul: '', deskripsi: '', foto: null })
    setShowForm(true)
  }
  const openUpdate = () => {
    setFormMode('update')
    setForm({ judul: struktur?.judul || '', deskripsi: struktur?.deskripsi || '', foto: null })
    setShowForm(true)
  }
  const onFormChange = (e) => {
    const { name, value, files } = e.target
    if (name === 'foto') {
      const file = files?.[0] || null
      setForm((f) => ({ ...f, foto: file }))
      setPreview(file ? URL.createObjectURL(file) : null)
    } else {
      setForm((f) => ({ ...f, [name]: value }))
    }
  }
  const submitForm = async (e) => {
    e.preventDefault()
    try {
      const fd = new FormData()
      fd.append('judul', form.judul)
      fd.append('deskripsi', form.deskripsi)
      if (form.foto) fd.append('foto', form.foto)

      if (formMode === 'create') {
        await api.post(API_ENDPOINTS.SDM.STRUKTUR_ORGANISASI, fd, {
          headers: { 'Content-Type': 'multipart/form-data' },
        })
      } else if (formMode === 'update' && struktur?.id) {
        await api.put(`${API_ENDPOINTS.SDM.STRUKTUR_ORGANISASI}/${struktur.id}`, fd, {
          headers: { 'Content-Type': 'multipart/form-data' },
        })
      }
      setShowForm(false)
      await fetchAll()
    } catch (err) {
      alert(err.response?.data?.message || 'Gagal menyimpan struktur')
    }
  }
  const deleteStruktur = async () => {
    if (!struktur?.id) return
    if (!confirm('Yakin hapus struktur organisasi terbaru ini?')) return
    try {
      await api.delete(`${API_ENDPOINTS.SDM.STRUKTUR_ORGANISASI}/${struktur.id}`)
      await fetchAll()
    } catch (err) {
      alert(err.response?.data?.message || 'Gagal menghapus struktur')
    }
  }


  return (
    <div className="p-0 bg-gray-50 min-h-screen">
    {/* Unified Header with Badge */}
    <div className="bg-red-800 text-white px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <span className="text-sm font-semibold bg-white/10 rounded px-2 py-1">{MENU_CODES.sdm.strukturSOP}</span>
          <div>
            <h1 className="text-xl md:text-2xl font-extrabold tracking-tight">STRUKTUR, JOBDESK & S.O.P.</h1>
            <p className="text-sm text-red-100">Kelola struktur organisasi, jobdesk, dan SOP</p>
          </div>
        </div>
      </div>
    </div>

    <div className="container mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Struktur, Jobdesk & S.O.P.</h1>
        <div className="flex gap-2">
          <TabButton active={activeTab === 'struktur'} onClick={() => setActiveTab('struktur')}>Struktur Organisasi</TabButton>
          <TabButton active={activeTab === 'jobdesk'} onClick={() => setActiveTab('jobdesk')}>Jobdesk</TabButton>
          <TabButton active={activeTab === 'sop'} onClick={() => setActiveTab('sop')}>S.O.P.</TabButton>
        </div>
      </div>

      {activeTab === 'struktur' && (
        <SectionCard
          title="Struktur Organisasi"
          right={
            <div className="flex gap-2">
              <TabButton active={false} onClick={() => fetchAll()}>Refresh</TabButton>
              {canManage && (
                <>
                  <TabButton active={false} onClick={openCreate}>Tambah</TabButton>
                  {struktur && <TabButton active={false} onClick={openUpdate}>Ubah</TabButton>}
                  {struktur && <TabButton active={false} onClick={deleteStruktur}>Hapus</TabButton>}
                </>
              )}
            </div>
          }
        >
          {loading.struktur && <Loading />}
          {error.struktur && <ErrorBox message={error.struktur} />}
          {!loading.struktur && !error.struktur && (
            struktur ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-1">
                  <div className="space-y-2 text-sm text-gray-700">
                    <div><span className="font-medium">Judul:</span> {struktur.judul || '-'}</div>
                    <div><span className="font-medium">Deskripsi:</span> {struktur.deskripsi || '-'}</div>
                    <div className="text-gray-500 text-xs">ID: {struktur.id}</div>
                  </div>
                </div>
                <div className="md:col-span-2">
                  {struktur.foto ? (
                    <img
                      src={`${imageBase}${struktur.foto}`}
                      alt="Struktur Organisasi"
                      className="w-full rounded-md border"
                      onError={(e) => { e.currentTarget.style.display = 'none' }}
                    />
                  ) : (
                    <EmptyState text="Belum ada gambar struktur organisasi." />
                  )}
                </div>
              </div>
            ) : (
              <EmptyState text="Belum ada data struktur organisasi." />
            )
          )}
        </SectionCard>
      )}

      {activeTab === 'jobdesk' && (
        <SectionCard title="Struktur Jobdesk">
          {loading.jobdesk && <Loading />}
          {error.jobdesk && <ErrorBox message={error.jobdesk} />}
          {!loading.jobdesk && !error.jobdesk && (
            jobdesk.length > 0 ? (
              <div className="space-y-3">
                {jobdesk.map((divisi) => {
                  const isOpen = !!openJobDiv[divisi.id]
                  const deptCount = divisi.departments?.length || 0
                  return (
                    <div key={`div-${divisi.id}`} className="border rounded-md bg-white">
                      <button
                        type="button"
                        onClick={() => setOpenJobDiv((s) => ({ ...s, [divisi.id]: !s[divisi.id] }))}
                        className="w-full flex items-center justify-between px-4 py-3 hover:bg-gray-50"
                      >
                        <div className="text-left">
                          <div className="font-semibold text-gray-800 flex items-center gap-2">
                            {divisi.nama_divisi}
                            {divisi.status === 1 && <span className="text-xs text-red-500">(nonaktif)</span>}
                            <span className="ml-2 text-xs bg-gray-100 text-gray-700 rounded px-2 py-0.5">{deptCount} Dept</span>
                          </div>
                          {divisi.keterangan && <div className="text-sm text-gray-600">{divisi.keterangan}</div>}
                        </div>
                        <svg className={`h-5 w-5 text-gray-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.08 1.04l-4.25 4.25a.75.75 0 01-1.06 0L5.21 8.27a.75.75 0 01.02-1.06z" clipRule="evenodd"/></svg>
                      </button>
                      {isOpen && (
                        <div className="px-4 pb-4">
                          {deptCount > 0 ? (
                            <div className="space-y-2">
                              {divisi.departments.map((dept) => {
                                const open = !!openJobDept[dept.id]
                                const posCount = dept.positions?.length || 0
                                return (
                                  <div key={`dept-${dept.id}`} className="border rounded-md">
                                    <button
                                      type="button"
                                      onClick={() => setOpenJobDept((s) => ({ ...s, [dept.id]: !s[dept.id] }))}
                                      className="w-full flex items-center justify-between px-3 py-2 hover:bg-gray-50"
                                    >
                                      <div className="text-left text-gray-700">
                                        <div className="font-medium flex items-center gap-2">
                                          {dept.nama_department}
                                          {dept.status === 1 && <span className="text-xs text-red-500">(nonaktif)</span>}
                                          <span className="ml-2 text-xs bg-gray-100 text-gray-700 rounded px-2 py-0.5">{posCount} Posisi</span>
                                        </div>
                                      </div>
                                      <svg className={`h-4 w-4 text-gray-500 transition-transform ${open ? 'rotate-180' : ''}`} viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.08 1.04l-4.25 4.25a.75.75 0 01-1.06 0L5.21 8.27a.75.75 0 01.02-1.06z" clipRule="evenodd"/></svg>
                                    </button>
                                    {open && (
                                      <div className="px-3 pb-3">
                                        {posCount > 0 ? (
                                          <div className="mt-2 flex flex-wrap gap-2">
                                            {dept.positions.map((pos) => {
                                              const isNonaktif = pos.status === 1
                                              return (
                                                <span
                                                  key={`pos-${pos.id}`}
                                                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs border ${
                                                    isNonaktif
                                                      ? 'bg-red-50 text-red-700 border-red-200'
                                                      : 'bg-gray-50 text-gray-700 border-gray-200'
                                                  }`}
                                                  title={isNonaktif ? 'Posisi nonaktif' : 'Posisi aktif'}
                                                >
                                                  <span className={`h-1.5 w-1.5 rounded-full ${isNonaktif ? 'bg-red-500' : 'bg-gray-400'}`}></span>
                                                  {pos.nama_position}
                                                  {isNonaktif && <span className="ml-1">(nonaktif)</span>}
                                                </span>
                                              )
                                            })}
                                          </div>
                                        ) : (
                                          <div className="text-xs text-gray-400 mt-1">Tidak ada posisi.</div>
                                        )}
                                      </div>
                                    )}
                                  </div>
                                )
                              })}
                            </div>
                          ) : (
                            <div className="text-sm text-gray-500 mt-2">Tidak ada department.</div>
                          )}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            ) : (
              <EmptyState text="Belum ada data jobdesk." />
            )
          )}
        </SectionCard>
      )}

      {activeTab === 'sop' && (
        <SectionCard title="Struktur S.O.P.">
          {loading.sop && <Loading />}
          {error.sop && <ErrorBox message={error.sop} />}
          {!loading.sop && !error.sop && (
            sop.length > 0 ? (
              <div className="space-y-3">
                {sop.map((div) => {
                  const dOpen = !!openSopDiv[div.id]
                  const catCount = div.categories?.length || 0
                  return (
                    <div key={`sop-div-${div.id}`} className="border rounded-md bg-white">
                      <button
                        type="button"
                        onClick={() => setOpenSopDiv((s) => ({ ...s, [div.id]: !s[div.id] }))}
                        className="w-full flex items-center justify-between px-4 py-3 hover:bg-gray-50"
                      >
                        <div className="font-semibold text-gray-800">
                          {div.nama_divisi}
                          <span className="ml-2 text-xs bg-gray-100 text-gray-700 rounded px-2 py-0.5">{catCount} Kategori</span>
                        </div>
                        <svg className={`h-5 w-5 text-gray-500 transition-transform ${dOpen ? 'rotate-180' : ''}`} viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.08 1.04l-4.25 4.25a.75.75 0 01-1.06 0L5.21 8.27a.75.75 0 01.02-1.06z" clipRule="evenodd"/></svg>
                      </button>
                      {dOpen && (
                        <div className="px-4 pb-4">
                          {catCount > 0 ? (
                            <div className="space-y-2">
                              {div.categories.map((cat) => {
                                const cOpen = !!openSopCat[cat.id]
                                const stepCount = cat.steps?.length || 0
                                return (
                                  <div key={`sop-cat-${cat.id}`} className="border rounded-md">
                                    <button
                                      type="button"
                                      onClick={() => setOpenSopCat((s) => ({ ...s, [cat.id]: !s[cat.id] }))}
                                      className="w-full flex items-center justify-between px-3 py-2 hover:bg-gray-50"
                                    >
                                      <div className="text-gray-700 font-medium">
                                        {cat.nama_category}
                                        <span className="ml-2 text-xs bg-gray-100 text-gray-700 rounded px-2 py-0.5">{stepCount} Langkah</span>
                                      </div>
                                      <svg className={`h-4 w-4 text-gray-500 transition-transform ${cOpen ? 'rotate-180' : ''}`} viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.08 1.04l-4.25 4.25a.75.75 0 01-1.06 0L5.21 8.27a.75.75 0 01.02-1.06z" clipRule="evenodd"/></svg>
                                    </button>
                                    {cOpen && (
                                      <div className="px-3 pb-3">
                                        {stepCount > 0 ? (
                                          <ul className="mt-1 list-disc list-inside space-y-1 text-sm text-gray-700">
                                            {cat.steps.map((step) => (
                                              <li key={`sop-step-${step.id}`}>{step.judul_procedure}</li>
                                            ))}
                                          </ul>
                                        ) : (
                                          <div className="text-xs text-gray-400 mt-1">Tidak ada langkah.</div>
                                        )}
                                      </div>
                                    )}
                                  </div>
                                )
                              })}
                            </div>
                          ) : (
                            <div className="text-sm text-gray-500 mt-2">Tidak ada kategori.</div>
                          )}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            ) : (
              <EmptyState text="Belum ada data SOP." />
            )
          )}
        </SectionCard>
      )}
    </div>

    {/* Modal Form Struktur Organisasi */}
    {showForm && (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
        <div className="bg-white rounded-lg shadow-lg w-full max-w-2xl">
          <div className="flex items-center justify-between px-6 py-4 border-b">
            <h3 className="text-lg font-semibold text-gray-800">{formMode === 'create' ? 'Tambah' : 'Ubah'} Struktur Organisasi</h3>
            <button onClick={() => setShowForm(false)} className="text-gray-500 hover:text-gray-700">✕</button>
          </div>
          <form onSubmit={submitForm} className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Judul <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  name="judul"
                  value={form.judul}
                  onChange={onFormChange}
                  required
                  placeholder="Contoh: Struktur Organisasi 2025"
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
                />
                <p className="text-xs text-gray-500 mt-1">Berikan judul yang deskriptif.</p>
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Deskripsi</label>
                <textarea
                  name="deskripsi"
                  value={form.deskripsi}
                  onChange={onFormChange}
                  rows={3}
                  placeholder="Tambahkan deskripsi singkat (opsional)"
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Foto (opsional)</label>
                <input
                  type="file"
                  name="foto"
                  accept="image/*"
                  onChange={onFormChange}
                  className="w-full text-sm"
                />
                <p className="text-xs text-gray-500 mt-1">Format: JPG/PNG. Ukuran maksimal mengikuti kebijakan server.</p>
              </div>
              {(preview || (formMode === 'update' && struktur?.foto)) && (
                <div className="md:col-span-1">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Pratinjau</label>
                  <div className="border rounded-md p-2 bg-gray-50">
                    <img
                      src={preview || `${imageBase}${struktur?.foto}`}
                      alt="Preview Struktur"
                      className="max-h-48 w-auto mx-auto rounded"
                      onError={(e) => { e.currentTarget.style.display = 'none' }}
                    />
                  </div>
                </div>
              )}
            </div>
            <div className="flex items-center justify-end gap-2 mt-6">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="px-4 py-2 rounded-md bg-gray-100 text-gray-700 hover:bg-gray-200"
              >
                Batal
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-md bg-red-600 text-white hover:bg-red-700"
              >
                Simpan
              </button>
            </div>
          </form>
        </div>
      </div>
    )}
    </div>
  )
}

export default StrukturJobdeskSOP