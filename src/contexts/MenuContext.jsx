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
      : role === 'leader' ? '/leader/dashboard'
      : '/dashboard'
    baseMenus.push({
      id: 'dashboard',
      title: 'Dashboard',
      path: dashboardPath,
      icon: 'Home',
      permissions: ['read']
    });
    
    // Menu Chat dihilangkan untuk semua role
    switch(role) {
      case 'admin':
        // Menu Daftar Tugas untuk Admin DISSEMBUNYIKAN sesuai permintaan
        // (tidak menambahkan item 'DAFTAR TUGAS' ke sidebar)
        break;
      case 'owner':
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
        // Tidak ada menu Chat
        break;
      case 'tim':
        // Tidak ada menu Chat
        break;
      default:
        // Tidak ada menu Chat
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
        
        // Menu STRUKTUR & JOBDESK sebagai top-level untuk Owner
        baseMenus.push({
          id: 'struktur-jobdesk',
          title: 'STRUKTUR & JOBDESK',
          path: '/owner/sdm/struktur-jobdesk',
          icon: 'Users2',
          permissions: ['read']
        });

        // Menu SDM untuk Owner
        baseMenus.push({
          id: 'sdm',
          title: 'SDM',
          icon: 'Users2',
          permissions: ['read'],
          children: [
            {
              id: 'sop-aturan',
              title: 'ATURAN & SOP',
              path: '/owner/sdm/sop-aturan',
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
              id: 'data-training',
              title: 'DATA TRAINING',
              path: '/owner/training',
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
              id: 'daftar-pengajuan',
              title: 'DAFTAR PENGAJUAN',
              path: '/owner/pengajuan',
              permissions: ['read']
            },
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

                    // Menu PIC MENU untuk Owner
            baseMenus.push({
              id: 'pic-menu',
              title: 'PIC MENU',
              path: '/owner/pic-menu',
              icon: 'Users',
              permissions: ['read']
            });
        
        // Video Library (owner dapat mengelola seperti admin)
        baseMenus.push({
          id: 'video-library',
          title: 'VIDEO LIBRARY',
          path: '/admin/video-library',
          icon: 'Video',
          permissions: ['read']
        });
        break;
        
      case 'admin':
        // Menu Keuangan untuk Admin (hanya item yang diminta)
        // Tambahkan menu top-level yang diminta: DAFTAR TUGAS dan DAFTAR KOMPLAIN
        // - DAFTAR TUGAS tidak butuh picKey (masuk default whitelist di Sidebar)
        baseMenus.push({
          id: 'daftar-tugas',
          title: 'DAFTAR TUGAS',
          path: '/admin/tugas',
          icon: 'CheckSquare',
          permissions: ['read']
        })
        // - DAFTAR KOMPLAIN menggunakan picKey agar mengikuti permission AdminDaftarKomplain
        baseMenus.push({
          id: 'daftar-komplain',
          title: 'DAFTAR KOMPLAIN',
          path: '/admin/komplain',
          icon: 'AlertTriangle',
          permissions: ['read'],
          picKey: 'AdminDaftarKomplain'
        })

        // DAFTAR SARAN (menggunakan PIC AdminDaftarSaran)
        baseMenus.push({
          id: 'daftar-saran',
          title: 'DAFTAR SARAN',
          path: '/admin/saran',
          icon: 'MessageCircle',
          permissions: ['read'],
          picKey: 'AdminDaftarSaran'
        })

        // DAFTAR PENGAJUAN (admin)
        baseMenus.push({
          id: 'daftar-pengajuan',
          title: 'DAFTAR PENGAJUAN',
          path: '/admin/pengajuan',
          icon: 'Mail',
          permissions: ['read']
        })

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
              permissions: ['read'],
              picKey: 'AdminKeuanganOmsetHarian'
            },
            {
              id: 'lap-keu',
              title: 'LAP. KEUANGAN',
              path: '/admin/keuangan/laporan',
              permissions: ['read'],
              picKey: 'AdminLaporanKeuangan'
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
              path: '/admin/keuangan/daftar-gaji',
              permissions: ['read'],
              picKey: 'AdminDaftarGaji'
            }
          ]
        });
        
        // Menu SDM untuk Admin (urut sesuai permintaan)
        baseMenus.push({
          id: 'sdm',
          title: 'SDM',
          icon: 'Users2',
          permissions: ['read'],
          children: [
            {
              id: 'data-tim',
              title: 'DATA TIM',
              path: '/admin/sdm/tim',
              permissions: ['read'],
              picKey: 'AdminSdmDataTim'
            },
            {
              id: 'kpi',
              title: 'RAPORT KERJA',
              path: '/admin/sdm/raport-kerja',
              permissions: ['read'],
              picKey: 'AdminSdmKpi'
            },
            {
              id: 'struktur-jobdesk',
              title: 'STRUKTUR & JOBDESK',
              path: '/admin/sdm/struktur-jobdesk',
              permissions: ['read'],
              picKey: 'AdminSdmStrukturJobdesk'
            },
            {
              id: 'sop-aturan',
              title: 'SOP & ATURAN',
              path: '/admin/sdm/sop-aturan',
              permissions: ['read'],
              picKey: 'AdminAturan'
            },
            {
              id: 'data-training',
              title: 'DATA TRAINING',
              path: '/admin/sdm/training',
              permissions: ['read'],
              picKey: 'AdminDataTraining'
            },
            {
              id: 'tim-merah-biru',
              title: 'TIM MERAH/BIRU',
              path: '/admin/sdm/tim-merah-biru',
              permissions: ['read'],
              picKey: 'AdminTimMerahBiru'
            }
          ]
        });

        // Menu Operasional untuk Admin (hanya item yang diminta)
        baseMenus.push({
          id: 'operasional',
          title: 'OPERASIONAL',
          icon: 'Settings',
          permissions: ['read'],
          children: [
            {
              id: 'jadwal-pembayaran',
              title: 'JADWAL PEMBAYARAN/PERAWATAN',
              path: '/admin/operasional/jadwal-pembayaran',
              permissions: ['read'],
              picKey: 'AdminJadwalPembayaran'
            },
            {
              id: 'data-target',
              title: 'DATA TARGET',
              path: '/admin/operasional/data-target',
              permissions: ['read'],
              picKey: 'AdminDataTarget'
            }
          ]
        });

        // Menu DAFTAR SARAN & DAFTAR KOMPLAIN DISSEMBUNYIKAN

        // Menu personal (TUGAS SAYA APA?, SOP TERKAIT, KPI SAYA, SLIP GAJI SAYA) DISSEMBUNYIKAN
        
        // Menu Marketing untuk Admin (hanya Media Sosial)
        baseMenus.push({
          id: 'marketing',
          title: 'MARKETING',
          icon: 'Target',
          permissions: ['read'],
          children: [
            {
              id: 'medsos',
              title: 'MEDIA SOSIAL',
              path: '/admin/marketing/medsos',
              permissions: ['read'],
              picKey: 'AdminMarketingMedsos'
            }
          ]
        });

        // Menu LAIN – LAIN untuk Admin
        baseMenus.push({
          id: 'lain-lain',
          title: 'LAIN – LAIN',
          icon: 'List',
          permissions: ['read'],
          children: [
            {
              id: 'data-investor',
              title: 'DATA INVESTOR',
              path: '/admin/lain-lain/investor',
              permissions: ['read'],
              picKey: 'AdminDataInvestor'
            },
            {
              id: 'data-supplier',
              title: 'DATA SUPPLIER',
              path: '/admin/lain-lain/data-supplier',
              permissions: ['read'],
              picKey: 'AdminDataSupplier'
            },
            {
              id: 'data-bina-lingkungan',
              title: 'DATA BINA LINGKUNGAN',
              path: '/admin/lain-lain/bina-lingkungan',
              permissions: ['read'],
              picKey: 'AdminDataBinaLingkungan'
            },
            {
              id: 'data-aset',
              title: 'DATA ASET',
              path: '/admin/lain-lain/aset',
              permissions: ['read'],
              picKey: 'AdminDataAset'
            },
            {
              id: 'data-sewa',
              title: 'DATA SEWA',
              path: '/admin/lain-lain/sewa',
              permissions: ['read'],
              picKey: 'AdminDataSewa'
            },
            {
              id: 'aneka-surat',
              title: 'ANEKA SURAT',
              path: '/admin/lain-lain/surat',
              permissions: ['read'],
              picKey: 'AdminAnekaSurat'
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

        // Video Library untuk Admin
        baseMenus.push({
          id: 'video-library',
          title: 'VIDEO LIBRARY',
          path: '/admin/video-library',
          icon: 'Video',
          permissions: ['read']
        });
        break;
        
      case 'leader':
        // Flatten menu Leader: setiap item jadi top-level, judul UPPERCASE
        baseMenus.push(
          { id: 'leader-struktur-jobdesk', title: 'STRUKTUR DAN JOBDESK', path: '/leader/sdm/struktur-jobdesk', icon: 'Users2', permissions: ['read'] },
          { id: 'leader-sop-aturan', title: 'ATURAN & SOP', path: '/leader/sdm/sop-aturan', icon: 'FileText', permissions: ['read'] },
          { id: 'leader-jobdesk-saya', title: 'JOBDESK SAYA APA?', path: '/leader/sdm/jobdesk-saya', icon: 'ClipboardList', permissions: ['read'] },
          { id: 'leader-tugas-saya', title: 'TUGAS SAYA APA?', path: '/leader/tugas-saya', icon: 'CheckSquare', permissions: ['read'] },
          { id: 'leader-kpi-saya', title: 'KPI SAYA', path: '/leader/sdm/kpi-saya', icon: 'TrendingUp', permissions: ['read'] },
          { id: 'leader-kpi-tim', title: 'KPI TIM SAYA', path: '/leader/sdm/kpi-tim', icon: 'BarChart2', permissions: ['read'] },
          { id: 'leader-tim-merah-biru', title: 'TIM MERAH DAN BIRU', path: '/leader/tugas/tim', icon: 'Users', permissions: ['read'] },
          { id: 'leader-daftar-pengajuan', title: 'DAFTAR PENGAJUAN', path: '/leader/pengajuan', icon: 'Inbox', permissions: ['read'] },
          { id: 'leader-slip-gaji', title: 'SLIP GAJI SAYA', path: '/leader/slip-gaji-saya', icon: 'FileText', permissions: ['read'] },
          { id: 'leader-data-saya', title: 'DATA SAYA', path: '/leader/profile', icon: 'User', permissions: ['read'] }
        );
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
        // Menu STRUKTUR & JOBDESK sebagai top-level untuk Divisi
        baseMenus.push({
          id: 'struktur-jobdesk',
          title: 'STRUKTUR & JOBDESK',
          path: '/divisi/sdm/struktur-jobdesk',
          icon: 'Users2',
          permissions: ['read']
        });

        // Menu SDM untuk Divisi
        baseMenus.push({
          id: 'sdm',
          title: 'SDM',
          icon: 'Users2',
          permissions: ['read'],
          children: [
            {
              id: 'sop-aturan',
              title: 'ATURAN & SOP',
              path: '/divisi/sdm/sop-aturan',
              permissions: ['read']
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
    
    // Urutkan khusus role admin sesuai preferensi
    if (role === 'admin') {
      const desiredOrder = [
        'dashboard',
        'daftar-tugas',
        'daftar-saran',
        'struktur-jobdesk',
        'tugas-saya',
        'daftar-komplain',
        'daftar-pengajuan',
        'sop-terkait',
        'kpi-saya',
        'slip-gaji-saya',
        'keuangan',
        'sdm',
        'operasional',
        'marketing',
        'lain-lain',
        // Item lain (jika ada) akan mengikuti setelah ini
        'settings',
        'video-library'
      ]
      const pos = new Map(desiredOrder.map((id, idx) => [id, idx]))
      baseMenus.sort((a, b) => {
        const ai = pos.has(a.id) ? pos.get(a.id) : Number.MAX_SAFE_INTEGER
        const bi = pos.has(b.id) ? pos.get(b.id) : Number.MAX_SAFE_INTEGER
        return ai - bi
      })
    }

    // Profile menu: selalu ditampilkan untuk semua role (termasuk admin)
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