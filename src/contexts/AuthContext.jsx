import React, { createContext, useContext, useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
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
  const navigate = useNavigate()

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
              authService.logout()
            }
          }
        }
      } catch (error) {
        console.error('Auth initialization error:', error)
        // Clear any corrupted auth data
        authService.logout()
      } finally {
        setLoading(false)
      }
    }

    initAuth()
  }, [])

  const login = async (credentials) => {
    try {
      const { user: loggedInUser } = await authService.login(credentials)
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
      console.log('✅ Logout successful, redirecting to login...')
      navigate('/login')
    } catch (error) {
      console.error('Logout error:', error)
      // Even if logout API fails, clear local state and redirect
      setUser(null)
      navigate('/login')
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