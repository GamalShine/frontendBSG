import React, { useState, useEffect } from 'react';
import Card, { CardHeader, CardBody, CardTitle, CardContent } from '@/components/UI/Card';
import Button from '@/components/UI/Button';
import LoadingSpinner from '@/components/UI/LoadingSpinner';
import { API_CONFIG } from '@/config/constants';
import { MENU_CODES } from '@/config/menuCodes';
import { Clock, ChevronDown, ChevronUp } from 'lucide-react';

// Skema data yang dibutuhkan (mock):
// {
//   pic: string,
//   lastUpdated: string (ISO Date),
//   branches: [
//     { id, name, departments?: [ { id, name } ] }
//   ],
//   payrollByDepartment: {
//     [departmentId]: {
//       employeeSample: { nama, posisi, lamaBekerjaBulan },
//       earning: { gajiPokok, tunjanganKinerja, tunjanganPosisi, uangMakan, lembur, bonus },
//       deduction: { potongan, bpjstk, bpjsKesehatan, bpjsKesPenambahan, spi2, pinjaman, pph21 }
//     }
//   }
// }

const currency = (n) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(n || 0);

const OwnerDaftarGaji = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);
  const [expandedBranch, setExpandedBranch] = useState(null);
  const [selectedDept, setSelectedDept] = useState(null);
  const [loadingDept, setLoadingDept] = useState(false);
  const [loadingSummary, setLoadingSummary] = useState(false);
  const [hierarchy, setHierarchy] = useState([]); // cache data dari /owner/sdm/hierarchy

  // --- MOCK fallback --- //
  const buildMock = () => ({
        pic: 'Ka.Keuangan',
        lastUpdated: new Date().toISOString(),
        branches: [
          { id: 'manajemen', name: 'MANAJEMEN' },
          { id: 'security_umum', name: 'SECURITY & UMUM' },
          { id: 'support_system', name: 'SUPPORT SYSTEM' },
          { id: 'toko_tepung', name: 'TOKO TEPUNG' },
          { id: 'bsg_karawaci', name: 'BSG KARAWACI' },
          { id: 'bsg_bsd', name: 'BSG BSD' },
          { id: 'bsg_bintaro', name: 'BSG BINTARO' },
          { id: 'bsg_condet', name: 'BSG CONDET' },
          { id: 'bsg_bandung', name: 'BSG BANDUNG' },
          { id: 'bsg_buah_batu', name: 'BSG BUAH BATU' },
          { id: 'bsg_pagesangan', name: 'BSG PAGESANGAN' },
          { id: 'bsg_ampel', name: 'BSG AMPEL' },
          { id: 'bsg_sidoarjo', name: 'BSG SIDOARJO' },
          { id: 'outlet_karang', name: 'OUTLET KARANG' },
          { id: 'outlet_permata', name: 'OUTLET PERMATA' },
          { id: 'total_keseluruhan', name: 'TOTAL KESELURUHAN' },
        ],
        payrollByDepartment: {
          bsd_mowkpr: {
            employeeSample: { nama: 'Contoh Karyawan', posisi: 'Staff', lamaBekerjaBulan: 18 },
            earning: { gajiPokok: 5000000, tunjanganKinerja: 750000, tunjanganPosisi: 500000, uangMakan: 300000, lembur: 250000, bonus: 400000 },
            deduction: { potongan: 100000, bpjstk: 120000, bpjsKesehatan: 150000, bpjsKesPenambahan: 0, spi2: 0, pinjaman: 0, pph21: 100000 }
          },
          bsd_kasir_adm: {
            employeeSample: { nama: 'Kasir Contoh', posisi: 'Kasir', lamaBekerjaBulan: 8 },
            earning: { gajiPokok: 4200000, tunjanganKinerja: 500000, tunjanganPosisi: 0, uangMakan: 250000, lembur: 100000, bonus: 200000 },
            deduction: { potongan: 50000, bpjstk: 100000, bpjsKesehatan: 120000, bpjsKesPenambahan: 0, spi2: 0, pinjaman: 0, pph21: 75000 }
          }
        }
  });

  // Gunakan endpoint yang SUDAH ADA di backend
  const ENDPOINTS = {
    OWNER_SDM_HIERARCHY: '/owner/sdm/hierarchy',
  };

  // --- Fetch helpers ---
  const safeFetch = async (endpoint, opts) => {
    const url = `${API_CONFIG.BASE_URL}${endpoint}`;
    const res = await fetch(url, { ...opts, headers: { 'Content-Type': 'application/json', ...(opts?.headers || {}) } });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
  };

  const loadInitial = async () => {
    try {
      setLoading(true);
      // Sertakan Authorization bila tersedia
      const token = localStorage.getItem('token') || localStorage.getItem('access_token');
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const res = await safeFetch(ENDPOINTS.OWNER_SDM_HIERARCHY, { headers }).catch(() => null);
      if (!res || !res.success || !Array.isArray(res.data)) {
        // fallback mock jika endpoint belum aktif
        setData(buildMock());
        setHierarchy([]);
        return;
      }
      const divisions = res.data; // [{ id, name, children: jabatans[{ id, name, children: employees[] }] }]
      setHierarchy(divisions);
      // Map divisions menjadi branches dan siapkan struktur dasar
      setData({
        pic: 'Ka.Keuangan',
        lastUpdated: new Date().toISOString(),
        branches: divisions.map(d => ({ id: String(d.id), name: d.name, departments: (d.children || []).map(j => ({ id: String(j.id), name: j.name })) })),
        payrollByDepartment: {},
      });
    } catch (e) {
      console.error('Load initial payroll failed:', e);
      setData(buildMock());
      setHierarchy([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInitial();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const toggleBranch = async (branchId) => {
    const next = expandedBranch === branchId ? null : branchId;
    setExpandedBranch(next);
    // Data departments sudah dipetakan dari hierarchy, tidak perlu fetch lagi
  };

  const handleSelectDept = async (deptId) => {
    setSelectedDept(deptId);
    if (data?.payrollByDepartment?.[deptId]) return;
    try {
      setLoadingSummary(true);
      // Cari employees di hierarchy berdasarkan jabatan.id = deptId
      let employees = [];
      for (const div of hierarchy) {
        for (const jab of (div.children || [])) {
          if (String(jab.id) === String(deptId)) {
            employees = jab.children || [];
            break;
          }
        }
        if (employees.length) break;
      }
      if (!employees.length) {
        // fallback mock jika tidak ada data
        setData((prev) => ({
          ...prev,
          payrollByDepartment: {
            ...prev.payrollByDepartment,
            [deptId]: buildMock().payrollByDepartment.bsd_mowkpr,
          },
        }));
        return;
      }
      // Hitung agregasi dari SdmData fields
      const sum = (arr, key) => arr.reduce((a, b) => a + (Number(b[key]) || 0), 0);
      const earning = {
        gajiPokok: sum(employees, 'gaji_pokok'),
        tunjanganKinerja: sum(employees, 'tunjangan_kinerja'),
        tunjanganPosisi: sum(employees, 'tunjangan_posisi'),
        uangMakan: sum(employees, 'uang_makan'),
        lembur: sum(employees, 'lembur'),
        bonus: sum(employees, 'bonus'),
      };
      const deduction = {
        potongan: sum(employees, 'potongan'),
        bpjstk: sum(employees, 'bpjstk'),
        bpjsKesehatan: sum(employees, 'bpjs_kesehatan'),
        bpjsKesPenambahan: sum(employees, 'bpjs_kes_penambahan'),
        spi2: sum(employees, 'sp_1_2'),
        pinjaman: sum(employees, 'pinjaman_karyawan'),
        pph21: sum(employees, 'pph21'),
      };
      const totalsFromBackend = {
        totalGaji: sum(employees, 'total_gaji'),
        totalPotongan: sum(employees, 'total_potongan'),
        totalGajiDibayarkan: sum(employees, 'total_gaji_dibayarkan'),
      };
      const sample = employees[0];
      const monthsDiff = (start) => {
        if (!start) return null;
        const d = new Date(start);
        const now = new Date();
        return (now.getFullYear() - d.getFullYear()) * 12 + (now.getMonth() - d.getMonth());
      };
      const employeeSample = {
        nama: sample?.nama || '—',
        posisi: sample?.jabatan?.nama_jabatan || '—',
        lamaBekerjaBulan: sample?.lama_bekerja ? Number(String(sample.lama_bekerja).replace(/\D/g, '')) : monthsDiff(sample?.tanggal_bergabung) || 0,
      };
      setData((prev) => ({
        ...prev,
        payrollByDepartment: {
          ...prev.payrollByDepartment,
          [deptId]: { employeeSample, earning, deduction, totalsFromBackend },
        },
      }));
    } catch (e) {
      console.error('Compute department summary failed:', e);
    } finally {
      setLoadingSummary(false);
    }
  };

  if (loading) return <LoadingSpinner />;
  if (error) return <div className="text-red-500">{error}</div>;
  if (!data) return null;

  const lastUpdatedText = new Date(data.lastUpdated).toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' });

  const breakdown = selectedDept ? data.payrollByDepartment[selectedDept] : null;
  const earningTotalComputed = breakdown ? Object.values(breakdown.earning).reduce((a, b) => a + (b || 0), 0) : 0;
  const deductionTotalComputed = breakdown ? Object.values(breakdown.deduction).reduce((a, b) => a + (b || 0), 0) : 0;
  const earningTotal = breakdown?.totalsFromBackend?.totalGaji ?? earningTotalComputed;
  const deductionTotal = breakdown?.totalsFromBackend?.totalPotongan ?? deductionTotalComputed;
  const takeHomePay = breakdown?.totalsFromBackend?.totalGajiDibayarkan ?? (earningTotalComputed - deductionTotalComputed);

  // Helpers: jumlah orang per dept dan per branch dari hierarchy
  const deptEmployeeCount = (deptId) => {
    for (const div of hierarchy) {
      for (const jab of (div.children || [])) {
        if (String(jab.id) === String(deptId)) return (jab.children || []).length || 0;
      }
    }
    return 0;
  };
  const branchEmployeeCount = (branchId) => {
    const div = hierarchy.find(d => String(d.id) === String(branchId));
    if (!div) return 0;
    return (div.children || []).reduce((sum, jab) => sum + ((jab.children || []).length || 0), 0);
  };

  return (
    <div className="space-y-6">
      {/* Header merah + badge kode */}
      <div className="bg-red-800 text-white px-4 sm:px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span className="text-sm font-semibold bg-white/10 rounded px-2 py-1">{MENU_CODES.keuangan.daftarGaji}</span>
            <div>
              <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">DAFTAR GAJI</h1>
              <p className="text-sm text-red-100">Ringkasan gaji per cabang dan divisi</p>
            </div>
          </div>
        </div>
      </div>
      <div className="bg-gray-200 px-4 py-2 text-xs text-gray-700 flex items-center gap-2">
        <Clock className="h-4 w-4 text-gray-600" />
        <span>Terakhir diupdate: {lastUpdatedText}</span>
      </div>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-3xl md:text-4xl font-extrabold tracking-tight">
              <span className="bg-yellow-300 px-2 mr-2">DAFTAR GAJI</span>
              &amp; BONUS
            </CardTitle>
            <div className="hidden md:block text-xs font-medium text-blue-700 uppercase tracking-wider">
              {/* petunjuk biru disembunyikan */}
            </div>
          </div>
          <div className="mt-2 text-gray-700">
            <p className="text-sm">PIC {data.pic}</p>
            <p className="text-sm">diupdate kapan terakhir : {lastUpdatedText}</p>
          </div>
          <div className="mt-4 flex gap-3">
            <Button variant="outline" className="rounded-full px-5">PENCARIAN</Button>
            <Button variant="outline" className="rounded-full px-5">SELENGKAPNYA</Button>
          </div>
        </CardHeader>
        <CardContent>
          {/* Daftar Cabang */}
          <div className="space-y-3">
            {data.branches.map((branch) => (
              <div key={branch.id} className="border border-gray-200 rounded-md overflow-hidden">
                <button
                  type="button"
                  onClick={() => toggleBranch(branch.id)}
                  className="w-full flex items-center justify-between px-4 py-2 bg-red-700 text-white"
                >
                  <span className="font-semibold">{branch.name}</span>
                  <span className="text-sm opacity-90">{branchEmployeeCount(branch.id)} orang {expandedBranch === branch.id ? <ChevronUp className="inline h-4 w-4 ml-2"/> : <ChevronDown className="inline h-4 w-4 ml-2"/>}</span>
                </button>
                {expandedBranch === branch.id && (
                  <div className="bg-white">
                    {loadingDept && (!branch.departments || branch.departments.length === 0) && (
                      <div className="text-sm text-gray-500 px-4 py-2">Memuat divisi...</div>
                    )}
                    {(branch.departments || []).map((dept) => (
                      <button
                        key={dept.id}
                        type="button"
                        onClick={() => handleSelectDept(dept.id)}
                        className={`w-full flex items-center justify-between text-left px-4 py-2 border-t border-gray-100 ${selectedDept === dept.id ? 'bg-gray-50' : 'bg-white hover:bg-gray-50'}`}
                      >
                        <span className="text-sm font-semibold text-gray-800">{dept.name}</span>
                        <span className="text-xs text-gray-600">{deptEmployeeCount(dept.id)} orang</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Tabel Rincian (muncul jika divisi dipilih) */}
          {selectedDept && (
            <div className="mt-6">
              <div className="border border-gray-300 rounded-md overflow-hidden">
                {loadingSummary && (
                  <div className="p-3 text-sm text-gray-500">Memuat ringkasan gaji...</div>
                )}
                {!loadingSummary && breakdown && (
                  <div className="w-full">
                    {/* Highlight nama karyawan */}
                    <div className="px-4 py-3 bg-red-50 text-red-800 font-semibold border-b border-gray-200">{breakdown.employeeSample.nama}</div>
                    <div className="grid grid-cols-2">
                      <div className="border-b border-r border-gray-300 p-2 text-sm font-semibold">NAMA</div>
                      <div className="border-b border-gray-300 p-2 text-sm">{breakdown.employeeSample.nama}</div>
                      <div className="border-b border-r border-gray-300 p-2 text-sm font-semibold">DIVISI</div>
                      <div className="border-b border-gray-300 p-2 text-sm">{data.branches.find(b => (b.departments||[]).some(d => String(d.id)===String(selectedDept)))?.name || '-'}</div>
                      <div className="border-b border-r border-gray-300 p-2 text-sm font-semibold">POSISI</div>
                      <div className="border-b border-gray-300 p-2 text-sm">{breakdown.employeeSample.posisi}</div>
                      <div className="border-b border-r border-gray-300 p-2 text-sm font-semibold">LAMA BEKERJA</div>
                      <div className="border-b border-gray-300 p-2 text-sm">{breakdown.employeeSample.lamaBekerjaBulan} bulan</div>

                      <div className="border-b border-r border-gray-300 p-2 text-sm font-semibold">GAJI POKOK</div>
                      <div className="border-b border-gray-300 p-2 text-sm font-mono">{currency(breakdown.earning.gajiPokok)}</div>
                      <div className="border-b border-r border-gray-300 p-2 text-sm font-semibold">TUNJANGAN KINERJA</div>
                      <div className="border-b border-gray-300 p-2 text-sm font-mono">{currency(breakdown.earning.tunjanganKinerja)}</div>
                      <div className="border-b border-r border-gray-300 p-2 text-sm font-semibold">TUNJANGAN POSISI</div>
                      <div className="border-b border-gray-300 p-2 text-sm font-mono">{currency(breakdown.earning.tunjanganPosisi)}</div>
                      <div className="border-b border-r border-gray-300 p-2 text-sm font-semibold">UANG MAKAN</div>
                      <div className="border-b border-gray-300 p-2 text-sm font-mono">{currency(breakdown.earning.uangMakan)}</div>
                      <div className="border-b border-r border-gray-300 p-2 text-sm font-semibold">LEMBUR</div>
                      <div className="border-b border-gray-300 p-2 text-sm font-mono">{currency(breakdown.earning.lembur)}</div>
                      <div className="border-b border-r border-gray-300 p-2 text-sm font-semibold">BONUS</div>
                      <div className="border-b border-gray-300 p-2 text-sm font-mono">{currency(breakdown.earning.bonus)}</div>
                      <div className="border-b border-r border-gray-300 p-2 text-sm font-semibold">TOTAL GAJI</div>
                      <div className="border-b border-gray-300 p-2 text-sm font-mono font-bold">{currency(earningTotal)}</div>

                      <div className="border-b border-r border-gray-300 p-2 text-sm font-semibold">POTONGAN</div>
                      <div className="border-b border-gray-300 p-2 text-sm font-mono">{currency(breakdown.deduction.potongan)}</div>
                      <div className="border-b border-r border-gray-300 p-2 text-sm font-semibold">BPJSTK</div>
                      <div className="border-b border-gray-300 p-2 text-sm font-mono">{currency(breakdown.deduction.bpjstk)}</div>
                      <div className="border-b border-r border-gray-300 p-2 text-sm font-semibold">BPJS KESEHATAN</div>
                      <div className="border-b border-gray-300 p-2 text-sm font-mono">{currency(breakdown.deduction.bpjsKesehatan)}</div>
                      <div className="border-b border-r border-gray-300 p-2 text-sm font-semibold">BPJS KES PENAMBAHAN</div>
                      <div className="border-b border-gray-300 p-2 text-sm font-mono">{currency(breakdown.deduction.bpjsKesPenambahan)}</div>
                      <div className="border-b border-r border-gray-300 p-2 text-sm font-semibold">SP 1/2</div>
                      <div className="border-b border-gray-300 p-2 text-sm font-mono">{currency(breakdown.deduction.spi2)}</div>
                      <div className="border-b border-r border-gray-300 p-2 text-sm font-semibold">PINJAMAN KARYAWAN</div>
                      <div className="border-b border-gray-300 p-2 text-sm font-mono">{currency(breakdown.deduction.pinjaman)}</div>
                      <div className="border-b border-r border-gray-300 p-2 text-sm font-semibold">PPH 21</div>
                      <div className="border-b border-gray-300 p-2 text-sm font-mono">{currency(breakdown.deduction.pph21)}</div>
                      <div className="border-b border-r border-gray-300 p-2 text-sm font-semibold">TOTAL POTONGAN</div>
                      <div className="border-b border-gray-300 p-2 text-sm font-mono font-bold">{currency(deductionTotal)}</div>

                      <div className="col-span-2 p-2 text-sm font-semibold text-center">TOTAL GAJI DIBAYARKAN</div>
                      <div className="col-span-2 border-t border-gray-300 p-3 text-center text-lg font-bold font-mono">{currency(takeHomePay)}</div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default OwnerDaftarGaji;

