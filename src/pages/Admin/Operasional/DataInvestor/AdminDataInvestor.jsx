import React, { useState, useEffect, useMemo } from 'react';
import { 
  Users, 
  Building2, 
  User, 
  Plus, 
  Search, 
  Filter, 
  Edit, 
  Trash2, 
  ChevronDown,
  ChevronRight,
  Phone,
  PhoneCall,
  AlertTriangle,
  MapPin,
  Calendar,
  Wallet,
  Heart,
  Baby,
  Percent,
  
} from 'lucide-react';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { dataInvestorService } from '@/services/dataInvestorService';
import { toast } from 'react-hot-toast';
import AdminDataInvestorForm from './AdminDataInvestorForm';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogBody, DialogFooter } from '@/components/UI/Dialog';
import { MENU_CODES } from '@/config/menuCodes';

const AdminDataInvestor = () => {
  const [activeSection, setActiveSection] = useState('outlet');
  const [dataInvestor, setDataInvestor] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [outletFilter, setOutletFilter] = useState('all');
  
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [outlets, setOutlets] = useState([]);
  const [showFilters, setShowFilters] = useState(false);
  const [expandedOutlets, setExpandedOutlets] = useState({});
  const [editData, setEditData] = useState(null);
  const [initialOpenAttachmentModal, setInitialOpenAttachmentModal] = useState(false);
  // Preview lampiran
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewItem, setPreviewItem] = useState(null); // { url, name, isImage }

  useEffect(() => {
    fetchDataInvestor();
    fetchOutlets();
  }, []);

  useEffect(() => {
    const initial = {};
    outlets.forEach((o) => { initial[o] = true; });
    setExpandedOutlets(initial);
  }, [outlets]);

  const fetchDataInvestor = async () => {
    try {
      setLoading(true);
      const response = await dataInvestorService.getAllDataInvestor();
      if (response.success) {
        setDataInvestor(response.data);
      }
    } catch (error) {
      console.error('Error fetching data investor:', error);
      setError('Gagal mengambil data investor');
      toast.error('Gagal mengambil data investor');
    } finally {
      setLoading(false);
    }
  };

  const fetchOutlets = async () => {
    try {
      const response = await dataInvestorService.getUniqueOutlets();
      if (response.success) {
        setOutlets(response.data);
      }
    } catch (error) {
      console.error('Error fetching outlets:', error);
    }
  };

  const handleDelete = async (id) => {
    try {
      const response = await dataInvestorService.deleteDataInvestor(id);
      if (response.success) {
        toast.success('Data investor berhasil dihapus');
        fetchDataInvestor();
        setShowDeleteConfirm(null);
      }
    } catch (error) {
      console.error('Error deleting data investor:', error);
      toast.error('Gagal menghapus data investor');
    }
  };

  const filteredData = dataInvestor.filter(item => {
    const matchesSearch = 
      item.nama_investor?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.outlet?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.no_hp?.includes(searchTerm) ||
      item.alamat?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesOutlet = outletFilter === 'all' || item.outlet === outletFilter;
    
    return matchesSearch && matchesOutlet;
  });

  // Last updated text mengikuti pola Indonesia panjang
  const lastUpdatedText = useMemo(() => {
    if (!Array.isArray(dataInvestor) || dataInvestor.length === 0) return '-';
    const timestamps = dataInvestor
      .map(d => d.updated_at || d.created_at || d.tanggal_join)
      .filter(Boolean)
      .map(d => new Date(d).getTime());
    if (!timestamps.length) return '-';
    const max = Math.max(...timestamps);
    if (!isFinite(max)) return '-';
    const dt = new Date(max);
    try {
      return format(dt, "d MMMM yyyy 'pukul' HH.mm", { locale: id });
    } catch {
      return '-';
    }
  }, [dataInvestor]);

  const getTipeColor = (tipe) => {
    switch (tipe) {
      case 'outlet': return 'bg-blue-100 text-blue-800';
      case 'biodata': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTipeIcon = (tipe) => {
    switch (tipe) {
      case 'outlet': return <Building2 className="w-4 h-4" />;
      case 'biodata': return <User className="w-4 h-4" />;
      default: return <Users className="w-4 h-4" />;
    }
  };

  // Util: parse persentase string menjadi number 0-100
  // Mendukung format '30%' atau '70%-30%'. Jika ada dua angka, anggap angka terakhir adalah porsi investor.
  const parsePercent = (val) => {
    if (val == null) return 0;
    try {
      const s = val.toString();
      const matches = [...s.matchAll(/(\d+(?:\.\d+)?)%?/g)].map(m => Number(m[1]));
      if (matches.length === 0 || matches.some(n => Number.isNaN(n))) return 0;
      const picked = matches.length >= 2 ? matches[matches.length - 1] : matches[0];
      return Math.max(0, Math.min(100, picked));
    } catch { return 0; }
  };

  // Parse lampiran dari kolom TEXT: bisa string JSON atau array object meta
  const parseLampiran = (raw) => {
    try {
      const val = typeof raw === 'string' ? JSON.parse(raw) : raw;
      if (!Array.isArray(val)) return [];
      return val
        .map((it) => {
          if (typeof it === 'string') {
            const url = it;
            const name = (() => {
              try { const u = new URL(url, window.location.origin); return decodeURIComponent(u.pathname.split('/').pop() || 'file'); } catch { return url.split('/').pop() || 'file'; }
            })();
            return { url, name, mime: '', size: undefined };
          }
          return {
            url: it.url || '#',
            name: it.name || it.originalName || it.filename || it.stored_name || 'file',
            mime: it.mime || it.mimetype || '',
            size: it.size,
          };
        })
        .filter(Boolean);
    } catch {
      return [];
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-red-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="text-red-600 text-xl mb-4">{error}</div>
          <button 
            onClick={fetchDataInvestor}
            className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
          >
            Coba Lagi
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header - konsisten dengan pola merah */}
      <div className="bg-red-800 text-white px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span className="text-sm font-semibold bg-white/10 rounded px-2 py-1">{MENU_CODES.operasional.dataInvestor}</span>
            <div>
              <h1 className="text-xl md:text-2xl font-extrabold tracking-tight">DATA INVESTOR</h1>
              <p className="text-sm text-red-100">Kelola investor dan outlet</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowFilters(v => !v)}
              className="px-4 py-2 rounded-full border border-white/60 text-white hover:bg-white/10"
              aria-pressed={showFilters}
            >
              PENCARIAN
            </button>
            <button 
              onClick={() => { setEditData(null); setInitialOpenAttachmentModal(false); setShowForm(true); }}
              className="inline-flex items-center gap-2 px-4 py-2 bg-white text-red-700 rounded-lg hover:bg-red-50 transition-colors shadow-sm"
            >
              <Plus className="w-4 h-4" />
              <span className="font-semibold">Tambah</span>
            </button>
          </div>
        </div>
      </div>

      {/* Info Update Bar - Abu-abu Muda */}
      <div className="bg-gray-200 px-6 py-2 text-xs text-gray-600">
        Terakhir diupdate: {lastUpdatedText}
      </div>

      {/* Search and Filters - gaya Data Sewa */}
      <div className="bg-white rounded-none md:rounded-xl shadow-sm border border-gray-100 mt-4 mb-4">
        <div className="px-6 py-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Cari Investor</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Cari nama, outlet, hp, alamat..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-red-500 focus:border-transparent"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Outlet</label>
              <select
                value={outletFilter}
                onChange={(e) => setOutletFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-red-500 focus:border-transparent"
              >
                <option value="all">Semua Outlet</option>
                {outlets.map((outlet, index) => (
                  <option key={index} value={outlet}>{outlet}</option>
                ))}
              </select>
            </div>
            <div className="flex items-end">
              <button
                onClick={() => { setSearchTerm(''); setOutletFilter('all'); }}
                className="inline-flex items-center gap-2 px-5 py-2 rounded-full border border-red-600 text-red-700 hover:bg-red-50 transition-colors"
              >
                Reset
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Daftar per Outlet */}
      <div className="px-0 pb-0 space-y-3">
        {outlets.map((outlet) => {
          const outletInvestors = filteredData.filter(item => item.outlet === outlet);
          if (outletInvestors.length === 0) return null;

          return (
            <div key={outlet} className="bg-white rounded-none md:rounded-lg shadow-sm border border-gray-100 overflow-hidden mt-2">
              <button
                type="button"
                onClick={() => setExpandedOutlets(prev => ({ ...prev, [outlet]: !prev[outlet] }))}
                className="w-full bg-red-800 text-white px-6 py-3 flex items-center justify-between hover:bg-red-900 transition-colors"
              >
                <span className="font-semibold text-left">{outlet}</span>
                {expandedOutlets[outlet] ? (
                  <ChevronDown className="w-5 h-5" />
                ) : (
                  <ChevronRight className="w-5 h-5" />
                )}
              </button>

              {expandedOutlets[outlet] && (
              <div className="p-4 bg-white">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-3 gap-y-2">
                {outletInvestors.map((investor) => (
                  <div key={investor.id} className="bg-white rounded-lg shadow-sm border border-gray-100 p-3 hover:shadow-md transition-shadow text-xs">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h4 className="text-sm font-medium text-gray-900">{investor.nama_investor}</h4>
                        <p className="text-[10px] text-gray-500">Outlet: {investor.outlet}</p>
                      </div>
                      {(() => {
                        const inv = parsePercent(investor.persentase_bagi_hasil);
                        const bos = Math.max(0, 100 - inv);
                        return (
                          <span className="inline-flex items-center gap-1 px-2 py-1 text-[10px] font-semibold rounded-full border bg-green-50 text-green-700 border-green-200">
                            <Percent className="w-3 h-3" /> {`${bos}% Bosgil — ${inv}% Investor`}
                          </span>
                        );
                      })()}
                    </div>

                    <div className="mt-2 pt-2 border-t border-gray-100 space-y-1 text-xs leading-relaxed text-gray-700">
                      <div className="flex items-center space-x-2">
                        <User className="w-4 h-4 text-gray-400" />
                        <span>{investor.ttl_investor || '-'}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Phone className="w-4 h-4 text-gray-400" />
                        <span>{investor.no_hp || '-'}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        <span>{investor.tanggal_join ? format(new Date(investor.tanggal_join), 'dd MMM yyyy', { locale: id }) : '-'}</span>
                      </div>
                      <div className="flex items-start space-x-2">
                        <MapPin className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                        <span className="line-clamp-2">{investor.alamat || '-'}</span>
                      </div>

                      <div className="space-y-1 pt-1">
                        <div className="flex items-center space-x-2 text-xs text-gray-700">
                          <PhoneCall className="w-4 h-4 text-gray-400" />
                          <span>Kontak Darurat:</span>
                          <span>{investor.kontak_darurat || '-'}</span>
                        </div>
                        <div className="flex items-center space-x-2 text-xs text-gray-700">
                          <Heart className="w-4 h-4 text-gray-400" />
                          <span>Pasangan:</span>
                          <span>{investor.nama_pasangan || '-'}</span>
                        </div>
                        <div className="flex items-center space-x-2 text-xs text-gray-700">
                          <Baby className="w-4 h-4 text-gray-400" />
                          <span>Anak:</span>
                          <span>{investor.nama_anak || '-'}</span>
                        </div>
                        <div className="flex items-center space-x-2 text-xs text-gray-700">
                          <Heart className="w-4 h-4 text-gray-400" />
                          <span>Ahli Waris:</span>
                          <span>{investor.ahli_waris || '-'}</span>
                        </div>

                        {(() => {
                          const files = parseLampiran(investor.lampiran);
                          if (!files.length) return null;
                          return (
                            <div className="mt-2">
                              <div className="text-[10px] font-semibold text-gray-700 mb-1">Lampiran:</div>
                              <div className="flex flex-wrap gap-2">
                                {files.map((f, idx) => {
                                  const isImage = (f.mime || '').startsWith('image/');
                                  const url = f.url || '#';
                                  const name = f.name || `file-${idx}`;
                                  return (
                                    <button
                                      key={`${name}-${idx}`}
                                      type="button"
                                      onClick={() => { setPreviewItem({ url, name, isImage }); setPreviewOpen(true); }}
                                      className="text-xs px-2 py-1 border rounded bg-white hover:bg-gray-50"
                                      title={name}
                                    >
                                      {isImage ? '🖼️' : '📎'} {name}
                                    </button>
                                  );
                                })}
                              </div>
                            </div>
                          );
                        })()}
                      </div>

                      <div className="flex items-center space-x-2 pt-1">
                        <Wallet className="w-4 h-4 text-gray-400" />
                        <span className="text-xs">Investasi di Outlet: {investor.investasi_di_outlet ? `Rp ${parseFloat(investor.investasi_di_outlet).toLocaleString('id-ID')}` : '-'}</span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex space-x-2 pt-3">
                      <button
                        className="p-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200"
                        title="Edit Biodata"
                        onClick={() => { setEditData(investor); setInitialOpenAttachmentModal(false); setShowForm(true); }}
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => setShowDeleteConfirm(investor.id)}
                        className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
                </div>
              </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Konfirmasi Hapus</h3>
            <p className="text-sm text-gray-500 mb-6">
              Apakah Anda yakin ingin menghapus data investor ini? Tindakan ini tidak dapat dibatalkan.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowDeleteConfirm(null)}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
              >
                Batal
              </button>
              <button
                onClick={() => handleDelete(showDeleteConfirm)}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Hapus
              </button>
        </div>
      </div>
        </div>
      )}

      {/* Form Modal */}
      <AdminDataInvestorForm
        isOpen={showForm}
        onClose={() => setShowForm(false)}
        onSuccess={fetchDataInvestor}
        editData={editData}
        initialOpenAttachmentModal={initialOpenAttachmentModal}
      />

      {/* Preview Lampiran */}
      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent className="max-w-5xl">
          <DialogHeader>
            <DialogTitle>Pratinjau Lampiran</DialogTitle>
          </DialogHeader>
          <DialogBody>
            {previewItem && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="text-sm font-medium text-gray-800 truncate" title={previewItem.name}>{previewItem.name}</div>
                  <div className="flex items-center gap-2">
                    <a href={previewItem.url} download target="_blank" rel="noreferrer" className="px-3 py-2 bg-gray-100 text-gray-800 rounded hover:bg-gray-200 text-sm">Download</a>
                    <a href={previewItem.url} target="_blank" rel="noreferrer" className="px-3 py-2 bg-white border rounded hover:bg-gray-50 text-sm">Buka Tab Baru</a>
                  </div>
                </div>
                <div className="border rounded-md bg-gray-50 p-2 max-h-[70vh] overflow-auto flex items-center justify-center">
                  {previewItem.isImage ? (
                    <img src={previewItem.url} alt={previewItem.name} className="max-h-[65vh] object-contain" />
                  ) : (
                    <iframe src={previewItem.url} title={previewItem.name} className="w-full h-[70vh] bg-white" />
                  )}
                </div>
              </div>
            )}
          </DialogBody>
          <DialogFooter>
            <button type="button" onClick={() => setPreviewOpen(false)} className="px-4 py-2 border rounded">Tutup</button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminDataInvestor;
