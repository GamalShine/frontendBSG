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
import ChatRoom from './pages/Chat/ChatRoom'
import AdminChatPrivate from './pages/Admin/Chat/ChatPrivate/AdminChatPrivate'
import AdminChatRoom from './pages/Admin/Chat/ChatRoom/AdminChatRoom'
import OwnerChatPrivate from './pages/Owner/Chat/ChatPrivate/OwnerChatPrivate'
import OwnerChatRoom from './pages/Owner/Chat/ChatRoom/OwnerChatRoom'
import DivisiChatPrivate from './pages/Divisi/Chat/ChatPrivate/DivisiChatPrivate'
import DivisiChatRoom from './pages/Divisi/Chat/ChatRoom/DivisiChatRoom'
import TimChatPrivate from './pages/Tim/Chat/ChatPrivate/TimChatPrivate'
import TimChatRoom from './pages/Tim/Chat/ChatRoom/TimChatRoom'

// Komplain Pages
import KomplainList from './pages/Komplain/KomplainList'
import KomplainDetail from './pages/Komplain/KomplainDetail'
import KomplainForm from './pages/Komplain/KomplainForm'
import AdminKomplainList from './pages/Admin/Komplain/AdminKomplainList'
import AdminKomplainDetail from './pages/Admin/Komplain/AdminKomplainDetail'
import AdminKomplainForm from './pages/Admin/Komplain/AdminKomplainForm'
import AdminKomplainEdit from './pages/Admin/Komplain/AdminKomplainEdit'

// Tugas Pages
import TugasList from './pages/Tugas/TugasList'
import TugasDetail from './pages/Tugas/TugasDetail'
import TugasForm from './pages/Tugas/TugasForm'

// Admin Tugas Pages
import AdminDaftarTugas from './pages/Admin/Tugas/AdminDaftarTugas'
import AdminTugasForm from './pages/Admin/Tugas/AdminTugasForm'
import AdminTugasDetail from './pages/Admin/Tugas/AdminTugasDetail'

// Owner Tugas Pages
import OwnerDaftarTugas from './pages/Owner/Tugas/OwnerDaftarTugas'
import OwnerTugasForm from './pages/Owner/Tugas/OwnerTugasForm'
import OwnerTugasDetail from './pages/Owner/Tugas/OwnerTugasDetail'
// Daftar Tugas Pages
import KPI from './pages/DaftarTugas/KPI'
import TimMerahBiru from './pages/DaftarTugas/TimMerahBiru'

// Keuangan Pages
import PoskasList from './pages/Poskas/PoskasList'
import PoskasDetail from './pages/Poskas/PoskasDetail'
import PoskasForm from './pages/Poskas/PoskasForm'
import PoskasEdit from './pages/Poskas/PoskasEdit'
// Owner Pages - New Structure
import OwnerLaporanKeuangan from './pages/Owner/Keuangan/laporan/OwnerLaporanKeuangan'
import OwnerLaporanKeuanganForm from './pages/Owner/Keuangan/laporan/OwnerLaporanKeuanganForm'
import OwnerLaporanKeuanganDetail from './pages/Owner/Keuangan/laporan/OwnerLaporanKeuanganDetail'
import OwnerOmsetHarian from './pages/Owner/Keuangan/OmsetHarian/OwnerOmsetHarian'
import OwnerAnekaGrafik from './pages/Owner/Keuangan/laporan/OwnerAnekaGrafik'
import OwnerAnekaGrafikDashboard from './pages/Owner/Dashboard/AnekaGrafik'
import OwnerDaftarGaji from './pages/Owner/Keuangan/manage/OwnerDaftarGaji'
import OwnerDataAset from './pages/Owner/Operasional/DataAset/OwnerDataAset'
import OwnerDataInvestor from './pages/Owner/Operasional/DataInvestor/OwnerDataInvestor'
import OwnerDataTarget from './pages/Owner/Marketing/manage/OwnerDataTarget'
import OwnerDataTim from './pages/Owner/SDM/manage/OwnerDataTim'
import OwnerTimMerahBiruList from './pages/Owner/SDM/TimMerahBiru/OwnerTimMerahBiruList'
import OwnerTimMerahBiruDetail from './pages/Owner/SDM/TimMerahBiru/OwnerTimMerahBiruDetail'
import OwnerTimMerahBiruForm from './pages/Owner/SDM/TimMerahBiru/OwnerTimMerahBiruForm'
import OwnerTimMerahBiruEdit from './pages/Owner/SDM/TimMerahBiru/OwnerTimMerahBiruEdit'

// Owner KPI Pages
import OwnerKPI from './pages/Owner/SDM/KPI/OwnerKPI'
import OwnerKPIList from './pages/Owner/SDM/KPI/OwnerKPIList'
import OwnerKPIDetail from './pages/Owner/SDM/KPI/OwnerKPIDetail'
import OwnerKPIForm from './pages/Owner/SDM/KPI/OwnerKPIForm'
import OwnerKPIEdit from './pages/Owner/SDM/KPI/OwnerKPIEdit'

// Owner Admin Management Pages
import AdminMenuManagement from './pages/Owner/AdminMenuManagement/AdminMenuManagement'
import PicMenuManagement from './pages/Owner/PicMenuManagement/PicMenuManagement'

// Admin Pages - New Structure
import AdminLaporanKeuangan from './pages/Admin/Keuangan/laporan/AdminLaporanKeuangan'
import AdminLaporanKeuanganForm from './pages/Admin/Keuangan/laporan/AdminLaporanKeuanganForm'
import AdminLaporanKeuanganDetail from './pages/Admin/Keuangan/laporan/AdminLaporanKeuanganDetail'


// Admin Poskas Pages
import AdminPoskasList from './pages/Admin/Keuangan/Poskas/AdminPoskasList'
import AdminPoskasDetail from './pages/Admin/Keuangan/Poskas/AdminPoskasDetail'
import AdminPoskasForm from './pages/Admin/Keuangan/Poskas/AdminPoskasForm'
import AdminPoskasEdit from './pages/Admin/Keuangan/Poskas/AdminPoskasEdit'

// Admin Omset Harian Pages
import AdminOmsetHarianList from './pages/Admin/Keuangan/OmsetHarian/AdminOmsetHarianList'
import AdminOmsetHarianForm from './pages/Admin/Keuangan/OmsetHarian/AdminOmsetHarianForm'
import AdminOmsetHarianDetail from './pages/Admin/Keuangan/OmsetHarian/AdminOmsetHarianDetail'
import AdminOmsetHarianEdit from './pages/Admin/Keuangan/OmsetHarian/AdminOmsetHarianEdit'

