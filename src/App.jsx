import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import { MenuProvider, useMenu } from './contexts/MenuContext'
import ErrorBoundary from './components/ErrorBoundary'
import Layout from './components/Layout/Layout'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import NotFound from './pages/NotFound'

// Chat Pages
import ChatPrivate from './pages/Chat/ChatPrivate'
import ChatGroups from './pages/Chat/ChatGroups'
import ChatGroupCreate from './pages/Chat/ChatGroupCreate'
import ChatRoom from './pages/Chat/ChatRoom'

// Komplain Pages
import KomplainList from './pages/Komplain/KomplainList'
import KomplainDetail from './pages/Komplain/KomplainDetail'
import KomplainForm from './pages/Komplain/KomplainForm'
import AdminKomplainList from './pages/Admin/Komplain/AdminKomplainList'
import AdminKomplainDetail from './pages/Admin/Komplain/AdminKomplainDetail'

// Tugas Pages
import TugasList from './pages/Tugas/TugasList'
import TugasDetail from './pages/Tugas/TugasDetail'
import TugasForm from './pages/Tugas/TugasForm'
import AdminTugasList from './pages/Admin/Tugas/AdminTugasList'
import AdminTugasDetail from './pages/Admin/Tugas/AdminTugasDetail'
import KPI from './pages/Tugas/KPI'

// Keuangan Pages
import PoskasList from './pages/Poskas/PoskasList'
import PoskasDetail from './pages/Poskas/PoskasDetail'
import PoskasForm from './pages/Poskas/PoskasForm'
import PoskasEdit from './pages/Poskas/PoskasEdit'
import OwnerPoskasList from './pages/Owner/Poskas/OwnerPoskasList'
import OwnerPoskasDetail from './pages/Owner/Poskas/OwnerPoskasDetail'
import LaporanKeuangan from './pages/Keuangan/LaporanKeuangan'
import AnekaGrafik from './pages/Keuangan/AnekaGrafik'
import DaftarGaji from './pages/Keuangan/DaftarGaji'
import AnekaSurat from './pages/Keuangan/AnekaSurat'

// SDM Pages
import StrukturJobdeskSOP from './pages/SDM/StrukturJobdeskSOP'
import DataTim from './pages/SDM/DataTim'

// Operasional Pages
import DataAset from './pages/Operasional/DataAset'
import DataSupplier from './pages/Operasional/DataSupplier'
import DataSewa from './pages/Operasional/DataSewa'
import DataInvestor from './pages/Operasional/DataInvestor'
import DaftarSaran from './pages/Operasional/DaftarSaran'
import DataBinaLingkungan from './pages/Operasional/DataBinaLingkungan'

// Marketing Pages
import DataTarget from './pages/Marketing/DataTarget'
import Medsos from './pages/Marketing/Medsos'

// Pengumuman Pages
import PengumumanList from './pages/Pengumuman/PengumumanList'
import PengumumanDetail from './pages/Pengumuman/PengumumanDetail'
import AdminPengumumanList from './pages/Admin/Pengumuman/AdminPengumumanList'
import AdminPengumumanForm from './pages/Admin/Pengumuman/AdminPengumumanForm'

// Tim Management Pages
import TimMerahList from './pages/Tim/TimMerahList'
import TimMerahForm from './pages/Tim/TimMerahForm'
import TimBiruList from './pages/Tim/TimBiruList'
import TimBiruForm from './pages/Tim/TimBiruForm'
import OwnerTimList from './pages/Owner/Tim/OwnerTimList'

// Training Pages
import TrainingList from './pages/Training/TrainingList'
import AdminTrainingList from './pages/Admin/Training/AdminTrainingList'
import AdminTrainingForm from './pages/Admin/Training/AdminTrainingForm'
import OwnerTrainingList from './pages/Owner/Training/OwnerTrainingList'

// Users Pages
import UsersList from './pages/Users/UsersList'
import UserDetail from './pages/Users/UserDetail'
import UserForm from './pages/Users/UserForm'
import AdminProfile from './pages/Admin/Profile/AdminProfile'

// Profile Pages
import Profile from './pages/Profile/Profile'
import ProfilePassword from './pages/Profile/ProfilePassword'

// Settings Pages
import Settings from './pages/Settings/Settings'

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

