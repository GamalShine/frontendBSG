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

// Node komponen untuk menampilkan tree struktur (rekursif) + drag & drop
const OrgTreeNode = ({ node, onToggle, onEdit, onAdd, onDelete, onDragStart, onDropHere, onMoveUp, onMoveDown, canManage }) => {
  const [editing, setEditing] = useState(false)
  const [name, setName] = useState(node.name)

  const isBranch = (node.children?.length || 0) > 0
  return (
    <div className="border rounded-md bg-white"
         draggable={canManage}
         onDragStart={(e) => { if (canManage) { e.dataTransfer.setData('text/plain', String(node.id)); onDragStart?.(node.id) } }}
         onDragOver={(e) => { if (canManage) e.preventDefault() }}
         onDrop={(e) => { if (canManage) { e.preventDefault(); const srcId = Number(e.dataTransfer.getData('text/plain')); onDropHere?.(srcId, node.id) } }}
    >
      <div className="flex items-center justify-between px-3 py-2">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => onToggle(node.id)}
            className={`h-5 w-5 flex items-center justify-center rounded border ${isBranch ? 'text-gray-600 bg-gray-50' : 'text-gray-300 bg-gray-50'}`}
            title={node.expanded ? 'Tutup' : 'Buka'}
          >
            {isBranch ? (
              <svg className={`h-4 w-4 transition-transform ${node.expanded ? 'rotate-90' : ''}`} viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M7.21 14.77a.75.75 0 01-.02-1.06L10.94 10 7.19 6.31a.75.75 0 111.06-1.06l4.25 4.25a.75.75 0 010 1.06l-4.25 4.25a.75.75 0 01-1.06-.04z" clipRule="evenodd"/></svg>
            ) : (
              <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><circle cx="10" cy="10" r="2"/></svg>
            )}
          </button>
          {editing ? (
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') { onEdit(node.id, name); setEditing(false) }
                if (e.key === 'Escape') { setEditing(false); setName(node.name) }
              }}
              className="border rounded px-2 py-1 text-sm"
              autoFocus
            />
          ) : (
            <span className="font-medium text-gray-800">{node.name}</span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {!editing && canManage && (
            <>
              <button onClick={() => setEditing(true)} className="text-xs px-2 py-1 rounded bg-gray-100 hover:bg-gray-200">Ubah</button>
              <button onClick={() => onAdd(node.id)} className="text-xs px-2 py-1 rounded bg-gray-100 hover:bg-gray-200">Tambah Anak</button>
              <button onClick={() => onDelete(node.id)} className="text-xs px-2 py-1 rounded bg-red-50 text-red-700 hover:bg-red-100">Hapus</button>
              <button onClick={() => onMoveUp?.(node.id)} className="text-xs px-2 py-1 rounded bg-gray-100 hover:bg-gray-200" title="Naik">▲</button>
              <button onClick={() => onMoveDown?.(node.id)} className="text-xs px-2 py-1 rounded bg-gray-100 hover:bg-gray-200" title="Turun">▼</button>
            </>
          )}
          {editing && (
            <>
              <button onClick={() => { onEdit(node.id, name); setEditing(false) }} className="text-xs px-2 py-1 rounded bg-red-600 text-white hover:bg-red-700">Simpan</button>
              <button onClick={() => { setEditing(false); setName(node.name) }} className="text-xs px-2 py-1 rounded bg-gray-100 hover:bg-gray-200">Batal</button>
            </>
          )}
        </div>
      </div>
      {node.expanded && (node.children?.length > 0) && (
        <div className="pl-4 pb-2 space-y-2">
          {node.children.map((child) => (
            <OrgTreeNode key={child.id} node={child} onToggle={onToggle} onEdit={onEdit} onAdd={onAdd} onDelete={onDelete}
              onDragStart={onDragStart} onDropHere={onDropHere} onMoveUp={onMoveUp} onMoveDown={onMoveDown} canManage={canManage} />
          ))}
        </div>
      )}
    </div>
  )
}

