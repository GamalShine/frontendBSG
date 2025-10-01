import React, { useEffect, useMemo, useState } from 'react'
import { useAuth } from '../../../contexts/AuthContext'
import Card, { CardHeader, CardBody } from '../../../components/UI/Card'
import Button from '../../../components/UI/Button'
import toast from 'react-hot-toast'
import { videoManageService } from '../../../services/videoManageService'

const AdminVideoLibrary = () => {
  const { user } = useAuth()
  const [roleFilter, setRoleFilter] = useState('admin') // admin | leader
  const [list, setList] = useState([])
  const [loading, setLoading] = useState(false)
  const [playingUrl, setPlayingUrl] = useState('')

  const canManage = useMemo(() => user?.role === 'admin' || user?.role === 'owner', [user?.role])

  const load = async () => {
    if (!canManage) return
    try {
      setLoading(true)
      const res = await videoManageService.list(roleFilter)
      const items = res?.data || []
      setList(items)
      // pilih default yang aktif untuk diputar
      const active = items.find(i => i.active)
      setPlayingUrl(active?.url || items[0]?.url || '')
    } catch (e) {
      console.error(e)
      toast.error('Gagal memuat daftar video')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roleFilter, canManage])

  const handleActivate = async (id) => {
    try {
      await videoManageService.setActive(id)
      toast.success('Video dijadikan aktif')
      await load()
    } catch (e) {
      console.error(e)
      toast.error('Gagal menjadikan video aktif')
    }
  }

  const handleDelete = async (id) => {
    try {
      await videoManageService.remove(id)
      toast.success('Video dihapus')
      await load()
    } catch (e) {
      console.error(e)
      toast.error('Gagal menghapus video')
    }
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between mb-2">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Video Library</h1>
          <p className="text-gray-600 mt-2">Kelola kumpulan video per role dan putar video apapun.</p>
        </div>
        <div className="flex items-center gap-2">
          <label className="text-sm text-gray-600">Target Role</label>
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="rounded-md border border-gray-300 px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="admin">Admin</option>
            <option value="leader">Leader</option>
          </select>
          <Button variant="ghost" onClick={load} disabled={loading}>{loading ? 'Memuat...' : 'Refresh'}</Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold text-gray-900">Pemutar Video</h3>
        </CardHeader>
        <CardBody>
          {playingUrl ? (
            <div className="aspect-video w-full bg-black/5 rounded-lg overflow-hidden">
              <video className="w-full h-full" src={playingUrl} controls />
            </div>
          ) : (
            <div className="aspect-video w-full bg-gray-100 rounded-lg flex items-center justify-center text-gray-500">
              Pilih video dari daftar untuk diputar.
            </div>
          )}
        </CardBody>
      </Card>

      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold text-gray-900">Daftar Video ({roleFilter})</h3>
        </CardHeader>
        <CardBody>
          {loading ? (
            <div className="py-10 text-center text-gray-500">Memuat...</div>
          ) : list.length === 0 ? (
            <div className="py-10 text-center text-gray-500">Belum ada video</div>
          ) : (
            <div className="divide-y">
              {list.map(item => (
                <div key={item.id} className="py-3 flex items-center gap-4">
                  <button
                    className="w-40 h-24 bg-gray-100 rounded overflow-hidden flex items-center justify-center hover:ring-2 hover:ring-blue-400"
                    onClick={() => setPlayingUrl(item.url)}
                    title="Putar video ini"
                  >
                    <video src={item.url} className="w-full h-full" />
                  </button>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">{item.filename}</p>
                    <p className="text-xs text-gray-500">{new Date(item.created_at || item.uploadedAt).toLocaleString()}</p>
                    {item.active && <span className="text-xs text-green-600 font-semibold">AKTIF</span>}
                  </div>
                  <div className="flex items-center gap-2">
                    {!item.active && (
                      <Button onClick={() => handleActivate(item.id)} disabled={!canManage}>Jadikan Aktif</Button>
                    )}
                    <Button variant="ghost" onClick={() => handleDelete(item.id)} disabled={!canManage}>Hapus</Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardBody>
      </Card>
    </div>
  )
}

export default AdminVideoLibrary
