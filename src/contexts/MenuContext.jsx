import React, { createContext, useContext, useState, useEffect } from 'react'
import { useAuth } from './AuthContext'
import { getMenusByRole, hasPermission } from '../services/menuService'

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
    if (!user || !requiredPermissions) return false
    
    return hasPermission(user.role, requiredPermissions, permissions)
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