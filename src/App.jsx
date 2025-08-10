import React, { useContext } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import { MenuProvider, useMenu } from './contexts/MenuContext'
import ErrorBoundary from './components/ErrorBoundary'
import Layout from './components/Layout/Layout'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import KomplainList from './pages/Komplain/KomplainList'
import KomplainDetail from './pages/Komplain/KomplainDetail'
import KomplainForm from './pages/Komplain/KomplainForm'
import TugasList from './pages/Tugas/TugasList'
import TugasDetail from './pages/Tugas/TugasDetail'
import TugasForm from './pages/Tugas/TugasForm'
import PoskasList from './pages/Poskas/PoskasList'
import PoskasDetail from './pages/Poskas/PoskasDetail'
import PoskasForm from './pages/Poskas/PoskasForm'
import UsersList from './pages/Users/UsersList'
import UserDetail from './pages/Users/UserDetail'
import UserForm from './pages/Users/UserForm'
import Profile from './pages/Profile/Profile'
import Settings from './pages/Settings/Settings'
import NotFound from './pages/NotFound'

// Protected Route Component with Permission Check
const ProtectedRoute = ({ children, requiredPermissions = [] }) => {
  const { isAuthenticated, loading } = useAuth()
  const { checkPermission } = useMenu()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Memuat aplikasi...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  // Check permissions if required
  if (requiredPermissions.length > 0 && !checkPermission(requiredPermissions)) {
    return <Navigate to="/dashboard" replace />
  }

  return children
}

const AppRoutes = () => {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/login" element={<Login />} />
      
      {/* Protected Routes */}
      <Route path="/" element={
        <ProtectedRoute>
          <Layout>
            <Dashboard />
          </Layout>
        </ProtectedRoute>
      } />
      
      <Route path="/dashboard" element={
        <ProtectedRoute>
          <Layout>
            <Dashboard />
          </Layout>
        </ProtectedRoute>
      } />

      {/* Komplain Routes */}
      <Route path="/komplain" element={
        <ProtectedRoute requiredPermissions={['read']}>
          <Layout>
            <KomplainList />
          </Layout>
        </ProtectedRoute>
      } />
      
      <Route path="/komplain/new" element={
        <ProtectedRoute requiredPermissions={['create']}>
          <Layout>
            <KomplainForm />
          </Layout>
        </ProtectedRoute>
      } />
      
      <Route path="/komplain/:id" element={
        <ProtectedRoute requiredPermissions={['read']}>
          <Layout>
            <KomplainDetail />
          </Layout>
        </ProtectedRoute>
      } />
      
      <Route path="/komplain/:id/edit" element={
        <ProtectedRoute requiredPermissions={['update']}>
          <Layout>
            <KomplainForm />
          </Layout>
        </ProtectedRoute>
      } />

      {/* Tugas Routes */}
      <Route path="/tugas" element={
        <ProtectedRoute requiredPermissions={['read']}>
          <Layout>
            <TugasList />
          </Layout>
        </ProtectedRoute>
      } />
      
      <Route path="/tugas/new" element={
        <ProtectedRoute requiredPermissions={['create']}>
          <Layout>
            <TugasForm />
          </Layout>
        </ProtectedRoute>
      } />
      
      <Route path="/tugas/:id" element={
        <ProtectedRoute requiredPermissions={['read']}>
          <Layout>
            <TugasDetail />
          </Layout>
        </ProtectedRoute>
      } />
      
      <Route path="/tugas/:id/edit" element={
        <ProtectedRoute requiredPermissions={['update']}>
          <Layout>
            <TugasForm />
          </Layout>
        </ProtectedRoute>
      } />

      {/* Poskas Routes */}
      <Route path="/poskas" element={
        <ProtectedRoute requiredPermissions={['read']}>
          <Layout>
            <PoskasList />
          </Layout>
        </ProtectedRoute>
      } />
      
      <Route path="/poskas/new" element={
        <ProtectedRoute requiredPermissions={['create']}>
          <Layout>
            <PoskasForm />
          </Layout>
        </ProtectedRoute>
      } />
      
      <Route path="/poskas/:id" element={
        <ProtectedRoute requiredPermissions={['read']}>
          <Layout>
            <PoskasDetail />
          </Layout>
        </ProtectedRoute>
      } />
      
      <Route path="/poskas/:id/edit" element={
        <ProtectedRoute requiredPermissions={['update']}>
          <Layout>
            <PoskasForm />
          </Layout>
        </ProtectedRoute>
      } />

      {/* Users Routes - Admin Only */}
      <Route path="/users" element={
        <ProtectedRoute requiredPermissions={['read']}>
          <Layout>
            <UsersList />
          </Layout>
        </ProtectedRoute>
      } />
      
      <Route path="/users/new" element={
        <ProtectedRoute requiredPermissions={['create']}>
          <Layout>
            <UserForm />
          </Layout>
        </ProtectedRoute>
      } />
      
      <Route path="/users/:id" element={
        <ProtectedRoute requiredPermissions={['read']}>
          <Layout>
            <UserDetail />
          </Layout>
        </ProtectedRoute>
      } />
      
      <Route path="/users/:id/edit" element={
        <ProtectedRoute requiredPermissions={['update']}>
          <Layout>
            <UserForm />
          </Layout>
        </ProtectedRoute>
      } />

      {/* Profile Routes */}
      <Route path="/profile" element={
        <ProtectedRoute>
          <Layout>
            <Profile />
          </Layout>
        </ProtectedRoute>
      } />

      {/* Settings Routes - Admin Only */}
      <Route path="/settings" element={
        <ProtectedRoute requiredPermissions={['read']}>
          <Layout>
            <Settings />
          </Layout>
        </ProtectedRoute>
      } />

      {/* 404 Route */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}

const App = () => {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <AuthProvider>
          <MenuProvider>
            <AppRoutes />
            <Toaster 
              position="top-right"
              toastOptions={{
                duration: 4000,
                style: {
                  background: '#363636',
                  color: '#fff',
                },
                success: {
                  duration: 3000,
                  iconTheme: {
                    primary: '#10B981',
                    secondary: '#fff',
                  },
                },
                error: {
                  duration: 5000,
                  iconTheme: {
                    primary: '#EF4444',
                    secondary: '#fff',
                  },
                },
              }}
            />
          </MenuProvider>
        </AuthProvider>
      </BrowserRouter>
    </ErrorBoundary>
  )
}

export default App
