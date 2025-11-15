import React from 'react'
import { BrowserRouter, Routes, Route, Navigate, useLocation, useParams } from 'react-router-dom'
import { Toaster, toast } from 'react-hot-toast'

import { AuthProvider, useAuth } from './contexts/AuthContext'
import { MenuProvider, useMenu } from './contexts/MenuContext'
import ErrorBoundary from './components/ErrorBoundary'
import Layout from './components/Layout/Layout'
import RequireMenuKey from './components/RouteGuards/RequireMenuKey'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import AdminDashboard from './pages/Admin/Dashboard/AdminDashboard'
import AdminVideoLibrary from './pages/Admin/Dashboard/AdminVideoLibrary'
import OwnerDashboard from './pages/Owner/Dashboard/OwnerDashboard'
import NotFound from './pages/NotFound'
import KebijakanPrivasi from './pages/KebijakanPrivasi'

// Chat pages dihapus untuk seluruh role

// Komplain Pages
import KomplainList from './pages/Komplain/KomplainList'
import KomplainDetail from './pages/Komplain/KomplainDetail'
import KomplainForm from './pages/Komplain/KomplainForm'
import AdminKomplainList from './pages/Admin/Komplain/AdminKomplainList'
import AdminKomplainDetail from './pages/Admin/Komplain/AdminKomplainDetail'
import AdminKomplainForm from './pages/Admin/Komplain/AdminKomplainForm'
import AdminKomplainEdit from './pages/Admin/Komplain/AdminKomplainEdit'
import AdminDaftarKomplain from './pages/Admin/Operasional/DaftarKomplain/AdminDaftarKomplain'
import AdminDaftarKomplainForm from './pages/Admin/Operasional/DaftarKomplain/AdminDaftarKomplainForm'

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
import OwnerMedsos from './pages/Owner/Marketing/Medsos/OwnerMedsos'
import OwnerMedsosForm from './pages/Owner/Marketing/Medsos/OwnerMedsosForm'
import OwnerMedsosDetail from './pages/Owner/Marketing/Medsos/OwnerMedsosDetail'
import OwnerMedsosEdit from './pages/Owner/Marketing/Medsos/OwnerMedsosEdit'
import OwnerTargetHarianList from './pages/Owner/Marketing/TargetHarian/OwnerTargetHarianList'
import OwnerTargetHarianForm from './pages/Owner/Marketing/TargetHarian/OwnerTargetHarianForm'
import OwnerTargetHarianDetail from './pages/Owner/Marketing/TargetHarian/OwnerTargetHarianDetail'
import OwnerTargetHarianEdit from './pages/Owner/Marketing/TargetHarian/OwnerTargetHarianEdit'
import OwnerDataTim from './pages/Owner/SDM/manage/OwnerDataTim'
import OwnerTimMerahBiruList from './pages/Owner/SDM/TimMerahBiru/OwnerTimMerahBiruList'
import OwnerTimMerahBiruDetail from './pages/Owner/SDM/TimMerahBiru/OwnerTimMerahBiruDetail'
import OwnerTimMerahBiruForm from './pages/Owner/SDM/TimMerahBiru/OwnerTimMerahBiruForm'
import OwnerTimMerahBiruEdit from './pages/Owner/SDM/TimMerahBiru/OwnerTimMerahBiruEdit'
// SDM SOP & Aturan Pages
import OwnerSopAturan from './pages/Owner/SDM/SopAturan/OwnerSopAturan'
import AdminAturan from './pages/Admin/SDM/SopAturan/AdminSopAturan'
import DivisiSopAturan from './pages/Divisi/SDM/SopAturan/DivisiSopAturan'
import TimSopAturan from './pages/Tim/SDM/SopAturan/TimSopAturan'

// Owner KPI Pages
import OwnerKPI from './pages/Owner/SDM/KPI/OwnerKPI'
import OwnerKPIList from './pages/Owner/SDM/KPI/OwnerKPIList'
import OwnerKPIDetail from './pages/Owner/SDM/KPI/OwnerKPIDetail'
import OwnerKPIForm from './pages/Owner/SDM/KPI/OwnerKPIForm'
import OwnerKPIEdit from './pages/Owner/SDM/KPI/OwnerKPIEdit'

// Leader Pages
import LeaderJobdeskSaya from './pages/Leader/Jobdesk/LeaderJobdeskSaya'
import LeaderStrukturJobdesk from './pages/Leader/Jobdesk/LeaderStrukturJobdesk'
import LeaderSOPAturan from './pages/Leader/SOPAturan/LeaderSOPAturan'
import LeaderSaranList from './pages/Leader/Saran/LeaderSaranList'
import LeaderKPI from './pages/Leader/KPI/LeaderKPI'
import LeaderKPISaya from './pages/Leader/KPI/LeaderKPISaya'
import LeaderKPITim from './pages/Leader/KPI/LeaderKPITim'
import LeaderTimMerahBiru from './pages/Leader/Tim/LeaderTimMerahBiru'
import LeaderProfile from './pages/Leader/Profile/LeaderProfile'
import LeaderSlipGajiSaya from './pages/Leader/SlipGaji/LeaderSlipGajiSaya'
import LeaderDaftarPengajuan from './pages/Leader/Pengajuan/LeaderDaftarPengajuan'
import LeaderTugasSaya from './pages/Leader/Tugas/LeaderTugasSaya'
// Removed placeholder; now using real page from pages/Leader/SlipGaji/LeaderSlipGajiSaya.jsx

