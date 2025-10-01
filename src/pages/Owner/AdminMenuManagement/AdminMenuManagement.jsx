import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { 
  Settings, 
  Users, 
  Shield, 
  CheckCircle, 
  XCircle, 
  Save,
  RefreshCw,
  Eye,
  EyeOff,
  FileText
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import PermissionTemplates from './PermissionTemplates';
import { picMenuService } from '../../../services/picMenuService';

const AdminMenuManagement = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [menuPermissions, setMenuPermissions] = useState({});
  const [adminUsers, setAdminUsers] = useState([]);
  const [selectedAdmin, setSelectedAdmin] = useState(null);
  const [showInactive, setShowInactive] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);
  const [showMenuDetailsModal, setShowMenuDetailsModal] = useState(false);

  // Menu structure based on database pic_menu table
  const [adminMenus, setAdminMenus] = useState({});
  const [picMenus, setPicMenus] = useState([]);

  // Default permissions structure
  const defaultPermissions = {
    'view': { label: 'Lihat Data', description: 'Dapat melihat data' },
    'create': { label: 'Tambah Data', description: 'Dapat menambah data' },
    'edit': { label: 'Edit Data', description: 'Dapat mengedit data' },
    'delete': { label: 'Hapus Data', description: 'Dapat menghapus data' },
    'approve': { label: 'Approve', description: 'Dapat approve data' },
    'manage': { label: 'Kelola', description: 'Dapat mengelola data' }
  };

  useEffect(() => {
    if (user?.id) {
      loadAdminUsers();
      loadPicMenus();
      loadMenuPermissions();
    }
  }, [user]);

  const loadAdminUsers = async () => {
    try {
      setLoading(true);
      // Mock data - replace with actual API call
      const mockAdmins = [
        { id: 1, nama: 'Admin Keuangan', username: 'admin_keuangan', email: 'admin.keuangan@bosgil.com', role: 'Admin', status: 'active', department: 'Keuangan' },
        { id: 2, nama: 'Admin Marketing', username: 'admin_marketing', email: 'admin.marketing@bosgil.com', role: 'Admin', status: 'active', department: 'Marketing' },
        { id: 3, nama: 'Admin Operasional', username: 'admin_operasional', email: 'admin.operasional@bosgil.com', role: 'Admin', status: 'active', department: 'Operasional' },
        { id: 4, nama: 'Admin SDM', username: 'admin_sdm', email: 'admin.sdm@bosgil.com', role: 'Admin', status: 'inactive', department: 'SDM' },
        { id: 5, nama: 'Admin IT', username: 'admin_it', email: 'admin.it@bosgil.com', role: 'Admin', status: 'active', department: 'IT' }
      ];
      setAdminUsers(mockAdmins);
    } catch (error) {
      console.error('Error loading admin users:', error);
      toast.error('Gagal memuat daftar admin');
    } finally {
      setLoading(false);
    }
  };

  const loadPicMenus = async () => {
    try {
      // Load PIC menus from database
      const response = await picMenuService.getAllPicMenus();
      if (response.success) {
        setPicMenus(response.data);
        
        // Transform PIC menus into adminMenus structure
        const transformedMenus = {};
        response.data.forEach(menu => {
          if (!menu.status_deleted) {
            const menuKey = menu.nama;
            const icon = getMenuIcon(menu.nama);
            
            transformedMenus[menuKey] = {
              id: menu.id,
              icon: icon,
              description: `Menu untuk ${menu.nama}`,
              link: menu.link,
              subMenus: { ...defaultPermissions }
            };
          }
        });
        
        setAdminMenus(transformedMenus);
      }
    } catch (error) {
      console.error('Error loading PIC menus:', error);
      toast.error('Gagal memuat daftar menu');
    }
  };

  const getMenuIcon = (menuName) => {
    const iconMap = {
      'POSKAS': '💰',
      'Laporan Keuangan': '📊',
      'Struktur & SOP': '📋',
      'Data Tim': '👥',
      'Data Aset': '🏢',
      'Data Supplier': '🏭',
      'Data Target': '🎯',
      'Social Media': '📱',
      'Tim Merah/Biru': '🔴🔵',
      'Data Training': '🎓'
    };
    
    return iconMap[menuName] || '📄';
  };

  const loadMenuPermissions = async () => {
    try {
      // Load permissions from database based on pic_menu assignments
      const permissions = {};
      
      for (const admin of adminUsers) {
        if (admin.role === 'Admin') {
          permissions[admin.id] = {};
          
          // Get PIC menus for this admin
          const adminPicMenus = picMenus.filter(menu => 
            menu.id_user === admin.id && !menu.status_deleted
          );
          
          // Set default permissions for each menu
          Object.keys(adminMenus).forEach(menuKey => {
            const hasAccess = adminPicMenus.some(picMenu => 
              picMenu.nama === menuKey
            );
            
            permissions[admin.id][menuKey] = {
              view: hasAccess,
              create: hasAccess,
              edit: hasAccess,
              delete: false, // Default to false for safety
              approve: hasAccess,
              manage: hasAccess
            };
          });
        }
      }
      
      setMenuPermissions(permissions);
    } catch (error) {
      console.error('Error loading menu permissions:', error);
      toast.error('Gagal memuat permissions');
    }
  };

  const handlePermissionChange = (adminId, menuKey, permissionKey, value) => {
    setMenuPermissions(prev => ({
      ...prev,
      [adminId]: {
        ...prev[adminId],
        [menuKey]: {
          ...prev[adminId]?.[menuKey],
          [permissionKey]: value
        }
      }
    }));
  };

  const handleSavePermissions = async () => {
    try {
      setSaving(true);
      
      if (!selectedAdmin) {
        toast.error('Pilih admin terlebih dahulu');
        return;
      }

      // Save permissions to database via pic_menu table
      const adminPermissions = menuPermissions[selectedAdmin.id];
      if (!adminPermissions) {
        toast.error('Tidak ada permissions untuk disimpan');
        return;
      }

      // Get current PIC menus for this admin
      const currentPicMenus = picMenus.filter(menu => 
        menu.id_user === selectedAdmin.id && !menu.status_deleted
      );

      // Determine which menus to assign/remove based on permissions
      const menusToAssign = [];
      const menusToRemove = [];

      Object.entries(adminPermissions).forEach(([menuName, permissions]) => {
        const hasAccess = permissions.view || permissions.create || permissions.edit || permissions.approve || permissions.manage;
        const currentMenu = currentPicMenus.find(menu => menu.nama === menuName);
        
        if (hasAccess && !currentMenu) {
          // Need to assign this menu
          menusToAssign.push({
            nama: menuName,
            link: adminMenus[menuName]?.link || menuName.toLowerCase().replace(/\s+/g, '-')
          });
        } else if (!hasAccess && currentMenu) {
          // Need to remove this menu
          menusToRemove.push(currentMenu.id);
        }
      });

      // Assign new menus
      for (const menuData of menusToAssign) {
        await picMenuService.assignMenuToUser(selectedAdmin.id, menuData);
      }

      // Remove menus
      for (const menuId of menusToRemove) {
        await picMenuService.removeMenuFromUser(selectedAdmin.id, menuId);
      }

      // Reload data
      await loadPicMenus();
      await loadMenuPermissions();
      
      toast.success('Permissions berhasil disimpan ke database!');
    } catch (error) {
      console.error('Error saving permissions:', error);
      toast.error('Gagal menyimpan permissions');
    } finally {
      setSaving(false);
    }
  };

  const handleResetPermissions = () => {
    if (window.confirm('Apakah Anda yakin ingin mereset semua permissions ke default?')) {
      loadMenuPermissions();
      toast.success('Permissions berhasil direset!');
    }
  };

  const handleApplyTemplate = (template) => {
    if (selectedAdmin) {
      setMenuPermissions(prev => ({
        ...prev,
        [selectedAdmin.id]: template.permissions
      }));
      toast.success(`Template "${template.name}" berhasil diterapkan ke ${selectedAdmin.nama}!`);
    } else {
      toast.error('Pilih admin terlebih dahulu');
    }
  };

  const showMenuDetails = () => {
    if (!selectedAdmin) {
      toast.error('Pilih admin terlebih dahulu');
      return;
    }
    setShowMenuDetailsModal(true);
  };

  const filteredAdmins = adminUsers.filter(admin => 
    showInactive || admin.status === 'active'
  );

  const getStatusBadge = (status) => {
    if (status === 'active') {
      return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
        <CheckCircle className="w-3 h-3 mr-1" />
        Aktif
      </span>;
    } else {
      return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
        <XCircle className="w-3 h-3 mr-1" />
        Tidak Aktif
      </span>;
    }
  };

  return (
    <div className="container mx-auto p-6">
      <div className="bg-white rounded-lg shadow-md">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Shield className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-800">Manajemen Menu Admin</h1>
                <p className="text-gray-600">Atur sub menu yang bisa diakses oleh Admin</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setShowTemplates(true)}
                className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg flex items-center space-x-2 transition-colors"
              >
                <FileText className="h-4 w-4" />
                <span>Templates</span>
              </button>
              <button
                onClick={handleResetPermissions}
                className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg flex items-center space-x-2 transition-colors"
              >
                <RefreshCw className="h-4 w-4" />
                <span>Reset</span>
              </button>
                             <button
                 onClick={handleSavePermissions}
                 disabled={saving}
                 className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2 transition-colors"
               >
                 <Save className="h-4 w-4" />
                 <span>{saving ? 'Menyimpan...' : 'Simpan'}</span>
               </button>
               <button
                 onClick={() => showMenuDetails()}
                 className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg flex items-center space-x-2 transition-colors"
               >
                 <Eye className="h-4 w-4" />
                 <span>Detail Menu</span>
               </button>
            </div>
          </div>
        </div>

        <div className="flex">
          {/* Admin List Sidebar */}
          <div className="w-80 border-r border-gray-200">
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-semibold text-gray-800">Daftar Admin</h3>
                <label className="flex items-center space-x-2 text-sm text-gray-600">
                  <input
                    type="checkbox"
                    checked={showInactive}
                    onChange={(e) => setShowInactive(e.target.checked)}
                    className="rounded border-gray-300"
                  />
                  <span>Tampilkan tidak aktif</span>
                </label>
              </div>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Cari admin..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="overflow-y-auto max-h-[calc(100vh-200px)]">
              {loading ? (
                <div className="p-4 text-center text-gray-500">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-2"></div>
                  Memuat daftar admin...
                </div>
              ) : filteredAdmins.length === 0 ? (
                <div className="p-4 text-center text-gray-500">
                  Tidak ada admin ditemukan
                </div>
              ) : (
                filteredAdmins.map((admin) => (
                  <div
                    key={admin.id}
                    onClick={() => setSelectedAdmin(admin)}
                    className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors ${
                      selectedAdmin?.id === admin.id ? 'bg-blue-50 border-blue-200' : ''
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gray-400 rounded-full flex items-center justify-center">
                        <Users className="h-5 w-5 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-medium text-gray-900 truncate">
                          {admin.nama}
                        </h4>
                        <p className="text-xs text-gray-500 truncate">
                          {admin.username} • {admin.department}
                        </p>
                        <div className="mt-1">
                          {getStatusBadge(admin.status)}
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Permissions Panel */}
          <div className="flex-1">
            {selectedAdmin ? (
              <div className="p-6">
                <div className="mb-6">
                  <h2 className="text-xl font-semibold text-gray-800 mb-2">
                    Permissions untuk {selectedAdmin.nama}
                  </h2>
                  <p className="text-gray-600">
                    {selectedAdmin.email} • {selectedAdmin.department}
                  </p>
                </div>

                <div className="space-y-6">
                  {Object.entries(adminMenus).map(([menuKey, menuData]) => (
                    <div key={menuKey} className="border border-gray-200 rounded-lg">
                                             <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
                         <div className="flex items-center space-x-3">
                           <span className="text-2xl">{menuData.icon}</span>
                           <div className="flex-1">
                             <h3 className="font-medium text-gray-900">{menuKey}</h3>
                             <p className="text-sm text-gray-600">{menuData.description}</p>
                             {picMenus.some(menu => 
                               menu.id_user === selectedAdmin?.id && 
                               menu.nama === menuKey && 
                               !menu.status_deleted
                             ) && (
                               <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800 mt-1">
                                 ✓ Menu Aktif
                               </span>
                             )}
                           </div>
                         </div>
                       </div>
                      
                      <div className="p-4">
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                          {Object.entries(menuData.subMenus).map(([permissionKey, permissionData]) => (
                            <div key={permissionKey} className="flex items-center space-x-3">
                              <input
                                type="checkbox"
                                id={`${selectedAdmin.id}-${menuKey}-${permissionKey}`}
                                checked={menuPermissions[selectedAdmin.id]?.[menuKey]?.[permissionKey] || false}
                                onChange={(e) => handlePermissionChange(
                                  selectedAdmin.id, 
                                  menuKey, 
                                  permissionKey, 
                                  e.target.checked
                                )}
                                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                              />
                              <label
                                htmlFor={`${selectedAdmin.id}-${menuKey}-${permissionKey}`}
                                className="text-sm text-gray-700 cursor-pointer"
                                title={permissionData.description}
                              >
                                {permissionData.label}
                              </label>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center">
                  <Shield className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Pilih Admin
                  </h3>
                  <p className="text-gray-500">
                    Pilih admin dari daftar di sebelah kiri untuk mengatur permissions
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Permission Templates Modal */}
      {showTemplates && (
        <PermissionTemplates
          onApplyTemplate={handleApplyTemplate}
          onClose={() => setShowTemplates(false)}
        />
      )}

      {/* Menu Details Modal */}
      {showMenuDetailsModal && selectedAdmin && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-[600px] max-h-[80vh] flex flex-col">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-800">
                  Detail Menu - {selectedAdmin.nama}
                </h3>
                <button
                  onClick={() => setShowMenuDetailsModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XCircle className="h-6 w-6" />
                </button>
              </div>
            </div>

            {/* Modal Content */}
            <div className="flex-1 overflow-y-auto p-6">
              {(() => {
                const adminPicMenus = picMenus.filter(menu => 
                  menu.id_user === selectedAdmin.id && !menu.status_deleted
                );

                if (adminPicMenus.length === 0) {
                  return (
                    <div className="text-center py-8">
                      <Shield className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">
                        Belum ada menu yang diassign
                      </h3>
                      <p className="text-gray-500">
                        {selectedAdmin.nama} belum memiliki akses ke menu apapun
                      </p>
                    </div>
                  );
                }

                return (
                  <div className="space-y-4">
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <h4 className="font-medium text-blue-900 mb-2">Menu yang Aktif:</h4>
                      <div className="grid grid-cols-2 gap-2">
                        {adminPicMenus.map((menu) => (
                          <div key={menu.id} className="flex items-center space-x-2 bg-white p-2 rounded border">
                            <span className="text-green-600">✓</span>
                            <span className="text-sm font-medium">{menu.nama}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                      <h4 className="font-medium text-gray-900 mb-2">Informasi Menu:</h4>
                      <div className="space-y-2">
                        {adminPicMenus.map((menu) => (
                          <div key={menu.id} className="bg-white p-3 rounded border">
                            <div className="flex items-center justify-between">
                              <span className="font-medium">{menu.nama}</span>
                              <span className="text-xs text-gray-500">ID: {menu.id}</span>
                            </div>
                            <p className="text-sm text-gray-600 mt-1">Link: {menu.link}</p>
                            <p className="text-xs text-gray-500 mt-1">
                              Dibuat: {new Date(menu.created_at).toLocaleDateString('id-ID')}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })()}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminMenuManagement;
