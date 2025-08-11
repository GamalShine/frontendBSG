import React, { createContext, useContext, useState, useEffect } from 'react'
import { authService } from '../services/authService'

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

  useEffect(() => {
    const initAuth = async () => {
      try {
        // Check if we have a stored token
        if (authService.isAuthenticated()) {
          const storedUser = authService.getStoredUser()
          if (storedUser) {
            setUser(storedUser)
          } else {
            try {
              // Try to get current user from server
              const currentUser = await authService.getCurrentUser()
              setUser(currentUser)
              localStorage.setItem('user', JSON.stringify(currentUser))
            } catch (error) {
              // If API call fails, clear stored data and continue
              console.warn('Failed to get current user, clearing stored data:', error)
              await authService.logout()
            }
          }
        }
      } catch (error) {
        console.error('Auth initialization error:', error)
        // Clear any corrupted auth data
        await authService.logout()
      } finally {
        setLoading(false)
      }
    }

    initAuth()
  }, [])

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
  }

  const value = {
    user,
    loading,
    login,
    logout,
    updateUser,
    isAuthenticated: !!user,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
} 