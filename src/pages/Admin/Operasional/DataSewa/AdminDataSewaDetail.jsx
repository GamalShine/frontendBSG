import React, { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { dataSewaService } from '@/services/dataSewaService'
import { API_CONFIG } from '@/config/constants'

const Row = ({ label, children }) => (
  <div className="grid grid-cols-1 md:grid-cols-3 border-t">
    <div className="px-4 py-2 text-xs md:text-sm font-medium text-gray-600 bg-gray-50">{label}</div>
    <div className="px-4 py-2 md:col-span-2 text-sm text-gray-800">{children || '-'}</div>
  </div>
)

const AdminDataSewaDetail = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const load = async () => {
    try {
      setLoading(true)
      setError(null)
      const res = await dataSewaService.getById(id)
      if (!res?.success) throw new Error(res?.message || 'Gagal memuat data')
      setData(res.data)
    } catch (err) {
      setError(err.message || 'Terjadi kesalahan')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() /* eslint-disable-next-line */ }, [id])

  return (
    <div className="p-0 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="bg-red-800 text-white px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl md:text-2xl font-extrabold tracking-tight">DATA SEWA MENYEWA</h1>
            <p className="text-sm text-red-100">Detail data sewa</p>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => navigate('/admin/operasional/sewa')} className="px-4 py-2 rounded-lg border border-white/60 hover:bg-white/10">Kembali</button>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto mt-6 mb-12 px-6">
        <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
          {loading && <div className="p-10 text-center text-gray-500">Memuat detail...</div>}
          {error && !loading && <div className="p-10 text-center text-red-600">{error}</div>}
          {!loading && !error && data && (
            <div>
              {/* Header tanggal atas */}
              <div className="px-4 py-2 border-b bg-gray-50 text-sm text-gray-700">
                {data.created_at ? new Date(data.created_at).toLocaleDateString('id-ID', { day:'numeric', month:'long', year:'numeric' }) : '-'}
              </div>

              {/* Tabel informasi */}
              <Row label="Nama Aset">{data.nama_aset}</Row>
              <Row label="Jenis Aset">{data.jenis_aset}</Row>
              <Row label="Jangka Waktu Sewa">{data.jangka_waktu_sewa}</Row>
              <Row label="Harga Sewa">{data.harga_sewa}</Row>
              <Row label="Nama Pemilik">{data.nama_pemilik}</Row>
              <Row label="No. HP Pemilik">{data.no_hp_pemilik}</Row>
              <Row label="Alamat Pemilik">{data.alamat_pemilik}</Row>
              <Row label="Mulai Sewa">{data.mulai_sewa ? new Date(data.mulai_sewa).toLocaleDateString('id-ID') : '-'}</Row>
              <Row label="Berakhir Sewa">{data.berakhir_sewa ? new Date(data.berakhir_sewa).toLocaleDateString('id-ID') : '-'}</Row>
              <Row label="Penanggung Jawab Pajak">{data.penanggung_jawab_pajak}</Row>
              <Row label="Kategori Sewa">{data.kategori_sewa}</Row>
              <Row label="Keterangan">{data.keterangan}</Row>
              <Row label="Foto Aset">
                {data.foto_aset ? (
                  <img src={`${API_CONFIG.BASE_HOST}/uploads/data-sewa/${data.foto_aset}`} alt="Foto aset" className="h-40 w-auto object-cover border rounded" />
                ) : (
                  '-'
                )}
              </Row>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default AdminDataSewaDetail
