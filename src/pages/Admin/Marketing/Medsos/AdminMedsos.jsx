import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Card, { CardHeader, CardBody } from '@/components/UI/Card';
import Button from '@/components/UI/Button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/UI/Table';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { mediaSosialService } from '@/services/mediaSosialService';

const AdminMedsos = () => {
  const monthNames = ['Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember'];

  const [view, setView] = useState('years');
  const [selectedYear, setSelectedYear] = useState(null);
  const [selectedMonthIndex, setSelectedMonthIndex] = useState(null);
  const [years, setYears] = useState([]);
  const [months, setMonths] = useState([]);
  const [monthContent, setMonthContent] = useState([]);
  const [loading, setLoading] = useState({ years: false, months: false, content: false });
  const [error, setError] = useState({ years: null, months: null, content: null });
  const navigate = useNavigate();

  useEffect(() => { loadYears(); }, []);

  const loadYears = async () => {
    try {
      setLoading(prev => ({ ...prev, years: true }));
      setError(prev => ({ ...prev, years: null }));
      const res = await mediaSosialService.getYears();
      setYears(res?.data || []);
    } catch (e) {
      setError(prev => ({ ...prev, years: 'Gagal memuat daftar tahun' }));
    } finally {
      setLoading(prev => ({ ...prev, years: false }));
    }
  };

  const openYear = async (year) => {
    setSelectedYear(year);
    setView('months');
    try {
      setLoading(prev => ({ ...prev, months: true }));
      setError(prev => ({ ...prev, months: null }));
      const res = await mediaSosialService.getMonths(year);
      setMonths(res?.data || []);
    } catch (e) {
      setError(prev => ({ ...prev, months: 'Gagal memuat daftar bulan' }));
    } finally {
      setLoading(prev => ({ ...prev, months: false }));
    }
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
  };
  const goBackToMonths = () => {
    setView('months');
    setSelectedMonthIndex(null);
    setMonthContent([]);
  };

  const goToCreatePage = () => {
    const y = selectedYear ?? new Date().getFullYear();
    const m = (selectedMonthIndex ?? new Date().getMonth()) + 1;
    navigate(`/admin/marketing/medsos/form?year=${y}&month=${m}`);
  };
  const goToDetailPage = (id) => navigate(`/admin/marketing/medsos/${id}`);

  const formatDate = (date) => format(date, 'dd MMMM yyyy', { locale: id });
  const isToday = (date) => {
    const d = new Date(date); const now = new Date();
    return d.getFullYear()===now.getFullYear() && d.getMonth()===now.getMonth() && d.getDate()===now.getDate();
  };

  const FolderIcon = ({ open=false }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={`w-10 h-10 ${open ? 'text-yellow-600' : 'text-yellow-500'}`}>
      <path d="M10.5 4.5a1.5 1.5 0 0 1 1.06.44l1.5 1.5c.28.3.67.46 1.07.46H19.5A2.25 2.25 0 0 1 21.75 9v7.5A2.25 2.25 0 0 1 19.5 18.75h-15A2.25 2.25 0 0 1 2.25 16.5v-9A2.25 2.25 0 0 1 4.5 5.25h5.25z" />
    </svg>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-red-800 text-white p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div>
              <h1 className="text-2xl font-bold">MEDSOS</h1>
              <p className="text-sm opacity-90">Marketing - Medsos (Admin)</p>
            </div>
          </div>
        </div>
      </div>

      {/* Subheader: Timestamp menempel pada header (match Omset Harian) */}
      <div className="bg-gray-200 px-6 py-2 text-xs text-gray-600">Terakhir diupdate: {format(new Date(), "dd MMMM yyyy 'pukul' HH:mm", { locale: id })}</div>

      {/* Breadcrumb navigasi Tahun / Bulan */}
      <div className="w-full px-0 md:px-0 mt-3">
        <nav className="text-sm text-gray-600">
          <button type="button" className="hover:underline" onClick={goBackToYears}>Tahun</button>
          {selectedYear !== null && (
            <>
              <span className="mx-2">/</span>
              <button type="button" className="hover:underline" onClick={goBackToMonths}>{selectedYear}</button>
            </>
          )}
          {selectedMonthIndex !== null && (
            <>
              <span className="mx-2">/</span>
              <span className="text-gray-900 font-medium">{monthNames[selectedMonthIndex]}</span>
            </>
          )}
        </nav>
      </div>

      <div className="w-full px-0 md:px-0 mt-4">
        {view === 'years' && (
          <div className="bg-white shadow-sm border rounded-lg overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Pilih Tahun</h2>
            </div>
            <div className="p-3">
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                {loading.years && <div className="col-span-full text-sm text-gray-600">Memuat daftar tahun...</div>}
                {error.years && <div className="col-span-full text-sm text-red-600">{error.years}</div>}
                {!loading.years && !error.years && years.map((y) => (
                  <div key={y} className="group p-4 bg-white cursor-pointer border border-gray-200 rounded-xl hover:border-red-300 hover:shadow-md transition-all" onClick={() => openYear(y)}>
                    <div className="flex items-center gap-3">
                      <div className="shrink-0 p-2 rounded-lg bg-yellow-50 group-hover:bg-yellow-100 transition-colors">
                        <FolderIcon />
                      </div>
                      <div>
                        <div className="font-semibold text-gray-800 group-hover:text-red-700">{y}</div>
                        <div className="text-xs text-gray-500">Folder Tahun</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {view === 'months' && (
          <div className="bg-white shadow-sm border rounded-lg overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Pilih Bulan {selectedYear}</h2>
            </div>
            <div className="p-3">
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                {loading.months && <div className="col-span-full text-sm text-gray-600">Memuat daftar bulan...</div>}
                {error.months && <div className="col-span-full text-sm text-red-600">{error.months}</div>}
                {!loading.months && !error.months && months.map((mNum) => {
                  const idx = mNum - 1; const m = monthNames[idx] || `Bulan ${mNum}`;
                  return (
                    <div key={`${selectedYear}-${mNum}`} className="group p-4 bg-white cursor-pointer border border-gray-200 rounded-xl hover:border-red-300 hover:shadow-md transition-all" onClick={() => openMonth(idx)}>
                      <div className="flex items-center gap-3">
                        <div className="shrink-0 p-2 rounded-lg bg-yellow-50 group-hover:bg-yellow-100 transition-colors">
                          <FolderIcon />
                        </div>
                        <div>
                          <div className="font-semibold text-gray-800 group-hover:text-red-700">{m}</div>
                          <div className="text-xs text-gray-500">{selectedYear}</div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {view === 'monthContent' && (
          <div className="bg-white shadow-sm border rounded-lg overflow-hidden">
            <div className="bg-red-800 text-white px-4 py-3">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold">{monthNames[selectedMonthIndex]} {selectedYear}</h2>
                  <p className="text-xs opacity-90">Daftar Laporan Harian</p>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={goToCreatePage} className="bg-white border-red-600 text-red-700 hover:bg-red-50 inline-flex items-center gap-2 px-3 py-2 rounded-lg">Tambah</button>
                  <button onClick={goBackToMonths} className="bg-white border-red-600 text-red-700 hover:bg-red-50 inline-flex items-center gap-2 px-3 py-2 rounded-lg">Kembali</button>
                </div>
              </div>
            </div>
            {/* Summary bar */}
            <div className="px-4 py-2 bg-gray-100 text-xs text-gray-700 flex items-center justify-between">
              <div>
                Total Ditampilkan: <span className="font-semibold">{(monthContent?.length || 0).toLocaleString('id-ID')}</span>
              </div>
              <div>
                Bulan: <span className="font-semibold">{monthNames[selectedMonthIndex]} {selectedYear}</span>
              </div>
            </div>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="sticky top-0 bg-red-700 z-10 shadow">
                  <TableRow>
                    <TableHead className="w-12 text-white uppercase tracking-wider text-xs font-extrabold">No</TableHead>
                    <TableHead className="w-3/12 text-white uppercase tracking-wider text-xs font-extrabold">Tanggal</TableHead>
                    <TableHead className="text-white uppercase tracking-wider text-xs font-extrabold">Keterangan</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading.content && (
                    <TableRow><TableCell colSpan={3}><span className="text-sm text-gray-600">Memuat data...</span></TableCell></TableRow>
                  )}
                  {error.content && !loading.content && (
                    <TableRow><TableCell colSpan={3}><span className="text-sm text-red-600">{error.content}</span></TableCell></TableRow>
                  )}
                  {!loading.content && !error.content && monthContent.length === 0 && (
                    <TableRow><TableCell colSpan={3}><span className="text-sm text-gray-600">Belum ada data</span></TableCell></TableRow>
                  )}
                  {!loading.content && !error.content && monthContent.map((item, idx) => (
                    <TableRow key={item.id} className="cursor-pointer hover:bg-gray-50" onClick={() => goToDetailPage(item.id)}>
                      <TableCell>{idx + 1}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{formatDate(item.tanggal).toUpperCase()}</span>
                          {isToday(item.tanggal) && (
                            <span className="inline-flex items-center rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-semibold text-blue-700 ring-1 ring-inset ring-blue-600/10">NEW</span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm text-gray-800 max-w-2xl whitespace-pre-line">{item.keterangan}</div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminMedsos;
