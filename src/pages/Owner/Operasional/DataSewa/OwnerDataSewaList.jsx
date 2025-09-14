import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { dataSewaService } from '@/services/dataSewaService';
import { Search, ChevronDown, ChevronUp, FileText } from 'lucide-react';
import { MENU_CODES } from '@/config/menuCodes';

const OwnerDataSewaList = () => {
  const navigate = useNavigate();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [kategori, setKategori] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [categories, setCategories] = useState([]);
  const [expandedCategories, setExpandedCategories] = useState(new Set());

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
    const byKategori = kategori === 'all' ? data : (data || []).filter(d => (d.kategori_sewa || '').toLowerCase() === (kategori || '').toLowerCase());
    if (!searchTerm) return byKategori;
    const q = searchTerm.toLowerCase();
    return (byKategori || []).filter(d =>
      (d.nama_aset || '').toLowerCase().includes(q) ||
      (d.jenis_aset || '').toLowerCase().includes(q) ||
      (d.kategori_sewa || '').toLowerCase().includes(q)
    );
  }, [data, kategori, searchTerm]);

  // Grouping per kategori
  const groupedData = useMemo(() => {
    const g = {};
    (filtered || []).forEach(item => {
      const key = item.kategori_sewa || 'LAINNYA';
      if (!g[key]) g[key] = [];
      g[key].push(item);
    });
    return g;
  }, [filtered]);

  const toggleCategory = (category) => {
    const next = new Set(expandedCategories);
    next.has(category) ? next.delete(category) : next.add(category);
    setExpandedCategories(next);
  };

  const resetFilters = () => {
    setSearchTerm('');
    setKategori('all');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-red-800 text-white px-4 sm:px-6 py-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div className="flex items-center gap-4 min-w-0">
            <span className="text-sm font-semibold bg-white/10 rounded px-2 py-1">{MENU_CODES.operasional.dataSewa}</span>
            <h1 className="text-xl md:text-2xl font-extrabold tracking-tight">DATA SEWA MENYEWA</h1>
            <p className="text-sm text-red-100 hidden md:block">Daftar data sewa</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={resetFilters}
              aria-label="Reset Filter"
              className="inline-flex items-center gap-2 px-3 py-2 sm:px-4 sm:py-2 rounded-full border border-white/60 text-white hover:bg-white/10"
            >
              <ChevronDown className="h-4 w-4 rotate-90" />
              <span className="hidden sm:inline font-semibold">RESET FILTER</span>
            </button>
            <button
              onClick={load}
              disabled={loading}
              className="inline-flex items-center gap-2 px-3 py-2 sm:px-4 sm:py-2 bg-white text-red-700 rounded-lg hover:bg-red-50 transition-colors shadow-sm disabled:opacity-60"
            >
              <ChevronDown className={`h-4 w-4 rotate-180 ${loading ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline font-semibold">Refresh</span>
            </button>
          </div>
        </div>
      </div>

      {/* Info Bar */}
      <div className="bg-gray-100 px-4 sm:px-6 py-2">
        <p className="text-gray-700 text-sm">Terakhir diupdate: {lastUpdatedText}</p>
      </div>

      {/* Search & Filter */}
      <div className="py-4 bg-white border-b">
        <div className="flex flex-col space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e)=>setSearchTerm(e.target.value)}
              placeholder="Cari aset, jenis, atau kategori..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
            />
          </div>
          <div>
            <select value={kategori} onChange={(e)=>setKategori(e.target.value)} className="w-full border rounded px-3 py-2 text-sm">
              <option value="all">Semua Kategori</option>
              {(categories||[]).map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* List grouped by kategori (accordion) */}
      <div className="pb-8">
        <div className="space-y-4">
          {loading && <div className="text-gray-600">Memuat data...</div>}
          {error && !loading && <div className="text-red-600">{error}</div>}
          {!loading && !error && Object.keys(groupedData).length === 0 && (
            <div className="text-gray-600">Tidak ada data.</div>
          )}

          {Object.entries(groupedData).map(([kategoriKey, items]) => (
            <div key={kategoriKey} className="bg-white rounded-lg border border-gray-200 overflow-hidden">
              <button
                onClick={() => toggleCategory(kategoriKey)}
                className="w-full px-6 py-4 bg-red-800 text-white flex items-center justify-between hover:bg-red-900 transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <FileText className="w-6 h-6" />
                  <span className="text-lg font-semibold">{kategoriKey}</span>
                  <span className="bg-red-700 px-2 py-1 rounded-full text-sm">{items.length}</span>
                </div>
                {expandedCategories.has(kategoriKey) ? (
                  <ChevronUp className="w-5 h-5" />
                ) : (
                  <ChevronDown className="w-5 h-5" />
                )}
              </button>

              {expandedCategories.has(kategoriKey) && (
                <div className="p-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {items.map(item => (
                      <div key={item.id} className="bg-white border border-gray-200 rounded-lg shadow-sm p-4 hover:shadow-md transition-shadow">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-xs px-2 py-0.5 rounded-full bg-red-100 text-red-700 font-medium">{item.kategori_sewa || 'LAINNYA'}</span>
                        </div>
                        <div className="text-base font-semibold text-gray-900 mb-1 break-words">{item.nama_aset || '-'}</div>
                        <div className="text-sm text-gray-600 mb-1">Jenis: <span className="font-medium text-gray-800">{item.jenis_aset || '-'}</span></div>
                        <div className="text-sm text-gray-600">Tanggal: <span className="font-medium text-gray-800">{item.created_at ? new Date(item.created_at).toLocaleDateString('id-ID', { day:'numeric', month:'long', year:'numeric' }) : '-'}</span></div>
                        <div className="mt-3">
                          <button onClick={() => navigate(`/owner/operasional/sewa/${item.id}`)} className="w-full px-3 py-2 bg-red-700 text-white rounded-lg hover:bg-red-800 text-sm">Lihat Detail</button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default OwnerDataSewaList;
