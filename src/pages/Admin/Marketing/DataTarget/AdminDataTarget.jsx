import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { targetHarianService } from '@/services/targetHarianService';
import LoadingSpinner from '@/components/UI/LoadingSpinner';
import { Plus, Eye, Edit, Trash2, X, ArrowLeft } from 'lucide-react';
import { MENU_CODES } from '@/config/menuCodes';

const AdminDataTarget = () => {
  const navigate = useNavigate();
  const [view, setView] = useState('years'); // 'years' | 'monthContent'
  const [years, setYears] = useState([]); // [{year: 2024}, ...]
  const [selectedYear, setSelectedYear] = useState(null);
  const [selectedMonth, setSelectedMonth] = useState(null); // 1-12
  const [dateFilter, setDateFilter] = useState(''); // YYYY-MM-DD
  const [items, setItems] = useState([]);
  const [pagination, setPagination] = useState({ currentPage: 1, totalPages: 1, totalItems: 0 });
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({ totalRecords: 0, totalNominal: 0 });
  const [lastUpdated, setLastUpdated] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedYears, setExpandedYears] = useState({}); // {2025:true}
  const [extraYears, setExtraYears] = useState([]);
  const [hiddenYears, setHiddenYears] = useState([]);
  const [monthSummaries, setMonthSummaries] = useState({}); // {'YYYY-MM':{count,lastUpdated}}
  const [selectedItems, setSelectedItems] = useState([]);

  useEffect(() => {
    if (view === 'years') {
      loadYears();
      loadStatsAndLastUpdated();
    } else if (view === 'monthContent' && selectedYear) {
      loadItems(selectedYear, pagination.currentPage);
    }
  }, [view, selectedYear, pagination.currentPage]);

  // Sinyal ke Layout: tampilkan FAB saat berada di monthContent Data Target (mobile)
  useEffect(() => {
    try {
      if (typeof document !== 'undefined') {
        if (view === 'monthContent') {
          document.body.setAttribute('data-datatarget-month', 'true');
        } else {
          document.body.removeAttribute('data-datatarget-month');
        }
      }
    } catch {}
    return () => {
      try { document?.body?.removeAttribute('data-datatarget-month'); } catch {}
    };
  }, [view]);

  // Hydrate localStorage for years state
  useEffect(() => {
    try {
      const ex = JSON.parse(localStorage.getItem('dataTarget_extra_years') || '[]');
      if (Array.isArray(ex)) setExtraYears(ex);
      const hid = JSON.parse(localStorage.getItem('dataTarget_hidden_years') || '[]');
      if (Array.isArray(hid)) setHiddenYears(hid);
      const exp = JSON.parse(localStorage.getItem('dataTarget_expanded_years') || '{}');
      if (exp && typeof exp === 'object') setExpandedYears(exp);
    } catch {}
  }, []);

  // Prefetch ringkasan bulan untuk tahun yang sudah expanded (hasil restore)
  // (dipindah ke bawah setelah deklarasi displayYears untuk menghindari TDZ)

  const loadYears = async () => {
    try {
      setLoading(true);
      const res = await targetHarianService.getYears();
      const ysRaw = res?.success ? (res.data || []) : [];
      // Normalisasi: backend bisa mengembalikan [{year:2025}, ...] atau [2025, ...]
      const ys = ysRaw
        .map((it) => (it && typeof it === 'object' && 'year' in it ? Number(it.year) : Number(it)))
        .filter((n) => Number.isFinite(n));
      setYears(ys);
    } catch (e) {
      console.error('Error loading years:', e);
      setYears([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Apakah Anda yakin ingin menghapus data taget ini?')) return;
    try {
      const res = await targetHarianService.remove(id);
      if (res?.success !== false) {
        // Reload current page data
        await loadItems(selectedYear, pagination.currentPage);
      } else {
        alert(res?.error || 'Gagal menghapus data');
      }
    } catch (e) {
      console.error('Gagal menghapus taget:', e);
      alert('Gagal menghapus data');
    }
  };

  const loadStatsAndLastUpdated = async () => {
    try {
      const res = await targetHarianService.getAll({ page: 1, limit: 1000 });
      if (res?.success) {
        const its = Array.isArray(res.data) ? res.data : [];
        const totalRecords = res.pagination?.totalItems ?? its.length;
        // Tidak ada nominal di tabel 'taget'; set 0
        const totalNominal = 0;
        setStats({ totalRecords, totalNominal });
        const latest = its.reduce((max, it) => {
          const t = new Date(it.updated_at || it.created_at || it.tanggal_target).getTime();
          return Math.max(max, isFinite(t) ? t : 0);
        }, 0);
        setLastUpdated(latest ? new Date(latest) : new Date());
      } else {
        setStats({ totalRecords: 0, totalNominal: 0 });
        setLastUpdated(new Date());
      }
    } catch (e) {
      console.error('Error loading stats/lastUpdated:', e);
      setStats({ totalRecords: 0, totalNominal: 0 });
      setLastUpdated(new Date());
    }
  };

  const loadItems = async (year, page = 1) => {
    try {
      setLoading(true);
      const res = await targetHarianService.getAll({ year, page, limit: 20 });
      if (res?.success) {
        setItems(Array.isArray(res.data) ? res.data : []);
        setPagination(res.pagination || { currentPage: 1, totalPages: 1, totalItems: 0 });
      } else {
        setItems([]);
        setPagination({ currentPage: 1, totalPages: 1, totalItems: 0 });
      }
    } catch (e) {
      console.error('Error loading data target:', e);
      setItems([]);
      setPagination({ currentPage: 1, totalPages: 1, totalItems: 0 });
    } finally {
      setLoading(false);
    }
  };

  const toggleYear = async (year) => {
    setExpandedYears((prev) => {
      const next = { ...prev, [year]: !prev[year] };
      try { localStorage.setItem('dataTarget_expanded_years', JSON.stringify(next)); } catch {}
      return next;
    });
    // Prefetch summaries for this year
    const keyProbe = `${year}-01`;
    if (!monthSummaries[keyProbe]) {
      await fetchMonthSummariesForYear(year);
    }
  };

  const backToYears = () => {
    setView('years');
    setSelectedYear(null);
    setSelectedMonth(null);
    setItems([]);
    setPagination({ currentPage: 1, totalPages: 1, totalItems: 0 });
    setSelectedItems([]);
  };

  const openMonth = (m) => {
    setSelectedMonth(m);
    setPagination((p) => ({ ...p, currentPage: 1 }));
    setView('monthContent');
  };

  const backToMonths = () => {
    setView('yearContent');
    setSelectedMonth(null);
    setSearchTerm('');
  };

  const stripHtml = (html = '') => {
    try {
      return String(html).replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
    } catch {
      return String(html || '');
    }
  };

  const MONTH_NAMES = ['JANUARI','FEBRUARI','MARET','APRIL','MEI','JUNI','JULI','AGUSTUS','SEPTEMBER','OKTOBER','NOVEMBER','DESEMBER'];

  const displayYears = useMemo(() => {
    // Pastikan semua bernilai angka murni
    const baseYears = (years || []).map((y) => Number(y)).filter((n) => Number.isFinite(n));
    const extra = (extraYears || []).map((y) => Number(y)).filter((n) => Number.isFinite(n));
    const merged = Array.from(new Set([...baseYears, ...extra]));
    const hidden = new Set((hiddenYears || []).map((y) => Number(y)).filter((n) => Number.isFinite(n)));
    const filtered = merged.filter((y) => !hidden.has(y));
    return filtered.sort((a, b) => b - a);
  }, [years, extraYears, hiddenYears]);

  // Prefetch ringkasan bulan untuk tahun yang sudah expanded (hasil restore)
  useEffect(() => {
    if (!displayYears || displayYears.length === 0) return;
    displayYears.forEach((y) => {
      if (expandedYears[y]) {
        const sampleKey = `${y}-01`;
        if (!monthSummaries[sampleKey]) {
          fetchMonthSummariesForYear(y);
        }
      }
    });
  }, [displayYears, expandedYears]);

  const formatDateTimeShort = (val) => {
    if (!val) return '-';
    try { const d = new Date(val); if (!isNaN(d)) return d.toLocaleString('id-ID', { day:'2-digit', month:'2-digit', year:'numeric', hour:'2-digit', minute:'2-digit' }).replace(',', '.'); } catch {}
    return '-';
  };

  const fetchMonthSummariesForYear = async (year) => {
    try {
      // Ambil semua data setahun, lalu hitung per bulan di sisi klien
      const res = await targetHarianService.getAll({ year, page: 1, limit: 1000 });
      const arr = Array.isArray(res?.data) ? res.data : [];
      // Group by month
      const byMonth = Array.from({ length: 12 }, () => []);
      arr.forEach((it) => {
        const raw = it.tanggal_target || it.created_at || it.updated_at;
        const d = raw ? new Date(raw) : null;
        if (d && !isNaN(d)) {
          const m = d.getMonth(); // 0-11
          if (m >= 0 && m < 12) byMonth[m].push(it);
        }
      });
      setMonthSummaries((prev) => {
        const next = { ...prev };
        for (let i = 0; i < 12; i++) {
          const mArr = byMonth[i];
          const key = `${year}-${String(i + 1).padStart(2, '0')}`;
          if (!mArr || mArr.length === 0) {
            next[key] = { count: 0, lastUpdated: '' };
          } else {
            // lastUpdated = max dari updated_at/created_at/tanggal_target
            let latest = 0;
            mArr.forEach((it) => {
              const cand = new Date(it.updated_at || it.created_at || it.tanggal_target).getTime();
              if (isFinite(cand)) latest = Math.max(latest, cand);
            });
            next[key] = { count: mArr.length, lastUpdated: latest ? new Date(latest).toISOString() : '' };
          }
        }
        return next;
      });
    } catch {
      // Jika gagal, set semua bulan kosong agar UI tidak salah menampilkan
      setMonthSummaries((prev) => {
        const next = { ...prev };
        for (let i = 1; i <= 12; i++) {
          const key = `${year}-${String(i).padStart(2, '0')}`;
          if (!next[key]) next[key] = { count: 0, lastUpdated: '' };
        }
        return next;
      });
    }
  };

  const handleAddYear = () => {
    const input = window.prompt('Masukkan tahun (YYYY):', String(new Date().getFullYear()));
    if (!input) return;
    const yearNum = Number(input);
    if (!Number.isInteger(yearNum) || yearNum < 2000 || yearNum > 3000) {
      alert('Format tahun tidak valid. Contoh yang valid: 2025');
      return;
    }
    setExtraYears((prev) => {
      const next = prev.includes(yearNum) ? prev : [...prev, yearNum];
      try { localStorage.setItem('dataTarget_extra_years', JSON.stringify(next)); } catch {}
      return next;
    });
    setExpandedYears((prev) => ({ ...prev, [yearNum]: true }));
    fetchMonthSummariesForYear(yearNum);
  };

  const handleDeleteYear = (year) => {
    if (!window.confirm(`Hapus tahun ${year}?`)) return;
    if (extraYears.includes(year)) {
      setExtraYears((prev) => {
        const next = prev.filter((y) => y !== year);
        try { localStorage.setItem('dataTarget_extra_years', JSON.stringify(next)); } catch {}
        return next;
      });
    } else {
      setHiddenYears((prev) => {
        const next = prev.includes(year) ? prev : [...prev, year];
        try { localStorage.setItem('dataTarget_hidden_years', JSON.stringify(next)); } catch {}
        return next;
      });
    }
    setExpandedYears((prev) => {
      const { [year]: _, ...rest } = prev;
      try { localStorage.setItem('dataTarget_expanded_years', JSON.stringify(rest)); } catch {}
      return rest;
    });
  };

  const handleSelectAll = () => {
    if (selectedItems.length === items.length && items.length > 0) {
      setSelectedItems([]);
    } else {
      setSelectedItems(items.map((it) => it.id));
    }
  };

  const handleCheckRow = (id) => {
    setSelectedItems((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const formatCurrency = (num) => {
    if (num == null) return '-';
    try { return `Rp ${Number(num).toLocaleString('id-ID')}`; } catch { return `${num}`; }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-red-800 text-white px-6 py-2 md:py-4 mb-0 z-0 lg:relative lg:z-[100]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 md:gap-4">
            <span className="text-[11px] md:text-sm font-semibold bg-white/10 rounded px-1.5 py-0.5 md:px-2 md:py-1">{MENU_CODES.marketing.dataTarget}</span>
            <div>
              <h1 className="text-lg md:text-2xl font-extrabold tracking-tight">DATA TARGET</h1>
            </div>
          </div>
          {view === 'years' ? (
            <button
              type="button"
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleAddYear(); }}
              className="relative z-30 inline-flex items-center gap-2 px-3 py-0 h-8 md:px-4 md:py-2 md:h-auto bg-white text-red-700 rounded-full hover:bg-red-50 transition-colors shadow-sm pointer-events-auto whitespace-nowrap"
              title="Tambah Tahun"
              aria-label="Tambah Tahun"
              data-add
            >
              <Plus className="h-4 w-4" strokeWidth={2.5} />
              <span className="md:hidden font-semibold leading-none">Thn</span>
              <span className="hidden md:inline font-semibold">Tahun</span>
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={backToYears}
                className="inline-flex items-center justify-center md:justify-start gap-2 px-0 py-0 h-8 w-8 md:px-4 md:py-2 md:h-auto md:w-auto rounded-full border border-white/60 text-white hover:bg-white/10 transition-colors"
                aria-label="Kembali"
                title="Kembali"
              >
                {/* Mobile: X, Desktop: ArrowLeft + teks */}
                <span className="md:hidden flex items-center justify-center"><X className="h-4 w-4" /></span>
                <span className="hidden md:inline-flex items-center gap-2">
                  <ArrowLeft className="h-4 w-4" />
                  <span className="font-semibold">Kembali</span>
                </span>
              </button>
              {/* Tampilkan tombol tambah di header khusus desktop */}
              <Link
                to="/admin/marketing/data-target/new"
                className="hidden md:inline-flex items-center gap-2 px-4 py-2 bg-white text-red-700 rounded-lg hover:bg-red-50 transition-colors shadow-sm"
              >
                <Plus className="h-4 w-4" strokeWidth={2.5} />
                <span className="font-semibold">Tambah</span>
              </Link>
            </div>
          )}
        </div>
      </div>
      <div className="bg-gray-200 px-6 py-2 text-sm text-gray-900 -mt-1">Terakhir diupdate: {(lastUpdated ? new Date(lastUpdated) : new Date()).toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric'})} pukul {(lastUpdated ? new Date(lastUpdated) : new Date()).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit'})}</div>

      <div className="pt-2 pb-4">
        {/* Years as accordion (with expand and month summaries) */}
        {view === 'years' && (
          <div className="px-0 md:px-0 mt-2">
            {loading && (
              <div className="text-sm text-gray-900">Memuat daftar tahun...</div>
            )}
            {!loading && displayYears.length === 0 && (
              <div className="text-sm text-gray-600">Belum ada data</div>
            )}
            {!loading && displayYears.length > 0 && (
              <div className="space-y-3">
                {displayYears.map((y) => (
                  <div key={y} className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
                    <button
                      type="button"
                      onClick={() => toggleYear(y)}
                      className="w-full px-4 md:px-6 py-2 md:py-3 flex items-center justify-between bg-red-800 text-white hover:bg-red-700 transition-colors"
                    >
                      <div className="flex items-center"><span className="text-lg font-extrabold">{y}</span></div>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={(e) => { e.stopPropagation(); handleDeleteYear(y); }}
                          className="inline-flex items-center justify-center h-8 w-8 rounded border border-white/30 text-white hover:bg-white/10"
                          title={`Hapus tahun ${y}`}
                          aria-label={`Hapus tahun ${y}`}
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                        <span className="text-white/90">{expandedYears[y] ? '−' : '+'}</span>
                      </div>
                    </button>
                    {expandedYears[y] && (
                      <div className="px-4 md:px-6 py-3 md:py-4 bg-white">
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                          {MONTH_NAMES.map((label, idx) => {
                            const m = idx + 1;
                            const key = `${y}-${String(m).padStart(2,'0')}`;
                            const summary = monthSummaries[key] || { count: 0, lastUpdated: '' };
                            return (
                              <div key={key} className="group p-4 bg-white cursor-pointer border border-gray-200 rounded-xl hover:border-red-300 hover:shadow-md transition-all" onClick={() => { setSelectedYear(y); openMonth(m); }}>
                                <div className="text-center">
                                  <div className="font-extrabold text-gray-900 group-hover:text-red-700 uppercase tracking-wide text-base md:text-lg">{label}</div>
                                  {/* Last updated: '-' jika kosong */}
                                  <div className="mt-1 text-gray-500 text-xs md:text-sm">{Number(summary.count || 0) > 0 ? formatDateTimeShort(summary.lastUpdated) : '-'}</div>
                                  {/* Badge jumlah: selalu tampil, termasuk 0 laporan */}
                                  <div className="mt-2">
                                    <span className="inline-flex items-center justify-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-gray-100 text-gray-700 border border-gray-200">
                                      {Number(summary.count || 0).toLocaleString('id-ID')} laporan
                                    </span>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* MonthContent: filter + table */}
        {view === 'monthContent' && (
          <div className="px-0 md:px-0">

            {/* Filter Card ala Medsos */}
            <div className="bg-white shadow-sm border rounded-lg overflow-hidden mb-4 mt-3">
              <div className="px-4 md:px-6 py-3">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Cari</label>
                    <input type="text" placeholder="Cari target harian..." value={searchTerm} onChange={(e)=>setSearchTerm(e.target.value)} className="pl-3 pr-3 py-2 w-full border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-red-500 focus:border-transparent" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Tanggal</label>
                    <input type="date" value={dateFilter} onChange={(e)=> setDateFilter(e.target.value)} className="pl-3 pr-3 py-2 w-full border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-red-500 focus:border-transparent" />
                  </div>
                  {/* Tombol Reset dihilangkan */}
                </div>
              </div>
            </div>

            {/* Card konten bulan + Tabel (tanpa radius atas) */}
            <div className="bg-white shadow-sm border rounded-b-lg overflow-hidden">
              <div className="bg-red-800 text-white px-4 md:px-6 py-3 md:py-4">
                <h2 className="text-lg font-extrabold leading-tight">{(MONTH_NAMES[(selectedMonth||1)-1] + ' ' + selectedYear).toUpperCase()}</h2>
              </div>
              {loading ? (
                <LoadingSpinner />
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full table-fixed">
                    <thead className="sticky top-0 bg-[#E3E5EA] z-10 shadow">
                      <tr>
                        <th className="w-12 sm:w-16 pl-4 sm:pl-6 pr-4 sm:pr-8 md:pr-12 py-3 text-left text-[0.9rem] md:text-sm font-extrabold text-gray-900 uppercase tracking-wider">No</th>
                        <th className="px-4 sm:px-8 md:px-12 py-3 text-left text-[0.9rem] md:text-sm font-extrabold text-gray-900 uppercase tracking-wider">Tanggal</th>
                        <th className="px-4 sm:px-8 md:px-12 py-3 text-left text-[0.9rem] md:text-sm font-extrabold text-gray-900 uppercase tracking-wider">Keterangan</th>
                        <th className="px-4 sm:px-8 md:px-12 py-3 text-left text-[0.9rem] md:text-sm font-extrabold text-gray-900 uppercase tracking-wider">Aksi</th>
                      </tr>
                    </thead>
                    <tbody>
                      {items
                        .filter(it => {
                          const m = new Date(it.tanggal_target).getMonth()+1;
                          if (m !== selectedMonth) return false;
                          if (dateFilter && !String(it.tanggal_target || '').startsWith(dateFilter)) return false;
                          if (!searchTerm) return true;
                          return stripHtml(it.isi_target||'').toLowerCase().includes(searchTerm.toLowerCase());
                        })
                        .map((it, idx) => (
                          <tr key={it.id} className="hover:bg-gray-50 cursor-pointer" onClick={() => navigate(`/admin/marketing/data-target/${it.id}`)}>
                            <td className="w-12 sm:w-16 pl-4 sm:pl-6 pr-4 sm:pr-8 md:pr-12 py-1.5 text-[0.95rem] md:text-sm text-gray-900 whitespace-nowrap">{idx+1}</td>
                            <td className="px-4 sm:px-8 md:px-12 py-1.5 text-[0.95rem] md:text-sm text-gray-900 whitespace-nowrap font-semibold">{new Date(it.tanggal_target).toLocaleDateString('id-ID', { day:'2-digit', month:'long', year:'numeric' }).toUpperCase()}</td>
                            <td className="px-4 sm:px-8 md:px-12 py-1.5 text-[0.95rem] md:text-sm text-gray-900">
                              <div className="max-w-[14rem] md:max-w-md overflow-hidden text-ellipsis whitespace-nowrap">
                                {(() => {
                                  const plain = stripHtml(it.isi_target||'');
                                  return plain.length > 120 ? `${plain.slice(0,120)}...` : plain;
                                })()}
                              </div>
                            </td>
                            <td className="px-4 sm:px-8 md:px-12 py-1.5 text-[0.95rem] md:text-sm text-gray-900 whitespace-nowrap" onClick={(e)=>e.stopPropagation()}>
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => navigate(`/admin/marketing/data-target/${it.id}/edit`)}
                                  className="inline-flex items-center justify-center h-8 w-8 rounded-md text-green-600 hover:bg-green-50"
                                  title="Edit"
                                >
                                  <Edit className="h-4 w-4" />
                                </button>
                                <button
                                  onClick={() => handleDelete(it.id)}
                                  className="inline-flex items-center justify-center h-8 w-8 rounded-md text-red-600 hover:bg-red-50"
                                  title="Hapus"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      {(!items || items.filter(it => new Date(it.tanggal_target).getMonth()+1 === selectedMonth).length === 0) && (
                        <tr>
                          <td colSpan={4} className="px-4 py-6 text-center text-sm text-gray-600">Belum ada data</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
      {/* FAB Tambah (mobile only) saat berada di konten bulan */}
      {view === 'monthContent' && (
        <button
          type="button"
          onClick={() => navigate('/admin/marketing/data-target/new')}
          className="md:hidden fixed bottom-6 right-4 z-40 w-14 h-14 rounded-full bg-red-600 text-white shadow-lg flex items-center justify-center active:scale-95"
          aria-label="Tambah Data Target"
        >
          <Plus className="w-6 h-6" />
        </button>
      )}
    </div>
  );
};

export default AdminDataTarget;
