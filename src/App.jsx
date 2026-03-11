import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import AuthProvider, { useAuth } from './contexts/AuthContext'
import FriendsProvider from './contexts/FriendsContext'
import NotificationsProvider from './contexts/NotificationsContext'
import ProtectedRoute from './components/ProtectedRoute'
import AppLayout from './components/layout/AppLayout'
import AuthLayout from './components/layout/AuthLayout'
import LoginPage from './pages/LoginPage'
import SignupPage from './pages/SignupPage'
import CreateProfilePage from './pages/CreateProfilePage'
import FeedPage from './pages/FeedPage'
import ProfilePage from './pages/ProfilePage'
import SettingsPage from './pages/SettingsPage'
import FriendsPage from './pages/FriendsPage'
import NotificationsPage from './pages/NotificationsPage'
import { PageSpinner } from './components/ui/Spinner'

function AppRoutes() {
  const { user, loading, profile, profileLoading } = useAuth()

  if (loading) return <PageSpinner />

  return (
    <Routes>
      {/* Auth Routes */}
      <Route element={<AuthLayout />}>
        <Route path="/login" element={!user ? <LoginPage /> : <Navigate to="/feed" replace />} />
        <Route path="/signup" element={!user ? <SignupPage /> : <Navigate to="/feed" replace />} />
      </Route>

      {/* Profile Creation (no sidebar layout) */}
      <Route
        path="/create-profile"
        element={user ? <CreateProfilePage /> : <Navigate to="/login" replace />}
      />

      {/* App Routes (with sidebar) */}
      <Route
        element={
          <ProtectedRoute>
            <FriendsProvider>
              <NotificationsProvider>
                <AppLayout />
              </NotificationsProvider>
            </FriendsProvider>
          </ProtectedRoute>
        }
      >
        <Route path="/feed" element={<FeedPage />} />
        <Route path="/profile/:id" element={<ProfilePage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/friends" element={<FriendsPage />} />
        <Route path="/notifications" element={<NotificationsPage />} />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to={user ? '/feed' : '/login'} replace />} />
    </Routes>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  )
}
