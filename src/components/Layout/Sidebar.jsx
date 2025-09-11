import React, { useState } from 'react'
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

  const location = useLocation()
  const [expandedMenus, setExpandedMenus] = useState(new Set())

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

  const isMenuActive = (menuPath) => {
    if (!menuPath) return false
    return location.pathname === menuPath || location.pathname.startsWith(menuPath + '/')
  }

  const isChildActive = (children) => {
    if (!children) return false
    return children.some(child => isMenuActive(child.path))
  }

  const hasPicAccess = (menu) => {
    const picKey = menu?.picKey
    // Item default yang selalu boleh untuk role admin/divisi/tim tanpa picKey
    const defaultWhitelistIds = new Set(['dashboard', 'chat', 'daftar-tugas', 'profile'])
    const whitelistRoles = new Set(['admin', 'divisi', 'tim'])

    // Jika role termasuk whitelistRoles dan menu termasuk default whitelist, izinkan
    if (whitelistRoles.has(user?.role) && defaultWhitelistIds.has(menu?.id)) {
      return true
    }

    if (user?.role === 'admin') {
      // Selain whitelist, admin wajib memiliki picKey yang diizinkan
      if (!picKey) return false
      return Array.isArray(allowedMenuKeys) && allowedMenuKeys.includes(picKey)
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
        <div className="flex items-center">
          <div className="w-10 h-10 bg-red-600 rounded-full flex items-center justify-center">
            <User className="h-6 w-6 text-white" />
          </div>
          <div className="ml-3">
            <p className="text-sm font-medium text-white">
              {user?.nama || user?.username}
            </p>
            <p className="text-xs text-white capitalize">
              {user?.role || 'User'}
            </p>
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