// Owner Management Pages
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
import AdminAnekaSurat from './pages/Admin/Keuangan/AnekaSurat/AdminAnekaSurat'
// Admin Daftar Gaji Pages
import AdminDaftarGaji from './pages/Admin/Keuangan/DaftarGaji/AdminDaftarGaji'
import AdminDaftarGajiForm from './pages/Admin/Keuangan/DaftarGaji/AdminDaftarGajiForm'
import AdminDaftarGajiDetail from './pages/Admin/Keuangan/DaftarGaji/AdminDaftarGajiDetail'
import AdminDaftarGajiEdit from './pages/Admin/Keuangan/DaftarGaji/AdminDaftarGajiEdit'

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
import AdminDataInvestorForm from './pages/Admin/Operasional/DataInvestor/AdminDataInvestorForm'
import AdminDataInvestorDetail from './pages/Admin/Operasional/DataInvestor/AdminDataInvestorDetail'
import AdminDataInvestorEdit from './pages/Admin/Operasional/DataInvestor/AdminDataInvestorEdit'
import AdminJadwalPembayaran from './pages/Admin/Operasional/JadwalPembayaran/AdminJadwalPembayaran'
// Admin Data Sewa Pages
import AdminDataSewa from './pages/Admin/Operasional/DataSewa/AdminDataSewa'
import AdminDataSewaForm from './pages/Admin/Operasional/DataSewa/AdminDataSewaForm'
import AdminDataSewaDetail from './pages/Admin/Operasional/DataSewa/AdminDataSewaDetail'
import AdminDataSewaEdit from './pages/Admin/Operasional/DataSewa/AdminDataSewaEdit'

// Admin SDM Pages
import AdminDataTim from './pages/Admin/SDM/manage/AdminDataTim'
import AdminTimMerahBiru from './pages/Admin/SDM/TimMerahBiru/AdminTimMerahBiru'
import AdminTimMerahBiruList from './pages/Admin/SDM/TimMerahBiru/AdminTimMerahBiruList'
import AdminTimMerahBiruDetail from './pages/Admin/SDM/TimMerahBiru/AdminTimMerahBiruDetail'
import AdminDataTimDetail from './pages/Admin/SDM/manage/AdminDataTimDetail'
import AdminDataTimForm from './pages/Admin/SDM/manage/AdminDataTimForm'
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
import OwnerJadwalPembayaran from './pages/Owner/Operasional/JadwalPembayaran/OwnerJadwalPembayaran'
import OwnerDataSewaList from './pages/Owner/Operasional/DataSewa/OwnerDataSewaList'
import OwnerDataSewaDetail from './pages/Owner/Operasional/DataSewa/OwnerDataSewaDetail'
import OwnerDaftarSaran from './pages/Owner/Operasional/DaftarSaran/OwnerDaftarSaran'
import AdminDaftarSaran from './pages/Admin/Operasional/DaftarSaran/AdminDaftarSaran'
import DivisiDaftarSaran from './pages/Divisi/Operasional/DaftarSaran/DivisiDaftarSaran'
import TimDaftarSaran from './pages/Tim/Operasional/DaftarSaran/TimDaftarSaran'

// Owner Komplain Pages
import OwnerKomplainList from './pages/Owner/Operasional/Komplain/OwnerKomplainList'
import OwnerKomplainDetail from './pages/Owner/Operasional/Komplain/OwnerKomplainDetail'
import OwnerKomplainForm from './pages/Owner/Operasional/Komplain/OwnerKomplainForm'
import OwnerKomplainEdit from './pages/Owner/Operasional/Komplain/OwnerKomplainEdit'
import OwnerDaftarKomplain from './pages/Owner/Operasional/DaftarKomplain/OwnerDaftarKomplain'
import OwnerDaftarPengajuan from './pages/Owner/Operasional/Pengajuan/OwnerDaftarPengajuan'
import OwnerDaftarKomplainForm from './pages/Owner/Operasional/DaftarKomplain/OwnerDaftarKomplainForm'

// Admin Data Target
import AdminDataTarget from './pages/Admin/Marketing/DataTarget/AdminDataTarget'
import AdminDataTargetForm from './pages/Admin/Marketing/DataTarget/AdminDataTargetForm'
import AdminDataTargetDetail from './pages/Admin/Marketing/DataTarget/AdminDataTargetDetail'
import AdminDataTargetEdit from './pages/Admin/Marketing/DataTarget/AdminDataTargetEdit'
import AdminTargetHarianList from './pages/Admin/Marketing/TargetHarian/AdminTargetHarianList'
import AdminTargetHarianDetail from './pages/Admin/Marketing/TargetHarian/AdminTargetHarianDetail'
import AdminTargetHarianForm from './pages/Admin/Marketing/TargetHarian/AdminTargetHarianForm'
import AdminTargetHarianEdit from './pages/Admin/Marketing/TargetHarian/AdminTargetHarianEdit'

// Admin Medsos Pages (use Medsos subfolder to match Owner features)
import AdminMedsos from './pages/Admin/Marketing/Medsos/AdminMedsos'
import AdminMedsosForm from './pages/Admin/Marketing/Medsos/AdminMedsosForm'
import AdminMedsosDetail from './pages/Admin/Marketing/Medsos/AdminMedsosDetail'
import AdminMedsosEdit from './pages/Admin/Marketing/Medsos/AdminMedsosEdit'
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
import OwnerAnekaSuratList from './pages/Owner/Keuangan/AnekaSurat/OwnerAnekaSuratList'
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
// Help Center Page
import HelpCenter from './pages/Help/HelpCenter'
import ContactSupport from './pages/Help/ContactSupport'

// Settings Pages
import Settings from './pages/Settings/Settings'
import OwnerSettingsKelolaAkun from './pages/Settings/KelolaAkun/OwnerSettingsKelolaAkun'

// Login Wrapper Component
const LoginWrapper = () => {
  const { isAuthenticated, loading, user } = useAuth()
  
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
    const defaultPath = user?.role === 'owner' ? '/owner/dashboard'
      : user?.role === 'admin' ? '/admin/dashboard'
      : user?.role === 'leader' ? '/leader/dashboard'
      : '/dashboard'
    return <Navigate to={defaultPath} replace />
  }
  
  return <Login />
}

