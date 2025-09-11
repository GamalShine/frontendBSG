import React, { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { chatService } from '../../services/chatService'
import { 
  Menu, 
  Bell, 
  User, 
  Settings, 
  LogOut,
  MessageCircle
} from 'lucide-react'
import { getInitials } from '../../utils/helpers'
import Breadcrumb from './Breadcrumb'

const Header = ({ onMenuClick, unreadCount }) => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const [loggingOut, setLoggingOut] = useState(false)
  const [chatOpen, setChatOpen] = useState(false)
  const [internalUnread, setInternalUnread] = useState(0)
  const [notifications, setNotifications] = useState([])

  // Load unread chat count and latest notifications
  const loadChatSummary = async () => {
    if (!user?.id) return
    try {
      const res = await chatService.getChatRooms(user.id)
      const rooms = res?.data || []
      // unread_count might be provided by backend per room; fallback 0
      const totalUnread = rooms.reduce((sum, r) => sum + (parseInt(r.unread_count) || 0), 0)
      setInternalUnread(totalUnread)

      // Build lightweight notifications list (top 5 by last_message_time)
      const list = rooms
        .map(r => ({
          id: r.room_id || r.id,
          name: r.other_user_name || r.room_name || r.username || 'Chat',
          last: r.last_message || '-',
          time: r.last_message_time || r.updated_at || r.created_at,
          unread: parseInt(r.unread_count) || 0
        }))
        .sort((a, b) => {
          const ta = a.time ? new Date(a.time).getTime() : 0
          const tb = b.time ? new Date(b.time).getTime() : 0
          return tb - ta
        })
        .slice(0, 5)
      setNotifications(list)
    } catch (e) {
      console.warn('Header: gagal memuat ringkasan chat', e)
      setInternalUnread(0)
      setNotifications([])
    }
  }

  useEffect(() => {
    loadChatSummary()
    const iv = setInterval(loadChatSummary, 30000) // poll tiap 30s
    return () => clearInterval(iv)
  }, [user?.id])

  const handleLogout = async () => {
    try {
      setLoggingOut(true)
      setUserMenuOpen(false) // Close dropdown
      console.log(' Header: Logout button clicked')
      await logout()
      console.log(' Header: Logout successful, redirecting to login...')
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
    <>
    <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-30 lg:static">
      <div className="relative flex items-center justify-between px-4 sm:px-6 lg:px-8 h-16">
        {/* Left side - Hidden on desktop to make room for sidebar */}
        <div className="flex items-center lg:hidden">
          <button
            onClick={onMenuClick}
            className="p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100"
          >
            <Menu className="h-6 w-6" />
          </button>
        </div>

        {/* Breadcrumb on desktop - absolute at bottom-left, independent from flex */}
        <div className="hidden lg:block absolute left-4 bottom-2 z-10">
          <Breadcrumb />
        </div>

        {/* Right side */}
        <div className="flex items-center space-x-4 ml-auto">
          {/* Chat notifications */}
          <button
            type="button"
            onClick={() => setChatOpen(true)}
            className="relative p-2 text-gray-400 hover:text-gray-500 hover:bg-gray-100 rounded-md"
          >
            <MessageCircle className="h-6 w-6" />
            {((unreadCount ?? internalUnread) > 0) && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                {(unreadCount ?? internalUnread) > 99 ? '99+' : (unreadCount ?? internalUnread)}
              </span>
            )}
          </button>

          {/* Logout Loading Indicator */}
          {loggingOut && (
            <div className="flex items-center space-x-2 px-3 py-2 bg-red-50 rounded-lg">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600"></div>
              <span className="text-sm text-red-600">Logging out...</span>
            </div>
          )}

          {/* User menu */}
          <div className="relative">
            <button
              onClick={() => setUserMenuOpen(!userMenuOpen)}
              className="flex items-center space-x-3 p-2 rounded-md hover:bg-gray-100"
              disabled={loggingOut}
            >
              <div className="w-8 h-8 bg-red-600 rounded-full flex items-center justify-center text-white text-sm font-medium">
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

      {/* Mobile breadcrumb - below header */}
      <div className="lg:hidden px-4 py-2 bg-gray-50 border-b border-gray-200">
        <Breadcrumb />
      </div>

      {/* Click outside to close user menu */}
      {userMenuOpen && !loggingOut && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setUserMenuOpen(false)}
        />
      )}
    </header>
    <ChatModal
      open={chatOpen}
      onClose={() => setChatOpen(false)}
      notifications={notifications}
      onOpenChat={() => {
        setChatOpen(false)
        navigate('/chat')
      }}
    />
    </>
  )
}

// Modal untuk notifikasi chat
const ChatModal = ({ open, onClose, notifications, onOpenChat }) => {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-start justify-end p-4 sm:p-6">
      {/* backdrop */}
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />
      {/* panel */}
      <div className="relative w-full max-w-md bg-white rounded-lg shadow-xl border border-gray-200 overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-gray-900">Notifikasi Chat</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">✕</button>
        </div>
        <div className="max-h-[60vh] overflow-y-auto">
          {notifications.length === 0 ? (
            <div className="p-4 text-sm text-gray-500">Belum ada notifikasi.</div>
          ) : (
            <ul className="divide-y divide-gray-100">
              {notifications.map((n) => (
                <li key={n.id} className="p-4 hover:bg-gray-50">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm font-semibold text-gray-900">{n.name}</p>
                      <p className="text-sm text-gray-700 line-clamp-2">{n.last || '-'}</p>
                      <p className="mt-1 text-xs text-gray-500">{n.time ? new Date(n.time).toLocaleString('id-ID') : '-'}</p>
                    </div>
                    {n.unread > 0 && (
                      <span className="ml-3 inline-flex items-center justify-center h-6 min-w-[1.5rem] px-2 rounded-full text-xs font-bold bg-red-600 text-white">{n.unread}</span>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
        <div className="p-3 border-t border-gray-100 flex items-center justify-end gap-2">
          <button onClick={onClose} className="px-3 py-1.5 text-sm rounded-md border border-gray-300 hover:bg-gray-50">Tutup</button>
          <button onClick={onOpenChat} className="px-3 py-1.5 text-sm rounded-md bg-red-600 text-white hover:bg-red-700">Buka Chat</button>
        </div>
      </div>
    </div>
  )
}

export default Header