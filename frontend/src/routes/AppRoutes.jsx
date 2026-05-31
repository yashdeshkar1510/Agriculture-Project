import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Landing from '../pages/Landing'
import Login from '../components/Login'
import Signup from '../pages/auth/Signup'
import AdminPanel from '../components/AdminPanel'
import BankDashboard from '../components/BankDashboard'
import AnalyticsDashboard from '../components/AnalyticsDashboard'
import LoanRecommendation from '../components/LoanRecommendation'
import { ProtectedRoute } from '../components/ProtectedRoute'
import { RoleBasedRoute } from '../components/RoleBasedRoute'
import FarmerDashboard from '../pages/FarmerDashboard'
import WeatherPage from '../pages/WeatherPage'
import CreditScorePage from '../pages/CreditScorePage'
import { AuthProvider } from '../context/AuthContext'

export default function AppRoutes() {
  return (
    <BrowserRouter>
      <AuthProvider>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        <Route path="/farmer-dashboard" element={<ProtectedRoute><RoleBasedRoute allowedRoles={["farmer"]}><FarmerDashboard /></RoleBasedRoute></ProtectedRoute>} />
        <Route path="/bank-dashboard" element={<ProtectedRoute><RoleBasedRoute allowedRoles={["bank"]}><BankDashboard /></RoleBasedRoute></ProtectedRoute>} />
        <Route path="/admin-dashboard" element={<ProtectedRoute><RoleBasedRoute allowedRoles={["admin"]}><AdminPanel /></RoleBasedRoute></ProtectedRoute>} />

        <Route path="/farm-data" element={<ProtectedRoute><RoleBasedRoute allowedRoles={["farmer"]}><FarmerDashboard /></RoleBasedRoute></ProtectedRoute>} />
        <Route path="/weather" element={<ProtectedRoute><WeatherPage /></ProtectedRoute>} />
        <Route path="/credit-score" element={<ProtectedRoute><CreditScorePage /></ProtectedRoute>} />
        <Route path="/loan-recommendation" element={<ProtectedRoute><LoanRecommendation /></ProtectedRoute>} />
        <Route path="/analytics" element={<ProtectedRoute><RoleBasedRoute allowedRoles={["bank","admin"]}><AnalyticsDashboard /></RoleBasedRoute></ProtectedRoute>} />

        <Route path="/profile" element={<ProtectedRoute><div className='p-6 text-white'>Profile page (coming)</div></ProtectedRoute>} />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}
