import React, { useEffect, useMemo, useState } from 'react'
import api from '../../services/api'
import { API_CONFIG, API_ENDPOINTS } from '../../config/constants'
import { useAuth } from '../../contexts/AuthContext'

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
      setForm((f) => ({ ...f, foto: files?.[0] || null }))
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
    <>
    <div className="container mx-auto px-4 py-8">
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
              <div className="space-y-4">
                {jobdesk.map((divisi) => (
                  <div key={`div-${divisi.id}`} className="border rounded-md p-4">
                    <div className="font-semibold text-gray-800">{divisi.nama_divisi} {divisi.status === 1 && <span className="ml-2 text-xs text-red-500">(nonaktif)</span>}</div>
                    {divisi.keterangan && <div className="text-sm text-gray-600 mt-1">{divisi.keterangan}</div>}
                    {divisi.departments?.length ? (
                      <ul className="mt-3 list-disc list-inside space-y-2">
                        {divisi.departments.map((dept) => (
                          <li key={`dept-${dept.id}`}>
                            <div className="text-gray-700">{dept.nama_department} {dept.status === 1 && <span className="ml-1 text-xs text-red-500">(nonaktif)</span>}</div>
                            {dept.positions?.length ? (
                              <ul className="mt-1 list-[circle] list-inside space-y-1 text-sm text-gray-600">
                                {dept.positions.map((pos) => (
                                  <li key={`pos-${pos.id}`}>
                                    {pos.nama_position} {pos.status === 1 && <span className="ml-1 text-xs text-red-500">(nonaktif)</span>}
                                  </li>
                                ))}
                              </ul>
                            ) : (
                              <div className="text-xs text-gray-400 mt-1">Tidak ada posisi.</div>
                            )}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <div className="text-sm text-gray-500 mt-2">Tidak ada department.</div>
                    )}
                  </div>
                ))}
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
              <div className="space-y-4">
                {sop.map((div) => (
                  <div key={`sop-div-${div.id}`} className="border rounded-md p-4">
                    <div className="font-semibold text-gray-800">{div.nama_divisi}</div>
                    {div.categories?.length ? (
                      <ul className="mt-3 list-disc list-inside space-y-2">
                        {div.categories.map((cat) => (
                          <li key={`sop-cat-${cat.id}`}>
                            <div className="text-gray-700">{cat.nama_category}</div>
                            {cat.steps?.length ? (
                              <ul className="mt-1 list-[circle] list-inside space-y-1 text-sm text-gray-600">
                                {cat.steps.map((step) => (
                                  <li key={`sop-step-${step.id}`}>{step.judul_procedure}</li>
                                ))}
                              </ul>
                            ) : (
                              <div className="text-xs text-gray-400 mt-1">Tidak ada langkah.</div>
                            )}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <div className="text-sm text-gray-500 mt-2">Tidak ada kategori.</div>
                    )}
                  </div>
                ))}
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
        <div className="bg-white rounded-lg shadow-lg w-full max-w-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-800">{formMode === 'create' ? 'Tambah' : 'Ubah'} Struktur Organisasi</h3>
            <button onClick={() => setShowForm(false)} className="text-gray-500 hover:text-gray-700">✕</button>
          </div>
          <form onSubmit={submitForm} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Judul</label>
              <input type="text" name="judul" value={form.judul} onChange={onFormChange} required className="w-full border rounded-md px-3 py-2" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Deskripsi</label>
              <textarea name="deskripsi" value={form.deskripsi} onChange={onFormChange} rows={3} className="w-full border rounded-md px-3 py-2" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Foto (opsional)</label>
              <input type="file" name="foto" accept="image/*" onChange={onFormChange} className="w-full" />
              {formMode === 'update' && struktur?.foto && (
                <p className="text-xs text-gray-500 mt-1">Foto sekarang: {struktur.foto}</p>
              )}
            </div>
            <div className="flex items-center justify-end gap-2">
              <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 rounded-md bg-gray-100 text-gray-700">Batal</button>
              <button type="submit" className="px-4 py-2 rounded-md bg-red-600 text-white">Simpan</button>
            </div>
          </form>
        </div>
      </div>
    )}
    </>
  )
}

export default StrukturJobdeskSOP