// Admin Aneka Grafik Pages
import AdminAnekaGrafikList from './pages/Admin/Keuangan/AnekaGrafik/AdminAnekaGrafikList'
import AdminAnekaGrafikDetail from './pages/Admin/Keuangan/AnekaGrafik/AdminAnekaGrafikDetail'
import AdminAnekaGrafikForm from './pages/Admin/Keuangan/AnekaGrafik/AdminAnekaGrafikForm'
import AdminAnekaGrafik from './pages/Admin/Dashboard/AnekaGrafik'

// Admin Operasional Pages
import AdminDataSupplier from './pages/Admin/Operasional/DataSupplier/AdminDataSupplier'
import AdminDataSupplierForm from './pages/Admin/Operasional/DataSupplier/AdminDataSupplierForm'
import AdminDataSupplierDetail from './pages/Admin/Operasional/DataSupplier/AdminDataSupplierDetail'
import AdminDataSupplierEdit from './pages/Admin/Operasional/DataSupplier/AdminDataSupplierEdit'
import AdminDataBinaLingkungan from './pages/Admin/Operasional/DataBinaLingkungan/AdminDataBinaLingkungan'
import AdminDataBinaLingkunganForm from './pages/Admin/Operasional/DataBinaLingkungan/AdminDataBinaLingkunganForm'
import AdminDataBinaLingkunganDetail from './pages/Admin/Operasional/DataBinaLingkungan/AdminDataBinaLingkunganDetail'
import AdminDataBinaLingkunganEdit from './pages/Admin/Operasional/DataBinaLingkungan/AdminDataBinaLingkunganEdit'
import AdminDataAset from './pages/Admin/Operasional/DataAset/AdminDataAset'
import AdminDataInvestor from './pages/Admin/Operasional/DataInvestor/AdminDataInvestor'

// Admin SDM Pages
import AdminDataTim from './pages/Admin/SDM/manage/AdminDataTim'
import AdminTimMerahBiru from './pages/Admin/SDM/TimMerahBiru/AdminTimMerahBiru'
import AdminTimMerahBiruList from './pages/Admin/SDM/TimMerahBiru/AdminTimMerahBiruList'
import AdminTimMerahBiruDetail from './pages/Admin/SDM/TimMerahBiru/AdminTimMerahBiruDetail'
import AdminTimMerahBiruForm from './pages/Admin/SDM/TimMerahBiru/AdminTimMerahBiruForm'
import AdminTimMerahBiruEdit from './pages/Admin/SDM/TimMerahBiru/AdminTimMerahBiruEdit'

// Admin KPI Pages
import AdminKPI from './pages/Admin/SDM/KPI/AdminKPI'
import AdminKPIList from './pages/Admin/SDM/KPI/AdminKPIList'
import AdminKPIDetail from './pages/Admin/SDM/KPI/AdminKPIDetail'
import AdminKPIForm from './pages/Admin/SDM/KPI/AdminKPIForm'
import AdminKPIEdit from './pages/Admin/SDM/KPI/AdminKPIEdit'

// Tim Pages - New Structure
import TimPoskasForm from './pages/Tim/Keuangan/input-data/TimPoskasForm'
import TimKomplainForm from './pages/Tim/Operasional/input-data/TimKomplainForm'

// Divisi Pages - New Structure
import DivisiPoskasList from './pages/Divisi/Keuangan/view/DivisiPoskasList'

// Owner Poskas Pages - Updated
import OwnerPoskasList from './pages/Owner/Keuangan/Poskas/OwnerPoskasList'
import OwnerPoskasDetail from './pages/Owner/Keuangan/Poskas/OwnerPoskasDetail'
import OwnerPoskasForm from './pages/Owner/Keuangan/Poskas/OwnerPoskasForm'
import OwnerPoskasEdit from './pages/Owner/Keuangan/Poskas/OwnerPoskasEdit'

// Owner Operasional Pages
import OwnerDataSupplier from './pages/Owner/Operasional/DataSupplier/OwnerDataSupplier'
import OwnerDataSupplierForm from './pages/Owner/Operasional/DataSupplier/OwnerDataSupplierForm'
import OwnerDataSupplierDetail from './pages/Owner/Operasional/DataSupplier/OwnerDataSupplierDetail'
import OwnerDataSupplierEdit from './pages/Owner/Operasional/DataSupplier/OwnerDataSupplierEdit'
import OwnerDataBinaLingkungan from './pages/Owner/Operasional/DataBinaLingkungan/OwnerDataBinaLingkungan'

// Owner Komplain Pages
import OwnerKomplainList from './pages/Owner/Operasional/Komplain/OwnerKomplainList'
import OwnerKomplainDetail from './pages/Owner/Operasional/Komplain/OwnerKomplainDetail'
import OwnerKomplainForm from './pages/Owner/Operasional/Komplain/OwnerKomplainForm'
import OwnerKomplainEdit from './pages/Owner/Operasional/Komplain/OwnerKomplainEdit'

// Admin Data Target Pages
import AdminDataTarget from './pages/Admin/Marketing/AdminDataTarget'
import AdminDataTargetForm from './pages/Admin/Marketing/AdminDataTargetForm'
import AdminDataTargetDetail from './pages/Admin/Marketing/AdminDataTargetDetail'
import AdminDataTargetEdit from './pages/Admin/Marketing/AdminDataTargetEdit'

// Admin Medsos Pages
import AdminMedsos from './pages/Admin/Marketing/AdminMedsos'
import AdminMedsosForm from './pages/Admin/Marketing/AdminMedsosForm'
import AdminMedsosDetail from './pages/Admin/Marketing/AdminMedsosDetail'
import AdminMedsosEdit from './pages/Admin/Marketing/AdminMedsosEdit'
import AdminMedsosKOLForm from './pages/Admin/Marketing/AdminMedsosKOLForm'
import AdminMedsosAnggaranForm from './pages/Admin/Marketing/AdminMedsosAnggaranForm'
import AdminMedsosPlatformForm from './pages/Admin/Marketing/AdminMedsosPlatformForm'

