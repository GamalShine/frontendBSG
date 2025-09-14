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
      <div className="bg-gray-200 px-6 py-2 text-xs text-gray-600">Daftar komplain terbaru berada di paling atas</div>

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

      {/* Data Table (match Omset Harian) */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 mt-4">
        <div className="px-6 py-3 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-base font-semibold text-gray-900">Daftar Komplain</h2>
          <div className="flex items-center gap-3">
            {selectedItems.length > 0 && (
              <span className="text-sm text-gray-600 hidden sm:inline">{selectedItems.length} item dipilih</span>
            )}
            <div className="relative">
              <button
                onClick={() => setShowBulkMenu(v => !v)}
                aria-label="Aksi massal"
                className="inline-flex items-center justify-center h-9 w-9 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50"
              >
                <MoreVertical className="h-4 w-4" />
              </button>
              {showBulkMenu && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-100 z-20">
                  <div className="py-1">
                    <button onClick={handleBulkCopy} className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50">Copy (ceklist)</button>
                    <button onClick={handleBulkDownload} className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50">Download (ceklist)</button>
                    <button onClick={handleBulkShare} className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50">Share (ceklist)</button>
                  </div>
                </div>
              )}
            </div>
          </div>
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
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="sticky top-0 bg-red-700 z-10">
                <tr>
                  <th className="pl-6 pr-0 py-3 text-left text-xs font-extrabold text-white uppercase tracking-wider">
                    <input
                      type="checkbox"
                      checked={selectedItems.length === filteredItems.length && filteredItems.length > 0}
                      onChange={handleSelectAll}
                      className="rounded border-white text-white focus:ring-white"
                      aria-label="Pilih semua"
                    />
                  </th>
                  <th className="pl-0 pr-12 py-3 text-left text-sm md:text-base font-extrabold text-white uppercase tracking-wider">No</th>
                  <th className="px-12 py-3 text-left text-sm md:text-base font-extrabold text-white uppercase tracking-wider">Judul</th>
                  <th className="px-12 py-3 text-left text-sm md:text-base font-extrabold text-white uppercase tracking-wider">Pelapor</th>
                  <th className="px-12 py-3 text-left text-sm md:text-base font-extrabold text-white uppercase tracking-wider">Penerima</th>
                  <th className="px-12 py-3 text-left text-sm md:text-base font-extrabold text-white uppercase tracking-wider">Pihak Terkait</th>
                  <th className="px-12 py-3 text-left text-sm md:text-base font-extrabold text-white uppercase tracking-wider">Status</th>
                  <th className="px-12 py-3 text-left text-sm md:text-base font-extrabold text-white uppercase tracking-wider">Tanggal</th>
                  <th className="px-12 py-3 text-left text-sm md:text-base font-extrabold text-white uppercase tracking-wider">Aksi</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {filteredItems.map((row, idx) => (
                  <tr key={row.id} className="hover:bg-gray-50/80">
                    <td className="pl-6 pr-0 py-4 whitespace-nowrap text-sm text-gray-900">
                      <input
                        type="checkbox"
                        checked={selectedItems.includes(row.id)}
                        onChange={() => handleCheckboxChange(row.id)}
                        className="rounded border-gray-300 text-red-600 focus:ring-red-500"
                        aria-label={`Pilih baris ${idx + 1}`}
                      />
                    </td>
                    <td className="pl-0 pr-12 py-4 whitespace-nowrap text-sm text-gray-900">{idx + 1}</td>
                    <td className="px-12 py-4 whitespace-nowrap text-sm text-gray-900">{row?.judul_komplain || '-'}</td>
                    <td className="px-12 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div>
                        <p className="font-medium">{(row?.Pelapor?.nama || row?.pelapor?.nama) || '-'}</p>
                        {((row?.Pelapor?.email || row?.pelapor?.email)) && (
                          <p className="text-xs text-gray-500">{row?.Pelapor?.email || row?.pelapor?.email}</p>
                        )}
                      </div>
                    </td>
                    <td className="px-12 py-4 whitespace-nowrap text-sm text-gray-900">{(row?.PenerimaKomplain?.nama || row?.penerima_komplain?.nama) || nameById(row?.penerima_komplain_id) || '-'}</td>
                    <td className="px-12 py-4 whitespace-nowrap text-sm text-gray-900">
                      {(() => {
                        const names = pihakTerkaitNames(row?.pihak_terkait);
                        return names.length ? names.join(', ') : '-';
                      })()}
                    </td>
                    <td className="px-12 py-4 whitespace-nowrap text-sm text-gray-900 capitalize">{row?.status || '-'}</td>
                    <td className="px-12 py-4 whitespace-nowrap text-sm text-gray-900">{formatDate(row?.created_at || row?.tanggal_pelaporan).toUpperCase()}</td>
                    <td className="px-12 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => navigate(`/owner/operasional/komplain/${row.id}`)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => navigate(`/owner/operasional/komplain/${row.id}/edit`)}
                          className="text-green-600 hover:text-green-900"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(row.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default OwnerDaftarKomplain;
