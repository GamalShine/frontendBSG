import React from 'react';

import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { komplainService } from '@/services/komplainService';
import { userService } from '@/services/userService';
import { toast } from 'react-hot-toast';
import {
  Plus,
  Search,
  RefreshCw,
  Eye,
  Edit,
  Trash2,
  MessageSquare,
  MoreVertical,
  Copy as CopyIcon,
  Share2
} from 'lucide-react';

const OwnerDaftarKomplain = () => {
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [users, setUsers] = useState([]);
  const [userMap, setUserMap] = useState({});
  const [selectedItems, setSelectedItems] = useState([]);
  const [showBulkMenu, setShowBulkMenu] = useState(false);

  useEffect(() => {
    loadData();
    loadUsers();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const res = await komplainService.getKomplain();
      const data = Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : [];
      const sorted = [...data].sort((a, b) => {
        const ad = a?.created_at || a?.tanggal_pelaporan || a?.createdAt;
        const bd = b?.created_at || b?.tanggal_pelaporan || b?.createdAt;
        const at = ad ? new Date(ad).getTime() : 0;
        const bt = bd ? new Date(bd).getTime() : 0;
        if (bt !== at) return bt - at;
        return (b?.id || 0) - (a?.id || 0);
      });
      setItems(sorted);
    } catch (err) {
      console.error('❌ Gagal memuat komplain:', err);
      toast.error('Gagal memuat daftar komplain');
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  const loadUsers = async () => {
    try {
      const res = await userService.getUsers({ page: 1, limit: 200 });
      const list = Array.isArray(res?.data)
        ? res.data
        : Array.isArray(res?.data?.users)
        ? res.data.users
        : Array.isArray(res)
        ? res
        : [];
      setUsers(list);
      const map = {};
      list.forEach((u) => {
        // Utamakan username; fallback ke nama, full_name, email, lalu User {id}
        map[u.id] = u.username || u.nama || u.full_name || u.email || `User ${u.id}`;
      });
      setUserMap(map);
    } catch (e) {
      console.error('Gagal memuat users:', e);
    }
  };

  const nameById = (id) => {
    if (!id && id !== 0) return '-';
    return userMap[id] || `User ${id}`;
  };

  const usernameById = (id) => {
    if (!id && id !== 0) return '-'
    const u = users.find(u => String(u.id) === String(id))
    return (u?.username || u?.nama || u?.full_name || u?.email || `User ${id}`)
  }

  const pihakTerkaitNames = (value) => {
    if (!value) return [];
    try {
      let arr = value;
      if (typeof value === 'string') {
        arr = JSON.parse(value);
      }
      if (!Array.isArray(arr)) return [];
      // Support array of IDs or array of objects {id,nama}
      return arr.map((it) => {
        if (typeof it === 'object' && it) {
          // Prioritaskan username jika ada
          return it.username || usernameById(it.id);
        }
        return usernameById(it);
      });
    } catch (e) {
      // If not JSON, maybe comma-separated
      const arr = value
        .toString()
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);
      return arr.map((id) => usernameById(Number(id)));
    }
  };

  const filteredItems = useMemo(() => {
    return items.filter((it) => {
      const matchesSearch = searchTerm
        ? (
            (it?.judul_komplain || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            (it?.deskripsi_komplain || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            (it?.pelapor?.nama || '').toLowerCase().includes(searchTerm.toLowerCase())
          )
        : true;
      const matchesStatus = statusFilter ? (it?.status || '').toLowerCase() === statusFilter : true;
      return matchesSearch && matchesStatus;
    });
  }, [items, searchTerm, statusFilter]);

  const stats = useMemo(() => {
    const total = filteredItems.length;
    const menunggu = filteredItems.filter((i) => (i?.status || '').toLowerCase() === 'menunggu').length;
    const diproses = filteredItems.filter((i) => (i?.status || '').toLowerCase() === 'diproses').length;
    const selesai = filteredItems.filter((i) => (i?.status || '').toLowerCase() === 'selesai').length;
    return { total, menunggu, diproses, selesai };
  }, [filteredItems]);

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const d = new Date(dateString);
    return d.toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  const truncateText = (text, maxLength = 150) => {
    if (!text) return '-';
    const s = String(text);
    if (s.length <= maxLength) return s;
    return s.substring(0, maxLength) + '...';
  };

  // Last updated from latest item date
  const getLastUpdated = () => {
    if (!Array.isArray(items) || items.length === 0) return null;
    const latest = items.reduce((acc, it) => {
      const d = it?.created_at || it?.tanggal_pelaporan || it?.createdAt;
      const t = d ? new Date(d).getTime() : 0;
      return t > acc ? t : acc;
    }, 0);
    if (!latest) return null;
    try {
      return new Date(latest).toLocaleString('id-ID', {
        year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
      });
    } catch {
      return null;
    }
  };

  // Selection handlers (mirip Omset)
  const handleCheckboxChange = (id) => {
    setSelectedItems((prev) => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])
  }

  const handleSelectAll = () => {
    if (!filteredItems?.length) return
    if (selectedItems.length === filteredItems.length) {
      setSelectedItems([])
    } else {
      setSelectedItems(filteredItems.map(it => it.id))
    }
  }

  const getSelectedEntries = () => {
    if (!Array.isArray(selectedItems) || selectedItems.length === 0) return []
    const byId = new Map((items || []).map(it => [it.id, it]))
    return selectedItems.map(id => byId.get(id)).filter(Boolean)
  }

  const handleBulkCopy = async () => {
    const entries = getSelectedEntries()
    if (entries.length === 0) return toast.error('Pilih minimal satu komplain terlebih dahulu')
    const combined = entries.map(e => {
      const tgl = formatDate(e?.created_at || e?.tanggal_pelaporan)
      const pelapor = e?.pelapor?.nama || '-'
      const judul = e?.judul_komplain || '-'
      const desk = e?.deskripsi_komplain || ''
      return `${tgl}\n${pelapor} — ${judul}${desk ? `, ${desk}` : ''}`
    }).join('\n\n---\n\n')
    await navigator.clipboard.writeText(combined)
    toast.success(`Menyalin ${entries.length} komplain`)
    setShowBulkMenu(false)
  }

  const handleBulkDownload = () => {
    const entries = getSelectedEntries()
    if (entries.length === 0) return toast.error('Pilih minimal satu komplain terlebih dahulu')
    const combined = entries.map(e => {
      const tgl = formatDate(e?.created_at || e?.tanggal_pelaporan)
      const pelapor = e?.pelapor?.nama || '-'
      const judul = e?.judul_komplain || '-'
      const desk = e?.deskripsi_komplain || ''
      return `${tgl}\n${pelapor} — ${judul}${desk ? `, ${desk}` : ''}`
    }).join('\n\n---\n\n')
    const blob = new Blob([combined], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `owner_komplain_selected_${entries.length}.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    setShowBulkMenu(false)
  }

  const handleBulkShare = async () => {
    const entries = getSelectedEntries()
    if (entries.length === 0) return toast.error('Pilih minimal satu komplain terlebih dahulu')
    const combined = entries.map(e => {
      const tgl = formatDate(e?.created_at || e?.tanggal_pelaporan)
      const pelapor = e?.pelapor?.nama || '-'
      const judul = e?.judul_komplain || '-'
      const desk = e?.deskripsi_komplain || ''
      return `${tgl}\n${pelapor} — ${judul}${desk ? `, ${desk}` : ''}`
    }).join('\n\n---\n\n')
    if (navigator.share) {
      try { await navigator.share({ title: `Komplain (${entries.length})`, text: combined }) } catch {}
    } else {
      await navigator.clipboard.writeText(combined)
      toast.success('Teks disalin untuk dibagikan')
    }
    setShowBulkMenu(false)
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Hapus komplain ini?')) return;
    try {
      await komplainService.deleteKomplain(id);
      toast.success('Komplain dihapus');
      loadData();
    } catch (err) {
      console.error('❌ Gagal hapus:', err);
      toast.error('Gagal menghapus komplain');
    }
  };

  return (
    <div className="p-0 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="bg-red-800 text-white px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span className="text-sm font-semibold bg-white/10 rounded px-2 py-1">O01-C1</span>
            <div>
              <h1 className="text-xl md:text-2xl font-extrabold tracking-tight">DAFTAR KOMPLAIN</h1>
              <p className="text-sm text-red-100">Ringkasan komplain operasional</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowFilters((v) => !v)}
              className="px-4 py-2 rounded-full border border-white/60 text-white hover:bg-white/10"
            >
              PENCARIAN
            </button>
            <Link
              to="/owner/operasional/komplain/new"
              className="inline-flex items-center gap-2 px-4 py-2 bg-white text-red-700 rounded-lg hover:bg-red-50 transition-colors shadow-sm"
            >
              <Plus className="h-4 w-4" />
              <span className="font-semibold">Tambah</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Info bar */}
      <div className="bg-gray-200 px-6 py-2 text-xs text-gray-600">
        {(() => {
          const lu = getLastUpdated();
          return lu ? `Terakhir diupdate: ${lu}` : 'Terakhir diupdate: -';
        })()}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6 px-6 mt-4">
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <MessageSquare className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Total</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <MessageSquare className="h-5 w-5 text-yellow-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Menunggu</p>
              <p className="text-2xl font-bold text-gray-900">{stats.menunggu}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-orange-100 rounded-lg">
              <MessageSquare className="h-5 w-5 text-orange-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Diproses</p>
              <p className="text-2xl font-bold text-gray-900">{stats.diproses}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <MessageSquare className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Selesai</p>
              <p className="text-2xl font-bold text-gray-900">{stats.selesai}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      {showFilters && (
        <div className="bg-white rounded-none md:rounded-xl shadow-sm border border-gray-100 my-4 mx-6">
          <div className="px-6 py-4 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Cari</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Cari komplain..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-3 py-2 w-full border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-red-500 focus:border-transparent"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Status</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 w-full border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-red-500 focus:border-transparent"
              >
                <option value="">Semua</option>
                <option value="menunggu">Menunggu</option>
                <option value="diproses">Diproses</option>
                <option value="selesai">Selesai</option>
                <option value="ditolak">Ditolak</option>
              </select>
            </div>
            <div className="flex items-end">
              <button
                onClick={() => {
                  setSearchTerm('');
                  setStatusFilter('');
                }}
                className="inline-flex items-center gap-2 px-5 py-2 rounded-full border border-red-600 text-red-700 hover:bg-red-50 transition-colors"
              >
                <RefreshCw className="h-4 w-4" />
                <span className="font-semibold">Reset</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Daftar Komplain - Grid Cards */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 mt-4">
        <div className="px-6 py-3 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-base font-semibold text-gray-900">Daftar Komplain</h2>
          {selectedItems.length > 0 && (
            <span className="text-sm text-gray-600 hidden sm:inline">{selectedItems.length} item dipilih</span>
          )}
        </div>

        {loading ? (
          <div className="p-8 text-center text-gray-600">Memuat data...</div>
        ) : filteredItems.length === 0 ? (
          <div className="p-8 text-center">
            <MessageSquare className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Tidak ada data</h3>
            <p className="text-gray-500 mb-4">Belum ada komplain yang tersedia</p>
            <Link
              to="/owner/operasional/komplain/new"
              className="inline-flex items-center space-x-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
            >
              <Plus className="h-4 w-4" />
              <span>Tambah Komplain</span>
            </Link>
          </div>
        ) : (
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredItems.map((row, idx) => {
                const pelapor = row?.Pelapor || row?.pelapor || {};
                const penerimaNama = (row?.PenerimaKomplain?.nama || row?.penerima_komplain?.nama) || nameById(row?.penerima_komplain_id) || '-';
                const pihak = (() => { const n = pihakTerkaitNames(row?.pihak_terkait); return n.length ? n.join(', ') : '-'; })();
                return (
                  <div key={row.id} className="relative border rounded-lg p-4 hover:shadow-md transition-shadow">
                    {/* Actions */}
                    <div className="absolute top-2 right-2 flex items-center gap-1">
                      <button title="Lihat" onClick={() => navigate(`/owner/operasional/komplain/${row.id}`)} className="p-2 rounded hover:bg-gray-100 text-gray-700"><Eye className="h-4 w-4"/></button>
                      <button title="Edit" onClick={() => navigate(`/owner/operasional/komplain/${row.id}/edit`)} className="p-2 rounded hover:bg-gray-100 text-amber-600"><Edit className="h-4 w-4"/></button>
                      <button title="Hapus" onClick={() => handleDelete(row.id)} className="p-2 rounded hover:bg-gray-100 text-red-600"><Trash2 className="h-4 w-4"/></button>
                    </div>
                    <div className="pr-16">
                      <div className="text-xs text-gray-500">{formatDate(row?.created_at || row?.tanggal_pelaporan)}</div>
                      <h3 className="text-base font-semibold text-gray-900 mt-0.5">{row?.judul_komplain || '-'}</h3>
                      <p className="text-sm text-gray-700 mt-1 line-clamp-2">{truncateText(row?.deskripsi_komplain, 140)}</p>
                      <div className="mt-2 text-sm text-gray-700 space-y-1">
                        <div><span className="text-gray-500">Pelapor:</span> <span className="font-medium">{pelapor?.username || pelapor?.nama || '-'}</span></div>
                        <div><span className="text-gray-500">Penerima:</span> {penerimaNama}</div>
                        <div className="capitalize"><span className="text-gray-500">Status:</span> {row?.status || '-'}</div>
                        <div><span className="text-gray-500">Pihak Terkait:</span> {pihak}</div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default OwnerDaftarKomplain;