// Owner Omset Harian Pages
import OwnerOmsetHarianList from './pages/Owner/Keuangan/OmsetHarian/OwnerOmsetHarianList'
import OwnerOmsetHarianForm from './pages/Owner/Keuangan/OmsetHarian/OwnerOmsetHarianForm'
import OwnerOmsetHarianDetail from './pages/Owner/Keuangan/OmsetHarian/OwnerOmsetHarianDetail'
import OwnerOmsetHarianEdit from './pages/Owner/Keuangan/OmsetHarian/OwnerOmsetHarianEdit'
import OwnerAnekaGrafikList from './pages/Owner/Keuangan/AnekaGrafik/OwnerAnekaGrafikList'
import OwnerAnekaGrafikForm from './pages/Owner/Keuangan/AnekaGrafik/OwnerAnekaGrafikForm'
import OwnerAnekaGrafikDetail from './pages/Owner/Keuangan/AnekaGrafik/OwnerAnekaGrafikDetail'
import LaporanKeuangan from './pages/Keuangan/LaporanKeuangan'
import AnekaGrafikList from './pages/Keuangan/AnekaGrafikList'
import AnekaGrafikDetail from './pages/Keuangan/AnekaGrafikDetail'
import AnekaGrafikForm from './pages/Keuangan/AnekaGrafikForm'
import DaftarGaji from './pages/Keuangan/DaftarGaji'
import AnekaSurat from './pages/Keuangan/AnekaSurat'
import OmsetHarian from './pages/Keuangan/OmsetHarian'
import OmsetHarianList from './pages/Keuangan/OmsetHarianList'
import OmsetHarianForm from './pages/Keuangan/OmsetHarianForm'
import OmsetHarianDetail from './pages/Keuangan/OmsetHarianDetail'
import LaporanKeuanganForm from './pages/Keuangan/LaporanKeuanganForm'
import LaporanKeuanganDetail from './pages/Keuangan/LaporanKeuanganDetail'

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
import OwnerTimList from './pages/Owner/Operasional/manage/OwnerTimList'

// Training Pages
import TrainingList from './pages/Training/TrainingList'
import AdminTrainingList from './pages/Admin/Training/AdminTrainingList'
import AdminTrainingForm from './pages/Admin/Training/AdminTrainingForm'
import OwnerTrainingList from './pages/Owner/SDM/manage/OwnerTrainingList'

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

// Login Wrapper Component
const LoginWrapper = () => {
  const { isAuthenticated, loading } = useAuth()
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-red-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 text-lg">Memuat aplikasi...</p>
          <p className="text-gray-500 text-sm">Mohon tunggu sebentar</p>
        </div>
      </div>
    )
  }
  
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />
  }
  
  return <Login />
}

// Protected Route Component with Permission Check
const ProtectedRoute = ({ children, requiredPermissions = [] }) => {
  const { isAuthenticated, loading } = useAuth()
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-red-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 text-lg">Memuat aplikasi...</p>
          <p className="text-gray-500 text-sm">Mohon tunggu sebentar</p>
        </div>
      </div>
    )
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }
  
  return children
}

