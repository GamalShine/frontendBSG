import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { 
  Plus, 
  Search, 
  Edit3, 
  User, 
  X,
  Trash2
} from 'lucide-react';

import { toast } from 'react-hot-toast';
import { picMenuService } from '../../../services/picMenuService';
import { userService } from '../../../services/userService';

// Daftar key menu yang tersedia untuk di-assign oleh Owner (lengkap + legacy)
const MENU_KEYS = [
  // Global / Umum
  { key: 'AdminDashboard', label: 'Dashboard' },
  { key: 'AdminChatPrivate', label: 'Chat Private' },

  // Keuangan (Admin)
  { key: 'AdminKeuanganPoskas', label: 'Keuangan • POSKAS' },
  { key: 'AdminKeuanganOmsetHarian', label: 'Keuangan • Omset Harian' },
  { key: 'AdminKeuanganLaporan', label: 'Keuangan • Laporan Keuangan' },
  { key: 'AdminAnekaGrafik', label: 'Keuangan • Aneka Grafik' },
  { key: 'AdminKeuanganDaftarGaji', label: 'Keuangan • Daftar Gaji' },
  { key: 'AdminKeuanganAnekaSurat', label: 'Keuangan • Aneka Surat' },

  // SDM (Admin)
  { key: 'AdminSDMStruktur', label: 'SDM • Struktur, Jobdesk & SOP' },
  { key: 'AdminSDMDataTim', label: 'SDM • Data Tim' },
  { key: 'AdminSDMKPI', label: 'SDM • KPI' },
  { key: 'AdminSDMTimMerahBiru', label: 'SDM • Tim Merah/Biru' },

  // Operasional (Admin)
  { key: 'AdminDataSupplier', label: 'Operasional • Data Supplier' },
  { key: 'AdminOperasionalDataSewa', label: 'Operasional • Data Sewa' },
  { key: 'AdminDataInvestor', label: 'Operasional • Data Investor' },
  { key: 'AdminOperasionalDaftarSaran', label: 'Operasional • Daftar Saran' },
  { key: 'AdminOperasionalDaftarKomplain', label: 'Operasional • Daftar Komplain' },
  { key: 'AdminDataBinaLingkungan', label: 'Operasional • Data Bina Lingkungan' },
  { key: 'AdminDataAset', label: 'Operasional • Data Aset' },

  // Marketing (Admin)
  { key: 'AdminMarketingDataTarget', label: 'Marketing • Data Target' },
  { key: 'AdminMedsos', label: 'Marketing • Media Sosial' },

  // Settings (Admin)
  { key: 'AdminSettings', label: 'Settings' },

  // Legacy keys (dipertahankan untuk kompatibilitas backward)
  { key: 'AdminSdmStrukturSop', label: 'LEGACY • Struktur & SOP SDM' },
  { key: 'AdminDataTraining', label: 'LEGACY • Data Training' },
  { key: 'AdminPengumuman', label: 'LEGACY • Pengumuman' },
  { key: 'AdminTugas', label: 'LEGACY • Daftar Tugas' }
];

