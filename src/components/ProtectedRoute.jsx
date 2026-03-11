import React from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { PageSpinner } from './ui/Spinner'

export default function ProtectedRoute({ children }) {
  const { user, loading, profile, profileLoading } = useAuth()

  if (loading) return <PageSpinner />

  if (!user) return <Navigate to="/login" replace />

  if (!profileLoading && !profile) return <Navigate to="/create-profile" replace />

  return children
}