// Main Routes Component
const AppRoutes = () => {
  const { isAuthenticated, loading } = useAuth()

  // Show loading while auth is initializing
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

  return (
    <MenuProvider>
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={
          isAuthenticated ? <Navigate to="/dashboard" replace /> : <Login />
        } />
        
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

        {/* Chat Routes */}
        <Route path="/chat/private" element={
          <ProtectedRoute requiredPermissions={['read']}>
            <Layout>
              <ChatPrivate />
            </Layout>
          </ProtectedRoute>
        } />
        
        <Route path="/chat/groups" element={
          <ProtectedRoute requiredPermissions={['read']}>
            <Layout>
              <ChatGroups />
            </Layout>
          </ProtectedRoute>
        } />
        
        <Route path="/chat/groups/create" element={
          <ProtectedRoute requiredPermissions={['create']}>
            <Layout>
              <ChatGroupCreate />
            </Layout>
          </ProtectedRoute>
        } />
        
        <Route path="/chat/room/:roomId" element={
          <ProtectedRoute requiredPermissions={['read']}>
            <Layout>
              <ChatRoom />
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

        {/* Admin Komplain Routes */}
        <Route path="/admin/komplain" element={
          <ProtectedRoute requiredPermissions={['read']}>
            <Layout>
              <AdminKomplainList />
            </Layout>
          </ProtectedRoute>
        } />
        
        <Route path="/admin/komplain/:id" element={
          <ProtectedRoute requiredPermissions={['read']}>
            <Layout>
              <AdminKomplainDetail />
            </Layout>
          </ProtectedRoute>
        } />

        {/* Poskas Routes */}
        <Route path="/poskas" element={
          <ProtectedRoute>
            <Layout>
              <PoskasList />
            </Layout>
          </ProtectedRoute>
        } />
        
        <Route path="/poskas/new" element={
          <ProtectedRoute>
            <Layout>
              <PoskasForm />
            </Layout>
          </ProtectedRoute>
        } />
        
        <Route path="/poskas/:id" element={
          <ProtectedRoute>
            <Layout>
              <PoskasDetail />
            </Layout>
          </ProtectedRoute>
        } />
        
        <Route path="/poskas/:id/edit" element={
          <ProtectedRoute>
            <Layout>
              <PoskasEdit />
            </Layout>
          </ProtectedRoute>
        } />

        {/* Keuangan Routes */}
        <Route path="/keuangan/laporan" element={
          <ProtectedRoute requiredPermissions={['read']}>
            <Layout>
              <LaporanKeuangan />
            </Layout>
          </ProtectedRoute>
        } />
        
        <Route path="/keuangan/grafik" element={
          <ProtectedRoute requiredPermissions={['read']}>
            <Layout>
              <AnekaGrafik />
            </Layout>
          </ProtectedRoute>
        } />
        
        <Route path="/keuangan/gaji" element={
          <ProtectedRoute requiredPermissions={['read']}>
            <Layout>
              <DaftarGaji />
            </Layout>
          </ProtectedRoute>
        } />
        
        <Route path="/keuangan/surat" element={
          <ProtectedRoute requiredPermissions={['read']}>
            <Layout>
              <AnekaSurat />
            </Layout>
          </ProtectedRoute>
        } />

        {/* SDM Routes */}
        <Route path="/sdm/struktur" element={
          <ProtectedRoute requiredPermissions={['read']}>
            <Layout>
              <StrukturJobdeskSOP />
            </Layout>
          </ProtectedRoute>
        } />
        
        <Route path="/sdm/tim" element={
          <ProtectedRoute requiredPermissions={['read']}>
            <Layout>
              <DataTim />
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

        <Route path="/tugas/kpi" element={
          <ProtectedRoute requiredPermissions={['read']}>
            <Layout>
              <KPI />
            </Layout>
          </ProtectedRoute>
        } />

        {/* Admin Tugas Routes */}
        <Route path="/admin/tugas" element={
          <ProtectedRoute requiredPermissions={['read']}>
            <Layout>
              <AdminTugasList />
            </Layout>
          </ProtectedRoute>
        } />
        
        <Route path="/admin/tugas/:id" element={
          <ProtectedRoute requiredPermissions={['read']}>
            <Layout>
              <AdminTugasDetail />
            </Layout>
          </ProtectedRoute>
        } />

        {/* Operasional Routes */}
        <Route path="/operasional/aset" element={
          <ProtectedRoute requiredPermissions={['read']}>
            <Layout>
              <DataAset />
            </Layout>
          </ProtectedRoute>
        } />
        
        <Route path="/operasional/supplier" element={
          <ProtectedRoute requiredPermissions={['read']}>
            <Layout>
              <DataSupplier />
            </Layout>
          </ProtectedRoute>
        } />
        
        <Route path="/operasional/sewa" element={
          <ProtectedRoute requiredPermissions={['read']}>
            <Layout>
              <DataSewa />
            </Layout>
          </ProtectedRoute>
        } />
        
        <Route path="/operasional/investor" element={
          <ProtectedRoute requiredPermissions={['read']}>
            <Layout>
              <DataInvestor />
            </Layout>
          </ProtectedRoute>
        } />
        
        <Route path="/operasional/saran" element={
          <ProtectedRoute requiredPermissions={['read']}>
            <Layout>
              <DaftarSaran />
            </Layout>
          </ProtectedRoute>
        } />
        
        <Route path="/operasional/bina-lingkungan" element={
          <ProtectedRoute requiredPermissions={['read']}>
            <Layout>
              <DataBinaLingkungan />
            </Layout>
          </ProtectedRoute>
        } />

        {/* Marketing Routes */}
        <Route path="/marketing/target" element={
          <ProtectedRoute requiredPermissions={['read']}>
            <Layout>
              <DataTarget />
            </Layout>
          </ProtectedRoute>
        } />
        
        <Route path="/marketing/medsos" element={
          <ProtectedRoute requiredPermissions={['read']}>
            <Layout>
              <Medsos />
            </Layout>
          </ProtectedRoute>
        } />

        {/* Owner Poskas Routes */}
        <Route path="/owner/poskas" element={
          <ProtectedRoute requiredPermissions={['read']}>
            <Layout>
              <OwnerPoskasList />
            </Layout>
          </ProtectedRoute>
        } />
        
        <Route path="/owner/poskas/:id" element={
          <ProtectedRoute requiredPermissions={['read']}>
            <Layout>
              <OwnerPoskasDetail />
            </Layout>
          </ProtectedRoute>
        } />

        {/* Pengumuman Routes */}
        <Route path="/pengumuman" element={
          <ProtectedRoute requiredPermissions={['read']}>
            <Layout>
              <PengumumanList />
            </Layout>
          </ProtectedRoute>
        } />
        
        <Route path="/pengumuman/:id" element={
          <ProtectedRoute requiredPermissions={['read']}>
            <Layout>
              <PengumumanDetail />
            </Layout>
          </ProtectedRoute>
        } />

        {/* Admin Pengumuman Routes */}
        <Route path="/admin/pengumuman" element={
          <ProtectedRoute requiredPermissions={['read']}>
            <Layout>
              <AdminPengumumanList />
            </Layout>
          </ProtectedRoute>
        } />
        
        <Route path="/admin/pengumuman/new" element={
          <ProtectedRoute requiredPermissions={['create']}>
            <Layout>
              <AdminPengumumanForm />
            </Layout>
          </ProtectedRoute>
        } />
        
        <Route path="/admin/pengumuman/:id/edit" element={
          <ProtectedRoute requiredPermissions={['update']}>
            <Layout>
              <AdminPengumumanForm />
            </Layout>
          </ProtectedRoute>
        } />

        {/* Tim Management Routes */}
        <Route path="/tim/merah" element={
          <ProtectedRoute requiredPermissions={['read']}>
            <Layout>
              <TimMerahList />
            </Layout>
          </ProtectedRoute>
        } />
        
        <Route path="/tim/merah/new" element={
          <ProtectedRoute requiredPermissions={['create']}>
            <Layout>
              <TimMerahForm />
            </Layout>
          </ProtectedRoute>
        } />
        
        <Route path="/tim/merah/:id/edit" element={
          <ProtectedRoute requiredPermissions={['update']}>
            <Layout>
              <TimMerahForm />
            </Layout>
          </ProtectedRoute>
        } />
        
        <Route path="/tim/biru" element={
          <ProtectedRoute requiredPermissions={['read']}>
            <Layout>
              <TimBiruList />
            </Layout>
          </ProtectedRoute>
        } />
        
        <Route path="/tim/biru/new" element={
          <ProtectedRoute requiredPermissions={['create']}>
            <Layout>
              <TimBiruForm />
            </Layout>
          </ProtectedRoute>
        } />
        
        <Route path="/tim/biru/:id/edit" element={
          <ProtectedRoute requiredPermissions={['update']}>
            <Layout>
              <TimBiruForm />
            </Layout>
          </ProtectedRoute>
        } />

        {/* Owner Tim Routes */}
        <Route path="/owner/tim" element={
          <ProtectedRoute requiredPermissions={['read']}>
            <Layout>
              <OwnerTimList />
            </Layout>
          </ProtectedRoute>
        } />

        {/* Training Routes */}
        <Route path="/training" element={
          <ProtectedRoute requiredPermissions={['read']}>
            <Layout>
              <TrainingList />
            </Layout>
          </ProtectedRoute>
        } />

        {/* Admin Training Routes */}
        <Route path="/admin/training" element={
          <ProtectedRoute requiredPermissions={['read']}>
            <Layout>
              <AdminTrainingList />
            </Layout>
          </ProtectedRoute>
        } />
        
        <Route path="/admin/training/new" element={
          <ProtectedRoute requiredPermissions={['create']}>
            <Layout>
              <AdminTrainingForm />
            </Layout>
          </ProtectedRoute>
        } />
        
        <Route path="/admin/training/:id/edit" element={
          <ProtectedRoute requiredPermissions={['update']}>
            <Layout>
              <AdminTrainingForm />
            </Layout>
          </ProtectedRoute>
        } />

        {/* Owner Training Routes */}
        <Route path="/owner/training" element={
          <ProtectedRoute requiredPermissions={['read']}>
            <Layout>
              <OwnerTrainingList />
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

        {/* Admin Profile Routes */}
        <Route path="/admin/profile" element={
          <ProtectedRoute requiredPermissions={['read']}>
            <Layout>
              <AdminProfile />
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
        
        <Route path="/profile/password" element={
          <ProtectedRoute requiredPermissions={['update']}>
            <Layout>
              <ProfilePassword />
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
    </MenuProvider>
  )
}

// Main App Component
const App = () => {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <AuthProvider>
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
        </AuthProvider>
      </BrowserRouter>
    </ErrorBoundary>
  )
}

export default App 