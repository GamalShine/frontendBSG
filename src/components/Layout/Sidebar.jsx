import React, { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import {
  Home,
  AlertTriangle,
  CheckSquare,
  DollarSign,
  MessageCircle,
  Users,
  Settings,
  Menu,
  ChevronLeft,
  ChevronRight,
  LogOut,
  User,
  Bell
} from 'lucide-react'

const Sidebar = ({ isOpen, onClose, unreadCount, onCollapse }) => {
  const { user, logout } = useAuth()
  const location = useLocation()
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [loggingOut, setLoggingOut] = useState(false)

  const navigation = [
    {
      name: 'Dashboard',
      href: '/',
      icon: Home,
      current: location.pathname === '/',
    },
    {
      name: 'Komplain',
      href: '/komplain',
      icon: AlertTriangle,
      current: location.pathname.startsWith('/komplain'),
    },
    {
      name: 'Tugas',
      href: '/tugas',
      icon: CheckSquare,
      current: location.pathname.startsWith('/tugas'),
    },
    {
      name: 'Pos Kas',
      href: '/poskas',
      icon: DollarSign,
      current: location.pathname.startsWith('/poskas'),
    },
    {
      name: 'Chat',
      href: '/chat',
      icon: MessageCircle,
      current: location.pathname.startsWith('/chat'),
      badge: unreadCount > 0 ? unreadCount : null,
    },
    {
      name: 'Users',
      href: '/users',
      icon: Users,
      current: location.pathname.startsWith('/users'),
    },
    {
      name: 'Settings',
      href: '/settings',
      icon: Settings,
      current: location.pathname.startsWith('/settings'),
    },
  ]

  const handleLogout = async () => {
    try {
      setLoggingOut(true)
      console.log('🔐 Sidebar: Logout button clicked')
      await logout()
    } catch (error) {
      console.error('Sidebar: Logout error:', error)
    } finally {
      setLoggingOut(false)
    }
  }

  const toggleCollapse = () => {
    const newCollapsedState = !isCollapsed
    setIsCollapsed(newCollapsedState)
    if (onCollapse) {
      onCollapse(newCollapsedState)
    }
  }

  return (
    <>
      {/* Mobile sidebar overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-gray-600 bg-opacity-75 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed top-0 left-0 bottom-0 z-50 lg:static lg:top-0 lg:translate-x-0 flex flex-col bg-gradient-to-b from-primary-800 to-primary-900 text-white transition-all duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } ${isCollapsed ? 'w-16' : 'w-64'}`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-primary-700">
          {!isCollapsed && (
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
                <span className="text-primary-800 font-bold text-lg">B</span>
              </div>
              <div>
                <h1 className="text-lg font-bold">Bosgil Group</h1>
                <p className="text-xs text-primary-300">Management System</p>
              </div>
            </div>
          )}
          
          {/* Collapse/Expand Button */}
          <button
            onClick={toggleCollapse}
            className="p-2 rounded-lg hover:bg-primary-700 transition-colors duration-200"
            title={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
          >
            {isCollapsed ? (
              <ChevronRight className="h-5 w-5" />
            ) : (
              <ChevronLeft className="h-5 w-5" />
            )}
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
          {navigation.map((item) => {
            const Icon = item.icon
            return (
              <Link
                key={item.name}
                to={item.href}
                className={`group relative flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                  item.current
                    ? 'bg-primary-600 text-white shadow-lg'
                    : 'text-primary-200 hover:bg-primary-700 hover:text-white'
                }`}
                onClick={() => {
                  console.log('🔗 Navigating to:', item.href)
                  onClose()
                }}
              >
                <Icon className={`h-5 w-5 flex-shrink-0 ${
                  item.current ? 'text-white' : 'text-primary-300 group-hover:text-white'
                }`} />
                {!isCollapsed && (
                  <>
                    <span className="ml-3 flex-1">{item.name}</span>
                    {item.badge && (
                      <span className="ml-auto inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white bg-red-500 rounded-full">
                        {item.badge}
                      </span>
                    )}
                  </>
                )}
                {isCollapsed && item.badge && (
                  <span className="absolute -top-1 -right-1 inline-flex items-center justify-center w-4 h-4 text-xs font-bold leading-none text-white bg-red-500 rounded-full">
                    {item.badge}
                  </span>
                )}
                {isCollapsed && (
                  <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-sm rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-50">
                    {item.name}
                  </div>
                )}
              </Link>
            )
          })}
        </nav>

        {/* User Profile Section */}
        <div className="border-t border-primary-700 p-4">
          {!isCollapsed ? (
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-primary-600 rounded-full flex items-center justify-center">
                <User className="h-5 w-5" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">
                  {user?.nama || user?.username || 'User'}
                </p>
                <p className="text-xs text-primary-300 capitalize">
                  {user?.role || 'User'}
                </p>
              </div>
              <button
                onClick={handleLogout}
                className="p-2 text-primary-300 hover:text-white hover:bg-primary-700 rounded-lg transition-colors duration-200"
                title="Logout"
              >
                <LogOut className="h-5 w-5" />
              </button>
            </div>
          ) : (
            <div className="flex flex-col items-center space-y-2">
              <div className="w-10 h-10 bg-primary-600 rounded-full flex items-center justify-center relative group">
                <User className="h-5 w-5" />
                <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-sm rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-50">
                  {user?.nama || user?.username || 'User'}
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="p-2 text-primary-300 hover:text-white hover:bg-primary-700 rounded-lg transition-colors duration-200 relative group"
                title="Logout"
              >
                <LogOut className="h-5 w-5" />
                <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-sm rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-50">
                  Logout
                </div>
              </button>
            </div>
          )}
        </div>

        {/* Collapse Indicator for Mobile */}
        <div className="lg:hidden p-2">
          <button
            onClick={onClose}
            className="w-full p-2 text-primary-300 hover:text-white hover:bg-primary-700 rounded-lg transition-colors duration-200"
          >
            <Menu className="h-5 w-5" />
          </button>
        </div>
      </div>
    </>
  )
}

export default Sidebar 