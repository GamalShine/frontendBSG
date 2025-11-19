import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, ChevronDown, ChevronRight, ChevronUp, Users, Search, X, Save, Building2, Briefcase, Edit3 } from 'lucide-react';
import { adminSdmService } from '@/services/adminSdmService';
import { MENU_CODES } from '@/config/menuCodes';
import api from '@/services/api';

// Helper: ubah nilai 0 atau "0.00" menjadi string kosong untuk tampilan input
const zeroToEmpty = (v) => {
  if (v === null || v === undefined) return '';
  const s = String(v).trim();
  if (s === '' ) return '';
  const n = Number(s.replace(/[^\d.-]/g, ''));
  if (!isNaN(n) && n === 0) return '';
  return s;
};

const AdminDataTim = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [hierarchy, setHierarchy] = useState([]); // divisi -> jabatan -> employees
  const [expandedDivisi, setExpandedDivisi] = useState({});
  const [expandedJabatan, setExpandedJabatan] = useState({});
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [selectedDivisi, setSelectedDivisi] = useState('');
  const [selectedJabatan, setSelectedJabatan] = useState('');
  const [selected, setSelected] = useState(null);
  const [detail, setDetail] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState(null);
  // Edit modal state
  const [editTarget, setEditTarget] = useState(null);
  const [editForm, setEditForm] = useState({
    // Informasi Personal
    nama: '',
    email: '',
    no_hp: '',
    tempat_lahir: '',
    tanggal_lahir: '',
    media_sosial: '',
    // Informasi Keluarga
    nama_pasangan: '',
    nama_anak: '',
    no_hp_pasangan: '',
    kontak_darurat: '',
    // Informasi Alamat
    alamat_sekarang: '',
    link_map_sekarang: '',
    alamat_asal: '',
    link_map_asal: '',
    nama_orang_tua: '',
    alamat_orang_tua: '',
    link_map_orang_tua: '',
    // Informasi Kerja
    tanggal_bergabung: '',
    lama_bekerja: '',
    jabatan_id: ''
  });
  // Users for Add Tim modal (to pick name and auto-fill email)
  const [users, setUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState('');

  useEffect(() => {
    // Load users once untuk modal tambah tim (ambil banyak agar tidak kepotong pagination)
    const loadUsers = async () => {
      try {
        setLoadingUsers(true);
        // Ambil hingga 1000 user agar dropdown lengkap
        const res = await api.get('/users', { params: { page: 1, limit: 1000 } });
        // Normalisasi berbagai bentuk response backend
        const arr = Array.isArray(res?.data?.data)
          ? res.data.data
          : Array.isArray(res?.data?.rows)
            ? res.data.rows
            : (Array.isArray(res?.data) ? res.data : []);
        setUsers(arr);
      } catch (e) {
        console.error('Gagal memuat users:', e);
        setUsers([]);
      } finally {
        setLoadingUsers(false);
      }
    };
    loadUsers();
  }, []);
  const [editLoading, setEditLoading] = useState(false);
  const [savingEdit, setSavingEdit] = useState(false);

  // Tabs di bawah form pencarian
  const [activeTab, setActiveTab] = useState('dataTim'); // 'dataTim' | 'jabatan' | 'divisi'
  const [expandedDivForJabatanPanel, setExpandedDivForJabatanPanel] = useState({});
  const [expandedEmployees, setExpandedEmployees] = useState({});

  // Modal Tambah Divisi & Jabatan
  const [showAddDivisi, setShowAddDivisi] = useState(false);
  const [addingDivisi, setAddingDivisi] = useState(false);
  const [divisiForm, setDivisiForm] = useState({ nama_divisi: '' });

  const [showAddJabatan, setShowAddJabatan] = useState(false);
  const [addingJabatan, setAddingJabatan] = useState(false);
  const [jabatanForm, setJabatanForm] = useState({ nama_jabatan: '', divisi_id: '' });

  // Modal Tambah Tim (karyawan)
  const [showAddTim, setShowAddTim] = useState(false);
  const [addingTim, setAddingTim] = useState(false);
  const [addTimForm, setAddTimForm] = useState({
    // Personal
    nama: '',
    tempat_lahir: '',
    tanggal_lahir: '',
    no_hp: '',
    email: '',
    media_sosial: '',
    // Keluarga
    nama_pasangan: '',
    nama_anak: '',
    no_hp_pasangan: '',
    kontak_darurat: '',
    // Alamat
    alamat_sekarang: '',
    link_map_sekarang: '',
    alamat_asal: '',
    link_map_asal: '',
    nama_orang_tua: '',
    alamat_orang_tua: '',
    link_map_orang_tua: '',
    // Kerja
    tanggal_bergabung: '',
    lama_bekerja: '',
    // Training
    training_dasar: false,
    training_skillo: false,
    training_leadership: false,
    training_lanjutan: false,
    // Gaji & Potongan
    gaji_pokok: '',
    tunjangan_kinerja: '',
    tunjangan_posisi: '',
    uang_makan: '',
    lembur: '',
    bonus: '',
    potongan: '',
    bpjstk: '',
    bpjs_kesehatan: '',
    bpjs_kes_penambahan: '',
    sp_1_2: '',
    pinjaman_karyawan: '',
    pph21: '',
    // Relasi
    divisi_id: '',
    jabatan_id: '',
    user_id: ''
  });

  const Row = ({ label, children }) => (
    <div className="grid grid-cols-1 md:grid-cols-3 border-t">
      <div className="px-4 py-2 text-xs md:text-sm font-medium text-gray-600 bg-gray-50">{label}</div>
      <div className="px-4 py-2 md:col-span-2 text-sm text-gray-800">{children || '-'}</div>
    </div>
  );

  const formatCurrency = (n) => {
    if (n === null || n === undefined) return '-';
    const val = Number(n) || 0;
    return `Rp ${val.toLocaleString('id-ID')}`;
  };

  // Hitung lama bekerja dari tanggal bergabung: output "X bulan Y hari"
  const calcTenureMonthsDays = (start) => {
    if (!start) return '-';
    const startDate = new Date(start);
    if (isNaN(startDate)) return '-';
    const now = new Date();

    let months = (now.getFullYear() - startDate.getFullYear()) * 12 + (now.getMonth() - startDate.getMonth());

    const anchor = new Date(startDate);
    anchor.setMonth(anchor.getMonth() + months);
    if (now < anchor) {
      months -= 1;
      anchor.setMonth(anchor.getMonth() - 1);
    }

    const MS_PER_DAY = 24 * 60 * 60 * 1000;
    const days = Math.max(0, Math.floor((now - anchor) / MS_PER_DAY));

    const safeMonths = Math.max(0, months);
    return `${safeMonths} bulan ${days} hari`;
  };

  // Render baris karyawan ala tabel 2 kolom (gaya Daftar Gaji)
  const renderEmployeeRowTim = (emp) => {
    const empKey = String(emp?.id ?? emp?.user_id ?? emp?.userId ?? emp?.nik ?? emp?.name ?? Math.random());
    const isOpen = !!expandedEmployees[empKey];
    const nama = emp?.nama ?? emp?.name ?? '—';
    const divisi = emp?.jabatan?.divisi?.nama_divisi ?? emp?.divisi_nama ?? '—';
    const posisi = emp?.jabatan?.nama_jabatan ?? emp?.jabatan_nama ?? '—';
    const lamaBekerja = calcTenureMonthsDays(emp?.tanggal_bergabung) !== '-' ? calcTenureMonthsDays(emp?.tanggal_bergabung) : (emp?.lama_bekerja || '—');

    const fmtDate = (d) => {
      if (!d) return '—';
      try { return new Date(d).toLocaleDateString('id-ID'); } catch { return String(d); }
    };
    const fmt = (v) => {
      if (v === null || v === undefined) return '—';
      const s = String(v).trim();
      return s === '' ? '—' : s;
    };
    const boolToSymbol = (v) => (parseBool(v) ? '✓' : '✗');
    const trainingText = [
      `Dasar: ${boolToSymbol(emp?.training_dasar)}`,
      `Skill: ${boolToSymbol(emp?.training_skill ?? emp?.training_skillo)}`,
      `Leadership: ${boolToSymbol(emp?.training_leadership)}`,
      `Lanjutan: ${boolToSymbol(emp?.training_lanjutan)}`,
    ].join(' | ');

    const tempatTglLahir = (() => {
      const t = fmt(emp?.tempat_lahir);
      const d = fmtDate(emp?.tanggal_lahir);
      if (t === '—' && d === '—') return '—';
      if (t === '—') return d;
      if (d === '—') return t;
      return `${t}, ${d}`;
    })();

    const rows = [
      ['NAMA', nama],
      ['DIVISI', divisi],
      ['POSISI', posisi],
      ['TEMPAT TANGGAL LAHIR', tempatTglLahir],
      ['NO. HP', fmt(emp?.no_hp ?? emp?.user?.no_hp)],
      ['EMAIL', fmt(emp?.email ?? emp?.user?.email)],
      ['MEDIA SOSIAL', fmt(emp?.media_sosial)],
      ['NAMA PASANGAN', fmt(emp?.nama_pasangan)],
      ['NAMA ANAK', fmt(emp?.nama_anak)],
      ['NO. HP PASANGAN', fmt(emp?.no_hp_pasangan)],
      ['NAMA & HP KONTAK DARURAT', fmt(emp?.kontak_darurat)],
      ['TEMPAT TINGGAL SEKARANG', fmt(emp?.alamat_sekarang ?? emp?.alamat ?? emp?.user?.alamat)],
      ['LINK GOOGLE MAP', fmt(emp?.link_map_sekarang)],
      ['ALAMAT DAERAH ASAL', fmt(emp?.alamat_asal)],
      ['LINK GOOGLE MAP ASAL', fmt(emp?.link_map_asal)],
      ['NAMA ORANG TUA', fmt(emp?.nama_orang_tua)],
      ['ALAMAT ORANG TUA', fmt(emp?.alamat_orang_tua)],
      ['LINK GOOGLE MAP ORANG TUA', fmt(emp?.link_map_orang_tua)],
      ['BERGABUNG SEJAK', fmtDate(emp?.tanggal_bergabung)],
      ['LAMA BEKERJA', fmt(lamaBekerja)],
      ['DATA TRAINING', trainingText],
      ['RIWAYAT KARYAWAN', fmt(emp?.riwayat_karyawan ?? emp?.riwayat)],
    ];

    return (
      <div key={empKey} className="border border-gray-300 rounded-md overflow-hidden">
        <button
          type="button"
          onClick={() => toggleEmployee(empKey)}
          className="w-full flex items-center justify-between px-4 py-3 bg-white hover:bg-gray-50"
        >
          <div>
            <div className="text-sm font-semibold text-gray-900">{nama}</div>
          </div>
          {isOpen ? (
            <ChevronUp className="h-4 w-4 text-gray-600" />
          ) : (
            <ChevronDown className="h-4 w-4 text-gray-600" />
          )}
        </button>
        {isOpen && (
          <>
            <div className="grid grid-cols-2">
              {rows.map(([label, val]) => (
                <React.Fragment key={label}>
                  <div className="border-b border-r border-gray-300 p-2 text-sm font-semibold">{label}</div>
                  <div className="border-b border-gray-300 p-2 text-sm break-words">{val}</div>
                </React.Fragment>
              ))}
            </div>
            {/* Tombol Edit di bawah kotak riwayat karyawan */}
            <div className="px-3 py-3 bg-white border-t border-gray-200">
              <button
                type="button"
                className="inline-flex items-center justify-center w-full px-3 md:px-6 py-0.5 md:py-2 rounded-none bg-red-600 text-white hover:bg-red-700 shadow-sm text-sm md:text-sm"
                onClick={() => setEditTarget(emp)}
              >
                <Edit3 className="w-4 h-4 mr-2" /> Edit
              </button>
            </div>
          </>
        )}
      </div>
    );
  };

  // Helper: normalisasi boolean untuk berbagai representasi nilai
  const parseBool = (v) => {
    if (v === true || v === '1' || v === 1) return true;
    if (v === false || v === '0' || v === 0) return false;
    if (typeof v === 'string') {
      const s = v.toLowerCase();
      if (s === 'true' || s === 'ya' || s === 'yes') return true;
      if (s === 'false' || s === 'tidak' || s === 'no') return false;
    }
    return !!v;
  };

  const trainingFlags = useMemo(() => {
    // Prioritas 1: detail.user bila punya field
    // Prioritas 2: selected.user (dari hierarchy) bila lengkap
    // Prioritas 3: fallback ke field di sdm_data
    const userFromDetail = detail?.user;
    const userFromSelected = selected?.user;

    const hasUserFields = (u) => u && (
      u.training_dasar !== undefined ||
      u.training_skill !== undefined ||
      u.training_leadership !== undefined ||
      u.training_lanjutan !== undefined
    );

    const u = hasUserFields(userFromDetail)
      ? userFromDetail
      : (hasUserFields(userFromSelected) ? userFromSelected : null);

    const src = u || detail || {};
    const sourceLabel = u ? 'users' : 'sdm_data';

    return {
      dasar: parseBool(u ? u.training_dasar : src.training_dasar),
      skill: parseBool(u ? u.training_skill : (src.training_skill ?? src.training_skillo)),
      leadership: parseBool(u ? u.training_leadership : src.training_leadership),
      lanjutan: parseBool(u ? u.training_lanjutan : src.training_lanjutan),
      source: sourceLabel
    };
  }, [detail, selected]);

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

  // Hitungan ringkas: jumlah karyawan, divisi, dan jabatan
  const stats = useMemo(() => {
    const divisi = (hierarchy || []).length;
    let jabatan = 0;
    let karyawan = 0;
    (hierarchy || []).forEach(d => {
      const jabs = d.children || [];
      jabatan += jabs.length;
      jabs.forEach(j => { karyawan += (j.children || []).length; });
    });
    return { divisi, jabatan, karyawan };
  }, [hierarchy]);

  // Set user_id yang sudah dipakai oleh data SDM (agar tidak muncul lagi di dropdown "Pilih User")
  const assignedUserIds = useMemo(() => {
    const set = new Set();
    (hierarchy || []).forEach(d => {
      (d.children || []).forEach(j => {
        (j.children || []).forEach(e => {
          const uid = e?.user_id ?? e?.userId ?? e?.user?.id;
          if (uid !== undefined && uid !== null && String(uid).trim() !== '') {
            const n = Number(uid);
            if (!isNaN(n)) set.add(n);
          }
        });
      });
    });
    return set;
  }, [hierarchy]);

  // Ambil waktu 'terakhir update' (data terakhir dibuat)
  const latestCreatedAt = useMemo(() => {
    let latest = null;
    const consider = (val) => {
      if (!val) return;
      const t = new Date(val);
      if (!isNaN(t)) latest = (!latest || t > latest) ? t : latest;
    };
    (hierarchy || []).forEach(d => {
      // Divisi
      consider(d.created_at || d.createdAt);
      (d.children || []).forEach(j => {
        // Jabatan
        consider(j.created_at || j.createdAt);
        (j.children || []).forEach(e => {
          // Karyawan
          consider(e.created_at || e.createdAt || e.created);
        });
      });
    });
    return latest;
  }, [hierarchy]);

  const formatDateTimeID = (dateObj) => {
    if (!dateObj) return '-';
    try {
      const tgl = new Intl.DateTimeFormat('id-ID', { day: '2-digit', month: 'long', year: 'numeric' }).format(dateObj);
      const hh = String(dateObj.getHours()).padStart(2, '0');
      const mm = String(dateObj.getMinutes()).padStart(2, '0');
      return `${tgl} pukul ${hh}.${mm}`;
    } catch {
      return String(dateObj);
    }
  };

  // Load detail lengkap saat selected berubah
  useEffect(() => {
    const load = async () => {
      if (!selected?.id) return;
      try {
        setDetailLoading(true);
        setDetailError(null);
        const res = await adminSdmService.getEmployeeById(selected.id);
        if (!res?.success) throw new Error(res?.message || 'Gagal memuat data');
        console.log('🔍 Detail data dari API:', res.data);
        console.log('🔍 User ID di sdm_data:', res.data?.user_id);
        console.log('🔍 User object:', res.data?.user);
        if (!res.data?.user) {
          console.warn('⚠️ User object tidak ada! Karyawan belum terhubung ke tabel users.');
        } else {
          console.log('🔍 Training data dari user:', {
            training_dasar: res.data.user.training_dasar,
            training_leadership: res.data.user.training_leadership,
            training_skill: res.data.user.training_skill,
            training_lanjutan: res.data.user.training_lanjutan
          });
        }
        setDetail(res.data);
      } catch (err) {
        setDetailError(err.message || 'Terjadi kesalahan');
      } finally {
        setDetailLoading(false);
      }
    };
    if (selected) load();
    else {
      setDetail(null);
      setDetailError(null);
      setDetailLoading(false);
    }
  }, [selected]);

  // Load data untuk modal edit saat editTarget berubah
  useEffect(() => {
    const loadEdit = async () => {
      if (!editTarget?.id) return;
      try {
        setEditLoading(true);
        const res = await adminSdmService.getEmployeeById(editTarget.id);
        if (!res?.success) throw new Error(res?.message || 'Gagal memuat data');
        const d = res.data || {};
        setEditForm({
          // Personal
          nama: d.nama || '',
          email: d.email || '',
          no_hp: d.no_hp || '',
          tempat_lahir: d.tempat_lahir || '',
          tanggal_lahir: d.tanggal_lahir ? String(d.tanggal_lahir).slice(0,10) : '',
          media_sosial: d.media_sosial || '',
          // Keluarga
          nama_pasangan: d.nama_pasangan || '',
          nama_anak: d.nama_anak || '',
          no_hp_pasangan: d.no_hp_pasangan || '',
          kontak_darurat: d.kontak_darurat || '',
          // Alamat
          alamat_sekarang: d.alamat_sekarang || '',
          link_map_sekarang: d.link_map_sekarang || '',
          alamat_asal: d.alamat_asal || '',
          link_map_asal: d.link_map_asal || '',
          nama_orang_tua: d.nama_orang_tua || '',
          alamat_orang_tua: d.alamat_orang_tua || '',
          link_map_orang_tua: d.link_map_orang_tua || '',
          tanggal_bergabung: d.tanggal_bergabung ? String(d.tanggal_bergabung).slice(0,10) : '',
          lama_bekerja: d.lama_bekerja || '',
          divisi_id: d.jabatan?.divisi?.id || d.divisi_id || '',
          jabatan_id: d.jabatan?.id || '',
          // Gaji & Potongan (0/0.00 jadi kosong)
          gaji_pokok: zeroToEmpty(d.gaji_pokok),
          tunjangan_kinerja: zeroToEmpty(d.tunjangan_kinerja),
          tunjangan_posisi: zeroToEmpty(d.tunjangan_posisi),
          uang_makan: zeroToEmpty(d.uang_makan),
          lembur: zeroToEmpty(d.lembur),
          bonus: zeroToEmpty(d.bonus),
          potongan: zeroToEmpty(d.potongan),
          bpjstk: zeroToEmpty(d.bpjstk),
          bpjs_kesehatan: zeroToEmpty(d.bpjs_kesehatan),
          bpjs_kes_penambahan: zeroToEmpty(d.bpjs_kes_penambahan),
          sp_1_2: zeroToEmpty(d.sp_1_2),
          pinjaman_karyawan: zeroToEmpty(d.pinjaman_karyawan),
          pph21: zeroToEmpty(d.pph21)
        });
      } catch (e) {
        console.error(e);
        setEditForm({
          nama: editTarget?.name || '',
          email: editTarget?.email || '',
          no_hp: editTarget?.no_hp || '',
          tempat_lahir: editTarget?.tempat_lahir || '',
          tanggal_lahir: editTarget?.tanggal_lahir ? String(editTarget.tanggal_lahir).slice(0,10) : '',
          media_sosial: editTarget?.media_sosial || '',
          nama_pasangan: editTarget?.nama_pasangan || '',
          nama_anak: editTarget?.nama_anak || '',
          no_hp_pasangan: editTarget?.no_hp_pasangan || '',
          kontak_darurat: editTarget?.kontak_darurat || '',
          alamat_sekarang: editTarget?.alamat_sekarang || '',
          link_map_sekarang: editTarget?.link_map_sekarang || '',
          alamat_asal: editTarget?.alamat_asal || '',
          link_map_asal: editTarget?.link_map_asal || '',
          nama_orang_tua: editTarget?.nama_orang_tua || '',
          alamat_orang_tua: editTarget?.alamat_orang_tua || '',
          link_map_orang_tua: editTarget?.link_map_orang_tua || '',
          tanggal_bergabung: editTarget?.tanggal_bergabung ? String(editTarget.tanggal_bergabung).slice(0,10) : '',
          lama_bekerja: editTarget?.lama_bekerja || '',
          divisi_id: editTarget?.jabatan?.divisi?.id || editTarget?.divisi_id || '',
          jabatan_id: editTarget?.jabatan?.id || '',
          // Gaji & Potongan (fallback) 0/0.00 jadi kosong
          gaji_pokok: zeroToEmpty(editTarget?.gaji_pokok),
          tunjangan_kinerja: zeroToEmpty(editTarget?.tunjangan_kinerja),
          tunjangan_posisi: zeroToEmpty(editTarget?.tunjangan_posisi),
          uang_makan: zeroToEmpty(editTarget?.uang_makan),
          lembur: zeroToEmpty(editTarget?.lembur),
          bonus: zeroToEmpty(editTarget?.bonus),
          potongan: zeroToEmpty(editTarget?.potongan),
          bpjstk: zeroToEmpty(editTarget?.bpjstk),
          bpjs_kesehatan: zeroToEmpty(editTarget?.bpjs_kesehatan),
          bpjs_kes_penambahan: zeroToEmpty(editTarget?.bpjs_kes_penambahan),
          sp_1_2: zeroToEmpty(editTarget?.sp_1_2),
          pinjaman_karyawan: zeroToEmpty(editTarget?.pinjaman_karyawan),
          pph21: zeroToEmpty(editTarget?.pph21)
        });
      } finally {
        setEditLoading(false);
      }
    };
    if (editTarget) loadEdit();
    else {
      setEditForm({ nama: '', email: '', no_hp: '', jabatan_id: '' });
      setEditLoading(false);
    }
  }, [editTarget]);

  // Options untuk select
  const divisiOptions = useMemo(() => (hierarchy || []).map(d => ({ id: d.id, name: d.name })), [hierarchy]);
  const jabatanOptions = useMemo(() => {
    const build = [];
    (hierarchy || []).forEach(d => {
      if (selectedDivisi && String(d.id) !== String(selectedDivisi)) return;
      (d.children || []).forEach(j => build.push({ id: j.id, name: j.name }));
    });
    // unik berdasarkan id
    const seen = new Set();
    return build.filter(j => (seen.has(j.id) ? false : (seen.add(j.id), true)));
  }, [hierarchy, selectedDivisi]);

  // Debounce pencarian 300ms
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(t);
  }, [search]);

  const filteredHierarchy = useMemo(() => {
    const q = (debouncedSearch || '').toLowerCase();
    const matchText = (div, jab, emp) => {
      if (!q) return true;
      return (
        (emp?.name || '').toLowerCase().includes(q) ||
        (emp?.email || '').toLowerCase().includes(q) ||
        (jab?.name || '').toLowerCase().includes(q) ||
        (div?.name || '').toLowerCase().includes(q)
      );
    };

    // Terapkan filter Divisi/Jabatan dan kata kunci ke struktur
    return (hierarchy || [])
      .filter(div => !selectedDivisi || String(div.id) === String(selectedDivisi))
      .map(div => {
        const jabs = (div.children || [])
          .filter(j => !selectedJabatan || String(j.id) === String(selectedJabatan))
          .map(jab => {
            const emps = (jab.children || []).filter(emp => matchText(div, jab, emp));
            return { ...jab, children: emps };
          })
          .filter(j => j.children && j.children.length > 0);
        return { ...div, children: jabs };
      })
      .filter(d => d.children && d.children.length > 0);
  }, [hierarchy, debouncedSearch, selectedDivisi, selectedJabatan]);

  // Auto-expand grup saat ada keyword: buka divisi & jabatan yang memiliki hasil
  useEffect(() => {
    const q = (debouncedSearch || '').trim().toLowerCase();
    if (!q) {
      setExpandedDivisi({});
      setExpandedJabatan({});
      return;
    }
    const nextDiv = {};
    const nextJab = {};
    (hierarchy || []).forEach(div => {
      const jabs = (div.children || []).filter(j => {
        const hasEmp = (j.children || []).some(emp =>
          (emp?.name || '').toLowerCase().includes(q) ||
          (emp?.email || '').toLowerCase().includes(q)
        );
        const jabMatch = (j?.name || '').toLowerCase().includes(q);
        const divMatch = (div?.name || '').toLowerCase().includes(q);
        const open = hasEmp || jabMatch || divMatch;
        if (open) nextJab[j.id] = true;
        return open;
      });
      if (jabs.length > 0 || (div?.name || '').toLowerCase().includes(q)) {
        nextDiv[div.id] = true;
      }
    });
    setExpandedDivisi(nextDiv);
    setExpandedJabatan(nextJab);
  }, [debouncedSearch, hierarchy]);

  // Helper highlight
  const highlightText = (value) => {
    const text = String(value ?? '');
    const q = String(debouncedSearch || '').trim();
    if (!q) return text;
    try {
      const esc = q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const re = new RegExp(esc, 'ig');
      const parts = text.split(re);
      const matches = text.match(re);
      if (!matches) return text;
      const nodes = [];
      for (let i = 0; i < parts.length; i++) {
        if (parts[i]) nodes.push(<span key={`p-${i}`}>{parts[i]}</span>);
        if (i < matches.length) nodes.push(
          <mark key={`m-${i}`} className="bg-yellow-200 px-0.5 rounded">{matches[i]}</mark>
        );
      }
      return <>{nodes}</>;
    } catch {
      return text;
    }
  };

  const toggleDivisi = (id) => setExpandedDivisi(prev => ({ ...prev, [id]: !prev[id] }));
  const toggleJabatan = (id) => setExpandedJabatan(prev => ({ ...prev, [id]: !prev[id] }));
  const toggleEmployee = (empKey) => setExpandedEmployees(prev => ({ ...prev, [empKey]: !prev[empKey] }));

  return (
    <div className="p-0 bg-gray-50 min-h-screen">
      {/* Global style untuk sembunyikan scrollbar */}
      <style>{`
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        .no-scrollbar::-webkit-scrollbar { display: none; }
      `}</style>
      {/* Header */}
      <div className="bg-red-800 text-white px-6 py-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span className="text-sm font-semibold bg-white/10 rounded px-2 py-1">{MENU_CODES.sdm.dataTim}</span>
            <div>
              <h1 className="text-xl md:text-2xl font-extrabold tracking-tight">DATA TIM</h1>
            </div>
          </div>
        </div>
      </div>
      {/* Subheader: Terakhir diupdate */}
      <div className="bg-gray-200 px-6 py-2 text-sm text-gray-600">
        Terakhir diupdate: <span className="text-gray-800">{formatDateTimeID(latestCreatedAt)}</span>
      </div>

      {/* Ringkasan jumlah */}
      <div className="px-0 mt-3">
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 flex items-center justify-between">
            <div>
              <div className="text-xs uppercase tracking-wide text-gray-500">Jumlah Karyawan</div>
              <div className="text-2xl font-extrabold text-gray-900 hidden lg:block">{stats.karyawan}</div>
            </div>
            <div className="flex items-center gap-2">
              <div className="text-xl font-extrabold text-gray-900 lg:hidden">{stats.karyawan}</div>
              <span className="hidden" />
            </div>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 flex items-center justify-between">
            <div>
              <div className="text-xs uppercase tracking-wide text-gray-500">Jumlah Divisi</div>
              <div className="text-2xl font-extrabold text-gray-900 hidden lg:block">{stats.divisi}</div>
            </div>
            <div className="flex items-center gap-2">
              <div className="text-xl font-extrabold text-gray-900 lg:hidden">{stats.divisi}</div>
              <span className="hidden" />
            </div>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 flex items-center justify-between">
            <div>
              <div className="text-xs uppercase tracking-wide text-gray-500">Jumlah Jabatan</div>
              <div className="text-2xl font-extrabold text-gray-900 hidden lg:block">{stats.jabatan}</div>
            </div>
            <div className="flex items-center gap-2">
              <div className="text-xl font-extrabold text-gray-900 lg:hidden">{stats.jabatan}</div>
              <span className="hidden" />
            </div>
          </div>
        </div>
      </div>

      {/* Form Pencarian - full-bleed, 1 baris */}
      <div className="px-0 pt-4 mb-2">
        <div className="bg-white rounded-md shadow-sm border border-gray-100">
          <div className="px-6 py-4 grid grid-cols-1 md:grid-cols-1 gap-4">
            <div>
              <label className="sr-only">Cari</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Cari nama / jabatan / divisi"
                  aria-label="Cari nama / jabatan / divisi"
                  className="pl-10 pr-3 py-2 w-full border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-red-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs: Data Tim, Jabatan, Divisi */}
      <div className="px-0 pt-2">
        <div className="bg-white rounded-md shadow-sm">
          <div className="px-6 py-2 flex items-center justify-between">
            <div className="flex items-center gap-2 w-full md:w-auto">
              <button
                onClick={() => setActiveTab('dataTim')}
                className={`px-3 pb-2 pt-2 text-sm font-semibold border-b-2 rounded-none w-full md:w-auto flex-1 md:flex-none text-center ${activeTab==='dataTim' ? 'text-red-700 border-red-700' : 'text-gray-700 border-transparent hover:text-red-700'}`}
              >
                DATA TIM
              </button>
              <button
                onClick={() => setActiveTab('divisi')}
                className={`px-3 pb-2 pt-2 text-sm font-semibold border-b-2 rounded-none w-full md:w-auto flex-1 md:flex-none text-center ${activeTab==='divisi' ? 'text-red-700 border-red-700' : 'text-gray-700 border-transparent hover:text-red-700'}`}
              >
                DIVISI
              </button>
              <button
                onClick={() => setActiveTab('jabatan')}
                className={`px-3 pb-2 pt-2 text-sm font-semibold border-b-2 rounded-none w-full md:w-auto flex-1 md:flex-none text-center ${activeTab==='jabatan' ? 'text-red-700 border-red-700' : 'text-gray-700 border-transparent hover:text-red-700'}`}
              >
                JABATAN
              </button>
            </div>
            <div className="hidden md:flex items-center">
              {activeTab === 'dataTim' && (
                <button
                  onClick={() => { setShowAddTim(true); setSelectedUserId(''); setAddTimForm({ nama: '', email: '', no_hp: '', tanggal_bergabung: '', divisi_id: '', jabatan_id: '', user_id: '' }) }}
                  className="inline-flex items-center px-3.5 py-1.5 rounded-lg bg-red-600 text-white hover:bg-red-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-red-500/70 focus:ring-offset-1 text-sm"
                >
                  + Tim
                </button>
              )}
              {activeTab === 'divisi' && (
                <button
                  onClick={() => { setShowAddDivisi(true); setDivisiForm({ nama_divisi: '' }) }}
                  className="inline-flex items-center px-3.5 py-1.5 rounded-lg bg-red-600 text-white hover:bg-red-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-red-500/70 focus:ring-offset-1 text-sm"
                >
                  + Divisi
                </button>
              )}
              {activeTab === 'jabatan' && (
                <button
                  onClick={() => { setShowAddJabatan(true); setJabatanForm({ nama_jabatan: '', divisi_id: '' }) }}
                  className="inline-flex items-center px-3.5 py-1.5 rounded-lg bg-red-600 text-white hover:bg-red-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-red-500/70 focus:ring-offset-1 text-sm"
                >
                  + Jabatan
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Content Switcher by Tab */}
      {activeTab === 'dataTim' && (
      <div className="px-0 pb-8 pt-0">
        <div className="bg-white rounded-b-md shadow-sm border-x border-b border-gray-100 border-t-0">
          {loading && <div className="p-8 text-center text-gray-500">Memuat data...</div>}
          {error && !loading && <div className="p-8 text-center text-red-600">{error}</div>}
          {!loading && !error && (
            <div className="pt-2 pb-3 space-y-3">
              {(filteredHierarchy || []).map(div => {
                const totalDiv = (div.children || []).reduce((acc, j) => acc + (j.children?.length || 0), 0);
                const openDiv = !!expandedDivisi[div.id];
                return (
                  <div key={div.id} className="rounded-md overflow-hidden bg-red-700 text-white border border-red-700 mt-3 mb-3 mx-3">
                    <button
                      onClick={() => toggleDivisi(div.id)}
                      className="w-full h-10 md:h-11 flex items-center justify-between px-4 py-0 bg-red-700 text-white"
                    >
                      <span className="font-semibold leading-none">{div.name}</span>
                      <span className="text-sm opacity-90 leading-none flex items-center">
                        {totalDiv} orang {openDiv ? <ChevronUp className="inline h-4 w-4 ml-2"/> : <ChevronDown className="inline h-4 w-4 ml-2"/>}
                      </span>
                    </button>
                    {openDiv && (
                      <div className="bg-red-700">
                        {(div.children || []).map(jab => {
                          const openJab = !!expandedJabatan[jab.id];
                          return (
                            <div key={jab.id}>
                              <button
                                type="button"
                                onClick={() => toggleJabatan(jab.id)}
                                className={`w-full flex items-center justify-between text-left px-4 py-2 border-t border-red-800 ${openJab ? 'bg-gray-50' : 'bg-white hover:bg-gray-50'}`}
                              >
                                <span className="text-sm font-semibold text-gray-900">{jab.name}</span>
                                <span className="text-xs text-gray-700">{(jab.children||[]).length} orang</span>
                              </button>
                              {openJab && (
                                <div className="bg-white text-gray-900 border-t border-gray-200 px-4 py-3">
                                  <div className="space-y-3">
                                    {((jab.children || []).length === 0) ? (
                                      <div className="text-center text-sm text-gray-500 py-4">Tidak ada karyawan pada jabatan ini</div>
                                    ) : (
                                      (jab.children || []).map(emp => renderEmployeeRowTim(emp))
                                    )}
                                  </div>
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
      )}

      {activeTab === 'jabatan' && (
        <div className="px-0 pb-8 pt-0">
          <div className="bg-white rounded-b-md shadow-sm border-x border-b border-gray-100 border-t-0">
            <div className="pt-2 pb-2 divide-y">
              {(hierarchy || []).map(div => {
                const open = !!expandedDivForJabatanPanel[div.id];
                const jabCount = (div.children || []).length;
                return (
                  <div key={div.id} className="rounded-lg overflow-hidden border border-gray-200 bg-white m-3">
                    <button
                      onClick={() => setExpandedDivForJabatanPanel(p=>({ ...p, [div.id]: !p[div.id] }))}
                      className="w-full px-6 py-3 bg-red-800 text-white flex items-center justify-between hover:bg-red-900 transition-colors"
                    >
                      <span className="font-semibold tracking-tight">{div.name}</span>
                      <span className="text-xs bg-white/20 px-2 py-0.5 rounded-full border border-white/30">{jabCount} jabatan</span>
                    </button>
                    {open && (
                      <div className="bg-white">
                        {(div.children || []).map(jab => (
                          <div key={jab.id} className="px-6 py-2 border-t border-gray-100 flex items-center justify-between hover:bg-gray-50">
                            <span className="text-sm font-medium text-gray-800">{jab.name}</span>
                            <span className="text-xs bg-gray-200 text-gray-700 px-2 py-0.5 rounded-full">{(jab.children||[]).length} orang</span>
                          </div>
                        ))}
                        {jabCount === 0 && (
                          <div className="px-6 py-3 text-sm text-gray-500 border-t">Belum ada jabatan</div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
              {(!hierarchy || hierarchy.length === 0) && (
                <div className="p-6 text-center text-gray-500">Tidak ada data divisi</div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* FAB mobile mengikuti tab aktif: Tambah Tim / Tambah Divisi / + Jabatan */}
      {!(showAddTim || showAddDivisi || showAddJabatan) && (
        <button
          type="button"
          onClick={() => {
            if (activeTab === 'dataTim') {
              setShowAddTim(true);
              setSelectedUserId('');
              setAddTimForm({
                nama: '', tempat_lahir: '', tanggal_lahir: '', no_hp: '', email: '', media_sosial: '',
                nama_pasangan: '', nama_anak: '', no_hp_pasangan: '', kontak_darurat: '',
                alamat_sekarang: '', link_map_sekarang: '', alamat_asal: '', link_map_asal: '',
                nama_orang_tua: '', alamat_orang_tua: '', link_map_orang_tua: '',
                tanggal_bergabung: '', lama_bekerja: '', training_dasar: false, training_skillo: false, training_leadership: false, training_lanjutan: false,
                gaji_pokok: '', tunjangan_kinerja: '', tunjangan_posisi: '', uang_makan: '', lembur: '', bonus: '', potongan: '', bpjstk: '', bpjs_kesehatan: '', bpjs_kes_penambahan: '', sp_1_2: '', pinjaman_karyawan: '', pph21: '',
                divisi_id: '', jabatan_id: '', user_id: ''
              });
            } else if (activeTab === 'divisi') {
              setShowAddDivisi(true);
              setDivisiForm({ nama_divisi: '' });
            } else if (activeTab === 'jabatan') {
              setShowAddJabatan(true);
              setJabatanForm({ nama_jabatan: '', divisi_id: '' });
            }
          }}
          className="md:hidden fixed bottom-6 right-4 z-40 w-14 h-14 rounded-full bg-red-600 text-white shadow-lg flex items-center justify-center active:scale-95"
          aria-label={activeTab === 'dataTim' ? 'Tambah Tim' : activeTab === 'divisi' ? 'Tambah Divisi' : '+ Jabatan'}
        >
          <Plus className="w-6 h-6" />
        </button>
      )}

      {activeTab === 'divisi' && (
        <div className="px-0 pb-8 pt-0">
          <div className="bg-white rounded-b-md shadow-sm border-x border-b border-gray-100 border-t-0">
            <div className="pt-2 pb-2">
              {(hierarchy || []).map(div => {
                const jabCount = (div.children || []).length;
                const empCount = (div.children || []).reduce((acc, j) => acc + ((j.children||[]).length), 0);
                return (
                  <div key={div.id} className="rounded-lg overflow-hidden border border-gray-200 bg-white m-3">
                    <div className="w-full px-6 py-3 bg-red-800 text-white flex items-center justify-between">
                      <span className="font-semibold tracking-tight">{div.name}</span>
                      <span className="text-xs bg-white/20 px-2 py-0.5 rounded-full border border-white/30">{empCount} orang</span>
                    </div>
                    <div className="bg-white px-6 py-2 border-t border-gray-100 flex items-center gap-2">
                      <span className="text-xs bg-gray-200 text-gray-700 px-2 py-0.5 rounded-full">{jabCount} jabatan</span>
                      <span className="text-xs bg-gray-200 text-gray-700 px-2 py-0.5 rounded-full">{empCount} orang</span>
                    </div>

                  </div>
                );
              })}
              {(!hierarchy || hierarchy.length === 0) && (
                <div className="p-6 text-center text-gray-500">Tidak ada data divisi</div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal Tambah Divisi (global) */}
      {showAddDivisi && (
        <div className="fixed inset-0 z-50 flex items-start md:items-center justify-stretch md:justify-center pt-4 md:p-4">
          <button className="absolute inset-0 bg-black/60" aria-hidden="true" onClick={() => setShowAddDivisi(false)} />
          <div className="relative z-10 bg-white rounded-b-2xl md:rounded-2xl shadow-2xl w-full md:w-[25vw] max-w-none max-h-[85vh] md:max-h-[90vh] border flex flex-col overflow-hidden">
            <div className="flex items-center justify-between px-4 py-2 md:px-6 md:py-2 border-b bg-white text-gray-900 md:bg-red-800 md:text-white md:border-red-700">
              <div className="flex items-center">
                <h2 className="text-base md:text-lg font-semibold leading-tight">Tambah Divisi</h2>
              </div>
              <button className="p-1 md:p-2 rounded-md md:hover:bg-white/10 text-gray-500 hover:text-gray-700 md:text-white/90" onClick={() => setShowAddDivisi(false)} aria-label="Tutup">✕</button>
            </div>
            <div className="px-4 md:px-6 py-5">
              <label className="block text-xs font-medium text-gray-700 mb-1">Nama Divisi</label>
              <input
                value={divisiForm.nama_divisi}
                onChange={(e)=> setDivisiForm({ nama_divisi: e.target.value })}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-red-500 focus:border-transparent"
                placeholder="Masukkan nama divisi"
              />
            </div>
            <div className="p-4 border-t bg-white">
              <div className="flex items-center justify-end gap-2">
                <button className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50" onClick={() => setShowAddDivisi(false)}>Batal</button>
                <button
                  className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                  disabled={addingDivisi}
                  onClick={async () => {
                    if (!divisiForm.nama_divisi || !String(divisiForm.nama_divisi).trim()) { alert('Nama divisi wajib diisi'); return; }
                    try {
                      setAddingDivisi(true);
                      const res = await adminSdmService.createDivisi({ nama_divisi: divisiForm.nama_divisi });
                      if (res?.success) {
                        setShowAddDivisi(false);
                        setDivisiForm({ nama_divisi: '' });
                        await fetchHierarchy();
                        setActiveTab('divisi');
                      } else {
                        alert(res?.message || 'Gagal menambah divisi');
                      }
                    } catch (e) {
                      alert(e?.response?.data?.message || e?.message || 'Terjadi kesalahan');
                    } finally { setAddingDivisi(false); }
                  }}
                >
                  {addingDivisi ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                  ) : (
                    <Save className="w-4 h-4" />
                  )}
                  <span>{addingDivisi ? 'Menyimpan...' : 'Simpan Divisi'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Tambah Jabatan (global) */}
      {showAddJabatan && (
        <div className="fixed inset-0 z-50 flex items-start md:items-center justify-stretch md:justify-center pt-4 md:p-4">
          <button className="absolute inset-0 bg-black/60" aria-hidden="true" onClick={() => setShowAddJabatan(false)} />
          <div className="relative z-10 bg-white rounded-b-2xl md:rounded-2xl shadow-2xl w-full md:w-[25vw] max-w-none max-h-[85vh] md:max-h-[90vh] border flex flex-col overflow-hidden">
            <div className="flex items-center justify-between px-4 py-2 md:px-6 md:py-2 border-b bg-white text-gray-900 md:bg-red-800 md:text-white md:border-red-700">
              <div className="flex items-center">
                <h2 className="text-base md:text-lg font-semibold leading-tight">Tambah Jabatan</h2>
              </div>
              <button className="p-1 md:p-2 rounded-md md:hover:bg-white/10 text-gray-500 hover:text-gray-700 md:text-white/90" onClick={() => setShowAddJabatan(false)} aria-label="Tutup">✕</button>
            </div>
            <div className="px-4 md:px-6 py-5 space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Divisi</label>
                <select
                  value={jabatanForm.divisi_id}
                  onChange={(e)=> setJabatanForm(f=>({ ...f, divisi_id: e.target.value }))}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-red-500 focus:border-transparent"
                >
                  <option value="">Pilih Divisi</option>
                  {(hierarchy||[]).map(d => (<option key={d.id} value={d.id}>{d.name}</option>))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Nama Jabatan</label>
                <input
                  value={jabatanForm.nama_jabatan}
                  onChange={(e)=> setJabatanForm(f=>({ ...f, nama_jabatan: e.target.value }))}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  placeholder="Masukkan nama jabatan"
                />
              </div>
            </div>
            <div className="p-4 border-t bg-white">
              <div className="flex items-center justify-end gap-2">
                <button className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50" onClick={() => setShowAddJabatan(false)}>Batal</button>
                <button
                  className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                  disabled={addingJabatan}
                  onClick={async ()=>{
                    if (!jabatanForm.divisi_id) { alert('Pilih divisi terlebih dahulu'); return; }
                    if (!jabatanForm.nama_jabatan || !String(jabatanForm.nama_jabatan).trim()) { alert('Nama jabatan wajib diisi'); return; }
                    try {
                      setAddingJabatan(true);
                      const payload = { nama_jabatan: jabatanForm.nama_jabatan, divisi_id: Number(jabatanForm.divisi_id) };
                      const res = await adminSdmService.createJabatan(payload);
                      if (res?.success) {
                        setShowAddJabatan(false);
                        setJabatanForm({ nama_jabatan: '', divisi_id: '' });
                        await fetchHierarchy();
                        setActiveTab('jabatan');
                      } else {
                        alert(res?.message || 'Gagal menambah jabatan');
                      }
                    } catch (e) {
                      alert(e?.response?.data?.message || e?.message || 'Terjadi kesalahan');
                    } finally { setAddingJabatan(false); }
                  }}
                >
                  {addingJabatan ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                  ) : (
                    <Save className="w-4 h-4" />
                  )}
                  <span>{addingJabatan ? 'Menyimpan...' : 'Simpan Jabatan'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Tambah Tim (global) */}
      {showAddTim && (
        <div className="fixed inset-0 z-50 flex items-start md:items-center justify-stretch md:justify-center pt-4 md:p-4">
          <button className="absolute inset-0 bg-black/60" aria-hidden="true" onClick={() => setShowAddTim(false)} />
          <div className="relative z-10 bg-white rounded-b-2xl md:rounded-2xl shadow-2xl w-full md:w-auto max-w-none md:max-w-3xl max-h-[85vh] md:max-h-[92vh] border flex flex-col overflow-hidden">
            <div className="flex items-center justify-between px-4 py-2 md:px-6 md:py-2 border-b bg-white text-gray-900 md:bg-red-800 md:text-white md:border-red-700">
              <div>
                <h2 className="text-base md:text-lg font-semibold leading-tight">Tambah Tim</h2>
              </div>
              <button className="p-1 md:p-2 rounded-md md:hover:bg-white/10 text-gray-500 hover:text-gray-700 md:text-white/90" onClick={() => setShowAddTim(false)} aria-label="Tutup">✕</button>
            </div>
            {/* Scrollable body */}
            <div className="flex-1 min-h-0 overflow-y-auto px-4 md:px-6 py-5 scrollbar-hide space-y-5">
              {/* Personal */}
              <div className="rounded-lg border border-gray-200 bg-white p-4">
                <div className="text-sm font-semibold text-gray-900 mb-3">Informasi Personal</div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Nama (ambil dari Users) <span className="text-red-600">*</span></label>
                    <select
                      value={selectedUserId}
                      onChange={(e)=>{
                        const val = e.target.value;
                        setSelectedUserId(val);
                        const u = users.find(us => String(us.id) === String(val));
                        const nm = u?.nama || u?.name || u?.username || '';
                        const em = u?.email || '';
                        setAddTimForm(v=>({ ...v, nama: nm, email: em, user_id: val ? Number(val) : '' }));
                      }}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-red-500 focus:border-transparent"
                      disabled={loadingUsers}
                    >
                      <option value="">— Pilih User —</option>
                      {users
                        .filter(u => {
                          const role = String(u.role || u.roles?.[0]?.name || u.user_role || u.level || u.jabatan || u.posisi || '')
                            .toLowerCase()
                            .trim();
                          return !assignedUserIds.has(Number(u.id)) && role !== 'owner';
                        })
                        .map(u => {
                        const label = `${u.nama || u.name || u.username || `User #${u.id}`} ${u.email ? `- ${u.email}` : ''}`.trim();
                        return (
                          <option key={u.id} value={u.id}>{label}</option>
                        );
                      })}
                    </select>
                    <p className="mt-1 text-[11px] text-gray-500">Pilih user untuk mengisi otomatis nama dan email.</p>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Tempat Lahir</label>
                    <input value={addTimForm.tempat_lahir} onChange={(e)=> setAddTimForm(v=>({ ...v, tempat_lahir: e.target.value }))} className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-red-500 focus:border-transparent" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Tanggal Lahir</label>
                    <input type="date" value={addTimForm.tanggal_lahir} onChange={(e)=> setAddTimForm(v=>({ ...v, tanggal_lahir: e.target.value }))} className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-red-500 focus:border-transparent" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">No. HP</label>
                    <input value={addTimForm.no_hp} onChange={(e)=> setAddTimForm(v=>({ ...v, no_hp: e.target.value }))} className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-red-500 focus:border-transparent" placeholder="08xxxxxxxxxx" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Email</label>
                    <input type="email" value={addTimForm.email} onChange={(e)=> setAddTimForm(v=>({ ...v, email: e.target.value }))} className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-red-500 focus:border-transparent" placeholder="email@domain.com (otomatis setelah pilih user)" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Media Sosial</label>
                    <input value={addTimForm.media_sosial} onChange={(e)=> setAddTimForm(v=>({ ...v, media_sosial: e.target.value }))} className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-red-500 focus:border-transparent" placeholder="@username / url" />
                  </div>
                </div>
              </div>

              {/* Keluarga */}
              <div className="rounded-lg border border-gray-200 bg-white p-4">
                <div className="text-sm font-semibold text-gray-900 mb-3">Informasi Keluarga</div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Nama Pasangan</label>
                    <input value={addTimForm.nama_pasangan} onChange={(e)=> setAddTimForm(v=>({ ...v, nama_pasangan: e.target.value }))} className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-red-500 focus:border-transparent" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">No. HP Pasangan</label>
                    <input value={addTimForm.no_hp_pasangan} onChange={(e)=> setAddTimForm(v=>({ ...v, no_hp_pasangan: e.target.value }))} className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-red-500 focus:border-transparent" />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-xs font-medium text-gray-700 mb-1">Nama Anak</label>
                    <input value={addTimForm.nama_anak} onChange={(e)=> setAddTimForm(v=>({ ...v, nama_anak: e.target.value }))} className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-red-500 focus:border-transparent" />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-xs font-medium text-gray-700 mb-1">Kontak Darurat</label>
                    <input value={addTimForm.kontak_darurat} onChange={(e)=> setAddTimForm(v=>({ ...v, kontak_darurat: e.target.value }))} className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-red-500 focus:border-transparent" />
                  </div>
                </div>
              </div>

              {/* Alamat */}
              <div className="rounded-lg border border-gray-200 bg-white p-4">
                <div className="text-sm font-semibold text-gray-900 mb-3">Informasi Alamat</div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Alamat Sekarang</label>
                    <input value={addTimForm.alamat_sekarang} onChange={(e)=> setAddTimForm(v=>({ ...v, alamat_sekarang: e.target.value }))} className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-red-500 focus:border-transparent" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Link Map Sekarang</label>
                    <input value={addTimForm.link_map_sekarang} onChange={(e)=> setAddTimForm(v=>({ ...v, link_map_sekarang: e.target.value }))} className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-red-500 focus:border-transparent" placeholder="https://maps.google.com/..." />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Alamat Asal</label>
                    <input value={addTimForm.alamat_asal} onChange={(e)=> setAddTimForm(v=>({ ...v, alamat_asal: e.target.value }))} className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-red-500 focus:border-transparent" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Link Map Asal</label>
                    <input value={addTimForm.link_map_asal} onChange={(e)=> setAddTimForm(v=>({ ...v, link_map_asal: e.target.value }))} className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-red-500 focus:border-transparent" placeholder="https://maps.google.com/..." />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Nama Orang Tua</label>
                    <input value={addTimForm.nama_orang_tua} onChange={(e)=> setAddTimForm(v=>({ ...v, nama_orang_tua: e.target.value }))} className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-red-500 focus:border-transparent" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Alamat Orang Tua</label>
                    <input value={addTimForm.alamat_orang_tua} onChange={(e)=> setAddTimForm(v=>({ ...v, alamat_orang_tua: e.target.value }))} className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-red-500 focus:border-transparent" />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-xs font-medium text-gray-700 mb-1">Link Map Orang Tua</label>
                    <input value={addTimForm.link_map_orang_tua} onChange={(e)=> setAddTimForm(v=>({ ...v, link_map_orang_tua: e.target.value }))} className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-red-500 focus:border-transparent" placeholder="https://maps.google.com/..." />
                  </div>
                </div>
              </div>

              {/* Kerja & Training */}
              <div className="rounded-lg border border-gray-200 bg-white p-4">
                <div className="text-sm font-semibold text-gray-900 mb-3">Informasi Kerja</div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Tanggal Bergabung</label>
                    <input type="date" value={addTimForm.tanggal_bergabung} onChange={(e)=> setAddTimForm(v=>({ ...v, tanggal_bergabung: e.target.value }))} className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-red-500 focus:border-transparent" />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Divisi <span className="text-red-600">*</span></label>
                    <select value={addTimForm.divisi_id} onChange={(e)=> setAddTimForm(v=>({ ...v, divisi_id: e.target.value, jabatan_id: '' }))} className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-red-500 focus:border-transparent">
                      <option value="">Pilih divisi</option>
                      {(hierarchy||[]).map(d => (<option key={d.id} value={d.id}>{d.name}</option>))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Jabatan <span className="text-red-600">*</span></label>
                    <select value={addTimForm.jabatan_id} onChange={(e)=> setAddTimForm(v=>({ ...v, jabatan_id: e.target.value }))} className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-red-500 focus:border-transparent" disabled={!addTimForm.divisi_id}>
                      <option value="">{!addTimForm.divisi_id ? 'Pilih divisi dulu' : 'Pilih jabatan'}</option>
                      {(hierarchy||[]).filter(d => String(d.id) === String(addTimForm.divisi_id)).flatMap(d => d.children || []).map(j => (<option key={j.id} value={j.id}>{j.name}</option>))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Gaji & Potongan */}
              <div className="rounded-lg border border-gray-200 bg-white p-4">
                <div className="text-sm font-semibold text-gray-900 mb-3">Gaji & Potongan</div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {[
                    { key: 'gaji_pokok', label: 'Gaji Pokok (Rp)' },
                    { key: 'tunjangan_kinerja', label: 'Tunjangan Kinerja (Rp)' },
                    { key: 'tunjangan_posisi', label: 'Tunjangan Posisi (Rp)' },
                    { key: 'uang_makan', label: 'Uang Makan (Rp)' },
                    { key: 'lembur', label: 'Lembur (Rp)' },
                    { key: 'bonus', label: 'Bonus (Rp)' },
                    { key: 'potongan', label: 'Potongan (Rp)' },
                    { key: 'bpjstk', label: 'BPJSTK (Rp)' },
                    { key: 'bpjs_kesehatan', label: 'BPJS Kesehatan (Rp)' },
                    { key: 'bpjs_kes_penambahan', label: 'BPJS Kes Penambahan (Rp)' },
                    { key: 'sp_1_2', label: 'SP 1/2 (Rp)' },
                    { key: 'pinjaman_karyawan', label: 'Pinjaman Karyawan (Rp)' },
                    { key: 'pph21', label: 'PPH21 (Rp)' }
                  ].map(i => (
                    <div key={i.key}>
                      <label className="block text-xs font-medium text-gray-700 mb-1">{i.label}</label>
                      <input value={addTimForm[i.key]} onChange={(e)=> setAddTimForm(v=>({ ...v, [i.key]: e.target.value }))} className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-red-500 focus:border-transparent" inputMode="numeric" placeholder="" />
                    </div>
                  ))}
                </div>
              </div>

              
            </div>
            <div className="p-4 border-t bg-white">
              <div className="flex items-center justify-end gap-2">
                <button className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50" onClick={() => setShowAddTim(false)}>Batal</button>
                <button
                  className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                  disabled={addingTim}
                  onClick={async ()=>{
                    if (!addTimForm.nama || !String(addTimForm.nama).trim()) { alert('Nama wajib diisi'); return; }
                    if (!addTimForm.jabatan_id) { alert('Silakan pilih jabatan'); return; }
                    try {
                      setAddingTim(true);
                      const toNum = (v) => (v === '' || v === null || v === undefined) ? 0 : Number(String(v).replace(/[^\d-]/g,'')) || 0;
                      const payload = {
                        // Personal
                        nama: addTimForm.nama,
                        tempat_lahir: addTimForm.tempat_lahir || undefined,
                        tanggal_lahir: addTimForm.tanggal_lahir || undefined,
                        no_hp: addTimForm.no_hp || undefined,
                        email: addTimForm.email || undefined,
                        media_sosial: addTimForm.media_sosial || undefined,
                        // Keluarga
                        nama_pasangan: addTimForm.nama_pasangan || undefined,
                        nama_anak: addTimForm.nama_anak || undefined,
                        no_hp_pasangan: addTimForm.no_hp_pasangan || undefined,
                        kontak_darurat: addTimForm.kontak_darurat || undefined,
                        // Alamat
                        alamat_sekarang: addTimForm.alamat_sekarang || undefined,
                        link_map_sekarang: addTimForm.link_map_sekarang || undefined,
                        alamat_asal: addTimForm.alamat_asal || undefined,
                        link_map_asal: addTimForm.link_map_asal || undefined,
                        nama_orang_tua: addTimForm.nama_orang_tua || undefined,
                        alamat_orang_tua: addTimForm.alamat_orang_tua || undefined,
                        link_map_orang_tua: addTimForm.link_map_orang_tua || undefined,
                        // Kerja
                        jabatan_id: Number(addTimForm.jabatan_id),
                        tanggal_bergabung: addTimForm.tanggal_bergabung || undefined,
                        lama_bekerja: addTimForm.lama_bekerja || undefined,
                        // Relasi ke users
                        user_id: selectedUserId ? Number(selectedUserId) : (addTimForm.user_id ? Number(addTimForm.user_id) : undefined),
                        // Training
                        training_dasar: !!addTimForm.training_dasar,
                        training_skillo: !!addTimForm.training_skillo,
                        training_leadership: !!addTimForm.training_leadership,
                        training_lanjutan: !!addTimForm.training_lanjutan,
                        // Gaji & Potongan (angka)
                        gaji_pokok: toNum(addTimForm.gaji_pokok),
                        tunjangan_kinerja: toNum(addTimForm.tunjangan_kinerja),
                        tunjangan_posisi: toNum(addTimForm.tunjangan_posisi),
                        uang_makan: toNum(addTimForm.uang_makan),
                        lembur: toNum(addTimForm.lembur),
                        bonus: toNum(addTimForm.bonus),
                        potongan: toNum(addTimForm.potongan),
                        bpjstk: toNum(addTimForm.bpjstk),
                        bpjs_kesehatan: toNum(addTimForm.bpjs_kesehatan),
                        bpjs_kes_penambahan: toNum(addTimForm.bpjs_kes_penambahan),
                        sp_1_2: toNum(addTimForm.sp_1_2),
                        pinjaman_karyawan: toNum(addTimForm.pinjaman_karyawan),
                        pph21: toNum(addTimForm.pph21),
                      };
                      const res = await adminSdmService.createEmployee(payload);
                      if (res?.success) {
                        setShowAddTim(false);
                        setAddTimForm({ nama: '', email: '', no_hp: '', tanggal_bergabung: '', divisi_id: '', jabatan_id: '' });
                        await fetchHierarchy();
                        setActiveTab('dataTim');
                      } else {
                        alert(res?.message || 'Gagal menambah tim');
                      }
                    } catch (e) {
                      alert(e?.response?.data?.message || e?.message || 'Terjadi kesalahan');
                    } finally { setAddingTim(false); }
                  }}
                >
                  {addingTim ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                  ) : (
                    <Save className="w-4 h-4" />
                  )}
                  <span>{addingTim ? 'Menyimpan...' : 'Simpan Tim'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {selected && (
        <div className="fixed inset-0 z-50 flex items-start md:items-center justify-center pt-32 md:pt-0">
          <div className="absolute inset-0 bg-black/50" onClick={() => setSelected(null)} />
          <div className="relative z-10 w-full max-w-[92vw] sm:max-w-[90vw] md:max-w-3xl bg-white rounded-2xl shadow-2xl border flex flex-col max-h-[80dvh] md:max-h-[92vh] overflow-hidden">
            {/* Header */}
            <div className="px-4 py-2 md:px-6 md:py-4 bg-red-800 text-white flex items-center justify-between">
              <h2 className="text-lg font-semibold">Detail Anggota Tim</h2>
              <button className="p-2 rounded-md hover:bg-white/10" onClick={() => setSelected(null)} aria-label="Tutup">✕</button>
            </div>

            {/* Body scrollable */}
            <div className="flex-1 min-h-0 overflow-y-auto no-scrollbar">
              {detailLoading && <div className="p-6 text-center text-gray-500">Memuat detail...</div>}
              {detailError && !detailLoading && <div className="p-6 text-center text-red-600">{detailError}</div>}
              {!detailLoading && !detailError && detail && (
                <div className="overflow-hidden">
                  <div className="px-4 py-4 border-b">
                    <div className="text-lg font-semibold">{detail.nama}</div>
                    <div className="text-sm text-gray-500">{detail?.jabatan?.nama_jabatan} • {detail?.jabatan?.divisi?.nama_divisi}</div>
                  </div>

                  <div className="px-4 py-3 bg-gray-50 text-sm font-semibold text-gray-700">Informasi Personal</div>
                  <Row label="Nama Lengkap">{detail.nama}</Row>
                  <Row label="Email">{detail.email}</Row>
                  <Row label="No. HP">{detail.no_hp}</Row>
                  <Row label="Tempat Lahir">{detail.tempat_lahir}</Row>
                  <Row label="Tanggal Lahir">{detail.tanggal_lahir ? new Date(detail.tanggal_lahir).toLocaleDateString('id-ID') : '-'}</Row>
                  <Row label="Media Sosial">{detail.media_sosial}</Row>

                  <div className="px-4 py-3 bg-gray-50 text-sm font-semibold text-gray-700">Informasi Keluarga</div>
                  <Row label="Nama Pasangan">{detail.nama_pasangan}</Row>
                  <Row label="Nama Anak">{detail.nama_anak}</Row>
                  <Row label="No. HP Pasangan">{detail.no_hp_pasangan}</Row>
                  <Row label="Kontak Darurat">{detail.kontak_darurat}</Row>

                  <div className="px-4 py-3 bg-gray-50 text-sm font-semibold text-gray-700">Informasi Alamat</div>
                  <Row label="Alamat Sekarang">{detail.alamat_sekarang}</Row>
                  <Row label="Link Google Map Sekarang">{detail.link_map_sekarang ? (<a className="text-blue-600 hover:underline" href={detail.link_map_sekarang} target="_blank" rel="noreferrer">Buka Link</a>) : '-'}</Row>
                  <Row label="Alamat Asal">{detail.alamat_asal}</Row>
                  <Row label="Link Google Map Asal">{detail.link_map_asal ? (<a className="text-blue-600 hover:underline" href={detail.link_map_asal} target="_blank" rel="noreferrer">Buka Link</a>) : '-'}</Row>
                  <Row label="Nama Orang Tua">{detail.nama_orang_tua}</Row>
                  <Row label="Alamat Orang Tua">{detail.alamat_orang_tua}</Row>
                  <Row label="Link Google Map Orang Tua">{detail.link_map_orang_tua ? (<a className="text-blue-600 hover:underline" href={detail.link_map_orang_tua} target="_blank" rel="noreferrer">Buka Link</a>) : '-'}</Row>

                  <div className="px-4 py-3 bg-gray-50 text-sm font-semibold text-gray-700">Informasi Kerja</div>
                  <Row label="Tanggal Bergabung">{detail.tanggal_bergabung ? new Date(detail.tanggal_bergabung).toLocaleDateString('id-ID') : '-'}</Row>
                  <Row label="Lama Bekerja">{calcTenureMonthsDays(detail.tanggal_bergabung)}</Row>
                  <Row label="Divisi">{detail?.jabatan?.divisi?.nama_divisi}</Row>
                  <Row label="Jabatan">{detail?.jabatan?.nama_jabatan}</Row>

                  <Row label="Data Training">{`DASAR ${trainingFlags.dasar ? '✓' : '✗'}, SKILL ${trainingFlags.skill ? '✓' : '✗'}, LEADERSHIP ${trainingFlags.leadership ? '✓' : '✗'}, LANJUTAN ${trainingFlags.lanjutan ? '✓' : '✗'}`}</Row>

                </div>
              )}
            </div>

            {/* Footer buttons */}
            <div className="p-0 border-t bg-white">
              <div className="grid grid-cols-2 gap-2 px-2 py-2">
                <button className="w-full py-2 bg-red-700 text-white font-semibold hover:bg-red-800 transition-colors rounded-lg" onClick={() => setSelected(null)}>Tutup</button>
                <button className="w-full py-2 bg-red-700 text-white font-semibold hover:bg-red-800 transition-colors rounded-lg" onClick={() => { setEditTarget(detail); setSelected(null); }}>Edit</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {editTarget && (
        <div className="fixed inset-0 z-50 flex items-start md:items-center justify-center pt-32 md:pt-0">
          <div className="absolute inset-0 bg-black/50" onClick={() => setEditTarget(null)} />
          <div className="relative z-10 w-full max-w-[92vw] sm:max-w-[90vw] md:max-w-3xl bg-white rounded-2xl shadow-2xl border flex flex-col max-h-[80dvh] md:max-h-[92vh] overflow-hidden">
            {/* Header */}
            <div className="px-4 py-2 md:px-6 md:py-4 bg-red-800 text-white flex items-center justify-between">
              <h2 className="text-lg font-semibold">Edit Anggota Tim</h2>
              <button className="p-2 rounded-md hover:bg-white/10" onClick={() => setEditTarget(null)} aria-label="Tutup">✕</button>
            </div>

            {/* Body */}
            <div className="flex-1 min-h-0 overflow-y-auto no-scrollbar">
              {editLoading ? (
                <div className="p-6 text-center text-gray-500">Memuat data...</div>
              ) : (
                <div className="p-0">
                  {/* Header ringkas seperti modal Detail */}
                  <div className="px-4 py-4 border-b">
                    <div className="text-lg font-semibold">{editForm.nama || editTarget?.name || '-'}</div>
                    <div className="text-sm text-gray-500">{editTarget?.jabatan?.nama_jabatan} • {editTarget?.jabatan?.divisi?.nama_divisi}</div>
                  </div>
                  {/* Informasi Personal */}
                  <div className="px-4 py-3 bg-gray-50 text-sm font-semibold text-gray-700">Informasi Personal</div>
                  <div className="p-4 space-y-4">
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Nama</label>
                      <input value={editForm.nama} onChange={(e) => setEditForm(f => ({ ...f, nama: e.target.value }))} className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-red-500 focus:border-transparent" placeholder="Nama lengkap" />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">Email</label>
                        <input type="email" value={editForm.email} onChange={(e) => setEditForm(f => ({ ...f, email: e.target.value }))} className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-red-500 focus:border-transparent" placeholder="email@domain.com" />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">No. HP</label>
                        <input value={editForm.no_hp} onChange={(e) => setEditForm(f => ({ ...f, no_hp: e.target.value }))} className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-red-500 focus:border-transparent" placeholder="08xxxxxxxxxx" />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">Media Sosial</label>
                        <input value={editForm.media_sosial} onChange={(e) => setEditForm(f => ({ ...f, media_sosial: e.target.value }))} className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-red-500 focus:border-transparent" placeholder="@username / url" />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">Tempat Lahir</label>
                        <input value={editForm.tempat_lahir} onChange={(e) => setEditForm(f => ({ ...f, tempat_lahir: e.target.value }))} className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-red-500 focus:border-transparent" />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">Tanggal Lahir</label>
                        <input type="date" value={editForm.tanggal_lahir} onChange={(e) => setEditForm(f => ({ ...f, tanggal_lahir: e.target.value }))} className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-red-500 focus:border-transparent" />
                      </div>
                    </div>
                  </div>

                  {/* Informasi Keluarga */}
                  <div className="px-4 py-3 bg-gray-50 text-sm font-semibold text-gray-700">Informasi Keluarga</div>
                  <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Nama Pasangan</label>
                      <input value={editForm.nama_pasangan} onChange={(e) => setEditForm(f => ({ ...f, nama_pasangan: e.target.value }))} className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-red-500 focus:border-transparent" />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">No. HP Pasangan</label>
                      <input value={editForm.no_hp_pasangan} onChange={(e) => setEditForm(f => ({ ...f, no_hp_pasangan: e.target.value }))} className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-red-500 focus:border-transparent" />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Nama Anak</label>
                      <input value={editForm.nama_anak} onChange={(e) => setEditForm(f => ({ ...f, nama_anak: e.target.value }))} className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-red-500 focus:border-transparent" />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Kontak Darurat</label>
                      <input value={editForm.kontak_darurat} onChange={(e) => setEditForm(f => ({ ...f, kontak_darurat: e.target.value }))} className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-red-500 focus:border-transparent" />
                    </div>
                  </div>

                  {/* Informasi Alamat */}
                  <div className="px-4 py-3 bg-gray-50 text-sm font-semibold text-gray-700">Informasi Alamat</div>
                  <div className="p-4 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">Alamat Sekarang</label>
                        <input value={editForm.alamat_sekarang} onChange={(e) => setEditForm(f => ({ ...f, alamat_sekarang: e.target.value }))} className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-red-500 focus:border-transparent" />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">Link Google Map Sekarang</label>
                        <input value={editForm.link_map_sekarang} onChange={(e) => setEditForm(f => ({ ...f, link_map_sekarang: e.target.value }))} className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-red-500 focus:border-transparent" placeholder="https://maps.google.com/..." />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">Alamat Asal</label>
                        <input value={editForm.alamat_asal} onChange={(e) => setEditForm(f => ({ ...f, alamat_asal: e.target.value }))} className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-red-500 focus:border-transparent" />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">Link Google Map Asal</label>
                        <input value={editForm.link_map_asal} onChange={(e) => setEditForm(f => ({ ...f, link_map_asal: e.target.value }))} className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-red-500 focus:border-transparent" placeholder="https://maps.google.com/..." />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">Nama Orang Tua</label>
                        <input value={editForm.nama_orang_tua} onChange={(e) => setEditForm(f => ({ ...f, nama_orang_tua: e.target.value }))} className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-red-500 focus:border-transparent" />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">Alamat Orang Tua</label>
                        <input value={editForm.alamat_orang_tua} onChange={(e) => setEditForm(f => ({ ...f, alamat_orang_tua: e.target.value }))} className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-red-500 focus:border-transparent" />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Link Google Map Orang Tua</label>
                      <input value={editForm.link_map_orang_tua} onChange={(e) => setEditForm(f => ({ ...f, link_map_orang_tua: e.target.value }))} className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-red-500 focus:border-transparent" placeholder="https://maps.google.com/..." />
                    </div>
                  </div>

                  {/* Informasi Kerja */}
                  <div className="px-4 py-3 bg-gray-50 text-sm font-semibold text-gray-700">Informasi Kerja</div>
                  <div className="p-4 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">Tanggal Bergabung</label>
                        <input type="date" value={editForm.tanggal_bergabung} onChange={(e) => setEditForm(f => ({ ...f, tanggal_bergabung: e.target.value }))} className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-red-500 focus:border-transparent" />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">Divisi</label>
                        <select value={editForm.divisi_id} onChange={(e) => setEditForm(f => ({ ...f, divisi_id: e.target.value }))} className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-red-500 focus:border-transparent">
                          <option value="">Pilih Divisi</option>
                          {(hierarchy || []).map(d => (
                            <option key={d.id} value={d.id}>{d.name}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">Jabatan</label>
                        <select value={editForm.jabatan_id} onChange={(e) => setEditForm(f => ({ ...f, jabatan_id: e.target.value }))} className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-red-500 focus:border-transparent">
                          <option value="">Pilih Jabatan</option>
                          {(hierarchy || []).flatMap(d => d.children || []).map(j => (
                            <option key={j.id} value={j.id}>{j.name}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Lama Bekerja</label>
                      <input
                        value={calcTenureMonthsDays(editForm.tanggal_bergabung)}
                        readOnly
                        className="w-full border border-gray-200 bg-gray-50 text-gray-700 rounded-md px-3 py-2 text-sm"
                        title="Otomatis dihitung dari Tanggal Bergabung"
                      />
                    </div>

                    {/* Gaji & Potongan (Edit) */}
                    <div className="rounded-lg border border-gray-200 bg-white p-4">
                      <div className="text-sm font-semibold text-gray-900 mb-3">Gaji & Potongan</div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {[
                          { key: 'gaji_pokok', label: 'Gaji Pokok (Rp)' },
                          { key: 'tunjangan_kinerja', label: 'Tunjangan Kinerja (Rp)' },
                          { key: 'tunjangan_posisi', label: 'Tunjangan Posisi (Rp)' },
                          { key: 'uang_makan', label: 'Uang Makan (Rp)' },
                          { key: 'lembur', label: 'Lembur (Rp)' },
                          { key: 'bonus', label: 'Bonus (Rp)' },
                          { key: 'potongan', label: 'Potongan (Rp)' },
                          { key: 'bpjstk', label: 'BPJSTK (Rp)' },
                          { key: 'bpjs_kesehatan', label: 'BPJS Kesehatan (Rp)' },
                          { key: 'bpjs_kes_penambahan', label: 'BPJS Kes Penambahan (Rp)' },
                          { key: 'sp_1_2', label: 'SP 1/2 (Rp)' },
                          { key: 'pinjaman_karyawan', label: 'Pinjaman Karyawan (Rp)' },
                          { key: 'pph21', label: 'PPH21 (Rp)' }
                        ].map(i => (
                          <div key={i.key}>
                            <label className="block text-xs font-medium text-gray-700 mb-1">{i.label}</label>
                            <input
                              value={editForm[i.key] ?? ''}
                              onChange={(e) => setEditForm(f => ({ ...f, [i.key]: e.target.value }))}
                              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-red-500 focus:border-transparent"
                              placeholder="0"
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-0 border-t bg-white">
              <div className="grid grid-cols-2 gap-2 px-2 py-2">
                <button className="w-full py-2 bg-red-700 text-white font-semibold hover:bg-red-800 transition-colors rounded-lg" onClick={() => setEditTarget(null)}>Batal</button>
                <button
                  className="w-full py-2 bg-red-700 text-white font-semibold hover:bg-red-800 transition-colors rounded-lg disabled:opacity-60"
                  disabled={savingEdit || editLoading}
                  onClick={async () => {
                    if (!editTarget?.id) return;
                    try {
                      setSavingEdit(true);
                      const payload = { ...editForm };
                      // Hitung ulang lama_bekerja berdasarkan tanggal_bergabung (read-only di UI)
                      try {
                        payload.lama_bekerja = calcTenureMonthsDays(editForm.tanggal_bergabung);
                      } catch {}
                      const res = await adminSdmService.updateEmployee(editTarget.id, payload);
                      if (res?.success === false) throw new Error(res?.message || 'Gagal menyimpan');
                      // Refresh data
                      await fetchHierarchy();
                      // Refresh detail jika sedang terbuka untuk orang yang sama
                      if (selected?.id && selected.id === editTarget.id) {
                        try {
                          const fresh = await adminSdmService.getEmployeeById(selected.id);
                          if (fresh?.success) setDetail(fresh.data);
                        } catch {}
                      }
                      window.alert('Perubahan disimpan');
                      setEditTarget(null);
                    } catch (e) {
                      console.error(e);
                      window.alert(e?.message || 'Gagal menyimpan perubahan');
                    } finally {
                      setSavingEdit(false);
                    }
                  }}
                >
                  {savingEdit ? 'Menyimpan...' : 'Simpan'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDataTim;