const StrukturJobdeskSOP = () => {
  const { user } = useAuth()
  const role = user?.role
  const canManage = ['admin','owner','divisi','tim'].includes(role)
  const [activeTab, setActiveTab] = useState('struktur') // struktur | jobdesk

  const [struktur, setStruktur] = useState(null)
  const [jobdesk, setJobdesk] = useState([])
  const [sop, setSop] = useState([])

  const [loading, setLoading] = useState({ struktur: true, jobdesk: true, sop: false })
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

  // Struktur organisasi (hardcoded) dengan Owner sebagai root (tanpa JSON)
  const initialTree = useMemo(() => ([
    {
      id: 2,
      name: 'Owner',
      expanded: true,
      children: [
        { id: 3, name: 'Direktur', expanded: true, children: [] },
        { id: 4, name: 'Konsultan (Posisi Pendukung)', expanded: true, children: [] },

        // 1. Manager Produksi
        { id: 10, name: 'Manager Produksi', expanded: true, children: [
          { id: 11, name: 'Leader Toko Tepung', expanded: false, children: [] },
          { id: 12, name: 'Purchasing Order Tepung', expanded: false, children: [] },
          { id: 13, name: 'Sales MP', expanded: false, children: [] },
          { id: 14, name: 'Kasir', expanded: false, children: [] },
          { id: 15, name: 'Sales Web', expanded: false, children: [] },
          { id: 16, name: 'Packing', expanded: false, children: [] },
          { id: 17, name: 'Distribusi', expanded: false, children: [] },
          { id: 18, name: 'Umum', expanded: false, children: [] },
          { id: 19, name: 'Leader Produksi', expanded: false, children: [] },
          { id: 20, name: 'Purchasing Produksi', expanded: false, children: [] },
          { id: 21, name: 'Tim Produksi', expanded: false, children: [] },
        ]},

        // 2. Manager Keuangan
        { id: 30, name: 'Manager Keuangan', expanded: true, children: [
          { id: 31, name: 'Koordinator Keuangan', expanded: false, children: [] },
          { id: 32, name: 'Staff Accounting', expanded: false, children: [] },
          { id: 33, name: 'PIC Keuangan', expanded: false, children: [] },
          { id: 34, name: 'Junior Staff Tax', expanded: false, children: [] },
          { id: 35, name: 'Senior Staff Tax', expanded: false, children: [] },
        ]},

        // 3. Manager HR
        { id: 40, name: 'Manager HR', expanded: true, children: [
          { id: 41, name: 'HR Generalist', expanded: false, children: [] },
          { id: 42, name: 'Trainer', expanded: false, children: [] },
          { id: 43, name: 'GA & Training', expanded: false, children: [] },
        ]},

        // 4. Manager Operasional
        { id: 50, name: 'Manager Operasional', expanded: true, children: [
          { id: 51, name: 'Manager Outlet', expanded: true, children: [
            { id: 52, name: 'Kapten Pelayanan', expanded: true, children: [
              { id: 53, name: 'Pelayanan', expanded: false, children: [] },
              { id: 54, name: 'Umum', expanded: false, children: [] },
            ]},
            { id: 55, name: 'Kapten Koki', expanded: true, children: [
              { id: 56, name: 'Koki', expanded: false, children: [] },
              { id: 57, name: 'Penyajian', expanded: false, children: [] },
            ]},
            { id: 58, name: 'Kasir', expanded: false, children: [] },
            { id: 59, name: 'Admin Pesanan', expanded: false, children: [] },
          ]},
          { id: 60, name: 'Fasilitas', expanded: false, children: [] },
          { id: 61, name: 'QC', expanded: false, children: [] },
        ]},

        // 5. Manager Branding & Marketing
        { id: 70, name: 'Manager Branding & Marketing', expanded: true, children: [
          { id: 71, name: 'Public Relation', expanded: false, children: [] },
          { id: 72, name: 'Team Support', expanded: false, children: [] },
        ]},

        // 6. Leader Digital Marketing
        { id: 80, name: 'Leader Digital Marketing', expanded: true, children: [
          { id: 81, name: 'Medsos Specialist', expanded: false, children: [] },
          { id: 82, name: 'Kreator Konten', expanded: false, children: [] },
          { id: 83, name: 'Ads Specialist', expanded: false, children: [] },
          { id: 84, name: 'Editor', expanded: false, children: [] },
        ]},

        // 7. Support Sistem
        { id: 90, name: 'Support Sistem', expanded: true, children: [] },

        // 8. Audit Internal
        { id: 100, name: 'Audit Internal', expanded: true, children: [] },

        // Tambahan pendukung yang disebut
        { id: 110, name: 'Teknisi', expanded: true, children: [] },
        { id: 111, name: 'Kepala Security', expanded: true, children: [] },
        { id: 112, name: 'Anggota Security', expanded: true, children: [] },
      ]
    }
  ]), [])
  const [tree, setTree] = useState(initialTree)
  const [idCounter, setIdCounter] = useState(112)

  const resetTree = () => {
    setTree(initialTree)
  }

  // Utils untuk memodifikasi tree secara immutabel
  const mapTree = (nodes, mapper) => nodes.map(n => mapper({ ...n, children: n.children ? mapTree(n.children, mapper) : [] }))
  const toggleNode = (nodes, id) => nodes.map(n => {
    if (n.id === id) return { ...n, expanded: !n.expanded }
    return { ...n, children: n.children ? toggleNode(n.children, id) : [] }
  })
  const editNode = (nodes, id, name) => nodes.map(n => {
    if (n.id === id) return { ...n, name }
    return { ...n, children: n.children ? editNode(n.children, id, name) : [] }
  })
  const addChild = (nodes, id, newNode) => nodes.map(n => {
    if (n.id === id) return { ...n, expanded: true, children: [...(n.children || []), newNode] }
    return { ...n, children: n.children ? addChild(n.children, id, newNode) : [] }
  })
  const deleteNode = (nodes, id) => nodes
    .filter(n => n.id !== id)
    .map(n => ({ ...n, children: n.children ? deleteNode(n.children, id) : [] }))

  const handleToggle = (id) => setTree(prev => toggleNode(prev, id))
  const handleEdit = (id, name) => setTree(prev => editNode(prev, id, name))
  const handleAdd = (parentId) => {
    const nextId = idCounter + 1
    setIdCounter(nextId)
    const newNode = { id: nextId, name: 'Posisi Baru', expanded: false, children: [] }
    setTree(prev => addChild(prev, parentId, newNode))
  }
  const handleDelete = (id) => setTree(prev => deleteNode(prev, id))

  // Helper untuk drag & drop
  const findParentOf = (nodes, id, parent = null) => {
    for (const n of nodes) {
      if (n.id === id) return { parent, node: n }
      if (n.children && n.children.length) {
        const res = findParentOf(n.children, id, n)
        if (res) return res
      }
    }
    return null
  }
  const isDescendant = (nodes, ancestorId, targetId) => {
    if (ancestorId === targetId) return true
    const found = findParentOf(nodes, targetId)
    if (!found) return false
    // climb up
    let p = found.parent
    while (p) {
      if (p.id === ancestorId) return true
      p = findParentOf(nodes, p.id)?.parent || null
    }
    return false
  }
  const removeNodeById = (nodes, id) => {
    let removed = null
    const walk = (arr) => arr.flatMap((n) => {
      if (n.id === id) { removed = n; return [] }
      const children = n.children ? walk(n.children) : []
      return [{ ...n, children }]
    })
    return { tree: walk(nodes), removed }
  }
  const appendChild = (nodes, parentId, child) => nodes.map((n) => {
    if (n.id === parentId) return { ...n, expanded: true, children: [ ...(n.children || []), child ] }
    return { ...n, children: n.children ? appendChild(n.children, parentId, child) : [] }
  })
  const moveNode = (sourceId, targetId) => {
    setTree((prev) => {
      if (!Number.isFinite(sourceId) || !Number.isFinite(targetId)) return prev
      if (isDescendant(prev, sourceId, targetId)) return prev // cegah drop ke dirinya/keturunannya
      const { tree: without, removed } = removeNodeById(prev, sourceId)
      if (!removed) return prev
      return appendChild(without, targetId, removed)
    })
  }
  const moveUp = (id) => setTree((prev) => {
    const helper = (arr) => {
      const idx = arr.findIndex(n => n.id === id)
      if (idx > 0) {
        const copy = [...arr]
        const temp = copy[idx-1]; copy[idx-1] = copy[idx]; copy[idx] = temp
        return copy
      }
      return arr.map(n => ({ ...n, children: n.children ? helper(n.children) : [] }))
    }
    return helper(prev)
  })
  const moveDown = (id) => setTree((prev) => {
    const helper = (arr) => {
      const idx = arr.findIndex(n => n.id === id)
      if (idx >= 0 && idx < arr.length - 1) {
        const copy = [...arr]
        const temp = copy[idx+1]; copy[idx+1] = copy[idx]; copy[idx] = temp
        return copy
      }
      return arr.map(n => ({ ...n, children: n.children ? helper(n.children) : [] }))
    }
    return helper(prev)
  })

  const fetchAll = async () => {
    // Struktur Organisasi: gunakan initialTree (hardcoded)
    setLoading((s) => ({ ...s, struktur: true }))
    setTree(initialTree)
    setError((e) => ({ ...e, struktur: '' }))
    setLoading((s) => ({ ...s, struktur: false }))

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

    // SOP dimatikan untuk semua role -> tidak fetch apapun
    setLoading((s) => ({ ...s, sop: false }))
  }

  useEffect(() => {
    const init = async () => {
      await fetchAll()
    }
    init()
  }, [])

  // Pastikan tidak pernah berada di tab SOP untuk semua role
  useEffect(() => {
    if (activeTab === 'sop') {
      setActiveTab('struktur')
    }
  }, [role, activeTab])

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
            <h1 className="text-xl md:text-2xl font-extrabold tracking-tight">STRUKTUR & JOBDESK</h1>
            <p className="text-sm text-red-100">Kelola struktur organisasi dan jobdesk</p>
          </div>
        </div>
      </div>
    </div>

    <div className="container mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">BOSGIL GROUP 2025</h1>
        <div className="flex gap-2">
          <TabButton active={activeTab === 'struktur'} onClick={() => setActiveTab('struktur')}>Struktur Organisasi</TabButton>
          <TabButton active={activeTab === 'jobdesk'} onClick={() => setActiveTab('jobdesk')}>Jobdesk</TabButton>
          {/* Tab SOP dihilangkan untuk semua role */}
        </div>
      </div>

      {activeTab === 'struktur' && (
        <SectionCard
          title="Struktur Organisasi"
          right={
            <div className="flex gap-2">
              <TabButton active={false} onClick={resetTree}>Reset Struktur</TabButton>
              {canManage && (
                <TabButton active={false} onClick={() => handleAdd(tree[0]?.id || 1)}>Tambah Anak ROOT</TabButton>
              )}
            </div>
          }
        >
          {loading.struktur && <Loading />}
          {error.struktur && <ErrorBox message={error.struktur} />}
          {!loading.struktur && !error.struktur && (
            tree && tree.length > 0 ? (
              <div className="space-y-2">
                {tree.map((n) => (
                  <OrgTreeNode key={n.id} node={n}
                    onToggle={handleToggle} onEdit={handleEdit} onAdd={handleAdd} onDelete={handleDelete}
                    onDragStart={() => {}}
                    onDropHere={(srcId, targetId) => moveNode(srcId, targetId)}
                    onMoveUp={moveUp}
                    onMoveDown={moveDown}
                    canManage={canManage}
                  />
                ))}
              </div>
            ) : (
              <EmptyState text="Belum ada struktur. Tambahkan node untuk memulai." />
            )
          )}
          <p className="text-xs text-gray-500 mt-3">Catatan: Ini tampilan dummy yang bisa diubah-ubah (local state). Integrasi simpan ke server bisa ditambahkan nanti.</p>
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

      {/* Section SOP dihilangkan untuk semua role */}
    </div>

    {/* Modal lama untuk upload foto struktur disembunyikan */}
    </div>
  )
}

export default StrukturJobdeskSOP