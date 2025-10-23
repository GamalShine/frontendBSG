import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { adminSdmService } from '@/services/adminSdmService';

const Row = ({ label, children }) => (
  <div className="grid grid-cols-1 md:grid-cols-3 border-t">
    <div className="px-4 py-2 text-xs md:text-sm font-medium text-gray-600 bg-gray-50">{label}</div>
    <div className="px-4 py-2 md:col-span-2 text-sm text-gray-800">{children || '-'}</div>
  </div>
);


const AdminDataTimDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await adminSdmService.getEmployeeById(id);
      if (!res?.success) throw new Error(res?.message || 'Gagal memuat data');
      setData(res.data);
    } catch (err) {
      setError(err.message || 'Terjadi kesalahan');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); /* eslint-disable-next-line */ }, [id]);

  return (
    <div className="p-0 bg-gray-50 min-h-screen">
      <div className="bg-red-800 text-white px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl md:text-2xl font-extrabold tracking-tight">DATA TIM</h1>
            <p className="text-sm text-red-100">Detail anggota tim</p>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => navigate('/admin/sdm/tim')} className="px-4 py-2 rounded-lg border border-white/60 hover:bg-white/10">Kembali</button>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto mt-6 mb-12 px-6">
        <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
          {loading && <div className="p-10 text-center text-gray-500">Memuat detail...</div>}
          {error && !loading && <div className="p-10 text-center text-red-600">{error}</div>}
          {!loading && !error && data && (
            <div>
              <div className="px-4 py-4 border-b">
                <div className="text-lg font-semibold">{data.nama}</div>
                <div className="text-sm text-gray-500">{data?.jabatan?.nama_jabatan} • {data?.jabatan?.divisi?.nama_divisi}</div>
              </div>

              {/* Informasi Personal */}
              <div className="px-4 py-3 bg-gray-50 text-sm font-semibold text-gray-700">Informasi Personal</div>
              <Row label="Nama Lengkap">{data.nama}</Row>
              <Row label="Email">{data.email}</Row>
              <Row label="No. HP">{data.no_hp}</Row>
              <Row label="Tempat Lahir">{data.tempat_lahir}</Row>
              <Row label="Tanggal Lahir">{data.tanggal_lahir ? new Date(data.tanggal_lahir).toLocaleDateString('id-ID') : '-'}</Row>
              <Row label="Media Sosial">{data.media_sosial}</Row>

              {/* Keluarga */}
              <div className="px-4 py-3 bg-gray-50 text-sm font-semibold text-gray-700">Informasi Keluarga</div>
              <Row label="Nama Pasangan">{data.nama_pasangan}</Row>
              <Row label="Nama Anak">{data.nama_anak}</Row>
              <Row label="No. HP Pasangan">{data.no_hp_pasangan}</Row>
              <Row label="Kontak Darurat">{data.kontak_darurat}</Row>

              {/* Alamat */}
              <div className="px-4 py-3 bg-gray-50 text-sm font-semibold text-gray-700">Informasi Alamat</div>
              <Row label="Alamat Sekarang">{data.alamat_sekarang}</Row>
              <Row label="Link Google Map Sekarang">{data.link_map_sekarang ? (<a className="text-blue-600 hover:underline" href={data.link_map_sekarang} target="_blank" rel="noreferrer">Buka Link</a>) : '-'}</Row>
              <Row label="Alamat Asal">{data.alamat_asal}</Row>
              <Row label="Link Google Map Asal">{data.link_map_asal ? (<a className="text-blue-600 hover:underline" href={data.link_map_asal} target="_blank" rel="noreferrer">Buka Link</a>) : '-'}</Row>
              <Row label="Nama Orang Tua">{data.nama_orang_tua}</Row>
              <Row label="Alamat Orang Tua">{data.alamat_orang_tua}</Row>
              <Row label="Link Google Map Orang Tua">{data.link_map_orang_tua ? (<a className="text-blue-600 hover:underline" href={data.link_map_orang_tua} target="_blank" rel="noreferrer">Buka Link</a>) : '-'}</Row>

              {/* Kerja */}
              <div className="px-4 py-3 bg-gray-50 text-sm font-semibold text-gray-700">Informasi Kerja</div>
              <Row label="Tanggal Bergabung">{data.tanggal_bergabung ? new Date(data.tanggal_bergabung).toLocaleDateString('id-ID') : '-'}</Row>
              <Row label="Lama Bekerja">{data.lama_bekerja}</Row>
              <Row label="Divisi">{data?.jabatan?.divisi?.nama_divisi}</Row>
              <Row label="Jabatan">{data?.jabatan?.nama_jabatan}</Row>

              {/* Training */}
              <Row label="Data Training">{`DASAR ${data.training_dasar ? '✓' : '✗'}, SKILLO ${data.training_skillo ? '✓' : '✗'}, LEADERSHIP ${data.training_leadership ? '✓' : '✗'}, LANJUTAN ${data.training_lanjutan ? '✓' : '✗'}`}</Row>

            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDataTimDetail;
