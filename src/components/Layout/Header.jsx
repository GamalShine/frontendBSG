import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { 
  Menu, 
  Bell, 
  User, 
  Settings, 
  LogOut,
  MessageCircle
} from 'lucide-react'
import { getInitials } from '../../utils/helpers'

const Header = ({ onMenuClick, unreadCount }) => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const [loggingOut, setLoggingOut] = useState(false)

  const handleLogout = async () => {
    try {
      setLoggingOut(true)
      setUserMenuOpen(false) // Close dropdown
      console.log('🔐 Header: Logout button clicked')
      await logout()
      console.log('✅ Header: Logout successful, redirecting to login...')
      navigate('/login')
    } catch (error) {
      console.error('Header: Logout error:', error)
      // Even if logout fails, redirect to login
      navigate('/login')
    } finally {
      setLoggingOut(false)
    }
  }

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="flex items-center justify-between px-4 sm:px-6 lg:px-8 h-16">
        {/* Left side - Hidden on desktop to make room for sidebar */}
        <div className="flex items-center lg:hidden">
          <button
            onClick={onMenuClick}
            className="p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100"
          >
            <Menu className="h-6 w-6" />
          </button>
        </div>

        {/* Center - Empty on desktop to make room for sidebar */}
        <div className="hidden lg:block lg:w-64"></div>

        {/* Right side */}
        <div className="flex items-center space-x-4">
          {/* Notifications */}
          <Link
            to="/chat"
            className="relative p-2 text-gray-400 hover:text-gray-500 hover:bg-gray-100 rounded-md"
          >
            <MessageCircle className="h-6 w-6" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                {unreadCount > 99 ? '99+' : unreadCount}
              </span>
            )}
          </Link>

          {/* Logout Loading Indicator */}
          {loggingOut && (
            <div className="flex items-center space-x-2 px-3 py-2 bg-blue-50 rounded-lg">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
              <span className="text-sm text-blue-600">Logging out...</span>
            </div>
          )}

          {/* User menu */}
          <div className="relative">
            <button
              onClick={() => setUserMenuOpen(!userMenuOpen)}
              className="flex items-center space-x-3 p-2 rounded-md hover:bg-gray-100"
              disabled={loggingOut}
            >
              <div className="w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center text-white text-sm font-medium">
                {getInitials(user?.nama || user?.username || 'U')}
              </div>
              <div className="hidden md:block text-left">
                <p className="text-sm font-medium text-gray-900">{user?.nama || user?.username || 'User'}</p>
                <p className="text-xs text-gray-500">{user?.role || 'Member'}</p>
              </div>
            </button>

            {/* User dropdown */}
            {userMenuOpen && !loggingOut && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50">
                <Link
                  to="/profile"
                  className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  onClick={() => setUserMenuOpen(false)}
                >
                  <User className="h-4 w-4 mr-3" />
                  Profile
                </Link>
                <button
                  onClick={handleLogout}
                  className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                  disabled={loggingOut}
                >
                  <LogOut className="h-4 w-4 mr-3" />
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Click outside to close user menu */}
      {userMenuOpen && !loggingOut && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setUserMenuOpen(false)}
        />
      )}
    </header>
  )
}

export default Header 