const PicMenuManagement = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [picMenus, setPicMenus] = useState([]);
  const [adminUsers, setAdminUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingMenu, setEditingMenu] = useState(null);
  const [formData, setFormData] = useState({
    nama: '',
    link: '',
    id_user: ''
  });

  useEffect(() => {
    if (user?.id) {
      loadPicMenus();
      loadAdminUsers();
    }
  }, [user]);

  const loadPicMenus = async () => {
    try {
      setLoading(true);
      const response = await picMenuService.getAllPicMenus();
      if (response.success) {
        // Frontend workaround: assign ui_id when backend id is invalid (<= 0)
        const raw = Array.isArray(response.data) ? response.data : [];
        let maxValidId = raw.reduce((m, it) => (Number(it.id) > 0 ? Math.max(m, Number(it.id)) : m), 0);
        let counter = maxValidId + 1;
        const normalized = raw.map((it) => ({
          ...it,
          ui_id: Number(it.id) > 0 ? Number(it.id) : counter++
        }));
        setPicMenus(normalized);
      } else {
        // Fallback to mock data if API fails
        const fallback = [
          {
            id: 1,
            nama: 'Data Investor',
            link: 'AdminDataInvestor',
            id_user: 1,
            status_deleted: 0,
            created_at: '2025-08-01 14:36:19',
            updated_at: '2025-08-01 14:36:19'
          },
          {
            id: 2,
            nama: 'Data Bina Lingkungan',
            link: 'AdminDataBinaLingkungan',
            id_user: 1,
            status_deleted: 0,
            created_at: '2025-08-01 14:36:19',
            updated_at: '2025-08-01 14:36:19'
          },
          {
            id: 3,
            nama: 'Data Training',
            link: 'AdminDataTraining',
            id_user: 1,
            status_deleted: 0,
            created_at: '2025-08-01 14:36:19',
            updated_at: '2025-08-01 14:36:19'
          }
        ].map((it) => ({ ...it, ui_id: it.id }));
        setPicMenus(fallback);
      }
    } catch (error) {
      console.error('Error loading PIC menus:', error);
      toast.error('Gagal memuat daftar menu');
    } finally {
      setLoading(false);
    }
  };

  const loadAdminUsers = async () => {
    try {
      const res = await userService.getUsers({ page: 1, limit: 100, role: 'admin' });
      // Normalisasi berbagai bentuk respons { success, data: [...]} atau { data: { users: [...] }}
      const list = Array.isArray(res?.data)
        ? res.data
        : Array.isArray(res?.data?.users)
        ? res.data.users
        : Array.isArray(res)
        ? res
        : [];
      setAdminUsers(list);
    } catch (error) {
      console.error('Error loading admin users:', error);
      toast.error('Gagal memuat daftar admin');
    }
  };

  const handleAddMenu = () => {
    setFormData({
      nama: '',
      link: '',
      id_user: ''
    });
    setShowAddModal(true);
  };

  const handleEditMenu = (menu) => {
    setEditingMenu(menu);
    setFormData({
      nama: menu.nama,
      link: menu.link,
      id_user: menu.id_user
    });
    setShowEditModal(true);
  };

  const handleSaveMenu = async () => {
    try {
      if (!formData.nama || !formData.id_user) {
        toast.error('Nama menu dan PIC harus diisi');
        return;
      }

      if (editingMenu) {
        // Update existing menu
        await picMenuService.updatePicMenu(editingMenu.id, formData);
        toast.success('Menu berhasil diupdate');
      } else {
        // Create new menu
        await picMenuService.createPicMenu(formData);
        toast.success('Menu berhasil ditambahkan');
      }

      setShowAddModal(false);
      setShowEditModal(false);
      setEditingMenu(null);
      loadPicMenus();
    } catch (error) {
      console.error('Error saving menu:', error);
      toast.error('Gagal menyimpan menu');
    }
  };

  const handleDeleteMenu = async (menuId) => {
    if (window.confirm('Apakah Anda yakin ingin menghapus menu ini?')) {
      try {
        await picMenuService.deletePicMenu(menuId);
        toast.success('Menu berhasil dihapus');
        loadPicMenus();
      } catch (error) {
        console.error('Error deleting menu:', error);
        toast.error('Gagal menghapus menu');
      }
    }
  };

  const getAdminById = (id) => {
    return adminUsers.find(admin => admin.id === id);
  };

  const filteredMenus = picMenus.filter(menu => 
    !menu.status_deleted && 
    (menu.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
     getAdminById(menu.id_user)?.nama.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-red-800 text-white">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">PIC Menu</h1>
              <p className="text-red-100 mt-1">Kelola menu dan person in charge</p>
            </div>
            <button
              onClick={handleAddMenu}
              className="bg-white text-red-800 p-3 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <Plus className="h-6 w-6" />
            </button>
          </div>
          
          {/* Search Bar */}
          <div className="mt-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-red-400 h-5 w-5" />
              <input
                type="text"
                placeholder="Cari menu atau PIC..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-red-700 text-white placeholder-red-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-300"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-6">
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-800 mx-auto mb-4"></div>
            <p className="text-gray-600">Memuat daftar menu...</p>
          </div>
        ) : filteredMenus.length === 0 ? (
          <div className="text-center py-12">
            <div className="bg-white rounded-lg p-8 shadow-sm">
              <User className="h-16 w-16 mx-auto mb-4 text-gray-300" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Belum ada menu</h3>
              <p className="text-gray-500 mb-4">
                {searchTerm ? 'Tidak ada menu yang sesuai dengan pencarian' : 'Mulai dengan menambahkan menu pertama'}
              </p>
              {!searchTerm && (
                <button onClick={handleAddMenu} className="bg-red-800 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition-colors">
                  Tambah Menu Pertama
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredMenus.map((menu) => {
              const admin = getAdminById(menu.id_user);
              return (
                <div key={menu.ui_id || menu.id} className="bg-white rounded-lg shadow-sm border border-gray-200">
                  <div className="p-4 border-b border-gray-100">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">{menu.nama}</h3>
                        <p className="text-sm text-gray-600">{getMenuLabel(menu.link)}</p>
                      </div>
                      <button
                        onClick={() => {
                          if (!(menu.id > 0)) {
                            toast.error('Data belum memiliki ID valid dari server. Silakan refresh atau hubungi admin.');
                            return;
                          }
                          handleEditMenu(menu);
                        }}
                        className={`p-2 ${menu.id > 0 ? 'text-red-600 hover:text-red-700' : 'text-gray-300 cursor-not-allowed'}`}
                        disabled={!(menu.id > 0)}
                      >
                        <Edit3 className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                  <div className="p-4 bg-pink-50">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                          <User className="h-5 w-5 text-red-600" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{admin?.nama || 'Unknown'}</p>
                          <p className="text-sm text-gray-600">{admin?.email || 'No email'}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-pink-100 text-red-800">PIC</span>
                        <button
                          onClick={() => {
                            if (!(menu.id > 0)) {
                              toast.error('Tidak bisa menghapus: ID belum valid dari server.');
                              return;
                            }
                            handleDeleteMenu(menu.id);
                          }}
                          className={`p-1 ${menu.id > 0 ? 'text-red-600 hover:text-red-700' : 'text-gray-300 cursor-not-allowed'}`}
                          disabled={!(menu.id > 0)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

    {/* Add Menu Modal */}
    {showAddModal && (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg shadow-xl w-[500px] max-h-[90vh] flex flex-col">
          {/* Modal Header */}
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-800">
                Tambah PIC Menu
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
          </div>

          {/* Modal Content */}
          <div className="flex-1 p-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Masukkan nama menu:
                </label>
                <input
                  type="text"
                  value={formData.nama}
                  onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                  placeholder="Nama menu"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Key Menu:
                </label>
                <select
                  value={formData.link}
                  onChange={(e) => setFormData({ ...formData, link: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                >
                  <option value="">Pilih Key Menu</option>
                  {MENU_KEYS.map((opt) => (
                    <option key={opt.key} value={opt.key}>
                      {opt.label} • {opt.key}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  PIC (Admin):
                </label>
                <select
                  value={formData.id_user}
                  onChange={(e) => setFormData({ ...formData, id_user: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                >
                  <option value="">Pilih Admin</option>
                  {adminUsers.map((admin) => (
                    <option key={admin.id} value={admin.id}>
                      {admin.nama} • {admin.email} • {admin.role}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Modal Actions */}
          <div className="px-6 py-4 border-t border-gray-200 flex space-x-3">
            <button
              onClick={() => setShowAddModal(false)}
              className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            >
              Batal
            </button>
            <button
              onClick={handleSaveMenu}
              className="flex-1 px-4 py-2 bg-red-800 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Tambah
            </button>
          </div>
        </div>
      </div>
    )}

    {/* Edit Menu Modal */}
    {showEditModal && (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg shadow-xl w-[500px] max-h-[90vh] flex flex-col">
          {/* Modal Header */}
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-800">
                Edit PIC Menu
              </h3>
              <button
                onClick={() => setShowEditModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
          </div>

          {/* Modal Content */}
          <div className="flex-1 p-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nama Menu:
                </label>
                <input
                  type="text"
                  value={formData.nama}
                  onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                  placeholder="Nama menu"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Key Menu:
                </label>
                <select
                  value={formData.link}
                  onChange={(e) => setFormData({ ...formData, link: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                >
                  <option value="">Pilih Key Menu</option>
                  {MENU_KEYS.map((opt) => (
                    <option key={opt.key} value={opt.key}>
                      {opt.label} • {opt.key}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  PIC (Admin):
                </label>
                <select
                  value={formData.id_user}
                  onChange={(e) => setFormData({ ...formData, id_user: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                >
                  <option value="">Pilih Admin</option>
                  {adminUsers.map((admin) => (
                    <option key={admin.id} value={admin.id}>
                      {admin.nama} • {admin.email} • {admin.role}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Modal Actions */}
          <div className="px-6 py-4 border-t border-gray-200 flex space-x-3">
            <button
              onClick={() => setShowEditModal(false)}
              className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            >
              Batal
            </button>
            <button
              onClick={handleSaveMenu}
              className="flex-1 px-4 py-2 bg-red-800 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Simpan
            </button>
          </div>
        </div>
      </div>
    )}
  </div>
);

};

// Helper untuk menampilkan label dari key menu
function getMenuLabel(key) {
  const found = MENU_KEYS.find((k) => k.key === key);
  return found ? found.label : key;
}

export default PicMenuManagement;
