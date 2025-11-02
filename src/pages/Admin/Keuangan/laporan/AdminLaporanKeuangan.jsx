import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../../../contexts/AuthContext';
import { laporanKeuanganService } from '../../../../services/laporanKeuanganService';
import { toast } from 'react-hot-toast';
import { 
  Plus, 
  Search, 
  Calendar, 
  Filter,
  Edit,
  Trash2,
  TrendingUp,
  RefreshCw,
  DollarSign,
  ArrowLeft,
  X
} from 'lucide-react';
import LoadingSpinner from '../../../../components/UI/LoadingSpinner';
import { MENU_CODES } from '@/config/menuCodes';

const AdminLaporanKeuangan = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  
  const [laporanKeuangan, setLaporanKeuangan] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [monthFilter, setMonthFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [selectedItems, setSelectedItems] = useState([]); // State untuk selected items
  const [stats, setStats] = useState({
    total_records: 0,
    total_this_month: 0,
    total_this_year: 0
  });
  const [monthsView, setMonthsView] = useState('years'); // 'years' | 'monthContent'
  const [availableMonths, setAvailableMonths] = useState([]); // [{year, month}]
  const [lastUpdated, setLastUpdated] = useState('');
  
  // State terkait tampilan tahun/bulan harus dideklarasikan sebelum dipakai di efek
  const [extraYears, setExtraYears] = useState([]); // tambahan manual dari tombol Tambah Tahun
  const [hiddenYears, setHiddenYears] = useState([]); // tahun disembunyikan via hapus UI
  const [expandedYears, setExpandedYears] = useState({}); // {2024: true}
  const [monthSummaries, setMonthSummaries] = useState({}); // {'YYYY-MM': {count, lastUpdated}}
  // Helper: daftar 12 bulan untuk suatu tahun
  const getMonthsForYear = (year) => Array.from({ length: 12 }, (_, idx) => ({ year, month: idx + 1 }));


  // Sinkronkan state tampilan dengan query URL (?month=YYYY-MM)
  useEffect(() => {
    try {
      const sp = new URLSearchParams(location.search || '');
      const m = sp.get('month');
      if (m) {
        // Masuk tampilan isi bulan
        if (monthsView !== 'monthContent' || monthFilter !== m) {
          setMonthFilter(m);
          setMonthsView('monthContent');
          setCurrentPage(1);
        }
      } else {
        // Kembali ke tampilan years
        if (monthsView !== 'years') {
          setMonthsView('years');
          setMonthFilter('');
          setLaporanKeuangan([]);
          setCurrentPage(1);
        }
      }
    } catch {}
  }, [location.search]);


  // Sinyal ke Layout: sembunyikan/tampilkan FAB sesuai tampilan
  useEffect(() => {
    try {
      if (typeof document !== 'undefined') {
        if (monthsView === 'years') {
          document.body.setAttribute('data-hide-fab', 'true');
          document.body.removeAttribute('data-lapkeu-month');
          document.body.removeAttribute('data-month-filter');
        } else {
          document.body.removeAttribute('data-hide-fab');
          // Beri sinyal kalau sedang di tampilan bulan (tanpa bergantung query URL)
          document.body.setAttribute('data-lapkeu-month', 'true');
          if (monthFilter) {
            document.body.setAttribute('data-month-filter', monthFilter);
          }
        }
      }
    } catch {}
    return () => {
      try {
        if (document?.body) {
          document.body.removeAttribute('data-hide-fab');
          document.body.removeAttribute('data-lapkeu-month');
          document.body.removeAttribute('data-month-filter');
        }
      } catch {}
    };

  // Reset ke halaman pertama saat search atau dateFilter berubah
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, dateFilter]);
  }, [monthsView, monthFilter]);


  useEffect(() => {
    if (user) {
      if (monthsView === 'years') {
        loadAvailableMonths();
        loadLastUpdated();
      } else if (monthsView === 'monthContent') {
        loadLaporanKeuangan();
      }
      loadStats();
    }
  }, [user, monthsView, currentPage, monthFilter, searchTerm, dateFilter]);

  // Load latest report for 'Terakhir diupdate'
  const loadLastUpdated = async () => {
    try {
      const res = await laporanKeuanganService.getAllLaporanKeuangan(1, 1, '', '', '');
      if (res?.success && Array.isArray(res.data) && res.data.length > 0) {
        const item = res.data[0];
        setLastUpdated(item.created_at || item.tanggal_laporan || '');
      }
    } catch (e) {
      // silent fail
    }
  };

  // Hapus tahun: jika bukan extraYears, sembunyikan via hiddenYears (tanpa mengubah data server)
  const handleDeleteYear = (year) => {
    if (!window.confirm(`Hapus tahun ${year}?`)) return;
    if (extraYears.includes(year)) {
      setExtraYears((prev) => {
        const next = prev.filter((y) => y !== year);
        try { localStorage.setItem('laporan_extra_years', JSON.stringify(next)); } catch {}
        return next;
      });
    } else {
      setHiddenYears((prev) => {
        const next = prev.includes(year) ? prev : [...prev, year];
        try { localStorage.setItem('laporan_hidden_years', JSON.stringify(next)); } catch {}
        return next;
      });
    }
    setExpandedYears((prev) => {
      const { [year]: _, ...rest } = prev;
      try { localStorage.setItem('laporan_expanded_years', JSON.stringify(rest)); } catch {}
      return rest;
    });
  };

  // Hydrate extra years and expanded states from localStorage on mount
  useEffect(() => {
    try {
      const savedYears = JSON.parse(localStorage.getItem('laporan_extra_years') || '[]');
      if (Array.isArray(savedYears) && savedYears.length) {
        setExtraYears(savedYears);
      }
      const savedHidden = JSON.parse(localStorage.getItem('laporan_hidden_years') || '[]');
      if (Array.isArray(savedHidden) && savedHidden.length) {
        setHiddenYears(savedHidden);
      }
      const savedExpanded = JSON.parse(localStorage.getItem('laporan_expanded_years') || '{}');
      if (savedExpanded && typeof savedExpanded === 'object') {
        setExpandedYears(savedExpanded);
        // prefetch summaries for expanded years
        Object.keys(savedExpanded).forEach((y) => {
          if (savedExpanded[y]) {
            const yearNum = Number(y);
            const sampleKey = `${yearNum}-01`;
            if (!monthSummaries[sampleKey]) fetchMonthSummariesForYear(yearNum);
          }
        });
      }
    } catch {}
  }, []);

  // Sync across tabs/windows: listen to storage and visibilitychange
  useEffect(() => {
    const reloadFromLocal = () => {
      try {
        const savedYears = JSON.parse(localStorage.getItem('laporan_extra_years') || '[]');
        const savedHidden = JSON.parse(localStorage.getItem('laporan_hidden_years') || '[]');
        const savedExpanded = JSON.parse(localStorage.getItem('laporan_expanded_years') || '{}');
        if (Array.isArray(savedYears)) setExtraYears(savedYears); else setExtraYears([]);
        if (Array.isArray(savedHidden)) setHiddenYears(savedHidden); else setHiddenYears([]);
        if (savedExpanded && typeof savedExpanded === 'object') {
          setExpandedYears(savedExpanded);
          Object.keys(savedExpanded).forEach((y) => {
            if (savedExpanded[y]) {
              const yearNum = Number(y);
              const sampleKey = `${yearNum}-01`;
              if (!monthSummaries[sampleKey]) fetchMonthSummariesForYear(yearNum);
            }
          });
        } else {
          setExpandedYears({});
        }
      } catch {}
    };
    const onStorage = (e) => {
      if (!e) return;
      if (
        e.key === 'laporan_extra_years' ||
        e.key === 'laporan_hidden_years' ||
        e.key === 'laporan_expanded_years'
      ) {
        reloadFromLocal();
      }
    };
    const onVisibility = () => {
      if (document.visibilityState === 'visible') reloadFromLocal();
    };
    window.addEventListener('storage', onStorage);
    document.addEventListener('visibilitychange', onVisibility);
    return () => {
      window.removeEventListener('storage', onStorage);
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, [monthSummaries]);

  // Fetch month summaries for a year (latest item + total count)
  const fetchMonthSummariesForYear = async (year) => {
    try {
      const months = getMonthsForYear(year);
      const requests = months.map(({ month }) => {
        const key = `${year}-${String(month).padStart(2, '0')}`;
        return laporanKeuanganService.getAllLaporanKeuangan(1, 1, '', '', key)
          .then((res) => ({ key, res }))
          .catch(() => ({ key, res: null }));
      });
      const results = await Promise.all(requests);
      setMonthSummaries((prev) => {
        const next = { ...prev };
        results.forEach(({ key, res }) => {
          if (res?.success) {
            const item = Array.isArray(res.data) && res.data[0] ? res.data[0] : null;
            next[key] = {
              count: res?.pagination?.totalItems ?? 0,
              lastUpdated: item?.created_at || item?.tanggal_laporan || ''
            };
          } else {
            next[key] = { count: 0, lastUpdated: '' };
          }
        });
        return next;
      });
    } catch {}
  };

  // Build list of years from availableMonths; fallback to current year
  const currentYear = new Date().getFullYear();
  const yearOptions = useMemo(() => {
    const ys = Array.isArray(availableMonths) ? Array.from(new Set(availableMonths.map(m => m.year))) : [];
    const merged = Array.from(new Set([...ys, ...extraYears]))
      .filter(y => !hiddenYears.includes(y))
      .sort((a,b)=>b-a);
    return merged.length ? merged : [currentYear];
  }, [availableMonths, currentYear, extraYears, hiddenYears]);
  // Range tanggal untuk month view (min/max date input)
  const monthRange = useMemo(() => {
    if (!monthFilter) return { min: '', max: '' };
    const [y, m] = monthFilter.split('-').map(Number);
    if (!y || !m) return { min: '', max: '' };
    const first = new Date(y, m - 1, 1);
    const last = new Date(y, m, 0);
    const toISO = (d) => {
      const tzOff = d.getTimezoneOffset() * 60000;
      return new Date(d.getTime() - tzOff).toISOString().split('T')[0];
    };
    return { min: toISO(first), max: toISO(last) };
  }, [monthFilter]);

  const loadLaporanKeuangan = async () => {
    try {
      setLoading(true);
      const response = await laporanKeuanganService.getAllLaporanKeuangan(
        currentPage,
        10,
        searchTerm || '',
        dateFilter || '',
        monthFilter
      );
      
      if (response.success) {
        setLaporanKeuangan(response.data);
        setTotalPages(response.pagination.totalPages);
        setTotalItems(response.pagination.totalItems);
        // Update last updated based on latest item in current list
        if (Array.isArray(response.data) && response.data.length > 0) {
          // pick newest by created_at then tanggal_laporan
          const newest = [...response.data].sort((a,b)=>{
            const ac = a?.created_at ? new Date(a.created_at).getTime() : 0;
            const bc = b?.created_at ? new Date(b.created_at).getTime() : 0;
            if (bc !== ac) return bc - ac;
            const at = a?.tanggal_laporan ? new Date(a.tanggal_laporan).getTime() : 0;
            const bt = b?.tanggal_laporan ? new Date(b.tanggal_laporan).getTime() : 0;
            return bt - at;
          })[0];
          setLastUpdated(newest?.created_at || newest?.tanggal_laporan || '');
        }
      } else {
        toast.error('Gagal memuat data laporan keuangan');
      }
    } catch (error) {
      console.error('Error loading laporan keuangan:', error);
      toast.error('Gagal memuat data laporan keuangan');
    } finally {
      setLoading(false);
    }
  };

  const loadAvailableMonths = async () => {
    try {
      setLoading(true);
      const res = await laporanKeuanganService.getAvailableMonths();
      if (res?.success) {
        setAvailableMonths(res.data || []);
      } else {
        setAvailableMonths([]);
      }
    } catch (e) {
      console.error('Error loading available months:', e);
      setAvailableMonths([]);
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const response = await laporanKeuanganService.getStats();
      if (response.success) {
        setStats(response.data);
      }
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Apakah Anda yakin ingin menghapus data laporan keuangan ini?')) {
      return;
    }

    try {
      await laporanKeuanganService.deleteLaporanKeuangan(id);
      toast.success('Data laporan keuangan berhasil dihapus');
      loadLaporanKeuangan();
      loadStats();
    } catch (error) {
      console.error('Error deleting laporan keuangan:', error);
      toast.error('Gagal menghapus data laporan keuangan');
    }
  };

  // Handle checkbox selection
  const handleCheckboxChange = (id) => {
    setSelectedItems(prev => {
      if (prev.includes(id)) {
        return prev.filter(item => item !== id);
      } else {
        return [...prev, id];
      }
    });
  };

  // Handle select all
  const handleSelectAll = () => {
    if (selectedItems.length === laporanKeuangan.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(laporanKeuangan.map(item => item.id));
    }
  };

  // Handle bulk delete
  const handleBulkDelete = async () => {
    if (selectedItems.length === 0) {
      toast.error('Pilih data yang akan dihapus');
      return;
    }

    if (!window.confirm(`Apakah Anda yakin ingin menghapus ${selectedItems.length} data laporan keuangan?`)) {
      return;
    }

    try {
      for (const id of selectedItems) {
        await laporanKeuanganService.deleteLaporanKeuangan(id);
      }
      toast.success(`${selectedItems.length} data laporan keuangan berhasil dihapus`);
      setSelectedItems([]);
      loadLaporanKeuangan();
      loadStats();
    } catch (error) {
      console.error('Error bulk deleting:', error);
      toast.error('Gagal menghapus beberapa data laporan keuangan');
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Helper function to extract title from content
  const extractTitle = (content) => {
    if (!content) return 'Laporan Keuangan';
    const lines = content.split('\n');
    for (const line of lines) {
      if (line.startsWith('#')) {
        return line.substring(1).trim();
      }
    }
    return lines[0]?.substring(0, 50) + '...' || 'Laporan Keuangan';
  };

  // Helper function to truncate content
  const truncateContent = (content, maxLength = 100) => {
    if (!content) return '';
    const text = content
      .replace(/\[IMG:\d+\]/g, '') // remove image placeholders
      .replace(/<[^>]*>/g, '')       // strip all HTML tags
      .replace(/#/g, '');            // remove stray heading markers
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
  };

  // Format preview HTML: remove unsafe tags and image placeholders, keep strong/em/u/br
  const formatPreviewHtml = (content) => {
    if (!content) return '';
    let html = String(content);
    // Remove image placeholders
    html = html.replace(/\[IMG:\d+\]/g, '');
    // Normalize <b>/<i> tags
    html = html.replace(/<\s*b\s*>/gi, '<strong>')
               .replace(/<\s*\/\s*b\s*>/gi, '</strong>')
               .replace(/<\s*i\s*>/gi, '<em>')
               .replace(/<\s*\/\s*i\s*>/gi, '</em>');
    // Temporarily protect allowed tags
    const p = {
      so: '%%STRONG_O%%', sc: '%%STRONG_C%%',
      eo: '%%EM_O%%', ec: '%%EM_C%%',
      uo: '%%U_O%%', uc: '%%U_C%%',
      br: '%%BR%%'
    };
    html = html.replace(/<strong>/gi, p.so)
               .replace(/<\/strong>/gi, p.sc)
               .replace(/<em>/gi, p.eo)
               .replace(/<\/em>/gi, p.ec)
               .replace(/<u>/gi, p.uo)
               .replace(/<\/u>/gi, p.uc)
               .replace(/<br\s*\/?\s*>/gi, p.br);
    // Strip other tags
    html = html.replace(/<[^>]*>/g, '');
    // Restore allowed
    html = html.replace(new RegExp(p.so, 'g'), '<strong>')
               .replace(new RegExp(p.sc, 'g'), '</strong>')
               .replace(new RegExp(p.eo, 'g'), '<em>')
               .replace(new RegExp(p.ec, 'g'), '</em>')
               .replace(new RegExp(p.uo, 'g'), '<u>')
               .replace(new RegExp(p.uc, 'g'), '</u>')
               .replace(new RegExp(p.br, 'g'), '<br>');
    // Sanitize basic
    html = html.replace(/<script.*?>[\s\S]*?<\/script>/gi, '');
    return html;
  };

  // Grouping helpers
  const getMonthKey = (dateStr) => {
    if (!dateStr) return 'Unknown';
    const d = new Date(dateStr);
    const y = d.getFullYear();
    const m = (d.getMonth() + 1).toString().padStart(2, '0');
    return `${y}-${m}`;
  };

  const formatMonthHeader = (monthKey) => {
    if (!monthKey || monthKey === 'Unknown') return 'Tidak diketahui';
    const [y, m] = monthKey.split('-').map(Number);
    const date = new Date(y, m - 1, 1);
    return date.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' });
  };

  const groupByMonth = (items) => {
    const groups = {};
    items.forEach((it) => {
      const key = getMonthKey(it.tanggal_laporan);
      if (!groups[key]) groups[key] = [];
      groups[key].push(it);
    });
    return groups;
  };

  const openMonthFolder = (year, month) => {
    const key = `${year}-${String(month).padStart(2, '0')}`;
    setMonthFilter(key);
    setCurrentPage(1);
    setMonthsView('monthContent');
  };

  const toggleYear = (year) => {
    setExpandedYears(prev => {
      const willExpand = !prev[year];
      const next = { ...prev, [year]: willExpand };
      if (willExpand) {
        // lazy fetch summaries if not fetched yet (check one month key)
        const sampleKey = `${year}-01`;
        if (!monthSummaries[sampleKey]) {
          fetchMonthSummariesForYear(year);
        }
      }
      // persist expanded years
      try { localStorage.setItem('laporan_expanded_years', JSON.stringify(next)); } catch {}
      return next;
    });
  };

  // Client-side filtering within the current data
  const filteredLaporan = useMemo(() => {
    let items = Array.isArray(laporanKeuangan) ? [...laporanKeuangan] : [];
    // Filter by search term (judul_laporan or isi_laporan plain text)
    if (searchTerm && searchTerm.trim() !== '') {
      const term = searchTerm.toLowerCase();
      items = items.filter(it => {
        const judul = (it.judul_laporan || '').toLowerCase();
        const isi = (it.isi_laporan || '').replace(/<[^>]*>/g, '').toLowerCase();
        return judul.includes(term) || isi.includes(term);
      });
    }
    // Filter by exact date if provided (YYYY-MM-DD)
    if (dateFilter && dateFilter.trim() !== '') {
      items = items.filter(it => String(it.tanggal_laporan || '').startsWith(dateFilter));
    }
    return items;
  }, [laporanKeuangan, searchTerm, dateFilter]);

  const backToMonths = () => {
    setMonthsView('years');
    setMonthFilter('');
    setLaporanKeuangan([]);
    setCurrentPage(1);
  };

  const backToYears = () => {
    setMonthsView('years');
    setMonthFilter('');
    setLaporanKeuangan([]);
    setCurrentPage(1);
  };

  // Handler Tambah Tahun
  const handleAddYear = () => {
    const input = window.prompt('Masukkan tahun (YYYY):', String(new Date().getFullYear()));
    if (!input) return;
    const yearNum = Number(input);
    if (!Number.isInteger(yearNum) || yearNum < 2000 || yearNum > 3000) {
      return alert('Format tahun tidak valid. Contoh yang valid: 2025');
    }
    setExtraYears((prev) => {
      const next = prev.includes(yearNum) ? prev : [...prev, yearNum];
      try { localStorage.setItem('laporan_extra_years', JSON.stringify(next)); } catch {}
      return next;
    });
    setExpandedYears((prev) => {
      const next = { ...prev, [yearNum]: true };
      try { localStorage.setItem('laporan_expanded_years', JSON.stringify(next)); } catch {}
      return next;
    });
    // Fetch ringkasan untuk tahun baru
    fetchMonthSummariesForYear(yearNum);
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="p-0 bg-gray-50 min-h-screen">
      {/* Header + Badge Code (extra compact on mobile) */}
      <div className="bg-red-800 text-white px-6 py-1.5 md:py-4 mb-0 z-0 lg:relative lg:z-[100]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 md:gap-4">
            <span className="text-[11px] md:text-sm font-semibold bg-white/10 rounded px-1.5 py-0.5 md:px-2 md:py-1">{MENU_CODES.keuangan.laporanKeuangan}</span>
            <div>
              <h1 className="text-lg md:text-2xl font-extrabold tracking-tight">
                <span className="md:hidden">LAP KEUANGAN</span>
                <span className="hidden md:inline">LAPORAN KEUANGAN</span>
              </h1>
            </div>
          </div>
          {monthsView === 'years' ? (
            <button
              type="button"
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleAddYear(); }}
              className="relative z-30 inline-flex items-center gap-2 px-3 py-0 h-6 md:px-4 md:py-2 md:h-auto bg-white text-red-700 rounded-full hover:bg-red-50 transition-colors shadow-sm pointer-events-auto whitespace-nowrap"
              title="Tambah Tahun"
              aria-label="Tambah Tahun"
              data-add
            >
              <Plus className="h-4 w-4" strokeWidth={2.5} />
              <span className="md:hidden font-semibold leading-none">Thn</span>
              <span className="hidden md:inline font-semibold">Tahun</span>
            </button>
          ) : monthsView === 'monthContent' ? (
            <div className="flex items-center gap-2">
              <button
                onClick={backToMonths}
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
              <button
                onClick={() => navigate(`/admin/keuangan/laporan/new?month=${encodeURIComponent(monthFilter || '')}`)}
                className="hidden md:inline-flex items-center gap-2 px-4 py-2 bg-white text-red-700 rounded-lg hover:bg-red-50 transition-colors shadow-sm"
              >
                <Plus className="h-4 w-4" strokeWidth={2.5} />
                <span className="font-semibold">Tambah</span>
              </button>
            </div>
          ) : (
            <div className="invisible inline-flex items-center gap-2 px-4 py-2 rounded-lg shadow-sm">
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline font-semibold">Placeholder</span>
            </div>
          )}
        </div>
      </div>
      <div className="bg-gray-200 px-6 py-2 text-sm text-gray-900 mb-4">
        Terakhir diupdate: {lastUpdated ? new Date(lastUpdated).toLocaleString('id-ID', { year:'numeric', month:'long', day:'numeric', hour:'2-digit', minute:'2-digit' }) : '-'}
      </div>

      {/* Filters (tampil hanya saat di dalam folder) */}
      {monthsView === 'monthContent' && (
        <div className="bg-white shadow-sm border rounded-lg overflow-hidden mb-4">
          <div className="px-6 py-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Cari</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Cari laporan keuangan..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-3 py-2 w-full border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Tanggal</label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="date"
                    value={dateFilter}
                    min={monthRange.min}
                    max={monthRange.max}
                    onChange={(e) => { setDateFilter(e.target.value); setCurrentPage(1); }}
                    className="pl-10 pr-3 py-2 w-full border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  />
                </div>
              </div>
              <div className="flex items-end" />
            </div>
          </div>
        </div>
      )}

      {/* Years Category with expandable months */}
      {monthsView === 'years' && (
        <div className="mb-4">
          <div className="space-y-3">
            {yearOptions.map((year) => (
              <div key={year} className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
                <button
                  type="button"
                  onClick={() => toggleYear(year)}
                  className="w-full px-4 md:px-6 py-2 md:py-3 flex items-center justify-between bg-red-800 text-white hover:bg-red-700 transition-colors"
                >
                  <div className="flex items-center">
                    <span className="text-lg font-extrabold">{year}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); handleDeleteYear(year); }}
                      className="inline-flex items-center justify-center h-8 w-8 rounded border border-white/30 text-white hover:bg-white/10"
                      title={`Hapus tahun ${year}`}
                      aria-label={`Hapus tahun ${year}`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                    <span className="text-white/90">{expandedYears[year] ? '−' : '+'}</span>
                  </div>
                </button>
                {expandedYears[year] && (
                  <div className="px-4 md:px-6 py-3 md:py-4 bg-white">
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                      {getMonthsForYear(year).map(({ year: y, month }) => {
                        const label = new Date(y, month - 1, 1).toLocaleDateString('id-ID', { month: 'long' });
                        const key = `${y}-${String(month).padStart(2, '0')}`;
                        const summary = monthSummaries[key] || { count: 0, lastUpdated: '' };
                        const lastText = summary.lastUpdated
                          ? new Date(summary.lastUpdated).toLocaleString('id-ID', { day:'2-digit', month:'2-digit', year:'numeric', hour:'2-digit', minute:'2-digit' })
                          : '-';
                        return (
                          <div
                            key={`${y}-${month}`}
                            className="group p-4 bg-white cursor-pointer border border-gray-200 rounded-xl hover:border-red-300 hover:shadow-md transition-all"
                            onClick={() => openMonthFolder(y, month)}
                          >
                            <div className="text-center">
                              <div className="font-extrabold text-gray-900 group-hover:text-red-700 uppercase tracking-wide text-base md:text-lg">{label}</div>
                              <div className="mt-1 text-gray-500 text-xs md:text-sm">{lastText}</div>
                              <div className="mt-2">
                                <span className="inline-flex items-center justify-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-gray-100 text-gray-700 border border-gray-200">
                                  {summary.count.toLocaleString('id-ID')} laporan
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

      {/* Month Content Table */}
      {monthsView === 'monthContent' && (
      <div className="bg-white shadow-sm border rounded-b-lg overflow-hidden">
        <div className="bg-red-800 text-white px-4 md:px-6 py-3 md:py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <h2 className="text-lg font-extrabold leading-tight">{(formatMonthHeader(monthFilter) || '').toUpperCase()}</h2>
            </div>
            <div className="flex items-center gap-2"></div>
          </div>
        </div>

        

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="sticky top-0 bg-[#e5e7eb] z-10 shadow">
              <tr>
                <th className="hidden"></th>
                <th className="w-12 sm:w-16 pl-4 md:pl-6 pr-4 md:pr-12 py-2 text-left text-[0.9rem] font-extrabold text-gray-900 uppercase tracking-wider">No</th>
                <th className="px-4 sm:px-8 md:px-12 py-2 text-left text-[0.9rem] font-extrabold text-gray-900 uppercase tracking-wider">Tanggal</th>
                <th className="px-4 sm:px-8 md:px-12 py-2 text-left text-[0.9rem] font-extrabold text-gray-900 uppercase tracking-wider">Judul</th>
                <th className="px-4 sm:px-8 md:px-12 py-2 text-left text-[0.9rem] font-extrabold text-gray-900 uppercase tracking-wider">Keterangan</th>
                <th className="px-4 sm:px-8 md:px-12 py-2 text-left text-[0.9rem] font-extrabold text-gray-900 uppercase tracking-wider">Aksi</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              {filteredLaporan.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-16 text-center text-gray-500 align-middle">
                    <div className="flex flex-col items-center justify-center min-h-[12rem]">
                      <DollarSign className="h-12 w-12 text-gray-300 mb-4" />
                      <p className="text-lg font-medium text-gray-900 mb-2">Tidak ada data</p>
                      <p className="text-gray-500">Belum ada laporan keuangan bulan ini</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredLaporan.map((item, idx) => (
                  <tr key={item.id} className="hover:bg-gray-50 cursor-pointer" onClick={() => navigate(`/admin/keuangan/laporan/${item.id}`)}>
                    <td className="hidden" />
                    <td className="w-12 sm:w-16 pl-4 md:pl-6 pr-4 md:pr-12 py-1 whitespace-nowrap text-sm text-gray-900">
                      {(currentPage - 1) * 10 + idx + 1}
                    </td>
                    <td className="px-4 sm:px-8 md:px-12 py-1 whitespace-nowrap text-sm text-gray-900 font-semibold">
                      {(formatDate(item.tanggal_laporan) || '').toUpperCase()}
                    </td>
                    <td className="px-4 sm:px-8 md:px-12 py-1 text-sm text-gray-900 whitespace-nowrap truncate max-w-[14rem] md:max-w-md">
                      <div className="truncate">
                        {item.judul_laporan && item.judul_laporan.trim() !== ''
                          ? item.judul_laporan
                          : extractTitle(item.isi_laporan)}
                      </div>
                    </td>
                    <td className="px-4 sm:px-8 md:px-12 py-1 whitespace-nowrap text-sm text-gray-700 truncate max-w-[16rem] md:max-w-lg">
                      <div className="truncate">{truncateContent(item.isi_laporan || '', 60)}</div>
                    </td>
                    <td className="px-4 sm:px-8 md:px-12 py-1 whitespace-nowrap text-sm font-medium" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center gap-2 truncate">
                        <Link
                          to={`/admin/keuangan/laporan/${item.id}/edit`}
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
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-3 py-2 border-t border-gray-200 bg-white">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-700">
                Menampilkan {((currentPage - 1) * 10) + 1} sampai {Math.min(currentPage * 10, totalItems)} dari {totalItems} item
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Sebelumnya
                </button>
                <span className="px-3 py-2 text-sm text-gray-700">
                  Halaman {currentPage} dari {totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Selanjutnya
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
      )}
    </div>
  );
};

export default AdminLaporanKeuangan;