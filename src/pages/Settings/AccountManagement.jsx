import React, { useEffect, useState } from 'react'
import Card, { CardHeader, CardBody } from '../../components/UI/Card'
import Button from '../../components/UI/Button'
import Input from '../../components/UI/Input'
import Select from '../../components/UI/Select'
import Switch from '../../components/UI/Switch'
import toast from 'react-hot-toast'
import { userService } from '../../services/userService'

const defaultForm = {
  id: null,
  nama: '',
  username: '',
  email: '',
  password: '',
  role: 'admin',
  status: 'active'
}

const AccountManagement = () => {
  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [accounts, setAccounts] = useState([])
  const [filterRole, setFilterRole] = useState('')
  const [form, setForm] = useState(defaultForm)
  const [isEdit, setIsEdit] = useState(false)
  const [editLoading, setEditLoading] = useState(false)

  useEffect(() => {
    fetchAccounts()
  }, [filterRole])

  const fetchAccounts = async () => {
    try {
      setLoading(true)
      const res = await userService.getAccounts({ role: filterRole || undefined })
      if (res.success) {
        setAccounts(res.data)
      }
    } catch (err) {
      console.error('Error load accounts:', err)
      if (err?.status === 401 || err?.code === 401) {
        toast.error('Sesi berakhir. Silakan login ulang.')
      } else {
        toast.error('Gagal memuat daftar akun')
      }
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setForm(defaultForm)
    setIsEdit(false)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      setSubmitting(true)

      // Validasi minimal
      if (!form.nama || !form.username || !form.email || (!isEdit && !form.password)) {
        toast.error('Nama, username, email, dan password (saat tambah) wajib diisi')
        return
      }

      if (isEdit && form.id) {
        const payload = { nama: form.nama, username: form.username, email: form.email, role: form.role, status: form.status }
        if (form.password) payload.password = form.password
        const res = await userService.updateUser(form.id, payload)
        if (res.success) {
          toast.success('Akun berhasil diperbarui')
          resetForm()
          fetchAccounts()
        } else {
          toast.error(res.message || 'Gagal memperbarui akun')
        }
      } else {
        const payload = { nama: form.nama, username: form.username, email: form.email, password: form.password, role: form.role, status: form.status }
        const res = await userService.createUser(payload)
        if (res.success) {
          toast.success('Akun berhasil dibuat')
          resetForm()
          fetchAccounts()
        } else {
          toast.error(res.message || 'Gagal membuat akun')
        }
      }
    } catch (err) {
      console.error('Submit error:', err)
      toast.error(err?.message || 'Terjadi kesalahan saat menyimpan akun')
    } finally {
      setSubmitting(false)
    }
  }

  const handleEdit = async (acc) => {
    try {
      setEditLoading(true)
      // Ambil data lengkap user karena endpoint accounts tidak menyertakan username
      const res = await userService.getUserById(acc.id)
      const data = res?.data || {}
      setForm({
        id: data.id || acc.id,
        nama: data.nama ?? acc.nama ?? '',
        username: data.username ?? '',
        email: data.email ?? acc.email ?? '',
        password: '',
        role: data.role ?? acc.role ?? 'admin',
        status: data.status ?? acc.status ?? 'active'
      })
      setIsEdit(true)
    } catch (err) {
      console.error('Load user detail error:', err)
      toast.error('Gagal memuat detail akun')
    } finally {
      setEditLoading(false)
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Hapus akun ini? Tindakan tidak dapat dibatalkan.')) return
    try {
      setSubmitting(true)
      const res = await userService.deleteAccountOwner(id)
      if (res.success) {
        toast.success('Akun berhasil dihapus')
        fetchAccounts()
      } else {
        toast.error(res.message || 'Gagal menghapus akun')
      }
    } catch (err) {
      console.error('Delete error:', err)
      toast.error(err?.message || 'Terjadi kesalahan saat menghapus akun')
    } finally {
      setSubmitting(false)
    }
  }

  const toggleStatus = async (acc) => {
    try {
      const newStatus = acc.status === 'active' ? 'inactive' : 'active'
      const res = await userService.updateAccountStatus(acc.id, newStatus)
      if (res.success) {
        toast.success(`Status diubah ke ${newStatus}`)
        // Update lokal
        setAccounts(prev => prev.map(a => a.id === acc.id ? { ...a, status: newStatus } : a))
      } else {
        toast.error(res.message || 'Gagal mengubah status')
      }
    } catch (err) {
      console.error('Status update error:', err)
      toast.error(err?.message || 'Terjadi kesalahan saat mengubah status')
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">Kelola Akun</h3>
            <div className="flex items-center gap-3">
              <Select
                value={filterRole}
                onValueChange={(val) => setFilterRole(val)}
                options={[
                  { value: '', label: 'Semua Role' },
                  { value: 'owner', label: 'Owner' },
                  { value: 'admin', label: 'Admin' }
                ]}
                placeholder="Pilih role"
              />
              <Button variant="outline" onClick={fetchAccounts}>Muat Ulang</Button>
            </div>
          </div>
        </CardHeader>
        <CardBody>
          {loading ? (
            <div className="py-10 text-center text-gray-500">Memuat data akun...</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nama</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Username</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Aksi</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {accounts.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="px-4 py-6 text-center text-gray-500">Tidak ada data</td>
                    </tr>
                  ) : accounts.map((acc) => (
                    <tr key={acc.id}>
                      <td className="px-4 py-3 whitespace-nowrap">{acc.nama}</td>
                      <td className="px-4 py-3 whitespace-nowrap">{acc.email}</td>
                      <td className="px-4 py-3 whitespace-nowrap capitalize">{acc.role}</td>
                      <td className="px-4 py-3 whitespace-nowrap">{acc.username || '-'}</td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <span className={`text-xs px-2 py-1 rounded-full ${acc.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
                            {acc.status}
                          </span>
                          <Switch checked={acc.status === 'active'} onChange={() => toggleStatus(acc)} />
                        </div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <Button size="sm" variant="outline" onClick={() => handleEdit(acc)} disabled={editLoading}>
                            {editLoading ? 'Memuat...' : 'Edit'}
                          </Button>
                          <Button size="sm" variant="danger" onClick={() => handleDelete(acc.id)} disabled={submitting}>Hapus</Button>
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

      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold text-gray-900">{isEdit ? 'Edit Akun' : 'Tambah Akun'}</h3>
        </CardHeader>
        <CardBody>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Nama</label>
              <Input value={form.nama} onChange={(e) => setForm({ ...form, nama: e.target.value })} placeholder="Nama lengkap" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Username</label>
              <Input value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} placeholder="username" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
              <Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="email@contoh.com" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Password {isEdit && <span className="text-gray-400">(opsional)</span>}</label>
              <Input
                type="password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                placeholder="******"
                autoComplete={isEdit ? 'new-password' : 'new-password'}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Role</label>
              <Select
                value={form.role}
                onValueChange={(val) => setForm({ ...form, role: val })}
                options={[
                  { value: 'admin', label: 'Admin' },
                  { value: 'owner', label: 'Owner' }
                ]}
                placeholder="Pilih role"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
              <Select
                value={form.status}
                onValueChange={(val) => setForm({ ...form, status: val })}
                options={[
                  { value: 'active', label: 'Active' },
                  { value: 'inactive', label: 'Inactive' }
                ]}
                placeholder="Pilih status"
              />
            </div>

            <div className="md:col-span-2 flex gap-3 justify-end mt-2">
              {isEdit && (
                <Button type="button" variant="outline" onClick={resetForm}>Batal</Button>
              )}
              <Button type="submit" disabled={submitting}>{isEdit ? 'Simpan Perubahan' : 'Tambah Akun'}</Button>
            </div>
          </form>
        </CardBody>
      </Card>
    </div>
  )
}

export default AccountManagement