// Helper untuk redirect dinamis dengan parameter URL (mis. :id)
const ParamRedirect = ({ buildTo }) => {
  const params = useParams()
  const id = params?.id
  const to = typeof buildTo === 'function' ? buildTo(id, params) : '/'
  return <Navigate to={to} replace />
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

// Modal-aware Routes Wrapper for background routes
const ModalSwitch = () => {
  const location = useLocation()
  const state = location.state
  const backgroundLocation = state && state.backgroundLocation

  return (
    <ErrorBoundary>
      <AuthProvider>
        <MenuProvider>
          {/* Main routes. If a modal is open, render the background location here */}
          <Routes location={backgroundLocation || location}>
              {/* Public Routes */}
              <Route path="/login" element={<LoginWrapper />} />
              <Route path="/k&p" element={<KebijakanPrivasi />} />
              <Route path="/K&P" element={<KebijakanPrivasi />} />
              <Route path="/kebijakan-privasi" element={<KebijakanPrivasi />} />
              
              {/* Protected Routes */}
              <Route path="/" element={
                <ProtectedRoute>
                  <Layout>
                    <Dashboard />
                  </Layout>
                </ProtectedRoute>
              } />

              {/* Owner Operasional - Jadwal Pembayaran/Perawatan */}
              <Route path="/owner/operasional/jadwal-pembayaran" element={
                <ProtectedRoute requiredPermissions={['read']}>
                  <Layout>
                    <OwnerJadwalPembayaran />
                  </Layout>
                </ProtectedRoute>
              } />
              <Route path="/owner/pengajuan" element={
                <ProtectedRoute requiredPermissions={['read']}>
                  <Layout>
                    <OwnerDaftarPengajuan />
                  </Layout>
                </ProtectedRoute>
              } />
              <Route path="/owner/operasional/sewa" element={
                <ProtectedRoute requiredPermissions={['read']}>
                  <Layout>
                    <OwnerDataSewaList />
                  </Layout>
                </ProtectedRoute>
              } />
              <Route path="/owner/operasional/sewa/:id" element={
                <ProtectedRoute requiredPermissions={['read']}>
                  <Layout>
                    <OwnerDataSewaDetail />
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

              {/* Help Center */}
              <Route path="/help-center" element={
                <ProtectedRoute>
                  <Layout>
                    <HelpCenter />
                  </Layout>
                </ProtectedRoute>
              } />

              {/* Contact Support */}
              <Route path="/contact-support" element={
                <ProtectedRoute>
                  <Layout>
                    <ContactSupport />
                  </Layout>
                </ProtectedRoute>
              } />

              {/* Role-specific Dashboards */}
              <Route path="/admin/dashboard" element={
                <ProtectedRoute>
                  <Layout>
                    <AdminDashboard />
                  </Layout>
                </ProtectedRoute>
              } />

              {/* Admin Video Library */}
              <Route path="/admin/video-library" element={
                <ProtectedRoute>
                  <Layout>
                    <AdminVideoLibrary />
                  </Layout>
                </ProtectedRoute>
              } />

              <Route path="/owner/dashboard" element={
                <ProtectedRoute>
                  <Layout>
                    <OwnerDashboard />
                  </Layout>
                </ProtectedRoute>
              } />

              {/* Leader Dashboard route */}
              <Route path="/leader/dashboard" element={
                <ProtectedRoute>
                  <Layout>
                    <Dashboard />
                  </Layout>
                </ProtectedRoute>
              } />

              {/* Leader Routes */}
              <Route path="/leader/sdm/struktur-jobdesk" element={
                <ProtectedRoute requiredPermissions={['read']}>
                  <Layout>
                    <LeaderStrukturJobdesk />
                  </Layout>
                </ProtectedRoute>
              } />
              <Route path="/leader/sdm/jobdesk-saya" element={
                <ProtectedRoute requiredPermissions={['read']}>
                  <Layout>
                    <LeaderJobdeskSaya />
                  </Layout>
                </ProtectedRoute>
              } />
              <Route path="/leader/sdm/sop-aturan" element={
                <ProtectedRoute requiredPermissions={['read']}>
                  <Layout>
                    <LeaderSOPAturan />
                  </Layout>
                </ProtectedRoute>
              } />
              <Route path="/leader/sdm/saran" element={
                <ProtectedRoute requiredPermissions={['read']}>
                  <Layout>
                    <LeaderSaranList />
                  </Layout>
                </ProtectedRoute>
              } />
              <Route path="/leader/sdm/kpi" element={
                <ProtectedRoute requiredPermissions={['read']}>
                  <Layout>
                    <LeaderKPI />
                  </Layout>
                </ProtectedRoute>
              } />
              <Route path="/leader/sdm/kpi-saya" element={
                <ProtectedRoute requiredPermissions={['read']}>
                  <Layout>
                    <LeaderKPISaya />
                  </Layout>
                </ProtectedRoute>
              } />
              <Route path="/leader/sdm/kpi-tim" element={
                <ProtectedRoute requiredPermissions={['read']}>
                  <Layout>
                    <LeaderKPITim />
                  </Layout>
                </ProtectedRoute>
              } />
              {/* Admin - SOP TERKAIT (gunakan komponen Leader untuk konsumsi endpoint /api/sop/user-divisi) */}
              <Route path="/admin/sop-terkait" element={
                <ProtectedRoute requiredPermissions={['read']}>
                  <Layout>
                    <LeaderSOPAturan />
                  </Layout>
                </ProtectedRoute>
              } />
              {/* Admin - ATURAN */}
              <Route path="/admin/aturan" element={
                <ProtectedRoute requiredPermissions={['read']}>
                  <RequireMenuKey requiredKey="AdminAturan">
                    <Layout>
                      <AdminAturan />
                    </Layout>
                  </RequireMenuKey>
                </ProtectedRoute>
              } />
              {/* Admin - KPI SAYA (reuse komponen LeaderKPISaya) */}
              <Route path="/admin/kpi-saya" element={
                <ProtectedRoute requiredPermissions={['read']}>
                  <Layout>
                    <LeaderKPISaya />
                  </Layout>
                </ProtectedRoute>
              } />
              {/* Admin - SLIP GAJI SAYA (reuse komponen LeaderSlipGajiSaya) */}
              <Route path="/admin/slip-gaji-saya" element={
                <ProtectedRoute requiredPermissions={['read']}>
                  <Layout>
                    <LeaderSlipGajiSaya />
                  </Layout>
                </ProtectedRoute>
              } />
              {/* Admin - TUGAS SAYA (gunakan komponen Leader untuk konsumsi endpoint leader) */}
              <Route path="/admin/tugas-saya" element={
                <ProtectedRoute requiredPermissions={['read']}>
                  <Layout>
                    <LeaderTugasSaya />
                  </Layout>
                </ProtectedRoute>
              } />
              <Route path="/leader/tugas-saya" element={
                <ProtectedRoute requiredPermissions={['read']}>
                  <Layout>
                    <LeaderTugasSaya />
                  </Layout>
                </ProtectedRoute>
              } />
              <Route path="/leader/pengajuan" element={
                <ProtectedRoute requiredPermissions={['read']}>
                  <Layout>
                    <LeaderDaftarPengajuan />
                  </Layout>
                </ProtectedRoute>
              } />

              {/* Admin Pengajuan (reuse OwnerDaftarPengajuan for now) */}
              <Route path="/admin/pengajuan" element={
                <ProtectedRoute requiredPermissions={['read']}>
                  <Layout>
                    <OwnerDaftarPengajuan />
                  </Layout>
                </ProtectedRoute>
              } />
              <Route path="/leader/slip-gaji-saya" element={
                <ProtectedRoute requiredPermissions={['read']}>
                  <Layout>
                    <LeaderSlipGajiSaya />
                  </Layout>
                </ProtectedRoute>
              } />
              <Route path="/leader/tugas/tim" element={
                <ProtectedRoute requiredPermissions={['read']}>
                  <Layout>
                    <LeaderTimMerahBiru />
                  </Layout>
                </ProtectedRoute>
              } />
              <Route path="/leader/profile" element={
                <ProtectedRoute requiredPermissions={['read']}>
                  <Layout>
                    <LeaderProfile />
                  </Layout>
                </ProtectedRoute>
              } />

              {/* Chat routes dihapus */}
            <Route path="/owner/pic-menu" element={
              <ProtectedRoute requiredPermissions={['read']}>
                <Layout>
                  <PicMenuManagement />
                </Layout>
              </ProtectedRoute>
            } />
            {/* Backward compatibility: redirect old path to new */}
            <Route path="/owner/pic-menu-management" element={<Navigate to="/owner/pic-menu" replace />} />
              
              {/* Owner chat routes dihapus */}

              {/* Owner Settings - Kelola Akun */}
              <Route path="/owner/settings/kelola-akun" element={
                <ProtectedRoute>
                  <Layout>
                    <OwnerSettingsKelolaAkun />
                  </Layout>
                </ProtectedRoute>
              } />

              {/* Owner Operasional - Saran */}
              <Route path="/owner/operasional/saran" element={
                <ProtectedRoute requiredPermissions={['read']}>
                  <Layout>
                    <OwnerDaftarSaran />
                  </Layout>
                </ProtectedRoute>
              } />

              {/* Admin Saran - path baru */}
              {/* Redirect dari path lama */}
              <Route path="/admin/operasional/saran" element={<Navigate to="/admin/saran" replace />} />
              <Route path="/admin/saran" element={
                <ProtectedRoute requiredPermissions={['read']}>
                  <RequireMenuKey requiredKey="AdminDaftarSaran">
                    <Layout>
                      <AdminDaftarSaran />
                    </Layout>
                  </RequireMenuKey>
                </ProtectedRoute>
              } />

              {/* Admin Operasional - Jadwal Pembayaran/Perawatan */}
              <Route path="/admin/operasional/jadwal-pembayaran" element={
                <ProtectedRoute requiredPermissions={['read']}>
                  <RequireMenuKey requiredKey="AdminJadwalPembayaran">
                    <Layout>
                      <AdminJadwalPembayaran />
                    </Layout>
                  </RequireMenuKey>
                </ProtectedRoute>
              } />

              {/* Admin Keuangan - Daftar Gaji */}
              <Route path="/admin/keuangan/daftar-gaji" element={
                <ProtectedRoute requiredPermissions={['read']}>
                  <Layout>
                    <AdminDaftarGaji />
                  </Layout>
                </ProtectedRoute>
              } />
              <Route path="/admin/keuangan/daftar-gaji/new" element={
                <ProtectedRoute requiredPermissions={['create']}>
                  <Layout>
                    <AdminDaftarGajiForm />
                  </Layout>
                </ProtectedRoute>
              } />
              {/* Alias */}
              <Route path="/admin/keuangan/gaji" element={<Navigate to="/admin/keuangan/daftar-gaji" replace />} />

              {/* Admin Operasional - Data Target (dipindah dari marketing) */}
              <Route path="/admin/operasional/data-target" element={
                <ProtectedRoute requiredPermissions={['read']}>
                  <RequireMenuKey requiredKey="AdminDataTarget">
                    <Layout>
                      <AdminDataTarget />
                    </Layout>
                  </RequireMenuKey>
                </ProtectedRoute>
              } />
              <Route path="/admin/operasional/data-target/new" element={
                <ProtectedRoute requiredPermissions={['create']}>
                  <Layout>
                    <AdminDataTargetForm />
                  </Layout>
                </ProtectedRoute>
              } />
              <Route path="/admin/operasional/data-target/:id" element={
                <ProtectedRoute requiredPermissions={['read']}>
                  <Layout>
                    <AdminDataTargetDetail />
                  </Layout>
                </ProtectedRoute>
              } />
              <Route path="/admin/operasional/data-target/:id/edit" element={
                <ProtectedRoute requiredPermissions={['update']}>
                  <Layout>
                    <AdminDataTargetEdit />
                  </Layout>
                </ProtectedRoute>
              } />

              {/* Backward compatibility redirects */}
              {/* Redirect old marketing paths to new operasional paths */}
              <Route path="/admin/marketing/data-target" element={<Navigate to="/admin/operasional/data-target" replace />} />
              <Route path="/admin/marketing/data-target/new" element={<Navigate to="/admin/operasional/data-target/new" replace />} />
              <Route path="/admin/marketing/data-target/:id" element={<ParamRedirect buildTo={(id)=>`/admin/operasional/data-target/${id}`} />} />
              <Route path="/admin/marketing/data-target/:id/edit" element={<ParamRedirect buildTo={(id)=>`/admin/operasional/data-target/${id}/edit`} />} />
              <Route path="/admin/marketing/target" element={<Navigate to="/admin/operasional/data-target" replace />} />
              <Route path="/admin/marketing/target/new" element={<Navigate to="/admin/operasional/data-target/new" replace />} />
              <Route path="/admin/marketing/target/:id" element={<ParamRedirect buildTo={(id)=>`/admin/operasional/data-target/${id}`} />} />
              <Route path="/admin/marketing/target/:id/edit" element={<ParamRedirect buildTo={(id)=>`/admin/operasional/data-target/${id}/edit`} />} />
              <Route path="/admin/marketing/target-harian" element={<Navigate to="/admin/operasional/data-target" replace />} />
              <Route path="/admin/marketing/target-harian/new" element={<Navigate to="/admin/operasional/data-target/new" replace />} />
              <Route path="/admin/marketing/target-harian/:id" element={<ParamRedirect buildTo={(id)=>`/admin/operasional/data-target/${id}`} />} />
              <Route path="/admin/marketing/target-harian/:id/edit" element={<ParamRedirect buildTo={(id)=>`/admin/operasional/data-target/${id}/edit`} />} />

              {/* Divisi Operasional - Saran */}
              <Route path="/divisi/operasional/saran" element={
                <ProtectedRoute requiredPermissions={['read']}>
                  <Layout>
                    <DivisiDaftarSaran />
                  </Layout>
                </ProtectedRoute>
              } />

              {/* Tim Operasional - Saran */}
              <Route path="/tim/operasional/saran" element={
                <ProtectedRoute requiredPermissions={['read']}>
                  <Layout>
                    <TimDaftarSaran />
                  </Layout>
                </ProtectedRoute>
              } />

              {/* Owner Marketing Routes */}
              <Route path="/owner/marketing/medsos" element={
                <ProtectedRoute requiredPermissions={['read']}>
                  <Layout>
                    <OwnerMedsos />
                  </Layout>
                </ProtectedRoute>
              } />
              <Route path="/owner/marketing/data-target" element={
                <ProtectedRoute requiredPermissions={['read']}>
                  <Layout>
                    <OwnerTargetHarianList />
                  </Layout>
                </ProtectedRoute>
              } />
              <Route path="/owner/marketing/data-target/new" element={
                <ProtectedRoute requiredPermissions={['create']}>
                  <Layout>
                    <OwnerTargetHarianForm />
                  </Layout>
                </ProtectedRoute>
              } />
              <Route path="/owner/marketing/data-target/:id" element={
                <ProtectedRoute requiredPermissions={['read']}>
                  <Layout>
                    <OwnerTargetHarianDetail />
                  </Layout>
                </ProtectedRoute>
              } />
              <Route path="/owner/marketing/data-target/:id/edit" element={
                <ProtectedRoute requiredPermissions={['update']}>
                  <Layout>
                    <OwnerTargetHarianEdit />
                  </Layout>
                </ProtectedRoute>
              } />
              {/* Backward compatibility: redirect old paths to new */}
              <Route path="/owner/marketing/target-harian" element={<Navigate to="/owner/marketing/data-target" replace />} />
              <Route path="/owner/marketing/target-harian/new" element={<Navigate to="/owner/marketing/data-target/new" replace />} />
              <Route path="/owner/marketing/target-harian/:id" element={<Navigate to="/owner/marketing/data-target/:id" replace />} />
              <Route path="/owner/marketing/target-harian/:id/edit" element={<Navigate to="/owner/marketing/data-target/:id/edit" replace />} />
              <Route path="/owner/marketing/medsos/new" element={
                <ProtectedRoute requiredPermissions={['create']}>
                  <Layout>
                    <OwnerMedsosForm />
                  </Layout>
                </ProtectedRoute>
              } />
              <Route path="/owner/marketing/medsos/:id" element={
                <ProtectedRoute requiredPermissions={['read']}>
                  <Layout>
                    <OwnerMedsosDetail />
                  </Layout>
                </ProtectedRoute>
              } />
              <Route path="/owner/marketing/medsos/:id/edit" element={
                <ProtectedRoute requiredPermissions={['update']}>
                  <Layout>
                    <OwnerMedsosEdit />
                  </Layout>
                </ProtectedRoute>
              } />

              {/* Divisi Chat Routes dihapus */}

              {/* Divisi SDM Routes */}
              {/* Backward compatibility: redirect old path to new */}
              <Route path="/divisi/sdm/struktur" element={<Navigate to="/divisi/sdm/struktur-jobdesk" replace />} />
              <Route path="/divisi/sdm/struktur-jobdesk-sop" element={<Navigate to="/divisi/sdm/struktur-jobdesk" replace />} />

              <Route path="/divisi/sdm/struktur-jobdesk" element={
                <ProtectedRoute requiredPermissions={['read']}>
                  <Layout>
                    <StrukturJobdeskSOP />
                  </Layout>
                </ProtectedRoute>
              } />

              {/* SDM - S.O.P dan Aturan */}
              <Route path="/owner/sdm/sop-aturan" element={
                <ProtectedRoute requiredPermissions={['read']}>
                  <Layout>
                    <OwnerSopAturan />
                  </Layout>
                </ProtectedRoute>
              } />
              <Route path="/admin/sdm/sop-aturan" element={
                <ProtectedRoute requiredPermissions={['read']}>
                  <Layout>
                    <AdminAturan />
                  </Layout>
                </ProtectedRoute>
              } />
              <Route path="/divisi/sdm/sop-aturan" element={
                <ProtectedRoute requiredPermissions={['read']}>
                  <Layout>
                    <DivisiSopAturan />
                  </Layout>
                </ProtectedRoute>
              } />
              <Route path="/tim/sdm/sop-aturan" element={
                <ProtectedRoute requiredPermissions={['read']}>
                  <Layout>
                    <TimSopAturan />
                  </Layout>
                </ProtectedRoute>
              } />

              {/* Tim Chat Routes dihapus */}

              {/* Tim SDM Routes */}
              {/* Backward compatibility: redirect old path to new */}
              <Route path="/tim/sdm/struktur" element={<Navigate to="/tim/sdm/struktur-jobdesk" replace />} />
              <Route path="/tim/sdm/struktur-jobdesk-sop" element={<Navigate to="/tim/sdm/struktur-jobdesk" replace />} />

              <Route path="/tim/sdm/struktur-jobdesk" element={
                <ProtectedRoute requiredPermissions={['read']}>
                  <Layout>
                    <StrukturJobdeskSOP />
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


              {/* Admin Operasional Komplain Routes (new namespace) */}
              <Route path="/admin/operasional/komplain" element={<Navigate to="/admin/komplain" replace />} />
              <Route path="/admin/operasional/komplain/new" element={<Navigate to="/admin/komplain/new" replace />} />
              <Route path="/admin/operasional/komplain/:id" element={<Navigate to="/admin/komplain/:id" replace />} />
              <Route path="/admin/operasional/komplain/:id/edit" element={<Navigate to="/admin/komplain/:id/edit" replace />} />

              <Route path="/admin/komplain" element={
                <ProtectedRoute requiredPermissions={['read']}>
                  <RequireMenuKey requiredKey="AdminDaftarKomplain">
                    <Layout>
                      <AdminDaftarKomplain />
                    </Layout>
                  </RequireMenuKey>
                </ProtectedRoute>
              } />
              <Route path="/admin/komplain/new" element={
                <ProtectedRoute requiredPermissions={['create']}>
                  <RequireMenuKey requiredKey="AdminDaftarKomplain">
                    <Layout>
                      <AdminDaftarKomplainForm />
                    </Layout>
                  </RequireMenuKey>
                </ProtectedRoute>
              } />
              <Route path="/admin/komplain/:id" element={
                <ProtectedRoute requiredPermissions={['read']}>
                  <RequireMenuKey requiredKey="AdminDaftarKomplain">
                    <Layout>
                      <AdminKomplainDetail />
                    </Layout>
                  </RequireMenuKey>
                </ProtectedRoute>
              } />
              <Route path="/admin/komplain/:id/edit" element={
                <ProtectedRoute requiredPermissions={['update']}>
                  <RequireMenuKey requiredKey="AdminDaftarKomplain">
                    <Layout>
                      <AdminKomplainEdit />
                    </Layout>
                  </RequireMenuKey>
                </ProtectedRoute>
              } />

              {/* Admin New Structure Routes */}
              {/* Admin Keuangan Routes */}
              <Route path="/admin/keuangan/laporan" element={
                <ProtectedRoute requiredPermissions={['read']}>
                  <RequireMenuKey requiredKey="AdminLaporanKeuangan">
                    <Layout>
                      <AdminLaporanKeuangan />
                    </Layout>
                  </RequireMenuKey>
                </ProtectedRoute>
              } />
              <Route path="/admin/keuangan/surat" element={
                <ProtectedRoute requiredPermissions={['read']}>
                  <RequireMenuKey requiredKey="AdminAnekaSurat">
                    <Layout>
                      <AdminAnekaSurat />
                    </Layout>
                  </RequireMenuKey>
                </ProtectedRoute>
              } />
              {/* Lain-Lain alias */}
              <Route path="/admin/lain-lain/surat" element={
                <ProtectedRoute requiredPermissions={['read']}>
                  <RequireMenuKey requiredKey="AdminAnekaSurat">
                    <Layout>
                      <AdminAnekaSurat />
                    </Layout>
                  </RequireMenuKey>
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
                  <RequireMenuKey requiredKey="AdminDataSupplier">
                    <Layout>
                      <AdminDataSupplier />
                    </Layout>
                  </RequireMenuKey>
                </ProtectedRoute>
              } />

              {/* Admin Lain-Lain Routes (alias baru untuk operasional items) */}
              <Route path="/admin/lain-lain/data-supplier" element={
                <ProtectedRoute requiredPermissions={['read']}>
                  <RequireMenuKey requiredKey="AdminDataSupplier">
                    <Layout>
                      <AdminDataSupplier />
                    </Layout>
                  </RequireMenuKey>
                </ProtectedRoute>
              } />
              
              {/* Admin Operasional - Data Sewa */}
              <Route path="/admin/operasional/sewa" element={
                <ProtectedRoute requiredPermissions={['read']}>
                  <RequireMenuKey requiredKey="AdminDataSewa">
                    <Layout>
                      <AdminDataSewa />
                    </Layout>
                  </RequireMenuKey>
                </ProtectedRoute>
              } />
              {/* Lain-Lain alias */}
              <Route path="/admin/lain-lain/sewa" element={
                <ProtectedRoute requiredPermissions={['read']}>
                  <RequireMenuKey requiredKey="AdminDataSewa">
                    <Layout>
                      <AdminDataSewa />
                    </Layout>
                  </RequireMenuKey>
                </ProtectedRoute>
              } />
              <Route path="/admin/operasional/sewa/new" element={
                <ProtectedRoute requiredPermissions={['create']}>
                  <Layout>
                    <AdminDataSewaForm />
                  </Layout>
                </ProtectedRoute>
              } />
              <Route path="/admin/operasional/sewa/:id" element={
                <ProtectedRoute requiredPermissions={['read']}>
                  <Layout>
                    <AdminDataSewaDetail />
                  </Layout>
                </ProtectedRoute>
              } />
              <Route path="/admin/operasional/sewa/:id/edit" element={
                <ProtectedRoute requiredPermissions={['update']}>
                  <Layout>
                    <AdminDataSewaEdit />
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
              
              {/* Keep the standalone form route for direct navigation (non-modal) */}
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
                  <RequireMenuKey requiredKey="AdminDataBinaLingkungan">
                    <Layout>
                      <AdminDataBinaLingkungan />
                    </Layout>
                  </RequireMenuKey>
                </ProtectedRoute>
              } />
              {/* Lain-Lain alias */}
              <Route path="/admin/lain-lain/bina-lingkungan" element={
                <ProtectedRoute requiredPermissions={['read']}>
                  <RequireMenuKey requiredKey="AdminDataBinaLingkungan">
                    <Layout>
                      <AdminDataBinaLingkungan />
                    </Layout>
                  </RequireMenuKey>
                </ProtectedRoute>
              } />

              {/* Admin Marketing Routes */}
              <Route path="/admin/marketing/target" element={
                <ProtectedRoute requiredPermissions={['read']}>
                  <Layout>
                    <AdminTargetHarianList />
                  </Layout>
                </ProtectedRoute>
              } />
              
              
              
              
              
              <Route path="/admin/marketing/medsos" element={
                <ProtectedRoute requiredPermissions={['read']}>
                  <RequireMenuKey requiredKey="AdminMarketingMedsos">
                    <Layout>
                      <AdminMedsos />
                    </Layout>
                  </RequireMenuKey>
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
              
              <Route path="/admin/marketing/medsos/:id" element={
                <ProtectedRoute requiredPermissions={['read']}>
                  <Layout>
                    <AdminMedsosDetail />
                  </Layout>
                </ProtectedRoute>
              } />
              
              <Route path="/admin/marketing/medsos/:id/edit" element={
                <ProtectedRoute requiredPermissions={['update']}>
                  <Layout>
                    <AdminMedsosEdit />
                  </Layout>
                </ProtectedRoute>
              } />
              
              {/* Admin SDM Routes */}
              {/* Backward compatibility: redirect old path to new */}
              <Route path="/admin/sdm/struktur" element={<Navigate to="/admin/sdm/struktur-jobdesk" replace />} />
              <Route path="/admin/sdm/struktur-jobdesk-sop" element={<Navigate to="/admin/sdm/struktur-jobdesk" replace />} />
              {/* Legacy path redirect: jabatan -> struktur-jobdesk */}
              <Route path="/admin/sdm/jabatan" element={<Navigate to="/admin/sdm/struktur-jobdesk" replace />} />

              {/* Backward compatibility: old standalone path to new SDM path */}
              <Route path="/admin/struktur-jobdesk" element={<Navigate to="/admin/sdm/struktur-jobdesk" replace />} />

              <Route path="/admin/sdm/struktur-jobdesk" element={
                <ProtectedRoute requiredPermissions={['read']}>
                  <RequireMenuKey requiredKey={["AdminSdmStrukturJobdesk", "AdminSdmStrukturSop"]}>
                    <Layout>
                      <StrukturJobdeskSOP />
                    </Layout>
                  </RequireMenuKey>
                </ProtectedRoute>
              } />

              <Route path="/admin/sdm/tim" element={
                <ProtectedRoute requiredPermissions={['read']}>
                  <RequireMenuKey requiredKey="AdminSdmDataTim">
                    <Layout>
                      <AdminDataTim />
                    </Layout>
                  </RequireMenuKey>
                </ProtectedRoute>
              } />
              <Route path="/admin/sdm/tim/new" element={
                <ProtectedRoute requiredPermissions={['create']}>
                  <Layout>
                    <AdminDataTimForm />
                  </Layout>
                </ProtectedRoute>
              } />
              <Route path="/admin/sdm/tim/:id" element={
                <ProtectedRoute requiredPermissions={['read']}>
                  <Layout>
                    <AdminDataTimDetail />
                  </Layout>
                </ProtectedRoute>
              } />
              
              <Route path="/admin/sdm/tim-merah-biru" element={
                <ProtectedRoute requiredPermissions={['read']}>
                  <RequireMenuKey requiredKey="AdminTimMerahBiru">
                    <Layout>
                      <AdminTimMerahBiru />
                    </Layout>
                  </RequireMenuKey>
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
              
              <Route path="/admin/sdm/tim/:type/form" element={
                <ProtectedRoute requiredPermissions={['create']}>
                  <Layout>
                    <AdminTimMerahBiruForm />
                  </Layout>
                </ProtectedRoute>
              } />
              
              <Route path="/admin/sdm/tim/:type/edit/:id" element={
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
              
              <Route path="/admin/sdm/tim/biru/:id" element={
                <ProtectedRoute requiredPermissions={['read']}>
                  <Layout>
                    <AdminTimMerahBiruDetail />
                  </Layout>
                </ProtectedRoute>
              } />
              
              {/* Admin KPI Routes */}
              {/* Redirect lama ke path baru */}
              <Route path="/admin/sdm/kpi" element={<Navigate to="/admin/sdm/raport-kerja" replace />} />
              {/* Path baru: Raport Kerja */}
              <Route path="/admin/sdm/raport-kerja" element={
                <ProtectedRoute requiredPermissions={['read']}>
                  <RequireMenuKey requiredKey="AdminSdmKpi">
                    <Layout>
                      <AdminKPI />
                    </Layout>
                  </RequireMenuKey>
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
                  <RequireMenuKey requiredKey="AdminDataAset">
                    <Layout>
                      <AdminDataAset />
                    </Layout>
                  </RequireMenuKey>
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
                   <RequireMenuKey requiredKey="AdminDataAset">
                     <Layout>
                       <AdminDataAset />
                     </Layout>
                   </RequireMenuKey>
                 </ProtectedRoute>
               } />
               <Route path="/admin/lain-lain/aset" element={
                <ProtectedRoute requiredPermissions={['read']}>
                  <RequireMenuKey requiredKey="AdminDataAset">
                    <Layout>
                      <AdminDataAset />
                    </Layout>
                  </RequireMenuKey>
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
                   <RequireMenuKey requiredKey="AdminDataInvestor">
                     <Layout>
                       <AdminDataInvestor />
                     </Layout>
                   </RequireMenuKey>
                 </ProtectedRoute>
               } />
               <Route path="/admin/lain-lain/investor" element={
                <ProtectedRoute requiredPermissions={['read']}>
                  <RequireMenuKey requiredKey="AdminDataInvestor">
                    <Layout>
                      <AdminDataInvestor />
                    </Layout>
                  </RequireMenuKey>
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
                    <OwnerDaftarKomplain />
                  </Layout>
                </ProtectedRoute>
              } />
              
              <Route path="/owner/operasional/komplain/new" element={
                <ProtectedRoute requiredPermissions={['create']}>
                  <Layout>
                    <OwnerDaftarKomplainForm />
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
                    <OwnerAnekaSuratList />
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
                    <OwnerTargetHarianList />
                  </Layout>
                </ProtectedRoute>
              } />

              {/* Owner SDM Routes */}
              {/* Backward compatibility: redirect old path to new */}
              <Route path="/owner/sdm/struktur" element={<Navigate to="/owner/sdm/struktur-jobdesk" replace />} />
              <Route path="/owner/sdm/struktur-jobdesk-sop" element={<Navigate to="/owner/sdm/struktur-jobdesk" replace />} />

              <Route path="/owner/sdm/struktur-jobdesk" element={
                <ProtectedRoute requiredPermissions={['read']}>
                  <Layout>
                    <StrukturJobdeskSOP />
                  </Layout>
                </ProtectedRoute>
              } />

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
              
              <Route path="/owner/sdm/tim/:type/form" element={
                <ProtectedRoute requiredPermissions={['create']}>
                  <Layout>
                    <OwnerTimMerahBiruForm />
                  </Layout>
                </ProtectedRoute>
              } />
              
              <Route path="/owner/sdm/tim/:type/edit/:id" element={
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
                  <RequireMenuKey requiredKey="AdminKeuanganPoskas">
                    <Layout>
                      <AdminPoskasList />
                    </Layout>
                  </RequireMenuKey>
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

              {/* Admin Daftar Gaji Routes */}
              <Route path="/admin/keuangan/gaji" element={
                <ProtectedRoute requiredPermissions={['read']}>
                  <RequireMenuKey requiredKey="AdminDaftarGaji">
                    <Layout>
                      <AdminDaftarGaji />
                    </Layout>
                  </RequireMenuKey>
                </ProtectedRoute>
              } />
              
              <Route path="/admin/keuangan/gaji/new" element={
                <ProtectedRoute requiredPermissions={['create']}>
                  <Layout>
                    <AdminDaftarGajiForm />
                  </Layout>
                </ProtectedRoute>
              } />
              
              <Route path="/admin/keuangan/gaji/:id" element={
                <ProtectedRoute requiredPermissions={['read']}>
                  <Layout>
                    <AdminDaftarGajiDetail />
                  </Layout>
                </ProtectedRoute>
              } />
              
              <Route path="/admin/keuangan/gaji/:id/edit" element={
                <ProtectedRoute requiredPermissions={['update']}>
                  <Layout>
                    <AdminDaftarGajiEdit />
                  </Layout>
                </ProtectedRoute>
              } />

              {/* Admin Omset Harian Routes */}
              <Route path="/admin/keuangan/omset-harian" element={
                <ProtectedRoute requiredPermissions={['read']}>
                  <RequireMenuKey requiredKey="AdminKeuanganOmsetHarian">
                    <Layout>
                      <AdminOmsetHarianList />
                    </Layout>
                  </RequireMenuKey>
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
                  <RequireMenuKey requiredKey="AdminAnekaGrafik">
                    <Layout>
                      <AdminAnekaGrafikList />
                    </Layout>
                  </RequireMenuKey>
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
                  <RequireMenuKey requiredKey="AdminDataTraining">
                    <Layout>
                      <AdminTrainingList />
                    </Layout>
                  </RequireMenuKey>
                </ProtectedRoute>
              } />
              {/* SDM alias */}
              <Route path="/admin/sdm/training" element={
                <ProtectedRoute requiredPermissions={['read']}>
                  <RequireMenuKey requiredKey="AdminDataTraining">
                    <Layout>
                      <AdminTrainingList />
                    </Layout>
                  </RequireMenuKey>
                </ProtectedRoute>
              } />
              
              <Route path="/admin/training/new" element={
                <ProtectedRoute requiredPermissions={['create']}>
                  <Layout>
                    <AdminTrainingForm />
                  </Layout>
                </ProtectedRoute>
              } />
              <Route path="/admin/sdm/training/new" element={
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
              <Route path="/admin/sdm/training/:id/edit" element={
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
          <Toaster 
            position="top-right"
            containerClassName="app-toaster-container"
            toastOptions={{
              duration: 4000,
              className: 'app-toast',
              style: {
                background: '#363636',
                color: '#fff',
              },
              success: {
                duration: 3000,
                className: 'app-toast-success',
                iconTheme: {
                  primary: '#10B981',
                  secondary: '#fff',
                },
                closeButton: false,
              },
              error: {
                duration: 5000,
                iconTheme: {
                  primary: '#EF4444',
                  secondary: '#fff',
                },
                // Jangan tampilkan close button kanan; ikon kiri menjadi tombol tutup
                closeButton: false,
                icon: (
                  <button
                    onClick={() => toast.dismiss()}
                    aria-label="Tutup notifikasi"
                    title="Tutup"
                    className="leading-none"
                    style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}
                  >
                    <svg width="20" height="20" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                      <circle cx="10" cy="10" r="10" fill="#EF4444" />
                      <path d="M6.5 6.5L13.5 13.5M13.5 6.5L6.5 13.5" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" />
                    </svg>
                  </button>
                ),
              }
            }}
          />

          {/* Modal routes. Only render when backgroundLocation exists */}
          {backgroundLocation && (
            <Routes>
              <Route path="/admin/operasional/data-supplier/form" element={
                <ProtectedRoute requiredPermissions={['create']}>
                  <AdminDataSupplierForm />
                </ProtectedRoute>
              } />
            </Routes>
          )}

        </MenuProvider>
      </AuthProvider>
    </ErrorBoundary>
  )
}

// Main App Component that sets up the Router and renders modal-aware routes
const App = () => {
  return (
    <BrowserRouter
      future={{
        v7_startTransition: true,
        v7_relativeSplatPath: true,
      }}
    >
      <ModalSwitch />
    </BrowserRouter>
  )
}

export default App