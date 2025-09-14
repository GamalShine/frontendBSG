import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, ChevronDown, ChevronRight, Users, Search } from 'lucide-react';
import { adminSdmService } from '@/services/adminSdmService';
import { MENU_CODES } from '@/config/menuCodes';

const AdminDataTim = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [hierarchy, setHierarchy] = useState([]); // divisi -> jabatan -> employees
  const [expandedDivisi, setExpandedDivisi] = useState({});
  const [expandedJabatan, setExpandedJabatan] = useState({});
  const [search, setSearch] = useState('');

  const fetchHierarchy = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await adminSdmService.getHierarchy();
      if (!res?.success) throw new Error(res?.message || 'Gagal memuat hierarchy');
      const data = res.data || [];
      setHierarchy(data);
    } catch (err) {
      setError(err.message || 'Terjadi kesalahan');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchHierarchy(); }, []);

  const filteredHierarchy = useMemo(() => {
    if (!search.trim()) return hierarchy;
    const q = search.toLowerCase();
    // Filter pada level employees; pertahankan struktur divisi/jabatan yang punya hasil
    return hierarchy.map(div => {
      const jabs = (div.children || []).map(jab => {
        const emps = (jab.children || []).filter(emp =>
          (emp.name || '').toLowerCase().includes(q) ||
          (emp.email || '').toLowerCase().includes(q) ||
          (jab.name || '').toLowerCase().includes(q) ||
          (div.name || '').toLowerCase().includes(q)
        );
        return { ...jab, children: emps };
      }).filter(j => j.children && j.children.length > 0);
      return { ...div, children: jabs };
    }).filter(d => d.children && d.children.length > 0);
  }, [hierarchy, search]);

  const toggleDivisi = (id) => setExpandedDivisi(prev => ({ ...prev, [id]: !prev[id] }));
  const toggleJabatan = (id) => setExpandedJabatan(prev => ({ ...prev, [id]: !prev[id] }));

  return (
    <div className="p-0 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="bg-red-800 text-white px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span className="text-sm font-semibold bg-white/10 rounded px-2 py-1">{MENU_CODES.sdm.dataTim}</span>
            <div>
              <h1 className="text-xl md:text-2xl font-extrabold tracking-tight">DATA TIM</h1>
              <p className="text-sm text-red-100">Kelola data tim: divisi, jabatan, dan karyawan</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => navigate('/admin/sdm/jabatan') } className="px-3 py-1.5 rounded-full border border-white/60 text-white hover:bg-white/10">JABATAN</button>
            <button onClick={() => navigate('/admin/sdm/divisi') } className="px-3 py-1.5 rounded-full border border-white/60 text-white hover:bg-white/10">DIVISI</button>
            <button onClick={() => navigate('/admin/sdm/tim/new')} className="inline-flex items-center gap-2 px-4 py-2 bg-white text-red-700 rounded-lg hover:bg-red-50 transition-colors shadow-sm">
              <Plus className="h-4 w-4" />
              <span className="font-semibold">Tambah</span>
            </button>
          </div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="px-6 py-4 bg-gray-50">
        <div className="max-w-5xl">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Cari nama tim, jabatan, divisi..." className="pl-10 pr-3 py-2 w-full border rounded-lg text-sm focus:ring-2 focus:ring-red-500 focus:border-transparent" />
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="px-6 pb-8">
        <div className="max-w-5xl mx-auto">
          <div className="bg-white rounded-xl shadow-sm border">
            {loading && <div className="p-8 text-center text-gray-500">Memuat data...</div>}
            {error && !loading && <div className="p-8 text-center text-red-600">{error}</div>}
            {!loading && !error && (
              <div className="divide-y">
                {(filteredHierarchy || []).map(div => {
                  const totalDiv = (div.children || []).reduce((acc, j) => acc + (j.children?.length || 0), 0);
                  const openDiv = !!expandedDivisi[div.id];
                  return (
                    <div key={div.id} className="p-4">
                      <button onClick={() => toggleDivisi(div.id)} className="w-full flex items-center justify-between text-left">
                        <div className="flex items-center gap-2">
                          {openDiv ? <ChevronDown className="h-5 w-5 text-gray-600" /> : <ChevronRight className="h-5 w-5 text-gray-600" />}
                          <span className="font-semibold text-gray-800">{div.name}</span>
                        </div>
                        <span className="text-sm text-gray-600">{totalDiv} orang</span>
                      </button>
                      {openDiv && (
                        <div className="mt-3 ml-7 space-y-2">
                          {(div.children || []).map(jab => {
                            const openJab = !!expandedJabatan[jab.id];
                            return (
                              <div key={jab.id} className="border rounded-lg">
                                <div className="px-3 py-2 bg-gray-50 flex items-center justify-between">
                                  <button onClick={() => toggleJabatan(jab.id)} className="flex items-center gap-2">
                                    {openJab ? <ChevronDown className="h-4 w-4 text-gray-600" /> : <ChevronRight className="h-4 w-4 text-gray-600" />}
                                    <span className="font-medium text-gray-700">{jab.name}</span>
                                  </button>
                                  <span className="text-xs text-gray-600">{jab.children?.length || 0} orang</span>
                                </div>
                                {openJab && (
                                  <div className="divide-y">
                                    {(jab.children || []).map(emp => (
                                      <div key={emp.id} className="px-3 py-3 flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                          <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-red-100 text-red-700"><Users className="h-4 w-4" /></span>
                                          <div>
                                            <div className="font-semibold text-gray-900">{emp.name}</div>
                                            <div className="text-xs text-gray-500">{emp?.jabatan?.nama_jabatan} • {emp?.jabatan?.divisi?.nama_divisi}</div>
                                          </div>
                                        </div>
                                        <div>
                                          <button onClick={() => navigate(`/admin/sdm/tim/${emp.id}`)} className="text-blue-600 hover:text-blue-800 text-sm">Lihat</button>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
                {(!filteredHierarchy || filteredHierarchy.length === 0) && (
                  <div className="p-8 text-center text-gray-500">Tidak ada data</div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDataTim;