// Main App Component
const App = () => {
  return (
    <ErrorBoundary>
      <BrowserRouter
        future={{
          v7_startTransition: true,
          v7_relativeSplatPath: true,
        }}
      >
        <AuthProvider>
          <MenuProvider>
            <Routes>
              {/* Public Routes */}
              <Route path="/login" element={<LoginWrapper />} />
              
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
              <Route path="/chat" element={<Navigate to="/chat/private" replace />} />
              
              <Route path="/chat/private" element={
                <ProtectedRoute requiredPermissions={['read']}>
                  <Layout>
                    <ChatPrivate />
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

              {/* Admin Chat Routes */}
              <Route path="/admin/chat" element={<Navigate to="/admin/chat/private" replace />} />
              
              <Route path="/admin/chat/private" element={
                <ProtectedRoute requiredPermissions={['read']}>
                  <Layout>
                    <AdminChatPrivate />
                  </Layout>
                </ProtectedRoute>
              } />
              
              <Route path="/admin/chat/room/:roomId" element={
                <ProtectedRoute requiredPermissions={['read']}>
                  <Layout>
                    <AdminChatRoom />
                  </Layout>
                </ProtectedRoute>
              } />

                          {/* Owner Admin Management Routes */}
            <Route path="/owner/admin-menu-management" element={
              <ProtectedRoute requiredPermissions={['read']}>
                <Layout>
                  <AdminMenuManagement />
                </Layout>
              </ProtectedRoute>
            } />
            <Route path="/owner/pic-menu-management" element={
              <ProtectedRoute requiredPermissions={['read']}>
                <Layout>
                  <PicMenuManagement />
                </Layout>
              </ProtectedRoute>
            } />
              
              {/* Owner Chat Routes */}
              <Route path="/owner/chat" element={<Navigate to="/owner/chat/private" replace />} />
              
              <Route path="/owner/chat/private" element={
                <ProtectedRoute requiredPermissions={['read']}>
                  <Layout>
                    <OwnerChatPrivate />
                  </Layout>
                </ProtectedRoute>
              } />
              
              <Route path="/owner/chat/room/:roomId" element={
                <ProtectedRoute requiredPermissions={['read']}>
                  <Layout>
                    <OwnerChatRoom />
                  </Layout>
                </ProtectedRoute>
              } />

              {/* Divisi Chat Routes */}
              <Route path="/divisi/chat" element={<Navigate to="/divisi/chat/private" replace />} />
              
              <Route path="/divisi/chat/private" element={
                <ProtectedRoute requiredPermissions={['read']}>
                  <Layout>
                    <DivisiChatPrivate />
                  </Layout>
                </ProtectedRoute>
              } />
              
              <Route path="/divisi/chat/room/:roomId" element={
                <ProtectedRoute requiredPermissions={['read']}>
                  <Layout>
                    <DivisiChatRoom />
                  </Layout>
                </ProtectedRoute>
              } />

              {/* Tim Chat Routes */}
              <Route path="/tim/chat" element={<Navigate to="/tim/chat/private" replace />} />
              
              <Route path="/tim/chat/private" element={
                <ProtectedRoute requiredPermissions={['read']}>
                  <Layout>
                    <TimChatPrivate />
                  </Layout>
                </ProtectedRoute>
              } />
              
              <Route path="/tim/chat/room/:roomId" element={
                <ProtectedRoute requiredPermissions={['read']}>
                  <Layout>
                    <TimChatRoom />
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
              
              <Route path="/admin/komplain/new" element={
                <ProtectedRoute requiredPermissions={['create']}>
                  <Layout>
                    <AdminKomplainForm />
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
              
              <Route path="/admin/komplain/:id/edit" element={
                <ProtectedRoute requiredPermissions={['update']}>
                  <Layout>
                    <AdminKomplainEdit />
                  </Layout>
                </ProtectedRoute>
              } />

              {/* Admin New Structure Routes */}
              {/* Admin Keuangan Routes */}
              <Route path="/admin/keuangan/laporan" element={
                <ProtectedRoute requiredPermissions={['read']}>
                  <Layout>
                    <AdminLaporanKeuangan />
                  </Layout>
                </ProtectedRoute>
              } />
              <Route path="/admin/keuangan/surat" element={
                <ProtectedRoute requiredPermissions={['read']}>
                  <Layout>
                    <AnekaSurat />
                  </Layout>
                </ProtectedRoute>
              } />
              
              <Route path="/admin/keuangan/laporan/new" element={
                <ProtectedRoute requiredPermissions={['create']}>
                  <Layout>
                    <AdminLaporanKeuanganForm />
                  </Layout>
                </ProtectedRoute>
              } />
              
              <Route path="/admin/keuangan/laporan/:id" element={
                <ProtectedRoute requiredPermissions={['read']}>
                  <Layout>
                    <AdminLaporanKeuanganDetail />
                  </Layout>
                </ProtectedRoute>
              } />
              
              <Route path="/admin/keuangan/laporan/:id/edit" element={
                <ProtectedRoute requiredPermissions={['update']}>
                  <Layout>
                    <AdminLaporanKeuanganForm />
                  </Layout>
                </ProtectedRoute>
              } />

              {/* Admin Operasional Routes */}
              <Route path="/admin/operasional/data-supplier" element={
                <ProtectedRoute requiredPermissions={['read']}>
                  <Layout>
                    <AdminDataSupplier />
                  </Layout>
                </ProtectedRoute>
              } />
              
              <Route path="/admin/operasional/data-supplier/new" element={
                <ProtectedRoute requiredPermissions={['create']}>
                  <Layout>
                    <AdminDataSupplierForm />
                  </Layout>
                </ProtectedRoute>
              } />
              
              <Route path="/admin/operasional/data-supplier/form" element={
                <ProtectedRoute requiredPermissions={['create']}>
                  <Layout>
                    <AdminDataSupplierForm />
                  </Layout>
                </ProtectedRoute>
              } />
              
              <Route path="/admin/operasional/data-supplier/detail/:id" element={
                <ProtectedRoute requiredPermissions={['read']}>
                  <Layout>
                    <AdminDataSupplierDetail />
                  </Layout>
                </ProtectedRoute>
              } />
              
              <Route path="/admin/operasional/data-supplier/edit/:id" element={
                <ProtectedRoute requiredPermissions={['update']}>
                  <Layout>
                    <AdminDataSupplierEdit />
                  </Layout>
                </ProtectedRoute>
              } />
              <Route path="/admin/operasional/bina-lingkungan" element={
                <ProtectedRoute requiredPermissions={['read']}>
                  <Layout>
                    <AdminDataBinaLingkungan />
                  </Layout>
                </ProtectedRoute>
              } />

              {/* Admin Marketing Routes */}
              <Route path="/admin/marketing/target" element={
                <ProtectedRoute requiredPermissions={['read']}>
                  <Layout>
                    <AdminDataTarget />
                  </Layout>
                </ProtectedRoute>
              } />
              
              <Route path="/admin/marketing/target/form" element={
                <ProtectedRoute requiredPermissions={['create']}>
                  <Layout>
                    <AdminDataTargetForm />
                  </Layout>
                </ProtectedRoute>
              } />
              
              <Route path="/admin/marketing/target/detail/:id" element={
                <ProtectedRoute requiredPermissions={['read']}>
                  <Layout>
                    <AdminDataTargetDetail />
                  </Layout>
                </ProtectedRoute>
              } />
              
              <Route path="/admin/marketing/target/edit/:id" element={
                <ProtectedRoute requiredPermissions={['update']}>
                  <Layout>
                    <AdminDataTargetEdit />
                  </Layout>
                </ProtectedRoute>
              } />
              
              <Route path="/admin/marketing/medsos" element={
                <ProtectedRoute requiredPermissions={['read']}>
                  <Layout>
                    <AdminMedsos />
                  </Layout>
                </ProtectedRoute>
              } />
              
              <Route path="/admin/marketing/medsos/form" element={
                <ProtectedRoute requiredPermissions={['create']}>
                  <Layout>
                    <AdminMedsosForm />
                  </Layout>
                </ProtectedRoute>
              } />

              <Route path="/admin/marketing/medsos/kol/form" element={
                <ProtectedRoute requiredPermissions={['create']}>
                  <Layout>
                    <AdminMedsosKOLForm />
                  </Layout>
                </ProtectedRoute>
              } />

              <Route path="/admin/marketing/medsos/anggaran/form" element={
                <ProtectedRoute requiredPermissions={['create']}>
                  <Layout>
                    <AdminMedsosAnggaranForm />
                  </Layout>
                </ProtectedRoute>
              } />

              <Route path="/admin/marketing/medsos/platform/form" element={
                <ProtectedRoute requiredPermissions={['create']}>
                  <Layout>
                    <AdminMedsosPlatformForm />
                  </Layout>
                </ProtectedRoute>
              } />
              
              <Route path="/admin/marketing/medsos/detail/:id" element={
                <ProtectedRoute requiredPermissions={['read']}>
                  <Layout>
                    <AdminMedsosDetail />
                  </Layout>
                </ProtectedRoute>
              } />
              
              <Route path="/admin/marketing/medsos/edit/:id" element={
                <ProtectedRoute requiredPermissions={['update']}>
                  <Layout>
                    <AdminMedsosEdit />
                  </Layout>
                </ProtectedRoute>
              } />
              
              {/* Admin SDM Routes */}
              <Route path="/admin/sdm/tim" element={
                <ProtectedRoute requiredPermissions={['read']}>
                  <Layout>
                    <AdminDataTim />
                  </Layout>
                </ProtectedRoute>
              } />
              
              <Route path="/admin/sdm/tim-merah-biru" element={
                <ProtectedRoute requiredPermissions={['read']}>
                  <Layout>
                    <AdminTimMerahBiru />
                  </Layout>
                </ProtectedRoute>
              } />
              
              <Route path="/admin/sdm/tim/merah" element={
                <ProtectedRoute requiredPermissions={['read']}>
                  <Layout>
                    <AdminTimMerahBiruList />
                  </Layout>
                </ProtectedRoute>
              } />
              
              <Route path="/admin/sdm/tim/biru" element={
                <ProtectedRoute requiredPermissions={['read']}>
                  <Layout>
                    <AdminTimMerahBiruList />
                  </Layout>
                </ProtectedRoute>
              } />
              
              <Route path="/admin/sdm/tim/merah/new" element={
                <ProtectedRoute requiredPermissions={['create']}>
                  <Layout>
                    <AdminTimMerahBiruForm />
                  </Layout>
                </ProtectedRoute>
              } />
              
              <Route path="/admin/sdm/tim/merah/form" element={
                <ProtectedRoute requiredPermissions={['create']}>
                  <Layout>
                    <AdminTimMerahBiruForm />
                  </Layout>
                </ProtectedRoute>
              } />
              
              <Route path="/admin/sdm/tim/biru/new" element={
                <ProtectedRoute requiredPermissions={['create']}>
                  <Layout>
                    <AdminTimMerahBiruForm />
                  </Layout>
                </ProtectedRoute>
              } />
              
              <Route path="/admin/sdm/tim/biru/form" element={
                <ProtectedRoute requiredPermissions={['create']}>
                  <Layout>
                    <AdminTimMerahBiruForm />
                  </Layout>
                </ProtectedRoute>
              } />
              
              <Route path="/admin/sdm/tim/merah/:id/edit" element={
                <ProtectedRoute requiredPermissions={['update']}>
                  <Layout>
                    <AdminTimMerahBiruEdit />
                  </Layout>
                </ProtectedRoute>
              } />
              
              <Route path="/admin/sdm/tim/merah/:id" element={
                <ProtectedRoute requiredPermissions={['read']}>
                  <Layout>
                    <AdminTimMerahBiruDetail />
                  </Layout>
                </ProtectedRoute>
              } />
              
              <Route path="/admin/sdm/tim/biru/:id/edit" element={
                <ProtectedRoute requiredPermissions={['update']}>
                  <Layout>
                    <AdminTimMerahBiruEdit />
                  </Layout>
                </ProtectedRoute>
              } />
              
              <Route path="/admin/sdm/tim/biru/:id" element={
                <ProtectedRoute requiredPermissions={['read']}>
                  <Layout>
                    <AdminTimMerahBiruDetail />
                  </Layout>
                </ProtectedRoute>
              } />
              
              {/* Admin KPI Routes */}
              <Route path="/admin/sdm/kpi" element={
                <ProtectedRoute requiredPermissions={['read']}>
                  <Layout>
                    <AdminKPI />
                  </Layout>
                </ProtectedRoute>
              } />
              
              <Route path="/admin/sdm/kpi/new" element={
                <ProtectedRoute requiredPermissions={['create']}>
                  <Layout>
                    <AdminKPIForm />
                  </Layout>
                </ProtectedRoute>
              } />
              
              <Route path="/admin/sdm/kpi/:id" element={
                <ProtectedRoute requiredPermissions={['read']}>
                  <Layout>
                    <AdminKPIDetail />
                  </Layout>
                </ProtectedRoute>
              } />
              
              <Route path="/admin/sdm/kpi/:id/edit" element={
                <ProtectedRoute requiredPermissions={['update']}>
                  <Layout>
                    <AdminKPIEdit />
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
              
              <Route path="/keuangan/laporan/add" element={
                <ProtectedRoute requiredPermissions={['create']}>
                  <Layout>
                    <LaporanKeuanganForm />
                  </Layout>
                </ProtectedRoute>
              } />
              
              <Route path="/keuangan/laporan/:id" element={
                <ProtectedRoute requiredPermissions={['read']}>
                  <Layout>
                    <LaporanKeuanganDetail />
                  </Layout>
                </ProtectedRoute>
              } />
              
              <Route path="/keuangan/laporan/:id/edit" element={
                <ProtectedRoute requiredPermissions={['update']}>
                  <Layout>
                    <LaporanKeuanganForm />
                  </Layout>
                </ProtectedRoute>
              } />
              
              <Route path="/keuangan/omset-harian" element={
                <ProtectedRoute requiredPermissions={['read']}>
                  <Layout>
                    <OmsetHarianList />
                  </Layout>
                </ProtectedRoute>
              } />
              
              <Route path="/keuangan/omset-harian/new" element={
                <ProtectedRoute requiredPermissions={['create']}>
                  <Layout>
                    <OmsetHarianForm />
                  </Layout>
                </ProtectedRoute>
              } />
              
              <Route path="/keuangan/omset-harian/:id" element={
                <ProtectedRoute requiredPermissions={['read']}>
                  <Layout>
                    <OmsetHarianDetail />
                  </Layout>
                </ProtectedRoute>
              } />
              
              <Route path="/keuangan/omset-harian/:id/edit" element={
                <ProtectedRoute requiredPermissions={['update']}>
                  <Layout>
                    <OmsetHarianForm />
                  </Layout>
                </ProtectedRoute>
              } />
              
              <Route path="/keuangan/aneka-grafik" element={
                <ProtectedRoute requiredPermissions={['read']}>
                  <Layout>
                    <AnekaGrafikList />
                  </Layout>
                </ProtectedRoute>
              } />
              
              <Route path="/keuangan/aneka-grafik/new" element={
                <ProtectedRoute requiredPermissions={['create']}>
                  <Layout>
                    <AnekaGrafikForm />
                  </Layout>
                </ProtectedRoute>
              } />
              
              <Route path="/keuangan/aneka-grafik/:id" element={
                <ProtectedRoute requiredPermissions={['read']}>
                  <Layout>
                    <AnekaGrafikDetail />
                  </Layout>
                </ProtectedRoute>
              } />
              
              <Route path="/keuangan/aneka-grafik/:id/edit" element={
                <ProtectedRoute requiredPermissions={['update']}>
                  <Layout>
                    <AnekaGrafikForm />
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

              {/* Daftar Tugas Routes */}
              <Route path="/tugas/kpi" element={
                <ProtectedRoute requiredPermissions={['read']}>
                  <Layout>
                    <KPI />
                  </Layout>
                </ProtectedRoute>
              } />
              
              <Route path="/tugas/tim" element={
                <ProtectedRoute requiredPermissions={['read']}>
                  <Layout>
                    <TimMerahBiru />
                  </Layout>
                </ProtectedRoute>
              } />

              {/* Admin Tugas Routes */}
              <Route path="/admin/tugas" element={
                <ProtectedRoute requiredPermissions={['read']}>
                  <Layout>
                    <AdminDaftarTugas />
                  </Layout>
                </ProtectedRoute>
              } />
              
              <Route path="/admin/tugas/new" element={
                <ProtectedRoute requiredPermissions={['create']}>
                  <Layout>
                    <AdminTugasForm />
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
              
              <Route path="/admin/tugas/:id/edit" element={
                <ProtectedRoute requiredPermissions={['update']}>
                  <Layout>
                    <AdminTugasForm />
                  </Layout>
                </ProtectedRoute>
              } />

              {/* Owner Tugas Routes */}
              <Route path="/owner/tugas" element={
                <ProtectedRoute requiredPermissions={['read']}>
                  <Layout>
                    <OwnerDaftarTugas />
                  </Layout>
                </ProtectedRoute>
              } />
              
              <Route path="/owner/tugas/new" element={
                <ProtectedRoute requiredPermissions={['create']}>
                  <Layout>
                    <OwnerTugasForm />
                  </Layout>
                </ProtectedRoute>
              } />
              
              <Route path="/owner/tugas/:id" element={
                <ProtectedRoute requiredPermissions={['read']}>
                  <Layout>
                    <OwnerTugasDetail />
                  </Layout>
                </ProtectedRoute>
              } />
              
              <Route path="/owner/tugas/:id/edit" element={
                <ProtectedRoute requiredPermissions={['update']}>
                  <Layout>
                    <OwnerTugasForm />
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
              
              {/* Admin Operasional Routes */}
              <Route path="/admin/operasional/aset" element={
                <ProtectedRoute requiredPermissions={['read']}>
                  <Layout>
                    <AdminDataAset />
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

              {/* Admin/Owner Bina Lingkungan Routes */}
              <Route path="/admin/operasional/bina-lingkungan" element={
                <ProtectedRoute requiredPermissions={['read']}>
                  <Layout>
                    <AdminDataBinaLingkungan />
                  </Layout>
                </ProtectedRoute>
              } />
              <Route path="/owner/operasional/bina-lingkungan" element={
                <ProtectedRoute requiredPermissions={['read']}>
                  <Layout>
                    <OwnerDataBinaLingkungan />
                  </Layout>
                </ProtectedRoute>
              } />

              {/* Admin/Owner Data Aset Routes */}
              <Route path="/admin/operasional/data-aset" element={
                <ProtectedRoute requiredPermissions={['read']}>
                  <Layout>
                    <AdminDataAset />
                  </Layout>
                </ProtectedRoute>
              } />
              <Route path="/owner/operasional/data-aset" element={
                <ProtectedRoute requiredPermissions={['read']}>
                  <Layout>
                    <OwnerDataAset />
                  </Layout>
                </ProtectedRoute>
              } />
              
                             {/* Alternative Routes for backward compatibility */}
               <Route path="/admin/operasional/aset" element={
                 <ProtectedRoute requiredPermissions={['read']}>
                   <Layout>
                     <AdminDataAset />
                   </Layout>
                 </ProtectedRoute>
               } />
               <Route path="/owner/operasional/aset" element={
                 <ProtectedRoute requiredPermissions={['read']}>
                   <Layout>
                     <OwnerDataAset />
                   </Layout>
                 </ProtectedRoute>
               } />
               
               {/* Data Investor Routes */}
               <Route path="/admin/operasional/investor" element={
                 <ProtectedRoute requiredPermissions={['read']}>
                   <Layout>
                     <AdminDataInvestor />
                   </Layout>
                 </ProtectedRoute>
               } />
               <Route path="/owner/operasional/investor" element={
                 <ProtectedRoute requiredPermissions={['read']}>
                   <Layout>
                     <OwnerDataInvestor />
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
              
              {/* Owner Komplain Routes */}
              <Route path="/owner/operasional/komplain" element={
                <ProtectedRoute requiredPermissions={['read']}>
                  <Layout>
                    <OwnerKomplainList />
                  </Layout>
                </ProtectedRoute>
              } />
              
              <Route path="/owner/operasional/komplain/new" element={
                <ProtectedRoute requiredPermissions={['create']}>
                  <Layout>
                    <OwnerKomplainForm />
                  </Layout>
                </ProtectedRoute>
              } />
              
              <Route path="/owner/operasional/komplain/:id" element={
                <ProtectedRoute requiredPermissions={['read']}>
                  <Layout>
                    <OwnerKomplainDetail />
                  </Layout>
                </ProtectedRoute>
              } />
              
              <Route path="/owner/operasional/komplain/:id/edit" element={
                <ProtectedRoute requiredPermissions={['update']}>
                  <Layout>
                    <OwnerKomplainEdit />
                  </Layout>
                </ProtectedRoute>
              } />

              {/* Owner New Structure Routes */}
              {/* Owner Keuangan Routes */}
              <Route path="/owner/keuangan/poskas" element={
                <ProtectedRoute requiredPermissions={['read']}>
                  <Layout>
                    <OwnerPoskasList />
                  </Layout>
                </ProtectedRoute>
              } />
              
              <Route path="/owner/keuangan/poskas/new" element={
                <ProtectedRoute requiredPermissions={['create']}>
                  <Layout>
                    <OwnerPoskasForm />
                  </Layout>
                </ProtectedRoute>
              } />
              
              <Route path="/owner/keuangan/poskas/:id" element={
                <ProtectedRoute requiredPermissions={['read']}>
                  <Layout>
                    <OwnerPoskasDetail />
                  </Layout>
                </ProtectedRoute>
              } />
              
              <Route path="/owner/keuangan/poskas/:id/edit" element={
                <ProtectedRoute requiredPermissions={['update']}>
                  <Layout>
                    <OwnerPoskasEdit />
                  </Layout>
                </ProtectedRoute>
              } />
              
              <Route path="/owner/keuangan/laporan" element={
                <ProtectedRoute requiredPermissions={['read']}>
                  <Layout>
                    <OwnerLaporanKeuangan />
                  </Layout>
                </ProtectedRoute>
              } />
              
              <Route path="/owner/keuangan/laporan/new" element={
                <ProtectedRoute requiredPermissions={['create']}>
                  <Layout>
                    <OwnerLaporanKeuanganForm />
                  </Layout>
                </ProtectedRoute>
              } />
              
              <Route path="/owner/keuangan/laporan/:id" element={
                <ProtectedRoute requiredPermissions={['read']}>
                  <Layout>
                    <OwnerLaporanKeuanganDetail />
                  </Layout>
                </ProtectedRoute>
              } />
              
              <Route path="/owner/keuangan/laporan/:id/edit" element={
                <ProtectedRoute requiredPermissions={['update']}>
                  <Layout>
                    <OwnerLaporanKeuanganForm />
                  </Layout>
                </ProtectedRoute>
              } />
              
              <Route path="/owner/keuangan/omset-harian" element={
                <ProtectedRoute requiredPermissions={['read']}>
                  <Layout>
                    <OwnerOmsetHarianList />
                  </Layout>
                </ProtectedRoute>
              } />
              
              <Route path="/owner/keuangan/omset-harian/new" element={
                <ProtectedRoute requiredPermissions={['create']}>
                  <Layout>
                    <OwnerOmsetHarianForm />
                  </Layout>
                </ProtectedRoute>
              } />
              
              <Route path="/owner/keuangan/omset-harian/:id" element={
                <ProtectedRoute requiredPermissions={['read']}>
                  <Layout>
                    <OwnerOmsetHarianDetail />
                  </Layout>
                </ProtectedRoute>
              } />
              
              <Route path="/owner/keuangan/omset-harian/:id/edit" element={
                <ProtectedRoute requiredPermissions={['update']}>
                  <Layout>
                    <OwnerOmsetHarianEdit />
                  </Layout>
                </ProtectedRoute>
              } />
              
              {/* Owner Aneka Grafik Routes */}
              <Route path="/owner/keuangan/aneka-grafik" element={
                <ProtectedRoute requiredPermissions={['read']}>
                  <Layout>
                    <OwnerAnekaGrafikList />
                  </Layout>
                </ProtectedRoute>
              } />
              <Route path="/owner/keuangan/surat" element={
                <ProtectedRoute requiredPermissions={['read']}>
                  <Layout>
                    <AnekaSurat />
                  </Layout>
                </ProtectedRoute>
              } />
              
              <Route path="/owner/keuangan/aneka-grafik/new" element={
                <ProtectedRoute requiredPermissions={['create']}>
                  <Layout>
                    <OwnerAnekaGrafikForm />
                  </Layout>
                </ProtectedRoute>
              } />
              
              <Route path="/owner/keuangan/aneka-grafik/:id" element={
                <ProtectedRoute requiredPermissions={['read']}>
                  <Layout>
                    <OwnerAnekaGrafikDetail />
                  </Layout>
                </ProtectedRoute>
              } />
              
              <Route path="/owner/keuangan/aneka-grafik/:id/edit" element={
                <ProtectedRoute requiredPermissions={['update']}>
                  <Layout>
                    <OwnerAnekaGrafikForm />
                  </Layout>
                </ProtectedRoute>
              } />

              {/* Owner Dashboard Aneka Grafik */}
              <Route path="/owner/dashboard/aneka-grafik" element={
                <ProtectedRoute requiredPermissions={['read']}>
                  <Layout>
                    <OwnerAnekaGrafikDashboard />
                  </Layout>
                </ProtectedRoute>
              } />
              
              <Route path="/owner/keuangan/gaji" element={
                <ProtectedRoute requiredPermissions={['read']}>
                  <Layout>
                    <OwnerDaftarGaji />
                  </Layout>
                </ProtectedRoute>
              } />

              {/* Owner Operasional Routes */}
              <Route path="/owner/operasional/aset" element={
                <ProtectedRoute requiredPermissions={['read']}>
                  <Layout>
                    <OwnerDataAset />
                  </Layout>
                </ProtectedRoute>
              } />
              
              <Route path="/owner/operasional/data-supplier" element={
                <ProtectedRoute requiredPermissions={['read']}>
                  <Layout>
                    <OwnerDataSupplier />
                  </Layout>
                </ProtectedRoute>
              } />
              
              <Route path="/owner/operasional/data-supplier/form" element={
                <ProtectedRoute requiredPermissions={['create']}>
                  <Layout>
                    <OwnerDataSupplierForm />
                  </Layout>
                </ProtectedRoute>
              } />
              
              <Route path="/owner/operasional/data-supplier/detail/:id" element={
                <ProtectedRoute requiredPermissions={['read']}>
                  <Layout>
                    <OwnerDataSupplierDetail />
                  </Layout>
                </ProtectedRoute>
              } />
              
              <Route path="/owner/operasional/data-supplier/edit/:id" element={
                <ProtectedRoute requiredPermissions={['update']}>
                  <Layout>
                    <OwnerDataSupplierEdit />
                  </Layout>
                </ProtectedRoute>
              } />

              {/* Owner Marketing Routes */}
              <Route path="/owner/marketing/target" element={
                <ProtectedRoute requiredPermissions={['read']}>
                  <Layout>
                    <OwnerDataTarget />
                  </Layout>
                </ProtectedRoute>
              } />

              {/* Owner SDM Routes */}
              <Route path="/owner/sdm/tim" element={
                <ProtectedRoute requiredPermissions={['read']}>
                  <Layout>
                    <OwnerDataTim />
                  </Layout>
                </ProtectedRoute>
              } />
              
              {/* Owner KPI Routes */}
              <Route path="/owner/sdm/kpi" element={
                <ProtectedRoute requiredPermissions={['read']}>
                  <Layout>
                    <OwnerKPI />
                  </Layout>
                </ProtectedRoute>
              } />
              
              <Route path="/owner/sdm/kpi/new" element={
                <ProtectedRoute requiredPermissions={['create']}>
                  <Layout>
                    <OwnerKPIForm />
                  </Layout>
                </ProtectedRoute>
              } />
              
              <Route path="/owner/sdm/kpi/:id" element={
                <ProtectedRoute requiredPermissions={['read']}>
                  <Layout>
                    <OwnerKPIDetail />
                  </Layout>
                </ProtectedRoute>
              } />
              
              <Route path="/owner/sdm/kpi/:id/edit" element={
                <ProtectedRoute requiredPermissions={['update']}>
                  <Layout>
                    <OwnerKPIEdit />
                  </Layout>
                </ProtectedRoute>
              } />
              
              {/* Owner Tim Merah/Biru Routes */}
              <Route path="/owner/sdm/tim-merah-biru" element={
                <ProtectedRoute requiredPermissions={['read']}>
                  <Layout>
                    <OwnerTimMerahBiruList />
                  </Layout>
                </ProtectedRoute>
              } />
              
              <Route path="/owner/sdm/tim-merah-biru/:id" element={
                <ProtectedRoute requiredPermissions={['read']}>
                  <Layout>
                    <OwnerTimMerahBiruDetail />
                  </Layout>
                </ProtectedRoute>
              } />

              {/* Owner Tim Merah/Biru Individual Routes */}
              <Route path="/owner/sdm/tim/merah" element={
                <ProtectedRoute requiredPermissions={['read']}>
                  <Layout>
                    <OwnerTimMerahBiruList />
                  </Layout>
                </ProtectedRoute>
              } />
              
              <Route path="/owner/sdm/tim/biru" element={
                <ProtectedRoute requiredPermissions={['read']}>
                  <Layout>
                    <OwnerTimMerahBiruList />
                  </Layout>
                </ProtectedRoute>
              } />
              
              <Route path="/owner/sdm/tim/merah/new" element={
                <ProtectedRoute requiredPermissions={['create']}>
                  <Layout>
                    <OwnerTimMerahBiruForm />
                  </Layout>
                </ProtectedRoute>
              } />
              
              <Route path="/owner/sdm/tim/merah/form" element={
                <ProtectedRoute requiredPermissions={['create']}>
                  <Layout>
                    <OwnerTimMerahBiruForm />
                  </Layout>
                </ProtectedRoute>
              } />
              
              <Route path="/owner/sdm/tim/biru/new" element={
                <ProtectedRoute requiredPermissions={['create']}>
                  <Layout>
                    <OwnerTimMerahBiruForm />
                  </Layout>
                </ProtectedRoute>
              } />
              
              <Route path="/owner/sdm/tim/biru/form" element={
                <ProtectedRoute requiredPermissions={['create']}>
                  <Layout>
                    <OwnerTimMerahBiruForm />
                  </Layout>
                </ProtectedRoute>
              } />
              
              <Route path="/owner/sdm/tim/merah/:id/edit" element={
                <ProtectedRoute requiredPermissions={['update']}>
                  <Layout>
                    <OwnerTimMerahBiruEdit />
                  </Layout>
                </ProtectedRoute>
              } />
              
              <Route path="/owner/sdm/tim/merah/:id" element={
                <ProtectedRoute requiredPermissions={['read']}>
                  <Layout>
                    <OwnerTimMerahBiruDetail />
                  </Layout>
                </ProtectedRoute>
              } />
              
              <Route path="/owner/sdm/tim/biru/:id/edit" element={
                <ProtectedRoute requiredPermissions={['update']}>
                  <Layout>
                    <OwnerTimMerahBiruEdit />
                  </Layout>
                </ProtectedRoute>
              } />
              
              <Route path="/owner/sdm/tim/biru/:id" element={
                <ProtectedRoute requiredPermissions={['read']}>
                  <Layout>
                    <OwnerTimMerahBiruDetail />
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

              {/* Owner DaftarTugas Routes - Dihapus karena sudah dipindah ke SDM */}
              {/* <Route path="/owner/daftar-tugas/tim-merah-biru" element={
                <ProtectedRoute requiredPermissions={['read']}>
                  <Layout>
                    <OwnerTimMerahBiruList />
                  </Layout>
                </ProtectedRoute>
              } />
              
              <Route path="/owner/daftar-tugas/tim-merah-biru/:id" element={
                <ProtectedRoute requiredPermissions={['read']}>
                  <Layout>
                    <OwnerTimMerahBiruDetail />
                  </Layout>
                </ProtectedRoute>
              } /> */}

              {/* Tim New Structure Routes */}
              {/* Tim Keuangan Routes */}
              <Route path="/tim/keuangan/poskas/new" element={
                <ProtectedRoute requiredPermissions={['create']}>
                  <Layout>
                    <TimPoskasForm />
                  </Layout>
                </ProtectedRoute>
              } />

              {/* Tim Operasional Routes */}
              <Route path="/tim/operasional/komplain/new" element={
                <ProtectedRoute requiredPermissions={['create']}>
                  <Layout>
                    <TimKomplainForm />
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

              {/* Admin Poskas Routes */}
              <Route path="/admin/keuangan/poskas" element={
                <ProtectedRoute requiredPermissions={['read']}>
                  <Layout>
                    <AdminPoskasList />
                  </Layout>
                </ProtectedRoute>
              } />
              
              <Route path="/admin/keuangan/poskas/new" element={
                <ProtectedRoute requiredPermissions={['create']}>
                  <Layout>
                    <AdminPoskasForm />
                  </Layout>
                </ProtectedRoute>
              } />
              
              <Route path="/admin/keuangan/poskas/:id" element={
                <ProtectedRoute requiredPermissions={['read']}>
                  <Layout>
                    <AdminPoskasDetail />
                  </Layout>
                </ProtectedRoute>
              } />
              
              <Route path="/admin/keuangan/poskas/:id/edit" element={
                <ProtectedRoute requiredPermissions={['update']}>
                  <Layout>
                    <AdminPoskasEdit />
                  </Layout>
                </ProtectedRoute>
              } />

              {/* Admin Omset Harian Routes */}
              <Route path="/admin/keuangan/omset-harian" element={
                <ProtectedRoute requiredPermissions={['read']}>
                  <Layout>
                    <AdminOmsetHarianList />
                  </Layout>
                </ProtectedRoute>
              } />
              
              <Route path="/admin/keuangan/omset-harian/new" element={
                <ProtectedRoute requiredPermissions={['create']}>
                  <Layout>
                    <AdminOmsetHarianForm />
                  </Layout>
                </ProtectedRoute>
              } />
              
              <Route path="/admin/keuangan/omset-harian/:id" element={
                <ProtectedRoute requiredPermissions={['read']}>
                  <Layout>
                    <AdminOmsetHarianDetail />
                  </Layout>
                </ProtectedRoute>
              } />
              
              {/* Admin Aneka Grafik Routes */}
              <Route path="/admin/keuangan/aneka-grafik" element={
                <ProtectedRoute requiredPermissions={['read']}>
                  <Layout>
                    <AdminAnekaGrafikList />
                  </Layout>
                </ProtectedRoute>
              } />
              
              <Route path="/admin/keuangan/aneka-grafik/new" element={
                <ProtectedRoute requiredPermissions={['create']}>
                  <Layout>
                    <AdminAnekaGrafikForm />
                  </Layout>
                </ProtectedRoute>
              } />
              
              <Route path="/admin/keuangan/aneka-grafik/:id" element={
                <ProtectedRoute requiredPermissions={['read']}>
                  <Layout>
                    <AdminAnekaGrafikDetail />
                  </Layout>
                </ProtectedRoute>
              } />
              
              <Route path="/admin/keuangan/aneka-grafik/:id/edit" element={
                <ProtectedRoute requiredPermissions={['update']}>
                  <Layout>
                    <AdminAnekaGrafikForm />
                  </Layout>
                </ProtectedRoute>
              } />

              {/* Admin Dashboard Aneka Grafik */}
              <Route path="/admin/dashboard/aneka-grafik" element={
                <ProtectedRoute requiredPermissions={['read']}>
                  <Layout>
                    <AdminAnekaGrafik />
                  </Layout>
                </ProtectedRoute>
              } />
              
              <Route path="/admin/keuangan/omset-harian/:id/edit" element={
                <ProtectedRoute requiredPermissions={['update']}>
                  <Layout>
                    <AdminOmsetHarianEdit />
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

              {/* Divisi New Structure Routes */}
              {/* Divisi Keuangan Routes */}
              <Route path="/divisi/keuangan/poskas" element={
                <ProtectedRoute requiredPermissions={['read']}>
                  <Layout>
                    <DivisiPoskasList />
                  </Layout>
                </ProtectedRoute>
              } />

              {/* 404 Route */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </MenuProvider>
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