import React from 'react'
import { Navigate } from 'react-router-dom'
import { useAuthContext } from '../context/AuthContext'

export function RoleBasedRoute({ children, allowedRoles = [] }) {
  const { user } = useAuthContext()
  if (!user) return <Navigate to="/login" replace />
  if (allowedRoles.length > 0 && !allowedRoles.includes(user.userRole)) {
    // unauthorized
    return <Navigate to="/" replace />
  }
  return children
}
