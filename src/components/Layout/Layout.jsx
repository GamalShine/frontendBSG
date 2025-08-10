import React, { useState, useEffect } from 'react'
import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import useSocket from '../../hooks/useSocket'
import Sidebar from './Sidebar'
import Header from './Header'

const Layout = () => {
  const { user } = useAuth()
  const { socket, on } = useSocket()
  const location = useLocation()
  const navigate = useNavigate()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)

  // Listen for new messages
  useEffect(() => {
    if (!socket) return

    const handleNewMessage = (data) => {
      setUnreadCount(prev => prev + 1)
    }

    on('new_message', handleNewMessage)

    return () => {
      socket.off('new_message', handleNewMessage)
    }
  }, [socket, on])

  // Close sidebar on mobile when route changes
  useEffect(() => {
    setSidebarOpen(false)
  }, [location.pathname])

  // Handle sidebar collapse state
  const handleSidebarCollapse = (collapsed) => {
    setSidebarCollapsed(collapsed)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Main container with sidebar and content */}
      <div className="flex h-screen">
        {/* Sidebar */}
        <Sidebar
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          unreadCount={unreadCount}
          onCollapse={handleSidebarCollapse}
        />

        {/* Main content with header */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Header - Fixed at top */}
          <Header
            onMenuClick={() => setSidebarOpen(true)}
            unreadCount={unreadCount}
          />

          {/* Page content */}
          <main className="flex-1 overflow-auto p-6">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  )
}

export default Layout 