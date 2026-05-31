import React from 'react'
import { Navigate } from 'react-router-dom'
import { useAuthContext } from '../context/AuthContext'

export function ProtectedRoute({ children }) {
  const { token } = useAuthContext()
  if (!token) return <Navigate to="/login" replace />
  return children
}
