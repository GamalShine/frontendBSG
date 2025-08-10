import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import { useAuth } from './contexts/AuthContext'
import Layout from './components/Layout/Layout'
import ErrorBoundary from './components/ErrorBoundary'
import Login from './pages/Login'
import TestPage from './pages/TestPage'
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
import ChatList from './pages/Chat/ChatList'
import ChatRoom from './pages/Chat/ChatRoom'
import ChatRoomForm from './pages/Chat/ChatRoomForm'
import UserList from './pages/Users/UserList'
import UserForm from './pages/Users/UserForm'
import Profile from './pages/Profile'
import NotFound from './pages/NotFound'

const PrivateRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth()
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    )
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }
  
  return children
}

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/test" element={<TestPage />} />
      <Route path="/login" element={<Login />} />
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route
        path="/dashboard"
        element={
          <PrivateRoute>
            <Layout />
          </PrivateRoute>
        }
      >
        <Route index element={<Dashboard />} />
        <Route path="komplain">
          <Route index element={<KomplainList />} />
          <Route path="new" element={<KomplainForm />} />
          <Route path=":id" element={<KomplainDetail />} />
          <Route path=":id/edit" element={<KomplainForm />} />
        </Route>
        <Route path="tugas">
          <Route index element={<TugasList />} />
          <Route path="new" element={<TugasForm />} />
          <Route path=":id" element={<TugasDetail />} />
          <Route path=":id/edit" element={<TugasForm />} />
        </Route>
        <Route path="poskas">
          <Route index element={<PoskasList />} />
          <Route path="new" element={<PoskasForm />} />
          <Route path=":id" element={<PoskasDetail />} />
          <Route path=":id/edit" element={<PoskasForm />} />
        </Route>
        <Route path="chat">
          <Route index element={<ChatList />} />
          <Route path="new" element={<ChatRoomForm />} />
          <Route path=":roomId" element={<ChatRoom />} />
        </Route>
        <Route path="users">
          <Route index element={<UserList />} />
          <Route path="new" element={<UserForm />} />
          <Route path=":id/edit" element={<UserForm />} />
        </Route>
        <Route path="profile" element={<Profile />} />
      </Route>
      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}

function App() {
  return (
    <AuthProvider>
      <ErrorBoundary>
        <AppRoutes />
      </ErrorBoundary>
    </AuthProvider>
  )
}

export default App
