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
    
    // Menu Dashboard untuk semua role
    baseMenus.push({
      id: 'dashboard',
      title: 'Dashboard',
      path: '/dashboard',
      icon: 'Home',
      permissions: ['read']
    });
    
    // Menu Chat berdasarkan role
    switch(role) {
      case 'admin':
        baseMenus.push({
          id: 'chat',
          title: 'CHAT',
          path: '/admin/chat/private',
          icon: 'MessageCircle',
          permissions: ['read']
        });
        break;
      case 'owner':
        baseMenus.push({
          id: 'chat',
          title: 'CHAT',
          path: '/owner/chat/private',
          icon: 'MessageCircle',
          permissions: ['read']
        });
        break;
      case 'divisi':
        baseMenus.push({
          id: 'chat',
          title: 'CHAT',
          path: '/divisi/chat/private',
          icon: 'MessageCircle',
          permissions: ['read']
        });
        break;
      case 'tim':
        baseMenus.push({
          id: 'chat',
          title: 'CHAT',
          path: '/tim/chat/private',
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
        
        // Menu Daftar Tugas untuk Owner (dihapus karena sudah dipindah ke SDM)
        // baseMenus.push({
        //   id: 'daftar-tugas',
        //   title: 'DAFTAR TUGAS',
        //   icon: 'ClipboardList',
        //   permissions: ['read'],
        //   children: [
        //     {
        //       id: 'kpi',
        //       title: 'KPI',
        //       path: '/owner/daftar-tugas/kpi',
        //       permissions: ['read']
        //     },
        //     {
        //       id: 'tim-merah-biru',
        //       title: 'TIM MERAH/BIRU',
        //       path: '/owner/daftar-tugas/tim-merah-biru',
        //       permissions: ['read']
        //     }
        //   ]
        // });
        
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
              path: '/owner/marketing/target',
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
        

        
        // Menu Settings untuk Owner
        baseMenus.push({
          id: 'settings',
          title: 'Settings',
          path: '/settings',
          icon: 'Settings',
          permissions: ['read']
        });

                    // Menu Manajemen Menu Admin untuk Owner
            baseMenus.push({
              id: 'admin-menu-management',
              title: 'Manajemen Menu Admin',
              path: '/owner/admin-menu-management',
              icon: 'Shield',
              permissions: ['read']
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
              permissions: ['read', 'create', 'update', 'delete']
            },
            {
              id: 'omset-harian',
              title: 'OMSET HARIAN',
              path: '/admin/keuangan/omset-harian',
              permissions: ['read', 'create', 'update', 'delete']
            },
            {
              id: 'lap-keu',
              title: 'LAP. KEU',
              path: '/admin/keuangan/laporan',
              permissions: ['read']
            },
            {
              id: 'aneka-grafik',
              title: 'ANEKA GRAFIK',
              path: '/admin/keuangan/aneka-grafik',
              permissions: ['read']
            },
            {
              id: 'daftar-gaji',
              title: 'DAFTAR GAJI',
              path: '/admin/keuangan/gaji',
              permissions: ['read']
            },
            {
              id: 'aneka-surat',
              title: 'ANEKA SURAT',
              path: '/admin/keuangan/surat',
              permissions: ['read']
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
              permissions: ['read']
            },
            {
              id: 'data-tim',
              title: 'DATA TIM',
              path: '/admin/sdm/tim',
              permissions: ['read']
            },
            {
              id: 'kpi',
              title: 'KPI',
              path: '/admin/sdm/kpi',
              permissions: ['read']
            },
            {
              id: 'tim-merah-biru',
              title: 'TIM MERAH/BIRU',
              path: '/admin/sdm/tim-merah-biru',
              permissions: ['read']
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
              permissions: ['read']
            },
            {
              id: 'data-supplier',
              title: 'DATA SUPPLIER',
              path: '/admin/operasional/data-supplier',
              permissions: ['read']
            },
            {
              id: 'data-sewa',
              title: 'DATA SEWA',
              path: '/admin/operasional/sewa',
              permissions: ['read']
            },
            {
              id: 'data-investor',
              title: 'DATA INVESTOR',
              path: '/admin/operasional/investor',
              permissions: ['read']
            },
            {
              id: 'daftar-saran',
              title: 'DAFTAR SARAN',
              path: '/admin/operasional/saran',
              permissions: ['read']
            },
            {
              id: 'daftar-komplain',
              title: 'DAFTAR KOMPLAIN',
              path: '/admin/komplain',
              permissions: ['read']
            },
            {
              id: 'data-bina-lingkungan',
              title: 'DATA BINA LINGKUNGAN',
              path: '/admin/operasional/bina-lingkungan',
              permissions: ['read']
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
              path: '/admin/marketing/target',
              permissions: ['read']
            },
            {
              id: 'medsos',
              title: 'MEDSOS',
              path: '/admin/marketing/medsos',
              permissions: ['read']
            }
          ]
        });
        
        // Menu Admin Panel
        baseMenus.push({
          id: 'admin',
          title: 'Admin Panel',
          icon: 'Settings',
          permissions: ['read'],
          children: [
            {
              id: 'admin-komplain',
              title: 'Kelola Komplain',
              path: '/admin/komplain',
              permissions: ['read']
            },
            {
              id: 'admin-tugas',
              title: 'Kelola Tugas',
              path: '/admin/tugas',
              permissions: ['read']
            },
            {
              id: 'admin-pengumuman',
              title: 'Kelola Pengumuman',
              path: '/admin/pengumuman',
              permissions: ['read']
            },
            {
              id: 'admin-training',
              title: 'Kelola Training',
              path: '/admin/training',
              permissions: ['read']
            },
            {
              id: 'admin-users',
              title: 'Kelola Users',
              path: '/users',
              permissions: ['read']
            },
            {
              id: 'admin-profile',
              title: 'Admin Profile',
              path: '/admin/profile',
              permissions: ['read']
            }
          ]
        });
        
        // Menu Settings untuk Admin
        baseMenus.push({
          id: 'settings',
          title: 'Settings',
          path: '/settings',
          icon: 'Settings',
          permissions: ['read']
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
      const userMenus = getMenusByRole(user.role)
      
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