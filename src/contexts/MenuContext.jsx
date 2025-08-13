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
    const baseMenus = [
      {
        id: 'dashboard',
        title: 'Dashboard',
        path: '/dashboard',
        icon: 'Home',
        permissions: ['read']
      },
      {
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
          },
          {
            id: 'omset-harian',
            title: 'OMSET HARIAN',
            path: '/keuangan/omset-harian',
            permissions: ['read', 'create', 'update', 'delete']
          },
          {
            id: 'lap-keu',
            title: 'LAP. KEU',
            path: '/keuangan/laporan',
            permissions: ['read']
          },
          {
            id: 'aneka-grafik',
            title: 'ANEKA GRAFIK',
            path: '/keuangan/grafik',
            permissions: ['read']
          },
          {
            id: 'daftar-gaji',
            title: 'DAFTAR GAJI',
            path: '/keuangan/gaji',
            permissions: ['read']
          },
          {
            id: 'aneka-surat',
            title: 'ANEKA SURAT',
            path: '/keuangan/surat',
            permissions: ['read']
          }
        ]
      },
      {
        id: 'sdm',
        title: 'SDM',
        icon: 'Users2',
        permissions: ['read'],
        children: [
          {
            id: 'struktur-jobdesk-sop',
            title: 'STRUKTUR, JOBDESK & S.O.P.',
            path: '/sdm/struktur',
            permissions: ['read']
          },
          {
            id: 'data-tim',
            title: 'DATA TIM',
            path: '/sdm/tim',
            permissions: ['read']
          }
        ]
      },
      {
        id: 'daftar-tugas',
        title: 'DAFTAR TUGAS',
        icon: 'ClipboardList',
        permissions: ['read'],
        children: [
          {
            id: 'kpi',
            title: 'KPI',
            path: '/tugas/kpi',
            permissions: ['read']
          },
          {
            id: 'tim-merah-biru',
            title: 'TIM MERAH/BIRU',
            path: '/tugas/tim',
            permissions: ['read']
          }
        ]
      },
      {
        id: 'operasional',
        title: 'OPERASIONAL',
        icon: 'Building2',
        permissions: ['read'],
        children: [
          {
            id: 'data-aset',
            title: 'DATA ASET',
            path: '/operasional/aset',
            permissions: ['read']
          },
          {
            id: 'data-supplier',
            title: 'DATA SUPPLIER',
            path: '/operasional/supplier',
            permissions: ['read']
          },
          {
            id: 'data-sewa',
            title: 'DATA SEWA',
            path: '/operasional/sewa',
            permissions: ['read']
          },
          {
            id: 'data-investor',
            title: 'DATA INVESTOR',
            path: '/operasional/investor',
            permissions: ['read']
          },
          {
            id: 'daftar-saran',
            title: 'DAFTAR SARAN',
            path: '/operasional/saran',
            permissions: ['read']
          },
          {
            id: 'daftar-komplain',
            title: 'DAFTAR KOMPLAIN',
            path: '/komplain',
            permissions: ['read']
          },
          {
            id: 'data-bina-lingkungan',
            title: 'DATA BINA LINGKUNGAN',
            path: '/operasional/bina-lingkungan',
            permissions: ['read']
          }
        ]
      },
      {
        id: 'marketing',
        title: 'MARKETING',
        icon: 'Target',
        permissions: ['read'],
        children: [
          {
            id: 'data-target',
            title: 'DATA TARGET',
            path: '/marketing/target',
            permissions: ['read']
          },
          {
            id: 'medsos',
            title: 'MEDSOS',
            path: '/marketing/medsos',
            permissions: ['read']
          }
        ]
      },
      {
        id: 'chat',
        title: 'CHAT',
        icon: 'MessageCircle',
        permissions: ['read'],
        children: [
          {
            id: 'chat-private',
            title: 'Chat Private',
            path: '/chat/private',
            permissions: ['read']
          },
          {
            id: 'chat-groups',
            title: 'Chat Groups',
            path: '/chat/groups',
            permissions: ['read']
          }
        ]
      }
    ]

    // Admin specific menus
    if (role === 'admin') {
      baseMenus.push(
        {
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
        },
        {
          id: 'settings',
          title: 'Settings',
          path: '/settings',
          icon: 'Settings',
          permissions: ['read']
        }
      )
    }

    // Owner specific menus
    if (role === 'owner') {
      baseMenus.push(
        {
          id: 'owner',
          title: 'Owner Panel',
          icon: 'Crown',
          permissions: ['read'],
          children: [
            {
              id: 'owner-poskas',
              title: 'Kelola Pos Kas',
              path: '/owner/poskas',
              permissions: ['read']
            },
            {
              id: 'owner-tim',
              title: 'Kelola Tim',
              path: '/owner/tim',
              permissions: ['read']
            },
            {
              id: 'owner-training',
              title: 'Kelola Training',
              path: '/owner/training',
              permissions: ['read']
            }
          ]
        }
      )
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