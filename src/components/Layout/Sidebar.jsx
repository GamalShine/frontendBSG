import React, { useEffect, useLayoutEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { 
  Home,
  AlertTriangle,
  CheckSquare,
  DollarSign,
  Users,
  User,
  BarChart3,
  Settings,
  ChevronDown,
  ChevronRight,
  MessageCircle,
  Megaphone,
  UserCheck,
  GraduationCap,
  BookOpen,
  Crown,
  Building2,
  FileText,
  Target,
  Briefcase,
  ClipboardList,
  TrendingUp,
  FileSpreadsheet,
  Mail,
  UserCog,
  Users2,
  Award,
  Building,
  Truck,
  Heart,
  Lightbulb,
  Shield,
  TreePine,
  BarChart,
  Share2
} from 'lucide-react'
import { useMenu } from '../../contexts/MenuContext'
import { useAuth } from '../../contexts/AuthContext'
import { API_CONFIG } from '../../config/constants'

const iconMap = {
  Home,
  AlertTriangle,
  CheckSquare,
  DollarSign,
  Users,
  User,
  BarChart3,
  Settings,
  MessageCircle,
  Megaphone,
  UserCheck,
  GraduationCap,
  BookOpen,
  Crown,
  Building2,
  FileText,
  Target,
  Briefcase,
  ClipboardList,
  TrendingUp,
  FileSpreadsheet,
  Mail,
  UserCog,
  Users2,
  Award,
  Building,
  Truck,
  Heart,
  Lightbulb,
  Shield,
  TreePine,
  BarChart,
  Share2
}

const Sidebar = () => {
  const { menus, checkPermission } = useMenu()
  const { user, allowedMenuKeys } = useAuth()
  const [avatarError, setAvatarError] = useState(false)

  const location = useLocation()
  const [expandedMenus, setExpandedMenus] = useState(() => {
    try {
      const saved = localStorage.getItem('sidebar_expanded')
      if (saved) {
        const arr = JSON.parse(saved)
        if (Array.isArray(arr)) return new Set(arr)
      }
    } catch {}
    return new Set()
  })

  const toggleMenu = (menuId) => {
    setExpandedMenus(prev => {
      const newSet = new Set(prev)
      if (newSet.has(menuId)) {
        newSet.delete(menuId)
      } else {
        newSet.add(menuId)
      }
      return newSet
    })
  }

  // Persist expanded state
  useEffect(() => {
    try {
      localStorage.setItem('sidebar_expanded', JSON.stringify(Array.from(expandedMenus)))
    } catch {}
  }, [expandedMenus])

  const isMenuActive = (menuPath) => {
    if (!menuPath) return false
    return location.pathname === menuPath || location.pathname.startsWith(menuPath + '/')
  }

  const isChildActive = (children) => {
    if (!children) return false
    return children.some(child => isMenuActive(child.path))
  }

  // Auto-expand parent menus that contain the active route, to avoid auto-closing after navigation
  useLayoutEffect(() => {
    setExpandedMenus(prev => {
      const next = new Set(prev)
      try {
        menus.forEach(menu => {
          const hasChildren = menu.children && menu.children.length > 0
          if (!hasChildren) return
          // Penting: gunakan SEMUA anak untuk menentukan auto-expand,
          // agar parent tetap terbuka meskipun child tersembunyi karena PIC/permission
          if (menu.children.some(child => isMenuActive(child.path))) {
            next.add(menu.id)
          }
        })
      } catch {}
      return next
    })
  }, [location.pathname, menus, allowedMenuKeys, user])

  // Reset error ketika path foto berubah
  useEffect(() => {
    setAvatarError(false)
  }, [user?.profile])

  const hasPicAccess = (menu) => {
    const picKey = menu?.picKey
    // Item default yang selalu boleh untuk role admin/divisi/tim tanpa picKey
    const defaultWhitelistIds = new Set(['dashboard', 'daftar-tugas', 'profile', 'settings'])
    const whitelistRoles = new Set(['admin', 'divisi', 'tim'])

    // Jika role termasuk whitelistRoles dan menu termasuk default whitelist, izinkan
    if (whitelistRoles.has(user?.role) && defaultWhitelistIds.has(menu?.id)) {
      return true
    }

    if (user?.role === 'admin') {
      // Selain whitelist, admin wajib memiliki picKey yang diizinkan
      if (!picKey) return false
      // Kompatibilitas sementara rename key: AdminSopAturan -> AdminAturan
      const legacyMap = {
        AdminAturan: ['AdminSopAturan'],
      }
      const hasDirect = Array.isArray(allowedMenuKeys) && allowedMenuKeys.includes(picKey)
      const hasLegacy = Array.isArray(allowedMenuKeys) && Array.isArray(legacyMap[picKey]) && legacyMap[picKey].some(k => allowedMenuKeys.includes(k))
      return hasDirect || hasLegacy
    }
    // Role selain admin tidak dibatasi PIC (bisa diubah nanti jika diperlukan)
    return true
  }

  const renderMenuItem = (menu) => {
    const IconComponent = iconMap[menu.icon] || Home
    const isActive = menu.path ? isMenuActive(menu.path) : false
    const hasChildren = menu.children && menu.children.length > 0
    const isExpanded = expandedMenus.has(menu.id)
    const isChildMenuActive = hasChildren && isChildActive(menu.children)

    // Check base permission
    if (!checkPermission(menu.permissions)) return null

    // Jika tidak punya anak: cek akses PIC langsung pada menu
    if (!hasChildren && !hasPicAccess(menu)) return null

    // Jika punya anak: hitung anak yang visible berdasarkan permission dan PIC
    let visibleChildren = menu.children
    if (hasChildren) {
      visibleChildren = menu.children.filter(child => {
        const permOk = checkPermission(child.permissions)
        const picOk = hasPicAccess(child)
        return permOk && picOk
      })
      // Jika semua anak tersembunyi, sembunyikan parent section
      if (visibleChildren.length === 0) return null
    }

    return (
      <div key={menu.id} className="mb-1">
        <Link
          to={hasChildren ? '#' : (menu.path || '#')}
          onClick={hasChildren ? (e) => {
            e.preventDefault()
            toggleMenu(menu.id)
          } : undefined}
          className={`flex items-center justify-between px-4 py-3 text-sm font-medium rounded-lg transition-colors min-h-[44px] ${
            isActive || isChildMenuActive
              ? 'bg-red-700 text-white border-r-2 border-red-300'
              : 'text-white hover:bg-red-600 hover:text-white'
          }`}
        >
          <div className="flex items-center">
            <IconComponent className="h-5 w-5 mr-3" />
            <span>{menu.title}</span>
          </div>
          {hasChildren && (
            <div className="flex items-center">
              {isExpanded ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
            </div>
          )}
        </Link>

        {/* Render children */}
        {hasChildren && isExpanded && (
          <div className="ml-6 mt-1 space-y-1.5 mb-2">
            {visibleChildren.map(child => {
              // Check if user has permission to view this child menu
              // Permission & PIC telah difilter ke visibleChildren

              const isChildActive = child.path ? isMenuActive(child.path) : false
              
              return (
                <Link
                  key={child.id}
                  to={child.path || '#'}
                  className={`block px-4 py-2.5 text-sm rounded-lg transition-colors min-h-[40px] ${
                    isChildActive
                      ? 'bg-red-600 text-white border-l-2 border-red-300'
                      : 'text-white hover:bg-red-600 hover:text-white'
                  }`}
                >
                  {child.title}
                </Link>
              )
            })}
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="w-full lg:w-64 bg-red-800 border-r border-red-700 h-full flex flex-col">
      {/* User Info */}
      <div className="p-4 border-b border-red-700 flex-shrink-0 sticky top-0 z-10 bg-red-800">
        <div className="flex flex-col items-center text-center gap-2">
          <div className="w-20 h-20 bg-red-600 rounded-full overflow-hidden flex items-center justify-center">
            {user?.profile && !avatarError ? (
              (() => {
                const path = user.profile
                const isAbsolute = /^https?:\/\//i.test(path)
                const src = isAbsolute ? path : `${API_CONFIG.BASE_HOST}${path}`
                return (
                  <img
                    src={src}
                    alt="Avatar"
                    className="w-full h-full object-cover"
                    onError={() => setAvatarError(true)}
                  />
                )
              })()
            ) : (
              <User className="h-10 w-10 text-white" />
            )}
          </div>
          <p className="text-sm font-medium text-white">
            {user?.nama || user?.username}
          </p>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-white/10 text-white capitalize">
              {user?.role || 'user'}
            </span>
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${user?.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
              {user?.status || 'unknown'}
            </span>
          </div>
        </div>
      </div>

      {/* Navigation Menu - Scrollable */}
      <div className="flex-1 overflow-y-auto scrollbar-hide pt-2 pb-24">
        <nav className="p-4">
          {menus.map(renderMenuItem)}
        </nav>
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-red-700 flex-shrink-0 sticky bottom-0 z-10 bg-red-800">
        <div className="text-center">
          <p className="text-xs text-white">
            Bosgil Group © 2024
          </p>
          <p className="text-xs text-white mt-1">
            v1.0.0
          </p>
        </div>
      </div>
    </div>
  )
}

export default Sidebar 