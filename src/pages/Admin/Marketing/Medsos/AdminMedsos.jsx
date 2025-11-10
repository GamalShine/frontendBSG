import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Card, { CardHeader, CardBody } from '@/components/UI/Card';
import Button from '@/components/UI/Button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/UI/Table';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { mediaSosialService } from '@/services/mediaSosialService';
import { MENU_CODES } from '@/config/menuCodes';
import { Trash2, Edit, Plus, X, ArrowLeft } from 'lucide-react';

const AdminMedsos = () => {
  const monthNames = ['Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember'];

  const [view, setView] = useState('years');
  const [selectedYear, setSelectedYear] = useState(null);
  const [selectedMonthIndex, setSelectedMonthIndex] = useState(null);
  const [years, setYears] = useState([]);
  const [monthsByYear, setMonthsByYear] = useState({}); // {2025: [1,2,3,...]}
  const [monthContent, setMonthContent] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [expandedYears, setExpandedYears] = useState({}); // {2025: true}
  const [monthSummaries, setMonthSummaries] = useState({}); // {'YYYY-MM': { count, lastUpdated }}
  const [loading, setLoading] = useState({ years: false, months: false, content: false });
  const [error, setError] = useState({ years: null, months: null, content: null });
  const navigate = useNavigate();
  const [extraYears, setExtraYears] = useState([]); // Tambahan manual via tombol + Tahun
  const [hiddenYears, setHiddenYears] = useState([]); // Tahun disembunyikan via tombol hapus
  const [lastUpdated, setLastUpdated] = useState('');
  const [selectedItems, setSelectedItems] = useState([]);


  useEffect(() => { loadYears(); loadLastUpdated(); }, []);
  // Sinyal ke Layout: tampilkan FAB saat berada di monthContent Medsos (mobile)
  useEffect(() => {
    try {
      if (typeof document !== 'undefined') {
        if (view === 'monthContent') {
          document.body.setAttribute('data-medsos-month', 'true');
        } else {
          document.body.removeAttribute('data-medsos-month');
        }
      }
    } catch {}
    return () => {
      try { document?.body?.removeAttribute('data-medsos-month'); } catch {}
    };
  }, [view]);
  // Hydrate extra/hidden/expanded from localStorage on mount
  useEffect(() => {
    try {
      const savedExtra = JSON.parse(localStorage.getItem('medsos_extra_years') || '[]');
      if (Array.isArray(savedExtra) && savedExtra.length) setExtraYears(savedExtra);
      const savedHidden = JSON.parse(localStorage.getItem('medsos_hidden_years') || '[]');
      if (Array.isArray(savedHidden) && savedHidden.length) setHiddenYears(savedHidden);
      const savedExpanded = JSON.parse(localStorage.getItem('medsos_expanded_years') || '{}');
      if (savedExpanded && typeof savedExpanded === 'object') setExpandedYears(savedExpanded);
    } catch {}
  }, []);

  const loadLastUpdated = async () => {
    try {
      const res = await mediaSosialService.list({ page: 1, limit: 1 });
      if (res?.success && Array.isArray(res.data) && res.data.length > 0) {
        const item = res.data[0];
        // Normalisasi tanggal agar aman diparse di semua browser
        const raw = item.created_at || item.tanggal_laporan || '';
        const dt = parseToDate(raw);
        setLastUpdated(dt ? dt.toISOString() : '');
      }
    } catch (e) {
      // silent fail
    }
  };

  const loadYears = async () => {
    try {
      setLoading(prev => ({ ...prev, years: true }));
      setError(prev => ({ ...prev, years: null }));
      const res = await mediaSosialService.getYears();
      const ys = res?.data || [];
      // sort desc agar terbaru di atas
      setYears([...ys].sort((a,b)=>b-a));
    } catch (e) {
      setError(prev => ({ ...prev, years: 'Gagal memuat daftar tahun' }));
    } finally {
      setLoading(prev => ({ ...prev, years: false }));
    }
  };

  // Gabungkan years dari API dengan extraYears, sort desc, unik
  const displayYears = useMemo(() => {
    const merged = Array.from(new Set([...(years||[]), ...(extraYears||[])]));
    const filtered = merged.filter(y => !hiddenYears.includes(y));
    return filtered.sort((a,b)=>b-a);
  }, [years, extraYears, hiddenYears]);

  // Prefetch ringkasan bulan untuk tahun-tahun yang sudah dalam keadaan expanded (misal hasil restore dari localStorage)
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

  const toggleYear = async (year) => {
    setExpandedYears(prev => {
      const next = { ...prev, [year]: !prev[year] };
      try { localStorage.setItem('medsos_expanded_years', JSON.stringify(next)); } catch {}
      return next;
    });
    // Lazy fetch months for year when expanding and not loaded yet
    if (!monthsByYear[year]) {
      try {
        setLoading(prev => ({ ...prev, months: true }));
        setError(prev => ({ ...prev, months: null }));
        const res = await mediaSosialService.getMonths(year);
        setMonthsByYear(prev => ({ ...prev, [year]: res?.data || [] }));
      } catch (e) {
        setError(prev => ({ ...prev, months: 'Gagal memuat daftar bulan' }));
        setMonthsByYear(prev => ({ ...prev, [year]: [] }));
      } finally {
        setLoading(prev => ({ ...prev, months: false }));
      }
    }
    // Lazy fetch month summaries when expanding and not yet cached
    const sampleKey = `${year}-01`;
    if (!monthSummaries[sampleKey]) {
      fetchMonthSummariesForYear(year);
    }
  };

  const getMonthsForYear = (year) => Array.from({ length: 12 }, (_, idx) => ({ year, month: idx + 1 }));

  const fetchMonthSummariesForYear = async (year) => {
    try {
      const months = getMonthsForYear(year);
      const requests = months.map(({ year: y, month }) => {
        const key = `${y}-${String(month).padStart(2, '0')}`;
        // Ambil 1 item terbaru di bulan tersebut untuk lastUpdated dan totalItems untuk count
        return mediaSosialService
          .list({ page: 1, limit: 1, year: y, month })
          .then((res) => ({ key, res }))
          .catch(() => ({ key, res: null }));
      });
      const results = await Promise.all(requests);
      setMonthSummaries((prev) => {
        const next = { ...prev };
        results.forEach(({ key, res }) => {
          if (res && res.success) {
            const item = Array.isArray(res.data) && res.data[0] ? res.data[0] : null;
            next[key] = {
              count: res?.pagination?.totalItems ?? 0,
              // Simpan dalam bentuk ISO agar rendering konsisten
              lastUpdated: (() => {
                const raw = item?.created_at || item?.tanggal_laporan || '';
                const dt = parseToDate(raw);
                return dt ? dt.toISOString() : '';
              })()
            };
          } else {
            next[key] = { count: 0, lastUpdated: '' };
          }
        });
        return next;
      });
    } catch {}
  };

  const openMonth = async (monthIndex) => {
    setSelectedMonthIndex(monthIndex);
    setView('monthContent');
    try {
      setLoading(prev => ({ ...prev, content: true }));
      setError(prev => ({ ...prev, content: null }));
      const apiMonth = monthIndex + 1;
      const res = await mediaSosialService.list({ year: selectedYear, month: apiMonth, page: 1, limit: 100 });
      const items = (res?.data || []).map(row => ({ id: row.id, tanggal: new Date(row.tanggal_laporan), keterangan: row.isi_laporan }));
      setMonthContent(items);
      setSelectedItems([]);
    } catch (e) {
      setError(prev => ({ ...prev, content: 'Gagal memuat daftar harian' }));
      setMonthContent([]);
    } finally {
      setLoading(prev => ({ ...prev, content: false }));
    }
  };

  const goBackToYears = () => {
    setView('years');
    setSelectedYear(null);
    setSelectedMonthIndex(null);
    setMonthContent([]);
    setSearchTerm('');
  };
  const goBackToMonths = () => {
    setView('years');
    setSelectedMonthIndex(null);
    setMonthContent([]);
    setSearchTerm('');
  };

  const goToCreatePage = () => {
    const y = selectedYear ?? new Date().getFullYear();
    const m = (selectedMonthIndex ?? new Date().getMonth()) + 1;
    navigate(`/admin/marketing/medsos/form?year=${y}&month=${m}`);
  };
  const goToDetailPage = (id) => navigate(`/admin/marketing/medsos/${id}`);

  const handleCheckboxChange = (id) => {
    setSelectedItems(prev => prev.includes(id) ? prev.filter(x=>x!==id) : [...prev, id]);
  };
  const handleSelectAll = () => {
    if (selectedItems.length === monthContent.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(monthContent.map(it=>it.id));
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Apakah Anda yakin ingin menghapus data ini?')) return;
    try {
      await mediaSosialService.remove(id);
      // reload current month
      if (selectedYear != null && selectedMonthIndex != null) {
        await openMonth(selectedMonthIndex);
      }
    } catch (err) {
      console.error(err);
      alert('Gagal menghapus data');
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
    setExtraYears(prev => {
      const next = prev.includes(yearNum) ? prev : [...prev, yearNum];
      try { localStorage.setItem('medsos_extra_years', JSON.stringify(next)); } catch {}
      return next;
    });
    setExpandedYears(prev => ({ ...prev, [yearNum]: true }));
    fetchMonthSummariesForYear(yearNum);
  };

  const handleDeleteYear = (year) => {
    if (!window.confirm(`Hapus tahun ${year}?`)) return;
    if (extraYears.includes(year)) {
      setExtraYears(prev => {
        const next = prev.filter(y => y !== year);
        try { localStorage.setItem('medsos_extra_years', JSON.stringify(next)); } catch {}
        return next;
      });
    } else {
      setHiddenYears(prev => {
        const next = prev.includes(year) ? prev : [...prev, year];
        try { localStorage.setItem('medsos_hidden_years', JSON.stringify(next)); } catch {}
        return next;
      });
    }
    setExpandedYears(prev => {
      const { [year]: _, ...rest } = prev;
      try { localStorage.setItem('medsos_expanded_years', JSON.stringify(rest)); } catch {}
      return rest;
    });
  };

  const formatDate = (date) => format(date, 'dd MMMM yyyy', { locale: id });
  const isToday = (date) => {
    const d = new Date(date); const now = new Date();
    return d.getFullYear()===now.getFullYear() && d.getMonth()===now.getMonth() && d.getDate()===now.getDate();
  };

  // Utilitas: parsing tanggal yang lebih robust untuk berbagai format string ("YYYY-MM-DD HH:mm:ss", dsb.)
  const parseToDate = (val) => {
    if (!val) return null;
    if (val instanceof Date) return isNaN(val) ? null : val;
    // Coba parse langsung
    let d = new Date(val);
    if (!isNaN(d)) return d;
    if (typeof val === 'string') {
      // Ganti spasi antara tanggal-jam menjadi 'T' agar valid ISO
      const withT = val.replace(' ', 'T');
      d = new Date(withT);
      if (!isNaN(d)) return d;
      // Coba ubah dd/mm/yyyy menjadi yyyy-mm-dd jika pola seperti itu terdeteksi
      const ddmmyyyy = withT.replace(/(\b\d{2})\/(\d{2})\/(\d{4}\b)/, '$3-$2-$1');
      d = new Date(ddmmyyyy);
      if (!isNaN(d)) return d;
    }
    return null;
  };

  const formatDateTimeID = (val) => {
    const d = parseToDate(val);
    return d
      ? d.toLocaleString('id-ID', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })
      : '-';
  };

  // Format singkat sesuai permintaan: tgl/bln/thn. jam  ->  dd/MM/yyyy. HH:mm
  const formatDateTimeShort = (val) => {
    const d = parseToDate(val);
    return d ? format(d, 'dd/MM/yyyy. HH:mm') : '-';
  };

  const FolderIcon = ({ open=false }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={`w-10 h-10 ${open ? 'text-yellow-600' : 'text-yellow-500'}`}>
      <path d="M10.5 4.5a1.5 1.5 0 0 1 1.06.44l1.5 1.5c.28.3.67.46 1.07.46H19.5A2.25 2.25 0 0 1 21.75 9v7.5A2.25 2.25 0 0 1 19.5 18.75h-15A2.25 2.25 0 0 1 2.25 16.5v-9A2.25 2.25 0 0 1 4.5 5.25h5.25z" />
    </svg>
  );

  // Hilangkan tag HTML dari teks agar tidak tampil sebagai HTML di tabel
  const stripHtml = (html = '') => {
    try {
      return String(html).replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
    } catch {
      return String(html || '');
    }
  };

  return (
    <div className="p-0 bg-gray-50 min-h-screen">
      <div className="bg-red-800 text-white px-6 py-2 md:py-4 mb-0 z-0 lg:relative lg:z-[100]">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div>
              <div className="flex items-center gap-4">
                <span className="text-sm font-semibold bg-white/10 rounded px-2 py-1">{MENU_CODES.marketing.medsos}</span>
                <h1 className="text-lg md:text-2xl font-extrabold tracking-tight">MEDIA SOSIAL</h1>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
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
                  onClick={goBackToMonths}
                  className="inline-flex items-center justify-center md:justify-start gap-2 px-0 py-0 h-8 w-8 md:px-4 md:py-2 md:h-auto md:w-auto rounded-full border border-white/60 text-white hover:bg-white/10 transition-colors"
                  aria-label="Kembali"
                  title="Kembali"
                >
                  <span className="md:hidden flex items-center justify-center"><X className="h-4 w-4" /></span>
                  <span className="hidden md:inline-flex items-center gap-2">
                    <ArrowLeft className="h-4 w-4" />
                    <span className="font-semibold">Kembali</span>
                  </span>
                </button>
                {/* Tampilkan tombol tambah hanya di desktop; mobile pakai FAB */}
                <Link
                  to={`/admin/marketing/medsos/form${selectedYear?`?year=${selectedYear}&month=${(selectedMonthIndex??0)+1}`:''}`}
                  className="hidden md:inline-flex items-center gap-2 px-4 py-2 bg-white text-red-700 rounded-lg hover:bg-red-50 transition-colors shadow-sm"
                >
                  <Plus className="h-4 w-4" strokeWidth={2.5} />
                  <span className="font-semibold">Tambah</span>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Subheader: Timestamp berdasarkan data terbaru */}
      <div className="bg-gray-200 px-6 py-2 text-sm text-gray-900">Terakhir diupdate: {formatDateTimeID(lastUpdated)}</div>

      <div className="w-full px-0 md:px-0 mt-4">
        {view === 'years' && (
          <div className="mb-4">
            <div className="space-y-3">
              {loading.years && <div className="text-sm text-gray-600">Memuat daftar tahun...</div>}
              {error.years && <div className="text-sm text-red-600">{error.years}</div>}
              {!loading.years && !error.years && displayYears.map((y) => (
                <div key={y} className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
                  <button
                    type="button"
                    onClick={() => toggleYear(y)}
                    className="w-full px-4 md:px-6 py-2 md:py-3 flex items-center justify-between bg-red-800 text-white hover:bg-red-700 transition-colors"
                  >
                    <div className="flex items-center">
                      <span className="text-lg font-extrabold">{y}</span>
                    </div>
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
                        {getMonthsForYear(y).map(({ month }) => {
                          const idx = month - 1;
                          const label = (monthNames[idx] || `Bulan ${month}`).toUpperCase();
                          const key = `${y}-${String(month).padStart(2, '0')}`;
                          const summary = monthSummaries[key] || { count: 0, lastUpdated: '' };
                          const lastText = formatDateTimeShort(summary.lastUpdated);
                          return (
                            <div
                              key={`${y}-${month}`}
                              className="group p-4 bg-white cursor-pointer border border-gray-200 rounded-xl hover:border-red-300 hover:shadow-md transition-all"
                              onClick={() => { setSelectedYear(y); openMonth(idx); }}
                            >
                              <div className="text-center">
                                <div className="font-extrabold text-gray-900 group-hover:text-red-700 uppercase tracking-wide text-base md:text-lg">{label}</div>
                                <div className="mt-1 text-gray-500 text-xs md:text-sm">{lastText}</div>
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
          </div>
        )}

        {/* Months view dihapus, karena bulan ditampilkan dalam accordion tahun */}

        {view === 'monthContent' && (
          <>
            {/* Kartu filter terpisah */}
            <div className="bg-white shadow-sm border rounded-none overflow-hidden mb-4">
              <div className="px-6 py-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Cari</label>
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="Cari media sosial..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-3 pr-3 py-2 w-full border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-red-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Tanggal</label>
                    <div className="relative">
                      <input
                        type="date"
                        value={dateFilter}
                        onChange={(e)=> setDateFilter(e.target.value)}
                        className="pl-3 pr-3 py-2 w-full border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-red-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Kartu konten bulan terpisah */}
            <div className="bg-white shadow-sm border rounded-none overflow-hidden">
              <div className="bg-red-800 text-white px-4 md:px-6 py-3 md:py-4">
                <div className="flex items-center">
                  <h2 className="text-lg font-extrabold leading-tight">{(monthNames[selectedMonthIndex] + ' ' + selectedYear).toUpperCase()}</h2>
                </div>
              </div>

              <div className="overflow-x-auto">
                <Table>
                  <TableHeader className="sticky top-0 bg-[#E3E5EA] z-10 shadow">
                    <TableRow className="bg-[#E3E5EA] cursor-default">
                      <TableHead className="w-12 sm:w-16 pl-4 sm:pl-6 pr-4 sm:pr-8 md:pr-12 py-3 text-left !text-[0.9rem] md:text-sm text-gray-900 uppercase tracking-wider cursor-default bg-[#E3E5EA] hover:bg-[#E3E5EA]"><span className="font-black">No</span></TableHead>
                      <TableHead className="px-4 sm:px-8 md:px-12 py-3 text-left !text-[0.9rem] md:text-sm text-gray-900 uppercase tracking-wider cursor-default bg-[#E3E5EA] hover:bg-[#E3E5EA]"><span className="font-black">Tanggal</span></TableHead>
                      <TableHead className="px-4 sm:px-8 md:px-12 py-3 text-left !text-[0.9rem] md:text-sm text-gray-900 uppercase tracking-wider cursor-default bg-[#E3E5EA] hover:bg-[#E3E5EA]"><span className="font-black">Keterangan</span></TableHead>
                      <TableHead className="px-4 sm:px-8 md:px-12 py-3 text-left !text-[0.9rem] md:text-sm text-gray-900 uppercase tracking-wider cursor-default bg-[#E3E5EA] hover:bg-[#E3E5EA]"><span className="font-black">Aksi</span></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                  {!loading.content && !error.content && monthContent.length === 0 && (
                    <TableRow><TableCell colSpan={4}><span className="text-sm text-gray-600">Belum ada data</span></TableCell></TableRow>
                  )}
                  {!loading.content && !error.content && monthContent
                    .filter(it => {
                      const matchesSearch = String(it.keterangan||'').toLowerCase().includes(searchTerm.toLowerCase());
                      if (!dateFilter) return matchesSearch;
                      try {
                        const iso = new Date(it.tanggal).toISOString().slice(0,10);
                        return matchesSearch && iso === dateFilter;
                      } catch { return matchesSearch; }
                    })
                    .map((item, idx) => (
                    <TableRow key={item.id} className="hover:bg-gray-50 cursor-pointer" onClick={() => goToDetailPage(item.id)}>
                      <TableCell className="w-12 sm:w-16 pl-4 sm:pl-6 pr-4 sm:pr-8 md:pr-12 py-1.5 whitespace-nowrap text-sm text-gray-900">{idx + 1}</TableCell>
                      <TableCell className="px-4 sm:px-8 md:px-12 py-1.5 whitespace-nowrap text-sm text-gray-900 font-semibold">{formatDate(item.tanggal).toUpperCase()}</TableCell>
                      <TableCell className="px-4 sm:px-8 md:px-12 py-1.5">
                        <div className="max-w-[14rem] md:max-w-md overflow-hidden text-ellipsis whitespace-nowrap text-sm text-gray-800">{stripHtml(item.keterangan)}</div>
                      </TableCell>
                      <TableCell className="px-4 sm:px-8 md:px-12 py-1.5 whitespace-nowrap text-sm font-medium" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center gap-2">
                          <Link
                            to={`/admin/marketing/medsos/${item.id}/edit`}
                            className="inline-flex items-center justify-center h-8 w-8 rounded-md text-green-600 hover:bg-green-50"
                          >
                            <Edit className="h-4 w-4" />
                          </Link>
                          <button
                            onClick={() => handleDelete(item.id)}
                            className="inline-flex items-center justify-center h-8 w-8 rounded-md text-red-600 hover:bg-red-50"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            </div>
          </>
        )}
      </div>

      {/* Form dibuat di halaman terpisah: /admin/marketing/medsos/form */}
    </div>
  );
};

export default AdminMedsos;
