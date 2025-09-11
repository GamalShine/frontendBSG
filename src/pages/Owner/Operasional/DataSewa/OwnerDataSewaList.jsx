import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { dataSewaService } from '@/services/dataSewaService';

const OwnerDataSewaList = () => {
  const navigate = useNavigate();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [kategori, setKategori] = useState('all');
  const [categories, setCategories] = useState([]);

  const load = async () => {
    try {
      setLoading(true);
      setError(null);
      const [allRes, catRes] = await Promise.all([
        dataSewaService.getAll(),
        dataSewaService.getCategories()
      ]);
      setData(allRes?.data || []);
      setCategories(catRes?.data || catRes || []);
    } catch (e) {
      setError(e?.response?.data?.message || 'Gagal memuat data sewa');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const lastUpdatedText = useMemo(() => {
    if (!data || data.length === 0) return '-';
    const dates = data.map(d => d.updated_at || d.created_at).filter(Boolean).map(d => new Date(d).getTime());
    const max = Math.max(...dates);
    if (!isFinite(max)) return '-';
    const dt = new Date(max);
    return `${dt.toLocaleDateString('id-ID')} pukul ${dt.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}`;
  }, [data]);

  const filtered = useMemo(() => {
    if (kategori === 'all') return data;
    return (data || []).filter(d => (d.kategori_sewa || '').toLowerCase() === (kategori || '').toLowerCase());
  }, [data, kategori]);

  return (
    <div className="p-0 bg-gray-50 min-h-screen">
      {/* Header merah */}
      <div className="bg-red-800 text-white px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl md:text-2xl font-extrabold tracking-tight">DATA SEWA MENYEWA</h1>
            <p className="text-sm text-red-100">Daftar data sewa</p>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={load} className="px-4 py-2 rounded-lg border border-white/60 hover:bg-white/10">Refresh</button>
          </div>
        </div>
      </div>

      {/* Last updated */}
      <div className="px-6 py-2 bg-white border-b">
        <div className="text-sm text-gray-600">Terakhir diupdate: {lastUpdatedText}</div>
      </div>

      {/* Toolbar filter */}
      <div className="px-6 py-4 bg-gray-50">
        <div className="max-w-5xl">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label className="block text-sm text-gray-600 mb-1">Filter Kategori</label>
              <select value={kategori} onChange={(e)=>setKategori(e.target.value)} className="w-full border rounded px-3 py-2 text-sm">
                <option value="all">Semua Kategori</option>
                {(categories||[]).map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* List */}
      <div className="px-6 pb-8">
        <div className="max-w-5xl mx-auto space-y-4">
          {loading && <div className="text-gray-600">Memuat data...</div>}
          {error && !loading && <div className="text-red-600">{error}</div>}
          {!loading && !error && filtered.length === 0 && (
            <div className="text-gray-600">Tidak ada data.</div>
          )}

          {filtered.map(item => (
            <div key={item.id} className="bg-white rounded-xl shadow-sm border overflow-hidden">
              <div className="px-4 py-2 border-b bg-gray-50 text-sm text-gray-700">
                {item.created_at ? new Date(item.created_at).toLocaleDateString('id-ID', { day:'numeric', month:'long', year:'numeric' }) : '-'}
              </div>
              <div className="px-4 py-4 grid grid-cols-1 md:grid-cols-2 gap-y-2">
                <div className="text-gray-500">Nama Aset</div>
                <div className="font-medium">{item.nama_aset}</div>
                <div className="text-gray-500">Jenis Aset</div>
                <div className="font-medium">{item.jenis_aset}</div>
                <div className="text-gray-500">Kategori Sewa</div>
                <div className="font-medium">{item.kategori_sewa}</div>
              </div>
              <div className="px-4 pb-4">
                <button onClick={() => navigate(`/owner/operasional/sewa/${item.id}`)} className="px-4 py-2 bg-red-700 text-white rounded-lg hover:bg-red-800">Lihat Detail</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default OwnerDataSewaList;
