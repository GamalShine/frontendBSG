import React, { createContext, useContext, useState, useEffect } from 'react'
import { authService } from '../services/authService'
import { picMenuService } from '../services/picMenuService'

const AuthContext = createContext()

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [allowedMenuKeys, setAllowedMenuKeys] = useState([])

  const loadAllowedMenuKeys = async (userId) => {
    if (!userId) {
      setAllowedMenuKeys([])
      return
    }
    try {
      const res = await picMenuService.getUserPicMenus(userId)
      const list = Array.isArray(res?.data) ? res.data : (Array.isArray(res) ? res : [])
      const keys = list
        .filter(item => !item.status_deleted)
        .map(item => item.link)
        .filter(Boolean)
      setAllowedMenuKeys(Array.from(new Set(keys)))
    } catch (e) {
      console.warn('Gagal memuat allowedMenuKeys, fallback ke kosong', e)
      setAllowedMenuKeys([])
    }
  }

  useEffect(() => {
    const initAuth = async () => {
      try {
        console.log('🔄 Initializing authentication...')
        
        // Check if we have a stored token
        if (authService.isAuthenticated()) {
          console.log('✅ Token found, checking user data...')
          const storedUser = authService.getStoredUser()
          
          if (storedUser) {
            console.log('👤 Found stored user:', storedUser)
            // Verify token is still valid
            try {
              const isValid = await authService.isTokenValid()
              if (isValid) {
                setUser(storedUser)
                await loadAllowedMenuKeys(storedUser.id)
                console.log('✅ Token is valid, user session restored')
              } else {
                console.log('❌ Token expired, clearing session')
                await authService.logout()
                setUser(null)
              }
            } catch (error) {
              console.log('❌ Token validation failed, clearing session')
              await authService.logout()
              setUser(null)
            }
          } else {
            console.log('⚠️ No stored user, fetching from server...')
            try {
              // Try to get current user from server
              const currentUser = await authService.getCurrentUser()
              console.log('👤 Fetched current user:', currentUser)
              setUser(currentUser)
              localStorage.setItem('user', JSON.stringify(currentUser))
              await loadAllowedMenuKeys(currentUser?.id)
            } catch (error) {
              console.warn('❌ Failed to get current user, clearing stored data:', error)
              await authService.logout()
              setUser(null)
            }
          }
        } else {
          console.log('❌ No token found, user not authenticated')
          setUser(null)
        }
      } catch (error) {
        console.error('❌ Auth initialization error:', error)
        // Clear any corrupted auth data
        try {
          await authService.logout()
        } catch (logoutError) {
          console.error('Logout error during cleanup:', logoutError)
        }
        setUser(null)
      } finally {
        setLoading(false)
        console.log('✅ Authentication initialization complete')
      }
    }

    initAuth()
  }, []) // Empty dependency array to run only once on mount

  const login = async (credentials) => {
    try {
      const response = await authService.login(credentials)
      console.log('🔐 Login response:', response)
      
      // Handle different response structures
      let loggedInUser = null
      
      if (response && response.data && response.data.user) {
        // Backend response: { success: true, data: { user: ..., token: ... } }
        loggedInUser = response.data.user
      } else if (response && response.user) {
        // If response has user property directly
        loggedInUser = response.user
      } else if (response && typeof response === 'object' && response.id) {
        // If response is the user object directly
        loggedInUser = response
      } else {
        // Fallback: create a basic user object
        loggedInUser = {
          id: 1,
          username: credentials.username,
          nama: credentials.username,
          role: 'user'
        }
      }
      
      console.log('👤 Processed user data:', loggedInUser)
      setUser(loggedInUser)
      try { await loadAllowedMenuKeys(loggedInUser?.id) } catch {}
      return loggedInUser
    } catch (error) {
      console.error('Login error in AuthContext:', error)
      throw error
    }
  }

  const logout = async () => {
    try {
      console.log('🔐 Logout started...')
      await authService.logout()
      setUser(null)
      console.log('✅ Logout successful')
      // Navigation will be handled by the component that calls logout
    } catch (error) {
      console.error('Logout error:', error)
      // Even if logout API fails, clear local state
      setUser(null)
    }
  }

  const updateUser = (updatedUser) => {
    setUser(updatedUser)
    localStorage.setItem('user', JSON.stringify(updatedUser))
    loadAllowedMenuKeys(updatedUser?.id)
  }

  const value = {
    user,
    loading,
    login,
    logout,
    updateUser,
    isAuthenticated: !!user,
    allowedMenuKeys,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
} 