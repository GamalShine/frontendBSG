import React, { createContext, useContext, useState, useEffect } from 'react'
import { useAuth } from './AuthContext'

const MenuContext = createContext()

export const useMenu = () => {
  const context = useContext(MenuContext)
  if (!context) {
    throw new Error('useMenu must be used within a MenuProvider')
  }
  return context
}

export const MenuProvider = ({ children }) => {
  const { user, isAuthenticated } = useAuth()
  const [menus, setMenus] = useState([])
  const [permissions, setPermissions] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (isAuthenticated && user) {
      loadUserMenus()
    } else {
      setMenus([])
      setPermissions([])
      setLoading(false)
    }
  }, [isAuthenticated, user])

  const getMenusByRole = (role) => {
    // Definisikan menu dasar yang akan difilter berdasarkan role
    let baseMenus = [];
    
    // Menu Dashboard dengan path khusus per role
    const dashboardPath = role === 'owner' ? '/owner/dashboard'
      : role === 'admin' ? '/admin/dashboard'
      : '/dashboard'
    baseMenus.push({
      id: 'dashboard',
      title: 'Dashboard',
      path: dashboardPath,
      icon: 'Home',
      permissions: ['read']
    });
    
    // Menu Chat berdasarkan role
    switch(role) {
      case 'admin':
        baseMenus.push({
          id: 'chat',
          title: 'CHAT',
          path: '/admin/chat',
          icon: 'MessageCircle',
          permissions: ['read']
        });
        
        // Menu Daftar Tugas untuk Admin
        baseMenus.push({
          id: 'daftar-tugas',
          title: 'DAFTAR TUGAS',
          icon: 'CheckSquare',
          path: '/admin/tugas',
          permissions: ['read', 'create', 'update', 'delete']
        });
        break;
      case 'owner':
        baseMenus.push({
          id: 'chat',
          title: 'CHAT',
          path: '/owner/chat',
          icon: 'MessageCircle',
          permissions: ['read']
        });
        
        // Menu Daftar Tugas untuk Owner
        baseMenus.push({
          id: 'daftar-tugas',
          title: 'DAFTAR TUGAS',
          icon: 'CheckSquare',
          path: '/owner/tugas',
          permissions: ['read', 'create', 'update', 'delete']
        });
        break;
      case 'divisi':
        baseMenus.push({
          id: 'chat',
          title: 'CHAT',
          path: '/divisi/chat',
          icon: 'MessageCircle',
          permissions: ['read']
        });
        break;
      case 'tim':
        baseMenus.push({
          id: 'chat',
          title: 'CHAT',
          path: '/tim/chat',
          icon: 'MessageCircle',
          permissions: ['read']
        });
        break;
      default:
        // Untuk role lain (user biasa), gunakan path default
        baseMenus.push({
          id: 'chat',
          title: 'CHAT',
          path: '/chat/private',
          icon: 'MessageCircle',
          permissions: ['read']
        });
        break;
    }

    // Menu berdasarkan role
    switch(role) {
      case 'owner':
        // Menu Keuangan untuk Owner
        baseMenus.push({
          id: 'keuangan',
          title: 'KEUANGAN',
          icon: 'DollarSign',
          permissions: ['read'],
          children: [
            {
              id: 'poskas',
              title: 'POSKAS',
              path: '/owner/keuangan/poskas',
              permissions: ['read']
            },
            {
              id: 'omset-harian',
              title: 'OMSET HARIAN',
              path: '/owner/keuangan/omset-harian',
              permissions: ['read', 'create', 'update', 'delete']
            },
            {
              id: 'lap-keu',
              title: 'LAP. KEU',
              path: '/owner/keuangan/laporan',
              permissions: ['read']
            },
            {
              id: 'aneka-grafik',
              title: 'ANEKA GRAFIK',
              path: '/owner/keuangan/aneka-grafik',
              permissions: ['read']
            },
            {
              id: 'daftar-gaji',
              title: 'DAFTAR GAJI',
              path: '/owner/keuangan/gaji',
              permissions: ['read']
            },
            {
              id: 'aneka-surat',
              title: 'ANEKA SURAT',
              path: '/owner/keuangan/surat',
              permissions: ['read']
            }
          ]
        });
        
        // Menu SDM untuk Owner
        baseMenus.push({
          id: 'sdm',
          title: 'SDM',
          icon: 'Users2',
          permissions: ['read'],
          children: [
            {
              id: 'struktur-jobdesk-sop',
              title: 'STRUKTUR, JOBDESK & S.O.P.',
              path: '/owner/sdm/struktur',
              permissions: ['read']
            },
            {
              id: 'data-tim',
              title: 'DATA TIM',
              path: '/owner/sdm/tim',
              permissions: ['read']
            },
            {
              id: 'kpi',
              title: 'KPI',
              path: '/owner/sdm/kpi',
              permissions: ['read']
            },
            {
              id: 'tim-merah-biru',
              title: 'TIM MERAH/BIRU',
              path: '/owner/sdm/tim-merah-biru',
              permissions: ['read']
            }
          ]
        });
        
        // Menu Operasional untuk Owner
        baseMenus.push({
          id: 'operasional',
          title: 'OPERASIONAL',
          icon: 'Building2',
          permissions: ['read'],
          children: [
            {
              id: 'data-aset',
              title: 'DATA ASET',
              path: '/owner/operasional/aset',
              permissions: ['read']
            },
            {
              id: 'data-supplier',
              title: 'DATA SUPPLIER',
              path: '/owner/operasional/data-supplier',
              permissions: ['read']
            },
            {
              id: 'data-sewa',
              title: 'DATA SEWA',
              path: '/owner/operasional/sewa',
              permissions: ['read']
            },
            {
              id: 'data-investor',
              title: 'DATA INVESTOR',
              path: '/owner/operasional/investor',
              permissions: ['read']
            },
            {
              id: 'daftar-saran',
              title: 'DAFTAR SARAN',
              path: '/owner/operasional/saran',
              permissions: ['read']
            },
            {
              id: 'daftar-komplain',
              title: 'DAFTAR KOMPLAIN',
              path: '/owner/operasional/komplain',
              permissions: ['read']
            },
            {
              id: 'data-bina-lingkungan',
              title: 'DATA BINA LINGKUNGAN',
              path: '/owner/operasional/bina-lingkungan',
              permissions: ['read']
            },
            {
              id: 'jadwal-pembayaran',
              title: 'JADWAL PEMBAYARAN/PERAWATAN',
              path: '/owner/operasional/jadwal-pembayaran',
              permissions: ['read']
            }
          ]
        });
        
        // Menu Marketing untuk Owner
        baseMenus.push({
          id: 'marketing',
          title: 'MARKETING',
          icon: 'Target',
          permissions: ['read'],
          children: [
            {
              id: 'data-target',
              title: 'DATA TARGET',
              path: '/owner/marketing/data-target',
              permissions: ['read']
            },
            {
              id: 'medsos',
              title: 'MEDSOS',
              path: '/owner/marketing/medsos',
              permissions: ['read']
            }
          ]
        });
        

        
        // Menu Settings untuk Owner (dengan submenu)
        baseMenus.push({
          id: 'settings',
          title: 'Settings',
          path: '/settings',
          icon: 'Settings',
          permissions: ['read'],
          children: [
            {
              id: 'kelola-akun',
              title: 'Kelola Akun',
              path: '/owner/settings/kelola-akun',
              permissions: ['read']
            }
          ]
        });

                    // Menu PIC Menu Management untuk Owner
            baseMenus.push({
              id: 'pic-menu-management',
              title: 'PIC Menu Management',
              path: '/owner/pic-menu-management',
              icon: 'Users',
              permissions: ['read']
            });
        break;
        
      case 'admin':
        // Menu Keuangan untuk Admin
        baseMenus.push({
          id: 'keuangan',
          title: 'KEUANGAN',
          icon: 'DollarSign',
          permissions: ['read'],
          children: [
            {
              id: 'poskas',
              title: 'POSKAS',
              path: '/admin/keuangan/poskas',
              permissions: ['read', 'create', 'update', 'delete'],
              picKey: 'AdminKeuanganPoskas'
            },
            {
              id: 'omset-harian',
              title: 'OMSET HARIAN',
              path: '/admin/keuangan/omset-harian',
              permissions: ['read', 'create', 'update', 'delete'],
              picKey: 'AdminKeuanganOmsetHarian'
            },
            {
              id: 'lap-keu',
              title: 'LAP. KEU',
              path: '/admin/keuangan/laporan',
              permissions: ['read'],
              picKey: 'AdminKeuanganLaporan'
            },
            {
              id: 'aneka-grafik',
              title: 'ANEKA GRAFIK',
              path: '/admin/keuangan/aneka-grafik',
              permissions: ['read'],
              picKey: 'AdminAnekaGrafik'
            },
            {
              id: 'daftar-gaji',
              title: 'DAFTAR GAJI',
              path: '/admin/keuangan/gaji',
              permissions: ['read'],
              picKey: 'AdminKeuanganDaftarGaji'
            },
            {
              id: 'aneka-surat',
              title: 'ANEKA SURAT',
              path: '/admin/keuangan/surat',
              permissions: ['read'],
              picKey: 'AdminKeuanganAnekaSurat'
            }
          ]
        });
        
        // Menu SDM untuk Admin
        baseMenus.push({
          id: 'sdm',
          title: 'SDM',
          icon: 'Users2',
          permissions: ['read'],
          children: [
            {
              id: 'struktur-jobdesk-sop',
              title: 'STRUKTUR, JOBDESK & S.O.P.',
              path: '/admin/sdm/struktur',
              permissions: ['read'],
              picKey: 'AdminSDMStruktur'
            },
            {
              id: 'data-tim',
              title: 'DATA TIM',
              path: '/admin/sdm/tim',
              permissions: ['read'],
              picKey: 'AdminSDMDataTim'
            },
            {
              id: 'kpi',
              title: 'KPI',
              path: '/admin/sdm/kpi',
              permissions: ['read'],
              picKey: 'AdminSDMKPI'
            },
            {
              id: 'tim-merah-biru',
              title: 'TIM MERAH/BIRU',
              path: '/admin/sdm/tim-merah-biru',
              permissions: ['read'],
              picKey: 'AdminSDMTimMerahBiru'
            }
          ]
        });

        // Menu Operasional untuk Admin
        baseMenus.push({
          id: 'operasional',
          title: 'OPERASIONAL',
          icon: 'Settings',
          permissions: ['read'],
          children: [
            {
              id: 'data-aset',
              title: 'DATA ASET',
              path: '/admin/operasional/aset',
              permissions: ['read'],
              picKey: 'AdminDataAset'
            },
            {
              id: 'data-supplier',
              title: 'DATA SUPPLIER',
              path: '/admin/operasional/data-supplier',
              permissions: ['read'],
              picKey: 'AdminDataSupplier'
            },
            {
              id: 'data-sewa',
              title: 'DATA SEWA',
              path: '/admin/operasional/sewa',
              permissions: ['read'],
              picKey: 'AdminOperasionalDataSewa'
            },
            {
              id: 'jadwal-pembayaran',
              title: 'JADWAL PEMBAYARAN/PERAWATAN',
              path: '/admin/operasional/jadwal-pembayaran',
              permissions: ['read'],
              picKey: 'AdminOperasionalJadwalPembayaran'
            },
            {
              id: 'data-investor',
              title: 'DATA INVESTOR',
              path: '/admin/operasional/investor',
              permissions: ['read'],
              picKey: 'AdminDataInvestor'
            },
            {
              id: 'daftar-saran',
              title: 'DAFTAR SARAN',
              path: '/admin/operasional/saran',
              permissions: ['read'],
              picKey: 'AdminOperasionalDaftarSaran'
            },
            {
              id: 'daftar-komplain',
              title: 'DAFTAR KOMPLAIN',
              path: '/admin/operasional/komplain',
              permissions: ['read'],
              picKey: 'AdminOperasionalDaftarKomplain'
            },
            {
              id: 'data-bina-lingkungan',
              title: 'DATA BINA LINGKUNGAN',
              path: '/admin/operasional/bina-lingkungan',
              permissions: ['read'],
              picKey: 'AdminDataBinaLingkungan'
            }
          ]
        });
        
        // Menu Marketing untuk Admin
        baseMenus.push({
          id: 'marketing',
          title: 'MARKETING',
          icon: 'Target',
          permissions: ['read'],
          children: [
            {
              id: 'data-target',
              title: 'DATA TARGET',
              path: '/admin/marketing/data-target',
              permissions: ['read'],
              picKey: 'AdminMarketingDataTarget'
            },
            {
              id: 'medsos',
              title: 'MEDSOS',
              path: '/admin/marketing/medsos',
              permissions: ['read'],
              picKey: 'AdminMedsos'
            }
          ]
        });
        
        // Menu Admin Panel dihapus karena duplikasi dengan menu utama
        
        // Menu Settings untuk Admin
        baseMenus.push({
          id: 'settings',
          title: 'Settings',
          path: '/settings',
          icon: 'Settings',
          permissions: ['read'],
          picKey: 'AdminSettings'
        });
        break;
        
      case 'leader':
        // Menu Keuangan untuk Leader
        baseMenus.push({
          id: 'keuangan',
          title: 'KEUANGAN',
          icon: 'DollarSign',
          permissions: ['read'],
          children: [
            {
              id: 'poskas',
              title: 'POSKAS',
              path: '/leader/keuangan/poskas',
              permissions: ['read', 'create']
            },
            {
              id: 'omset-harian',
              title: 'OMSET HARIAN',
              path: '/leader/keuangan/omset-harian',
              permissions: ['read', 'create', 'update', 'delete']
            }
          ]
        });
        
        // Menu SDM untuk Leader
        baseMenus.push({
          id: 'sdm',
          title: 'SDM',
          icon: 'Users2',
          permissions: ['read'],
          children: [
            {
              id: 'data-tim',
              title: 'DATA TIM',
              path: '/leader/sdm/tim',
              permissions: ['read']
            }
          ]
        });
        
        // Menu Daftar Tugas untuk Leader
        baseMenus.push({
          id: 'daftar-tugas',
          title: 'DAFTAR TUGAS',
          icon: 'ClipboardList',
          permissions: ['read'],
          children: [
            {
              id: 'tim-merah-biru',
              title: 'TIM MERAH/BIRU',
              path: '/leader/tugas/tim',
              permissions: ['read']
            }
          ]
        });
        break;
        
      case 'divisi':
        // Menu Keuangan untuk Divisi
        baseMenus.push({
          id: 'keuangan',
          title: 'KEUANGAN',
          icon: 'DollarSign',
          permissions: ['read'],
          children: [
            {
              id: 'poskas',
              title: 'POSKAS',
              path: '/divisi/keuangan/poskas',
              permissions: ['read', 'create']
            },
            {
              id: 'omset-harian',
              title: 'OMSET HARIAN',
              path: '/divisi/keuangan/omset-harian',
              permissions: ['read', 'create', 'update', 'delete']
            }
          ]
        });
        // Menu Daftar Tugas untuk Divisi
        baseMenus.push({
          id: 'daftar-tugas',
          title: 'DAFTAR TUGAS',
          icon: 'CheckSquare',
          path: '/tugas',
          permissions: ['read', 'create', 'update', 'delete']
        });
        break;
        
      case 'tim':
        // Menu Keuangan untuk Tim
        baseMenus.push({
          id: 'keuangan',
          title: 'KEUANGAN',
          icon: 'DollarSign',
          permissions: ['read'],
          children: [
            {
              id: 'poskas',
              title: 'POSKAS',
              path: '/tim/keuangan/poskas',
              permissions: ['read', 'create']
            }
          ]
        });
        // Menu Daftar Tugas untuk Tim
        baseMenus.push({
          id: 'daftar-tugas',
          title: 'DAFTAR TUGAS',
          icon: 'CheckSquare',
          path: '/tugas',
          permissions: ['read', 'create', 'update', 'delete']
        });
        break;
        
      default:
        // Menu default untuk role yang tidak dikenali
        baseMenus.push({
          id: 'keuangan',
          title: 'KEUANGAN',
          icon: 'DollarSign',
          permissions: ['read'],
          children: [
            {
              id: 'poskas',
              title: 'POSKAS',
              path: '/poskas',
              permissions: ['read', 'create']
            }
          ]
        });
        break;
    }
    
    // Profile menu for all users
    baseMenus.push({
      id: 'profile',
      title: 'Profile',
      path: '/profile',
      icon: 'User',
      permissions: ['read']
    })

    return baseMenus
  }

  const loadUserMenus = async () => {
    try {
      setLoading(true)
      
      // Get menus based on user role
      let userMenus = getMenusByRole(user.role)

      // Bypass dihapus: menu hanya mengikuti role user
      
      // Extract all permissions from menus
      const allPermissions = []
      const extractPermissions = (menuList) => {
        menuList.forEach(menu => {
          if (menu.permissions) {
            allPermissions.push(...menu.permissions)
          }
          if (menu.children) {
            extractPermissions(menu.children)
          }
        })
      }
      extractPermissions(userMenus)
      
      setMenus(userMenus)
      setPermissions([...new Set(allPermissions)]) // Remove duplicates
      
    } catch (error) {
      console.error('Error loading user menus:', error)
      setMenus([])
      setPermissions([])
    } finally {
      setLoading(false)
    }
  }

  const checkPermission = (requiredPermissions) => {
    if (!user || !requiredPermissions || requiredPermissions.length === 0) return true
    
    // Admin and owner have all permissions
    if (user.role === 'admin' || user.role === 'owner') {
      return true
    }
    
    // For other roles, check if they have the required permissions
    return requiredPermissions.some(permission => 
      permissions.includes(permission)
    )
  }

  const getMenuByPath = (path) => {
    const findMenu = (menuList, targetPath) => {
      for (const menu of menuList) {
        if (menu.path === targetPath) {
          return menu
        }
        if (menu.children) {
          const found = findMenu(menu.children, targetPath)
          if (found) return found
        }
      }
      return null
    }
    
    return findMenu(menus, path)
  }

  const getBreadcrumbs = (currentPath) => {
    const breadcrumbs = []
    
    const findBreadcrumbs = (menuList, targetPath, parent = null) => {
      for (const menu of menuList) {
        if (menu.path === targetPath) {
          if (parent) breadcrumbs.push(parent)
          breadcrumbs.push(menu)
          return true
        }
        if (menu.children) {
          if (findBreadcrumbs(menu.children, targetPath, menu)) {
            return true
          }
        }
      }
      return false
    }
    
    findBreadcrumbs(menus, currentPath)
    return breadcrumbs
  }

  const value = {
    menus,
    permissions,
    loading,
    checkPermission,
    getMenuByPath,
    getBreadcrumbs,
    reloadMenus: loadUserMenus
  }

  return (
    <MenuContext.Provider value={value}>
      {children}
    </MenuContext.Provider>
  )
}